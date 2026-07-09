// Petit bus de "juice" caméra partagé par al-bayan et maison-sagesse : un
// tremblement bref + coup de zoom (FOV) déclenché à la résolution d'une
// énigme ou à la victoire. Décroissance en ease-out sur `durationSec`.
let shakeUntil = 0;
let shakeIntensity = 0;
let shakeDurationMs = 1000;

export function triggerShake(intensity: number, durationSec: number) {
  shakeIntensity = intensity;
  shakeDurationMs = durationSec * 1000;
  shakeUntil = performance.now() + shakeDurationMs;
}

export interface ShakeOffset {
  x: number;
  y: number;
  fovPunch: number;
}

export function getShakeOffset(): ShakeOffset {
  const now = performance.now();
  const remaining = shakeUntil - now;
  if (remaining <= 0) return { x: 0, y: 0, fovPunch: 0 };

  const t = remaining / shakeDurationMs; // 1 -> 0
  const falloff = t * t; // ease-out : fort au début, s'éteint vite
  const mag = shakeIntensity * falloff;

  return {
    x: Math.sin(now * 0.045) * mag,
    y: Math.cos(now * 0.057) * mag * 0.6,
    fovPunch: -mag * 2.2, // léger zoom-in (FOV réduit) au pic du secousse
  };
}
