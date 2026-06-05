import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const LEAGUE_ORDER: string[] = ["bronze", "silver", "gold", "diamond"];
const PROMOTE_COUNT = 5;
const RELEGATE_COUNT = 5;

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdmin();

  // Get last completed week (Monday of last week)
  const today = new Date();
  const dayOfWeek = today.getUTCDay(); // 0=Sun
  const lastMonday = new Date(today);
  lastMonday.setUTCDate(today.getUTCDate() - (dayOfWeek === 0 ? 13 : dayOfWeek + 6));
  const weekStart = lastMonday.toISOString().slice(0, 10);

  const { data: season } = await supabase
    .from("liga_seasons")
    .select("id")
    .eq("week_start", weekStart)
    .single();

  if (!season) {
    return NextResponse.json({ ok: true, message: "No season to process" });
  }

  // Get all placements for this season
  const { data: placements } = await supabase
    .from("liga_placements")
    .select("id, user_id, league, xp_this_week")
    .eq("season_id", season.id);

  if (!placements?.length) {
    return NextResponse.json({ ok: true, message: "No placements" });
  }

  // Group by league
  const byLeague: Record<string, typeof placements> = {};
  for (const p of placements) {
    const l = p.league as string;
    if (!byLeague[l]) byLeague[l] = [];
    byLeague[l].push(p);
  }

  // Sort each league by xp_this_week desc, assign ranks, promotion/relegation
  const updates: { id: string; rank_in_league: number; promoted: boolean; relegated: boolean }[] = [];

  for (const [league, members] of Object.entries(byLeague)) {
    const sorted = [...members].sort((a, b) => (b.xp_this_week as number) - (a.xp_this_week as number));
    const leagueIdx = LEAGUE_ORDER.indexOf(league);

    sorted.forEach((m, idx) => {
      const rank = idx + 1;
      const promoted  = leagueIdx < LEAGUE_ORDER.length - 1 && rank <= PROMOTE_COUNT;
      const relegated = leagueIdx > 0 && rank > sorted.length - RELEGATE_COUNT;
      updates.push({ id: m.id, rank_in_league: rank, promoted, relegated });
    });
  }

  // Batch update
  await Promise.all(
    updates.map(u =>
      supabase.from("liga_placements")
        .update({ rank_in_league: u.rank_in_league, promoted: u.promoted, relegated: u.relegated })
        .eq("id", u.id)
    )
  );

  return NextResponse.json({ ok: true, processed: updates.length });
}
