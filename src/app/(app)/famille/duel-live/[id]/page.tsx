"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Zap, Clock } from "lucide-react";
import { useLiveDuel } from "@/hooks/useLiveDuel";
import { springTap } from "@/lib/motion";

const OPTION_LABELS = ["A", "B", "C", "D"];
const COLOR = "#D4AF37";

// ── Circular countdown ────────────────────────────────────────────
function CountdownRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const progress = timeLeft / total;
  const danger = timeLeft <= 5;
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <svg width={56} height={56} className="absolute" style={{ rotate: "-90deg" }}>
        <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
        <motion.circle cx={28} cy={28} r={r} fill="none"
          stroke={danger ? "#f87171" : COLOR}
          strokeWidth={3} strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - progress) }}
          transition={{ duration: 0.8, ease: "linear" }}
        />
      </svg>
      <span className="relative text-lg font-bold z-10"
        style={{ color: danger ? "#f87171" : "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
        {timeLeft}
      </span>
    </div>
  );
}

export default function LiveDuelPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { state, error, answerQuestion, QUESTION_TIME } = useLiveDuel(id);

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6"
      style={{ background: "#061A12" }}>
      <p className="text-lg font-bold text-center" style={{ color: "#f87171", fontFamily: "var(--font-bricolage)" }}>
        {error}
      </p>
      <motion.button onClick={() => router.back()} whileTap={{ scale: 0.96 }} transition={springTap}
        className="rounded-full px-6 py-3 text-sm font-semibold"
        style={{ background: `${COLOR}20`, color: COLOR, fontFamily: "var(--font-dm-sans)", border: `1px solid ${COLOR}40` }}>
        Retour
      </motion.button>
    </div>
  );

  if (!state) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3"
      style={{ background: "#061A12" }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ width: 32, height: 32, border: `2px solid ${COLOR}`, borderTopColor: "transparent", borderRadius: "50%" }}
      />
      <p className="text-sm" style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
        Connexion au duel…
      </p>
    </div>
  );

  // ── Waiting room ──────────────────────────────────────────────
  if (state.status === "waiting" || state.status === "ready") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6"
        style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
          style={{ background: `${COLOR}18`, border: `2px solid ${COLOR}40` }}>
          ⚔️
        </motion.div>
        <div className="text-center">
          <p className="text-xl font-bold mb-2" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Duel Live
          </p>
          <p className="text-sm" style={{ color: "rgba(248,244,236,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            {state.status === "ready"
              ? "Les deux joueurs sont prêts !"
              : "En attente de l'adversaire…"}
          </p>
        </div>
        {state.status === "ready" && (
          <motion.p
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-sm" style={{ color: COLOR, fontFamily: "var(--font-dm-sans)" }}>
            Le duel commence…
          </motion.p>
        )}
        <p className="text-xs" style={{ color: "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)" }}>
          Code duel : <span style={{ color: COLOR }}>{id.slice(0, 8).toUpperCase()}</span>
        </p>
      </div>
    );
  }

  // ── Finished ──────────────────────────────────────────────────
  if (state.status === "finished") {
    const iWon = state.myScore > state.opponentScore;
    const tied = state.myScore === state.opponentScore;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6"
        style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="text-7xl">
          {tied ? "🤝" : iWon ? "🏆" : "💪"}
        </motion.div>
        <div className="text-center">
          <p className="text-2xl font-bold mb-1"
            style={{ color: iWon ? COLOR : tied ? "#60a5fa" : "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {tied ? "Égalité !" : iWon ? "Victoire !" : "Défaite !"}
          </p>
          <p className="text-sm" style={{ color: "rgba(248,244,236,0.55)", fontFamily: "var(--font-dm-sans)" }}>
            {tied ? "Vous êtes à égalité parfaite" : iWon ? "Tu as dominé ce duel" : "C'est pour la prochaine !"}
          </p>
        </div>

        {/* Score card */}
        <div className="w-full max-w-xs rounded-2xl border p-5 flex items-center justify-around"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: iWon ? "#4ade80" : "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
              {state.myScore}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>Toi</p>
          </div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 24 }}>—</div>
          <div className="text-center">
            <p className="text-3xl font-bold"
              style={{ color: !iWon && !tied ? "#4ade80" : "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
              {state.opponentScore}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
              {state.opponentName || "Adversaire"}
            </p>
          </div>
        </div>

        <motion.button onClick={() => router.push("/famille")} whileTap={{ scale: 0.96 }} transition={springTap}
          className="w-full max-w-xs rounded-full py-4 text-sm font-semibold"
          style={{ background: `linear-gradient(135deg,${COLOR},#8B6914)`, color: "#0A1A0E", fontFamily: "var(--font-dm-sans)" }}>
          Retour à la famille
        </motion.button>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────
  const question = state.questions[state.currentQuestion];
  if (!question) return null;

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col px-5 pt-11 pb-6 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 55%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.18)", color: "#F8F4EC" }}>
          <ArrowLeft size={15} />
        </motion.button>

        {/* Scoreboard */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: "#4ade80", fontFamily: "var(--font-bricolage)" }}>
              {state.myScore}
            </p>
            <p className="text-[10px]" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>Toi</p>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={14} style={{ color: COLOR }} />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: "#f87171", fontFamily: "var(--font-bricolage)" }}>
              {state.opponentScore}
            </p>
            <p className="text-[10px]" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>Eux</p>
          </div>
        </div>

        <CountdownRing timeLeft={state.timeLeft} total={QUESTION_TIME} />
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${((state.currentQuestion + 1) / state.questions.length) * 100}%`, background: COLOR }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: "rgba(248,244,236,0.35)", fontFamily: "var(--font-dm-sans)" }}>
            Question {state.currentQuestion + 1}/{state.questions.length}
          </span>
          {state.opponentAnswered && (
            <span className="text-[10px]" style={{ color: "#60a5fa", fontFamily: "var(--font-dm-sans)" }}>
              ✓ Adversaire a répondu
            </span>
          )}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={state.currentQuestion}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}>
          <p className="text-[18px] font-bold leading-snug mb-6"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {question.question}
          </p>
          <div className="flex flex-col gap-2.5">
            {question.options.map((opt, idx) => {
              const isSelected = state.myAnswer === idx;
              const isCorrect  = opt.correct;
              const revealed   = state.myAnswer !== null;
              let bg = "rgba(255,255,255,0.02)";
              let border = "rgba(255,255,255,0.07)";
              let textC  = "#F8F4EC";

              if (revealed) {
                if (isCorrect) { bg = "rgba(74,222,128,0.09)"; border = "rgba(74,222,128,0.4)"; textC = "#4ade80"; }
                else if (isSelected) { bg = "rgba(248,113,113,0.09)"; border = "rgba(248,113,113,0.4)"; textC = "#f87171"; }
              } else if (isSelected) {
                bg = `${COLOR}14`; border = COLOR; textC = COLOR;
              }

              return (
                <motion.button
                  key={idx}
                  onClick={() => state.myAnswer === null && answerQuestion(idx)}
                  whileTap={state.myAnswer === null ? { scale: 0.97 } : {}}
                  className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-left"
                  style={{ background: bg, borderColor: border }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "rgba(255,255,255,0.05)", color: textC, fontFamily: "var(--font-dm-sans)" }}>
                    {OPTION_LABELS[idx]}
                  </span>
                  <span className="flex-1 text-sm font-medium"
                    style={{ color: textC, fontFamily: "var(--font-dm-sans)" }}>
                    {opt.text}
                  </span>
                  {revealed && isCorrect && <CheckCircle2 size={16} style={{ color: "#4ade80" }} />}
                  {revealed && isSelected && !isCorrect && <XCircle size={16} style={{ color: "#f87171" }} />}
                </motion.button>
              );
            })}
          </div>

          {/* Waiting for opponent */}
          <AnimatePresence>
            {state.myAnswer !== null && !state.opponentAnswered && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-5 text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock size={14} style={{ color: "rgba(248,244,236,0.35)" }} />
                  <p className="text-xs" style={{ color: "rgba(248,244,236,0.35)", fontFamily: "var(--font-dm-sans)" }}>
                    En attente de l&apos;adversaire…
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </motion.main>
  );
}
