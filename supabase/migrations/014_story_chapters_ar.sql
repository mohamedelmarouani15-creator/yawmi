-- Arabic translations for story chapters
ALTER TABLE story_chapters ADD COLUMN IF NOT EXISTS title_ar     TEXT;
ALTER TABLE story_chapters ADD COLUMN IF NOT EXISTS narrative_ar TEXT;
