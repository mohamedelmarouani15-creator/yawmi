"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "Préparation de la bibliothèque…",
  "Chargement des manuscrits…",
  "Allumage des bougies…",
  "Le tapis s'éveille…",
];

// 30 particules dorées — positions déterministes
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  left:     ((i * 37 + 13) % 97),
  top:      ((i * 53 + 7)  % 88),
  size:     1.4 + (i % 3) * 0.9,
  delay:    (i * 0.19) % 3.2,
  duration: 2.4 + (i % 5) * 0.8,
}));

// ── Silhouettes bibliothèque ──────────────────────────────────────────
function LibrarySilhouette() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.6, delay: 0.4 }}
      style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 220, pointerEvents: "none",
      }}
    >
      <svg viewBox="0 0 400 220" style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMax meet">
        {/* Sol */}
        <rect x={0} y={195} width={400} height={25} fill="#030D07" opacity={0.95} />

        {/* Étagère gauche */}
        <rect x={8} y={55} width={72} height={140} rx={3} fill="#061208" opacity={0.85} />
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={`bl${i}`}
            x={12 + (i % 4) * 16} y={60 + Math.floor(i / 4) * 68}
            width={13} height={62} rx={1}
            fill={["#1A0005","#050A1A","#0A150A","#1A0A00"][i % 4]}
            opacity={0.9}
          />
        ))}
        {/* Planche étagère */}
        <rect x={8} y={126} width={72} height={4} fill="#2A1208" opacity={0.8} />

        {/* Étagère droite */}
        <rect x={320} y={48} width={72} height={147} rx={3} fill="#061208" opacity={0.85} />
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={`br${i}`}
            x={324 + (i % 4) * 16} y={53 + Math.floor(i / 4) * 68}
            width={13} height={62} rx={1}
            fill={["#1A0808","#0A0A1A","#051A05","#100A1A"][i % 4]}
            opacity={0.9}
          />
        ))}
        <rect x={320} y={119} width={72} height={4} fill="#2A1208" opacity={0.8} />

        {/* Bougies */}
        {([[130, 180], [200, 170], [270, 178]] as [number, number][]).map(([x, y], i) => (
          <motion.g key={i}
            animate={{ opacity: [0.6, 1.0, 0.6] }}
            transition={{ duration: 2.2 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
          >
            <rect x={x - 3} y={y - 14} width={6} height={14} fill="#D4B87A" opacity={0.65} />
            <ellipse cx={x} cy={y - 16} rx={4.5} ry={7} fill="#FF9040" opacity={0.8} />
            <ellipse cx={x} cy={y - 19} rx={2.2} ry={3.5} fill="#FFF5C0" opacity={0.75} />
            {/* Halo */}
            <circle cx={x} cy={y - 14} r={22} fill="#FF7820" opacity={0.05} />
            <circle cx={x} cy={y - 14} r={40} fill="#FF6010" opacity={0.03} />
          </motion.g>
        ))}

        {/* Astrolabe */}
        <motion.g
          transform="translate(200, 115)"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <circle r={32} fill="none" stroke="#D4AF37" strokeWidth={0.7} opacity={0.12} />
          <circle r={20} fill="none" stroke="#D4AF37" strokeWidth={0.7} opacity={0.10} />
          <circle r={8}  fill="none" stroke="#D4AF37" strokeWidth={1.2} opacity={0.20} />
          <line x1={-32} y1={0} x2={32} y2={0} stroke="#D4AF37" strokeWidth={0.5} opacity={0.10} />
          <line x1={0} y1={-32} x2={0} y2={32} stroke="#D4AF37" strokeWidth={0.5} opacity={0.10} />
          <line x1={-23} y1={-23} x2={23} y2={23} stroke="#D4AF37" strokeWidth={0.4} opacity={0.08} />
          <line x1={23} y1={-23} x2={-23} y2={23} stroke="#D4AF37" strokeWidth={0.4} opacity={0.08} />
        </motion.g>

        {/* Arche du fond */}
        <path d="M 155 195 L 155 115 Q 155 80 200 78 Q 245 80 245 115 L 245 195 Z"
          fill="none" stroke="#D4AF37" strokeWidth={0.8} opacity={0.08} />
      </svg>
    </motion.div>
  );
}

// ── Tapis 2D volant ───────────────────────────────────────────────────
function CarpetSVG2D() {
  return (
    <svg width={130} height={86} viewBox="0 0 130 86" style={{ display: "block" }}>
      {/* Corps */}
      <rect x={4} y={8} width={122} height={70} rx={7} fill="#055C3F" />
      {/* Bordure dorée */}
      <rect x={4} y={8} width={122} height={70} rx={7} fill="none" stroke="#D4AF37" strokeWidth={2.2} />
      <rect x={11} y={14} width={108} height={58} rx={5} fill="none" stroke="#D4AF37" strokeWidth={0.9} opacity={0.45} />
      {/* Étoile islamique centrale */}
      <polygon
        points="65,24 68,33 77,33 70,39 73,48 65,42 57,48 60,39 53,33 62,33"
        fill="#D4AF37" opacity={0.75}
      />
      <circle cx={65} cy={36} r={5} fill="#055C3F" stroke="#D4AF37" strokeWidth={0.8} opacity={0.7} />
      {/* Franges gauches */}
      {[0,1,2,3,4,5].map(i => (
        <line key={`fl${i}`} x1={4} y1={14 + i * 11} x2={-2} y2={14 + i * 11}
          stroke="#D4AF37" strokeWidth={1.6} strokeLinecap="round" opacity={0.65} />
      ))}
      {/* Franges droites */}
      {[0,1,2,3,4,5].map(i => (
        <line key={`fr${i}`} x1={126} y1={14 + i * 11} x2={132} y2={14 + i * 11}
          stroke="#D4AF37" strokeWidth={1.6} strokeLinecap="round" opacity={0.65} />
      ))}
      {/* Ornements d'angle */}
      {([[14,18],[116,18],[14,68],[116,68]] as [number,number][]).map(([x,y], i) => (
        <g key={i}>
          <line x1={x-5} y1={y} x2={x+5} y2={y} stroke="#D4AF37" strokeWidth={0.8} opacity={0.45} />
          <line x1={x} y1={y-5} x2={x} y2={y+5} stroke="#D4AF37" strokeWidth={0.8} opacity={0.45} />
        </g>
      ))}
    </svg>
  );
}

// ── Composant principal ───────────────────────────────────────────────
interface Props {
  onDone: () => void;
}

export default function EscapeLoadingScreen({ onDone }: Props) {
  const [msgIdx,   setMsgIdx]   = useState(0);
  const [progress, setProgress] = useState(0);

  // Barre de progression sur 2 secondes exactes
  useEffect(() => {
    const start = typeof performance !== "undefined" ? performance.now() : 0;
    const DURATION = 2000;
    const id = setInterval(() => {
      const pct = Math.min((performance.now() - start) / DURATION, 1);
      setProgress(pct);
      if (pct >= 1) { clearInterval(id); onDone(); }
    }, 40);
    return () => clearInterval(id);
  }, [onDone]);

  // Rotation des messages toutes les 2s
  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, overflow: "hidden",
      background: "linear-gradient(160deg, #061A12 0%, #0A2A1C 55%, #041409 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Keyframes pour les particules et le tapis */}
      <style>{`
        @keyframes esc-float {
          0%, 100% { transform: translateY(0);    opacity: var(--p-lo); }
          50%       { transform: translateY(-18px); opacity: var(--p-hi); }
        }
        @keyframes esc-carpet {
          0%   { transform: translateX(-180px) translateY(0)   rotate(-1.5deg); }
          18%  { transform: translateX(12vw)   translateY(-10px) rotate(1deg);  }
          50%  { transform: translateX(42vw)   translateY(0)   rotate(-0.5deg); }
          80%  { transform: translateX(72vw)   translateY(-8px) rotate(1.2deg); }
          100% { transform: translateX(calc(100vw + 180px)) translateY(0) rotate(-1.5deg); }
        }
      `}</style>

      {/* Particules dorées */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${p.left}%`, top: `${p.top}%`,
          width: p.size, height: p.size, borderRadius: "50%",
          background: "#D4AF37",
          ["--p-lo" as string]: "0.12",
          ["--p-hi" as string]: "0.65",
          animation: `esc-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}

      {/* Silhouettes bibliothèque */}
      <LibrarySilhouette />

      {/* Tapis volant 2D */}
      <div style={{
        position: "absolute", top: "36%",
        left: 0, right: 0, height: 90,
        pointerEvents: "none",
      }}>
        <motion.div
          animate={{
            x: ["-160px", "calc(100vw + 160px)"],
            y: [0, -10, 0, -8, 0],
          }}
          transition={{
            x: { duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 },
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ display: "inline-block", position: "absolute", top: 0 }}
        >
          <CarpetSVG2D />
        </motion.div>
      </div>

      {/* Bismillah */}
      <motion.p
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 0.72, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        style={{
          fontSize: 30, color: "#D4AF37", fontFamily: "var(--font-amiri, serif)",
          direction: "rtl", marginBottom: 32,
          textShadow: "0 0 28px rgba(212,175,55,0.35)",
          position: "relative", zIndex: 1,
        }}
      >
        بِسْمِ اللَّهِ
      </motion.p>

      {/* Message rotatif */}
      <div style={{ height: 22, position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.32 }}
            style={{
              color: "rgba(248,244,236,0.45)", fontSize: 10, margin: 0,
              fontFamily: "var(--font-dm-sans)", letterSpacing: "0.16em",
              textTransform: "uppercase", whiteSpace: "nowrap",
            }}
          >
            {MESSAGES[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Barre de progression */}
      <div style={{
        width: 200, height: 6, borderRadius: 3,
        background: "rgba(212,175,55,0.08)",
        overflow: "hidden", marginTop: 18, position: "relative", zIndex: 1,
      }}>
        <motion.div
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={{ duration: 0.04, ease: "linear" }}
          style={{
            height: "100%", borderRadius: 3,
            background: "linear-gradient(90deg, #6B4A10, #D4AF37, #F5DEB3)",
          }}
        />
      </div>
    </div>
  );
}
