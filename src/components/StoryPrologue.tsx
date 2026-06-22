"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Waves, Leaf, Moon, Shield, Route, Heart, Sparkles, Crown, Star, type LucideIcon } from "lucide-react";
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

const ARC_ICON: Record<string, LucideIcon> = {
  arc_ibrahim:    Flame,
  arc_moussa:     Waves,
  arc_maryam:     Leaf,
  arc_sira:       Moon,
  arc_sahaba:     Shield,
  arc_hijra:      Route,
  arc_ismail:     Heart,
  arc_isra_miraj: Sparkles,
  arc_souleimane: Crown,
  arc_yusuf:      Star,
};

function splitIntoSlides(narrative: string, max = 5): string[] {
  const paras = narrative.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 10);
  if (paras.length >= 2) return paras.slice(0, max);

  const sentences = narrative
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?]) +/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  if (sentences.length <= max) return sentences;
  const step = Math.floor(sentences.length / max);
  return Array.from({ length: max }, (_, i) =>
    sentences[Math.min(i * step, sentences.length - 1)]
  );
}

interface Props {
  narrative:    string;
  storyId?:     string;
  chapterN?:    number;
  themeColor?:  string;
  themeEmoji?:  string;
  label?:       string;
  onComplete:   () => void;
}

export default function StoryPrologue({
  narrative, storyId, chapterN, themeColor, label, onComplete,
}: Props) {
  const slides = splitIntoSlides(narrative);
  const color   = themeColor ?? (storyId ? (ARC_COLOR[storyId] ?? "#D4AF37") : "#D4AF37");
  const ArcIcon = storyId ? (ARC_ICON[storyId] ?? null) : null;

  const [index,       setIndex]       = useState(0);
  const [isLoading,   setIsLoading]   = useState(false);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [bgImage,     setBgImage]     = useState<string | null>(null);
  const [imgVisible,  setImgVisible]  = useState(false);

  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const cancelRef = useRef(false);

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
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

  // ── Narration automatique par slide ───────────────────────────────
  useEffect(() => {
    cancelRef.current = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function narrate() {
      setIsLoading(true);
      setIsPlaying(false);
      const text = slides[index];
      if (!text) { setIsLoading(false); return; }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || cancelRef.current) { setIsLoading(false); return; }

        const res = await fetch("/api/story/narrate", {
          method: "POST",
          headers: { "Content-Type": "text/plain", Authorization: `Bearer ${session.access_token}` },
          body: text,
        });
        if (!res.ok || cancelRef.current) { setIsLoading(false); return; }

        const blob  = await res.blob();
        const url   = URL.createObjectURL(blob);
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
          timeoutId = setTimeout(() => { if (!cancelRef.current) goNext(); }, 8000);
        }
      }
    }

    narrate();
    return () => { cancelRef.current = true; clearTimeout(timeoutId); stopAudio(); };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Image de fond IA (Replicate) en parallèle ─────────────────────
  useEffect(() => {
    if (!storyId) return;

    let cancelled = false;

    async function fetchImage() {
      setBgImage(null);
      setImgVisible(false);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || cancelled) return;

        const res = await fetch("/api/story/image", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ storyId, slideIndex: index }),
        });
        if (!res.ok || cancelled) return;

        const { url } = await res.json() as { url: string };
        if (!url || cancelled) return;

        // Précharger l'image avant de l'afficher
        const img = new Image();
        img.onload = () => {
          if (!cancelled) { setBgImage(url); setImgVisible(true); }
        };
        img.src = url;
      } catch { /* image non disponible, fond sombre utilisé */ }
    }

    fetchImage();
    return () => { cancelled = true; };
  }, [index, storyId]);

  const kenBurns = index % 2 === 0 ? "kenBurns" : "kenBurnsAlt";

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: "#010804" }}>

      {/* ── Image de fond Ken Burns ──────────────────────────────── */}
      <AnimatePresence>
        {bgImage && imgVisible && (
          <motion.div
            key={bgImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${bgImage})`,
                animation:       `${kenBurns} 12s ease-in-out forwards`,
              }}
            />
            {/* Overlay dégradé pour lisibilité du texte */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(1,8,4,0.55) 0%, rgba(1,8,4,0.3) 40%, rgba(1,8,4,0.75) 80%, rgba(1,8,4,0.95) 100%)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motif géométrique (visible quand pas d'image) */}
      {!bgImage && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            style={{ opacity: 0.06 }}
          >
            <svg width={340} height={340} viewBox="0 0 340 340">
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1="170" y1="0" x2="170" y2="340" stroke={color} strokeWidth="1"
                  transform={`rotate(${i * 22.5} 170 170)`} />
              ))}
              {[60, 100, 140].map(r => (
                <circle key={r} cx="170" cy="170" r={r} fill="none" stroke={color} strokeWidth="0.8" />
              ))}
            </svg>
          </motion.div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12">
        <div className="flex items-center gap-2">
          {ArcIcon && <ArcIcon size={18} style={{ color, flexShrink: 0 }} />}
          <p className="text-xs tracking-widest uppercase opacity-70"
            style={{ color, fontFamily: "var(--font-dm-sans)" }}>
            {label ?? (chapterN ? `Chapitre ${chapterN} · ` : "")}Moment {index + 1}/{slides.length}
          </p>
        </div>
        <button onClick={onComplete} className="text-xs opacity-40"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Passer tout →
        </button>
      </div>

      {/* ── Barre de progression ──────────────────────────────────── */}
      <div className="relative z-10 flex gap-1.5 justify-center mt-4 px-5">
        {slides.map((_, i) => (
          <motion.div key={i}
            animate={{ width: i === index ? 28 : 8, opacity: i < index ? 0.5 : i === index ? 1 : 0.25 }}
            transition={{ duration: 0.35 }}
            className="h-1 rounded-full"
            style={{ background: color }}
          />
        ))}
      </div>

      {/* ── Texte du moment ───────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center font-bold leading-relaxed drop-shadow-lg"
            style={{
              color:      "var(--text)",
              fontFamily: "var(--font-bricolage)",
              fontSize:   22,
              maxWidth:   340,
              textShadow: "0 2px 12px rgba(0,0,0,0.8)",
            }}
          >
            {slides[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Zone audio + bouton ───────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-5 pb-12">
        <div className="h-6 flex items-center justify-center">
          {isLoading && (
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="h-3 w-3 rounded-full border-2"
                style={{ borderColor: color, borderTopColor: "transparent" }} />
              <span className="text-xs opacity-50"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Narration…
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
                  style={{ background: color }} />
              ))}
            </div>
          )}
        </div>

        <motion.button
          onClick={goNext}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="w-full rounded-full py-4 text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: index < slides.length - 1
              ? "rgba(255,255,255,0.12)"
              : `linear-gradient(135deg,${color},#8B6914)`,
            color: index < slides.length - 1 ? "rgba(248,244,236,0.7)" : "#0A1A0E",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {index < slides.length - 1 ? "Moment suivant →" : "Répondre aux questions →"}
        </motion.button>
      </div>
    </div>
  );
}
