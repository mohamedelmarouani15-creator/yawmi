import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdmin();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  // ── Collecte des données ──────────────────────────────────────
  const [
    profileRes,
    questionHistoryRes,
    playerProgressRes,
    companionMessagesRes,
    storyProgressRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single(),

    supabase
      .from("question_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("player_progress")
      .select("*")
      .eq("user_id", userId)
      .single(),

    supabase
      .from("companion_messages")
      .select("role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("story_progress")
      .select("*")
      .eq("user_id", userId),
  ]);

  const exportData = {
    export_date: new Date().toISOString(),
    export_format_version: "1.0",
    user: {
      id: userId,
      email: user.email,
    },
    profile: profileRes.data ?? null,
    player_progress: playerProgressRes.data ?? null,
    question_history: questionHistoryRes.data ?? [],
    companion_messages: companionMessagesRes.data ?? [],
    story_progress: storyProgressRes.data ?? [],
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="yawmi-mes-donnees.json"',
    },
  });
}
