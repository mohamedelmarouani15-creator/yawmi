-- Arabic translations for quiz questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_ar    TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS options_ar     JSONB;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation_ar TEXT;
