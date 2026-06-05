"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getQuestionsAsync } from "@/lib/game/questions-loader";
import { gameStorage } from "@/lib/game/game-storage";
import type { Question } from "@/lib/game/types";

export type LiveDuelStatus = "waiting" | "ready" | "playing" | "finished";

export interface LiveDuelState {
  id: string;
  status: LiveDuelStatus;
  questions: Question[];
  currentQuestion: number;
  myScore: number;
  opponentScore: number;
  opponentName: string;
  timeLeft: number;
  myAnswer: number | null;
  opponentAnswered: boolean;
  winnerId: string | null;
  isPlayer1: boolean;
}

const QUESTION_TIME = 15;
const QUESTION_COUNT = 10;

export function useLiveDuel(duelId: string | null) {
  const { user } = useAuth();
  const [state, setState] = useState<LiveDuelState | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setState(s => {
        if (!s || s.status !== "playing") return s;
        if (s.timeLeft <= 1) {
          stopTimer();
          return { ...s, timeLeft: 0 };
        }
        return { ...s, timeLeft: s.timeLeft - 1 };
      });
    }, 1000);
  }, [stopTimer]);

  // ── Create a new live duel ──────────────────────────────────────
  const createDuel = useCallback(async (opponentId: string, opponentName: string): Promise<string | null> => {
    if (!user) return null;
    try {
      const gameState = gameStorage.get();
      const picked = await getQuestionsAsync(QUESTION_COUNT, gameState.questionHistory, "beginner", gameState.level, [], 4);

      const { data, error: err } = await supabase
        .from("duels_live")
        .insert({
          player1_id:   user.id,
          player2_id:   opponentId,
          question_ids: picked.map(q => q.id),
          status:       "waiting",
        })
        .select("id")
        .single();

      if (err || !data) { setError("Impossible de créer le duel"); return null; }
      return data.id;
    } catch {
      setError("Erreur réseau");
      return null;
    }
  }, [user]);

  // ── Join / subscribe to an existing duel ───────────────────────
  const joinDuel = useCallback(async (id: string) => {
    if (!user || !id) return;

    const { data: row, error: err } = await supabase
      .from("duels_live")
      .select("*")
      .eq("id", id)
      .single();

    if (err || !row) { setError("Duel introuvable"); return; }

    const isP1 = row.player1_id === user.id;
    const qIds: string[] = (row.question_ids as string[]) ?? [];

    // Load questions from Supabase by IDs (not from static file)
    let questions: Question[] = [];
    if (qIds.length > 0) {
      const { data: qRows } = await supabase
        .from("questions")
        .select("*")
        .in("id", qIds);
      if (qRows) {
        // Preserve order
        const qMap = new Map(qRows.map(q => [q.id as string, q]));
        questions = (qIds
          .map(qid => qMap.get(qid))
          .filter(Boolean)
          .map(q => ({
            id:              q!.id as string,
            category:        q!.category as Question["category"],
            type:            (q!.type ?? "mcq") as Question["type"],
            difficulty:      q!.difficulty as Question["difficulty"],
            question:        q!.question as string,
            options:         (q!.options as unknown as Question["options"]) ?? [],
            explanation:     q!.explanation as string | undefined,
            culturalCapsule: q!.cultural_capsule as Question["culturalCapsule"],
            arabicRequired:  undefined,
          })) as Question[]);
      }
    }

    setState({
      id,
      status: row.status as LiveDuelStatus,
      questions,
      currentQuestion: (row.current_question as number) ?? 0,
      myScore:         isP1 ? ((row.player1_score as number) ?? 0) : ((row.player2_score as number) ?? 0),
      opponentScore:   isP1 ? ((row.player2_score as number) ?? 0) : ((row.player1_score as number) ?? 0),
      opponentName:    "",
      timeLeft:        QUESTION_TIME,
      myAnswer:        null,
      opponentAnswered: false,
      winnerId:        row.winner_id as string | null,
      isPlayer1:       isP1,
    });

    const readyField = isP1 ? "player1_ready" : "player2_ready";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from("duels_live").update({ [readyField]: true } as any).eq("id", id);

    const channel = supabase.channel(`duel-live-${id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "duels_live",
        filter: `id=eq.${id}`,
      }, (payload) => {
        const updated = payload.new as Record<string, unknown>;
        setState(s => {
          if (!s) return s;
          const newStatus = (updated.status as LiveDuelStatus) ?? s.status;
          const myScore   = isP1 ? ((updated.player1_score as number) ?? s.myScore) : ((updated.player2_score as number) ?? s.myScore);
          const oppScore  = isP1 ? ((updated.player2_score as number) ?? s.opponentScore) : ((updated.player1_score as number) ?? s.opponentScore);
          const oppAnswered = isP1
            ? (updated.player2_answers as unknown[])?.length > s.currentQuestion
            : (updated.player1_answers as unknown[])?.length > s.currentQuestion;

          const newState = {
            ...s,
            status: newStatus,
            currentQuestion: (updated.current_question as number) ?? s.currentQuestion,
            myScore,
            opponentScore: oppScore,
            opponentAnswered: !!oppAnswered,
            winnerId: (updated.winner_id as string | null) ?? s.winnerId,
          };

          if (newStatus === "playing" && s.status !== "playing") startTimer();
          if (newStatus === "finished") stopTimer();

          return newState;
        });
      })
      .subscribe();

    channelRef.current = channel;
  }, [user, startTimer, stopTimer]);

  // ── Answer a question ──────────────────────────────────────────
  const answerQuestion = useCallback(async (optionIndex: number) => {
    if (!state || !user || state.myAnswer !== null) return;
    const question = state.questions[state.currentQuestion];
    if (!question) return;

    const isCorrect = question.options[optionIndex]?.correct ?? false;
    setState(s => s ? { ...s, myAnswer: optionIndex } : s);
    stopTimer();

    const answerField = state.isPlayer1 ? "player1_answers" : "player2_answers";
    const scoreField  = state.isPlayer1 ? "player1_score"   : "player2_score";

    const { data: row } = await supabase
      .from("duels_live")
      .select(`${answerField}, ${scoreField}`)
      .eq("id", state.id)
      .single();

    if (!row) return;
    const rowAny      = row as Record<string, unknown>;
    const prevAnswers = (rowAny[answerField] as unknown[] | null) ?? [];
    const prevScore   = (rowAny[scoreField]  as number   | null) ?? 0;
    const newScore    = prevScore + (isCorrect ? 1 : 0);

    const update: Record<string, unknown> = {
      [answerField]: [...prevAnswers, { idx: optionIndex, correct: isCorrect }],
      [scoreField]:  newScore,
    };

    // Check if both players answered this question
    const otherAnswerField = state.isPlayer1 ? "player2_answers" : "player1_answers";
    const otherScoreField  = state.isPlayer1 ? "player2_score"   : "player1_score";
    const { data: freshRow } = await supabase
      .from("duels_live")
      .select(`${otherAnswerField}, ${otherScoreField}, current_question`)
      .eq("id", state.id)
      .single();

    const fresh       = (freshRow ?? {}) as Record<string, unknown>;
    const otherAnswers = (fresh[otherAnswerField] as unknown[] | null) ?? [];
    const bothAnswered = otherAnswers.length > ((fresh.current_question as number) ?? 0);

    if (bothAnswered) {
      const isLast = state.currentQuestion >= QUESTION_COUNT - 1;
      if (isLast) {
        update.status = "finished";
        // Determine winner client-side (both scores now known)
        const myFinal    = newScore;
        const oppFinal   = (fresh[otherScoreField] as number | null) ?? state.opponentScore;
        const myId       = user.id;
        const oppId      = state.isPlayer1 ? (freshRow as Record<string, unknown>)?.player2_id as string : (freshRow as Record<string, unknown>)?.player1_id as string;
        update.winner_id = myFinal > oppFinal ? myId : oppFinal > myFinal ? oppId : null;
      } else {
        update.current_question = state.currentQuestion + 1;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from("duels_live").update(update as any).eq("id", state.id);
  }, [state, user, stopTimer]);

  useEffect(() => () => {
    stopTimer();
    if (channelRef.current) supabase.removeChannel(channelRef.current);
  }, [stopTimer]);

  useEffect(() => {
    if (duelId) joinDuel(duelId);
  }, [duelId, joinDuel]);

  return { state, error, createDuel, joinDuel, answerQuestion, QUESTION_TIME };
}
