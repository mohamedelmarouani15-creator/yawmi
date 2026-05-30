import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  const { targetUserId, title, body, url } = await req.json();
  if (!targetUserId) return NextResponse.json({ error: "missing_params" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
