"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceCoachProps {
  encouragement?: string;
  tajwid?:        string;
  pronunciation?: string;
  nextFocus?:     string;
  errors?:        { word: string; suggestion: string; similarity?: number }[];
  surahNumber:    number;
  ayahNumber:     number;
  score:          number;
}

// Waveform visual pendant la lecture
function SpeakingWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: "var(--gold)" }}
          animate={active ? {
            height: [h * 2, h * 6, h * 2],
            opacity: [0.4, 1, 0.4],
          } : { height: 2, opacity: 0.2 }}
          transition={active ? {
            duration: 0.6,
            delay: i * 0.08,
            repeat: Infinity,
            ease: "easeInOut",
          } : { duration: 0.2 }}
        />
      ))}
    </div>
  );
}

export default function VoiceCoach({
  encouragement, tajwid, pronunciation, nextFocus,
  errors = [], surahNumber, ayahNumber, score,
}: VoiceCoachProps) {
  const [speaking,    setSpeaking]    = useState(false);
  const [supported,   setSupported]   = useState(false);
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  // Construit le texte de coaching à lire
  const buildSpeechText = useCallback(() => {
    const parts: string[] = [];

    if (encouragement) parts.push(encouragement);

    if (score < 90 && errors.length > 0) {
      const errorWords = errors.slice(0, 3).map(e => e.suggestion).join(", ");
      parts.push(`Les mots à retravailler sont : ${errorWords}.`);
    }

    if (tajwid) parts.push(tajwid);
    if (pronunciation) parts.push(pronunciation);
    if (nextFocus) parts.push(`Pour la prochaine session : ${nextFocus}`);

    return parts.join(" ... ");
  }, [encouragement, tajwid, pronunciation, nextFocus, errors, score]);

  const speak = useCallback(() => {
    if (!supported) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const text = buildSpeechText();
    if (!text.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = "fr-FR";
    utterance.rate  = 0.88;
    utterance.pitch = 1.05;
    // Préférer une voix féminine si disponible (plus pédagogique)
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang === "fr-FR" && v.name.toLowerCase().includes("amélie"))
                 || voices.find(v => v.lang === "fr-FR" && !v.name.toLowerCase().includes("thomas"))
                 || voices.find(v => v.lang.startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [supported, speaking, buildSpeechText]);

  // Joue le verset de référence (audio Alafasy) au mot erroné
  const playReferenceAudio = useCallback(() => {
    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
    }
    setPlayingWord("ayah");
    const url = `https://everyayah.com/data/Alafasy_128kbps/${String(surahNumber).padStart(3, "0")}${String(ayahNumber).padStart(3, "0")}.mp3`;
    const audio = new Audio(url);
    wordAudioRef.current = audio;
    audio.play();
    audio.onended = () => setPlayingWord(null);
    audio.onerror = () => setPlayingWord(null);
  }, [surahNumber, ayahNumber]);

  if (!supported && !errors.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Bouton principal — Coaching vocal */}
      {supported && (
        <button
          onClick={speak}
          className="flex items-center justify-between rounded-2xl border px-4 py-3"
          style={{
            background:   speaking ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.03)",
            borderColor:  speaking ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)",
          }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 20 }}>🎓</span>
            <div>
              <p className="text-sm font-semibold text-left"
                style={{ color: speaking ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {speaking ? "Arrêter le coaching" : "Écouter le coaching vocal"}
              </p>
              <p className="text-xs opacity-40 text-left"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {speaking ? "En cours…" : "Professeur IA vous explique vos erreurs"}
              </p>
            </div>
          </div>
          <SpeakingWave active={speaking} />
        </button>
      )}

      {/* Erreurs avec audio de référence */}
      <AnimatePresence>
        {errors.length > 0 && score < 90 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-widest opacity-40"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Mots à corriger · écouter la référence
            </p>

            {errors.slice(0, 4).map((e, i) => (
              <div key={i}
                className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}>
                <div className="flex items-center gap-3">
                  <p className="text-right"
                    style={{ fontFamily: "var(--font-amiri)", fontSize: 18, color: "#ef4444", direction: "rtl" }}>
                    {e.word || "?"}
                  </p>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>→</span>
                  <p className="text-right"
                    style={{ fontFamily: "var(--font-amiri)", fontSize: 18, color: "#22c55e", direction: "rtl" }}>
                    {e.suggestion}
                  </p>
                </div>
                <button onClick={playReferenceAudio}
                  className="flex h-8 w-8 items-center justify-center rounded-full border text-sm"
                  style={{
                    borderColor: playingWord === "ayah" ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.1)",
                    color: playingWord === "ayah" ? "var(--gold)" : "rgba(248,244,236,0.4)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                  title="Écouter le verset de référence">
                  {playingWord === "ayah" ? "⏹" : "▶"}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
