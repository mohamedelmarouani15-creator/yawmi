import type { QuestionHistory } from "./types";

// SM-2 variant adapted for a game context.
// quality: 5 = correct & fast, 3 = correct & slow, 0 = wrong

export function updateSM2(
  history: QuestionHistory | undefined,
  isCorrect: boolean,
  quality: 0 | 3 | 5,
): QuestionHistory {
  const prev: QuestionHistory = history ?? {
    timesSeen: 0,
    timesCorrect: 0,
    easinessFactor: 2.5,
    intervalDays: 1,
    nextDue: new Date().toISOString().split("T")[0],
  };

  const q = isCorrect ? quality : 0;

  // New easiness factor (clamped to [1.3, 2.5])
  const rawEF = prev.easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  const newEF = Math.min(2.5, Math.max(1.3, rawEF));

  // New interval
  let newInterval: number;
  if (!isCorrect) {
    newInterval = 1; // reset on failure
  } else {
    const correct = prev.timesCorrect;
    if (correct === 0) newInterval = 1;
    else if (correct === 1) newInterval = 6;
    else newInterval = Math.round(prev.intervalDays * newEF);
  }

  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + newInterval);

  return {
    timesSeen: prev.timesSeen + 1,
    timesCorrect: prev.timesCorrect + (isCorrect ? 1 : 0),
    easinessFactor: Math.round(newEF * 100) / 100,
    intervalDays: newInterval,
    nextDue: nextDue.toISOString().split("T")[0],
  };
}

export function isDue(history: QuestionHistory | undefined): boolean {
  if (!history) return true; // never seen = always due
  const today = new Date().toISOString().split("T")[0];
  return history.nextDue <= today;
}

export function accuracyRate(h: QuestionHistory): number {
  if (h.timesSeen === 0) return 0;
  return h.timesCorrect / h.timesSeen;
}
