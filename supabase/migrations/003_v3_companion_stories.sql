-- ═══════════════════════════════════════════════════════════════
-- Yawmi V3 — Compagnon IA + Grande Histoire
-- ═══════════════════════════════════════════════════════════════

-- ── Mémoire apprenant ─────────────────────────────────────────
create table if not exists companion_memory (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  arabic_level       text not null default 'beginner'
                       check (arabic_level in ('none','beginner','intermediate','advanced')),
  learning_style     text,
  strong_categories  text[]      not null default array[]::text[],
  weak_categories    text[]      not null default array[]::text[],
  tone_preference    text        not null default 'warm'
                       check (tone_preference in ('formal','warm','playful')),
  last_session_at    timestamptz,
  daily_requests     int         not null default 0,
  daily_reset_date   date        not null default current_date,
  notes              text,
  updated_at         timestamptz not null default now()
);

-- ── Historique de conversation (fenêtre glissante 20 msgs) ────
create table if not exists companion_messages (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  role        text        not null check (role in ('user','assistant')),
  content     text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists companion_messages_user_created
  on companion_messages (user_id, created_at desc);

-- Trigger : garde seulement les 20 derniers messages par user
create or replace function trim_companion_messages()
returns trigger language plpgsql as $$
begin
  delete from companion_messages
  where id in (
    select id from companion_messages
    where user_id = new.user_id
    order by created_at desc
    offset 20
  );
  return new;
end;
$$;

create trigger after_companion_message_insert
  after insert on companion_messages
  for each row execute procedure trim_companion_messages();

-- ── Message contextuel du jour (1 max/jour/user) ──────────────
create table if not exists companion_daily_message (
  user_id      uuid  primary key references auth.users(id) on delete cascade,
  message      text  not null,
  trigger_key  text,
  shown        boolean     not null default false,
  message_date date        not null default current_date,
  created_at   timestamptz not null default now()
);

-- ── Arcs narratifs ────────────────────────────────────────────
create table if not exists stories (
  id              text        primary key,
  title           text        not null,
  title_ar        text,
  arc_type        text        not null default 'prophets'
                    check (arc_type in ('prophets','companions','history','scholars')),
  total_chapters  int         not null,
  status          text        not null default 'draft'
                    check (status in ('draft','validated','published')),
  validated_by    text,
  order_index     int         not null default 0,
  created_at      timestamptz not null default now()
);

-- ── Chapitres ─────────────────────────────────────────────────
create table if not exists story_chapters (
  id              uuid  primary key default gen_random_uuid(),
  story_id        text  not null references stories(id) on delete cascade,
  chapter_number  int   not null,
  title           text  not null,
  narrative       text  not null,
  vocabulary      jsonb not null default '[]',
  questions       jsonb not null default '[]',
  values_shown    text[]        default array[]::text[],
  rewards         jsonb         default '{}',
  unique (story_id, chapter_number)
);

-- ── Progression histoires ─────────────────────────────────────
create table if not exists story_progress (
  user_id             uuid  not null references auth.users(id) on delete cascade,
  story_id            text  not null references stories(id) on delete cascade,
  current_chapter     int   not null default 1,
  completed_chapters  int[] not null default array[]::int[],
  started_at          timestamptz not null default now(),
  last_read_at        timestamptz,
  primary key (user_id, story_id)
);

-- ── Auto-création companion_memory à l'inscription ────────────
create or replace function handle_new_user_companion()
returns trigger language plpgsql security definer as $$
begin
  insert into companion_memory (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_companion
  after insert on auth.users
  for each row execute procedure handle_new_user_companion();

-- ── RLS ───────────────────────────────────────────────────────
alter table companion_memory        enable row level security;
alter table companion_messages      enable row level security;
alter table companion_daily_message enable row level security;
alter table stories                 enable row level security;
alter table story_chapters          enable row level security;
alter table story_progress          enable row level security;

-- Companion memory : own record only
create policy "companion_memory_own" on companion_memory
  for all using (auth.uid() = user_id);

-- Messages : own records only
create policy "companion_messages_own" on companion_messages
  for all using (auth.uid() = user_id);

-- Daily message : own record only
create policy "companion_daily_own" on companion_daily_message
  for all using (auth.uid() = user_id);

-- Stories : lecture publique (authenticated), écriture service role
create policy "stories_read" on stories
  for select to authenticated using (status = 'published');

-- Chapters : lecture publique
create policy "chapters_read" on story_chapters
  for select to authenticated
  using (
    story_id in (select id from stories where status = 'published')
  );

-- Progress : own records only
create policy "story_progress_own" on story_progress
  for all using (auth.uid() = user_id);
