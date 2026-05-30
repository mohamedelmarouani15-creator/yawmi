import type { Question } from "./types";

export const QUESTIONS: Question[] = [
  // ── RELIGION ────────────────────────────────────────────────────────────
  {
    id: "rel_001", category: "religion", type: "mcq", difficulty: 1,
    question: "Combien y a-t-il de piliers de l'Islam ?",
    options: [{ text: "3", correct: false }, { text: "4", correct: false }, { text: "5", correct: true }, { text: "6", correct: false }],
  },
  {
    id: "rel_002", category: "religion", type: "mcq", difficulty: 1,
    question: "Quel est le premier pilier de l'Islam ?",
    options: [{ text: "La Salat (prière)", correct: false }, { text: "La Shahada (témoignage de foi)", correct: true }, { text: "La Zakat", correct: false }, { text: "Le Sawm (jeûne)", correct: false }],
  },
  {
    id: "rel_003", category: "religion", type: "mcq", difficulty: 1,
    question: "Dans quelle ville est né le Prophète Muhammad ﷺ ?",
    options: [{ text: "Médine", correct: false }, { text: "Jérusalem", correct: false }, { text: "La Mecque", correct: true }, { text: "Taif", correct: false }],
  },
  {
    id: "rel_004", category: "religion", type: "mcq", difficulty: 1,
    question: "Combien y a-t-il de sourates dans le Coran ?",
    options: [{ text: "99", correct: false }, { text: "112", correct: false }, { text: "114", correct: true }, { text: "120", correct: false }],
  },
  {
    id: "rel_005", category: "religion", type: "mcq", difficulty: 1,
    question: "Comment s'appelle la première sourate du Coran ?",
    options: [{ text: "Al-Baqara", correct: false }, { text: "Al-Fatiha", correct: true }, { text: "Al-Ikhlas", correct: false }, { text: "Al-Nas", correct: false }],
  },
  {
    id: "rel_006", category: "religion", type: "mcq", difficulty: 1,
    question: "Combien de fois par jour un musulman prie-t-il ?",
    options: [{ text: "3", correct: false }, { text: "4", correct: false }, { text: "5", correct: true }, { text: "6", correct: false }],
  },
  {
    id: "rel_007", category: "religion", type: "mcq", difficulty: 1,
    question: "Quel est le nom du mois de jeûne islamique ?",
    options: [{ text: "Chaban", correct: false }, { text: "Rajab", correct: false }, { text: "Mouharram", correct: false }, { text: "Ramadan", correct: true }],
  },
  {
    id: "rel_008", category: "religion", type: "mcq", difficulty: 1,
    question: "Qui était le premier calife après le Prophète ﷺ ?",
    options: [{ text: "Omar", correct: false }, { text: "Othman", correct: false }, { text: "Ali", correct: false }, { text: "Abu Bakr", correct: true }],
  },
  {
    id: "rel_009", category: "religion", type: "mcq", difficulty: 1,
    question: "Qu'est-ce que le Hajj ?",
    options: [{ text: "Le jeûne", correct: false }, { text: "La prière du vendredi", correct: false }, { text: "Le pèlerinage à La Mecque", correct: true }, { text: "L'aumône légale", correct: false }],
  },
  {
    id: "rel_010", category: "religion", type: "mcq", difficulty: 2,
    question: "Combien de rakats compte la prière de Fajr ?",
    options: [{ text: "1", correct: false }, { text: "2", correct: true }, { text: "3", correct: false }, { text: "4", correct: false }],
  },
  {
    id: "rel_011", category: "religion", type: "mcq", difficulty: 1,
    question: "Comment s'appelle l'aumône légale obligatoire en Islam ?",
    options: [{ text: "Sadaqa", correct: false }, { text: "Infaq", correct: false }, { text: "Waqf", correct: false }, { text: "Zakat", correct: true }],
  },
  {
    id: "rel_012", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel est le nom de l'ange qui a révélé le Coran au Prophète ﷺ ?",
    options: [{ text: "Mikael", correct: false }, { text: "Israfil", correct: false }, { text: "Jibril", correct: true }, { text: "Azraël", correct: false }],
  },
  {
    id: "rel_013", category: "religion", type: "mcq", difficulty: 2,
    question: "Combien y a-t-il de prophètes mentionnés dans le Coran ?",
    options: [{ text: "10", correct: false }, { text: "25", correct: true }, { text: "50", correct: false }, { text: "100", correct: false }],
  },
  {
    id: "rel_014", category: "religion", type: "mcq", difficulty: 2,
    question: "Quelle est la prière du vendredi ?",
    options: [{ text: "Tahajjud", correct: false }, { text: "Jumu'a", correct: true }, { text: "Duha", correct: false }, { text: "Witr", correct: false }],
  },
  {
    id: "rel_015", category: "religion", type: "mcq", difficulty: 2,
    question: "Combien de rakats compte la prière du Maghrib ?",
    options: [{ text: "2", correct: false }, { text: "3", correct: true }, { text: "4", correct: false }, { text: "5", correct: false }],
  },
  {
    id: "rel_016", category: "religion", type: "mcq", difficulty: 1,
    question: "Quelle est la signification du mot « Islam » ?",
    options: [{ text: "Foi", correct: false }, { text: "Prière", correct: false }, { text: "Soumission (à Dieu)", correct: true }, { text: "Charité", correct: false }],
  },
  {
    id: "rel_017", category: "religion", type: "mcq", difficulty: 2,
    question: "Combien de jours dure le Ramadan ?",
    options: [{ text: "20 jours", correct: false }, { text: "25 jours", correct: false }, { text: "29 ou 30 jours", correct: true }, { text: "31 jours", correct: false }],
  },
  {
    id: "rel_018", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que l'Iftar ?",
    options: [{ text: "Le repas avant l'aube (Suhur)", correct: false }, { text: "La rupture du jeûne au coucher du soleil", correct: true }, { text: "La prière du soir", correct: false }, { text: "La Zakat du Ramadan", correct: false }],
  },
  {
    id: "rel_019", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel prophète est connu pour avoir été dans le ventre d'une baleine ?",
    options: [{ text: "Ayoub", correct: false }, { text: "Youssef", correct: false }, { text: "Ibrahim", correct: false }, { text: "Yunus (Jonas)", correct: true }],
  },
  {
    id: "rel_020", category: "religion", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que le Wudu ?",
    options: [{ text: "La prière du matin", correct: false }, { text: "La purification rituelle (ablutions)", correct: true }, { text: "Le jeûne", correct: false }, { text: "La lecture du Coran", correct: false }],
  },
  {
    id: "rel_021", category: "religion", type: "mcq", difficulty: 2,
    question: "Combien de rakats compte la prière de l'Isha ?",
    options: [{ text: "2", correct: false }, { text: "3", correct: false }, { text: "4", correct: true }, { text: "5", correct: false }],
  },
  {
    id: "rel_022", category: "religion", type: "mcq", difficulty: 3,
    question: "Comment s'appelle la Nuit du Destin célébrée pendant Ramadan ?",
    options: [{ text: "Laylat al-Baraa", correct: false }, { text: "Laylat al-Qadr", correct: true }, { text: "Laylat al-Isra", correct: false }, { text: "Laylat al-Miraj", correct: false }],
  },
  {
    id: "rel_023", category: "religion", type: "mcq", difficulty: 3,
    question: "Quel prophète a été jeté dans le feu par son peuple mais en est sorti indemne ?",
    options: [{ text: "Musa (Moïse)", correct: false }, { text: "Isa (Jésus)", correct: false }, { text: "Ibrahim (Abraham)", correct: true }, { text: "Dawud (David)", correct: false }],
  },
  {
    id: "rel_024", category: "religion", type: "mcq", difficulty: 3,
    question: "En quelle année le Prophète ﷺ a-t-il effectué l'Hégire (migration vers Médine) ?",
    options: [{ text: "605 apr. J.-C.", correct: false }, { text: "610 apr. J.-C.", correct: false }, { text: "622 apr. J.-C.", correct: true }, { text: "632 apr. J.-C.", correct: false }],
    culturalCapsule: { title: "L'Hégire", text: "L'Hégire marque le début du calendrier islamique. La migration de La Mecque à Médine représenta un tournant historique pour la communauté musulmane naissante." },
  },
  {
    id: "rel_025", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel est le nom du voyage nocturne du Prophète ﷺ vers Jérusalem puis vers les cieux ?",
    options: [{ text: "Al-Hijra", correct: false }, { text: "Al-Isra wal-Miraj", correct: true }, { text: "Al-Fath", correct: false }, { text: "Al-Badr", correct: false }],
  },

  // ── HISTOIRE ──────────────────────────────────────────────────────────
  {
    id: "his_001", category: "history", type: "mcq", difficulty: 1,
    question: "Qui était Ibn Battuta ?",
    options: [{ text: "Un mathématicien", correct: false }, { text: "Un médecin", correct: false }, { text: "Un grand voyageur et explorateur", correct: true }, { text: "Un philosophe", correct: false }],
    culturalCapsule: { title: "Ibn Battuta", text: "Né à Tanger en 1304, Ibn Battuta a parcouru 120 000 km en 29 ans — plus que Marco Polo. Son récit de voyage, le Rihla, reste un trésor de la géographie médiévale." },
  },
  {
    id: "his_002", category: "history", type: "mcq", difficulty: 1,
    question: "Quelle ville abritait la célèbre 'Maison de la Sagesse' (Bayt al-Hikma) ?",
    options: [{ text: "Damas", correct: false }, { text: "Le Caire", correct: false }, { text: "Bagdad", correct: true }, { text: "Cordoue", correct: false }],
    culturalCapsule: { title: "Bayt al-Hikma", text: "La Maison de la Sagesse de Bagdad (IXe siècle) était le plus grand centre intellectuel du monde médiéval. On y traduisait Aristote, Platon, Euclide — sauvant des œuvres que l'Europe avait perdues." },
  },
  {
    id: "his_003", category: "history", type: "mcq", difficulty: 1,
    question: "Qui est considéré comme le père de l'algèbre ?",
    options: [{ text: "Ibn Sina", correct: false }, { text: "Al-Khwarizmi", correct: true }, { text: "Al-Biruni", correct: false }, { text: "Ibn Rushd", correct: false }],
    culturalCapsule: { title: "Al-Khwarizmi", text: "Son nom a donné 'algorithme' et son livre Al-Kitab al-mukhtasar fi hisab al-jabr a donné 'algèbre'. Ses travaux mathématiques ont changé le cours de la science mondiale." },
  },
  {
    id: "his_004", category: "history", type: "mcq", difficulty: 2,
    question: "Qui était Averroès (Ibn Rushd) ?",
    options: [{ text: "Un géographe", correct: false }, { text: "Un philosophe et médecin d'Andalousie", correct: true }, { text: "Un architecte", correct: false }, { text: "Un poète", correct: false }],
  },
  {
    id: "his_005", category: "history", type: "mcq", difficulty: 1,
    question: "Dans quelle ville marocaine se trouve la mosquée Koutoubia ?",
    options: [{ text: "Fès", correct: false }, { text: "Casablanca", correct: false }, { text: "Marrakech", correct: true }, { text: "Meknès", correct: false }],
  },
  {
    id: "his_006", category: "history", type: "mcq", difficulty: 2,
    question: "Pour quel domaine Al-Idrisi est-il célèbre ?",
    options: [{ text: "La médecine", correct: false }, { text: "La cartographie et la géographie", correct: true }, { text: "La philosophie", correct: false }, { text: "L'astronomie", correct: false }],
    culturalCapsule: { title: "Al-Idrisi", text: "En 1154, Al-Idrisi livra au roi Roger II de Sicile un disque d'argent gravé d'une carte du monde connu — la Tabula Rogeriana. Représentée avec le sud en haut, elle restera la carte la plus précise pendant 300 ans." },
  },
  {
    id: "his_007", category: "history", type: "mcq", difficulty: 2,
    question: "Ibn Khaldoun est considéré comme le père de :",
    options: [{ text: "La géographie", correct: false }, { text: "La sociologie et de l'historiographie", correct: true }, { text: "La médecine", correct: false }, { text: "L'astronomie", correct: false }],
    culturalCapsule: { title: "Ibn Khaldoun", text: "Sa Muqaddima (1377) est le premier traité de sciences sociales de l'histoire. Il y décrit les cycles de montée et de déclin des civilisations — une théorie toujours étudiée dans les universités aujourd'hui." },
  },
  {
    id: "his_008", category: "history", type: "mcq", difficulty: 2,
    question: "La médersa Bou Inania se trouve dans :",
    options: [{ text: "Marrakech", correct: false }, { text: "Rabat", correct: false }, { text: "Fès", correct: true }, { text: "Meknès", correct: false }],
  },
  {
    id: "his_009", category: "history", type: "mcq", difficulty: 3,
    question: "Quel grand mathématicien a donné son nom au mot « algorithme » ?",
    options: [{ text: "Ibn Sina", correct: false }, { text: "Al-Khwarizmi", correct: true }, { text: "Al-Farabi", correct: false }, { text: "Omar Khayyam", correct: false }],
  },
  {
    id: "his_010", category: "history", type: "mcq", difficulty: 2,
    question: "Dans quelle ville a été fondée la mosquée Al-Azhar (970 apr. J.-C.) ?",
    options: [{ text: "Bagdad", correct: false }, { text: "Damas", correct: false }, { text: "Le Caire", correct: true }, { text: "Alexandrie", correct: false }],
  },
  {
    id: "his_011", category: "history", type: "mcq", difficulty: 3,
    question: "La bibliothèque de Tombouctou contenait jusqu'à combien de manuscrits ?",
    options: [{ text: "1 000", correct: false }, { text: "10 000", correct: false }, { text: "700 000", correct: true }, { text: "10 millions", correct: false }],
    culturalCapsule: { title: "Tombouctou", text: "Aux XIVe-XVIe siècles, Tombouctou était une capitale mondiale du savoir avec 25 000 étudiants. Ses manuscrits couvrent la théologie, la médecine, l'astronomie et les mathématiques — un trésor de l'Afrique islamique." },
  },
  {
    id: "his_012", category: "history", type: "mcq", difficulty: 2,
    question: "Quelle fut la première capitale de l'Empire omeyyade ?",
    options: [{ text: "La Mecque", correct: false }, { text: "Damas", correct: true }, { text: "Bagdad", correct: false }, { text: "Le Caire", correct: false }],
  },
  {
    id: "his_013", category: "history", type: "mcq", difficulty: 2,
    question: "Ibn Sina (Avicenne) est surtout connu pour son 'Canon de la médecine'. Pendant combien de siècles ce livre fut-il enseigné en Europe ?",
    options: [{ text: "1 siècle", correct: false }, { text: "3 siècles", correct: false }, { text: "6 siècles", correct: true }, { text: "10 siècles", correct: false }],
  },
  {
    id: "his_014", category: "history", type: "mcq", difficulty: 3,
    question: "Qui a découvert la circulation pulmonaire du sang, avant Harvey ?",
    options: [{ text: "Ibn Sina", correct: false }, { text: "Al-Zahrawi", correct: false }, { text: "Ibn al-Nafis", correct: true }, { text: "Al-Razi", correct: false }],
    culturalCapsule: { title: "Ibn al-Nafis", text: "Au XIIIe siècle, Ibn al-Nafis décrivit avec précision que le sang passe par les poumons pour être oxygéné — 300 ans avant William Harvey. Sa découverte fut ignorée en Europe jusqu'au XXe siècle." },
  },
  {
    id: "his_015", category: "history", type: "mcq", difficulty: 2,
    question: "La ville de Fès fut fondée par quelle dynastie ?",
    options: [{ text: "Les Almohades", correct: false }, { text: "Les Almoravides", correct: false }, { text: "Les Idrissides", correct: true }, { text: "Les Mérinides", correct: false }],
  },
  {
    id: "his_016", category: "history", type: "mcq", difficulty: 3,
    question: "En quelle année Mehmed II conquit-il Constantinople ?",
    options: [{ text: "1356", correct: false }, { text: "1453", correct: true }, { text: "1492", correct: false }, { text: "1517", correct: false }],
  },
  {
    id: "his_017", category: "history", type: "mcq", difficulty: 2,
    question: "L'Alhambra de Grenade fut construite par :",
    options: [{ text: "Les Ottomans", correct: false }, { text: "Les Abbasides", correct: false }, { text: "Les Nasrides", correct: true }, { text: "Les Fatimides", correct: false }],
  },
  {
    id: "his_018", category: "history", type: "mcq", difficulty: 2,
    question: "Quel calife abbasside fonda Bagdad en 762 ?",
    options: [{ text: "Harun al-Rashid", correct: false }, { text: "Al-Ma'mun", correct: false }, { text: "Al-Mansur", correct: true }, { text: "Al-Mutawakkil", correct: false }],
  },
  {
    id: "his_019", category: "history", type: "mcq", difficulty: 3,
    question: "Quelle civilisation a inventé les chiffres que nous appelons 'chiffres arabes' ?",
    options: [{ text: "Les Arabes", correct: false }, { text: "Les savants indiens, diffusés par les Arabes", correct: true }, { text: "Les Grecs", correct: false }, { text: "Les Babyloniens", correct: false }],
    culturalCapsule: { title: "Chiffres arabes", text: "Les chiffres 0-9 furent inventés en Inde, puis adoptés et diffusés en Europe par les mathématiciens arabes. Sans le zéro indien (sifr en arabe, 'chiffre' en français), les mathématiques modernes n'existeraient pas." },
  },
  {
    id: "his_020", category: "history", type: "mcq", difficulty: 3,
    question: "À quelle ville l'astronome Al-Battani est-il associé ?",
    options: [{ text: "Bagdad", correct: false }, { text: "Samarcande", correct: false }, { text: "Ar-Raqqa (Syrie)", correct: true }, { text: "Damas", correct: false }],
  },

  // ── ARABE ─────────────────────────────────────────────────────────────
  {
    id: "ar_001", category: "arabic", type: "mcq", difficulty: 1,
    question: "Quel est le nom de cette lettre arabe : ب ?",
    options: [{ text: "Ta (ت)", correct: false }, { text: "Ba (ب)", correct: true }, { text: "Tha (ث)", correct: false }, { text: "Ya (ي)", correct: false }],
  },
  {
    id: "ar_002", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie كِتَاب ?",
    options: [{ text: "Stylo", correct: false }, { text: "École", correct: false }, { text: "Livre", correct: true }, { text: "Table", correct: false }],
  },
  {
    id: "ar_003", category: "arabic", type: "mcq", difficulty: 1,
    question: "Combien y a-t-il de lettres dans l'alphabet arabe ?",
    options: [{ text: "22", correct: false }, { text: "26", correct: false }, { text: "28", correct: true }, { text: "32", correct: false }],
  },
  {
    id: "ar_004", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie بَيت ?",
    options: [{ text: "Rue", correct: false }, { text: "Porte", correct: false }, { text: "Maison", correct: true }, { text: "Fenêtre", correct: false }],
  },
  {
    id: "ar_005", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie مَاء ?",
    options: [{ text: "Feu", correct: false }, { text: "Terre", correct: false }, { text: "Eau", correct: true }, { text: "Air", correct: false }],
  },
  {
    id: "ar_006", category: "arabic", type: "mcq", difficulty: 2,
    question: "Quel est le nom de cette lettre arabe : ع ?",
    options: [{ text: "Ghain (غ)", correct: false }, { text: "Ain (ع)", correct: true }, { text: "Ha (ه)", correct: false }, { text: "Kha (خ)", correct: false }],
  },
  {
    id: "ar_007", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie شَمس ?",
    options: [{ text: "Lune", correct: false }, { text: "Étoile", correct: false }, { text: "Soleil", correct: true }, { text: "Nuage", correct: false }],
  },
  {
    id: "ar_008", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie قَمَر ?",
    options: [{ text: "Soleil", correct: false }, { text: "Lune", correct: true }, { text: "Étoile", correct: false }, { text: "Ciel", correct: false }],
  },
  {
    id: "ar_009", category: "arabic", type: "mcq", difficulty: 1,
    question: "Comment dit-on 'merci' en arabe classique ?",
    options: [{ text: "مرحبا (Marhaba)", correct: false }, { text: "شكرا (Shukran)", correct: true }, { text: "إلى اللقاء (Ila al-liqa)", correct: false }, { text: "صباح الخير (Sabah al-khayr)", correct: false }],
  },
  {
    id: "ar_010", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie الله أكبر ?",
    options: [{ text: "Gloire à Allah", correct: false }, { text: "Allah est Grand (le Plus Grand)", correct: true }, { text: "Il n'y a de dieu qu'Allah", correct: false }, { text: "Louange à Allah", correct: false }],
  },
  {
    id: "ar_011", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie الحَمْدُ لِلَّهِ ?",
    options: [{ text: "Gloire à Allah", correct: false }, { text: "Allah est Grand", correct: false }, { text: "Louange à Allah", correct: true }, { text: "Au nom d'Allah", correct: false }],
  },
  {
    id: "ar_012", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie سُبْحَانَ اللّهِ ?",
    options: [{ text: "Louange à Allah", correct: false }, { text: "Gloire à Allah / Allah est parfait", correct: true }, { text: "Allah est Grand", correct: false }, { text: "Au nom d'Allah", correct: false }],
  },
  {
    id: "ar_013", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie سَمَاء ?",
    options: [{ text: "Terre", correct: false }, { text: "Mer", correct: false }, { text: "Ciel", correct: true }, { text: "Montagne", correct: false }],
  },
  {
    id: "ar_014", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie كَبِير ?",
    options: [{ text: "Petit", correct: false }, { text: "Beau", correct: false }, { text: "Grand", correct: true }, { text: "Vieux", correct: false }],
  },
  {
    id: "ar_015", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie جَدِيد ?",
    options: [{ text: "Ancien", correct: false }, { text: "Vieux", correct: false }, { text: "Nouveau", correct: true }, { text: "Cassé", correct: false }],
  },
  {
    id: "ar_016", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie بِسْمِ اللهِ ?",
    options: [{ text: "Gloire à Allah", correct: false }, { text: "Louange à Allah", correct: false }, { text: "Au nom d'Allah", correct: true }, { text: "Allah me suffit", correct: false }],
  },
  {
    id: "ar_017", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie أَب ?",
    options: [{ text: "Mère", correct: false }, { text: "Frère", correct: false }, { text: "Père", correct: true }, { text: "Fils", correct: false }],
  },
  {
    id: "ar_018", category: "arabic", type: "mcq", difficulty: 1,
    question: "Comment salue-t-on en arabe (formule islamique) ?",
    options: [{ text: "صباح الخير", correct: false }, { text: "مرحبا", correct: false }, { text: "السلام عليكم", correct: true }, { text: "شكرا", correct: false }],
  },
  {
    id: "ar_019", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie مَدِينَة ?",
    options: [{ text: "Village", correct: false }, { text: "Ville", correct: true }, { text: "Pays", correct: false }, { text: "Désert", correct: false }],
  },
  {
    id: "ar_020", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie عِلْم ?",
    options: [{ text: "Sagesse", correct: false }, { text: "Foi", correct: false }, { text: "Savoir / Science", correct: true }, { text: "Lumière", correct: false }],
  },

  // ── DARIJA ─────────────────────────────────────────────────────────────
  {
    id: "dar_001", category: "darija", type: "mcq", difficulty: 1,
    question: "Que signifie « كيداير / Kidayr » en darija marocaine ?",
    options: [{ text: "Au revoir", correct: false }, { text: "Merci", correct: false }, { text: "Comment vas-tu ?", correct: true }, { text: "Bienvenue", correct: false }],
  },
  {
    id: "dar_002", category: "darija", type: "mcq", difficulty: 1,
    question: "Que signifie « بغيت / Bghit » en darija ?",
    options: [{ text: "Je sais", correct: false }, { text: "Je veux", correct: true }, { text: "Je viens", correct: false }, { text: "Je pars", correct: false }],
  },
  {
    id: "dar_003", category: "darija", type: "mcq", difficulty: 1,
    question: "Comment dit-on 'maintenant' en darija ?",
    options: [{ text: "بكري (bakri)", correct: false }, { text: "غدا (ghda)", correct: false }, { text: "دابا (daba)", correct: true }, { text: "اليوم (lyoum)", correct: false }],
  },
  {
    id: "dar_004", category: "darija", type: "mcq", difficulty: 1,
    question: "Que signifie « مزيان / Mzyan » ?",
    options: [{ text: "Grand", correct: false }, { text: "Loin", correct: false }, { text: "Beau / Bien", correct: true }, { text: "Mauvais", correct: false }],
  },
  {
    id: "dar_005", category: "darija", type: "mcq", difficulty: 1,
    question: "Comment dit-on 'ami' en darija ?",
    options: [{ text: "خوي (khwi)", correct: false }, { text: "صاحبي (sahbi)", correct: true }, { text: "جاري (jari)", correct: false }, { text: "ولدي (wldi)", correct: false }],
  },
  {
    id: "dar_006", category: "darija", type: "mcq", difficulty: 1,
    question: "Que signifie « خويا / Khwiya » ?",
    options: [{ text: "Mon père", correct: false }, { text: "Mon fils", correct: false }, { text: "Mon frère", correct: true }, { text: "Mon oncle", correct: false }],
  },
  {
    id: "dar_007", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « بزاف / Bzzaf » ?",
    options: [{ text: "Un peu", correct: false }, { text: "Rien", correct: false }, { text: "Beaucoup", correct: true }, { text: "Jamais", correct: false }],
  },
  {
    id: "dar_008", category: "darija", type: "mcq", difficulty: 1,
    question: "Comment dit-on 'au revoir' en darija ?",
    options: [{ text: "مرحبا", correct: false }, { text: "بسلامة (bslama)", correct: true }, { text: "السلام عليكم", correct: false }, { text: "شكرا", correct: false }],
  },
  {
    id: "dar_009", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'j'ai faim' en darija ?",
    options: [{ text: "عطشان (atshan)", correct: false }, { text: "جعان (j'an)", correct: true }, { text: "مريض (mrid)", correct: false }, { text: "كيسل (kisl)", correct: false }],
  },
  {
    id: "dar_010", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « أش كاين / Ash kayn » ?",
    options: [{ text: "Comment vas-tu ?", correct: false }, { text: "Qu'est-ce qu'il y a ? / Quoi de neuf ?", correct: true }, { text: "Où es-tu ?", correct: false }, { text: "Qu'est-ce que tu veux ?", correct: false }],
  },
  {
    id: "dar_011", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « بنين / Bnin » ?",
    options: [{ text: "Grand", correct: false }, { text: "Beau", correct: false }, { text: "Délicieux", correct: true }, { text: "Doux", correct: false }],
  },
  {
    id: "dar_012", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'je ne sais pas' en darija ?",
    options: [{ text: "ما فهمتش (ma fhemtch)", correct: false }, { text: "ما عرفتش (ma rftech)", correct: true }, { text: "ما شفتش (ma cheftech)", correct: false }, { text: "ما سمعتش (ma semtech)", correct: false }],
  },
  {
    id: "dar_013", category: "darija", type: "mcq", difficulty: 1,
    question: "Que signifie « دار / Dar » en darija ?",
    options: [{ text: "Rue", correct: false }, { text: "Voiture", correct: false }, { text: "Maison", correct: true }, { text: "Marché", correct: false }],
  },
  {
    id: "dar_014", category: "darija", type: "mcq", difficulty: 3,
    question: "Que signifie « تيفاوت / Tifawt » en darija (d'origine amazighe) ?",
    options: [{ text: "La nuit", correct: false }, { text: "Le matin", correct: false }, { text: "La lumière", correct: true }, { text: "Le soir", correct: false }],
    culturalCapsule: { title: "L'Amazigh dans le darija", text: "Le darija marocain est un mélange d'arabe, d'amazigh (berbère), de français et d'espagnol. Des mots comme 'tifawt' (lumière) ou 'aïn' (source) viennent directement de la langue amazighe." },
  },
  {
    id: "dar_015", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'beaucoup de chance' ou 'bonne chance' en darija ?",
    options: [{ text: "بسلامة", correct: false }, { text: "مزيان", correct: false }, { text: "رانا هنا", correct: false }, { text: "بالتوفيق (beltawfiq)", correct: true }],
  },

  // ── RELIGION (suite — rel_026 → rel_050) ────────────────────
  {
    id: "rel_026", category: "religion", type: "mcq", difficulty: 2,
    question: "Comment s'appelle le voyage nocturne et l'ascension du Prophète ﷺ ?",
    options: [{ text: "Hijra", correct: false }, { text: "Isra et Mi'raj", correct: true }, { text: "Badr", correct: false }, { text: "Fath Makkah", correct: false }],
    culturalCapsule: { title: "L'Isra et le Mi'raj", text: "Durant ce voyage, le Prophète ﷺ voyagea de La Mecque à Jérusalem, puis monta aux cieux. C'est lors de ce voyage que la prière obligatoire de 5 fois par jour fut prescrite." },
  },
  {
    id: "rel_027", category: "religion", type: "mcq", difficulty: 2,
    question: "Quelle est la direction de prière pour les musulmans ?",
    options: [{ text: "L'est", correct: false }, { text: "Jérusalem", correct: false }, { text: "La Ka'ba à La Mecque", correct: true }, { text: "Le nord", correct: false }],
  },
  {
    id: "rel_028", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel est le nom du mois qui précède Ramadan ?",
    options: [{ text: "Rajab", correct: false }, { text: "Mouharram", correct: false }, { text: "Chaban", correct: true }, { text: "Chawwal", correct: false }],
  },
  {
    id: "rel_029", category: "religion", type: "mcq", difficulty: 2,
    question: "Combien de rakats compte la prière de Dhur (midi) ?",
    options: [{ text: "2", correct: false }, { text: "3", correct: false }, { text: "4", correct: true }, { text: "5", correct: false }],
  },
  {
    id: "rel_030", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que la Jumu'a ?",
    options: [{ text: "La prière du soir", correct: false }, { text: "La prière du vendredi", correct: true }, { text: "La prière du matin", correct: false }, { text: "La prière de fête", correct: false }],
  },
  {
    id: "rel_031", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que le Wudu ?",
    options: [{ text: "Le jeûne", correct: false }, { text: "L'ablution (purification avant la prière)", correct: true }, { text: "La Zakat", correct: false }, { text: "La prière du soir", correct: false }],
  },
  {
    id: "rel_032", category: "religion", type: "mcq", difficulty: 3,
    question: "Combien de piliers compte la Ka'ba (les 4 coins) dans la tradition ?",
    options: [{ text: "3", correct: false }, { text: "4", correct: true }, { text: "5", correct: false }, { text: "6", correct: false }],
  },
  {
    id: "rel_033", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que l'Aïd al-Adha commémore ?",
    options: [{ text: "La naissance du Prophète", correct: false }, { text: "La fin du Ramadan", correct: false }, { text: "Le sacrifice du Prophète Ibrahim ﷺ", correct: true }, { text: "L'Hégire", correct: false }],
  },
  {
    id: "rel_034", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel est le nom du pèlerinage à La Mecque ?",
    options: [{ text: "Umra", correct: false }, { text: "Hajj", correct: true }, { text: "Tawaf", correct: false }, { text: "Sa'y", correct: false }],
  },
  {
    id: "rel_035", category: "religion", type: "mcq", difficulty: 3,
    question: "Combien de fois un musulman doit-il effectuer le Tawaf lors du Hajj ?",
    options: [{ text: "5", correct: false }, { text: "6", correct: false }, { text: "7", correct: true }, { text: "10", correct: false }],
  },
  {
    id: "rel_036", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que la Sadaqa ?",
    options: [{ text: "La prière obligatoire", correct: false }, { text: "L'aumône volontaire", correct: true }, { text: "Le jeûne expiatoire", correct: false }, { text: "La récitation coranique", correct: false }],
  },
  {
    id: "rel_037", category: "religion", type: "mcq", difficulty: 3,
    question: "Comment s'appelle la première révélation du Coran au Prophète ﷺ ?",
    options: [{ text: "Al-Fatiha", correct: false }, { text: "Al-'Alaq (Lis !)", correct: true }, { text: "Al-Baqara", correct: false }, { text: "Al-Ikhlas", correct: false }],
    explanation: "La première révélation commence par 'Iqra' (Lis) dans la sourate Al-'Alaq (96:1).",
  },
  {
    id: "rel_038", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel est l'ange qui a apporté la révélation au Prophète ﷺ ?",
    options: [{ text: "Mikail", correct: false }, { text: "Israfil", correct: false }, { text: "Jibrîl (Gabriel)", correct: true }, { text: "Azrail", correct: false }],
  },
  {
    id: "rel_039", category: "religion", type: "mcq", difficulty: 3,
    question: "Combien d'années a duré la révélation coranique ?",
    options: [{ text: "10 ans", correct: false }, { text: "20 ans", correct: false }, { text: "23 ans", correct: true }, { text: "30 ans", correct: false }],
  },
  {
    id: "rel_040", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que la Hijra ?",
    options: [{ text: "La nuit du destin", correct: false }, { text: "La migration du Prophète ﷺ de La Mecque vers Médine", correct: true }, { text: "Le jeûne de Ramadan", correct: false }, { text: "La bataille de Badr", correct: false }],
  },
  {
    id: "rel_041", category: "religion", type: "mcq", difficulty: 3,
    question: "En quelle année de l'Hégire le Prophète ﷺ est-il décédé ?",
    options: [{ text: "8e année", correct: false }, { text: "10e année", correct: false }, { text: "11e année", correct: true }, { text: "15e année", correct: false }],
  },
  {
    id: "rel_042", category: "religion", type: "mcq", difficulty: 2,
    question: "Comment s'appelle la sourate du 'Trône' (Ayat al-Kursi) ?",
    options: [{ text: "Al-Imran", correct: false }, { text: "Al-Baqara (v. 255)", correct: true }, { text: "An-Nisa", correct: false }, { text: "Al-Fath", correct: false }],
  },
  {
    id: "rel_043", category: "religion", type: "mcq", difficulty: 4,
    question: "Quelle est la prière dite lors du décès d'un proche ?",
    options: [{ text: "إِنَّا لِلَّهِ وَإِنَّا إِلَيهِ رَاجِعُون", correct: true }, { text: "الحمد لله", correct: false }, { text: "بسم الله الرحمن الرحيم", correct: false }, { text: "لا حول ولا قوة إلا بالله", correct: false }],
  },
  {
    id: "rel_044", category: "religion", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que le Tawakkul ?",
    options: [{ text: "L'humilité devant Dieu", correct: false }, { text: "La confiance totale en Dieu", correct: true }, { text: "La gratitude envers Dieu", correct: false }, { text: "La patience dans l'adversité", correct: false }],
  },
  {
    id: "rel_045", category: "religion", type: "mcq", difficulty: 3,
    question: "Combien de prophètes sont mentionnés nommément dans le Coran ?",
    options: [{ text: "18", correct: false }, { text: "25", correct: true }, { text: "30", correct: false }, { text: "40", correct: false }],
  },
  {
    id: "rel_046", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel est le premier mois du calendrier islamique ?",
    options: [{ text: "Ramadan", correct: false }, { text: "Rajab", correct: false }, { text: "Mouharram", correct: true }, { text: "Dhul-Hijja", correct: false }],
  },
  {
    id: "rel_047", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que l'Istikhara ?",
    options: [{ text: "La prière de repentir", correct: false }, { text: "La prière de demande de guidance divine", correct: true }, { text: "La prière de remerciement", correct: false }, { text: "La prière des voyageurs", correct: false }],
  },
  {
    id: "rel_048", category: "religion", type: "mcq", difficulty: 3,
    question: "Quelle est la nuit la plus sainte du Ramadan ?",
    options: [{ text: "La nuit du 1er Ramadan", correct: false }, { text: "La nuit du 15 Ramadan", correct: false }, { text: "Laylat al-Qadr (la nuit du destin)", correct: true }, { text: "La nuit de l'Aïd", correct: false }],
  },
  {
    id: "rel_049", category: "religion", type: "mcq", difficulty: 4,
    question: "Combien de parties (juz') compte le Coran ?",
    options: [{ text: "20", correct: false }, { text: "25", correct: false }, { text: "30", correct: true }, { text: "114", correct: false }],
  },
  {
    id: "rel_050", category: "religion", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que le Tawhid ?",
    options: [{ text: "La prière collective", correct: false }, { text: "L'unicité de Dieu (foi en un seul Dieu)", correct: true }, { text: "Le jeûne expiatoire", correct: false }, { text: "La purification rituelle", correct: false }],
    culturalCapsule: { title: "Le Tawhid — fondement de la foi", text: "Le Tawhid (توحيد) est le concept central de l'Islam : la croyance absolue en l'unicité d'Allah. Il est à la fois théologique (Allah est un) et pratique (aucun acte d'adoration n'est dirigé vers autre qu'Allah)." },
  },

  // ── HISTORY (suite — his_021 → his_050) ─────────────────────
  {
    id: "his_021", category: "history", type: "mcq", difficulty: 2,
    question: "Quelle était la capitale de l'Empire abbasside ?",
    options: [{ text: "Damas", correct: false }, { text: "Bagdad", correct: true }, { text: "Samarcande", correct: false }, { text: "Le Caire", correct: false }],
    culturalCapsule: { title: "Bagdad, Maison de la Sagesse", text: "Bagdad fut fondée en 762 par le calife al-Mansur. La Maison de la Sagesse (Bayt al-Hikma) y traduit des ouvrages grecs, perses et indiens, préservant et enrichissant le savoir mondial." },
  },
  {
    id: "his_022", category: "history", type: "mcq", difficulty: 2,
    question: "Qui a fondé la ville de Fès au Maroc ?",
    options: [{ text: "Idris II", correct: true }, { text: "Youssef ibn Tachfin", correct: false }, { text: "Moulay Ismail", correct: false }, { text: "Al-Mansur", correct: false }],
  },
  {
    id: "his_023", category: "history", type: "mcq", difficulty: 3,
    question: "En quelle année Al-Khwarizmi a-t-il formalisé l'algèbre ?",
    options: [{ text: "Vers 750", correct: false }, { text: "Vers 820", correct: true }, { text: "Vers 900", correct: false }, { text: "Vers 1000", correct: false }],
    culturalCapsule: { title: "Al-Khwarizmi et l'algèbre", text: "Muhammad ibn Musa al-Khwarizmi écrit 'Al-Kitab al-mukhtasar fi hisab al-jabr wal-muqabala'. Le mot 'algèbre' vient de 'al-jabr'. Le mot 'algorithme' vient de la latinisation de son nom." },
  },
  {
    id: "his_024", category: "history", type: "mcq", difficulty: 2,
    question: "Quelle bibliothèque islamique fut l'une des plus grandes de l'histoire médiévale ?",
    options: [{ text: "Bibliothèque d'Alexandrie", correct: false }, { text: "Dar al-Kutub du Caire", correct: false }, { text: "Maison de la Sagesse de Bagdad", correct: true }, { text: "Bibliothèque de Tombouctou", correct: false }],
  },
  {
    id: "his_025", category: "history", type: "mcq", difficulty: 3,
    question: "Quel savant musulman a écrit le 'Canon de la Médecine', référence médicale pendant 600 ans ?",
    options: [{ text: "Al-Razi", correct: false }, { text: "Ibn Sina (Avicenne)", correct: true }, { text: "Ibn Rushd", correct: false }, { text: "Al-Biruni", correct: false }],
  },
  {
    id: "his_026", category: "history", type: "mcq", difficulty: 3,
    question: "Quelle université, fondée en 859, est considérée la plus ancienne du monde encore en activité ?",
    options: [{ text: "Al-Azhar du Caire", correct: false }, { text: "Oxford", correct: false }, { text: "Al-Qarawiyyin de Fès", correct: true }, { text: "Bologne", correct: false }],
    culturalCapsule: { title: "Al-Qarawiyyin — la plus ancienne université", text: "Fondée en 859 par Fatima al-Fihriyya, une femme, à Fès. Elle figure dans le Livre Guinness des Records comme la plus ancienne université en activité continue. C'est un symbole de la contribution islamique à l'éducation mondiale." },
  },
  {
    id: "his_027", category: "history", type: "mcq", difficulty: 2,
    question: "Quelle est la signification historique de la ville de Tombouctou ?",
    options: [{ text: "Centre commercial sur la route de la soie", correct: false }, { text: "Centre de savoir islamique et carrefour transsaharien", correct: true }, { text: "Capitale de l'Empire ottoman", correct: false }, { text: "Port de commerce en Méditerranée", correct: false }],
  },
  {
    id: "his_028", category: "history", type: "mcq", difficulty: 3,
    question: "Qui a rédigé la 'Muqaddima', premier traité de philosophie de l'histoire ?",
    options: [{ text: "Al-Tabari", correct: false }, { text: "Al-Masudi", correct: false }, { text: "Ibn Khaldoun", correct: true }, { text: "Al-Jahiz", correct: false }],
    culturalCapsule: { title: "Ibn Khaldoun, père de la sociologie", text: "Né à Tunis en 1332, Ibn Khaldoun développe dans la Muqaddima des concepts révolutionnaires : cycles des civilisations, rôle de la solidarité tribale (asabiyya), et méthode historique critique. Il est considéré le précurseur de la sociologie moderne." },
  },
  {
    id: "his_029", category: "history", type: "mcq", difficulty: 2,
    question: "Quelle bataille en 732 mit fin à l'expansion islamique en Europe occidentale ?",
    options: [{ text: "Bataille de Poitiers (Tours)", correct: true }, { text: "Bataille de Hattin", correct: false }, { text: "Bataille de Manzikert", correct: false }, { text: "Bataille de Yarmuk", correct: false }],
  },
  {
    id: "his_030", category: "history", type: "mcq", difficulty: 3,
    question: "Qui a fondé l'Empire almoravide, parti du Sahara pour unifier le Maghreb et l'Andalousie ?",
    options: [{ text: "Moulay Ismail", correct: false }, { text: "Youssef ibn Tachfin", correct: true }, { text: "Al-Mansur al-Almohade", correct: false }, { text: "Ibn Toumert", correct: false }],
  },
  {
    id: "his_031", category: "history", type: "mcq", difficulty: 4,
    question: "Quelle ville abrite la Grande Mosquée de Djenné, chef-d'œuvre de l'architecture de terre crue ?",
    options: [{ text: "Tombouctou", correct: false }, { text: "Djenné (Mali)", correct: true }, { text: "Accra", correct: false }, { text: "Kano", correct: false }],
  },
  {
    id: "his_032", category: "history", type: "mcq", difficulty: 3,
    question: "Qui est connu comme 'le père de la trigonométrie' dans la civilisation islamique ?",
    options: [{ text: "Al-Biruni", correct: false }, { text: "Al-Battani", correct: true }, { text: "Al-Khayyam", correct: false }, { text: "Al-Tusi", correct: false }],
  },
  {
    id: "his_033", category: "history", type: "mcq", difficulty: 3,
    question: "Quelle est la signification du mot 'Andalus' (Al-Andalus) dans l'histoire islamique ?",
    options: [{ text: "Espagne islamique (711-1492)", correct: true }, { text: "Maroc du Nord", correct: false }, { text: "Sicile islamique", correct: false }, { text: "Empire berbère", correct: false }],
  },
  {
    id: "his_034", category: "history", type: "mcq", difficulty: 2,
    question: "En quelle année l'Empire ottoman a-t-il pris Constantinople ?",
    options: [{ text: "1389", correct: false }, { text: "1453", correct: true }, { text: "1492", correct: false }, { text: "1520", correct: false }],
    culturalCapsule: { title: "1453 — La prise de Constantinople", text: "Le sultan Mehmed II dit 'el-Fatih' (le Conquérant) prend Constantinople en 1453, mettant fin à l'Empire byzantin. La basilique Sainte-Sophie devient une mosquée. C'est un tournant majeur de l'histoire mondiale." },
  },
  {
    id: "his_035", category: "history", type: "mcq", difficulty: 3,
    question: "Qui était Averroès (Ibn Rushd) et pourquoi est-il important pour l'Occident ?",
    options: [{ text: "Médecin qui inventa l'anesthésie", correct: false }, { text: "Philosophe qui redécouvrit et commenta Aristote pour l'Europe", correct: true }, { text: "Astronome qui calcula la distance Terre-Soleil", correct: false }, { text: "Géographe qui cartographia l'Afrique", correct: false }],
  },
  {
    id: "his_036", category: "history", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que le 'Kitab al-Manazir' d'Ibn al-Haytham ?",
    options: [{ text: "Un traité de géographie", correct: false }, { text: "Le premier traité scientifique sur l'optique", correct: true }, { text: "Un livre de médecine", correct: false }, { text: "Un manuel d'algèbre", correct: false }],
    culturalCapsule: { title: "Ibn al-Haytham, père de l'optique moderne", text: "Né en 965 à Bassora, Ibn al-Haytham (latinisé : Alhazen) réfute la théorie grecque selon laquelle l'œil émet des rayons. Il prouve que la vision est causée par la lumière reflétée qui entre dans l'œil — base de la physique optique moderne." },
  },
  {
    id: "his_037", category: "history", type: "mcq", difficulty: 3,
    question: "Quel empire islamique a régné sur la Péninsule ibérique pendant près de 800 ans ?",
    options: [{ text: "L'Empire ottoman", correct: false }, { text: "L'Emirat d'Al-Andalus", correct: true }, { text: "L'Empire almohade uniquement", correct: false }, { text: "L'Empire fatimide", correct: false }],
  },
  {
    id: "his_038", category: "history", type: "mcq", difficulty: 2,
    question: "Quelle est la signification de l'année 622 dans le calendrier islamique ?",
    options: [{ text: "Naissance du Prophète ﷺ", correct: false }, { text: "Révélation du Coran", correct: false }, { text: "Début de l'Hégire — an 1 du calendrier islamique", correct: true }, { text: "Bataille de Badr", correct: false }],
  },
  {
    id: "his_039", category: "history", type: "mcq", difficulty: 4,
    question: "Qui est al-Idrisi et quelle est sa contribution majeure ?",
    options: [{ text: "Philosophe de Cordoue", correct: false }, { text: "Géographe qui dressa la première carte précise du monde connu", correct: true }, { text: "Médecin de Bagdad", correct: false }, { text: "Mathématicien de Samarcande", correct: false }],
  },
  {
    id: "his_040", category: "history", type: "mcq", difficulty: 3,
    question: "Quelle ville fut le principal centre de la calligraphie islamique sous les Ottomans ?",
    options: [{ text: "Bagdad", correct: false }, { text: "Le Caire", correct: false }, { text: "Istanbul (Constantinople)", correct: true }, { text: "Tabriz", correct: false }],
  },
  {
    id: "his_041", category: "history", type: "mcq", difficulty: 3,
    question: "Qui fut Mansa Musa, le célèbre roi du Mali du XIVe siècle ?",
    options: [{ text: "Un roi qui conquit l'Égypte", correct: false }, { text: "Le souverain le plus riche de l'histoire, pèlerin à La Mecque", correct: true }, { text: "Un savant qui fonda Al-Azhar", correct: false }, { text: "Le fondateur de Tombouctou", correct: false }],
    culturalCapsule: { title: "Mansa Musa — l'homme le plus riche de l'histoire", text: "En 1324-1325, Mansa Musa effectue un pèlerinage à La Mecque avec 60 000 personnes et des tonnes d'or. Son passage provoque une dévaluation de l'or en Égypte. Sa richesse est estimée (ajustée) à des niveaux jamais atteints depuis." },
  },
  {
    id: "his_042", category: "history", type: "mcq", difficulty: 3,
    question: "En quelle année les Mongols saccagèrent-ils Bagdad, détruisant la Maison de la Sagesse ?",
    options: [{ text: "1187", correct: false }, { text: "1258", correct: true }, { text: "1345", correct: false }, { text: "1402", correct: false }],
  },
  {
    id: "his_043", category: "history", type: "mcq", difficulty: 3,
    question: "Qui était Saladin (Salah al-Din al-Ayyubi) ?",
    options: [{ text: "Sultan ottoman", correct: false }, { text: "Fondateur de la dynastie ayyoubide et reconquérant de Jérusalem (1187)", correct: true }, { text: "Calife abbasside", correct: false }, { text: "Roi du Mali", correct: false }],
  },
  {
    id: "his_044", category: "history", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que le 'Registan' de Samarcande ?",
    options: [{ text: "Un palais royal timouride", correct: false }, { text: "Une place centrale avec 3 médersas, chef-d'œuvre de l'architecture islamique", correct: true }, { text: "La grande mosquée de Samarcande", correct: false }, { text: "Un marché couvert historique", correct: false }],
  },
  {
    id: "his_045", category: "history", type: "mcq", difficulty: 3,
    question: "Quelle est la contribution principale de Jabir ibn Hayyan à la science ?",
    options: [{ text: "La médecine (Ibn Sina)", correct: false }, { text: "La chimie — il est considéré le père de la chimie expérimentale", correct: true }, { text: "L'astronomie", correct: false }, { text: "La géographie", correct: false }],
  },
  {
    id: "his_046", category: "history", type: "mcq", difficulty: 4,
    question: "Quelle civilisation a inventé le concept de l'hôpital public (Bimaristan) ?",
    options: [{ text: "Les Grecs", correct: false }, { text: "Les Romains", correct: false }, { text: "La civilisation islamique médiévale", correct: true }, { text: "Les Chinois", correct: false }],
  },
  {
    id: "his_047", category: "history", type: "mcq", difficulty: 2,
    question: "Quelle est la signification historique de l'année 711 pour l'Espagne ?",
    options: [{ text: "Naissance de Charlemagne", correct: false }, { text: "Débarquement de Tariq ibn Ziyad et début d'Al-Andalus", correct: true }, { text: "Fin de l'Empire romain d'Occident", correct: false }, { text: "Fondation de Madrid", correct: false }],
  },
  {
    id: "his_048", category: "history", type: "mcq", difficulty: 4,
    question: "Qui est Omar Khayyam et pourquoi est-il connu en Occident ?",
    options: [{ text: "Poète et mathématicien, auteur des 'Rubaiyat'", correct: true }, { text: "Philosophe de Cordoue", correct: false }, { text: "Astronome qui cartographia les étoiles", correct: false }, { text: "Historien de la conquête islamique", correct: false }],
  },
  {
    id: "his_049", category: "history", type: "mcq", difficulty: 3,
    question: "Quelle mosquée, construite en 706, est considérée la quatrième plus sainte de l'Islam par certains savants ?",
    options: [{ text: "Mosquée al-Husayn au Caire", correct: false }, { text: "Grande Mosquée des Omeyyades de Damas", correct: true }, { text: "Mosquée Koutoubia de Marrakech", correct: false }, { text: "Mosquée al-Qarawiyyin de Fès", correct: false }],
  },
  {
    id: "his_050", category: "history", type: "mcq", difficulty: 3,
    question: "Qui était Fatima al-Fihriyya ?",
    options: [{ text: "Épouse du Prophète ﷺ", correct: false }, { text: "Fondatrice de l'université al-Qarawiyyin de Fès (859)", correct: true }, { text: "Reine du Mali", correct: false }, { text: "Savante de la cour abbasside", correct: false }],
    culturalCapsule: { title: "Fatima al-Fihriyya — pionnière de l'éducation", text: "Fatima al-Fihriyya, fille d'un riche marchand, fonda Al-Qarawiyyin à Fès en 859. Elle utilisa tout son héritage pour construire la mosquée et l'université, qui devinrent le centre intellectuel du monde islamique occidental." },
  },

  // ── ARABE (suite — ar_021 → ar_050) ──────────────────────────
  {
    id: "ar_021", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie رَحْمَة ?",
    options: [{ text: "Puissance", correct: false }, { text: "Bonté", correct: false }, { text: "Miséricorde", correct: true }, { text: "Justice", correct: false }],
  },
  {
    id: "ar_022", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie صَبْر ?",
    options: [{ text: "Courage", correct: false }, { text: "Patience", correct: true }, { text: "Gratitude", correct: false }, { text: "Sagesse", correct: false }],
  },
  {
    id: "ar_023", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie نُور ?",
    options: [{ text: "Ombre", correct: false }, { text: "Feu", correct: false }, { text: "Lumière", correct: true }, { text: "Étoile", correct: false }],
  },
  {
    id: "ar_024", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie أُمّ ?",
    options: [{ text: "Père", correct: false }, { text: "Sœur", correct: false }, { text: "Mère", correct: true }, { text: "Fille", correct: false }],
  },
  {
    id: "ar_025", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie قَلْب ?",
    options: [{ text: "Esprit", correct: false }, { text: "Âme", correct: false }, { text: "Cœur", correct: true }, { text: "Tête", correct: false }],
  },
  {
    id: "ar_026", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie صِدْق ?",
    options: [{ text: "Beauté", correct: false }, { text: "Vérité / Sincérité", correct: true }, { text: "Justice", correct: false }, { text: "Générosité", correct: false }],
  },
  {
    id: "ar_027", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie جَنَّة ?",
    options: [{ text: "Jardin ou Paradis", correct: true }, { text: "Enfer", correct: false }, { text: "Terre", correct: false }, { text: "Montagne", correct: false }],
  },
  {
    id: "ar_028", category: "arabic", type: "mcq", difficulty: 3,
    question: "Comment se forme le pluriel de كِتَاب (livre) en arabe ?",
    options: [{ text: "كتابات", correct: false }, { text: "كُتُب", correct: true }, { text: "كتابون", correct: false }, { text: "كتابين", correct: false }],
  },
  {
    id: "ar_029", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie حَقّ ?",
    options: [{ text: "Doute", correct: false }, { text: "Vérité / Droit / Ce qui est juste", correct: true }, { text: "Paix", correct: false }, { text: "Bien", correct: false }],
  },
  {
    id: "ar_030", category: "arabic", type: "mcq", difficulty: 3,
    question: "Quelle lettre arabe n'a pas d'équivalent dans l'alphabet latin ?",
    options: [{ text: "ب (ba)", correct: false }, { text: "ع (ain)", correct: true }, { text: "س (sin)", correct: false }, { text: "م (mim)", correct: false }],
  },
  {
    id: "ar_031", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie الإسلام étymologiquement ?",
    options: [{ text: "La foi", correct: false }, { text: "La paix et la soumission (à Dieu)", correct: true }, { text: "La prière", correct: false }, { text: "La pureté", correct: false }],
  },
  {
    id: "ar_032", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie إِخْوَة ?",
    options: [{ text: "Enfants", correct: false }, { text: "Frères", correct: true }, { text: "Voisins", correct: false }, { text: "Amis", correct: false }],
  },
  {
    id: "ar_033", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie حِكْمَة ?",
    options: [{ text: "Connaissance", correct: false }, { text: "Sagesse", correct: true }, { text: "Intelligence", correct: false }, { text: "Mémoire", correct: false }],
  },
  {
    id: "ar_034", category: "arabic", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'je t'aime' en arabe ?",
    options: [{ text: "أنا بخير", correct: false }, { text: "أنا معك", correct: false }, { text: "أنا أحبك", correct: true }, { text: "أنا هنا", correct: false }],
  },
  {
    id: "ar_035", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie حَلَال ?",
    options: [{ text: "Interdit par la loi islamique", correct: false }, { text: "Permis par la loi islamique", correct: true }, { text: "Obligatoire", correct: false }, { text: "Recommandé", correct: false }],
  },
  {
    id: "ar_036", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie حَرَام ?",
    options: [{ text: "Permis", correct: false }, { text: "Sacré / Interdit", correct: true }, { text: "Obligatoire", correct: false }, { text: "Recommandé", correct: false }],
  },
  {
    id: "ar_037", category: "arabic", type: "mcq", difficulty: 4,
    question: "Que signifie la formule « ما شاء الله » (Masha'Allah) ?",
    options: [{ text: "Au nom d'Allah", correct: false }, { text: "Dieu est Grand", correct: false }, { text: "Ce qu'Allah a voulu (expression d'admiration)", correct: true }, { text: "Si Allah le veut", correct: false }],
  },
  {
    id: "ar_038", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie la formule « إن شاء الله » (Insha'Allah) ?",
    options: [{ text: "Alhamdulillah", correct: false }, { text: "Si Allah le veut", correct: true }, { text: "Gloire à Allah", correct: false }, { text: "Dieu est Grand", correct: false }],
  },
  {
    id: "ar_039", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie حَسَنَة ?",
    options: [{ text: "Bonne action / bénédiction", correct: true }, { text: "Péché", correct: false }, { text: "Peur", correct: false }, { text: "Tristesse", correct: false }],
  },
  {
    id: "ar_040", category: "arabic", type: "mcq", difficulty: 4,
    question: "De quelle racine vient le mot 'islah' (réforme, correction) ?",
    options: [{ text: "ص-ل-ح (la paix, la bonté)", correct: true }, { text: "ع-ل-م (la science)", correct: false }, { text: "ق-ر-أ (lire)", correct: false }, { text: "ك-ت-ب (écrire)", correct: false }],
  },
  {
    id: "ar_041", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie أَمَل ?",
    options: [{ text: "Peur", correct: false }, { text: "Espoir", correct: true }, { text: "Joie", correct: false }, { text: "Paix", correct: false }],
  },
  {
    id: "ar_042", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie وَلَد ?",
    options: [{ text: "Fille", correct: false }, { text: "Enfant / fils", correct: true }, { text: "Femme", correct: false }, { text: "Vieux", correct: false }],
  },
  {
    id: "ar_043", category: "arabic", type: "mcq", difficulty: 3,
    question: "Quelle est la différence entre الفُصحى (al-fusha) et الدارجة (al-darija) ?",
    options: [{ text: "Aucune différence", correct: false }, { text: "Al-fusha est l'arabe classique/standard ; al-darija est l'arabe dialectal parlé", correct: true }, { text: "Al-fusha est parlé, al-darija est écrit", correct: false }, { text: "Ce sont deux alphabets différents", correct: false }],
  },
  {
    id: "ar_044", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie وَقْت ?",
    options: [{ text: "Lieu", correct: false }, { text: "Temps / moment", correct: true }, { text: "Énergie", correct: false }, { text: "Vie", correct: false }],
  },
  {
    id: "ar_045", category: "arabic", type: "mcq", difficulty: 4,
    question: "Que signifie la racine trilitère ع-ل-م en arabe ?",
    options: [{ text: "Croire", correct: false }, { text: "Savoir, connaître (science, savant, monde)", correct: true }, { text: "Prier", correct: false }, { text: "Aimer", correct: false }],
    culturalCapsule: { title: "Les racines trilitères de l'arabe", text: "L'arabe est construit sur des racines de 3 consonnes (trilitères). Par exemple, ع-ل-م donne : عِلم (science), عالِم (savant), عَلَّمَ (enseigner), مَعلومات (informations)... Un système remarquablement cohérent." },
  },
  {
    id: "ar_046", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie حُرِّية ?",
    options: [{ text: "Beauté", correct: false }, { text: "Liberté", correct: true }, { text: "Dignité", correct: false }, { text: "Justice", correct: false }],
  },
  {
    id: "ar_047", category: "arabic", type: "mcq", difficulty: 4,
    question: "Combien y a-t-il de lettres solaires (شمسية) dans l'alphabet arabe ?",
    options: [{ text: "10", correct: false }, { text: "12", correct: false }, { text: "14", correct: true }, { text: "18", correct: false }],
    explanation: "Les lettres solaires absorbent le 'l' de l'article 'al'. Ex: الشمس se prononce 'ash-shams' et non 'al-shams'.",
  },
  {
    id: "ar_048", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie مَعَ السَّلامة ?",
    options: [{ text: "Bonjour", correct: false }, { text: "Bienvenue", correct: false }, { text: "Au revoir (pars en paix)", correct: true }, { text: "Bonne nuit", correct: false }],
  },
  {
    id: "ar_049", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie حَيَاة ?",
    options: [{ text: "Mort", correct: false }, { text: "Vie", correct: true }, { text: "Temps", correct: false }, { text: "Nature", correct: false }],
  },
  {
    id: "ar_050", category: "arabic", type: "mcq", difficulty: 4,
    question: "Quelle est la particularité de la hamza (ء) en arabe ?",
    options: [{ text: "C'est une voyelle longue", correct: false }, { text: "C'est un coup de glotte — arrêt bref de la respiration", correct: true }, { text: "C'est la même chose que la lettre alif", correct: false }, { text: "C'est une consonne toujours au début des mots", correct: false }],
  },

  // ── DARIJA (suite — dar_016 → dar_050) ───────────────────────
  {
    id: "dar_016", category: "darija", type: "mcq", difficulty: 1,
    question: "Que signifie « واش / Wash » en darija ?",
    options: [{ text: "Comment", correct: false }, { text: "Où", correct: false }, { text: "Est-ce que / quoi (particule interrogative)", correct: true }, { text: "Qui", correct: false }],
  },
  {
    id: "dar_017", category: "darija", type: "mcq", difficulty: 1,
    question: "Comment dit-on 'maintenant' en darija marocaine ?",
    options: [{ text: "غدا (ghda)", correct: false }, { text: "دابا (daba)", correct: true }, { text: "بكري (bekri)", correct: false }, { text: "اليوم (lyum)", correct: false }],
  },
  {
    id: "dar_018", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « خويا / Khwiya » en darija ?",
    options: [{ text: "Mon père", correct: false }, { text: "Mon ami (familier)", correct: false }, { text: "Mon frère (familier)", correct: true }, { text: "Mon fils", correct: false }],
  },
  {
    id: "dar_019", category: "darija", type: "mcq", difficulty: 1,
    question: "Comment dit-on 'oui' en darija marocaine ?",
    options: [{ text: "لا (la)", correct: false }, { text: "آه (ah)", correct: true }, { text: "واخا (wakha)", correct: false }, { text: "بلا (bla)", correct: false }],
  },
  {
    id: "dar_020", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « واخا / Wakha » en darija ?",
    options: [{ text: "Non", correct: false }, { text: "Peut-être", correct: false }, { text: "D'accord / OK", correct: true }, { text: "Jamais", correct: false }],
  },
  {
    id: "dar_021", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'j'ai faim' en darija marocaine ?",
    options: [{ text: "جيت عطشان", correct: false }, { text: "جيت عياّن", correct: false }, { text: "جيت جعان", correct: true }, { text: "جيت نعسان", correct: false }],
  },
  {
    id: "dar_022", category: "darija", type: "mcq", difficulty: 1,
    question: "Que signifie « بزاف / Bzaf » en darija ?",
    options: [{ text: "Un peu", correct: false }, { text: "Jamais", correct: false }, { text: "Beaucoup", correct: true }, { text: "Maintenant", correct: false }],
  },
  {
    id: "dar_023", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « شحال / Shhal » en darija ?",
    options: [{ text: "Qui", correct: false }, { text: "Combien", correct: true }, { text: "Quand", correct: false }, { text: "Comment", correct: false }],
  },
  {
    id: "dar_024", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'je suis fatigué(e)' en darija marocaine ?",
    options: [{ text: "أنا مريض", correct: false }, { text: "أنا عيّان", correct: true }, { text: "أنا زعفان", correct: false }, { text: "أنا مشيت", correct: false }],
  },
  {
    id: "dar_025", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « بلا / Bla » en darija marocaine ?",
    options: [{ text: "Avec", correct: false }, { text: "Sans", correct: true }, { text: "Sur", correct: false }, { text: "Dans", correct: false }],
  },
  {
    id: "dar_026", category: "darija", type: "mcq", difficulty: 3,
    question: "De quelle langue vient le mot darija « طاكسي / taxi » ?",
    options: [{ text: "Arabe classique", correct: false }, { text: "Amazigh", correct: false }, { text: "Français", correct: true }, { text: "Espagnol", correct: false }],
  },
  {
    id: "dar_027", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « حاجة / Haja » en darija ?",
    options: [{ text: "Personne", correct: false }, { text: "Une chose / quelque chose", correct: true }, { text: "Un endroit", correct: false }, { text: "Un moment", correct: false }],
  },
  {
    id: "dar_028", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'viens ici' en darija marocaine ?",
    options: [{ text: "سير من هنا", correct: false }, { text: "رجع", correct: false }, { text: "آجي هنا (aji hna)", correct: true }, { text: "دير هاد الحاجة", correct: false }],
  },
  {
    id: "dar_029", category: "darija", type: "mcq", difficulty: 3,
    question: "Que signifie l'expression darija « عندو الهبة / 'andu l-hba » ?",
    options: [{ text: "Il est très riche", correct: false }, { text: "Il a du talent / il est doué", correct: true }, { text: "Il est paresseux", correct: false }, { text: "Il a de la chance", correct: false }],
  },
  {
    id: "dar_030", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'demain' en darija marocaine ?",
    options: [{ text: "دابا (daba)", correct: false }, { text: "بكري (bekri)", correct: false }, { text: "غدا (ghda)", correct: true }, { text: "دكشي (dkshi)", correct: false }],
  },
  {
    id: "dar_031", category: "darija", type: "mcq", difficulty: 3,
    question: "Que signifie « بحال / Bhal » en darija ?",
    options: [{ text: "Contre", correct: false }, { text: "Comme / pareil", correct: true }, { text: "Mieux que", correct: false }, { text: "Différent de", correct: false }],
  },
  {
    id: "dar_032", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « غادي / Ghadi » en darija marocaine ?",
    options: [{ text: "Passé (verbe)", correct: false }, { text: "Allant / va (futur proche)", correct: true }, { text: "Revenant", correct: false }, { text: "Dormant", correct: false }],
  },
  {
    id: "dar_033", category: "darija", type: "mcq", difficulty: 3,
    question: "Que signifie l'expression « ما عندوش المكعب / ma 'andush l-mka'ab » ?",
    options: [{ text: "Il n'a pas de maison", correct: false }, { text: "Il n'a pas le talent / la capacité", correct: true }, { text: "Il n'a pas d'argent", correct: false }, { text: "Il n'a pas de chance", correct: false }],
  },
  {
    id: "dar_034", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'je comprends' en darija marocaine ?",
    options: [{ text: "فهمت (fhmt)", correct: true }, { text: "شفت (shft)", correct: false }, { text: "سمعت (sm't)", correct: false }, { text: "عرفت ('rft)", correct: false }],
  },
  {
    id: "dar_035", category: "darija", type: "mcq", difficulty: 3,
    question: "Quelle est l'origine du mot darija « ليساف / lissaf » (malheureusement) ?",
    options: [{ text: "Arabe classique", correct: false }, { text: "Espagnol", correct: false }, { text: "Français 'hélas'", correct: true }, { text: "Amazigh", correct: false }],
  },
  {
    id: "dar_036", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « خبز / Khbz » en darija ?",
    options: [{ text: "Viande", correct: false }, { text: "Lait", correct: false }, { text: "Pain", correct: true }, { text: "Couscous", correct: false }],
  },
  {
    id: "dar_037", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'je voudrais' en darija marocaine ?",
    options: [{ text: "بغيت (bghit)", correct: true }, { text: "كليت (klit)", correct: false }, { text: "شريت (shrit)", correct: false }, { text: "خدمت (khdmt)", correct: false }],
  },
  {
    id: "dar_038", category: "darija", type: "mcq", difficulty: 3,
    question: "Que signifie « فور / Fur » (emprunt linguistique) en darija marocaine ?",
    options: [{ text: "Froid", correct: false }, { text: "Tout de suite (du français 'pour')", correct: false }, { text: "Four (appareil de cuisson)", correct: true }, { text: "Marché", correct: false }],
  },
  {
    id: "dar_039", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « كيسر / Kisar » en darija ?",
    options: [{ text: "Comment il fait", correct: false }, { text: "Qu'est-ce qui est cassé", correct: false }, { text: "Comment ça s'appelle / il s'appelle comment", correct: true }, { text: "Qu'est-ce qui se passe", correct: false }],
  },
  {
    id: "dar_040", category: "darija", type: "mcq", difficulty: 3,
    question: "Quelle expression darija signifie 'c'est la vie, on ne peut rien y faire' ?",
    options: [{ text: "هاد شي كبير", correct: false }, { text: "هاكذا كتكون الأمور", correct: false }, { text: "هاكا / هكا الدنيا (haka d-dunya)", correct: true }, { text: "الله يعاون", correct: false }],
  },
  {
    id: "dar_041", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « الله يرحمو / Allah yarhmhu » ?",
    options: [{ text: "Que Dieu te protège", correct: false }, { text: "Que Dieu lui fasse miséricorde (pour un défunt)", correct: true }, { text: "Que Dieu te pardonne", correct: false }, { text: "Que Dieu t'aide", correct: false }],
  },
  {
    id: "dar_042", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'bienvenue' en darija marocaine ?",
    options: [{ text: "مرحبا (mrhba)", correct: true }, { text: "بسلامة", correct: false }, { text: "كيداير", correct: false }, { text: "مزيان", correct: false }],
  },
  {
    id: "dar_043", category: "darija", type: "mcq", difficulty: 3,
    question: "Que signifie « ضروري / Daruri » en darija ?",
    options: [{ text: "Difficile", correct: false }, { text: "Inutile", correct: false }, { text: "Nécessaire / obligatoire", correct: true }, { text: "Possible", correct: false }],
  },
  {
    id: "dar_044", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « تاني / Tani » en darija marocaine ?",
    options: [{ text: "Seulement", correct: false }, { text: "Avant", correct: false }, { text: "Aussi / encore / deuxième", correct: true }, { text: "Jamais", correct: false }],
  },
  {
    id: "dar_045", category: "darija", type: "mcq", difficulty: 3,
    question: "Que signifie l'expression « فالزنقة / f-l-znqa » ?",
    options: [{ text: "À la maison", correct: false }, { text: "Dans la rue / dans la ruelle", correct: true }, { text: "Au marché", correct: false }, { text: "À la mosquée", correct: false }],
    culturalCapsule: { title: "La znqa — espace de vie marocain", text: "La 'znqa' (رقيق) est la ruelle étroite des médinas marocaines. Plus que lieu géographique, c'est un espace social où se croisent voisins, enfants jouant, et vie de quartier. Un symbole de la vie communautaire urbaine marocaine." },
  },
  {
    id: "dar_046", category: "darija", type: "mcq", difficulty: 3,
    question: "Quelle est l'origine probable du mot « بهيم / Bhim » (idiot en darija) ?",
    options: [{ text: "Français 'bête'", correct: false }, { text: "Arabe classique بهيمة (animal, être sans raison)", correct: true }, { text: "Amazigh", correct: false }, { text: "Espagnol", correct: false }],
  },
  {
    id: "dar_047", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie « الله يخليك / Allah ykhllik » ?",
    options: [{ text: "Que Dieu te guide", correct: false }, { text: "S'il te plaît (que Dieu te garde)", correct: true }, { text: "Bonne chance", correct: false }, { text: "Merci beaucoup", correct: false }],
  },
  {
    id: "dar_048", category: "darija", type: "mcq", difficulty: 3,
    question: "Que signifie « شكون / Shkun » en darija marocaine ?",
    options: [{ text: "Quoi", correct: false }, { text: "Où", correct: false }, { text: "Qui", correct: true }, { text: "Quand", correct: false }],
  },
  {
    id: "dar_049", category: "darija", type: "mcq", difficulty: 3,
    question: "Que signifie l'expression « دير راسك / dir rasak » ?",
    options: [{ text: "Lève la tête", correct: false }, { text: "Fais attention à toi / débrouille-toi", correct: true }, { text: "Tourne la tête", correct: false }, { text: "Pense par toi-même", correct: false }],
  },
  {
    id: "dar_050", category: "darija", type: "mcq", difficulty: 3,
    question: "Comment dit-on 'c'est délicieux' en darija marocaine ?",
    options: [{ text: "كاين / kayine", correct: false }, { text: "ميزيان / mizyan", correct: false }, { text: "بنيّن / bnin", correct: true }, { text: "حلو / hlu", correct: false }],
  },

  // ── CORAN (qur_001 → qur_050) ────────────────────────────────
  {
    id: "qur_001", category: "quran", type: "mcq", difficulty: 1,
    question: "Combien de versets (ayats) compte la sourate Al-Fatiha ?",
    options: [{ text: "5", correct: false }, { text: "6", correct: false }, { text: "7", correct: true }, { text: "8", correct: false }],
  },
  {
    id: "qur_002", category: "quran", type: "mcq", difficulty: 1,
    question: "Quelle est la plus courte sourate du Coran ?",
    options: [{ text: "Al-Ikhlas", correct: false }, { text: "Al-Kawthar", correct: true }, { text: "Al-Nas", correct: false }, { text: "Al-Asr", correct: false }],
    explanation: "Al-Kawthar (sourate 108) ne contient que 3 versets.",
  },
  {
    id: "qur_003", category: "quran", type: "mcq", difficulty: 1,
    question: "Quelle est la plus longue sourate du Coran ?",
    options: [{ text: "Al-Imran", correct: false }, { text: "Al-Anfal", correct: false }, { text: "Al-Baqara", correct: true }, { text: "An-Nisa", correct: false }],
    explanation: "Al-Baqara (La Vache) contient 286 versets.",
  },
  {
    id: "qur_004", category: "quran", type: "mcq", difficulty: 1,
    question: "Combien de fois le mot 'Allah' apparaît-il approximativement dans le Coran ?",
    options: [{ text: "500 fois", correct: false }, { text: "1000 fois", correct: false }, { text: "2700 fois", correct: true }, { text: "5000 fois", correct: false }],
  },
  {
    id: "qur_005", category: "quran", type: "mcq", difficulty: 1,
    question: "Combien y a-t-il de versets (ayats) dans le Coran ?",
    options: [{ text: "4000", correct: false }, { text: "5000", correct: false }, { text: "6236", correct: true }, { text: "8000", correct: false }],
  },
  {
    id: "qur_006", category: "quran", type: "mcq", difficulty: 2,
    question: "Quel verset du Coran est appelé 'Ayat al-Kursi' (le Trône) ?",
    options: [{ text: "Al-Baqara 255", correct: true }, { text: "Al-Fatiha 1", correct: false }, { text: "Al-Ikhlas 1", correct: false }, { text: "Al-Baqara 1", correct: false }],
    culturalCapsule: { title: "Ayat al-Kursi — le verset du Trône", text: "Considéré comme le verset le plus puissant du Coran. Le Prophète ﷺ a dit : 'Celui qui récite Ayat al-Kursi après chaque prière obligatoire, rien ne l'empêchera d'entrer au Paradis sauf la mort.' (Nasaï)" },
  },
  {
    id: "qur_007", category: "quran", type: "mcq", difficulty: 2,
    question: "Quelle sourate est appelée 'le cœur du Coran' ?",
    options: [{ text: "Al-Fatiha", correct: false }, { text: "Ya-Sin (sourate 36)", correct: true }, { text: "Al-Kahf", correct: false }, { text: "Ar-Rahman", correct: false }],
  },
  {
    id: "qur_008", category: "quran", type: "mcq", difficulty: 2,
    question: "Quelle est la signification de la Basmala (بسم الله الرحمن الرحيم) ?",
    options: [{ text: "Dieu est Grand", correct: false }, { text: "Louange à Dieu", correct: false }, { text: "Au nom d'Allah le Très Miséricordieux, le Tout Miséricordieux", correct: true }, { text: "Il n'y a de dieu qu'Allah", correct: false }],
  },
  {
    id: "qur_009", category: "quran", type: "mcq", difficulty: 2,
    question: "Dans quelle sourate est mentionné le miracle de Jésus (Issa) ﷺ soufflant la vie dans un oiseau d'argile ?",
    options: [{ text: "Al-Baqara", correct: false }, { text: "Al-Imran et Al-Maïda", correct: true }, { text: "Maryam", correct: false }, { text: "An-Nisa", correct: false }],
  },
  {
    id: "qur_010", category: "quran", type: "mcq", difficulty: 2,
    question: "Quelle sourate porte le nom d'une prophète femme (une des rares à être nommée dans le Coran) ?",
    options: [{ text: "Al-Nahl (Abeilles)", correct: false }, { text: "Maryam (Marie)", correct: true }, { text: "Al-Anbiya", correct: false }, { text: "Al-Qadr", correct: false }],
  },
  {
    id: "qur_011", category: "quran", type: "mcq", difficulty: 2,
    question: "Quel est le vrai nom de la sourate 'Yaseen' ?",
    options: [{ text: "Ya-Sin (يس)", correct: true }, { text: "يا سين (deux lettres arabes)", correct: false }, { text: "يسين", correct: false }, { text: "ياسين", correct: false }],
  },
  {
    id: "qur_012", category: "quran", type: "mcq", difficulty: 2,
    question: "Combien de sourates commencent par les lettres 'Alif-Lam-Mim' (الم) ?",
    options: [{ text: "3", correct: false }, { text: "5", correct: false }, { text: "6", correct: true }, { text: "9", correct: false }],
  },
  {
    id: "qur_013", category: "quran", type: "mcq", difficulty: 3,
    question: "Quelle est la sourate qui est récitée chaque vendredi lors de la Jumu'a ?",
    options: [{ text: "Al-Fatiha", correct: false }, { text: "Al-Kahf (la Caverne)", correct: true }, { text: "Ya-Sin", correct: false }, { text: "Al-Jumu'a", correct: false }],
    culturalCapsule: { title: "Al-Kahf — Lumière du vendredi", text: "Le Prophète ﷺ a dit : 'Celui qui lit la sourate Al-Kahf le vendredi, une lumière s'illumine pour lui d'un vendredi à l'autre.' Elle contient 4 histoires : les gens de la Caverne, le jardinier, Moussa et al-Khidr, et Dhul-Qarnayn." },
  },
  {
    id: "qur_014", category: "quran", type: "mcq", difficulty: 2,
    question: "Combien y a-t-il de prosternations (sajda) dans le Coran ?",
    options: [{ text: "10", correct: false }, { text: "12", correct: false }, { text: "14", correct: true }, { text: "16", correct: false }],
  },
  {
    id: "qur_015", category: "quran", type: "mcq", difficulty: 3,
    question: "Quelle sourate ne commence pas par la Basmala ?",
    options: [{ text: "Al-Fatiha", correct: false }, { text: "At-Tawba (Al-Bara'a — sourate 9)", correct: true }, { text: "Al-Baqara", correct: false }, { text: "Al-Kahf", correct: false }],
    explanation: "At-Tawba est la seule des 114 sourates à ne pas commencer par 'Bismillah'.",
  },
  {
    id: "qur_016", category: "quran", type: "mcq", difficulty: 2,
    question: "Quelle sourate est considérée équivalente à un tiers du Coran ?",
    options: [{ text: "Al-Fatiha", correct: false }, { text: "Al-Baqara", correct: false }, { text: "Al-Ikhlas", correct: true }, { text: "Al-Kawthar", correct: false }],
    explanation: "Le Prophète ﷺ a dit que la sourate Al-Ikhlas équivaut à un tiers du Coran en récompense.",
  },
  {
    id: "qur_017", category: "quran", type: "mcq", difficulty: 3,
    question: "Combien de prophètes sont mentionnés par leur nom dans le Coran ?",
    options: [{ text: "18", correct: false }, { text: "25", correct: true }, { text: "30", correct: false }, { text: "40", correct: false }],
  },
  {
    id: "qur_018", category: "quran", type: "mcq", difficulty: 3,
    question: "Dans quelle sourate Dieu s'adresse-t-il directement à Moïse (Moussa) ﷺ dans le Sinaï ?",
    options: [{ text: "Al-Baqara", correct: false }, { text: "Ta-Ha (sourate 20)", correct: true }, { text: "Al-Qasas", correct: false }, { text: "Al-A'raf", correct: false }],
  },
  {
    id: "qur_019", category: "quran", type: "mcq", difficulty: 2,
    question: "Que signifie le mot 'Coran' (القرآن) ?",
    options: [{ text: "Le livre sacré", correct: false }, { text: "La Parole de Dieu", correct: false }, { text: "Ce qui est lu / récitation", correct: true }, { text: "La lumière divine", correct: false }],
  },
  {
    id: "qur_020", category: "quran", type: "mcq", difficulty: 2,
    question: "Quelle est la sourate souvent appelée 'La Mère du Livre' (Umm al-Kitab) ?",
    options: [{ text: "Al-Baqara", correct: false }, { text: "Al-Fatiha", correct: true }, { text: "Ya-Sin", correct: false }, { text: "Al-Ikhlas", correct: false }],
  },
  {
    id: "qur_021", category: "quran", type: "mcq", difficulty: 3,
    question: "Quel verset coranique est le plus long ?",
    options: [{ text: "Ayat al-Kursi (Al-Baqara 255)", correct: false }, { text: "Al-Baqara 282 — le verset de la dette (Maïda)", correct: false }, { text: "Al-Baqara 282 — le verset de la dette", correct: true }, { text: "An-Nisa 11", correct: false }],
  },
  {
    id: "qur_022", category: "quran", type: "mcq", difficulty: 2,
    question: "Dans quelle sourate est narré l'histoire de Yusuf (Joseph) ﷺ dans sa totalité ?",
    options: [{ text: "Al-Anbiya", correct: false }, { text: "Yusuf (sourate 12)", correct: true }, { text: "Ibrahim", correct: false }, { text: "Al-Qasas", correct: false }],
    culturalCapsule: { title: "Sourate Yusuf — la plus belle des histoires", text: "Allah appelle cette sourate 'la plus belle des récits' (احسن القصص). Elle couvre la vie du prophète Yusuf (Joseph): la jalousie de ses frères, l'épreuve de la tentation, la prison, puis son ascension au rang de ministre d'Égypte." },
  },
  {
    id: "qur_023", category: "quran", type: "mcq", difficulty: 3,
    question: "Quelle sourate est spécialement recommandée lors des nuits de Laylat al-Qadr ?",
    options: [{ text: "Al-Fatiha", correct: false }, { text: "Al-Qadr (sourate 97)", correct: true }, { text: "Al-Duha", correct: false }, { text: "Al-Baqara", correct: false }],
  },
  {
    id: "qur_024", category: "quran", type: "mcq", difficulty: 3,
    question: "Combien de lettres moqatta'at (lettres initiales isolées) y a-t-il dans le Coran ?",
    options: [{ text: "10 lettres uniques", correct: false }, { text: "14 lettres uniques", correct: true }, { text: "18 lettres uniques", correct: false }, { text: "28 lettres uniques", correct: false }],
    explanation: "Il y a 29 sourates qui commencent par des lettres isolées, utilisant 14 lettres distinctes de l'alphabet arabe.",
  },
  {
    id: "qur_025", category: "quran", type: "mcq", difficulty: 2,
    question: "Quel prophète est mentionné le plus souvent dans le Coran par son nom ?",
    options: [{ text: "Muhammad ﷺ", correct: false }, { text: "Ibrahim ﷺ", correct: false }, { text: "Moussa (Moïse) ﷺ", correct: true }, { text: "Issa (Jésus) ﷺ", correct: false }],
    explanation: "Moussa est mentionné 136 fois dans le Coran, le plus souvent parmi tous les prophètes.",
  },
  {
    id: "qur_026", category: "quran", type: "mcq", difficulty: 3,
    question: "Quelle sourate contient la prière d'Ibrahim ﷺ pour La Mecque et ses habitants ?",
    options: [{ text: "Ibrahim (sourate 14)", correct: true }, { text: "Al-Baqara", correct: false }, { text: "Al-Hajj", correct: false }, { text: "As-Saffat", correct: false }],
  },
  {
    id: "qur_027", category: "quran", type: "mcq", difficulty: 2,
    question: "Combien y a-t-il de hizb (groupe de pages) dans le Coran ?",
    options: [{ text: "30", correct: false }, { text: "60", correct: true }, { text: "114", correct: false }, { text: "120", correct: false }],
  },
  {
    id: "qur_028", category: "quran", type: "mcq", difficulty: 3,
    question: "Dans quelle sourate est décrite en détail la nuit du Destin (Laylat al-Qadr) ?",
    options: [{ text: "Al-Qadr (97)", correct: true }, { text: "Ad-Dukhan (44)", correct: false }, { text: "Al-Qadr et Ad-Dukhan (les deux)", correct: false }, { text: "Al-Baqara", correct: false }],
  },
  {
    id: "qur_029", category: "quran", type: "mcq", difficulty: 4,
    question: "Quelle est la première sourate complète révélée au Prophète ﷺ selon l'opinion majoritaire ?",
    options: [{ text: "Al-Fatiha", correct: false }, { text: "Al-'Alaq", correct: false }, { text: "Al-Muddaththir ou Al-Fatiha selon les savants", correct: true }, { text: "Al-Muzzammil", correct: false }],
  },
  {
    id: "qur_030", category: "quran", type: "mcq", difficulty: 2,
    question: "Que signifie 'Hafiz' dans le contexte du Coran ?",
    options: [{ text: "Réciteur professionnel", correct: false }, { text: "Celui qui a mémorisé le Coran intégralement", correct: true }, { text: "Traducteur du Coran", correct: false }, { text: "Imam de mosquée", correct: false }],
    culturalCapsule: { title: "Le Hafiz — gardien du Coran", text: "Hafiz (حافظ) vient de la racine 'hifz' (préservation). Des millions de muslmans dans le monde mémorisent les 6236 versets du Coran. Cette tradition orale est unique dans l'histoire humaine et assure la préservation intégrale du texte sacré." },
  },
  {
    id: "qur_031", category: "quran", type: "mcq", difficulty: 3,
    question: "Quelle sourate coranique traite principalement de la hypocrisie (nifaq) ?",
    options: [{ text: "At-Tawba", correct: false }, { text: "Al-Munafiqun (sourate 63)", correct: true }, { text: "Al-Baqara", correct: false }, { text: "An-Nisa", correct: false }],
  },
  {
    id: "qur_032", category: "quran", type: "mcq", difficulty: 2,
    question: "Combien de fois le mot 'Alhamdulillah' (الحمد لله) apparaît-il dans le Coran ?",
    options: [{ text: "3 fois", correct: false }, { text: "5 fois", correct: true }, { text: "10 fois", correct: false }, { text: "14 fois", correct: false }],
  },
  {
    id: "qur_033", category: "quran", type: "mcq", difficulty: 3,
    question: "Dans quelle sourate se trouve le verset 'La religion aux yeux d'Allah est l'Islam' ?",
    options: [{ text: "Al-Baqara", correct: false }, { text: "Al-Imran (3:19)", correct: true }, { text: "An-Nisa", correct: false }, { text: "Al-Maïda", correct: false }],
  },
  {
    id: "qur_034", category: "quran", type: "mcq", difficulty: 2,
    question: "Que signifie 'Tajwid' (تجويد) dans la récitation du Coran ?",
    options: [{ text: "Mémorisation du Coran", correct: false }, { text: "Traduction du Coran", correct: false }, { text: "Règles de prononciation et embellissement de la récitation", correct: true }, { text: "Explication des versets (tafsir)", correct: false }],
  },
  {
    id: "qur_035", category: "quran", type: "mcq", difficulty: 4,
    question: "Quelle sourate coranique porte le nom d'une insecte ?",
    options: [{ text: "An-Nahl (L'Abeille, sourate 16)", correct: true }, { text: "Al-Fil (L'Éléphant)", correct: false }, { text: "An-Naml (La Fourmi, sourate 27)", correct: false }, { text: "Les deux — An-Nahl et An-Naml", correct: false }],
    explanation: "An-Nahl (Abeille) et An-Naml (Fourmi) sont toutes deux des insectes. An-Naml est aussi le nom d'une insecte (fourmi). La question portait sur une seule, An-Nahl est la plus connue.",
  },
  {
    id: "qur_036", category: "quran", type: "mcq", difficulty: 3,
    question: "Quel est le dernier verset révélé selon l'opinion de nombreux savants ?",
    options: [{ text: "Al-Maïda 5:3 — 'J'ai parachevé votre religion'", correct: true }, { text: "Al-Baqara 2:281", correct: false }, { text: "Al-Fatiha", correct: false }, { text: "An-Nasr 3", correct: false }],
  },
  {
    id: "qur_037", category: "quran", type: "mcq", difficulty: 2,
    question: "Combien de sourates du Coran portent le nom d'un prophète ?",
    options: [{ text: "4", correct: false }, { text: "6", correct: true }, { text: "8", correct: false }, { text: "10", correct: false }],
    explanation: "Yunus, Hud, Ibrahim, Yusuf, Muhammad et Nouh (Noé) — 6 sourates portent le nom d'un prophète.",
  },
  {
    id: "qur_038", category: "quran", type: "mcq", difficulty: 3,
    question: "Quelle est la signification de 'Tafsir' (تفسير) ?",
    options: [{ text: "Mémorisation du Coran", correct: false }, { text: "Exégèse et interprétation du Coran", correct: true }, { text: "Traduction du Coran", correct: false }, { text: "Récitation du Coran", correct: false }],
  },
  {
    id: "qur_039", category: "quran", type: "mcq", difficulty: 4,
    question: "Dans quelle sourate se trouve la prière d'Ibrahim ﷺ : 'Mon Seigneur, donne-moi la sagesse et joins-moi aux gens de bien' ?",
    options: [{ text: "Ibrahim (14)", correct: false }, { text: "Ash-Shu'ara (26:83)", correct: true }, { text: "As-Saffat (37)", correct: false }, { text: "Al-Anbiya (21)", correct: false }],
  },
  {
    id: "qur_040", category: "quran", type: "mcq", difficulty: 3,
    question: "Quelle sourate contient le verset des Lumières 'Allah est la lumière des cieux et de la terre' ?",
    options: [{ text: "Al-Nur (La Lumière, sourate 24)", correct: true }, { text: "Al-Isra (17)", correct: false }, { text: "Az-Zumar (39)", correct: false }, { text: "Al-Baqara", correct: false }],
    culturalCapsule: { title: "Verset des Lumières — Al-Nur 24:35", text: "Ce verset est l'un des plus médités du Coran. 'Allah est la lumière des cieux et de la terre. Sa lumière est comparable à une niche dans laquelle se trouve une lampe...' Il a inspiré d'innombrables mystiques, poètes et philosophes islamiques." },
  },
  {
    id: "qur_041", category: "quran", type: "mcq", difficulty: 2,
    question: "Combien d'années Noe (Nouh) ﷺ prêcha-t-il à son peuple selon le Coran ?",
    options: [{ text: "40 ans", correct: false }, { text: "100 ans", correct: false }, { text: "950 ans", correct: true }, { text: "200 ans", correct: false }],
    explanation: "Le Coran (29:14) indique que Nouh resta parmi son peuple 950 ans.",
  },
  {
    id: "qur_042", category: "quran", type: "mcq", difficulty: 3,
    question: "Quelle sourate décrit le Paradis avec l'expression 'jardins sous lesquels coulent les rivières' ?",
    options: [{ text: "Seulement Al-Baqara", correct: false }, { text: "Cette expression revient de nombreuses fois dans le Coran", correct: true }, { text: "Seulement Al-Fatiha", correct: false }, { text: "Seulement Al-Maïda", correct: false }],
  },
  {
    id: "qur_043", category: "quran", type: "mcq", difficulty: 3,
    question: "Dans quelle sourate se trouve l'histoire de Dhul-Qarnayn (Alexandre le Grand selon certains) ?",
    options: [{ text: "Yusuf", correct: false }, { text: "Al-Anbiya", correct: false }, { text: "Al-Kahf (sourate 18)", correct: true }, { text: "Al-Qasas", correct: false }],
  },
  {
    id: "qur_044", category: "quran", type: "mcq", difficulty: 2,
    question: "Que signifie Tajwid dans sa racine étymologique ?",
    options: [{ text: "Lire rapidement", correct: false }, { text: "Embellir, améliorer, perfectionner", correct: true }, { text: "Mémoriser", correct: false }, { text: "Comprendre", correct: false }],
  },
  {
    id: "qur_045", category: "quran", type: "mcq", difficulty: 4,
    question: "Quelle est la différence entre une sourate 'mecquoise' et une sourate 'médinoise' ?",
    options: [{ text: "Mecquoise = plus longue; médinoise = plus courte", correct: false }, { text: "Mecquoise = révélée avant la Hijra; médinoise = révélée après", correct: true }, { text: "Mecquoise = sur la foi; médinoise = sur les histoires", correct: false }, { text: "Pas de différence réelle", correct: false }],
    explanation: "Les sourates mecquoises (avant 622) traitent surtout de la foi (tawhid, eschatologie). Les médinoises (après 622) traitent des lois, relations sociales et communauté.",
  },
  {
    id: "qur_046", category: "quran", type: "mcq", difficulty: 3,
    question: "Quel est le nom du Coran récité en une seule nuit lors du Ramadan ?",
    options: [{ text: "Tarawih", correct: false }, { text: "Khatm al-Quran", correct: true }, { text: "Tahajjud", correct: false }, { text: "Qiyam al-layl", correct: false }],
    explanation: "Khatm al-Quran (ختم القرآن) désigne la complétion de la récitation du Coran en entier.",
  },
  {
    id: "qur_047", category: "quran", type: "mcq", difficulty: 3,
    question: "Quelle sourate est recommandée pour la protection le matin et le soir (selon la Sunna) ?",
    options: [{ text: "Al-Fatiha seulement", correct: false }, { text: "Al-Ikhlas, Al-Falaq et An-Nas (les mu'awwidhatayn + Al-Ikhlas)", correct: true }, { text: "Ya-Sin seulement", correct: false }, { text: "Al-Baqara seulement", correct: false }],
  },
  {
    id: "qur_048", category: "quran", type: "mcq", difficulty: 4,
    question: "Quelle sourate se termine par 'de la part de Dieu, le Puissant, le Sage' ?",
    options: [{ text: "Al-Hashr (59:24)", correct: true }, { text: "Al-Fatiha", correct: false }, { text: "Al-Maïda", correct: false }, { text: "Ya-Sin", correct: false }],
  },
  {
    id: "qur_049", category: "quran", type: "mcq", difficulty: 3,
    question: "Combien de noms d'Allah sont cités dans le Coran comme 'les plus beaux noms' ?",
    options: [{ text: "33", correct: false }, { text: "66", correct: false }, { text: "99", correct: true }, { text: "100", correct: false }],
    culturalCapsule: { title: "Les 99 Noms d'Allah — Al-Asma al-Husna", text: "Le Coran mentionne : 'Allah possède les plus beaux noms. Invoquez-Le par ces noms.' (7:180). Les savants ont identifié 99 noms, chacun décrivant un attribut divin. Parmi les plus connus : Ar-Rahman (Le Miséricordieux), Al-Quddus (Le Saint), Al-Hakim (Le Sage)." },
  },
  {
    id: "qur_050", category: "quran", type: "mcq", difficulty: 2,
    question: "Quelle est la dernière sourate du Coran ?",
    options: [{ text: "Al-Ikhlas", correct: false }, { text: "Al-Falaq", correct: false }, { text: "An-Nas", correct: true }, { text: "Al-Kawthar", correct: false }],
    explanation: "An-Nas (Les Hommes, sourate 114) est la dernière sourate. Avec Al-Falaq, elles forment les 'Mu'awwidhatain' — les deux sourates de refuge.",
  },

  // ── DRAG & DROP — remettre dans l'ordre ──────────────────────
  {
    id: "drag_001", category: "religion", type: "drag_drop", difficulty: 2,
    question: "Remets les piliers de l'Islam dans l'ordre canonique",
    options: [
      { text: "Shahada (Témoignage)", correct: false, position: 0 },
      { text: "Salat (Prière)", correct: false, position: 1 },
      { text: "Zakat (Aumône)", correct: false, position: 2 },
      { text: "Sawm (Jeûne)", correct: false, position: 3 },
      { text: "Hajj (Pèlerinage)", correct: false, position: 4 },
    ],
    minigameData: { items: ["Sawm (Jeûne)", "Hajj (Pèlerinage)", "Shahada (Témoignage)", "Salat (Prière)", "Zakat (Aumône)"] },
  },
  {
    id: "drag_002", category: "history", type: "drag_drop", difficulty: 2,
    question: "Remets les 4 califes bien guidés dans l'ordre chronologique",
    options: [
      { text: "Abu Bakr", correct: false, position: 0 },
      { text: "Omar ibn al-Khattab", correct: false, position: 1 },
      { text: "Othman ibn Affan", correct: false, position: 2 },
      { text: "Ali ibn Abi Talib", correct: false, position: 3 },
    ],
    minigameData: { items: ["Ali ibn Abi Talib", "Abu Bakr", "Othman ibn Affan", "Omar ibn al-Khattab"] },
  },
  {
    id: "drag_003", category: "religion", type: "drag_drop", difficulty: 3,
    question: "Remets les mois du calendrier hijri dans l'ordre (les 4 premiers)",
    options: [
      { text: "Mouharram", correct: false, position: 0 },
      { text: "Safar", correct: false, position: 1 },
      { text: "Rabi al-Awwal", correct: false, position: 2 },
      { text: "Rabi al-Thani", correct: false, position: 3 },
    ],
    minigameData: { items: ["Rabi al-Thani", "Mouharram", "Rabi al-Awwal", "Safar"] },
  },
  {
    id: "drag_004", category: "quran", type: "drag_drop", difficulty: 2,
    question: "Remets dans l'ordre les sourates du Coran par numéro (les 4 premières)",
    options: [
      { text: "Al-Fatiha (1)", correct: false, position: 0 },
      { text: "Al-Baqara (2)", correct: false, position: 1 },
      { text: "Al-Imran (3)", correct: false, position: 2 },
      { text: "An-Nisa (4)", correct: false, position: 3 },
    ],
    minigameData: { items: ["An-Nisa (4)", "Al-Baqara (2)", "Al-Fatiha (1)", "Al-Imran (3)"] },
  },
  {
    id: "drag_005", category: "arabic", type: "drag_drop", difficulty: 3,
    question: "Remets les lettres de l'alphabet arabe dans l'ordre (les 4 premières)",
    options: [
      { text: "ا (Alif)", correct: false, position: 0 },
      { text: "ب (Ba)", correct: false, position: 1 },
      { text: "ت (Ta)", correct: false, position: 2 },
      { text: "ث (Tha)", correct: false, position: 3 },
    ],
    minigameData: { items: ["ت (Ta)", "ب (Ba)", "ث (Tha)", "ا (Alif)"] },
  },

  // ── FILL VERSE — compléter le verset ─────────────────────────
  {
    id: "fill_001", category: "quran", type: "fill_verse", difficulty: 2,
    question: "بِسْمِ اللَّهِ ___ الرَّحِيمِ",
    options: [
      { text: "الرَّحْمَنِ", correct: true },
      { text: "الْكَرِيمِ", correct: false },
      { text: "الْعَظِيمِ", correct: false },
      { text: "الْحَلِيمِ", correct: false },
    ],
    minigameData: { verse: "بِسْمِ اللَّهِ ___ الرَّحِيمِ" },
    explanation: "La Basmala complète : 'Bismi Allahi ar-Rahmani ar-Rahimi' — Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.",
  },
  {
    id: "fill_002", category: "quran", type: "fill_verse", difficulty: 2,
    question: "الْحَمْدُ لِلَّهِ ___ الْعَالَمِينَ",
    options: [
      { text: "رَبِّ", correct: true },
      { text: "مَالِكِ", correct: false },
      { text: "إِلَٰهِ", correct: false },
      { text: "نُورِ", correct: false },
    ],
    minigameData: { verse: "الْحَمْدُ لِلَّهِ ___ الْعَالَمِينَ" },
    explanation: "Al-Fatiha 1:2 — 'Louange à Allah, Seigneur des mondes'",
  },
  {
    id: "fill_003", category: "quran", type: "fill_verse", difficulty: 3,
    question: "قُلْ هُوَ اللَّهُ ___",
    options: [
      { text: "أَحَدٌ", correct: true },
      { text: "عَظِيمٌ", correct: false },
      { text: "كَرِيمٌ", correct: false },
      { text: "وَاحِدٌ", correct: false },
    ],
    minigameData: { verse: "قُلْ هُوَ اللَّهُ ___" },
    explanation: "Al-Ikhlas 112:1 — 'Dis : Il est Allah, l'Unique.'",
    culturalCapsule: {
      title: "Sourate Al-Ikhlas — un tiers du Coran",
      text: "Le Prophète ﷺ a dit que cette sourate vaut un tiers du Coran en terme de récompense. Elle définit le Tawhid en 4 versets : unicité, éternité, sans père ni fils, sans égal.",
    },
  },
  {
    id: "fill_004", category: "religion", type: "fill_verse", difficulty: 2,
    question: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ ___",
    options: [
      { text: "مَا نَوَى", correct: true },
      { text: "مَا عَمِلَ", correct: false },
      { text: "مَا قَصَدَ", correct: false },
      { text: "مَا أَرَادَ", correct: false },
    ],
    minigameData: { verse: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ ___" },
    explanation: "Premier hadith de Boukhâri et Mouslim : 'Les actes ne valent que par les intentions, et chacun n'obtiendra que ce qu'il a eu l'intention de faire.'",
  },
  {
    id: "fill_005", category: "quran", type: "fill_verse", difficulty: 3,
    question: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا ___",
    options: [
      { text: "لِيَعْبُدُونِ", correct: true },
      { text: "لِيُؤْمِنُوا", correct: false },
      { text: "لِيَعْلَمُوا", correct: false },
      { text: "لِيَشْكُرُوا", correct: false },
    ],
    minigameData: { verse: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا ___" },
    explanation: "Adh-Dhariyat 51:56 — 'Je n'ai créé les djinns et les hommes que pour qu'ils M'adorent.'",
  },

  // ── WHO AM I — personnages historiques ───────────────────────
  {
    id: "who_001", category: "history", type: "who_am_i", difficulty: 3,
    question: "Qui suis-je ? (indice 1)",
    options: [
      { text: "Al-Khwarizmi", correct: true },
      { text: "Ibn Sina", correct: false },
      { text: "Al-Idrissi", correct: false },
      { text: "Ibn Rushd", correct: false },
    ],
    minigameData: {
      clues: [
        "Je suis né en Ouzbékistan vers 780 ap. J-C.",
        "J'ai travaillé à la Maison de la Sagesse de Bagdad.",
        "Mon nom donné en latin est devenu le mot 'algorithme'.",
        "Mon traité 'Al-jabr wa-l-muqabala' a donné le mot 'algèbre'.",
      ],
    },
    culturalCapsule: {
      title: "Al-Khwarizmi — père des mathématiques modernes",
      text: "Muhammad ibn Musa al-Khwarizmi (780-850) a révolutionné les mathématiques avec l'algèbre et la généralisation du système décimal indien en Europe. Son nom latinisé 'Algoritmi' a donné 'algorithme' — le mot fondateur de l'informatique moderne.",
    },
  },
  {
    id: "who_002", category: "history", type: "who_am_i", difficulty: 3,
    question: "Qui suis-je ? (indice 1)",
    options: [
      { text: "Ibn Battuta", correct: true },
      { text: "Al-Idrissi", correct: false },
      { text: "Ibn Khaldoun", correct: false },
      { text: "Mansa Musa", correct: false },
    ],
    minigameData: {
      clues: [
        "Je suis né à Tanger au Maroc en 1304.",
        "J'ai voyagé pendant 29 ans sans interruption.",
        "J'ai parcouru plus de 120 000 km, soit plus que Marco Polo.",
        "Mon livre de voyage s'appelle 'La Rihla' (le voyage).",
      ],
    },
    culturalCapsule: {
      title: "Ibn Battuta — le plus grand voyageur de l'histoire médiévale",
      text: "Né à Tanger en 1304, Ibn Battuta parcourut l'Afrique, le Moyen-Orient, l'Inde, la Chine et le Mali. Ses récits détaillés dans la Rihla constituent une source historique inestimable sur le monde du XIVe siècle.",
    },
  },
  {
    id: "who_003", category: "history", type: "who_am_i", difficulty: 3,
    question: "Qui suis-je ? (indice 1)",
    options: [
      { text: "Ibn Sina", correct: true },
      { text: "Al-Razi", correct: false },
      { text: "Ibn Rushd", correct: false },
      { text: "Al-Khwarizmi", correct: false },
    ],
    minigameData: {
      clues: [
        "J'ai écrit mon premier livre de médecine à l'âge de 16 ans.",
        "Les Latins m'appelaient 'Avicenne'.",
        "J'ai rédigé le 'Canon de la médecine', utilisé en Europe jusqu'au XVIIe siècle.",
        "Je suis né à Boukhara (Ouzbékistan actuel) en 980.",
      ],
    },
    culturalCapsule: {
      title: "Ibn Sina — prince des médecins",
      text: "Abu Ali Sina (980-1037) fut médecin, philosophe, astronome et poète. Son Canon de la médecine (Al-Qanun fi't-Tibb) recense 760 médicaments et décrit de nombreuses maladies. Traduit en latin au XIIe siècle, il fut le manuel de référence des facultés de médecine européennes pendant 600 ans.",
    },
  },
  {
    id: "who_004", category: "religion", type: "who_am_i", difficulty: 2,
    question: "Qui suis-je ? (indice 1)",
    options: [
      { text: "Omar ibn al-Khattab", correct: true },
      { text: "Abu Bakr as-Siddiq", correct: false },
      { text: "Ali ibn Abi Talib", correct: false },
      { text: "Othman ibn Affan", correct: false },
    ],
    minigameData: {
      clues: [
        "Je suis le 2e calife bien guidé de l'Islam.",
        "Je suis surnommé 'Al-Faruq' (celui qui distingue le vrai du faux).",
        "Sous mon règne, l'Empire islamique s'est étendu jusqu'en Perse et en Égypte.",
        "Le Prophète ﷺ a dit : 'Si un prophète venait après moi, ce serait Omar'.",
      ],
    },
  },
  {
    id: "who_005", category: "history", type: "who_am_i", difficulty: 3,
    question: "Qui suis-je ? (indice 1)",
    options: [
      { text: "Ibn Khaldoun", correct: true },
      { text: "Ibn Battuta", correct: false },
      { text: "Al-Idrissi", correct: false },
      { text: "Ibn Rushd", correct: false },
    ],
    minigameData: {
      clues: [
        "Je suis né à Tunis en 1332.",
        "J'ai servi comme ambassadeur auprès de Tamerlan en 1401.",
        "Ma 'Muqaddima' est considérée comme le premier traité de sociologie.",
        "J'ai développé la théorie de la 'Assabiyya' (cohésion sociale) pour expliquer la montée et la chute des civilisations.",
      ],
    },
    culturalCapsule: {
      title: "Ibn Khaldoun — père de la sociologie",
      text: "Abd ar-Rahman ibn Khaldoun (1332-1406) fut le premier penseur à analyser scientifiquement les lois du changement social. Sa 'Assabiyya' (solidarité tribale) explique comment les empires naissent de l'esprit de groupe, prospèrent puis déclinent dans le luxe. Ses idées anticipent Montesquieu, Marx et Toynbee de 4 siècles.",
    },
  },

  // ── MEMORY — trouver les paires ──────────────────────────────
  {
    id: "mem_001", category: "quran", type: "memory", difficulty: 2,
    question: "Associe les sourates à leurs numéros",
    options: [{ text: "memory", correct: true }],
    minigameData: {
      pairs: [
        { front: "الفاتحة", back: "Sourate 1" },
        { front: "البقرة", back: "Sourate 2" },
        { front: "الإخلاص", back: "Sourate 112" },
        { front: "الناس", back: "Sourate 114" },
        { front: "يس", back: "Sourate 36" },
        { front: "الكهف", back: "Sourate 18" },
      ],
    },
  },
  {
    id: "mem_002", category: "history", type: "memory", difficulty: 3,
    question: "Associe les savants à leurs spécialités",
    options: [{ text: "memory", correct: true }],
    minigameData: {
      pairs: [
        { front: "Al-Khwarizmi", back: "Algèbre & Maths" },
        { front: "Ibn Sina", back: "Médecine" },
        { front: "Ibn Khaldoun", back: "Sociologie" },
        { front: "Al-Idrissi", back: "Cartographie" },
        { front: "Ibn Rushd", back: "Philosophie" },
        { front: "Ahmad Baba", back: "Manuscrits Tombouctou" },
      ],
    },
  },
  {
    id: "mem_003", category: "religion", type: "memory", difficulty: 2,
    question: "Associe les piliers de l'Islam à leur signification",
    options: [{ text: "memory", correct: true }],
    minigameData: {
      pairs: [
        { front: "الشهادة", back: "Témoignage de foi" },
        { front: "الصلاة", back: "Prière 5x/jour" },
        { front: "الزكاة", back: "Aumône légale" },
        { front: "الصوم", back: "Jeûne du Ramadan" },
        { front: "الحج", back: "Pèlerinage à La Mecque" },
      ],
    },
  },
  {
    id: "mem_004", category: "arabic", type: "memory", difficulty: 2,
    question: "Associe les lettres arabes à leur translittération",
    options: [{ text: "memory", correct: true }],
    minigameData: {
      pairs: [
        { front: "ا", back: "A (Alif)" },
        { front: "ب", back: "B (Ba)" },
        { front: "ج", back: "J (Jim)" },
        { front: "د", back: "D (Dal)" },
        { front: "ر", back: "R (Ra)" },
        { front: "م", back: "M (Mim)" },
      ],
    },
  },

  // ── NOUVELLES MCQ — enrichissement ──────────────────────────
  {
    id: "rel_new_001", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel est le sens du mot 'Islam' en arabe ?",
    options: [
      { text: "Soumission à la volonté d'Allah", correct: true },
      { text: "Paix universelle", correct: false },
      { text: "Foi et dévotion", correct: false },
      { text: "Chemin de vérité", correct: false },
    ],
    explanation: "Islam vient de la racine arabe S-L-M (سلم) qui signifie 'paix' et 'soumission'. Être musulman, c'est être en paix par la soumission à Allah.",
  },
  {
    id: "rel_new_002", category: "religion", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que la 'Sunna' du Prophète ﷺ ?",
    options: [
      { text: "L'ensemble de ses paroles, actes et approbations tacites", correct: true },
      { text: "Uniquement ses hadiths écrits", correct: false },
      { text: "Les pratiques des compagnons uniquement", correct: false },
      { text: "La deuxième source après le Coran", correct: false },
    ],
    explanation: "La Sunna englobe tout ce que le Prophète ﷺ a dit (qawl), fait (fi'l) ou approuvé silencieusement (taqrir). Elle est la deuxième source de droit islamique après le Coran.",
  },
  {
    id: "his_new_001", category: "history", type: "mcq", difficulty: 2,
    question: "L'Al-Qarawiyyin de Fès est considérée comme :",
    options: [
      { text: "La plus ancienne université au monde en activité", correct: true },
      { text: "La plus grande mosquée d'Afrique", correct: false },
      { text: "Le premier centre de calligraphie islamique", correct: false },
      { text: "La principale madrasa almohade", correct: false },
    ],
    culturalCapsule: {
      title: "Al-Qarawiyyin — la plus ancienne université du monde",
      text: "Fondée en 859 à Fès par Fatima al-Fihri, une femme tunisienne, Al-Qarawiyyin est reconnue par le Guinness Book comme la plus ancienne université en activité continue. Ibn Khaldoun, Al-Idrissi et le pape Sylvestre II (qui introduisit les chiffres arabes en Europe) y ont étudié.",
    },
  },
  {
    id: "his_new_002", category: "history", type: "mcq", difficulty: 3,
    question: "Qui a fondé Al-Qarawiyyin, la plus ancienne université du monde ?",
    options: [
      { text: "Fatima al-Fihri", correct: true },
      { text: "Ibn Toumert", correct: false },
      { text: "Moulay Idriss II", correct: false },
      { text: "Al-Idrissi", correct: false },
    ],
    explanation: "Fatima al-Fihri (800-880), fille d'un riche marchand tunisien émigré à Fès, fonda Al-Qarawiyyin en 859 avec son héritage. Sa sœur Maryam fonda la mosquée des Andalous dans la même ville.",
  },
  {
    id: "arabic_new_001", category: "arabic", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'merci' en arabe classique ?",
    options: [
      { text: "شُكْراً (Shukran)", correct: true },
      { text: "مَرْحَباً (Marhaban)", correct: false },
      { text: "صَبَاحُ الْخَيْرِ (Sabah al-khayr)", correct: false },
      { text: "يَسْلَمُو (Yeslamu)", correct: false },
    ],
  },
  {
    id: "arabic_new_002", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie 'Insha'Allah' (إن شاء الله) ?",
    options: [
      { text: "Si Allah le veut", correct: true },
      { text: "Grâce à Allah", correct: false },
      { text: "Allah est grand", correct: false },
      { text: "Avec la permission d'Allah", correct: false },
    ],
    explanation: "Expression coranique (Coran 18:23-24) signifiant 'Si Allah le veut' — utilisée pour tout projet futur, rappel que le futur appartient à Allah.",
  },
  {
    id: "dar_new_001", category: "darija", type: "mcq", difficulty: 1,
    question: "Comment dit-on 'bonjour' en darija marocain ?",
    options: [
      { text: "صباح الخير (Sbah l-kheir)", correct: true },
      { text: "مرحبا (Mrhba)", correct: false },
      { text: "لا باس (La bas)", correct: false },
      { text: "كيفاش (Kifash)", correct: false },
    ],
    explanation: "'Sbah l-kheir' est le bonjour du matin (littéralement 'matin de bien'). On répond 'Sbah n-nour' (matin de lumière).",
  },
  {
    id: "dar_new_002", category: "darija", type: "mcq", difficulty: 2,
    question: "Que veut dire 'Hamdoullah' (حمدولله) en darija ?",
    options: [
      { text: "Louange à Allah / tout va bien", correct: true },
      { text: "S'il vous plaît", correct: false },
      { text: "Au nom de Dieu", correct: false },
      { text: "Avec votre permission", correct: false },
    ],
    explanation: "Contraction de 'Al-hamdulillah'. Utilisé pour dire que tout va bien, exprimer la gratitude, ou répondre à 'Comment tu vas ?'.",
  },
  {
    id: "qur_new_001", category: "quran", type: "mcq", difficulty: 3,
    question: "Quel prophète est mentionné le plus de fois dans le Coran ?",
    options: [
      { text: "Musa (Moïse)", correct: true },
      { text: "Ibrahim (Abraham)", correct: false },
      { text: "Muhammad ﷺ", correct: false },
      { text: "Issa (Jésus)", correct: false },
    ],
    culturalCapsule: {
      title: "Musa — le prophète le plus cité du Coran",
      text: "Musa (Moïse) est mentionné 136 fois dans 36 sourates, plus que tout autre prophète. Son histoire avec Pharaon est un archétype de la lutte entre foi et tyrannie. Le Coran y revient pour enseigner la persévérance, la confiance en Allah et la libération des opprimés.",
    },
  },
  {
    id: "qur_new_002", category: "quran", type: "mcq", difficulty: 2,
    question: "Quelle est la plus longue sourate du Coran ?",
    options: [
      { text: "Al-Baqara (La Vache) — 286 versets", correct: true },
      { text: "Al-Imran — 200 versets", correct: false },
      { text: "An-Nisa — 176 versets", correct: false },
      { text: "Al-Maidah — 120 versets", correct: false },
    ],
    explanation: "Al-Baqara (Sourate 2) contient 286 versets dont le verset du Trône (Ayat al-Kursi, v.255) et les deux derniers versets (Amana ar-Rassul…) qui valent un tiers du Coran selon certains hadiths.",
  },
];

export function getQuestions(count = 10, history: Record<string, { nextDue: string }> = {}): Question[] {
  const today = new Date().toISOString().split("T")[0];

  // Priority 1: due questions (seen before, due today)
  const due = QUESTIONS.filter(q => {
    const h = history[q.id];
    return h && h.nextDue <= today;
  });

  // Priority 2: unseen questions
  const unseen = QUESTIONS.filter(q => !history[q.id]);

  // Mix and cap
  const pool: Question[] = [];
  for (const q of due)   if (pool.length < Math.ceil(count * 0.4)) pool.push(q);
  for (const q of unseen) if (pool.length < count) pool.push(q);

  // Fill remainder from all questions
  if (pool.length < count) {
    for (const q of QUESTIONS) {
      if (!pool.find(p => p.id === q.id)) pool.push(q);
      if (pool.length >= count) break;
    }
  }

  // Shuffle
  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}
