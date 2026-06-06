import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

// ── Levenshtein (character level, used per word) ──────────────────
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const ind = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + ind,
      );
    }
  }
  return matrix[b.length][a.length];
}

// ── Arabic normalization ─────────────────────────────────────────
function stripDiacritics(s: string): string {
  return s.replace(/[ً-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g, "");
}

function normalizeArabic(s: string): string {
  return s
    .replace(/[أإآٱاى]/g, "ا")  // alef variants → bare alef
    .replace(/ة/g, "ه")          // ta marbuta → ha
    .replace(/ـ/g, "")            // remove kashida
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(s: string): string {
  return normalizeArabic(stripDiacritics(s));
}

// ── Arabic phonetic similarity bonus ─────────────────────────────
// Confusing phonetically similar letters (ذ/ز, ث/س, ح/ه, ع/أ etc.)
// is a lesser error than confusing completely different letters.
// Returns 0-0.3 bonus added to raw character similarity.
const PHONETIC_PAIRS: [string, string][] = [
  ["ذ", "ز"], ["ذ", "ض"], ["ض", "ز"],
  ["ث", "س"], ["ث", "ص"], ["س", "ص"],
  ["ح", "ه"], ["ح", "خ"],
  ["ع", "غ"], ["ق", "ك"],
  ["ظ", "ض"], ["ظ", "ذ"],
  ["ط", "ت"], ["د", "ذ"],
];

function phoneticBonus(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length !== 1 || b.length !== 1) return 0;
  for (const [x, y] of PHONETIC_PAIRS) {
    if ((a === x && b === y) || (a === y && b === x)) return 0.25;
  }
  return 0;
}

// ── Word similarity (continuous 0.0–1.0) ─────────────────────────
// Character-level similarity adjusted for Arabic phonetics.
function wordSim(a: string, b: string): number {
  if (a === b) return 1.0;
  if (!a || !b) return 0.0;

  const maxLen = Math.max(a.length, b.length);
  const charSim = 1 - levenshtein(a, b) / maxLen;

  // Phonetic bonus: check if single-letter difference is a phonetic pair
  const diffCount = levenshtein(a, b);
  let bonus = 0;
  if (diffCount === 1 && a.length === b.length) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) { bonus = phoneticBonus(a[i], b[i]); break; }
    }
  }

  return Math.min(1.0, charSim + bonus * (1 - charSim));
}

// ── Precision scoring via Needleman-Wunsch alignment ─────────────
// Aligns transcribed words to expected words optimally.
// Handles skipped words (missing), extra words (hallucination), reorder.
// Returns score 0.0–100.0 with one decimal precision.

const GAP_PENALTY = 0.15; // penalty per extra transcribed word

function calcScore(transcribed: string, expected: string): number {
  if (!transcribed.trim()) return 0;

  const tW = normalize(transcribed).split(" ").filter(Boolean);
  const eW = normalize(expected).split(" ").filter(Boolean);

  if (eW.length === 0) return 0;
  if (normalize(transcribed) === normalize(expected)) return 100;

  const E = eW.length;
  const T = tW.length;

  // dp[i][j] = best cumulative score using eW[0..i-1] and tW[0..j-1]
  const dp: number[][] = Array.from({ length: E + 1 }, () => new Array(T + 1).fill(0));

  // Penalty for unused transcribed words at the start
  for (let j = 1; j <= T; j++) dp[0][j] = dp[0][j - 1] - GAP_PENALTY;

  for (let i = 1; i <= E; i++) {
    for (let j = 0; j <= T; j++) {
      // Skip expected word (missing) — no gain, no penalty
      const skipE = dp[i - 1][j];

      if (j === 0) { dp[i][j] = skipE; continue; }

      // Skip transcribed word (extra/hallucinated) — small penalty
      const skipT = dp[i][j - 1] - GAP_PENALTY;

      // Match expected word i with transcribed word j
      const sim   = wordSim(eW[i - 1], tW[j - 1]);
      const match = dp[i - 1][j - 1] + sim;

      dp[i][j] = Math.max(skipE, skipT, match);
    }
  }

  // Score = aligned_score / E (max possible = E words × 1.0 each)
  const raw = dp[E][T] / E;
  return Math.max(0, Math.min(100, Math.round(raw * 1000) / 10)); // 1 decimal
}

// ── Word error detection (backtrack alignment) ───────────────────
interface WordError {
  word: string;
  position: number;       // index in expected
  suggestion: string;     // original expected word (with tashkil)
  similarity: number;     // 0-100
}

function compareWords(transcribed: string, expected: string): WordError[] {
  const tW   = normalize(transcribed).split(" ").filter(Boolean);
  const eW   = normalize(expected).split(" ").filter(Boolean);
  // Keep original expected words (with tashkil) for suggestions
  const eOrig = stripDiacritics(expected).split(/\s+/).filter(Boolean);
  const errors: WordError[] = [];

  const E = eW.length;
  const T = tW.length;

  // DP (same as calcScore)
  const dp: number[][] = Array.from({ length: E + 1 }, () => new Array(T + 1).fill(0));
  for (let j = 1; j <= T; j++) dp[0][j] = dp[0][j - 1] - GAP_PENALTY;
  for (let i = 1; i <= E; i++) {
    for (let j = 0; j <= T; j++) {
      const skipE = dp[i - 1][j];
      if (j === 0) { dp[i][j] = skipE; continue; }
      const skipT = dp[i][j - 1] - GAP_PENALTY;
      const match = dp[i - 1][j - 1] + wordSim(eW[i - 1], tW[j - 1]);
      dp[i][j] = Math.max(skipE, skipT, match);
    }
  }

  // Backtrack to find alignment
  let i = E, j = T;
  const alignment: { ei: number; ti: number | null }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sim   = wordSim(eW[i - 1], tW[j - 1]);
      const match = dp[i - 1][j - 1] + sim;
      if (Math.abs(dp[i][j] - match) < 1e-9) {
        alignment.unshift({ ei: i - 1, ti: j - 1 });
        i--; j--; continue;
      }
    }
    if (j > 0 && Math.abs(dp[i][j] - (dp[i][j - 1] - GAP_PENALTY)) < 1e-9) {
      // extra transcribed word — skip
      j--; continue;
    }
    // missing expected word
    alignment.unshift({ ei: i - 1, ti: null });
    i--;
  }

  for (const { ei, ti } of alignment) {
    const tw  = ti !== null ? tW[ti] : "";
    const ew  = eW[ei];
    const sim = ti !== null ? wordSim(tw, ew) : 0;
    if (sim < 0.9) {
      errors.push({
        word:       tw || "(manquant)",
        position:   ei,
        suggestion: eOrig[ei] ?? ew,
        similarity: Math.round(sim * 100),
      });
    }
  }

  return errors;
}

// ── Tajwid detection ─────────────────────────────────────────────
interface TajwidIssue { type: string; position: number }

function detectTajwidIssues(text: string): TajwidIssue[] {
  const issues: TajwidIssue[] = [];
  text.split(/\s+/).forEach((word, idx) => {
    if (/[قطبجد]/.test(word))                      issues.push({ type: "qalqala", position: idx });
    if (/[نم][ّ]/.test(word))                 issues.push({ type: "ghunna",  position: idx });
    if (/[آأإا][َُِ]|[وي](?=ْ)/.test(word))  issues.push({ type: "madd",    position: idx });
  });
  return issues;
}

// ── Auth ─────────────────────────────────────────────────────────
function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── Route ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const formData  = await req.formData();
    const audioBlob = formData.get("audio") as File | null;
    const expected  = formData.get("expected") as string | null;

    if (!audioBlob || !expected) {
      return NextResponse.json({ error: "audio et expected sont requis" }, { status: 400 });
    }
    if (audioBlob.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio trop volumineux (max 25 Mo)" }, { status: 413 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY manquante" }, { status: 500 });

    const groq = new Groq({ apiKey });

    const transcription = await groq.audio.transcriptions.create({
      file:            audioBlob,
      model:           "whisper-large-v3-turbo",
      language:        "ar",
      prompt:          "قرآن كريم تلاوة بالعربية الفصحى",
      response_format: "text",
    });

    const transcribed   = (transcription as unknown as string).trim();
    const score         = calcScore(transcribed, expected);
    const errors        = compareWords(transcribed, expected);
    const tajwid_issues = detectTajwidIssues(expected);

    const debug = {
      transcribed_normalized: normalize(transcribed),
      expected_normalized:    normalize(expected),
      word_count:             { transcribed: normalize(transcribed).split(" ").filter(Boolean).length,
                                expected:    normalize(expected).split(" ").filter(Boolean).length },
    };

    return NextResponse.json({ transcribed, expected, score, errors, tajwid_issues, debug });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[quran/recite]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
