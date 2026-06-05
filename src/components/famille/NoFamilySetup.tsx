"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { springTap } from "@/lib/motion";

interface Props {
  onCreateFamily: (name: string) => Promise<{ error: string | null }>;
  onJoinFamily:   (code: string) => Promise<boolean>;
}

export default function NoFamilySetup({ onCreateFamily, onJoinFamily }: Props) {
  const router = useRouter();
  const [mode,       setMode]       = useState<"create" | "join" | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  async function handleCreate() {
    const nom = nameRef.current?.value.trim() ?? "";
    if (!nom) return;
    setLoading(true); setError("");
    const { error: err } = await onCreateFamily(nom);
    if (err) { setError(err); setLoading(false); }
    else router.refresh();
  }

  async function handleJoin() {
    const code = codeRef.current?.value.trim().toUpperCase() ?? "";
    if (!code) return;
    setLoading(true); setError("");
    const ok = await onJoinFamily(code);
    if (!ok) { setError("Code introuvable — vérifie l'orthographe."); setLoading(false); }
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-12 pb-32">
      <div>
        <p className="text-xs tracking-widest uppercase opacity-40"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Espace partagé</p>
        <h1 className="mt-1 text-2xl font-bold"
          style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>Famille</h1>
      </div>

      {mode === null && (
        <div className="flex flex-col gap-3 mt-2">
          {[
            { id: "create" as const, title: "Créer une famille", sub: "Génère un code à partager", icon: "🏡" },
            { id: "join"   as const, title: "Rejoindre une famille", sub: "Entre le code reçu", icon: "🔑" },
          ].map(opt => (
            <motion.button key={opt.id} onClick={() => setMode(opt.id)}
              whileTap={{ scale: 0.97 }} transition={springTap}
              className="flex items-center gap-4 rounded-2xl border p-5 text-left"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}>
              <span className="text-2xl">{opt.icon}</span>
              <div>
                <p className="font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                  {opt.title}
                </p>
                <p className="mt-0.5 text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {opt.sub}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {mode === "create" && (
        <div className="flex flex-col gap-3">
          <input ref={nameRef} placeholder="Nom de votre famille…" autoCapitalize="words"
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            className="w-full rounded-2xl bg-transparent px-4 py-3.5 text-base outline-none"
            style={{ border: "1px solid rgba(212,175,55,0.35)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }} />
          {error && <p className="text-sm" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>{error}</p>}
          <motion.button onClick={handleCreate} disabled={loading}
            whileTap={{ scale: 0.97 }} transition={springTap}
            className="w-full rounded-full py-3.5 text-sm font-bold"
            style={{ background: "var(--gradient-primary)", color: "var(--text)", fontFamily: "var(--font-dm-sans)", opacity: loading ? 0.5 : 1 }}>
            {loading ? <Loader2 size={16} className="animate-spin inline" /> : "Créer ma famille →"}
          </motion.button>
          <button onClick={() => { setMode(null); setError(""); }}
            className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Annuler
          </button>
        </div>
      )}

      {mode === "join" && (
        <div className="flex flex-col gap-3">
          <input ref={codeRef} placeholder="Code (ex: AB12CD)" autoCapitalize="characters"
            onKeyDown={e => e.key === "Enter" && handleJoin()}
            className="w-full rounded-2xl bg-transparent px-4 py-3.5 text-base outline-none tracking-widest"
            style={{ border: "1px solid rgba(212,175,55,0.35)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }} />
          {error && <p className="text-sm" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>{error}</p>}
          <motion.button onClick={handleJoin} disabled={loading}
            whileTap={{ scale: 0.97 }} transition={springTap}
            className="w-full rounded-full py-3.5 text-sm font-bold"
            style={{ background: "var(--gradient-primary)", color: "var(--text)", fontFamily: "var(--font-dm-sans)", opacity: loading ? 0.5 : 1 }}>
            {loading ? <Loader2 size={16} className="animate-spin inline" /> : "Rejoindre →"}
          </motion.button>
          <button onClick={() => setMode(null)}
            className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Annuler
          </button>
        </div>
      )}

    </div>
  );
}
