import type { CalcMethodKey } from "./prayer";

export interface YawmiSettings {
  cityName:  string;
  lat:       number;
  lng:       number;
  method:    CalcMethodKey;
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
  cityName: "Paris",
  lat:      48.8566,
  lng:      2.3522,
  method:   "MuslimWorldLeague",
};

export const storage = {
  getSettings:    ()  => get<YawmiSettings>(KEYS.settings, DEFAULT_SETTINGS),
  saveSettings:   (s: YawmiSettings) => set(KEYS.settings, s),

  getTasks:       ()  => get<Task[]>(KEYS.tasks, []),
  saveTasks:      (t: Task[]) => set(KEYS.tasks, t),

  getDhikrLog:    ()  => get<DhikrSession[]>(KEYS.dhikr, []),
  saveDhikrLog:   (d: DhikrSession[]) => set(KEYS.dhikr, d),

  getReading:     ()  => get<ReadingProgress>(KEYS.reading, { surah: 1, ayah: 1 }),
  saveReading:    (r: ReadingProgress) => set(KEYS.reading, r),
};

export function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}
