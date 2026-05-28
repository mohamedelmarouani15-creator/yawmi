import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Profile {
  id:           string;
  display_name: string | null;
  family_id:    string | null;
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
