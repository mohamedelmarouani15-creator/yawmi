"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { MANUSCRIPTS } from "@/lib/escape/tombouctou";
import CadenasCombination from "./enigmes/CadenasCombination";
import AstrolabeEnigme    from "./enigmes/AstrolabeEnigme";
import CipherDecode       from "./enigmes/CipherDecode";
import CarteDesLumieres   from "./enigmes/CarteDesLumieres";
import VersetFinal        from "./enigmes/VersetFinal";

interface Props {
  manuscriptId: number;
  onSolve:  (id: number) => void;
  onClose:  () => void;
  onError:  () => void;
}

const ENIGME_COMPONENTS = {
  cadenas:   CadenasCombination,
  astrolabe: AstrolabeEnigme,
  cipher:    CipherDecode,
  carte:     CarteDesLumieres,
  verset:    VersetFinal,
} as const;

export default function Enigme({ manuscriptId, onSolve, onClose, onError }: Props) {
  const m    = MANUSCRIPTS[manuscriptId];
  if (!m) return null;

  const EnigmeComp = ENIGME_COMPONENTS[m.enigmaType];

  const handleSolve = useCallback(() => onSolve(manuscriptId), [manuscriptId, onSolve]);

  return (
    <AnimatePresence>
      <motion.div
        key={`enigme-${manuscriptId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(2,6,4,0.88)",
          backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "20px 16px",
          overflowY: "auto",
        }}
      >
        {/* Panneau principal */}
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1,    y: 0  }}
          exit={{ scale: 0.95,    y: 10 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          style={{
            background: "linear-gradient(180deg,#0C1A10 0%,#061A12 100%)",
            border: "1px solid rgba(212,175,55,0.32)",
            borderRadius: 22,
            padding: "28px 24px",
            width: "100%", maxWidth: 420,
            boxShadow: "0 0 60px rgba(212,175,55,0.08), 0 24px 80px rgba(0,0,0,0.6)",
            position: "relative",
          }}
        >
          {/* Fermer */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%", width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(248,244,236,0.4)",
            }}
          >
            <X size={15} />
          </button>

          {/* Header */}
          <div style={{ marginBottom: 22 }}>
            <p style={{
              color: "rgba(212,175,55,0.55)", fontSize: 10,
              letterSpacing: "0.22em", textTransform: "uppercase",
              fontFamily: "var(--font-dm-sans, system-ui)", margin: "0 0 6px",
            }}>
              Manuscrit {manuscriptId + 1} / 5
            </p>
            <h2 style={{
              color: "#D4AF37",
              fontFamily: "var(--font-bricolage, Georgia, serif)",
              fontSize: 18, fontWeight: 700, margin: "0 0 4px",
            }}>
              {m.title}
            </h2>
            <p style={{
              color: "rgba(212,175,55,0.45)", fontSize: 16,
              fontFamily: "serif", margin: 0, direction: "rtl",
            }}>
              {m.titleAr}
            </p>
          </div>

          {/* Énigme */}
          <EnigmeComp
            onSolve={handleSolve}
            onClose={onClose}
            onError={onError}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
