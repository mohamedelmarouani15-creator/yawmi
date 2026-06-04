"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { CheckCircle2, XCircle, GripVertical } from "lucide-react";
import type { Question } from "@/lib/game/types";

interface Props {
  question: Question;
  onComplete: (isCorrect: boolean) => void;
  color: string;
}

export default function DragDropGame({ question, onComplete, color }: Props) {
  const items = question.minigameData?.items ?? question.options.map(o => o.text);
  const correctOrder = question.options
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map(o => o.text);

  const [order, setOrder] = useState(() => [...items].sort(() => Math.random() - 0.5));
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const submit = useCallback(() => {
    const correct = order.every((item, i) => item === correctOrder[i]);
    setIsCorrect(correct);
    setSubmitted(true);
    if (navigator.vibrate) navigator.vibrate(correct ? [40, 20, 80] : [60, 30, 60]);
    setTimeout(() => onComplete(correct), 1000);
  }, [order, correctOrder, onComplete]);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold tracking-wider uppercase"
          style={{ color: `${color}99`, fontFamily: "var(--font-dm-sans)" }}>
          ⇅ Glisse pour ordonner
        </p>
        {submitted && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: isCorrect ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
              color: isCorrect ? "#4ade80" : "#f87171",
              border: `1px solid ${isCorrect ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)"}`,
              fontFamily: "var(--font-dm-sans)",
            }}>
            {isCorrect ? "✓ Parfait" : "✗ Raté"}
          </motion.span>
        )}
      </div>

      {/* Reorderable list */}
      <Reorder.Group axis="y" values={order} onReorder={submitted ? () => {} : setOrder}
        className="flex flex-col gap-2">
        {order.map((item, idx) => {
          const correct = submitted && item === correctOrder[idx];
          const wrong   = submitted && item !== correctOrder[idx];
          const targetIdx = submitted ? correctOrder.indexOf(item) : -1;

          return (
            <Reorder.Item key={item} value={item} dragListener={!submitted}>
              <motion.div
                layout
                className="flex items-center gap-3 rounded-2xl border px-3 py-3.5 relative overflow-hidden"
                style={{
                  background: correct
                    ? "rgba(74,222,128,0.1)"
                    : wrong
                    ? "rgba(248,113,113,0.08)"
                    : "rgba(255,255,255,0.04)",
                  borderColor: correct
                    ? "rgba(74,222,128,0.5)"
                    : wrong
                    ? "rgba(248,113,113,0.4)"
                    : `${color}33`,
                  cursor: submitted ? "default" : "grab",
                  boxShadow: correct ? "0 0 12px rgba(74,222,128,0.15)" : "none",
                }}
                whileDrag={{ scale: 1.04, zIndex: 50, boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${color}` }}
                transition={{ layout: { duration: 0.2 } }}
              >
                {/* Position number */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                  style={{
                    background: correct ? "rgba(74,222,128,0.2)" : wrong ? "rgba(248,113,113,0.15)" : `${color}18`,
                    color: correct ? "#4ade80" : wrong ? "#f87171" : color,
                    fontFamily: "var(--font-bricolage)",
                  }}>
                  {idx + 1}
                </div>

                {/* Drag handle */}
                {!submitted && (
                  <GripVertical size={16} style={{ color: `${color}55`, flexShrink: 0 }} />
                )}

                {/* Content */}
                <span className="flex-1 text-sm font-medium leading-snug"
                  style={{ color: correct ? "#4ade80" : wrong ? "#f87171" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {item}
                </span>

                {/* Status icon */}
                {submitted && (
                  <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}>
                    {correct
                      ? <CheckCircle2 size={18} style={{ color: "#4ade80" }} />
                      : <XCircle size={18} style={{ color: "#f87171" }} />
                    }
                  </motion.div>
                )}

                {/* Wrong: show where it should be */}
                {wrong && targetIdx >= 0 && (
                  <span className="text-[9px] font-bold"
                    style={{ color: "rgba(248,113,113,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                    → pos. {targetIdx + 1}
                  </span>
                )}
              </motion.div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Correct answer if wrong */}
      <AnimatePresence>
        {submitted && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border p-4 overflow-hidden"
            style={{ background: "rgba(74,222,128,0.05)", borderColor: "rgba(74,222,128,0.2)" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2"
              style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>
              ✦ Ordre correct
            </p>
            <ol className="flex flex-col gap-1.5">
              {correctOrder.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs"
                  style={{ color: "rgba(248,244,236,0.7)", fontFamily: "var(--font-dm-sans)" }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold shrink-0"
                    style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80" }}>{i + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      {!submitted && (
        <motion.button onClick={submit} whileTap={{ scale: 0.97 }}
          className="w-full rounded-full py-4 text-sm font-black mt-1 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg,${color},#055C3F)`, color: "#0a0f0d", fontFamily: "var(--font-bricolage)" }}>
          <motion.div className="absolute inset-0"
            style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.12) 50%,transparent 60%)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          ⚔ Valider l&apos;ordre
        </motion.button>
      )}
    </div>
  );
}
