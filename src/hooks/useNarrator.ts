"use client";

import { useRef, useState, useCallback } from "react";

export const ARC_AMBIENT_LABEL: Record<string, string> = {
  arc_ibrahim:    "Feu de Babylone",
  arc_moussa:     "Les eaux du Nil",
  arc_maryam:     "Temple de Jérusalem",
  arc_sira:       "La Mecque ancienne",
  arc_sahaba:     "Médine",
  arc_hijra:      "Désert du Hijaz",
  arc_ismail:     "Vallée de Bacca",
  arc_isra_miraj: "Nuit du voyage",
  arc_souleimane: "Palais royal",
  arc_yusuf:      "Égypte ancienne",
};

type AmbientType = "fire" | "water" | "wind_temple" | "night" | "desert";

const ARC_AMBIENT: Record<string, AmbientType> = {
  arc_ibrahim:    "fire",
  arc_moussa:     "water",
  arc_maryam:     "wind_temple",
  arc_sira:       "desert",
  arc_sahaba:     "desert",
  arc_hijra:      "desert",
  arc_ismail:     "desert",
  arc_isra_miraj: "night",
  arc_souleimane: "wind_temple",
  arc_yusuf:      "desert",
};

function makeNoise(ctx: AudioContext, seconds = 4) {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  return src;
}

function buildAmbient(ctx: AudioContext, type: AmbientType) {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const srcs: AudioBufferSourceNode[] = [];
  const oscs: OscillatorNode[]        = [];

  const bq = (t: BiquadFilterType, f: number, q = 1) => {
    const n = ctx.createBiquadFilter();
    n.type = t; n.frequency.value = f; n.Q.value = q; return n;
  };
  const g = (v: number) => { const n = ctx.createGain(); n.gain.value = v; return n; };
  const link = (...nodes: AudioNode[]) => {
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
  };

  if (type === "fire") {
    const n1 = makeNoise(ctx); const f1 = bq("bandpass", 450, 1.8); const g1 = g(0.7);
    link(n1, f1, g1, master); srcs.push(n1);
    const n2 = makeNoise(ctx, 8); const f2 = bq("lowpass", 120, 0.6); const g2 = g(0.4);
    link(n2, f2, g2, master); srcs.push(n2);
    const lfo = ctx.createOscillator(); const lg = g(0.04);
    lfo.type = "sawtooth"; lfo.frequency.value = 6.5;
    lfo.connect(lg); lg.connect(master.gain); oscs.push(lfo);

  } else if (type === "water") {
    const n1 = makeNoise(ctx); link(n1, bq("lowpass", 750, 0.6), g(0.65), master); srcs.push(n1);
    const n2 = makeNoise(ctx, 6); link(n2, bq("bandpass", 1800, 2), g(0.25), master); srcs.push(n2);
    const lfo = ctx.createOscillator(); const lg = g(0.03);
    lfo.type = "sine"; lfo.frequency.value = 0.4;
    lfo.connect(lg); lg.connect(master.gain); oscs.push(lfo);

  } else if (type === "wind_temple") {
    const n1 = makeNoise(ctx); link(n1, bq("bandpass", 900, 0.7), g(0.5), master); srcs.push(n1);
    [432, 648].forEach((f, i) => {
      const o = ctx.createOscillator(); const og = g(i === 0 ? 0.018 : 0.010);
      o.type = "sine"; o.frequency.value = f; o.connect(og); og.connect(master); oscs.push(o);
    });
    const lfo = ctx.createOscillator(); const lg = g(0.025);
    lfo.type = "sine"; lfo.frequency.value = 0.25;
    lfo.connect(lg); lg.connect(master.gain); oscs.push(lfo);

  } else if (type === "night") {
    [55, 110, 165].forEach((f, i) => {
      const o = ctx.createOscillator(); const og = g([0.06, 0.03, 0.015][i]);
      o.type = "sine"; o.frequency.value = f; o.connect(og); og.connect(master); oscs.push(o);
    });
    const n1 = makeNoise(ctx, 8); link(n1, bq("lowpass", 180, 0.4), g(0.15), master); srcs.push(n1);
    const lfo = ctx.createOscillator(); const lg = g(0.02);
    lfo.type = "sine"; lfo.frequency.value = 0.12;
    lfo.connect(lg); lg.connect(master.gain); oscs.push(lfo);

  } else {
    const n1 = makeNoise(ctx); link(n1, bq("bandpass", 700, 0.9), g(0.55), master); srcs.push(n1);
    const n2 = makeNoise(ctx, 6); link(n2, bq("highpass", 2200, 0.5), g(0.15), master); srcs.push(n2);
    const lfo = ctx.createOscillator(); const lg = g(0.03);
    lfo.type = "sine"; lfo.frequency.value = 0.18;
    lfo.connect(lg); lg.connect(master.gain); oscs.push(lfo);
  }

  const fadeIn  = () => {
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 3);
  };
  const fadeOut = () => {
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
  };
  const startAll = () => { srcs.forEach(s => s.start()); oscs.forEach(o => o.start()); fadeIn(); };

  return { startAll, fadeOut };
}

export function useNarrator(storyId: string, chapterNumber: number) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused,  setIsPaused]  = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const ctxRef     = useRef<AudioContext | null>(null);
  const fadeOutRef = useRef<(() => void) | null>(null);

  const stopAmbient = useCallback(() => {
    fadeOutRef.current?.();
    setTimeout(() => { ctxRef.current?.close().catch(() => {}); ctxRef.current = null; }, 2800);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    stopAmbient();
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
  }, [stopAmbient]);

  const start = useCallback(async (text: string, accessToken: string) => {
    stop();
    setIsLoading(true);

    // Ambiance
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const { startAll, fadeOut } = buildAmbient(ctx, ARC_AMBIENT[storyId] ?? "desert");
    fadeOutRef.current = fadeOut;
    startAll();

    try {
      const res = await fetch("/api/story/narrate", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body:    JSON.stringify({ storyId, chapterNumber, text }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[narrator] API error:", res.status, err);
        throw new Error(err);
      }

      const blob   = await res.blob();
      const url    = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio  = new Audio(url);
      audioRef.current = audio;

      audio.onplay   = () => { setIsPlaying(true); setIsLoading(false); };
      audio.onpause  = () => { if (!audio.ended) setIsPlaying(false); };
      audio.onended  = () => { stopAmbient(); setIsPlaying(false); setIsPaused(false); };
      audio.onerror  = (e) => { console.error("[narrator] audio error", e); stop(); };

      setIsLoading(false);
      await audio.play();
    } catch (e) {
      console.error("[narrator] start error:", e);
      stop();
    }
  }, [storyId, chapterNumber, stop, stopAmbient]);

  const pause  = useCallback(() => { audioRef.current?.pause(); setIsPlaying(false); setIsPaused(true); }, []);
  const resume = useCallback(() => { audioRef.current?.play(); setIsPlaying(true); setIsPaused(false); }, []);

  return { isPlaying, isPaused, isLoading, start, stop, pause, resume };
}
