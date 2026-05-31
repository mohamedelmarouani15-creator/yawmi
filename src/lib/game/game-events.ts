import type { Question } from "./types";

export type GameEventId =
  | "ramadan"
  | "aid_fitr"
  | "aid_adha"
  | "laylat_qadr"
  | "mawlid"
  | "isra_miraj"
  | "joumaa"
  | "hajj";

export interface GameEvent {
  id: GameEventId;
  name: string;
  nameAr: string;
  emoji: string;
  theme: {
    primaryColor: string;
    accentColor: string;
    bgOverlay: string;
  };
  bannerText: string;
  oasisDecoration: "lanterns" | "confetti" | "stars" | "crescent" | "none";
  hasSpecialQuestion: boolean;
  rewardMultiplier: number; // XP multiplier for special event
}

export const GAME_EVENTS: Record<GameEventId, GameEvent> = {
  ramadan: {
    id: "ramadan",
    name: "Ramadan",
    nameAr: "شهر رمضان المبارك",
    emoji: "🌙",
    theme: { primaryColor: "#7B5EA7", accentColor: "#C8A2C8", bgOverlay: "rgba(60,20,80,0.15)" },
    bannerText: "Ramadan Mubarak ! Double XP ce mois sacré",
    oasisDecoration: "lanterns",
    hasSpecialQuestion: true,
    rewardMultiplier: 2,
  },
  aid_fitr: {
    id: "aid_fitr",
    name: "Aïd al-Fitr",
    nameAr: "عيد الفطر المبارك",
    emoji: "🎉",
    theme: { primaryColor: "var(--gold)", accentColor: "#FFD700", bgOverlay: "rgba(212,175,55,0.1)" },
    bannerText: "Aïd Moubarak ! Confettis et triple XP aujourd'hui",
    oasisDecoration: "confetti",
    hasSpecialQuestion: true,
    rewardMultiplier: 3,
  },
  aid_adha: {
    id: "aid_adha",
    name: "Aïd al-Adha",
    nameAr: "عيد الأضحى المبارك",
    emoji: "🎊",
    theme: { primaryColor: "#22c55e", accentColor: "#4ade80", bgOverlay: "rgba(34,197,94,0.08)" },
    bannerText: "Aïd al-Adha Moubarak ! Triple XP aujourd'hui",
    oasisDecoration: "confetti",
    hasSpecialQuestion: true,
    rewardMultiplier: 3,
  },
  laylat_qadr: {
    id: "laylat_qadr",
    name: "Laylat al-Qadr",
    nameAr: "ليلة القدر",
    emoji: "⭐",
    theme: { primaryColor: "#a78bfa", accentColor: "#c4b5fd", bgOverlay: "rgba(124,58,237,0.12)" },
    bannerText: "La Nuit du Destin — énigme rare disponible !",
    oasisDecoration: "stars",
    hasSpecialQuestion: true,
    rewardMultiplier: 5,
  },
  mawlid: {
    id: "mawlid",
    name: "Mawlid an-Nabawi",
    nameAr: "المولد النبوي الشريف",
    emoji: "🕌",
    theme: { primaryColor: "var(--gold)", accentColor: "#F5DEB3", bgOverlay: "var(--bg-gold)" },
    bannerText: "Mawlid Mubarak ! Double XP pour les questions sur le Prophète ﷺ",
    oasisDecoration: "crescent",
    hasSpecialQuestion: true,
    rewardMultiplier: 2,
  },
  isra_miraj: {
    id: "isra_miraj",
    name: "Isra et Miraj",
    nameAr: "الإسراء والمعراج",
    emoji: "🌠",
    theme: { primaryColor: "#60a5fa", accentColor: "#93c5fd", bgOverlay: "rgba(96,165,250,0.08)" },
    bannerText: "Isra et Miraj — questions spéciales sur le voyage nocturne",
    oasisDecoration: "stars",
    hasSpecialQuestion: true,
    rewardMultiplier: 2,
  },
  joumaa: {
    id: "joumaa",
    name: "Joumou'a",
    nameAr: "يوم الجمعة",
    emoji: "🕌",
    theme: { primaryColor: "var(--primary)", accentColor: "#4ade80", bgOverlay: "rgba(5,92,63,0.08)" },
    bannerText: "Jumu'a Mubarak ! Défi famille spécial aujourd'hui",
    oasisDecoration: "none",
    hasSpecialQuestion: false,
    rewardMultiplier: 1.5,
  },
  hajj: {
    id: "hajj",
    name: "Mois du Hajj",
    nameAr: "ذو الحجة",
    emoji: "🕋",
    theme: { primaryColor: "var(--gold)", accentColor: "#F5DEB3", bgOverlay: "var(--bg-gold)" },
    bannerText: "Mois du Hajj — défis spéciaux sur les rituels du pèlerinage",
    oasisDecoration: "crescent",
    hasSpecialQuestion: true,
    rewardMultiplier: 1.5,
  },
};

// Special questions for events
export const EVENT_QUESTIONS: Partial<Record<GameEventId, Question[]>> = {
  laylat_qadr: [
    {
      id: "ev_qadr_001",
      category: "religion",
      type: "mcq",
      difficulty: 3,
      question: "La Nuit du Destin (Laylat al-Qadr) vaut combien de mois d'adoration selon le Coran ?",
      options: [
        { text: "Mille mois (83 ans)", correct: true },
        { text: "Cent ans", correct: false },
        { text: "Sept nuits", correct: false },
        { text: "Quarante jours", correct: false },
      ],
      explanation: "Sourate Al-Qadr (97): 'Laylat al-Qadr est meilleure que mille mois'",
      culturalCapsule: {
        title: "La Nuit du Destin",
        text: "Laylat al-Qadr est la nuit où le Coran a commencé à être révélé. Elle se trouve dans les dix dernières nuits du Ramadan, probablement les nuits impaires. Sa valeur de 1000 mois équivaut à plus de 83 ans d'adoration.",
      },
    },
  ],
  ramadan: [
    {
      id: "ev_ramadan_001",
      category: "religion",
      type: "mcq",
      difficulty: 2,
      question: "Quel verset du Coran ordonne le jeûne du Ramadan ?",
      options: [
        { text: "Al-Baqara 2:183", correct: true },
        { text: "Al-Imran 3:97", correct: false },
        { text: "An-Nisa 4:29", correct: false },
        { text: "Al-Maidah 5:6", correct: false },
      ],
      explanation: "'Ô vous qui croyez ! On vous a prescrit le jeûne comme on l'a prescrit à ceux qui vous ont précédés.' (2:183)",
    },
  ],
  aid_fitr: [
    {
      id: "ev_fitr_001",
      category: "religion",
      type: "mcq",
      difficulty: 2,
      question: "Quelle aumône est obligatoire avant la prière de l'Aïd al-Fitr ?",
      options: [
        { text: "Zakat al-Fitr (Fitra)", correct: true },
        { text: "Zakat ordinaire", correct: false },
        { text: "Sadaqa al-Jariya", correct: false },
        { text: "Waqf", correct: false },
      ],
      explanation: "La Zakat al-Fitr est une aumône obligatoire versée avant la prière de l'Aïd, purification pour le jeûneur.",
    },
  ],
  hajj: [
    {
      id: "ev_hajj_001",
      category: "religion",
      type: "mcq",
      difficulty: 3,
      question: "Le Tawaf (circumambulation) autour de la Ka'ba se fait dans quel sens ?",
      options: [
        { text: "Dans le sens anti-horaire", correct: true },
        { text: "Dans le sens horaire", correct: false },
        { text: "Alternativement", correct: false },
        { text: "Au choix du pèlerin", correct: false },
      ],
      culturalCapsule: {
        title: "Le Tawaf — symbolique cosmique",
        text: "Le Tawaf anti-horaire reproduit le mouvement des planètes autour du soleil, des électrons autour du noyau, et des anges autour du Trône. C'est un rappel que l'univers entier est en état d'adoration perpétuelle.",
      },
    },
  ],
};

// Detect if a special event is active today
export function getActiveGameEvent(): GameEvent | null {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Joumou'a (Friday = 5)
  if (dayOfWeek === 5) return GAME_EVENTS.joumaa;

  // Check Hijri calendar
  try {
    const hijriParts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      month: "numeric", day: "numeric",
    }).formatToParts(now);

    const hMonth = parseInt(hijriParts.find(p => p.type === "month")?.value ?? "0");
    const hDay   = parseInt(hijriParts.find(p => p.type === "day")?.value ?? "0");

    if (hMonth === 9) {
      if (hDay === 27) return GAME_EVENTS.laylat_qadr;
      return GAME_EVENTS.ramadan;
    }
    if (hMonth === 10 && hDay <= 3) return GAME_EVENTS.aid_fitr;
    if (hMonth === 12) {
      if (hDay === 10 || hDay === 11) return GAME_EVENTS.aid_adha;
      if (hDay >= 1 && hDay <= 9) return GAME_EVENTS.hajj;
    }
    if (hMonth === 3 && hDay === 12) return GAME_EVENTS.mawlid;
    if (hMonth === 7 && hDay === 27) return GAME_EVENTS.isra_miraj;
  } catch { /* no-op */ }

  return null;
}
