// Phase de jeu — les "salles" sont maintenant gérées par les routes Next.js
// (/oasis/al-bayan, /temoignage, /rasm, /codicilles, /coffret) ; le store ne
// garde que les états transverses qui ne sont pas une salle navigable.
export type GamePhase = 'idle' | 'playing' | 'victory' | 'failure';

// Progression d'une énigme
export interface EnigmaState {
  solved: boolean;
  digit: number | null;
  cluesFound: string[];
  hintsUsed: number; // 0-3
  startedAt: number | null; // timestamp
}

// État complet du jeu
export interface AlBayanState {
  phase: GamePhase;
  timeLeft: number; // secondes, commence à 2700 (45 min)
  isRunning: boolean;
  startedAt: number | null;
  playerCount: number; // 1-5

  enigmaA: EnigmaState; // Le Poids du Témoignage → digit = 2
  enigmaB: EnigmaState; // Le Rasm Primitif → digit = 7
  enigmaC: EnigmaState; // La Route des Codicilles → digit = 4

  codeLock: { a: number | null; b: number | null; c: number | null };
  lockOpen: boolean;
  codeAttempts: number;

  // Actions
  setPhase: (phase: GamePhase) => void;
  startGame: (playerCount: number) => void;
  tick: () => void;
  markClueFound: (enigma: 'A' | 'B' | 'C', clueId: string) => void;
  solveEnigma: (enigma: 'A' | 'B' | 'C') => void;
  setCodeDigit: (position: 'a' | 'b' | 'c', digit: number) => void;
  tryOpenLock: () => boolean;
  resetGame: () => void;
}
