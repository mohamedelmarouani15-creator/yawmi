"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MANUSCRIPTS } from "@/lib/escape/tombouctou";
import { gameStorage } from "@/lib/game/game-storage";

interface Props {
  timeRemaining: number;  // secondes restantes au moment de la victoire
  hintsUsed:     number;
  onReplay:      () => void;
}

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
}

const VICTORY_VOICE =
  "Alhamdulillah. Ces manuscrits rejoignent maintenant votre bibliothèque. " +
  "La connaissance que vous avez protégée cette nuit ne périra plus jamais. " +
  "Tombouctou vous remercie.";

function speakVictory() {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(VICTORY_VOICE);
  utt.lang = "fr-FR"; utt.pitch = 0.72; utt.rate = 0.78; utt.volume = 0.92;
  const v = synth.getVoices().find(v => v.lang.startsWith("fr"));
  if (v) utt.voice = v;
  synth.speak(utt);
}

// Icônes par manuscrit
const ICONS = ["🔒","⚙️","🔐","🗺️","📖"];
const COLORS = [
  "#C8A84B","#1A5C8A","#8A3A20","#2A6A3A","#5A2A8A",
];

export default function VictorySequence({ timeRemaining, hintsUsed, onReplay }: Props) {
  const [phase,       setPhase]       = useState(0);   // 0=cinematic, 1=results
  const [cinPhase,    setCinPhase]    = useState(0);   // 0→5 timed phases
  const [addedToMosq, setAddedToMosq]= useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const add = (fn: () => void, ms: number) => { timers.push(setTimeout(fn, ms)); };

    add(() => setCinPhase(1), 200);   // lights gold (via parent ref)
    add(() => setCinPhase(2), 2000);  // camera rises
    add(() => setCinPhase(3), 3000);  // calligraphy
    add(() => setCinPhase(4), 4500);  // score
    add(() => { setCinPhase(5); speakVictory(); }, 5000);
    add(() => setPhase(1), 8000);     // résultats

    return () => { timers.forEach(clearTimeout); window.speechSynthesis?.cancel(); };
  }, []);

  const addToMosquee = useCallback(() => {
    gameStorage.unlockTombouctouRewards();
    gameStorage.push(); // sync vers Supabase après objets Tombouctou
    setAddedToMosq(true);
  }, []);

  const handleShare = useCallback(() => {
    const text =
      `📜 J'ai sauvé les 5 manuscrits de la Bibliothèque de Tombouctou sur Yawmi !\n` +
      `⏱ ${formatTime(timeRemaining)} restantes · ${hintsUsed} indice${hintsUsed!==1?"s":""}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Yawmi — Tombouctou", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
    }
  }, [timeRemaining, hintsUsed]);

  // ── RÉSULTATS ────────────────────────────────────────────────
  if (phase === 1) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "#061A12",
        overflowY: "auto",
        padding: "24px 20px 48px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
      }}
    >
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: "center" }}
      >
        <p style={{
          color: "#D4AF37", fontFamily: "serif", fontSize: 28,
          direction: "rtl", margin: "0 0 8px",
          textShadow: "0 0 24px rgba(212,175,55,0.5)",
        }}>
          لقد أنقذتم المعرفة
        </p>
        <h1 style={{
          color: "#F8F4EC", fontFamily: "var(--font-bricolage, Georgia, serif)",
          fontSize: 20, fontWeight: 700, margin: "0 0 6px",
        }}>
          Vous avez sauvé la connaissance
        </h1>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: 22, fontWeight: 700,
              fontFamily: "var(--font-bricolage, Georgia, serif)", margin: 0 }}>
              {formatTime(timeRemaining)}
            </p>
            <p style={{ color: "rgba(248,244,236,0.4)", fontSize: 10, margin: 0,
              fontFamily: "var(--font-dm-sans, system-ui)", letterSpacing: "0.1em" }}>
              RESTANTES
            </p>
          </div>
          <div style={{ width: 1, background: "rgba(212,175,55,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: 22, fontWeight: 700,
              fontFamily: "var(--font-bricolage, Georgia, serif)", margin: 0 }}>
              {5 - hintsUsed}/5
            </p>
            <p style={{ color: "rgba(248,244,236,0.4)", fontSize: 10, margin: 0,
              fontFamily: "var(--font-dm-sans, system-ui)", letterSpacing: "0.1em" }}>
              SANS AIDE
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cartes manuscrits */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 420 }}>
        {MANUSCRIPTS.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.12 }}
            style={{
              background: `linear-gradient(135deg, rgba(${i===0?"200,168,75":i===1?"26,92,138":i===2?"138,58,32":i===3?"42,106,58":"90,42,138"},0.15) 0%, rgba(6,26,18,0.95) 100%)`,
              border: `1px solid ${COLORS[i]}33`,
              borderRadius: 16, padding: "14px 16px",
              display: "flex", gap: 14, alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 28, flexShrink: 0 }}>{ICONS[i]}</span>
            <div>
              <p style={{
                color: COLORS[i], fontSize: 13, fontWeight: 700, margin: "0 0 4px",
                fontFamily: "var(--font-bricolage, Georgia, serif)",
              }}>
                {m.title}
              </p>
              <p style={{
                color: "rgba(248,244,236,0.65)", fontSize: 12,
                fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.55, margin: 0,
              }}>
                {m.teaching.split("\n\n")[1]?.slice(0, 90) ?? m.teaching.slice(0, 90)}…
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 420 }}
      >
        {/* Mosquée */}
        <button
          onClick={addToMosquee}
          disabled={addedToMosq}
          style={{
            background: addedToMosq
              ? "rgba(74,222,128,0.1)"
              : "linear-gradient(135deg,#D4AF37,#A08020)",
            border: `1px solid ${addedToMosq ? "rgba(74,222,128,0.4)" : "rgba(212,175,55,0.3)"}`,
            borderRadius: 14, padding: "14px 20px", cursor: addedToMosq ? "default" : "pointer",
            color: addedToMosq ? "#4ade80" : "#061A12",
            fontWeight: 700, fontSize: 14, letterSpacing: "0.08em",
            fontFamily: "var(--font-dm-sans, system-ui)",
          }}
        >
          {addedToMosq ? "✓ Ajouté à ta mosquée !" : "🕌 Ajouter à ma mosquée"}
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          {/* Partager */}
          <button
            onClick={handleShare}
            style={{
              flex: 1, background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: 14, padding: "12px 16px", cursor: "pointer",
              color: "#D4AF37", fontWeight: 600, fontSize: 13,
              fontFamily: "var(--font-dm-sans, system-ui)",
            }}
          >
            ↗ Partager
          </button>
          {/* Rejouer */}
          <button
            onClick={onReplay}
            style={{
              flex: 1, background: "rgba(5,92,63,0.25)",
              border: "1px solid rgba(5,92,63,0.4)",
              borderRadius: 14, padding: "12px 16px", cursor: "pointer",
              color: "#F8F4EC", fontWeight: 600, fontSize: 13,
              fontFamily: "var(--font-dm-sans, system-ui)",
            }}
          >
            ↺ Rejouer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // ── CINÉMATIQUE ──────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      pointerEvents: "none",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Particules dorées */}
      {cinPhase >= 2 && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {Array.from({length: 30}).map((_,i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: "60vh", x: `${10 + Math.random()*80}vw` }}
              animate={{ opacity: [0, 0.9, 0], y: "-10vh" }}
              transition={{ delay: i * 0.08, duration: 3 + Math.random() }}
              style={{
                position: "absolute",
                width: 3 + Math.random()*5, height: 3 + Math.random()*5,
                borderRadius: "50%",
                background: "#D4AF37",
                boxShadow: "0 0 6px #D4AF37",
              }}
            />
          ))}
        </div>
      )}

      {/* Calligraphie */}
      <AnimatePresence>
        {cinPhase >= 3 && (
          <motion.div
            key="callig"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            style={{ textAlign: "center" }}
          >
            <p style={{
              color: "#D4AF37", fontFamily: "serif", fontSize: 40,
              direction: "rtl", margin: "0 0 8px",
              textShadow: "0 0 40px rgba(212,175,55,0.7)",
            }}>
              لقد أنقذتم المعرفة
            </p>
            <p style={{
              color: "rgba(248,244,236,0.8)", fontFamily: "Georgia, serif",
              fontSize: 16, fontStyle: "italic", margin: 0, letterSpacing: "0.05em",
            }}>
              Vous avez sauvé la connaissance
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score */}
      <AnimatePresence>
        {cinPhase >= 4 && (
          <motion.p
            key="score"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              color: "rgba(212,175,55,0.6)", fontSize: 13, marginTop: 20,
              fontFamily: "var(--font-dm-sans, system-ui)", letterSpacing: "0.15em",
            }}
          >
            5 MANUSCRITS SAUVÉS · {formatTime(timeRemaining)} RESTANTES
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
