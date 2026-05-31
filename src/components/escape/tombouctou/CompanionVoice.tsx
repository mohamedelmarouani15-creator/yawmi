"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MANUSCRIPTS } from "@/lib/escape/tombouctou";

interface Props {
  nearbyMs:      number | null;
  solvedMs:      boolean[];
  introComplete: boolean;
  victoryActive: boolean;
}

// Directions selon position du manuscrit dans la salle (centre 0,0)
function getDirection(id: number): string {
  const pos = MANUSCRIPTS[id]?.position ?? [0, 0, 0];
  if (pos[2] < -3) return "le nord";
  if (pos[0] > 4)  return "l'est";
  if (pos[0] < -4) return "l'ouest";
  return "le centre";
}

const HINTS: Record<number, string[]> = {
  0: [
    "Ce que tu cherches est plus proche que tu ne le penses…",
    "Regarde vers le nord… quelque chose brille dans l'ombre des étagères.",
    "Si le premier mot révélé était « Lis »… quel mot résume tout ce qu'on peut lire ?",
  ],
  1: [
    "Ce que tu cherches est plus proche que tu ne le penses…",
    "Regarde vers le centre… quelque chose tourne lentement dans la pénombre.",
    "Al-Biruni cherchait les étoiles pour guider les pèlerins. L'étoile du Berger se lève au sud-ouest…",
  ],
  2: [
    "Ce que tu cherches est plus proche que tu ne le penses…",
    "Regarde vers l'est… une tablette gravée attend ta lecture.",
    "Chaque lettre a avancé de trois pas. Aide-la à revenir…",
  ],
  3: [
    "Ce que tu cherches est plus proche que tu ne le penses…",
    "Regarde vers l'est… une carte du monde attend tes yeux.",
    "Où Al-Khwarizmi a-t-il inventé l'algèbre ? Dans quelle ville Fatima a-t-elle fondé la première université ?",
  ],
  4: [
    "Ce que tu cherches est plus proche que tu ne le penses…",
    "Regarde vers le centre… un pupitre porte un verset incomplet.",
    "Le verset dit : sont-ils égaux, ceux qui savent et ceux qui ne savent pas ?",
  ],
};

function speak(text: string, pitch = 0.75, rate = 0.80) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utt       = new SpeechSynthesisUtterance(text);
  utt.lang        = "fr-FR";
  utt.pitch       = pitch;
  utt.rate        = rate;
  utt.volume      = 0.88;
  const voices    = synth.getVoices();
  const male      = voices.find(v =>
    v.lang.startsWith("fr") &&
    (v.name.includes("Thomas") || v.name.includes("Nicolas"))
  ) || voices.find(v => v.lang.startsWith("fr"));
  if (male) utt.voice = male;
  synth.speak(utt);
}

export default function CompanionVoice({
  nearbyMs, solvedMs, introComplete, victoryActive,
}: Props) {
  const [message,  setMessage]  = useState("");
  const [visible,  setVisible]  = useState(false);
  const hintLevel  = useRef(0);      // 0, 1, 2, 3
  const lastProg   = useRef<number>(Date.now());
  const hintTarget = useRef<number | null>(null);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHint = useCallback((text: string) => {
    if (dismissRef.current) clearTimeout(dismissRef.current);
    setMessage(text);
    setVisible(true);
    speak(text);
    dismissRef.current = setTimeout(() => setVisible(false), 9000);
  }, []);

  // Met à jour "lastProgress" quand le joueur approche d'un manuscrit
  useEffect(() => {
    if (!introComplete || victoryActive) return;
    if (nearbyMs !== null) {
      lastProg.current = Date.now();
      hintTarget.current = nearbyMs;
      hintLevel.current = 0; // reset hints si approche d'un objet
    }
  }, [nearbyMs, introComplete, victoryActive]);

  // Timer qui vérifie toutes les 30s si indice nécessaire
  useEffect(() => {
    if (!introComplete || victoryActive) return;
    const iv = setInterval(() => {
      const elapsed = (Date.now() - lastProg.current) / 1000; // secondes

      // Trouve le prochain manuscrit non résolu le plus pertinent
      const target = hintTarget.current ??
        MANUSCRIPTS.find(m => !solvedMs[m.id])?.id ?? null;
      if (target === null) return;

      if (elapsed >= 360 && hintLevel.current < 3) {
        // 6 min → indice précis
        hintLevel.current = 3;
        showHint(HINTS[target]?.[2] ?? HINTS[0][2]);
      } else if (elapsed >= 240 && hintLevel.current < 2) {
        // 4 min → indice directionnel
        hintLevel.current = 2;
        showHint(HINTS[target]?.[1] ?? `Regarde vers ${getDirection(target)}… quelque chose brille.`);
      } else if (elapsed >= 120 && hintLevel.current < 1) {
        // 2 min → indice vague
        hintLevel.current = 1;
        showHint(HINTS[target]?.[0] ?? HINTS[0][0]);
      }
    }, 30_000);
    return () => clearInterval(iv);
  }, [introComplete, victoryActive, solvedMs, showHint]);

  if (!introComplete || victoryActive) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed", bottom: 90, left: "50%",
            transform: "translateX(-50%)",
            zIndex: 70, maxWidth: 380, width: "90%",
            background: "rgba(2,8,4,0.85)",
            border: "1px solid rgba(212,175,55,0.22)",
            borderRadius: 14, padding: "12px 18px",
            backdropFilter: "blur(8px)",
            textAlign: "center",
          }}
        >
          <p style={{
            color: "rgba(212,175,55,0.75)",
            fontSize: 13, fontFamily: "Georgia, serif",
            fontStyle: "italic", lineHeight: 1.65, margin: 0,
          }}>
            🧙 « {message} »
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
