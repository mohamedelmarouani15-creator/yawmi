"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAlBayanStore } from "@/lib/al-bayan/game-store";
import { ALL_QUESTS, type QuestMeta } from "@/lib/al-bayan/puzzle-logic";

const QUEST_ICON: Record<QuestMeta["id"], string> = {
  astrolabe: "🔭",
  manuscrits: "📜",
  jarres: "🏺",
  lentille: "💎",
};

const SOLUTION_EXPLANATION: Record<QuestMeta["id"], string> = {
  astrolabe: "Anneau des heures à 120°, anneau des mois à 210°, anneau des étoiles à 45°.",
  manuscrits: "De gauche à droite : Chronique de l'Exil (622), Première Bataille (624), Retour Triomphal (630).",
  jarres: "Le code du coffre, lu sur les quatre jarres gravées : 3-1-8-5.",
  lentille: "La lentille de cristal se pose sur le logement vide du grand lustre du Sanctuaire.",
};

export default function FailureOverlay() {
  const astrolabeSolved = useAlBayanStore((s) => s.astrolabeSolved);
  const manuscriptsSolved = useAlBayanStore((s) => s.manuscriptsSolved);
  const safeOpen = useAlBayanStore((s) => s.safeOpen);
  const lensPlaced = useAlBayanStore((s) => s.lensPlaced);
  const resetGame = useAlBayanStore((s) => s.resetGame);
  const router = useRouter();

  const [showSolutions, setShowSolutions] = useState(false);

  const solvedMap: Record<QuestMeta["id"], boolean> = {
    astrolabe: astrolabeSolved,
    manuscrits: manuscriptsSolved,
    jarres: safeOpen,
    lentille: lensPlaced,
  };
  const quests = Object.values(ALL_QUESTS);
  const solvedQuests = quests.filter((q) => solvedMap[q.id]);
  const unsolvedQuests = quests.filter((q) => !solvedMap[q.id]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden" style={{ background: "rgba(4,6,8,0.93)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(30,50,80,0.3) 0%, transparent 60%)" }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-5 px-6 max-w-md w-full">
        <motion.div animate={{ rotate: [0, -5, 5, -3, 0] }} transition={{ delay: 0.5, duration: 1.2 }} style={{ fontSize: 48 }}>
          🕯️
        </motion.div>

        <h2 style={{ fontFamily: "var(--font-amiri, serif)", fontSize: 22, color: "rgba(248,244,236,0.8)", textAlign: "center", fontWeight: 700 }}>
          Le temps s&apos;est écoulé...
        </h2>

        <div className="rounded-2xl p-4 w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 11, fontFamily: "var(--font-dm-sans)", color: "rgba(248,244,236,0.6)", lineHeight: 1.7, textAlign: "center", fontStyle: "italic" }}>
            &quot;La villa referme ses portes, mais ses secrets restent à leur place — l&apos;astrolabe, les manuscrits,
            les jarres et le lustre attendront votre retour. Certaines demeures ne livrent leurs trésors
            qu&apos;à qui prend le temps de bien regarder.&quot;
          </p>
        </div>

        {solvedQuests.length > 0 && (
          <div className="w-full">
            <p style={{ fontSize: 9, fontFamily: "var(--font-dm-sans)", color: "rgba(52,211,153,0.6)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
              Ce que vous avez découvert
            </p>
            <div className="flex flex-col gap-2">
              {solvedQuests.map((quest) => (
                <div key={quest.id} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                  <span className="flex items-center justify-center w-7 h-7 rounded-full font-black" style={{ background: "linear-gradient(135deg,#7a5c1a,#D4AF37)", color: "#0A0F0D", fontSize: 14, flexShrink: 0 }}>
                    {QUEST_ICON[quest.id]}
                  </span>
                  <div>
                    <p style={{ fontSize: 10, color: "#34d399", fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}>✓ {quest.title}</p>
                    <p style={{ fontSize: 9, color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>{SOLUTION_EXPLANATION[quest.id]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {unsolvedQuests.length > 0 && (
          <div className="w-full">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSolutions((s) => !s)}
              className="w-full rounded-xl py-2.5 mb-2"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)", fontSize: 11, fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}>
              {showSolutions ? "Masquer les solutions" : "Voir les solutions"}
            </motion.button>

            <AnimatePresence>
              {showSolutions && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                  <div className="flex flex-col gap-2">
                    {unsolvedQuests.map((quest) => (
                      <motion.div key={quest.id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)" }}>
                        <span className="flex items-center justify-center w-7 h-7 rounded-full font-black" style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", fontSize: 14, flexShrink: 0, border: "1px solid rgba(212,175,55,0.3)" }}>
                          {QUEST_ICON[quest.id]}
                        </span>
                        <div>
                          <p style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}>{quest.title}</p>
                          <p style={{ fontSize: 9, color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>{SOLUTION_EXPLANATION[quest.id]}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => resetGame()}
            className="flex-1 rounded-2xl py-3 font-bold"
            style={{ background: "linear-gradient(135deg, rgba(90,65,15,0.8), rgba(212,175,55,0.7))", border: "1px solid rgba(212,175,55,0.5)", color: "#0A0F0D", fontSize: 13, fontFamily: "var(--font-dm-sans)", fontWeight: 800 }}>
            Réessayer
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.push("/oasis/escape")}
            className="flex-1 rounded-2xl py-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)", fontSize: 13, fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>
            Retour aux Escape Games
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
