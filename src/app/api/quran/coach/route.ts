import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";
import { checkRateLimit } from "@/lib/rate-limit";

// ── Types ────────────────────────────────────────────────────────

interface WordError  { word: string; position: number; suggestion: string }
interface TajwidIssue { type: string; position: number }

interface CoachRequest {
  surahNumber:  number;
  ayahNumber:   number;
  ayahText:     string;
  transcribed:  string;
  score:        number;
  errors:       WordError[];
  tajwidIssues: TajwidIssue[];
  ageGroup:     string;
  arabicLevel:  string;
}

export interface CoachResponse {
  encouragement:  string;
  tajwid?:        string;
  pronunciation?: string;
  makhraj_zone?:  "throat" | "back_tongue" | "mid_tongue" | "front_tongue" | "teeth" | "lips" | null;
  makhraj_letter?: string;
  tafsir?:        string;
  next_focus?:    string;
  agents:         string[];
}

// ── Age description ──────────────────────────────────────────────

function ageDesc(ageGroup: string): string {
  if (ageGroup === "4-10")  return "un enfant de 4-10 ans";
  if (ageGroup === "11-17") return "un adolescent de 11-17 ans";
  if (ageGroup === "55+")   return "une personne âgée (55+)";
  return "un adulte";
}

// ── Sub-agents ───────────────────────────────────────────────────

async function agentEncouragement(
  groq: Groq,
  score: number,
  age: string,
): Promise<string> {
  const tier =
    score >= 90 ? "Félicite chaleureusement — c'est excellent ! Ajoute une courte dua de gratitude." :
    score >= 70 ? "Félicite le progrès et encourage la persévérance — le paradis récompense l'effort." :
    "Motive avec douceur — la honte n'a pas sa place, chaque tentative est une ibadah.";

  const res = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    max_tokens:  100,
    temperature: 0.75,
    messages: [{
      role:    "user",
      content: `Tu es un imam bienveillant. L'élève est ${age}. Score : ${score}/100.
${tier}
Réponds en 1-2 phrases, en français, ton chaleureux et sincère. Pas de longueur excessive.`,
    }],
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

async function agentTajwid(
  groq: Groq,
  ayahText: string,
  errors: WordError[],
  tajwidTypes: string[],
  age: string,
): Promise<string> {
  const errorList = errors.slice(0, 3).map(e => `"${e.word || "?"}" → "${e.suggestion}"`).join(", ");
  const rules     = tajwidTypes.length ? tajwidTypes.join(", ") : "non identifiées";

  const res = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    max_tokens:  250,
    temperature: 0.4,
    messages: [{
      role:    "user",
      content: `Tu es un expert en tajwid. L'élève est ${age}.
Verset : « ${ayahText} »
Mots à corriger : ${errorList || "aucun mot identifié"}
Règles concernées : ${rules}

Donne 2-3 conseils tajwid précis. Utilise les termes arabes suivis de leur traduction (ex : إدغام — assimilation).
Ton bienveillant. Maximum 100 mots. En français.`,
    }],
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

async function agentMakhraj(
  groq: Groq,
  errors: WordError[],
  age: string,
): Promise<{ text: string; zone: string | null; letter: string | null }> {
  const words = errors.slice(0, 3).map(e => e.suggestion).filter(Boolean).join("، ");
  if (!words) return { text: "", zone: null, letter: null };

  const res = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    max_tokens:  220,
    temperature: 0.4,
    messages: [{
      role:    "user",
      content: `Tu es un professeur de phonétique arabe coranique. L'élève est ${age}.
Mots à travailler : ${words}

Réponds UNIQUEMENT avec un objet JSON valide (pas de texte avant/après) :
{
  "text": "2-3 phrases en français expliquant comment articuler ces lettres",
  "zone": "throat|back_tongue|mid_tongue|front_tongue|teeth|lips",
  "letter": "la lettre arabe la plus difficile parmi les mots"
}

Zone throat = lettres: ء ه ع غ خ ح
Zone back_tongue = lettres: ق ك
Zone mid_tongue = lettres: ج ش ي
Zone front_tongue = lettres: ض ل ن ر
Zone teeth = lettres: ذ ظ ث ص ز س
Zone lips = lettres: ب م و ف`,
    }],
  });

  try {
    const content = res.choices[0]?.message?.content?.trim() ?? "{}";
    // Extraire le JSON même s'il y a du texte autour
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return { text: content, zone: null, letter: null };
    const parsed = JSON.parse(match[0]);
    return {
      text:   parsed.text   ?? "",
      zone:   parsed.zone   ?? null,
      letter: parsed.letter ?? null,
    };
  } catch {
    return { text: res.choices[0]?.message?.content?.trim() ?? "", zone: null, letter: null };
  }
}

async function agentTafsir(
  groq: Groq,
  ayahText: string,
  surahNumber: number,
  ayahNumber: number,
): Promise<string> {
  const res = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    max_tokens:  200,
    temperature: 0.6,
    messages: [{
      role:    "user",
      content: `Tu es un érudit islamique bienveillant.
Sourate ${surahNumber}, verset ${ayahNumber} : « ${ayahText} »
En 2-3 phrases simples, explique :
1. Le sens principal de ce verset
2. Un bénéfice spirituel ou pratique pour le croyant aujourd'hui
En français, accessible à tous. Maximum 90 mots.`,
    }],
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

async function agentNextFocus(
  groq: Groq,
  score: number,
  errors: WordError[],
  tajwidTypes: string[],
  age: string,
): Promise<string> {
  const context =
    score >= 90 ? "Récitation quasi-parfaite." :
    errors.length > 0 ? `Mots difficiles : ${errors.slice(0, 2).map(e => e.suggestion).join("، ")}` :
    tajwidTypes.length > 0 ? `Tajwid à travailler : ${tajwidTypes.join(", ")}` :
    "Récitation correcte.";

  const res = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    max_tokens:  80,
    temperature: 0.5,
    messages: [{
      role:    "user",
      content: `Tu es un coach de récitation coranique. L'élève est ${age}. Score : ${score}/100.
${context}
En 1 phrase courte, dis ce sur quoi se concentrer pour la prochaine session.
En français. Maximum 25 mots.`,
    }],
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

// ── Auth helper ──────────────────────────────────────────────────

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── Chef Agent Route ─────────────────────────────────────────────
// The chef decides which sub-agents to invoke based on score and
// errors, runs them in parallel, and returns a unified response.

export async function POST(req: NextRequest) {
  // Auth
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const supabase = supabaseAdmin();
  const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Rate limit: 30 coaching sessions/hour
  const rl = await checkRateLimit(user.id, "quran_coach", 30);
  if (rl.limited) {
    return NextResponse.json({ error: "Limite atteinte (30/heure)" }, { status: 429 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY manquante" }, { status: 500 });

  let body: CoachRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const {
    surahNumber, ayahNumber, ayahText,
    score, errors, tajwidIssues,
    ageGroup, arabicLevel: _arabicLevel,
  } = body;

  // ── Chef routing decision ─────────────────────────────────────
  const age        = ageDesc(ageGroup);
  const tajwidTypes = [...new Set(tajwidIssues.map(t => t.type))];

  const needsTajwid     = score < 90 && (errors.length > 0 || tajwidTypes.length > 0);
  const needsMakhraj    = score < 70 && errors.length > 0;
  const needsTafsir     = score >= 85;
  const needsNextFocus  = true; // always

  const groq = new Groq({ apiKey });

  // ── Sub-agents run in parallel ────────────────────────────────
  const [encouragement, tajwid, makhrajResult, tafsir, next_focus] = await Promise.all([
    agentEncouragement(groq, score, age),
    needsTajwid    ? agentTajwid(groq, ayahText, errors, tajwidTypes, age)                    : Promise.resolve(""),
    needsMakhraj   ? agentMakhraj(groq, errors, age)                                          : Promise.resolve({ text: "", zone: null, letter: null }),
    needsTafsir    ? agentTafsir(groq, ayahText, surahNumber, ayahNumber)                     : Promise.resolve(""),
    needsNextFocus ? agentNextFocus(groq, score, errors, tajwidTypes, age)                    : Promise.resolve(""),
  ]);

  // ── Chef synthesizes which agents ran ─────────────────────────
  const agents: string[] = ["encouragement"];
  if (tajwid)                agents.push("tajwid");
  if (makhrajResult?.text)   agents.push("makhraj");
  if (tafsir)                agents.push("tafsir");
  if (next_focus)            agents.push("next_focus");

  const response: CoachResponse = {
    encouragement,
    ...(tajwid                && { tajwid }),
    ...(makhrajResult?.text   && { pronunciation: makhrajResult.text }),
    ...(makhrajResult?.zone   && { makhraj_zone: makhrajResult.zone as CoachResponse["makhraj_zone"] }),
    ...(makhrajResult?.letter && { makhraj_letter: makhrajResult.letter }),
    ...(tafsir                && { tafsir }),
    ...(next_focus            && { next_focus }),
    agents,
  };

  return NextResponse.json(response);
}
