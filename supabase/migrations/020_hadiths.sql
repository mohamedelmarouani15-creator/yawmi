-- Migration 020 — Table hadiths
-- CONTENU À VALIDER PAR UNE PERSONNE QUALIFIÉE

CREATE TABLE IF NOT EXISTS hadiths (
  id          text    PRIMARY KEY,
  text_fr     text    NOT NULL,
  text_ar     text    NOT NULL,
  source      text    NOT NULL,
  reference   text    NOT NULL,
  category    text    NOT NULL CHECK (category IN (
    'foi', 'ethique', 'famille', 'connaissance',
    'priere', 'ramadan', 'vie_quotidienne'
  )),
  difficulty  integer NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  is_active   boolean NOT NULL DEFAULT true
);

ALTER TABLE hadiths ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "hadiths_read" ON hadiths
    FOR SELECT TO authenticated
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
