import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Profile {
  id:             string;
  display_name:   string | null;
  family_id:      string | null;
  city:           string | null;
  lat:            number | null;
  lng:            number | null;
  prayer_method:  string | null;
  madhab:         string | null;
  age_group:      string | null;
  arabic_level:   string | null;
  app_mode:       string | null;
  mother_tongue:  string | null;
  main_objective: string | null;
}

export interface Family {
  id:   string;
  name: string;
  code: string;
}

export interface SupaTask {
  id:         string;
  family_id:  string;
  text:       string;
  member:     string;
  done:       boolean;
  created_at: string;
}
