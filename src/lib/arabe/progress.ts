const KEY = "yawmi_arabe_progress";

export interface LessonProgress {
  completed: boolean;
  score: number;       // 0-1
  attempts: number;
  lastAt: string;      // ISO date
}

export interface ArabeProgress {
  completedLessons: Record<string, LessonProgress>;
  currentLessonId: string | null;
}

function load(): ArabeProgress {
  if (typeof window === "undefined") return { completedLessons: {}, currentLessonId: null };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { completedLessons: {}, currentLessonId: null };
  } catch {
    return { completedLessons: {}, currentLessonId: null };
  }
}

function save(p: ArabeProgress): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* plein */ }
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
};
