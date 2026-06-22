"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function MotDePasseOubliePage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#061A12] px-6">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(5,92,63,0.2) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        <Link href="/connexion" className="mb-8 flex items-center gap-2 text-sm opacity-50 hover:opacity-80"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          <ArrowLeft size={14} /> Retour
        </Link>

        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 size={48} style={{ color: "var(--gold)" }} />
            <h2 className="text-xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              Email envoyé !
            </h2>
            <p className="text-sm opacity-60 leading-relaxed" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Vérifie ta boîte mail — un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
            </p>
            <Link href="/connexion" className="mt-4 rounded-full px-8 py-3 text-sm font-semibold"
              style={{ background: "var(--gradient-primary)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              Mot de passe oublié
            </h2>
            <p className="mb-6 text-sm opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Entre ton email et on t&apos;envoie un lien de réinitialisation.
            </p>

            <form onSubmit={submit} className="flex flex-col gap-4">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="vous@exemple.com"
                className="rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
                style={{ borderColor: "var(--border-gold)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }} autoFocus />

              {error && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400"
                  style={{ fontFamily: "var(--font-dm-sans)" }}>{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold disabled:opacity-50"
                style={{ background: "var(--gradient-primary)", color: "var(--text)",
                  fontFamily: "var(--font-dm-sans)", boxShadow: "0 0 24px rgba(5,92,63,0.35)" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Envoyer le lien"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
