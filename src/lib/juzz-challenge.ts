// Juzz du jour — déterministe pour tous les utilisateurs
export function getTodayJuzz(): number {
  const start = new Date("2026-01-01").getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfYear = Math.floor((today.getTime() - start) / 86400000);
  return (Math.abs(dayOfYear) % 30) + 1;
}

// Première sourate de chaque Juzz (index 0 = Juzz 1)
const JUZZ_FIRST_SURAH = [
  1, 2, 2, 3, 4, 4, 5, 6, 7, 8,
  9, 11, 12, 15, 17, 18, 21, 23, 25, 27,
  29, 33, 36, 39, 41, 46, 51, 58, 67, 78,
];

// Dernière sourate de chaque Juzz
const JUZZ_LAST_SURAH = [
  1, 2, 2, 3, 4, 4, 5, 6, 7, 8,
  9, 11, 12, 16, 17, 18, 22, 25, 27, 29,
  33, 36, 39, 41, 45, 51, 57, 67, 78, 114,
];

export function getSurahRangeForJuzz(juzz: number): { first: number; last: number } {
  const idx = Math.min(Math.max(juzz - 1, 0), 29);
  return { first: JUZZ_FIRST_SURAH[idx], last: JUZZ_LAST_SURAH[idx] };
}

export interface JuzzChallengeStatus {
  juzz: number;
  ayahsToday: number;          // versets récités dans ce juzz aujourd'hui
  completed: boolean;           // >= 5 versets récités
  communityCount: number;       // nb de participants aujourd'hui
}

const CHALLENGE_KEY = "yawmi_juzz_challenge";

interface LocalChallenge {
  date: string;
  juzz: number;
  ayahsToday: number;
  completed: boolean;
}

function loadLocal(): LocalChallenge | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocal(data: LocalChallenge): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHALLENGE_KEY, JSON.stringify(data));
}

export function getLocalChallengeStatus(): JuzzChallengeStatus {
  const today = new Date().toISOString().split("T")[0];
  const juzz  = getTodayJuzz();
  const local = loadLocal();

  if (!local || local.date !== today || local.juzz !== juzz) {
    return { juzz, ayahsToday: 0, completed: false, communityCount: 0 };
  }
  return { juzz, ayahsToday: local.ayahsToday, completed: local.completed, communityCount: 0 };
}

export function recordJuzzRecitation(surahNumber: number): { bonusUnlocked: boolean } {
  const today = new Date().toISOString().split("T")[0];
  const juzz  = getTodayJuzz();
  const range = getSurahRangeForJuzz(juzz);

  // Vérifier si la sourate est dans le juzz du jour
  if (surahNumber < range.first || surahNumber > range.last) {
    return { bonusUnlocked: false };
  }

  const local   = loadLocal();
  const isToday = local?.date === today && local?.juzz === juzz;

  const ayahsToday  = isToday ? (local!.ayahsToday + 1) : 1;
  const completed   = ayahsToday >= 5;
  const wasComplete = isToday ? local!.completed : false;

  saveLocal({ date: today, juzz, ayahsToday, completed });

  // Si on vient de compléter (transition false → true)
  return { bonusUnlocked: completed && !wasComplete };
}

