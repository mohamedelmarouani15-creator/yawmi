-- Migration 023 — Table de rate limiting API
-- Stocke les appels par utilisateur et endpoint pour limiter la fréquence.
-- TTL géré côté applicatif (fenêtre glissante 1h) — purge optionnelle via cron.

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id          bigserial PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index pour les requêtes de comptage par (user_id, endpoint, created_at)
CREATE INDEX IF NOT EXISTS api_rate_limits_lookup_idx
  ON api_rate_limits (user_id, endpoint, created_at DESC);

-- RLS : les utilisateurs ne voient que leurs propres entrées
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limits_own_read" ON api_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Les insertions se font uniquement via service_role (routes API server-side)
-- Pas de politique INSERT pour les utilisateurs anon/authentifiés

-- Purge automatique des entrées de plus de 24h (optionnel — nécessite pg_cron)
-- SELECT cron.schedule('purge_rate_limits', '0 * * * *',
--   $$DELETE FROM api_rate_limits WHERE created_at < now() - interval '24 hours'$$);
