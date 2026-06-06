import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

// ── Levenshtein distance (character level — used per-word) ────────
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator,
      );
    }
  }
  return matrix[b.length][a.length];
}

// ── Arabic normalization ─────────────────────────────────────────
// Whisper unifies alef variants, drops diacritics, normalizes ta-marbuta.
// We apply the same transforms to `expected` so comparison is fair.
function stripDiacritics(s: string): string {
  // U+064B–U+065F tashkil, U+0670 superscript alef, U+06D6-U+06DC quranic marks
  return s.replace(/[ً-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g, "");
}

function normalizeArabic(s: string): string {
  return s
    // Alef variants → bare alef
    .replace(/[أإآٱاى]/g, "ا")   // أإآٱاى → ا
    // Alef maqsura → ya (Whisper sometimes uses ya where text has alef maqsura)
    // ta marbuta → ha (Whisper often drops the dots)
    .replace(/ة/g, "ه")                                    // ة → ه
    // Remove tatweel (kashida)
    .replace(/ـ/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(s: string): string {
  return normalizeArabic(stripDiacritics(s));
}

// ── Word-level scoring ────────────────────────────────────────────
// Each expected word scores 1 (exact), 0.5 (close variant), 0 (wrong/missing).
// This makes one wrong word matter regardless of verse length.
function calcScore(transcribed: string, expected: string): number {
  const raw = transcribed.trim();
  if (!raw) return 0;

  const tWords = normalize(transcribed).split(" ").filter(Boolean);
  const eWords = normalize(expected).split(" ").filter(Boolean);

  if (eWords.length === 0) return 0;
  if (normalize(transcribed) === normalize(expected)) return 100;

  let points = 0;

  for (let i = 0; i < eWords.length; i++) {
    const tw = tWords[i] ?? "";
    const ew = eWords[i];

    if (tw === ew) {
      points += 1;
      continue;
    }

    if (tw) {
      const dist = levenshtein(tw, ew);
      const maxLen = Math.max(tw.length, ew.length, 1);
      const similarity = 1 - dist / maxLen;
      // ≥70% similar → half credit (minor mispronunciation / variant)
      if (similarity >= 0.7) points += 0.5;
      // else 0 — clearly wrong word
    }
    // missing word = 0 points
  }

  // Small penalty for extra words (Whisper hallucination / added bismillah)
  const extraWords = Math.max(0, tWords.length - eWords.length);
  const penalty = Math.min(extraWords * 0.5, eWords.length * 0.2);

  const raw_score = (points - penalty) / eWords.length;
  return Math.max(0, Math.round(raw_score * 100));
}

// ── Word-level diff ──────────────────────────────────────────────
interface WordError {
  word: string;
  position: number;
  suggestion: string;
}

function compareWords(transcribed: string, expected: string): WordError[] {
  const tWords = normalize(transcribed).split(" ").filter(Boolean);
  const eWords = normalize(expected).split(" ").filter(Boolean);
  const errors: WordError[] = [];

  for (let i = 0; i < eWords.length; i++) {
    const tw = tWords[i] ?? "";
    const ew = eWords[i];

    if (tw === ew) continue;

    const dist = tw ? levenshtein(tw, ew) : ew.length;
    const maxLen = Math.max(tw.length, ew.length, 1);

    // Report error if < 70% similar
    if (dist / maxLen >= 0.3) {
      errors.push({
        word:       tw || "(manquant)",
        position:   i,
        suggestion: ew,
      });
    }
  }
  return errors;
}

// ── Tajwid detection ─────────────────────────────────────────────
interface TajwidIssue { type: string; position: number }

function detectTajwidIssues(text: string): TajwidIssue[] {
  const issues: TajwidIssue[] = [];
  const words = text.split(/\s+/);
  words.forEach((word, idx) => {
    if (/[قطبجد]/.test(word))              issues.push({ type: "qalqala", position: idx });
    if (/[نم][ّ]/.test(word))         issues.push({ type: "ghunna",  position: idx });
    if (/[آأإا][َُِ]|[وي](?=ْ)/.test(word))
                                            issues.push({ type: "madd",    position: idx });
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

    // Prompt tells Whisper this is Quranic Arabic — improves transcription accuracy
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

    // Debug info — always returned so UI can show what Whisper heard
    const debug = {
      transcribed_normalized: normalize(transcribed),
      expected_normalized:    normalize(expected),
    };

    return NextResponse.json({
      transcribed,
      expected,
      score,
      errors,
      tajwid_issues,
      debug,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[quran/recite]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
