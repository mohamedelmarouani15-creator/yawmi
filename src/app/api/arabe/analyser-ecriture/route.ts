import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, wordAr, wordFr, ageGroup } = await req.json();

    if (!imageBase64 || !wordAr) {
      return NextResponse.json({ error: "Image ou mot manquant" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY non configurée" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const ageCtx =
      ageGroup === "4-10"  ? "un enfant de 4-10 ans" :
      ageGroup === "11-17" ? "un adolescent de 11-17 ans" :
      "un adulte";

    const systemPrompt = `Tu es un professeur bienveillant de calligraphie arabe islamique qui évalue l'écriture d'${ageCtx}.
L'élève devait écrire en arabe : "${wordAr}" (${wordFr}).

Évalue l'écriture sur la photo selon ces critères :
1. Lisibilité — peut-on reconnaître les lettres ?
2. Forme des lettres — proportions correctes ?
3. Connexions — les lettres sont-elles bien liées ?
4. Effort — la personne a-t-elle vraiment essayé ?

Réponds UNIQUEMENT en JSON avec ce format exact :
{
  "score": <nombre entre 0 et 10>,
  "emoji": "<emoji qui résume : 🌟 excellent, 👍 bien, 💪 courage, 🎯 presque>,
  "feedback": "<2-3 phrases bienveillantes adaptées à l'âge, en français>",
  "encouragement": "<1 phrase d'encouragement islamique courte>"
}

Si l'image ne contient pas d'écriture arabe visible, score = 0 et explique gentiment.
Pour les enfants (4-10 ans) : sois très encourageant même si c'est imparfait.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: (mimeType ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/webp",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Voici la photo de l'écriture de l'élève. Évalue-la selon les critères demandés.`,
          },
        ],
      }],
      system: systemPrompt,
    });

    const raw = response.content[0]?.type === "text" ? response.content[0].text : "";
    // Extract JSON from response
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Réponse IA invalide" }, { status: 500 });
    }
    const result = JSON.parse(match[0]);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyser-ecriture]", msg);
    return NextResponse.json({ error: `Erreur: ${msg}` }, { status: 500 });
  }
}
