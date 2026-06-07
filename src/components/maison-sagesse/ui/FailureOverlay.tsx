"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMaisonSagesseStore } from "@/lib/maison-sagesse/game-store";

const SOLUTIONS: Record<"A" | "B" | "C", { label: string; digit: number; explanation: string }> = {
  A: {
    label: "Voie de la Foi",
    digit: 5,
    explanation: "Les CINQ piliers de l'Islam : Shahada, Salat, Zakat, Sawm, Hajj.",
  },
  B: {
    label: "Voie de la Science",
    digit: 7,
    explanation: "Les SEPT astres errants : Soleil, Lune, Mercure, Vénus, Mars, Jupiter, Saturne.",
  },
  C: {
    label: "Voie de la Sagesse",
    digit: 6,
    explanation: "Les SIX piliers de la Foi (Iman) enseignés par Jibrîl 'alayhi as-salâm.",
  },
};

export default function FailureOverlay() {
  const enigmaA = useMaisonSagesseStore((s) => s.enigmaA);
  const enigmaB = useMaisonSagesseStore((s) => s.enigmaB);
  const enigmaC = useMaisonSagesseStore((s) => s.enigmaC);
  const resetGame = useMaisonSagesseStore((s) => s.resetGame);
  const router = useRouter();

  const [showSolutions, setShowSolutions] = useState(false);

  const enigmaStates = { A: enigmaA, B: enigmaB, C: enigmaC } as const;
  const solvedEnigmas = (["A", "B", "C"] as const).filter(
    (k) => enigmaStates[k].solved
  );
  const unsolvedEnigmas = (["A", "B", "C"] as const).filter(
    (k) => !enigmaStates[k].solved
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "rgba(4,6,8,0.93)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Subtle night radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(30,50,80,0.3) 0%, transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-5 px-6 max-w-md w-full"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -3, 0] }}
          transition={{ delay: 0.5, duration: 1.2 }}
          style={{ fontSize: 48 }}
        >
          🌃
        </motion.div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "var(--font-amiri, serif)",
            fontSize: 22,
            color: "rgba(248,244,236,0.8)",
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          Le temps s&apos;est écoulé...
        </h2>

        {/* Inspirational text */}
        <div
          className="rounded-2xl p-4 w-full"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontFamily: "var(--font-dm-sans)",
              color: "rgba(248,244,236,0.6)",
              lineHeight: 1.7,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            &quot;Les portes se referment, mais le savoir ne périt jamais. Al-Ghazâlî l&apos;a écrit :
            &lsquo;La connaissance sans action est comme un arbre sans fruits.&rsquo; Vous avez
            semé des graines ce soir. Revenez demain, et ces graines auront germé.&quot;
          </p>
        </div>

        {/* What was discovered */}
        {solvedEnigmas.length > 0 && (
          <div className="w-full">
            <p
              style={{
                fontSize: 9,
                fontFamily: "var(--font-dm-sans)",
                color: "rgba(52,211,153,0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 700,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Ce que vous avez découvert
            </p>
            <div className="flex flex-col gap-2">
              {solvedEnigmas.map((key) => {
                const sol = SOLUTIONS[key];
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-xl px-3 py-2"
                    style={{
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.2)",
                    }}
                  >
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-full font-black"
                      style={{
                        background: "linear-gradient(135deg,#7a5c1a,#D4AF37)",
                        color: "#0A0F0D",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {sol.digit}
                    </span>
                    <div>
                      <p style={{ fontSize: 10, color: "#34d399", fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}>
                        ✓ {sol.label}
                      </p>
                      <p style={{ fontSize: 9, color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                        {sol.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Solutions toggle */}
        {unsolvedEnigmas.length > 0 && (
          <div className="w-full">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSolutions((s) => !s)}
              className="w-full rounded-xl py-2.5 mb-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(248,244,236,0.5)",
                fontSize: 11,
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 700,
              }}
            >
              {showSolutions ? "Masquer les solutions" : "Voir les solutions"}
            </motion.button>

            <AnimatePresence>
              {showSolutions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="flex flex-col gap-2">
                    {unsolvedEnigmas.map((key) => {
                      const sol = SOLUTIONS[key];
                      return (
                        <motion.div
                          key={key}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-center gap-3 rounded-xl px-3 py-2"
                          style={{
                            background: "rgba(212,175,55,0.05)",
                            border: "1px solid rgba(212,175,55,0.15)",
                          }}
                        >
                          <span
                            className="flex items-center justify-center w-7 h-7 rounded-full font-black"
                            style={{
                              background: "rgba(212,175,55,0.15)",
                              color: "#D4AF37",
                              fontSize: 14,
                              flexShrink: 0,
                              border: "1px solid rgba(212,175,55,0.3)",
                            }}
                          >
                            {sol.digit}
                          </span>
                          <div>
                            <p style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}>
                              {sol.label}
                            </p>
                            <p style={{ fontSize: 9, color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                              {sol.explanation}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => resetGame()}
            className="flex-1 rounded-2xl py-3 font-bold"
            style={{
              background:
                "linear-gradient(135deg, rgba(90,65,15,0.8), rgba(212,175,55,0.7))",
              border: "1px solid rgba(212,175,55,0.5)",
              color: "#0A0F0D",
              fontSize: 13,
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 800,
            }}
          >
            Réessayer
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/oasis")}
            className="flex-1 rounded-2xl py-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(248,244,236,0.5)",
              fontSize: 13,
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 600,
            }}
          >
            Retour à l&apos;Oasis
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
