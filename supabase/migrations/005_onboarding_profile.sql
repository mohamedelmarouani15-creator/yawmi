-- ═══════════════════════════════════════════════════════════════
-- Yawmi V1.1 — Profil onboarding adaptatif
-- ═══════════════════════════════════════════════════════════════

-- Colonnes de profil collectées au quiz d'inscription
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age_group      text
    CHECK (age_group IN ('4-10','11-17','18-35','36-55','55+')),
  ADD COLUMN IF NOT EXISTS main_objective text
    CHECK (main_objective IN ('apprendre','pratiquer','explorer')),
  ADD COLUMN IF NOT EXISTS mother_tongue  text
    CHECK (mother_tongue IN ('français','arabe','darija','autre')),
  ADD COLUMN IF NOT EXISTS arabic_level   text DEFAULT 'beginner'
    CHECK (arabic_level IN ('none','beginner','intermediate','advanced')),
  ADD COLUMN IF NOT EXISTS app_mode       text DEFAULT 'pratiquant'
    CHECK (app_mode IN ('pratiquant','explorateur'));

-- app_mode dans companion_memory (était hardcodé "pratiquant")
ALTER TABLE companion_memory
  ADD COLUMN IF NOT EXISTS app_mode text DEFAULT 'pratiquant'
    CHECK (app_mode IN ('pratiquant','explorateur'));
