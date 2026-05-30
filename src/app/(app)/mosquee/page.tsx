"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { storage } from "@/lib/storage";
import { gameStorage } from "@/lib/game/game-storage";
import MosqueIsometrique, { type MosqueStage } from "@/components/MosqueIsometrique";
import { pageVariants, itemVariants } from "@/lib/motion";
import { SAGES } from "@/lib/game/sages";

const MILESTONES = [
  { streak: 0,  stade: 1, label: "Tapis de prière",      desc: "Premier pas — l'essentiel est là.",         emoji: "🕌" },
  { streak: 7,  stade: 2, label: "Mosquée en construction", desc: "7 jours consécutifs — les murs s'élèvent.", emoji: "🏗" },
  { streak: 30, stade: 3, label: "Mosquée complète",      desc: "30 jours — deux minarets, une fontaine.",    emoji: "✨" },
];

export default function MosqueePage() {
  const [streak,  setStreak]  = useState(0);
  const [stage,   setStage]   = useState<MosqueStage>(1);
  const [allDays, setAllDays] = useState(0);
  const [mosqueObjects, setMosqueObjects] = useState<string[]>([]);
  const [sageCards,     setSageCards]     = useState<string[]>([]);

  useEffect(() => {
    const log     = storage.getPrayerLog();
    const tracked = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const entry = log.find(l => l.date === key);
      if (tracked.every(k => entry?.done[k])) streak++;
      else if (i > 0) break;
    }

    const total = log.filter(l => tracked.every(k => l.done[k])).length;
    setStreak(streak);
    setAllDays(total);
    setStage(streak >= 30 ? 3 : streak >= 7 ? 2 : 1);

    const gameState = gameStorage.get();
    setMosqueObjects(gameState.mosqueObjects);
    setSageCards(gameState.sageCards);
  }, []);

  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate"
      className="flex flex-col gap-6 px-5 pt-12 pb-24">

      <motion.div variants={itemVariants}>
        <p className="text-xs tracking-widest uppercase opacity-50"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Ma pratique · privée
        </p>
        <h1 className="mt-1 text-2xl font-bold"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Ma mosquée
        </h1>
      </motion.div>

      {/* Mosquée */}
      <motion.div variants={itemVariants}
        className="rounded-2xl border p-5"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}>
        <MosqueIsometrique stage={stage} streak={streak} />
      </motion.div>

      {/* Stat globale */}
      <motion.div variants={itemVariants}
        className="rounded-xl border px-5 py-4"
        style={{ background: "rgba(5,92,63,0.08)", borderColor: "rgba(212,175,55,0.12)" }}>
        <p className="text-xs opacity-40 uppercase tracking-widest mb-1"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Total jours complets
        </p>
        <p className="text-3xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
          {allDays}
        </p>
        <p className="text-xs opacity-40 mt-1" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          jours avec les 5 prières cochées
        </p>
      </motion.div>

      {/* Jalons */}
      <motion.div variants={itemVariants}>
        <p className="text-xs tracking-widest uppercase opacity-40 mb-3"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Jalons d'évolution
        </p>
        <div className="flex flex-col gap-3">
          {MILESTONES.map((m) => {
            const reached = streak >= m.streak;
            const isCurrent = stage === m.stade;
            return (
              <motion.div key={m.streak}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 rounded-xl border px-4 py-3.5"
                style={{
                  background: isCurrent ? "rgba(5,92,63,0.2)" : reached ? "rgba(5,92,63,0.08)" : "rgba(255,255,255,0.02)",
                  borderColor: isCurrent ? "rgba(212,175,55,0.35)" : reached ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.06)",
                }}>
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold"
                    style={{ color: isCurrent ? "#D4AF37" : reached ? "#F8F4EC" : "rgba(248,244,236,0.35)", fontFamily: "var(--font-dm-sans)" }}>
                    {m.label}
                  </p>
                  <p className="text-xs opacity-50 mt-0.5"
                    style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {m.desc}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {reached ? (
                    <span className="text-xs font-bold" style={{ color: "#D4AF37" }}>✦</span>
                  ) : (
                    <span className="text-xs opacity-30" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                      {m.streak}j
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Objets débloqués par le jeu */}
      {mosqueObjects.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="text-xs tracking-widest uppercase opacity-40 mb-3"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Objets débloqués via l&apos;Oasis
          </p>
          <div className="flex flex-wrap gap-2">
            {mosqueObjects.map(obj => {
              const labels: Record<string, string> = {
                lantern_1: "🪔 Lanterne", carpet_1: "🪣 Tapis", chandelier_1: "💡 Lustre",
                mihrab_1: "🕌 Mihrab", minaret_base: "🗼 Minaret", fountain_1: "⛲ Fontaine",
                arch_1: "🌙 Arche", tiles_1: "🔷 Zellige", calligraphy_1: "✍️ Calligraphie",
                dome_1: "🔵 Dôme",
              };
              return (
                <div key={obj} className="flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)" }}>
                  <span className="text-xs font-semibold"
                    style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                    {labels[obj] ?? obj}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Bibliothèque des sages */}
      {sageCards.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="text-xs tracking-widest uppercase opacity-40 mb-3"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Bibliothèque des sages vaincus
          </p>
          <div className="grid grid-cols-2 gap-2">
            {sageCards.map(sageId => {
              const sage = SAGES.find(s => s.id === sageId);
              if (!sage) return null;
              return (
                <div key={sageId} className="flex items-center gap-3 rounded-2xl border px-3 py-3"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.2)" }}>
                  <span className="text-xl">📜</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate"
                      style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
                      {sage.name}
                    </p>
                    <p className="text-[10px] truncate opacity-45"
                      style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                      {sage.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Message inspirant */}
      <motion.div variants={itemVariants}
        className="rounded-2xl border p-5 text-center"
        style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.12)" }}>
        <p className="text-lg font-bold leading-relaxed"
          style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
          {stage === 3
            ? "إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ"
            : "مَن بَنَى مَسجِداً لله, بَنى اللهُ لَهُ بَيتاً فِي الجَنَّةِ"
          }
        </p>
        <p className="text-xs opacity-50 mt-2" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          {stage === 3
            ? "Les mosquées d'Allah ne sont entretenues que par ceux qui croient en Allah — At-Tawba 9:18"
            : "Celui qui bâtit une mosquée pour Allah, Allah lui bâtit une demeure au Paradis — Mouslim"
          }
        </p>
      </motion.div>
    </motion.main>
  );
}
