"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAlBayanStore } from "@/lib/al-bayan/game-store";
import { GAME_DURATION } from "@/lib/al-bayan/puzzle-logic";

const MANUSCRIT_FINAL = `"Ô gardiens de la lettre, vous avez prouvé que la clarté — al-bayân — ne se gagne jamais par hasard. \
Vous avez pesé un témoignage et compris qu'un seul homme intègre peut valoir deux. \
Vous avez redonné leurs points aux lettres muettes des premiers copistes. \
Vous avez suivi les routes par lesquelles la parole de Dieu a traversé les déserts jusqu'à Koufa, Bassora et Damas. \
Ce que vous tenez entre vos mains n'est pas un trésor d'or, mais la preuve que la vérité, transmise avec rigueur, traverse les siècles sans une seule lettre perdue."`;

const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  left: `${(i * 137.5) % 100}%`,
  delay: (i * 0.08) % 2,
  duration: 2 + (i % 4) * 0.5,
  color: i % 3 === 0 ? "#60a5fa" : i % 3 === 1 ? "rgba(212,175,55,0.6)" : "rgba(96,165,250,0.7)",
  size: 4 + (i % 5) * 2,
}));

function StarRating({ timeLeft }: { timeLeft: number }) {
  const stars = timeLeft > 1500 ? 3 : timeLeft > 600 ? 2 : 1;
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3].map((s) => (
        <motion.span key={s} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.8 + s * 0.2, type: "spring", stiffness: 260, damping: 16 }}
          style={{ fontSize: 32, opacity: s <= stars ? 1 : 0.2, filter: s <= stars ? "drop-shadow(0 0 8px #D4AF37)" : "none" }}>
          ⭐
        </motion.span>
      ))}
    </div>
  );
}

export default function VictoryOverlay() {
  const timeLeft = useAlBayanStore((s) => s.timeLeft);
  const resetGame = useAlBayanStore((s) => s.resetGame);
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden" style={{ background: "rgba(8,12,20,0.92)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(96,165,250,0.15) 0%, transparent 60%)" }} />

      {CONFETTI.map((c, i) => (
        <motion.div key={i} className="absolute top-0 rounded-sm pointer-events-none"
          style={{ left: c.left, width: c.size, height: c.size, background: c.color }}
          animate={{ y: ["0vh", "110vh"], rotate: [0, 720], opacity: [1, 0.8, 0] }}
          transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: "linear" }} />
      ))}

      <AnimatePresence>
        {showContent && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-5 px-6 max-w-md w-full">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ fontFamily: "var(--font-amiri, serif)", fontSize: 26, color: "#D4AF37", textShadow: "0 0 20px rgba(212,175,55,0.5)", textAlign: "center" }}>
              بسم الله الرحمن الرحيم
            </motion.p>

            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} style={{ fontSize: 52 }}>
              📜
            </motion.div>

            <h2 style={{ fontFamily: "var(--font-bricolage, var(--font-dm-sans))", fontSize: 22, color: "#60a5fa", textAlign: "center", fontWeight: 900 }}>
              Le Coffret est ouvert !
            </h2>

            <StarRating timeLeft={timeLeft} />

            <p style={{ fontSize: 11, fontFamily: "var(--font-dm-sans)", color: "rgba(248,244,236,0.45)", textAlign: "center" }}>
              Temps restant : {String(minutesLeft).padStart(2, "0")}:{String(secondsLeft).padStart(2, "0")} sur {Math.floor(GAME_DURATION / 60)} minutes
            </p>

            <div className="rounded-2xl p-4 w-full" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.2)" }}>
              <p style={{ fontSize: 11, fontFamily: "var(--font-dm-sans)", color: "rgba(248,244,236,0.7)", lineHeight: 1.7, textAlign: "center", fontStyle: "italic" }}>
                {MANUSCRIT_FINAL}
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => resetGame()}
                className="flex-1 rounded-2xl py-3 font-bold"
                style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa", fontSize: 13, fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}>
                Rejouer
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.push("/oasis/escape")}
                className="flex-1 rounded-2xl py-3 font-bold"
                style={{ background: "linear-gradient(135deg, rgba(5,92,63,0.8), rgba(5,92,63,0.4))", border: "1px solid rgba(5,92,63,0.6)", color: "#F8F4EC", fontSize: 13, fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}>
                Retour aux Escape Games
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
