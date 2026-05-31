"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Message codé : chaque lettre avancée de +3
const ENCODED  = "OH VDYRLU HVW OXPLHUH";
const ANSWER   = "LE SAVOIR EST LUMIERE";

function normalize(s: string) {
  return s.toUpperCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z ]/g, "");
}

interface Props {
  onSolve: () => void;
  onClose: () => void;
  onError: () => void;
}

export default function CipherDecode({ onSolve, onClose, onError }: Props) {
  const [input,     setInput]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const errorRef = useRef(false);

  const validate = () => {
    setAttempted(true);
    if (normalize(input) === ANSWER) {
      setSuccess(true);
      setTimeout(onSolve, 1000);
    } else {
      if (!errorRef.current) {
        errorRef.current = true;
        onError();
        setTimeout(() => { errorRef.current = false; }, 2000);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 380, width: "100%" }}>
      {/* Tablette avec message codé */}
      <div style={{
        background: "rgba(30,18,6,0.9)",
        border: "1px solid rgba(200,168,75,0.4)",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "inset 0 2px 12px rgba(0,0,0,0.4)",
      }}>
        <p style={{ color: "rgba(212,175,55,0.45)", fontSize: 10, letterSpacing: "0.2em",
          fontFamily: "var(--font-dm-sans, system-ui)", margin: "0 0 10px" }}>
          MESSAGE CODÉ SUR LA TABLETTE
        </p>
        <p style={{
          color: "#D4AF37",
          fontFamily: "monospace", fontSize: 22, letterSpacing: "0.22em",
          margin: 0, textAlign: "center",
        }}>
          {ENCODED}
        </p>
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: "1px solid rgba(212,175,55,0.15)",
        }}>
          <p style={{ color: "rgba(212,175,55,0.55)", fontSize: 12, margin: 0,
            fontStyle: "italic", fontFamily: "Georgia, serif", lineHeight: 1.5 }}>
            Note du sage Al-Kindi : <em>« Chaque lettre a avancé de 3. Recule-la. »</em>
          </p>
        </div>
      </div>

      {/* Aide décodage visuel */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {["D→A","E→B","F→C","…","H→E","O→L"].map(pair => (
          <span key={pair} style={{
            fontSize: 11, color: "rgba(212,175,55,0.45)",
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.12)",
            borderRadius: 6, padding: "3px 8px",
            fontFamily: "monospace",
          }}>{pair}</span>
        ))}
      </div>

      {/* Champ de saisie */}
      <div>
        <p style={{ color: "rgba(248,244,236,0.4)", fontSize: 11, letterSpacing: "0.15em",
          fontFamily: "var(--font-dm-sans, system-ui)", margin: "0 0 8px" }}>
          VOTRE DÉCODAGE
        </p>
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setAttempted(false); }}
          onKeyDown={e => e.key === "Enter" && validate()}
          placeholder="Tapez le message décodé…"
          autoCapitalize="characters"
          disabled={success}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "rgba(255,255,255,0.04)",
            border: `1.5px solid ${attempted && !success ? "rgba(248,113,113,0.5)" : "rgba(212,175,55,0.3)"}`,
            borderRadius: 12, padding: "12px 16px",
            color: "#F8F4EC", fontSize: 16, letterSpacing: "0.08em",
            fontFamily: "monospace", outline: "none",
          }}
        />
      </div>

      {/* Erreur / Succès */}
      <AnimatePresence mode="wait">
        {success && (
          <motion.p key="ok" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
            style={{ color: "#4ade80", fontSize: 16, textAlign: "center", margin: 0 }}>
            ✓ LE SAVOIR EST LUMIÈRE
          </motion.p>
        )}
        {attempted && !success && (
          <motion.p key="err" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ color: "#f87171", fontSize: 12, textAlign: "center", margin: 0,
              fontFamily: "var(--font-dm-sans, system-ui)" }}>
            Ce n'est pas la bonne réponse…{" "}
            {!showHint2 && (
              <button onClick={() => setShowHint2(true)}
                style={{ color: "rgba(212,175,55,0.5)", background: "none", border: "none",
                  cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>
                Indice ?
              </button>
            )}
          </motion.p>
        )}
        {showHint2 && (
          <motion.p key="h2" initial={{opacity:0}} animate={{opacity:1}}
            style={{ color: "rgba(212,175,55,0.6)", fontSize: 12, textAlign: "center", margin: 0,
              fontStyle: "italic", fontFamily: "Georgia, serif" }}>
            Premier mot : L (O-3) E (H-3) …
          </motion.p>
        )}
      </AnimatePresence>

      {/* Bouton valider */}
      {!success && (
        <motion.button onClick={validate} whileTap={{ scale: 0.95 }}
          style={{
            background: "linear-gradient(135deg,#055C3F,#0A8A5C)",
            border: "1px solid rgba(212,175,55,0.35)",
            borderRadius: 999, padding: "12px 32px",
            color: "#D4AF37", fontWeight: 700, fontSize: 14,
            letterSpacing: "0.1em", cursor: "pointer",
            fontFamily: "var(--font-dm-sans, system-ui)",
          }}>
          VALIDER
        </motion.button>
      )}
    </div>
  );
}
