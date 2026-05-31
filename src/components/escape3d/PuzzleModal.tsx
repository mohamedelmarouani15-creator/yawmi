"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PuzzleDef } from "@/lib/escape3d/types";
import type { EscapeSettings } from "@/lib/escape3d/escape-settings";

interface Props {
  puzzle:     PuzzleDef;
  difficulty: EscapeSettings["difficulty"];
  onSolve:   (correct: boolean) => void;
  onClose:   () => void;
}

// Rendu d'une option selon le niveau
function OptionLabel({ arabic, fr, phonetic, difficulty }: {
  arabic:    string;
  fr?:       string;
  phonetic?: string;
  difficulty: EscapeSettings["difficulty"];
}) {
  if (difficulty === "expert") {
    return <span style={{ fontSize: 18, direction: "rtl" }}>{arabic}</span>;
  }

  if (difficulty === "intermediaire") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "right" }}>
        <span style={{ fontSize: 16, direction: "rtl" }}>{arabic}</span>
        {phonetic && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", direction: "ltr", textAlign: "left" }}>
            {phonetic}
          </span>
        )}
      </div>
    );
  }

  // Débutant : français en grand + arabe en petit
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{fr ?? arabic}</span>
      <span style={{ fontSize: 12, direction: "rtl", color: "var(--text-muted)" }}>{arabic}</span>
    </div>
  );
}

export default function PuzzleModal({ puzzle, difficulty, onSolve, onClose }: Props) {
  const [selected,   setSelected]   = useState<string | null>(null);
  const [revealed,   setRevealed]   = useState(false);
  const [hintsUsed,  setHintsUsed]  = useState(0);
  const [showHint,   setShowHint]   = useState<string | null>(null);

  const hints = [puzzle.hint1, puzzle.hint2, puzzle.hint3];

  function handleAnswer(option: string) {
    if (revealed) return;
    setSelected(option);
    const correct = option === puzzle.answer;
    setRevealed(true);
    setTimeout(() => onSolve(correct), 1400);
  }

  function requestHint() {
    if (hintsUsed >= 3) {
      setShowHint(hints[2]);
      setTimeout(() => {
        setSelected(puzzle.answer);
        setRevealed(true);
        setTimeout(() => onSolve(false), 1800);
      }, 2500);
      return;
    }
    setShowHint(hints[hintsUsed]);
    setHintsUsed(h => h + 1);
  }

  function optionStyle(opt: string): React.CSSProperties {
    if (!revealed) {
      return {
        background:  selected === opt ? "var(--border-gold)" : "rgba(255,255,255,0.04)",
        borderColor: selected === opt ? "var(--gold)" : "rgba(255,255,255,0.1)",
      };
    }
    if (opt === puzzle.answer) return { background: "var(--border-primary)",  borderColor: "#05C36F" };
    if (opt === selected)      return { background: "rgba(180,30,30,0.3)", borderColor: "#E05555" };
    return { background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)", opacity: 0.4 };
  }

  // Badge niveau
  const diffLabel = difficulty === "debutant" ? "🌱 Débutant"
    : difficulty === "intermediaire" ? "🌙 Intermédiaire"
    : "⭐ Expert";
  const diffColor = difficulty === "debutant" ? "#4ade80"
    : difficulty === "intermediaire" ? "var(--gold)"
    : "#f59e0b";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "#0E1A14", border: "1px solid rgba(212,175,55,0.25)" }}
      >
        {/* En-tête */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between"
          style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs tracking-widest uppercase"
                style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)", opacity: 0.7 }}>
                Énigme
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: `${diffColor}18`, color: diffColor, fontFamily: "var(--font-dm-sans)", border: `1px solid ${diffColor}40` }}>
                {diffLabel}
              </span>
            </div>
            <h3 className="text-base font-semibold"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {puzzle.title}
            </h3>
          </div>
          <button onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ color: "var(--text)", background: "rgba(255,255,255,0.07)", opacity: 0.6 }}>
            ✕
          </button>
        </div>

        {/* Question */}
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)", opacity: 0.85 }}>
            {puzzle.question}
          </p>
        </div>

        {/* Indice actif */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-5 mb-3 px-4 py-3 rounded-xl text-sm italic"
              style={{ background: "rgba(212,175,55,0.1)", borderLeft: "3px solid #D4AF37", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              🕯 {showHint}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options */}
        <div className="px-5 pb-4 flex flex-col gap-2">
          {(puzzle.options ?? []).map((opt, idx) => (
            <motion.button
              key={opt}
              whileTap={{ scale: revealed ? 1 : 0.97 }}
              onClick={() => handleAnswer(opt)}
              disabled={revealed}
              className="rounded-xl border px-4 py-3 text-left"
              style={{ ...optionStyle(opt), color: "var(--text)", fontFamily: "var(--font-dm-sans)", transition: "all 0.3s" }}
            >
              <OptionLabel
                arabic={opt}
                fr={puzzle.optionsFr?.[idx]}
                phonetic={puzzle.phonetics?.[idx]}
                difficulty={difficulty}
              />
            </motion.button>
          ))}
        </div>

        {/* Explication post-réponse */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mx-5 mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(5,92,63,0.2)", color: "#A8D5B5", fontFamily: "var(--font-dm-sans)" }}>
              {puzzle.explanation}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {!revealed && (
          <div className="px-5 pb-5 flex justify-between items-center">
            <button
              onClick={requestHint}
              className="text-xs px-4 py-2 rounded-full"
              style={{ color: "var(--gold)", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)", fontFamily: "var(--font-dm-sans)" }}>
              {hintsUsed < 3 ? `Indice (${3 - hintsUsed} restants)` : "Voir la réponse"}
            </button>
            <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              +{puzzle.xpReward} XP
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
