export type Category = "theologie" | "histoire" | "coran" | "arabe" | "ethique" | "sira" | "fiqh";

/**
 * Progression d'un thème dans une ville.
 * completed = true dès que le quiz de 10 questions a été joué jusqu'au bout,
 * quel que soit le score. Le score est conservé pour l'affichage uniquement.
 */
export interface ThemeProgress {
  completed:    boolean;  // quiz joué entièrement → thème validé
  bestScore:    number;   // meilleur score sur 10 (affichage)
  attempts:     number;   // nombre de fois que le quiz a été complété
  lastPlayedAt: string;   // ISO timestamp
}

export type DailyQuestType    = "quiz_win" | "correct_answers" | "story_chapter" | "calligraphy" | "timeline_correct";
export type WeeklyChallengeType = "stages_complete" | "perfect_quizzes" | "total_correct" | "calligraphy_correct" | "timeline_correct" | "arcs_read";

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  type: WeeklyChallengeType;
  target: number;
  progress: number;
  completed: boolean;
  weekStartDate: string;   // ISO date of Monday
  rewardXP: number;
  rewardCoins: number;
  rewardEnergy: number;
}

export interface DailyQuest {
  id: string;
  type: DailyQuestType;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  rewardXP: number;
  rewardCoins: number;
  rewardEnergy?: number;
}
export type QuestionType = "mcq" | "true_false" | "fill_in" | "reorder" | "drag_drop" | "memory" | "fill_verse" | "who_am_i" | "calligraphy" | "timeline" | "scholars_match";
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
  // timeline: chronological ordering
  events?: Array<{ text: string; year: number; hint?: string }>;
  // scholars_match: 4 scholars ↔ 4 works
  matchPairs?: Array<{ scholar: string; work: string; hint?: string }>;
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
  // energy system
  energy: number;              // current energy (max 30)
  lastEnergyUpdate: string | null; // ISO timestamp of last spend/recharge sync
  // location stage progression
  locationStages: Record<string, number>; // locationId → stages completed (0–3)
  // mastery system
  categoryMastery: Record<Category, number>;   // 0–100 per category
  categoryXP: Partial<Record<Category, number>>; // XP cumulatif par catégorie → dérive categoryLevels
  manuscripts: Record<string, number>;         // manuscriptId → pages collected
  completedArcs: string[];                     // story arc IDs fully completed
  dailyQuests: DailyQuest[];
  lastQuestDate: string | null;                // ISO date of last quest generation
  weeklyChallenge: WeeklyChallenge | null;
  prestigeLevel: number;                       // 0 = normal, 1+ = Hafiz prestige
  // energy penalty escalation (reset à minuit)
  energyDepletionCount: number;    // nb de fois épuisé aujourd'hui
  energyDepletionDate:  string | null; // YYYY-MM-DD de la dernière déplétion
  // theme-based location progression (Ville > Thèmes > Quiz)
  locationThemeProgress: Record<string, Partial<Record<Category, ThemeProgress>>>;
  // sync metadata
  lastUpdatedAt: string | null;                // ISO timestamp — détermine l'état le plus récent en cas de conflit multi-appareil
  // ── Streak récitation Coran ──────────────────────────────────────
  quranStreak:                  number;
  lastQuranDate:                string | null;
  quranStreakShields:            number;   // 0-3 boucliers disponibles
  quranBestStreak:              number;
  quranStreakShieldsEarnedAt:   number;   // valeur streak au dernier shield gagné
  quranAyahsToday:              number;   // versets récités aujourd'hui
  quranAyahsTodayDate:          string | null;
  // ── Streak jeu avec boucliers ────────────────────────────────────
  gameStreakShields:             number;   // 0-2 boucliers disponibles
  gameStreakShieldsEarnedAt:     number;   // valeur streak au dernier shield gagné
  gameBestStreak:                number;   // meilleur streak historique
}

export interface LocationTranslation { description?: string; country?: string; }
export interface SageTranslation { title?: string; dialogueIntro?: string; dialogueSuccess?: string; dialogueFailure?: string; }
export interface AchievementTranslation { title?: string; description?: string; }

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
  startedStoryIds: string[];  // story arcs user has started (for contextual questions)
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
