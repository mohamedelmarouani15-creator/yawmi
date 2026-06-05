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

/**
 * Récupère la session courante.
 * Si la session est absente ou expirée, redirige vers /connexion
 * et retourne null. À utiliser dans les hooks client-side.
 *
 * @example
 *   const session = await getSessionOrRedirect(router);
 *   if (!session) return; // redirect en cours
 */
export async function getSessionOrRedirect(
  redirectFn: (path: string) => void
): Promise<import("@supabase/supabase-js").Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      redirectFn("/connexion");
      return null;
    }
    return data.session;
  } catch {
    redirectFn("/connexion");
    return null;
  }
}
