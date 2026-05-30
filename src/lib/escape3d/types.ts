export interface PlayerState {
  id:       string;
  name:     string;
  color:    string;
  position: [number, number, number];
  rotation: number;
}

export interface PuzzleState {
  id:      string;
  status:  "locked" | "available" | "solving" | "solved";
  lockedBy?: string; // player id
}

export interface GameSession {
  id:       string;
  hostId:   string;
  players:  PlayerState[];
  puzzles:  Record<string, PuzzleState>;
  timer:    number;          // seconds remaining
  phase:    "waiting" | "playing" | "escaped" | "failed";
}

export interface PuzzleDef {
  id:          string;
  title:       string;
  description: string;
  objectId:    string;
  type:        "arabic_word" | "quran_verse" | "history" | "calligraphy";
  question:    string;
  hint1:       string;
  hint2:       string;
  hint3:       string;
  answer:      string;
  options?:    string[];   // options en arabe
  optionsFr?:  string[];   // traduction française des options
  phonetics?:  string[];   // translittération phonétique
  explanation: string;
  xpReward:    number;
  // Objet interactif : description pour le joueur
  roomHint:    string;     // ex: "Touche la lanterne dorée"
}

export const PLAYER_COLORS = [
  "#D4AF37", // or
  "#055C3F", // vert profond
  "#C0392B", // rouge rubis
  "#8E44AD", // violet
  "#2471A3", // bleu
  "#D35400", // orange
] as const;
