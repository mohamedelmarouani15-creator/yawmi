"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCHOLARS } from "@/lib/escape/tombouctou";

interface Props {
  onSolve: () => void;
  onClose: () => void;
  onError: () => void;
}

// Positions des villes sur la carte SVG (ViewBox 0 0 320 200)
const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  "Tanger":  { x: 62,  y: 70  },
  "Cordoue": { x: 75,  y: 58  },
  "Bagdad":  { x: 215, y: 80  },
  "Tunis":   { x: 118, y: 72  },
  "Palerme": { x: 140, y: 60  },
  "Fès":     { x: 58,  y: 78  },
};

export default function CarteDesLumieres({ onSolve, onClose, onError }: Props) {
  // Paires résolues : scholarId → city
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null); // scholarId sélectionné
  const [success, setSuccess] = useState(false);
  const errorRef = useRef(false);

  const solvedCount = Object.keys(matched).length;

  const selectScholar = useCallback((scholarId: string) => {
    if (matched[scholarId]) return; // déjà résolu
    setSelected(prev => prev === scholarId ? null : scholarId);
  }, [matched]);

  const clickCity = useCallback((city: string) => {
    if (!selected) return;
    const scholar = SCHOLARS.find(s => s.id === selected);
    if (!scholar) return;

    if (scholar.city === city) {
      // Bonne paire
      setMatched(prev => {
        const next = { ...prev, [selected]: city };
        if (Object.keys(next).length === SCHOLARS.length) {
          setSuccess(true);
          setTimeout(onSolve, 1200);
        }
        return next;
      });
      setSelected(null);
    } else {
      // Mauvaise paire
      if (!errorRef.current) {
        errorRef.current = true;
        onError();
        setTimeout(() => { errorRef.current = false; }, 2000);
      }
      setSelected(null);
    }
  }, [selected, onSolve, onError]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400, width: "100%" }}>
      <p style={{ color: "rgba(212,175,55,0.55)", fontSize: 12, textAlign: "center",
        fontStyle: "italic", fontFamily: "Georgia, serif", margin: 0 }}>
        Sélectionne un savant, puis sa ville sur la carte
      </p>

      {/* Carte SVG */}
      <div style={{
        background: "rgba(4,14,8,0.9)",
        border: "1px solid rgba(212,175,55,0.3)",
        borderRadius: 14, overflow: "hidden",
      }}>
        <svg viewBox="0 0 320 200" width="100%" style={{ display: "block" }}>
          {/* Mer (fond) */}
          <rect width="320" height="200" fill="#0A1628" />

          {/* Continents stylisés (très simplifié — Europe/Afrique du Nord/Moyen-Orient) */}
          {/* Europe du Sud */}
          <path d="M50 20 L200 20 L210 55 L200 75 L165 65 L145 50 L120 55 L90 50 L70 60 L50 50 Z"
            fill="#1A2F1A" stroke="rgba(212,175,55,0.15)" strokeWidth="0.8" />
          {/* Afrique du Nord */}
          <path d="M30 80 L270 80 L275 140 L250 160 L200 165 L150 160 L80 155 L30 140 Z"
            fill="#1F2A10" stroke="rgba(212,175,55,0.15)" strokeWidth="0.8" />
          {/* Moyen-Orient / Mésopotamie */}
          <path d="M200 55 L280 55 L295 100 L270 130 L240 120 L210 90 Z"
            fill="#1A2010" stroke="rgba(212,175,55,0.15)" strokeWidth="0.8" />
          {/* Péninsule Ibérique */}
          <path d="M42 40 L100 40 L100 70 L70 80 L40 70 Z"
            fill="#1A2A18" stroke="rgba(212,175,55,0.12)" strokeWidth="0.6" />
          {/* Sicile */}
          <ellipse cx="145" cy="60" rx="12" ry="8" fill="#1A2518" stroke="rgba(212,175,55,0.1)" />
          {/* Maghreb (Maroc/Algérie/Tunisie) */}
          <path d="M30 82 L175 82 L178 105 L30 108 Z"
            fill="#202A12" stroke="none" />

          {/* Routes commerciales (traits pointillés dorés) */}
          {Object.values(CITY_POSITIONS).map((from, i) =>
            Object.values(CITY_POSITIONS).slice(i+1).map((to, j) => {
              const dist = Math.sqrt((to.x-from.x)**2 + (to.y-from.y)**2);
              return dist < 80 ? (
                <line key={`${i}-${j}`}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="rgba(212,175,55,0.08)" strokeWidth="0.6" strokeDasharray="3 4" />
              ) : null;
            })
          )}

          {/* Villes */}
          {Object.entries(CITY_POSITIONS).map(([city, pos]) => {
            const isTarget = selected && SCHOLARS.find(s=>s.id===selected)?.city === city;
            const isMatched = Object.values(matched).includes(city);
            return (
              <g key={city} onClick={() => clickCity(city)} style={{ cursor: "pointer" }}>
                {/* Zone de clic élargie */}
                <circle cx={pos.x} cy={pos.y} r="14" fill="transparent" />
                {/* Point ville */}
                <circle cx={pos.x} cy={pos.y} r={isTarget ? 7 : isMatched ? 6 : 4}
                  fill={isMatched ? "#4ade80" : isTarget ? "#D4AF37" : "rgba(212,175,55,0.6)"}
                  stroke={isTarget ? "#D4AF37" : "transparent"} strokeWidth="2" />
                {/* Halo si cible */}
                {isTarget && (
                  <circle cx={pos.x} cy={pos.y} r="12"
                    fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
                )}
                {/* Label */}
                <text x={pos.x} y={pos.y - 8} fontSize="7.5" fill={isMatched ? "#4ade80" : "rgba(212,175,55,0.8)"}
                  textAnchor="middle" fontFamily="sans-serif">{city}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Liste des savants */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {SCHOLARS.map(s => {
          const isMatched = !!matched[s.id];
          const isSelected = selected === s.id;
          return (
            <motion.button
              key={s.id}
              onClick={() => selectScholar(s.id)}
              whileTap={{ scale: 0.95 }}
              disabled={isMatched}
              style={{
                background: isSelected
                  ? "rgba(212,175,55,0.18)"
                  : isMatched
                    ? "rgba(74,222,128,0.1)"
                    : "rgba(255,255,255,0.03)",
                border: `1px solid ${isSelected ? "#D4AF37" : isMatched ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 10, padding: "8px 12px", cursor: isMatched ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 8, textAlign: "left",
              }}
            >
              <span style={{ fontSize: 20 }}>{s.flag}</span>
              <span style={{
                color: isMatched ? "#4ade80" : isSelected ? "#D4AF37" : "#F8F4EC",
                fontSize: 12, fontFamily: "var(--font-dm-sans, system-ui)",
                fontWeight: isSelected ? 700 : 400,
              }}>
                {s.name}
                {isMatched && <span style={{ marginLeft: 4, fontSize: 10 }}>✓ {matched[s.id]}</span>}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Progression */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
        <span style={{ color: "rgba(212,175,55,0.5)", fontSize: 12,
          fontFamily: "var(--font-dm-sans, system-ui)" }}>
          {solvedCount}/6 paires trouvées
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({length: 6}).map((_,i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i < solvedCount ? "#4ade80" : "rgba(255,255,255,0.1)",
            }} />
          ))}
        </div>
      </div>

      {success && (
        <motion.p initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}}
          style={{ color: "#4ade80", textAlign: "center", fontSize: 16, margin: 0 }}>
          ✓ La carte s'illumine…
        </motion.p>
      )}
    </div>
  );
}
