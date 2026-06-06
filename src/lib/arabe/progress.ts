const KEY = "yawmi_arabe_progress";

export interface LessonProgress {
  completed: boolean;
  score: number;       // 0-1
  attempts: number;
  lastAt: string;      // ISO date
}

export interface PracticeStats {
  pronunciationAttempts: number;
  pronunciationSuccesses: number;
  writingValidations: number;
  // Streak tracking
  lastPracticeDate: string;  // ISO date YYYY-MM-DD
  streakDays: number;
}

export interface ArabeProgress {
  completedLessons: Record<string, LessonProgress>;
  currentLessonId: string | null;
  stats: PracticeStats;
}

const DEFAULT_STATS: PracticeStats = {
  pronunciationAttempts: 0,
  pronunciationSuccesses: 0,
  writingValidations: 0,
  lastPracticeDate: "",
  streakDays: 0,
};

function load(): ArabeProgress {
  if (typeof window === "undefined") {
    return { completedLessons: {}, currentLessonId: null, stats: { ...DEFAULT_STATS } };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { completedLessons: {}, currentLessonId: null, stats: { ...DEFAULT_STATS } };
    const parsed = JSON.parse(raw) as Partial<ArabeProgress>;
    return {
      completedLessons: parsed.completedLessons ?? {},
      currentLessonId:  parsed.currentLessonId  ?? null,
      stats: { ...DEFAULT_STATS, ...(parsed.stats ?? {}) },
    };
  } catch {
    return { completedLessons: {}, currentLessonId: null, stats: { ...DEFAULT_STATS } };
  }
}

function save(p: ArabeProgress): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage full */ }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(stats: PracticeStats): PracticeStats {
  const today = todayISO();
  if (stats.lastPracticeDate === today) return stats; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yestISO = yesterday.toISOString().slice(0, 10);

  const newStreak =
    stats.lastPracticeDate === yestISO
      ? stats.streakDays + 1  // consecutive day
      : 1;                    // streak broken or first day

  return { ...stats, lastPracticeDate: today, streakDays: newStreak };
}

export const arabeProgress = {
  get: load,

  recordExercise(lessonId: string, correct: boolean): void {
    const p = load();
    const prev = p.completedLessons[lessonId] ?? { completed: false, score: 0, attempts: 0, lastAt: "" };
    const newScore = correct ? Math.max(prev.score, 1) : prev.score;
    p.completedLessons[lessonId] = {
      completed: correct || prev.completed,
      score: newScore,
      attempts: prev.attempts + 1,
      lastAt: new Date().toISOString(),
    };
    p.currentLessonId = lessonId;
    p.stats = updateStreak(p.stats);
    save(p);
  },

  recordPronunciation(lessonId: string, success: boolean): void {
    const p = load();
    p.stats = updateStreak({
      ...p.stats,
      pronunciationAttempts:  p.stats.pronunciationAttempts + 1,
      pronunciationSuccesses: p.stats.pronunciationSuccesses + (success ? 1 : 0),
    });
    // Also mark lesson as having been practiced
    if (!p.completedLessons[lessonId]) {
      p.completedLessons[lessonId] = { completed: false, score: 0, attempts: 0, lastAt: new Date().toISOString() };
    }
    save(p);
  },

  recordWriting(lessonId: string): void {
    const p = load();
    p.stats = updateStreak({
      ...p.stats,
      writingValidations: p.stats.writingValidations + 1,
    });
    if (!p.completedLessons[lessonId]) {
      p.completedLessons[lessonId] = { completed: false, score: 0, attempts: 0, lastAt: new Date().toISOString() };
    }
    save(p);
  },

  setCurrentLesson(lessonId: string): void {
    const p = load();
    p.currentLessonId = lessonId;
    save(p);
  },

  isCompleted(lessonId: string): boolean {
    return load().completedLessons[lessonId]?.completed ?? false;
  },

  completedCount(): number {
    return Object.values(load().completedLessons).filter(l => l.completed).length;
  },

  getStats(): PracticeStats {
    return load().stats;
  },
};
