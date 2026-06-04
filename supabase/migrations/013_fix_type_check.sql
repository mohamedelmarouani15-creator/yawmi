-- Version the manual type_check fix applied 03/06/2026
-- 001_v2_game.sql had an incomplete constraint (missing mini-game types)
-- If recreating DB from scratch, run this after 001_v2_game.sql
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check
  CHECK (type IN ('mcq','true_false','fill_in','reorder','drag_drop','memory','fill_verse','who_am_i','calligraphy'));
