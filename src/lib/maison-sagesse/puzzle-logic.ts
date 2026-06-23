// ── Constantes globales ───────────────────────────────────────────────────

export const SOLUTION = { a: 5, b: 7, c: 6 } as const;
export const GAME_DURATION = 2700; // 45 minutes en secondes

// ── Énigme A — La Voie de la Foi ──────────────────────────────────────────
// Les 5 piliers, présentés sous forme de riddle (pas de nom affiché), à
// ordonner non pas dans l'ordre de récitation scolaire mais dans l'ordre où
// ils entrent dans la vie d'un croyant. Le pilier marqué "Hajj" occupe la
// dernière position (5) une fois l'ordre correct trouvé → Chiffre A = 5.

export interface PillarRiddle {
  id: string;
  label: string;
  arabic: string;
  riddle: string;
}

export const PILLAR_LIFE_ORDER: string[] = [
  "shahada",
  "salat",
  "sawm",
  "zakat",
  "hajj",
];

export const PILLAR_RIDDLES: Record<string, PillarRiddle> = {
  shahada: {
    id: "shahada",
    label: "Shahada",
    arabic: "الشهادة",
    riddle:
      "Avant le premier souffle de l'aube, avant le premier pas de l'enfant, des mots furent soufflés à mon oreille — une vérité plus ancienne que les sables. Je suis la porte sans serrure, le commencement sans lequel rien d'autre n'existe.",
  },
  salat: {
    id: "salat",
    label: "Salat",
    arabic: "الصلاة",
    riddle:
      "Cinq fois le soleil me voit incliner le front vers la terre ; cinq fois je tourne mon visage vers la Maison Sacrée que nul ici n'a jamais touchée de ses mains. Je ne demande que le jour entier, miette par miette, comme cinq perles sur un même fil.",
  },
  sawm: {
    id: "sawm",
    label: "Sawm",
    arabic: "الصوم",
    riddle:
      "Un mois lunaire entier, et le ventre se fait silencieux du lever au coucher du soleil. Ce n'est pas la faim que je façonne, mais la patience. Quand la dernière étoile de mon mois s'éteint, une fête couronne le sacrifice.",
  },
  zakat: {
    id: "zakat",
    label: "Zakat",
    arabic: "الزكاة",
    riddle:
      "Je ne suis pas un don : je suis une dette déjà due. Sur ce que tu possèdes depuis une lune entière, une part appartient déjà à celui qui n'a rien. Je purifie ta richesse comme l'eau purifie le vêtement.",
  },
  hajj: {
    id: "hajj",
    label: "Hajj",
    arabic: "الحج",
    riddle:
      "Une fois dans toute une vie, si tes jambes et ta bourse le permettent, tu quitteras ta maison pour une autre maison, plus ancienne que Bagdad elle-même. Mes pas sont rares — on dit qu'ils valent plus que mille jours ordinaires.",
  },
};

export const PARCHEMIN_FOI = `Ô apprenti, la Maison de la Sagesse repose sur cinq colonnes invisibles. \
Cinq parchemins sont dispersés dans cette salle, chacun racontant l'une d'elles sans jamais la nommer. \
Lis-les, reconnais-les, puis dresse-les côte à côte dans l'ordre où elles entrent dans une vie : \
ce qui se dit dès la naissance, ce qui s'apprend enfant, ce qui s'observe à l'adolescence, \
ce qui se donne une fois adulte, et ce qui se vit, une seule fois, plus tard dans la vie. \
Quand l'ordre est juste, compte la position du pèlerin dont les pas sont les plus rares de tous. \
Ce nombre est la première clé du Coffre de la Connaissance.`;

// ── Énigme B — La Voie de la Science ──────────────────────────────────────
// Cap géodésique réel Bagdad → La Mecque ≈ 199,8°, soit ≈ 200° (Sud-Sud-Ouest).
// L'astrolabe doit être orienté dans cette direction ET les 7 astres errants
// doivent tous avoir été découverts → Chiffre B = 7.

export const QIBLA_BEARING_DEG = 200;
export const QIBLA_TOLERANCE_DEG = 10;

export const PARCHEMIN_SCIENCE = `Ô chercheur du ciel, sache que la Terre est ronde comme une perle, et que depuis Bagdad, \
la Maison Sacrée de La Mecque ne se trouve ni au Levant ni au Couchant, mais presque droit vers le Midi, \
légèrement inclinée vers le Couchant — un cap que les savants mesurent à deux cents degrés depuis le Nord. \
Tourne le disque de l'astrolabe jusqu'à ce cap, puis compte un à un les astres errants gravés sur son pourtour : \
le Soleil, la Lune, et les cinq étoiles vagabondes que les Anciens connaissaient. \
Leur nombre total est la deuxième clé.`;

// ── Énigme C — La Voie de la Sagesse ──────────────────────────────────────
// Grille de mots 6×6 ; une grille percée révèle 10 cases précises qui,
// lues ligne par ligne, épellent un hadith authentique sur l'Akhlaq
// ("Je n'ai été envoyé que pour parfaire les nobles caractères"). Ce hadith
// correspond à l'entrée n°6 du Livret des Sagesses → Chiffre C = 6.

export const WORD_GRID: string[][] = [
  ["sable", "JE", "lune", "papyrus", "N'AI", "calame"],
  ["ÉTÉ", "jardin", "rivière", "ENVOYÉ", "étoile", "encre"],
  ["désert", "palmier", "QUE", "bougie", "tapis", "POUR"],
  ["caravane", "PARFAIRE", "colombe", "encens", "LES", "minaret"],
  ["NOBLES", "fontaine", "grenade", "safran", "ambre", "musc"],
  ["datte", "turban", "parchemin", "CARACTÈRES", "horizon", "rosée"],
];

/** Coordonnées [col, row] des 10 cases révélées par la grille percée (0-indexées),
 * dans l'ordre de lecture qui épelle le hadith. */
export const GRILLE_HOLE_COORDS: [number, number][] = [
  [1, 0], [4, 0], // JE, N'AI
  [0, 1], [3, 1], // ÉTÉ, ENVOYÉ
  [2, 2], [5, 2], // QUE, POUR
  [1, 3], [4, 3], // PARFAIRE, LES
  [0, 4],         // NOBLES
  [3, 5],         // CARACTÈRES
];

export const HADITH_AKHLAQ = "Je n'ai été envoyé que pour parfaire les nobles caractères.";

export interface LivretEntry {
  num: number;
  text: string;
  ref: string;
}

export const LIVRET_SAGESSES: LivretEntry[] = [
  { num: 1, text: "Le sourire que tu adresses à ton frère est une aumône.", ref: "Rapporté par At-Tirmidhî" },
  { num: 2, text: "Que celui qui croit en Allah et au Jour Dernier dise du bien, ou qu'il se taise.", ref: "Rapporté par Al-Bukhârî et Muslim" },
  { num: 3, text: "Facilitez les choses, ne les compliquez pas. Annoncez d'heureuses nouvelles, ne repoussez personne.", ref: "Rapporté par Al-Bukhârî" },
  { num: 4, text: "Allah est doux et Il aime la douceur en toute chose.", ref: "Rapporté par Al-Bukhârî et Muslim" },
  { num: 5, text: "La recherche du savoir est une obligation pour tout musulman.", ref: "Rapporté par Ibn Mâjah" },
  { num: 6, text: HADITH_AKHLAQ, ref: "Parole du Prophète ﷺ, rapportée notamment par Al-Bayhaqî" },
  { num: 7, text: "Le plus fort d'entre vous n'est pas celui qui terrasse les autres à la lutte, mais celui qui se maîtrise lorsqu'il est en colère.", ref: "Rapporté par Al-Bukhârî et Muslim" },
  { num: 8, text: "Celui qui ne remercie pas les gens ne remercie pas Allah.", ref: "Rapporté par At-Tirmidhî" },
  { num: 9, text: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.", ref: "Rapporté par Al-Bukhârî" },
];

export const PARCHEMIN_SAGESSE = `Dans cette bibliothèque, un voile de papier troué révèle des mots cachés dans une grille. \
Pose-le sur la page gardée sous le grand chandelier, et lis les cases qui apparaissent, ligne par ligne. \
Une phrase entière du Prophète ﷺ se révélera. Cherche-la ensuite dans le Livret des Sagesses : \
le numéro de l'entrée qui lui correspond exactement est la troisième et dernière clé.`;

// ── Indices — Lettres du Messager ─────────────────────────────────────────

/** 3 niveaux d'indices pour l'Énigme A (Voie de la Foi, digit = 5) */
export const HINTS_FOI: [string, string, string] = [
  // Niveau 1 - Subtil
  `Un parchemin froissé glissé sous la porte...\n'Ô chercheurs de vérité, cinq parchemins racontent les cinq piliers sans jamais les nommer. Lisez-les avec attention : chacun décrit une pratique que vous connaissez peut-être déjà.'`,
  // Niveau 2 - Mécanique
  `Une nouvelle lettre...\n'Mes amis, Al-Khwârizmî vous guide : pensez à votre propre vie. Qu'avez-vous appris en premier, tout petit, et que ferez-vous, si Dieu le veut, le plus tard possible ? Rangez les cinq piliers comme les étapes d'une vie, du premier au dernier.'`,
  // Niveau 3 - Solution
  `Le maître lui-même écrit...\n'Je romps le voile du secret par miséricorde : l'ordre juste est Shahada, Salat, Sawm, Zakat, puis Hajj. Le Hajj — le pèlerinage, accompli une seule fois dans une vie — occupe la cinquième et dernière place. Le chiffre A est CINQ.'`,
];

/** 3 niveaux d'indices pour l'Énigme B (Voie de la Science, digit = 7) */
export const HINTS_SCIENCE: [string, string, string] = [
  // Niveau 1 - Subtil
  `Lettre froissée...\n'L'astrolabe sur la table n'est pas qu'un objet décoratif — fais-le tourner. Une direction précise, vers le Sud-Sud-Ouest, a un sens particulier pour tout croyant.'`,
  // Niveau 2 - Mécanique
  `Nouvelle missive...\n'Al-Khwârizmî vous éclaire : depuis Bagdad, la direction sacrée se trouve à environ deux cents degrés depuis le Nord. Tournez le disque jusqu'à ce que le cap affiché s'en approche, puis cliquez les sept astres errants en orbite dans la salle.'`,
  // Niveau 3 - Solution
  `Le directeur intervient...\n'Par décret du Calife : amenez le cap de l'astrolabe à 200°, cliquez les sept astres — Shams, Qamar, Utârid, Zahrah, Mirrîkh, Mushtarî, Zuhal — puis confirmez. SEPT astres. Le chiffre B est 7.'`,
];

/** 3 niveaux d'indices pour l'Énigme C (Voie de la Sagesse, digit = 6) */
export const HINTS_SAGESSE: [string, string, string] = [
  // Niveau 1 - Subtil
  `Lettre subtile...\n'Le livre central de la bibliothèque cache une grille percée. Examine-le pour la découvrir.'`,
  // Niveau 2 - Pratique
  `Aide pratique...\n'Posez la grille sur la page de mots, et lisez uniquement les cases révélées, ligne par ligne. Une phrase du Prophète ﷺ apparaîtra. Cherchez-la ensuite dans le Livret des Sagesses.'`,
  // Niveau 3 - Solution
  `Solution directe...\n'La phrase révélée est : "Je n'ai été envoyé que pour parfaire les nobles caractères." Elle correspond à l'entrée numéro SIX du Livret. Le chiffre C est 6. Combinaison finale : 5-7-6.'`,
];

// ── Métadonnées des énigmes ───────────────────────────────────────────────

export interface EnigmaMeta {
  id: "A" | "B" | "C";
  phase: "quest-faith" | "quest-science" | "quest-wisdom";
  title: string;
  subtitle: string;
  digit: number;
  parchemin: string;
  hints: [string, string, string];
  childRole: string;
}

export const ENIGMA_A: EnigmaMeta = {
  id: "A",
  phase: "quest-faith",
  title: "La Voie de la Foi",
  subtitle: "Les Cinq Piliers, dans l'ordre d'une vie",
  digit: SOLUTION.a,
  parchemin: PARCHEMIN_FOI,
  hints: HINTS_FOI,
  childRole: "L'enfant lit les riddles à voix haute et place les parchemins dans l'ordre choisi.",
};

export const ENIGMA_B: EnigmaMeta = {
  id: "B",
  phase: "quest-science",
  title: "La Voie de la Science",
  subtitle: "Le Cap Sacré et les Sept Astres Errants",
  digit: SOLUTION.b,
  parchemin: PARCHEMIN_SCIENCE,
  hints: HINTS_SCIENCE,
  childRole: "L'enfant fait tourner l'astrolabe et compte les astres découverts.",
};

export const ENIGMA_C: EnigmaMeta = {
  id: "C",
  phase: "quest-wisdom",
  title: "La Voie de la Sagesse",
  subtitle: "La Grille Percée et le Livret des Sagesses",
  digit: SOLUTION.c,
  parchemin: PARCHEMIN_SAGESSE,
  hints: HINTS_SAGESSE,
  childRole: "L'enfant pose la grille percée et cherche l'entrée correspondante dans le Livret.",
};

export const ALL_ENIGMAS: Record<"A" | "B" | "C", EnigmaMeta> = {
  A: ENIGMA_A,
  B: ENIGMA_B,
  C: ENIGMA_C,
};
