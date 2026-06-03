-- ═══════════════════════════════════════════════════════════════
-- Migration 012 — CREATE TABLE tasks + push_subscriptions
-- Ces deux tables étaient utilisées dans le code sans migration
-- versionnée. Ce fichier les documente et les crée si absentes.
-- ═══════════════════════════════════════════════════════════════

-- ── tasks — tâches partagées en famille ──────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  text        NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  text       text        NOT NULL,
  member     text        NOT NULL,
  done       boolean     NOT NULL DEFAULT false,
  created_by uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks: lecture famille"
  ON tasks FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles
      WHERE id = auth.uid() AND family_id IS NOT NULL
    )
  );

CREATE POLICY "tasks: création membre famille"
  ON tasks FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles
      WHERE id = auth.uid() AND family_id IS NOT NULL
    )
  );

CREATE POLICY "tasks: modification membre famille"
  ON tasks FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM profiles
      WHERE id = auth.uid() AND family_id IS NOT NULL
    )
  );

CREATE POLICY "tasks: suppression créateur"
  ON tasks FOR DELETE
  USING (auth.uid() = created_by);

-- ── push_subscriptions — abonnements notifications push ──────
-- La table stocke la subscription Web Push complète (VAPID).
-- Les colonnes lat/lng/prayer_method/madhab/last_notif_key
-- ont été ajoutées par la migration 008.

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  sub            jsonb       NOT NULL,  -- objet subscription complet (endpoint + keys)
  lat            double precision,
  lng            double precision,
  prayer_method  text        DEFAULT 'UOIF',
  madhab         text        DEFAULT 'Shafi',
  last_notif_key text,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions: propre"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS tasks_family_idx
  ON tasks(family_id);
