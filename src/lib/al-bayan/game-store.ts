import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AlBayanState, GamePhase } from './types';
import { GAME_DURATION, JAR_CODE } from './puzzle-logic';

// ── État initial ──────────────────────────────────────────────────────────

type StoreState = Omit<
  AlBayanState,
  | 'setPhase'
  | 'startGame'
  | 'tick'
  | 'solveAstrolabe'
  | 'findLibraryClue'
  | 'solveManuscripts'
  | 'readJars'
  | 'openSafe'
  | 'placeLens'
  | 'useHint'
  | 'resetGame'
>;

const initialState: StoreState = {
  phase: 'idle',
  timeLeft: GAME_DURATION,
  isRunning: false,
  startedAt: null,
  playerCount: 1,

  astrolabeSolved: false,
  majlisUnlocked: false,

  libraryClueFound: false,
  manuscriptsSolved: false,
  cuisineUnlocked: false,

  jarsRead: false,
  safeOpen: false,
  lensCollected: false,

  lensPlaced: false,
  exitRevealed: false,

  hintsUsed: 0,
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
          phase: 'playing',
          isRunning: true,
          timeLeft: GAME_DURATION,
          startedAt: Date.now(),
          playerCount,
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

      solveAstrolabe: () => set({ astrolabeSolved: true, majlisUnlocked: true }),

      findLibraryClue: () => set({ libraryClueFound: true }),

      solveManuscripts: () => {
        const state = get();
        if (!state.libraryClueFound) return; // forcer l'exploration méthodique
        set({ manuscriptsSolved: true, cuisineUnlocked: true });
      },

      readJars: () => set({ jarsRead: true }),

      openSafe: (code: number[]) => {
        const isCorrect = code.length === JAR_CODE.length && code.every((d, i) => d === JAR_CODE[i]);
        if (isCorrect) {
          set({ safeOpen: true, lensCollected: true });
          return true;
        }
        return false;
      },

      placeLens: () => {
        const state = get();
        if (!state.lensCollected) return;
        set({ lensPlaced: true, exitRevealed: true, isRunning: false, phase: 'victory' });
      },

      useHint: () => set((s) => ({ hintsUsed: Math.min(3, s.hintsUsed + 1) })),

      resetGame: () => set({ ...initialState }),
    }),
    {
      name: 'yawmi_al_bayan',
      partialize: (state) => ({
        phase: state.phase,
        timeLeft: state.timeLeft,
        isRunning: state.isRunning,
        startedAt: state.startedAt,
        playerCount: state.playerCount,
        astrolabeSolved: state.astrolabeSolved,
        majlisUnlocked: state.majlisUnlocked,
        libraryClueFound: state.libraryClueFound,
        manuscriptsSolved: state.manuscriptsSolved,
        cuisineUnlocked: state.cuisineUnlocked,
        jarsRead: state.jarsRead,
        safeOpen: state.safeOpen,
        lensCollected: state.lensCollected,
        lensPlaced: state.lensPlaced,
        exitRevealed: state.exitRevealed,
        hintsUsed: state.hintsUsed,
      }),
    }
  )
);
