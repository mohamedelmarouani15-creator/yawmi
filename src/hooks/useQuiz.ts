"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getQuestionsAsync } from "@/lib/game/questions-loader";
import { updateSM2 } from "@/lib/game/sm2";
import { gameStorage, ENERGY_COST } from "@/lib/game/game-storage";
import { getJoker50Eliminations } from "@/lib/game/powerups";
import { getActiveGameEvent } from "@/lib/game/game-events";
import { getEventBonuses } from "@/lib/game/events";
import { storage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { getStageConfig, currentStageIndex } from "@/lib/game/stages";
import type { Question, QuizSession, PowerUpType, Category } from "@/lib/game/types";

const XP_PER_CORRECT    = 10;
const COINS_PER_CORRECT = 2;
const PERFECT_BONUS_XP  = 50;
const PERFECT_BONUS_COINS = 10;

export function useQuiz(locationId: string) {
  const [session,     setSession]     = useState<QuizSession | null>(null);
  const [noEnergy,    setNoEnergy]    = useState(false);
  const [stageIdx,    setStageIdx]    = useState(1);
  const [stageConfig, setStageConfig] = useState(getStageConfig(1));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const QUESTION_TIME = session?.timeLeft !== undefined ? stageConfig.timer : stageConfig.timer;

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.timerActive || session.showResult || session.finished) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }

    timerRef.current = setInterval(() => {
      setSession(s => {
        if (!s || !s.timerActive || s.showResult || s.finished) return s;
        if (s.timeLeft <= 1) {
          // Time's up — auto-wrong answer
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return { ...s, timeLeft: 0, timerActive: false, selectedOption: -1, showResult: true };
        }
        return { ...s, timeLeft: s.timeLeft - 1 };
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session?.timerActive, session?.showResult, session?.finished, session?.currentIndex]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Start ──────────────────────────────────────────────────────
  const startQuiz = useCallback(async () => {
    const freshState = gameStorage.get();
    const settings   = storage.getSettings();

    // Energy gate (free during Ramadan night)
    const seasonBonuses = getEventBonuses();
    const energyFree = seasonBonuses.freeEnergyNight;
    const spent = energyFree || gameStorage.spendEnergy(ENERGY_COST);
    if (!spent) { setNoEnergy(true); return; }
    setNoEnergy(false);

    // Stage-aware difficulty — prestige overrides to max
    const currentIdx   = currentStageIndex(freshState.locationStages ?? {}, locationId);
    const stageCfg     = getStageConfig(currentIdx);
    const isPrestige   = (freshState.prestigeLevel ?? 0) > 0;
    const effectiveCfg = isPrestige ? { ...stageCfg, maxDiff: 5 as const, timer: 12 } : stageCfg;
    setStageIdx(currentIdx);
    setStageConfig(effectiveCfg);

    let startedStoryIds: string[] = [];
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("story_progress")
          .select("story_id")
          .eq("user_id", user.id);
        startedStoryIds = (data ?? []).map(r => r.story_id as string);
      }
    } catch { /* offline graceful */ }

    const questions = await getQuestionsAsync(
      10, freshState.questionHistory, settings.arabicLevel ?? "beginner",
      freshState.level, startedStoryIds, effectiveCfg.maxDiff,
    );
    setSession({
      locationId,
      questions,
      currentIndex: 0,
      answers: new Array(questions.length).fill(null),
      selectedOption: null,
      showResult: false,
      finished: false,
      xpEarned: 0,
      coinsEarned: 0,
      startedAt: Date.now(),
      timeLeft: stageCfg.timer as number,
      timerActive: true,
      hiddenOptions: [],
      bouclierActive: false,
      bouclierUsed: false,
      doubleXpActive: false,
      startedStoryIds,
    });
  }, [locationId]); // eslint-disable-line

  // ── Select answer (MCQ) ───────────────────────────────────────
  const selectAnswer = useCallback((optionIndex: number) => {
    if (!session || session.showResult || session.finished) return;
    setSession(s => s ? { ...s, selectedOption: optionIndex, showResult: true, timerActive: false } : s);
  }, [session]);

  // ── Select answer (mini-games) — passes boolean result directly ─
  const selectAnswerResult = useCallback((isCorrect: boolean) => {
    if (!session || session.showResult || session.finished) return;
    // Map to option index: 0 = correct sentinel, 1 = wrong sentinel
    const idx = isCorrect ? 0 : 1;
    setSession(s => s ? { ...s, selectedOption: idx, showResult: true, timerActive: false } : s);
  }, [session]);

  // ── Confirm / advance ─────────────────────────────────────────
  const confirmAnswer = useCallback(() => {
    if (!session || !session.showResult) return;

    const q: Question = session.questions[session.currentIndex];
    const selected = session.selectedOption;

    // selected === -1 means time out (no answer)
    // For mini-games (drag_drop, memory, fill_verse, who_am_i):
    // selected=0 = correct sentinel, selected=1 = wrong sentinel
    const isMiniGame = ["drag_drop", "memory", "fill_verse", "who_am_i", "calligraphy"].includes(q.type);
    const isCorrectRaw = selected !== null && selected >= 0
      ? isMiniGame
        ? selected === 0
        : (q.options[selected]?.correct ?? false)
      : false;

    // Bouclier forgives one wrong
    const isCorrect = (!isCorrectRaw && session.bouclierActive && !session.bouclierUsed)
      ? true
      : isCorrectRaw;
    const bouclierTriggered = !isCorrectRaw && session.bouclierActive && !session.bouclierUsed;

    // SM-2 update (only for real answers, not bouclier-forgiven)
    const state = gameStorage.get();
    const prevHistory = state.questionHistory[q.id];
    const quality: 0 | 3 | 5 = isCorrectRaw ? (session.timeLeft > QUESTION_TIME / 2 ? 5 : 3) : 0;
    const newHistory = updateSM2(prevHistory, isCorrectRaw, quality);
    gameStorage.updateQuestionHistory(q.id, newHistory);
    gameStorage.recordAnswer(isCorrectRaw);

    const newAnswers = [...session.answers];
    newAnswers[session.currentIndex] = isCorrect;

    const legacyEvent  = getActiveGameEvent()?.rewardMultiplier ?? 1;
    const seasonBonus  = getEventBonuses();
    const xpMultiplier = (session.doubleXpActive ? 2 : 1) * legacyEvent * seasonBonus.xpMultiplier;
    const addedXP    = isCorrect ? XP_PER_CORRECT * xpMultiplier : 0;
    const addedCoins = isCorrect ? COINS_PER_CORRECT + seasonBonus.coinBonus : 0;

    const isLast = session.currentIndex === session.questions.length - 1;

    let totalXP    = session.xpEarned + addedXP;
    let totalCoins = session.coinsEarned + addedCoins;

    if (isLast) {
      const allCorrect = newAnswers.every(Boolean);
      if (allCorrect) {
        totalXP    += PERFECT_BONUS_XP;
        totalCoins += PERFECT_BONUS_COINS;
      }
      // Per-category + per-type stats
      const catXP:      Partial<Record<Category, number>> = {};
      const catResults: Partial<Record<Category, { correct: number; total: number }>> = {};
      let totalCorrectCount = 0;
      let calligraphyCorrect = 0;
      let timelineCorrect    = 0;
      newAnswers.forEach((correct, i) => {
        const q   = session.questions[i];
        const cat = q.category;
        const r   = catResults[cat] ?? { correct: 0, total: 0 };
        r.total  += 1;
        if (correct) {
          r.correct += 1;
          totalCorrectCount += 1;
          catXP[cat] = (catXP[cat] ?? 0) + XP_PER_CORRECT;
          if (q.type === "calligraphy") calligraphyCorrect++;
          if (q.type === "timeline")    timelineCorrect++;
        }
        catResults[cat] = r;
      });
      (Object.entries(catXP) as [Category, number][]).forEach(([cat, xp]) => {
        gameStorage.updateCategoryLevel(cat, xp);
      });
      gameStorage.updateCategoryMastery(catResults as Record<Category, { correct: number; total: number }>);
      (Object.entries(catResults) as [Category, { correct: number; total: number }][]).forEach(([cat, r]) => {
        gameStorage.addManuscriptPages(cat, r.correct);
      });
      // Daily quest progress
      const isVictory   = newAnswers.filter(Boolean).length / newAnswers.length >= 0.7;
      const isPerfect10 = newAnswers.every(Boolean);
      if (isVictory)               gameStorage.progressQuest("quiz_win",         1);
      if (totalCorrectCount > 0)   gameStorage.progressQuest("correct_answers",  totalCorrectCount);
      if (calligraphyCorrect > 0)  gameStorage.progressQuest("calligraphy",      calligraphyCorrect);
      if (timelineCorrect > 0)     gameStorage.progressQuest("timeline_correct", timelineCorrect);
      // Weekly challenge progress
      if (totalCorrectCount > 0)   gameStorage.progressWeekly("total_correct",      totalCorrectCount);
      if (isPerfect10)             gameStorage.progressWeekly("perfect_quizzes",     1);
      if (calligraphyCorrect > 0)  gameStorage.progressWeekly("calligraphy_correct", calligraphyCorrect);
      if (timelineCorrect > 0)     gameStorage.progressWeekly("timeline_correct",    timelineCorrect);
    }

    setSession(s => s ? {
      ...s,
      answers: newAnswers,
      xpEarned: totalXP,
      coinsEarned: totalCoins,
      showResult: false,
      selectedOption: null,
      timerActive: !isLast,
      timeLeft: QUESTION_TIME,
      currentIndex: isLast ? s.currentIndex : s.currentIndex + 1,
      finished: isLast,
      bouclierUsed: s.bouclierUsed || bouclierTriggered,
      bouclierActive: bouclierTriggered ? false : s.bouclierActive,
      doubleXpActive: false, // resets per question
      hiddenOptions: [],     // reset per question
    } : s);
  }, [session]);

  // ── Power-ups ─────────────────────────────────────────────────
  const usePowerUp = useCallback((type: PowerUpType): boolean => {
    if (!session || session.showResult || session.finished) return false;

    const state = gameStorage.get();
    const cost = { joker50: 10, bouclier: 15, double_xp: 8, time_freeze: 12 }[type];
    const count = state.powerupCounts[type] ?? 0;
    if (count <= 0 || state.coins < cost) return false;

    const spent = gameStorage.spendCoins(cost);
    if (!spent) return false;
    gameStorage.usePowerUp(type);

    setSession(s => {
      if (!s) return s;
      switch (type) {
        case "joker50": {
          const eliminated = getJoker50Eliminations(s.questions[s.currentIndex].options, s.hiddenOptions);
          return { ...s, hiddenOptions: [...s.hiddenOptions, ...eliminated] };
        }
        case "bouclier":
          return { ...s, bouclierActive: true };
        case "double_xp":
          return { ...s, doubleXpActive: true };
        case "time_freeze":
          return { ...s, timeLeft: Math.min(s.timeLeft + 10, 45) };
      }
    });
    return true;
  }, [session]);

  const currentQuestion = session ? session.questions[session.currentIndex] : null;
  const correctCount    = session ? session.answers.filter(Boolean).length : 0;
  const score           = session?.finished ? correctCount / session.questions.length : null;

  return {
    session,
    startQuiz,
    selectAnswer,
    selectAnswerResult,
    confirmAnswer,
    usePowerUp,
    currentQuestion,
    correctCount,
    score,
    QUESTION_TIME,
    noEnergy,
    stageIndex:  stageIdx,
    stageConfig,
  };
}
