"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onPhaseChange: (phase: number) => void;
  onComplete: () => void;
  firstTime: boolean;
}

const NARRATION = "Cette nuit, tu dois sauver ce que les hommes ont mis des siècles à écrire…";

function speakNarration() {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();

  const say = () => {
    const utt    = new SpeechSynthesisUtterance(NARRATION);
    utt.lang     = "fr-FR";
    utt.pitch    = 0.78;
    utt.rate     = 0.82;
    utt.volume   = 0.92;

    const voices  = synth.getVoices();
    const male    = voices.find(v =>
      v.lang.startsWith("fr") &&
      (v.name.includes("Thomas") || v.name.includes("Nicolas") || v.name.includes("Pierre"))
    ) || voices.find(v => v.lang.startsWith("fr"));
    if (male) utt.voice = male;

    synth.speak(utt);
  };

  if (synth.getVoices().length > 0) say();
  else { synth.addEventListener("voiceschanged", say, { once: true }); synth.speak(new SpeechSynthesisUtterance("")); }
}

export default function CinematicIntro({ onPhaseChange, onComplete, firstTime }: Props) {
  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const phaseRef     = useRef(0);
  // Black overlay opacity — driven via CSS transition for perf
  const blackRef     = useRef<HTMLDivElement>(null);
  const narrationRef = useRef<HTMLParagraphElement>(null);

  const skip = useCallback(() => {
    window.speechSynthesis?.cancel();
    timersRef.current.forEach(clearTimeout);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const add = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    // 0.0s → écran noir total
    if (blackRef.current) blackRef.current.style.opacity = "1";

    // 0.5s → phase 1 : son vent monte (géré dans audio)
    add(() => { phaseRef.current = 1; onPhaseChange(1); }, 500);

    // 1.0s → phase 2 : bougie centrale (fog très dense → disparaît par FogController)
    add(() => {
      phaseRef.current = 2; onPhaseChange(2);
      if (blackRef.current) {
        blackRef.current.style.transition = "opacity 0.9s ease-out";
        blackRef.current.style.opacity    = "0";
      }
    }, 1000);

    // 1.5s → phase 3 : fog commence à se retirer
    add(() => { phaseRef.current = 3; onPhaseChange(3); }, 1500);

    // 2.5s → phase 4 : caméra recule
    add(() => { phaseRef.current = 4; onPhaseChange(4); }, 2500);

    // 4.0s → phase 5 : voix + sous-titres
    add(() => {
      phaseRef.current = 5; onPhaseChange(5);
      speakNarration();
      if (narrationRef.current) {
        narrationRef.current.style.transition = "opacity 0.7s ease-out";
        narrationRef.current.style.opacity    = "1";
      }
    }, 4000);

    // 5.5s → phase 6 : chrono apparaît, narration efface
    add(() => {
      phaseRef.current = 6; onPhaseChange(6);
      if (narrationRef.current) {
        narrationRef.current.style.transition = "opacity 0.4s ease-in";
        narrationRef.current.style.opacity    = "0";
      }
    }, 5500);

    // 6.0s → gameplay
    add(() => { window.speechSynthesis?.cancel(); onComplete(); }, 6000);

    return () => {
      timersRef.current.forEach(clearTimeout);
      window.speechSynthesis?.cancel();
    };
  }, [onPhaseChange, onComplete]);

  return (
    <>
      {/* Écran noir initial */}
      <div
        ref={blackRef}
        style={{
          position: "fixed", inset: 0, zIndex: 90,
          background: "#000", opacity: 1, pointerEvents: "none",
        }}
      />

      {/* Narration (sous-titres, au cas où la voix ne marche pas) */}
      <p
        ref={narrationRef}
        style={{
          position: "fixed",
          bottom: "22%", left: "50%", transform: "translateX(-50%)",
          zIndex: 95, maxWidth: 440, width: "90%",
          textAlign: "center",
          color: "rgba(212,175,55,0.72)",
          fontFamily: "Georgia, serif",
          fontSize: 15, lineHeight: 1.75,
          letterSpacing: "0.03em",
          fontStyle: "italic",
          opacity: 0, pointerEvents: "none",
        }}
      >
        &ldquo;{NARRATION}&rdquo;
      </p>

      {/* Bouton PASSER (si déjà vu) */}
      {!firstTime && (
        <button
          onClick={skip}
          style={{
            position: "fixed", top: 18, right: 18, zIndex: 100,
            color: "rgba(212,175,55,0.45)",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 11, letterSpacing: "0.18em",
            fontFamily: "var(--font-dm-sans, system-ui)",
            padding: "8px 12px",
          }}
        >
          PASSER
        </button>
      )}
    </>
  );
}
