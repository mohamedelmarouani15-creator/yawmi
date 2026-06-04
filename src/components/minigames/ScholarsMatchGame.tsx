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

export default function ScholarsMatchGame({ question, onComplete, color }: Props) {
  const pairs = question.minigameData?.matchPairs ?? [];
  const scholars = pairs.map(p => p.scholar);
  const works    = [...pairs.map(p => p.work)].sort(() => Math.random() - 0.5); // shuffle works

  const [selectedScholar, setSelectedScholar] = useState<number | null>(null);
  const [matched,  setMatched]  = useState<Record<number, number>>({}); // scholarIdx → workIdx
  const [errors,   setErrors]   = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const matchedWorks = new Set(Object.values(matched));

  const handleScholar = useCallback((idx: number) => {
    if (submitted || matched[idx] !== undefined) return;
    setSelectedScholar(prev => prev === idx ? null : idx);
  }, [submitted, matched]);

  const handleWork = useCallback((workIdx: number) => {
    if (submitted || matchedWorks.has(workIdx) || selectedScholar === null) return;
    const scholar = scholars[selectedScholar];
    const work    = works[workIdx];
    const correct = pairs.find(p => p.scholar === scholar)?.work === work;

    if (correct) {
      const newMatched = { ...matched, [selectedScholar]: workIdx };
      setMatched(newMatched);
      setSelectedScholar(null);
      if (Object.keys(newMatched).length === pairs.length) {
        // All matched — check all correct
        const allRight = Object.entries(newMatched).every(([sIdx, wIdx]) => {
          return pairs.find(p => p.scholar === scholars[parseInt(sIdx)])?.work === works[wIdx];
        });
        setIsCorrect(allRight);
        setSubmitted(true);
        if (navigator.vibrate) navigator.vibrate(allRight ? [40, 20, 80] : [60, 30, 60]);
        setTimeout(() => onComplete(allRight), 1000);
      }
    } else {
      const key = `${selectedScholar}-${workIdx}`;
      setErrors(prev => new Set([...prev, key]));
      setSelectedScholar(null);
      setTimeout(() => setErrors(prev => { const n = new Set(prev); n.delete(key); return n; }), 600);
    }
  }, [submitted, matchedWorks, selectedScholar, scholars, works, pairs, matched, onComplete]);

  const getMatchedWorkForScholar = (sIdx: number) => matched[sIdx] !== undefined ? works[matched[sIdx]] : null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold tracking-wider uppercase mb-1"
        style={{ color: `${color}99`, fontFamily: "var(--font-dm-sans)" }}>
        🔗 Relie chaque savant à son œuvre
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* Scholars column */}
        <div className="flex flex-col gap-2">
          <p className="text-[9px] uppercase tracking-widest opacity-40 text-center mb-1"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Savants</p>
          {scholars.map((s, i) => {
            const isMatched  = matched[i] !== undefined;
            const isSelected = selectedScholar === i;
            return (
              <motion.button key={i} onClick={() => handleScholar(i)}
                whileTap={!isMatched ? { scale: 0.96 } : {}}
                disabled={isMatched || submitted}
                className="rounded-2xl border px-3 py-2.5 text-left text-xs font-semibold leading-tight"
                style={{
                  background: isMatched ? `${color}15` : isSelected ? `${color}22` : "rgba(255,255,255,0.04)",
                  borderColor: isMatched ? `${color}55` : isSelected ? color : "rgba(255,255,255,0.08)",
                  color: isMatched ? color : isSelected ? color : "rgba(248,244,236,0.7)",
                  fontFamily: "var(--font-dm-sans)",
                }}>
                {s}
                {isMatched && <span className="block text-[9px] opacity-60 mt-0.5">{getMatchedWorkForScholar(i)}</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Works column */}
        <div className="flex flex-col gap-2">
          <p className="text-[9px] uppercase tracking-widest opacity-40 text-center mb-1"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Œuvres</p>
          {works.map((w, i) => {
            const isUsed  = matchedWorks.has(i);
            const hasError = [...errors].some(e => e.endsWith(`-${i}`));
            return (
              <motion.button key={i} onClick={() => handleWork(i)}
                whileTap={!isUsed ? { scale: 0.96 } : {}}
                disabled={isUsed || submitted || selectedScholar === null}
                animate={hasError ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={hasError ? { duration: 0.3 } : {}}
                className="rounded-2xl border px-3 py-2.5 text-left text-xs font-semibold leading-tight"
                style={{
                  background: isUsed ? "rgba(74,222,128,0.08)" : hasError ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.04)",
                  borderColor: isUsed ? "rgba(74,222,128,0.4)" : hasError ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.08)",
                  color: isUsed ? "#4ade80" : hasError ? "#f87171" : "rgba(248,244,236,0.7)",
                  fontFamily: "var(--font-dm-sans)",
                  opacity: isUsed ? 0.6 : 1,
                }}>
                {w}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl"
            style={{ background: isCorrect ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)" }}>
            {isCorrect
              ? <><CheckCircle2 size={16} style={{ color: "#4ade80" }} /><span className="text-sm font-bold" style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>Parfait !</span></>
              : <><XCircle      size={16} style={{ color: "#f87171" }} /><span className="text-sm font-bold" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>Essaie encore</span></>
            }
          </motion.div>
        )}
      </AnimatePresence>

      {!submitted && selectedScholar !== null && (
        <p className="text-center text-[10px] opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Sélectionne l&apos;œuvre de {scholars[selectedScholar]}
        </p>
      )}
    </div>
  );
}
