"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Copy, Check } from "lucide-react";
import { gameStorage } from "@/lib/game/game-storage";
import { supabase } from "@/lib/supabase";
import { springTap } from "@/lib/motion";

const CONFRERIE_KEY = "yawmi_confrerie_v1";

interface ConferieData {
  myCode: string;
  memberCodes: string[];
  name: string;
}

function loadConfrerie(): ConferieData | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(CONFRERIE_KEY) ?? "null"); } catch { return null; }
}

function saveConfrerie(data: ConferieData): void {
  if (typeof window !== "undefined") localStorage.setItem(CONFRERIE_KEY, JSON.stringify(data));
}

function generateCode(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) { hash = ((hash << 5) - hash) + seed.charCodeAt(i); hash |= 0; }
  return Math.abs(hash).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
}

export default function ConfrerierPage() {
  const router  = useRouter();
  const state   = gameStorage.get();
  const [data,      setData]      = useState<ConferieData | null>(null);
  const [joinInput, setJoinInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copied,    setCopied]    = useState(false);
  const [confName,  setConfName]  = useState("");
  const [creating,  setCreating]  = useState(false);

  useEffect(() => {
    const stored = loadConfrerie();
    if (stored) { setData(stored); return; }
    // Auto-generate code from user ID
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const code = generateCode(user.id);
        const conf: ConferieData = { myCode: code, memberCodes: [], name: "Ma Famille" };
        saveConfrerie(conf);
        setData(conf);
      }
    });
  }, []);

  const copyCode = useCallback(() => {
    if (!data?.myCode) return;
    navigator.clipboard?.writeText(data.myCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  const joinFamily = useCallback(() => {
    const code = joinInput.trim().toUpperCase();
    if (code.length !== 6) { setJoinError("Code invalide — 6 caractères requis"); return; }
    if (!data) return;
    if (data.memberCodes.includes(code)) { setJoinError("Code déjà ajouté"); return; }
    if (code === data.myCode) { setJoinError("Tu ne peux pas rejoindre ta propre confrérie"); return; }
    const updated = { ...data, memberCodes: [...data.memberCodes, code] };
    saveConfrerie(updated);
    setData(updated);
    setJoinInput("");
    setJoinError("");
  }, [data, joinInput]);

  const createConfrerie = useCallback(() => {
    if (!data || !confName.trim()) return;
    const updated = { ...data, name: confName.trim() };
    saveConfrerie(updated);
    setData(updated);
    setCreating(false);
    setConfName("");
  }, [data, confName]);

  const totalCorrect = state.totalCorrectAnswers ?? 0;
  const level        = state.level ?? 1;
  const arcs         = (state.completedArcs ?? []).length;

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col px-5 pt-12 pb-10 gap-5 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}>

      <div className="flex items-center gap-3 mb-2">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <div className="flex items-center gap-2">
          <Users size={18} style={{ color: "#a78bfa" }} />
          <h1 className="text-lg font-black" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            Confrérie du Savoir
          </h1>
        </div>
      </div>

      <p className="text-xs opacity-50 -mt-3" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
        Partage ton code avec ta famille pour progresser ensemble
      </p>

      {/* My code card */}
      <div className="rounded-3xl border p-5"
        style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.25)" }}>
        <p className="text-[9px] uppercase tracking-widest opacity-40 mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {data?.name ?? "Chargement..."} — Mon code
        </p>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black tracking-widest"
            style={{ color: "#a78bfa", fontFamily: "var(--font-bricolage)", letterSpacing: "0.15em" }}>
            {data?.myCode ?? "------"}
          </span>
          <motion.button onClick={copyCode} whileTap={{ scale: 0.9 }} transition={springTap}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
            {copied ? <Check size={15} style={{ color: "#4ade80" }} /> : <Copy size={15} style={{ color: "#a78bfa" }} />}
          </motion.button>
        </div>
        {copied && <p className="text-[10px] mt-1.5" style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>✓ Code copié !</p>}

        {/* Rename */}
        {!creating ? (
          <button onClick={() => setCreating(true)} className="mt-3 text-[10px] opacity-40 hover:opacity-70"
            style={{ color: "#a78bfa", fontFamily: "var(--font-dm-sans)" }}>
            ✏ Renommer la confrérie
          </button>
        ) : (
          <div className="flex gap-2 mt-3">
            <input value={confName} onChange={e => setConfName(e.target.value)}
              placeholder="Nom de la confrérie" maxLength={30}
              className="flex-1 rounded-xl px-3 py-1.5 text-xs outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(167,139,250,0.25)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }} />
            <motion.button onClick={createConfrerie} whileTap={{ scale: 0.95 }}
              className="rounded-xl px-3 py-1.5 text-xs font-bold"
              style={{ background: "#a78bfa", color: "#0a0f0d", fontFamily: "var(--font-dm-sans)" }}>
              OK
            </motion.button>
          </div>
        )}
      </div>

      {/* My stats */}
      <div className="rounded-3xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
        <p className="text-[9px] uppercase tracking-widest opacity-40 mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Mes contributions
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: totalCorrect, label: "Réponses justes", icon: "✅" },
            { val: level,        label: "Niveau",           icon: "⭐" },
            { val: arcs,         label: "Histoires lues",   icon: "📖" },
          ].map(({ val, label, icon }) => (
            <div key={label} className="text-center">
              <p className="text-xl">{icon}</p>
              <p className="text-lg font-black" style={{ color: "#a78bfa", fontFamily: "var(--font-bricolage)" }}>{val}</p>
              <p className="text-[9px] opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Join a family — bientôt disponible */}
      <div className="rounded-3xl border p-4 opacity-50" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] uppercase tracking-widest opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Rejoindre une confrérie
          </p>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", fontFamily: "var(--font-dm-sans)" }}>
            Bientôt
          </span>
        </div>
        <div className="flex gap-2">
          <input disabled value={joinInput} placeholder="Code à 6 lettres" maxLength={6}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold text-center uppercase outline-none tracking-widest cursor-not-allowed"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "var(--text)", fontFamily: "var(--font-bricolage)" }} />
          <button disabled
            className="rounded-xl px-4 py-2.5 text-sm font-black cursor-not-allowed"
            style={{ background: "rgba(167,139,250,0.06)", color: "rgba(167,139,250,0.3)", border: "1px solid rgba(167,139,250,0.1)", fontFamily: "var(--font-bricolage)" }}>
            Rejoindre
          </button>
        </div>
        <p className="text-[10px] mt-2 opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          La synchronisation en temps réel arrive prochainement.
        </p>
      </div>

      {/* Members */}
      {(data?.memberCodes ?? []).length > 0 && (
        <div className="rounded-3xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-[9px] uppercase tracking-widest opacity-40 mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Membres de la confrérie ({(data?.memberCodes ?? []).length})
          </p>
          {(data?.memberCodes ?? []).map(code => (
            <div key={code} className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black"
                  style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", fontFamily: "var(--font-bricolage)" }}>
                  {code.slice(0, 2)}
                </div>
                <span className="text-xs font-bold tracking-widest" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-bricolage)" }}>
                  {code}
                </span>
              </div>
              <button onClick={() => {
                const updated = { ...data!, memberCodes: data!.memberCodes.filter(c => c !== code) };
                saveConfrerie(updated); setData(updated);
              }} className="text-[10px] opacity-30" style={{ color: "#f87171" }}>Retirer</button>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] opacity-25 text-center" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
        Le système de confréries en temps réel arrive bientôt 🌙
      </p>
    </motion.main>
  );
}
