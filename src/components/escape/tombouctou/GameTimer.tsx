"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  visible:          boolean;
  paused?:          boolean;
  onTensionChange:  (active: boolean, level: number) => void;
  onTimeUp:         () => void;
  onTick?:          (seconds: number) => void;
}

const TOTAL     = 30 * 60;   // 30 minutes en secondes
const TENSION_T = 5  * 60;   // seuil tension : 5 minutes

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

// ── Sablier SVG ──────────────────────────────────────────────────
function Sablier({ progress, tension }: { progress: number; tension: boolean }) {
  // progress : 0 = chrono plein → 1 = chrono vide
  const color   = tension ? "#FF6535" : "#D4AF37";
  const fillTop = tension ? "rgba(255,80,30,0.40)" : "rgba(212,175,55,0.36)";
  const fillBot = tension ? "rgba(255,80,30,0.60)" : "rgba(212,175,55,0.58)";

  const topH = Math.max(0, (1 - progress) * 10);
  const topY = 3 + progress * 10;
  const botH = Math.max(0, progress * 10);
  const botY = 31 - botH;

  return (
    <svg viewBox="0 0 24 34" width="20" height="28" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <clipPath id="sable-top"><polygon points="3,3 21,3 14,13 10,13" /></clipPath>
        <clipPath id="sable-bot"><polygon points="10,19 14,19 21,31 3,31" /></clipPath>
      </defs>

      {/* Sable haut (qui diminue) */}
      <rect x="0" y={topY} width="24" height={topH} fill={fillTop} clipPath="url(#sable-top)" />
      {/* Sable bas (qui augmente) */}
      <rect x="0" y={botY} width="24" height={botH} fill={fillBot} clipPath="url(#sable-bot)" />

      {/* Cadre */}
      <polygon points="3,3 21,3 14,13 10,13"
        stroke={color} strokeWidth="1.35" fill="none" strokeLinejoin="round" />
      <polygon points="10,19 14,19 21,31 3,31"
        stroke={color} strokeWidth="1.35" fill="none" strokeLinejoin="round" />
      <line x1="10" y1="13" x2="10" y2="19" stroke={color} strokeWidth="1.35" />
      <line x1="14" y1="13" x2="14" y2="19" stroke={color} strokeWidth="1.35" />

      {/* Grain tombant (col central) */}
      {progress > 0.01 && progress < 0.97 && (
        <circle cx="12" cy="16" r="0.75" fill={color} />
      )}
    </svg>
  );
}

// ── Composant timer ───────────────────────────────────────────────
export default function GameTimer({ visible, paused = false, onTensionChange, onTimeUp, onTick }: Props) {
  const [seconds,  setSeconds]  = useState(TOTAL);
  const [tension,  setTension]  = useState(false);
  const tickRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const calledTension = useRef(false);

  const handleTick = useCallback(() => {
    setSeconds(prev => {
      const next = prev - 1;
      if (next <= 0) {
        clearInterval(tickRef.current!);
        onTimeUp();
        return 0;
      }
      if (next <= TENSION_T && !calledTension.current) {
        calledTension.current = true;
        setTension(true);
      }
      if (tension && next <= TENSION_T) {
        const level = 1 - next / TENSION_T;
        onTensionChange(true, level);
      }
      onTick?.(next);
      return next;
    });
  }, [tension, onTensionChange, onTimeUp, onTick]);

  useEffect(() => {
    if (!visible) return;
    if (paused) { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(handleTick, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [visible, handleTick, paused]);

  const progress = 1 - seconds / TOTAL;
  const urgent   = seconds <= 60;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="game-timer"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,   scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            position: "fixed", top: 16, right: 16,
            zIndex: 80,
            display: "flex", alignItems: "center", gap: 9,
            background: tension ? "rgba(32,6,2,0.90)" : "rgba(4,14,8,0.84)",
            border: `1px solid ${tension ? "rgba(255,70,20,0.38)" : "rgba(212,175,55,0.30)"}`,
            borderRadius: 14,
            padding: "7px 13px 7px 10px",
            backdropFilter: "blur(8px)",
            boxShadow: tension
              ? "0 0 24px rgba(255,40,8,0.18)"
              : "0 0 18px rgba(212,175,55,0.08)",
            // Pulsation rapide en urgence
            animation: urgent ? "urgency-pulse 0.6s ease-in-out infinite" : "none",
          }}
        >
          <Sablier progress={progress} tension={tension} />

          <span style={{
            color: urgent ? "#FF3311" : tension ? "#FF7744" : "#D4AF37",
            fontFamily: "var(--font-bricolage, Georgia, serif)",
            fontSize: 18, fontWeight: 700, letterSpacing: "0.06em",
            minWidth: 48, textAlign: "right",
          }}>
            {fmt(seconds)}
          </span>

          {/* Indicateur "TENSION" discret */}
          {tension && !urgent && (
            <span style={{
              fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,100,40,0.5)",
              fontFamily: "var(--font-dm-sans, system-ui)", fontWeight: 600,
              textTransform: "uppercase", alignSelf: "flex-end", marginBottom: 1,
            }}>
              TENSION
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
