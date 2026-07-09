import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function requireUser(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const { data: { user } } = await supabaseAdmin().auth.getUser(auth.replace("Bearer ", ""));
  return user;
}

export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY manquante" });
  const res  = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { "Authorization": `Bearer ${apiKey}` },
  });
  const data = await res.json();
  // Filtre : gratuits + supportent vision (image dans input modalities)
  const free = (data.data ?? [])
    .filter((m: { id: string; pricing: { prompt: string }; architecture?: { modalities?: string[] } }) =>
      m.id.endsWith(":free") &&
      (m.architecture?.modalities?.includes("image") || m.id.includes("vision") || m.id.includes("vl"))
    )
    .map((m: { id: string }) => m.id);
  return NextResponse.json({ free_vision_models: free });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    // Rate limit: 20 analyses/heure
    const rl = await checkRateLimit(user.id, "analyser_ecriture", 20);
    if (rl.limited) {
      return NextResponse.json({ error: "Limite atteinte (20/heure)" }, { status: 429 });
    }

    const { imageBase64, mimeType, wordAr, wordFr, ageGroup } = await req.json();

    if (!imageBase64 || !wordAr) {
      return NextResponse.json({ error: "Image ou mot manquant" }, { status: 400 });
    }
    if (imageBase64.length > 2_000_000) {
      return NextResponse.json({ error: "Image trop volumineuse" }, { status: 413 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY non configurée" }, { status: 500 });
    }

    const ageCtx =
      ageGroup === "4-10"  ? "un enfant de 4-10 ans" :
      ageGroup === "11-17" ? "un adolescent de 11-17 ans" :
      "un adulte";

    const prompt = `Tu es un professeur bienveillant de calligraphie arabe islamique qui évalue l'écriture d'${ageCtx}.
L'élève devait écrire en arabe : "${wordAr}" (${wordFr ?? ""}).
Regarde la photo et évalue : lisibilité, forme des lettres, connexions, effort.
Réponds UNIQUEMENT en JSON valide :
{"score":<entier 0-10>,"emoji":"<un emoji parmi 🌟👍💪🎯>","feedback":"<2-3 phrases bienveillantes en français>","encouragement":"<1 phrase islamique courte>"}`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer":  "https://yawmi-delta.vercel.app",
        "X-Title":       "Yawmi Arabic Learning",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-nano-12b-v2-vl:free",
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}` } },
            { type: "text", text: prompt },
          ],
        }],
        max_tokens: 300,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("[analyser-ecriture/openrouter]", res.status, txt.slice(0, 300));
      return NextResponse.json({ error: "Analyse indisponible, réessaie plus tard" }, { status: 502 });
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
    console.error("[analyser-ecriture/openrouter]", msg);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
