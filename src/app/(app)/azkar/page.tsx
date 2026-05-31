"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { AZKAR_MATIN, AZKAR_SOIR, type Zikr } from "@/lib/azkar";
import { storage, todayKey } from "@/lib/storage";
import { pageVariants, itemVariants, springTap } from "@/lib/motion";
import { useZikrAudio, type AudioRate } from "@/hooks/useZikrAudio";

type Session = "matin" | "soir";

const SESSION_KEY = (s: Session) => `azkar_${s}_${todayKey()}`;

export default function AzkarPage() {
  const params = useSearchParams();
  const [session, setSession] = useState<Session>(params.get("session") === "soir" ? "soir" : "matin");
  const [counts,  setCounts]  = useState<Record<string, number>>({});
  const { playingId, rate, setRate, toggle, stop, supported } = useZikrAudio();

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
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(6);
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
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-5 px-5 pt-12 pb-24"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {session === "matin" ? "Après Fajr" : "Après Asr"}
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Azkar
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Toggle matin/soir */}
          <div className="flex items-center gap-1.5 rounded-full border px-1.5 py-1"
            style={{ borderColor: "rgba(212,175,55,0.2)" }}>
            {(["matin", "soir"] as Session[]).map(s => (
              <motion.button
                key={s}
                onClick={() => { stop(); setSession(s); }}
                whileTap={{ scale: 0.93 }}
                transition={springTap}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: session === s ? "rgba(5,92,63,0.5)" : "transparent",
                  color: session === s ? "#D4AF37" : "rgba(248,244,236,0.4)",
                  border: session === s ? "1px solid rgba(212,175,55,0.3)" : "1px solid transparent",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {s === "matin"
                  ? <><Sun size={11} /> Matin</>
                  : <><Moon size={11} /> Soir</>
                }
              </motion.button>
            ))}
          </div>
          {/* Vitesse de lecture */}
          {supported && (
            <div className="flex items-center gap-1">
              <Volume2 size={10} style={{ color: "rgba(212,175,55,0.4)" }} />
              {([0.55, 0.75, 1.0] as AudioRate[]).map(r => (
                <button key={r}
                  onClick={() => setRate(r)}
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{
                    background: rate === r ? "rgba(212,175,55,0.15)" : "transparent",
                    color: rate === r ? "#D4AF37" : "rgba(248,244,236,0.3)",
                    border: rate === r ? "1px solid rgba(212,175,55,0.3)" : "1px solid transparent",
                    fontFamily: "var(--font-dm-sans)",
                  }}>
                  {r === 0.55 ? "Lent" : r === 0.75 ? "Moyen" : "Normal"}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Progression */}
      <motion.div variants={itemVariants}>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {totalDone}/{azkar.length} dhikrs complétés
          </p>
          <AnimatePresence>
            {totalDone === azkar.length && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold"
                style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
              >
                ✦ Session complète
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${(totalDone / azkar.length) * 100}%` }}
            transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.5 }}
            style={{ background: "linear-gradient(to right,#055C3F,#D4AF37)" }}
          />
        </div>
      </motion.div>

      {/* Liste */}
      <AnimatePresence mode="wait">
        <motion.div
          key={session}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.25 }}
          className="flex flex-col gap-4"
        >
          {azkar.map((zikr, idx) => {
            const current = counts[zikr.id] ?? 0;
            const done    = current >= zikr.count;
            const pct     = Math.min((current / zikr.count) * 100, 100);

            return (
              <motion.div
                key={zikr.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.35, delay: idx * 0.04 }}
                className="flex flex-col gap-3 rounded-2xl border p-4"
                style={{
                  background: done ? "rgba(5,92,63,0.15)" : "rgba(255,255,255,0.02)",
                  borderColor: done ? "rgba(212,175,55,0.25)" : "rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {zikr.source}
                </p>
                <p className="text-right text-lg leading-loose font-medium"
                  style={{ color: done ? "rgba(248,244,236,0.4)" : "#F8F4EC", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
                  {zikr.ar}
                </p>
                <p className="text-xs leading-relaxed opacity-40 italic"
                  style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                  {zikr.transliteration}
                </p>
                <p className="text-xs leading-relaxed opacity-50"
                  style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {zikr.fr}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${pct}%` }}
                      transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.2 }}
                      style={{ background: done ? "#D4AF37" : "#055C3F" }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Bouton audio */}
                    {supported && (
                      <motion.button
                        onClick={() => toggle(zikr.id, zikr.ar)}
                        whileTap={{ scale: 0.85 }} transition={springTap}
                        className="relative flex h-7 w-7 items-center justify-center rounded-full border"
                        style={{
                          borderColor: playingId === zikr.id ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.1)",
                          background: playingId === zikr.id ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.03)",
                          color: playingId === zikr.id ? "#D4AF37" : "rgba(248,244,236,0.35)",
                        }}>
                        {playingId === zikr.id ? (
                          <>
                            <motion.span
                              className="absolute inset-0 rounded-full"
                              animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              style={{ background: "rgba(212,175,55,0.25)" }}
                            />
                            <VolumeX size={12} />
                          </>
                        ) : (
                          <Volume2 size={12} />
                        )}
                      </motion.button>
                    )}
                    {!done && (
                      <motion.button
                        onClick={() => reset(zikr.id)}
                        whileTap={{ scale: 0.85 }}
                        className="opacity-30"
                        style={{ color: "#F8F4EC" }}
                      >
                        <RotateCcw size={12} />
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => tap(zikr)}
                      disabled={done}
                      whileTap={done ? {} : { scale: 0.93 }}
                      transition={springTap}
                      className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
                      style={{
                        background: done ? "rgba(212,175,55,0.15)" : "linear-gradient(135deg,#055C3F,#0a8a5e)",
                        color: done ? "#D4AF37" : "#F8F4EC",
                        fontFamily: "var(--font-dm-sans)",
                        minWidth: 80,
                        justifyContent: "center",
                      }}
                    >
                      {done ? "✦ Fait" : `${current}/${zikr.count}`}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.main>
  );
}
