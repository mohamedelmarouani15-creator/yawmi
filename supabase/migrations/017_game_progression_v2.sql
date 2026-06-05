-- Migration 017 — Game progression v2
-- Adds new game state columns to player_progress for Phase 1-7 features

ALTER TABLE player_progress
  ADD COLUMN IF NOT EXISTS location_stages   JSONB    NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category_mastery  JSONB    NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS completed_arcs    TEXT[]   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prestige_level    INTEGER  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manuscripts       JSONB    NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weekly_challenge  JSONB             DEFAULT NULL;

-- Index for leaderboard query (already ordered by xp but index helps)
CREATE INDEX IF NOT EXISTS idx_player_progress_xp ON player_progress(xp DESC);
