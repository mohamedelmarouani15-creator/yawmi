"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/lib/game/types";

interface Props {
  question: Question;
  onComplete: (isCorrect: boolean) => void;
  color: string;
}

export default function WhoAmIGame({ question, onComplete, color }: Props) {
  const clues = question.minigameData?.clues ?? [question.question];
  const [clueIndex, setClueIndex] = useState(0);
  const [selected, setSelected]   = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correctIdx = question.options.findIndex(o => o.correct);

  // Score: more points for guessing with fewer clues (handled upstream via SM-2 quality)
  const isCorrect = selected === correctIdx;

  const handleSelect = useCallback((idx: number) => {
    if (submitted) return;
    setSelected(idx);
    setSubmitted(true);
    setTimeout(() => onComplete(idx === correctIdx), 1400);
  }, [submitted, correctIdx, onComplete]);

  const revealNextClue = useCallback(() => {
    if (clueIndex < clues.length - 1) setClueIndex(i => i + 1);
  }, [clueIndex, clues.length]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "rgba(212,175,55,0.6)", fontFamily: "var(--font-dm-sans)" }}>
          Qui suis-je ?
        </p>
        <div className="flex justify-center gap-1.5 mb-4">
          {clues.map((_, i) => (
            <div key={i} className="h-1.5 w-6 rounded-full"
              style={{ background: i <= clueIndex ? color : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>

      {/* Clues revealed so far */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {clues.slice(0, clueIndex + 1).map((clue, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              transition={{ delay: i === clueIndex ? 0 : 0, duration: 0.3 }}
              className="rounded-2xl border px-4 py-3"
              style={{
                background: i === clueIndex ? `${color}0d` : "rgba(255,255,255,0.02)",
                borderColor: i === clueIndex ? `${color}40` : "rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 text-xs font-bold shrink-0"
                  style={{ color, fontFamily: "var(--font-dm-sans)" }}>
                  {i + 1}.
                </span>
                <p className="text-sm leading-relaxed"
                  style={{ color: i === clueIndex ? "var(--text)" : "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                  {clue}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reveal next clue button */}
      <AnimatePresence>
        {!submitted && clueIndex < clues.length - 1 && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={revealNextClue}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-full py-2.5 text-xs font-semibold border"
            style={{
              borderColor: `${color}35`,
              color: `${color}bb`,
              background: "transparent",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Indice suivant ({clueIndex + 1}/{clues.length})
          </motion.button>
        )}
      </AnimatePresence>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isOpt = opt.correct;

          let bg = "rgba(255,255,255,0.02)";
          let border = "rgba(255,255,255,0.07)";
          let textC = "var(--text)";

          if (submitted) {
            if (isOpt) { bg = "rgba(74,222,128,0.09)"; border = "rgba(74,222,128,0.4)"; textC = "#4ade80"; }
            else if (isSelected) { bg = "rgba(248,113,113,0.09)"; border = "rgba(248,113,113,0.4)"; textC = "#f87171"; }
          } else if (isSelected) {
            bg = `${color}14`; border = color; textC = color;
          }

          return (
            <motion.button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={submitted}
              whileTap={!submitted ? { scale: 0.97 } : {}}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-left"
              style={{ background: bg, borderColor: border }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.05)", color: textC, fontFamily: "var(--font-dm-sans)" }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 text-sm font-medium"
                style={{ color: textC, fontFamily: "var(--font-dm-sans)" }}>
                {opt.text}
              </span>
              {submitted && isOpt && <span>✓</span>}
              {submitted && isSelected && !isOpt && <span>✗</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback message */}
      <AnimatePresence>
        {submitted && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center text-sm font-semibold"
            style={{
              color: isCorrect ? "#4ade80" : "#f87171",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {isCorrect
              ? clueIndex === 0 ? "Brillant ! Premier indice suffisant !" : "Bien joué !"
              : "Pas cette fois…"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
