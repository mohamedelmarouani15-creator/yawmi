"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import type { PuzzleDef } from "@/lib/escape3d/types";

interface Props {
  puzzle:   PuzzleDef;
  onSolve:  () => void;
  onClose:  () => void;
}

// Icône par salle / type d'objet
const TYPE_ICON: Record<PuzzleDef["type"], string> = {
  arabic_word:   "✍️",
  quran_verse:   "📖",
  history:       "🏛️",
  calligraphy:   "🖊️",
};

const OBJECT_VISUAL: Record<string, { emoji: string; label: string }> = {
  lantern_bismillah: { emoji: "🪔", label: "Lanterne en laiton doré" },
  library_iqra:      { emoji: "📜", label: "Manuscrit enluminé" },
  salon_sabr:        { emoji: "🖼️", label: "Panneau de calligraphie" },
  cuisine_honey:     { emoji: "🍯", label: "Jarre de miel ancestrale" },
  hammam_taharah:    { emoji: "💎", label: "Plaque de marbre gravée" },
};

export default function ObjectCloseup({ puzzle, onSolve, onClose }: Props) {
  const visual = OBJECT_VISUAL[puzzle.id] ?? { emoji: "🔮", label: "Objet mystérieux" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(2,6,5,0.92)", backdropFilter: "blur(8px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-end",
        paddingBottom: 0,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        style={{
          width: "100%", maxWidth: 480,
          borderRadius: "28px 28px 0 0",
          background: "linear-gradient(180deg,#0E1A14 0%,#061A12 100%)",
          border: "1px solid rgba(212,175,55,0.2)",
          borderBottom: "none",
          overflow: "hidden",
        }}
      >
        {/* Objet en gros plan */}
        <div style={{
          background: "radial-gradient(ellipse at center, rgba(212,175,55,0.1) 0%, transparent 70%)",
          padding: "40px 0 28px",
          textAlign: "center",
          borderBottom: "1px solid rgba(212,175,55,0.1)",
        }}>
          {/* Halo animé */}
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <span style={{ fontSize: 44 }}>{visual.emoji}</span>
          </motion.div>

          <p style={{
            color: "rgba(212,175,55,0.7)", fontSize: 10, letterSpacing: "0.2em",
            textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", marginBottom: 6,
          }}>
            {TYPE_ICON[puzzle.type]} {visual.label}
          </p>
          <h2 style={{
            color: "#F8F4EC", fontSize: 19, fontWeight: 700,
            fontFamily: "var(--font-bricolage)", margin: 0, padding: "0 24px",
          }}>
            {puzzle.title}
          </h2>
        </div>

        {/* Description */}
        <div style={{ padding: "22px 24px 28px" }}>
          <p style={{
            color: "rgba(248,244,236,0.65)", fontSize: 14, lineHeight: 1.65,
            fontFamily: "var(--font-dm-sans)", marginBottom: 28,
          }}>
            {puzzle.description}
          </p>

          {/* Récompense */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 16px", borderRadius: 12, marginBottom: 22,
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.12)",
          }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <p style={{
              color: "rgba(212,175,55,0.8)", fontSize: 12,
              fontFamily: "var(--font-dm-sans)", margin: 0,
            }}>
              +{puzzle.xpReward} XP si tu résous ce cadenas
            </p>
          </div>

          {/* Boutons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: "14px 0", borderRadius: 99, flex: 0.42,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(248,244,236,0.5)", fontSize: 13,
                fontFamily: "var(--font-dm-sans)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <X size={14} />
              Fermer
            </button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onSolve}
              style={{
                padding: "14px 0", borderRadius: 99, flex: 1,
                background: "linear-gradient(135deg,#D4AF37,#8B6914)",
                border: "none", color: "#0A0F0D",
                fontSize: 14, fontWeight: 700,
                fontFamily: "var(--font-dm-sans)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 0 20px rgba(212,175,55,0.25)",
              }}
            >
              <Search size={15} />
              Résoudre le cadenas
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
