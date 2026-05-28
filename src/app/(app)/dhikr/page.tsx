"use client";

import { useState, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { storage, todayKey } from "@/lib/storage";

const DHIKRS = [
  { id: "subhan",  label: "Subhan Allah",   arabic: "سُبْحَانَ اللّهِ",        target: 33 },
  { id: "hamdou",  label: "Alhamdulillah",  arabic: "الْحَمْدُ لِلَّهِ",        target: 33 },
  { id: "akbar",   label: "Allahu Akbar",   arabic: "اللَّهُ أَكْبَرُ",         target: 34 },
];

function loadCounts(): Record<string, number> {
  const log = storage.getDhikrLog();
  const today = log.find(s => s.date === todayKey());
  return today?.counts ?? {};
}

function saveCounts(counts: Record<string, number>) {
  const log = storage.getDhikrLog().filter(s => s.date !== todayKey());
  storage.saveDhikrLog([...log, { date: todayKey(), counts }]);
}

function getStreak(): number {
  const log = storage.getDhikrLog();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const session = log.find(s => s.date === key);
    const allDone = DHIKRS.every(dh => (session?.counts[dh.id] ?? 0) >= dh.target);
    if (allDone) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export default function DhikrPage() {
  const [current, setCurrent] = useState(0);
  const [counts,  setCounts]  = useState<Record<string, number>>({});
  const [streak,  setStreak]  = useState(0);

  useEffect(() => {
    setCounts(loadCounts());
    setStreak(getStreak());
  }, []);

  const dhikr  = DHIKRS[current];
  const taps   = counts[dhikr.id] ?? 0;
  const done   = taps >= dhikr.target;
  const allDone = DHIKRS.every(d => (counts[d.id] ?? 0) >= d.target);

  const tap = useCallback(() => {
    if (done) return;
    const next = { ...counts, [dhikr.id]: taps + 1 };
    setCounts(next);
    saveCounts(next);
    if (taps + 1 >= dhikr.target) setStreak(getStreak());
  }, [counts, dhikr.id, taps, done]);

  const reset = useCallback(() => {
    const next = { ...counts, [dhikr.id]: 0 };
    setCounts(next);
    saveCounts(next);
  }, [counts, dhikr.id]);

  const goNext = useCallback(() => {
    if (current < DHIKRS.length - 1) setCurrent(c => c + 1);
    else { setCurrent(0); }
  }, [current]);

  const progress = Math.min(taps / dhikr.target, 1);

  return (
    <main className="flex flex-col items-center gap-6 px-5 pt-12 pb-4">

      <div className="flex w-full items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Tasbih
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Dhikr
          </h1>
        </div>
        {streak > 0 && (
          <div
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
          >
            🔥 {streak} jour{streak > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Sélecteur */}
      <div className="flex w-full gap-2">
        {DHIKRS.map((d, i) => {
          const done = (counts[d.id] ?? 0) >= d.target;
          return (
            <button
              key={d.id}
              onClick={() => setCurrent(i)}
              className="flex-1 rounded-xl py-2 text-xs font-semibold transition-all"
              style={{
                background: current === i ? "rgba(5,92,63,0.5)" : done ? "rgba(5,92,63,0.15)" : "rgba(255,255,255,0.04)",
                color: current === i ? "#D4AF37" : done ? "rgba(5,92,63,0.8)" : "rgba(248,244,236,0.4)",
                border: `1px solid ${current === i ? "rgba(212,175,55,0.3)" : "transparent"}`,
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {done ? "✓" : d.label.split(" ")[0]}
            </button>
          );
        })}
      </div>

      {/* Arabe */}
      <p
        className="text-center text-3xl font-bold leading-relaxed"
        style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)", direction: "rtl" }}
      >
        {dhikr.arabic}
      </p>

      {/* Compteur circulaire */}
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="-rotate-90">
          <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r="85"
            fill="none"
            stroke={done ? "#D4AF37" : "#055C3F"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 85}`}
            strokeDashoffset={`${2 * Math.PI * 85 * (1 - progress)}`}
            style={{ transition: "stroke-dashoffset 0.15s ease" }}
          />
        </svg>
        <button
          onClick={tap}
          className="absolute flex flex-col items-center justify-center rounded-full transition-all duration-150 active:scale-95"
          style={{
            width: 140, height: 140,
            background: done
              ? "linear-gradient(135deg, #D4AF37, #b8942e)"
              : "linear-gradient(135deg, #055C3F, #0a8a5e)",
            boxShadow: done
              ? "0 0 40px rgba(212,175,55,0.35)"
              : "0 0 40px rgba(5,92,63,0.4)",
          }}
        >
          <span className="text-5xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {taps}
          </span>
          <span className="text-xs opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            / {dhikr.target}
          </span>
        </button>
      </div>

      {/* Boutons */}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-all active:scale-95"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}
        >
          <RotateCcw size={14} /> Réinitialiser
        </button>
        {done && current < DHIKRS.length - 1 && (
          <button
            onClick={goNext}
            className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #055C3F, #0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
          >
            Suivant →
          </button>
        )}
      </div>

      {allDone && (
        <p className="text-center text-sm opacity-60" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
          ✦ Tasbih du jour complété — barakAllahu fik
        </p>
      )}
    </main>
  );
}
