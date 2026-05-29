import type { PowerUpType } from "./types";

export interface PowerUpDef {
  id: PowerUpType;
  name: string;
  nameAr: string;
  description: string;
  cost: number;
  icon: string;       // lucide icon name
  color: string;
  bgColor: string;
}

export const POWERUPS: PowerUpDef[] = [
  {
    id: "joker50",
    name: "Joker 50/50",
    nameAr: "جوكر",
    description: "Élimine 2 mauvaises réponses",
    cost: 10,
    icon: "Scissors",
    color: "#D4AF37",
    bgColor: "rgba(212,175,55,0.15)",
  },
  {
    id: "bouclier",
    name: "Bouclier",
    nameAr: "الدرع",
    description: "Ignore une erreur",
    cost: 15,
    icon: "Shield",
    color: "#60a5fa",
    bgColor: "rgba(96,165,250,0.15)",
  },
  {
    id: "double_xp",
    name: "Double XP",
    nameAr: "ضعف الخبرة",
    description: "Double les XP gagnés",
    cost: 8,
    icon: "Zap",
    color: "#4ade80",
    bgColor: "rgba(74,222,128,0.15)",
  },
  {
    id: "time_freeze",
    name: "Temps gelé",
    nameAr: "تجميد الوقت",
    description: "+10 secondes",
    cost: 12,
    icon: "Snowflake",
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.15)",
  },
];

export function getPowerUp(id: PowerUpType): PowerUpDef {
  return POWERUPS.find(p => p.id === id)!;
}

// Joker 50/50: picks 2 wrong option indices to hide (leaves 1 wrong + the correct one)
export function getJoker50Eliminations(
  options: { text: string; correct: boolean }[],
  alreadyHidden: number[]
): number[] {
  const wrongIndices = options
    .map((o, i) => ({ i, correct: o.correct }))
    .filter(o => !o.correct && !alreadyHidden.includes(o.i))
    .map(o => o.i);
  // Randomly pick 2 to eliminate
  const shuffled = wrongIndices.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(2, shuffled.length));
}
