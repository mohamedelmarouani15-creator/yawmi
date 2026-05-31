import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

const BUCKET    = "story-images";
const BASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Prompts par arc — paysages et architecture uniquement, jamais de visages
const ARC_PROMPT: Record<string, string> = {
  arc_ibrahim:    "ancient Babylon stone temple, massive carved pillars, dramatic fire torches, golden desert at dusk, intricate stone carvings",
  arc_moussa:     "ancient Nile river Egypt, papyrus reeds, pyramids silhouette at golden hour, mist on still water, sacred landscape",
  arc_maryam:     "ancient Jerusalem stone courtyard, olive trees, arched stone doorways, evening golden light, sacred peaceful atmosphere",
  arc_sira:       "ancient Mecca valley, rocky Hijaz mountains, desert caravan route, warm golden hour light, atmospheric dust haze",
  arc_sahaba:     "Medina city ancient, date palm trees, desert oasis, warm amber sunset, traditional Islamic architecture",
  arc_hijra:      "rocky mountain cave Thawr, dramatic starry night sky, crescent moon, sacred ancient landscape, atmospheric blue and gold",
  arc_ismail:     "sacred valley Mecca, arid rocky mountains, ancient spring water from rocks, golden desert light, holy landscape",
  arc_isra_miraj: "Jerusalem night, Al-Aqsa mosque silhouette against stars, divine celestial light rays, mystical blue gold atmosphere",
  arc_souleimane: "magnificent ancient Jerusalem palace, ornate Islamic geometric architecture, lush garden courtyard, golden light",
  arc_yusuf:      "ancient Egypt palace, carved stone columns, Nile valley through arched windows, warm golden light, majestic",
};

const STYLE = ", Islamic art aesthetic, cinematic 16:9, atmospheric lighting, detailed, painterly, no human figures, no faces, 4k";

function publicUrl(key: string): string {
  return `${BASE_URL}/storage/v1/object/public/${BUCKET}/${key}`;
}

function cacheKey(storyId: string, slideIndex: number): string {
  return `${storyId}_s${slideIndex}.jpg`;
}

async function pollReplicate(id: string, apiKey: string): Promise<string | null> {
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 2500));
    const res  = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (data.status === "succeeded") return Array.isArray(data.output) ? data.output[0] : null;
    if (data.status === "failed")   return null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return new NextResponse("unauthorized", { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return new NextResponse("unauthorized", { status: 401 });

  const { storyId, slideIndex = 0 } = await req.json() as { storyId?: string; slideIndex?: number };
  if (!storyId) return new NextResponse("missing storyId", { status: 400 });

  const key = cacheKey(storyId, slideIndex);

  // ── Cache HIT : vérifier l'existence via HEAD sur l'URL publique ───
  try {
    const head = await fetch(publicUrl(key), { method: "HEAD" });
    if (head.ok) return NextResponse.json({ url: publicUrl(key), cached: true });
  } catch { /* ignore */ }

  // ── Replicate API ──────────────────────────────────────────────────
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) return new NextResponse("image_unavailable", { status: 503 });

  const prompt = (ARC_PROMPT[storyId] ?? "ancient Islamic landscape, golden desert, sacred atmosphere") + STYLE;

  const startRes = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        input: {
          prompt,
          width:               768,
          height:              512,
          num_outputs:         1,
          num_inference_steps: 4,
          output_format:       "jpg",
          output_quality:      85,
          go_fast:             true,
        },
      }),
    },
  );

  if (!startRes.ok) {
    logger.error("story/image", "Replicate start:", startRes.status, await startRes.text());
    return new NextResponse("generation_failed", { status: 502 });
  }

  const prediction = await startRes.json();
  const imageUrl   = await pollReplicate(prediction.id, apiKey);

  if (!imageUrl) return new NextResponse("generation_timeout", { status: 504 });

  // ── Télécharger + mettre en cache Supabase Storage ────────────────
  const imgBuf = await (await fetch(imageUrl)).arrayBuffer();

  await supabase.storage.from(BUCKET)
    .upload(key, new Uint8Array(imgBuf), { contentType: "image/jpeg", upsert: false })
    .catch(e => logger.warn("story/image", "cache upload:", e));

  return NextResponse.json({ url: publicUrl(key), cached: false });
}
