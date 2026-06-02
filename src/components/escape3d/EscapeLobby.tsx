"use client";

import { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ArrowLeft } from "lucide-react";
import * as THREE from "three";
import LobbyScene from "./LobbyScene";
import { useEscapeLobby, SLOT_COLORS } from "@/hooks/useEscapeLobby";

// ── Génération d'un code de session ──────────────────────────────────
export function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Props ─────────────────────────────────────────────────────────────
interface Props {
  sessionCode: string;
  playerName:  string;
  onStart:     () => void;   // déclenché quand le countdown atteint 0
  onLeave:     () => void;   // bouton retour
}

// ── Composant principal ───────────────────────────────────────────────
export default function EscapeLobby({ sessionCode, playerName, onStart, onLeave }: Props) {
  const { players, mySlot, isReady, allReady, countdown, setReady, leave } = useEscapeLobby(sessionCode, playerName);
  const [copied, setCopied] = useState(false);

  // Quand countdown atteint 0 → démarrer le jeu
  if (countdown === 0) {
    onStart();
  }

  const handleLeave = useCallback(() => {
    leave();
    onLeave();
  }, [leave, onLeave]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(sessionCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sessionCode]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#030C06", overflow: "hidden" }}>

      {/* Scène 3D en fond */}
      <Canvas
        camera={{ position: [0, 4.5, 7], fov: 55, near: 0.1, far: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        shadows
        style={{ position: "absolute", inset: 0 }}
      >
        <LobbyScene players={players} countdown={countdown} />
      </Canvas>

      {/* Overlay UI */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", flexDirection: "column" }}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "calc(16px + env(safe-area-inset-top)) 20px 12px",
          background: "linear-gradient(180deg, rgba(3,12,6,0.92) 0%, transparent 100%)",
          pointerEvents: "auto",
        }}>
          <motion.button
            onClick={handleLeave}
            whileTap={{ scale: 0.9 }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(0,0,0,0.5)", border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: 20, padding: "8px 14px", color: "var(--gold)",
              fontFamily: "var(--font-dm-sans)", fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              backdropFilter: "blur(8px)", cursor: "pointer",
            }}
          >
            <ArrowLeft size={13} />
            Quitter
          </motion.button>

          {/* Titre */}
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "rgba(248,244,236,0.65)", fontSize: 10, fontFamily: "var(--font-dm-sans)",
              letterSpacing: "0.16em", textTransform: "uppercase", margin: 0 }}>
              Salle d&apos;attente
            </p>
            <p style={{ color: "var(--text)", fontSize: 13, fontWeight: 700,
              fontFamily: "var(--font-bricolage)", margin: "2px 0 0" }}>
              Bibliothèque de Tombouctou
            </p>
          </div>

          {/* Code session — tappable pour copier */}
          <motion.button
            onClick={copyCode}
            whileTap={{ scale: 0.92 }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)",
              borderRadius: 12, padding: "8px 12px", cursor: "pointer",
            }}
          >
            <span style={{ color: "#D4AF37", fontSize: 15, fontWeight: 800,
              fontFamily: "var(--font-bricolage)", letterSpacing: "0.12em" }}>
              {sessionCode}
            </span>
            {copied
              ? <Check size={12} style={{ color: "#22c55e" }} />
              : <Copy size={12} style={{ color: "rgba(212,175,55,0.6)" }} />
            }
          </motion.button>
        </div>

        {/* ── Spacer — laisse voir la scène 3D ────────────────────── */}
        <div style={{ flex: 1 }} />

        {/* ── Panel bas ────────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(0deg, rgba(3,12,6,0.97) 0%, rgba(3,12,6,0.7) 100%)",
          padding: "16px 20px calc(24px + env(safe-area-inset-bottom))",
          pointerEvents: "auto",
        }}>
          {/* Slots joueurs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {([0, 1, 2, 3] as const).map(slot => {
              const player = players.find(p => p.slot === slot);
              const color = SLOT_COLORS[slot];
              return (
                <div key={slot} style={{
                  flex: 1, borderRadius: 12, padding: "8px 6px",
                  background: player ? `${color}12` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${player ? `${color}40` : "rgba(255,255,255,0.06)"}`,
                  textAlign: "center", minWidth: 0,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: player ? color : "rgba(255,255,255,0.08)",
                    margin: "0 auto 4px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {player?.ready && <span style={{ fontSize: 10 }}>✓</span>}
                  </div>
                  <p style={{
                    color: player ? "var(--text)" : "rgba(255,255,255,0.2)",
                    fontSize: 9, fontWeight: 600, margin: 0,
                    fontFamily: "var(--font-dm-sans)", letterSpacing: "0.06em",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {player ? player.name : "—"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Aide / code */}
          <p style={{ color: "rgba(248,244,236,0.35)", fontSize: 10, textAlign: "center",
            fontFamily: "var(--font-dm-sans)", marginBottom: 14,
            letterSpacing: "0.08em" }}>
            Partage le code <span style={{ color: "rgba(212,175,55,0.7)", fontWeight: 700 }}>{sessionCode}</span> à ta famille pour jouer ensemble
          </p>

          {/* Bouton PRÊT */}
          {!isReady ? (
            <motion.button
              onClick={setReady}
              whileTap={{ scale: 0.96 }}
              style={{
                width: "100%", height: 52, borderRadius: 26,
                background: "linear-gradient(135deg, #15803d, #16a34a)",
                border: "none", cursor: "pointer",
                color: "#F8F4EC", fontSize: 15, fontWeight: 800,
                fontFamily: "var(--font-bricolage)", letterSpacing: "2px",
                textTransform: "uppercase",
                boxShadow: "0 0 24px rgba(22,163,74,0.4)",
              }}
            >
              ✓ Je suis prêt
            </motion.button>
          ) : (
            <div style={{
              width: "100%", height: 52, borderRadius: 26,
              background: "rgba(22,163,74,0.12)",
              border: "1px solid rgba(22,163,74,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#22c55e",
                animation: "esc-pulse 1.4s ease-in-out infinite",
              }} />
              <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 600, margin: 0,
                fontFamily: "var(--font-dm-sans)", letterSpacing: "0.1em" }}>
                {allReady ? "Lancement…" : "En attente des autres…"}
              </p>
              <style>{`@keyframes esc-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(0.7)} }`}</style>
            </div>
          )}
        </div>
      </div>

      {/* ── Countdown overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            key={`cd-${countdown}`}
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            exit={{   scale: 0.6,  opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "absolute", inset: 0, zIndex: 50,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "rgba(3,12,6,0.75)", pointerEvents: "none",
            }}
          >
            <motion.span
              style={{
                fontSize: 120, fontWeight: 900, color: "#D4AF37",
                fontFamily: "var(--font-bricolage)", lineHeight: 1,
                textShadow: "0 0 60px rgba(212,175,55,0.8)",
              }}
            >
              {countdown}
            </motion.span>
            <p style={{ color: "rgba(248,244,236,0.6)", fontSize: 14, marginTop: 12,
              fontFamily: "var(--font-dm-sans)", letterSpacing: "0.2em",
              textTransform: "uppercase" }}>
              La bibliothèque s&apos;ouvre…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
