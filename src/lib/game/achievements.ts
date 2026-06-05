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
    id: "hafiz_start",
    title: "Première ayah mémorisée", titleAr: "أول آية محفوظة",
    description: "Mémoriser une première ayah en mode Hifz", descriptionAr: "احفظ أول آية في وضع الحفظ",
    icon: "🤲", condition: (s) => s.achievements.includes("hafiz_start"),
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

  // ── Stages & Maîtrise ─────────────────────────────────────────
  {
    id: "stage_first",
    title: "Découvreur", titleAr: "الكاشف",
    description: "Terminer la Découverte d'un lieu", descriptionAr: "أكمل مرحلة الاستكشاف في مكان",
    icon: "🌟", condition: (s) => Object.values(s.locationStages ?? {}).some(v => v >= 1),
  },
  {
    id: "stage_trial",
    title: "Éprouvé", titleAr: "الممتحَن",
    description: "Terminer l'Épreuve d'un lieu", descriptionAr: "أكمل مرحلة الامتحان في مكان",
    icon: "⚔️", condition: (s) => Object.values(s.locationStages ?? {}).some(v => v >= 2),
  },
  {
    id: "stage_mastery",
    title: "Maître d'un lieu", titleAr: "سيّد المكان",
    description: "Atteindre la Maîtrise dans un lieu", descriptionAr: "بلّغ الإتقان في مكان",
    icon: "🏆", condition: (s) => Object.values(s.locationStages ?? {}).some(v => v >= 3),
  },
  {
    id: "stage_mastery_5",
    title: "Grand Maître", titleAr: "الأستاذ الكبير",
    description: "Maîtriser 5 lieux différents", descriptionAr: "أتقن 5 أماكن مختلفة",
    icon: "👑", condition: (s) => Object.values(s.locationStages ?? {}).filter(v => v >= 3).length >= 5,
  },
  {
    id: "mastery_50",
    title: "Mi-chemin", titleAr: "في منتصف الطريق",
    description: "Atteindre 50% de maîtrise dans une catégorie", descriptionAr: "بلّغ 50% إتقاناً في فئة",
    icon: "📊", condition: (s) => Object.values(s.categoryMastery ?? {}).some(v => v >= 50),
  },
  {
    id: "mastery_all_50",
    title: "Savant équilibré", titleAr: "العالم المتوازن",
    description: "50% de maîtrise dans toutes les catégories", descriptionAr: "50% إتقاناً في جميع الفئات",
    icon: "⚖️", condition: (s) => Object.values(s.categoryMastery ?? {}).every(v => v >= 50),
  },
  {
    id: "mastery_80",
    title: "Expert", titleAr: "الخبير",
    description: "80% de maîtrise dans une catégorie", descriptionAr: "80% إتقاناً في فئة",
    icon: "💡", condition: (s) => Object.values(s.categoryMastery ?? {}).some(v => v >= 80),
  },

  // ── Manuscrits ────────────────────────────────────────────────
  {
    id: "manuscript_first",
    title: "Copiste", titleAr: "الناسخ",
    description: "Commencer à assembler un manuscrit", descriptionAr: "ابدأ في تجميع مخطوطة",
    icon: "📜", condition: (s) => Object.values(s.manuscripts ?? {}).some(v => v >= 1),
  },
  {
    id: "manuscript_complete",
    title: "Archiviste", titleAr: "الأرشيفي",
    description: "Compléter un manuscrit entier", descriptionAr: "أكمل مخطوطة كاملة",
    icon: "📕", condition: (s) => {
      const { MANUSCRIPTS } = require("./stages") as typeof import("./stages");
      return MANUSCRIPTS.some(m => (s.manuscripts?.[m.id] ?? 0) >= m.pages);
    },
  },
  {
    id: "manuscript_all",
    title: "Ibn al-Nadim", titleAr: "ابن النديم",
    description: "Compléter les 5 manuscrits", descriptionAr: "أكمل الخمس المخطوطات",
    icon: "📚", condition: (s) => {
      const { MANUSCRIPTS } = require("./stages") as typeof import("./stages");
      return MANUSCRIPTS.every(m => (s.manuscripts?.[m.id] ?? 0) >= m.pages);
    },
  },

  // ── Énergie & Quêtes quotidiennes ─────────────────────────────
  {
    id: "quest_first",
    title: "Première quête", titleAr: "أول مهمة",
    description: "Compléter ta première quête du jour", descriptionAr: "أكمل أول مهمة يومية",
    icon: "✅", condition: (s) => (s.dailyQuests ?? []).some(q => q.completed),
  },
  {
    id: "quest_all",
    title: "Journée parfaite", titleAr: "يوم مثالي",
    description: "Compléter les 3 quêtes en une journée", descriptionAr: "أكمل المهام الثلاث في يوم واحد",
    icon: "🌈", condition: (s) => (s.dailyQuests ?? []).filter(q => q.completed).length >= 3,
  },

  // ── Histoires & Ères ──────────────────────────────────────────
  {
    id: "arc_first",
    title: "Lecteur", titleAr: "القارئ",
    description: "Terminer un premier arc narratif", descriptionAr: "أكمل أول قصة",
    icon: "📖", condition: (s) => (s.completedArcs ?? []).length >= 1,
  },
  {
    id: "arc_three",
    title: "Conteur", titleAr: "الراوي",
    description: "Terminer 3 arcs narratifs", descriptionAr: "أكمل 3 قصص",
    icon: "📕", condition: (s) => (s.completedArcs ?? []).length >= 3,
  },
  {
    id: "ere2_unlock",
    title: "Compagnon du Prophète", titleAr: "رفيق النبي",
    description: "Débloquer l'Ère II — L'Aube de l'Islam", descriptionAr: "افتح الحقبة الثانية",
    icon: "🌙", condition: (s) => {
      const { ERA_CONDITIONS } = require("./stages") as typeof import("./stages");
      const c = ERA_CONDITIONS.find((e: { eraIndex: number }) => e.eraIndex === 2);
      if (!c) return false;
      const avg = Math.round(Object.values(s.categoryMastery ?? {}).reduce((a: number, b: number) => a + b, 0) / 5);
      return s.level >= c.minLevel && (s.completedArcs ?? []).length >= c.minArcsRead && avg >= c.minAvgMastery;
    },
  },
  {
    id: "ere2_mastered",
    title: "Maître de l'Ère II", titleAr: "سيّد الحقبة الثانية",
    description: "Maîtriser tous les lieux de l'Ère II", descriptionAr: "أتقن جميع أماكن الحقبة الثانية",
    icon: "🌟", condition: (s) => {
      const locs = ["abyssinie","jerusalem","taif","medine_hijra","khaybar"];
      return locs.every(id => (s.locationStages?.[id] ?? 0) >= 3);
    },
  },

  // ── Calligraphie & Timeline ───────────────────────────────────
  {
    id: "calligraphy_5",
    title: "Calligraphe", titleAr: "الخطّاط",
    description: "Réussir 5 exercices de calligraphie", descriptionAr: "أنجح في 5 تمارين الخط",
    icon: "✍️", condition: (s) => (s.totalCorrectAnswers ?? 0) >= 5 && s.achievements.includes("calligraphy_5"),
    // Self-referential: triggered by progressQuest
  },
  {
    id: "timeline_master",
    title: "Chronologiste", titleAr: "المؤرّخ الزمني",
    description: "Réussir 10 quiz chronologie", descriptionAr: "أنجح في 10 تمارين ترتيب زمني",
    icon: "⏳", condition: (s) => s.achievements.includes("timeline_master"),
  },

  // ── Niveau & XP ───────────────────────────────────────────────
  {
    id: "level_50",
    title: "Imam", titleAr: "الإمام",
    description: "Atteindre le niveau 50", descriptionAr: "بلوغ المستوى 50",
    icon: "🌕", condition: (s) => s.level >= 50,
  },
  {
    id: "questions_1000",
    title: "Mil réponses", titleAr: "ألف إجابة",
    description: "1000 questions répondues", descriptionAr: "1000 سؤال مُجاب",
    icon: "🔢", condition: (s) => s.totalQuestionsAnswered >= 1000,
  },
  {
    id: "correct_500",
    title: "Précis", titleAr: "الدقيق",
    description: "500 réponses correctes", descriptionAr: "500 إجابة صحيحة",
    icon: "🎯", condition: (s) => s.totalCorrectAnswers >= 500,
  },
  {
    id: "streak_100",
    title: "Centurion", titleAr: "المئوي",
    description: "100 jours de suite", descriptionAr: "100 يوم متتالٍ",
    icon: "🏅", condition: (s) => s.gameStreak >= 100,
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
