"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { MANUSCRIPTS } from "@/lib/escape/tombouctou";

interface Props {
  manuscriptId: number;
  onClose:      () => void;
}

// Voix du sage — révèle l'enseignement après résolution
function speakTeaching(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utt       = new SpeechSynthesisUtterance(text);
  utt.lang        = "fr-FR";
  utt.pitch       = 0.75;
  utt.rate        = 0.80;
  utt.volume      = 0.88;
  const voices    = synth.getVoices();
  const v         = voices.find(v => v.lang.startsWith("fr")) ?? null;
  if (v) utt.voice = v;
  synth.speak(utt);
}

export default function KnowledgeReveal({ manuscriptId, onClose }: Props) {
  const m = MANUSCRIPTS[manuscriptId];
  if (!m) return null;

  useEffect(() => {
    speakTeaching(m.teaching);
    return () => { window.speechSynthesis?.cancel(); };
  }, [m.teaching]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 250,
        background: "rgba(1,4,2,0.92)",
        backdropFilter: "blur(12px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px 20px",
      }}
    >
      {/* Particules dorées (CSS animation) */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({length: 20}).map((_,i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: "100vh", x: `${Math.random()*100}vw` }}
            animate={{ opacity: [0, 0.8, 0], y: "-20vh" }}
            transition={{ delay: i * 0.12, duration: 2.5 + Math.random() }}
            style={{
              position: "absolute",
              width: 4 + Math.random()*4, height: 4 + Math.random()*4,
              borderRadius: "50%",
              background: "#D4AF37",
              boxShadow: "0 0 6px #D4AF37",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 22, stiffness: 260 }}
        style={{
          maxWidth: 420, width: "100%",
          background: "linear-gradient(180deg,#0F1E12 0%,#061A12 100%)",
          border: "1px solid rgba(212,175,55,0.45)",
          borderRadius: 24, padding: "32px 28px",
          boxShadow: "0 0 80px rgba(212,175,55,0.12), 0 32px 100px rgba(0,0,0,0.7)",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Badge manuscrit sauvé */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(212,175,55,0.1)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 14 }}>📜</span>
          <span style={{ color: "#D4AF37", fontSize: 11, letterSpacing: "0.18em",
            fontFamily: "var(--font-dm-sans, system-ui)", fontWeight: 600 }}>
            MANUSCRIT SAUVÉ
          </span>
        </motion.div>

        {/* Titre arabe */}
        {m.teachingAr && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: 48, color: "#D4AF37", fontFamily: "serif",
              direction: "rtl", margin: "0 0 8px",
              textShadow: "0 0 20px rgba(212,175,55,0.4)",
            }}
          >
            {m.teachingAr}
          </motion.p>
        )}

        {/* Titre du manuscrit */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            color: "#D4AF37", fontSize: 18, fontWeight: 700, margin: "0 0 20px",
            fontFamily: "var(--font-bricolage, Georgia, serif)",
          }}
        >
          {m.title}
        </motion.h3>

        {/* Enseignement */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            color: "rgba(248,244,236,0.78)",
            fontSize: 14, lineHeight: 1.75,
            fontFamily: "Georgia, serif",
            whiteSpace: "pre-line",
            margin: "0 0 28px",
          }}
        >
          {m.teaching}
        </motion.p>

        {/* Numéro */}
        <p style={{
          color: "rgba(212,175,55,0.35)", fontSize: 11, letterSpacing: "0.15em",
          fontFamily: "var(--font-dm-sans, system-ui)", margin: "0 0 20px",
        }}>
          Manuscrit {manuscriptId + 1} sur 5
        </p>

        {/* Bouton */}
        <motion.button
          onClick={onClose}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: "linear-gradient(135deg,#055C3F,#0A8A5C)",
            border: "1px solid rgba(212,175,55,0.4)",
            borderRadius: 999, padding: "13px 40px",
            color: "#D4AF37", fontWeight: 700, fontSize: 13,
            letterSpacing: "0.12em", cursor: "pointer",
            fontFamily: "var(--font-dm-sans, system-ui)",
          }}
        >
          {manuscriptId < 4 ? "CONTINUER LA QUÊTE →" : "DERNIER MANUSCRIT →"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
