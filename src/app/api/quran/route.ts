import { NextRequest, NextResponse } from "next/server";

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

// In-memory cache — survives across requests in the same Node.js process.
// Bornée à MAX_ENTRIES (114 sourates × quelques éditions tient largement
// dedans) pour éviter une croissance illimitée si la clé était forgée.
const cache = new Map<string, CacheEntry>();
const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 500;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: unknown): void {
  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

const EDITION_RE = /^[a-z]{2}\.[a-z0-9_-]{1,40}$/i;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const surahRaw = searchParams.get("surah");
  const edition  = searchParams.get("edition") ?? "fr.hamidullah";

  const surah = surahRaw ? Number(surahRaw) : NaN;
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    return NextResponse.json({ error: "surah doit être un entier entre 1 et 114" }, { status: 400 });
  }
  if (!EDITION_RE.test(edition)) {
    return NextResponse.json({ error: "edition invalide" }, { status: 400 });
  }

  const cacheKey = `surah-${surah}-${edition}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT", "Cache-Control": "public, max-age=3600" },
    });
  }

  try {
    const upstream = await fetch(
      `https://api.alquran.cloud/v1/surah/${surah}/${edition}`,
      { next: { revalidate: 3600 } }
    );
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream API error", status: upstream.status },
        { status: upstream.status }
      );
    }
    const data = await upstream.json();
    setCached(cacheKey, data);
    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return NextResponse.json(
      { error: "Proxy fetch failed" },
      { status: 503 }
    );
  }
}
