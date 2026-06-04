export type Category = "religion" | "history" | "arabic" | "darija" | "quran";
export type QuestionType = "mcq" | "true_false" | "fill_in" | "reorder" | "drag_drop" | "memory" | "fill_verse" | "who_am_i" | "calligraphy";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type PowerUpType = "joker50" | "bouclier" | "double_xp" | "time_freeze";

export interface QuestionOption {
  text: string;
  correct: boolean;
  position?: number;       // for drag_drop: expected order index (0-based)
  transliteration?: string; // phonetic transcription for Arabic text
}

export interface MinigameData {
  // drag_drop: items shuffled, each has position = correct index
  items?: string[];
  // memory: pairs of cards
  pairs?: { front: string; back: string; frontTranslit?: string; backTranslit?: string }[];
  // fill_verse: verse text with ___ for blanks, answer index in options
  verse?: string;
  verseTranslit?: string; // phonetic of the verse
  // who_am_i: progressive clues revealed one by one
  clues?: string[];
  // calligraphy: the Arabic letter/word to trace + stroke hints
  letter?: string;
  letterTranslit?: string; // e.g. "Alif [a]"
  strokeHints?: string[];
  passCoverage?: number;
}

export interface QuestionTranslation {
  question?: string;
  options?: QuestionOption[];
  explanation?: string;
}

export interface Question {
  id: string;
  category: Category;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  question_ar?: string;
  transliteration?: string; // phonetic for Arabic question text
  options: QuestionOption[];
  options_ar?: QuestionOption[];
  explanation?: string;
  explanation_ar?: string;
  translations?: Partial<Record<string, QuestionTranslation>>; // en/es/tr/darija
  culturalCapsule?: { title: string; text: string };
  locationId?: string;
  eventId?: string;
  minigameData?: MinigameData;
  arabicRequired?: "none" | "beginner" | "intermediate" | "advanced";
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

export interface LocationTranslation { description?: string; country?: string; }
export interface SageTranslation { title?: string; dialogueIntro?: string; dialogueSuccess?: string; dialogueFailure?: string; }
export interface AchievementTranslation { title?: string; description?: string; }
export interface EscapeRoomTranslation { name?: string; description?: string; }
export interface EscapeLockTranslation { question?: string; options?: { text: string; correct: boolean }[]; hint?: string; }

export interface LocationDef {
  id: string;
  name: string;
  nameFr: string;
  country: string;
  countryAr?: string;
  requiredXP: number;
  sageId: string | null;
  description: string;
  descriptionAr?: string;
  color: string;
  t?: Partial<Record<string, LocationTranslation>>;
}

export interface SageDef {
  id: string;
  name: string;
  title: string;
  titleAr?: string;
  locationId: string;
  specialty: string;
  personality: string;
  portrait: string;
  dialogueIntro: string;
  dialogueIntroAr?: string;
  dialogueSuccess: string;
  dialogueSuccessAr?: string;
  dialogueFailure: string;
  dialogueFailureAr?: string;
  reward: { xp: number; coins: number };
  victoryRequirement: number;
  t?: Partial<Record<string, SageTranslation>>;
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
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  icon: string;
  condition: (state: GameState) => boolean;
  t?: Partial<Record<string, AchievementTranslation>>;
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
