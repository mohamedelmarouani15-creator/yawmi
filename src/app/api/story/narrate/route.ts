import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { logger } from "@/lib/logger";

const BUCKET = "narrate-cache";

function cacheKey(text: string): string {
  return createHash("sha256").update(text.trim()).digest("hex").slice(0, 32) + ".mp3";
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return new NextResponse("unauthorized", { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return new NextResponse("unauthorized", { status: 401 });

  // Accepte JSON { text } (useNarrator) ou text/plain (StoryPrologue)
  let text: string;
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = await req.json() as { text?: string; storyId?: string; chapterNumber?: number };
    text = body.text ?? "";
  } else {
    text = await req.text();
  }

  if (!text.trim()) return new NextResponse("missing text", { status: 400 });

  const key = cacheKey(text);

  // ── Vérifier le cache Supabase Storage ────────────────────
  const { data: cached } = await supabase.storage.from(BUCKET).download(key);
  if (cached) {
    const buf = await cached.arrayBuffer();
    return new NextResponse(buf, {
      headers: { "Content-Type": "audio/mpeg", "X-Cache": "HIT" },
    });
  }

  // ── Appeler VoiceRSS ───────────────────────────────────────
  const apiKey = process.env.VOICERSS_API_KEY;
  if (!apiKey) return new NextResponse("tts_unavailable", { status: 503 });

  const params = new URLSearchParams({
    key: apiKey, hl: "fr-fr", src: text,
    c: "MP3", f: "44khz_16bit_stereo",
  });

  const vr = await fetch("https://api.voicerss.org/", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    params.toString(),
  });
  if (!vr.ok) {
    logger.error("narrate", "VoiceRSS HTTP error:", vr.status);
    return new NextResponse("tts_failed", { status: 502 });
  }

  const audio = await vr.arrayBuffer();
  const check = new TextDecoder().decode(audio.slice(0, 20));
  if (check.startsWith("ERROR")) {
    logger.error("narrate", "VoiceRSS:", check);
    return new NextResponse(check, { status: 502 });
  }

  // ── Mettre en cache (fire-and-forget) ─────────────────────
  supabase.storage.from(BUCKET)
    .upload(key, new Uint8Array(audio), { contentType: "audio/mpeg", upsert: false })
    .catch(e => logger.warn("narrate", "cache upload failed:", e));

  return new NextResponse(audio, {
    headers: { "Content-Type": "audio/mpeg", "X-Cache": "MISS" },
  });
}
