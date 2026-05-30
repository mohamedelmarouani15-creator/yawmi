"use client";

import { useRef, useCallback, useEffect } from "react";
import type { RoomId } from "@/lib/escape3d/bounds";

// ── Générateurs de bruit ──────────────────────────────────────────

function makePinkNoise(ctx: AudioContext, seconds = 4): AudioBuffer {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i=0;i<len;i++){
    const w=Math.random()*2-1;
    b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
    b2=0.969*b2+w*0.153852; b3=0.8665*b3+w*0.3104856;
    b4=0.55*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
    d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
  }
  return buf;
}

function makeBrownNoise(ctx: AudioContext, seconds = 4): AudioBuffer {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0); let last=0;
  for (let i=0;i<len;i++){
    last=(last+0.02*(Math.random()*2-1))/1.02;
    d[i]=Math.max(-1,Math.min(1,last*3.5));
  }
  return buf;
}

function makeWhiteNoise(ctx: AudioContext, seconds = 4): AudioBuffer {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i=0;i<len;i++) d[i]=Math.random()*2-1;
  return buf;
}

// ── Types ─────────────────────────────────────────────────────────

type RoomAudio = { gain: GainNode; sources: AudioBufferSourceNode[] };

// ── Hook principal ────────────────────────────────────────────────

export function useEscapeAudio() {
  const ctxRef         = useRef<AudioContext | null>(null);
  const masterRef      = useRef<GainNode | null>(null);
  const roomsRef       = useRef<Partial<Record<RoomId, RoomAudio>>>({});
  const currentRoomRef = useRef<RoomId>("courtyard");
  const readyRef       = useRef(false);

  function getCtx(): AudioContext {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = 0.55;
      masterRef.current.connect(ctxRef.current.destination);
    }
    return ctxRef.current;
  }

  function makeFilteredNoise(
    src: AudioBufferSourceNode,
    filters: Array<{ type: BiquadFilterType; freq: number; q?: number }>,
    gainVal: number,
    dest: AudioNode
  ): void {
    const c = getCtx();
    let node: AudioNode = src;
    for (const f of filters) {
      const bf = c.createBiquadFilter();
      bf.type = f.type; bf.frequency.value = f.freq; bf.Q.value = f.q ?? 1;
      node.connect(bf); node = bf;
    }
    const g = c.createGain(); g.gain.value = gainVal;
    node.connect(g); g.connect(dest);
  }

  function buildRoom(room: RoomId): RoomAudio {
    const c = getCtx(); const m = masterRef.current!;
    const gain = c.createGain(); gain.gain.value = 0; gain.connect(m);
    const sources: AudioBufferSourceNode[] = [];

    const loop = (buf: AudioBuffer): AudioBufferSourceNode => {
      const s = c.createBufferSource(); s.buffer = buf; s.loop = true; return s;
    };

    const pink  = makePinkNoise(c);
    const brown = makeBrownNoise(c);
    const white = makeWhiteNoise(c);

    if (room === "courtyard") {
      const w = loop(pink);  makeFilteredNoise(w, [{type:"bandpass",freq:520,q:0.65},{type:"lowpass",freq:1100}], 0.38, gain);
      const n = loop(brown); makeFilteredNoise(n, [{type:"lowpass",freq:180}], 0.055, gain);
      w.start(); n.start(); sources.push(w, n);
    } else if (room === "library") {
      const f  = loop(brown); makeFilteredNoise(f,  [{type:"bandpass",freq:90,q:0.5},{type:"lowpass",freq:350}], 0.32, gain);
      const cr = loop(white); makeFilteredNoise(cr, [{type:"highpass",freq:3000}], 0.04, gain);
      f.start(); cr.start(); sources.push(f, cr);
    } else if (room === "salon") {
      const w = loop(pink);  makeFilteredNoise(w, [{type:"lowpass",freq:280}], 0.22, gain);
      const a = loop(brown); makeFilteredNoise(a, [{type:"lowpass",freq:120}], 0.03, gain);
      w.start(); a.start(); sources.push(w, a);
    } else if (room === "cuisine") {
      const f  = loop(brown); makeFilteredNoise(f,  [{type:"bandpass",freq:75,q:0.4},{type:"lowpass",freq:400}], 0.45, gain);
      const cr = loop(white); makeFilteredNoise(cr, [{type:"bandpass",freq:2500,q:0.3}], 0.06, gain);
      f.start(); cr.start(); sources.push(f, cr);
    } else if (room === "hammam") {
      const v = loop(white); makeFilteredNoise(v, [{type:"highpass",freq:2200},{type:"lowpass",freq:6000}], 0.14, gain);
      const w = loop(pink);  makeFilteredNoise(w, [{type:"bandpass",freq:450,q:1.2}], 0.28, gain);
      v.start(); w.start(); sources.push(v, w);
    }
    return { gain, sources };
  }

  const init = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    const c = getCtx();
    if (c.state === "suspended") c.resume();
    // Pré-construire la cour
    if (!roomsRef.current.courtyard) {
      roomsRef.current.courtyard = buildRoom("courtyard");
    }
    roomsRef.current.courtyard!.gain.gain.setTargetAtTime(0.8, c.currentTime, 0.5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRoom = useCallback((newRoom: RoomId) => {
    if (!readyRef.current) return;
    const c = getCtx(); const now = c.currentTime;
    // Fade out ancienne pièce
    const old = roomsRef.current[currentRoomRef.current];
    if (old) old.gain.gain.setTargetAtTime(0, now, 0.4);
    // Construire + fade in nouvelle pièce
    if (!roomsRef.current[newRoom]) roomsRef.current[newRoom] = buildRoom(newRoom);
    roomsRef.current[newRoom]!.gain.gain.setTargetAtTime(0.8, now + 0.4, 0.5);
    currentRoomRef.current = newRoom;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playFootstep = useCallback(() => {
    if (!readyRef.current) return;
    const c = getCtx(); const now = c.currentTime;
    [0, 0.32].forEach((delay, i) => {
      const len = Math.floor(c.sampleRate * 0.14);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let j=0;j<len;j++) d[j]=Math.random()*2-1;
      const src = c.createBufferSource(); src.buffer = buf;
      const bp = c.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=100+i*20; bp.Q.value=0.6;
      const env = c.createGain();
      const t = now+delay;
      env.gain.setValueAtTime(0,t);
      env.gain.linearRampToValueAtTime(0.28,t+0.01);
      env.gain.exponentialRampToValueAtTime(0.001,t+0.14);
      src.connect(bp); bp.connect(env); env.connect(masterRef.current!);
      src.start(t); src.stop(t+0.16);
    });
  }, []);

  const playSuccess = useCallback(() => {
    if (!readyRef.current) return;
    const c = getCtx(); const now = c.currentTime;
    [392,523,659,784].forEach((freq,i) => {
      const osc = c.createOscillator(); osc.type="sine"; osc.frequency.value=freq;
      const env = c.createGain(); const t=now+i*0.13;
      env.gain.setValueAtTime(0,t);
      env.gain.linearRampToValueAtTime(0.18,t+0.06);
      env.gain.exponentialRampToValueAtTime(0.001,t+0.6);
      osc.connect(env); env.connect(masterRef.current!);
      osc.start(t); osc.stop(t+0.65);
    });
  }, []);

  const playFail = useCallback(() => {
    if (!readyRef.current) return;
    const c = getCtx(); const now = c.currentTime;
    [330,220].forEach((freq,i) => {
      const osc = c.createOscillator(); osc.type="sawtooth"; osc.frequency.value=freq;
      const env = c.createGain(); const t=now+i*0.18;
      env.gain.setValueAtTime(0,t);
      env.gain.linearRampToValueAtTime(0.12,t+0.04);
      env.gain.exponentialRampToValueAtTime(0.001,t+0.45);
      osc.connect(env); env.connect(masterRef.current!);
      osc.start(t); osc.stop(t+0.5);
    });
  }, []);

  useEffect(() => () => {
    // Cleanup
    Object.values(roomsRef.current).forEach(r => r?.sources.forEach(s => { try { s.stop(); } catch { /* ignore */ } }));
    ctxRef.current?.close();
  }, []);

  return { init, changeRoom, playFootstep, playSuccess, playFail };
}
