"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Family, type SupaTask } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { QUESTIONS } from "@/lib/game/questions";
import type { Question } from "@/lib/game/types";

// ── Types ──────────────────────────────────────────────────────
export interface FamilyMember {
  id: string;
  displayName: string | null;
  xp: number;
  level: number;
  gameStreak: number;
  defeatedSages: number;
  coins: number;
  isMe: boolean;
}

export interface DailyChallengeData {
  id: string;
  date: string;
  question: Question;
  responses: Record<string, { answerIdx: number; correct: boolean; answeredAt: string }>;
  myAnswer: { answerIdx: number; correct: boolean } | null;
}

export interface DuelData {
  id: string;
  challengerId: string;
  challengedId: string;
  challengerName: string | null;
  challengedName: string | null;
  challengerScore: number | null;
  challengedScore: number | null;
  status: "pending" | "completed" | "expired";
  winnerId: string | null;
  expiresAt: string;
  isChallenger: boolean;
  questionIds: string[];
}

const FAMILY_ID_KEY = "yawmi_family_id";

export function useFamily() {
  const { user } = useAuth();
  const [family,         setFamily]         = useState<Family | null>(null);
  const [tasks,          setTasks]          = useState<SupaTask[]>([]);
  const [members,        setMembers]        = useState<FamilyMember[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeData | null>(null);
  const [duels,          setDuels]          = useState<DuelData[]>([]);
  const [loading,        setLoading]        = useState(true);

  // ── fetch daily challenge ─────────────────────────────────────
  const fetchOrCreateDaily = useCallback(async (familyId: string, myId: string) => {
    const today = new Date().toISOString().split("T")[0];
    let { data: dc } = await supabase
      .from("daily_challenges").select("*")
      .eq("family_id", familyId).eq("date", today).maybeSingle();

    if (!dc) {
      const hard = QUESTIONS.filter(q => q.difficulty >= 3);
      const q = hard[Math.floor(Math.random() * hard.length)];
      const { data: created } = await supabase
        .from("daily_challenges")
        .insert({ family_id: familyId, date: today, question_id: q.id, responses: {} })
        .select().single();
      dc = created;
    }
    if (!dc) return;

    const question = QUESTIONS.find(q => q.id === dc!.question_id);
    if (!question) return;

    const responses = (dc.responses ?? {}) as Record<string, { answerIdx: number; correct: boolean; answeredAt: string }>;
    setDailyChallenge({ id: dc.id, date: dc.date, question, responses, myAnswer: responses[myId] ?? null });
  }, []);

  // ── fetch duels ───────────────────────────────────────────────
  const fetchDuels = useCallback(async (myId: string, memberProfiles: { id: string; displayName: string | null }[]) => {
    const { data } = await supabase.from("duels").select("*")
      .or(`challenger_id.eq.${myId},challenged_id.eq.${myId}`)
      .eq("status", "pending")
      .order("created_at", { ascending: false }).limit(10);
    if (!data) return;
    const getName = (id: string) => memberProfiles.find(p => p.id === id)?.displayName ?? "Membre";
    setDuels(data.map(d => ({
      id: d.id, challengerId: d.challenger_id, challengedId: d.challenged_id,
      challengerName: getName(d.challenger_id), challengedName: getName(d.challenged_id),
      challengerScore: d.challenger_score, challengedScore: d.challenged_score,
      status: d.status, winnerId: d.winner_id, expiresAt: d.expires_at,
      isChallenger: d.challenger_id === myId, questionIds: d.question_ids ?? [],
    })));
  }, []);

  // ── init ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cleanup: (() => void) | undefined;

    async function init() {
      try {
        // Ensure profile exists
        await supabase.from("profiles")
          .upsert({ id: user!.id }, { onConflict: "id", ignoreDuplicates: true });

        const { data: profile } = await supabase
          .from("profiles").select("family_id").eq("id", user!.id).single();

        // Try Supabase first, fall back to localStorage cache
        const familyId = profile?.family_id ?? localStorage.getItem(FAMILY_ID_KEY);
        if (!familyId) { setLoading(false); return; }

        // Sync localStorage with Supabase value
        if (profile?.family_id) localStorage.setItem(FAMILY_ID_KEY, profile.family_id);

        const [{ data: fam }, { data: taskRows }] = await Promise.all([
          supabase.from("families").select("*").eq("id", familyId).single(),
          supabase.from("tasks").select("*").eq("family_id", familyId).order("created_at", { ascending: false }),
        ]);

        if (!fam) { setLoading(false); return; }
        setFamily(fam);
        setTasks(taskRows ?? []);

        // Members
        const { data: profs } = await supabase
          .from("profiles").select("id, display_name").eq("family_id", familyId);
        const ids = (profs ?? []).map(p => p.id);
        const { data: prog } = await supabase.from("player_progress")
          .select("user_id, xp, level, game_streak, defeated_sages, coins")
          .in("user_id", ids.length ? ids : ["_none_"]);
        const memberList: FamilyMember[] = (profs ?? []).map(p => {
          const pr = prog?.find(x => x.user_id === p.id);
          return {
            id: p.id, displayName: p.display_name,
            xp: pr?.xp ?? 0, level: pr?.level ?? 1,
            gameStreak: pr?.game_streak ?? 0,
            defeatedSages: (pr?.defeated_sages ?? []).length,
            coins: pr?.coins ?? 0, isMe: p.id === user!.id,
          };
        });
        setMembers(memberList.sort((a, b) => b.xp - a.xp));

        await Promise.allSettled([
          fetchOrCreateDaily(familyId, user!.id),
          fetchDuels(user!.id, (profs ?? []).map(p => ({ id: p.id, displayName: p.display_name ?? null }))),
        ]);

        setLoading(false);

        // Realtime
        const channel = supabase.channel("tasks:" + familyId)
          .on("postgres_changes",
            { event: "*", schema: "public", table: "tasks", filter: `family_id=eq.${familyId}` },
            ({ eventType, new: n, old: o }) => {
              if (eventType === "INSERT") setTasks(t => [n as SupaTask, ...t]);
              if (eventType === "UPDATE") setTasks(t => t.map(x => x.id === (n as SupaTask).id ? n as SupaTask : x));
              if (eventType === "DELETE") setTasks(t => t.filter(x => x.id !== (o as SupaTask).id));
            }
          ).subscribe();
        cleanup = () => supabase.removeChannel(channel);
      } catch (e) {
        console.error("useFamily:", e);
        setLoading(false);
      }
    }
    init();
    return () => cleanup?.();
  }, [user, fetchOrCreateDaily, fetchDuels]);

  // ── createFamily ──────────────────────────────────────────────
  const createFamily = useCallback(async (name: string): Promise<{ family: Family | null; error: string | null }> => {
    if (!user) return { family: null, error: "Non connecté" };
    const code = Array.from({ length: 6 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
    ).join("");
    const { data: fam, error: err } = await supabase
      .from("families").insert({ name, code, created_by: user.id }).select().single();
    if (err || !fam) return { family: null, error: err?.message ?? "Erreur" };
    await supabase.from("profiles").update({ family_id: fam.id }).eq("id", user.id);
    localStorage.setItem(FAMILY_ID_KEY, fam.id);
    setFamily(fam);
    return { family: fam, error: null };
  }, [user]);

  // ── joinFamily ────────────────────────────────────────────────
  const joinFamily = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;
    const { data: fam } = await supabase
      .from("families").select().eq("code", code.toUpperCase().trim()).single();
    if (!fam) return false;
    await supabase.from("profiles").update({ family_id: fam.id }).eq("id", user.id);
    localStorage.setItem(FAMILY_ID_KEY, fam.id);
    setFamily(fam);
    return true;
  }, [user]);

  // ── leaveFamily ───────────────────────────────────────────────
  const leaveFamily = useCallback(async () => {
    if (!user) return;
    await supabase.from("profiles").update({ family_id: null }).eq("id", user.id);
    localStorage.removeItem(FAMILY_ID_KEY);
    setFamily(null); setMembers([]); setDuels([]); setDailyChallenge(null);
  }, [user]);

  // ── answerDaily ───────────────────────────────────────────────
  const answerDaily = useCallback(async (answerIdx: number) => {
    if (!dailyChallenge || !user) return;
    const correct = dailyChallenge.question.options[answerIdx]?.correct ?? false;
    const response = { answerIdx, correct, answeredAt: new Date().toISOString() };
    const newResponses = { ...dailyChallenge.responses, [user.id]: response };
    await supabase.from("daily_challenges").update({ responses: newResponses }).eq("id", dailyChallenge.id);
    setDailyChallenge(p => p ? { ...p, responses: newResponses, myAnswer: response } : null);
  }, [dailyChallenge, user]);

  // ── createDuel ────────────────────────────────────────────────
  const createDuel = useCallback(async (challengedId: string): Promise<boolean> => {
    if (!user || !family) return false;
    const questionIds = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10).map(q => q.id);
    const { error } = await supabase.from("duels").insert({
      challenger_id: user.id, challenged_id: challengedId,
      family_id: family.id, question_ids: questionIds, status: "pending",
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    return !error;
  }, [user, family]);

  // ── tasks ─────────────────────────────────────────────────────
  const addTask = useCallback(async (text: string, member: string) => {
    if (!family || !user) return;
    await supabase.from("tasks").insert({ family_id: family.id, text, member, created_by: user.id });
  }, [family, user]);

  const toggleTask = useCallback(async (id: string, done: boolean) => {
    await supabase.from("tasks").update({ done: !done }).eq("id", id);
  }, []);

  const removeTask = useCallback(async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
  }, []);

  return {
    family, tasks, members, dailyChallenge, duels, loading,
    createFamily, joinFamily, leaveFamily,
    answerDaily, createDuel,
    addTask, toggleTask, removeTask,
  };
}
