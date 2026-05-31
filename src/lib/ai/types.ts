// Types partagés de la couche IA — jamais importés côté client directement

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CompanionContext {
  // Profil utilisateur
  firstName:     string | null;
  arabicLevel:   "none" | "beginner" | "intermediate" | "advanced";
  appMode:       "pratiquant" | "explorateur";
  ageGroup?:     string | null;
  mainObjective?: string | null;
  motherTongue?:  string | null;
  // Performance jeu V2
  categoryLevels:  Record<string, number>; // { religion: 4, arabic: 2, … }
  gameStreak:      number;
  totalCorrect:    number;
  defeatedSages:   string[];
  // Histoire
  currentStory?: { id: string; chapter: number; title: string };
  // Apprentissage
  strongCategories: string[];
  weakCategories:   string[];
  learningStyle:    string | null;
  tonePreference:   "formal" | "warm" | "playful";
  // Conversation
  lastMessages: AIMessage[];   // 10 derniers messages max
  lastSessionDate: string | null;
}

export interface CompanionResponse {
  message: string;
  suggestedFollowUps?: string[];  // optionnel : suggestions de suite
}
