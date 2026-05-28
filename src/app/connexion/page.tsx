"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ConnexionPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.replace("/accueil");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#061A12] px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(5,92,63,0.2) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Yawmi
          </h1>
          <p className="mt-1 text-2xl" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)" }}>يومي</p>
        </div>

        <h2 className="mb-6 text-xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Connexion
        </h2>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="vous@exemple.com"
              className="rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
              style={{ borderColor: "rgba(212,175,55,0.2)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Mot de passe
            </label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full rounded-xl border bg-transparent px-4 py-3 pr-11 text-sm outline-none"
                style={{ borderColor: "rgba(212,175,55,0.2)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }} />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40"
                style={{ color: "#F8F4EC" }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC",
              fontFamily: "var(--font-dm-sans)", boxShadow: "0 0 24px rgba(5,92,63,0.35)" }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Link href="/inscription" className="text-sm opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
            Pas de compte ? Créer un compte
          </Link>
          <Link href="/mot-de-passe-oublie" className="text-xs opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Mot de passe oublié ?
          </Link>
          <Link href="/accueil" className="text-xs opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Continuer sans compte
          </Link>
        </div>
      </div>
    </main>
  );
}
