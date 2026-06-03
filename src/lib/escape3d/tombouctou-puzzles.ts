// ── Données des puzzles multi-étapes de la Bibliothèque de Tombouctou ──

export interface TombouktouClue {
  id:       string;
  lockId:   number;   // cadenas auquel cet indice appartient (0-3)
  position: [number, number, number];
  icon:     string;
  label:    string;   // "Gravure sur le mur Est"
  content:  string;   // ce que révèle l'indice
  hint:     string;   // aide de direction pour le joueur
}

export interface TombouktouLock {
  id:           number;
  title:        string;
  themeIcon:    string;
  story:        string;       // narration contextuelle affichée dans le modal
  question:     string;
  options:      string[];
  correctIndex: number;
  explanation:  string;       // révélation historique après résolution
}

// ── 12 indices cachés dans la bibliothèque (3 par cadenas) ────────────
export const TOMBOUCTOU_CLUES: TombouktouClue[] = [

  // ── Cadenas 0 — Le Pèlerinage de Mansa Moussa ──────────────────────
  {
    id: "c0a", lockId: 0,
    position: [3, 0.8, -8.5],
    icon: "📅", label: "Gravure dans la pierre",
    content: "L'année gravée : ١٣٢٤ (1324)",
    hint: "Mur du fond, côté Est",
  },
  {
    id: "c0b", lockId: 0,
    position: [-3.5, 0.8, -7.5],
    icon: "🕌", label: "Inscription arabe",
    content: "La destination : La Mecque — مكة",
    hint: "Colonne arrière gauche",
  },
  {
    id: "c0c", lockId: 0,
    position: [0, 0.6, -6.5],
    icon: "🗺️", label: "Fragment de carte",
    content: "La ville étape : Le Caire — القاهرة",
    hint: "Sol central, près du manuscrit",
  },

  // ── Cadenas 1 — La Direction Sacrée (Qibla) ────────────────────────
  {
    id: "c1a", lockId: 1,
    position: [5, 0.8, -3],
    icon: "🧭", label: "Rose des vents",
    content: "Direction inscrite : Nord-Est ↗",
    hint: "Mur Est, moitié Sud",
  },
  {
    id: "c1b", lockId: 1,
    position: [4.5, 0.8, 3],
    icon: "🗺️", label: "Carte ancienne",
    content: "Notre position : Mali — à l'Ouest",
    hint: "Mur Est, moitié Nord",
  },
  {
    id: "c1c", lockId: 1,
    position: [6, 0.8, 0],
    icon: "✨", label: "Flèche de Qibla",
    content: "La Mecque est au Nord-Est de Tombouctou",
    hint: "Contre le mur Est, au centre",
  },

  // ── Cadenas 2 — L'Or de Tombouctou ─────────────────────────────────
  {
    id: "c2a", lockId: 2,
    position: [-5, 0.8, -3],
    icon: "✨", label: "Teinte de l'enluminure",
    content: "La couleur dominante : Or — ذهب",
    hint: "Mur Ouest, moitié Sud",
  },
  {
    id: "c2b", lockId: 2,
    position: [-4.5, 0.8, 3],
    icon: "⚖️", label: "Balance du marchand",
    content: "Tombouctou : carrefour de l'or saharien",
    hint: "Mur Ouest, moitié Nord",
  },
  {
    id: "c2c", lockId: 2,
    position: [-6, 0.8, 0],
    icon: "📖", label: "Note de bas de page",
    content: "'La cité d'or' — richesse venue du Sud",
    hint: "Contre le mur Ouest, au centre",
  },

  // ── Cadenas 3 — Les Fondateurs ──────────────────────────────────────
  {
    id: "c3a", lockId: 3,
    position: [3, 0.8, 7.5],
    icon: "🏕️", label: "Motif touareg",
    content: "Peuple fondateur : les Touaregs",
    hint: "Mur Nord, côté Est",
  },
  {
    id: "c3b", lockId: 3,
    position: [-3, 0.8, 7.5],
    icon: "📅", label: "Date gravée",
    content: "Fondation : vers l'an ١١٠٠ (1100)",
    hint: "Mur Nord, côté Ouest",
  },
  {
    id: "c3c", lockId: 3,
    position: [0, 0.6, 8.5],
    icon: "🐪", label: "Route caravanière",
    content: "Camp saisonnier sur les routes du Sahara",
    hint: "Centre Nord, près du mur du fond",
  },
];

export const CLUE_DISCOVER_RANGE = 1.3; // unités — rayon de découverte

// ── 4 puzzles ──────────────────────────────────────────────────────────
export const TOMBOUCTOU_LOCKS: TombouktouLock[] = [
  {
    id: 0,
    title: "Le Pèlerinage de Mansa Moussa",
    themeIcon: "📜",
    story:
      "Ce manuscrit bambara narre le pèlerinage légendaire de Mansa Moussa, roi du Mali, parti de Tombouctou en 1324 avec 60 000 hommes et tant d'or qu'il ébranla l'économie mondiale.",
    question:
      "En quelle ville Mansa Moussa ébahit-il le monde par sa générosité lors de son pèlerinage ?",
    options: ["Bagdad", "Le Caire", "Médine", "Alexandrie"],
    correctIndex: 1,
    explanation:
      "En traversant Le Caire, Mansa Moussa distribua tant d'or que le cours du métal chuta pendant 12 ans. Le monde entier entendit parler du Mali.",
  },
  {
    id: 1,
    title: "La Direction Sacrée",
    themeIcon: "📖",
    story:
      "Ce traité de jurisprudence calcule la Qibla — la direction vers La Mecque — pour les fidèles de Tombouctou. Les savants maliens maîtrisaient la trigonosphérique sphérique dès le XIVème siècle.",
    question:
      "Dans quelle direction doit-on s'orienter pour prier depuis Tombouctou ?",
    options: ["Sud-Est", "Nord-Ouest", "Nord-Est", "Plein Est"],
    correctIndex: 2,
    explanation:
      "La Mecque se trouve au Nord-Est de Tombouctou. Ces calculs complexes témoignent du niveau scientifique extraordinaire de la cité.",
  },
  {
    id: 2,
    title: "L'Or de Tombouctou",
    themeIcon: "✍️",
    story:
      "Cette enluminure sudanaise célèbre la richesse de Tombouctou, carrefour incontournable des caravanes qui traversaient le Sahara. La cité contrôlait le commerce le plus lucratif d'Afrique.",
    question:
      "Par quelle richesse Tombouctou était-elle surnommée 'la cité d'or' au XIVème siècle ?",
    options: ["Le sel", "L'or", "Les épices", "Le cuivre"],
    correctIndex: 1,
    explanation:
      "L'or venait des mines du Ghana et du Mali au Sud, transitait par Tombouctou, et rejoignait le Maghreb et l'Europe. La cité prélevait des taxes sur chaque caravane.",
  },
  {
    id: 3,
    title: "Les Fondateurs de Tombouctou",
    themeIcon: "🪣",
    story:
      "Ce tapis Songhaï raconte les origines de Tombouctou, née d'un simple campement nomade sur les rives du Niger. Qui sont ces fondateurs que l'histoire a presque oubliés ?",
    question:
      "Quel peuple nomade fonda Tombouctou comme campement saisonnier vers l'an 1100 ?",
    options: ["Les Mandingues", "Les Songhaïs", "Les Touaregs", "Les Peuls"],
    correctIndex: 2,
    explanation:
      "Les Touaregs fondèrent Tombouctou vers 1100 comme camp saisonnier. La ville devint ensuite un carrefour international sous les Mandingues, puis un empire culturel sous les Songhaïs.",
  },
];
