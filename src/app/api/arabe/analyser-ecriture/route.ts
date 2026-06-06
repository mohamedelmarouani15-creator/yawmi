import { NextRequest, NextResponse } from "next/server";

// Modèles à essayer dans l'ordre (v1beta puis v1)
const MODELS = [
  { version: "v1beta", name: "gemini-2.0-flash-exp" },
  { version: "v1beta", name: "gemini-1.5-flash" },
  { version: "v1beta", name: "gemini-1.5-pro" },
  { version: "v1beta", name: "gemini-pro-vision" },
  { version: "v1",     name: "gemini-1.5-flash-001" },
  { version: "v1",     name: "gemini-1.5-pro-001" },
];

export async function GET() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_AI_API_KEY manquante" });
  const res  = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  return NextResponse.json(data);
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

    const body = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType ?? "image/jpeg", data: imageBase64 } },
        ],
      }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
    };

    const errors: string[] = [];

    for (const { version, name } of MODELS) {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${name}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        errors.push(`${name}(${version}): ${res.status}`);
        if (res.status === 403) break; // clé invalide — inutile de continuer
        continue;
      }

      const data  = await res.json();
      const raw   = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) { errors.push(`${name}: réponse non-JSON`); continue; }

      return NextResponse.json(JSON.parse(match[0]));
    }

    return NextResponse.json({
      error: `Aucun modèle disponible. Erreurs: ${errors.join(" | ")}. Va sur /api/arabe/analyser-ecriture (GET) pour voir tes modèles.`
    }, { status: 500 });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyser-ecriture]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
