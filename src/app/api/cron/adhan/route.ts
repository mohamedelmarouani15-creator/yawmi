import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { computePrayerTimes, PRAYER_LABELS } from "@/lib/prayer";
import type { CalcMethodKey, MadhabKey } from "@/lib/prayer";

const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
const WINDOW_MS   = 2 * 60 * 1000; // fenêtre de 2 minutes

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error("[cron/adhan] CRON_SECRET manquant — configurer dans Vercel env vars");
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("user_id, sub, lat, lng, prayer_method, madhab, last_notif_key")
    .not("lat", "is", null)
    .not("sub", "is", null);

  if (error) {
    console.error("[cron/adhan] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!subs?.length) {
    console.log("[cron/adhan] Aucun abonnement actif");
    return NextResponse.json({ ok: true, sent: 0 });
  }
  // [cron/adhan] ${subs.length} abonnement(s) à vérifier`);

  const now  = new Date();
  let   sent = 0;

  await Promise.allSettled(
    subs.map(async (row) => {
      const times = computePrayerTimes(
        row.lat as number,
        row.lng as number,
        (row.prayer_method as CalcMethodKey) ?? "UOIF",
        (row.madhab        as MadhabKey)     ?? "Shafi",
      );

      for (const key of PRAYER_KEYS) {
        const prayerTime = times[key];
        const diff       = prayerTime.getTime() - now.getTime();

        if (diff < 0 || diff > WINDOW_MS) continue;

        const notifKey = `${now.toISOString().slice(0, 10)}-${key}`;
        if (row.last_notif_key === notifKey) continue; // déjà envoyé

        try {
          await webpush.sendNotification(
            row.sub as webpush.PushSubscription,
            JSON.stringify({
              title: PRAYER_LABELS[key].fr,
              body:  `Il est l'heure — ${prayerTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
              url:   "/prieres",
            })
          );
          sent++;
          await supabase
            .from("push_subscriptions")
            .update({ last_notif_key: notifKey })
            .eq("user_id", row.user_id);
        } catch {
          // Abonnement expiré — on le supprime
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", row.user_id);
        }
        break; // une seule prière par utilisateur par appel cron
      }
    })
  );

  // [cron/adhan] Terminé — ${sent} notification(s) envoyée(s)`);
  return NextResponse.json({ ok: true, sent });
}
