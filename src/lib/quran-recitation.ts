import { supabase } from "./supabase";
import { updateSM2 } from "./game/sm2";
import type { QuestionHistory } from "./game/types";

// ── Types ────────────────────────────────────────────────────────

export interface RecitationReward {
  xp: number;
  coins: number;
  isMastered: boolean;  // transition non-mastered → mastered (score >= 85, 1ère fois)
  isPerfect:  boolean;  // score >= 90
  isSmReview: boolean;  // verset était dû aujourd'hui
}

export interface RecitationRecord {
  surah: number;
  ayah: number;
  times_seen: number;
  times_correct: number;
  easiness_factor: number;
  interval_days: number;
  next_due: string;
  best_score: number;
  last_score: number;
  mastered: boolean;
  tajwid_weak: string[];
  first_seen_at: string;
  last_seen_at: string;
}

export interface RecitationStats {
  masteredTotal: number;
  dueToday: number;
  surahMastery: number | null;    // avg score for a specific surah, null if no data
  surahMasteredCount: number;     // mastered ayahs in a specific surah
}

// ── SM-2 quality mapping ─────────────────────────────────────────
// score >= 90 → q=5 (correct, effortless)
// score >= 70 → q=3 (correct, with hesitation)
// score  < 70 → q=0 (incorrect)

function scoreToQuality(score: number): 0 | 3 | 5 {
  if (score >= 90) return 5;
  if (score >= 70) return 3;
  return 0;
}

// ── Save recitation result ───────────────────────────────────────

export async function saveRecitation(
  surahNumber: number,
  ayahNumber: number,
  score: number,
  tajwidTypes: string[],
): Promise<RecitationReward> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { xp: 0, coins: 0, isMastered: false, isPerfect: false, isSmReview: false };

  // Fetch existing record (ignore error — may not exist yet)
  const { data: existing } = await supabase
    .from("quran_recitation")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("surah", surahNumber)
    .eq("ayah", ayahNumber)
    .single();

  const isCorrect = score >= 70;
  const quality   = scoreToQuality(score);

  const prevHistory: QuestionHistory | undefined = existing
    ? {
        timesSeen:      existing.times_seen,
        timesCorrect:   existing.times_correct,
        easinessFactor: existing.easiness_factor,
        intervalDays:   existing.interval_days,
        nextDue:        existing.next_due,
      }
    : undefined;

  const sm2 = updateSM2(prevHistory, isCorrect, quality);

  // Accumulate weak tajwid types when score < 85
  const weakSet = new Set<string>(existing?.tajwid_weak ?? []);
  if (score < 85) tajwidTypes.forEach(t => weakSet.add(t));
  // Clear a type if score >= 85 and type isn't repeatedly failing
  if (score >= 85) weakSet.clear();

  const wasAlreadyMastered = existing?.mastered ?? false;
  const today = new Date().toISOString().split("T")[0];
  const isSmReview = existing?.next_due
    ? existing.next_due <= today
    : false;

  const record = {
    user_id:         session.user.id,
    surah:           surahNumber,
    ayah:            ayahNumber,
    times_seen:      sm2.timesSeen,
    times_correct:   sm2.timesCorrect,
    easiness_factor: sm2.easinessFactor,
    interval_days:   sm2.intervalDays,
    next_due:        sm2.nextDue,
    best_score:      Math.max(score, existing?.best_score ?? 0),
    last_score:      score,
    mastered:        score >= 85,
    tajwid_weak:     [...weakSet],
    last_seen_at:    new Date().toISOString(),
  };

  await supabase
    .from("quran_recitation")
    .upsert(record, { onConflict: "user_id,surah,ayah" });

  const isMastered = score >= 85 && !wasAlreadyMastered;
  const isPerfect  = score >= 90;
  let xp    = isPerfect ? 15 : score >= 85 ? 10 : score >= 70 ? 5 : 0;
  let coins = isPerfect ? 3  : score >= 85 ? 2  : score >= 70 ? 1 : 0;
  if (isSmReview && score >= 70) { xp += 5; coins += 1; }

  return { xp, coins, isMastered, isPerfect, isSmReview };
}

// ── Fetch stats ──────────────────────────────────────────────────

export async function getRecitationStats(surahNumber?: number): Promise<RecitationStats> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { masteredTotal: 0, dueToday: 0, surahMastery: null, surahMasteredCount: 0 };

  const { data } = await supabase
    .from("quran_recitation")
    .select("surah, ayah, mastered, next_due, last_score, best_score")
    .eq("user_id", session.user.id);

  if (!data || data.length === 0) {
    return { masteredTotal: 0, dueToday: 0, surahMastery: null, surahMasteredCount: 0 };
  }

  const today = new Date().toISOString().split("T")[0];
  const masteredTotal = data.filter(r => r.mastered).length;
  const dueToday      = data.filter(r => !r.mastered && r.next_due <= today).length;

  let surahMastery: number | null = null;
  let surahMasteredCount = 0;

  if (surahNumber !== undefined) {
    const surahRecords = data.filter(r => r.surah === surahNumber);
    if (surahRecords.length > 0) {
      surahMastery = Math.round(
        surahRecords.reduce((sum, r) => sum + (r.best_score ?? 0), 0) / surahRecords.length,
      );
      surahMasteredCount = surahRecords.filter(r => r.mastered).length;
    }
  }

  return { masteredTotal, dueToday, surahMastery, surahMasteredCount };
}

// ── SM-2 review queue ────────────────────────────────────────────

export async function getDueAyahs(surahNumber: number): Promise<number[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("quran_recitation")
    .select("ayah")
    .eq("user_id", session.user.id)
    .eq("surah", surahNumber)
    .eq("mastered", false)
    .lte("next_due", today)
    .order("next_due", { ascending: true });

  return (data ?? []).map((r: { ayah: number }) => r.ayah);
}

// ── Per-surah stats for list view ────────────────────────────────

export async function getAllSurahStats(): Promise<Map<number, { masteredCount: number; dueCount: number }>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Map();

  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("quran_recitation")
    .select("surah, mastered, next_due")
    .eq("user_id", session.user.id);

  if (!data || data.length === 0) return new Map();

  const map = new Map<number, { masteredCount: number; dueCount: number }>();
  for (const r of data) {
    const cur = map.get(r.surah) ?? { masteredCount: 0, dueCount: 0 };
    if (r.mastered) cur.masteredCount++;
    else if (r.next_due <= today) cur.dueCount++;
    map.set(r.surah, cur);
  }
  return map;
}

// ── Lifetime recitation stats ────────────────────────────────────

export interface LifetimeRecitationStats {
  totalSessions: number;   // SUM de tous les times_seen
  masteredCount: number;   // nb de versets avec mastered=true
  avgBestScore:  number;   // moyenne des best_score (arrondi entier)
  surahsStarted: number;   // nb de sourates distinctes avec au moins 1 verset vu
}

export async function getLifetimeStats(): Promise<LifetimeRecitationStats> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { totalSessions: 0, masteredCount: 0, avgBestScore: 0, surahsStarted: 0 };

  const { data } = await supabase
    .from("quran_recitation")
    .select("surah, times_seen, mastered, best_score")
    .eq("user_id", session.user.id);

  if (!data || data.length === 0) {
    return { totalSessions: 0, masteredCount: 0, avgBestScore: 0, surahsStarted: 0 };
  }

  const totalSessions = data.reduce((sum, r) => sum + (r.times_seen ?? 0), 0);
  const masteredCount = data.filter(r => r.mastered).length;
  const scores        = data.map(r => r.best_score ?? 0).filter((s: number) => s > 0);
  const avgBestScore  = scores.length > 0
    ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
    : 0;
  const surahsStarted = new Set(data.map(r => r.surah)).size;

  return { totalSessions, masteredCount, avgBestScore, surahsStarted };
}
