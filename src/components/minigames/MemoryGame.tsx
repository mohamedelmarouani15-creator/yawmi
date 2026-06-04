"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/lib/game/types";

interface Props {
  question: Question;
  onComplete: (isCorrect: boolean) => void;
  color: string;
}

interface Card {
  id: string;
  text: string;
  translit?: string;
  pairId: number;
  isArabic: boolean;
}

export default function MemoryGame({ question, onComplete, color }: Props) {
  const pairs = question.minigameData?.pairs ?? [];

  const [cards] = useState<Card[]>(() => {
    const deck: Card[] = [];
    pairs.forEach((p, i) => {
      deck.push({ id: `f${i}`, text: p.front, translit: p.frontTranslit, pairId: i, isArabic: /[؀-ۿ]/.test(p.front) });
      deck.push({ id: `b${i}`, text: p.back,  translit: p.backTranslit,  pairId: i, isArabic: /[؀-ۿ]/.test(p.back) });
    });
    return deck.sort(() => Math.random() - 0.5);
  });

  const [flipped,   setFlipped]   = useState<string[]>([]);
  const [matched,   setMatched]   = useState<string[]>([]);
  const [locked,    setLocked]    = useState(false);
  const [errors,    setErrors]    = useState(0);
  const [finished,  setFinished]  = useState(false);
  const [lastMatch, setLastMatch] = useState<string[]>([]);

  const flip = useCallback((cardId: string) => {
    if (locked || flipped.includes(cardId) || matched.includes(cardId)) return;
    if (flipped.length === 1 && flipped[0] === cardId) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id)!);
      const isMatch = a.pairId === b.pairId;

      setTimeout(() => {
        if (isMatch) {
          const newMatched = [...matched, a.id, b.id];
          setMatched(newMatched);
          setLastMatch([a.id, b.id]);
          if (navigator.vibrate) navigator.vibrate([30, 20, 60]);
          if (newMatched.length === cards.length) setFinished(true);
        } else {
          setErrors(e => e + 1);
          if (navigator.vibrate) navigator.vibrate(50);
        }
        setFlipped([]);
        setLocked(false);
      }, 800);
    }
  }, [flipped, matched, locked, cards]);

  useEffect(() => {
    if (!finished) return;
    const isCorrect = errors <= 2;
    if (navigator.vibrate) navigator.vibrate(isCorrect ? [50, 30, 100, 30, 200] : [80]);
    const t = setTimeout(() => onComplete(isCorrect), 1400);
    return () => clearTimeout(t);
  }, [finished, errors, onComplete]);

  const isFlipped = (id: string) => flipped.includes(id) || matched.includes(id);
  const isMatched = (id: string) => matched.includes(id);
  const cols = cards.length <= 6 ? 2 : 3;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: `${color}99`, fontFamily: "var(--font-dm-sans)" }}>
          ✦ Trouve les paires
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80",
              border: "1px solid rgba(74,222,128,0.3)", fontFamily: "var(--font-dm-sans)" }}>
            {matched.length / 2}/{pairs.length} ✓
          </span>
          {errors > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(248,113,113,0.1)", color: "#f87171",
                border: "1px solid rgba(248,113,113,0.25)", fontFamily: "var(--font-dm-sans)" }}>
              {errors} ✗
            </span>
          )}
        </div>
      </div>

      {/* Cards grid */}
      <div className={`grid gap-2.5 ${cols === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {cards.map(card => {
          const flp = isFlipped(card.id);
          const mtc = isMatched(card.id);
          const justMatched = lastMatch.includes(card.id);

          return (
            <motion.div key={card.id}
              onClick={() => flip(card.id)}
              style={{ perspective: 1000, height: cols === 2 ? 96 : 80, cursor: mtc ? "default" : "pointer" }}
              whileTap={!mtc ? { scale: 0.94 } : {}}
            >
              <motion.div
                animate={{ rotateY: flp ? 180 : 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 220, damping: 24 }}
                style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", position: "relative" }}
              >
                {/* Card back */}
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border"
                  style={{
                    backfaceVisibility: "hidden",
                    background: `linear-gradient(135deg,${color}18,${color}08)`,
                    borderColor: `${color}40`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08)`,
                  }}>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                    style={{ color, fontSize: 22, opacity: 0.8 }}>✦</motion.span>
                </div>

                {/* Card front */}
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border px-2 gap-1"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: mtc
                      ? "linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.06))"
                      : "linear-gradient(135deg,rgba(12,30,20,0.97),rgba(8,22,14,0.98))",
                    borderColor: mtc ? "rgba(74,222,128,0.55)" : `${color}66`,
                    boxShadow: mtc
                      ? "0 0 16px rgba(74,222,128,0.2), inset 0 1px 0 rgba(74,222,128,0.15)"
                      : `inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }}
                  animate={justMatched ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-center leading-tight font-medium"
                    style={{
                      color: mtc ? "#4ade80" : "var(--text)",
                      fontSize: card.isArabic ? (cols === 2 ? 18 : 14) : (cols === 2 ? 12 : 10),
                      fontFamily: card.isArabic ? "var(--font-amiri)" : "var(--font-dm-sans)",
                      direction: card.isArabic ? "rtl" : "ltr",
                      maxWidth: "100%",
                    }}>
                    {card.text}
                  </span>
                  {card.translit && (
                    <span className="text-center italic"
                      style={{
                        color: mtc ? "rgba(74,222,128,0.55)" : "rgba(248,244,236,0.3)",
                        fontSize: 8,
                        fontFamily: "var(--font-dm-sans)",
                      }}>
                      {card.translit}
                    </span>
                  )}
                  {mtc && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.6)" }}>
                      <span style={{ fontSize: 10, color: "#0a0f0d" }}>✓</span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="flex flex-col items-center py-5 rounded-2xl"
            style={{
              background: errors <= 2 ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.08)",
              border: `1px solid ${errors <= 2 ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.25)"}`,
            }}>
            <span style={{ fontSize: 32 }}>{errors <= 2 ? "🧠" : "💪"}</span>
            <p className="text-lg font-black mt-2"
              style={{ color: errors <= 2 ? "#4ade80" : "#f87171", fontFamily: "var(--font-bricolage)" }}>
              {errors <= 2 ? "Mémoire parfaite !" : "Bien essayé !"}
            </p>
            <p className="text-xs mt-1"
              style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
              {errors} erreur{errors !== 1 ? "s" : ""} · {pairs.length} paires
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
