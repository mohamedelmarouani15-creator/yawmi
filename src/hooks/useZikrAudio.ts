"use client";

import { useState, useCallback, useRef } from "react";

export function useZikrAudio() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef   = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current     = null;
    }
    setPlayingId(null);
  }, []);

  const play = useCallback((id: string, audioUrl?: string) => {
    stop();
    if (!audioUrl) return; // du'a sans audio → silencieux

    const audio      = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay  = () => setPlayingId(id);
    audio.onended = () => { audioRef.current = null; setPlayingId(null); };
    audio.onerror = () => { audioRef.current = null; setPlayingId(null); };

    setPlayingId(id);
    audio.play().catch(() => { audioRef.current = null; setPlayingId(null); });
  }, [stop]);

  const toggle = useCallback((id: string, audioUrl?: string) => {
    if (playingId === id) stop();
    else play(id, audioUrl);
  }, [playingId, play, stop]);

  return { playingId, toggle, stop };
}
