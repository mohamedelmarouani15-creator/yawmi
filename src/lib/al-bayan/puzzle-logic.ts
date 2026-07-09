// ── Constantes globales ───────────────────────────────────────────────────
// Refonte villa/riad : la narration historique (Témoignage/Rasm/Route,
// compilation du Coran) est remplacée par une chasse au trésor dans une
// grande demeure — 4 énigmes imbriquées forçant une exploration méthodique
// (Jardin -> Majlis -> Scriptorium -> Cuisine -> coffre -> Sanctuaire).

export const GAME_DURATION = 2700; // 45 minutes en secondes

// ── Énigme 1 — L'Horloge Astronomique du Jardin ───────────────────────────
// Trois anneaux d'un astrolabe monumental, à orienter selon les indices
// gravés sur la margelle de la fontaine centrale. Les trois angles doivent
// être atteints simultanément pour déverrouiller la porte du Majlis.

export interface AstrolabeRing {
  id: "heures" | "mois" | "etoiles";
  label: string;
  targetDeg: number;
}

export const ASTROLABE_RINGS: AstrolabeRing[] = [
  { id: "heures", label: "Anneau des heures", targetDeg: 120 },
  { id: "mois", label: "Anneau des mois lunaires", targetDeg: 210 },
  { id: "etoiles", label: "Anneau des étoiles", targetDeg: 45 },
];

export const ASTROLABE_TOLERANCE_DEG = 6;

export const FOUNTAIN_INSCRIPTION =
  "Ô voyageur, la fontaine garde les secrets du ciel : l'anneau des heures s'arrête au tiers du jour, " +
  "l'anneau des mois lunaires marque Rajab, le septième mois, et l'anneau des étoiles pointe vers l'astre du matin. " +
  "Aligne les trois anneaux de l'astrolabe sur ces repères pour ouvrir la voie du Grand Salon.";

export const HINTS_ASTROLABE: [string, string, string] = [
  "Un tiers du jour, sur un cercle de 360°... à quel angle cela correspond-il ?",
  "Rajab est le SEPTIÈME mois du calendrier lunaire — répartis les 12 mois sur 360° et compte jusqu'à sept.",
  "Anneau des heures = 120°, anneau des mois = 210°, anneau des étoiles = 45°.",
];

// ── Énigme 2 — Les Manuscrits du Scriptorium ──────────────────────────────
// Un indice trouvé sous un tapis du Majlis envoie le joueur au Scriptorium :
// trois manuscrits doivent être replacés dans l'ordre chronologique de leur
// rédaction pour révéler un passage secret vers la Cuisine.

export interface Manuscript {
  id: string;
  title: string;
  year: number;
  /** Position correcte sur l'étagère, de gauche (0) à droite (2). */
  correctSlot: 0 | 1 | 2;
}

export const MANUSCRIPTS: Manuscript[] = [
  { id: "ms-exil", title: "Chronique de l'Exil", year: 622, correctSlot: 0 },
  { id: "ms-bataille", title: "Récit de la Première Bataille", year: 624, correctSlot: 1 },
  { id: "ms-retour", title: "Le Retour Triomphal", year: 630, correctSlot: 2 },
];

export const LIBRARY_CLUE =
  "Un parchemin glissé sous le tapis du Majlis : « Trois manuscrits du Scriptorium gardent la mémoire de " +
  "trois années : l'an de l'exil, l'an de la première bataille, l'an du retour triomphal. Range-les sur " +
  "l'étagère du plus ancien au plus récent, et le mur cédera son secret. »";

export const HINTS_MANUSCRITS: [string, string, string] = [
  "Chaque manuscrit porte une année en chiffres — regarde-les avant de choisir un ordre.",
  "L'exil précède la première bataille, qui précède elle-même le retour triomphal.",
  "Ordre correct, de gauche à droite : Chronique de l'Exil (622), Première Bataille (624), Retour Triomphal (630).",
];

// ── Énigme 3 — Les Jarres de la Cuisine ───────────────────────────────────
// Quatre jarres d'huile, parmi d'autres poteries décoratives, portent chacune
// un chiffre gravé. Lues dans l'ordre où elles sont disposées sur l'étagère,
// elles forment le code du coffre en cèdre.

export const JAR_CODE: [number, number, number, number] = [3, 1, 8, 5];

export const KITCHEN_CLUE =
  "Quatre jarres d'huile, alignées sur l'étagère du fond, portent chacune un chiffre gravé dans l'argile. " +
  "Lis-les dans l'ordre, de gauche à droite : voilà le code du coffre.";

export const HINTS_JARRES: [string, string, string] = [
  "Toutes les jarres ne comptent pas — seules quatre, sur l'étagère du fond, portent un chiffre gravé.",
  "Lis les quatre jarres gravées dans leur ordre sur l'étagère, de gauche à droite.",
  `Le code est ${JAR_CODE.join("-")}.`,
];

// ── Énigme 4 — L'Éclat du Sanctuaire ──────────────────────────────────────
// Le coffre en cèdre (dans le Majlis) contient une lentille de cristal.
// Posée sur le grand lustre du Sanctuaire, elle projette un rayon qui
// frappe le mur et révèle la trappe de sortie.

export const SANCTUAIRE_CLUE =
  "Le lustre central du Sanctuaire porte un logement vide, à la forme d'une lentille. " +
  "Une fois la lumière focalisée, elle désignera la sortie.";

// ── Métadonnées consolidées (pour EnigmaStatus / HintMailbox) ────────────

export interface QuestMeta {
  id: "astrolabe" | "manuscrits" | "jarres" | "lentille";
  title: string;
  subtitle: string;
  zone: string;
  hints: [string, string, string];
}

export const QUEST_ASTROLABE: QuestMeta = {
  id: "astrolabe",
  title: "L'Horloge Astronomique",
  subtitle: "Les anneaux de la fontaine",
  zone: "Jardin",
  hints: HINTS_ASTROLABE,
};

export const QUEST_MANUSCRITS: QuestMeta = {
  id: "manuscrits",
  title: "Les Manuscrits Perdus",
  subtitle: "L'ordre des trois chroniques",
  zone: "Scriptorium",
  hints: HINTS_MANUSCRITS,
};

export const QUEST_JARRES: QuestMeta = {
  id: "jarres",
  title: "Le Code des Jarres",
  subtitle: "Quatre chiffres gravés dans l'argile",
  zone: "Cuisine",
  hints: HINTS_JARRES,
};

export const QUEST_LENTILLE: QuestMeta = {
  id: "lentille",
  title: "L'Éclat du Sanctuaire",
  subtitle: "Le rayon qui révèle la sortie",
  zone: "Sanctuaire",
  hints: [
    "Le coffre du Majlis contenait un objet de verre — où pourrait-il bien se loger ?",
    "Le grand lustre du Sanctuaire a une forme vide en son centre.",
    "Place la lentille de cristal sur le lustre du Sanctuaire.",
  ],
};

export const ALL_QUESTS: Record<QuestMeta["id"], QuestMeta> = {
  astrolabe: QUEST_ASTROLABE,
  manuscrits: QUEST_MANUSCRITS,
  jarres: QUEST_JARRES,
  lentille: QUEST_LENTILLE,
};
