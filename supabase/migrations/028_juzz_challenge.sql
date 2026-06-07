-- Table pour tracker les participations au challenge Juzz du Jour
CREATE TABLE IF NOT EXISTS public.juzz_challenge_participants (
  user_id       uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_date date   NOT NULL,
  juzz_number   integer NOT NULL CHECK (juzz_number BETWEEN 1 AND 30),
  ayahs_count   integer NOT NULL DEFAULT 0,
  completed     boolean NOT NULL DEFAULT false,
  completed_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, challenge_date)
);

ALTER TABLE public.juzz_challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own challenge participation"
  ON public.juzz_challenge_participants
  FOR ALL USING (auth.uid() = user_id);

-- Vue publique pour compter les participants du jour (sans PII)
CREATE OR REPLACE VIEW public.juzz_challenge_daily_count AS
SELECT challenge_date, juzz_number, COUNT(*) AS participants
FROM public.juzz_challenge_participants
WHERE completed = true
GROUP BY challenge_date, juzz_number;
