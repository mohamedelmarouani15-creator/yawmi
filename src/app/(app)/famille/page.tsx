"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Loader2, Plus, Trash2, UserPlus, LogIn, CheckCircle2, XCircle,
  Swords, Trophy, Users, ListTodo, Star, Flame, Target, LogOut,
} from "lucide-react";
import { useAuth }   from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import type { FamilyMember } from "@/hooks/useFamily";
import Link from "next/link";
import { springTap } from "@/lib/motion";

// ── helpers ────────────────────────────────────────────────────
const RANK_EMOJI = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
const MEMBER_COLORS: Record<string, string> = {
  Tous: "#055C3F", Papa: "#7B5EA7", Maman: "#D4AF37",
  Enfants: "#C0634E", Moi: "#3B82F6",
};
const TASK_MEMBERS = ["Tous", "Papa", "Maman", "Enfants", "Moi"];

function timeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${m}min`;
}

function duelExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expiré";
  const h = Math.floor(diff / 3_600_000);
  return `${h}h restantes`;
}

// ── Avatar placeholder ─────────────────────────────────────────
function Avatar({ name, size = 36, color = "#055C3F" }: { name: string | null; size?: number; color?: string }) {
  const letter = (name ?? "?")[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex items-center justify-center rounded-full font-bold"
      style={{ width: size, height: size, background: `${color}30`, border: `1.5px solid ${color}55`,
        color, fontSize: size * 0.42, fontFamily: "var(--font-bricolage)", flexShrink: 0 }}>
      {letter}
    </div>
  );
}

// ── Tab bar ────────────────────────────────────────────────────
type Tab = "defis" | "classement" | "membres" | "taches";
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "defis",      label: "Défis",      icon: <Swords size={14} /> },
  { id: "classement", label: "Classement", icon: <Trophy size={14} /> },
  { id: "membres",    label: "Membres",    icon: <Users size={14} /> },
  { id: "taches",     label: "Tâches",     icon: <ListTodo size={14} /> },
];

// ═══════════════════════════════════════════════════════════════
export default function FamillePage() {
  const { user } = useAuth();
  const {
    family, tasks, members, dailyChallenge, duels, loading,
    createFamily, joinFamily, leaveFamily,
    answerDaily, createDuel,
    addTask, toggleTask, removeTask,
  } = useFamily();

  const [tab,          setTab]          = useState<Tab>("defis");
  const [mode,         setMode]         = useState<"create" | "join" | null>(null);
  const [actionLoad,   setActionLoad]   = useState(false);
  const [formError,    setFormError]    = useState("");
  const [copied,       setCopied]       = useState(false);
  const [taskText,     setTaskText]     = useState("");
  const [taskMember,   setTaskMember]   = useState("Tous");
  const [taskOpen,     setTaskOpen]     = useState(false);
  const [duelTarget,   setDuelTarget]   = useState<string | null>(null);
  const [duelSent,     setDuelSent]     = useState(false);
  const [dailyAnswer,  setDailyAnswer]  = useState<number | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);

  const familyInputRef = useRef<HTMLInputElement>(null);
  const joinInputRef   = useRef<HTMLInputElement>(null);

  // ── Actions ────────────────────────────────────────────────────
  function copyCode() {
    if (!family) return;
    navigator.clipboard.writeText(family.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCreate() {
    const nom = familyInputRef.current?.value.trim() ?? "";
    if (!nom) return;
    setActionLoad(true); setFormError("");
    const { error } = await createFamily(nom);
    if (error) { setFormError(error); setActionLoad(false); }
    else window.location.href = "/famille";
  }

  async function handleJoin() {
    const code = joinInputRef.current?.value.trim().toUpperCase() ?? "";
    if (!code) return;
    setActionLoad(true); setFormError("");
    const ok = await joinFamily(code);
    if (!ok) { setFormError("Code introuvable — vérifie l'orthographe."); setActionLoad(false); }
    else window.location.href = "/famille";
  }

  async function submitTask() {
    if (!taskText.trim()) return;
    await addTask(taskText.trim(), taskMember);
    setTaskText(""); setTaskOpen(false);
  }

  async function handleDuel(memberId: string) {
    setDuelTarget(memberId);
    const ok = await createDuel(memberId);
    if (ok) setDuelSent(true);
    setTimeout(() => { setDuelTarget(null); setDuelSent(false); }, 2500);
  }

  async function handleDailyAnswer(idx: number) {
    setDailyAnswer(idx);
    await answerDaily(idx);
  }

  // ── Loading ────────────────────────────────────────────────────
  if (!user) return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 pt-20 pb-32 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2"
        style={{ borderColor: "rgba(212,175,55,0.3)", background: "rgba(5,92,63,0.2)" }}>
        <UserPlus size={28} style={{ color: "#D4AF37" }} />
      </div>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Espace Famille
        </h1>
        <p className="mt-2 text-sm opacity-50 leading-relaxed" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Connecte-toi pour jouer avec ta famille.
        </p>
      </div>
      <Link href="/connexion"
        className="flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold"
        style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
        <LogIn size={16} /> Se connecter
      </Link>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 size={24} className="animate-spin" style={{ color: "#D4AF37" }} />
    </div>
  );

  // ── No family ──────────────────────────────────────────────────
  if (!family) return (
    <div className="flex flex-col gap-5 px-5 pt-12 pb-32">
      <div>
        <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>Espace partagé</p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>Famille</h1>
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
                <p className="font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>{opt.title}</p>
                <p className="mt-0.5 text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{opt.sub}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {mode === "create" && (
        <div className="flex flex-col gap-3">
          <input ref={familyInputRef} placeholder="Nom de votre famille…"
            autoCapitalize="words"
            onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
            className="w-full rounded-2xl bg-transparent px-4 py-3.5 text-base outline-none"
            style={{ border: "1px solid rgba(212,175,55,0.35)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
          />
          {formError && <p className="text-sm" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>{formError}</p>}
          <motion.button onClick={handleCreate} disabled={actionLoad}
            whileTap={{ scale: 0.97 }} transition={springTap}
            className="w-full rounded-full py-3.5 text-sm font-bold"
            style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC",
              fontFamily: "var(--font-dm-sans)", opacity: actionLoad ? 0.5 : 1 }}>
            {actionLoad ? "Création…" : "Créer ma famille →"}
          </motion.button>
          <button onClick={() => { setMode(null); setFormError(""); }}
            className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Annuler
          </button>
        </div>
      )}

      {mode === "join" && (
        <div className="flex flex-col gap-3">
          <input ref={joinInputRef} placeholder="Code (ex: AB12CD)"
            autoCapitalize="characters"
            onKeyDown={e => { if (e.key === "Enter") handleJoin(); }}
            className="w-full rounded-2xl bg-transparent px-4 py-3.5 text-base outline-none tracking-widest"
            style={{ border: "1px solid rgba(212,175,55,0.35)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
          />
          {formError && <p className="text-sm" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>{formError}</p>}
          <motion.button onClick={handleJoin} disabled={actionLoad}
            whileTap={{ scale: 0.97 }} transition={springTap}
            className="w-full rounded-full py-3.5 text-sm font-bold"
            style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC",
              fontFamily: "var(--font-dm-sans)", opacity: actionLoad ? 0.5 : 1 }}>
            {actionLoad ? "Connexion…" : "Rejoindre →"}
          </motion.button>
          <button onClick={() => setMode(null)}
            className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Annuler
          </button>
        </div>
      )}
    </div>
  );

  // ── With family ────────────────────────────────────────────────
  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);
  const me = members.find(m => m.isMe);
  const others = members.filter(m => !m.isMe);
  const myRank = members.findIndex(m => m.isMe) + 1;

  return (
    <div className="flex flex-col pb-24" style={{ minHeight: "100dvh" }}>

      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-4">
        <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Espace partagé · temps réel
        </p>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {family.name}
          </h1>
          <div className="flex gap-2">
            <motion.button onClick={copyCode} whileTap={{ scale: 0.93 }} transition={springTap}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
              style={{ borderColor: "rgba(212,175,55,0.3)", color: copied ? "#4ade80" : "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
              <Copy size={11} /> {copied ? "Copié !" : family.code}
            </motion.button>
          </div>
        </div>
        {/* Member count + my rank */}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {members.length} membre{members.length > 1 ? "s" : ""}
          </span>
          {myRank > 0 && (
            <span className="text-xs" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
              {RANK_EMOJI[myRank - 1] ?? `#${myRank}`} classement famille
            </span>
          )}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-1 px-5 mb-5">
        {TABS.map(t => (
          <motion.button key={t.id} onClick={() => setTab(t.id)}
            whileTap={{ scale: 0.95 }} transition={springTap}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold"
            style={{
              background: tab === t.id ? "rgba(5,92,63,0.5)" : "rgba(255,255,255,0.04)",
              border: tab === t.id ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.06)",
              color: tab === t.id ? "#D4AF37" : "rgba(248,244,236,0.4)",
              fontFamily: "var(--font-dm-sans)",
            }}>
            {t.icon} {t.label}
          </motion.button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">
          {/* ════════════════ DÉFIS ════════════════ */}
          {tab === "defis" && (
            <motion.div key="defis" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-5">

              {/* Daily challenge */}
              <div className="rounded-2xl border p-5"
                style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.18)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target size={16} style={{ color: "#D4AF37" }} />
                    <span className="font-bold text-sm" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
                      Défi du Jour
                    </span>
                  </div>
                  <span className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    Expire dans {timeUntilMidnight()}
                  </span>
                </div>

                {dailyChallenge ? (
                  <>
                    {/* Question */}
                    <p className="text-sm font-semibold leading-snug mb-4"
                      style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
                      {dailyChallenge.question.question}
                    </p>

                    {/* Options */}
                    {!dailyChallenge.myAnswer ? (
                      <div className="flex flex-col gap-2">
                        {dailyChallenge.question.options.map((opt, idx) => (
                          <motion.button key={idx}
                            onClick={() => handleDailyAnswer(idx)}
                            disabled={dailyAnswer !== null}
                            whileTap={{ scale: 0.97 }} transition={springTap}
                            className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left"
                            style={{
                              background: dailyAnswer === idx ? (opt.correct ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)") : "rgba(255,255,255,0.03)",
                              borderColor: dailyAnswer === idx ? (opt.correct ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)") : "rgba(255,255,255,0.08)",
                            }}>
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                              style={{ background: "rgba(255,255,255,0.06)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                              {["A","B","C","D"][idx]}
                            </span>
                            <span className="text-sm" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                              {opt.text}
                            </span>
                            {dailyAnswer !== null && dailyAnswer === idx && (
                              opt.correct
                                ? <CheckCircle2 size={16} style={{ color: "#4ade80", marginLeft: "auto" }} />
                                : <XCircle size={16} style={{ color: "#f87171", marginLeft: "auto" }} />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl p-3 text-center"
                        style={{ background: dailyChallenge.myAnswer.correct ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)" }}>
                        {dailyChallenge.myAnswer.correct
                          ? <p className="text-sm font-semibold" style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>✓ Bonne réponse !</p>
                          : <p className="text-sm font-semibold" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>✗ Mauvaise réponse</p>
                        }
                      </div>
                    )}

                    {/* Member responses */}
                    {members.length > 0 && (
                      <div className="mt-4 flex flex-col gap-2">
                        <p className="text-xs opacity-40 mb-1" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                          RÉPONSES DE LA FAMILLE
                        </p>
                        {members.map(m => {
                          const r = dailyChallenge.responses[m.id];
                          return (
                            <div key={m.id} className="flex items-center gap-3">
                              <Avatar name={m.displayName} size={28} color="#055C3F" />
                              <span className="flex-1 text-xs" style={{ color: "rgba(248,244,236,0.7)", fontFamily: "var(--font-dm-sans)" }}>
                                {m.displayName ?? "Membre"}{m.isMe ? " (toi)" : ""}
                              </span>
                              {r ? (
                                r.correct
                                  ? <span className="text-xs font-bold" style={{ color: "#4ade80" }}>✓ Correct</span>
                                  : <span className="text-xs font-bold" style={{ color: "#f87171" }}>✗ Raté</span>
                              ) : (
                                <span className="text-xs opacity-30" style={{ color: "#F8F4EC" }}>En attente…</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <Loader2 size={18} className="animate-spin mx-auto mb-2" style={{ color: "#D4AF37" }} />
                    <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                      Chargement du défi…
                    </p>
                  </div>
                )}
              </div>

              {/* Async duels */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Swords size={15} style={{ color: "#D4AF37" }} />
                    <span className="font-bold text-sm" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
                      Duels Famille
                    </span>
                  </div>
                </div>

                {/* Challenge others */}
                {others.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    <p className="text-xs opacity-35" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                      DÉFIER UN MEMBRE (24h)
                    </p>
                    {others.map(m => (
                      <div key={m.id} className="flex items-center gap-3 rounded-xl border px-4 py-3"
                        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
                        <Avatar name={m.displayName} size={32} color="#7B5EA7" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                            {m.displayName ?? "Membre"}
                          </p>
                          <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                            Niv. {m.level} · {m.xp} XP
                          </p>
                        </div>
                        <motion.button
                          onClick={() => handleDuel(m.id)}
                          disabled={duelTarget === m.id}
                          whileTap={{ scale: 0.93 }} transition={springTap}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                          style={{
                            background: duelSent && duelTarget === m.id ? "rgba(74,222,128,0.2)" : "rgba(5,92,63,0.4)",
                            border: "1px solid rgba(212,175,55,0.2)",
                            color: duelSent && duelTarget === m.id ? "#4ade80" : "#F8F4EC",
                            fontFamily: "var(--font-dm-sans)",
                          }}>
                          {duelTarget === m.id && !duelSent
                            ? <Loader2 size={11} className="animate-spin" />
                            : duelSent && duelTarget === m.id ? "✓ Envoyé !" : <><Swords size={11} /> Défier</>
                          }
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending duels */}
                {duels.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs opacity-35" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>EN ATTENTE</p>
                    {duels.map(d => (
                      <div key={d.id} className="rounded-xl border px-4 py-3"
                        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                            {d.isChallenger
                              ? `Tu as défié ${d.challengedName ?? "Membre"}`
                              : `${d.challengerName ?? "Membre"} te défie !`}
                          </p>
                          <span className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                            {duelExpiry(d.expiresAt)}
                          </span>
                        </div>
                        {!d.isChallenger && d.challengerScore === null && (
                          <Link href={`/oasis/quiz/fes`}
                            className="mt-2 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold"
                            style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                            <Swords size={12} /> Répondre au défi
                          </Link>
                        )}
                        {d.isChallenger && d.challengerScore !== null && (
                          <p className="mt-1 text-xs" style={{ color: "rgba(248,244,236,0.5)", fontFamily: "var(--font-dm-sans)" }}>
                            Ton score : {d.challengerScore}/10 · En attente de la réponse
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  others.length === 0 && (
                    <p className="text-center text-xs py-4 opacity-30"
                      style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                      Invite des membres pour lancer des défis
                    </p>
                  )
                )}
              </div>
            </motion.div>
          )}

          {/* ════════════════ CLASSEMENT ════════════════ */}
          {tab === "classement" && (
            <motion.div key="classement" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-3">
              <p className="text-xs tracking-widest uppercase opacity-35 mb-2"
                style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                CLASSEMENT FAMILLE — XP
              </p>
              {members.map((m, i) => (
                <motion.div key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
                  style={{
                    background: m.isMe ? "rgba(5,92,63,0.12)" : "rgba(255,255,255,0.02)",
                    borderColor: m.isMe ? "rgba(212,175,55,0.25)" : "rgba(255,255,255,0.07)",
                  }}>
                  <span className="text-xl w-8 text-center">{RANK_EMOJI[i] ?? `#${i+1}`}</span>
                  <Avatar name={m.displayName} size={36} color={i === 0 ? "#D4AF37" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "#055C3F"} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate"
                      style={{ color: m.isMe ? "#D4AF37" : "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                      {m.displayName ?? "Membre"}{m.isMe ? " (toi)" : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                        Niv. {m.level}
                      </span>
                      {m.gameStreak > 0 && (
                        <span className="flex items-center gap-0.5 text-xs" style={{ color: "#f97316" }}>
                          <Flame size={10} />{m.gameStreak}
                        </span>
                      )}
                      <span className="text-xs opacity-30" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                        {m.defeatedSages} sage{m.defeatedSages > 1 ? "s" : ""} vaincu{m.defeatedSages > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
                      {m.xp.toLocaleString()}
                    </p>
                    <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>XP</p>
                  </div>
                </motion.div>
              ))}
              {members.length <= 1 && (
                <div className="py-8 text-center">
                  <p className="text-sm opacity-30" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    Invite des membres pour voir le classement
                  </p>
                  <p className="mt-2 text-xs opacity-20" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                    Code : {family.code}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════ MEMBRES ════════════════ */}
          {tab === "membres" && (
            <motion.div key="membres" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4">

              {/* Invite card */}
              <motion.button onClick={copyCode} whileTap={{ scale: 0.97 }} transition={springTap}
                className="flex items-center gap-4 rounded-2xl border p-4"
                style={{ background: "rgba(5,92,63,0.08)", borderColor: "rgba(212,175,55,0.2)" }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                  style={{ background: "rgba(212,175,55,0.1)" }}>📲</div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                    Inviter un proche
                  </p>
                  <p className="text-xs opacity-50 mt-0.5" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    Code : <span style={{ color: "#D4AF37", letterSpacing: "0.1em" }}>{family.code}</span>
                    {copied ? " · Copié !" : " · Appuie pour copier"}
                  </p>
                </div>
                <Copy size={16} style={{ color: "rgba(248,244,236,0.3)" }} />
              </motion.button>

              {/* Member list */}
              <p className="text-xs tracking-widest uppercase opacity-35 mt-1"
                style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                {members.length} MEMBRE{members.length > 1 ? "S" : ""}
              </p>
              {members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl border px-4 py-4"
                  style={{
                    background: m.isMe ? "rgba(5,92,63,0.1)" : "rgba(255,255,255,0.02)",
                    borderColor: m.isMe ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.07)",
                  }}>
                  <Avatar name={m.displayName} size={44} color={["#D4AF37","#94a3b8","#cd7f32","#7B5EA7"][i % 4]} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: m.isMe ? "#D4AF37" : "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                      {m.displayName ?? "Membre"}{m.isMe ? " · toi" : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                        Niv. {m.level}
                      </span>
                      <span className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                        {m.xp.toLocaleString()} XP
                      </span>
                      {m.gameStreak > 0 && (
                        <span className="flex items-center gap-0.5 text-xs" style={{ color: "#f97316" }}>
                          <Flame size={10} /> {m.gameStreak}j
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs opacity-35" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                        🏆 {m.defeatedSages} sage{m.defeatedSages > 1 ? "s" : ""}
                      </span>
                      <span className="text-xs opacity-35" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                        <Star size={9} className="inline mr-0.5" fill="currentColor" style={{ color: "#D4AF37" }} />
                        {m.coins} pièces
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Leave family */}
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {!leaveConfirm ? (
                  <button onClick={() => setLeaveConfirm(true)}
                    className="flex items-center gap-2 text-xs opacity-30 hover:opacity-60 transition-opacity"
                    style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>
                    <LogOut size={12} /> Quitter cette famille
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-xs flex-1" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>
                      Quitter {family.name} ?
                    </p>
                    <button onClick={() => leaveFamily()}
                      className="rounded-full px-3 py-1.5 text-xs font-bold"
                      style={{ background: "rgba(248,113,113,0.15)", color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>
                      Quitter
                    </button>
                    <button onClick={() => setLeaveConfirm(false)}
                      className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════════════ TÂCHES ════════════════ */}
          {tab === "taches" && (
            <motion.div key="taches" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4">

              {/* Add task button */}
              <motion.button onClick={() => setTaskOpen(v => !v)}
                whileTap={{ scale: 0.96 }} transition={springTap}
                className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold"
                style={{ background: "rgba(5,92,63,0.35)", border: "1px solid rgba(212,175,55,0.2)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                <Plus size={15} /> Nouvelle tâche
              </motion.button>

              {/* Add task form */}
              <AnimatePresence>
                {taskOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex flex-col gap-3 rounded-2xl border p-4"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(212,175,55,0.18)" }}>
                      <input value={taskText} onChange={e => setTaskText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && submitTask()}
                        placeholder="Nouvelle tâche…" autoFocus
                        className="rounded-xl border bg-transparent px-4 py-2.5 text-sm outline-none"
                        style={{ borderColor: "rgba(255,255,255,0.1)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }} />
                      <div className="flex gap-2 flex-wrap">
                        {TASK_MEMBERS.map(m => (
                          <motion.button key={m} onClick={() => setTaskMember(m)}
                            whileTap={{ scale: 0.92 }} transition={springTap}
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              background: taskMember === m ? MEMBER_COLORS[m] ?? "#055C3F" : "rgba(255,255,255,0.04)",
                              color: taskMember === m ? "#F8F4EC" : "rgba(248,244,236,0.4)",
                              fontFamily: "var(--font-dm-sans)",
                            }}>
                            {m}
                          </motion.button>
                        ))}
                      </div>
                      <motion.button onClick={submitTask} whileTap={{ scale: 0.96 }} transition={springTap}
                        className="rounded-xl py-2.5 text-sm font-semibold"
                        style={{ background: "linear-gradient(135deg,#055C3F,#0a8a5e)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                        Ajouter
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pending tasks */}
              {pending.length > 0 && (
                <div>
                  <p className="text-xs tracking-widest uppercase opacity-35 mb-2"
                    style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    EN COURS · {pending.length}
                  </p>
                  <div className="flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                      {pending.map(task => (
                        <motion.div key={task.id} layout
                          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                          <motion.button onClick={() => toggleTask(task.id, task.done)}
                            whileTap={{ scale: 0.85 }} transition={springTap}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                            style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                          <p className="flex-1 text-sm" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{task.text}</p>
                          <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{ background: MEMBER_COLORS[task.member] ?? "#055C3F", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)", opacity: 0.85 }}>
                            {task.member}
                          </span>
                          <motion.button onClick={() => removeTask(task.id)} whileTap={{ scale: 0.85 }}
                            style={{ color: "rgba(248,244,236,0.2)" }}>
                            <Trash2 size={13} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Done tasks */}
              {completed.length > 0 && (
                <div>
                  <p className="text-xs tracking-widest uppercase opacity-35 mb-2"
                    style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    TERMINÉES · {completed.length}
                  </p>
                  <div className="flex flex-col gap-2">
                    {completed.map(task => (
                      <div key={task.id} className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                        style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}>
                        <button onClick={() => toggleTask(task.id, task.done)}
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs"
                          style={{ background: "#055C3F", color: "#F8F4EC" }}>✓</button>
                        <p className="flex-1 text-sm line-through opacity-30"
                          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{task.text}</p>
                        <button onClick={() => removeTask(task.id)} style={{ color: "rgba(248,244,236,0.15)" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && !taskOpen && (
                <p className="py-10 text-center text-sm opacity-25"
                  style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  Aucune tâche — appuie sur Nouvelle tâche
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
