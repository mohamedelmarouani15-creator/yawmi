"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  RASM_LETTERS,
  DOT_TILES,
  TARGET_WORD,
  TARGET_WORD_FR,
  TARGET_WORD_MEANING,
  SOLUTION,
  type DotPattern,
} from "@/lib/al-bayan/puzzle-logic";

interface RasmOverlayProps {
  onClose: () => void;
  onSolved: () => void;
}

export default function RasmOverlay({ onClose, onSolved }: RasmOverlayProps) {
  const [assigned, setAssigned] = useState<Record<string, DotPattern>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleAssign = (letterId: string, dot: DotPattern) => {
    setAssigned((prev) => ({ ...prev, [letterId]: dot }));
    setFeedback(null);
  };

  const handleValidate = () => {
    const allFilled = RASM_LETTERS.every((l) => assigned[l.id] !== undefined);
    if (!allFilled) {
      setFeedback("Il manque encore des points sur certaines lettres...");
      return;
    }
    const allCorrect = RASM_LETTERS.every((l) => assigned[l.id] === l.correct);
    if (allCorrect) {
      setRevealed(true);
      setFeedback(null);
      setTimeout(() => onSolved(), 1200);
    } else {
      setFeedback("Ce mot ne correspond à rien de connu... réessaie.");
    }
  };

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", pointerEvents: "auto" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full rounded-2xl flex flex-col"
        style={{ background: "linear-gradient(135deg, rgba(10,16,30,0.98) 0%, rgba(6,9,18,0.99) 100%)", border: "1px solid rgba(96,165,250,0.35)", boxShadow: "0 0 40px rgba(96,165,250,0.12)", maxHeight: "90vh", overflow: "hidden" }}
      >
        {/* En-tête fixe */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <p style={{ fontSize: 10, color: "rgba(96,165,250,0.7)", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>
            Le Rasm Primitif
          </p>
          <button onClick={onClose} aria-label="Fermer" className="flex items-center justify-center rounded-full" style={{ width: 26, height: 26, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(248,244,236,0.7)", fontSize: 13, fontWeight: 700 }}>✕</button>
        </div>

        <div className="px-5 pb-5 overflow-y-auto">
          <p className="text-center mb-4" style={{ fontSize: 11, color: "rgba(248,244,236,0.5)", fontFamily: "var(--font-dm-sans)", lineHeight: 1.5 }}>
            Sept formes nues attendent leurs points. Choisis le bon point pour chacune.
          </p>

          {/* Letter shapes with dot selectors */}
          <div className="flex flex-col gap-2 mb-4">
            {RASM_LETTERS.map((letter, i) => (
              <div key={letter.id} className="flex items-center gap-3 rounded-xl p-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 9, color: "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)", flexShrink: 0, width: 16 }}>
                  {i + 1}
                </span>
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    width: 44, height: 44, fontSize: 22, fontFamily: "serif", direction: "rtl",
                    background: revealed ? "rgba(96,165,250,0.2)" : "rgba(0,0,0,0.3)",
                    color: "#F8F4EC",
                    boxShadow: revealed ? "0 0 10px rgba(96,165,250,0.5)" : "none",
                  }}
                >
                  {letter.shape}
                </div>
                <select
                  value={assigned[letter.id] ?? ""}
                  onChange={(e) => handleAssign(letter.id, e.target.value as DotPattern)}
                  className="flex-1 rounded-lg px-2 py-2 text-xs"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(96,165,250,0.25)", color: "rgba(248,244,236,0.85)", fontFamily: "var(--font-dm-sans)" }}
                >
                  <option value="" disabled>— choisir —</option>
                  {DOT_TILES.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {revealed && (
            <div className="rounded-xl p-3 mb-4 text-center" style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)" }}>
              <p style={{ fontSize: 22, color: "#60a5fa", fontFamily: "serif", direction: "rtl" }}>{TARGET_WORD}</p>
              <p style={{ fontSize: 10, color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>{TARGET_WORD_FR}</p>
              <p style={{ fontSize: 9, color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)", marginTop: 4 }}>{TARGET_WORD_MEANING}</p>
              <p style={{ fontSize: 9, color: "#34d399", fontFamily: "var(--font-dm-sans)", fontWeight: 700, marginTop: 6 }}>
                {TARGET_WORD.length} lettres — Chiffre B = {SOLUTION.b}
              </p>
            </div>
          )}

          {feedback && (
            <p className="text-center mb-3" style={{ fontSize: 10, color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>
              {feedback}
            </p>
          )}

          {!revealed && (
            <button
              onClick={handleValidate}
              className="w-full rounded-xl py-2.5"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#60a5fa)", border: "1px solid rgba(96,165,250,0.6)", color: "#0A0F0D", fontSize: 12, fontFamily: "var(--font-dm-sans)", fontWeight: 800 }}
            >
              Valider les points
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
