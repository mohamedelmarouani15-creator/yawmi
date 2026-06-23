"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  WORD_GRID,
  GRILLE_HOLE_COORDS,
  LIVRET_SAGESSES,
  SOLUTION,
} from "@/lib/maison-sagesse/puzzle-logic";

const HOLE_SET = new Set(GRILLE_HOLE_COORDS.map(([col, row]) => `${col}-${row}`));

interface GrillePerceeProps {
  onClose: () => void;
  onSolved: () => void;
}

export default function GrillePercee({ onClose, onSolved }: GrillePerceeProps) {
  const [revealed, setRevealed] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelectEntry = (num: number) => {
    setSelectedEntry(num);
    if (num === SOLUTION.c) {
      setFeedback(null);
      onSolved();
    } else {
      setFeedback("Cette entrée ne correspond pas à la phrase révélée par la grille...");
    }
  };

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", pointerEvents: "auto" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full rounded-2xl flex flex-col"
        style={{
          background: "linear-gradient(135deg, rgba(28,16,8,0.98) 0%, rgba(16,10,4,0.99) 100%)",
          border: "1px solid rgba(212,175,55,0.35)",
          boxShadow: "0 0 40px rgba(212,175,55,0.12)",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* En-tête fixe — toujours visible, même si le contenu défile */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <p
            style={{ fontSize: 10, color: "rgba(212,175,55,0.6)", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}
          >
            La Grille Percée
          </p>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex items-center justify-center rounded-full"
            style={{ width: 26, height: 26, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(248,244,236,0.7)", fontSize: 13, fontWeight: 700 }}
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-5 overflow-y-auto">
        {/* Word grid */}
        <div
          className="grid gap-1 mb-3 p-2 rounded-xl"
          style={{ gridTemplateColumns: "repeat(6, 1fr)", background: "rgba(0,0,0,0.25)" }}
        >
          {WORD_GRID.map((row, rowIdx) =>
            row.map((word, colIdx) => {
              const isHole = HOLE_SET.has(`${colIdx}-${rowIdx}`);
              const dim = revealed && !isHole;
              const lit = revealed && isHole;
              return (
                <div
                  key={`${colIdx}-${rowIdx}`}
                  className="flex items-center justify-center rounded text-center"
                  style={{
                    fontSize: 7.5,
                    padding: "4px 2px",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: lit ? 800 : 500,
                    color: dim ? "rgba(248,244,236,0.12)" : lit ? "#0A0F0D" : "rgba(248,244,236,0.6)",
                    background: lit ? "#D4AF37" : "transparent",
                    boxShadow: lit ? "0 0 8px rgba(212,175,55,0.6)" : "none",
                    lineHeight: 1.1,
                  }}
                >
                  {word}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => setRevealed((r) => !r)}
          className="w-full rounded-xl py-2 mb-4"
          style={{
            background: revealed ? "rgba(52,211,153,0.15)" : "rgba(212,175,55,0.15)",
            border: `1px solid ${revealed ? "rgba(52,211,153,0.3)" : "rgba(212,175,55,0.3)"}`,
            color: revealed ? "#34d399" : "#D4AF37",
            fontSize: 11,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 700,
          }}
        >
          {revealed ? "Retirer la grille" : "Poser la grille percée"}
        </button>

        {/* Livret des Sagesses */}
        <p
          className="text-center mb-2"
          style={{ fontSize: 9, color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}
        >
          Quelle entrée du Livret des Sagesses correspond à la phrase révélée ?
        </p>
        <div className="flex flex-col gap-1.5 mb-3">
          {LIVRET_SAGESSES.map((entry) => (
            <button
              key={entry.num}
              onClick={() => handleSelectEntry(entry.num)}
              className="flex items-start gap-2 rounded-lg p-2 text-left"
              style={{
                background: selectedEntry === entry.num ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${selectedEntry === entry.num ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 800, color: "#D4AF37", fontFamily: "var(--font-dm-sans)", flexShrink: 0 }}>
                {entry.num}.
              </span>
              <span style={{ fontSize: 10, color: "rgba(248,244,236,0.75)", fontFamily: "var(--font-dm-sans)", lineHeight: 1.4 }}>
                « {entry.text} »
              </span>
            </button>
          ))}
        </div>

        {feedback && (
          <p className="text-center mb-3" style={{ fontSize: 10, color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>
            {feedback}
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full rounded-xl py-2"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(248,244,236,0.6)",
            fontSize: 11,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 700,
          }}
        >
          Refermer
        </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
