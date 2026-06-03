import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Aliases pour la compatibilité avec le code existant
export type Profile  = Database["public"]["Tables"]["profiles"]["Row"];
export type Family   = Database["public"]["Tables"]["families"]["Row"];
export type SupaTask = Database["public"]["Tables"]["tasks"]["Row"];
