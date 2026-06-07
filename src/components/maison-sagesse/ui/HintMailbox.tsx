"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMaisonSagesseStore } from "@/lib/maison-sagesse/game-store";

// Fallback hints in case of import issues
const HINTS_FOI_FALLBACK: [string, string, string] = [
  "Les fondations de l'Islam se comptent sur les doigts d'une seule main.",
  "Cherchez les cinq piliers dans l'ordre : Shahada, Salat, Zakat, Sawm, Hajj.",
  "Il y a exactement CINQ piliers. Le chiffre A est 5.",
];

const HINTS_SCIENCE_FALLBACK: [string, string, string] = [
  "Cherchez les astres qui se déplacent différemment des étoiles fixes.",
  "Les astronomes anciens comptaient 7 astres errants : Soleil, Lune, et 5 planètes.",
  "SEPT astres errants. Le chiffre B est 7.",
];

const HINTS_SAGESSE_FALLBACK: [string, string, string] = [
  "Jibrîl interrogea le Prophète ﷺ sur les fondements de la Foi.",
  "Le carton perforé révèle les colonnes — lisez chaque colonne de haut en bas.",
  "SIX piliers de la Foi. Le chiffre C est 6. Combinaison : 5-7-6.",
];

let HINTS_FOI: [string, string, string] = HINTS_FOI_FALLBACK;
let HINTS_SCIENCE: [string, string, string] = HINTS_SCIENCE_FALLBACK;
let HINTS_SAGESSE: [string, string, string] = HINTS_SAGESSE_FALLBACK;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pl = require("@/lib/maison-sagesse/puzzle-logic");
  HINTS_FOI     = pl.HINTS_FOI     ?? HINTS_FOI_FALLBACK;
  HINTS_SCIENCE = pl.HINTS_SCIENCE ?? HINTS_SCIENCE_FALLBACK;
  HINTS_SAGESSE = pl.HINTS_SAGESSE ?? HINTS_SAGESSE_FALLBACK;
} catch {
  // use fallbacks
}

type EnigmaKey = "A" | "B" | "C";

const ENIGMA_CONFIG: Record<
  EnigmaKey,
  { label: string; icon: string; hints: [string, string, string]; color: string }
> = {
  A: { label: "Voie de la Foi", icon: "🌙", hints: HINTS_FOI, color: "#a78bfa" },
  B: { label: "Voie de la Science", icon: "⭐", hints: HINTS_SCIENCE, color: "#60a5fa" },
  C: { label: "Voie de la Sagesse", icon: "📖", hints: HINTS_SAGESSE, color: "#34d399" },
};

const HINT_COST = [0, 30, 60]; // seconds penalty per level (0-indexed = level 1, 2, 3)
const HINT_COST_LABEL = ["Gratuit", "-30s", "-60s"];

interface LetterRevealProps {
  text: string;
  onClose: () => void;
  color: string;
}

function LetterReveal({ text, onClose, color }: LetterRevealProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ rotateX: -90, scale: 0.8 }}
        animate={{ rotateX: 0, scale: 1 }}
        exit={{ rotateX: 90, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-sm w-full rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(42,32,12,0.98) 0%, rgba(28,22,8,0.99) 100%)",
          border: `1px solid ${color}50`,
          boxShadow: `0 0 40px ${color}20, inset 0 0 20px rgba(212,175,55,0.04)`,
        }}
      >
        {/* Wax seal decoration */}
        <div className="text-center mb-3">
          <span style={{ fontSize: 28 }}>📜</span>
        </div>

        {/* Decorative header */}
        <div
          className="text-center mb-3 pb-3"
          style={{
            borderBottom: "1px solid rgba(212,175,55,0.15)",
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontFamily: "var(--font-dm-sans)",
              color: "rgba(212,175,55,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontWeight: 700,
            }}
          >
            Lettre du Messager
          </span>
        </div>

        {/* Letter text */}
        <div
          className="rounded-xl p-3 mb-4"
          style={{
            background: "rgba(248,244,236,0.04)",
            border: "1px solid rgba(248,244,236,0.08)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontFamily: "var(--font-dm-sans)",
              color: "rgba(248,244,236,0.8)",
              lineHeight: 1.65,
              whiteSpace: "pre-line",
            }}
          >
            {text}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl py-2"
          style={{
            background: `${color}18`,
            border: `1px solid ${color}30`,
            color,
            fontSize: 11,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 700,
          }}
        >
          Fermer la lettre
        </button>
      </motion.div>
    </motion.div>
  );
}

interface EnigmaHintSectionProps {
  enigmaKey: EnigmaKey;
  hintsUsed: number;
}

function EnigmaHintSection({ enigmaKey, hintsUsed }: EnigmaHintSectionProps) {
  const config = ENIGMA_CONFIG[enigmaKey];
  const addAgentMessage = useMaisonSagesseStore((s) => s.addAgentMessage);

  // We track which hint is currently revealed locally
  const [revealedText, setRevealedText] = useState<string | null>(null);
  const [localHintsUsed, setLocalHintsUsed] = useState(hintsUsed);

  const nextHintLevel = localHintsUsed; // 0 = will show level 1, etc.
  const allUsed = nextHintLevel >= 3;

  const handleRequestHint = () => {
    if (allUsed) return;
    const level = nextHintLevel; // 0-indexed
    const cost = HINT_COST[level] ?? 0;
    const hintText = config.hints[level];

    setRevealedText(hintText);
    setLocalHintsUsed((n) => n + 1);

    // Notify via agent message
    const agentId = level === 0 ? "adjoint" : level === 1 ? "manager" : "directeur";
    addAgentMessage({
      agentId,
      text: `Indice ${level + 1} pour "${config.label}" révélé.${cost > 0 ? ` -${cost}s appliquées.` : ""}`,
      triggerContext: `hint_${enigmaKey}_level_${level + 1}`,
    });
  };

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontSize: 14 }}>{config.icon}</span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-dm-sans)",
            color: config.color,
            fontWeight: 700,
          }}
        >
          {config.label}
        </span>
        <span
          style={{
            fontSize: 8,
            color: "rgba(248,244,236,0.3)",
            fontFamily: "var(--font-dm-sans)",
            marginLeft: "auto",
          }}
        >
          {localHintsUsed}/3 indice{localHintsUsed !== 1 ? "s" : ""} utilisé{localHintsUsed !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Hint level buttons */}
      <div className="flex gap-1.5">
        {([0, 1, 2] as const).map((idx) => {
          const used = idx < localHintsUsed;
          const isNext = idx === nextHintLevel;
          return (
            <motion.button
              key={idx}
              whileTap={isNext ? { scale: 0.92 } : {}}
              onClick={isNext ? handleRequestHint : undefined}
              className="flex-1 rounded-lg py-1.5 text-[9px] font-bold"
              style={{
                background: used
                  ? `${config.color}15`
                  : isNext
                  ? `${config.color}20`
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${
                  used
                    ? `${config.color}30`
                    : isNext
                    ? `${config.color}45`
                    : "rgba(255,255,255,0.06)"
                }`,
                color: used
                  ? `${config.color}80`
                  : isNext
                  ? config.color
                  : "rgba(248,244,236,0.2)",
                cursor: isNext ? "pointer" : "default",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {used ? "✓" : `Niv.${idx + 1}`}
              {!used && (
                <span style={{ display: "block", fontSize: 7, opacity: 0.6 }}>
                  {HINT_COST_LABEL[idx]}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealedText && (
          <LetterReveal
            text={revealedText}
            onClose={() => setRevealedText(null)}
            color={config.color}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HintMailbox() {
  const enigmaA = useMaisonSagesseStore((s) => s.enigmaA);
  const enigmaB = useMaisonSagesseStore((s) => s.enigmaB);
  const enigmaC = useMaisonSagesseStore((s) => s.enigmaC);
  const phase = useMaisonSagesseStore((s) => s.phase);

  const [open, setOpen] = useState(false);

  if (phase === "idle" || phase === "intro" || phase === "victory" || phase === "failure") {
    return null;
  }

  return (
    <div className="pointer-events-auto">
      {/* Toggle button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-2xl px-3 py-2 mb-2"
        style={{
          background: "rgba(10,15,13,0.88)",
          border: "1px solid rgba(212,175,55,0.3)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <span style={{ fontSize: 16 }}>✉️</span>
        <span
          style={{
            fontSize: 9,
            fontFamily: "var(--font-dm-sans)",
            color: "rgba(212,175,55,0.7)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Lettres du Messager
        </span>
        <span
          style={{
            fontSize: 10,
            color: "rgba(212,175,55,0.5)",
            marginLeft: 2,
          }}
        >
          {open ? "▲" : "▼"}
        </span>
      </motion.button>

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="rounded-2xl p-3 flex flex-col gap-2"
              style={{
                background: "rgba(10,15,13,0.92)",
                border: "1px solid rgba(212,175,55,0.22)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                width: 240,
              }}
            >
              <p
                style={{
                  fontSize: 8,
                  fontFamily: "var(--font-dm-sans)",
                  color: "rgba(248,244,236,0.3)",
                  textAlign: "center",
                  marginBottom: 2,
                }}
              >
                Niveau 2 coûte 30s · Niveau 3 coûte 60s
              </p>
              <EnigmaHintSection enigmaKey="A" hintsUsed={enigmaA.hintsUsed} />
              <EnigmaHintSection enigmaKey="B" hintsUsed={enigmaB.hintsUsed} />
              <EnigmaHintSection enigmaKey="C" hintsUsed={enigmaC.hintsUsed} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
