-- ═══════════════════════════════════════════════════════════════
-- Fix: la seule policy SELECT sur profiles (000_create_profiles.sql)
-- est "profiles: lecture propre" (auth.uid() = id) — lecture de son
-- propre profil uniquement. Or src/hooks/useFamily.ts interroge
-- profiles filtré par family_id pour lister les membres de la
-- famille et nommer les adversaires de duel : sous RLS stricte, ces
-- requêtes ne renvoient que l'utilisateur courant, cassant la
-- fonctionnalité famille/duels.
--
-- On ajoute une policy "même famille" via une fonction SECURITY
-- DEFINER (my_family_id) plutôt qu'un sous-select direct sur
-- profiles dans la policy elle-même, pour éviter la même récursion
-- RLS corrigée dans 022_fix_confrerie_members_recursion.sql (une
-- policy sur profiles qui interroge profiles sous RLS se
-- re-déclenche elle-même).
-- ═══════════════════════════════════════════════════════════════

create or replace function my_family_id()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select family_id from profiles where id = auth.uid();
$$;

create policy "profiles: lecture famille"
  on profiles for select
  using (
    family_id is not null
    and family_id = my_family_id()
  );
