-- ═══════════════════════════════════════════════════════════════
-- Migration 009 — Colonnes prayer settings dans profiles
-- Permet la synchronisation multi-appareil des réglages utilisateur
-- age_group/arabic_level/app_mode/mother_tongue/main_objective
-- existent déjà (migration 005) — on ajoute seulement les colonnes manquantes.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS city          text,
  ADD COLUMN IF NOT EXISTS lat           double precision,
  ADD COLUMN IF NOT EXISTS lng           double precision,
  ADD COLUMN IF NOT EXISTS prayer_method text DEFAULT 'UOIF',
  ADD COLUMN IF NOT EXISTS madhab        text DEFAULT 'Shafi';
