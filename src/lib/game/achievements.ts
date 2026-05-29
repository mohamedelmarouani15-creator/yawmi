import type { AchievementDef, GameState } from "./types";

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_correct",
    title: "Première lumière",
    description: "Répondre à ta première question juste",
    icon: "⭐",
    condition: (s) => s.totalCorrectAnswers >= 1,
  },
  {
    id: "sage_1",
    title: "Cartographe apprenti",
    description: "Vaincre ton premier sage",
    icon: "🗺️",
    condition: (s) => s.defeatedSages.length >= 1,
  },
  {
    id: "sage_3",
    title: "Savant en herbe",
    description: "Vaincre 3 sages",
    icon: "📚",
    condition: (s) => s.defeatedSages.length >= 3,
  },
  {
    id: "sage_all",
    title: "Maître des sagesses",
    description: "Vaincre tous les sages",
    icon: "👑",
    condition: (s) => s.defeatedSages.length >= 8,
  },
  {
    id: "streak_3",
    title: "Assidu",
    description: "3 jours de suite",
    icon: "🔥",
    condition: (s) => s.gameStreak >= 3,
  },
  {
    id: "streak_7",
    title: "Fidèle",
    description: "7 jours de suite",
    icon: "💎",
    condition: (s) => s.gameStreak >= 7,
  },
  {
    id: "streak_30",
    title: "Pèlerin patient",
    description: "30 jours de suite",
    icon: "🕌",
    condition: (s) => s.gameStreak >= 30,
  },
  {
    id: "questions_50",
    title: "Curieux",
    description: "50 questions répondues",
    icon: "❓",
    condition: (s) => s.totalQuestionsAnswered >= 50,
  },
  {
    id: "questions_100",
    title: "Cent sagesses",
    description: "100 questions répondues",
    icon: "💯",
    condition: (s) => s.totalQuestionsAnswered >= 100,
  },
  {
    id: "questions_500",
    title: "Encyclopédiste",
    description: "500 questions répondues",
    icon: "📖",
    condition: (s) => s.totalQuestionsAnswered >= 500,
  },
  {
    id: "perfect_game",
    title: "Parfait",
    description: "10/10 à un défi",
    icon: "✨",
    condition: (s) => s.achievements.includes("perfect_game"),
  },
  {
    id: "level_10",
    title: "Érudit",
    description: "Atteindre le niveau 10",
    icon: "🎓",
    condition: (s) => s.level >= 10,
  },
  {
    id: "level_25",
    title: "Sage",
    description: "Atteindre le niveau 25",
    icon: "🧙",
    condition: (s) => s.level >= 25,
  },
  {
    id: "level_50",
    title: "Grand maître",
    description: "Atteindre le niveau 50",
    icon: "⚡",
    condition: (s) => s.level >= 50,
  },
  {
    id: "coins_100",
    title: "Petit trésor",
    description: "Accumuler 100 pièces d'or",
    icon: "🪙",
    condition: (s) => s.coins >= 100,
  },
  {
    id: "mosque_1",
    title: "Bâtisseur",
    description: "Ajouter un premier objet à ta mosquée",
    icon: "🕌",
    condition: (s) => s.mosqueObjects.length >= 1,
  },
  {
    id: "category_quran",
    title: "Mémorisateur",
    description: "Atteindre niveau 5 en Coran",
    icon: "📿",
    condition: (s) => (s.categoryLevels.quran ?? 1) >= 5,
  },
  {
    id: "category_arabic",
    title: "Linguiste",
    description: "Atteindre niveau 5 en Arabe",
    icon: "ع",
    condition: (s) => (s.categoryLevels.arabic ?? 1) >= 5,
  },
  {
    id: "sage_card_all",
    title: "Bibliothécaire",
    description: "Collecter toutes les cartes de sages",
    icon: "🃏",
    condition: (s) => s.sageCards.length >= 8,
  },
  {
    id: "la_mecque",
    title: "Le pèlerin",
    description: "Atteindre La Mecque",
    icon: "🕋",
    condition: (s) => s.unlockedLocations.includes("la_mecque"),
  },
];

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Returns newly unlocked achievement IDs (those not already in state.achievements)
export function checkNewAchievements(state: GameState): string[] {
  return ACHIEVEMENTS
    .filter(a => !state.achievements.includes(a.id) && a.condition(state))
    .map(a => a.id);
}
