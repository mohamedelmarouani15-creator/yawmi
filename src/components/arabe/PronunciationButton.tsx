"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface PronunciationButtonProps {
  arabic: string;
  transliteration: string;
  size?: "sm" | "md";
  color?: string;
}

let arabicVoiceAvailable: boolean | null = null;

function checkArabicVoice(): boolean {
  if (typeof window === "undefined") return false;
  if (arabicVoiceAvailable !== null) return arabicVoiceAvailable;
  const voices = window.speechSynthesis.getVoices();
  arabicVoiceAvailable = voices.some(
    v => v.lang.startsWith("ar")
  );
  return arabicVoiceAvailable;
}

export default function PronunciationButton({
  arabic,
  transliteration,
  size = "sm",
  color = "#D4AF37",
}: PronunciationButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [noVoice, setNoVoice]   = useState(false);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Ensure voices are loaded
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang.startsWith("ar"));

    if (!arVoice) {
      // No Arabic voice — show transliteration fallback briefly
      setNoVoice(true);
      setTimeout(() => setNoVoice(false), 2000);
      return;
    }

    const utt = new SpeechSynthesisUtterance(arabic);
    utt.voice = arVoice;
    utt.lang  = "ar-SA";
    utt.rate  = 0.85;
    utt.pitch = 1;

    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  }, [arabic, speaking]);

  const iconSize = size === "sm" ? 13 : 16;
  const btnSize  = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  if (noVoice) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="text-[10px] px-2 py-1 rounded-full"
        style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
      >
        {transliteration}
      </motion.span>
    );
  }

  return (
    <motion.button
      onClick={speak}
      whileTap={{ scale: 0.88 }}
      className={`${btnSize} flex items-center justify-center rounded-full shrink-0`}
      title={`Écouter : ${transliteration}`}
      style={{
        background: speaking ? color : "rgba(255,255,255,0.06)",
        border: `1px solid ${speaking ? color : "rgba(255,255,255,0.12)"}`,
        color: speaking ? "#000" : color,
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {speaking ? (
        <VolumeX size={iconSize} />
      ) : (
        <Volume2 size={iconSize} />
      )}
    </motion.button>
  );
}

// Preload voices on page load (required on some browsers)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    arabicVoiceAvailable = null; // reset cache so next check re-evaluates
    checkArabicVoice();
  };
}
