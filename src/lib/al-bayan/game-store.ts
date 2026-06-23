import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AlBayanState, GamePhase, EnigmaState } from './types';
import { SOLUTION, GAME_DURATION } from './puzzle-logic';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeEnigmaState(): EnigmaState {
  return {
    solved: false,
    digit: null,
    cluesFound: [],
    hintsUsed: 0,
    startedAt: null,
  };
}

// ── État initial ──────────────────────────────────────────────────────────

type StoreState = Omit<
  AlBayanState,
  | 'setPhase'
  | 'startGame'
  | 'tick'
  | 'markClueFound'
  | 'solveEnigma'
  | 'setCodeDigit'
  | 'tryOpenLock'
  | 'resetGame'
>;

const initialState: StoreState = {
  phase: 'idle',
  timeLeft: GAME_DURATION,
  isRunning: false,
  startedAt: null,
  playerCount: 1,

  enigmaA: makeEnigmaState(),
  enigmaB: makeEnigmaState(),
  enigmaC: makeEnigmaState(),

  codeLock: { a: null, b: null, c: null },
  lockOpen: false,
  codeAttempts: 0,
};

// ── Store ─────────────────────────────────────────────────────────────────

export const useAlBayanStore = create<AlBayanState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPhase: (phase: GamePhase) => set({ phase }),

      startGame: (playerCount: number) => {
        set({
          ...initialState,
          phase: 'intro',
          isRunning: true,
          timeLeft: GAME_DURATION,
          startedAt: Date.now(),
          playerCount,
          enigmaA: makeEnigmaState(),
          enigmaB: makeEnigmaState(),
          enigmaC: makeEnigmaState(),
          codeLock: { a: null, b: null, c: null },
          lockOpen: false,
          codeAttempts: 0,
        });
      },

      tick: () => {
        const state = get();
        if (!state.isRunning || state.phase === 'victory' || state.phase === 'failure') return;

        const newTimeLeft = state.timeLeft - 1;
        if (newTimeLeft <= 0) {
          set({ timeLeft: 0, isRunning: false, phase: 'failure' });
          return;
        }
        set({ timeLeft: newTimeLeft });
      },

      markClueFound: (enigma: 'A' | 'B' | 'C', clueId: string) => {
        const state = get();
        const key = `enigma${enigma}` as 'enigmaA' | 'enigmaB' | 'enigmaC';
        const current = state[key];

        if (current.cluesFound.includes(clueId)) return;

        const updated: EnigmaState = {
          ...current,
          cluesFound: [...current.cluesFound, clueId],
          startedAt: current.startedAt ?? Date.now(),
        };

        set({ [key]: updated });
      },

      solveEnigma: (enigma: 'A' | 'B' | 'C') => {
        const key = `enigma${enigma}` as 'enigmaA' | 'enigmaB' | 'enigmaC';
        const digit =
          enigma === 'A' ? SOLUTION.a : enigma === 'B' ? SOLUTION.b : SOLUTION.c;

        set((state) => ({
          [key]: { ...state[key], solved: true, digit },
        }));
      },

      setCodeDigit: (position: 'a' | 'b' | 'c', digit: number) => {
        set((state) => ({
          codeLock: { ...state.codeLock, [position]: digit },
        }));
      },

      tryOpenLock: () => {
        const state = get();
        const { a, b, c } = state.codeLock;

        const isCorrect = a === SOLUTION.a && b === SOLUTION.b && c === SOLUTION.c;

        if (isCorrect) {
          set({ lockOpen: true, isRunning: false, phase: 'victory' });
          return true;
        }

        set((s) => ({ codeAttempts: s.codeAttempts + 1 }));
        return false;
      },

      resetGame: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'yawmi_al_bayan',
      partialize: (state) => ({
        phase: state.phase,
        timeLeft: state.timeLeft,
        isRunning: state.isRunning,
        startedAt: state.startedAt,
        playerCount: state.playerCount,
        enigmaA: state.enigmaA,
        enigmaB: state.enigmaB,
        enigmaC: state.enigmaC,
        codeLock: state.codeLock,
        lockOpen: state.lockOpen,
        codeAttempts: state.codeAttempts,
      }),
    }
  )
);
