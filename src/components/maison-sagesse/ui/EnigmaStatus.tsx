"use client";

import { motion } from "framer-motion";
import { useMaisonSagesseStore } from "@/lib/maison-sagesse/game-store";
import type { EnigmaState } from "@/lib/maison-sagesse/types";

interface EnigmaCardProps {
  label: string;
  icon: string;
  color: string;
  enigma: EnigmaState;
  enigmaKey: "A" | "B" | "C";
}

function EnigmaCard({ label, icon, color, enigma }: EnigmaCardProps) {
  const solved = enigma.solved;
  const digit = enigma.digit;

  return (
    <motion.div
      className="flex items-center gap-2 rounded-xl px-3 py-2 relative overflow-hidden"
      style={{
        background: solved
          ? "rgba(5,92,63,0.25)"
          : "rgba(10,15,13,0.85)",
        border: `1px solid ${solved ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.08)"}`,
        minWidth: 100,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Shimmer animation when not solved */}
      {!solved && (
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Icon */}
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>

      {/* Text */}
      <div className="flex flex-col flex-1 min-w-0">
        <span
          style={{
            fontSize: 9,
            fontFamily: "var(--font-dm-sans)",
            color: solved ? "#34d399" : "rgba(248,244,236,0.5)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 8,
            fontFamily: "var(--font-dm-sans)",
            color: solved ? "rgba(52,211,153,0.7)" : "rgba(248,244,236,0.3)",
          }}
        >
          {solved ? "Résolue ✓" : "En cours..."}
        </span>
      </div>

      {/* Digit circle */}
      {solved && digit !== null && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full"
          style={{
            background: `linear-gradient(135deg, #7a5c1a, ${color})`,
            border: "1.5px solid rgba(212,175,55,0.6)",
            boxShadow: `0 0 10px ${color}40`,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 900,
              color: "#0A0F0D",
              lineHeight: 1,
            }}
          >
            {digit}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function EnigmaStatus() {
  const enigmaA = useMaisonSagesseStore((s) => s.enigmaA);
  const enigmaB = useMaisonSagesseStore((s) => s.enigmaB);
  const enigmaC = useMaisonSagesseStore((s) => s.enigmaC);
  const phase = useMaisonSagesseStore((s) => s.phase);

  if (phase === "idle" || phase === "intro") return null;

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
      style={{ width: "calc(100% - 32px)", maxWidth: 420 }}
    >
      <div className="flex gap-2 justify-center">
        <EnigmaCard
          label="Foi"
          icon="🌙"
          color="#a78bfa"
          enigma={enigmaA}
          enigmaKey="A"
        />
        <EnigmaCard
          label="Science"
          icon="⭐"
          color="#60a5fa"
          enigma={enigmaB}
          enigmaKey="B"
        />
        <EnigmaCard
          label="Sagesse"
          icon="📖"
          color="#34d399"
          enigma={enigmaC}
          enigmaKey="C"
        />
      </div>
    </div>
  );
}
