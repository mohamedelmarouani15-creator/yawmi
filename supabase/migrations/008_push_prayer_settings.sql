-- ═══════════════════════════════════════════════════════════════
-- Migration 008 — Prayer settings dans push_subscriptions
-- Requis par le Vercel Cron /api/cron/adhan pour calculer
-- les horaires côté serveur et envoyer les push VAPID.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS lat            double precision,
  ADD COLUMN IF NOT EXISTS lng            double precision,
  ADD COLUMN IF NOT EXISTS prayer_method  text DEFAULT 'UOIF',
  ADD COLUMN IF NOT EXISTS madhab         text DEFAULT 'Shafi',
  ADD COLUMN IF NOT EXISTS last_notif_key text;
