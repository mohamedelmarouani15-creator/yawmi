"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Loader2, Plus, Trash2, UserPlus, LogIn } from "lucide-react";
import { useAuth }   from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import Link from "next/link";
import { pageVariants, itemVariants, springTap } from "@/lib/motion";

const MEMBERS = ["Tous", "Papa", "Maman", "Enfants"];
const COLORS: Record<string, string> = {
  Tous: "#055C3F", Papa: "#7B5EA7", Maman: "#D4AF37", Enfants: "#C0634E",
};

export default function FamillePage() {
  const { user }                                   = useAuth();
  const { family, tasks, loading, createFamily, joinFamily, addTask, toggleTask, removeTask } = useFamily();

  const [text,      setText]      = useState("");
  const [member,    setMember]    = useState("Tous");
  const [open,      setOpen]      = useState(false);
  const [joinCode,  setJoinCode]  = useState("");
  const [mode,      setMode]      = useState<"create"|"join"|null>(null);
  const [copied,    setCopied]    = useState(false);
  const [actionLoad, setActionLoad] = useState(false);
  const [createError, setCreateError] = useState("");
  const familyInputRef = useRef<HTMLInputElement>(null);
  const joinInputRef   = useRef<HTMLInputElement>(null);

  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  function copyCode() {
    if (!family) return;
    navigator.clipboard.writeText(family.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCreate() {
    const nom = (familyInputRef.current?.value ?? "").trim();
    if (!nom) return;
    setActionLoad(true);
    setCreateError("");
    const result = await createFamily(nom);
    if (result.family) {
      window.location.href = "/famille";
    } else {
      setCreateError(result.error ?? "Erreur inconnue");
      setActionLoad(false);
    }
  }

  async function handleJoin() {
    const code = (joinInputRef.current?.value ?? "").toUpperCase().trim();
    if (!code) return;
    setActionLoad(true);
    const ok = await joinFamily(code);
    if (ok) {
      window.location.href = "/famille";
    } else {
      setCreateError("Code famille introuvable.");
      setActionLoad(false);
    }
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
    <motion.main
      variants={pageVariants} initial="initial" animate="animate"
      className="flex flex-col items-center justify-center gap-6 px-8 pt-20 pb-32 text-center"
    >
      <motion.div variants={itemVariants} className="flex h-16 w-16 items-center justify-center rounded-full border-2"
        style={{ borderColor: "rgba(212,175,55,0.3)", background: "rgba(5,92,63,0.2)" }}>
        <UserPlus size={28} style={{ color: "#D4AF37" }} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Espace Famille
        </h1>
        <p className="mt-2 text-sm opacity-50 leading-relaxed" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Connecte-toi pour partager des tâches avec ta famille en temps réel.
        </p>
      </motion.div>
      <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }} transition={springTap}>
        <Link href="/connexion"
          className="flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold"
          style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC",
            fontFamily: "var(--font-dm-sans)", boxShadow: "0 0 24px rgba(5,92,63,0.35)" }}>
          <LogIn size={16} /> Se connecter
        </Link>
      </motion.div>
    </motion.main>
  );

  /* ── Chargement ─────────────────────────────────────────────────────── */
  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 size={24} className="animate-spin" style={{ color: "#D4AF37" }} />
    </div>
  );

  /* ── Pas de famille ─────────────────────────────────────────────────── */
  if (!family) return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-32">

      {/* Bandeau debug */}
      {debugInfo && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: debugInfo.startsWith("✅") ? "#055C3F" : "#991b1b",
          color: "#F8F4EC", padding: "14px 16px", fontSize: 14, fontFamily: "monospace" }}>
          {debugInfo}
        </div>
      )}

      <div>
        <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Espace partagé
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Famille
        </h1>
      </div>

      {/* Choix */}
      {mode === null && (
        <div className="flex flex-col gap-3 mt-4">
          <button type="button" onClick={() => setMode("create")}
            className="rounded-2xl border p-5 text-left"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}>
            <p className="font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>Créer une famille</p>
            <p className="mt-1 text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Génère un code à partager avec tes proches
            </p>
          </button>
          <button type="button" onClick={() => setMode("join")}
            className="rounded-2xl border p-5 text-left"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}>
            <p className="font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>Rejoindre une famille</p>
            <p className="mt-1 text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Entre le code reçu par un proche
            </p>
          </button>
        </div>
      )}

      {/* Créer */}
      {mode === "create" && (
        <div className="flex flex-col gap-4">
          <input
            ref={familyInputRef}
            placeholder="Nom de la famille…"
            enterKeyHint="done"
            autoCapitalize="words"
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleCreate(); } }}
            style={{
              display: "block", width: "100%", background: "transparent",
              border: "1px solid rgba(212,175,55,0.3)", borderRadius: 12,
              padding: "14px 16px", fontSize: 16, color: "#F8F4EC",
              fontFamily: "var(--font-dm-sans)", outline: "none",
            }}
          />
          {createError && (
            <p style={{ color: "#f87171", fontSize: 13, fontFamily: "var(--font-dm-sans)" }}>{createError}</p>
          )}
          <button
            type="button"
            onClick={handleCreate}
            disabled={actionLoad}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "14px 0", borderRadius: 999, border: "none",
              background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC",
              fontSize: 15, fontWeight: 600, fontFamily: "var(--font-dm-sans)",
              cursor: "pointer", opacity: actionLoad ? 0.5 : 1,
            }}
          >
            {actionLoad ? "Création…" : "Créer →"}
          </button>
          <button
            type="button"
            onClick={() => { setMode(null); setCreateError(""); setDebugInfo(""); }}
            style={{ background: "none", border: "none", color: "rgba(248,244,236,0.4)",
              fontSize: 13, fontFamily: "var(--font-dm-sans)", cursor: "pointer" }}
          >
            Annuler
          </button>
        </div>
      )}

      {/* Rejoindre */}
      {mode === "join" && (
        <div className="flex flex-col gap-4">
          <input
            ref={joinInputRef}
            placeholder="Code famille (ex: A1B2C3)"
            enterKeyHint="done"
            autoCapitalize="characters"
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleJoin(); } }}
            style={{
              display: "block", width: "100%", background: "transparent",
              border: "1px solid rgba(212,175,55,0.3)", borderRadius: 12,
              padding: "14px 16px", fontSize: 16, color: "#D4AF37",
              fontFamily: "var(--font-dm-sans)", outline: "none", letterSpacing: "0.15em",
            }}
          />
          <button
            type="button"
            onClick={handleJoin}
            disabled={actionLoad}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", padding: "14px 0", borderRadius: 999, border: "none",
              background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC",
              fontSize: 15, fontWeight: 600, fontFamily: "var(--font-dm-sans)",
              cursor: "pointer", opacity: actionLoad ? 0.5 : 1,
            }}
          >
            {actionLoad ? "Connexion…" : "Rejoindre →"}
          </button>
          <button type="button" onClick={() => setMode(null)}
            style={{ background: "none", border: "none", color: "rgba(248,244,236,0.4)",
              fontSize: 13, fontFamily: "var(--font-dm-sans)", cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      )}
    </main>
  );

  /* ── Famille active ─────────────────────────────────────────────────── */
  return (
    <motion.main
      variants={pageVariants} initial="initial" animate="animate"
      className="flex flex-col gap-6 px-5 pt-12 pb-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Espace partagé · temps réel
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {family.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <motion.button onClick={copyCode} whileTap={{ scale: 0.93 }} transition={springTap}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
            style={{ borderColor: "rgba(212,175,55,0.3)", color: copied ? "#4ade80" : "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
            <Copy size={11} /> {copied ? "Copié !" : family.code}
          </motion.button>
          <motion.button onClick={() => setOpen(v => !v)} whileTap={{ scale: 0.93 }} transition={springTap}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: "rgba(5,92,63,0.5)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)", border: "1px solid rgba(212,175,55,0.2)" }}>
            <Plus size={13} /> Tâche
          </motion.button>
        </div>
      </motion.div>

      {/* Formulaire */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 rounded-2xl border p-4"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(212,175,55,0.2)" }}>
              <input value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="Nouvelle tâche…"
                className="rounded-xl border bg-transparent px-4 py-2.5 text-sm outline-none"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }} autoFocus />
              <div className="flex gap-2 flex-wrap">
                {MEMBERS.map(m => (
                  <motion.button key={m} onClick={() => setMember(m)} whileTap={{ scale: 0.92 }} transition={springTap}
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: member === m ? COLORS[m] : "rgba(255,255,255,0.04)",
                      color: member === m ? "#F8F4EC" : "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                    {m}
                  </motion.button>
                ))}
              </div>
              <motion.button onClick={submit} whileTap={{ scale: 0.96 }} transition={springTap}
                className="rounded-xl py-2.5 text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                Ajouter
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tâches en cours */}
      {pending.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="mb-3 text-xs tracking-widest uppercase opacity-40"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>En cours · {pending.length}</p>
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {pending.map(task => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.25 }}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                  <motion.button onClick={() => toggleTask(task.id, task.done)}
                    whileTap={{ scale: 0.85 }} transition={springTap}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                    style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                  <p className="flex-1 text-sm font-medium" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {task.text}
                  </p>
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ background: COLORS[task.member] ?? "#055C3F", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)", opacity: 0.85 }}>
                    {task.member}
                  </span>
                  <motion.button onClick={() => removeTask(task.id)}
                    whileTap={{ scale: 0.85 }}
                    style={{ color: "rgba(248,244,236,0.2)" }}>
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Tâches terminées */}
      {completed.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="mb-3 text-xs tracking-widest uppercase opacity-40"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>Terminées · {completed.length}</p>
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {completed.map(task => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.2 }}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                  style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}>
                  <motion.button onClick={() => toggleTask(task.id, task.done)}
                    whileTap={{ scale: 0.85 }} transition={springTap}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "#055C3F", color: "#F8F4EC", fontSize: 10 }}>
                    ✓
                  </motion.button>
                  <p className="flex-1 text-sm" style={{ color: "rgba(248,244,236,0.3)",
                    fontFamily: "var(--font-dm-sans)", textDecoration: "line-through" }}>{task.text}</p>
                  <motion.button onClick={() => removeTask(task.id)} whileTap={{ scale: 0.85 }}
                    style={{ color: "rgba(248,244,236,0.15)" }}>
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {tasks.length === 0 && !open && (
        <p className="py-10 text-center text-sm opacity-30"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Aucune tâche — appuie sur + Tâche
        </p>
      )}

    </motion.main>
  );
}
