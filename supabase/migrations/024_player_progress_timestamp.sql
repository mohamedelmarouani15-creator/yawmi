-- Migration 024 : s'assurer que player_progress a bien une colonne updated_at
-- utilisée par la stratégie de merge déterministe (sync phase 4).
--
-- La colonne updated_at existe déjà dans la plupart des versions de la table,
-- mais on s'assure qu'elle a un default et est bien indexée pour les comparaisons
-- de timestamps multi-device.

-- Ajouter updated_at si absente (idempotent)
alter table player_progress
  add column if not exists updated_at timestamptz not null default now();

-- Index pour accélérer les UPDATE conditionnels (WHERE updated_at < $now)
create index if not exists player_progress_updated_at_idx
  on player_progress (user_id, updated_at desc);

-- Trigger pour mettre à jour updated_at automatiquement sur chaque UPDATE
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attacher le trigger uniquement s'il n'existe pas encore
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'player_progress_set_updated_at'
      and tgrelid = 'player_progress'::regclass
  ) then
    create trigger player_progress_set_updated_at
      before update on player_progress
      for each row execute function set_updated_at();
  end if;
end;
$$;
