-- Migration 018 — Fix contraintes manquantes
-- Appliquée via Management API le 2026-06-05

-- mother_tongue : étend de 4 à 7 valeurs
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_mother_tongue_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_mother_tongue_check
  CHECK (mother_tongue IN ('français','arabe','darija','anglais','espagnol','turc','autre'));

-- questions : ajoute timeline et scholars_match
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check
  CHECK (type IN (
    'mcq','true_false','fill_in','reorder',
    'drag_drop','memory','fill_verse','who_am_i','calligraphy',
    'timeline','scholars_match'
  ));

-- companion_daily_message : PK composite (user_id, message_date) pour onConflict correct
ALTER TABLE companion_daily_message DROP CONSTRAINT IF EXISTS companion_daily_message_pkey;
ALTER TABLE companion_daily_message ADD PRIMARY KEY (user_id, message_date);
