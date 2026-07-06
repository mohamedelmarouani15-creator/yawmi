-- ═══════════════════════════════════════════════════════════════
-- Fix: le compteur de rate-limit du companion (daily_requests /
-- daily_reset_date) est protégé par la policy "companion_memory_own"
-- (FOR ALL USING auth.uid() = user_id), ce qui permet à un utilisateur
-- de remettre son propre compteur à zéro via un UPDATE/INSERT direct
-- depuis le client anon, contournant la limite serveur de
-- src/app/api/companion/chat/route.ts.
--
-- On garde la policy d'accès existante (le client a toujours besoin
-- d'écrire strong_categories/weak_categories depuis game-storage.ts),
-- mais un trigger neutralise toute tentative de modifier les colonnes
-- de rate-limit sauf quand l'appel vient du service-role (qui bypass
-- RLS et n'est donc jamais concerné par ce trigger applicatif — on le
-- laisse passer explicitement via auth.role()).
-- ═══════════════════════════════════════════════════════════════

create or replace function protect_companion_memory_counters()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.daily_requests   := old.daily_requests;
    new.daily_reset_date := old.daily_reset_date;
  elsif tg_op = 'INSERT' then
    new.daily_requests   := 0;
    new.daily_reset_date := current_date;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_companion_memory_counters on companion_memory;
create trigger trg_protect_companion_memory_counters
  before insert or update on companion_memory
  for each row
  execute function protect_companion_memory_counters();
