// Web Audio API engine for Maison de la Sagesse — no audio files, everything
// is procedural. Mirrors al-bayan/audio-engine.ts (même architecture, même
// réverb de salle de pierre) avec une signature harmonique propre (Ré
// majeur, plus lumineux/doré que le drone de quinte d'al-bayan).
// Call resumeAudio() after the first user gesture (AudioContext policy).

interface AudioState {
  ctx: AudioContext;
  ambientGain: GainNode;
  ambientStarted: boolean;
  reverb: ConvolverNode;
  reverbSend: GainNode;
  dry: GainNode;
}

let state: AudioState | null = null;

function makeImpulseResponse(ctx: AudioContext, durationSec = 3.2, decay = 2.8): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * durationSec);
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

function getState(): AudioState | null {
  if (typeof window === "undefined") return null;
  if (!state) {
    try {
      const ctx = new AudioContext();
      const ambientGain = ctx.createGain();
      ambientGain.gain.value = 0;

      const reverb = ctx.createConvolver();
      reverb.buffer = makeImpulseResponse(ctx);
      const reverbSend = ctx.createGain();
      reverbSend.gain.value = 0.36; // grand hall voûté — un peu plus ample qu'al-bayan
      const dry = ctx.createGain();
      dry.gain.value = 1;

      reverbSend.connect(reverb);
      reverb.connect(ctx.destination);
      dry.connect(ctx.destination);
      ambientGain.connect(dry);

      state = { ctx, ambientGain, ambientStarted: false, reverb, reverbSend, dry };
    } catch {
      return null;
    }
  }
  return state;
}

function connectWithReverb(s: AudioState, node: AudioNode) {
  node.connect(s.dry);
  node.connect(s.reverbSend);
}

export function resumeAudio() {
  const s = getState();
  if (!s) return;
  if (s.ctx.state === "suspended") s.ctx.resume().catch(() => {});
}

/** Drone ambiant — Ré majeur (73.4 Hz + 110 Hz, quinte) + LFO doux. */
export function startAmbient() {
  const s = getState();
  if (!s || s.ambientStarted) return;
  s.ambientStarted = true;

  try {
    const { ctx, ambientGain } = s;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.value = 73.42; // Ré2
    osc2.frequency.value = 110;   // La2

    const g1 = ctx.createGain();
    const g2 = ctx.createGain();
    g1.gain.value = 0.016;
    g2.gain.value = 0.011;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.065;
    lfoGain.gain.value = 0.004;
    lfo.connect(lfoGain);
    lfoGain.connect(g1.gain);
    lfo.start();

    osc1.connect(g1);
    osc2.connect(g2);
    g1.connect(ambientGain);
    g2.connect(ambientGain);
    osc1.start();
    osc2.start();

    ambientGain.gain.setTargetAtTime(1.0, ctx.currentTime, 2.5);
  } catch {}
}

export function stopAmbient() {
  if (!state) return;
  try {
    state.ambientGain.gain.setTargetAtTime(0, state.ctx.currentTime, 1.2);
  } catch {}
}

let lastFootstep = 0;

export function playFootstep() {
  const s = getState();
  if (!s) return;
  const now = s.ctx.currentTime;
  if (now - lastFootstep < 0.22) return;
  lastFootstep = now;

  try {
    const { ctx } = s;
    const duration = 0.055;
    const frames = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (frames * 0.28));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 240; // marbre — un poil plus grave que le grès d'al-bayan
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0.09;
    src.connect(filter);
    filter.connect(gain);
    connectWithReverb(s, gain);
    src.start();
  } catch {}
}

/** Tintement doré — survol d'un portail ou objet interactif. */
export function playInteract() {
  const s = getState();
  if (!s) return;
  try {
    const { ctx } = s;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(990, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.connect(gain);
    connectWithReverb(s, gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {}
}

/** Accord — résolution d'une énigme/quête (Ré majeur : D5 + F#5 + A5). */
export function playSolve() {
  const s = getState();
  if (!s) return;
  try {
    const { ctx } = s;
    const freqs = [587.33, 739.99, 880];
    const delays = [0, 0.09, 0.18];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + delays[i];
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.11, t0 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.9);
      osc.connect(gain);
      connectWithReverb(s, gain);
      osc.start(t0);
      osc.stop(t0 + 0.95);
    });
  } catch {}
}

/** Buzz dissonant court — combinaison du coffre incorrecte. */
export function playBuzz() {
  const s = getState();
  if (!s) return;
  try {
    const { ctx } = s;
    const freqs = [196, 185];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      connectWithReverb(s, gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    });
  } catch {}
}

/** Descente sombre — le temps est écoulé (échec). */
export function playFailure() {
  const s = getState();
  if (!s) return;
  try {
    const { ctx } = s;
    const freqs = [220, 196, 164.81];
    const delays = [0, 0.3, 0.6];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + delays[i];
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.1, t0 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.1);
      osc.connect(gain);
      connectWithReverb(s, gain);
      osc.start(t0);
      osc.stop(t0 + 1.15);
    });
  } catch {}
}

/** Fanfare de victoire — arpège ascendant Ré majeur sur deux octaves. */
export function playVictory() {
  const s = getState();
  if (!s) return;
  try {
    const { ctx } = s;
    const freqs = [293.66, 369.99, 440, 587.33, 739.99];
    const delays = [0, 0.14, 0.28, 0.42, 0.56];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i < 3 ? "triangle" : "sine";
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + delays[i];
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.13, t0 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.4);
      osc.connect(gain);
      connectWithReverb(s, gain);
      osc.start(t0);
      osc.stop(t0 + 1.45);
    });
  } catch {}
}
