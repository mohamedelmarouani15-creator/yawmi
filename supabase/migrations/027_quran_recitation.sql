-- Migration 027 — Progression récitation coranique avec SM-2

CREATE TABLE IF NOT EXISTS quran_recitation (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah           integer     NOT NULL CHECK (surah BETWEEN 1 AND 114),
  ayah            integer     NOT NULL CHECK (ayah >= 1),
  -- SM-2 spaced repetition
  times_seen      integer     NOT NULL DEFAULT 0,
  times_correct   integer     NOT NULL DEFAULT 0,
  easiness_factor numeric(4,2) NOT NULL DEFAULT 2.5,
  interval_days   integer     NOT NULL DEFAULT 1,
  next_due        date        NOT NULL DEFAULT CURRENT_DATE,
  -- Score history
  best_score      integer     NOT NULL DEFAULT 0 CHECK (best_score BETWEEN 0 AND 100),
  last_score      integer     NOT NULL DEFAULT 0 CHECK (last_score BETWEEN 0 AND 100),
  mastered        boolean     NOT NULL DEFAULT false,
  -- Tajwid weaknesses (accumulated from failed attempts)
  tajwid_weak     TEXT[]      NOT NULL DEFAULT '{}',
  -- Timestamps
  first_seen_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, surah, ayah)
);

ALTER TABLE quran_recitation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own recitation data" ON quran_recitation
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quran_recitation_user
  ON quran_recitation(user_id);

-- Partial index for SM-2 review queue (non-mastered only)
CREATE INDEX IF NOT EXISTS idx_quran_recitation_due
  ON quran_recitation(user_id, next_due)
  WHERE mastered = false;
