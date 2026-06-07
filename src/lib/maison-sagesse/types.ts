// Phase de jeu
export type GamePhase =
  | 'idle'
  | 'intro'
  | 'main-hall'
  | 'quest-faith'
  | 'quest-science'
  | 'quest-wisdom'
  | 'code-lock'
  | 'victory'
  | 'failure';

// Progression d'une énigme
export interface EnigmaState {
  solved: boolean;
  digit: number | null;
  cluesFound: string[];
  hintsUsed: number; // 0-3
  startedAt: number | null; // timestamp
}

// Message d'un agent IA
export interface AgentMessage {
  id: string;
  agentId: 'directeur' | 'manager' | 'adjoint';
  text: string;
  timestamp: number;
  read: boolean;
  triggerContext: string; // ce qui a déclenché le message
}

// Jalon temporel
export interface Milestone {
  minutesMark: number; // 15, 30, 40
  triggered: boolean;
  assessment: 'ahead' | 'on-track' | 'behind' | null;
}

// État complet du jeu
export interface MaisonSagesseState {
  phase: GamePhase;
  timeLeft: number; // secondes, commence à 2700 (45 min)
  isRunning: boolean;
  startedAt: number | null; // timestamp
  playerCount: number; // 1-5

  enigmaA: EnigmaState; // Voie de la Foi → digit = 5
  enigmaB: EnigmaState; // Voie de la Science → digit = 7
  enigmaC: EnigmaState; // Voie de la Sagesse → digit = 6

  codeLock: { a: number | null; b: number | null; c: number | null };
  lockOpen: boolean;
  codeAttempts: number;

  activeAgent: 'directeur' | 'manager' | 'adjoint' | null;
  agentMessages: AgentMessage[];

  milestones: { m15: Milestone; m30: Milestone; m40: Milestone };

  // Actions
  setPhase: (phase: GamePhase) => void;
  startGame: (playerCount: number) => void;
  tick: () => void; // appelé chaque seconde
  markClueFound: (enigma: 'A' | 'B' | 'C', clueId: string) => void;
  solveEnigma: (enigma: 'A' | 'B' | 'C') => void;
  setCodeDigit: (position: 'a' | 'b' | 'c', digit: number) => void;
  tryOpenLock: () => boolean; // retourne true si 5-7-6
  addAgentMessage: (msg: Omit<AgentMessage, 'id' | 'timestamp' | 'read'>) => void;
  markMilestone: (mark: 'm15' | 'm30' | 'm40', assessment: Milestone['assessment']) => void;
  resetGame: () => void;
}
