import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MaisonSagesseState,
  GamePhase,
  EnigmaState,
  AgentMessage,
  Milestone,
} from './types';
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

function makeMilestone(minutesMark: number): Milestone {
  return { minutesMark, triggered: false, assessment: null };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── État initial ──────────────────────────────────────────────────────────

type StoreState = Omit<
  MaisonSagesseState,
  | 'setPhase'
  | 'startGame'
  | 'tick'
  | 'markClueFound'
  | 'solveEnigma'
  | 'setCodeDigit'
  | 'tryOpenLock'
  | 'addAgentMessage'
  | 'markMilestone'
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

  activeAgent: null,
  agentMessages: [],

  milestones: {
    m15: makeMilestone(15),
    m30: makeMilestone(30),
    m40: makeMilestone(40),
  },
};

// ── Store ─────────────────────────────────────────────────────────────────

export const useMaisonSagesseStore = create<MaisonSagesseState>()(
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
          agentMessages: [],
          activeAgent: null,
          milestones: {
            m15: makeMilestone(15),
            m30: makeMilestone(30),
            m40: makeMilestone(40),
          },
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

        // Calcul du temps écoulé en minutes (GAME_DURATION = 2700s = 45 min)
        const elapsedSeconds = GAME_DURATION - newTimeLeft;
        const elapsedMinutes = Math.floor(elapsedSeconds / 60);

        const milestones = { ...state.milestones };
        let milestonesChanged = false;

        // Jalon 15 min : 900s écoulées → 1800s restantes
        if (elapsedMinutes >= 15 && !milestones.m15.triggered) {
          milestones.m15 = { ...milestones.m15, triggered: true };
          milestonesChanged = true;
        }
        // Jalon 30 min : 1800s écoulées → 900s restantes
        if (elapsedMinutes >= 30 && !milestones.m30.triggered) {
          milestones.m30 = { ...milestones.m30, triggered: true };
          milestonesChanged = true;
        }
        // Jalon 40 min : 2400s écoulées → 300s restantes
        if (elapsedMinutes >= 40 && !milestones.m40.triggered) {
          milestones.m40 = { ...milestones.m40, triggered: true };
          milestonesChanged = true;
        }

        set({
          timeLeft: newTimeLeft,
          ...(milestonesChanged ? { milestones } : {}),
        });
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

        const isCorrect =
          a === SOLUTION.a && b === SOLUTION.b && c === SOLUTION.c;

        if (isCorrect) {
          set({ lockOpen: true, isRunning: false, phase: 'victory' });
          return true;
        }

        set((s) => ({ codeAttempts: s.codeAttempts + 1 }));
        return false;
      },

      addAgentMessage: (
        msg: Omit<AgentMessage, 'id' | 'timestamp' | 'read'>
      ) => {
        const newMsg: AgentMessage = {
          ...msg,
          id: generateId(),
          timestamp: Date.now(),
          read: false,
        };

        set((state) => ({
          agentMessages: [...state.agentMessages, newMsg],
        }));
      },

      markMilestone: (
        mark: 'm15' | 'm30' | 'm40',
        assessment: Milestone['assessment']
      ) => {
        set((state) => ({
          milestones: {
            ...state.milestones,
            [mark]: { ...state.milestones[mark], triggered: true, assessment },
          },
        }));
      },

      resetGame: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'yawmi_maison_sagesse',
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
        activeAgent: state.activeAgent,
        agentMessages: state.agentMessages,
        milestones: state.milestones,
      }),
    }
  )
);
