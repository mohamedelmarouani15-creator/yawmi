import type { PuzzleDef } from "./types";

export const V4_PUZZLES: PuzzleDef[] = [
  // ── Cour centrale ──────────────────────────────────────────
  {
    id:          "lantern_bismillah",
    title:       "La Lanterne des Lettres",
    description: "La lanterne projette des lettres arabes sur le mur.",
    objectId:    "lantern_south_east",
    type:        "arabic_word",
    question:    "Ces mots ornent l'entrée de chaque demeure du riad. Quel est ce mot béni qui commence chaque sourate du Coran ?",
    hint1:       "Ce mot commence chaque sourate du Coran sauf une.",
    hint2:       "Il contient le nom d'Allah et deux de Ses attributs de miséricorde.",
    hint3:       "بِسْمِ اللَّهِ الرَّحْمَنِ — il manque le dernier mot.",
    answer:      "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    options:     [
      "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
      "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      "لَا إِلَٰهَ إِلَّا اللَّهُ",
    ],
    explanation: "Bismillah ir-Rahman ir-Rahim — Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux. Ces mots ouvrent le Coran et sanctifient toute action.",
    xpReward:    60,
  },

  // ── La Bibliothèque ────────────────────────────────────────
  {
    id:          "library_iqra",
    title:       "Le Premier Mot Révélé",
    description: "Un manuscrit ouvert sur un pupitre. La première page est effacée — sauf un mot.",
    objectId:    "manuscript",
    type:        "arabic_word",
    question:    "C'est le premier mot révélé au Prophète ﷺ dans la grotte de Hirâ. Quel est ce mot fondateur ?",
    hint1:       "L'ange Jibrîl lui dit ce mot trois fois.",
    hint2:       "Il appartient à la sourate Al-'Alaq (96).",
    hint3:       "En français : « Lis ! » — en arabe, un seul mot.",
    answer:      "اقْرَأْ",
    options:     ["اقْرَأْ", "قُلْ", "آمَنَّا", "صَلِّ"],
    explanation: "اقْرَأْ (Iqra') — Lis ! C'est le premier commandement divin révélé au Prophète ﷺ, soulignant que la connaissance est au cœur de l'islam.",
    xpReward:    70,
  },

  // ── Le Salon ───────────────────────────────────────────────
  {
    id:          "salon_sabr",
    title:       "La Calligraphie du Salon",
    description: "Un verset est gravé dans le stuc au-dessus des coussins. Une lettre est manquante.",
    objectId:    "calligraphy_wall",
    type:        "arabic_word",
    question:    "Ya'qûb ﷺ prononça ces mots après avoir perdu Yûsuf. Ce type de patience garde la dignité et ne se plaint qu'à Allah. Comment appelle-t-on cette « belle patience » ?",
    hint1:       "C'est un mot de 4 lettres : ص ـ ب ـ ر.",
    hint2:       "La sourate Yûsuf (12:18) le mentionne.",
    hint3:       "Sabrun... — il manque l'adjectif qui suit.",
    answer:      "صَبْرٌ جَمِيلٌ",
    options:     ["صَبْرٌ جَمِيلٌ", "شُكْرٌ كَثِيرٌ", "ذِكْرٌ دَائِمٌ", "عِلْمٌ نَافِعٌ"],
    explanation: "صَبْرٌ جَمِيلٌ (Sabrun Jamîl) — Une belle patience. Ces mots de Ya'qûb ﷺ enseignent qu'on peut traverser l'épreuve avec dignité, sans amertume.",
    xpReward:    70,
  },

  // ── La Cuisine ─────────────────────────────────────────────
  {
    id:          "cuisine_honey",
    title:       "Le Remède des Anciens",
    description: "Une jarre scellée trône sur l'étagère. Une étiquette en arabe indique son contenu.",
    objectId:    "honey_jar",
    type:        "arabic_word",
    question:    "Allah dit dans le Coran (16:69) : « Il en sort une boisson aux couleurs variées, dans laquelle il y a une guérison pour les gens. » De quelle substance parle-t-il ?",
    hint1:       "Les abeilles en sont la source selon cette sourate.",
    hint2:       "En français : un liquide doré et sucré.",
    hint3:       "En arabe, une seule syllabe : عَسَل",
    answer:      "عَسَل",
    options:     ["عَسَل", "زَيْتُون", "تَمْر", "زَعْفَرَان"],
    explanation: "عَسَل (Miel) — Le miel est cité dans la sourate An-Nahl (Les Abeilles) comme une guérison. Ibn al-Qayyim le plaçait parmi les meilleurs remèdes de la médecine prophétique.",
    xpReward:    65,
  },

  // ── Le Hammam ──────────────────────────────────────────────
  {
    id:          "hammam_taharah",
    title:       "Les Eaux de la Purification",
    description: "Sur le bassin de marbre, quatre mots sont gravés. L'un d'eux n'est pas une purification islamique.",
    objectId:    "marble_basin",
    type:        "arabic_word",
    question:    "Parmi ces quatre notions, laquelle N'EST PAS une forme de purification (taharah) en islam ?",
    hint1:       "La taharah comprend le wudu, le ghusl et le tayammum.",
    hint2:       "L'un de ces mots désigne le jeûne, pas la purification.",
    hint3:       "صَوْم signifie jeûner, pas se purifier.",
    answer:      "صَوْم",
    options:     ["وُضُوء", "غُسْل", "تَيَمُّم", "صَوْم"],
    explanation: "صَوْم (jeûne) n'est pas une purification au sens rituel. Le وُضُوء (wudu), le غُسْل (grand lavage) et le تَيَمُّم (purification sèche) sont les trois formes de taharah.",
    xpReward:    75,
  },
];

export function getPuzzleById(id: string): PuzzleDef | undefined {
  return V4_PUZZLES.find(p => p.id === id);
}

export function getPuzzlesForRoom(room: string): PuzzleDef[] {
  const map: Record<string, string[]> = {
    courtyard: ["lantern_bismillah"],
    library:   ["library_iqra"],
    salon:     ["salon_sabr"],
    cuisine:   ["cuisine_honey"],
    hammam:    ["hammam_taharah"],
  };
  return (map[room] ?? []).map(id => getPuzzleById(id)!).filter(Boolean);
}
