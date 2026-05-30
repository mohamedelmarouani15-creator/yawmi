export interface EscapeSettings {
  ambientVolume:  number;   // 0–1 : sons ambiants par pièce
  uiVolume:       number;   // 0–1 : pas, succès, échec
  vibrations:     boolean;  // retour haptique (Vibration API)
  sensitivity:    number;   // 0.5–2.0 : multiplicateur sensibilité swipe
  quality:        "low" | "high"; // low = sans SMAA, high = SMAA+Bloom
  transitionSpeed: "slow" | "normal" | "fast"; // durée du fade entre pièces
}

export const DEFAULT: EscapeSettings = {
  ambientVolume:   0.75,
  uiVolume:        0.80,
  vibrations:      true,
  sensitivity:     1.0,
  quality:         "high",
  transitionSpeed: "normal",
};

const KEY = "yawmi_escape_settings";

export function loadEscapeSettings(): EscapeSettings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveEscapeSettings(s: EscapeSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const TRANSITION_MS: Record<EscapeSettings["transitionSpeed"], number> = {
  slow:   600,
  normal: 300,
  fast:   150,
};

/** Retour haptique — respecte le réglage vibrations */
export function vibrate(pattern: number | number[], settings: EscapeSettings): void {
  if (!settings.vibrations) return;
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
