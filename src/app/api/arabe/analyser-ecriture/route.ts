import { NextRequest, NextResponse } from "next/server";

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

Regarde la photo et évalue sur ces critères :
1. Lisibilité — reconnaît-on les lettres ?
2. Forme — proportions correctes ?
3. Connexions — lettres bien liées ?
4. Effort — l'élève a clairement essayé ?

Réponds UNIQUEMENT en JSON valide :
{
  "score": <entier 0-10>,
  "emoji": "<un emoji : 🌟 excellent, 👍 bien, 💪 courage, 🎯 presque>",
  "feedback": "<2-3 phrases bienveillantes en français adaptées à l'âge>",
  "encouragement": "<1 citation islamique très courte>"
}`;

    // Essai avec plusieurs modèles en cascade
    const MODELS = [
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash-001",
      "gemini-1.5-pro-001",
      "gemini-pro-vision",
    ];

    let lastError = "";
    for (const modelName of MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
      const body = {
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType ?? "image/jpeg", data: imageBase64 } },
          ],
        }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = `${modelName}: ${res.status} ${errText.slice(0, 200)}`;
        continue; // essaie le modèle suivant
      }

      const data = await res.json();
      const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) { lastError = `${modelName}: réponse non-JSON`; continue; }

      return NextResponse.json(JSON.parse(match[0]));
    }

    return NextResponse.json({ error: `Tous les modèles ont échoué. Dernier: ${lastError}` }, { status: 500 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyser-ecriture]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
