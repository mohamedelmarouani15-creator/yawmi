export type Category = "religion" | "history" | "arabic" | "darija" | "quran";
export type QuestionType = "mcq" | "true_false" | "fill_in" | "reorder";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type PowerUpType = "joker50" | "bouclier" | "double_xp" | "time_freeze";

export interface QuestionOption {
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  category: Category;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options: QuestionOption[];
  explanation?: string;
  culturalCapsule?: { title: string; text: string };
  locationId?: string;
  eventId?: string;
}

export interface QuestionHistory {
  timesSeen: number;
  timesCorrect: number;
  easinessFactor: number;
  intervalDays: number;
  nextDue: string; // ISO date
}

export type PowerUpCounts = Record<PowerUpType, number>;

export interface GameState {
  xp: number;
  level: number;
  coins: number;
  currentLocation: string;
  gameStreak: number;
  lastGameDate: string | null;
  unlockedLocations: string[];
  defeatedSages: string[];
  categoryLevels: Record<Category, number>;
  questionHistory: Record<string, QuestionHistory>;
  powerupCounts: PowerUpCounts;
  achievements: string[];
  // rewards
  chestsAvailable: number;
  mosqueObjects: string[];
  sageCards: string[];
  titles: string[];
  activeTitle: string;
  // meta
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
}

export interface LocationDef {
  id: string;
  name: string;
  nameFr: string;
  country: string;
  requiredXP: number;
  sageId: string | null;
  description: string;
  color: string;
}

export interface SageDef {
  id: string;
  name: string;
  title: string;
  locationId: string;
  specialty: string;
  personality: string;
  portrait: string;
  dialogueIntro: string;
  dialogueSuccess: string;
  dialogueFailure: string;
  reward: { xp: number; coins: number };
  victoryRequirement: number;
}

export interface QuizSession {
  locationId: string;
  questions: Question[];
  currentIndex: number;
  answers: (boolean | null)[];
  selectedOption: number | null;
  showResult: boolean;
  finished: boolean;
  xpEarned: number;
  coinsEarned: number;
  startedAt: number;
  timeLeft: number;
  timerActive: boolean;
  // power-up session state
  hiddenOptions: number[];    // indices hidden by joker50
  bouclierActive: boolean;    // forgives next wrong answer
  bouclierUsed: boolean;      // bouclier was triggered this session
  doubleXpActive: boolean;    // double XP for current question
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (state: GameState) => boolean;
}

export interface DuelSession {
  id: string;
  challengerId: string;
  challengedId: string;
  questionIds: string[];
  challengerScore: number | null;
  challengedScore: number | null;
  status: "pending" | "completed" | "expired";
  winnerId: string | null;
  expiresAt: string;
}
