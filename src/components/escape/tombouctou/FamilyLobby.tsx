"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy } from "lucide-react";
import { ROLE_HINTS } from "@/hooks/useTombouctouSession";

interface Props {
  onSolo:        () => void;
  onCreateFamily:(code: string) => void;
  onJoinFamily:  (code: string) => void;
  roleLabel:     string;
  myRole:        number;
  sessionCode:   string | null;
  playerCount:   number;
}

const ROLE_ICONS = ["", "🔒", "🗺️", "📖", "🗝️"];
const ROLE_DESC: Record<number, string> = {
  1: "Tu vois les indices du Cadenas et de l'Astrolabe",
  2: "Tu vois les indices du Chiffre et de la Carte",
  3: "Tu vois l'indice du Verset",
  4: "Tu connais tous les indices — mais tu ne peux que guider",
};

export default function FamilyLobby({
  onSolo, onCreateFamily, onJoinFamily,
  roleLabel, myRole, sessionCode, playerCount,
}: Props) {
  const [mode,     setMode]     = useState<"choose" | "create" | "join">("choose");
  const [joinCode, setJoinCode] = useState("");
  const [copied,   setCopied]   = useState(false);
  const [created,  setCreated]  = useState<string | null>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const handleCreate = useCallback(() => {
    const code = Array.from({ length: 6 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)]
    ).join("");
    setCreated(code);
    setMode("create");
    onCreateFamily(code);
  }, [onCreateFamily]);

  const handleJoin = useCallback(() => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) return;
    onJoinFamily(code);
  }, [joinCode, onJoinFamily]);

  const copyCode = () => {
    if (!created) return;
    navigator.clipboard.writeText(created);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(2,8,4,0.96)", backdropFilter: "blur(4px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 20px",
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          maxWidth: 400, width: "100%",
          background: "linear-gradient(180deg,#0C1A10 0%,#061A12 100%)",
          border: "1px solid rgba(212,175,55,0.32)",
          borderRadius: 22, padding: "28px 24px",
          boxShadow: "0 0 60px rgba(212,175,55,0.08)",
        }}
      >
        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{
            color: "#D4AF37", fontSize: 28, fontFamily: "serif",
            direction: "rtl", margin: "0 0 6px",
          }}>مكتبة تمبكتو</p>
          <h1 style={{
            color: "#F8F4EC", fontSize: 20, fontWeight: 700,
            fontFamily: "var(--font-bricolage, Georgia, serif)", margin: "0 0 4px",
          }}>
            La Bibliothèque de Tombouctou
          </h1>
          <p style={{ color: "rgba(248,244,236,0.4)", fontSize: 12,
            fontFamily: "var(--font-dm-sans, system-ui)", margin: 0 }}>
            30 minutes · 5 manuscrits à sauver
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── CHOIX ─── */}
          {mode === "choose" && (
            <motion.div key="choose"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              <button onClick={onSolo} style={{
                background: "linear-gradient(135deg,#055C3F,#0A8A5C)",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: 14, padding: "16px 20px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14, textAlign: "left",
              }}>
                <span style={{ fontSize: 28 }}>🕯️</span>
                <div>
                  <p style={{ color: "#D4AF37", fontWeight: 700, fontSize: 15,
                    margin: "0 0 2px", fontFamily: "var(--font-bricolage, Georgia, serif)" }}>
                    Jouer en solo
                  </p>
                  <p style={{ color: "rgba(248,244,236,0.5)", fontSize: 12,
                    margin: 0, fontFamily: "var(--font-dm-sans, system-ui)" }}>
                    Tous les indices te sont visibles
                  </p>
                </div>
              </button>

              <button onClick={handleCreate} style={{
                background: "rgba(212,175,55,0.08)",
                border: "1.5px solid rgba(212,175,55,0.45)",
                borderRadius: 14, padding: "16px 20px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14, textAlign: "left",
              }}>
                <span style={{ fontSize: 28 }}>👨‍👩‍👧‍👦</span>
                <div>
                  <p style={{ color: "#D4AF37", fontWeight: 700, fontSize: 15,
                    margin: "0 0 2px", fontFamily: "var(--font-bricolage, Georgia, serif)" }}>
                    Mode Famille
                  </p>
                  <p style={{ color: "rgba(248,244,236,0.5)", fontSize: 12,
                    margin: 0, fontFamily: "var(--font-dm-sans, system-ui)" }}>
                    2-4 joueurs · indices distribués
                  </p>
                </div>
              </button>

              <button onClick={() => setMode("join")} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "12px 20px", cursor: "pointer",
                color: "rgba(248,244,236,0.45)", fontSize: 13,
                fontFamily: "var(--font-dm-sans, system-ui)",
              }}>
                Rejoindre une session existante →
              </button>
            </motion.div>
          )}

          {/* ─── SESSION CRÉÉE ─── */}
          {mode === "create" && created && (
            <motion.div key="create"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div style={{
                background: "rgba(212,175,55,0.07)",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: 16, padding: "16px",
              }}>
                <p style={{ color: "rgba(212,175,55,0.55)", fontSize: 10,
                  letterSpacing: "0.2em", margin: "0 0 8px",
                  fontFamily: "var(--font-dm-sans, system-ui)" }}>
                  CODE DE SESSION — PARTAGE LE À TA FAMILLE
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                  <span style={{ color: "#D4AF37", fontSize: 32, fontWeight: 700,
                    letterSpacing: "0.3em", fontFamily: "monospace" }}>
                    {created}
                  </span>
                  <button onClick={copyCode} style={{
                    background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                    color: copied ? "#4ade80" : "#D4AF37",
                  }}>
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {/* Rôle */}
              <div style={{
                background: "rgba(5,92,63,0.12)", borderRadius: 12,
                border: "1px solid rgba(5,92,63,0.3)", padding: "12px 14px",
              }}>
                <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 700,
                  margin: "0 0 4px", fontFamily: "var(--font-dm-sans, system-ui)" }}>
                  {ROLE_ICONS[myRole]} Ton rôle : {roleLabel}
                </p>
                <p style={{ color: "rgba(248,244,236,0.5)", fontSize: 11, margin: 0,
                  fontFamily: "var(--font-dm-sans, system-ui)" }}>
                  {ROLE_DESC[myRole]}
                </p>
              </div>

              {/* Joueurs connectés */}
              <p style={{ color: "rgba(248,244,236,0.4)", fontSize: 12, textAlign: "center",
                fontFamily: "var(--font-dm-sans, system-ui)" }}>
                {playerCount} gardien{playerCount > 1 ? "s" : ""} connecté{playerCount > 1 ? "s" : ""}…
              </p>

              <button onClick={onSolo} style={{
                background: "linear-gradient(135deg,#055C3F,#0A8A5C)",
                border: "1px solid rgba(212,175,55,0.3)", borderRadius: 999,
                padding: "13px 20px", cursor: "pointer",
                color: "#D4AF37", fontWeight: 700, fontSize: 14,
                letterSpacing: "0.08em", fontFamily: "var(--font-dm-sans, system-ui)",
              }}>
                Commencer la mission →
              </button>
            </motion.div>
          )}

          {/* ─── REJOINDRE ─── */}
          {mode === "join" && (
            <motion.div key="join"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <p style={{ color: "rgba(212,175,55,0.5)", fontSize: 12, margin: 0,
                fontFamily: "var(--font-dm-sans, system-ui)" }}>
                Entrez le code partagé par le créateur de la session
              </p>

              <input
                ref={inputRef}
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                onKeyDown={e => e.key === "Enter" && handleJoin()}
                placeholder="ABCDEF"
                autoCapitalize="characters"
                autoFocus
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1.5px solid rgba(212,175,55,0.3)",
                  borderRadius: 12, padding: "12px 16px",
                  color: "#D4AF37", fontSize: 24, fontWeight: 700,
                  letterSpacing: "0.35em", textAlign: "center",
                  fontFamily: "monospace", outline: "none", width: "100%",
                  boxSizing: "border-box",
                }}
              />

              <button onClick={handleJoin} disabled={joinCode.length !== 6}
                style={{
                  background: joinCode.length === 6
                    ? "linear-gradient(135deg,#055C3F,#0A8A5C)"
                    : "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(212,175,55,0.3)", borderRadius: 999,
                  padding: "13px 20px", cursor: joinCode.length === 6 ? "pointer" : "default",
                  color: joinCode.length === 6 ? "#D4AF37" : "rgba(248,244,236,0.2)",
                  fontWeight: 700, fontSize: 14, letterSpacing: "0.08em",
                  fontFamily: "var(--font-dm-sans, system-ui)",
                }}>
                Rejoindre la mission
              </button>

              <button onClick={() => setMode("choose")}
                style={{ color: "rgba(248,244,236,0.3)", background: "none",
                  border: "none", cursor: "pointer", fontSize: 12,
                  fontFamily: "var(--font-dm-sans, system-ui)" }}>
                ← Retour
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
