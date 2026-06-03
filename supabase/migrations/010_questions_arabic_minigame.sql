-- ═══════════════════════════════════════════════════════════════
-- Migration 010 — Colonnes manquantes sur la table questions
-- Requis pour stocker les données des mini-jeux et le niveau arabe.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS arabic_required text DEFAULT 'none'
    CHECK (arabic_required IN ('none','beginner','intermediate','advanced')),
  ADD COLUMN IF NOT EXISTS minigame_data   jsonb,
  ADD COLUMN IF NOT EXISTS transliteration text;

-- Index pour filtrer rapidement par niveau arabe au démarrage du quiz
CREATE INDEX IF NOT EXISTS questions_arabic_required_idx
  ON questions(arabic_required)
  WHERE is_active = true;
