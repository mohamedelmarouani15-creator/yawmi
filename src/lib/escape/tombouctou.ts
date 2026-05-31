// Données de jeu — La Bibliothèque de Tombouctou

export type EnigmaType = "cadenas" | "astrolabe" | "cipher" | "carte" | "verset";

export interface ManuscriptData {
  id:          number;
  title:       string;
  titleAr:     string;
  position:    [number, number, number];
  hint:        string;
  teaching:    string;
  teachingAr?: string;
  enigmaType:  EnigmaType;
}

export const MANUSCRIPTS: ManuscriptData[] = [
  {
    id: 0,
    title:   "Le Cadenas du Savoir",
    titleAr: "قفل العلم",
    position: [-7.5, 4.3, -6.1],
    hint: "Je suis ce que les prophètes ont transmis, ce que les savants ont préservé, ce que les tyrans ont toujours craint.",
    teaching:
      "عِلْم — ilm — La Connaissance.\n\n" +
      "Le premier mot révélé au Prophète ﷺ était « Iqra » — Lis. L'islam a fait de la quête du savoir une obligation pour tout musulman. " +
      "À Tombouctou, on copiait des milliers de manuscrits pour que cette lumière ne s'éteigne jamais.",
    teachingAr: "عِلْم",
    enigmaType: "cadenas",
  },
  {
    id: 1,
    title:   "L'Astrolabe d'Al-Biruni",
    titleAr: "إسطرلاب البيروني",
    position: [0, 1.35, -1.2],
    hint:
      "Al-Biruni a mesuré la circonférence de la Terre au 11ème siècle avec une précision que l'Europe n'atteindra pas avant 400 ans. " +
      "Son étoile guide était celle du Berger. Oriente l'anneau vers elle.",
    teaching:
      "Al-Biruni (973–1048), savant de Khorasan, a prédit l'existence du continent américain 500 ans avant Christophe Colomb. " +
      "Il calculait les positions des étoiles pour aider les pèlerins à trouver la Qibla n'importe où dans le monde.",
    enigmaType: "astrolabe",
  },
  {
    id: 2,
    title:   "Le Chiffre d'Al-Kindi",
    titleAr: "شفرة الكندي",
    position: [8.2, 0.96, -3.5],
    hint:
      "Un message codé est inscrit sur la tablette :\n« OH VDYRLU HVW OXPLHUH »\n\n" +
      "Note du sage : chaque lettre a avancé de 3.",
    teaching:
      "Al-Kindi (801–873), philosophe de Bagdad, a inventé la cryptographie — l'art de coder et décoder les messages secrets. " +
      "Ses techniques, oubliées pendant des siècles, protègent encore aujourd'hui nos communications sur internet.",
    enigmaType: "cipher",
  },
  {
    id: 3,
    title:   "La Carte des Lumières",
    titleAr: "خريطة الأنوار",
    position: [9.3, 3.8, 2.5],
    hint:
      "6 grands savants. 6 villes. Chacun a illuminé un coin du monde islamique médiéval. " +
      "Relie chaque sage à la cité où il a brillé.",
    teaching:
      "Ces savants ont formé le réseau de connaissance le plus avancé du monde médiéval. " +
      "Pendant que l'Europe traversait le Moyen-Âge, l'islam vivait son Âge d'Or — en mathématiques, médecine, géographie et philosophie.",
    enigmaType: "carte",
  },
  {
    id: 4,
    title:   "Le Verset des Versets",
    titleAr: "آية الآيات",
    position: [0, 0, -3.8],
    hint:
      "هَلْ يَسْتَوِي الَّذِينَ _____ وَالَّذِينَ لَا _____\n\n" +
      "Sourate Az-Zumar 39:9 — Deux mots manquent. Trouve-les.",
    teaching:
      "« Sont-ils égaux, ceux qui savent et ceux qui ne savent pas ? »\n\n" +
      "(Coran 39:9)\n\n" +
      "Ce verset est la raison pour laquelle Tombouctou est devenue la capitale du savoir islamique au 14ème siècle. " +
      "À son apogée, elle abritait 180 écoles et 25 000 étudiants.",
    teachingAr: "يَعْلَمُونَ",
    enigmaType: "verset",
  },
];

// Paires pour la Carte des Lumières (M4)
export const SCHOLARS = [
  { id: "battuta",   name: "Ibn Battuta",       city: "Tanger",   flag: "🇲🇦" },
  { id: "averroes",  name: "Averroès",           city: "Cordoue",  flag: "🇪🇸" },
  { id: "khwarizmi", name: "Al-Khwarizmi",       city: "Bagdad",   flag: "🇮🇶" },
  { id: "khaldoun",  name: "Ibn Khaldoun",       city: "Tunis",    flag: "🇹🇳" },
  { id: "idrisi",    name: "Al-Idrisi",          city: "Palerme",  flag: "🇮🇹" },
  { id: "fihri",     name: "Fatima al-Fihri",    city: "Fès",      flag: "🇲🇦" },
];
