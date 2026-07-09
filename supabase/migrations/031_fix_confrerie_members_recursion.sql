-- ═══════════════════════════════════════════════════════════════
-- Fix: la policy "confrerie_members_read" (020_confreries.sql)
-- fait un sous-select sur confrerie_members elle-même pour vérifier
-- l'appartenance de l'utilisateur courant, ce qui déclenche
-- "infinite recursion detected in policy for relation
-- confrerie_members" (42P17) à chaque lecture — la liste des membres
-- d'une confrérie est donc inaccessible via le client RLS.
--
-- On remplace le sous-select récursif par une fonction
-- SECURITY DEFINER, qui contourne la RLS (le propriétaire de la
-- fonction/table bypass RLS par défaut) et casse ainsi la boucle.
-- ═══════════════════════════════════════════════════════════════

create or replace function is_confrerie_member(p_confrerie_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from confrerie_members
    where confrerie_id = p_confrerie_id and user_id = auth.uid()
  );
$$;

drop policy if exists "confrerie_members_read" on confrerie_members;
create policy "confrerie_members_read" on confrerie_members for select
  using (is_confrerie_member(confrerie_id));

-- La policy "confreries_member_read" (020) a le même sous-select,
-- mais sur une table différente de celle qu'elle protège donc pas de
-- récursion directe — on la fait quand même passer par la fonction
-- pour cohérence et pour éviter un futur bug si la table est renommée.
drop policy if exists "confreries_member_read" on confreries;
create policy "confreries_member_read" on confreries for select
  using (is_confrerie_member(id));
