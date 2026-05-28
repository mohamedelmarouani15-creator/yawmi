"use client";

import { useState, useEffect, useCallback } from "react";
import { AZKAR_MATIN, AZKAR_SOIR, type Zikr } from "@/lib/azkar";
import { storage, todayKey } from "@/lib/storage";
import { RotateCcw } from "lucide-react";

type Session = "matin" | "soir";

const SESSION_KEY = (s: Session) => `azkar_${s}_${todayKey()}`;

export default function AzkarPage() {
  const [session, setSession] = useState<Session>("matin");
  const [counts,  setCounts]  = useState<Record<string, number>>({});

  const azkar = session === "matin" ? AZKAR_MATIN : AZKAR_SOIR;

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY(session));
    setCounts(saved ? JSON.parse(saved) : {});
  }, [session]);

  const tap = useCallback((zikr: Zikr) => {
    setCounts(prev => {
      const current = prev[zikr.id] ?? 0;
      if (current >= zikr.count) return prev;
      const next = { ...prev, [zikr.id]: current + 1 };
      localStorage.setItem(SESSION_KEY(session), JSON.stringify(next));
      return next;
    });
  }, [session]);

  const reset = useCallback((id: string) => {
    setCounts(prev => {
      const next = { ...prev, [id]: 0 };
      localStorage.setItem(SESSION_KEY(session), JSON.stringify(next));
      return next;
    });
  }, [session]);

  const totalDone = azkar.filter(z => (counts[z.id] ?? 0) >= z.count).length;

  return (
    <main className="flex flex-col gap-5 px-5 pt-12 pb-24">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {session === "matin" ? "Après Fajr" : "Après Asr"}
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Azkar
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border px-1.5 py-1"
          style={{ borderColor: "rgba(212,175,55,0.2)" }}>
          {(["matin", "soir"] as Session[]).map(s => (
            <button key={s} onClick={() => setSession(s)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: session === s ? "rgba(5,92,63,0.5)" : "transparent",
                color: session === s ? "#D4AF37" : "rgba(248,244,236,0.4)",
                border: session === s ? "1px solid rgba(212,175,55,0.3)" : "1px solid transparent",
                fontFamily: "var(--font-dm-sans)",
              }}>
              {s === "matin" ? "🌅 Matin" : "🌙 Soir"}
            </button>
          ))}
        </div>
      </div>

      {/* Progression */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {totalDone}/{azkar.length} dhikrs complétés
          </p>
          {totalDone === azkar.length && (
            <p className="text-xs font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
              ✦ Session complète
            </p>
          )}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(totalDone / azkar.length) * 100}%`, background: "linear-gradient(to right,#055C3F,#D4AF37)" }} />
        </div>
      </div>

      {/* Liste */}
      {azkar.map((zikr) => {
        const current = counts[zikr.id] ?? 0;
        const done    = current >= zikr.count;
        const pct     = Math.min((current / zikr.count) * 100, 100);

        return (
          <div key={zikr.id}
            className="flex flex-col gap-3 rounded-2xl border p-4 transition-all"
            style={{
              background: done ? "rgba(5,92,63,0.15)" : "rgba(255,255,255,0.02)",
              borderColor: done ? "rgba(212,175,55,0.25)" : "rgba(255,255,255,0.06)",
            }}>

            {/* Source */}
            <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              {zikr.source}
            </p>

            {/* Texte arabe */}
            <p className="text-right text-lg leading-loose font-medium"
              style={{ color: done ? "rgba(248,244,236,0.5)" : "#F8F4EC", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
              {zikr.ar}
            </p>

            {/* Traduction */}
            <p className="text-xs leading-relaxed opacity-50"
              style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              {zikr.fr}
            </p>

            {/* Compteur + bouton */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${pct}%`, background: done ? "#D4AF37" : "#055C3F" }} />
              </div>
              <div className="flex items-center gap-2">
                {!done && (
                  <button onClick={() => reset(zikr.id)}
                    className="opacity-30 hover:opacity-60"
                    style={{ color: "#F8F4EC" }}>
                    <RotateCcw size={12} />
                  </button>
                )}
                <button
                  onClick={() => tap(zikr)}
                  disabled={done}
                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-40"
                  style={{
                    background: done ? "rgba(212,175,55,0.15)" : "linear-gradient(135deg,#055C3F,#0a8a5e)",
                    color: done ? "#D4AF37" : "#F8F4EC",
                    fontFamily: "var(--font-dm-sans)",
                    minWidth: 80,
                    justifyContent: "center",
                  }}>
                  {done ? "✓ Fait" : `${current}/${zikr.count}`}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </main>
  );
}
