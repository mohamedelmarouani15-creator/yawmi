// Phase de jeu — le monde est un seul open-world persistant (plus de routes
// par salle) ; le store ne garde que les états transverses.
export type GamePhase = 'idle' | 'playing' | 'victory' | 'failure';

// Progression d'une quête imbriquée (villa/riad) — chaque étape déverrouille
// physiquement la suivante (porte verrouillée, passage secret) plutôt que de
// simplement révéler un chiffre combiné à la fin.
export interface AlBayanState {
  phase: GamePhase;
  timeLeft: number; // secondes, commence à 2700 (45 min)
  isRunning: boolean;
  startedAt: number | null;
  playerCount: number; // 1-5

  // Énigme 1 — Astrolabe du Jardin -> déverrouille le Majlis
  astrolabeSolved: boolean;
  majlisUnlocked: boolean;

  // Énigme 2 — Manuscrits du Scriptorium -> déverrouille la Cuisine
  libraryClueFound: boolean; // indice trouvé sous le tapis du Majlis
  manuscriptsSolved: boolean;
  cuisineUnlocked: boolean;

  // Énigme 3 — Jarres de la Cuisine -> ouvre le coffre du Majlis
  jarsRead: boolean;
  safeOpen: boolean;
  lensCollected: boolean;

  // Énigme 4 — Lentille sur le lustre du Sanctuaire -> révèle la sortie
  lensPlaced: boolean;
  exitRevealed: boolean;

  hintsUsed: number; // 0-3, mutualisé sur les 45 minutes

  // Actions
  setPhase: (phase: GamePhase) => void;
  startGame: (playerCount: number) => void;
  tick: () => void;
  solveAstrolabe: () => void;
  findLibraryClue: () => void;
  solveManuscripts: () => void;
  readJars: () => void;
  openSafe: (code: number[]) => boolean;
  placeLens: () => void;
  useHint: () => void;
  resetGame: () => void;
}
