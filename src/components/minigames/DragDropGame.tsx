"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import type { Question } from "@/lib/game/types";

interface Props {
  question: Question;
  onComplete: (isCorrect: boolean) => void;
  color: string;
}

export default function DragDropGame({ question, onComplete, color }: Props) {
  // Shuffle items initially (positions come from minigameData.items or options text)
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
    // Signal result to quiz engine after brief animation
    setTimeout(() => onComplete(correct), 900);
  }, [order, correctOrder, onComplete]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed mb-1"
        style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
        Glisse pour remettre dans le bon ordre
      </p>

      <Reorder.Group axis="y" values={order} onReorder={setOrder} className="flex flex-col gap-2">
        {order.map((item, idx) => (
          <Reorder.Item
            key={item}
            value={item}
            dragListener={!submitted}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-grab active:cursor-grabbing"
            style={{
              background: submitted
                ? item === correctOrder[idx]
                  ? "rgba(74,222,128,0.09)"
                  : "rgba(248,113,113,0.09)"
                : "rgba(255,255,255,0.03)",
              borderColor: submitted
                ? item === correctOrder[idx]
                  ? "rgba(74,222,128,0.4)"
                  : "rgba(248,113,113,0.4)"
                : `${color}33`,
            }}
            whileDrag={{ scale: 1.03, zIndex: 50, boxShadow: `0 8px 32px rgba(0,0,0,0.4)` }}
          >
            {/* Drag handle */}
            <div className="flex flex-col gap-0.5 shrink-0 opacity-35">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-4 h-0.5 rounded-full" style={{ background: color }} />
              ))}
            </div>
            <span className="flex-1 text-sm font-medium"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {item}
            </span>
            {submitted && (
              <span className="text-base">
                {item === correctOrder[idx] ? "✓" : "✗"}
              </span>
            )}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Correct answer shown after submit if wrong */}
      <AnimatePresence>
        {submitted && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-2xl border p-3 overflow-hidden"
            style={{ background: "rgba(74,222,128,0.04)", borderColor: "rgba(74,222,128,0.2)" }}
          >
            <p className="text-xs mb-1 font-semibold" style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>
              Ordre correct :
            </p>
            <ol className="flex flex-col gap-1">
              {correctOrder.map((item, i) => (
                <li key={i} className="text-xs" style={{ color: "rgba(248,244,236,0.65)", fontFamily: "var(--font-dm-sans)" }}>
                  {i + 1}. {item}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {!submitted && (
        <motion.button
          onClick={submit}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-full py-3.5 text-sm font-semibold mt-2"
          style={{
            background: `linear-gradient(135deg,${color},#055C3F)`,
            color: "var(--text)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          Valider l&apos;ordre
        </motion.button>
      )}
    </div>
  );
}
