"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { YawmiLogo } from "@/components/YawmiLogo";

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
        <div className="mb-10 flex justify-center">
          <YawmiLogo size={72} />
        </div>

        <h2 className="mb-6 text-xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          Connexion
        </h2>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="connexion-email" className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Email
            </label>
            <input id="connexion-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="vous@exemple.com"
              aria-label="Adresse e-mail"
              className="rounded-xl border bg-transparent px-4 py-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-[var(--gold)] focus-visible:outline-offset-2"
              style={{ borderColor: "var(--border-gold)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="connexion-password" className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Mot de passe
            </label>
            <div className="relative">
              <input id="connexion-password" type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                aria-label="Mot de passe"
                className="w-full rounded-xl border bg-transparent px-4 py-3 pr-11 text-sm outline-none focus-visible:outline-2 focus-visible:outline-[var(--gold)] focus-visible:outline-offset-2"
                style={{ borderColor: "var(--border-gold)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }} />
              <button type="button" onClick={() => setShow(v => !v)}
                aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40"
                style={{ color: "var(--text)" }}>
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
            style={{ background: "var(--gradient-primary)", color: "var(--text)",
              fontFamily: "var(--font-dm-sans)", boxShadow: "0 0 24px rgba(5,92,63,0.35)" }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Link href="/inscription" className="text-sm opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
            Pas de compte ? Créer un compte
          </Link>
          <Link href="/decouvrir" className="text-sm opacity-55 hover:opacity-90 transition-opacity font-medium"
            style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
            Essayer sans compte →
          </Link>
          <Link href="/mot-de-passe-oublie" className="text-xs opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Mot de passe oublié ?
          </Link>
          <Link href="/accueil" className="text-xs opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Continuer sans compte
          </Link>
          <Link href="/privacy" className="text-xs opacity-25 hover:opacity-50 transition-opacity"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </main>
  );
}
