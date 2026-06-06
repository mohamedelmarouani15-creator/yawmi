-- Migration 026 : Renommage des catégories de questions
-- religion → theologie, history → histoire, arabic → arabe, quran → coran
-- Suppression darija (hors scope islamique)

-- 1. Désactiver temporairement la contrainte CHECK sur category
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_category_check;

-- 2. Renommer les catégories existantes
UPDATE questions SET category = 'theologie' WHERE category = 'religion';
UPDATE questions SET category = 'histoire'  WHERE category = 'history';
UPDATE questions SET category = 'coran'     WHERE category = 'quran';
UPDATE questions SET category = 'arabe'     WHERE category = 'arabic';

-- 3. Supprimer les questions darija (dialecte marocain — hors périmètre islamique)
DELETE FROM questions WHERE category = 'darija';

-- 4. Rétablir la contrainte CHECK avec les nouvelles valeurs
ALTER TABLE questions ADD CONSTRAINT questions_category_check
  CHECK (category IN ('theologie', 'histoire', 'coran', 'arabe', 'ethique', 'sira', 'fiqh'));

-- 5. Invalider le cache côté client (forcer rechargement dans 24h)
-- (Le cache localStorage expire automatiquement — aucune action SQL requise)
