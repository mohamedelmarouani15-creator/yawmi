"use client";

import { useMemo } from "react";
import type { PrayerLog } from "@/lib/storage";
import { computePrayerStreak } from "@/lib/prayer";

// Les 5 prières obligatoires (sunrise exclu)
const TRACKED: string[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const PRAYER_SHORT: Record<string, string> = {
  fajr: "F", dhuhr: "D", asr: "A", maghrib: "M", isha: "I",
};

interface Props {
  log: PrayerLog[];
}

export default function PrayerStats({ log }: Props) {
  const now   = useMemo(() => new Date(), []);
  const year  = now.getFullYear();
  const month = now.getMonth();

  // ── Taux de complétion du mois ─────────────────────────────
  const { completed, possible } = useMemo(() => {
    const today = now.getDate();
    let comp = 0;
    let poss = 0;
    for (let d = 1; d <= today; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const entry   = log.find(l => l.date === dateKey);
      poss += TRACKED.length;
      if (entry) {
        comp += TRACKED.filter(k => entry.done[k]).length;
      }
    }
    return { completed: comp, possible: poss };
  }, [log, year, month, now]);

  // ── 7 derniers jours pour le graphe hebdomadaire ──────────
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const isToday = i === 6;
      const entry   = log.find(l => l.date === dateKey);
      return {
        label: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][d.getDay()],
        dateKey,
        isToday,
        prayers: TRACKED.map(k => ({
          key:  k,
          done: !!(entry?.done[k]),
        })),
      };
    });
  }, [log, now]);

  const streak = computePrayerStreak(log);
  const rate   = possible > 0 ? Math.round((completed / possible) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border p-4"
      style={{ background: "#0A0F0D", borderColor: "rgba(212,175,55,0.12)" }}>

      {/* Titre section */}
      <p className="text-xs tracking-widest uppercase opacity-40"
        style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
        Statistiques · 7 derniers jours
      </p>

      {/* ── Graphe hebdomadaire ─────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {last7.map(day => (
          <div key={day.dateKey} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            {day.prayers.map(p => (
              <div
                key={p.key}
                title={p.key}
                className="w-full rounded-sm"
                style={{
                  height: 14,
                  background: day.isToday
                    ? p.done ? "#D4AF37" : "rgba(212,175,55,0.15)"
                    : p.done ? "#055C3F" : "#1a2a1a",
                  border: day.isToday ? "1px solid rgba(212,175,55,0.4)" : "none",
                  transition: "background 0.2s",
                }}
              />
            ))}
            <span className="text-xs opacity-40 truncate w-full text-center"
              style={{ fontSize: 9, color: day.isToday ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {day.label}
            </span>
            {/* Légende initiales */}
            <div className="flex flex-col items-center gap-0.5 mt-0.5">
              {day.prayers.map(p => (
                <span key={p.key} style={{ fontSize: 8, color: "rgba(248,244,236,0.18)", fontFamily: "var(--font-dm-sans)" }}>
                  {PRAYER_SHORT[p.key]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Légende couleurs ────────────────────────────────── */}
      <div className="flex items-center gap-4 text-xs opacity-40"
        style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm" style={{ background: "#055C3F" }} />
          <span>Faite</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm" style={{ background: "#1a2a1a" }} />
          <span>Manquée</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(212,175,55,0.4)", border: "1px solid rgba(212,175,55,0.5)" }} />
          <span>Aujourd&apos;hui</span>
        </div>
      </div>

      {/* ── Métriques résumées ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 pt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Streak */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-2xl font-bold"
            style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
            {streak}
          </p>
          <p className="text-xs opacity-40 text-center"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            jour{streak > 1 ? "s" : ""} de suite
          </p>
        </div>

        {/* Taux mensuel */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-2xl font-bold"
            style={{ color: rate >= 80 ? "#4ade80" : rate >= 50 ? "var(--gold)" : "#f87171", fontFamily: "var(--font-bricolage)" }}>
            {rate}%
          </p>
          <p className="text-xs opacity-40 text-center"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            ce mois
          </p>
        </div>

        {/* Compteur absolu */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-2xl font-bold"
            style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            {completed}
          </p>
          <p className="text-xs opacity-40 text-center"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            / {possible} prières
          </p>
        </div>
      </div>

      {/* Barre de progression mensuelle */}
      <div className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${rate}%`,
            background: rate >= 80
              ? "linear-gradient(90deg,#055C3F,#4ade80)"
              : rate >= 50
              ? "linear-gradient(90deg,#055C3F,#D4AF37)"
              : "linear-gradient(90deg,#3f0505,#f87171)",
          }} />
      </div>
    </div>
  );
}
