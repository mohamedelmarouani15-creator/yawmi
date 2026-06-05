import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { askCompanion } from "@/lib/ai/companion";
import type { CompanionContext, AIMessage } from "@/lib/ai/companion";
import { logger } from "@/lib/logger";

const DAILY_LIMIT = 20; // requêtes/jour/utilisateur

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  const token      = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = user.id;

  // ── Rate limiting ─────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const { data: mem } = await supabase
    .from("companion_memory")
    .select("daily_requests, daily_reset_date, arabic_level, app_mode, strong_categories, weak_categories, tone_preference, last_session_at, notes")
    .eq("user_id", userId)
    .single();

  const isNewDay   = !mem || mem.daily_reset_date !== today;
  const dailyCount = isNewDay ? 0 : (mem?.daily_requests ?? 0);

  if (dailyCount >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: "daily_limit_reached", message: "Tu as atteint ta limite de 20 messages pour aujourd'hui. Reviens demain !" },
      { status: 429 }
    );
  }

  // ── Lecture du body ───────────────────────────────────────────
  const body = await req.json().catch(() => null);
  if (!body?.message || typeof body.message !== "string") {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }
  const userMessage: string = body.message.slice(0, 2000); // limite longueur

  // ── Récupère le profil, la progression et l'histoire en cours ──
  const [{ data: profile }, { data: progress }, { data: storyRows }] = await Promise.all([
    supabase.from("profiles").select("display_name, age_group, main_objective, mother_tongue, app_mode").eq("id", userId).single(),
    supabase.from("player_progress")
      .select("category_levels, game_streak, defeated_sages, total_correct_answers")
      .eq("user_id", userId)
      .single(),
    supabase.from("story_progress")
      .select("story_id, current_chapter")
      .eq("user_id", userId)
      .order("last_read_at", { ascending: false })
      .limit(1),
  ]);

  const activeStoryProgress = storyRows?.[0] ?? null;
  let currentStory: { id: string; chapter: number; title: string } | undefined;
  if (activeStoryProgress) {
    const { data: storyMeta } = await supabase
      .from("stories")
      .select("id, title")
      .eq("id", activeStoryProgress.story_id)
      .single();
    if (storyMeta) {
      currentStory = {
        id:      storyMeta.id,
        chapter: activeStoryProgress.current_chapter ?? 1,
        title:   (storyMeta.title as string) ?? storyMeta.id,
      };
    }
  }

  // ── Historique de conversation (10 derniers) ──────────────────
  const { data: msgRows } = await supabase
    .from("companion_messages")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const history: AIMessage[] = (msgRows ?? []).reverse().map(r => ({
    role: r.role as "user" | "assistant",
    content: r.content,
  }));

  // ── Construit le contexte apprenant ──────────────────────────
  const p = profile as Record<string, string | null> | null;
  const context: CompanionContext = {
    firstName:       p?.display_name ?? null,
    arabicLevel:     (mem?.arabic_level ?? "beginner") as CompanionContext["arabicLevel"],
    appMode:         ((p?.app_mode ?? mem?.app_mode ?? "pratiquant") as CompanionContext["appMode"]),
    ageGroup:        p?.age_group ?? null,
    mainObjective:   p?.main_objective ?? null,
    motherTongue:    p?.mother_tongue ?? null,
    categoryLevels:  (progress?.category_levels as Record<string, number>) ?? {},
    gameStreak:      progress?.game_streak ?? 0,
    totalCorrect:    (progress as { total_correct_answers?: number } | null)?.total_correct_answers ?? 0,
    defeatedSages:   (progress?.defeated_sages as string[]) ?? [],
    strongCategories: (mem?.strong_categories as string[]) ?? [],
    weakCategories:   (mem?.weak_categories as string[]) ?? [],
    learningStyle:   null,
    tonePreference:  (mem?.tone_preference ?? "warm") as CompanionContext["tonePreference"],
    lastMessages:    history,
    lastSessionDate: mem?.last_session_at ?? null,
    currentStory,
  };

  // ── Appel Groq ──────────────────────────────────────────────
  let reply: string;
  try {
    reply = await askCompanion(userMessage, context, history);
  } catch (err) {
    logger.error("companion/chat", "AI error:", err);
    return NextResponse.json(
      { error: "ai_error", message: "Je rencontre une difficulté. Réessaie dans un instant." },
      { status: 503 }
    );
  }

  // ── Sauvegarde messages + mise à jour compteur ────────────────
  await Promise.all([
    supabase.from("companion_messages").insert([
      { user_id: userId, role: "user",      content: userMessage },
      { user_id: userId, role: "assistant", content: reply },
    ]),
    supabase.from("companion_memory").upsert({
      user_id:          userId,
      daily_requests:   isNewDay ? 1 : dailyCount + 1,
      daily_reset_date: today,
      last_session_at:  new Date().toISOString(),
      updated_at:       new Date().toISOString(),
    }, { onConflict: "user_id" }),
  ]);

  return NextResponse.json({
    message: reply,
    remaining: DAILY_LIMIT - (isNewDay ? 1 : dailyCount + 1),
  });
}
