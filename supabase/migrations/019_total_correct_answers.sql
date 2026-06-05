-- Migration 019 — Ajoute total_correct_answers à player_progress
-- Colonne référencée dans database.types.ts et game-storage.ts mais absente des migrations précédentes

ALTER TABLE player_progress
  ADD COLUMN IF NOT EXISTS total_correct_answers INTEGER NOT NULL DEFAULT 0;
