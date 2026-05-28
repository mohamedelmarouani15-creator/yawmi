"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

const DHIKRS = [
  { label: "Subhan Allah",      arabic: "سُبْحَانَ اللّهِ",          count: 33 },
  { label: "Alhamdulillah",     arabic: "الْحَمْدُ لِلَّهِ",          count: 33 },
  { label: "Allahu Akbar",      arabic: "اللَّهُ أَكْبَرُ",           count: 34 },
];

export default function DhikrPage() {
  const [current, setCurrent] = useState(0);
  const [taps, setTaps]       = useState(0);

  const dhikr  = DHIKRS[current];
  const target = dhikr.count;
  const done   = taps >= target;

  function tap() {
    if (done) return;
    setTaps((n) => n + 1);
  }

  function next() {
    if (current < DHIKRS.length - 1) {
      setCurrent((n) => n + 1);
      setTaps(0);
    } else {
      setCurrent(0);
      setTaps(0);
    }
  }

  const progress = Math.min(taps / target, 1);

  return (
    <main className="flex flex-col items-center gap-8 px-5 pt-12 pb-4">

      <div className="w-full">
        <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Tasbih
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Dhikr
        </h1>
      </div>

      {/* Sélecteur de dhikr */}
      <div className="flex w-full gap-2">
        {DHIKRS.map((d, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setTaps(0); }}
            className="flex-1 rounded-xl py-2 text-xs font-semibold transition-all"
            style={{
              background: current === i ? "rgba(5,92,63,0.5)" : "rgba(255,255,255,0.04)",
              color: current === i ? "#D4AF37" : "rgba(248,244,236,0.4)",
              border: `1px solid ${current === i ? "rgba(212,175,55,0.3)" : "transparent"}`,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {d.label.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Texte arabe */}
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
            stroke="#D4AF37"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 85}`}
            strokeDashoffset={`${2 * Math.PI * 85 * (1 - progress)}`}
            style={{ transition: "stroke-dashoffset 0.2s ease" }}
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
              ? "0 0 40px rgba(212,175,55,0.4)"
              : "0 0 40px rgba(5,92,63,0.4)",
          }}
        >
          <span
            className="text-5xl font-bold"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}
          >
            {taps}
          </span>
          <span
            className="text-xs opacity-60"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
          >
            / {target}
          </span>
        </button>
      </div>

      {/* Bouton reset / suivant */}
      <div className="flex gap-3">
        <button
          onClick={() => setTaps(0)}
          className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-all active:scale-95"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            color: "rgba(248,244,236,0.5)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          <RotateCcw size={14} /> Réinitialiser
        </button>
        {done && (
          <button
            onClick={next}
            className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #055C3F, #0a8a5e)",
              color: "#F8F4EC",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Suivant →
          </button>
        )}
      </div>
    </main>
  );
}
