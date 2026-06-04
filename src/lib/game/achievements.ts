import type { AchievementDef, GameState } from "./types";

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_correct",
    title: "Première lumière", titleAr: "النور الأول",
    description: "Répondre à ta première question juste", descriptionAr: "أجب على أول سؤال صحيح",
    icon: "⭐", condition: (s) => s.totalCorrectAnswers >= 1,
  },
  {
    id: "sage_1",
    title: "Cartographe apprenti", titleAr: "رسّام الخرائط المبتدئ",
    description: "Vaincre ton premier sage", descriptionAr: "اغلب أول حكيم",
    icon: "🗺️", condition: (s) => s.defeatedSages.length >= 1,
  },
  {
    id: "sage_3",
    title: "Savant en herbe", titleAr: "عالم ناشئ",
    description: "Vaincre 3 sages", descriptionAr: "اغلب 3 حكماء",
    icon: "📚", condition: (s) => s.defeatedSages.length >= 3,
  },
  {
    id: "sage_all",
    title: "Maître des sagesses", titleAr: "سيّد الحكمة",
    description: "Vaincre tous les sages", descriptionAr: "اغلب جميع الحكماء",
    icon: "👑", condition: (s) => s.defeatedSages.length >= 8,
  },
  {
    id: "streak_3",
    title: "Assidu", titleAr: "المثابر",
    description: "3 jours de suite", descriptionAr: "3 أيام متتالية",
    icon: "🔥", condition: (s) => s.gameStreak >= 3,
  },
  {
    id: "streak_7",
    title: "Fidèle", titleAr: "الوفيّ",
    description: "7 jours de suite", descriptionAr: "7 أيام متتالية",
    icon: "💎", condition: (s) => s.gameStreak >= 7,
  },
  {
    id: "streak_30",
    title: "Pèlerin patient", titleAr: "الحاج الصابر",
    description: "30 jours de suite", descriptionAr: "30 يوماً متتالياً",
    icon: "🕌", condition: (s) => s.gameStreak >= 30,
  },
  {
    id: "questions_50",
    title: "Curieux", titleAr: "الفضولي",
    description: "50 questions répondues", descriptionAr: "50 سؤالاً مُجاباً",
    icon: "❓", condition: (s) => s.totalQuestionsAnswered >= 50,
  },
  {
    id: "questions_100",
    title: "Cent sagesses", titleAr: "مئة حكمة",
    description: "100 questions répondues", descriptionAr: "100 سؤال مُجاب",
    icon: "💯", condition: (s) => s.totalQuestionsAnswered >= 100,
  },
  {
    id: "questions_500",
    title: "Encyclopédiste", titleAr: "الموسوعي",
    description: "500 questions répondues", descriptionAr: "500 سؤال مُجاب",
    icon: "📖", condition: (s) => s.totalQuestionsAnswered >= 500,
  },
  {
    id: "perfect_game",
    title: "Parfait", titleAr: "مثالي",
    description: "10/10 à un défi", descriptionAr: "10/10 في تحدٍّ",
    icon: "✨", condition: (s) => s.achievements.includes("perfect_game"),
  },
  {
    id: "level_10",
    title: "Érudit", titleAr: "العالِم",
    description: "Atteindre le niveau 10", descriptionAr: "بلوغ المستوى 10",
    icon: "🎓", condition: (s) => s.level >= 10,
  },
  {
    id: "level_25",
    title: "Sage", titleAr: "الحكيم",
    description: "Atteindre le niveau 25", descriptionAr: "بلوغ المستوى 25",
    icon: "🧙", condition: (s) => s.level >= 25,
  },
  {
    id: "level_50",
    title: "Grand maître", titleAr: "الأستاذ الأكبر",
    description: "Atteindre le niveau 50", descriptionAr: "بلوغ المستوى 50",
    icon: "⚡", condition: (s) => s.level >= 50,
  },
  {
    id: "coins_100",
    title: "Petit trésor", titleAr: "الكنز الصغير",
    description: "Accumuler 100 pièces d'or", descriptionAr: "جمع 100 قطعة ذهبية",
    icon: "🪙", condition: (s) => s.coins >= 100,
  },
  {
    id: "mosque_1",
    title: "Bâtisseur", titleAr: "البنّاء",
    description: "Ajouter un premier objet à ta mosquée", descriptionAr: "أضف أول عنصر لمسجدك",
    icon: "🕌", condition: (s) => s.mosqueObjects.length >= 1,
  },
  {
    id: "category_quran",
    title: "Mémorisateur", titleAr: "الحافظ",
    description: "Atteindre niveau 5 en Coran", descriptionAr: "بلوغ المستوى 5 في القرآن",
    icon: "📿", condition: (s) => (s.categoryLevels.quran ?? 1) >= 5,
  },
  {
    id: "category_arabic",
    title: "Linguiste", titleAr: "اللغوي",
    description: "Atteindre niveau 5 en Arabe", descriptionAr: "بلوغ المستوى 5 في العربية",
    icon: "ع", condition: (s) => (s.categoryLevels.arabic ?? 1) >= 5,
  },
  {
    id: "sage_card_all",
    title: "Bibliothécaire", titleAr: "أمين المكتبة",
    description: "Collecter toutes les cartes de sages", descriptionAr: "اجمع جميع بطاقات الحكماء",
    icon: "🃏", condition: (s) => s.sageCards.length >= 8,
  },
  {
    id: "la_mecque",
    title: "Le pèlerin", titleAr: "الحاجّ",
    description: "Atteindre La Mecque", descriptionAr: "الوصول إلى مكة المكرمة",
    icon: "🕋", condition: (s) => s.unlockedLocations.includes("la_mecque"),
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
