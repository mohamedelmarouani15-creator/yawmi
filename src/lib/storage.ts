import type { CalcMethodKey, MadhabKey } from "./prayer";

export interface YawmiSettings {
  cityName:     string;
  lat:          number;
  lng:          number;
  method:       CalcMethodKey;
  madhab:       MadhabKey;
  adhanMode:    "audio" | "silencieux";
  adhanReciter: string;
  prayerModes:  Partial<Record<string, "audio" | "silencieux">>;
  appMode:      "pratiquant" | "explorateur";
  arabicLevel:  "none" | "beginner" | "intermediate" | "advanced";
  sleepReciter?: string;
  themeMode:     "night" | "day" | "auto";
  // Profil onboarding (ajouté V1.1)
  ageGroup:      "4-10" | "11-17" | "18-35" | "36-55" | "55+" | null;
  mainObjective: "apprendre" | "pratiquer" | "explorer" | null;
  motherTongue:  "français" | "arabe" | "darija" | "autre" | null;
}

export interface PrayerLog {
  date:  string; // YYYY-MM-DD
  done:  Partial<Record<string, boolean>>;
}

export interface Task {
  id:        string;
  text:      string;
  member:    string;
  done:      boolean;
  createdAt: number;
}

export interface DhikrSession {
  date:    string; // YYYY-MM-DD
  counts:  Record<string, number>; // dhikrId → count
}

export interface ReadingProgress {
  surah: number;
  ayah:  number;
}

const KEYS = {
  settings: "yawmi_settings",
  tasks:    "yawmi_tasks",
  dhikr:    "yawmi_dhikr",
  reading:  "yawmi_reading",
} as const;

function get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const DEFAULT_SETTINGS: YawmiSettings = {
  cityName:     "Paris",
  lat:          48.8566,
  lng:          2.3522,
  method:       "UOIF",
  madhab:       "Shafi",
  adhanMode:    "audio",
  adhanReciter: "alafasy",
  prayerModes:  {},
  appMode:      "pratiquant",
  arabicLevel:  "beginner",
  themeMode:    "night",
  ageGroup:     null,
  mainObjective: null,
  motherTongue:  null,
};

export const storage = {
  getSettings: (): YawmiSettings => ({
    ...DEFAULT_SETTINGS,
    ...get<Partial<YawmiSettings>>(KEYS.settings, {}),
  }),
  saveSettings:   (s: YawmiSettings) => set(KEYS.settings, s),

  getTasks:       ()  => get<Task[]>(KEYS.tasks, []),
  saveTasks:      (t: Task[]) => set(KEYS.tasks, t),

  getDhikrLog:    ()  => get<DhikrSession[]>(KEYS.dhikr, []),
  saveDhikrLog:   (d: DhikrSession[]) => set(KEYS.dhikr, d),

  getReading:     ()  => get<ReadingProgress>(KEYS.reading, { surah: 1, ayah: 1 }),
  saveReading:    (r: ReadingProgress) => set(KEYS.reading, r),

  getPrayerLog:   ()  => get<PrayerLog[]>("yawmi_prayer_log", []),
  savePrayerLog:  (l: PrayerLog[]) => set("yawmi_prayer_log", l),
};

export function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}
