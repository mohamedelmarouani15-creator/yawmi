"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlBayanStore } from "@/lib/al-bayan/game-store";

type Slot = "a" | "b" | "c";

function DigitSlot({ slot, value, disabled }: { slot: Slot; value: number | null; disabled: boolean }) {
  const setCodeDigit = useAlBayanStore((s) => s.setCodeDigit);

  const increment = () => {
    if (disabled) return;
    setCodeDigit(slot, value === null ? 0 : (value + 1) % 10);
  };
  const decrement = () => {
    if (disabled) return;
    setCodeDigit(slot, value === null ? 9 : (value - 1 + 10) % 10);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button whileTap={{ scale: 0.85 }} onClick={increment} disabled={disabled}
        className="flex items-center justify-center w-10 h-8 rounded-lg"
        style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", color: disabled ? "rgba(212,175,55,0.3)" : "#D4AF37", fontSize: 14, cursor: disabled ? "not-allowed" : "pointer" }}
        aria-label="Augmenter">▲</motion.button>

      <AnimatePresence mode="wait">
        <motion.div
          key={value ?? "null"}
          initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.15 }}
          className="flex items-center justify-center w-14 h-14 rounded-xl"
          style={{ background: "rgba(10,15,13,0.9)", border: "2px solid rgba(212,175,55,0.4)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)" }}
        >
          <span style={{ fontSize: 32, fontFamily: "var(--font-dm-sans)", fontWeight: 900, color: value !== null ? "#D4AF37" : "rgba(212,175,55,0.2)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {value !== null ? value : "–"}
          </span>
        </motion.div>
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.85 }} onClick={decrement} disabled={disabled}
        className="flex items-center justify-center w-10 h-8 rounded-lg"
        style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", color: disabled ? "rgba(212,175,55,0.3)" : "#D4AF37", fontSize: 14, cursor: disabled ? "not-allowed" : "pointer" }}
        aria-label="Diminuer">▼</motion.button>
    </div>
  );
}

export default function CodeLock() {
  const codeLock = useAlBayanStore((s) => s.codeLock);
  const lockOpen = useAlBayanStore((s) => s.lockOpen);
  const codeAttempts = useAlBayanStore((s) => s.codeAttempts);
  const tryOpenLock = useAlBayanStore((s) => s.tryOpenLock);
  const phase = useAlBayanStore((s) => s.phase);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [shaking, setShaking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const allFilled = codeLock.a !== null && codeLock.b !== null && codeLock.c !== null;

  const handleTry = useCallback(() => {
    if (!allFilled) return;
    const success = tryOpenLock();
    if (success) {
      setIsOpen(true);
      setFeedbackMsg("Le coffret s'ouvre...");
      setShowFeedback(true);
    } else {
      setShaking(true);
      setFeedbackMsg(`Combinaison incorrecte... (tentative ${codeAttempts + 1})`);
      setShowFeedback(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setShowFeedback(false), 2500);
    }
  }, [allFilled, tryOpenLock, codeAttempts]);

  const disabled = lockOpen || phase === "victory" || phase === "failure";

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
            Le Coffret des Manuscrits
          </span>
        </div>

        <div className="text-center mb-3">
          <motion.span animate={isOpen ? { rotate: [0, -20, 0], scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5 }} style={{ fontSize: 28 }}>
            {isOpen ? "🔓" : "🔒"}
          </motion.span>
        </div>

        <div className="flex items-center gap-3 justify-center mb-4">
          <DigitSlot slot="a" value={codeLock.a} disabled={disabled} />
          <span style={{ color: "rgba(212,175,55,0.4)", fontSize: 20, fontWeight: 900, alignSelf: "center", marginTop: 8 }}>–</span>
          <DigitSlot slot="b" value={codeLock.b} disabled={disabled} />
          <span style={{ color: "rgba(212,175,55,0.4)", fontSize: 20, fontWeight: 900, alignSelf: "center", marginTop: 8 }}>–</span>
          <DigitSlot slot="c" value={codeLock.c} disabled={disabled} />
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center mb-3 text-xs"
              style={{ color: isOpen ? "#4ade80" : "#f87171", fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>
              {feedbackMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {!disabled && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleTry}
            animate={allFilled ? { boxShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 18px rgba(212,175,55,0.5)", "0 0 0px rgba(212,175,55,0)"] } : {}}
            transition={allFilled ? { duration: 1.5, repeat: Infinity } : {}}
            disabled={!allFilled}
            className="w-full rounded-xl py-2.5"
            style={{
              background: allFilled ? "linear-gradient(135deg, #7a5c1a 0%, #D4AF37 50%, #7a5c1a 100%)" : "rgba(212,175,55,0.08)",
              border: `1px solid ${allFilled ? "rgba(212,175,55,0.7)" : "rgba(212,175,55,0.2)"}`,
              color: allFilled ? "#0A0F0D" : "rgba(212,175,55,0.3)",
              fontFamily: "var(--font-dm-sans)", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em",
              cursor: allFilled ? "pointer" : "not-allowed",
            }}
          >
            Ouvrir le Coffret
          </motion.button>
        )}

        {codeAttempts > 0 && !disabled && (
          <p className="text-center mt-2" style={{ fontSize: 9, color: "rgba(248,244,236,0.25)", fontFamily: "var(--font-dm-sans)" }}>
            {codeAttempts} tentative{codeAttempts > 1 ? "s" : ""} incorrecte{codeAttempts > 1 ? "s" : ""}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
