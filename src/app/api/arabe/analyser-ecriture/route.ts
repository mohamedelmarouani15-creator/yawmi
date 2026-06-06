import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", model: "Qwen/Qwen2.5-VL-7B-Instruct via HuggingFace" });
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, wordAr, wordFr, ageGroup } = await req.json();

    if (!imageBase64 || !wordAr) {
      return NextResponse.json({ error: "Image ou mot manquant" }, { status: 400 });
    }

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return NextResponse.json({ error: "HF_TOKEN non configuré" }, { status: 500 });
    }

    const ageCtx =
      ageGroup === "4-10"  ? "un enfant de 4-10 ans" :
      ageGroup === "11-17" ? "un adolescent de 11-17 ans" :
      "un adulte";

    const prompt = `Tu es un professeur bienveillant de calligraphie arabe islamique qui évalue l'écriture d'${ageCtx}.
L'élève devait écrire en arabe : "${wordAr}" (${wordFr ?? ""}).
Regarde la photo et évalue : lisibilité, forme des lettres, connexions, effort.
Réponds UNIQUEMENT en JSON valide sans aucun texte autour :
{"score":<entier 0-10>,"emoji":"<un emoji parmi 🌟👍💪🎯>","feedback":"<2-3 phrases bienveillantes en français>","encouragement":"<1 phrase islamique courte>"}`;

    const dataUrl = `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}`;

    const body = {
      model: "Qwen/Qwen2.5-VL-7B-Instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl } },
            { type: "text",      text: prompt },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.4,
      stream: false,
    };

    const res = await fetch(
      "https://api-inference.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${hfToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: `HuggingFace ${res.status}: ${txt.slice(0, 300)}` }, { status: res.status });
    }

    const data  = await res.json();
    const raw   = data.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) {
      return NextResponse.json({ error: "Réponse non parseable", raw }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(match[0]));

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyser-ecriture/hf]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
