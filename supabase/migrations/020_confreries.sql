-- Migration 020: Confréries + Liga hebdomadaire
-- 2026-06-05

-- ── Confréries ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS confreries (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  code       text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS confrerie_members (
  confrerie_id uuid REFERENCES confreries(id) ON DELETE CASCADE,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (confrerie_id, user_id)
);

ALTER TABLE confreries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE confrerie_members ENABLE ROW LEVEL SECURITY;

-- RLS confreries : voir uniquement les confréries dont on est membre
DO $$ BEGIN
  CREATE POLICY "confreries_member_read" ON confreries FOR SELECT
    USING (id IN (SELECT confrerie_id FROM confrerie_members WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "confreries_insert" ON confreries FOR INSERT
    WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS confrerie_members
DO $$ BEGIN
  CREATE POLICY "confrerie_members_read" ON confrerie_members FOR SELECT
    USING (
      confrerie_id IN (
        SELECT confrerie_id FROM confrerie_members WHERE user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "confrerie_members_insert" ON confrerie_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Liga hebdomadaire ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS liga_seasons (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  week_end   date NOT NULL
);

CREATE TABLE IF NOT EXISTS liga_placements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id      uuid REFERENCES liga_seasons(id),
  league         text NOT NULL DEFAULT 'bronze'
                   CHECK (league IN ('bronze','silver','gold','diamond')),
  xp_this_week   integer NOT NULL DEFAULT 0,
  rank_in_league integer,
  promoted       boolean DEFAULT false,
  relegated      boolean DEFAULT false,
  UNIQUE (user_id, season_id)
);

ALTER TABLE liga_placements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "liga_read" ON liga_placements
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "liga_own_write" ON liga_placements
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
