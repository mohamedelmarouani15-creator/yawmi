"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { QUESTIONS } from "@/lib/game/questions";
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
          // Auto-submit no answer
          return { ...s, timeLeft: 0 };
        }
        return { ...s, timeLeft: s.timeLeft - 1 };
      });
    }, 1000);
  }, [stopTimer]);

  // ── Create a new live duel ──────────────────────────────────────
  const createDuel = useCallback(async (opponentId: string, opponentName: string): Promise<string | null> => {
    if (!user) return null;
    const picked = QUESTIONS
      .sort(() => Math.random() - 0.5)
      .slice(0, QUESTION_COUNT);

    const { data, error: err } = await supabase
      .from("duels_live")
      .insert({
        player1_id: user.id,
        question_ids: picked.map(q => q.id),
        player2_id: opponentId,
        status: "waiting",
      })
      .select("id")
      .single();

    if (err || !data) { setError("Impossible de créer le duel"); return null; }
    return data.id;
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
    const qIds: string[] = row.question_ids ?? [];
    const questions = qIds
      .map(qid => QUESTIONS.find(q => q.id === qid))
      .filter(Boolean) as Question[];

    setState({
      id,
      status: row.status as LiveDuelStatus,
      questions,
      currentQuestion: row.current_question ?? 0,
      myScore: isP1 ? (row.player1_score ?? 0) : (row.player2_score ?? 0),
      opponentScore: isP1 ? (row.player2_score ?? 0) : (row.player1_score ?? 0),
      opponentName: "",
      timeLeft: QUESTION_TIME,
      myAnswer: null,
      opponentAnswered: false,
      winnerId: row.winner_id,
      isPlayer1: isP1,
    });

    // Mark as ready
    const readyField = isP1 ? "player1_ready" : "player2_ready";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from("duels_live").update({ [readyField]: true } as any).eq("id", id);

    // Realtime channel
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
          const myScore   = isP1 ? (updated.player1_score as number ?? s.myScore) : (updated.player2_score as number ?? s.myScore);
          const oppScore  = isP1 ? (updated.player2_score as number ?? s.opponentScore) : (updated.player1_score as number ?? s.opponentScore);
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
            winnerId: (updated.winner_id as string) ?? s.winnerId,
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
    const scoreField  = state.isPlayer1 ? "player1_score" : "player2_score";

    const { data: row } = await supabase
      .from("duels_live")
      .select(answerField + ", " + scoreField)
      .eq("id", state.id)
      .single();

    if (!row) return;
    const rowAny = row as unknown as Record<string, unknown>;
    const prevAnswers = (rowAny[answerField] as unknown[] | null) ?? [];
    const prevScore   = (rowAny[scoreField] as number | null) ?? 0;
    const newScore    = prevScore + (isCorrect ? 1 : 0);

    const update: Record<string, unknown> = {
      [answerField]: [...prevAnswers, { idx: optionIndex, correct: isCorrect }],
      [scoreField]: newScore,
    };

    // If both answered, advance question or finish
    const otherAnswerField = state.isPlayer1 ? "player2_answers" : "player1_answers";
    const { data: freshRow } = await supabase
      .from("duels_live")
      .select(otherAnswerField + ", current_question")
      .eq("id", state.id)
      .single();

    const freshRowAny = (freshRow ?? {}) as Record<string, unknown>;
    const otherAnswers = (freshRowAny[otherAnswerField] as unknown[] | null) ?? [];
    const bothAnswered = otherAnswers.length > ((freshRowAny.current_question as number) ?? 0);

    if (bothAnswered) {
      const isLast = state.currentQuestion >= QUESTION_COUNT - 1;
      if (isLast) {
        update.status = "finished";
        // Winner determination done by Postgres trigger / or client-side
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
