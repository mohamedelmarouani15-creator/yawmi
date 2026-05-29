import type { LocationDef } from "./types";

export const LOCATIONS: LocationDef[] = [
  {
    id: "medine",
    name: "المدينة المنورة",
    nameFr: "Médine",
    country: "Arabie Saoudite",
    requiredXP: 0,
    sageId: null,
    description: "La ville du Prophète ﷺ. Ton point de départ vers la sagesse.",
    color: "#D4AF37",
  },
  {
    id: "fes",
    name: "فاس",
    nameFr: "Fès",
    country: "Maroc",
    requiredXP: 100,
    sageId: "al_idrissi",
    description: "Cité des savants et des médersa. Al-Idrissi y cartographia le monde.",
    color: "#2e8b57",
  },
  {
    id: "cordoue",
    name: "قرطبة",
    nameFr: "Cordoue",
    country: "Espagne (Andalousie)",
    requiredXP: 300,
    sageId: "ibn_rushd",
    description: "La perle de l'Occident islamique. Averroès y réconcilia raison et foi.",
    color: "#8B4513",
  },
  {
    id: "marrakech",
    name: "مراكش",
    nameFr: "Marrakech",
    country: "Maroc",
    requiredXP: 600,
    sageId: "ibn_toumert",
    description: "La ville ocre, berceau des Almohades et de la Koutoubia.",
    color: "#CD853F",
  },
  {
    id: "damas",
    name: "دمشق",
    nameFr: "Damas",
    country: "Syrie",
    requiredXP: 1000,
    sageId: "ibn_asaker",
    description: "La plus ancienne capitale islamique. Ibn Asaker y préserva 1300 biographies.",
    color: "#4682B4",
  },
  {
    id: "bagdad",
    name: "بغداد",
    nameFr: "Bagdad",
    country: "Irak",
    requiredXP: 1500,
    sageId: "al_khwarizmi",
    description: "La Maison de la Sagesse. Al-Khwarizmi y inventa l'algèbre.",
    color: "#6B8E23",
  },
  {
    id: "samarcande",
    name: "سمرقند",
    nameFr: "Samarcande",
    country: "Ouzbékistan",
    requiredXP: 2000,
    sageId: "ibn_sina",
    description: "Carrefour des routes de la soie. Ibn Sina y rédigea le Canon de la médecine.",
    color: "#9370DB",
  },
  {
    id: "tombouctou",
    name: "تمبكتو",
    nameFr: "Tombouctou",
    country: "Mali",
    requiredXP: 2800,
    sageId: "ahmad_baba",
    description: "La cité des 333 saints. Ahmad Baba y réunit 700 000 manuscrits.",
    color: "#D2691E",
  },
  {
    id: "le_caire",
    name: "القاهرة",
    nameFr: "Le Caire",
    country: "Égypte",
    requiredXP: 3800,
    sageId: "ibn_khaldoun",
    description: "Siège d'Al-Azhar. Ibn Khaldoun y fonda la sociologie moderne.",
    color: "#DAA520",
  },
  {
    id: "la_mecque",
    name: "مكة المكرمة",
    nameFr: "La Mecque",
    country: "Arabie Saoudite",
    requiredXP: 5000,
    sageId: null,
    description: "Le sommet du voyage. Que ta quête de sagesse soit acceptée.",
    color: "#FFD700",
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

export function isUnlocked(locationId: string, xp: number, unlockedLocations: string[]): boolean {
  if (unlockedLocations.includes(locationId)) return true;
  const loc = getLocation(locationId);
  return loc ? xp >= loc.requiredXP : false;
}
