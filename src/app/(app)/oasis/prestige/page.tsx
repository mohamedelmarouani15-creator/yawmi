"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { gameStorage } from "@/lib/game/game-storage";
import { springTap } from "@/lib/motion";

export default function PrestigePage() {
  const router   = useRouter();
  const state    = gameStorage.get();
  const [confirmed, setConfirmed] = useState(false);
  const [activated, setActivated] = useState(false);

  const defeatedCount = state.defeatedSages?.length ?? 0;
  const canPrestige   = defeatedCount >= 8 && (state.level ?? 1) >= 20;
  const prestigeLvl   = state.prestigeLevel ?? 0;

  function activate() {
    const updated = gameStorage.activatePrestige();
    if (updated.prestigeLevel > prestigeLvl) setActivated(true);
  }

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center px-6 pt-12 pb-10 text-center min-h-screen gap-6"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#0e0c00 100%)" }}>

      <div className="w-full flex items-center gap-3 mb-2">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}>
          <ArrowLeft size={15} />
        </motion.button>
      </div>

      {/* Gold star */}
      <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}>
        <span style={{ fontSize: 72 }}>⭐</span>
      </motion.div>

      <div>
        <h1 className="text-3xl font-black mb-2"
          style={{ color: "#FFD700", fontFamily: "var(--font-bricolage)", textShadow: "0 0 30px rgba(255,215,0,0.5)" }}>
          Mode Hafiz
        </h1>
        <p className="text-sm opacity-60 max-w-xs leading-relaxed"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Tu as traversé toutes les ères du savoir islamique. Le Mode Hafiz réinitialise ta progression
          mais tu gardes ton titre, tes manuscrits et ta confrérie. Les questions deviennent plus difficiles.
        </p>
      </div>

      {/* Current prestige */}
      {prestigeLvl > 0 && (
        <div className="rounded-2xl border px-6 py-3"
          style={{ background: "rgba(255,215,0,0.08)", borderColor: "rgba(255,215,0,0.3)" }}>
          <p className="font-black" style={{ color: "#FFD700", fontFamily: "var(--font-bricolage)" }}>
            ★ Hafiz × {prestigeLvl}
          </p>
          <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Prestige actif — questions diff. maximale
          </p>
        </div>
      )}

      {/* What's reset vs kept */}
      <div className="w-full max-w-xs rounded-3xl border p-4 text-left"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
        <p className="text-[9px] uppercase tracking-widest opacity-40 mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Ce qui change
        </p>
        {[
          { label: "Niveau → repart à 1",              icon: "🔄", reset: true  },
          { label: "Stages → réinitialisés",            icon: "🔄", reset: true  },
          { label: "Maîtrise → réinitialisée",          icon: "🔄", reset: true  },
          { label: "Manuscrits → conservés",            icon: "✅", reset: false },
          { label: "Confrérie → conservée",             icon: "✅", reset: false },
          { label: "Histoires lues → conservées",       icon: "✅", reset: false },
          { label: "Badge ★ Hafiz → ajouté au profil", icon: "⭐", reset: false },
          { label: "Questions → difficulté max forcée", icon: "🔥", reset: false },
        ].map(({ label, icon, reset }) => (
          <div key={label} className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">{icon}</span>
            <span className="text-xs" style={{ color: reset ? "#f87171" : "#4ade80", fontFamily: "var(--font-dm-sans)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <div className="rounded-2xl border p-3 text-center"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-xl font-black" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>{defeatedCount}</p>
          <p className="text-[10px] opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Sages vaincus</p>
        </div>
        <div className="rounded-2xl border p-3 text-center"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-xl font-black" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>{state.level ?? 1}</p>
          <p className="text-[10px] opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Niveau actuel</p>
        </div>
      </div>

      {/* CTA */}
      <AnimatePresence>
        {activated ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
            className="text-center">
            <p className="text-2xl mb-2">⭐</p>
            <p className="text-lg font-black" style={{ color: "#FFD700", fontFamily: "var(--font-bricolage)" }}>
              Mode Hafiz activé !
            </p>
            <p className="text-xs opacity-50 mt-1" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Retourne à l&apos;Oasis et recommence le voyage.
            </p>
            <motion.button onClick={() => router.push("/oasis")} whileTap={{ scale: 0.96 }} transition={springTap}
              className="mt-4 rounded-full px-8 py-3.5 font-black text-sm"
              style={{ background: "linear-gradient(135deg,#D4AF37,#8B6914)", color: "#0a0f0d", fontFamily: "var(--font-bricolage)" }}>
              ← Retour à l&apos;Oasis ⭐
            </motion.button>
          </motion.div>
        ) : !canPrestige ? (
          <div className="text-center">
            <p className="text-sm opacity-50 mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Conditions : Niv. 20+ et 8 sages vaincus
            </p>
            <div className="flex gap-3 justify-center">
              <span className="text-xs py-2 px-3 rounded-xl" style={{ background: defeatedCount >= 8 ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)", color: defeatedCount >= 8 ? "#4ade80" : "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)" }}>
                {defeatedCount >= 8 ? "✅" : "⬜"} {defeatedCount}/8 sages
              </span>
              <span className="text-xs py-2 px-3 rounded-xl" style={{ background: (state.level ?? 1) >= 20 ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)", color: (state.level ?? 1) >= 20 ? "#4ade80" : "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)" }}>
                {(state.level ?? 1) >= 20 ? "✅" : "⬜"} Niv.{state.level ?? 1}/20
              </span>
            </div>
          </div>
        ) : !confirmed ? (
          <motion.button onClick={() => setConfirmed(true)} whileTap={{ scale: 0.96 }} transition={springTap}
            className="rounded-full px-10 py-4 font-black text-base"
            style={{ background: "linear-gradient(135deg,#D4AF37,#8B6914)", color: "#0a0f0d", fontFamily: "var(--font-bricolage)", boxShadow: "0 0 30px rgba(212,175,55,0.4)" }}>
            Activer le Mode Hafiz ⭐
          </motion.button>
        ) : (
          <div className="w-full max-w-xs flex flex-col gap-3">
            <p className="text-sm font-bold" style={{ color: "#f97316", fontFamily: "var(--font-dm-sans)" }}>
              ⚠️ Cette action réinitialise ton niveau et tes stages. Confirmes-tu ?
            </p>
            <motion.button onClick={activate} whileTap={{ scale: 0.96 }} transition={springTap}
              className="rounded-full py-4 font-black text-sm"
              style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", fontFamily: "var(--font-bricolage)" }}>
              Oui, je confirme ⭐
            </motion.button>
            <motion.button onClick={() => setConfirmed(false)} whileTap={{ scale: 0.96 }}
              className="rounded-full py-3 text-sm opacity-40"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Annuler
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
