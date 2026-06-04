export interface StageConfig {
  index:      number;   // 1 | 2 | 3
  name:       string;
  nameAr:     string;
  victoryReq: number;   // out of 10
  maxDiff:    number;   // question difficulty ceiling
  timer:      number;   // seconds per question
  xpReward:   number;
  coinsReward: number;
  description: string;
}

export const STAGE_CONFIGS: StageConfig[] = [
  {
    index: 1, name: "Découverte", nameAr: "الاستكشاف",
    victoryReq: 7, maxDiff: 2, timer: 20,
    xpReward: 40, coinsReward: 15,
    description: "7 bonnes réponses sur 10",
  },
  {
    index: 2, name: "Épreuve", nameAr: "الامتحان",
    victoryReq: 8, maxDiff: 3, timer: 15,
    xpReward: 80, coinsReward: 30,
    description: "8 bonnes réponses · timer 15s",
  },
  {
    index: 3, name: "Maîtrise", nameAr: "الإتقان",
    victoryReq: 9, maxDiff: 4, timer: 12,
    xpReward: 0, coinsReward: 0, // full sage reward instead
    description: "9 bonnes réponses · expert",
  },
];

export function getStageConfig(stageIndex: number): StageConfig {
  return STAGE_CONFIGS[Math.min(stageIndex, 3) - 1] ?? STAGE_CONFIGS[2];
}

/** How many stages completed at this location (0–3). */
export function stagesDone(locationStages: Record<string, number>, locationId: string): number {
  return locationStages[locationId] ?? 0;
}

/** Current stage to play (1, 2, or 3). After mastery still returns 3 for replays. */
export function currentStageIndex(locationStages: Record<string, number>, locationId: string): number {
  const done = stagesDone(locationStages, locationId);
  return Math.min(3, done + 1);
}

// ── Ère access conditions ──────────────────────────────────────

export interface EraCondition {
  eraIndex:     number;
  minLevel:     number;
  minArcsRead:  number;
  minAvgMastery: number; // 0–100
  name:         string;
  subtitle:     string;
  color:        string;
}

export const ERA_CONDITIONS: EraCondition[] = [
  { eraIndex: 1, minLevel: 1,  minArcsRead: 0, minAvgMastery: 0,  name: "Ère I",  subtitle: "Les Prophètes",      color: "#D4AF37" },
  { eraIndex: 2, minLevel: 15, minArcsRead: 2, minAvgMastery: 30, name: "Ère II", subtitle: "L'Aube de l'Islam",  color: "#34d399" },
  { eraIndex: 3, minLevel: 30, minArcsRead: 4, minAvgMastery: 50, name: "Ère III",subtitle: "L'Âge d'Or",         color: "#60a5fa" },
  { eraIndex: 4, minLevel: 50, minArcsRead: 6, minAvgMastery: 70, name: "Ère IV", subtitle: "Les Empires",         color: "#f97316" },
  { eraIndex: 5, minLevel: 75, minArcsRead: 9, minAvgMastery: 85, name: "Ère V",  subtitle: "La Maîtrise",         color: "#a78bfa" },
];

/** Route and location data for each era map. */
export const ERA_MAP_DATA: Record<number, {
  route: string;
  locations: string[];
  theme: string;
  nextHint: string;
}> = {
  1: { route: "/oasis",      locations: ["medine","fes","cordoue","marrakech","damas","bagdad","samarcande","tombouctou","le_caire","la_mecque"], theme: "#D4AF37", nextHint: "Niv. 15 + 2 arcs + maîtrise 30%" },
  2: { route: "/oasis/ere2", locations: ["abyssinie","jerusalem","taif","medine_hijra","khaybar"],                                              theme: "#34d399", nextHint: "Niv. 30 + 4 arcs + maîtrise 50%" },
  3: { route: "/oasis/ere3", locations: ["kairouan","alexandrie","chiraz","tolede","nishapur"],               theme: "#60a5fa", nextHint: "Niv. 50 + 6 arcs + maîtrise 70%" },
  4: { route: "/oasis/ere4", locations: ["istanbul","agra","isfahan","gao","zanzibar"],               theme: "#f97316", nextHint: "Niv. 75 + 9 arcs + maîtrise 85%" },
  5: { route: "/oasis/ere5", locations: ["al_azhar_v","sarajevo","kuala_lumpur"],                     theme: "#FFD700", nextHint: "Mode Hafiz — Prestige" },
};

import type { Category } from "./types";

export function getCurrentEraIndex(level: number, arcsRead: number, avgMastery: number): number {
  let era = 1;
  for (const c of ERA_CONDITIONS) {
    if (level >= c.minLevel && arcsRead >= c.minArcsRead && avgMastery >= c.minAvgMastery) {
      era = c.eraIndex;
    }
  }
  return era;
}

export function getEraCondition(eraIndex: number): EraCondition {
  return ERA_CONDITIONS.find(e => e.eraIndex === eraIndex) ?? ERA_CONDITIONS[0];
}

// ── Manuscripts ────────────────────────────────────────────────

export interface ManuscriptDef {
  id:         string;
  title:      string;
  author:     string;
  era:        string;
  pages:      number;        // total pages to collect
  category:   Category;      // which category gives pages
  color:      string;
  unlocks?:   string;        // optional: story arc or content unlocked when complete
  description: string;
}

export const MANUSCRIPTS: ManuscriptDef[] = [
  {
    id: "muqaddima", title: "La Muqaddima", author: "Ibn Khaldoun", era: "XIVe siècle",
    pages: 12, category: "history", color: "#a78bfa",
    unlocks: "arc_sahaba",
    description: "Le premier traité de sociologie — 12 pages à assembler via les questions d'histoire.",
  },
  {
    id: "al_jabr", title: "Kitāb al-Mukhtaṣar", author: "Al-Khwarizmi", era: "IXe siècle",
    pages: 10, category: "arabic", color: "#D4AF37",
    description: "Le traité d'algèbre fondateur — 10 pages via les questions d'arabe.",
  },
  {
    id: "canon", title: "Canon de la Médecine", author: "Ibn Sina", era: "XIe siècle",
    pages: 10, category: "religion", color: "#60a5fa",
    description: "La somme médicale d'Ibn Sina — 10 pages via les questions de religion.",
  },
  {
    id: "rihla", title: "La Rihla", author: "Ibn Battuta", era: "XIVe siècle",
    pages: 8, category: "history", color: "#34d399",
    description: "Le journal de voyage le plus long de l'histoire médiévale — 8 pages via l'histoire.",
  },
  {
    id: "tabaqat", title: "Al-Tabaqāt al-Kubrā", author: "Ibn Sa'd", era: "IXe siècle",
    pages: 10, category: "quran", color: "#f97316",
    description: "Les biographies des Compagnons — 10 pages via les questions de Coran.",
  },
];

/** How many correct answers needed per manuscript page. */
export const CORRECT_PER_PAGE = 5;

/** Story arcs linked to each location — used for teaser cards. */
export const LOCATION_STORY_ARCS: Record<string, Array<{ arcId: string; title: string; color: string }>> = {
  medine:      [{ arcId: "arc_sira",    title: "La Sîra du Prophète ﷺ",      color: "#34d399" }],
  fes:         [{ arcId: "arc_ibrahim", title: "Ibrahim et le Feu",           color: "#f97316" }],
  cordoue:     [{ arcId: "arc_ibrahim", title: "Ibrahim et le Feu",           color: "#f97316" }],
  marrakech:   [{ arcId: "arc_moussa",  title: "Moussa et Pharaon",           color: "#06b6d4" }],
  damas:       [{ arcId: "arc_maryam",  title: "Maryam, la choisie",          color: "#a78bfa" }],
  bagdad:      [{ arcId: "arc_yusuf",   title: "L'histoire de Yûsuf",         color: "#D4AF37" }],
  samarcande:  [{ arcId: "arc_yusuf",   title: "L'histoire de Yûsuf",         color: "#D4AF37" }],
  tombouctou:  [{ arcId: "arc_sahaba",  title: "Les Compagnons du Prophète ﷺ", color: "#fbbf24" }],
  le_caire:    [{ arcId: "arc_sahaba",  title: "Les Compagnons du Prophète ﷺ", color: "#fbbf24" }],
};

/** Era name based on player level — display only for Phase 1. */
export function getEraForLevel(level: number): { name: string; subtitle: string; color: string } {
  if (level <= 5)  return { name: "Ère I",  subtitle: "Les Prophètes",       color: "#D4AF37" };
  if (level <= 15) return { name: "Ère II", subtitle: "L'Aube de l'Islam",   color: "#34d399" };
  if (level <= 30) return { name: "Ère III",subtitle: "L'Âge d'Or",          color: "#60a5fa" };
  if (level <= 50) return { name: "Ère IV", subtitle: "Les Empires",          color: "#f97316" };
  return                  { name: "Ère V",  subtitle: "La Maîtrise",          color: "#a78bfa" };
}
