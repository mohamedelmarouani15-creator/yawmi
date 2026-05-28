import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const url    = new URL(req.url);
  const code   = url.searchParams.get("code");
  const type   = url.searchParams.get("type");
  const origin = url.origin;

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/nouveau-mot-de-passe`);
  }

  return NextResponse.redirect(`${origin}/accueil`);
}
