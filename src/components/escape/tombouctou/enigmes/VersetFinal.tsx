"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Az-Zumar 39:9 — les deux blancs = يَعْلَمُونَ
const WORDS = [
  { id: "ya3lamoun", ar: "يَعْلَمُونَ", fr: "ceux qui savent",     correct: true },
  { id: "ya3budoun", ar: "يَعْبُدُونَ", fr: "ceux qui adorent",    correct: false },
  { id: "yuminoun",  ar: "يُؤْمِنُونَ", fr: "ceux qui croient",    correct: false },
  { id: "ya3qiloun", ar: "يَعْقِلُونَ", fr: "ceux qui réfléchissent", correct: false },
];

interface Props {
  onSolve: () => void;
  onClose: () => void;
  onError: () => void;
}

export default function VersetFinal({ onSolve, onClose, onError }: Props) {
  const [blank1, setBlank1] = useState<string | null>(null); // wordId
  const [blank2, setBlank2] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errorWord, setErrorWord] = useState<string | null>(null);

  const getWord = (id: string | null) => WORDS.find(w => w.id === id);

  const placeWord = useCallback((wordId: string) => {
    const word = WORDS.find(w => w.id === wordId);
    if (!word) return;

    if (!word.correct) {
      setErrorWord(wordId);
      onError();
      setTimeout(() => setErrorWord(null), 1200);
      return;
    }

    // Correct word → place in next empty blank
    if (!blank1) {
      setBlank1(wordId);
    } else if (!blank2) {
      setBlank2(wordId);
      // Les deux blancs sont remplis avec le bon mot → succès
      setTimeout(() => {
        setSuccess(true);
        setTimeout(onSolve, 1800);
      }, 400);
    }
  }, [blank1, blank2, onSolve, onError]);

  const clearBlank = (which: 1 | 2) => {
    if (which === 1) setBlank1(null);
    else setBlank2(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", maxWidth: 380 }}>

      {/* Mention */}
      <p style={{ color: "rgba(212,175,55,0.45)", fontSize: 11, letterSpacing: "0.15em",
        fontFamily: "var(--font-dm-sans, system-ui)", margin: 0, textAlign: "center" }}>
        SOURATE AZ-ZUMAR 39:9 — PLACEZ LES MOTS MANQUANTS
      </p>

      {/* Verset avec blancs */}
      <div style={{
        background: "rgba(212,175,55,0.05)",
        border: "1px solid rgba(212,175,55,0.22)",
        borderRadius: 16, padding: "20px 24px",
        textAlign: "center", width: "100%", boxSizing: "border-box",
      }}>
        {/* Texte arabe avec blancs */}
        <p style={{
          fontSize: 22, lineHeight: 1.9, color: "#F8F4EC",
          fontFamily: "serif", direction: "rtl", margin: "0 0 12px",
        }}>
          هَلْ يَسْتَوِي الَّذِينَ{" "}
          <BlankSlot
            word={getWord(blank1)}
            onClick={() => clearBlank(1)}
            glow={success}
          />{" "}
          وَالَّذِينَ لَا{" "}
          <BlankSlot
            word={getWord(blank2)}
            onClick={() => clearBlank(2)}
            glow={success}
          />
        </p>

        <div style={{ borderTop: "1px solid rgba(212,175,55,0.12)", paddingTop: 12 }}>
          <p style={{ color: "rgba(248,244,236,0.35)", fontSize: 13,
            fontFamily: "Georgia, serif", fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>
            « Sont-ils égaux, ceux qui _____ et ceux qui ne _____ pas ? »
          </p>
        </div>
      </div>

      {/* Mots flottants */}
      <p style={{ color: "rgba(212,175,55,0.4)", fontSize: 11, margin: 0,
        fontFamily: "var(--font-dm-sans, system-ui)", letterSpacing: "0.12em" }}>
        TOUCHEZ LE BON MOT
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
        {WORDS.map(word => {
          const placed = blank1 === word.id || blank2 === word.id;
          const isError = errorWord === word.id;
          return (
            <motion.button
              key={word.id}
              onClick={() => !placed && placeWord(word.id)}
              disabled={placed || success}
              animate={isError ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              whileTap={!placed ? { scale: 0.95 } : {}}
              style={{
                background: placed
                  ? "rgba(74,222,128,0.1)"
                  : isError
                    ? "rgba(248,113,113,0.1)"
                    : "rgba(212,175,55,0.07)",
                border: `1.5px solid ${placed ? "rgba(74,222,128,0.4)" : isError ? "rgba(248,113,113,0.4)" : "rgba(212,175,55,0.25)"}`,
                borderRadius: 12, padding: "12px 8px",
                cursor: placed ? "default" : "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                opacity: placed ? 0.5 : 1,
                transition: "opacity 0.3s, background 0.2s",
              }}
            >
              <span style={{
                fontSize: 20, color: placed ? "#4ade80" : "#D4AF37",
                fontFamily: "serif", direction: "rtl", lineHeight: 1,
              }}>
                {word.ar}
              </span>
              <span style={{
                fontSize: 10, color: "rgba(248,244,236,0.4)",
                fontFamily: "var(--font-dm-sans, system-ui)", letterSpacing: "0.03em",
              }}>
                {word.fr}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Succès */}
      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ textAlign: "center" }}
          >
            <p style={{ color: "#D4AF37", fontSize: 22, margin: "0 0 6px", fontFamily: "serif" }}>
              يَعْلَمُونَ
            </p>
            <p style={{ color: "#4ade80", fontSize: 14, margin: 0,
              fontFamily: "var(--font-dm-sans, system-ui)" }}>
              ✓ La lumière jaillit du pupitre…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note pédagogique */}
      {!success && (blank1 || blank2) && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => { setBlank1(null); setBlank2(null); }}
          style={{ color: "rgba(248,244,236,0.3)", fontSize: 11, background: "none",
            border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans, system-ui)" }}
        >
          Recommencer
        </motion.button>
      )}
    </div>
  );
}

// Slot vide ou rempli
function BlankSlot({
  word, onClick, glow,
}: {
  word?: { ar: string };
  onClick?: () => void;
  glow?: boolean;
}) {
  if (!word) {
    return (
      <span style={{
        display: "inline-block",
        minWidth: 80, height: 32,
        borderBottom: "2px solid rgba(212,175,55,0.5)",
        verticalAlign: "middle",
        margin: "0 4px",
      }} />
    );
  }
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={onClick}
      style={{
        display: "inline-block",
        color: glow ? "#D4AF37" : "#4ade80",
        fontWeight: 700, cursor: "pointer",
        textShadow: glow ? "0 0 12px rgba(212,175,55,0.8)" : "none",
        margin: "0 4px", fontSize: 22,
        transition: "color 0.5s, text-shadow 0.5s",
      }}
    >
      {word.ar}
    </motion.span>
  );
}
