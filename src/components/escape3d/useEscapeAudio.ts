"use client";

import { useRef, useCallback, useEffect } from "react";
import type { RoomId } from "@/lib/escape3d/bounds";

// ─────────────────────────────────────────────────────────────────
// Philosophie : le son ambient doit se SENTIR sans s'entendre.
// Règles :
//   - Jamais de bandpass avec Q > 0.25 (crée des résonances métalliques)
//   - Jamais de highpass > 800 Hz pour les ambiances (sifflement)
//   - Chaînes de lowpass doubles pour une coupure douce et chaude
//   - Gains très bas : la musique silencieuse de l'espace
//   - Sinus uniquement pour les sons musicaux (jamais de sawtooth)
// ─────────────────────────────────────────────────────────────────

// ── Bruit rose (spectre chaud, naturel) ──────────────────────────
function makePink(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 6;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
    b2=0.969*b2+w*0.153852;   b3=0.8665*b3+w*0.3104856;
    b4=0.55*b4+w*0.5329522;   b5=-0.7616*b5-w*0.016898;
    d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;
    b6 = w * 0.115926;
  }
  return buf;
}

// ── Bruit brun (très grave, chaleureux) ──────────────────────────
function makeBrown(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 6;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = Math.max(-1, Math.min(1, last * 3.5));
  }
  return buf;
}

// ── Utilitaires Web Audio ─────────────────────────────────────────
function lp(ctx: AudioContext, freq: number): BiquadFilterNode {
  const f = ctx.createBiquadFilter();
  f.type = "lowpass"; f.frequency.value = freq; f.Q.value = 0.5;
  return f;
}

function gain(ctx: AudioContext, val: number, dest: AudioNode): GainNode {
  const g = ctx.createGain(); g.gain.value = val; g.connect(dest); return g;
}

// Double lowpass → coupure très douce, aucune résonance
function softLayer(
  ctx: AudioContext,
  buf: AudioBuffer,
  freq1: number,
  freq2: number,
  vol: number,
  dest: AudioNode
): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const f1 = lp(ctx, freq1);
  const f2 = lp(ctx, freq2);
  const g  = gain(ctx, vol, dest);
  src.connect(f1); f1.connect(f2); f2.connect(g);
  return src;
}

type RoomAudio = { gain: GainNode; sources: (AudioBufferSourceNode | OscillatorNode)[] };

// ── Hook principal ────────────────────────────────────────────────
export function useEscapeAudio() {
  const ctxRef         = useRef<AudioContext | null>(null);
  const masterRef      = useRef<GainNode | null>(null);
  const roomsRef       = useRef<Partial<Record<RoomId, RoomAudio>>>({});
  const currentRoomRef = useRef<RoomId>("courtyard");
  const readyRef       = useRef(false);

  function getCtx(): AudioContext {
    if (!ctxRef.current) {
      ctxRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
      masterRef.current = ctxRef.current.createGain();
      // Volume global très modéré — l'ambiance reste en arrière-plan
      masterRef.current.gain.value = 0.28;
      masterRef.current.connect(ctxRef.current.destination);
    }
    return ctxRef.current;
  }

  function buildRoom(room: RoomId): RoomAudio {
    const c = getCtx();
    const m = masterRef.current!;
    const roomGain = c.createGain();
    roomGain.gain.value = 0;
    roomGain.connect(m);
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

    const pink  = makePink(c);
    const brown = makeBrown(c);

    if (room === "courtyard") {
      // Eau : bruit rose → LP 500 → LP 240 (doux, comme un ruisseau lointain)
      const w = softLayer(c, pink, 500, 240, 0.13, roomGain);
      // Nuit : bruit brun → LP 80 → LP 50 (grave aérien, presque inaudible)
      const n = softLayer(c, brown, 80, 50, 0.035, roomGain);
      w.start(); n.start();
      sources.push(w, n);

    } else if (room === "library") {
      // Braises : bruit brun → LP 120 → LP 60 (chaleur basse fréquence)
      const f = softLayer(c, brown, 120, 60, 0.11, roomGain);
      // Souffle : bruit rose → LP 180 → LP 90 (air dans la pièce)
      const a = softLayer(c, pink, 180, 90, 0.055, roomGain);
      f.start(); a.start();
      sources.push(f, a);

    } else if (room === "salon") {
      // Brise douce : bruit rose → LP 200 → LP 100
      const b = softLayer(c, pink, 200, 100, 0.07, roomGain);
      // Grave fondamental : bruit brun → LP 60 → LP 40
      const d = softLayer(c, brown, 60, 40, 0.025, roomGain);
      b.start(); d.start();
      sources.push(b, d);

    } else if (room === "cuisine") {
      // Feu : bruit brun → LP 180 → LP 90 (grondement chaud, pas agressif)
      const f = softLayer(c, brown, 180, 90, 0.16, roomGain);
      // Chaleur : bruit rose → LP 300 → LP 150
      const h = softLayer(c, pink, 300, 150, 0.06, roomGain);
      f.start(); h.start();
      sources.push(f, h);

    } else if (room === "hammam") {
      // Vapeur : bruit rose → LP 350 → LP 180 (douceur aqueuse)
      const v = softLayer(c, pink, 350, 180, 0.10, roomGain);
      // Profondeur : bruit brun → LP 100 → LP 50 (résonance de la pierre)
      const d = softLayer(c, brown, 100, 50, 0.04, roomGain);
      // Gouttes : oscillateur sinusoïdal très lent à 0.6 Hz module un son d'eau
      const dropOsc = c.createOscillator();
      dropOsc.type = "sine"; dropOsc.frequency.value = 0.6; // 0.6 Hz = une goutte toutes les 1.7s
      const dropDepth = c.createGain(); dropDepth.gain.value = 0.022;
      const dropBase  = c.createGain(); dropBase.gain.value = 0.028;
      dropOsc.connect(dropDepth); dropDepth.connect(dropBase.gain);
      dropBase.connect(roomGain);
      // Eau filtrée pour les gouttes
      const dropWater = softLayer(c, pink, 800, 400, 0.0, roomGain); // gain 0 géré par LFO
      dropWater.connect(dropBase);
      v.start(); d.start(); dropOsc.start(); dropWater.start();
      sources.push(v, d, dropOsc, dropWater);
    }

    return { gain: roomGain, sources };
  }

  // ── API publique ────────────────────────────────────────────────

  const init = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    const c = getCtx();
    if (c.state === "suspended") c.resume();
    if (!roomsRef.current.courtyard) {
      roomsRef.current.courtyard = buildRoom("courtyard");
    }
    // Fade in très progressif (2s) pour ne pas surprendre
    roomsRef.current.courtyard!.gain.gain.setTargetAtTime(0.9, c.currentTime, 2.0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRoom = useCallback((newRoom: RoomId) => {
    if (!readyRef.current) return;
    const c = getCtx(); const now = c.currentTime;
    const old = roomsRef.current[currentRoomRef.current];
    if (old) old.gain.gain.setTargetAtTime(0, now, 0.6);
    if (!roomsRef.current[newRoom]) roomsRef.current[newRoom] = buildRoom(newRoom);
    roomsRef.current[newRoom]!.gain.gain.setTargetAtTime(0.9, now + 0.6, 0.8);
    currentRoomRef.current = newRoom;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Son de pas : deux sinus graves courts (pierre sous les pieds)
  const playFootstep = useCallback(() => {
    if (!readyRef.current) return;
    const c = getCtx(); const now = c.currentTime;
    [0, 0.28].forEach((delay, i) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 72 - i * 8; // 72 Hz puis 64 Hz
      const env = c.createGain();
      const t = now + delay;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.06, t + 0.008);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.connect(env); env.connect(masterRef.current!);
      osc.start(t); osc.stop(t + 0.1);
    });
  }, []);

  // Succès : arpège ascendant maqam (sol, la, do, mi) — sinus, très doux
  const playSuccess = useCallback(() => {
    if (!readyRef.current) return;
    const c = getCtx(); const now = c.currentTime;
    // G4-A4-C5-E5 : intervalle pentatonique doux
    [392, 440, 523, 659].forEach((freq, i) => {
      const osc = c.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const env = c.createGain(); const t = now + i * 0.16;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.09, t + 0.10);   // attaque lente, douce
      env.gain.setTargetAtTime(0, t + 0.20, 0.35);         // decay exponentiel naturel
      osc.connect(env); env.connect(masterRef.current!);
      osc.start(t); osc.stop(t + 1.2);
    });
  }, []);

  // Mauvaise réponse : deux sinus descendants, très discrets
  const playFail = useCallback(() => {
    if (!readyRef.current) return;
    const c = getCtx(); const now = c.currentTime;
    // A3 → G3 : demi-ton descendant, triste mais pas agressif
    [220, 196].forEach((freq, i) => {
      const osc = c.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const env = c.createGain(); const t = now + i * 0.22;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.06, t + 0.05);
      env.gain.setTargetAtTime(0, t + 0.12, 0.25);
      osc.connect(env); env.connect(masterRef.current!);
      osc.start(t); osc.stop(t + 0.7);
    });
  }, []);

  useEffect(() => () => {
    Object.values(roomsRef.current).forEach(r =>
      r?.sources.forEach(s => { try { s.stop(); } catch { /* already stopped */ } })
    );
    ctxRef.current?.close();
  }, []);

  return { init, changeRoom, playFootstep, playSuccess, playFail };
}
