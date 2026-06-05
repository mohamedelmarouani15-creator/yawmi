/**
 * Rate limiting via Supabase — table `api_rate_limits`
 * Crée un enregistrement horodaté par (user_id, endpoint).
 * Compte les appels dans la fenêtre et retourne null si OK,
 * ou un objet { limited: true, retryAfter } si dépassé.
 */
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type RateLimitOk = { limited: false };
type RateLimitBlocked = { limited: true; retryAfterSeconds: number };
export type RateLimitOutcome = RateLimitOk | RateLimitBlocked;

/**
 * @param userId     - ID de l'utilisateur
 * @param endpoint   - Clé de route ex: "story/chapter"
 * @param maxPerHour - Nombre max de requêtes par heure
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  maxPerHour: number
): Promise<RateLimitOutcome> {
  const supabase = supabaseAdmin();
  const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Compte les appels dans la dernière heure
  const { count, error } = await supabase
    .from("api_rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("endpoint", endpoint)
    .gte("created_at", windowStart);

  if (error) {
    // En cas d'erreur Supabase, on laisse passer (fail open)
    console.warn("[rate-limit] Supabase error:", error.message);
    return { limited: false };
  }

  if ((count ?? 0) >= maxPerHour) {
    return { limited: true, retryAfterSeconds: 3600 };
  }

  // Enregistre la requête (fire-and-forget)
  void supabase
    .from("api_rate_limits")
    .insert({ user_id: userId, endpoint })
    .then(({ error: insertErr }) => {
      if (insertErr) console.warn("[rate-limit] insert failed:", insertErr.message);
    });

  return { limited: false };
}

/** Validation basique : alphanumeric + tirets/underscores, max 100 chars */
export function isSafeId(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.length === 0 || value.length > 100) return false;
  return /^[a-zA-Z0-9_\-]+$/.test(value);
}
