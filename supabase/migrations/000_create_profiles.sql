-- ═══════════════════════════════════════════════════════════════
-- Yawmi — Migration 000 : tables fondamentales
-- À exécuter EN PREMIER, avant toutes les autres migrations.
-- profiles et families sont référencées par 001–009 mais
-- n'avaient pas de CREATE TABLE versionné — ce fichier corrige ça.
-- ═══════════════════════════════════════════════════════════════

-- ── families (profiles.family_id le référence) ───────────────
create table if not exists families (
  id         text        primary key default gen_random_uuid()::text,
  name       text        not null,
  code       text        not null unique,
  created_by uuid        references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table families enable row level security;

create policy "families: lecture membres"
  on families for select
  using (
    id in (
      select family_id from profiles
      where id = auth.uid() and family_id is not null
    )
  );

create policy "families: création"
  on families for insert
  with check (auth.uid() = created_by);

create policy "families: modification fondateur"
  on families for update
  using (auth.uid() = created_by);

-- ── updated_at helper ─────────────────────────────────────────
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles ──────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  -- Identité
  display_name  text,
  family_id     text references families(id) on delete set null,

  -- Localisation & prières
  city          text,
  lat           double precision,
  lng           double precision,
  prayer_method text default 'UOIF',
  madhab        text default 'Shafi',

  -- Personnalisation — valeurs issues de l'onboarding
  age_group     text check (age_group in ('4-10','11-17','18-35','36-55','55+')),
  arabic_level  text default 'beginner'
                  check (arabic_level in ('none','beginner','intermediate','advanced')),
  app_mode      text default 'pratiquant'
                  check (app_mode in ('pratiquant','explorateur')),
  mother_tongue text check (mother_tongue in ('français','arabe','darija','autre')),
  main_objective text check (main_objective in ('apprendre','pratiquer','explorer')),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

-- ── RLS profiles ──────────────────────────────────────────────
alter table profiles enable row level security;

create policy "profiles: lecture propre"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: insertion propre"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles: modification propre"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── Auto-création du profil à l'inscription ───────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Index ─────────────────────────────────────────────────────
create index if not exists profiles_family_id_idx on profiles(family_id)
  where family_id is not null;
