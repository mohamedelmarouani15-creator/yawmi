-- ═══════════════════════════════════════════════════════════════
-- Yawmi V2 — Live features & weekly challenges
-- ═══════════════════════════════════════════════════════════════

-- ── Live Duels (Supabase Realtime) ───────────────────────────
create table if not exists duels_live (
  id               uuid        primary key default gen_random_uuid(),
  family_id        text        references families(id),
  player1_id       uuid        not null references auth.users(id),
  player2_id       uuid        references auth.users(id),
  question_ids     text[]      not null default array[]::text[],
  player1_answers  jsonb       not null default '[]',
  player2_answers  jsonb       not null default '[]',
  player1_score    int         not null default 0,
  player2_score    int         not null default 0,
  player1_ready    boolean     not null default false,
  player2_ready    boolean     not null default false,
  current_question int         not null default 0,
  status           text        not null default 'waiting'
                               check (status in ('waiting','ready','playing','finished')),
  winner_id        uuid        references auth.users(id),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default (now() + interval '10 minutes')
);

-- ── Weekly Family Challenge ───────────────────────────────────
create table if not exists weekly_challenges (
  id          uuid   primary key default gen_random_uuid(),
  family_id   text   not null references families(id),
  week_start  date   not null,
  question_id text   not null,
  answers     jsonb  not null default '{}',
  unique (family_id, week_start)
);

-- ── Extend question types for V2 mini-games ──────────────────
-- Update check constraint to allow new types
alter table questions
  drop constraint if exists questions_type_check;

alter table questions
  add constraint questions_type_check
  check (type in ('mcq','true_false','fill_in','reorder','drag_drop','memory','fill_verse','who_am_i','calligraphy'));

-- ── RLS ──────────────────────────────────────────────────────
alter table duels_live      enable row level security;
alter table weekly_challenges enable row level security;

create policy "duels_live_parties" on duels_live
  for all using (auth.uid() = player1_id or auth.uid() = player2_id);

create policy "weekly_challenges_family" on weekly_challenges
  for all using (
    family_id in (
      select family_id from profiles where id = auth.uid() and family_id is not null
    )
  );

-- ── Realtime: enable broadcast on duels_live ─────────────────
alter publication supabase_realtime add table duels_live;
