import { supabase } from "@/lib/supabase";
import type { Question, MinigameData, QuestionOption } from "./types";

type ArabicLevel = "none" | "beginner" | "intermediate" | "advanced";

const CACHE_KEY = "yawmi_q_pool_v1";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

const ARABIC_LEVEL_ORDER: ArabicLevel[] = ["none", "beginner", "intermediate", "advanced"];

interface Pool {
  questions: Question[];
  cachedAt:  string;
}

function rowToQuestion(row: Record<string, unknown>): Question {
  return {
    id:              row.id as string,
    category:        row.category as Question["category"],
    type:            row.type    as Question["type"],
    difficulty:      row.difficulty as Question["difficulty"],
    question:        row.question as string,
    question_ar:     (row.question_ar as string | null) ?? undefined,
    transliteration: (row.transliteration as string | null) ?? undefined,
    options:         (row.options as QuestionOption[]) ?? [],
    options_ar:      (row.options_ar as QuestionOption[] | null) ?? undefined,
    explanation:     (row.explanation as string | null) ?? undefined,
    explanation_ar:  (row.explanation_ar as string | null) ?? undefined,
    translations:    (row.translations as Partial<Record<string, import("@/lib/game/types").QuestionTranslation>> | null) ?? undefined,
    culturalCapsule: (row.cultural_capsule as { title: string; text: string } | null) ?? undefined,
    locationId:      (row.location_id as string | null) ?? undefined,
    eventId:         (row.event_id  as string | null) ?? undefined,
    arabicRequired:  ((row.arabic_required as string | null) ?? "none") as Question["arabicRequired"],
    minigameData:    (row.minigame_data as MinigameData | null) ?? undefined,
  };
}

function loadCache(): Pool | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const pool = JSON.parse(raw) as Pool;
    const age  = Date.now() - new Date(pool.cachedAt).getTime();
    return age < CACHE_TTL ? pool : null;
  } catch {
    return null;
  }
}

function saveCache(questions: Question[]): void {
  if (typeof window === "undefined") return;
  try {
    const pool: Pool = { questions, cachedAt: new Date().toISOString() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(pool));
  } catch { /* storage plein — pas critique */ }
}

function maxDiffForLevel(level: number): number {
  return Math.min(5, Math.ceil(level / 3));
}

function pickQuestions(
  pool: Question[],
  count: number,
  history: Record<string, { nextDue: string }>,
  arabicLevel: ArabicLevel,
  playerLevel: number = 1,
  startedStoryIds: string[] = [],
  forcedMaxDiff?: number,
): Question[] {
  const today = new Date().toISOString().split("T")[0];
  const userIdx = ARABIC_LEVEL_ORDER.indexOf(arabicLevel);

  const arabicFiltered = pool.filter(q => {
    const reqIdx = ARABIC_LEVEL_ORDER.indexOf(q.arabicRequired ?? "none");
    return userIdx >= reqIdx;
  });

  // Filter by difficulty — relax if pool too small to fill quiz
  const maxDiff = forcedMaxDiff ?? maxDiffForLevel(playerLevel);
  const diffFiltered = arabicFiltered.filter(q => q.difficulty <= maxDiff);
  const eligible = diffFiltered.length >= count ? diffFiltered : arabicFiltered;

  const storySet = new Set(startedStoryIds);
  const due      = eligible.filter(q => history[q.id]?.nextDue <= today);
  const unseen   = eligible.filter(q => !history[q.id]);

  const result: Question[] = [];

  // Reserve up to 2 slots for unseen story-contextual questions
  const storyUnseen = unseen.filter(q => q.eventId && storySet.has(q.eventId));
  for (const q of storyUnseen) {
    if (result.length >= 2) break;
    result.push(q);
  }

  for (const q of due)    if (result.length < Math.ceil(count * 0.4)) result.push(q);
  for (const q of unseen) if (result.length < count && !result.find(r => r.id === q.id)) result.push(q);
  for (const q of eligible) {
    if (!result.find(r => r.id === q.id)) result.push(q);
    if (result.length >= count) break;
  }

  return result.sort(() => Math.random() - 0.5).slice(0, count);
}

async function fetchFromSupabase(): Promise<Question[] | null> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id,category,type,difficulty,question,question_ar,transliteration,options,options_ar,explanation,explanation_ar,translations,cultural_capsule,location_id,event_id,arabic_required,minigame_data")
      .eq("is_active", true)
      .limit(500);

    if (error || !data || data.length === 0) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(rowToQuestion);
  } catch {
    return null;
  }
}

/**
 * Charge les questions depuis Supabase (cache 24h) avec fallback sur questions.ts.
 * Drop-in replacement asynchrone pour getQuestions().
 */
export async function getQuestionsAsync(
  count: number,
  history: Record<string, { nextDue: string }>,
  arabicLevel: ArabicLevel,
  playerLevel: number = 1,
  startedStoryIds: string[] = [],
  forcedMaxDiff?: number,
): Promise<Question[]> {
  // 1. Cache local valide → direct
  const cached = loadCache();
  if (cached && cached.questions.length > 0) {
    return pickQuestions(cached.questions, count, history, arabicLevel, playerLevel, startedStoryIds, forcedMaxDiff);
  }

  // 2. Supabase → rafraîchit le cache
  const remote = await fetchFromSupabase();
  if (remote && remote.length > 0) {
    saveCache(remote);
    return pickQuestions(remote, count, history, arabicLevel, playerLevel, startedStoryIds, forcedMaxDiff);
  }

  // 3. Fallback local — questions.ts (dynamic import to keep it out of initial bundle)
  const { getQuestions } = await import("./questions");
  return getQuestions(count, history, arabicLevel);
}

/**
 * Invalide le cache pour forcer un rechargement depuis Supabase.
 */
export function invalidateQuestionsCache(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CACHE_KEY);
  }
}
