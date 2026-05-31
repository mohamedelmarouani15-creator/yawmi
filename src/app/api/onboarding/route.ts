import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { ageGroup, arabicLevel, mainObjective, appMode, motherTongue } = body;

  await Promise.all([
    supabase.from("profiles").upsert({
      id:             user.id,
      age_group:      ageGroup      ?? null,
      arabic_level:   arabicLevel   ?? "beginner",
      main_objective: mainObjective ?? null,
      app_mode:       appMode       ?? "pratiquant",
      mother_tongue:  motherTongue  ?? null,
    }, { onConflict: "id" }),

    supabase.from("companion_memory").upsert({
      user_id:     user.id,
      arabic_level: arabicLevel ?? "beginner",
      app_mode:    appMode ?? "pratiquant",
      updated_at:  new Date().toISOString(),
    }, { onConflict: "user_id" }),
  ]);

  return NextResponse.json({ ok: true });
}
