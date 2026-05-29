-- ═══════════════════════════════════════════════════════════════
-- Yawmi V2 — Game Tables Migration
-- ═══════════════════════════════════════════════════════════════

-- ── Questions (centralized, replaces hardcoded questions.ts) ──
create table if not exists questions (
  id           text primary key,
  category     text not null check (category in ('religion','history','arabic','darija','quran')),
  type         text not null default 'mcq' check (type in ('mcq','true_false','fill_in','reorder')),
  difficulty   int  not null check (difficulty between 1 and 5),
  question     text not null,
  options      jsonb not null default '[]',
  explanation  text,
  cultural_capsule jsonb,  -- {title, text}
  location_id  text,       -- linked to a game location
  event_id     text,       -- ramadan | aid | lailat_qadr | joumaa
  is_active    boolean not null default true
);

-- ── Player Progress (replaces localStorage) ──────────────────
create table if not exists player_progress (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  xp                   int     not null default 0,
  level                int     not null default 1,
  coins                int     not null default 10,
  current_location     text    not null default 'medine',
  game_streak          int     not null default 0,
  last_game_date       date,
  unlocked_locations   text[]  not null default array['medine'],
  defeated_sages       text[]  not null default array[]::text[],
  category_levels      jsonb   not null default '{"religion":1,"history":1,"arabic":1,"darija":1,"quran":1}',
  powerup_counts       jsonb   not null default '{"joker50":3,"bouclier":1,"double_xp":2,"time_freeze":1}',
  updated_at           timestamptz not null default now()
);

-- ── Question History — SM-2 per user ─────────────────────────
create table if not exists question_history (
  user_id          uuid  not null references auth.users(id) on delete cascade,
  question_id      text  not null,
  times_seen       int   not null default 0,
  times_correct    int   not null default 0,
  easiness_factor  float not null default 2.5,
  interval_days    int   not null default 1,
  next_due         date  not null default current_date,
  primary key (user_id, question_id)
);

-- ── Rewards inventory ─────────────────────────────────────────
create table if not exists rewards (
  user_id             uuid    primary key references auth.users(id) on delete cascade,
  chests_available    int     not null default 0,
  mosque_objects      text[]  not null default array[]::text[],
  unlocked_reciters   text[]  not null default array[]::text[],
  unlocked_avatars    text[]  not null default array['default'],
  titles              text[]  not null default array['Voyageur'],
  sage_cards          text[]  not null default array[]::text[]
);

-- ── Achievements ──────────────────────────────────────────────
create table if not exists achievements (
  user_id        uuid        not null references auth.users(id) on delete cascade,
  achievement_id text        not null,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ── Async Duels (24h) ─────────────────────────────────────────
create table if not exists duels (
  id                 uuid        primary key default gen_random_uuid(),
  challenger_id      uuid        not null references auth.users(id),
  challenged_id      uuid        not null references auth.users(id),
  family_id          text        references families(id),
  question_ids       text[]      not null,
  challenger_score   int,
  challenged_score   int,
  challenger_answers jsonb,
  challenged_answers jsonb,
  status             text        not null default 'pending'
                                 check (status in ('pending','completed','expired')),
  winner_id          uuid        references auth.users(id),
  created_at         timestamptz not null default now(),
  expires_at         timestamptz not null default (now() + interval '24 hours')
);

-- ── Daily Family Challenge ────────────────────────────────────
create table if not exists daily_challenges (
  id          uuid   primary key default gen_random_uuid(),
  family_id   text   not null references families(id),
  date        date   not null,
  question_id text   not null,
  responses   jsonb  not null default '{}',  -- {user_id: {answer_idx, correct, answered_at}}
  unique (family_id, date)
);

-- ── Escape Rooms (V2.3) ───────────────────────────────────────
create table if not exists escape_rooms (
  id          uuid    primary key default gen_random_uuid(),
  theme       text    not null,  -- medersa | riad | bibliotheque | hammam | observatoire
  week_number int     not null,
  riddles     jsonb[] not null default array[]::jsonb[],  -- 4 riddles [{type,content,answer,hint}]
  is_active   boolean not null default false
);

create table if not exists escape_progress (
  family_id       text  not null references families(id),
  escape_room_id  uuid  not null references escape_rooms(id),
  solved_locks    int[] not null default array[]::int[],
  shared_hints    jsonb not null default '{}',
  completed_at    timestamptz,
  primary key (family_id, escape_room_id)
);

-- ── Row Level Security ────────────────────────────────────────
alter table questions        enable row level security;
alter table player_progress  enable row level security;
alter table question_history enable row level security;
alter table rewards          enable row level security;
alter table achievements     enable row level security;
alter table duels            enable row level security;
alter table daily_challenges enable row level security;
alter table escape_rooms     enable row level security;
alter table escape_progress  enable row level security;

-- Questions: readable by all authenticated users
create policy "questions_read" on questions
  for select to authenticated using (is_active = true);

-- Player progress: own record only
create policy "player_progress_own" on player_progress
  for all using (auth.uid() = user_id);

-- Question history: own records only
create policy "question_history_own" on question_history
  for all using (auth.uid() = user_id);

-- Rewards: own record
create policy "rewards_own" on rewards
  for all using (auth.uid() = user_id);

-- Achievements: own records
create policy "achievements_own" on achievements
  for all using (auth.uid() = user_id);

-- Duels: parties involved
create policy "duels_parties" on duels
  for all using (auth.uid() = challenger_id or auth.uid() = challenged_id);

-- Daily challenges: family members
create policy "daily_challenges_family" on daily_challenges
  for all using (
    family_id in (
      select family_id from profiles where id = auth.uid() and family_id is not null
    )
  );

-- Escape rooms: readable by all authenticated
create policy "escape_rooms_read" on escape_rooms
  for select to authenticated using (is_active = true);

-- Escape progress: family members
create policy "escape_progress_family" on escape_progress
  for all using (
    family_id in (
      select family_id from profiles where id = auth.uid() and family_id is not null
    )
  );

-- ── Helper: auto-create player_progress on signup ─────────────
create or replace function handle_new_user_game()
returns trigger language plpgsql security definer as $$
begin
  insert into player_progress (user_id) values (new.id) on conflict do nothing;
  insert into rewards (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_game
  after insert on auth.users
  for each row execute procedure handle_new_user_game();
