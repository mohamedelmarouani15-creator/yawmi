"use client";

import { useState } from "react";
import { motion, type Variants, type Transition } from "framer-motion";
import { useAlBayanStore } from "@/lib/al-bayan/game-store";

const PARAGRAPHS = [
  "Médine, quelques années après le décès du Prophète ﷺ. Les compagnons qui connaissaient le Coran par cœur disparaissent peu à peu, et le calife Uthmân ibn Affân a confié à des érudits une mission sacrée : préserver, lettre par lettre, le texte révélé.",
  "Vous avez exactement quarante-cinq minutes avant que le coffret des manuscrits ne soit scellé pour la postérité. Trois voies s'ouvrent devant vous : le Poids du Témoignage, le Rasm Primitif, la Route des Codicilles. Chacune garde un chiffre.",
  "Que la clarté d'Al-Bayân guide votre esprit, et que la rigueur des premiers savants inspire votre quête. Le compte à rebours commence maintenant.",
];

const STARS = Array.from({ length: 60 }, (_, i) => ({
  left: `${(i * 137.508) % 100}%`,
  top: `${(i * 97.3) % 100}%`,
  size: 1 + (i % 3) * 0.8,
  opacity: 0.15 + (i % 5) * 0.1,
  delay: (i % 7) * 0.3,
}));

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } as Transition },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } as Transition },
};

export default function IntroScreen() {
  const startGame = useAlBayanStore((s) => s.startGame);
  const [playerCount, setPlayerCount] = useState(1);

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(20,30,70,0.95) 0%, rgba(5,8,18,1) 60%, #000000 100%)" }}
    >
      {STARS.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ left: star.left, top: star.top, width: star.size, height: star.size, background: "white", opacity: star.opacity }}
          animate={{ opacity: [star.opacity, star.opacity * 2, star.opacity] }}
          transition={{ duration: 2 + (i % 4), delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div
        className="absolute"
        style={{ width: 400, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(96,165,250,0.06) 0%, transparent 70%)", top: "10%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 flex flex-col items-center max-w-md w-full gap-5">
        <motion.div variants={itemVariants} style={{ fontSize: 40 }}>📜</motion.div>

        <motion.p variants={itemVariants} style={{ fontFamily: "var(--font-amiri, serif)", fontSize: 18, color: "rgba(96,165,250,0.7)", letterSpacing: "0.08em" }}>
          البيان
        </motion.p>

        <motion.h1 variants={itemVariants} className="text-center" style={{ fontFamily: "var(--font-amiri, serif)", fontSize: 24, color: "#D4AF37", lineHeight: 1.3, textShadow: "0 0 30px rgba(212,175,55,0.4)" }}>
          Al-Bayân — Le Secret
          <br />
          des Manuscrits
        </motion.h1>

        <motion.p variants={itemVariants} style={{ fontSize: 10, fontFamily: "var(--font-dm-sans)", color: "rgba(248,244,236,0.4)", textTransform: "uppercase", letterSpacing: "0.25em", fontWeight: 600 }}>
          Médine &bull; Compilation du Coran
        </motion.p>

        <motion.div variants={itemVariants} className="w-full flex items-center gap-3">
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
          <span style={{ color: "rgba(212,175,55,0.4)", fontSize: 10 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
        </motion.div>

        <div className="flex flex-col gap-3">
          {PARAGRAPHS.map((para, i) => (
            <motion.p key={i} variants={itemVariants} style={{ fontSize: 12, fontFamily: "var(--font-dm-sans)", color: "rgba(248,244,236,0.65)", lineHeight: 1.7, textAlign: "center" }}>
              {para}
            </motion.p>
          ))}
        </div>

        <motion.div variants={itemVariants} className="w-full flex items-center gap-3">
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.1)" }} />
          <span style={{ color: "rgba(212,175,55,0.3)", fontSize: 10 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.1)" }} />
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 w-full">
          <p style={{ fontSize: 10, fontFamily: "var(--font-dm-sans)", color: "rgba(248,244,236,0.45)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600 }}>
            Nombre de joueurs
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                whileTap={{ scale: 0.88 }}
                onClick={() => setPlayerCount(n)}
                className="flex items-center justify-center rounded-xl font-bold"
                style={{
                  width: 44, height: 44, fontSize: 15, fontFamily: "var(--font-dm-sans)",
                  background: n === playerCount ? "linear-gradient(135deg, #1d4ed8, #60a5fa)" : "rgba(96,165,250,0.06)",
                  border: `1px solid ${n === playerCount ? "rgba(96,165,250,0.7)" : "rgba(96,165,250,0.15)"}`,
                  color: n === playerCount ? "#0A0F0D" : "rgba(96,165,250,0.5)",
                  transition: "all 0.15s",
                }}
              >
                {n}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full">
          <motion.button
            whileTap={{ scale: 0.96 }}
            animate={{ boxShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 30px rgba(212,175,55,0.35)", "0 0 0px rgba(212,175,55,0)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            onClick={() => startGame(playerCount)}
            className="w-full rounded-2xl py-4"
            style={{
              background: "linear-gradient(135deg, rgba(90,65,15,0.9) 0%, rgba(212,175,55,0.85) 50%, rgba(90,65,15,0.9) 100%)",
              border: "1px solid rgba(212,175,55,0.6)", color: "#0A0F0D", fontSize: 14,
              fontFamily: "var(--font-bricolage, var(--font-dm-sans))", fontWeight: 800, letterSpacing: "0.04em",
            }}
          >
            Entrer dans la Maison des Manuscrits
          </motion.button>
        </motion.div>

        <motion.p variants={itemVariants} style={{ fontSize: 9, fontFamily: "var(--font-dm-sans)", color: "rgba(248,244,236,0.2)", textAlign: "center" }}>
          45 min &bull; {playerCount} joueur{playerCount > 1 ? "s" : ""} &bull; Dès 7 ans
        </motion.p>
      </motion.div>
    </div>
  );
}
