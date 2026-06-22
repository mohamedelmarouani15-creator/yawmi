"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LEVEL_TITLES: Record<number, string> = {
  2:  "Voyageur Éveillé",  5:  "Chercheur",       10: "Savant",
  15: "Érudit",            20: "Sage",             25: "Maître des Questions",
  30: "Gardien du Savoir", 40: "Grand Maître",     50: "Lumière de l'Oasis",
};

function getTitleForLevel(level: number): string {
  const milestones = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const m of milestones) {
    if (level >= m) return LEVEL_TITLES[m];
  }
  return "Explorateur";
}

function Particle({ delay, color }: { delay: number; color: string }) {
  const [{ tx, ty, size, rotate, duration }] = useState(() => {
    const angle  = Math.random() * Math.PI * 2;
    const radius = 80 + Math.random() * 180;
    return {
      tx: Math.cos(angle) * radius,
      ty: Math.sin(angle) * radius - 60,
      size: 4 + Math.random() * 7,
      rotate: Math.random() * 720,
      duration: 1.2 + Math.random() * 0.6,
    };
  });
  return (
    <motion.div
      className="absolute rounded-sm"
      style={{ width: size, height: size, background: color, left: "50%", top: "50%", marginLeft: -size/2, marginTop: -size/2 }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ x: tx, y: ty, opacity: 0, rotate, scale: 0.3 }}
      transition={{ duration, delay, ease: "easeOut" }}
    />
  );
}

function Particles() {
  const [particles] = useState(() => Array.from({ length: 40 }, (_, i) => ({
    id:    i,
    delay: 0.1 + Math.random() * 0.3,
    color: ["#D4AF37","#FFD700","#22c55e","#f97316","#60a5fa"][i % 5],
  })));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(p => <Particle key={p.id} delay={p.delay} color={p.color} />)}
    </div>
  );
}

export default function LevelUpCinematic({
  level, onDismiss,
}: {
  level: number;
  onDismiss: () => void;
}) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const title = getTitleForLevel(level);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("out"), 4000);
    const t3 = setTimeout(() => onDismiss(), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDismiss]);

  if (navigator.vibrate) navigator.vibrate([80, 40, 200, 40, 80]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: "#020a05" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "out" ? 0 : 1 }}
      transition={{ duration: phase === "out" ? 0.4 : 0.2 }}
      onClick={onDismiss}
    >
      {/* Radial glow background */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "in" ? 0 : [0, 0.7, 0.4] }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,175,55,0.25) 0%, transparent 70%)" }}
      />

      {/* Ring pulses */}
      {[1, 2, 3].map(i => (
        <motion.div key={i}
          className="absolute rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.3)", width: 80 + i * 60, height: 80 + i * 60 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.8, 2.5], opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.2, delay: 0.3 + i * 0.12, ease: "easeOut" }}
        />
      ))}

      {/* Particles */}
      <Particles />

      {/* NIVEAU label */}
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-xs font-black uppercase tracking-[0.5em] mb-4"
        style={{ color: "rgba(212,175,55,0.7)", fontFamily: "var(--font-dm-sans)" }}
      >
        ✦ NIVEAU ✦
      </motion.p>

      {/* Big level number */}
      <motion.div
        initial={{ scale: 0, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.2 }}
        className="relative"
      >
        {/* Number shadow */}
        <span className="absolute inset-0 blur-xl opacity-60 select-none"
          style={{ fontSize: 130, fontFamily: "var(--font-bricolage)", color: "#D4AF37", lineHeight: 1, letterSpacing: "-0.04em", display: "block", textAlign: "center" }}>
          {level}
        </span>
        <span className="relative select-none"
          style={{ fontSize: 120, fontFamily: "var(--font-bricolage)", color: "#ffffff", lineHeight: 1,
            letterSpacing: "-0.04em", display: "block", textAlign: "center",
            WebkitTextStroke: "2px rgba(212,175,55,0.8)",
            textShadow: "0 0 40px rgba(212,175,55,0.9), 0 0 80px rgba(212,175,55,0.4)" }}>
          {level}
        </span>
      </motion.div>

      {/* Level title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center mt-4"
      >
        <p className="text-2xl font-black tracking-wider"
          style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)", letterSpacing: "0.08em",
            textShadow: "0 0 20px rgba(212,175,55,0.6)" }}>
          {title.toUpperCase()}
        </p>
        <motion.div className="mt-2 h-px w-40 mx-auto"
          style={{ background: "linear-gradient(to right,transparent,rgba(212,175,55,0.6),transparent)" }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.7, duration: 0.5 }}
        />
      </motion.div>

      {/* XP progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 w-64"
      >
        <div className="flex justify-between text-[10px] mb-1.5 font-bold"
          style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
          <span>XP</span>
          <span>Niv. {level} → {level + 1}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div className="h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "5%" }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            style={{ background: "linear-gradient(to right,#055C3F,#D4AF37)" }}
          />
        </div>
        <p className="text-center text-xs mt-1.5 opacity-30" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          0 / 200 XP vers le niveau {level + 1}
        </p>
      </motion.div>

      {/* Tap to continue */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.5] }}
        transition={{ delay: 1.5, duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-16 text-xs tracking-widest uppercase"
        style={{ color: "rgba(248,244,236,0.35)", fontFamily: "var(--font-dm-sans)" }}
      >
        Touche pour continuer
      </motion.p>
    </motion.div>
  );
}
