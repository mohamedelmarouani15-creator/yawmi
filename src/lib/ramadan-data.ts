export interface RamadanDefi {
  day:      number;
  title:    string;
  detail:   string;
  category: "coran" | "dhikr" | "acte" | "connaissance" | "famille";
  arabic?:  string;
}

export const RAMADAN_DEFIS: RamadanDefi[] = [
  { day: 1,  title: "Commence avec Bismillah",    detail: "Commence chaque action de la journée par Bismillah", category: "dhikr", arabic: "بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ" },
  { day: 2,  title: "Lis 10 versets du Coran",    detail: "Ouvre le Coran et lis au moins 10 versets avec leur sens", category: "coran" },
  { day: 3,  title: "100 Subhanallah",             detail: "Répète Subhanallah 100 fois dans la journée", category: "dhikr", arabic: "سُبْحَانَ اللهِ" },
  { day: 4,  title: "Appelle un proche",           detail: "Prends des nouvelles d'un membre de ta famille ou d'un ami", category: "famille" },
  { day: 5,  title: "Sourate Al-Fatiha",           detail: "Mémorise ou relis la signification complète de la Fatiha", category: "coran", arabic: "سُورَةُ الْفَاتِحَة" },
  { day: 6,  title: "100 Astaghfirullah",          detail: "Demande le pardon d'Allah 100 fois aujourd'hui", category: "dhikr", arabic: "أَسْتَغْفِرُ اللهَ" },
  { day: 7,  title: "Donne en sadaqa",             detail: "Fais un don, même petit — une datte, un verre d'eau, un sourire", category: "acte" },
  { day: 8,  title: "Lis un récit prophétique",    detail: "Lis ou écoute un épisode de la vie du Prophète (paix sur lui)", category: "connaissance" },
  { day: 9,  title: "Azkar du matin complets",     detail: "Complète tous les azkar du matin après Fajr sans hâte", category: "dhikr" },
  { day: 10, title: "Jeûne avec intention",        detail: "Renouvelle ton intention du jeûne le matin en conscience", category: "acte", arabic: "نَوَيْتُ صَوْمَ غَدٍ" },
  { day: 11, title: "Sourate Al-Ikhlas x10",       detail: "Lis la sourate Al-Ikhlas 10 fois — équivaut à un tiers du Coran", category: "coran", arabic: "قُلْ هُوَ اللهُ أَحَدٌ" },
  { day: 12, title: "Prépare l'iftar pour quelqu'un", detail: "Prépare ou offre l'iftar à une personne autour de toi", category: "famille" },
  { day: 13, title: "100 Alhamdulillah",           detail: "Répète Alhamdulillah 100 fois — rappelle-toi les bienfaits d'Allah", category: "dhikr", arabic: "الْحَمْدُ لِلّهِ" },
  { day: 14, title: "Apprends un nouveau mot arabe", detail: "Apprends le sens d'un mot arabe coranique que tu ne connaissais pas", category: "connaissance" },
  { day: 15, title: "Mi-Ramadan : fais le bilan",  detail: "Prends 5 minutes pour réfléchir à ce que tu as accompli ces 15 jours", category: "acte" },
  { day: 16, title: "Lis la Sourate Al-Kahf",      detail: "Lis la Sourate Al-Kahf en entier ou par parties, avec ses bénédictions", category: "coran", arabic: "سُورَةُ الْكَهْف" },
  { day: 17, title: "100 La ilaha illallah",       detail: "Répète 100 fois la shahada — l'attestation qui efface les péchés", category: "dhikr", arabic: "لَا إِلَهَ إِلَّا اللهُ" },
  { day: 18, title: "Nourris un animal",           detail: "Donne à manger à un animal — un chat, un oiseau, n'importe lequel", category: "acte" },
  { day: 19, title: "Écoute le Coran 20 minutes",  detail: "Écoute une récitation du Coran pendant 20 minutes en silence", category: "coran" },
  { day: 20, title: "Azkar du soir complets",      detail: "Complète tous les azkar du soir après Asr sans les sauter", category: "dhikr" },
  { day: 21, title: "Salat al-Duha",              detail: "Prie 2 à 4 rak'at de Duha (Chaâ) avant la mi-journée", category: "acte", arabic: "صَلَاةُ الضُّحَى" },
  { day: 22, title: "Mémorise une dua",           detail: "Mémorise une nouvelle dua que tu réciteras lors des 10 derniers jours", category: "connaissance" },
  { day: 23, title: "Layla al-Qadr approche",     detail: "Augmente tes invocations cette nuit — Laylat al-Qadr est peut-être celle-ci", category: "acte", arabic: "لَيْلَةُ الْقَدْرِ" },
  { day: 24, title: "100 Salawat sur le Prophète", detail: "Envoie 100 salutations sur le Prophète Muhammad (paix sur lui)", category: "dhikr", arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ" },
  { day: 25, title: "Qiyam al-Layl",              detail: "Prie 2 rak'at la nuit après Isha — même courtes, c'est précieux", category: "acte", arabic: "قِيَامُ اللَّيْل" },
  { day: 26, title: "Lis les 5 dernières sourates", detail: "Lis les 5 dernières sourates du Coran avec leur signification", category: "coran" },
  { day: 27, title: "Dua pour tous les musulmans", detail: "Fais une dua sincère pour tous les musulmans dans le monde", category: "acte" },
  { day: 28, title: "Réconcilie-toi",              detail: "Si tu as une brouille avec quelqu'un, fais le premier pas ce soir", category: "famille" },
  { day: 29, title: "Dua de fin de Ramadan",       detail: "Récite la dua de fin de Ramadan et remercie Allah pour ce mois béni", category: "dhikr", arabic: "اللَّهُمَّ لَكَ صُمْتُ" },
  { day: 30, title: "Prépare l'Aïd",              detail: "Fais ta Zakat al-Fitr et prépare ton coeur pour l'Aïd al-Fitr", category: "acte", arabic: "زَكَاةُ الْفِطْر" },
];

export interface RamadanDua {
  id:              string;
  title:           string;
  arabic:          string;
  transliteration: string;
  translation:     string;
  occasion:        string;
}

export const RAMADAN_DUAS: RamadanDua[] = [
  {
    id: "iftar",
    title: "Dua de rupture du jeûne",
    arabic: "اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
    transliteration: "Allahumma laka sumtu wa 'ala rizqika aftartu",
    translation: "O Allah, pour Toi j'ai jeûné et avec Ton bienfait j'ai rompu le jeûne",
    occasion: "Au moment de l'iftar",
  },
  {
    id: "laylat-qadr",
    title: "Dua de Laylat al-Qadr",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    transliteration: "Allahumma innaka 'afuwwun karimun tuhibb al-'afwa fa'fu 'anni",
    translation: "O Allah, Tu es le Pardonnant, le Généreux, Tu aimes pardonner, alors pardonne-moi",
    occasion: "Les 10 dernières nuits",
  },
  {
    id: "suhoor",
    title: "Dua de l'intention du jeûne",
    arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرِيضَةِ شَهْرِ رَمَضَانَ",
    transliteration: "Nawaitu sawma ghadin 'an ada'i faridhati shahri Ramadan",
    translation: "J'ai l'intention de jeûner demain pour m'acquitter de l'obligation du mois de Ramadan",
    occasion: "Avant le Suhoor",
  },
  {
    id: "rahma",
    title: "Dua de la miséricorde",
    arabic: "رَبِّ اغْفِرْ وَارْحَمْ وَأَنتَ خَيْرُ الرَّاحِمِينَ",
    transliteration: "Rabbi ighfir warham wa anta khayru ar-rahimin",
    translation: "Seigneur, pardonne et aie pitié, Tu es le meilleur des miséricordieux",
    occasion: "Tout moment du Ramadan",
  },
  {
    id: "guidance",
    title: "Dua de la guidance",
    arabic: "اللَّهُمَّ اهْدِنَا فِيمَنْ هَدَيْتَ",
    transliteration: "Allahumma ihdina fiman hadayt",
    translation: "O Allah, guide-nous parmi ceux que Tu as guidés",
    occasion: "Witr — Qunoot",
  },
  {
    id: "tawba",
    title: "Dua du repentir",
    arabic: "أَسْتَغْفِرُ اللهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullaha alladhi la ilaha illa huwal-hayyal-qayyum wa atubu ilayh",
    translation: "Je demande pardon à Allah, il n'y a de dieu que Lui, le Vivant, le Subsistant, et je me repens vers Lui",
    occasion: "Chaque jour du Ramadan",
  },
  {
    id: "protection",
    title: "Dua de protection",
    arabic: "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
    transliteration: "Bismillahil-ladhi la yadurru ma'a ismihi shay'un fil-ardi wala fis-sama'",
    translation: "Au nom d'Allah avec Lequel rien ne peut nuire ni sur terre ni dans le ciel",
    occasion: "Matin et soir",
  },
  {
    id: "paradise",
    title: "Dua pour le Paradis",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّار",
    transliteration: "Allahumma inni as'aluka al-jannata wa a'udhu bika minan-nar",
    translation: "O Allah, je Te demande le Paradis et je me réfugie en Toi contre l'Enfer",
    occasion: "Après chaque prière",
  },
  {
    id: "gratitude",
    title: "Dua de gratitude",
    arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    transliteration: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
    translation: "O Allah, aide-moi à Te mentionner, à T'être reconnaissant, et à T'adorer dignement",
    occasion: "Après chaque prière",
  },
  {
    id: "patience",
    title: "Dua de la patience",
    arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا",
    transliteration: "Rabbana afrigh 'alayna sabran wa thabbit aqdamana",
    translation: "Notre Seigneur, répands sur nous la patience et raffermis nos pas",
    occasion: "Moments difficiles",
  },
];

export const JUZZ_PLAN: { juzz: number; surahs: string }[] = [
  { juzz:  1, surahs: "Al-Fatiha + Al-Baqarah 1–141" },
  { juzz:  2, surahs: "Al-Baqarah 142–252" },
  { juzz:  3, surahs: "Al-Baqarah 253 – Al-Imran 92" },
  { juzz:  4, surahs: "Al-Imran 93 – An-Nisa 23" },
  { juzz:  5, surahs: "An-Nisa 24–147" },
  { juzz:  6, surahs: "An-Nisa 148 – Al-Ma'idah 81" },
  { juzz:  7, surahs: "Al-Ma'idah 82 – Al-An'am 110" },
  { juzz:  8, surahs: "Al-An'am 111 – Al-A'raf 87" },
  { juzz:  9, surahs: "Al-A'raf 88 – Al-Anfal 40" },
  { juzz: 10, surahs: "Al-Anfal 41 – At-Tawbah 92" },
  { juzz: 11, surahs: "At-Tawbah 93 – Houd 5" },
  { juzz: 12, surahs: "Houd 6 – Yusuf 52" },
  { juzz: 13, surahs: "Yusuf 53 – Ibrahim 52" },
  { juzz: 14, surahs: "Al-Hijr – An-Nahl 128" },
  { juzz: 15, surahs: "Al-Isra – Al-Kahf 74" },
  { juzz: 16, surahs: "Al-Kahf 75 – Ta-Ha 135" },
  { juzz: 17, surahs: "Al-Anbiya – Al-Hajj 78" },
  { juzz: 18, surahs: "Al-Mu'minun – Al-Furqan 20" },
  { juzz: 19, surahs: "Al-Furqan 21 – An-Naml 55" },
  { juzz: 20, surahs: "An-Naml 56 – Al-Ankabut 45" },
  { juzz: 21, surahs: "Al-Ankabut 46 – Al-Ahzab 30" },
  { juzz: 22, surahs: "Al-Ahzab 31 – Ya-Sin 27" },
  { juzz: 23, surahs: "Ya-Sin 28 – Az-Zumar 31" },
  { juzz: 24, surahs: "Az-Zumar 32 – Fussilat 46" },
  { juzz: 25, surahs: "Fussilat 47 – Al-Jathiyah 37" },
  { juzz: 26, surahs: "Al-Ahqaf – Adh-Dhariyat 30" },
  { juzz: 27, surahs: "Adh-Dhariyat 31 – Al-Hadid 29" },
  { juzz: 28, surahs: "Al-Mujadila – At-Tahrim" },
  { juzz: 29, surahs: "Al-Mulk – Al-Mursalat" },
  { juzz: 30, surahs: "An-Naba – An-Nas" },
];
