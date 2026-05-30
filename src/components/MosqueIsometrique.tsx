"use client";

import { motion } from "framer-motion";

export type MosqueStage = 1 | 2 | 3;

// ── Stade 1 : Tapis de prière + mihrab simple ─────────────────
function Stage1() {
  return (
    <g>
      {/* Sol */}
      <ellipse cx="160" cy="230" rx="120" ry="40" fill="rgba(5,92,63,0.15)" />
      {/* Tapis */}
      <rect x="100" y="175" width="120" height="80" rx="8" fill="#055C3F" opacity="0.7" transform="skewX(-8)" />
      <rect x="108" y="183" width="104" height="64" rx="5" fill="#044F36" opacity="0.5" transform="skewX(-8)" />
      {/* Motif tapis */}
      <rect x="140" y="195" width="40" height="40" rx="3" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5" transform="skewX(-8)" />
      {/* Mihrab */}
      <rect x="145" y="140" width="30" height="45" rx="2" fill="#044F36" />
      <path d="M145,155 Q160,135 175,155" fill="#033D2A" />
      <path d="M148,158 Q160,140 172,158" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.7" />
      {/* Arche mihrab */}
      <rect x="150" y="158" width="20" height="27" rx="1" fill="#033D2A" />
      {/* Dôme naissant */}
      <ellipse cx="160" cy="140" rx="16" ry="8" fill="#055C3F" opacity="0.8" />
      <ellipse cx="160" cy="136" rx="12" ry="6" fill="#066B49" opacity="0.9" />
      {/* Croissant */}
      <text x="155" y="130" fontSize="10" fill="#D4AF37" opacity="0.8">☽</text>
      {/* Calligraphie */}
      <text x="160" y="200" textAnchor="middle" fontSize="11"
        style={{ fontFamily: "serif" }} fill="#D4AF37" opacity="0.4">الله</text>
    </g>
  );
}

// ── Stade 2 : Mosquée partielle — murs + dôme + 1 minaret ────
function Stage2() {
  return (
    <g>
      {/* Sol isométrique */}
      <ellipse cx="160" cy="240" rx="130" ry="45" fill="rgba(5,92,63,0.12)" />
      {/* Mur arrière */}
      <rect x="80" y="155" width="160" height="70" rx="3" fill="#044F36" />
      <rect x="80" y="155" width="160" height="70" rx="3" fill="url(#wallGrad2)" />
      {/* Toit plat */}
      <rect x="78" y="148" width="164" height="12" rx="2" fill="#055C3F" />
      {/* Arches (3 portiques) */}
      {[105, 145, 185].map((x, i) => (
        <g key={i}>
          <rect x={x} y="175" width="22" height="45" rx="2" fill="#033D2A" opacity="0.8" />
          <path d={`M${x},185 Q${x+11},170 ${x+22},185`} fill="#044F36" />
        </g>
      ))}
      {/* Dôme principal */}
      <ellipse cx="160" cy="152" rx="35" ry="14" fill="#055C3F" />
      <ellipse cx="160" cy="140" rx="28" ry="22" fill="#066B49" />
      <ellipse cx="160" cy="130" rx="20" ry="14" fill="#077A52" />
      <ellipse cx="160" cy="122" rx="12" ry="8" fill="#088A5E" />
      {/* Lanterne dôme */}
      <rect x="156" y="114" width="8" height="10" rx="2" fill="#055C3F" />
      <line x1="160" y1="108" x2="160" y2="114" stroke="#D4AF37" strokeWidth="1.5" />
      <text x="156" y="108" fontSize="9" fill="#D4AF37">☽</text>
      {/* Minaret gauche */}
      <rect x="82" y="100" width="18" height="60" rx="2" fill="#044F36" />
      <ellipse cx="91" cy="100" rx="9" ry="5" fill="#055C3F" />
      <ellipse cx="91" cy="95" rx="6" ry="10" fill="#066B49" />
      <line x1="91" y1="86" x2="91" y2="92" stroke="#D4AF37" strokeWidth="1" />
      <text x="87" y="86" fontSize="7" fill="#D4AF37">☽</text>
      {/* Fenêtres */}
      {[110, 150, 190].map((x, i) => (
        <rect key={i} x={x} y="160" width="12" height="16" rx="3" fill="#D4AF37" opacity="0.15" />
      ))}
      {/* Étoiles */}
      {[[100, 250], [220, 245], [130, 260], [195, 255]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2" fill="#D4AF37" opacity="0.3" />
      ))}
    </g>
  );
}

// ── Stade 3 : Mosquée complète — 2 minarets + fontaine ───────
function Stage3() {
  return (
    <g>
      {/* Sol / cour */}
      <ellipse cx="160" cy="252" rx="140" ry="48" fill="rgba(5,92,63,0.1)" />
      <ellipse cx="160" cy="252" rx="110" ry="35" fill="rgba(5,92,63,0.08)" />
      {/* Corps principal */}
      <rect x="75" y="158" width="170" height="80" rx="4" fill="#044F36" />
      {/* Toit */}
      <rect x="73" y="150" width="174" height="13" rx="3" fill="#055C3F" />
      {/* Bandeau décoratif */}
      <rect x="73" y="148" width="174" height="4" rx="1" fill="#D4AF37" opacity="0.4" />
      {/* Arches (5 portiques) */}
      {[85, 113, 141, 169, 197].map((x, i) => (
        <g key={i}>
          <rect x={x} y="178" width="20" height="58" rx="2" fill="#033D2A" opacity="0.85" />
          <path d={`M${x},190 Q${x+10},173 ${x+20},190`} fill="#044F36" />
          <rect x={x+4} y="192" width="12" height="35" rx="1" fill="#022D1E" opacity="0.6" />
        </g>
      ))}
      {/* Dôme central */}
      <ellipse cx="160" cy="153" rx="38" ry="13" fill="#055C3F" />
      <ellipse cx="160" cy="140" rx="30" ry="22" fill="#066B49" />
      <ellipse cx="160" cy="128" rx="22" ry="16" fill="#077A52" />
      <ellipse cx="160" cy="118" rx="14" ry="10" fill="#088A5E" />
      <ellipse cx="160" cy="110" rx="8" ry="6" fill="#09906A" />
      <rect x="157" y="104" width="6" height="8" rx="1.5" fill="#055C3F" />
      <line x1="160" y1="96" x2="160" y2="104" stroke="#D4AF37" strokeWidth="1.5" />
      <text x="155.5" y="96" fontSize="9" fill="#D4AF37">☽</text>
      {/* Petits dômes latéraux */}
      {[105, 215].map((cx, i) => (
        <g key={i}>
          <ellipse cx={cx} cy="153" rx="18" ry="7" fill="#055C3F" />
          <ellipse cx={cx} cy="146" rx="14" ry="10" fill="#066B49" />
          <ellipse cx={cx} cy="138" rx="9" ry="7" fill="#077A52" />
          <line x1={cx} y1="130" x2={cx} y2="136" stroke="#D4AF37" strokeWidth="1" />
          <text x={cx - 4} y="130" fontSize="7" fill="#D4AF37">☽</text>
        </g>
      ))}
      {/* Minaret gauche */}
      <rect x="76" y="88" width="20" height="68" rx="2" fill="#044F36" />
      <rect x="74" y="148" width="24" height="8" rx="1" fill="#055C3F" />
      <rect x="74" y="118" width="24" height="6" rx="1" fill="#055C3F" opacity="0.7" />
      <ellipse cx="86" cy="88" rx="10" ry="5" fill="#055C3F" />
      <ellipse cx="86" cy="82" rx="7" ry="11" fill="#066B49" />
      <line x1="86" y1="72" x2="86" y2="78" stroke="#D4AF37" strokeWidth="1.5" />
      <text x="82" y="72" fontSize="8" fill="#D4AF37">☽</text>
      {/* Minaret droit */}
      <rect x="224" y="88" width="20" height="68" rx="2" fill="#044F36" />
      <rect x="222" y="148" width="24" height="8" rx="1" fill="#055C3F" />
      <rect x="222" y="118" width="24" height="6" rx="1" fill="#055C3F" opacity="0.7" />
      <ellipse cx="234" cy="88" rx="10" ry="5" fill="#055C3F" />
      <ellipse cx="234" cy="82" rx="7" ry="11" fill="#066B49" />
      <line x1="234" y1="72" x2="234" y2="78" stroke="#D4AF37" strokeWidth="1.5" />
      <text x="230" y="72" fontSize="8" fill="#D4AF37">☽</text>
      {/* Fontaine */}
      <ellipse cx="160" cy="254" rx="22" ry="10" fill="rgba(5,92,63,0.3)" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.3" />
      <ellipse cx="160" cy="250" rx="14" ry="6" fill="rgba(5,150,100,0.2)" />
      <ellipse cx="160" cy="247" rx="7" ry="4" fill="rgba(5,180,120,0.25)" />
      <rect x="158" y="236" width="4" height="12" rx="1" fill="#055C3F" opacity="0.6" />
      {/* Palmiers */}
      <line x1="102" y1="252" x2="104" y2="220" stroke="#044F36" strokeWidth="2.5" />
      <ellipse cx="104" cy="218" rx="10" ry="6" fill="#055C3F" opacity="0.7" />
      <line x1="216" y1="252" x2="218" y2="222" stroke="#044F36" strokeWidth="2.5" />
      <ellipse cx="218" cy="220" rx="10" ry="6" fill="#055C3F" opacity="0.7" />
      {/* Fenêtres dorées */}
      {[88, 120, 152, 184].map((x, i) => (
        <g key={i}>
          <rect x={x} y="162" width="14" height="18" rx="3" fill="#D4AF37" opacity="0.12" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.3" />
          <path d={`M${x},168 Q${x+7},161 ${x+14},168`} fill="#D4AF37" opacity="0.1" />
        </g>
      ))}
      {/* Lanternes */}
      {[[135, 237], [185, 237]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="#D4AF37" opacity="0.25" />
          <circle cx={x} cy={y} r="2" fill="#D4AF37" opacity="0.5" />
        </g>
      ))}
    </g>
  );
}

interface Props {
  stage: MosqueStage;
  streak: number;
  className?: string;
}

export default function MosqueIsometrique({ stage, streak, className = "" }: Props) {
  const nextStageStreaks = stage === 1 ? 7 : stage === 2 ? 30 : null;
  const progress = stage === 1
    ? Math.min(streak / 7, 1)
    : stage === 2
    ? Math.min((streak - 7) / 23, 1)
    : 1;

  const stageLabels = {
    1: "Espace de prière",
    2: "Mosquée en construction",
    3: "Mosquée complète",
  };

  return (
    <div className={className}>
      <div className="relative">
        {/* Badge stade */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: "rgba(5,92,63,0.7)", border: "1px solid rgba(212,175,55,0.3)" }}>
          <span className="text-xs font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
            Stade {stage}
          </span>
        </div>

        <svg viewBox="0 0 320 300" width="100%" style={{ maxHeight: 260 }}>
          <defs>
            <radialGradient id="groundGlow" cx="50%" cy="80%" r="50%">
              <stop offset="0%" stopColor="#055C3F" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#055C3F" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="wallGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#066B49" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#022D1E" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Halo de sol */}
          <ellipse cx="160" cy="270" rx="150" ry="30" fill="url(#groundGlow)" />
          {/* Étincelles dorées */}
          {stage === 3 && [[60, 100], [260, 110], [80, 180], [250, 175]].map(([cx, cy], i) => (
            <motion.circle key={i} cx={cx} cy={cy} r="2" fill="#D4AF37"
              animate={{ opacity: [0.1, 0.6, 0.1], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" }} />
          ))}
          {stage === 1 && <Stage1 />}
          {stage === 2 && <Stage2 />}
          {stage === 3 && <Stage3 />}
        </svg>
      </div>

      {/* Label + progression */}
      <div className="px-1 mt-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {stageLabels[stage]}
          </p>
          <p className="text-xs" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
            {streak}j de streak
          </p>
        </div>
        {nextStageStreaks && (
          <>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ background: "linear-gradient(to right, #055C3F, #D4AF37)" }} />
            </div>
            <p className="text-xs opacity-40 mt-1" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              {nextStageStreaks - streak > 0
                ? `${nextStageStreaks - streak} jours pour le stade suivant`
                : "Prêt pour évoluer !"
              }
            </p>
          </>
        )}
        {!nextStageStreaks && (
          <p className="text-xs opacity-40 mt-1" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
            ✦ Mosquée accomplie — barak Allahu fik
          </p>
        )}
      </div>
    </div>
  );
}
