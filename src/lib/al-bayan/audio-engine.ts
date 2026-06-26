// Web Audio API engine for al-bayan — no audio files, everything is procedural.
// Call resumeAudio() after the first user gesture (AudioContext policy).

interface AudioState {
  ctx: AudioContext;
  ambientGain: GainNode;
  ambientStarted: boolean;
}

let state: AudioState | null = null;

function getState(): AudioState | null {
  if (typeof window === "undefined") return null;
  if (!state) {
    try {
      const ctx = new AudioContext();
      const ambientGain = ctx.createGain();
      ambientGain.gain.value = 0;
      ambientGain.connect(ctx.destination);
      state = { ctx, ambientGain, ambientStarted: false };
    } catch {
      return null;
    }
  }
  return state;
}

export function resumeAudio() {
  const s = getState();
  if (!s) return;
  if (s.ctx.state === "suspended") s.ctx.resume().catch(() => {});
}

/** Drone ambiant — quinte parfaite (55 Hz + 82.5 Hz) + LFO trémolo. */
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
    osc1.frequency.value = 55;
    osc2.frequency.value = 82.5;

    const g1 = ctx.createGain();
    const g2 = ctx.createGain();
    g1.gain.value = 0.018;
    g2.gain.value = 0.012;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.005;
    lfo.connect(lfoGain);
    lfoGain.connect(g1.gain);
    lfo.start();

    osc1.connect(g1);
    osc2.connect(g2);
    g1.connect(ambientGain);
    g2.connect(ambientGain);
    osc1.start();
    osc2.start();

    // Fade-in ambiant sur 2.5s
    ambientGain.gain.setTargetAtTime(1.0, ctx.currentTime, 2.5);
  } catch { /* AudioContext peut être refusé */ }
}

export function stopAmbient() {
  if (!state) return;
  try {
    state.ambientGain.gain.setTargetAtTime(0, state.ctx.currentTime, 1.2);
  } catch {}
}

let lastFootstep = 0;

/** Bruit de pas — burst noise filtre passe-bande 280 Hz. */
export function playFootstep() {
  const s = getState();
  if (!s) return;
  const now = s.ctx.currentTime;
  if (now - lastFootstep < 0.22) return; // throttle
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
    filter.frequency.value = 280;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0.09;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch {}
}

/** Tintement court montant — survol d'un objet interactif. */
export function playInteract() {
  const s = getState();
  if (!s) return;
  try {
    const { ctx } = s;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(820, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1150, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {}
}

/** Accord majeur — résolution d'une énigme (A4 + C#5 + E5). */
export function playSolve() {
  const s = getState();
  if (!s) return;
  try {
    const { ctx } = s;
    const freqs = [440, 554, 659];
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
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.95);
    });
  } catch {}
}
