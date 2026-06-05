import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { subscription, userId, lat, lng, prayerMethod, madhab } = await req.json();
  if (!subscription || !userId) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id:       userId,
      sub:           subscription,
      lat:           lat   ?? null,
      lng:           lng   ?? null,
      prayer_method: prayerMethod ?? "UOIF",
      madhab:        madhab       ?? "Shafi",
      updated_at:    new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
