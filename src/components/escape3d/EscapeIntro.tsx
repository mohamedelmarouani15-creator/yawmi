"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Star } from "lucide-react";
import { REWARD } from "@/lib/escape3d/riad-progress";

interface Props { onStart: () => void; }

export default function EscapeIntro({ onStart }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "absolute", inset: 0, zIndex: 30,
        background: "linear-gradient(180deg,#020608 0%,#061A12 60%,#040810 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 28px",
        overflowY: "auto",
      }}
    >
      {/* Étoiles décoratives */}
      {[...Array(18)].map((_, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
          style={{
            position: "absolute",
            top: `${8 + (i * 17) % 45}%`,
            left: `${(i * 23) % 90}%`,
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            borderRadius: "50%",
            background: "var(--gold)",
            opacity: 0.3,
          }}
        />
      ))}

      {/* Arabesque top */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{
          color: "var(--gold)", fontSize: 28,
          fontFamily: "var(--font-amiri)", opacity: 0.85,
          letterSpacing: "0.04em",
        }}>
          رياض الحكمة
        </p>
        <div style={{ width: 60, height: 1, background: "rgba(212,175,55,0.3)", margin: "10px auto" }} />
      </div>

      {/* Titre */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{
          color: "var(--text)", fontSize: 24, fontWeight: 700, textAlign: "center",
          fontFamily: "var(--font-bricolage)", marginBottom: 6, lineHeight: 1.25,
        }}
      >
        Le Riad des Secrets
      </motion.h1>

      <p style={{
        color: "rgba(212,175,55,0.65)", fontSize: 10, letterSpacing: "0.22em",
        textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", marginBottom: 28,
      }}>
        Escape Game · Riad marocain
      </p>

      {/* Mise en scène */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        style={{
          background: "rgba(212,175,55,0.05)",
          border: "1px solid rgba(212,175,55,0.18)",
          borderRadius: 20, padding: "20px 22px", marginBottom: 28,
          maxWidth: 380,
        }}
      >
        <p style={{
          color: "rgba(248,244,236,0.78)", fontSize: 13.5, lineHeight: 1.7,
          fontFamily: "var(--font-dm-sans)", textAlign: "center",
        }}>
          Un vieux sage t'a confié la clé de son riad avant de disparaître.
          Cinq cadenas verrouillent le secret de sa bibliothèque.{" "}
          <span style={{ color: "var(--gold)" }}>Explore chaque pièce</span>,
          résous les énigmes arabes et{" "}
          <span style={{ color: "var(--gold)" }}>libère le savoir caché</span>.
        </p>
      </motion.div>

      {/* Infos partie */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{ display: "flex", gap: 14, marginBottom: 36, width: "100%", maxWidth: 360 }}
      >
        <div style={{
          flex: 1, padding: "14px 10px", borderRadius: 14, textAlign: "center",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <Clock size={18} style={{ color: "var(--gold)", margin: "0 auto 6px", display: "block" }} />
          <p style={{ color: "var(--text)", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-dm-sans)", margin: "0 0 2px" }}>
            45 min
          </p>
          <p style={{ color: "rgba(248,244,236,0.38)", fontSize: 10, fontFamily: "var(--font-dm-sans)", margin: 0 }}>
            Limite de temps
          </p>
        </div>
        <div style={{
          flex: 1, padding: "14px 10px", borderRadius: 14, textAlign: "center",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <p style={{ color: "var(--text)", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-dm-sans)", margin: "0 0 2px" }}>
            5 énigmes
          </p>
          <p style={{ color: "rgba(248,244,236,0.38)", fontSize: 10, fontFamily: "var(--font-dm-sans)", margin: 0 }}>
            Arabe · Islam · Histoire
          </p>
        </div>
        <div style={{
          flex: 1, padding: "14px 10px", borderRadius: 14, textAlign: "center",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <Star size={18} style={{ color: "var(--gold)", margin: "0 auto 6px", display: "block" }} />
          <p style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-dm-sans)", margin: "0 0 2px" }}>
            +{REWARD.xp} XP
          </p>
          <p style={{ color: "rgba(248,244,236,0.38)", fontSize: 10, fontFamily: "var(--font-dm-sans)", margin: 0 }}>
            +{REWARD.coins} 🪙 · {REWARD.chests} 📦
          </p>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        style={{ display: "flex", gap: 20, marginBottom: 36, justifyContent: "center" }}
      >
        {[
          { icon: "👆", text: "Swipe pour regarder" },
          { icon: "🚪", text: "Tape les portes pour entrer" },
          { icon: "✨", text: "Tap les objets pour résoudre" },
        ].map(({ icon, text }) => (
          <div key={text} style={{ textAlign: "center", maxWidth: 80 }}>
            <p style={{ fontSize: 22, margin: "0 0 6px" }}>{icon}</p>
            <p style={{
              color: "rgba(248,244,236,0.45)", fontSize: 10,
              fontFamily: "var(--font-dm-sans)", lineHeight: 1.4, margin: 0,
            }}>
              {text}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Bouton */}
      <motion.button
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 280, damping: 22 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        style={{
          width: "100%", maxWidth: 340, padding: "17px 0",
          borderRadius: 99, cursor: "pointer", border: "none",
          background: "linear-gradient(135deg,#D4AF37,#8B6914)",
          color: "var(--bg)", fontSize: 15, fontWeight: 700,
          fontFamily: "var(--font-dm-sans)", letterSpacing: "0.04em",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: "0 0 32px rgba(212,175,55,0.35)",
        }}
      >
        Commencer l&apos;enquête
        <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  );
}
