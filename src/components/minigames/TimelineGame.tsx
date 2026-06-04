"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Question } from "@/lib/game/types";

interface Props {
  question: Question;
  onComplete: (isCorrect: boolean) => void;
  color: string;
}

export default function TimelineGame({ question, onComplete, color }: Props) {
  const events = question.minigameData?.events ?? [];
  // Correct order: sorted by year ascending
  const correctOrder = [...events].sort((a, b) => a.year - b.year);

  // Shuffle on mount
  const [items] = useState(() => [...events].sort(() => Math.random() - 0.5));
  // User clicks items in order — selected array builds up
  const [selected, setSelected] = useState<number[]>([]); // indices into `items`
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleTap = useCallback((idx: number) => {
    if (submitted) return;
    setSelected(prev => {
      if (prev.includes(idx)) {
        // deselect — remove from end only if it's the last selected
        if (prev[prev.length - 1] === idx) return prev.slice(0, -1);
        return prev; // can't deselect middle items
      }
      const next = [...prev, idx];
      if (next.length === items.length) {
        // Auto-submit when all selected
        const userOrder = next.map(i => items[i]);
        const correct   = userOrder.every((e, i) => e.year === correctOrder[i].year);
        setIsCorrect(correct);
        setSubmitted(true);
        if (navigator.vibrate) navigator.vibrate(correct ? [40, 20, 80] : [60, 30, 60]);
        setTimeout(() => onComplete(correct), 1200);
      }
      return next;
    });
  }, [submitted, items, correctOrder, onComplete]);

  const rank = (idx: number) => selected.indexOf(idx) + 1; // 1-based position in selection

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="mb-1">
        <p className="text-xs font-semibold tracking-wider uppercase mb-0.5"
          style={{ color: `${color}99`, fontFamily: "var(--font-dm-sans)" }}>
          ① Touche dans l&apos;ordre chronologique
        </p>
        <p className="text-[10px] opacity-40"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Du plus ancien au plus récent
        </p>
      </div>

      {/* Event cards */}
      <div className="flex flex-col gap-2">
        {items.map((event, idx) => {
          const pos       = rank(idx);
          const isSelected = pos > 0;
          const showYear  = submitted;

          return (
            <motion.button key={idx}
              onClick={() => handleTap(idx)}
              whileTap={!submitted ? { scale: 0.97 } : {}}
              disabled={submitted}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-left relative"
              style={{
                background: submitted
                  ? (isCorrect ? "rgba(74,222,128,0.10)" : "rgba(248,113,113,0.08)")
                  : isSelected
                    ? `${color}18`
                    : "rgba(255,255,255,0.04)",
                borderColor: submitted
                  ? (isCorrect ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.35)")
                  : isSelected
                    ? `${color}55`
                    : "rgba(255,255,255,0.08)",
              }}
            >
              {/* Rank badge */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                style={{
                  background: isSelected ? color : "rgba(255,255,255,0.06)",
                  color: isSelected ? "#0a0f0d" : "rgba(248,244,236,0.3)",
                  fontFamily: "var(--font-bricolage)",
                }}>
                {isSelected ? pos : "?"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug"
                  style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {event.text}
                </p>
                {(showYear || event.hint) && (
                  <p className="text-[10px] mt-0.5"
                    style={{
                      color: showYear ? (isCorrect ? "#4ade80" : "#f87171") : `${color}88`,
                      fontFamily: "var(--font-dm-sans)",
                    }}>
                    {showYear ? `${event.year}` : event.hint}
                  </p>
                )}
              </div>

              {/* Result icon */}
              <AnimatePresence>
                {submitted && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    {isCorrect
                      ? <CheckCircle2 size={16} style={{ color: "#4ade80", flexShrink: 0 }} />
                      : <XCircle      size={16} style={{ color: "#f87171", flexShrink: 0 }} />
                    }
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Progress counter */}
      {!submitted && selected.length < items.length && (
        <p className="text-center text-xs opacity-40"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {selected.length}/{items.length} sélectionné{selected.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
