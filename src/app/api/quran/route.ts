import { NextRequest, NextResponse } from "next/server";

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

// In-memory cache — survives across requests in the same Node.js process
const cache = new Map<string, CacheEntry>();
const TTL_MS = 60 * 60 * 1000; // 1 hour

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
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const surah   = searchParams.get("surah");
  const edition = searchParams.get("edition") ?? "fr.hamidullah";

  if (!surah) {
    return NextResponse.json({ error: "Missing surah parameter" }, { status: 400 });
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
