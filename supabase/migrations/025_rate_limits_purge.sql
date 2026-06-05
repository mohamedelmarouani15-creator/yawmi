-- Migration 025 — Purge automatique des entrées api_rate_limits > 24h
-- Utilise un trigger AFTER INSERT (compatible Supabase free tier, sans pg_cron).
-- À chaque nouvelle entrée, supprime les anciennes du même user/endpoint > 24h.

CREATE OR REPLACE FUNCTION purge_old_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE user_id   = NEW.user_id
    AND endpoint  = NEW.endpoint
    AND created_at < NOW() - INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_purge_rate_limits ON public.api_rate_limits;

CREATE TRIGGER trigger_purge_rate_limits
  AFTER INSERT ON public.api_rate_limits
  FOR EACH ROW EXECUTE FUNCTION purge_old_rate_limits();
