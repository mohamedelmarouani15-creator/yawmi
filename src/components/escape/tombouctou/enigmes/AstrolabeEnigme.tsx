"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

// Angle cible : Venus / étoile du Berger ≈ 225° (SO)
const TARGET_ANGLE = 225;
const TOLERANCE    = 6; // ±6 degrés

interface Props {
  onSolve: () => void;
  onClose: () => void;
  onError: () => void;
}

export default function AstrolabeEnigme({ onSolve, onClose, onError }: Props) {
  const [ringAngle, setRingAngle] = useState(0);
  const [aligned,   setAligned]   = useState(false);
  const [validated, setValidated] = useState(false);
  const isDragging = useRef(false);
  const center     = useRef({ x: 0, y: 0 });
  const startAngle = useRef(0);
  const startRing  = useRef(0);
  const svgRef     = useRef<SVGSVGElement>(null);

  const getAngle = useCallback((cx: number, cy: number, mx: number, my: number) => {
    return Math.atan2(my - cy, mx - cx) * (180 / Math.PI) + 90;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    startAngle.current = getAngle(center.current.x, center.current.y, e.clientX, e.clientY);
    startRing.current  = ringAngle;
    isDragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [ringAngle, getAngle]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const current = getAngle(center.current.x, center.current.y, e.clientX, e.clientY);
    const delta   = current - startAngle.current;
    const newAngle = ((startRing.current + delta) % 360 + 360) % 360;
    setRingAngle(newAngle);
    const diff = Math.abs(newAngle - TARGET_ANGLE);
    const minDiff = Math.min(diff, 360 - diff);
    setAligned(minDiff <= TOLERANCE);
  }, [getAngle]);

  const onPointerUp = useCallback(() => { isDragging.current = false; }, []);

  const validate = () => {
    if (aligned) {
      setValidated(true);
      setTimeout(onSolve, 1000);
    } else {
      onError();
    }
  };

  // Dessiner l'étoile du Berger (Venus) à TARGET_ANGLE
  const venusRad = (TARGET_ANGLE - 90) * Math.PI / 180;
  const ringRad  = (ringAngle - 90) * Math.PI / 180;
  const R = 90; // rayon de l'anneau SVG

  const venusX = 110 + Math.cos(venusRad) * R;
  const venusY = 110 + Math.sin(venusRad) * R;
  const sightX = 110 + Math.cos(ringRad) * (R + 8);
  const sightY = 110 + Math.sin(ringRad) * (R + 8);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
      {/* Indice */}
      <div style={{
        background: "rgba(212,175,55,0.06)", borderRadius: 12,
        border: "1px solid rgba(212,175,55,0.18)", padding: "10px 16px",
        maxWidth: 320, textAlign: "center",
      }}>
        <p style={{ color: "rgba(212,175,55,0.7)", fontSize: 12, fontStyle: "italic",
          fontFamily: "Georgia, serif", lineHeight: 1.65, margin: 0 }}>
          « Oriente l'anneau vers l'Étoile du Berger. Elle se lève au sud-ouest. »
        </p>
      </div>

      {/* Astrolabe SVG interactif */}
      <svg
        ref={svgRef}
        width="220" height="220" viewBox="0 0 220 220"
        style={{ cursor: isDragging.current ? "grabbing" : "grab", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Fond étoilé */}
        <circle cx="110" cy="110" r="108" fill="#061A12" stroke="rgba(212,175,55,0.15)" strokeWidth="1" />

        {/* Étoile du Berger (Venus) — fixe */}
        <circle cx={venusX} cy={venusY} r="5" fill="#D4AF37" opacity="0.9" />
        <circle cx={venusX} cy={venusY} r="9" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
        <text x={venusX + 12} y={venusY + 4} fontSize="9" fill="#D4AF37" opacity="0.7"
          fontFamily="serif">Vénus</text>

        {/* Quelques étoiles décoratives */}
        {[[60,40],[170,50],[40,160],[180,140],[90,190],[145,25]].map(([sx,sy],i)=>(
          <circle key={i} cx={sx} cy={sy} r="1.5" fill="white" opacity="0.4" />
        ))}

        {/* Anneaux fixes de l'astrolabe */}
        <circle cx="110" cy="110" r="70" fill="none" stroke="rgba(200,168,75,0.3)" strokeWidth="1" />
        <circle cx="110" cy="110" r="50" fill="none" stroke="rgba(200,168,75,0.2)" strokeWidth="1" />

        {/* Graduations fixes */}
        {Array.from({length:36}).map((_,i)=>{
          const a = (i * 10 - 90) * Math.PI / 180;
          const r1 = 88, r2 = i%3===0 ? 82 : 85;
          return (
            <line key={i}
              x1={110+Math.cos(a)*r1} y1={110+Math.sin(a)*r1}
              x2={110+Math.cos(a)*r2} y2={110+Math.sin(a)*r2}
              stroke="rgba(200,168,75,0.35)" strokeWidth={i%9===0?1.5:0.8}
            />
          );
        })}

        {/* Anneau rotatif (draggable) */}
        <g transform={`rotate(${ringAngle} 110 110)`}>
          <circle cx="110" cy="110" r="90"
            fill="none"
            stroke={aligned ? "#4ade80" : "#C8A84B"}
            strokeWidth={aligned ? 2.5 : 1.8}
            opacity={aligned ? 1 : 0.7}
          />
          {/* Viseur sur l'anneau */}
          <circle cx="110" cy="20" r="5" fill={aligned ? "#4ade80" : "#C8A84B"} />
          <line x1="110" y1="25" x2="110" y2="45"
            stroke={aligned ? "#4ade80" : "#C8A84B"} strokeWidth="1.5" />
        </g>

        {/* Ligne de visée */}
        <line x1="110" y1="110" x2={sightX} y2={sightY}
          stroke={aligned ? "rgba(74,222,128,0.6)" : "rgba(200,168,75,0.3)"}
          strokeWidth={aligned ? 2 : 1} strokeDasharray="4 4" />

        {/* Centre */}
        <circle cx="110" cy="110" r="6" fill="#C8A84B" />
        <circle cx="110" cy="110" r="3" fill="#D4AF37" />
      </svg>

      {/* Indicateur d'alignement */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        color: aligned ? "#4ade80" : "rgba(212,175,55,0.5)",
        fontSize: 13, fontFamily: "var(--font-dm-sans, system-ui)",
        transition: "color 0.3s",
      }}>
        <span style={{ fontSize: 18 }}>{aligned ? "🎯" : "↻"}</span>
        {aligned ? "Aligné avec Vénus !" : `Rotation: ${Math.round(ringAngle)}°`}
      </div>

      {/* Bouton */}
      {!validated ? (
        <motion.button
          onClick={validate}
          whileTap={{ scale: 0.95 }}
          disabled={!aligned}
          style={{
            background: aligned
              ? "linear-gradient(135deg,#055C3F,#0A8A5C)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${aligned ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 999, padding: "12px 32px",
            color: aligned ? "#D4AF37" : "rgba(248,244,236,0.3)",
            fontWeight: 700, fontSize: 14, letterSpacing: "0.1em",
            cursor: aligned ? "pointer" : "not-allowed",
            fontFamily: "var(--font-dm-sans, system-ui)",
            transition: "all 0.3s",
          }}
        >
          {aligned ? "CONFIRMER L'ALIGNEMENT" : "TOURNE L'ANNEAU"}
        </motion.button>
      ) : (
        <motion.p initial={{ scale:0.8,opacity:0 }} animate={{ scale:1,opacity:1 }}
          style={{ color: "#4ade80", fontSize: 18 }}>
          ✓ Le compartiment s'ouvre…
        </motion.p>
      )}
    </div>
  );
}
