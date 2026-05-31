"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

// Couleurs et emojis par arc
const ARC_COLOR: Record<string, string> = {
  arc_ibrahim:    "#f97316",
  arc_moussa:     "#06b6d4",
  arc_maryam:     "#a78bfa",
  arc_sira:       "#D4AF37",
  arc_sahaba:     "#34d399",
  arc_hijra:      "#60a5fa",
  arc_ismail:     "#fbbf24",
  arc_isra_miraj: "#c084fc",
  arc_souleimane: "#84cc16",
  arc_yusuf:      "#f43f5e",
};

const ARC_EMOJI: Record<string, string> = {
  arc_ibrahim:    "🔥",
  arc_moussa:     "🌊",
  arc_maryam:     "🌸",
  arc_sira:       "🌙",
  arc_sahaba:     "🌿",
  arc_hijra:      "🐪",
  arc_ismail:     "🏔️",
  arc_isra_miraj: "✨",
  arc_souleimane: "👑",
  arc_yusuf:      "💫",
};

// Découpe la narration en 4-5 slides représentatives
function splitIntoSlides(narrative: string, max = 5): string[] {
  const paras = narrative.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 30);
  if (paras.length >= 3) return paras.slice(0, max);

  const sentences = narrative
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?]) +/)
    .map(s => s.trim())
    .filter(s => s.length > 30);

  if (sentences.length <= max) return sentences;
  const step = Math.floor(sentences.length / max);
  return Array.from({ length: max }, (_, i) =>
    sentences[Math.min(i * step, sentences.length - 1)]
  );
}

interface Props {
  narrative:  string;
  storyId:    string;
  chapterN:   number;
  onComplete: () => void;
}

export default function StoryPrologue({ narrative, storyId, chapterN, onComplete }: Props) {
  const slides   = splitIntoSlides(narrative);
  const color    = ARC_COLOR[storyId]  ?? "#D4AF37";
  const emoji    = ARC_EMOJI[storyId]  ?? "✦";
  const [index,     setIndex]     = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const cancelRef  = useRef(false);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const goNext = useCallback(() => {
    stopAudio();
    if (index < slides.length - 1) {
      setIndex(i => i + 1);
      setIsPlaying(false);
    } else {
      onComplete();
    }
  }, [index, slides.length, onComplete, stopAudio]);

  // Narration automatique à chaque changement de slide
  useEffect(() => {
    cancelRef.current = false;
    setIsLoading(true);
    setIsPlaying(false);
    let timeoutId: ReturnType<typeof setTimeout>;

    async function narrate() {
      const text = slides[index];
      if (!text) { setIsLoading(false); return; }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || cancelRef.current) { setIsLoading(false); return; }

        const res = await fetch("/api/story/narrate", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: text,
        });

        if (!res.ok || cancelRef.current) { setIsLoading(false); return; }

        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        if (cancelRef.current) { URL.revokeObjectURL(url); setIsLoading(false); return; }

        const audio = new Audio(url);
        audioRef.current = audio;
        setIsLoading(false);
        setIsPlaying(true);

        audio.play().catch(() => {});
        audio.onended = () => {
          if (!cancelRef.current) {
            setIsPlaying(false);
            URL.revokeObjectURL(url);
            timeoutId = setTimeout(() => { if (!cancelRef.current) goNext(); }, 1200);
          }
        };
      } catch {
        if (!cancelRef.current) {
          setIsLoading(false);
          // Fallback : avance automatiquement après 8s si la narration échoue
          timeoutId = setTimeout(() => { if (!cancelRef.current) goNext(); }, 8000);
        }
      }
    }

    narrate();
    return () => {
      cancelRef.current = true;
      clearTimeout(timeoutId);
      stopAudio();
    };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(180deg,#010804 0%,#061A12 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe pt-12">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 20 }}>{emoji}</span>
          <p className="text-xs tracking-widest uppercase opacity-50"
            style={{ color, fontFamily: "var(--font-dm-sans)" }}>
            Chapitre {chapterN} · Moment {index + 1}/{slides.length}
          </p>
        </div>
        <button
          onClick={onComplete}
          className="text-xs opacity-35"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
        >
          Passer tout →
        </button>
      </div>

      {/* Barre de progression */}
      <div className="flex gap-1.5 justify-center mt-4 px-5">
        {slides.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === index ? 28 : 8, opacity: i < index ? 0.5 : i === index ? 1 : 0.2 }}
            transition={{ duration: 0.35 }}
            className="h-1 rounded-full"
            style={{ background: color }}
          />
        ))}
      </div>

      {/* Motif décoratif rotatif */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          style={{ opacity: 0.04 }}
        >
          <svg width={340} height={340} viewBox="0 0 340 340">
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i}
                x1="170" y1="0" x2="170" y2="340"
                stroke={color}
                strokeWidth="1"
                transform={`rotate(${i * 22.5} 170 170)`}
              />
            ))}
            {[60, 100, 140].map(r => (
              <circle key={r} cx="170" cy="170" r={r} fill="none" stroke={color} strokeWidth="0.8" />
            ))}
          </svg>
        </motion.div>
      </div>

      {/* Slide — texte principal */}
      <div className="flex flex-1 items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 text-center text-xl font-bold leading-relaxed"
            style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)", maxWidth: 340 }}
          >
            {slides[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Zone audio + bouton */}
      <div className="flex flex-col items-center gap-3 px-5 pb-safe pb-12">
        {/* Indicateur audio */}
        <div className="h-6 flex items-center justify-center">
          {isLoading && (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="h-3 w-3 rounded-full border-2"
                style={{ borderColor: color, borderTopColor: "transparent" }}
              />
              <span className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Narration en cours…
              </span>
            </div>
          )}
          {isPlaying && (
            <div className="flex items-end gap-1">
              {[0, 1, 2, 1, 0].map((h, i) => (
                <motion.div key={i}
                  animate={{ height: [4 + h * 4, 18, 4 + h * 4] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                  className="w-1 rounded-full"
                  style={{ background: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bouton avancer */}
        <motion.button
          onClick={goNext}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="w-full rounded-full py-4 text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: index < slides.length - 1
              ? "rgba(255,255,255,0.07)"
              : `linear-gradient(135deg,${color},#8B6914)`,
            color: index < slides.length - 1
              ? "rgba(248,244,236,0.55)"
              : "#0A1A0E",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {index < slides.length - 1 ? "Moment suivant →" : "🎯 Répondre aux questions"}
        </motion.button>
      </div>
    </div>
  );
}
