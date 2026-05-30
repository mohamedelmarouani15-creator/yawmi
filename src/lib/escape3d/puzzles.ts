import type { PuzzleDef } from "./types";

export const V4_PUZZLES: PuzzleDef[] = [
  {
    id:          "lantern_bismillah",
    title:       "La Lanterne des Lettres",
    description: "La lanterne projette des lettres arabes sur le mur. Reconstitue le mot sacré.",
    objectId:    "lantern_south",
    type:        "arabic_word",
    question:    "Ces lettres ornent l'entrée de chaque maison du riad. Quel est ce mot béni ?",
    hint1:       "Ce mot commence chaque sourate du Coran sauf une.",
    hint2:       "Il contient le nom d'Allah et deux de Ses attributs.",
    hint3:       "بِسْمِ اللَّهِ الرَّحْمَنِ — il manque le dernier mot.",
    answer:      "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    options:     [
      "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
      "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      "لَا إِلَٰهَ إِلَّا اللَّهُ",
    ],
    explanation: "Bismillah ir-Rahman ir-Rahim — Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux. Ces mots ouvrent le Coran et toute action bénie.",
    xpReward:    60,
  },
];

export function getPuzzleById(id: string): PuzzleDef | undefined {
  return V4_PUZZLES.find(p => p.id === id);
}
