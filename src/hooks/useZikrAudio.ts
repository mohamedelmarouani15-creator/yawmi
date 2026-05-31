"use client";

import { useState, useCallback, useEffect } from "react";

export type AudioRate = 0.55 | 0.75 | 1.0;

function clean(text: string): string {
  return text
    .replace(/\.\.\./g, "")
    .replace(/۝/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function useZikrAudio() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [rate,      setRate]      = useState<AudioRate>(0.75);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Some browsers load voices async — warm up the list
  useEffect(() => {
    if (!supported) return;
    window.speechSynthesis.getVoices();
    const onVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
  }, [supported]);

  const play = useCallback((id: string, arabicText: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();

    const utt  = new SpeechSynthesisUtterance(clean(arabicText));
    utt.lang   = "ar-SA";
    utt.rate   = rate;
    utt.pitch  = 1;

    const voices     = window.speechSynthesis.getVoices();
    const arVoice    = voices.find(v => v.lang === "ar-SA")
                    ?? voices.find(v => v.lang.startsWith("ar"));
    if (arVoice) utt.voice = arVoice;

    utt.onstart = () => setPlayingId(id);
    utt.onend   = () => setPlayingId(null);
    utt.onerror = () => setPlayingId(null);

    setPlayingId(id);
    window.speechSynthesis.speak(utt);
  }, [rate, supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setPlayingId(null);
  }, [supported]);

  const toggle = useCallback((id: string, arabicText: string) => {
    if (playingId === id) stop();
    else play(id, arabicText);
  }, [playingId, play, stop]);

  return { playingId, rate, setRate, toggle, stop, supported };
}
