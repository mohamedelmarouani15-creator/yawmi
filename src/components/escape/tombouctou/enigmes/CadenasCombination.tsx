"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Alphabet arabe (28 lettres)
const LETTERS = [
  "ا","ب","ت","ث","ج","ح","خ","د","ذ","ر",
  "ز","س","ش","ص","ض","ط","ظ","ع","غ","ف",
  "ق","ك","ل","م","ن","ه","و","ي",
];
// Réponse : ع (17) ل (22) م (23)
const ANSWER = [17, 22, 23];

interface WheelProps {
  selectedIdx: number;
  onChange: (idx: number) => void;
  isCorrect: boolean;
}

function LetterWheel({ selectedIdx, onChange, isCorrect }: WheelProps) {
  const touchStartY = useRef(0);

  const prev = () => onChange((selectedIdx - 1 + LETTERS.length) % LETTERS.length);
  const next = () => onChange((selectedIdx + 1) % LETTERS.length);

  const above = (offset: number) =>
    LETTERS[(selectedIdx - offset + LETTERS.length) % LETTERS.length];
  const below = (offset: number) =>
    LETTERS[(selectedIdx + offset) % LETTERS.length];

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 2, userSelect: "none",
      }}
      onTouchStart={e => { touchStartY.current = e.touches[0].clientY; }}
      onTouchEnd={e => {
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (dy > 15) prev();
        else if (dy < -15) next();
      }}
    >
      {/* Lettre above-2 */}
      <span style={{ fontSize: 18, opacity: 0.18, color: "#D4AF37", fontFamily: "serif", lineHeight: 1 }}>
        {above(2)}
      </span>
      {/* Lettre above-1 */}
      <span style={{ fontSize: 24, opacity: 0.38, color: "#D4AF37", fontFamily: "serif", lineHeight: 1 }}>
        {above(1)}
      </span>

      {/* Bouton haut */}
      <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer",
        color: "rgba(212,175,55,0.5)", fontSize: 18, lineHeight: 1, padding: "2px 8px" }}>
        ▲
      </button>

      {/* Lettre sélectionnée */}
      <div style={{
        width: 64, height: 64,
        borderRadius: 12,
        border: `2px solid ${isCorrect ? "#4ade80" : "rgba(212,175,55,0.7)"}`,
        background: isCorrect ? "rgba(74,222,128,0.12)" : "rgba(212,175,55,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: isCorrect ? "0 0 16px rgba(74,222,128,0.3)" : "0 0 12px rgba(212,175,55,0.15)",
        transition: "all 0.3s",
      }}>
        <span style={{ fontSize: 36, color: isCorrect ? "#4ade80" : "#D4AF37",
          fontFamily: "serif", direction: "rtl" }}>
          {LETTERS[selectedIdx]}
        </span>
      </div>

      {/* Bouton bas */}
      <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer",
        color: "rgba(212,175,55,0.5)", fontSize: 18, lineHeight: 1, padding: "2px 8px" }}>
        ▼
      </button>

      {/* Lettres below */}
      <span style={{ fontSize: 24, opacity: 0.38, color: "#D4AF37", fontFamily: "serif", lineHeight: 1 }}>
        {below(1)}
      </span>
      <span style={{ fontSize: 18, opacity: 0.18, color: "#D4AF37", fontFamily: "serif", lineHeight: 1 }}>
        {below(2)}
      </span>
    </div>
  );
}

interface Props {
  onSolve: () => void;
  onClose: () => void;
  onError: () => void;
}

export default function CadenasCombination({ onSolve, onClose, onError }: Props) {
  const [indices, setIndices] = useState([0, 0, 0]);
  const [attempted, setAttempted] = useState(false);
  const [success, setSuccess] = useState(false);
  const errorRef = useRef(false);

  const setIdx = useCallback((col: number, val: number) => {
    setIndices(prev => {
      const next = [...prev];
      next[col] = val;
      return next;
    });
  }, []);

  const isColCorrect = (col: number) => indices[col] === ANSWER[col];

  const validate = () => {
    setAttempted(true);
    const ok = indices.every((v, i) => v === ANSWER[i]);
    if (ok) {
      setSuccess(true);
      setTimeout(onSolve, 1200);
    } else {
      if (!errorRef.current) { errorRef.current = true; onError(); }
      setTimeout(() => { errorRef.current = false; }, 2000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "center" }}>
      {/* Indice */}
      <div style={{
        background: "rgba(212,175,55,0.06)", borderRadius: 12,
        border: "1px solid rgba(212,175,55,0.18)", padding: "12px 18px",
        maxWidth: 340, textAlign: "center",
      }}>
        <p style={{ color: "rgba(212,175,55,0.7)", fontSize: 13, fontStyle: "italic",
          fontFamily: "Georgia, serif", lineHeight: 1.65, margin: 0 }}>
          « Je suis ce que les prophètes ont transmis, ce que les savants ont préservé,
          ce que les tyrans ont toujours craint. »
        </p>
      </div>

      {/* Label */}
      <p style={{ color: "rgba(248,244,236,0.45)", fontSize: 12, letterSpacing: "0.15em",
        fontFamily: "var(--font-dm-sans, system-ui)", margin: 0 }}>
        TROUVEZ LES 3 LETTRES · DE DROITE À GAUCHE
      </p>

      {/* 3 roues (ordre RTL : col 2, col 1, col 0) */}
      <div style={{ display: "flex", gap: 24, direction: "rtl" }}>
        {[0, 1, 2].map(col => (
          <LetterWheel
            key={col}
            selectedIdx={indices[col]}
            onChange={v => setIdx(col, v)}
            isCorrect={attempted && isColCorrect(col)}
          />
        ))}
      </div>

      {/* Résultat composé */}
      <div style={{ display: "flex", gap: 6, direction: "rtl", alignItems: "center" }}>
        {[0, 1, 2].map(col => (
          <span key={col} style={{
            fontSize: 28, color: "#D4AF37", fontFamily: "serif",
            opacity: indices[col] === 0 ? 0.3 : 1,
          }}>
            {LETTERS[indices[col]]}
          </span>
        ))}
      </div>

      {/* Bouton Valider */}
      {!success ? (
        <motion.button
          onClick={validate}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "linear-gradient(135deg,#055C3F,#0A8A5C)",
            border: "1px solid rgba(212,175,55,0.35)",
            borderRadius: 999, padding: "12px 36px",
            color: "#D4AF37", fontWeight: 700, fontSize: 14,
            letterSpacing: "0.1em", cursor: "pointer",
            fontFamily: "var(--font-dm-sans, system-ui)",
          }}
        >
          VALIDER
        </motion.button>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: "center" }}
        >
          <p style={{ color: "#4ade80", fontSize: 22, margin: 0 }}>✓ عِلْم</p>
          <p style={{ color: "rgba(248,244,236,0.5)", fontSize: 12, marginTop: 4,
            fontFamily: "var(--font-dm-sans, system-ui)" }}>
            Le cadenas s'ouvre…
          </p>
        </motion.div>
      )}

      {/* Erreur */}
      <AnimatePresence>
        {attempted && !success && indices.some((v, i) => v !== ANSWER[i]) && (
          <motion.p
            key="err"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ color: "#f87171", fontSize: 12, margin: 0,
              fontFamily: "var(--font-dm-sans, system-ui)" }}
          >
            Ce n'est pas la bonne combinaison…
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
