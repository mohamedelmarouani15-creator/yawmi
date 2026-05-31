"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";

export default function InscriptionPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error,    setError]    = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (err) { setError(err.message); setLoading(false); return; }

    // Créer la row profil dès l'inscription
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, display_name: name });
    }

    // Si email non confirmé → afficher message
    if (data.user && !data.session) {
      setEmailSent(true);
      setLoading(false);
      return;
    }
    // Si confirmation désactivée → accueil direct
    if (typeof localStorage !== "undefined") localStorage.setItem("yawmi_onboarded", "1");
    window.location.href = "/accueil";
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#061A12] px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(5,92,63,0.2) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            Yawmi
          </h1>
          <p className="mt-1 text-2xl" style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)" }}>يومي</p>
        </div>

        <h2 className="mb-6 text-xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          Créer un compte
        </h2>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {[
            { label: "Prénom", value: name,     set: setName,     type: "text",  ph: "Votre prénom" },
            { label: "Email",  value: email,    set: setEmail,    type: "email", ph: "vous@exemple.com" },
          ].map(({ label, value, set, type, ph }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{label}</label>
              <input type={type} value={value} onChange={e => set(e.target.value)} required placeholder={ph}
                className="rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
                style={{ borderColor: "var(--border-gold)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }} />
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Mot de passe</label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} placeholder="Minimum 6 caractères"
                className="w-full rounded-xl border bg-transparent px-4 py-3 pr-11 text-sm outline-none"
                style={{ borderColor: "var(--border-gold)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }} />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: "var(--text)" }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400"
              style={{ fontFamily: "var(--font-dm-sans)" }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "var(--gradient-primary)", color: "var(--text)",
              fontFamily: "var(--font-dm-sans)", boxShadow: "0 0 24px rgba(5,92,63,0.35)" }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/connexion" className="text-sm opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
