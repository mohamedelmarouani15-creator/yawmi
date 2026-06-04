"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Swords } from "lucide-react";
import { QUESTIONS } from "@/lib/game/questions";
import { springTap } from "@/lib/motion";
import type { DuelData } from "@/hooks/useFamily";
import type { Question } from "@/lib/game/types";

interface Props {
  duel: DuelData;
  onClose: () => void;
  onScore: (taskId: string, score: number) => Promise<void>;
}

export default function DuelQuizModal({ duel, onClose, onScore }: Props) {
  const [qIdx,       setQIdx]       = useState(0);
  const [answers,    setAnswers]    = useState<(boolean | null)[]>(new Array(duel.questionIds.length).fill(null));
  const [selected,   setSelected]   = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [done,       setDone]       = useState(false);
  const [pool,       setPool]       = useState<Question[]>([]);

  // Load questions: cache (Supabase-synced) → local fallback
  useEffect(() => {
    try {
      const raw = localStorage.getItem("yawmi_q_pool_v1");
      if (raw) {
        const cached = JSON.parse(raw) as { questions: Question[] };
        if (cached.questions?.length) { setPool(cached.questions); return; }
      }
    } catch { /* ignore */ }
    setPool(QUESTIONS as Question[]);
  }, []);

  const total    = duel.questionIds.length;
  const score    = answers.filter(Boolean).length;
  const question = pool.find(q => q.id === duel.questionIds[qIdx])
    ?? QUESTIONS.find(q => q.id === duel.questionIds[qIdx]) as Question | undefined;

  function handleSelect(idx: number) {
    if (showResult || !question) return;
    setSelected(idx);
    setShowResult(true);
  }

  async function handleNext() {
    const correct = question?.options[selected ?? -1]?.correct ?? false;
    const next    = [...answers];
    next[qIdx]    = correct;

    if (qIdx === total - 1) {
      const finalScore = next.filter(Boolean).length;
      setAnswers(next);
      setDone(true);
      await onScore(duel.taskId, finalScore);
    } else {
      setAnswers(next);
      setQIdx(i => i + 1);
      setSelected(null);
      setShowResult(false);
    }
  }

  const opponent = duel.isChallenger ? duel.challengedName : duel.challengerName;

  // Questions still loading from cache
  if (pool.length === 0) return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="rounded-full border-2" style={{ width: 36, height: 36, borderColor: "var(--gold)", borderTopColor: "transparent" }} />
      <p className="text-sm opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Chargement des questions…</p>
    </div>
  );

  if (done) {
    const theirScore = duel.isChallenger ? duel.challengedScore : duel.challengerScore;
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center px-5 pt-16 pb-32 text-center"
        style={{ minHeight: "100dvh", background: "var(--bg)" }}>
        <div className="text-5xl mb-4">
          {theirScore === null ? "⏳" : score > theirScore ? "🏆" : score === theirScore ? "🤝" : "😔"}
        </div>
        <p className="text-2xl font-bold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          {theirScore === null ? "Score enregistré !" : score > theirScore ? "Victoire !" : score === theirScore ? "Égalité !" : "Défaite…"}
        </p>
        <p className="text-sm opacity-60 mb-6" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Ton score : <strong style={{ color: "var(--gold)" }}>{score}/{total}</strong>
          {theirScore !== null && ` · ${opponent} : ${theirScore}/${total}`}
          {theirScore === null && ` · En attente de ${opponent}`}
        </p>
        <motion.button onClick={onClose} whileTap={{ scale: 0.96 }} transition={springTap}
          className="rounded-full px-8 py-3.5 text-sm font-bold"
          style={{ background: "var(--gradient-primary)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Retour à la famille
        </motion.button>
      </motion.div>
    );
  }

  if (!question) return (
    <div className="flex flex-col items-center justify-center gap-4 px-8 text-center" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <p className="text-4xl">😕</p>
      <p className="text-base font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>Question introuvable</p>
      <p className="text-sm opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Question {qIdx + 1} n&apos;a pas pu être chargée.</p>
      <motion.button onClick={onClose} whileTap={{ scale: 0.96 }} className="rounded-full px-6 py-2.5 text-sm font-bold"
        style={{ background: "var(--gradient-primary)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
        Retour
      </motion.button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col px-5 pt-11 pb-8"
      style={{ minHeight: "100dvh", background: "var(--bg)" }}>

      <div className="flex items-center justify-between mb-4">
        <button onClick={onClose} className="text-xs opacity-40"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>✕ Annuler</button>
        <div className="text-center">
          <p className="text-xs font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
            DUEL · {opponent}
          </p>
          <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Question {qIdx + 1}/{total}
          </p>
        </div>
        <span className="text-xs font-bold" style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>
          {score} ✓
        </span>
      </div>

      <div className="h-1.5 rounded-full overflow-hidden mb-6" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full"
          style={{ width: `${(qIdx / total) * 100}%`, background: "var(--gradient-bar)" }} />
      </div>

      <span className="inline-block self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ background: "rgba(212,175,55,0.1)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)", border: "1px solid rgba(212,175,55,0.2)" }}>
        {question.category}
      </span>

      <p className="text-lg font-bold leading-snug mb-6"
        style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
        {question.question}
      </p>

      <div className="flex flex-col gap-2.5">
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect  = opt.correct;
          let bg = "rgba(255,255,255,0.03)", border = "rgba(255,255,255,0.07)", color = "var(--text)";
          let icon = null;
          if (showResult && isCorrect) {
            bg = "rgba(74,222,128,0.1)"; border = "rgba(74,222,128,0.4)"; color = "#4ade80";
            icon = <CheckCircle2 size={16} style={{ color: "#4ade80" }} />;
          } else if (showResult && isSelected && !isCorrect) {
            bg = "rgba(248,113,113,0.1)"; border = "rgba(248,113,113,0.4)"; color = "#f87171";
            icon = <XCircle size={16} style={{ color: "#f87171" }} />;
          } else if (isSelected) {
            bg = "rgba(212,175,55,0.1)"; border = "var(--gold)"; color = "var(--gold)";
          }
          return (
            <motion.button key={idx} onClick={() => handleSelect(idx)} disabled={showResult}
              whileTap={!showResult ? { scale: 0.97 } : {}} transition={springTap}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left"
              style={{ background: bg, borderColor: border, opacity: showResult && !isSelected && !isCorrect ? 0.4 : 1 }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.06)", color, fontFamily: "var(--font-dm-sans)" }}>
                {["A","B","C","D"][idx]}
              </span>
              <span className="flex-1 text-sm font-medium" style={{ color, fontFamily: "var(--font-dm-sans)" }}>
                {opt.text}
              </span>
              {icon}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col gap-3">
            {(question.explanation || question.culturalCapsule) && (
              <div className="rounded-2xl border p-4"
                style={{
                  background: question.culturalCapsule ? "rgba(212,175,55,0.05)" : "rgba(255,255,255,0.03)",
                  borderColor: question.culturalCapsule ? "rgba(212,175,55,0.18)" : "rgba(255,255,255,0.07)",
                }}>
                {question.culturalCapsule && (
                  <p className="text-xs font-bold mb-1.5" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                    ✦ {question.culturalCapsule.title}
                  </p>
                )}
                <p className="text-sm leading-relaxed opacity-80"
                  style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {question.culturalCapsule?.text ?? question.explanation}
                </p>
              </div>
            )}
            <motion.button onClick={handleNext} whileTap={{ scale: 0.96 }} transition={springTap}
              className="w-full rounded-full py-3.5 text-sm font-bold"
              style={{ background: "var(--gradient-primary)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              <Swords size={14} className="inline mr-2" />
              {qIdx < total - 1 ? "Question suivante →" : "Voir mon score"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
