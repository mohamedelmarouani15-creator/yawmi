"use client";

import { useState } from "react";
import { motion, type Variants, type Transition } from "framer-motion";
import { useMaisonSagesseStore } from "@/lib/maison-sagesse/game-store";

const PARAGRAPHS = [
  "Vous avez été convoqués en secret par le Calife Al-Ma'mûn ibn Hârûn ar-Rashîd, Commandeur des Croyants et protecteur des sciences. La Maison de la Sagesse — Bayt al-Hikma — est en péril. Un traître a dérobé la clé du Coffre de la Connaissance, qui renferme les manuscrits les plus précieux de l'humanité.",
  "Vous avez exactement quarante-cinq minutes avant que les gardes du Calife referment les portes pour sceller la bibliothèque. Trois voies s'ouvrent devant vous : La Voie de la Foi, La Voie de la Science, La Voie de la Sagesse. Chacune garde un chiffre. Ces trois chiffres, dans l'ordre juste, ouvrent le Coffre.",
  "Que la lumière d'Allah guide vos esprits, et que la baraka des savants qui ont marché dans ces couloirs bénisse votre quête. Le compte à rebours commence maintenant.",
];

// CSS star positions (deterministic pseudo-random)
const STARS = Array.from({ length: 60 }, (_, i) => ({
  left: `${(i * 137.508) % 100}%`,
  top: `${(i * 97.3) % 100}%`,
  size: 1 + (i % 3) * 0.8,
  opacity: 0.15 + (i % 5) * 0.1,
  delay: (i % 7) * 0.3,
}));

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18 } as Transition,
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } as Transition,
  },
};

export default function IntroScreen() {
  const startGame = useMaisonSagesseStore((s) => s.startGame);
  const [playerCount, setPlayerCount] = useState(1);

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(20,30,70,0.95) 0%, rgba(5,8,18,1) 60%, #000000 100%)",
      }}
    >
      {/* Starfield */}
      {STARS.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background: "white",
            opacity: star.opacity,
          }}
          animate={{ opacity: [star.opacity, star.opacity * 2, star.opacity] }}
          transition={{
            duration: 2 + (i % 4),
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Ambient glow */}
      <div
        className="absolute"
        style={{
          width: 400,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center max-w-md w-full gap-5"
      >
        {/* Decorative crescent */}
        <motion.div variants={itemVariants} style={{ fontSize: 40 }}>
          🌙
        </motion.div>

        {/* Arabic subtitle */}
        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: "var(--font-amiri, serif)",
            fontSize: 18,
            color: "rgba(212,175,55,0.6)",
            letterSpacing: "0.08em",
          }}
        >
          بيت الحكمة
        </motion.p>

        {/* Main title */}
        <motion.h1
          variants={itemVariants}
          className="text-center"
          style={{
            fontFamily: "var(--font-amiri, serif)",
            fontSize: 24,
            color: "#D4AF37",
            lineHeight: 1.3,
            textShadow: "0 0 30px rgba(212,175,55,0.4)",
          }}
        >
          Le Secret de la Maison
          <br />
          de la Sagesse
        </motion.h1>

        {/* Period subtitle */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: 10,
            fontFamily: "var(--font-dm-sans)",
            color: "rgba(248,244,236,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            fontWeight: 600,
          }}
        >
          Bagdad &bull; An 830 de l&apos;Ère Chrétienne
        </motion.p>

        {/* Separator */}
        <motion.div
          variants={itemVariants}
          className="w-full flex items-center gap-3"
        >
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
          <span style={{ color: "rgba(212,175,55,0.4)", fontSize: 10 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
        </motion.div>

        {/* Paragraphs */}
        <div className="flex flex-col gap-3">
          {PARAGRAPHS.map((para, i) => (
            <motion.p
              key={i}
              variants={itemVariants}
              style={{
                fontSize: 12,
                fontFamily: "var(--font-dm-sans)",
                color: "rgba(248,244,236,0.65)",
                lineHeight: 1.7,
                textAlign: "center",
              }}
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* Separator */}
        <motion.div
          variants={itemVariants}
          className="w-full flex items-center gap-3"
        >
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.1)" }} />
          <span style={{ color: "rgba(212,175,55,0.3)", fontSize: 10 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.1)" }} />
        </motion.div>

        {/* Player count selector */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 w-full">
          <p
            style={{
              fontSize: 10,
              fontFamily: "var(--font-dm-sans)",
              color: "rgba(248,244,236,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 600,
            }}
          >
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
                  width: 44,
                  height: 44,
                  fontSize: 15,
                  fontFamily: "var(--font-dm-sans)",
                  background:
                    n === playerCount
                      ? "linear-gradient(135deg, #7a5c1a, #D4AF37)"
                      : "rgba(212,175,55,0.06)",
                  border: `1px solid ${n === playerCount ? "rgba(212,175,55,0.7)" : "rgba(212,175,55,0.15)"}`,
                  color: n === playerCount ? "#0A0F0D" : "rgba(212,175,55,0.5)",
                  transition: "all 0.15s",
                }}
              >
                {n}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* CTA button */}
        <motion.div variants={itemVariants} className="w-full">
          <motion.button
            whileTap={{ scale: 0.96 }}
            animate={{
              boxShadow: [
                "0 0 0px rgba(212,175,55,0)",
                "0 0 30px rgba(212,175,55,0.35)",
                "0 0 0px rgba(212,175,55,0)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            onClick={() => startGame(playerCount)}
            className="w-full rounded-2xl py-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(90,65,15,0.9) 0%, rgba(212,175,55,0.85) 50%, rgba(90,65,15,0.9) 100%)",
              border: "1px solid rgba(212,175,55,0.6)",
              color: "#0A0F0D",
              fontSize: 14,
              fontFamily: "var(--font-bricolage, var(--font-dm-sans))",
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            Entrer dans la Maison de la Sagesse
          </motion.button>
        </motion.div>

        {/* Footer note */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: 9,
            fontFamily: "var(--font-dm-sans)",
            color: "rgba(248,244,236,0.2)",
            textAlign: "center",
          }}
        >
          45 min &bull; {playerCount} joueur{playerCount > 1 ? "s" : ""} &bull; Dès 7 ans
        </motion.p>
      </motion.div>
    </div>
  );
}
