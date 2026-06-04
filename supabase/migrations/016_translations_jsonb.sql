-- Generic translations JSONB column for all remaining languages (en, es, tr, darija)
-- Structure: { "en": { "question": "...", "options": [...], "explanation": "..." }, "es": {...}, ... }
ALTER TABLE questions      ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}';
ALTER TABLE story_chapters ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}';
