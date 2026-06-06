export type ArabeLevel = "debutant" | "intermediaire" | "avance";

export interface VocabItem {
  arabic: string;
  transliteration: string;
  french: string;
}

export interface Exercise {
  question: string;
  options: string[];
  correct: number; // index
  explanation: string;
}

export interface Lesson {
  id: string;
  level: ArabeLevel;
  order: number;
  title: string;
  titleAr: string;
  subtitle: string;
  explanation: string;
  vocab: VocabItem[];
  examples: { arabic: string; transliteration: string; french: string }[];
  exercise: Exercise;
}

export const LESSONS: Lesson[] = [
  // ── DÉBUTANT ──────────────────────────────────────────────────
  {
    id: "alphabet-1",
    level: "debutant",
    order: 1,
    title: "L'alphabet arabe — Les lettres solaires",
    titleAr: "الحروف الشمسية",
    subtitle: "Apprends les 14 premières lettres",
    explanation: "L'arabe s'écrit de droite à gauche. Il comporte 28 lettres. Les \"lettres solaires\" (حروف شمسية) sont celles qui absorbent le lam (ل) du mot défini (ال).\n\nExemple : الشمس (soleil) se lit 'ash-shams' et non 'al-shams'.",
    vocab: [
      { arabic: "أ", transliteration: "alif", french: "Première lettre, son 'a'" },
      { arabic: "ب", transliteration: "bā'", french: "Son 'b'" },
      { arabic: "ت", transliteration: "tā'", french: "Son 't'" },
      { arabic: "ث", transliteration: "thā'", french: "Son 'th' anglais" },
    ],
    examples: [
      { arabic: "بَيْت", transliteration: "bayt", french: "maison" },
      { arabic: "أَب", transliteration: "ab", french: "père" },
      { arabic: "باب", transliteration: "bāb", french: "porte" },
    ],
    exercise: {
      question: "Comment s'appelle la direction d'écriture de l'arabe ?",
      options: ["De gauche à droite", "De droite à gauche", "De haut en bas", "En cercle"],
      correct: 1,
      explanation: "L'arabe s'écrit et se lit de droite à gauche, contrairement au français.",
    },
  },
  {
    id: "alphabet-2",
    level: "debutant",
    order: 2,
    title: "L'alphabet arabe — Les lettres lunaires",
    titleAr: "الحروف القمرية",
    subtitle: "Les 14 autres lettres",
    explanation: "Les lettres lunaires (حروف قمرية) ne modifient pas le 'al' (ال). Le lam se prononce distinctement.\n\nExemple : القمر (la lune) se lit 'al-qamar' avec le 'l' bien prononcé.",
    vocab: [
      { arabic: "ق", transliteration: "qāf", french: "Son 'q' guttural" },
      { arabic: "م", transliteration: "mīm", french: "Son 'm'" },
      { arabic: "و", transliteration: "wāw", french: "Son 'w' ou voyelle 'ū'" },
      { arabic: "ي", transliteration: "yā'", french: "Son 'y' ou voyelle 'ī'" },
    ],
    examples: [
      { arabic: "القمر", transliteration: "al-qamar", french: "la lune" },
      { arabic: "الكتاب", transliteration: "al-kitāb", french: "le livre" },
      { arabic: "الماء", transliteration: "al-mā'", french: "l'eau" },
    ],
    exercise: {
      question: "Comment se lit القمر ?",
      options: ["aq-qamar", "al-qamar", "ash-qamar", "an-qamar"],
      correct: 1,
      explanation: "ق est une lettre lunaire, donc le 'al' se prononce entièrement : al-qamar.",
    },
  },
  {
    id: "harakat",
    level: "debutant",
    order: 3,
    title: "Les voyelles courtes (Harakāt)",
    titleAr: "الحركات",
    subtitle: "Fatha, Kasra, Damma",
    explanation: "Les harakāt sont de petits signes placés au-dessus ou en-dessous des lettres pour indiquer les voyelles courtes. Dans le Coran, elles sont toujours présentes pour faciliter la lecture.\n\n• Fatha (ـَ) = son 'a'\n• Kasra (ـِ) = son 'i'\n• Damma (ـُ) = son 'u'",
    vocab: [
      { arabic: "ـَ", transliteration: "fatha", french: "voyelle 'a' courte" },
      { arabic: "ـِ", transliteration: "kasra", french: "voyelle 'i' courte" },
      { arabic: "ـُ", transliteration: "damma", french: "voyelle 'u' courte" },
      { arabic: "ـْ", transliteration: "sukūn", french: "absence de voyelle" },
    ],
    examples: [
      { arabic: "كَتَبَ", transliteration: "kataba", french: "il a écrit" },
      { arabic: "كِتَاب", transliteration: "kitāb", french: "livre" },
      { arabic: "كُتُب", transliteration: "kutub", french: "livres" },
    ],
    exercise: {
      question: "Quelle harakāt produit le son 'u' ?",
      options: ["Fatha", "Kasra", "Damma", "Sukūn"],
      correct: 2,
      explanation: "La damma (ـُ), placée au-dessus de la lettre, produit le son 'u' court.",
    },
  },
  {
    id: "salutations",
    level: "debutant",
    order: 4,
    title: "Les salutations islamiques",
    titleAr: "التحيات الإسلامية",
    subtitle: "Apprends à saluer en arabe",
    explanation: "Les salutations islamiques sont au cœur de la vie quotidienne du musulman. Le Prophète ﷺ a dit : 'Répandez le salut entre vous.' (Muslim)\n\nLe salam est une invocation de paix — celui qui salue reçoit la même récompense que celui qui répond.",
    vocab: [
      { arabic: "السلام عليكم", transliteration: "as-salāmu ʿalaykum", french: "La paix soit sur vous" },
      { arabic: "وعليكم السلام", transliteration: "wa ʿalaykum as-salām", french: "Et sur vous la paix (réponse)" },
      { arabic: "أهلاً وسهلاً", transliteration: "ahlan wa sahlan", french: "Bienvenue" },
      { arabic: "كيف حالك؟", transliteration: "kayfa ḥāluk?", french: "Comment vas-tu ?" },
    ],
    examples: [
      { arabic: "السلام عليكم ورحمة الله وبركاته", transliteration: "as-salāmu ʿalaykum wa raḥmatullāhi wa barakātuh", french: "La paix, la miséricorde et les bénédictions d'Allah soient sur vous" },
      { arabic: "بارك الله فيك", transliteration: "bārakAllāhu fīk", french: "Qu'Allah te bénisse" },
    ],
    exercise: {
      question: "Quelle est la réponse correcte à 'السلام عليكم' ?",
      options: ["أهلاً وسهلاً", "وعليكم السلام", "كيف حالك", "بارك الله فيك"],
      correct: 1,
      explanation: "'وعليكم السلام' est la réponse standard. On peut y ajouter 'ورحمة الله وبركاته' pour la version complète.",
    },
  },
  {
    id: "chiffres",
    level: "debutant",
    order: 5,
    title: "Les chiffres arabes",
    titleAr: "الأرقام العربية",
    subtitle: "De 1 à 10",
    explanation: "Les chiffres que nous utilisons aujourd'hui (0, 1, 2…) viennent des mathématiciens arabes ! En arabe, les chiffres s'écrivent différemment mais sont reconnaissables.\n\nCurieusement, les chiffres arabes s'écrivent de gauche à droite (contrairement au texte).",
    vocab: [
      { arabic: "١ — وَاحِد", transliteration: "wāḥid", french: "1 — un" },
      { arabic: "٢ — اِثْنَان", transliteration: "ithnān", french: "2 — deux" },
      { arabic: "٣ — ثَلَاثَة", transliteration: "thalātha", french: "3 — trois" },
      { arabic: "١٠ — عَشَرَة", transliteration: "ʿashara", french: "10 — dix" },
    ],
    examples: [
      { arabic: "٥ صلوات", transliteration: "khams ṣalawāt", french: "5 prières" },
      { arabic: "٣٠ يوم", transliteration: "thalāthūn yawm", french: "30 jours (Ramadan)" },
      { arabic: "٧ آيات", transliteration: "sabʿ āyāt", french: "7 versets (Al-Fatiha)" },
    ],
    exercise: {
      question: "Comment dit-on '5' en arabe ?",
      options: ["أربعة", "خمسة", "ستة", "سبعة"],
      correct: 1,
      explanation: "خمسة (khamsa) = cinq. Retiens-le : les 5 piliers de l'islam s'appellent les 'Arkān al-khamsa'.",
    },
  },
  {
    id: "pronoms",
    level: "debutant",
    order: 6,
    title: "Les pronoms personnels",
    titleAr: "الضمائر الشخصية",
    subtitle: "Je, tu, il, elle…",
    explanation: "En arabe, les pronoms varient selon le genre (masculin/féminin) et le nombre (singulier/duel/pluriel). Le duel est une forme unique pour désigner exactement deux personnes ou choses — n'existe pas en français !",
    vocab: [
      { arabic: "أَنَا", transliteration: "anā", french: "je (masc./fém.)" },
      { arabic: "أَنْتَ", transliteration: "anta", french: "tu (masculin)" },
      { arabic: "أَنْتِ", transliteration: "anti", french: "tu (féminin)" },
      { arabic: "هُوَ / هِيَ", transliteration: "huwa / hiya", french: "il / elle" },
    ],
    examples: [
      { arabic: "أنا مسلم", transliteration: "anā muslim", french: "Je suis musulman" },
      { arabic: "أنتَ طالب", transliteration: "anta ṭālib", french: "Tu es un étudiant (masc.)" },
      { arabic: "هي معلمة", transliteration: "hiya muʿallima", french: "Elle est professeure" },
    ],
    exercise: {
      question: "Comment dit-on 'tu' au féminin en arabe ?",
      options: ["أنت", "أنتِ", "أنا", "هي"],
      correct: 1,
      explanation: "أنتِ (anti) est le pronom 'tu' féminin. La kasra (ـِ) sous le ت distingue le féminin du masculin أنتَ (anta).",
    },
  },
  {
    id: "vocabulaire-islamique",
    level: "debutant",
    order: 7,
    title: "Vocabulaire islamique essentiel",
    titleAr: "المفردات الإسلامية الأساسية",
    subtitle: "Les mots du quotidien musulman",
    explanation: "Ces mots font partie du quotidien de tout musulman francophone. Les comprendre en arabe renforce la connexion spirituelle avec leur sens profond.",
    vocab: [
      { arabic: "الله", transliteration: "Allāh", french: "Dieu (nom propre)" },
      { arabic: "الإسلام", transliteration: "al-Islām", french: "la soumission / l'islam" },
      { arabic: "الإيمان", transliteration: "al-Īmān", french: "la foi" },
      { arabic: "الصلاة", transliteration: "aṣ-Ṣalāh", french: "la prière" },
    ],
    examples: [
      { arabic: "بسم الله الرحمن الرحيم", transliteration: "bismillāh ir-raḥmān ir-raḥīm", french: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux" },
      { arabic: "الحمد لله", transliteration: "al-ḥamdu lillāh", french: "Louange à Allah" },
      { arabic: "إن شاء الله", transliteration: "in shā' Allāh", french: "Si Allah le veut" },
    ],
    exercise: {
      question: "Quelle est la traduction correcte de 'الإيمان' ?",
      options: ["La prière", "Le jeûne", "La foi", "La mosquée"],
      correct: 2,
      explanation: "الإيمان (al-Īmān) signifie 'la foi'. Sa racine أمن (amana) signifie être en sécurité, faire confiance — d'où aussi 'Amine' (آمين).",
    },
  },
  {
    id: "alquran-fatiha",
    level: "debutant",
    order: 8,
    title: "Comprendre Al-Fātiḥa",
    titleAr: "فهم سورة الفاتحة",
    subtitle: "La mère du Livre, mot par mot",
    explanation: "Al-Fātiḥa est récitée 17 fois par jour dans les prières obligatoires. Comprendre chaque mot transforme la prière en dialogue conscient avec Allah.\n\nSon nom vient de فتح (fataḥa) = ouvrir — elle ouvre le Coran et chaque prière.",
    vocab: [
      { arabic: "الحَمْد", transliteration: "al-ḥamd", french: "la louange (totale)" },
      { arabic: "الرَّحِيم", transliteration: "ar-Raḥīm", french: "le Très Miséricordieux (envers les croyants)" },
      { arabic: "مَالِك", transliteration: "mālik", french: "Maître, Roi" },
      { arabic: "نَسْتَعِين", transliteration: "nastaʿīn", french: "nous demandons de l'aide" },
    ],
    examples: [
      { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", transliteration: "bismillāh ir-raḥmān ir-raḥīm", french: "Au nom d'Allah le Tout Miséricordieux, le Très Miséricordieux" },
      { arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", transliteration: "iyyāka naʿbudu wa iyyāka nastaʿīn", french: "C'est Toi seul que nous adorons et c'est Toi seul dont nous implorons l'aide" },
    ],
    exercise: {
      question: "Combien de fois Al-Fatiha est-elle récitée dans les prières obligatoires ?",
      options: ["5 fois", "10 fois", "17 fois", "34 fois"],
      correct: 2,
      explanation: "Al-Fatiha est récitée dans chaque rakʿa : Fajr (2) + Dhuhr (4) + ʿAsr (4) + Maghrib (3) + ʿIshā' (4) = 17 fois.",
    },
  },

  // ── INTERMÉDIAIRE ─────────────────────────────────────────────
  {
    id: "article-genre",
    level: "intermediaire",
    order: 9,
    title: "Genre et article défini",
    titleAr: "الجنس والتعريف",
    subtitle: "Masculin, féminin et le 'al'",
    explanation: "En arabe, tous les noms ont un genre (masculin ou féminin). Le féminin se forme généralement en ajoutant un tā' marbūṭa (ة) à la fin.\n\nL'article défini (ال) s'adapte selon que la lettre suivante est solaire ou lunaire.",
    vocab: [
      { arabic: "مُعَلِّم / مُعَلِّمَة", transliteration: "muʿallim / muʿallima", french: "professeur masc./fém." },
      { arabic: "طَالِب / طَالِبَة", transliteration: "ṭālib / ṭāliba", french: "étudiant masc./fém." },
      { arabic: "كَبِير / كَبِيرَة", transliteration: "kabīr / kabīra", french: "grand masc./fém." },
      { arabic: "ة", transliteration: "tā' marbūṭa", french: "marque du féminin" },
    ],
    examples: [
      { arabic: "الكتاب كبير", transliteration: "al-kitābu kabīr", french: "Le livre est grand" },
      { arabic: "المدرسة جميلة", transliteration: "al-madrasa jamīla", french: "L'école est belle" },
    ],
    exercise: {
      question: "Comment forme-t-on généralement le féminin en arabe ?",
      options: ["En ajoutant 'ūn'", "En ajoutant tā' marbūṭa (ة)", "En changeant les voyelles", "En ajoutant 'āt'"],
      correct: 1,
      explanation: "Le tā' marbūṭa (ة) est la marque la plus courante du féminin. Ex: طالب → طالبة.",
    },
  },
  {
    id: "verbe-passe",
    level: "intermediaire",
    order: 10,
    title: "Le verbe au passé",
    titleAr: "الفعل الماضي",
    subtitle: "La conjugaison au passé simple",
    explanation: "Le verbe arabe au passé (الفعل الماضي) est la forme de base du dictionnaire. Il est généralement construit sur 3 radicaux (racine trilittère).\n\nLa conjugaison se fait en ajoutant des suffixes selon la personne et le genre.",
    vocab: [
      { arabic: "كَتَبَ", transliteration: "kataba", french: "il a écrit" },
      { arabic: "كَتَبَتْ", transliteration: "katabat", french: "elle a écrit" },
      { arabic: "كَتَبْتُ", transliteration: "katabtu", french: "j'ai écrit" },
      { arabic: "كَتَبْنَا", transliteration: "katabnā", french: "nous avons écrit" },
    ],
    examples: [
      { arabic: "قَرَأَ الطالبُ الكتابَ", transliteration: "qaraʾa aṭ-ṭālibu al-kitāba", french: "L'étudiant a lu le livre" },
      { arabic: "صَلَّيْتُ الفَجْر", transliteration: "ṣallaytū al-fajr", french: "J'ai prié le Fajr" },
    ],
    exercise: {
      question: "Quelle est la forme 'j'ai fait' du verbe فَعَلَ (faʿala) ?",
      options: ["فَعَلَتْ", "فَعَلْنَا", "فَعَلْتُ", "فَعَلُوا"],
      correct: 2,
      explanation: "Le suffixe ـتُ (-tu) correspond à la 1ère personne du singulier au passé : فَعَلْتُ = j'ai fait.",
    },
  },
  {
    id: "verbe-present",
    level: "intermediaire",
    order: 11,
    title: "Le verbe au présent-futur",
    titleAr: "الفعل المضارع",
    subtitle: "L'action en cours ou à venir",
    explanation: "Le présent-futur (المضارع) en arabe exprime une action en cours ou une action future selon le contexte. Il se forme en ajoutant des préfixes et parfois des suffixes à la racine.\n\nLe contexte ou des particules comme 'سوف' (sawfa) ou 'سـ' précisent si c'est présent ou futur.",
    vocab: [
      { arabic: "يَكْتُبُ", transliteration: "yaktubu", french: "il écrit / il écrira" },
      { arabic: "تَكْتُبُ", transliteration: "taktubu", french: "tu écris (masc.) / elle écrit" },
      { arabic: "أَكْتُبُ", transliteration: "aktubu", french: "j'écris / j'écrirai" },
      { arabic: "نَكْتُبُ", transliteration: "naktubu", french: "nous écrivons" },
    ],
    examples: [
      { arabic: "أُصَلِّي كُلَّ يَوْم", transliteration: "uṣallī kulla yawm", french: "Je prie chaque jour" },
      { arabic: "سَوْفَ أَقْرَأُ القُرْآن", transliteration: "sawfa aqraʾu al-Qurʾān", french: "Je lirai le Coran (futur)" },
    ],
    exercise: {
      question: "Quel préfixe indique 'il' au présent en arabe ?",
      options: ["أ (a)", "ن (n)", "ي (y)", "ت (t)"],
      correct: 2,
      explanation: "Le préfixe يـ (y-) indique la 3ème personne du masculin singulier : يَكْتُبُ = il écrit.",
    },
  },
  {
    id: "negation",
    level: "intermediaire",
    order: 12,
    title: "La négation",
    titleAr: "النفي",
    subtitle: "لا، لم، ليس",
    explanation: "L'arabe utilise différentes particules de négation selon le temps du verbe :\n\n• لَا (lā) + présent = présent négatif ou interdiction\n• لَمْ (lam) + présent apocopé = passé négatif\n• لَيْسَ (laysa) = verbe 'ne pas être' au présent",
    vocab: [
      { arabic: "لَا إِلَٰهَ إِلَّا اللَّه", transliteration: "lā ilāha illā Allāh", french: "Il n'y a de dieu qu'Allah" },
      { arabic: "لَمْ أَفْهَم", transliteration: "lam afham", french: "Je n'ai pas compris" },
      { arabic: "لَيْسَ هُنَا", transliteration: "laysa hunā", french: "Il n'est pas ici" },
      { arabic: "لَا تَيْأَس", transliteration: "lā tay'as", french: "Ne désespère pas" },
    ],
    examples: [
      { arabic: "لَا أَعْرِف", transliteration: "lā aʿrif", french: "Je ne sais pas" },
      { arabic: "لَمْ يَأْتِ", transliteration: "lam yaʾti", french: "Il n'est pas venu" },
    ],
    exercise: {
      question: "Quelle particule utilise-t-on pour nier au passé ?",
      options: ["لا (lā)", "لم (lam)", "ليس (laysa)", "ما (mā)"],
      correct: 1,
      explanation: "لَمْ (lam) + verbe au présent apocopé = passé négatif. Ex: لَمْ يَكْتُبْ = il n'a pas écrit.",
    },
  },
  {
    id: "noms-pluriels",
    level: "intermediaire",
    order: 13,
    title: "Les pluriels brisés",
    titleAr: "جموع التكسير",
    subtitle: "Les pluriels irréguliers de l'arabe",
    explanation: "L'arabe possède deux types de pluriels :\n\n1. Pluriel sain (جمع سالم) : ajout de suffixes\n2. Pluriel brisé (جمع التكسير) : modification interne de la racine\n\nLes pluriels brisés doivent souvent être mémorisés — comme les pluriels irréguliers en français (œil → yeux).",
    vocab: [
      { arabic: "كِتَاب / كُتُب", transliteration: "kitāb / kutub", french: "livre / livres" },
      { arabic: "بَيْت / بُيُوت", transliteration: "bayt / buyūt", french: "maison / maisons" },
      { arabic: "رَجُل / رِجَال", transliteration: "rajul / rijāl", french: "homme / hommes" },
      { arabic: "عَالِم / عُلَمَاء", transliteration: "ʿālim / ʿulamā'", french: "savant / savants" },
    ],
    examples: [
      { arabic: "العُلَمَاء وَرَثَةُ الأَنْبِيَاء", transliteration: "al-ʿulamā' warathat al-anbiyā'", french: "Les savants sont les héritiers des prophètes" },
    ],
    exercise: {
      question: "Quel est le pluriel brisé de كِتَاب (livre) ?",
      options: ["كِتَابات", "كُتُب", "كِتَابون", "كِتَابَان"],
      correct: 1,
      explanation: "كُتُب est le pluriel brisé de كِتَاب. La structure interne change : CiCāC → CuCuC.",
    },
  },
  {
    id: "cas-grammaticaux",
    level: "intermediaire",
    order: 14,
    title: "Les cas grammaticaux",
    titleAr: "الإعراب",
    subtitle: "Nominatif, accusatif, génitif",
    explanation: "L'arabe classique possède 3 cas marqués par des voyelles finales :\n\n• Nominatif (المرفوع) : sujet → -u\n• Accusatif (المنصوب) : objet direct → -a\n• Génitif (المجرور) : après préposition → -i\n\nCes distinctions permettent de comprendre le sens d'une phrase même si l'ordre des mots change.",
    vocab: [
      { arabic: "الكِتَابُ", transliteration: "al-kitābu", french: "le livre (sujet)" },
      { arabic: "الكِتَابَ", transliteration: "al-kitāba", french: "le livre (objet)" },
      { arabic: "الكِتَابِ", transliteration: "al-kitābi", french: "du livre (génitif)" },
      { arabic: "فِي البَيْتِ", transliteration: "fī al-bayti", french: "dans la maison" },
    ],
    examples: [
      { arabic: "قَرَأَ الطَّالِبُ الكِتَابَ", transliteration: "qaraʾa aṭ-ṭālibu al-kitāba", french: "L'étudiant a lu le livre" },
      { arabic: "فِي المَسْجِدِ", transliteration: "fī al-masjidi", french: "dans la mosquée" },
    ],
    exercise: {
      question: "Quelle terminaison indique le sujet (nominatif) ?",
      options: ["-a (fatha)", "-i (kasra)", "-u (damma)", "-un (tanwīn)"],
      correct: 2,
      explanation: "Le nominatif se marque par la damma (-u) en arabe classique. C'est le cas du sujet de la phrase.",
    },
  },
  {
    id: "phrase-nominale",
    level: "intermediaire",
    order: 15,
    title: "La phrase nominale",
    titleAr: "الجملة الاسمية",
    subtitle: "Sujet + attribut sans verbe 'être'",
    explanation: "L'arabe n'utilise pas le verbe 'être' au présent ! Une phrase nominale (جملة اسمية) se compose simplement d'un sujet (مبتدأ) et d'un attribut (خبر).\n\nEx: 'Allah est Grand' → الله أكبر (Allāhu akbar) — pas de 'est'.",
    vocab: [
      { arabic: "الله أكبر", transliteration: "Allāhu akbar", french: "Allah est le Plus Grand" },
      { arabic: "الحق واضح", transliteration: "al-ḥaqqu wāḍiḥ", french: "La vérité est claire" },
      { arabic: "البيت كبير", transliteration: "al-baytu kabīr", french: "La maison est grande" },
      { arabic: "أنا مسلم", transliteration: "anā muslim", french: "Je suis musulman" },
    ],
    examples: [
      { arabic: "الإسلامُ دِينُ السَّلام", transliteration: "al-Islāmu dīnu as-salām", french: "L'Islam est la religion de la paix" },
      { arabic: "القرآنُ كَلَامُ اللَّه", transliteration: "al-Qurʾānu kalāmu Allāh", french: "Le Coran est la parole d'Allah" },
    ],
    exercise: {
      question: "Comment dit-on 'La mosquée est belle' en arabe (sans verbe être) ?",
      options: ["المسجد يكون جميل", "المسجدُ جَمِيل", "المسجد كان جميل", "المسجد سيكون جميل"],
      correct: 1,
      explanation: "المسجدُ جَمِيل — sujet (مبتدأ) + attribut (خبر), sans verbe. C'est la structure de base de la phrase nominale au présent.",
    },
  },
  {
    id: "prepositions",
    level: "intermediaire",
    order: 16,
    title: "Les prépositions",
    titleAr: "حروف الجر",
    subtitle: "في، على، من، إلى، عن",
    explanation: "Les prépositions (حروف الجر) sont des lettres ou mots qui placent un nom au génitif. Elles sont fondamentales pour comprendre le Coran et la Sunna.\n\nBeaucoup de noms divins et de formules islamiques utilisent ces prépositions.",
    vocab: [
      { arabic: "فِي", transliteration: "fī", french: "dans, en" },
      { arabic: "عَلَى", transliteration: "ʿalā", french: "sur, selon" },
      { arabic: "مِن", transliteration: "min", french: "de, depuis, parmi" },
      { arabic: "إِلَى", transliteration: "ilā", french: "vers, à, jusqu'à" },
    ],
    examples: [
      { arabic: "فِي سَبِيلِ اللَّه", transliteration: "fī sabīli Allāh", french: "dans le chemin d'Allah" },
      { arabic: "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ", transliteration: "ṣallā Allāhu ʿalayhi wa sallam", french: "qu'Allah prie sur lui et le salue" },
    ],
    exercise: {
      question: "Que signifie 'إلى' ?",
      options: ["dans", "sur", "vers / à", "de"],
      correct: 2,
      explanation: "إِلَى (ilā) signifie 'vers, à, jusqu'à'. Ex: الدعوة إلى الله = l'appel vers Allah.",
    },
  },

  // ── AVANCÉ ────────────────────────────────────────────────────
  {
    id: "racines-trilitteres",
    level: "avance",
    order: 17,
    title: "Le système des racines trilittères",
    titleAr: "نظام الجذور الثلاثية",
    subtitle: "La clé de tout le vocabulaire arabe",
    explanation: "Le secret de l'arabe : presque tous les mots dérivent d'une racine de 3 consonnes (الجذر الثلاثي). Comprendre les racines permet de déduire le sens de mots inconnus.\n\nExemple : la racine ك-ت-ب (k-t-b) = l'idée d'écriture.",
    vocab: [
      { arabic: "ك-ت-ب → كَتَبَ / كِتَاب / كَاتِب / مَكْتَبَة", transliteration: "k-t-b", french: "écrire / livre / écrivain / bibliothèque" },
      { arabic: "ع-ل-م → عَلِمَ / عِلْم / عَالِم / مَعْلُومَات", transliteration: "ʿ-l-m", french: "savoir / science / savant / informations" },
      { arabic: "س-ل-م → سَلِمَ / إِسْلَام / مُسْلِم / سَلَام", transliteration: "s-l-m", french: "être sain / islam / musulman / paix" },
    ],
    examples: [
      { arabic: "من الجذر ح-م-د : حَمِدَ، حَمْد، مُحَمَّد، أَحْمَد", transliteration: "ḥ-m-d", french: "louer → louer (verbe), louange, Muhammad, Ahmad" },
    ],
    exercise: {
      question: "De quelle racine vient le mot 'مُسْلِم' ?",
      options: ["م-ل-ك", "س-ل-م", "ص-ل-و", "ك-ر-م"],
      correct: 1,
      explanation: "مُسْلِم vient de la racine س-ل-م (s-l-m) qui porte l'idée de paix, sûreté, soumission. D'où : Islam, salam, muslim.",
    },
  },
  {
    id: "arabe-coranique-1",
    level: "avance",
    order: 18,
    title: "L'arabe coranique — Les attributs d'Allah",
    titleAr: "أسماء الله الحسنى",
    subtitle: "Les 99 noms — analyse grammaticale",
    explanation: "Les 99 noms d'Allah (الأسماء الحسنى) sont une porte d'entrée dans l'arabe coranique. Chaque nom contient une racine et une structure grammaticale qui révèle une nuance de sens.\n\nLa forme فَعَّال (faʿʿāl) indique une intensité extrême.",
    vocab: [
      { arabic: "الرَّحْمَٰن", transliteration: "ar-Raḥmān", french: "Le Tout Miséricordieux (intensité absolue)" },
      { arabic: "الرَّحِيم", transliteration: "ar-Raḥīm", french: "Le Très Miséricordieux (permanent)" },
      { arabic: "الْعَلِيم", transliteration: "al-ʿAlīm", french: "L'Omniscient" },
      { arabic: "الْحَكِيم", transliteration: "al-Ḥakīm", french: "Le Sage" },
    ],
    examples: [
      { arabic: "وَهُوَ الْغَفُورُ الرَّحِيمُ", transliteration: "wa huwa al-Ghafūru ar-Raḥīm", french: "Et Il est le Pardonneur, le Très Miséricordieux (Coran 2:173)" },
    ],
    exercise: {
      question: "Quelle forme grammaticale (wazan) indique une intensité dans les attributs divins ?",
      options: ["فَاعِل (fāʿil)", "فَعَّال (faʿʿāl)", "مَفْعُول (mafʿūl)", "فَعِيل (faʿīl)"],
      correct: 1,
      explanation: "فَعَّال (faʿʿāl) est le schème de l'intensité extrême. Ex: غَفَّار = le Très Pardonneur (encore plus intense que غافر).",
    },
  },
  {
    id: "arabe-coranique-2",
    level: "avance",
    order: 19,
    title: "Structure de la phrase coranique",
    titleAr: "بنية الجملة القرآنية",
    subtitle: "Analyse de versets courts",
    explanation: "Le Coran utilise une langue d'une précision extraordinaire. Analyser sa structure grammaticale révèle des sens cachés.\n\nExercice d'analyse : إِنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ\n'إن' renforce l'assertion, 'الله' est le sujet accusatif (après إن), 'على' est préposition, 'قدير' est l'attribut.",
    vocab: [
      { arabic: "إِنَّ", transliteration: "inna", french: "Certes, en vérité (particule d'accentuation)" },
      { arabic: "قَدِير", transliteration: "qadīr", french: "Puissant, Omnipotent" },
      { arabic: "وَ", transliteration: "wa", french: "et (conjonction)" },
      { arabic: "أَنَّ", transliteration: "anna", french: "que (subordonnant)" },
    ],
    examples: [
      { arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", transliteration: "innā aʿṭaynāka al-kawthar", french: "Certes, Nous t'avons accordé al-Kawthar" },
      { arabic: "وَمَا تَوْفِيقِي إِلَّا بِاللَّه", transliteration: "wa mā tawfīqī illā billāh", french: "Ma réussite ne vient que d'Allah" },
    ],
    exercise: {
      question: "Que fait la particule 'إنَّ' (inna) au nom qui la suit ?",
      options: ["Le met au nominatif", "Le met à l'accusatif", "Le met au génitif", "Le supprime"],
      correct: 1,
      explanation: "إنَّ et ses sœurs mettent le sujet (اسم إن) à l'accusatif. C'est pourquoi إن اللهَ et non اللهُ.",
    },
  },
  {
    id: "balagha",
    level: "avance",
    order: 20,
    title: "La rhétorique arabe (Balāgha)",
    titleAr: "البلاغة العربية",
    subtitle: "Métaphore, comparaison et emphase",
    explanation: "La balāgha (البلاغة) est la science de l'éloquence arabe. Elle révèle pourquoi le Coran est inimitable.\n\nTrois figures principales :\n• Tashbīh (تشبيه) : comparaison avec 'comme'\n• Istiʿāra (استعارة) : métaphore\n• Kinaya (كناية) : allusion",
    vocab: [
      { arabic: "كَأَنَّهُ", transliteration: "kaʾannahu", french: "comme si (comparaison)" },
      { arabic: "مِثْل", transliteration: "mithl", french: "semblable à" },
      { arabic: "يَدُ اللَّه", transliteration: "yadu Allāh", french: "La main d'Allah (métaphore de la puissance)" },
      { arabic: "نُور", transliteration: "nūr", french: "lumière (souvent métaphore de guidance)" },
    ],
    examples: [
      { arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْض", transliteration: "Allāhu nūru as-samāwāti wa al-arḍ", french: "Allah est la lumière des cieux et de la terre (Coran 24:35)" },
    ],
    exercise: {
      question: "Qu'est-ce que le 'tashbīh' en balāgha ?",
      options: ["Une métaphore directe", "Une comparaison avec 'comme'", "Une allusion indirecte", "Une répétition emphase"],
      correct: 1,
      explanation: "Le tashbīh (تشبيه) est la comparaison explicite avec un outil comparatif (كَ, مِثْل, كَأَنَّ). Distincte de l'istiʿāra (métaphore) qui supprime l'outil de comparaison.",
    },
  },
  {
    id: "lecture-coran",
    level: "avance",
    order: 21,
    title: "Tajwīd — règles de lecture coranique",
    titleAr: "أحكام التجويد",
    subtitle: "Idghām, Ikhfā' et Qalqala",
    explanation: "Le tajwīd (التجويد) est l'ensemble des règles de récitation du Coran. Son apprentissage est une obligation lors de la récitation.\n\nTrois règles essentielles :\n• Idghām (إدغام) : fusion de lettres similaires\n• Ikhfāʾ (إخفاء) : prononciation nasalisée\n• Qalqala (قلقلة) : vibration sur certaines lettres",
    vocab: [
      { arabic: "إِدْغَام", transliteration: "idghām", french: "assimilation/fusion de deux lettres identiques ou proches" },
      { arabic: "إِخْفَاء", transliteration: "ikhfāʾ", french: "prononciation nasale du nūn sākin avant 15 lettres" },
      { arabic: "قَلْقَلَة", transliteration: "qalqala", french: "vibration sur ق، ط، ب، ج، د quand elles sont sākina" },
      { arabic: "غُنَّة", transliteration: "ghunna", french: "nasalisation du mīm et nūn" },
    ],
    examples: [
      { arabic: "مِن رَّبِّهِم", transliteration: "min rabbihim → mirrabbihim", french: "Idghām : le nūn s'assimile au rā'" },
      { arabic: "مَن يَقُول", transliteration: "man yaqūl → ma(n)yaqūl", french: "Idghām avec ghunna" },
    ],
    exercise: {
      question: "Quelles sont les lettres de la qalqala ?",
      options: ["ب، ت، ث، ج، د", "ق، ط، ب، ج، د", "أ، ب، ج، د، ه", "ن، م، ل، ر، و"],
      correct: 1,
      explanation: "Les 5 lettres de la qalqala sont ق، ط، ب، ج، د — mémorisées par l'acronyme قُطْبُ جَد (quṭbu jad).",
    },
  },
  {
    id: "morphologie",
    level: "avance",
    order: 22,
    title: "Morphologie — Les schèmes verbaux",
    titleAr: "الأوزان الصرفية",
    subtitle: "Les 10 formes verbales de l'arabe",
    explanation: "L'arabe possède 10 formes verbales (أوزان) principales, chacune avec un sens modifié prévisible à partir du verbe de base (Forme I).\n\nFormes clés :\n• Forme II (فَعَّلَ) : causatif ou intensif\n• Forme III (فَاعَلَ) : action réciproque\n• Forme IV (أَفْعَلَ) : causatif\n• Forme V (تَفَعَّلَ) : réflexif de II",
    vocab: [
      { arabic: "عَلِمَ (I) → عَلَّمَ (II)", transliteration: "ʿalima → ʿallama", french: "savoir → enseigner (causatif)" },
      { arabic: "كَتَبَ (I) → تَكَاتَبَ (VI)", transliteration: "kataba → takātaba", french: "écrire → s'écrire l'un à l'autre" },
      { arabic: "سَلِمَ (I) → أَسْلَمَ (IV)", transliteration: "salima → aslama", french: "être sain → se soumettre (islam)" },
    ],
    examples: [
      { arabic: "عَلَّمَ اللَّهُ آدَمَ الأَسْمَاء", transliteration: "ʿallama Allāhu Ādama al-asmāʾ", french: "Allah enseigna à Adam les noms (Forme II causative)" },
    ],
    exercise: {
      question: "La Forme II (فَعَّلَ) d'un verbe exprime généralement :",
      options: ["Une action passive", "Un causatif ou une intensification", "Une action réciproque", "Un état résultant"],
      correct: 1,
      explanation: "La Forme II (fʿʿala) avec shadda sur la 2ème radicale exprime le causatif (faire faire) ou l'intensification. Ex: كَسَرَ (briser) → كَسَّرَ (briser complètement).",
    },
  },
  {
    id: "style-coranique",
    level: "avance",
    order: 23,
    title: "Style coranique — L'inimitabilité",
    titleAr: "الإعجاز القرآني",
    subtitle: "Pourquoi le Coran est unique",
    explanation: "L'iʿjāz (الإعجاز) désigne l'inimitabilité du Coran. Les savants identifient plusieurs dimensions :\n\n• Linguistique : vocabulaire, structure, musicalité sans équivalent\n• Informatif : connaissances historiques et scientifiques\n• Législatif : cohérence des lois révélées\n\nLe défi (taḥaddī) est lancé dans le Coran lui-même : 'Apportez une seule sourate comparable' (2:23).",
    vocab: [
      { arabic: "إِعْجَاز", transliteration: "iʿjāz", french: "inimitabilité, caractère miraculeux" },
      { arabic: "تَحَدِّي", transliteration: "taḥaddī", french: "défi lancé aux détracteurs" },
      { arabic: "فَصَاحَة", transliteration: "faṣāḥa", french: "éloquence, pureté de la langue" },
      { arabic: "بَلَاغَة", transliteration: "balāgha", french: "rhétorique, art de bien dire" },
    ],
    examples: [
      { arabic: "وَإِن كُنتُمْ فِي رَيْبٍ مِّمَّا نَزَّلْنَا عَلَىٰ عَبْدِنَا فَأْتُوا بِسُورَةٍ مِّن مِّثْلِهِ", transliteration: "", french: "Si vous avez un doute sur ce que Nous avons révélé à Notre Serviteur, apportez une seule sourate semblable (2:23)" },
    ],
    exercise: {
      question: "Qu'est-ce que le 'taḥaddī' coranique ?",
      options: ["Une prière spéciale", "Le défi de produire quelque chose de comparable au Coran", "Un type de récitation", "Une règle de tajwid"],
      correct: 1,
      explanation: "Le taḥaddī est le défi lancé dans le Coran aux humains et djinns de produire une sourate comparable. Il reste sans réponse depuis 14 siècles.",
    },
  },
  {
    id: "hadith-arabe",
    level: "avance",
    order: 24,
    title: "Comprendre les Hadiths en arabe",
    titleAr: "فهم الحديث النبوي",
    subtitle: "Analyse de hadiths célèbres",
    explanation: "Les hadiths prophétiques sont en arabe d'une grande clarté et concision. Le Prophète ﷺ était doté de 'jawāmiʿ al-kalim' (جوامع الكلم) : la capacité d'exprimer des significations profondes en peu de mots.",
    vocab: [
      { arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّات", transliteration: "innamā al-aʿmālu binniyyāt", french: "Les actes ne valent que par les intentions" },
      { arabic: "الدِّين النَّصِيحَة", transliteration: "ad-dīnu an-naṣīḥa", french: "La religion c'est le conseil sincère" },
      { arabic: "مَن صَمَتَ نَجَا", transliteration: "man ṣamata najā", french: "Celui qui se tait est sauvé" },
    ],
    examples: [
      { arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّات، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى", transliteration: "", french: "Les actes ne valent que par les intentions, et chacun n'obtient que ce qu'il a eu l'intention de faire" },
    ],
    exercise: {
      question: "Que signifie 'jawāmiʿ al-kalim' (جوامع الكلم) ?",
      options: ["Les hadiths longs", "La capacité d'exprimer beaucoup en peu de mots", "Les hadiths authentiques", "La science du hadith"],
      correct: 1,
      explanation: "جوامع الكلم signifie littéralement 'les rassembleurs de paroles'. C'est le don du Prophète ﷺ d'exprimer des concepts profonds en formules brèves et mémorables.",
    },
  },
];

export function getLessonsByLevel(level: ArabeLevel): Lesson[] {
  return LESSONS.filter(l => l.level === level).sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find(l => l.id === id);
}

export const LEVEL_META: Record<ArabeLevel, { label: string; labelAr: string; color: string; icon: string; minArabicLevel: string }> = {
  debutant:      { label: "Débutant",      labelAr: "مبتدئ",    color: "#34d399", icon: "🌱", minArabicLevel: "none" },
  intermediaire: { label: "Intermédiaire", labelAr: "متوسط",    color: "#D4AF37", icon: "📖", minArabicLevel: "beginner" },
  avance:        { label: "Avancé",        labelAr: "متقدم",    color: "#a78bfa", icon: "⭐", minArabicLevel: "intermediate" },
};
