import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, isSafeId } from "@/lib/rate-limit";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Rate limiting : 60 req/heure/user
  const rl = await checkRateLimit(user.id, "story/answer", 60);
  if (rl.limited) {
    return NextResponse.json(
      { error: "rate_limit_exceeded", message: "Trop de requêtes. Réessaie dans une heure." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const { storyId, chapterNumber, questionId, answerIdx, isCorrect, chapterCompleted } = body ?? {};

  // Validation des entrées
  if (!storyId || !isSafeId(storyId) || chapterNumber == null || !questionId || !isSafeId(questionId)) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  // Met à jour la progression
  if (chapterCompleted) {
    const { data: existing } = await supabase
      .from("story_progress")
      .select("completed_chapters, current_chapter")
      .eq("user_id", user.id)
      .eq("story_id", storyId)
      .maybeSingle();

    const completed = existing?.completed_chapters ?? [];
    const already   = completed.includes(chapterNumber);

    await supabase.from("story_progress").upsert({
      user_id:             user.id,
      story_id:            storyId,
      current_chapter:     chapterNumber + 1,
      completed_chapters:  already ? completed : [...completed, chapterNumber],
      last_read_at:        new Date().toISOString(),
    }, { onConflict: "user_id,story_id" });

    // Récupère les récompenses du chapitre
    const { data: chapter } = await supabase
      .from("story_chapters")
      .select("rewards")
      .eq("story_id", storyId)
      .eq("chapter_number", chapterNumber)
      .maybeSingle();

    if (chapter?.rewards && !already) {
      const rewards = chapter.rewards as { xp?: number; coins?: number; mosque_object?: string; location_unlock?: string };
      return NextResponse.json({
        ok: true,
        rewards: {
          xp:             rewards.xp ?? 0,
          coins:          rewards.coins ?? 0,
          mosqueObject:   rewards.mosque_object ?? null,
          locationUnlock: rewards.location_unlock ?? null,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
