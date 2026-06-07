import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

// ── Arabic normalization ─────────────────────────────────────────
function stripDiacritics(s: string): string {
  return s.replace(/[ً-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g, "");
}

function normalizeArabic(s: string): string {
  return s
    .replace(/[أإآٱاى]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ـ/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(s: string): string {
  return normalizeArabic(stripDiacritics(s));
}

// ── Levenshtein ──────────────────────────────────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

// ── Word similarity ──────────────────────────────────────────────
function wordSim(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
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

  const formData  = await req.formData();
  const audioBlob = formData.get("audio") as File | null;
  const wordsJson = formData.get("words") as string | null;   // JSON array de mots attendus
  const offsetStr = formData.get("offset") as string | null;  // index du premier mot attendu

  if (!audioBlob || !wordsJson) {
    return NextResponse.json({ confirmed_up_to: -1 });
  }
  if (audioBlob.size < 1000) {
    return NextResponse.json({ confirmed_up_to: -1 }); // chunk trop court
  }

  const expectedWords: string[] = JSON.parse(wordsJson);
  const offset = parseInt(offsetStr ?? "0", 10);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ confirmed_up_to: -1 });

  try {
    const groq = new Groq({ apiKey });
    const transcription = await groq.audio.transcriptions.create({
      file:            audioBlob,
      model:           "whisper-large-v3-turbo",
      language:        "ar",
      prompt:          "قرآن كريم تلاوة بالعربية الفصحى",
      response_format: "text",
    });

    const transcribed = (transcription as unknown as string).trim();
    if (!transcribed) return NextResponse.json({ confirmed_up_to: -1 });

    const tWords = normalize(transcribed).split(" ").filter(Boolean);
    const eWords = expectedWords.slice(offset).map(w => normalize(w));

    // Trouver le dernier mot attendu aligné avec confiance > 0.75
    let confirmedUpTo = offset - 1;
    let ei = 0, ti = 0;
    while (ei < eWords.length && ti < tWords.length) {
      const sim = wordSim(eWords[ei], tWords[ti]);
      if (sim >= 0.75) {
        confirmedUpTo = offset + ei;
        ei++;
        ti++;
      } else if (wordSim(eWords[ei], tWords[Math.min(ti + 1, tWords.length - 1)]) >= 0.75) {
        ti++; // sauter un mot transcrit
      } else {
        ei++; // mot manqué
      }
    }

    return NextResponse.json({ confirmed_up_to: confirmedUpTo });
  } catch {
    return NextResponse.json({ confirmed_up_to: -1 });
  }
}
