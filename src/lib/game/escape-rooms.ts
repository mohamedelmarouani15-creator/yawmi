export interface EscapeLock {
  id: number;
  type: "arabic" | "religion" | "calligraphy" | "darija";
  label: string;
  labelAr: string;
  icon: string;
  objectSVG: string; // "manuscript" | "book" | "calligraphy" | "carpet"
  question: string;
  options: { text: string; correct: boolean }[];
  hint: string;
}

export interface EscapeRoom {
  id: string;
  theme: "medersa" | "riad" | "bibliotheque" | "hammam" | "observatoire";
  name: string;
  description: string;
  weekNumber: number;
  locks: EscapeLock[];
  reward: { xp: number; coins: number; chests: number };
  floorColor: string;
  wallColor: string;
  accentColor: string;
}

export const ESCAPE_ROOMS: EscapeRoom[] = [
  {
    id: "room_medersa_1",
    theme: "medersa",
    name: "La Médersa Secrète",
    description: "Une chambre de la médersa Al-Qarawiyyin de Fès. Quatre cadenas gardent le savoir.",
    weekNumber: 1,
    floorColor: "#8B6914",
    wallColor: "#C4922A",
    accentColor: "var(--gold)",
    reward: { xp: 300, coins: 80, chests: 2 },
    locks: [
      {
        id: 0,
        type: "arabic",
        label: "Manuscrit arabe",
        labelAr: "المخطوطة",
        icon: "📜",
        objectSVG: "manuscript",
        question: "Quelle est la traduction de 'العلم' (Al-'Ilm) ?",
        options: [
          { text: "Le savoir", correct: true },
          { text: "La paix", correct: false },
          { text: "La lumière", correct: false },
          { text: "L'eau", correct: false },
        ],
        hint: "C'est ce qui distingue les hommes des bêtes selon Ibn Khaldoun.",
      },
      {
        id: 1,
        type: "religion",
        label: "Livre brillant",
        labelAr: "الكتاب",
        icon: "📖",
        objectSVG: "book",
        question: "Quelle sourate est surnommée 'Umm Al-Kitab' (Mère du Livre) ?",
        options: [
          { text: "Al-Fatiha", correct: true },
          { text: "Al-Baqara", correct: false },
          { text: "Al-Ikhlas", correct: false },
          { text: "Yasin", correct: false },
        ],
        hint: "Elle est récitée à chaque unité de prière.",
      },
      {
        id: 2,
        type: "calligraphy",
        label: "Calligraphie murale",
        labelAr: "الخط",
        icon: "✍️",
        objectSVG: "calligraphy",
        question: "Le style calligraphique 'Naskh' (نسخ) est utilisé pour :",
        options: [
          { text: "Les textes courants et le Coran", correct: true },
          { text: "Les décorations architecturales uniquement", correct: false },
          { text: "Les signatures royales", correct: false },
          { text: "Les inscriptions funéraires", correct: false },
        ],
        hint: "C'est le style le plus lisible et le plus répandu.",
      },
      {
        id: 3,
        type: "darija",
        label: "Tapis marocain",
        labelAr: "الزربية",
        icon: "🪣",
        objectSVG: "carpet",
        question: "Que signifie 'بلا مزيان' (bla mzyan) en darija marocain ?",
        options: [
          { text: "Pas bien / pas terrible", correct: true },
          { text: "Très bien", correct: false },
          { text: "Sans problème", correct: false },
          { text: "Avec plaisir", correct: false },
        ],
        hint: "'Mzyan' = bien, 'bla' = sans.",
      },
    ],
  },
  {
    id: "room_bibliotheque_1",
    theme: "bibliotheque",
    name: "La Bibliothèque de Tombouctou",
    description: "Parmi 700 000 manuscrits, Ahmad Baba a caché le secret ultime. Résous les 4 énigmes.",
    weekNumber: 2,
    floorColor: "#5C3A1E",
    wallColor: "#8B4513",
    accentColor: "#D2691E",
    reward: { xp: 400, coins: 100, chests: 2 },
    locks: [
      {
        id: 0,
        type: "arabic",
        label: "Manuscrit Bambara",
        labelAr: "المخطوطة",
        icon: "📜",
        objectSVG: "manuscript",
        question: "Comment dit-on 'étudiant' en arabe classique ?",
        options: [
          { text: "طالب (Talib)", correct: true },
          { text: "أستاذ (Ustad)", correct: false },
          { text: "كاتب (Katib)", correct: false },
          { text: "قارئ (Qari)", correct: false },
        ],
        hint: "C'est aussi le nom d'un célèbre mouvement religieux.",
      },
      {
        id: 1,
        type: "religion",
        label: "Traité de jurisprudence",
        labelAr: "الكتاب",
        icon: "📖",
        objectSVG: "book",
        question: "Quel est le nom du grand savant qui a protégé les manuscrits de Tombouctou contre l'esclavage ?",
        options: [
          { text: "Ahmad Baba al-Timbukti", correct: true },
          { text: "Mansa Musa", correct: false },
          { text: "Ibn Battuta", correct: false },
          { text: "Al-Sadi", correct: false },
        ],
        hint: "Il a rédigé un traité condamnant l'esclavage des musulmans libres.",
      },
      {
        id: 2,
        type: "calligraphy",
        label: "Enluminure sudanaise",
        labelAr: "الخط",
        icon: "✍️",
        objectSVG: "calligraphy",
        question: "Les manuscrits de Tombouctou couvrent quel période historique ?",
        options: [
          { text: "XIIe - XVIIe siècle", correct: true },
          { text: "VIIe - IXe siècle", correct: false },
          { text: "XVIIIe - XIXe siècle", correct: false },
          { text: "Xe - XIe siècle", correct: false },
        ],
        hint: "L'université de Sankoré fut fondée au XIVe siècle.",
      },
      {
        id: 3,
        type: "darija",
        label: "Tapis Songhaï",
        labelAr: "الزربية",
        icon: "🪣",
        objectSVG: "carpet",
        question: "Comment dit-on 'livre' en darija marocaine ?",
        options: [
          { text: "كتاب (ktab)", correct: true },
          { text: "ورقة (warka)", correct: false },
          { text: "قلم (qlam)", correct: false },
          { text: "مدرسة (mdersa)", correct: false },
        ],
        hint: "Même mot qu'en arabe classique, légèrement simplifié.",
      },
    ],
  },
];

export function getCurrentEscapeRoom(): EscapeRoom {
  const now = new Date();
  const startOf2024 = new Date("2024-01-05"); // first Friday
  const diffMs = now.getTime() - startOf2024.getTime();
  const weekNum = Math.floor(diffMs / (7 * 24 * 3600 * 1000));
  return ESCAPE_ROOMS[weekNum % ESCAPE_ROOMS.length];
}

export function getEscapeRoom(id: string): EscapeRoom | undefined {
  return ESCAPE_ROOMS.find(r => r.id === id);
}
