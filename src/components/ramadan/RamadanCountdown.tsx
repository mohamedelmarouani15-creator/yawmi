"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/motion";

// Ramadan 2027 start: approximately 8 February 2027 (based on lunar calendar projection)
// This is a calculated estimate — the exact date depends on moon sighting
const RAMADAN_2027_START = new Date("2027-02-08T00:00:00");
const RAMADAN_2027_END   = new Date("2027-03-09T23:59:59");

interface TimeLeft {
  days:    number;
  hours:   number;
  minutes: number;
  seconds: number;
}

function computeTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSec = Math.floor(diff / 1000);
  return {
    days:    Math.floor(totalSec / 86400),
    hours:   Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

function isRamadanActive(): boolean {
  const now = Date.now();
  return now >= RAMADAN_2027_START.getTime() && now <= RAMADAN_2027_END.getTime();
}

interface Props {
  compact?: boolean;
}

export default function RamadanCountdown({ compact = false }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    computeTimeLeft(RAMADAN_2027_START)
  );
  const [active, setActive] = useState(() => isRamadanActive());

  useEffect(() => {
    const tick = () => {
      setActive(isRamadanActive());
      if (!isRamadanActive()) {
        setTimeLeft(computeTimeLeft(RAMADAN_2027_START));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (active) {
    return (
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center gap-2 py-4"
      >
        <MoonSVG size={compact ? 40 : 56} />
        <p
          className="font-bold text-center tracking-wide"
          style={{
            color: "#c084fc",
            fontSize: compact ? "1.1rem" : "1.5rem",
            fontFamily: "var(--font-dm-sans)",
            textShadow: "0 0 20px rgba(192,132,252,0.4)",
          }}
        >
          Ramadan Mubarak
        </p>
        <p
          className="text-center"
          style={{ color: "rgba(192,132,252,0.7)", fontSize: "0.875rem" }}
        >
          رمضان مبارك
        </p>
      </motion.div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.2)" }}
      >
        <MoonSVG size={20} />
        <span style={{ color: "#c084fc", fontSize: "0.8rem", fontFamily: "var(--font-dm-sans)" }}>
          Ramadan 2027 dans{" "}
          <strong>{timeLeft.days}j {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m</strong>
        </span>
      </div>
    );
  }

  const units = [
    { label: "jours",    value: timeLeft.days    },
    { label: "heures",   value: timeLeft.hours   },
    { label: "minutes",  value: timeLeft.minutes },
    { label: "secondes", value: timeLeft.seconds },
  ];

  return (
    <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
      <MoonSVG size={64} />
      <div className="flex flex-col items-center gap-1">
        <p
          className="text-sm uppercase tracking-widest"
          style={{ color: "rgba(192,132,252,0.6)", fontFamily: "var(--font-dm-sans)" }}
        >
          Prochain Ramadan 2027
        </p>
        <p
          className="text-xs"
          style={{ color: "rgba(192,132,252,0.4)", fontFamily: "var(--font-dm-sans)" }}
        >
          رمضان ١٤٤٨
        </p>
      </div>
      <div className="flex items-center gap-3">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <motion.div
              key={value}
              initial={{ scale: 0.85, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center rounded-xl font-bold"
              style={{
                width: 56,
                height: 56,
                background: "rgba(192,132,252,0.1)",
                border: "1px solid rgba(192,132,252,0.25)",
                color: "#c084fc",
                fontSize: "1.5rem",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {String(value).padStart(2, "0")}
            </motion.div>
            <span
              style={{
                color: "rgba(192,132,252,0.5)",
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Lune croissante SVG animée ──────────────────────────────── */
function MoonSVG({ size = 48 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      animate={{ rotate: [0, 4, -4, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Halo glow */}
      <circle cx="24" cy="24" r="20" fill="rgba(192,132,252,0.06)" />
      {/* Croissant */}
      <path
        d="M34 17A14 14 0 0 1 18 38 14 14 0 0 1 8 24a14 14 0 0 1 20-12.4A10 10 0 0 0 34 17z"
        fill="#c084fc"
        opacity="0.9"
      />
      {/* Étoile */}
      <path
        d="M37 8l.7 2.2L40 9.5l-1.5 1.7.9 2.3-2.2-.7-1.7 1.5.6-2.3-1.7-1.5 2.3-.6L37 8z"
        fill="#c084fc"
        opacity="0.8"
      />
    </motion.svg>
  );
}
