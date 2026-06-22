"use client";

import { useRef, useCallback } from "react";

// ── Noise generators ─────────────────────────────────────────────
// (même philosophie que useEscapeAudio — "se sentir sans s'entendre")

function makePink(ctx: AudioContext, sec = 8): AudioBuffer {
  const len = ctx.sampleRate * sec;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i = 0; i < len; i++) {
    const w = Math.random()*2-1;
    b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
    b2=0.969  *b2+w*0.153852;  b3=0.8665 *b3+w*0.3104856;
    b4=0.55   *b4+w*0.5329522; b5=-0.7616*b5-w*0.016898;
    d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;
    b6 = w*0.115926;
  }
  return buf;
}

function makeBrown(ctx: AudioContext, sec = 6): AudioBuffer {
  const len = ctx.sampleRate * sec;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02*(Math.random()*2-1))/1.02;
    d[i] = last * 3.5;
  }
  return buf;
}

function makeReverb(ctx: AudioContext, sec = 3): ConvolverNode {
  const len = ctx.sampleRate * sec;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.5);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

function loopBuf(ctx: AudioContext, buf: AudioBuffer): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop   = true;
  return src;
}

// Feuilletage de page synthétique
function playPageTurn(ctx: AudioContext, dest: AudioNode) {
  const t0  = ctx.currentTime + 0.05;
  const dur = 0.3 + Math.random()*0.15;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const env = Math.pow(1 - i/len, 0.4) * Math.pow(i/len, 0.08);
    d[i] = (Math.random()*2-1) * env;
  }
  const src  = ctx.createBufferSource();
  src.buffer = buf;

  const hp   = ctx.createBiquadFilter();
  hp.type    = "highpass"; hp.frequency.value = 1800; hp.Q.value = 0.4;

  const lp   = ctx.createBiquadFilter();
  lp.type    = "lowpass"; lp.frequency.value = 7000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(0.038, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  const pan  = ctx.createStereoPanner();
  pan.pan.value = (Math.random()*2-1)*0.55;

  src.connect(hp); hp.connect(lp); lp.connect(gain);
  gain.connect(pan); pan.connect(dest);
  src.start(t0);
}

// ── Hook public ──────────────────────────────────────────────────
export function useTombouctouAudio() {
  const ctxRef          = useRef<AudioContext | null>(null);
  const startedRef      = useRef(false);
  const tensionGainRef  = useRef<GainNode | null>(null);

  const startAudio = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const ctx    = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.72;
    master.connect(ctx.destination);

    const reverb = makeReverb(ctx, 3.2);
    reverb.connect(master);

    // 1. Vent du désert ─ bruit rose, très feutré
    const windBuf  = makePink(ctx, 10);
    const windSrc  = loopBuf(ctx, windBuf);
    const wLP1     = ctx.createBiquadFilter();
    wLP1.type      = "lowpass"; wLP1.frequency.value = 360; wLP1.Q.value = 0.3;
    const wLP2     = ctx.createBiquadFilter();
    wLP2.type      = "lowpass"; wLP2.frequency.value = 680; wLP2.Q.value = 0.25;
    const wGain    = ctx.createGain();
    wGain.gain.value = 0.11;
    windSrc.connect(wLP1); wLP1.connect(wLP2); wLP2.connect(wGain);
    wGain.connect(reverb);
    // Un filet sec, très discret
    const wDry     = ctx.createGain(); wDry.gain.value = 0.03;
    wLP2.connect(wDry); wDry.connect(master);
    windSrc.start();

    // 2. Crépitement bougies ─ bruit brun filtré
    const fireBuf  = makeBrown(ctx, 7);
    const fireSrc  = loopBuf(ctx, fireBuf);
    const fBP      = ctx.createBiquadFilter();
    fBP.type       = "bandpass"; fBP.frequency.value = 700; fBP.Q.value = 0.18;
    const fHP      = ctx.createBiquadFilter();
    fHP.type       = "highpass"; fHP.frequency.value = 180; fHP.Q.value = 0.12;
    const fGain    = ctx.createGain();
    fGain.gain.value = 0.048;
    fireSrc.connect(fBP); fBP.connect(fHP); fHP.connect(fGain);
    fGain.connect(master);
    fireSrc.start();

    // 3. Tonalité profonde ─ 3 sinusoïdes en quinte ouverte
    [55, 82.4, 110].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      osc.type   = "sine";
      osc.frequency.value = freq + i * 0.08;
      const lp   = ctx.createBiquadFilter();
      lp.type    = "lowpass"; lp.frequency.value = 280; lp.Q.value = 0.6;
      const g    = ctx.createGain();
      g.gain.value = 0.028 / (i + 1);
      osc.connect(lp); lp.connect(g); g.connect(reverb);
      osc.start();
    });

    // 4. Layer tension ─ grondement sourd (activé progressivement par setTension)
    const tensionOsc1 = ctx.createOscillator();
    tensionOsc1.type  = "sine"; tensionOsc1.frequency.value = 38;
    const tensionOsc2 = ctx.createOscillator();
    tensionOsc2.type  = "sine"; tensionOsc2.frequency.value = 61;
    const tensionLP   = ctx.createBiquadFilter();
    tensionLP.type    = "lowpass"; tensionLP.frequency.value = 120;
    const tensionGain = ctx.createGain();
    tensionGain.gain.value = 0; // silencieux au début
    tensionGainRef.current  = tensionGain;
    tensionOsc1.connect(tensionLP);
    tensionOsc2.connect(tensionLP);
    tensionLP.connect(tensionGain);
    tensionGain.connect(reverb);
    tensionOsc1.start(); tensionOsc2.start();

    // 5. Feuilletage ─ toutes les 10-22 secondes
    const schedulePage = () => {
      const delay = 10000 + Math.random() * 12000;
      setTimeout(() => {
        if (ctxRef.current) { playPageTurn(ctx, master); schedulePage(); }
      }, delay);
    };
    schedulePage();

  }, []);

  const stopAudio = useCallback(() => {
    ctxRef.current?.close();
    ctxRef.current = null;
    startedRef.current = false;
  }, []);

  // Activé progressivement par le GameTimer quand chrono < 5min
  const setTension = useCallback((level: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    // On stocke les nœuds gain dans les refs pour les modifier
    if (tensionGainRef.current) {
      tensionGainRef.current.gain.setTargetAtTime(
        level * 0.18,
        ctx.currentTime,
        2.0 // rampe douce sur 2s
      );
    }
  }, []);

  return { startAudio, stopAudio, setTension };
}
