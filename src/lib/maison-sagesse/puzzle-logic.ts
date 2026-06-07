// ── Constantes globales ───────────────────────────────────────────────────

export const SOLUTION = { a: 5, b: 7, c: 6 } as const;
export const GAME_DURATION = 2700; // 45 minutes en secondes

// ── Parchemins maîtres ────────────────────────────────────────────────────

export const PARCHEMIN_FOI = `Ô apprenti, la Maison de la Sagesse repose sur cinq colonnes invisibles, \
aussi solides que les piliers du Trône Divin. \
Cherche les cinq parchemins dispersés par le vent de l'ignorance. \
Sur chacun, un pilier est gravé en arabe. Place-les dans l'ordre de la Révélation : \
la Déclaration avant la Prière, l'Aumône avant le Jeûne, le Pèlerinage en dernier. \
Quand les cinq colonnes se dressent dans l'ordre juste, \
compte-les de ta main droite, comme le Prophète ﷺ les comptait sur ses doigts. \
Ce nombre est la première clé du Coffre de la Connaissance.`;

export const PARCHEMIN_SCIENCE = `Al-Battânî, astronome de la Maison de la Sagesse, a cartographié les cieux \
tels que les anges les traversent. \
Dans cette salle, une sphère céleste tourne lentement au-dessus de l'astrolabe. \
Observe les corps lumineux que les savants anciens nommèrent 'Nujûm as-sayyâra' — \
les étoiles errantes. Compte ceux qui portent un nom arabe gravé sur leur orbe : \
le Soleil brillant, la Lune fidèle, et les cinq gardiens silencieux du zodiaque. \
Ce nombre de vagabonds célestes est la deuxième clé. \
Car c'est ce même chiffre que les bâtisseurs utilisèrent pour compter \
les jours de la semaine sacrée.`;

export const PARCHEMIN_SAGESSE = `Jibrîl 'alayhi as-salâm vint un jour interroger le Prophète ﷺ devant les Compagnons. \
Il demanda : 'Qu'est-ce que la Foi ?' Et le Prophète ﷺ répondit par une liste sacrée — \
six fondations sans lesquelles la Foi est comme une tente sans piquets. \
Dans cette bibliothèque, un voile de papier troué révèle les mots cachés dans la grille. \
Pose-le sur la page gardée sous le grand chandelier. \
Lis les colonnes qui apparaissent. \
Compte les piliers de la Foi que Jibrîl enseigna ce jour-là. \
Ce nombre est la troisième et dernière clé.`;

// ── Indices — Lettres du Messager ─────────────────────────────────────────

/** 3 niveaux d'indices pour l'Énigme A (Voie de la Foi, digit = 5) */
export const HINTS_FOI: [string, string, string] = [
  // Niveau 1 - Subtil
  `Un parchemin froissé glissé sous la porte...\n'Ô chercheurs de vérité, sachez que les fondations de l'édifice de l'Islam se comptent sur les doigts d'une seule main. Cherchez les piliers éparpillés, car le vent de l'ignorance les a dispersés dans les quatre coins de cette salle.'`,
  // Niveau 2 - Mécanique
  `Une nouvelle lettre...\n'Mes amis, Al-Khwârizmî vous guide : chaque pilier est numéroté en arabe sur son parchemin. Cherchez le chiffre caché dans la calligraphie de chaque scroll. Trouvez les cinq, ordonnez-les de la Shahada au Hajj, et le nombre vous sautera aux yeux.'`,
  // Niveau 3 - Solution
  `Le maître lui-même écrit...\n'Je romps le voile du secret par miséricorde : il y a exactement CINQ piliers de l'Islam. Shahada (1), Salat (2), Zakat (3), Sawm (4), Hajj (5). Comptez-les sur vos doigts. Le chiffre A est CINQ — inscrivez 5 sur le cadenas.'`,
];

/** 3 niveaux d'indices pour l'Énigme B (Voie de la Science, digit = 7) */
export const HINTS_SCIENCE: [string, string, string] = [
  // Niveau 1 - Subtil
  `Lettre froissée...\n'Les astronomes de la Maison de la Sagesse nomment certaines étoiles "errantes" car elles se déplacent contrairement aux autres. Cherchez dans cette salle quels astres brillent différemment des étoiles fixes. Ils ont tous un nom arabe particulier.'`,
  // Niveau 2 - Mécanique
  `Nouvelle missive...\n'Al-Khwârizmî vous éclaire : les Anciens distinguaient les étoiles fixes des astres errants — le Soleil, la Lune, et cinq planètes connues de l'Antiquité à l'Islam. Comptez ces sept voyageurs célestes gravés sur la sphère armillaire dans l'angle est de la salle.'`,
  // Niveau 3 - Solution
  `Le directeur intervient...\n'Par décret du Calife : les sept astres errants sont Shams (Soleil), Qamar (Lune), Utârid (Mercure), Zahrah (Vénus), Mirrîkh (Mars), Mushtarî (Jupiter), Zuhal (Saturne). SEPT astres. Le chiffre B est 7.'`,
];

/** 3 niveaux d'indices pour l'Énigme C (Voie de la Sagesse, digit = 6) */
export const HINTS_SAGESSE: [string, string, string] = [
  // Niveau 1 - Subtil
  `Lettre subtile...\n'Une vieille tradition rapporte que Jibrîl 'alayhi as-salâm vint tester les Compagnons sur les fondements de la Foi. Les réponses du Prophète ﷺ constituent une liste précise, consignée dans ce livre. Le carton perforé vous révélera les colonnes cachées dans le texte.'`,
  // Niveau 2 - Pratique
  `Aide pratique...\n'Le carton posé sur la page révèle des colonnes de lettres. Lisez chaque colonne de haut en bas. Chaque colonne forme un mot arabe : les piliers de la Foi. Comptez combien de colonnes lisibles apparaissent à travers les trous du carton.'`,
  // Niveau 3 - Solution
  `Solution directe...\n'Les six piliers de la Foi sont : 1. Croyance en Allah, 2. Aux Anges, 3. Aux Livres révélés, 4. Aux Prophètes, 5. Au Jour Dernier, 6. Au Destin. SIX piliers. Le chiffre C est 6. Combinaison finale : 5-7-6.'`,
];

// ── Métadonnées des énigmes ───────────────────────────────────────────────

export interface EnigmaMeta {
  id: 'A' | 'B' | 'C';
  phase: 'quest-faith' | 'quest-science' | 'quest-wisdom';
  title: string;
  subtitle: string;
  digit: number;
  parchemin: string;
  hints: [string, string, string];
  /** Objets/parchemins à trouver dans la scène (clueId → label) */
  clues: Record<string, string>;
  childRole: string;
}

export const ENIGMA_A: EnigmaMeta = {
  id: 'A',
  phase: 'quest-faith',
  title: 'La Voie de la Foi',
  subtitle: "Les Cinq Piliers de l’Islam",
  digit: SOLUTION.a,
  parchemin: PARCHEMIN_FOI,
  hints: HINTS_FOI,
  clues: {
    pilier_shahada: 'Shahada — الشهادة',
    pilier_salat:   'Salat — الصلاة',
    pilier_zakat:   'Zakat — الزكاة',
    pilier_sawm:    'Sawm — الصوم',
    pilier_hajj:    'Hajj — الحج',
  },
  childRole: "L'enfant compte les piliers sur ses doigts comme le Prophète ﷺ les comptait.",
};

export const ENIGMA_B: EnigmaMeta = {
  id: 'B',
  phase: 'quest-science',
  title: 'La Voie de la Science',
  subtitle: 'Les Sept Astres Errants',
  digit: SOLUTION.b,
  parchemin: PARCHEMIN_SCIENCE,
  hints: HINTS_SCIENCE,
  clues: {
    astre_shams:    'Shams — الشمس (Soleil)',
    astre_qamar:    'Qamar — القمر (Lune)',
    astre_utarid:   'Utârid — عطارد (Mercure)',
    astre_zahrah:   'Zahrah — الزهرة (Vénus)',
    astre_mirrikhi: 'Mirrîkh — المريخ (Mars)',
    astre_mushtari: 'Mushtarî — المشتري (Jupiter)',
    astre_zuhal:    'Zuhal — زحل (Saturne)',
  },
  childRole: "L'enfant fait tourner la sphère armillaire et compte les astres lumineux.",
};

export const ENIGMA_C: EnigmaMeta = {
  id: 'C',
  phase: 'quest-wisdom',
  title: 'La Voie de la Sagesse',
  subtitle: 'Les Six Piliers de la Foi (Iman)',
  digit: SOLUTION.c,
  parchemin: PARCHEMIN_SAGESSE,
  hints: HINTS_SAGESSE,
  clues: {
    iman_allah:        'Croyance en Allah',
    iman_anges:        'Croyance aux Anges — الملائكة',
    iman_livres:       'Croyance aux Livres révélés — الكتب',
    iman_prophetes:    'Croyance aux Prophètes — الأنبياء',
    iman_jour_dernier: 'Croyance au Jour Dernier — اليوم الآخر',
    iman_destin:       'Croyance au Destin divin — القدر',
  },
  childRole: "L'enfant pose le carton perforé sur la grille et lit les mots révélés.",
};

export const ALL_ENIGMAS: Record<'A' | 'B' | 'C', EnigmaMeta> = {
  A: ENIGMA_A,
  B: ENIGMA_B,
  C: ENIGMA_C,
};
