import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateContextualMessage } from "@/lib/ai/companion";
import type { CompanionContext } from "@/lib/ai/companion";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Détermine quel trigger utiliser selon l'état de l'utilisateur
function detectTrigger(
  gameStreak: number,
  defeatedSages: string[],
  lastSessionDate: string | null,
): string | null {
  const today = new Date().toISOString().split("T")[0];

  // Retour après absence
  if (lastSessionDate) {
    const days = Math.round(
      (Date.now() - new Date(lastSessionDate).getTime()) / 86400000
    );
    if (days >= 2) return "daily_comeback";
  }

  // Streaks
  if (gameStreak === 7)  return "streak_7";
  if (gameStreak === 3)  return "streak_3";

  // Victoire sage récente (sage débloqué aujourd'hui — heuristique simple)
  if (defeatedSages.length > 0) return "sage_defeated";

  return null;
}

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ message: null });

  const supabase = supabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ message: null });

  const userId = user.id;
  const today  = new Date().toISOString().split("T")[0];

  // ── Vérifie si message déjà envoyé aujourd'hui ───────────────
  const { data: existing } = await supabase
    .from("companion_daily_message")
    .select("message, shown")
    .eq("user_id", userId)
    .eq("message_date", today)
    .single();

  if (existing) {
    return NextResponse.json({ message: existing.message, already_shown: existing.shown });
  }

  // ── Récupère les données ──────────────────────────────────────
  const [{ data: mem }, { data: progress }, { data: profile }] = await Promise.all([
    supabase.from("companion_memory")
      .select("arabic_level, strong_categories, weak_categories, tone_preference, last_session_at")
      .eq("user_id", userId)
      .single(),
    supabase.from("player_progress")
      .select("category_levels, game_streak, defeated_sages")
      .eq("user_id", userId)
      .single(),
    supabase.from("profiles").select("display_name").eq("id", userId).single(),
  ]);

  const gameStreak     = progress?.game_streak ?? 0;
  const defeatedSages  = (progress?.defeated_sages as string[]) ?? [];
  const lastSessionDate = mem?.last_session_at ?? null;

  const trigger = detectTrigger(gameStreak, defeatedSages, lastSessionDate);
  if (!trigger) return NextResponse.json({ message: null });

  // ── Génère le message contextuel ─────────────────────────────
  const context: CompanionContext = {
    firstName:        profile?.display_name ?? null,
    arabicLevel:      (mem?.arabic_level ?? "beginner") as CompanionContext["arabicLevel"],
    appMode:          "pratiquant",
    categoryLevels:   (progress?.category_levels as Record<string, number>) ?? {},
    gameStreak,
    totalCorrect:     0,
    defeatedSages,
    strongCategories: (mem?.strong_categories as string[]) ?? [],
    weakCategories:   (mem?.weak_categories as string[]) ?? [],
    learningStyle:    null,
    tonePreference:   (mem?.tone_preference ?? "warm") as CompanionContext["tonePreference"],
    lastMessages:     [],
    lastSessionDate,
  };

  let message: string;
  try {
    message = await generateContextualMessage(trigger, context);
  } catch {
    return NextResponse.json({ message: null });
  }

  // ── Sauvegarde ────────────────────────────────────────────────
  await supabase.from("companion_daily_message").upsert({
    user_id:      userId,
    message,
    trigger_key:  trigger,
    shown:        false,
    message_date: today,
    created_at:   new Date().toISOString(),
  }, { onConflict: "user_id" });

  return NextResponse.json({ message, already_shown: false });
}
