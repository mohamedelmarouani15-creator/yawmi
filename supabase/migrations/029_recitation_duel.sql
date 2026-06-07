-- Ajout colonnes duel récitation sur la table duels existante
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS duel_type text NOT NULL DEFAULT 'quiz';
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS recitation_surah integer;
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS recitation_ayah_start integer;
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS recitation_ayah_end   integer;
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS challenger_recitation_score integer;
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS challenged_recitation_score integer;

-- Index pour requêter les duels récitation
CREATE INDEX IF NOT EXISTS idx_duels_type ON public.duels(duel_type);
