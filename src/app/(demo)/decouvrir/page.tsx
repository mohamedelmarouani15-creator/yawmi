"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

// 3 questions statiques de catégorie religion, niveau facile
// tirées de src/lib/game/questions.ts
const DEMO_QUESTIONS = [
  {
    id: "demo_1",
    question: "Combien y a-t-il de piliers de l'Islam ?",
    options: [
      { text: "3", correct: false },
      { text: "4", correct: false },
      { text: "5", correct: true },
      { text: "6", correct: false },
    ],
  },
  {
    id: "demo_2",
    question: "Dans quelle ville est né le Prophète Muhammad ﷺ ?",
    options: [
      { text: "Médine", correct: false },
      { text: "Jérusalem", correct: false },
      { text: "La Mecque", correct: true },
      { text: "Taif", correct: false },
    ],
  },
  {
    id: "demo_3",
    question: "Combien de sourates compte le Coran ?",
    options: [
      { text: "99", correct: false },
      { text: "112", correct: false },
      { text: "114", correct: true },
      { text: "120", correct: false },
    ],
  },
] as const;

type DemoQuestion = (typeof DEMO_QUESTIONS)[number];

function QuestionStep({
  question,
  index,
  total,
  onAnswer,
}: {
  question: DemoQuestion;
  index: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleReveal() {
    if (selected === null) return;
    setRevealed(true);
    const correct = question.options[selected]?.correct ?? false;
    setTimeout(() => onAnswer(correct), 1000);
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-5"
    >
      {/* Compteur */}
      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full"
            style={{ background: i < index ? "#055C3F" : i === index ? "var(--gold)" : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>

      <p className="text-xs opacity-40 uppercase tracking-widest"
        style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
        Question {index + 1} / {total}
      </p>

      <p className="text-xl font-bold leading-snug"
        style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
        {question.question}
      </p>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, idx) => {
          let bg     = "rgba(255,255,255,0.03)";
          let border = "rgba(255,255,255,0.08)";
          let textC  = "var(--text)";

          if (revealed) {
            if (opt.correct) { bg = "rgba(74,222,128,0.09)"; border = "rgba(74,222,128,0.4)"; textC = "#4ade80"; }
            else if (selected === idx) { bg = "rgba(248,113,113,0.09)"; border = "rgba(248,113,113,0.35)"; textC = "#f87171"; }
          } else if (selected === idx) {
            bg = "rgba(212,175,55,0.1)"; border = "var(--gold)"; textC = "var(--gold)";
          }

          return (
            <motion.button
              key={idx}
              onClick={() => { if (!revealed) setSelected(idx); }}
              disabled={revealed}
              whileTap={!revealed ? { scale: 0.97 } : {}}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left"
              style={{ background: bg, borderColor: border }}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.06)", color: textC, fontFamily: "var(--font-dm-sans)" }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-sm" style={{ color: textC, fontFamily: "var(--font-dm-sans)" }}>
                {opt.text}
              </span>
              {revealed && opt.correct && <CheckCircle2 size={16} className="ml-auto" style={{ color: "#4ade80" }} />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border px-4 py-3 overflow-hidden"
            style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.18)" }}>
            <p className="text-sm" style={{ color: "rgba(212,175,55,0.85)", fontFamily: "var(--font-dm-sans)" }}>
              {question.options[selected ?? 0]?.correct
                ? "Exact. Bien joué !"
                : `La bonne réponse est : ${question.options.find(o => o.correct)?.text ?? "—"}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed && (
        <motion.button
          onClick={handleReveal}
          disabled={selected === null}
          whileTap={selected !== null ? { scale: 0.97 } : {}}
          className="w-full rounded-full py-4 text-sm font-semibold"
          style={{
            background: selected !== null
              ? "linear-gradient(135deg,#D4AF37,#8B6914)"
              : "rgba(255,255,255,0.06)",
            color: selected !== null ? "#0A1A0E" : "rgba(248,244,236,0.3)",
            fontFamily: "var(--font-dm-sans)",
          }}>
          Valider
        </motion.button>
      )}
    </motion.div>
  );
}

export default function DecouvrirPage() {
  const [step, setStep]   = useState<"intro" | "quiz" | "done">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore]   = useState(0);

  function handleAnswer(correct: boolean) {
    if (correct) setScore(s => s + 1);
    if (qIndex < DEMO_QUESTIONS.length - 1) {
      setQIndex(i => i + 1);
    } else {
      setStep("done");
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#061A12] px-6 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(5,92,63,0.18) 0%, transparent 65%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <p className="text-4xl font-extrabold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            Yawmi
          </p>
          <p className="text-xl mt-0.5" style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)" }}>يومي</p>
          <p className="mt-2 text-sm opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Essaie 3 questions sans créer de compte
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Intro ── */}
          {step === "intro" && (
            <motion.div key="intro"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="flex flex-col gap-6 text-center">
              <div className="rounded-3xl border p-6"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.2)" }}>
                <Sparkles size={36} className="mx-auto mb-4" style={{ color: "var(--gold)" }} />
                <p className="text-base font-semibold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                  Découvrez Yawmi
                </p>
                <p className="text-sm opacity-55 leading-relaxed" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Pratiques islamiques, apprentissage, histoires coraniques et jeu éducatif — tout pour votre famille.
                </p>
              </div>
              <button onClick={() => setStep("quiz")}
                className="flex items-center justify-center gap-2 w-full rounded-full py-4 text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#D4AF37,#8B6914)", color: "#0A1A0E", fontFamily: "var(--font-dm-sans)" }}>
                Commencer les questions <ArrowRight size={16} />
              </button>
              <Link href="/connexion"
                className="text-sm opacity-50 hover:opacity-80 transition-opacity"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Déjà un compte ? Se connecter
              </Link>
            </motion.div>
          )}

          {/* ── Quiz ── */}
          {step === "quiz" && (
            <motion.div key={`q${qIndex}`}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <QuestionStep
                question={DEMO_QUESTIONS[qIndex]}
                index={qIndex}
                total={DEMO_QUESTIONS.length}
                onAnswer={handleAnswer}
              />
            </motion.div>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 text-center">
              <motion.p
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ fontSize: 60 }}>
                {score === 3 ? "🏆" : score >= 2 ? "✦" : "📖"}
              </motion.p>
              <div>
                <p className="text-xl font-bold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                  {score === 3 ? "Parfait !" : score >= 2 ? "Très bien !" : "Bonne tentative !"}
                </p>
                <p className="text-base font-semibold mb-1" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
                  {score} / 3
                </p>
                <p className="text-sm opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Créez un compte pour accéder à toutes les fonctionnalités et sauvegarder votre progression.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link href="/inscription"
                  className="flex items-center justify-center gap-2 w-full rounded-full py-4 text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg,#D4AF37,#8B6914)", color: "#0A1A0E", fontFamily: "var(--font-dm-sans)" }}>
                  Créer mon compte <ArrowRight size={16} />
                </Link>
                <Link href="/connexion"
                  className="w-full rounded-full py-3 text-sm font-semibold text-center"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                  J&apos;ai déjà un compte
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
