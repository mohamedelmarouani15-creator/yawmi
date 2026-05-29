"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { storage, todayKey } from "@/lib/storage";
import { pageVariants, itemVariants, springTap } from "@/lib/motion";

const DHIKRS = [
  { id: "subhan",  label: "Subhan Allah",   arabic: "سُبْحَانَ اللّهِ",   target: 33 },
  { id: "hamdou",  label: "Alhamdulillah",  arabic: "الْحَمْدُ لِلَّهِ",  target: 33 },
  { id: "akbar",   label: "Allahu Akbar",   arabic: "اللَّهُ أَكْبَرُ",   target: 34 },
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
  const [current,   setCurrent]   = useState(0);
  const [counts,    setCounts]    = useState<Record<string, number>>({});
  const [streak,    setStreak]    = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    setCounts(loadCounts());
    setStreak(getStreak());
  }, []);

  const dhikr  = DHIKRS[current];
  const taps   = counts[dhikr.id] ?? 0;
  const done   = taps >= dhikr.target;
  const allDone = DHIKRS.every(d => (counts[d.id] ?? 0) >= d.target);
  const progress = Math.min(taps / dhikr.target, 1);

  const tap = useCallback(() => {
    if (done) return;
    const nextCount = taps + 1;
    const next = { ...counts, [dhikr.id]: nextCount };
    setCounts(next);
    saveCounts(next);

    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);

    if (nextCount >= dhikr.target) {
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 20, 80, 20, 160]);
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 900);
      setStreak(getStreak());
    }
  }, [counts, dhikr.id, taps, done, dhikr.target]);

  const reset = useCallback(() => {
    const next = { ...counts, [dhikr.id]: 0 };
    setCounts(next);
    saveCounts(next);
  }, [counts, dhikr.id]);

  const goNext = useCallback(() => {
    if (current < DHIKRS.length - 1) setCurrent(c => c + 1);
    else setCurrent(0);
  }, [current]);

  const circumference = 2 * Math.PI * 85;

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center gap-6 px-5 pt-12 pb-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex w-full items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Tasbih
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Dhikr
          </h1>
        </div>
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
          >
            ✦ {streak} jour{streak > 1 ? "s" : ""}
          </motion.div>
        )}
      </motion.div>

      {/* Sélecteur */}
      <motion.div variants={itemVariants} className="flex w-full gap-2">
        {DHIKRS.map((d, i) => {
          const isDone = (counts[d.id] ?? 0) >= d.target;
          const isActive = current === i;
          return (
            <motion.button
              key={d.id}
              onClick={() => setCurrent(i)}
              whileTap={{ scale: 0.94 }}
              transition={springTap}
              className="flex-1 rounded-xl py-2 text-xs font-semibold"
              style={{
                background: isActive ? "rgba(5,92,63,0.5)" : isDone ? "rgba(5,92,63,0.15)" : "rgba(255,255,255,0.04)",
                color: isActive ? "#D4AF37" : isDone ? "#4ade80" : "rgba(248,244,236,0.4)",
                border: `1px solid ${isActive ? "rgba(212,175,55,0.3)" : "transparent"}`,
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {isDone ? <Check size={14} className="mx-auto" /> : d.label.split(" ")[0]}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Texte arabe */}
      <motion.p
        key={dhikr.id}
        variants={itemVariants}
        className="text-center text-3xl font-bold leading-relaxed"
        style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)", direction: "rtl" }}
      >
        {dhikr.arabic}
      </motion.p>

      {/* Compteur circulaire + bouton */}
      <motion.div variants={itemVariants} className="relative flex items-center justify-center">

        {/* Burst ring on completion */}
        <AnimatePresence>
          {showBurst && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              initial={{ scale: 0.9, opacity: 0.9 }}
              animate={{ scale: 2.4, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                width: 140, height: 140,
                background: "radial-gradient(circle, rgba(212,175,55,0.55), rgba(212,175,55,0.15) 55%, transparent 80%)",
              }}
            />
          )}
        </AnimatePresence>

        {/* SVG ring */}
        <svg width="200" height="200" className="-rotate-90">
          <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="100" cy="100" r="85"
            fill="none"
            stroke={done ? "#D4AF37" : "#055C3F"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.2 }}
          />
        </svg>

        {/* Tap button */}
        <motion.button
          onClick={tap}
          whileTap={done ? {} : { scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="absolute flex flex-col items-center justify-center rounded-full select-none"
          style={{
            width: 140, height: 140,
            background: done
              ? "linear-gradient(135deg, #D4AF37, #b8942e)"
              : "linear-gradient(135deg, #055C3F, #0a8a5e)",
            boxShadow: done
              ? "0 0 48px rgba(212,175,55,0.45), 0 0 90px rgba(212,175,55,0.18), inset 0 1px 0 rgba(255,255,255,0.2)"
              : "0 0 40px rgba(5,92,63,0.5), 0 0 80px rgba(5,92,63,0.2), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <motion.span
            key={taps}
            initial={{ scale: 1.25, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="text-5xl font-bold"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}
          >
            {taps}
          </motion.span>
          <span className="text-xs opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            / {dhikr.target}
          </span>
        </motion.button>
      </motion.div>

      {/* Boutons action */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <motion.button
          onClick={reset}
          whileTap={{ scale: 0.94 }}
          transition={springTap}
          className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}
        >
          <RotateCcw size={14} /> Réinitialiser
        </motion.button>

        <AnimatePresence>
          {done && current < DHIKRS.length - 1 && (
            <motion.button
              onClick={goNext}
              initial={{ opacity: 0, scale: 0.88, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full px-5 py-2.5 text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #055C3F, #0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
            >
              Suivant →
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {allDone && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center text-sm"
            style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
          >
            ✦ Tasbih du jour complété — barakAllahu fik
          </motion.p>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
