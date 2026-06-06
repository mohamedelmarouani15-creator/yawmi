import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_AI_API_KEY manquante" });
  const res  = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const names = (data.models ?? []).map((m: { name: string }) => m.name);
  return NextResponse.json({ models: names });
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, wordAr, wordFr, ageGroup } = await req.json();

    if (!imageBase64 || !wordAr) {
      return NextResponse.json({ error: "Image ou mot manquant" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GOOGLE_AI_API_KEY non configurée" }, { status: 500 });
    }

    const ageCtx =
      ageGroup === "4-10"  ? "un enfant de 4-10 ans" :
      ageGroup === "11-17" ? "un adolescent de 11-17 ans" :
      "un adulte";

    const prompt = `Tu es un professeur bienveillant de calligraphie arabe islamique qui évalue l'écriture d'${ageCtx}.
L'élève devait écrire en arabe : "${wordAr}" (${wordFr ?? ""}).
Regarde la photo et évalue : lisibilité, forme des lettres, connexions, effort.
Réponds UNIQUEMENT en JSON :
{"score":<0-10>,"emoji":"<🌟👍💪🎯>","feedback":"<2-3 phrases fr>","encouragement":"<citation islamique courte>"}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: (mimeType ?? "image/jpeg") as string,
          data: imageBase64,
        },
      },
    ]);

    const raw   = result.response.text();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Réponse IA non parseable", raw }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyser-ecriture]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
