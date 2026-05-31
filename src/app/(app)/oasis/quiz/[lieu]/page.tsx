"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Star, Scissors, Shield, Zap, Snowflake } from "lucide-react";
import { useQuiz } from "@/hooks/useQuiz";
import { useGameState } from "@/hooks/useGameState";
import { getLocation } from "@/lib/game/locations";
import { getSageForLocation } from "@/lib/game/sages";
import { gameStorage } from "@/lib/game/game-storage";
import { POWERUPS } from "@/lib/game/powerups";
import { springTap } from "@/lib/motion";
import type { PowerUpType } from "@/lib/game/types";
import DragDropGame    from "@/components/minigames/DragDropGame";
import MemoryGame      from "@/components/minigames/MemoryGame";
import FillVerseGame   from "@/components/minigames/FillVerseGame";
import WhoAmIGame      from "@/components/minigames/WhoAmIGame";
import CalligraphyGame from "@/components/minigames/CalligraphyGame";
import { ArabicText }  from "@/components/ArabicText";

const OPTION_LABELS = ["A", "B", "C", "D"];

// ── Gold particles ─────────────────────────────────────────────
function GoldParticles({ show }: { show: boolean }) {
  if (!show) return null;
  const particles = Array.from({ length: 28 }, (_, i) => ({
    x: 30 + Math.random() * 330,
    delay: Math.random() * 0.5,
    color: ["var(--gold)", "#FFD700", "var(--text)", "#22c55e"][i % 4],
    size: 3 + Math.random() * 5,
    rotation: Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p, i) => (
        <motion.div key={i} className="absolute rounded-sm"
          style={{ left: p.x, top: -8, width: p.size, height: p.size, background: p.color }}
          initial={{ y: -8, opacity: 1, rotate: 0 }}
          animate={{ y: 750, opacity: 0, rotate: p.rotation }}
          transition={{ duration: 1.6 + Math.random() * 0.9, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ── Animated chest SVG ─────────────────────────────────────────
function AnimatedChest({ open, color }: { open: boolean; color: string }) {
  return (
    <svg width={120} height={90} viewBox="0 0 120 90">
      {/* Base */}
      <rect x={10} y={48} width={100} height={38} rx={6} fill={color} opacity={0.9} />
      <rect x={10} y={48} width={100} height={38} rx={6} fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth={2} />
      {/* Metal bands */}
      <rect x={10} y={60} width={100} height={5} fill="rgba(212,175,55,0.4)" />
      <rect x={54} y={48} width={12} height={38} fill="rgba(212,175,55,0.4)" />
      {/* Lock */}
      <rect x={52} y={63} width={16} height={13} rx={3} fill="rgba(212,175,55,0.8)" />
      <path d="M 56 63 Q 56 56 60 56 Q 64 56 64 63" fill="none" stroke="rgba(212,175,55,0.8)" strokeWidth={3} strokeLinecap="round" />

      {/* Lid */}
      <motion.g
        animate={{ rotateX: open ? -70 : 0, y: open ? -20 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 18 }}
        style={{ originX: "50%", originY: "100%" }}
      >
        <rect x={10} y={20} width={100} height={32} rx={6} fill={color} />
        <rect x={10} y={20} width={100} height={32} rx={6} fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth={2} />
        <path d="M 10 52 Q 60 42 110 52" fill="rgba(0,0,0,0.15)" />
        <rect x={10} y={34} width={100} height={5} fill="rgba(212,175,55,0.3)" />
        {/* Shine */}
        <path d="M 18 26 Q 30 22 45 26" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeLinecap="round" />
      </motion.g>

      {/* Glow when open */}
      {open && (
        <motion.ellipse cx={60} cy={52} rx={40} ry={12}
          fill="var(--gold)" opacity={0}
          animate={{ opacity: [0, 0.25, 0] }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
      )}
    </svg>
  );
}

// ── Circular timer ─────────────────────────────────────────────
function CircularTimer({ timeLeft, total, color }: { timeLeft: number; total: number; color: string }) {
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const progress = timeLeft / total;
  const urgentColor = timeLeft <= 5 ? "#f87171" : color;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
      <svg width={48} height={48} style={{ position: "absolute", top: 0, left: 0 }}>
        <circle cx={24} cy={24} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={3} />
        <motion.circle
          cx={24} cy={24} r={r}
          fill="none"
          stroke={urgentColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ rotate: -90, originX: "24px", originY: "24px" }}
          transition={{ duration: 0.4, ease: "linear" }}
        />
      </svg>
      <motion.span
        className="font-bold text-sm"
        style={{ fontFamily: "var(--font-bricolage)", color: urgentColor }}
        animate={timeLeft <= 5 ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
      >
        {timeLeft}
      </motion.span>
    </div>
  );
}

// ── Power-up button ────────────────────────────────────────────
const POWERUP_ICONS: Record<PowerUpType, React.ReactNode> = {
  joker50:     <Scissors size={14} />,
  bouclier:    <Shield size={14} />,
  double_xp:   <Zap size={14} />,
  time_freeze: <Snowflake size={14} />,
};

function PowerUpBtn({
  type, count, coins, active, disabled, onUse,
}: {
  type: PowerUpType; count: number; coins: number;
  active: boolean; disabled: boolean; onUse: () => void;
}) {
  const def = POWERUPS.find(p => p.id === type)!;
  const canAfford = coins >= def.cost && count > 0;
  const dim = disabled || !canAfford;

  return (
    <motion.button
      onClick={onUse}
      disabled={dim}
      whileTap={!dim ? { scale: 0.92 } : {}}
      transition={springTap}
      className="flex flex-col items-center gap-0.5 rounded-2xl border px-2.5 py-2 relative"
      style={{
        background: active ? def.bgColor : "rgba(255,255,255,0.03)",
        borderColor: active ? def.color : dim ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)",
        color: dim ? "rgba(248,244,236,0.25)" : def.color,
        opacity: dim ? 0.55 : 1,
        minWidth: 56,
      }}
    >
      {POWERUP_ICONS[type]}
      <span className="text-[9px] font-bold" style={{ fontFamily: "var(--font-dm-sans)" }}>
        {count}×
      </span>
      <span className="text-[8px] opacity-60" style={{ fontFamily: "var(--font-dm-sans)" }}>
        {def.cost}🪙
      </span>
      {active && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ border: `1px solid ${def.color}`, pointerEvents: "none" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

// ── Main quiz page ─────────────────────────────────────────────
export default function QuizPage() {
  const { lieu } = useParams() as { lieu: string };
  const router = useRouter();
  const { state, addReward, defeatSage, unlockLocation, refresh } = useGameState();
  const {
    session, startQuiz, selectAnswer, selectAnswerResult, confirmAnswer, usePowerUp,
    currentQuestion, correctCount, score, QUESTION_TIME,
  } = useQuiz(lieu);
  const [showResult, setShowResult] = useState(false);
  const [rewardSaved, setRewardSaved] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const location = getLocation(lieu);
  const sage     = getSageForLocation(lieu);
  const color    = location?.color ?? "#D4AF37";

  useEffect(() => { startQuiz(); }, []); // eslint-disable-line

  // Save rewards when quiz finishes
  useEffect(() => {
    if (!session?.finished || rewardSaved) return;
    setRewardSaved(true);

    const victory = (score ?? 0) >= (sage?.victoryRequirement ?? 7) / 10;

    const prevAchievements = [...(state?.achievements ?? [])];
    gameStorage.addXP(session.xpEarned);
    gameStorage.addCoins(session.coinsEarned);
    gameStorage.updateStreak();

    if (victory && sage) {
      gameStorage.addXP(sage.reward.xp);
      gameStorage.addCoins(sage.reward.coins);
      gameStorage.defeatSage(sage.id);
      // Add chest every other sage victory
      gameStorage.addChest();
      // Unlock next location
      const idx = ["medine","fes","cordoue","marrakech","damas","bagdad","samarcande","tombouctou","le_caire","la_mecque"].indexOf(lieu);
      const nextId = ["medine","fes","cordoue","marrakech","damas","bagdad","samarcande","tombouctou","le_caire","la_mecque"][idx + 1];
      if (nextId) gameStorage.unlockLocation(nextId);
    }

    // Check for perfect game
    if (session.answers.every(Boolean)) {
      gameStorage.unlockAchievement("perfect_game");
    }

    // New achievements since quiz started
    const newState = gameStorage.get();
    const gained = (newState.achievements ?? []).filter(a => !prevAchievements.includes(a));
    if (gained.length > 0) setNewAchievements(gained);

    refresh();
    setShowResult(true);
    if (navigator.vibrate) {
      navigator.vibrate(victory ? [50, 30, 100, 30, 200] : [80, 40, 80]);
    }
  }, [session?.finished, rewardSaved]); // eslint-disable-line

  const handleOpenChest = useCallback(() => {
    const result = gameStorage.openChest();
    if (!result) return;
    setChestOpen(true);
    setShowParticles(true);
    refresh();
    setTimeout(() => setShowParticles(false), 3000);
  }, [refresh]);

  const handlePowerUp = (type: PowerUpType) => {
    if (!state) return;
    usePowerUp(type);
    refresh();
  };

  // ── Loading ──────────────────────────────────────────────────
  if (!session || !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: "var(--gold)" }} />
      </div>
    );
  }

  const victory = (score ?? 0) >= (sage?.victoryRequirement ?? 7) / 10;
  const total   = session.questions.length;
  const finalCorrect = session.answers.filter(Boolean).length;

  // ── Result screen ────────────────────────────────────────────
  if (session.finished && showResult) {
    const chestAvail = gameStorage.get().chestsAvailable;

    return (
      <motion.main
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.4 }}
        className="flex flex-col items-center px-5 pt-14 pb-32 text-center"
        style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 60%)", minHeight: "100dvh" }}
      >
        <GoldParticles show={showParticles} />

        {/* Score circle */}
        <div className="relative mb-7">
          <svg width={160} height={160} className="-rotate-90">
            <circle cx={80} cy={80} r={68} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
            <motion.circle cx={80} cy={80} r={68} fill="none"
              stroke={victory ? "var(--gold)" : "var(--primary)"} strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 68}
              initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - finalCorrect / total) }}
              transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 1, delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: victory ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {finalCorrect}/{total}
            </span>
            <span className="text-xs opacity-45" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>bonnes réponses</span>
          </div>
        </div>

        {/* Message */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
          <p className="text-2xl font-bold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            {victory ? "Victoire !" : "Pas encore…"}
          </p>
          {sage && (
            <p className="text-sm opacity-55 leading-relaxed max-w-xs"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              &ldquo;{victory ? sage.dialogueSuccess : sage.dialogueFailure}&rdquo;
            </p>
          )}
        </motion.div>

        {/* Rewards row */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 24 }}
          className="flex gap-3 mb-6"
        >
          <div className="rounded-2xl border px-5 py-3.5 text-center"
            style={{ background: "rgba(212,175,55,0.07)", borderColor: "var(--border-gold)" }}>
            <p className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
              +{session.xpEarned + (victory && sage ? sage.reward.xp : 0)}
            </p>
            <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>XP</p>
          </div>
          <div className="rounded-2xl border px-5 py-3.5 text-center"
            style={{ background: "rgba(212,175,55,0.07)", borderColor: "var(--border-gold)" }}>
            <p className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
              +{session.coinsEarned + (victory && sage ? sage.reward.coins : 0)}
            </p>
            <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              <Star size={10} className="inline mr-0.5" fill="var(--gold)" style={{ color: "var(--gold)" }} />
              Pièces
            </p>
          </div>
        </motion.div>

        {/* Chest */}
        {chestAvail > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col items-center gap-2 mb-6"
          >
            <motion.div
              animate={!chestOpen ? { y: [0, -6, 0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <AnimatedChest open={chestOpen} color={color} />
            </motion.div>
            {!chestOpen ? (
              <motion.button
                onClick={handleOpenChest}
                whileTap={{ scale: 0.96 }} transition={springTap}
                className="rounded-full px-6 py-2.5 text-sm font-bold"
                style={{ background: `linear-gradient(135deg,${color},#055C3F)`, color: "var(--text)", fontFamily: "var(--font-bricolage)" }}
              >
                Ouvrir le coffre ({chestAvail} disponible{chestAvail > 1 ? "s" : ""})
              </motion.button>
            ) : (
              <p className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                ✦ Trésor découvert !
              </p>
            )}
          </motion.div>
        )}

        {/* New achievements */}
        <AnimatePresence>
          {newAchievements.map((id, i) => (
            <motion.div key={id}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ delay: 1.1 + i * 0.2 }}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3 mb-2 w-full max-w-xs"
              style={{ background: "var(--bg-gold)", borderColor: "rgba(212,175,55,0.25)" }}
            >
              <span className="text-xl">🏆</span>
              <div className="text-left">
                <p className="text-xs font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>Succès débloqué !</p>
                <p className="text-xs opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{id.replace(/_/g, " ")}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* CTA */}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
          <motion.button onClick={() => router.push("/oasis")}
            whileTap={{ scale: 0.96 }} transition={springTap}
            className="rounded-full py-3.5 text-sm font-bold"
            style={{ background: `linear-gradient(135deg,${color},#055C3F)`, color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
          >
            Retour à l&apos;Oasis
          </motion.button>
          {!victory && (
            <motion.button
              onClick={() => { setRewardSaved(false); setShowResult(false); setChestOpen(false); startQuiz(); }}
              whileTap={{ scale: 0.95 }} transition={springTap}
              className="rounded-full py-3.5 text-sm font-semibold border"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.65)", fontFamily: "var(--font-dm-sans)" }}
            >
              Réessayer
            </motion.button>
          )}
        </div>
      </motion.main>
    );
  }

  // ── Question active ──────────────────────────────────────────
  const progress = session.currentIndex / total;
  const liveState = gameStorage.get();
  const powerupCounts = liveState.powerupCounts;
  const liveCoins = liveState.coins;

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col px-5 pt-11 pb-6"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 55%)", minHeight: "100dvh" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.18)", color: "var(--text)" }}>
          <ArrowLeft size={15} />
        </motion.button>

        {/* Timer */}
        <CircularTimer timeLeft={session.timeLeft} total={QUESTION_TIME} color={color} />

        <div className="text-xs font-semibold opacity-45" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {session.currentIndex + 1}/{total}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div className="h-full rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.4 }}
            style={{ background: `linear-gradient(to right,${color},#D4AF37)` }}
          />
        </div>
      </div>

      {/* Category badge + power-up indicators */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{ background: `${color}1a`, color, fontFamily: "var(--font-dm-sans)", border: `1px solid ${color}33` }}>
          {currentQuestion.category}
        </span>
        <div className="flex items-center gap-1.5">
          {session.bouclierActive && (
            <span className="text-xs font-semibold" style={{ color: "#60a5fa", fontFamily: "var(--font-dm-sans)" }}>🛡 Actif</span>
          )}
          {session.doubleXpActive && (
            <span className="text-xs font-semibold" style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>⚡×2</span>
          )}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={session.currentIndex}
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.25 }}
        >
          {/* Question title — hidden for mini-games that handle it internally */}
          {!["drag_drop","memory","fill_verse","who_am_i","calligraphy"].includes(currentQuestion.type) && (
            <div className="mb-7">
              <p className="text-[19px] font-bold leading-snug"
                style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                {currentQuestion.question}
              </p>
              {/* Translittération si question en arabe */}
              {currentQuestion.transliteration && (
                <p className="mt-1.5 text-sm italic"
                  style={{ color: "rgba(212,175,55,0.5)", fontFamily: "var(--font-dm-sans)" }}>
                  {currentQuestion.transliteration}
                </p>
              )}
            </div>
          )}

          {/* ── Mini-game renderer ── */}
          {currentQuestion.type === "drag_drop" && !session.showResult && (
            <DragDropGame question={currentQuestion} color={color} onComplete={selectAnswerResult} />
          )}
          {currentQuestion.type === "memory" && !session.showResult && (
            <MemoryGame question={currentQuestion} color={color} onComplete={selectAnswerResult} />
          )}
          {currentQuestion.type === "fill_verse" && !session.showResult && (
            <FillVerseGame question={currentQuestion} color={color} onComplete={selectAnswerResult} />
          )}
          {currentQuestion.type === "who_am_i" && !session.showResult && (
            <WhoAmIGame question={currentQuestion} color={color} onComplete={selectAnswerResult} />
          )}
          {currentQuestion.type === "calligraphy" && !session.showResult && (
            <CalligraphyGame question={currentQuestion} color={color} onComplete={selectAnswerResult} />
          )}

          {/* ── MCQ / true_false options ── */}
          {["mcq","true_false","fill_in","reorder"].includes(currentQuestion.type) && (
          <div className="flex flex-col gap-2.5">
            {currentQuestion.options.map((option, idx) => {
              const hidden = session.hiddenOptions.includes(idx);
              const isSelected = session.selectedOption === idx;
              const isTimedOut  = session.selectedOption === -1;
              const isCorrect   = option.correct;
              const showFeedback = session.showResult;

              let borderColor = "rgba(255,255,255,0.07)";
              let bg = "rgba(255,255,255,0.02)";
              let textColor = "var(--text)";
              let icon = null;

              if (showFeedback && (isSelected || isTimedOut) && isCorrect) {
                borderColor = "rgba(74,222,128,0.5)"; bg = "rgba(74,222,128,0.09)"; textColor = "#4ade80";
                icon = <CheckCircle2 size={17} style={{ color: "#4ade80" }} />;
              } else if (showFeedback && isSelected && !isCorrect) {
                // Bouclier visual forgiveness
                if (session.bouclierActive && !session.bouclierUsed) {
                  borderColor = "rgba(96,165,250,0.5)"; bg = "rgba(96,165,250,0.09)"; textColor = "#60a5fa";
                  icon = <Shield size={17} style={{ color: "#60a5fa" }} />;
                } else {
                  borderColor = "rgba(248,113,113,0.5)"; bg = "rgba(248,113,113,0.09)"; textColor = "#f87171";
                  icon = <XCircle size={17} style={{ color: "#f87171" }} />;
                }
              } else if (showFeedback && isCorrect) {
                borderColor = "rgba(74,222,128,0.28)"; bg = "rgba(74,222,128,0.04)"; textColor = "#4ade80";
                icon = <CheckCircle2 size={17} style={{ color: "#4ade80" }} />;
              } else if (showFeedback && isTimedOut && !isCorrect) {
                borderColor = "rgba(248,113,113,0.28)"; bg = "transparent"; textColor = "var(--text-dim)";
              } else if (isSelected) {
                borderColor = color; bg = `${color}14`; textColor = color;
              }

              return (
                <motion.button key={idx}
                  onClick={() => !session.showResult && !hidden && selectAnswer(idx)}
                  whileTap={!session.showResult && !hidden ? { scale: 0.97 } : {}}
                  transition={springTap}
                  className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-left"
                  style={{
                    background: bg, borderColor,
                    opacity: hidden ? 0 : (showFeedback && !isSelected && !isCorrect ? 0.38 : 1),
                    pointerEvents: hidden ? "none" : "auto",
                    transition: "opacity 0.3s",
                  }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "rgba(255,255,255,0.05)", color: textColor, fontFamily: "var(--font-dm-sans)" }}>
                    {OPTION_LABELS[idx]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block"
                      style={{ color: textColor, fontFamily: "var(--font-dm-sans)" }}>
                      {option.text}
                    </span>
                    {option.transliteration && (
                      <span className="text-[10px] italic block mt-0.5"
                        style={{ color: `${textColor}70`, fontFamily: "var(--font-dm-sans)" }}>
                        {option.transliteration}
                      </span>
                    )}
                  </div>
                  {icon}
                </motion.button>
              );
            })}
          </div>
          )} {/* end MCQ block */}

          {/* Confirm button */}
          <AnimatePresence>
            {session.showResult && (
              <motion.button
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                onClick={confirmAnswer}
                whileTap={{ scale: 0.96 }}
                className="mt-5 w-full rounded-full py-3.5 text-sm font-semibold"
                style={{ background: `linear-gradient(135deg,${color},#055C3F)`, color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
              >
                {session.currentIndex < total - 1 ? "Question suivante →" : "Voir les résultats"}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Cultural capsule — moment "wow" de fierté culturelle */}
          <AnimatePresence>
            {session.showResult && currentQuestion.culturalCapsule && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, type: "spring", stiffness: 300, damping: 24 }}
                className="mt-4 overflow-hidden"
                style={{
                  borderRadius: 20,
                  background: "linear-gradient(135deg, rgba(30,20,5,0.97) 0%, rgba(20,14,3,0.97) 100%)",
                  border: "1px solid rgba(212,175,55,0.35)",
                  boxShadow: "0 0 28px rgba(212,175,55,0.1), inset 0 1px 0 rgba(212,175,55,0.08)",
                }}
              >
                {/* Header doré */}
                <div className="flex items-center gap-2.5 px-4 pt-4 pb-2.5"
                  style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.15, 1] }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "rgba(212,175,55,0.15)", fontSize: 16 }}
                  >
                    ✦
                  </motion.div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-0.5"
                      style={{ color: "rgba(212,175,55,0.55)", fontFamily: "var(--font-dm-sans)" }}>
                      Capsule culturelle
                    </p>
                    <p className="text-sm font-bold leading-tight"
                      style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
                      {currentQuestion.culturalCapsule.title}
                    </p>
                  </div>
                </div>
                {/* Corps */}
                <p className="px-4 pt-3 pb-4 text-sm leading-relaxed"
                  style={{ color: "rgba(248,244,236,0.75)", fontFamily: "var(--font-dm-sans)" }}>
                  {currentQuestion.culturalCapsule.text}
                </p>
                {/* Bottom ornament */}
                <div className="mx-4 mb-3 flex items-center gap-2">
                  <div className="flex-1 h-px" style={{ background: "var(--gold-faint)" }} />
                  <span className="text-[10px]" style={{ color: "rgba(212,175,55,0.35)" }}>ـ ✦ ـ</span>
                  <div className="flex-1 h-px" style={{ background: "var(--gold-faint)" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Explanation (si pas de capsule) */}
          <AnimatePresence>
            {session.showResult && currentQuestion.explanation && !currentQuestion.culturalCapsule && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.25, duration: 0.35 }}
                className="mt-4 rounded-2xl border p-4 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <p className="text-xs leading-relaxed opacity-55"
                  style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* ── Power-ups bar ── */}
      {!session.showResult && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mt-6"
        >
          {(["joker50", "bouclier", "double_xp", "time_freeze"] as PowerUpType[]).map(type => (
            <PowerUpBtn key={type}
              type={type}
              count={powerupCounts[type] ?? 0}
              coins={liveCoins}
              active={
                (type === "bouclier" && session.bouclierActive) ||
                (type === "double_xp" && session.doubleXpActive)
              }
              disabled={session.showResult}
              onUse={() => handlePowerUp(type)}
            />
          ))}
        </motion.div>
      )}
    </motion.main>
  );
}
