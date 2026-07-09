-- ═══════════════════════════════════════════════════════════════
-- Fix: la policy "duels_parties" (001_v2_game.sql) est en FOR ALL
-- USING (auth.uid() = challenger_id OR auth.uid() = challenged_id) —
-- comme les deux scores (challenger_score/challenged_score,
-- challenger_recitation_score/challenged_recitation_score,
-- challenger_answers/challenged_answers) vivent sur la MÊME ligne,
-- n'importe lequel des deux joueurs peut modifier le score/les
-- réponses de l'AUTRE via un UPDATE direct (RLS est au niveau ligne,
-- pas colonne).
--
-- Un trigger restaure la valeur OLD des colonnes appartenant à
-- l'adversaire si l'utilisateur courant n'est pas la bonne partie —
-- chacun ne peut donc écrire que ses propres colonnes, quel que soit
-- le payload envoyé au client.
-- ═══════════════════════════════════════════════════════════════

create or replace function protect_duel_opponent_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  -- L'utilisateur courant est le challenger : il ne peut pas toucher
  -- aux colonnes du camp "challenged".
  if auth.uid() = old.challenger_id then
    new.challenged_score             := old.challenged_score;
    new.challenged_answers           := old.challenged_answers;
    new.challenged_recitation_score  := old.challenged_recitation_score;
  end if;

  -- L'utilisateur courant est le challenged : il ne peut pas toucher
  -- aux colonnes du camp "challenger".
  if auth.uid() = old.challenged_id then
    new.challenger_score             := old.challenger_score;
    new.challenger_answers           := old.challenger_answers;
    new.challenger_recitation_score  := old.challenger_recitation_score;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_duel_opponent_columns on duels;
create trigger trg_protect_duel_opponent_columns
  before update on duels
  for each row
  execute function protect_duel_opponent_columns();

-- Même problème sur duels_live (002_v2_live_features.sql) : la policy
-- "duels_live_parties" est FOR ALL, et player1_score/player2_score,
-- player1_answers/player2_answers, player1_ready/player2_ready
-- vivent sur la même ligne.

create or replace function protect_duel_live_opponent_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if auth.uid() = old.player1_id then
    new.player2_score   := old.player2_score;
    new.player2_answers := old.player2_answers;
    new.player2_ready   := old.player2_ready;
  end if;

  if auth.uid() = old.player2_id then
    new.player1_score   := old.player1_score;
    new.player1_answers := old.player1_answers;
    new.player1_ready   := old.player1_ready;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_duel_live_opponent_columns on duels_live;
create trigger trg_protect_duel_live_opponent_columns
  before update on duels_live
  for each row
  execute function protect_duel_live_opponent_columns();
