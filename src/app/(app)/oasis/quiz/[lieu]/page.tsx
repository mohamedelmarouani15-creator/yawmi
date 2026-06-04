"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Scissors, Shield, Zap, Snowflake, Trophy, Coins, Swords } from "lucide-react";
import { useQuiz } from "@/hooks/useQuiz";
import { useGameState } from "@/hooks/useGameState";
import { getLocation } from "@/lib/game/locations";
import { getSageForLocation } from "@/lib/game/sages";
import { gameStorage } from "@/lib/game/game-storage";
import { POWERUPS } from "@/lib/game/powerups";
import { springTap } from "@/lib/motion";
import { storage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { ageGroupToMode } from "@/hooks/useAgeMode";
import StoryPrologue from "@/components/StoryPrologue";
import { SagePortrait } from "@/components/SagePortrait";
import type { PowerUpType } from "@/lib/game/types";
import { useT } from "@/hooks/useT";
import { useLang } from "@/hooks/useLang";
import { getQuestionLang } from "@/lib/content-i18n";
import { pick } from "@/lib/content-i18n";
import staticT from "@/lib/static-translations.json";
import DragDropGame    from "@/components/minigames/DragDropGame";
import MemoryGame      from "@/components/minigames/MemoryGame";
import FillVerseGame   from "@/components/minigames/FillVerseGame";
import WhoAmIGame      from "@/components/minigames/WhoAmIGame";
import CalligraphyGame from "@/components/minigames/CalligraphyGame";

const OPTION_LABELS = ["A", "B", "C", "D"];

// ── Confetti on victory ──────────────────────────────────────────
function GoldParticles({ show }: { show: boolean }) {
  if (!show) return null;
  const particles = Array.from({ length: 32 }, (_, i) => ({
    x: 20 + Math.random() * 340,
    delay: Math.random() * 0.6,
    color: ["#D4AF37","#FFD700","#22c55e","#60a5fa","#f87171"][i % 5],
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p, i) => (
        <motion.div key={i} className="absolute rounded-sm"
          style={{ left: p.x, top: -8, width: p.size, height: p.size, background: p.color }}
          initial={{ y: -8, opacity: 1, rotate: 0 }}
          animate={{ y: 900, opacity: 0, rotate: p.rotation }}
          transition={{ duration: 2 + Math.random() * 0.8, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ── Screen flash overlay (hit/miss) ─────────────────────────────
function ScreenFlash({ type }: { type: "hit" | "miss" | null }) {
  if (!type) return null;
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-40"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: type === "hit"
          ? "radial-gradient(ellipse at center, transparent 40%, rgba(212,175,55,0.35) 100%)"
          : "radial-gradient(ellipse at center, transparent 40%, rgba(248,113,113,0.4) 100%)",
        boxShadow: type === "hit"
          ? "inset 0 0 60px rgba(212,175,55,0.5)"
          : "inset 0 0 60px rgba(248,113,113,0.5)",
      }}
    />
  );
}

// ── Floating damage numbers ──────────────────────────────────────
function DamageNumber({ text, type, onDone }: {
  text: string; type: "damage" | "miss" | "combo"; onDone: () => void;
}) {
  const color = type === "damage" ? "#22c55e" : type === "combo" ? "#D4AF37" : "#f87171";
  const size  = type === "combo" ? 22 : 18;
  return (
    <motion.div
      className="pointer-events-none absolute z-40 font-bold"
      style={{ color, fontSize: size, fontFamily: "var(--font-bricolage)",
        left: "50%", top: "40%", transform: "translateX(-50%)",
        textShadow: `0 0 20px ${color}` }}
      initial={{ y: 0, opacity: 1, scale: type === "combo" ? 1.4 : 1 }}
      animate={{ y: -70, opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      onAnimationComplete={onDone}
    >
      {text}
    </motion.div>
  );
}

// ── Animated chest ───────────────────────────────────────────────
function AnimatedChest({ open, color }: { open: boolean; color: string }) {
  return (
    <svg width={120} height={90} viewBox="0 0 120 90">
      <rect x={10} y={48} width={100} height={38} rx={6} fill={color} opacity={0.9} />
      <rect x={10} y={48} width={100} height={38} rx={6} fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth={2} />
      <rect x={10} y={60} width={100} height={5} fill="rgba(212,175,55,0.4)" />
      <rect x={54} y={48} width={12} height={38} fill="rgba(212,175,55,0.4)" />
      <rect x={52} y={63} width={16} height={13} rx={3} fill="rgba(212,175,55,0.8)" />
      <path d="M 56 63 Q 56 56 60 56 Q 64 56 64 63" fill="none" stroke="rgba(212,175,55,0.8)" strokeWidth={3} strokeLinecap="round" />
      <motion.g
        animate={{ rotateX: open ? -70 : 0, y: open ? -20 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 18 }}
        style={{ originX: "50%", originY: "100%" }}
      >
        <rect x={10} y={20} width={100} height={32} rx={6} fill={color} />
        <rect x={10} y={20} width={100} height={32} rx={6} fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth={2} />
        <rect x={10} y={34} width={100} height={5} fill="rgba(212,175,55,0.3)" />
        <path d="M 18 26 Q 30 22 45 26" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeLinecap="round" />
      </motion.g>
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

// ── Power-up button ──────────────────────────────────────────────
const POWERUP_ICONS: Record<PowerUpType, React.ReactNode> = {
  joker50:     <Scissors size={15} />,
  bouclier:    <Shield size={15} />,
  double_xp:   <Zap size={15} />,
  time_freeze: <Snowflake size={15} />,
};

function PowerUpBtn({ type, count, coins, active, disabled, onUse }: {
  type: PowerUpType; count: number; coins: number;
  active: boolean; disabled: boolean; onUse: () => void;
}) {
  const def = POWERUPS.find(p => p.id === type)!;
  const canAfford = coins >= def.cost && count > 0;
  const dim = disabled || !canAfford;
  return (
    <motion.button onClick={onUse} disabled={dim}
      whileTap={!dim ? { scale: 0.88 } : {}} transition={springTap}
      className="flex flex-col items-center gap-1 rounded-2xl border px-3 py-2 relative"
      style={{
        background: active ? `${def.color}22` : "rgba(255,255,255,0.05)",
        borderColor: active ? def.color : dim ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)",
        color: dim ? "rgba(248,244,236,0.2)" : def.color,
        minWidth: 54,
        boxShadow: active ? `0 0 12px ${def.color}44` : "none",
      }}
    >
      {POWERUP_ICONS[type]}
      <span className="text-[9px] font-bold" style={{ fontFamily: "var(--font-dm-sans)" }}>{count}×</span>
      {active && (
        <motion.div className="absolute inset-0 rounded-2xl"
          style={{ border: `1px solid ${def.color}`, pointerEvents: "none" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

// ── Sage HP bar segments ─────────────────────────────────────────
function SageHPBar({ total, remaining, color }: { total: number; remaining: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <motion.div key={i}
          className="rounded-sm"
          style={{ width: Math.max(6, Math.floor(180 / total) - 2), height: 8 }}
          animate={{
            background: i < remaining
              ? (remaining / total > 0.5 ? color : remaining / total > 0.25 ? "#fb923c" : "#f87171")
              : "rgba(255,255,255,0.08)",
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function QuizPage() {
  const { lieu } = useParams() as { lieu: string };
  const router = useRouter();
  const tt = useT();
  const lang = useLang();
  const isRtl = lang === "ar" || lang === "darija";
  const { state, refresh } = useGameState();
  const {
    session, startQuiz, selectAnswer, selectAnswerResult, confirmAnswer, usePowerUp,
    currentQuestion, correctCount, score, QUESTION_TIME,
  } = useQuiz(lieu);

  const location = getLocation(lieu);
  const sage     = getSageForLocation(lieu);
  const color    = location?.color ?? "#D4AF37";

  const [showResult,    setShowResult]    = useState(false);
  const [rewardSaved,   setRewardSaved]   = useState(false);
  const [chestOpen,     setChestOpen]     = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [prologueDone,  setPrologueDone]  = useState<boolean | null>(null);

  // Battle effects
  const [screenFlash, setScreenFlash] = useState<"hit" | "miss" | null>(null);
  const [sageShaking, setSageShaking] = useState(false);
  const [damageNums, setDamageNums]   = useState<Array<{id: string; text: string; type: "damage"|"miss"|"combo"}>>([]);
  const [combo, setCombo]             = useState(0);
  const comboRef = useRef(0);

  useEffect(() => { comboRef.current = combo; }, [combo]);

  useEffect(() => {
    const s = storage.getSettings();
    const mode = ageGroupToMode(s.ageGroup);
    setPrologueDone(mode !== "kids");
  }, []);

  useEffect(() => { if (prologueDone === true) startQuiz(); }, [prologueDone]); // eslint-disable-line

  // Save rewards
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
      gameStorage.addChest();
      const LOCS = ["medine","fes","cordoue","marrakech","damas","bagdad","samarcande","tombouctou","le_caire","la_mecque"];
      const nextId = LOCS[LOCS.indexOf(lieu) + 1];
      if (nextId) gameStorage.unlockLocation(nextId);
    }
    const isPerfect = session.answers.every(Boolean);
    if (isPerfect) {
      gameStorage.unlockAchievement("perfect_game");
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        if (s?.access_token) fetch(`/api/companion/context?hint=perfect_quiz`, { headers: { Authorization: `Bearer ${s.access_token}` } }).catch(() => {});
      });
    }
    const newState = gameStorage.get();
    const gained = (newState.achievements ?? []).filter(a => !prevAchievements.includes(a));
    if (gained.length > 0) setNewAchievements(gained);

    // Category sync to companion_memory
    const catCorrect: Record<string, number> = {};
    const catTotal:   Record<string, number> = {};
    session.questions.forEach((q, i) => {
      catTotal[q.category] = (catTotal[q.category] ?? 0) + 1;
      if (session.answers[i]) catCorrect[q.category] = (catCorrect[q.category] ?? 0) + 1;
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s?.access_token) return;
      supabase.from("companion_memory").select("strong_categories,weak_categories").eq("user_id", s.user.id).maybeSingle().then(({ data: mem }) => {
        let strong: string[] = (mem?.strong_categories as string[]) ?? [];
        let weak:   string[] = (mem?.weak_categories   as string[]) ?? [];
        Object.entries(catTotal).forEach(([cat, total]) => {
          const accuracy = (catCorrect[cat] ?? 0) / total;
          if (accuracy >= 0.8) { strong = [...new Set([...strong, cat])]; weak = weak.filter(c => c !== cat); }
          else if (accuracy < 0.4) { weak = [...new Set([...weak, cat])]; strong = strong.filter(c => c !== cat); }
        });
        supabase.from("companion_memory").upsert({ user_id: s.user.id, strong_categories: strong, weak_categories: weak }, { onConflict: "user_id" }).then(() => {});
      });
    });

    gameStorage.push();
    refresh();
    setShowResult(true);
    if (navigator.vibrate) navigator.vibrate(victory ? [50,30,100,30,200] : [80,40,80]);
  }, [session?.finished, rewardSaved]); // eslint-disable-line

  const handleOpenChest = useCallback(() => {
    const result = gameStorage.openChest();
    if (!result) return;
    setChestOpen(true);
    setShowParticles(true);
    refresh();
    setTimeout(() => setShowParticles(false), 3000);
  }, [refresh]);

  const handlePowerUp = (type: PowerUpType) => { if (!state) return; usePowerUp(type); refresh(); };

  // Battle confirm — wraps confirmAnswer with effects
  const handleBattleConfirm = useCallback(() => {
    if (!session?.showResult || !currentQuestion) return;

    const isMini = ["drag_drop","memory","fill_verse","who_am_i","calligraphy"].includes(currentQuestion.type);
    const sel = session.selectedOption;
    const isCorrect = sel !== null && sel >= 0
      ? (isMini ? sel === 0 : (currentQuestion.options[sel]?.correct ?? false))
      : false;
    const bouclierForgives = !isCorrect && session.bouclierActive && !session.bouclierUsed;
    const effectivelyCorrect = isCorrect || bouclierForgives;

    if (effectivelyCorrect) {
      const newCombo = comboRef.current + 1;
      const text = newCombo >= 3 ? `🔥 COMBO ×${newCombo}` : "+DÉGÂT";
      const type = newCombo >= 3 ? "combo" : "damage";
      setCombo(newCombo);
      setScreenFlash("hit");
      setSageShaking(true);
      setDamageNums(d => [...d, { id: Date.now().toString(), text, type }]);
      setTimeout(() => { setScreenFlash(null); setSageShaking(false); }, 450);
      if (navigator.vibrate) navigator.vibrate(30);
    } else {
      setCombo(0);
      setScreenFlash("miss");
      setDamageNums(d => [...d, { id: Date.now().toString(), text: "ESQUIVÉ!", type: "miss" }]);
      setTimeout(() => setScreenFlash(null), 450);
      if (navigator.vibrate) navigator.vibrate(60);
    }
    confirmAnswer();
  }, [session, currentQuestion, confirmAnswer]);

  // ── Prologue (kids) ──────────────────────────────────────────
  if (prologueDone === false && location) {
    return (
      <StoryPrologue
        narrative={[`Tu arrives à ${location.nameFr}.`, location.description, sage ? `${sage.name} t'attend. "${sage.dialogueIntro}"` : ""].filter(Boolean).join("\n\n")}
        themeColor={color}
        label={location.nameFr}
        onComplete={() => setPrologueDone(true)}
      />
    );
  }

  // ── Loading ──────────────────────────────────────────────────
  if (!session || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "100dvh", background: "#020a05" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="rounded-full border-2" style={{ width: 40, height: 40, borderColor: color, borderTopColor: "transparent" }} />
        <p className="mt-4 text-sm opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Préparation du combat…
        </p>
      </div>
    );
  }

  const victory = (score ?? 0) >= (sage?.victoryRequirement ?? 7) / 10;
  const total = session.questions.length;
  const finalCorrect = session.answers.filter(Boolean).length;

  // ── Résultat ─────────────────────────────────────────────────
  if (session.finished && showResult) {
    const chestAvail = gameStorage.get().chestsAvailable;
    const sageT = sage ? (staticT.sages as Record<string, Record<string, Record<string,string>>>)[sage.id] : undefined;
    const sageDialogue = victory
      ? pick(sageT, lang, "dialogueSuccess", lang === "ar" ? (sage?.dialogueSuccessAr ?? sage?.dialogueSuccess ?? "") : sage?.dialogueSuccess ?? "")
      : pick(sageT, lang, "dialogueFailure", lang === "ar" ? (sage?.dialogueFailureAr ?? sage?.dialogueFailure ?? "") : sage?.dialogueFailure ?? "");

    return (
      <motion.main
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="relative flex flex-col items-center px-5 pt-0 pb-10 text-center overflow-hidden"
        style={{ minHeight: "100dvh", background: "linear-gradient(180deg, #020a05 0%, #061A12 100%)" }}
      >
        <GoldParticles show={showParticles} />

        {/* Atmospheric background glow */}
        <div className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 80% 40% at 50% 20%, ${color}18 0%, transparent 70%)` }} />

        {/* Sage battle result */}
        <div className="relative w-full flex flex-col items-center pt-12 pb-6">
          {/* Result badge */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="mb-4 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest"
            style={{
              background: victory ? `linear-gradient(135deg, ${color}, #22c55e)` : "rgba(248,113,113,0.15)",
              color: victory ? "#0a0f0d" : "#f87171",
              border: victory ? "none" : "1px solid rgba(248,113,113,0.3)",
              boxShadow: victory ? `0 0 30px ${color}66` : "none",
              fontFamily: "var(--font-bricolage)",
              fontSize: 18,
            }}
          >
            {victory ? "⚔ VICTOIRE !" : "💀 DÉFAITE"}
          </motion.div>

          {/* Sage portrait */}
          {sage && (
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative mb-4"
              style={{ filter: victory ? `drop-shadow(0 0 20px ${color}88)` : "grayscale(0.6) opacity(0.7)" }}
            >
              <SagePortrait sageId={sage.portrait} color={color} size={90} />
              {victory && (
                <motion.div className="absolute -top-2 -right-2 text-2xl"
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ delay: 0.6, duration: 0.5 }}>
                  ✦
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Sage quote */}
          {sage && sageDialogue && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-xs italic opacity-55 max-w-xs leading-relaxed mb-6"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)", direction: isRtl ? "rtl" : "ltr" }}>
              &ldquo;{sageDialogue}&rdquo;
            </motion.p>
          )}
        </div>

        {/* Score circle */}
        <div className="relative mb-6">
          <svg width={140} height={140} className="-rotate-90">
            <circle cx={70} cy={70} r={58} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7} />
            <motion.circle cx={70} cy={70} r={58} fill="none"
              stroke={victory ? color : "#f87171"} strokeWidth={7} strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 58}
              initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - finalCorrect / total) }}
              transition={{ ease: "easeOut", duration: 1.2, delay: 0.4 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black" style={{ color: victory ? color : "#f87171", fontFamily: "var(--font-bricolage)" }}>
              {finalCorrect}/{total}
            </span>
            <span className="text-[10px] opacity-40 uppercase tracking-widest" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {tt("quiz.correct.count")}
            </span>
          </div>
        </div>

        {/* XP + Coins */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }} className="flex gap-3 mb-6">
          {[
            { val: `+${session.xpEarned + (victory && sage ? sage.reward.xp : 0)}`, label: "XP", icon: <Swords size={12} /> },
            { val: `+${session.coinsEarned + (victory && sage ? sage.reward.coins : 0)}`, label: "Pièces", icon: <Coins size={12} /> },
          ].map(({ val, label, icon }) => (
            <div key={label} className="rounded-2xl border px-6 py-4 text-center"
              style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.2)" }}>
              <p className="text-2xl font-black" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>{val}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span style={{ color: "rgba(212,175,55,0.5)" }}>{icon}</span>
                <span className="text-[10px] opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{label}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Chest */}
        {chestAvail > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }} className="flex flex-col items-center gap-2 mb-6">
            <motion.div animate={!chestOpen ? { y: [0,-6,0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
              <AnimatedChest open={chestOpen} color={color} />
            </motion.div>
            {!chestOpen ? (
              <motion.button onClick={handleOpenChest} whileTap={{ scale: 0.96 }} transition={springTap}
                className="rounded-full px-7 py-3 text-sm font-black"
                style={{ background: `linear-gradient(135deg,${color},#055C3F)`, color: "#0a0f0d", fontFamily: "var(--font-bricolage)", boxShadow: `0 0 20px ${color}44` }}>
                Ouvrir le coffre
              </motion.button>
            ) : (
              <p className="text-sm font-bold" style={{ color, fontFamily: "var(--font-dm-sans)" }}>{tt("quiz.treasure")}</p>
            )}
          </motion.div>
        )}

        {/* Achievements */}
        <AnimatePresence>
          {newAchievements.map((id, i) => (
            <motion.div key={id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ delay: 1.1 + i * 0.15 }}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3 mb-2 w-full max-w-xs"
              style={{ background: "rgba(212,175,55,0.07)", borderColor: "rgba(212,175,55,0.25)" }}>
              <Trophy size={18} style={{ color, flexShrink: 0 }} />
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color, fontFamily: "var(--font-dm-sans)" }}>{tt("quiz.achievement")}</p>
                <p className="text-xs opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{id.replace(/_/g," ")}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
          <motion.button onClick={() => router.push("/oasis")} whileTap={{ scale: 0.96 }} transition={springTap}
            className="rounded-full py-4 text-sm font-black"
            style={{ background: `linear-gradient(135deg,${color},#055C3F)`, color: "#0a0f0d", fontFamily: "var(--font-bricolage)", boxShadow: `0 4px 24px ${color}33` }}>
            {tt("quiz.returnOasis")}
          </motion.button>
          {!victory && (
            <motion.button
              onClick={() => { setRewardSaved(false); setShowResult(false); setChestOpen(false); setCombo(0); startQuiz(); }}
              whileTap={{ scale: 0.95 }} transition={springTap}
              className="rounded-full py-3.5 text-sm font-semibold border"
              style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
              ↩ {tt("quiz.retry")}
            </motion.button>
          )}
        </div>
      </motion.main>
    );
  }

  // ── Bataille active ──────────────────────────────────────────
  const liveState = gameStorage.get();
  const sageHP    = total - correctCount; // remaining HP of sage
  const isMiniGame = ["drag_drop","memory","fill_verse","who_am_i","calligraphy"].includes(currentQuestion.type);
  const q = getQuestionLang(currentQuestion, lang);
  const timeUrgent = session.timeLeft <= 7;

  return (
    <div className="relative flex flex-col" style={{ minHeight: "100dvh", background: "#020a05", overflow: "hidden" }}>
      {/* Effects layer */}
      <AnimatePresence>{screenFlash && <ScreenFlash key={screenFlash + Date.now()} type={screenFlash} />}</AnimatePresence>
      <GoldParticles show={showParticles} />
      <div className="pointer-events-none absolute inset-0" style={{
        background: `radial-gradient(ellipse 100% 45% at 50% 0%, ${color}20 0%, transparent 70%)`,
      }} />

      {/* ── SAGE BATTLE ZONE ── */}
      <div className="relative flex flex-col items-center pt-12 pb-5 px-5"
        style={{ borderBottom: `1px solid ${color}22` }}>

        {/* Top bar */}
        <div className="absolute top-4 left-5 right-5 flex items-center justify-between">
          <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}>
            <ArrowLeft size={15} />
          </motion.button>

          {/* Question counter */}
          <span className="text-xs font-bold tracking-widest"
            style={{ color: `${color}99`, fontFamily: "var(--font-dm-sans)" }}>
            {session.currentIndex + 1} / {total}
          </span>

          {/* Combo badge */}
          <AnimatePresence>
            {combo >= 2 && (
              <motion.span key={combo}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                className="text-xs font-black px-2.5 py-1 rounded-full"
                style={{ background: `${color}33`, color, fontFamily: "var(--font-bricolage)", border: `1px solid ${color}55` }}>
                🔥 ×{combo}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Sage portrait with shake animation */}
        <motion.div className="relative mb-3"
          animate={sageShaking ? { x: [0, -8, 8, -6, 6, 0], y: [0, -3, 3, 0] } : { x: 0, y: [0, -4, 0] }}
          transition={sageShaking ? { duration: 0.35 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 16px ${color}55)` }}
        >
          <SagePortrait sageId={sage?.portrait ?? "al_idrissi"} color={color} size={90} />

          {/* Damage numbers */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {damageNums.map(d => (
                <DamageNumber key={d.id} text={d.text} type={d.type}
                  onDone={() => setDamageNums(nums => nums.filter(n => n.id !== d.id))} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sage info + HP */}
        <div className="text-center mb-3">
          <p className="text-xs font-bold mb-0.5" style={{ color, fontFamily: "var(--font-dm-sans)" }}>
            {sage?.name ?? "Sage"} · {pick((staticT.sages as Record<string, Record<string, Record<string,string>>>)[sage?.id ?? ""], lang, "title", lang === "ar" ? (sage?.titleAr ?? sage?.title ?? "") : sage?.title ?? "")}
          </p>
          <div className="flex items-center gap-2 justify-center">
            <SageHPBar total={total} remaining={sageHP} color={color} />
            <span className="text-[10px] font-bold" style={{ color: `${color}88`, fontFamily: "var(--font-dm-sans)" }}>
              HP {sageHP}/{total}
            </span>
          </div>
        </div>

        {/* Progress bar (subtle) */}
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div className="h-full rounded-full"
            animate={{ width: `${(session.currentIndex / total) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ background: `linear-gradient(to right, ${color}88, ${color})` }}
          />
        </div>
      </div>

      {/* ── QUESTION & OPTIONS ZONE ── */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-4 overflow-y-auto">

        {/* Energy timer bar */}
        <div className="mb-4">
          <div className="h-2 rounded-full overflow-hidden relative" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div className="h-full rounded-full"
              animate={{ width: `${(session.timeLeft / QUESTION_TIME) * 100}%` }}
              transition={{ duration: 0.4, ease: "linear" }}
              style={{ background: timeUrgent ? "linear-gradient(to right,#f87171,#dc2626)" : `linear-gradient(to right,${color}88,${color})` }}
            />
            {timeUrgent && (
              <motion.div className="absolute inset-0 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.5, repeat: Infinity }}
                style={{ background: "rgba(248,113,113,0.2)" }} />
            )}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] opacity-30" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{tt("quiz.question")} {session.currentIndex + 1}</span>
            <span className="text-[10px] font-bold" style={{ color: timeUrgent ? "#f87171" : `${color}88`, fontFamily: "var(--font-dm-sans)" }}>
              {session.timeLeft}s
            </span>
          </div>
        </div>

        {/* Active + bouclier indicators */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
            style={{ background: `${color}18`, color, border: `1px solid ${color}33`, fontFamily: "var(--font-dm-sans)" }}>
            {currentQuestion.category}
          </span>
          {session.bouclierActive && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ color: "#60a5fa", background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)" }}>
              <Shield size={10} /> Bouclier actif
            </span>
          )}
          {session.doubleXpActive && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ color: "#4ade80", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" }}>
              ⚡×2 XP
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={session.currentIndex}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Question text (MCQ only) */}
            {!isMiniGame && (
              <p className="text-lg font-bold leading-snug mb-5"
                style={{ color: "var(--text)", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-bricolage)", direction: isRtl ? "rtl" : "ltr", lineHeight: 1.4 }}>
                {q.question}
              </p>
            )}

            {/* Mini-game renderers */}
            {currentQuestion.type === "drag_drop"    && !session.showResult && <DragDropGame    question={currentQuestion} color={color} onComplete={selectAnswerResult} />}
            {currentQuestion.type === "memory"        && !session.showResult && <MemoryGame        question={currentQuestion} color={color} onComplete={selectAnswerResult} />}
            {currentQuestion.type === "fill_verse"   && !session.showResult && <FillVerseGame   question={currentQuestion} color={color} onComplete={selectAnswerResult} />}
            {currentQuestion.type === "who_am_i"     && !session.showResult && <WhoAmIGame      question={currentQuestion} color={color} onComplete={selectAnswerResult} />}
            {currentQuestion.type === "calligraphy"  && !session.showResult && <CalligraphyGame question={currentQuestion} color={color} onComplete={selectAnswerResult} />}

            {/* MCQ 2×2 grid */}
            {["mcq","true_false","fill_in","reorder"].includes(currentQuestion.type) && (
              <div className={`grid gap-2.5 mb-4 ${q.options.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
                {q.options.map((option, idx) => {
                  const hidden = session.hiddenOptions.includes(idx);
                  const isSelected = session.selectedOption === idx;
                  const isTimedOut  = session.selectedOption === -1;
                  const isCorrect   = option.correct;
                  const showFeedback = session.showResult;

                  let borderColor = `${color}25`;
                  let bg = "rgba(255,255,255,0.04)";
                  let textColor = "var(--text)";
                  let icon = null;

                  if (showFeedback && (isSelected || isTimedOut) && isCorrect) {
                    borderColor = "rgba(74,222,128,0.6)"; bg = "rgba(74,222,128,0.12)"; textColor = "#4ade80";
                    icon = <CheckCircle2 size={16} style={{ color: "#4ade80", flexShrink: 0 }} />;
                  } else if (showFeedback && isSelected && !isCorrect) {
                    if (session.bouclierActive && !session.bouclierUsed) {
                      borderColor = "rgba(96,165,250,0.6)"; bg = "rgba(96,165,250,0.12)"; textColor = "#60a5fa";
                      icon = <Shield size={16} style={{ color: "#60a5fa", flexShrink: 0 }} />;
                    } else {
                      borderColor = "rgba(248,113,113,0.6)"; bg = "rgba(248,113,113,0.12)"; textColor = "#f87171";
                      icon = <XCircle size={16} style={{ color: "#f87171", flexShrink: 0 }} />;
                    }
                  } else if (showFeedback && isCorrect) {
                    borderColor = "rgba(74,222,128,0.35)"; bg = "rgba(74,222,128,0.06)"; textColor = "#4ade80";
                  } else if (showFeedback && isTimedOut && !isCorrect) {
                    borderColor = "rgba(255,255,255,0.05)"; textColor = "var(--text-dim)";
                  } else if (isSelected) {
                    borderColor = color; bg = `${color}18`; textColor = color;
                  }

                  return (
                    <motion.button key={idx}
                      onClick={() => !session.showResult && !hidden && selectAnswer(idx)}
                      whileTap={!session.showResult && !hidden ? { scale: 0.95 } : {}}
                      transition={springTap}
                      className="flex flex-col items-start rounded-2xl border p-3 text-left relative"
                      style={{
                        background: bg, borderColor, minHeight: 72,
                        opacity: hidden ? 0 : (showFeedback && !isSelected && !isCorrect ? 0.35 : 1),
                        pointerEvents: hidden ? "none" : "auto",
                        boxShadow: isSelected && !showFeedback ? `0 0 0 1px ${color}` : "none",
                      }}
                    >
                      {/* Label badge */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black"
                          style={{ background: showFeedback ? "transparent" : `${color}22`, color: textColor, fontFamily: "var(--font-dm-sans)" }}>
                          {icon ?? OPTION_LABELS[idx]}
                        </span>
                      </div>
                      <span className="text-xs font-medium leading-tight flex-1"
                        style={{ color: textColor, fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-dm-sans)", direction: isRtl ? "rtl" : "ltr" }}>
                        {option.text}
                      </span>
                      {isSelected && !showFeedback && (
                        <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
                          style={{ border: `1px solid ${color}` }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Confirm */}
            <AnimatePresence>
              {session.showResult && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  onClick={handleBattleConfirm} whileTap={{ scale: 0.96 }}
                  className="w-full rounded-full py-4 text-sm font-black mb-3"
                  style={{ background: `linear-gradient(135deg,${color},#055C3F)`, color: "#0a0f0d",
                    fontFamily: "var(--font-bricolage)", boxShadow: `0 4px 20px ${color}44`, fontSize: 15 }}
                >
                  {session.currentIndex < total - 1 ? "⚔ " + tt("quiz.next") : "⚔ " + tt("quiz.seeResults")}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Cultural capsule */}
            <AnimatePresence>
              {session.showResult && currentQuestion.culturalCapsule && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="rounded-2xl border overflow-hidden mb-3"
                  style={{ background: "linear-gradient(135deg,rgba(30,20,5,0.98),rgba(20,14,3,0.98))", borderColor: `${color}55` }}
                >
                  <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2.5"
                    style={{ borderBottom: `1px solid ${color}20` }}>
                    <motion.span animate={{ rotate: [0,15,-15,0] }} transition={{ delay: 0.4, duration: 0.4 }}
                      className="text-base">✦</motion.span>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest opacity-50" style={{ color, fontFamily: "var(--font-dm-sans)" }}>{tt("quiz.cultural")}</p>
                      <p className="text-sm font-bold" style={{ color, fontFamily: "var(--font-bricolage)" }}>{currentQuestion.culturalCapsule.title}</p>
                    </div>
                  </div>
                  <p className="px-4 py-3 text-xs leading-relaxed opacity-75" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {currentQuestion.culturalCapsule.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Explanation */}
            <AnimatePresence>
              {session.showResult && q.explanation && !currentQuestion.culturalCapsule && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="rounded-2xl border p-3.5 mb-3"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <p className="text-xs leading-relaxed opacity-55" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)", direction: isRtl ? "rtl" : "ltr" }}>
                    {q.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Power-ups */}
        {!session.showResult && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mt-auto pt-4">
            {(["joker50","bouclier","double_xp","time_freeze"] as PowerUpType[]).map(type => (
              <PowerUpBtn key={type} type={type}
                count={liveState.powerupCounts[type] ?? 0}
                coins={liveState.coins}
                active={(type === "bouclier" && session.bouclierActive) || (type === "double_xp" && session.doubleXpActive)}
                disabled={false}
                onUse={() => handlePowerUp(type)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
