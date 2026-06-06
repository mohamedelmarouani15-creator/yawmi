import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, wordAr, wordFr, ageGroup } = await req.json();

    if (!imageBase64 || !wordAr) {
      return NextResponse.json({ error: "Image ou mot manquant" }, { status: 400 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ error: "GOOGLE_AI_API_KEY non configurée" }, { status: 500 });
    }

    const genAI  = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model  = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const ageCtx =
      ageGroup === "4-10"  ? "un enfant de 4-10 ans" :
      ageGroup === "11-17" ? "un adolescent de 11-17 ans" :
      "un adulte";

    const prompt = `Tu es un professeur bienveillant de calligraphie arabe islamique qui évalue l'écriture d'${ageCtx}.
L'élève devait écrire en arabe : "${wordAr}" (${wordFr ?? ""}).

Regarde attentivement la photo et évalue l'écriture sur ces critères :
1. Lisibilité — reconnaît-on les lettres ?
2. Forme — proportions et tracé corrects ?
3. Connexions — lettres bien liées ?
4. Effort — l'élève a clairement essayé ?

Réponds UNIQUEMENT en JSON valide, sans texte autour :
{
  "score": <entier 0-10>,
  "emoji": "<un seul emoji : 🌟 excellent, 👍 bien, 💪 courage, 🎯 presque>",
  "feedback": "<2-3 phrases bienveillantes en français adaptées à l'âge>",
  "encouragement": "<1 citation ou dua islamique très courte>"
}

Si pas d'écriture arabe visible : score 0, explique gentiment.
Pour enfants (4-10 ans) : très encourageant même si imparfait.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: (mimeType ?? "image/jpeg") as string,
          data: imageBase64,
        },
      },
    ]);

    const raw = result.response.text();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Réponse IA invalide" }, { status: 500 });
    }
    const parsed = JSON.parse(match[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyser-ecriture/gemini]", msg);
    return NextResponse.json({ error: `Erreur: ${msg}` }, { status: 500 });
  }
}
