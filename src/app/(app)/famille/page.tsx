"use client";

import { useState } from "react";
import { Copy, Loader2, Plus, Trash2, UserPlus, LogIn } from "lucide-react";
import { useAuth }   from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import Link from "next/link";

const MEMBERS = ["Tous", "Papa", "Maman", "Enfants"];
const COLORS: Record<string, string> = {
  Tous: "#055C3F", Papa: "#7B5EA7", Maman: "#D4AF37", Enfants: "#C0634E",
};

export default function FamillePage() {
  const { user, signOut }                          = useAuth();
  const { family, tasks, loading, createFamily, joinFamily, addTask, toggleTask, removeTask } = useFamily();

  const [text,      setText]      = useState("");
  const [member,    setMember]    = useState("Tous");
  const [open,      setOpen]      = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [joinCode,  setJoinCode]  = useState("");
  const [mode,      setMode]      = useState<"create"|"join"|null>(null);
  const [copied,    setCopied]    = useState(false);
  const [actionLoad, setActionLoad] = useState(false);

  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  function copyCode() {
    if (!family) return;
    navigator.clipboard.writeText(family.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCreate() {
    if (!familyName.trim()) return;
    setActionLoad(true);
    await createFamily(familyName.trim());
    setMode(null);
    setActionLoad(false);
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setActionLoad(true);
    const ok = await joinFamily(joinCode);
    if (!ok) alert("Code famille introuvable.");
    setMode(null);
    setActionLoad(false);
  }

  async function submit() {
    const t = text.trim();
    if (!t) return;
    await addTask(t, member);
    setText("");
    setOpen(false);
  }

  /* ── Non connecté ──────────────────────────────────────────────────── */
  if (!user) return (
    <main className="flex flex-col items-center justify-center gap-6 px-8 py-20 text-center min-h-screen">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2"
        style={{ borderColor: "rgba(212,175,55,0.3)", background: "rgba(5,92,63,0.2)" }}>
        <UserPlus size={28} style={{ color: "#D4AF37" }} />
      </div>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Espace Famille
        </h1>
        <p className="mt-2 text-sm opacity-50 leading-relaxed" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Connecte-toi pour partager des tâches avec ta famille en temps réel.
        </p>
      </div>
      <Link href="/connexion"
        className="flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold"
        style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC",
          fontFamily: "var(--font-dm-sans)", boxShadow: "0 0 24px rgba(5,92,63,0.35)" }}>
        <LogIn size={16} /> Se connecter
      </Link>
    </main>
  );

  /* ── Chargement ─────────────────────────────────────────────────────── */
  if (loading) return (
    <main className="flex items-center justify-center min-h-screen">
      <Loader2 size={24} className="animate-spin" style={{ color: "#D4AF37" }} />
    </main>
  );

  /* ── Pas de famille ─────────────────────────────────────────────────── */
  if (!family) return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-8 min-h-screen">
      <div>
        <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Espace partagé
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Famille
        </h1>
      </div>

      {mode === null && (
        <div className="flex flex-col gap-3 mt-4">
          <button onClick={() => setMode("create")}
            className="rounded-2xl border p-5 text-left transition-all active:scale-[0.98]"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}>
            <p className="font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
              Créer une famille
            </p>
            <p className="mt-1 text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Génère un code à partager avec tes proches
            </p>
          </button>
          <button onClick={() => setMode("join")}
            className="rounded-2xl border p-5 text-left transition-all active:scale-[0.98]"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}>
            <p className="font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Rejoindre une famille
            </p>
            <p className="mt-1 text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Entre le code reçu par un proche
            </p>
          </button>
        </div>
      )}

      {mode === "create" && (
        <div className="flex flex-col gap-3">
          <input value={familyName} onChange={e => setFamilyName(e.target.value)}
            placeholder="Nom de la famille…"
            className="rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
            style={{ borderColor: "rgba(212,175,55,0.2)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }} autoFocus />
          <button onClick={handleCreate} disabled={actionLoad || !familyName.trim()}
            className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {actionLoad ? <Loader2 size={16} className="animate-spin" /> : "Créer →"}
          </button>
          <button onClick={() => setMode(null)} className="text-xs opacity-40 text-center"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>Annuler</button>
        </div>
      )}

      {mode === "join" && (
        <div className="flex flex-col gap-3">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Code famille (ex: A1B2C3)"
            className="rounded-xl border bg-transparent px-4 py-3 text-sm outline-none tracking-widest"
            style={{ borderColor: "rgba(212,175,55,0.2)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }} autoFocus />
          <button onClick={handleJoin} disabled={actionLoad || !joinCode.trim()}
            className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {actionLoad ? <Loader2 size={16} className="animate-spin" /> : "Rejoindre →"}
          </button>
          <button onClick={() => setMode(null)} className="text-xs opacity-40 text-center"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>Annuler</button>
        </div>
      )}
    </main>
  );

  /* ── Famille active ─────────────────────────────────────────────────── */
  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Espace partagé · temps réel
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {family.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={copyCode}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all"
            style={{ borderColor: "rgba(212,175,55,0.3)", color: copied ? "#055C3F" : "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
            <Copy size={11} /> {copied ? "Copié !" : family.code}
          </button>
          <button onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: "rgba(5,92,63,0.5)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)", border: "1px solid rgba(212,175,55,0.2)" }}>
            <Plus size={13} /> Tâche
          </button>
        </div>
      </div>

      {/* Formulaire */}
      {open && (
        <div className="flex flex-col gap-3 rounded-2xl border p-4"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(212,175,55,0.2)" }}>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Nouvelle tâche…"
            className="rounded-xl border bg-transparent px-4 py-2.5 text-sm outline-none"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }} autoFocus />
          <div className="flex gap-2 flex-wrap">
            {MEMBERS.map(m => (
              <button key={m} onClick={() => setMember(m)}
                className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
                style={{ background: member === m ? COLORS[m] : "rgba(255,255,255,0.04)",
                  color: member === m ? "#F8F4EC" : "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                {m}
              </button>
            ))}
          </div>
          <button onClick={submit}
            className="rounded-xl py-2.5 text-sm font-semibold active:scale-95"
            style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Ajouter
          </button>
        </div>
      )}

      {/* Tâches en cours */}
      {pending.length > 0 && (
        <div>
          <p className="mb-3 text-xs tracking-widest uppercase opacity-40"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>En cours · {pending.length}</p>
          <div className="flex flex-col gap-2">
            {pending.map(task => (
              <div key={task.id} className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                <button onClick={() => toggleTask(task.id, task.done)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                <p className="flex-1 text-sm font-medium" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {task.text}
                </p>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: COLORS[task.member] ?? "#055C3F", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)", opacity: 0.85 }}>
                  {task.member}
                </span>
                <button onClick={() => removeTask(task.id)} style={{ color: "rgba(248,244,236,0.2)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tâches terminées */}
      {completed.length > 0 && (
        <div>
          <p className="mb-3 text-xs tracking-widest uppercase opacity-40"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>Terminées · {completed.length}</p>
          <div className="flex flex-col gap-2">
            {completed.map(task => (
              <div key={task.id} className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}>
                <button onClick={() => toggleTask(task.id, task.done)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "#055C3F" }}>
                  <span style={{ color: "#F8F4EC", fontSize: 10 }}>✓</span>
                </button>
                <p className="flex-1 text-sm" style={{ color: "rgba(248,244,236,0.3)",
                  fontFamily: "var(--font-dm-sans)", textDecoration: "line-through" }}>{task.text}</p>
                <button onClick={() => removeTask(task.id)} style={{ color: "rgba(248,244,236,0.15)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && !open && (
        <p className="py-10 text-center text-sm opacity-30"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Aucune tâche — appuie sur + Tâche
        </p>
      )}

      {/* Déconnexion */}
      <button onClick={signOut} className="mt-4 text-xs opacity-20 text-center"
        style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
        Se déconnecter
      </button>
    </main>
  );
}
