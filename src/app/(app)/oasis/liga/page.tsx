"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { gameStorage } from "@/lib/game/game-storage";
import { springTap } from "@/lib/motion";

// ── Types ─────────────────────────────────────────────────────────

type LeagueType = "bronze" | "silver" | "gold" | "diamond";

interface LigaSeason {
  id: string;
  week_start: string;
  week_end: string;
}

interface LigaPlacement {
  id: string;
  user_id: string;
  season_id: string;
  league: LeagueType;
  xp_this_week: number;
  rank_in_league: number | null;
  promoted: boolean;
  relegated: boolean;
}

interface LeaderboardEntry extends LigaPlacement {
  display_name: string | null;
  rank: number;
}

// ── Helpers ───────────────────────────────────────────────────────

const LEAGUE_META: Record<LeagueType, { label: string; icon: string; color: string; borderColor: string }> = {
  bronze:  { label: "Bronze",  icon: "🥉", color: "#CD7F32", borderColor: "rgba(205,127,50,0.35)"  },
  silver:  { label: "Argent",  icon: "🥈", color: "#C0C0C0", borderColor: "rgba(192,192,192,0.35)" },
  gold:    { label: "Or",      icon: "🥇", color: "#D4AF37", borderColor: "rgba(212,175,55,0.45)"  },
  diamond: { label: "Diamant", icon: "💎", color: "#60a5fa", borderColor: "rgba(96,165,250,0.45)"  },
};

/** Monday of the week containing `date` (ISO date string YYYY-MM-DD) */
function getMondayOf(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function getSundayOf(monday: string): string {
  const d = new Date(monday);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

/** Format YYYY-MM-DD → "2 juin" */
function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });
}

// ── Component ─────────────────────────────────────────────────────

export default function LigaPage() {
  const router = useRouter();

  const [loading,      setLoading]      = useState(true);
  const [myUserId,     setMyUserId]     = useState<string | null>(null);
  const [season,       setSeason]       = useState<LigaSeason | null>(null);
  const [myPlacement,  setMyPlacement]  = useState<LigaPlacement | null>(null);
  const [leaderboard,  setLeaderboard]  = useState<LeaderboardEntry[]>([]);
  const [error,        setError]        = useState<string | null>(null);

  const localState = gameStorage.get();

  // ── Ensure season + placement exist ───────────────────────────

  const ensureSeasonAndPlacement = useCallback(async (userId: string): Promise<{
    season: LigaSeason;
    placement: LigaPlacement;
  } | null> => {
    const weekStart = getMondayOf(new Date());
    const weekEnd   = getSundayOf(weekStart);

    // Upsert season
    const { data: seasonData, error: seasonErr } = await supabase
      .from("liga_seasons")
      .upsert({ week_start: weekStart, week_end: weekEnd }, { onConflict: "week_start" })
      .select("id, week_start, week_end")
      .single();

    if (seasonErr || !seasonData) {
      // If upsert failed (e.g. RLS), try select
      const { data: existing } = await supabase
        .from("liga_seasons")
        .select("id, week_start, week_end")
        .eq("week_start", weekStart)
        .single();
      if (!existing) return null;
      return ensurePlacement(userId, existing as LigaSeason);
    }

    return ensurePlacement(userId, seasonData as LigaSeason);
  }, []); // eslint-disable-line

  async function ensurePlacement(userId: string, s: LigaSeason): Promise<{
    season: LigaSeason;
    placement: LigaPlacement;
  } | null> {
    // Get current XP from player_progress for initial xp_this_week estimate
    const { data: progressRow } = await supabase
      .from("player_progress")
      .select("xp")
      .eq("user_id", userId)
      .maybeSingle();

    const currentXP = (progressRow?.xp as number) ?? 0;

    // Determine league from XP
    const league: LeagueType =
      currentXP >= 5000 ? "diamond" :
      currentXP >= 1500 ? "gold" :
      currentXP >= 400  ? "silver" :
      "bronze";

    const { data: placed, error: placedErr } = await supabase
      .from("liga_placements")
      .upsert(
        { user_id: userId, season_id: s.id, league, xp_this_week: 0 },
        { onConflict: "user_id,season_id", ignoreDuplicates: true }
      )
      .select()
      .single();

    if (placedErr || !placed) {
      // Row already exists — just select it
      const { data: existing } = await supabase
        .from("liga_placements")
        .select("id, user_id, season_id, league, xp_this_week, rank_in_league, promoted, relegated")
        .eq("user_id", userId)
        .eq("season_id", s.id)
        .single();
      if (!existing) return null;
      return { season: s, placement: existing as LigaPlacement };
    }

    return { season: s, placement: placed as LigaPlacement };
  }

  // ── Load leaderboard ───────────────────────────────────────────

  const loadLeaderboard = useCallback(async (s: LigaSeason, myUid: string, myLeague: LeagueType) => {
    // Top 30 in same league this week
    const { data: rows } = await supabase
      .from("liga_placements")
      .select("id, user_id, season_id, league, xp_this_week, rank_in_league, promoted, relegated")
      .eq("season_id", s.id)
      .eq("league", myLeague)
      .order("xp_this_week", { ascending: false })
      .limit(30);

    if (!rows) return;

    const userIds = rows.map(r => r.user_id as string);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    const nameMap = new Map(
      (profiles ?? []).map(p => [p.id as string, p.display_name as string | null])
    );

    const entries: LeaderboardEntry[] = rows.map((r, i) => ({
      id:             r.id as string,
      user_id:        r.user_id as string,
      season_id:      r.season_id as string,
      league:         r.league as LeagueType,
      xp_this_week:   r.xp_this_week as number,
      rank_in_league: r.rank_in_league as number | null,
      promoted:       r.promoted as boolean,
      relegated:      r.relegated as boolean,
      display_name:   nameMap.get(r.user_id as string) ?? null,
      rank:           i + 1,
    }));

    setLeaderboard(entries);

    // Also refresh my placement
    const myRow = entries.find(e => e.user_id === myUid);
    if (myRow) setMyPlacement(myRow);
  }, []);

  // ── Bootstrap ──────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!user) {
        setError("Connexion requise pour accéder à la Liga.");
        setLoading(false);
        return;
      }

      setMyUserId(user.id);

      const result = await ensureSeasonAndPlacement(user.id);
      if (!mounted) return;

      if (!result) {
        setError("Impossible de charger la saison. Réessaie plus tard.");
        setLoading(false);
        return;
      }

      setSeason(result.season);
      setMyPlacement(result.placement);
      await loadLeaderboard(result.season, user.id, result.placement.league);

      if (mounted) setLoading(false);
    }

    init();
    return () => { mounted = false; };
  }, [ensureSeasonAndPlacement, loadLeaderboard]);

  // ── Derived ────────────────────────────────────────────────────

  const meta = myPlacement ? LEAGUE_META[myPlacement.league] : null;
  const myRank = leaderboard.findIndex(e => e.user_id === myUserId) + 1;
  const totalInLeague = leaderboard.length;
  const isPromotionZone = myRank >= 1 && myRank <= 5;
  const isRelegationZone = totalInLeague >= 5 && myRank > totalInLeague - 5;

  // ── Render ─────────────────────────────────────────────────────

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col px-5 pt-12 pb-10 gap-5 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          onClick={() => router.back()}
          whileTap={{ scale: 0.9 }}
          transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}
        >
          <ArrowLeft size={15} />
        </motion.button>
        <div className="flex items-center gap-2">
          <Trophy size={18} style={{ color: "#D4AF37" }} />
          <h1
            className="text-lg font-black"
            style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}
          >
            Liga hebdomadaire
          </h1>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: "#D4AF37" }} />
        </div>
      )}

      {error && (
        <div
          className="rounded-2xl border p-4 text-center"
          style={{ background: "rgba(248,113,113,0.07)", borderColor: "rgba(248,113,113,0.25)" }}
        >
          <p className="text-sm" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>
            {error}
          </p>
        </div>
      )}

      {!loading && !error && season && myPlacement && meta && (
        <>
          {/* Season badge */}
          <div
            className="rounded-2xl border px-4 py-3 flex items-center justify-between"
            style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.15)" }}
          >
            <div>
              <p
                className="text-[9px] uppercase tracking-widest opacity-40"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
              >
                Semaine en cours
              </p>
              <p
                className="text-sm font-black mt-0.5"
                style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}
              >
                {fmtDate(season.week_start)} → {fmtDate(season.week_end)}
              </p>
            </div>
            <div className="text-2xl">{meta.icon}</div>
          </div>

          {/* My league card */}
          <div
            className="rounded-3xl border p-5"
            style={{
              background: `${meta.color}0d`,
              borderColor: meta.borderColor,
            }}
          >
            <p
              className="text-[9px] uppercase tracking-widest opacity-40 mb-1"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
            >
              Ma ligue
            </p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{meta.icon}</span>
              <div>
                <p
                  className="text-xl font-black leading-none"
                  style={{ color: meta.color, fontFamily: "var(--font-bricolage)" }}
                >
                  {meta.label}
                </p>
                <p
                  className="text-sm font-bold mt-1"
                  style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}
                >
                  {myPlacement.xp_this_week} XP cette semaine
                </p>
              </div>
              <div className="ml-auto text-right">
                <p
                  className="text-2xl font-black"
                  style={{ color: meta.color, fontFamily: "var(--font-bricolage)" }}
                >
                  #{myRank || "—"}
                </p>
                <p
                  className="text-[9px] opacity-40"
                  style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
                >
                  sur {totalInLeague}
                </p>
              </div>
            </div>

            {/* Promotion / relegation indicator */}
            <AnimatePresence>
              {isPromotionZone && myPlacement.league !== "diamond" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)" }}
                >
                  <TrendingUp size={14} style={{ color: "#4ade80" }} />
                  <p
                    className="text-[10px] font-semibold"
                    style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}
                  >
                    Zone de montée — Top 5 passent en ligue supérieure dimanche
                  </p>
                </motion.div>
              )}
              {isRelegationZone && myPlacement.league !== "bronze" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)" }}
                >
                  <TrendingDown size={14} style={{ color: "#f87171" }} />
                  <p
                    className="text-[10px] font-semibold"
                    style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}
                  >
                    Zone de descente — Gagne du XP pour rester dans ta ligue
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rules summary */}
          <div
            className="rounded-2xl border px-4 py-3 flex gap-4"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="flex-1 text-center border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-black" style={{ color: "#4ade80", fontFamily: "var(--font-bricolage)" }}>
                Top 5
              </p>
              <p className="text-[9px] opacity-40 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                montée de ligue
              </p>
            </div>
            <div className="flex-1 text-center border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-black" style={{ color: "#f87171", fontFamily: "var(--font-bricolage)" }}>
                Bottom 5
              </p>
              <p className="text-[9px] opacity-40 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                descente de ligue
              </p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs font-black" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
                XP quiz
              </p>
              <p className="text-[9px] opacity-40 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                comptabilisé live
              </p>
            </div>
          </div>

          {/* Leaderboard */}
          <div
            className="rounded-3xl border p-4"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[9px] uppercase tracking-widest opacity-40"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
              >
                Classement {meta.label} — semaine
              </p>
              <span className="text-base">{meta.icon}</span>
            </div>

            {leaderboard.length === 0 ? (
              <p
                className="text-xs opacity-40 text-center py-6"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
              >
                Aucun joueur pour le moment. Fais un quiz pour apparaître !
              </p>
            ) : (
              leaderboard.map((entry, i) => {
                const isMe = entry.user_id === myUserId;
                const isTop5 = i < 5;
                const isBottom5 = i >= leaderboard.length - 5 && leaderboard.length >= 10;
                const medals = ["🥇", "🥈", "🥉"];
                const medal = medals[i] ?? null;
                const name = entry.display_name ?? `Joueur ${entry.user_id.slice(0, 4).toUpperCase()}`;

                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 py-2.5 border-b last:border-0"
                    style={{
                      borderColor: "rgba(255,255,255,0.06)",
                      background: isMe ? "rgba(212,175,55,0.05)" : "transparent",
                      borderRadius: isMe ? "12px" : undefined,
                      marginLeft: isMe ? "-8px" : undefined,
                      marginRight: isMe ? "-8px" : undefined,
                      paddingLeft: isMe ? "8px" : undefined,
                      paddingRight: isMe ? "8px" : undefined,
                    }}
                  >
                    {/* Rank */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                      style={{
                        background: isMe
                          ? "rgba(212,175,55,0.18)"
                          : isTop5
                          ? "rgba(74,222,128,0.1)"
                          : isBottom5
                          ? "rgba(248,113,113,0.08)"
                          : "rgba(255,255,255,0.05)",
                        color: isMe
                          ? "#D4AF37"
                          : isTop5
                          ? "#4ade80"
                          : isBottom5
                          ? "#f87171"
                          : "rgba(248,244,236,0.4)",
                        fontFamily: "var(--font-bricolage)",
                      }}
                    >
                      {medal ?? (i + 1)}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-bold truncate"
                        style={{
                          color: isMe ? "#D4AF37" : "rgba(248,244,236,0.75)",
                          fontFamily: "var(--font-bricolage)",
                        }}
                      >
                        {name}{isMe ? " (toi)" : ""}
                      </p>
                    </div>

                    {/* Zone indicator */}
                    {isTop5 && myPlacement?.league !== "diamond" && (
                      <TrendingUp size={11} style={{ color: "#4ade80", opacity: 0.7, flexShrink: 0 }} />
                    )}
                    {isBottom5 && !isTop5 && myPlacement?.league !== "bronze" && (
                      <TrendingDown size={11} style={{ color: "#f87171", opacity: 0.7, flexShrink: 0 }} />
                    )}
                    {!isTop5 && !isBottom5 && (
                      <Minus size={11} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                    )}

                    {/* XP */}
                    <span
                      className="text-xs font-black ml-1"
                      style={{
                        color: isMe ? "#D4AF37" : "rgba(248,244,236,0.5)",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {entry.xp_this_week} XP
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Personal XP this week vs local state */}
          <div
            className="rounded-2xl border px-4 py-3"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <p
              className="text-[9px] uppercase tracking-widest opacity-40 mb-1"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
            >
              XP total (tous temps)
            </p>
            <p
              className="text-lg font-black"
              style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}
            >
              {(localState.xp ?? 0).toLocaleString()} XP · Niv. {localState.level ?? 1}
            </p>
            <p
              className="text-[10px] opacity-40 mt-0.5"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
            >
              Fais des quiz pour gagner du XP hebdomadaire et monter de ligue
            </p>
          </div>
        </>
      )}
    </motion.main>
  );
}
