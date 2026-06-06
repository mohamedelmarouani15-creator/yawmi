import type { LocationDef, Category, GameState } from "./types";

export const ALL_THEMES: Category[] = ["theologie", "histoire", "coran", "arabe", "ethique", "sira", "fiqh"];

/**
 * Un thème est validé lorsque l'utilisateur a répondu aux 10 questions du quiz
 * (completed = true). Le score n'est PAS un critère de déblocage.
 */
export function isThemeCompleted(state: GameState, locationId: string, category: Category): boolean {
  const entry = state.locationThemeProgress?.[locationId]?.[category];
  if (!entry) return false;
  // Backward compat : anciens saves stockaient un number (score correct)
  if (typeof entry === "number") return (entry as number) >= 7;
  return entry.completed === true;
}

/** Alias pour le code existant */
export const isThemeValidated = isThemeCompleted;

/**
 * Ville complète = les 7 thèmes ont chacun été joués jusqu'au bout.
 * Condition stricte : toutes les 7 séries de 10 questions complétées.
 */
export function isLocationCompleted(state: GameState, locationId: string): boolean {
  return ALL_THEMES.every(cat => isThemeCompleted(state, locationId, cat));
}

/** Retourne le nombre de thèmes complétés dans une ville (0-7). */
export function completedThemesCount(state: GameState, locationId: string): number {
  return ALL_THEMES.filter(cat => isThemeCompleted(state, locationId, cat)).length;
}

/** Retourne la progression d'un thème (bestScore, attempts) ou null. */
export function getThemeProgress(state: GameState, locationId: string, category: Category) {
  const entry = state.locationThemeProgress?.[locationId]?.[category];
  if (!entry) return null;
  if (typeof entry === "number") return { completed: (entry as number) >= 7, bestScore: entry as number, attempts: 1, lastPlayedAt: "" };
  return entry;
}

/** Ère I location order (index-based for unlock chain) */
const ERA1_ORDER = ["medine", "fes", "cordoue", "marrakech", "damas", "bagdad", "samarcande", "tombouctou", "le_caire", "la_mecque"];

export const LOCATIONS: LocationDef[] = [
  {
    id: "medine",
    name: "المدينة المنورة",
    nameFr: "Médine",
    country: "Arabie Saoudite", countryAr: "المملكة العربية السعودية",
    requiredXP: 0,
    sageId: null,
    description: "La ville du Prophète ﷺ. Ton point de départ vers la sagesse.",
    descriptionAr: "مدينة النبي ﷺ. نقطة انطلاقك نحو المعرفة.",
    color: "#D4AF37",
  },
  {
    id: "fes",
    name: "فاس",
    nameFr: "Fès",
    country: "Maroc", countryAr: "المغرب",
    requiredXP: 100,
    sageId: "al_idrissi",
    description: "Cité des savants et des médersa. Al-Idrissi y cartographia le monde.",
    descriptionAr: "مدينة العلماء والمدارس. رسم الإدريسي فيها خريطة العالم.",
    color: "#2e8b57",
  },
  {
    id: "cordoue",
    name: "قرطبة",
    nameFr: "Cordoue",
    country: "Espagne (Andalousie)", countryAr: "إسبانيا (الأندلس)",
    requiredXP: 300,
    sageId: "ibn_rushd",
    description: "La perle de l'Occident islamique. Averroès y réconcilia raison et foi.",
    descriptionAr: "جوهرة الغرب الإسلامي. وفّق فيها ابن رشد بين العقل والإيمان.",
    color: "#8B4513",
  },
  {
    id: "marrakech",
    name: "مراكش",
    nameFr: "Marrakech",
    country: "Maroc", countryAr: "المغرب",
    requiredXP: 600,
    sageId: "ibn_toumert",
    description: "La ville ocre, berceau des Almohades et de la Koutoubia.",
    descriptionAr: "المدينة الحمراء، مهد الموحدين ومسجد الكتبية.",
    color: "#CD853F",
  },
  {
    id: "damas",
    name: "دمشق",
    nameFr: "Damas",
    country: "Syrie", countryAr: "سوريا",
    requiredXP: 1000,
    sageId: "ibn_asaker",
    description: "La plus ancienne capitale islamique. Ibn Asaker y préserva 1300 biographies.",
    descriptionAr: "أقدم عاصمة إسلامية. حفظ فيها ابن عساكر 1300 سيرة.",
    color: "#4682B4",
  },
  {
    id: "bagdad",
    name: "بغداد",
    nameFr: "Bagdad",
    country: "Irak", countryAr: "العراق",
    requiredXP: 1500,
    sageId: "al_khwarizmi",
    description: "La Maison de la Sagesse. Al-Khwarizmi y inventa l'algèbre.",
    descriptionAr: "بيت الحكمة. ابتكر فيه الخوارزمي علم الجبر.",
    color: "#6B8E23",
  },
  {
    id: "samarcande",
    name: "سمرقند",
    nameFr: "Samarcande",
    country: "Ouzbékistan", countryAr: "أوزبكستان",
    requiredXP: 2000,
    sageId: "ibn_sina",
    description: "Carrefour des routes de la soie. Ibn Sina y rédigea le Canon de la médecine.",
    descriptionAr: "ملتقى طرق الحرير. ألّف فيها ابن سينا القانون في الطب.",
    color: "#9370DB",
  },
  {
    id: "tombouctou",
    name: "تمبكتو",
    nameFr: "Tombouctou",
    country: "Mali", countryAr: "مالي",
    requiredXP: 2800,
    sageId: "ahmad_baba",
    description: "La cité des 333 saints. Ahmad Baba y réunit 700 000 manuscrits.",
    descriptionAr: "مدينة الـ333 وليًّا. جمع فيها أحمد بابا 700 ألف مخطوطة.",
    color: "#D2691E",
  },
  {
    id: "le_caire",
    name: "القاهرة",
    nameFr: "Le Caire",
    country: "Égypte", countryAr: "مصر",
    requiredXP: 3800,
    sageId: "ibn_khaldoun",
    description: "Siège d'Al-Azhar. Ibn Khaldoun y fonda la sociologie moderne.",
    descriptionAr: "مقر الأزهر. أسّس فيها ابن خلدون علم الاجتماع الحديث.",
    color: "#DAA520",
  },
  {
    id: "la_mecque",
    name: "مكة المكرمة",
    nameFr: "La Mecque",
    country: "Arabie Saoudite", countryAr: "المملكة العربية السعودية",
    requiredXP: 5000,
    sageId: null,
    description: "Le sommet du voyage. Que ta quête de sagesse soit acceptée.",
    descriptionAr: "قمة الرحلة. تقبّل الله مسعاك نحو المعرفة.",
    color: "#FFD700",
  },

  // ── ÈRE II — L'Aube de l'Islam ──────────────────────────────────
  {
    id: "abyssinie",
    name: "أكسوم",
    nameFr: "Abyssinie",
    country: "Éthiopie (Royaume d'Aksum)", countryAr: "إثيوبيا (مملكة أكسوم)",
    requiredXP: 0,  // within Ère II, no XP gate — era condition is the gate
    sageId: "al_negus",
    description: "Premier refuge des musulmans. Le roi Al-Negus protégea les compagnons du Prophète ﷺ.",
    descriptionAr: "أول ملجأ للمسلمين. أكرم فيها النجاشي أصحاب النبي ﷺ.",
    color: "#16a34a",
  },
  {
    id: "jerusalem",
    name: "القدس",
    nameFr: "Jérusalem",
    country: "Palestine", countryAr: "فلسطين",
    requiredXP: 0,
    sageId: "bilal",
    description: "Première qibla. Le Prophète ﷺ y voyagea en une nuit lors de l'Isra' wal Mi'raj.",
    descriptionAr: "أولى القبلتين. أسرى النبي ﷺ إليها ليلاً في رحلة الإسراء والمعراج.",
    color: "#0284c7",
  },
  {
    id: "taif",
    name: "الطائف",
    nameFr: "Taïf",
    country: "Arabie Saoudite", countryAr: "المملكة العربية السعودية",
    requiredXP: 0,
    sageId: "salmane",
    description: "L'épreuve de Taïf — où le Prophète ﷺ fut repoussé mais ne désespéra jamais.",
    descriptionAr: "محنة الطائف — حيث رُفض النبي ﷺ ولم ييأس أبداً.",
    color: "#b45309",
  },
  {
    id: "medine_hijra",
    name: "يثرب — المدينة",
    nameFr: "Médine — La Hijra",
    country: "Arabie Saoudite", countryAr: "المملكة العربية السعودية",
    requiredXP: 0,
    sageId: "aisha",
    description: "L'Hégire et la construction de la première mosquée. L'islam prend racine.",
    descriptionAr: "الهجرة وبناء أول مسجد. الإسلام يترسّخ في يثرب.",
    color: "#34d399",
  },
  {
    id: "khaybar",
    name: "خيبر",
    nameFr: "Khaybar",
    country: "Arabie Saoudite", countryAr: "المملكة العربية السعودية",
    requiredXP: 0,
    sageId: "saad_ibn_muadh",
    description: "Khandak, Khaybar, les traités — les grandes batailles de la période médinoise.",
    descriptionAr: "الخندق وخيبر والمعاهدات — أبرز غزوات المرحلة المدنية.",
    color: "#7c3aed",
  },

  // ── ÈRE III — L'Âge d'Or ─────────────────────────────────────
  {
    id: "kairouan",
    name: "القيروان",
    nameFr: "Kairouan",
    country: "Tunisie", countryAr: "تونس",
    requiredXP: 0,
    sageId: "ibn_abi_zayd",
    description: "La perle du Maghreb. Fondée en 670, première grande ville islamique d'Afrique du Nord.",
    descriptionAr: "درّة المغرب. تأسست عام 670، أول مدينة إسلامية كبرى في شمال أفريقيا.",
    color: "#eab308",
  },
  {
    id: "alexandrie",
    name: "الإسكندرية",
    nameFr: "Alexandrie",
    country: "Égypte", countryAr: "مصر",
    requiredXP: 0,
    sageId: "ibn_haytham",
    description: "Ibn al-Haytham y révolutionna l'optique. Carrefour des savoirs du monde antique.",
    descriptionAr: "ثوّر فيها ابن الهيثم علم البصريات. ملتقى معارف العالم القديم.",
    color: "#0ea5e9",
  },
  {
    id: "chiraz",
    name: "شيراز",
    nameFr: "Chiraz",
    country: "Iran", countryAr: "إيران",
    requiredXP: 0,
    sageId: "hafez",
    description: "Cité de la poésie et des roses. Hafez y composa ses Ghazals immortels.",
    descriptionAr: "مدينة الشعر والورود. نظم فيها حافظ قصائده الغزلية الخالدة.",
    color: "#ec4899",
  },
  {
    id: "tolede",
    name: "طليطلة",
    nameFr: "Tolède",
    country: "Espagne", countryAr: "إسبانيا",
    requiredXP: 0,
    sageId: "ibn_wafid",
    description: "Le pont entre les civilisations. Les traducteurs de Tolède transmirent la sagesse islamique à l'Europe.",
    descriptionAr: "جسر الحضارات. نقل مترجمو طليطلة الحكمة الإسلامية إلى أوروبا.",
    color: "#f97316",
  },
  {
    id: "nishapur",
    name: "نيسابور",
    nameFr: "Nishapur",
    country: "Iran", countryAr: "إيران",
    requiredXP: 0,
    sageId: "omar_khayyam",
    description: "Berceau d'Omar Khayyam. Mathématicien, astronome et poète visionnaire.",
    descriptionAr: "مسقط رأس عمر الخيام. رياضي وفلكي وشاعر استشرافي.",
    color: "#8b5cf6",
  },

  // ── ÈRE IV — Les Empires ─────────────────────────────────────
  {
    id: "istanbul",
    name: "إسطنبول",
    nameFr: "Istanbul",
    country: "Turquie", countryAr: "تركيا",
    requiredXP: 0,
    sageId: "suleiman",
    description: "La Porte de la Félicité. Suleiman le Magnifique y porta l'Empire ottoman à son apogée.",
    descriptionAr: "باب السعادة. حمل فيها سليمان القانوني الدولة العثمانية لذروتها.",
    color: "#e11d48",
  },
  {
    id: "agra",
    name: "أغرا",
    nameFr: "Agra",
    country: "Inde (Empire moghol)", countryAr: "الهند (الإمبراطورية المغولية)",
    requiredXP: 0,
    sageId: "akbar",
    description: "Le Taj Mahal et l'empire de la tolérance. Akbar bâtit un empire multi-religieux.",
    descriptionAr: "تاج محل وإمبراطورية التسامح. بنى أكبر إمبراطورية متعددة الأديان.",
    color: "#f59e0b",
  },
  {
    id: "isfahan",
    name: "أصفهان",
    nameFr: "Isfahan",
    country: "Iran (Empire safavide)", countryAr: "إيران (الدولة الصفوية)",
    requiredXP: 0,
    sageId: "mulla_sadra",
    description: "Nisf Jahan — la moitié du monde. Mulla Sadra y révolutionna la philosophie islamique.",
    descriptionAr: "نصف جهان — نصف العالم. ثوّر فيها الملا صدرا الفلسفة الإسلامية.",
    color: "#14b8a6",
  },
  {
    id: "gao",
    name: "غاو",
    nameFr: "Gao",
    country: "Mali (Empire Songhaï)", countryAr: "مالي (إمبراطورية الصنغاي)",
    requiredXP: 0,
    sageId: "askia",
    description: "Capitale de l'empire Songhaï sous Askia Muhammad — le sultan pèlerin qui défendit l'islam.",
    descriptionAr: "عاصمة إمبراطورية الصنغاي تحت أسكيا محمد — السلطان الحاج الذي دافع عن الإسلام.",
    color: "#78716c",
  },
  {
    id: "zanzibar",
    name: "زنجبار",
    nameFr: "Zanzibar",
    country: "Tanzanie", countryAr: "تنزانيا",
    requiredXP: 0,
    sageId: "ibn_battuta_zanzibar",
    description: "Carrefour de l'islam swahili. Ibn Battuta y fit escale dans sa traversée du monde.",
    descriptionAr: "ملتقى الإسلام السواحيلي. توقف فيها ابن بطوطة في رحلته حول العالم.",
    color: "#0d9488",
  },

  // ── ÈRE V — La Maîtrise ─────────────────────────────────────
  {
    id: "al_azhar_v",
    name: "الأزهر الشريف",
    nameFr: "Al-Azhar",
    country: "Égypte — L'université du monde islamique", countryAr: "مصر — جامعة العالم الإسلامي",
    requiredXP: 0,
    sageId: "imam_azhar",
    description: "1000 ans d'enseignement islamique ininterrompu. La synthèse finale de tout ce que tu as appris.",
    descriptionAr: "ألف عام من التعليم الإسلامي المتواصل. التوليف النهائي لكل ما تعلمته.",
    color: "#FFD700",
  },
  {
    id: "sarajevo",
    name: "سراييفو",
    nameFr: "Sarajevo",
    country: "Bosnie-Herzégovine", countryAr: "البوسنة والهرسك",
    requiredXP: 0,
    sageId: "izetbegovic",
    description: "L'islam en Europe. La foi survivante des guerres des Balkans — témoin que l'islam peut fleurir partout.",
    descriptionAr: "الإسلام في أوروبا. الإيمان الناجي من حروب البلقان — شاهد أن الإسلام يزهر في كل مكان.",
    color: "#a78bfa",
  },
  {
    id: "kuala_lumpur",
    name: "كوالالمبور",
    nameFr: "Kuala Lumpur",
    country: "Malaisie", countryAr: "ماليزيا",
    requiredXP: 0,
    sageId: "hamka",
    description: "L'islam du XXIe siècle. Finance islamique, architecture moderne, la Oumma globale.",
    descriptionAr: "إسلام القرن الحادي والعشرين. التمويل الإسلامي والعمارة الحديثة والأمة العالمية.",
    color: "#34d399",
  },
];

// Map coordinates within the SVG (390 × 960)
// Path goes from Médine (bottom) to La Mecque (top)
export const LOCATION_COORDS: Record<string, { cx: number; cy: number }> = {
  medine:     { cx: 185, cy: 895 },
  fes:        { cx: 260, cy: 808 },
  cordoue:    { cx: 115, cy: 718 },
  marrakech:  { cx: 265, cy: 628 },
  damas:      { cx: 110, cy: 538 },
  bagdad:     { cx: 258, cy: 448 },
  samarcande: { cx: 130, cy: 358 },
  tombouctou: { cx: 272, cy: 265 },
  le_caire:   { cx: 108, cy: 172 },
  la_mecque:  { cx: 193, cy: 78  },
};

export const PATH_POINTS = Object.values(LOCATION_COORDS)
  .reverse() // La Mecque → Médine = top → bottom in SVG
  .map(c => `${c.cx},${c.cy}`)
  .join(" ");

export function getLocation(id: string): LocationDef | undefined {
  return LOCATIONS.find(l => l.id === id);
}

export function isUnlocked(locationId: string, xp: number, unlockedLocations: string[], state?: GameState): boolean {
  if (unlockedLocations.includes(locationId)) return true;
  // Ère I: theme-completion chain — previous location must have all 7 themes validated
  const era1Idx = ERA1_ORDER.indexOf(locationId);
  if (era1Idx > 0) {
    // No state = fail safe (locked), never bypass theme chain
    if (!state) return false;
    const prevLocation = ERA1_ORDER[era1Idx - 1];
    return isLocationCompleted(state, prevLocation);
  }
  // Fallback: XP gate (used for Ère II+ locations)
  const loc = getLocation(locationId);
  return loc ? xp >= loc.requiredXP : false;
}
