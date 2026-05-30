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
  pairId: number;
  isArabic: boolean;
}

export default function MemoryGame({ question, onComplete, color }: Props) {
  const pairs = question.minigameData?.pairs ?? [];

  // Build shuffled card deck
  const [cards] = useState<Card[]>(() => {
    const deck: Card[] = [];
    pairs.forEach((p, i) => {
      deck.push({ id: `f${i}`, text: p.front, pairId: i, isArabic: /[؀-ۿ]/.test(p.front) });
      deck.push({ id: `b${i}`, text: p.back,  pairId: i, isArabic: /[؀-ۿ]/.test(p.back) });
    });
    return deck.sort(() => Math.random() - 0.5);
  });

  const [flipped, setFlipped]   = useState<string[]>([]);
  const [matched, setMatched]   = useState<string[]>([]);
  const [locked, setLocked]     = useState(false);
  const [errors, setErrors]     = useState(0);
  const [finished, setFinished] = useState(false);

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
          if (newMatched.length === cards.length) setFinished(true);
        } else {
          setErrors(e => e + 1);
        }
        setFlipped([]);
        setLocked(false);
      }, 900);
    }
  }, [flipped, matched, locked, cards]);

  useEffect(() => {
    if (!finished) return;
    const isCorrect = errors <= 2; // tolérance 2 erreurs
    const t = setTimeout(() => onComplete(isCorrect), 1200);
    return () => clearTimeout(t);
  }, [finished, errors, onComplete]);

  const isFlipped  = (id: string) => flipped.includes(id) || matched.includes(id);
  const isMatched  = (id: string) => matched.includes(id);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs" style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
          Retourne les cartes pour trouver les paires
        </p>
        <span className="text-xs font-semibold" style={{ color: errors > 2 ? "#f87171" : color, fontFamily: "var(--font-dm-sans)" }}>
          {matched.length / 2}/{pairs.length} ✓ · {errors} ✗
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {cards.map(card => (
          <motion.div
            key={card.id}
            onClick={() => flip(card.id)}
            style={{
              height: 72,
              cursor: isMatched(card.id) ? "default" : "pointer",
              perspective: 800,
            }}
            whileTap={!isMatched(card.id) ? { scale: 0.96 } : {}}
          >
            <motion.div
              animate={{ rotateY: isFlipped(card.id) ? 180 : 0 }}
              transition={{ duration: 0.35, type: "spring", stiffness: 260, damping: 22 }}
              style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", position: "relative" }}
            >
              {/* Back face (hidden) */}
              <div
                className="absolute inset-0 flex items-center justify-center rounded-xl border"
                style={{
                  backfaceVisibility: "hidden",
                  background: `${color}18`,
                  borderColor: `${color}40`,
                }}
              >
                <span style={{ color, fontSize: 20 }}>✦</span>
              </div>

              {/* Front face (content) */}
              <div
                className="absolute inset-0 flex items-center justify-center rounded-xl border px-1"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: isMatched(card.id) ? "rgba(74,222,128,0.1)" : "rgba(15,35,22,0.95)",
                  borderColor: isMatched(card.id) ? "rgba(74,222,128,0.45)" : `${color}55`,
                }}
              >
                <span
                  className="text-center leading-tight"
                  style={{
                    color: isMatched(card.id) ? "#4ade80" : "#F8F4EC",
                    fontSize: card.isArabic ? 13 : 10,
                    fontFamily: card.isArabic ? "var(--font-amiri)" : "var(--font-dm-sans)",
                    direction: card.isArabic ? "rtl" : "ltr",
                  }}
                >
                  {card.text}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-3 rounded-2xl"
            style={{ background: errors <= 2 ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)" }}
          >
            <p className="text-base font-bold" style={{ color: errors <= 2 ? "#4ade80" : "#f87171", fontFamily: "var(--font-bricolage)" }}>
              {errors <= 2 ? "Excellent !" : "Bien essayé !"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(248,244,236,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              {errors} erreur{errors !== 1 ? "s" : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
