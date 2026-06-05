import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  // ── Autorisation interne via cron-secret ──────────────────────
  const cronSecret = req.headers.get("x-cron-secret");
  const isCronCall = cronSecret && cronSecret === process.env.CRON_SECRET;

  // ── Sinon : authentification utilisateur normale ──────────────
  let callerId: string | null = null;
  if (!isCronCall) {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const supabase = supabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    callerId = user.id;
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const { targetUserId, title, body, url } = await req.json();
  if (!targetUserId) return NextResponse.json({ error: "missing_params" }, { status: 400 });

  // ── Vérification IDOR : un user ne peut notifier qu'un membre
  //    de sa propre famille (sauf appel cron interne)
  if (!isCronCall && callerId !== targetUserId) {
    const supabase = supabaseAdmin();

    // Récupère les family_id des deux utilisateurs
    const [{ data: callerProfile }, { data: targetProfile }] = await Promise.all([
      supabase.from("profiles").select("family_id").eq("id", callerId!).single(),
      supabase.from("profiles").select("family_id").eq("id", targetUserId).single(),
    ]);

    const callerFamilyId = callerProfile?.family_id;
    const targetFamilyId = targetProfile?.family_id;

    // Bloquer si l'un des deux n'a pas de famille ou si les familles diffèrent
    if (!callerFamilyId || !targetFamilyId || callerFamilyId !== targetFamilyId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("push_subscriptions")
    .select("sub")
    .eq("user_id", targetUserId)
    .single();

  if (!data?.sub) return NextResponse.json({ ok: false, reason: "no_subscription" });

  try {
    await webpush.sendNotification(
      data.sub as webpush.PushSubscription,
      JSON.stringify({ title, body, url: url ?? "/famille" })
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
