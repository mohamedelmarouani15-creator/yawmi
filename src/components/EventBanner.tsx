"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveGameEvent, type GameEvent } from "@/lib/game/game-events";

// ── Gold confetti for Aïd ──────────────────────────────────────
function AidConfetti({ show }: { show: boolean }) {
  const [particles] = useState(() => Array.from({ length: 30 }, (_, i) => ({
    x: Math.random() * 400, delay: Math.random() * 1.5,
    color: ["var(--gold)","#FFD700","#22c55e","#f87171","#60a5fa"][i % 5],
    size: 4 + Math.random() * 6,
    rot: Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
    duration: 2 + Math.random(),
  })));
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {particles.map((p, i) => (
        <motion.div key={i} className="absolute rounded-sm"
          style={{ left: p.x, top: -8, width: p.size, height: p.size, background: p.color }}
          initial={{ y: -8, opacity: 1, rotate: 0 }}
          animate={{ y: 900, opacity: 0, rotate: p.rot }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ── Lantern decoration for Ramadan ────────────────────────────
function Lanterns() {
  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-30 overflow-hidden" style={{ height: 80 }}>
      {[30, 110, 200, 280, 360].map((x, i) => (
        <motion.div key={i}
          className="absolute"
          style={{ left: x, top: -5 }}
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        >
          {/* String */}
          <div style={{ width: 1, height: 20, background: "rgba(212,175,55,0.4)", margin: "0 auto" }} />
          {/* Lantern body */}
          <div style={{
            width: 16, height: 22, borderRadius: 4,
            background: `rgba(${["212,175,55","180,100,30","150,80,180","100,160,80","80,120,200"][i]},0.75)`,
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: `0 0 12px rgba(212,175,55,0.35)`,
          }} />
        </motion.div>
      ))}
    </div>
  );
}

// ── Stars shimmer for Laylat al-Qadr ──────────────────────────
function ShimmerStars() {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 53 + 20) % 380, y: (i * 37 + 10) % 120,
    size: 1.5 + (i % 3) * 1.2, delay: i * 0.15,
  }));
  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-30 overflow-hidden" style={{ height: 150 }}>
      {stars.map((s, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{ left: s.x, top: s.y, width: s.size, height: s.size, background: "#a78bfa" }}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: 2 + (i % 3), delay: s.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function getInitialEvent(): GameEvent | null {
  const active = getActiveGameEvent();
  if (!active) return null;
  const key = `event_banner_dismissed_${active.id}_${new Date().toISOString().split("T")[0]}`;
  if (localStorage.getItem(key)) return null;
  return active;
}

export function EventBanner() {
  const [event] = useState<GameEvent | null>(getInitialEvent);
  const [dismissed, setDismissed] = useState(false);

  const dismiss = () => {
    if (event) {
      const key = `event_banner_dismissed_${event.id}_${new Date().toISOString().split("T")[0]}`;
      localStorage.setItem(key, "1");
    }
    setDismissed(true);
  };

  if (!event || dismissed) return null;

  const isAid = event.id === "aid_fitr" || event.id === "aid_adha";
  const isRamadan = event.id === "ramadan";
  const isQadr = event.id === "laylat_qadr";

  return (
    <>
      {isAid && <AidConfetti show />}
      {isRamadan && <Lanterns />}
      {isQadr && <ShimmerStars />}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: event.theme.bgOverlay,
            border: `1px solid ${event.theme.primaryColor}30`,
            boxShadow: `0 0 20px ${event.theme.primaryColor}15`,
            cursor: isRamadan ? "pointer" : "default",
          }}
          {...(isRamadan ? { onClick: () => window.location.href = "/ramadan" } : {})}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ fontSize: 22 }}
          >
            {event.emoji}
          </motion.span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate"
              style={{ color: event.theme.primaryColor, fontFamily: "var(--font-bricolage)" }}>
              {event.nameAr}
            </p>
            <p className="text-xs leading-tight" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
              {event.bannerText}
            </p>
          </div>
          {event.rewardMultiplier > 1 && (
            <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${event.theme.primaryColor}20`, color: event.theme.primaryColor,
                border: `1px solid ${event.theme.primaryColor}40`, fontFamily: "var(--font-dm-sans)" }}>
              ×{event.rewardMultiplier} XP
            </span>
          )}
          <button onClick={dismiss} style={{ color: "var(--text-dim)", fontSize: 16, flexShrink: 0 }}>
            ✕
          </button>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
