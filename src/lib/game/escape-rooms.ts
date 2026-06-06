import type { EscapeRoomTranslation, EscapeLockTranslation } from "@/lib/game/types";

export interface EscapeLock {
  id: number;
  type: "arabe" | "theologie" | "calligraphy" | "fiqh";
  label: string;
  labelAr: string;
  icon: string;
  objectSVG: string; // "manuscript" | "book" | "calligraphy" | "carpet"
  question: string;
  questionAr?: string;
  options: { text: string; correct: boolean }[];
  optionsAr?: { text: string; correct: boolean }[];
  hint: string;
  hintAr?: string;
  t?: Partial<Record<string, EscapeLockTranslation>>;
}

export interface EscapeRoom {
  id: string;
  theme: "medersa" | "riad" | "bibliotheque" | "hammam" | "observatoire";
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  weekNumber: number;
  locks: EscapeLock[];
  reward: { xp: number; coins: number; chests: number };
  floorColor: string;
  wallColor: string;
  accentColor: string;
  t?: Partial<Record<string, EscapeRoomTranslation>>;
}

export const ESCAPE_ROOMS: EscapeRoom[] = [
  {
    id: "room_medersa_1",
    theme: "medersa",
    name: "La Médersa Secrète", nameAr: "المدرسة السرية",
    description: "Une chambre de la médersa Al-Qarawiyyin de Fès. Quatre cadenas gardent le savoir.",
    descriptionAr: "غرفة في مدرسة القرويين بفاس. أربعة أقفال تحرس المعرفة.",
    weekNumber: 1,
    floorColor: "#8B6914", wallColor: "#C4922A", accentColor: "var(--gold)",
    reward: { xp: 300, coins: 80, chests: 2 },
    locks: [
      {
        id: 0, type: "arabe", label: "Manuscrit arabe", labelAr: "المخطوطة", icon: "📜", objectSVG: "manuscript",
        question: "Quelle est la traduction de 'العلم' (Al-'Ilm) ?",
        questionAr: "ما معنى كلمة 'العلم'؟",
        options: [
          { text: "Le savoir", correct: true }, { text: "La paix", correct: false },
          { text: "La lumière", correct: false }, { text: "L'eau", correct: false },
        ],
        optionsAr: [
          { text: "المعرفة", correct: true }, { text: "السلام", correct: false },
          { text: "النور", correct: false }, { text: "الماء", correct: false },
        ],
        hint: "C'est ce qui distingue les hommes des bêtes selon Ibn Khaldoun.",
        hintAr: "هو ما يميّز الإنسان عن البهائم حسب ابن خلدون.",
      },
      {
        id: 1, type: "theologie", label: "Livre brillant", labelAr: "الكتاب", icon: "📖", objectSVG: "book",
        question: "Quelle sourate est surnommée 'Umm Al-Kitab' (Mère du Livre) ?",
        questionAr: "أي سورة تُسمى 'أم الكتاب'؟",
        options: [
          { text: "Al-Fatiha", correct: true }, { text: "Al-Baqara", correct: false },
          { text: "Al-Ikhlas", correct: false }, { text: "Yasin", correct: false },
        ],
        optionsAr: [
          { text: "الفاتحة", correct: true }, { text: "البقرة", correct: false },
          { text: "الإخلاص", correct: false }, { text: "يس", correct: false },
        ],
        hint: "Elle est récitée à chaque unité de prière.",
        hintAr: "تُقرأ في كل ركعة من الصلاة.",
      },
      {
        id: 2, type: "calligraphy", label: "Calligraphie murale", labelAr: "الخط", icon: "✍️", objectSVG: "calligraphy",
        question: "Le style calligraphique 'Naskh' (نسخ) est utilisé pour :",
        questionAr: "يُستخدم أسلوب الخط 'النسخ' لـ :",
        options: [
          { text: "Les textes courants et le Coran", correct: true },
          { text: "Les décorations architecturales uniquement", correct: false },
          { text: "Les signatures royales", correct: false },
          { text: "Les inscriptions funéraires", correct: false },
        ],
        optionsAr: [
          { text: "النصوص العادية والقرآن الكريم", correct: true },
          { text: "الزخارف المعمارية فقط", correct: false },
          { text: "التواقيع الملكية", correct: false },
          { text: "النقوش الجنائزية", correct: false },
        ],
        hint: "C'est le style le plus lisible et le plus répandu.",
        hintAr: "هو أكثر الأساليب الخطية وضوحاً وانتشاراً.",
      },
      {
        id: 3, type: "fiqh", label: "Parchemin de jurisprudence", labelAr: "الفقه", icon: "⚖️", objectSVG: "carpet",
        question: "Combien de fois par jour un musulman doit-il prier ?",
        questionAr: "كم مرة يصلي المسلم في اليوم؟",
        options: [
          { text: "5 fois", correct: true }, { text: "3 fois", correct: false },
          { text: "7 fois", correct: false }, { text: "4 fois", correct: false },
        ],
        optionsAr: [
          { text: "5 مرات", correct: true }, { text: "3 مرات", correct: false },
          { text: "7 مرات", correct: false }, { text: "4 مرات", correct: false },
        ],
        hint: "Fajr, Dhuhr, Asr, Maghrib, Isha — les cinq piliers de la prière.",
        hintAr: "الفجر والظهر والعصر والمغرب والعشاء.",
      },
    ],
  },
  {
    id: "room_bibliotheque_1",
    theme: "bibliotheque",
    name: "La Bibliothèque de Tombouctou", nameAr: "مكتبة تمبكتو",
    description: "Parmi 700 000 manuscrits, Ahmad Baba a caché le secret ultime. Résous les 4 énigmes.",
    descriptionAr: "بين 700 ألف مخطوطة، أخفى أحمد بابا السر الأعظم. أحلّ الألغاز الأربعة.",
    weekNumber: 2,
    floorColor: "#5C3A1E", wallColor: "#8B4513", accentColor: "#D2691E",
    reward: { xp: 400, coins: 100, chests: 2 },
    locks: [
      {
        id: 0, type: "arabe", label: "Manuscrit Bambara", labelAr: "المخطوطة", icon: "📜", objectSVG: "manuscript",
        question: "Comment dit-on 'étudiant' en arabe classique ?",
        questionAr: "كيف تقول 'طالب' بالعربية الفصحى؟",
        options: [
          { text: "طالب (Talib)", correct: true }, { text: "أستاذ (Ustad)", correct: false },
          { text: "كاتب (Katib)", correct: false }, { text: "قارئ (Qari)", correct: false },
        ],
        optionsAr: [
          { text: "طالب", correct: true }, { text: "أستاذ", correct: false },
          { text: "كاتب", correct: false }, { text: "قارئ", correct: false },
        ],
        hint: "C'est aussi le nom d'un célèbre mouvement religieux.",
        hintAr: "هو أيضاً اسم حركة دينية مشهورة.",
      },
      {
        id: 1, type: "theologie", label: "Traité de jurisprudence", labelAr: "الكتاب", icon: "📖", objectSVG: "book",
        question: "Quel est le nom du grand savant qui a protégé les manuscrits de Tombouctou contre l'esclavage ?",
        questionAr: "من هو العالم الكبير الذي دافع عن مخطوطات تمبكتو وناضل ضد العبودية؟",
        options: [
          { text: "Ahmad Baba al-Timbukti", correct: true }, { text: "Mansa Musa", correct: false },
          { text: "Ibn Battuta", correct: false }, { text: "Al-Sadi", correct: false },
        ],
        optionsAr: [
          { text: "أحمد بابا التمبكتي", correct: true }, { text: "منسا موسى", correct: false },
          { text: "ابن بطوطة", correct: false }, { text: "السعدي", correct: false },
        ],
        hint: "Il a rédigé un traité condamnant l'esclavage des musulmans libres.",
        hintAr: "ألّف رسالة تُدين استعباد المسلمين الأحرار.",
      },
      {
        id: 2, type: "calligraphy", label: "Enluminure sudanaise", labelAr: "الخط", icon: "✍️", objectSVG: "calligraphy",
        question: "Les manuscrits de Tombouctou couvrent quel période historique ?",
        questionAr: "ما الحقبة التاريخية التي تغطيها مخطوطات تمبكتو؟",
        options: [
          { text: "XIIe - XVIIe siècle", correct: true }, { text: "VIIe - IXe siècle", correct: false },
          { text: "XVIIIe - XIXe siècle", correct: false }, { text: "Xe - XIe siècle", correct: false },
        ],
        optionsAr: [
          { text: "القرن 12 - 17", correct: true }, { text: "القرن 7 - 9", correct: false },
          { text: "القرن 18 - 19", correct: false }, { text: "القرن 10 - 11", correct: false },
        ],
        hint: "L'université de Sankoré fut fondée au XIVe siècle.",
        hintAr: "تأسست جامعة سنكوري في القرن الرابع عشر.",
      },
      {
        id: 3, type: "fiqh", label: "Parchemin de fiqh", labelAr: "الفقه", icon: "⚖️", objectSVG: "carpet",
        question: "Quelle est la condition (rukn) indispensable pour la validité du jeûne ?",
        questionAr: "ما الركن الأساسي لصحة الصيام؟",
        options: [
          { text: "L'intention (niyya)", correct: true }, { text: "La prière du Fajr", correct: false },
          { text: "La lecture du Coran", correct: false }, { text: "Le suhur", correct: false },
        ],
        optionsAr: [
          { text: "النية", correct: true }, { text: "صلاة الفجر", correct: false },
          { text: "قراءة القرآن", correct: false }, { text: "السحور", correct: false },
        ],
        hint: "Le Prophète ﷺ a dit : 'Les actes ne valent que par les intentions.'",
        hintAr: "نفس الكلمة كالعربية الفصحى، مع تبسيط طفيف.",
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
