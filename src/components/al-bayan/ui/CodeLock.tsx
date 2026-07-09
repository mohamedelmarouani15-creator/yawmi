"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlBayanStore } from "@/lib/al-bayan/game-store";
import { playInteract, playBuzz } from "@/lib/al-bayan/audio-engine";
import { triggerShake } from "@/lib/camera-shake";

const SLOT_COUNT = 4;

function DigitSlot({ value, disabled, onChange }: { value: number; disabled: boolean; onChange: (next: number) => void }) {
  const increment = () => {
    if (disabled) return;
    playInteract();
    onChange((value + 1) % 10);
  };
  const decrement = () => {
    if (disabled) return;
    playInteract();
    onChange((value - 1 + 10) % 10);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button whileTap={{ scale: 0.85 }} onClick={increment} disabled={disabled}
        className="flex items-center justify-center w-9 h-7 rounded-lg"
        style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", color: disabled ? "rgba(212,175,55,0.3)" : "#D4AF37", fontSize: 13, cursor: disabled ? "not-allowed" : "pointer" }}
        aria-label="Augmenter">▲</motion.button>

      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.15 }}
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{ background: "rgba(10,15,13,0.9)", border: "2px solid rgba(212,175,55,0.4)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)" }}
        >
          <span style={{ fontSize: 26, fontFamily: "var(--font-dm-sans)", fontWeight: 900, color: "#D4AF37", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {value}
          </span>
        </motion.div>
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.85 }} onClick={decrement} disabled={disabled}
        className="flex items-center justify-center w-9 h-7 rounded-lg"
        style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", color: disabled ? "rgba(212,175,55,0.3)" : "#D4AF37", fontSize: 13, cursor: disabled ? "not-allowed" : "pointer" }}
        aria-label="Diminuer">▼</motion.button>
    </div>
  );
}

/** Coffre en cèdre du Majlis — s'ouvre avec le code à 4 chiffres lu sur les
 * jarres de la Cuisine (voir puzzle-logic.ts, JAR_CODE). Contient la
 * lentille de cristal nécessaire à l'énigme du Sanctuaire. */
export default function CodeLock() {
  const safeOpen = useAlBayanStore((s) => s.safeOpen);
  const openSafe = useAlBayanStore((s) => s.openSafe);
  const phase = useAlBayanStore((s) => s.phase);

  const [digits, setDigits] = useState<number[]>(Array(SLOT_COUNT).fill(0));
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [shaking, setShaking] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleTry = useCallback(() => {
    const success = openSafe(digits);
    if (success) {
      setFeedbackMsg("Le coffre s'ouvre...");
      setShowFeedback(true);
    } else {
      playBuzz();
      triggerShake(0.06, 0.35);
      setShaking(true);
      setAttempts((a) => a + 1);
      setFeedbackMsg(`Combinaison incorrecte... (tentative ${attempts + 1})`);
      setShowFeedback(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setShowFeedback(false), 2500);
    }
  }, [openSafe, digits, attempts]);

  const disabled = safeOpen || phase === "victory" || phase === "failure";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-auto">
      <motion.div
        animate={shaking ? { x: [-6, 6, -6, 6, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="rounded-2xl p-4"
        style={{ background: "linear-gradient(135deg, rgba(40,25,5,0.97) 0%, rgba(20,12,2,0.98) 100%)", border: "1px solid rgba(212,175,55,0.45)", boxShadow: "0 0 40px rgba(212,175,55,0.12), inset 0 0 20px rgba(212,175,55,0.04)" }}
      >
        <div className="text-center mb-3">
          <span style={{ fontSize: 9, fontFamily: "var(--font-dm-sans)", color: "rgba(212,175,55,0.6)", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700 }}>
            Le Coffre en Cèdre
          </span>
        </div>

        <div className="text-center mb-3">
          <motion.span animate={safeOpen ? { rotate: [0, -20, 0], scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5 }} style={{ fontSize: 28 }}>
            {safeOpen ? "🔓" : "🔒"}
          </motion.span>
        </div>

        <div className="flex items-center gap-2 justify-center mb-4">
          {digits.map((d, i) => (
            <DigitSlot
              key={i}
              value={d}
              disabled={disabled}
              onChange={(next) => setDigits((prev) => prev.map((v, idx) => (idx === i ? next : v)))}
            />
          ))}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center mb-3 text-xs"
              style={{ color: safeOpen ? "#4ade80" : "#f87171", fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>
              {feedbackMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {!disabled && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleTry}
            animate={{ boxShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 18px rgba(212,175,55,0.5)", "0 0 0px rgba(212,175,55,0)"] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-full rounded-xl py-2.5"
            style={{
              background: "linear-gradient(135deg, #7a5c1a 0%, #D4AF37 50%, #7a5c1a 100%)",
              border: "1px solid rgba(212,175,55,0.7)",
              color: "#0A0F0D",
              fontFamily: "var(--font-dm-sans)", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            Ouvrir le Coffre
          </motion.button>
        )}

        {attempts > 0 && !disabled && (
          <p className="text-center mt-2" style={{ fontSize: 9, color: "rgba(248,244,236,0.25)", fontFamily: "var(--font-dm-sans)" }}>
            {attempts} tentative{attempts > 1 ? "s" : ""} incorrecte{attempts > 1 ? "s" : ""}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
