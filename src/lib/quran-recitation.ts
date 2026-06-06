import { supabase } from "./supabase";
import { updateSM2 } from "./game/sm2";
import type { QuestionHistory } from "./game/types";

// ── Types ────────────────────────────────────────────────────────

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
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

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
