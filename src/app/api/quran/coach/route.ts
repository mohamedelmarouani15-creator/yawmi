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
  motherTongue?: string;
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

function ageDesc(ageGroup: string, lang: string): string {
  if (lang === "arabe") {
    if (ageGroup === "4-10")  return "طفل بين 4 و 10 سنوات";
    if (ageGroup === "11-17") return "مراهق بين 11 و 17 سنة";
    if (ageGroup === "55+")   return "شخص كبير في السن";
    return "بالغ";
  }
  if (lang === "anglais") {
    if (ageGroup === "4-10")  return "a child aged 4-10";
    if (ageGroup === "11-17") return "a teenager aged 11-17";
    if (ageGroup === "55+")   return "an elderly person (55+)";
    return "an adult";
  }
  if (ageGroup === "4-10")  return "un enfant de 4-10 ans";
  if (ageGroup === "11-17") return "un adolescent de 11-17 ans";
  if (ageGroup === "55+")   return "une personne âgée (55+)";
  return "un adulte";
}

function langInstruction(lang: string): string {
  if (lang === "arabe")    return "أجب باللغة العربية الفصحى البسيطة. أسلوب دافئ ومشجع.";
  if (lang === "anglais")  return "Respond in English. Warm, encouraging tone.";
  if (lang === "espagnol") return "Responde en español. Tono cálido y alentador.";
  if (lang === "turc")     return "Türkçe yanıt ver. Sıcak ve teşvik edici bir ton.";
  return "Réponds en français. Ton chaleureux et bienveillant.";
}

// ── Sub-agents ───────────────────────────────────────────────────

async function agentEncouragement(
  groq: Groq,
  score: number,
  age: string,
  lang: string,
): Promise<string> {
  const tier =
    score >= 90 ? "Félicite chaleureusement — c'est excellent ! Ajoute une courte dua de gratitude." :
    score >= 70 ? "Félicite le progrès et encourage la persévérance — le paradis récompense l'effort." :
    "Motive avec douceur — la honte n'a pas sa place, chaque tentative est une ibadah.";

  const res = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    max_tokens:  120,
    temperature: 0.75,
    messages: [{
      role:    "user",
      content: `Tu es un imam bienveillant. L'élève est ${age}. Score : ${score}/100.
${tier}
Réponds en 1-2 phrases, ton chaleureux et sincère. Pas de longueur excessive.
${langInstruction(lang)}`,
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
  score: number,
  lang: string,
  arabicLevel: string,
): Promise<string> {
  const errorList = errors.slice(0, 3).map(e => `"${e.word || "?"}" → "${e.suggestion}"`).join(", ");
  const rules     = tajwidTypes.length ? tajwidTypes.join(", ") : "non identifiées";
  const levelNote =
    arabicLevel === "none"         ? "Niveau arabe de l'élève : aucun, utiliser uniquement le français simple sans termes arabes." :
    arabicLevel === "beginner"     ? "Niveau arabe de l'élève : débutant, expliquer les termes arabes en français." :
    arabicLevel === "intermediate" ? "Niveau arabe de l'élève : intermédiaire, peut utiliser les termes techniques avec explication." :
                                     "Niveau arabe de l'élève : avancé, niveau technique complet, termes savants bienvenus.";

  const res = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    max_tokens:  250,
    temperature: 0.4,
    messages: [{
      role:    "user",
      content: `Tu es un maître en tajwid, professeur bienveillant.
L'élève est ${age}. Score : ${score >= 90 ? "excellent" : score >= 70 ? "bien" : "à améliorer"}.
${levelNote}
Verset : « ${ayahText} »
Erreurs détectées : ${errorList || "aucune erreur de mot"}
Règles tajwid présentes : ${rules}

Explique en 2-3 phrases :
- Quelle règle s'applique ici (nom arabe + traduction)
- Comment la prononcer concrètement
- Un exemple du quotidien pour s'en souvenir

Ton chaleureux, comme un professeur patient. Maximum 80 mots.
${langInstruction(lang)}`,
    }],
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

async function agentMakhraj(
  groq: Groq,
  errors: WordError[],
  age: string,
  lang: string,
  arabicLevel: string,
): Promise<{ text: string; zone: string | null; letter: string | null }> {
  const words = errors.slice(0, 3).map(e => e.suggestion).filter(Boolean).join("، ");
  if (!words) return { text: "", zone: null, letter: null };

  const langSpecific = lang === "arabe"
    ? "الطلاب العرب أحياناً لا يتقنون مخارج الحروف الصحيحة — اشرح بدقة."
    : `Les ${lang === "anglais" ? "anglophones" : "francophones"} confondent souvent ض مع Z, ظ مع Z, ح مع H, ع مع A, غ مع R, ق مع K — identifie l'erreur probable.`;

  const levelNote =
    arabicLevel === "none" || arabicLevel === "beginner"
      ? "Explication très simple, vocabulaire courant uniquement, éviter tout terme savant en arabe."
      : arabicLevel === "intermediate"
        ? "Tu peux utiliser les termes de base de la phonétique arabe (makhraj, sifa) avec une courte explication."
        : "Terminologie savante complète (makhraj, sifa, huruf) appréciée.";

  const res = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    max_tokens:  220,
    temperature: 0.4,
    messages: [{
      role:    "user",
      content: `Tu es le meilleur professeur de phonétique arabe coranique au monde.
L'élève est ${age}. Mots mal prononcés : ${words}
${langSpecific}
${levelNote}

Analyse et explique exactement où placer la langue/les lèvres/la gorge.
Donne une astuce mnémotechnique simple.

Réponds en JSON valide UNIQUEMENT :
{
  "text": "2-3 phrases pédagogiques",
  "zone": "throat|back_tongue|mid_tongue|front_tongue|teeth|lips",
  "letter": "la lettre arabe principale"
}
${langInstruction(lang)}`,
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
  lang: string,
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
En 1 phrase courte, dis ce sur quoi se concentrer pour la prochaine session. Maximum 25 mots.
${langInstruction(lang)}`,
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

// ── Timeout helper ───────────────────────────────────────────────

function withGlobalTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("coach_timeout")), ms);
    promise
      .then(val => { clearTimeout(id); resolve(val); })
      .catch(err => { clearTimeout(id); reject(err); });
  });
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
    ageGroup, arabicLevel,
    motherTongue,
  } = body;

  const lang = motherTongue ?? "français";

  // ── Chef routing decision ─────────────────────────────────────
  const age        = ageDesc(ageGroup, lang);
  const tajwidTypes = [...new Set(tajwidIssues.map(t => t.type))];

  const needsTajwid     = score < 90 && (errors.length > 0 || tajwidTypes.length > 0);
  const needsMakhraj    = score < 70 && errors.length > 0;
  const needsTafsir     = score >= 85;
  const needsNextFocus  = true;

  const groq = new Groq({ apiKey });

  // ── Sub-agents run in parallel (9s timeout for Vercel Hobby) ─
  let encouragement = "";
  let tajwid        = "";
  let makhrajResult: { text: string; zone: string | null; letter: string | null } = { text: "", zone: null, letter: null };
  let tafsir        = "";
  let next_focus    = "";

  try {
    [encouragement, tajwid, makhrajResult, tafsir, next_focus] = await withGlobalTimeout(
      Promise.all([
        agentEncouragement(groq, score, age, lang),
        needsTajwid    ? agentTajwid(groq, ayahText, errors, tajwidTypes, age, score, lang, arabicLevel) : Promise.resolve(""),
        needsMakhraj   ? agentMakhraj(groq, errors, age, lang, arabicLevel)                              : Promise.resolve({ text: "", zone: null, letter: null }),
        needsTafsir    ? agentTafsir(groq, ayahText, surahNumber, ayahNumber)                            : Promise.resolve(""),
        needsNextFocus ? agentNextFocus(groq, score, errors, tajwidTypes, age, lang)                     : Promise.resolve(""),
      ]),
      9000,
    );
  } catch (err) {
    if ((err as Error).message === "coach_timeout") {
      return NextResponse.json({
        encouragement: score >= 70
          ? "ما شاء الله ! Belle récitation, continuez ainsi."
          : "Chaque tentative est une ibadah. Continuez à pratiquer !",
        agents: ["encouragement"],
      } satisfies CoachResponse);
    }
    throw err;
  }

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
