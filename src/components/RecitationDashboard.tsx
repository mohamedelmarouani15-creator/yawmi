"use client";

// ── RecitationDashboard ──────────────────────────────────────────
// Displays 4 motivating metrics drawn from the quran_recitation
// table. Shown above the surah list on the Coran home view.
// Only renders when the user has at least 1 recorded session.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { itemVariants, pageVariants } from "@/lib/motion";

// ── Types ────────────────────────────────────────────────────────

interface DashboardData {
  masteredAyahs: number;   // total ayahs with mastered = true
  dueToday: number;        // ayahs due for SM-2 review
  avgScore: number;        // mean best_score across all records
  activeSurahs: number;    // distinct surahs with at least 1 record
  streakDays: number;      // consecutive days with a session (approx.)
}

// ── Animated counter ─────────────────────────────────────────────

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let start: number | null = null;
    const duration = 900; // ms

    function step(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [target]);

  const display = target === 0 ? 0 : animated;

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

// ── Individual stat card ─────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  accent: string;         // CSS color string
  subLabel?: string;
}

function StatCard({ icon, label, value, suffix, accent, subLabel }: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col gap-2 rounded-2xl p-4 min-w-0"
      style={{
        background: `${accent}0d`,            // ~5% opacity fill
        border: `1px solid ${accent}2a`,      // ~16% opacity border
        flex: "1 1 0",
      }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-xl"
        style={{ background: `${accent}1a` }} // ~10% opacity icon bg
      >
        {icon}
      </div>
      <p
        className="text-2xl font-bold tabular-nums leading-none"
        style={{ color: accent, fontFamily: "var(--font-dm-sans)" }}
      >
        <AnimatedNumber target={value} suffix={suffix} />
      </p>
      <div>
        <p
          className="text-xs font-semibold leading-snug"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)", opacity: 0.85 }}
        >
          {label}
        </p>
        {subLabel && (
          <p
            className="text-[10px] leading-snug mt-0.5"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)", opacity: 0.4 }}
          >
            {subLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Review nudge banner ──────────────────────────────────────────

function ReviewNudge({ count, onScrollToList }: { count: number; onScrollToList?: () => void }) {
  if (count === 0) return null;
  return (
    <motion.button
      variants={itemVariants}
      onClick={onScrollToList}
      className="flex w-full items-center justify-between rounded-2xl px-4 py-3"
      style={{
        background: "rgba(240,165,0,0.08)",
        border: "1px solid rgba(240,165,0,0.22)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        {/* Pulsing dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ background: "#F0A500" }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ background: "#F0A500" }}
          />
        </span>
        <p
          className="text-sm font-semibold"
          style={{ color: "#F0A500", fontFamily: "var(--font-dm-sans)" }}
        >
          {count} verset{count > 1 ? "s" : ""} à réviser aujourd&apos;hui
        </p>
      </div>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F0A500"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.7 }}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </motion.button>
  );
}

// ── Main component ───────────────────────────────────────────────

interface RecitationDashboardProps {
  /** Called when the user taps the "review" nudge — parent can scroll to list */
  onScrollToList?: () => void;
}

export default function RecitationDashboard({ onScrollToList }: RecitationDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) { setLoading(false); return; }

      const today = new Date().toISOString().split("T")[0];

      const { data: rows } = await supabase
        .from("quran_recitation")
        .select("surah, mastered, next_due, best_score, last_seen_at")
        .eq("user_id", session.user.id);

      if (!rows || rows.length === 0) { setLoading(false); return; }

      // Mastered
      const masteredAyahs = rows.filter((r) => r.mastered).length;

      // Due today
      const dueToday = rows.filter(
        (r) => !r.mastered && r.next_due && r.next_due <= today,
      ).length;

      // Avg best_score (rounded)
      const scored = rows.filter((r) => r.best_score != null);
      const avgScore =
        scored.length > 0
          ? Math.round(scored.reduce((s, r) => s + r.best_score, 0) / scored.length)
          : 0;

      // Active surahs
      const activeSurahs = new Set(rows.map((r) => r.surah)).size;

      // Streak — count distinct calendar days in last_seen_at going backwards
      const days = [
        ...new Set(
          rows
            .filter((r) => r.last_seen_at)
            .map((r) => r.last_seen_at.split("T")[0]),
        ),
      ].sort((a, b) => (a > b ? -1 : 1)); // descending

      let streakDays = 0;
      let cursor = today;
      for (const day of days) {
        if (day === cursor) {
          streakDays++;
          // Step back one day
          const d = new Date(cursor);
          d.setDate(d.getDate() - 1);
          cursor = d.toISOString().split("T")[0];
        } else if (day < cursor) {
          break;
        }
      }

      setData({ masteredAyahs, dueToday, avgScore, activeSurahs, streakDays });
      setLoading(false);
    }

    load();
  }, []);

  // Nothing to show yet
  if (loading || !data || (data.masteredAyahs === 0 && data.avgScore === 0)) {
    return null;
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-3"
      aria-label="Statistiques de récitation"
    >
      {/* Section heading */}
      <motion.p
        variants={itemVariants}
        className="text-xs font-semibold uppercase tracking-widest"
        style={{
          color: "var(--text)",
          fontFamily: "var(--font-dm-sans)",
          opacity: 0.4,
        }}
      >
        Votre progression
      </motion.p>

      {/* 4 metric cards — 2 × 2 grid on mobile */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          }
          label="Versets maîtrisés"
          value={data.masteredAyahs}
          accent="#D4AF37"
          subLabel="score ≥ 85%"
        />

        <StatCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#055C3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          }
          label="Sourates actives"
          value={data.activeSurahs}
          accent="#4AADAD"
          subLabel="récitées au moins une fois"
        />

        <StatCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          }
          label="Score moyen"
          value={data.avgScore}
          suffix="%"
          accent="#22c55e"
          subLabel="meilleur score par verset"
        />

        <StatCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
          }
          label={`Série${data.streakDays > 1 ? "" : ""}`}
          value={data.streakDays}
          suffix={data.streakDays === 1 ? " jour" : " jours"}
          accent="#f97316"
          subLabel="jours consécutifs"
        />
      </div>

      {/* Review nudge */}
      <ReviewNudge count={data.dueToday} onScrollToList={onScrollToList} />
    </motion.section>
  );
}
