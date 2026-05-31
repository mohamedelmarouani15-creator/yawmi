"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ROOM_DURATION_MS } from "@/lib/escape3d/riad-progress";

interface Props {
  startedAt:   number;
  completedAt: number | null;
  onTimeout:   () => void;
}

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function EscapeTimer({ startedAt, completedAt, onTimeout }: Props) {
  const [left, setLeft] = useState(() => ROOM_DURATION_MS - (Date.now() - startedAt));

  useEffect(() => {
    if (completedAt) return;
    const id = setInterval(() => {
      const remaining = ROOM_DURATION_MS - (Date.now() - startedAt);
      setLeft(remaining);
      if (remaining <= 0) { clearInterval(id); onTimeout(); }
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt, completedAt, onTimeout]);

  if (completedAt) return null;

  const pct     = Math.max(0, left / ROOM_DURATION_MS);
  const urgent  = left < 5 * 60 * 1000;  // < 5 min
  const warning = left < 10 * 60 * 1000; // < 10 min

  const color = urgent ? "#EF4444" : warning ? "#F59E0B" : "var(--gold)";

  return (
    <div style={{
      position: "absolute", top: 44, left: "50%", transform: "translateX(-50%)",
      zIndex: 12, pointerEvents: "none",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    }}>
      {/* Chiffre */}
      <motion.p
        animate={urgent ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.9, repeat: Infinity }}
        style={{
          color, fontFamily: "var(--font-dm-sans)",
          fontSize: 16, fontWeight: 700, letterSpacing: "0.12em",
          textShadow: urgent ? `0 0 12px ${color}` : "none",
        }}
      >
        {fmt(left)}
      </motion.p>

      {/* Barre de progression */}
      <div style={{
        width: 80, height: 2, borderRadius: 99,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}>
        <motion.div
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
          style={{ height: "100%", borderRadius: 99, background: color }}
        />
      </div>

      {/* Alerte < 5 min */}
      <AnimatePresence>
        {urgent && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              color: "#EF4444", fontSize: 9, letterSpacing: "0.16em",
              textTransform: "uppercase", fontFamily: "var(--font-dm-sans)",
            }}
          >
            Dépêche-toi !
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Écran Game Over ───────────────────────────────────────────────
export function GameOver({ onRestart }: { onRestart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "absolute", inset: 0, zIndex: 40,
        background: "rgba(4,6,8,0.97)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 32px", gap: 24,
      }}
    >
      <p style={{ fontSize: 48 }}>⌛</p>
      <h2 style={{
        color: "var(--text)", fontSize: 22, fontWeight: 700, textAlign: "center",
        fontFamily: "var(--font-bricolage)", margin: 0,
      }}>
        Le riad garde ses secrets
      </h2>
      <p style={{
        color: "rgba(248,244,236,0.48)", fontSize: 13, textAlign: "center",
        fontFamily: "var(--font-dm-sans)", lineHeight: 1.6, maxWidth: 300, margin: 0,
      }}>
        Le temps imparti est écoulé. Les portes se referment sur leur mystère.
      </p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onRestart}
        style={{
          padding: "15px 40px", borderRadius: 99, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg,#D4AF37,#8B6914)",
          color: "var(--bg)", fontSize: 14, fontWeight: 700,
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        Recommencer
      </motion.button>
    </motion.div>
  );
}
