"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function NouveauMotDePassePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState("");

  // Supabase met le token dans le hash de l'URL après le clic sur le lien
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("access_token")) {
      setError("Lien invalide ou expiré. Demande un nouveau lien.");
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 6)  { setError("Minimum 6 caractères."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.replace("/accueil"), 2000);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#061A12] px-6">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(5,92,63,0.2) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>Yawmi</h1>
          <p className="mt-1 text-xl" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)" }}>يومي</p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 size={48} style={{ color: "#D4AF37" }} />
            <p className="text-lg font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
              Mot de passe mis à jour !
            </p>
            <p className="text-sm opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Redirection en cours…
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-6 text-xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
              Nouveau mot de passe
            </h2>

            <form onSubmit={submit} className="flex flex-col gap-4">
              {[
                { label: "Nouveau mot de passe",  val: password, set: setPassword },
                { label: "Confirmer",              val: confirm,  set: setConfirm  },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{label}</label>
                  <div className="relative">
                    <input type={show ? "text" : "password"} value={val} onChange={e => set(e.target.value)}
                      required minLength={6} placeholder="Minimum 6 caractères"
                      className="w-full rounded-xl border bg-transparent px-4 py-3 pr-11 text-sm outline-none"
                      style={{ borderColor: "rgba(212,175,55,0.2)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }} />
                    <button type="button" onClick={() => setShow(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: "#F8F4EC" }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              {error && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400"
                  style={{ fontFamily: "var(--font-dm-sans)" }}>{error}</p>
              )}

              <button type="submit" disabled={loading || !!error.includes("invalide")}
                className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC",
                  fontFamily: "var(--font-dm-sans)", boxShadow: "0 0 24px rgba(5,92,63,0.35)" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Enregistrer"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
