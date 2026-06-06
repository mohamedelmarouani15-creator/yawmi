import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

// ── Levenshtein distance ─────────────────────────────────────────
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

// ── Strip Arabic diacritics for fuzzy comparison ─────────────────
// Keep base letters, remove tashkil for scoring (tashkil errors are
// surfaced separately via tajwid detection)
function stripDiacritics(s: string): string {
  // U+064B–U+065F = tashkil range, U+0670 = superscript alef
  return s.replace(/[ً-ٰٟ]/g, "");
}

// ── Word-level diff ──────────────────────────────────────────────
interface WordError {
  word: string;
  position: number;
  suggestion: string;
}

function compareWords(transcribed: string, expected: string): WordError[] {
  const tWords = stripDiacritics(transcribed).split(/\s+/).filter(Boolean);
  const eWords = stripDiacritics(expected).split(/\s+/).filter(Boolean);
  const errors: WordError[] = [];

  for (let i = 0; i < eWords.length; i++) {
    const tw = tWords[i] ?? "";
    const ew = eWords[i];
    if (tw !== ew) {
      errors.push({ word: tw || "(manquant)", position: i, suggestion: ew });
    }
  }
  return errors;
}

// ── Basic tajwid detection ───────────────────────────────────────
// Detects letter classes that require specific pronunciation rules.
// This is heuristic — full tajwid needs a proper parser.
interface TajwidIssue {
  type: string;
  position: number;
}

const QALQALA_LETTERS = /[قطبجد]/g;
const GHUNNA_PATTERN  = /[نم]ّ/g; // nun/mim + shadda
const MADD_PATTERN    = /[آأإا][َُِ]|[وي](?=ْ)/g; // alef madda or waw/ya followed by sukun

function detectTajwidIssues(text: string): TajwidIssue[] {
  const issues: TajwidIssue[] = [];
  const words = text.split(/\s+/);

  words.forEach((word, idx) => {
    if (QALQALA_LETTERS.test(word))  issues.push({ type: "qalqala", position: idx });
    if (GHUNNA_PATTERN.test(word))   issues.push({ type: "ghunna",  position: idx });
    if (MADD_PATTERN.test(word))     issues.push({ type: "madd",    position: idx });
  });

  return issues;
}

// ── Score calculation ────────────────────────────────────────────
function calcScore(transcribed: string, expected: string): number {
  const t = stripDiacritics(transcribed).replace(/\s+/g, " ").trim();
  const e = stripDiacritics(expected).replace(/\s+/g, " ").trim();

  if (!t) return 0;
  if (t === e) return 100;

  const dist = levenshtein(t, e);
  const maxLen = Math.max(t.length, e.length, 1);
  return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

// ── Auth helper ──────────────────────────────────────────────────
function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── Route ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio") as File | null;
    const expected  = formData.get("expected") as string | null;

    if (!audioBlob || !expected) {
      return NextResponse.json(
        { error: "audio et expected sont requis" },
        { status: 400 },
      );
    }

    // Validate audio size (max 25 MB — Groq limit)
    if (audioBlob.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio trop volumineux (max 25 Mo)" }, { status: 413 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY manquante" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    // Transcribe via Groq Whisper — audio is deleted from memory after response
    const transcription = await groq.audio.transcriptions.create({
      file: audioBlob,
      model: "whisper-large-v3-turbo",
      language: "ar",
      response_format: "text",
    });

    const transcribed = (transcription as unknown as string).trim();
    const score = calcScore(transcribed, expected);
    const errors = compareWords(transcribed, expected);
    const tajwid_issues = detectTajwidIssues(expected);

    return NextResponse.json({
      transcribed,
      expected,
      score,
      errors,
      tajwid_issues,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[quran/recite]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
