"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Family, type SupaTask } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { getQuestionsAsync } from "@/lib/game/questions-loader";
import { gameStorage } from "@/lib/game/game-storage";
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

export interface WeeklyChallengeData {
  id: string;
  weekStart: string;
  question: Question;
  answers: Record<string, { answerIdx: number; correct: boolean; answeredAt: string }>;
  myAnswer: { answerIdx: number; correct: boolean } | null;
  allCorrect: boolean;
  memberCount: number;
}

export interface DuelData {
  taskId: string;
  questionIds: string[];
  challengerId: string;
  challengerName: string;
  challengedId: string;
  challengedName: string;
  challengerScore: number | null;
  challengedScore: number | null;
  expiresAt: string;
  isChallenger: boolean;
  isChallenged: boolean;
  myTurn: boolean;
  status: "pending" | "challenger_played" | "completed";
}

const FAMILY_ID_KEY = "yawmi_family_id";

export function useFamily() {
  const { user } = useAuth();
  const [family,         setFamily]         = useState<Family | null>(null);
  const [tasks,          setTasks]          = useState<SupaTask[]>([]);
  const [members,        setMembers]        = useState<FamilyMember[]>([]);
  const [dailyChallenge,  setDailyChallenge]  = useState<DailyChallengeData | null>(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallengeData | null>(null);
  const [duels,           setDuels]           = useState<DuelData[]>([]);
  const [loading,         setLoading]         = useState(true);

  // ── fetch daily challenge ─────────────────────────────────────
  const fetchOrCreateDaily = useCallback(async (familyId: string, myId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const localKey = `yawmi_daily_${familyId}_${today}`;
    const { QUESTIONS: allQ } = await import("@/lib/game/questions");
    const hard = allQ.filter(q => q.difficulty >= 3);
    const seed = today.split("-").reduce((acc, part) => acc + parseInt(part, 10), 0);
    const localQuestion = hard[seed % hard.length];
    type LocalAnswer = { answerIdx: number; correct: boolean; answeredAt: string };
    const localAnswerRaw = typeof window !== "undefined" ? localStorage.getItem(localKey) : null;
    const localAnswer: LocalAnswer | null = localAnswerRaw ? JSON.parse(localAnswerRaw) : null;
    try {
      const { data: dcInitial, error: fetchErr } = await supabase
        .from("daily_challenges").select("*")
        .eq("family_id", familyId).eq("date", today).maybeSingle();
      if (fetchErr) throw fetchErr;
      let dc = dcInitial;
      if (!dc) {
        const { data: created, error: insertErr } = await supabase
          .from("daily_challenges")
          .insert({ family_id: familyId, date: today, question_id: localQuestion.id, responses: {} })
          .select().single();
        if (!insertErr) dc = created;
      }
      if (dc) {
        const question = allQ.find(q => q.id === dc!.question_id) ?? localQuestion;
        const responses = (dc.responses ?? {}) as Record<string, LocalAnswer>;
        setDailyChallenge({ id: dc.id, date: dc.date, question, responses, myAnswer: responses[myId] ?? localAnswer ?? null });
        return;
      }
    } catch { /* fallback local */ }
    setDailyChallenge({
      id: `local_${familyId}_${today}`,
      date: today,
      question: localQuestion,
      responses: localAnswer ? { [myId]: localAnswer } : {},
      myAnswer: localAnswer,
    });
  }, []);

  // ── members ───────────────────────────────────────────────────
  const buildMemberList = useCallback(async (familyId: string, uid: string) => {
    const { data: profs } = await supabase
      .from("profiles").select("id, display_name").eq("family_id", familyId);
    const ids = (profs ?? []).map(p => p.id);
    const { data: prog } = await supabase.from("player_progress")
      .select("user_id, xp, level, game_streak, defeated_sages, coins")
      .in("user_id", ids.length ? ids : ["_none_"]);
    const list: FamilyMember[] = (profs ?? []).map(p => {
      const pr = prog?.find(x => x.user_id === p.id);
      return {
        id: p.id, displayName: p.display_name,
        xp: pr?.xp ?? 0, level: pr?.level ?? 1,
        gameStreak: pr?.game_streak ?? 0,
        defeatedSages: (pr?.defeated_sages ?? []).length,
        coins: pr?.coins ?? 0, isMe: p.id === uid,
      };
    });
    setMembers(list.sort((a, b) => b.xp - a.xp));
  }, []);

  // ── duels — table dédiée ──────────────────────────────────────
  const fetchAndSetDuels = useCallback(async (myId: string, familyId: string) => {
    const { data, error } = await supabase
      .from("duels")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false });

    if (error) { console.error("fetchDuels:", error); return; }
    if (!data || data.length === 0) { setDuels([]); return; }

    // Noms des participants
    const allIds = [...new Set(data.flatMap((d) => [d.challenger_id, d.challenged_id]))];
    const { data: profs } = await supabase.from("profiles")
      .select("id, display_name")
      .in("id", allIds);
    const nameMap: Record<string, string> = Object.fromEntries(
      (profs ?? []).map(p => [p.id, p.display_name ?? "Joueur"])
    );

    const parsed: DuelData[] = (data as Record<string, unknown>[])
      .filter(d => {
        if (d.status === "expired") return false;
        if (d.status !== "completed" && new Date(d.expires_at as string) < new Date()) return false;
        return true;
      })
      .map(d => {
        const isChallenger = d.challenger_id === myId;
        const isChallenged = d.challenged_id === myId;
        const cScore = d.challenger_score !== undefined ? (d.challenger_score as number | null) : null;
        const dScore = d.challenged_score !== undefined ? (d.challenged_score as number | null) : null;
        const myScore = isChallenger ? cScore : dScore;
        const myTurn = myScore === null;
        const status: DuelData["status"] =
          cScore !== null && dScore !== null ? "completed"
          : cScore !== null ? "challenger_played"
          : "pending";
        return {
          taskId:          d.id as string,
          questionIds:     d.question_ids as string[],
          challengerId:    d.challenger_id as string,
          challengerName:  nameMap[d.challenger_id as string] ?? "Joueur",
          challengedId:    d.challenged_id as string,
          challengedName:  nameMap[d.challenged_id as string] ?? "Joueur",
          challengerScore: cScore,
          challengedScore: dScore,
          expiresAt:       d.expires_at as string,
          isChallenger, isChallenged, myTurn, status,
        };
      });

    setDuels(parsed);
  }, []);

  // ── Weekly challenge fetch/create ────────────────────────────
  const fetchOrCreateWeekly = useCallback(async (familyId: string, myId: string, memberCount: number) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = (dayOfWeek + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diff);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const { QUESTIONS: allQ } = await import("@/lib/game/questions");
    const hard = allQ.filter(q => q.difficulty >= 4);
    const seed = weekStartStr.split("-").reduce((acc, p) => acc + parseInt(p, 10), 0);
    const fallbackQ = hard[seed % hard.length] ?? allQ[0];

    try {
      let { data: wc } = await supabase
        .from("weekly_challenges")
        .select("*")
        .eq("family_id", familyId)
        .eq("week_start", weekStartStr)
        .maybeSingle();

      if (!wc) {
        const { data: created } = await supabase
          .from("weekly_challenges")
          .insert({ family_id: familyId, week_start: weekStartStr, question_id: fallbackQ.id, answers: {} })
          .select().single();
        wc = created;
      }

      if (wc) {
        type AnswerEntry = { answerIdx: number; correct: boolean; answeredAt: string };
        const answers = (wc.answers ?? {}) as Record<string, AnswerEntry>;
        const myAns = answers[myId] ?? null;
        const answeredCount = Object.keys(answers).length;
        const allCorrect = answeredCount === memberCount && Object.values(answers).every(a => a.correct);
        const question = allQ.find(q => q.id === (wc as { question_id: string }).question_id) ?? fallbackQ;
        setWeeklyChallenge({ id: (wc as { id: string }).id, weekStart: weekStartStr, question, answers, myAnswer: myAns, allCorrect, memberCount });
      }
    } catch { /* no-op */ }
  }, []);

  // ── init ──────────────────────────────────────────────────────
  useEffect(() => {
    // Pas d'utilisateur → on arrête le chargement immédiatement, avant le fetch async.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setLoading(false); return; }
    let cleanup: (() => void) | undefined;

    async function init() {
      try {
        await supabase.from("profiles")
          .upsert({ id: user!.id }, { onConflict: "id", ignoreDuplicates: true });

        const { data: profile } = await supabase
          .from("profiles").select("family_id").eq("id", user!.id).single();

        const familyId = profile?.family_id ?? localStorage.getItem(FAMILY_ID_KEY);
        if (!familyId) { setLoading(false); return; }
        if (profile?.family_id) localStorage.setItem(FAMILY_ID_KEY, profile.family_id);

        const [{ data: fam }, { data: taskRows }] = await Promise.all([
          supabase.from("families").select("*").eq("id", familyId).single(),
          supabase.from("tasks").select("*").eq("family_id", familyId).order("created_at", { ascending: false }),
        ]);

        if (!fam) { setLoading(false); return; }
        setFamily(fam);
        setTasks(taskRows ?? []);

        await Promise.allSettled([
          buildMemberList(familyId, user!.id),
          fetchOrCreateDaily(familyId, user!.id),
          fetchAndSetDuels(user!.id, familyId),
        ]);

        // Weekly challenge (after members are loaded so we know count)
        const { data: membProfiles } = await supabase
          .from("profiles").select("id").eq("family_id", familyId);
        const membCount = membProfiles?.length ?? 1;
        await fetchOrCreateWeekly(familyId, user!.id, membCount);

        setLoading(false);

        // Realtime
        const channel = supabase.channel("family:" + familyId)
          .on("postgres_changes",
            { event: "*", schema: "public", table: "tasks", filter: `family_id=eq.${familyId}` },
            ({ eventType, new: n, old: o }) => {
              if (eventType === "INSERT") setTasks(t => {
                if (t.find(x => x.id === (n as SupaTask).id)) return t;
                return [n as SupaTask, ...t];
              });
              if (eventType === "UPDATE") setTasks(t => t.map(x => x.id === (n as SupaTask).id ? n as SupaTask : x));
              if (eventType === "DELETE") setTasks(t => t.filter(x => x.id !== (o as SupaTask).id));
            }
          )
          .on("postgres_changes",
            { event: "*", schema: "public", table: "profiles", filter: `family_id=eq.${familyId}` },
            () => { buildMemberList(familyId, user!.id); }
          )
          .on("postgres_changes",
            { event: "*", schema: "public", table: "duels", filter: `family_id=eq.${familyId}` },
            () => { fetchAndSetDuels(user!.id, familyId); }
          )
          .subscribe();

        cleanup = () => supabase.removeChannel(channel);
      } catch (e) {
        console.error("useFamily:", e);
        setLoading(false);
      }
    }
    init();
    return () => cleanup?.();
  }, [user, fetchOrCreateDaily, fetchOrCreateWeekly, buildMemberList, fetchAndSetDuels]);

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
    const today = new Date().toISOString().split("T")[0];
    if (family) localStorage.setItem(`yawmi_daily_${family.id}_${today}`, JSON.stringify(response));
    if (!dailyChallenge.id.startsWith("local_")) {
      try {
        await supabase.from("daily_challenges")
          .update({ responses: newResponses }).eq("id", dailyChallenge.id);
      } catch { /* table missing */ }
    }
    setDailyChallenge(p => p ? { ...p, responses: newResponses, myAnswer: response } : null);
  }, [dailyChallenge, user, family]);

  // ── createDuel — table duels dédiée ──────────────────────────
  const createDuel = useCallback(async (
    challengedId: string,
    challengedName: string,
    challengerName: string,
  ): Promise<boolean> => {
    if (!user || !family) return false;
    const gameState = gameStorage.get();
    const qPool = await getQuestionsAsync(10, gameState.questionHistory, "beginner", gameState.level, [], 4);
    const questionIds = qPool.map(q => q.id);

    const { data, error } = await supabase.from("duels").insert({
      challenger_id: user.id,
      challenged_id: challengedId,
      family_id:     family.id,
      question_ids:  questionIds,
    }).select().single();

    if (error) {
      console.error("createDuel error:", error);
      throw new Error(error.message ?? JSON.stringify(error));
    }

    const newDuel: DuelData = {
      taskId:          (data as { id: string; expires_at: string }).id,
      questionIds,
      challengerId:    user.id,
      challengerName,
      challengedId,
      challengedName,
      challengerScore: null,
      challengedScore: null,
      expiresAt:       (data as { id: string; expires_at: string }).expires_at,
      isChallenger:    true,
      isChallenged:    false,
      myTurn:          true,
      status:          "pending",
    };
    setDuels(prev => [newDuel, ...prev]);

    // Notifie le défié
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      fetch("/api/push/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          targetUserId: challengedId,
          title: "⚔️ Nouveau défi !",
          body:  `${challengerName} te défie sur Yawmi — relève le défi !`,
          url:   "/famille",
        }),
      }).catch(() => {});
    });

    return true;
  }, [user, family]);

  // ── recordDuelScore ───────────────────────────────────────────
  const recordDuelScore = useCallback(async (duelId: string, score: number): Promise<void> => {
    if (!user) return;
    const duel = duels.find(d => d.taskId === duelId);
    if (!duel) return;

    const updates: Record<string, unknown> = {};
    if (duel.isChallenger) updates.challenger_score = score;
    else updates.challenged_score = score;

    const otherScore = duel.isChallenger ? duel.challengedScore : duel.challengerScore;
    if (otherScore !== null) updates.status = "completed";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from("duels").update(updates as any).eq("id", duelId);
    if (!error) {
      setDuels(prev => prev.map(d => {
        if (d.taskId !== duelId) return d;
        const cs = duel.isChallenger ? score : d.challengerScore;
        const ds = duel.isChallenger ? d.challengedScore : score;
        return {
          ...d,
          challengerScore: cs,
          challengedScore: ds,
          myTurn: false,
          status: cs !== null && ds !== null ? "completed"
                : cs !== null ? "challenger_played"
                : "pending",
        };
      }));

      // Si le challenger vient de jouer, notifie le défié que c'est son tour
      if (duel.isChallenger) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) return;
          fetch("/api/push/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
            body: JSON.stringify({
              targetUserId: duel.challengedId,
              title: "⏰ À toi de jouer !",
              body:  `${duel.challengerName} a joué son défi — réponds-lui !`,
              url:   "/famille",
            }),
          }).catch(() => {});
        });
      }
    }
  }, [user, duels]);

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

  const answerWeekly = useCallback(async (answerIdx: number) => {
    if (!weeklyChallenge || !user) return;
    const correct = weeklyChallenge.question.options[answerIdx]?.correct ?? false;
    const response = { answerIdx, correct, answeredAt: new Date().toISOString() };
    const newAnswers = { ...weeklyChallenge.answers, [user.id]: response };
    const answeredCount = Object.keys(newAnswers).length;
    const allCorrect = answeredCount === weeklyChallenge.memberCount && Object.values(newAnswers).every(a => a.correct);
    setWeeklyChallenge({ ...weeklyChallenge, answers: newAnswers, myAnswer: response, allCorrect });
    await supabase.from("weekly_challenges")
      .update({ answers: newAnswers }).eq("id", weeklyChallenge.id);
  }, [weeklyChallenge, user]);

  return {
    family,
    tasks,
    members,
    dailyChallenge,
    weeklyChallenge,
    duels,
    loading,
    createFamily, joinFamily, leaveFamily,
    answerDaily, answerWeekly, createDuel, recordDuelScore,
    addTask, toggleTask, removeTask,
    fetchOrCreateWeekly,
  };
}
