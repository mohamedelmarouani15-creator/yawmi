import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storyId  = searchParams.get("storyId");
  const chapterN = parseInt(searchParams.get("chapter") ?? "1", 10);
  const lang     = searchParams.get("lang") ?? "fr";

  if (!storyId) return NextResponse.json({ error: "storyId required" }, { status: 400 });

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token)  return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Récupère le chapitre et le total de l'arc en parallèle
  const [{ data: chapter, error }, { data: story }] = await Promise.all([
    supabase
      .from("story_chapters")
      .select("*")
      .eq("story_id", storyId)
      .eq("chapter_number", chapterN)
      .single(),
    supabase
      .from("stories")
      .select("total_chapters")
      .eq("id", storyId)
      .single(),
  ]);

  if (error || !chapter) return NextResponse.json({ error: "chapter_not_found" }, { status: 404 });

  // Récupère la progression de l'utilisateur
  const { data: progress } = await supabase
    .from("story_progress")
    .select("current_chapter, completed_chapters")
    .eq("user_id", user.id)
    .eq("story_id", storyId)
    .single();

  // Apply language overlay — AR uses dedicated columns, others use translations JSONB
  let localizedChapter = chapter;
  if (lang === "ar") {
    localizedChapter = {
      ...chapter,
      title:     chapter.title_ar     ?? chapter.title,
      narrative: chapter.narrative_ar ?? chapter.narrative,
    };
  } else if (lang !== "fr") {
    const t = (chapter.translations as Record<string, { title?: string; narrative?: string }> | null)?.[lang];
    if (t) {
      localizedChapter = {
        ...chapter,
        title:     t.title     ?? chapter.title,
        narrative: t.narrative ?? chapter.narrative,
      };
    }
  }

  return NextResponse.json({ chapter: localizedChapter, progress, totalChapters: story?.total_chapters ?? null });
}
