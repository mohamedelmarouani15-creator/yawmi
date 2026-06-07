"use client";

import { motion } from "framer-motion";
import { useMaisonSagesseStore } from "@/lib/maison-sagesse/game-store";
import { GAME_DURATION } from "@/lib/maison-sagesse/puzzle-logic";

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Timer45() {
  const timeLeft = useMaisonSagesseStore((s) => s.timeLeft);

  const isCritical = timeLeft <= 300;  // 5 min
  const isWarning  = timeLeft <= 600;  // 10 min
  const progress   = timeLeft / GAME_DURATION;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const timeColor = isCritical
    ? "#ef4444"
    : isWarning
    ? "#f97316"
    : "#F8F4EC";

  const strokeColor = isCritical
    ? "#ef4444"
    : isWarning
    ? "#f97316"
    : "#D4AF37";

  return (
    <motion.div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
      animate={
        isCritical
          ? { x: [-2, 2, -2, 2, 0] }
          : {}
      }
      transition={
        isCritical
          ? { duration: 0.4, repeat: Infinity, repeatDelay: 1.5 }
          : {}
      }
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-2"
        style={{
          background: "rgba(10,15,13,0.85)",
          border: `1px solid ${strokeColor}55`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: `0 0 24px ${strokeColor}22`,
        }}
      >
        {/* Circular progress SVG */}
        <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
          <svg width={52} height={52} style={{ transform: "rotate(-90deg)" }}>
            {/* Background track */}
            <circle
              cx={26}
              cy={26}
              r={RADIUS * 0.55}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={4}
            />
            {/* Progress arc */}
            <motion.circle
              cx={26}
              cy={26}
              r={RADIUS * 0.55}
              fill="none"
              stroke={strokeColor}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE * 0.55}
              initial={{ strokeDashoffset: 0 }}
              animate={{
                strokeDashoffset: (CIRCUMFERENCE * 0.55) * (1 - progress),
              }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          {/* Hourglass icon center */}
          <div
            className="absolute inset-0 flex items-center justify-center text-base"
            style={{ lineHeight: 1 }}
          >
            ⏳
          </div>
        </div>

        {/* Time display */}
        <motion.span
          key={isCritical ? "critical" : isWarning ? "warning" : "normal"}
          initial={{ scale: 1 }}
          animate={
            isCritical
              ? { scale: [1, 1.05, 1] }
              : {}
          }
          transition={
            isCritical
              ? { duration: 1, repeat: Infinity }
              : {}
          }
          style={{
            color: timeColor,
            fontSize: 26,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 900,
            letterSpacing: "0.05em",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {formatTime(timeLeft)}
        </motion.span>

        {/* Label */}
        <div className="flex flex-col items-start">
          <span
            style={{
              fontSize: 8,
              fontFamily: "var(--font-dm-sans)",
              color: "rgba(248,244,236,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              lineHeight: 1,
            }}
          >
            Temps
          </span>
          {isCritical && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{
                fontSize: 7,
                fontFamily: "var(--font-dm-sans)",
                color: "#ef4444",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Critique !
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
