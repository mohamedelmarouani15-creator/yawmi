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
    eventId: "arc_moussa",
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
    options: [{ text: "Ayat al-Kursi (Al-Baqara 255)", correct: false }, { text: "Al-Baqara 282 — le verset de la dette (plus de 50 mots)", correct: true }, { text: "An-Nisa 11 — les règles d'héritage", correct: false }, { text: "Al-Baqara 233 — l'allaitement", correct: false }],
  },
  {
    id: "qur_022", category: "quran", type: "mcq", difficulty: 2,
    question: "Dans quelle sourate est narré l'histoire de Yusuf (Joseph) ﷺ dans sa totalité ?",
    options: [{ text: "Al-Anbiya", correct: false }, { text: "Yusuf (sourate 12)", correct: true }, { text: "Ibrahim", correct: false }, { text: "Al-Qasas", correct: false }],
    culturalCapsule: { title: "Sourate Yusuf — la plus belle des histoires", text: "Allah appelle cette sourate 'la plus belle des récits' (احسن القصص). Elle couvre la vie du prophète Yusuf (Joseph): la jalousie de ses frères, l'épreuve de la tentation, la prison, puis son ascension au rang de ministre d'Égypte." },
    eventId: "arc_yusuf",
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
    eventId: "arc_ibrahim",
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
    question: "Quelles sourates coraniques portent le nom d'un insecte ?",
    options: [{ text: "An-Nahl (L'Abeille, 16) seulement", correct: false }, { text: "An-Naml (La Fourmi, 27) seulement", correct: false }, { text: "Al-Fil (L'Éléphant) — ce n'est pas un insecte", correct: false }, { text: "An-Nahl (16) et An-Naml (27) — toutes deux", correct: true }],
    explanation: "An-Nahl (abeille, sourate 16) et An-Naml (fourmi, sourate 27) portent toutes deux le nom d'un insecte.",
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
      { text: "الرَّحْمَنِ", correct: true,  transliteration: "ar-Rahmāni [le Tout Miséricordieux]" },
      { text: "الْكَرِيمِ",  correct: false, transliteration: "al-Karīmi [le Généreux]" },
      { text: "الْعَظِيمِ",  correct: false, transliteration: "al-'Azīmi [le Très Grand]" },
      { text: "الْحَلِيمِ",  correct: false, transliteration: "al-Halīmi [le Doux]" },
    ],
    minigameData: {
      verse: "بِسْمِ اللَّهِ ___ الرَّحِيمِ",
      verseTranslit: "Bismi Allāhi ___ ar-Rahīmi",
    },
    explanation: "La Basmala complète : 'Bismi Allahi ar-Rahmani ar-Rahimi' — Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.",
    arabicRequired: "none",
  },
  {
    id: "fill_002", category: "quran", type: "fill_verse", difficulty: 2,
    question: "الْحَمْدُ لِلَّهِ ___ الْعَالَمِينَ",
    options: [
      { text: "رَبِّ",   correct: true,  transliteration: "Rabbi [Seigneur de]" },
      { text: "مَالِكِ", correct: false, transliteration: "Māliki [Maître de]" },
      { text: "إِلَٰهِ", correct: false, transliteration: "Ilāhi [Dieu de]" },
      { text: "نُورِ",   correct: false, transliteration: "Nūri [Lumière de]" },
    ],
    minigameData: {
      verse: "الْحَمْدُ لِلَّهِ ___ الْعَالَمِينَ",
      verseTranslit: "Al-hamdu li-Llāhi ___ al-'ālamīn",
    },
    explanation: "Al-Fatiha 1:2 — 'Louange à Allah, Seigneur des mondes'",
    arabicRequired: "none",
  },
  {
    id: "fill_003", category: "quran", type: "fill_verse", difficulty: 3,
    question: "قُلْ هُوَ اللَّهُ ___",
    options: [
      { text: "أَحَدٌ",  correct: true,  transliteration: "Ahadun [l'Unique]" },
      { text: "عَظِيمٌ", correct: false, transliteration: "'Azīmun [le Très Grand]" },
      { text: "كَرِيمٌ", correct: false, transliteration: "Karīmun [le Généreux]" },
      { text: "وَاحِدٌ", correct: false, transliteration: "Wāhidun [l'Un]" },
    ],
    minigameData: {
      verse: "قُلْ هُوَ اللَّهُ ___",
      verseTranslit: "Qul huwa Allāhu ___",
    },
    explanation: "Al-Ikhlas 112:1 — 'Dis : Il est Allah, l'Unique.'",
    culturalCapsule: {
      title: "Sourate Al-Ikhlas — un tiers du Coran",
      text: "Le Prophète ﷺ a dit que cette sourate vaut un tiers du Coran en terme de récompense. Elle définit le Tawhid en 4 versets : unicité, éternité, sans père ni fils, sans égal.",
    },
    arabicRequired: "none",
  },
  {
    id: "fill_004", category: "religion", type: "fill_verse", difficulty: 2,
    question: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ ___",
    options: [
      { text: "مَا نَوَى",   correct: true,  transliteration: "mā nawā [ce qu'il a eu l'intention]" },
      { text: "مَا عَمِلَ",  correct: false, transliteration: "mā 'amila [ce qu'il a fait]" },
      { text: "مَا قَصَدَ",  correct: false, transliteration: "mā qasada [ce qu'il a visé]" },
      { text: "مَا أَرَادَ", correct: false, transliteration: "mā arāda [ce qu'il a voulu]" },
    ],
    minigameData: {
      verse: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ ___",
      verseTranslit: "Innamā al-a'mālu bi-n-niyyāt, wa innamā li-kulli imri'in ___",
    },
    explanation: "Premier hadith de Boukhâri et Mouslim : 'Les actes ne valent que par les intentions, et chacun n'obtiendra que ce qu'il a eu l'intention de faire.'",
    arabicRequired: "none",
  },
  {
    id: "fill_005", category: "quran", type: "fill_verse", difficulty: 3,
    question: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا ___",
    options: [
      { text: "لِيَعْبُدُونِ", correct: true,  transliteration: "liya'budūni [pour qu'ils M'adorent]" },
      { text: "لِيُؤْمِنُوا",  correct: false, transliteration: "liyu'minū [pour qu'ils croient]" },
      { text: "لِيَعْلَمُوا",  correct: false, transliteration: "liya'lamū [pour qu'ils sachent]" },
      { text: "لِيَشْكُرُوا", correct: false, transliteration: "liyashkurū [pour qu'ils soient reconnaissants]" },
    ],
    minigameData: {
      verse: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا ___",
      verseTranslit: "Wa mā khalaqtu al-jinna wa-l-insa illā ___",
    },
    explanation: "Adh-Dhariyat 51:56 — 'Je n'ai créé les djinns et les hommes que pour qu'ils M'adorent.'",
    arabicRequired: "none",
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
    arabicRequired: "beginner",
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
    arabicRequired: "beginner",
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

  // ── CALLIGRAPHIE AU DOIGT ─────────────────────────────────────
  {
    id: "cal_001", category: "arabic", type: "calligraphy", difficulty: 2,
    question: "Trace la lettre : ا (Alif)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "ا",
      letterTranslit: "Alif — prononcé [a] ou [ā]",
      strokeHints: ["Un seul trait vertical de haut en bas", "Commence en haut, descends droit"],
      passCoverage: 0.35,
    },
    culturalCapsule: {
      title: "Alif — première lettre de l'alphabet arabe",
      text: "L'Alif (ا) est la première lettre de l'alphabet arabe. Elle symbolise l'unicité — un seul trait droit. Dans le style Thuluth, l'Alif peut mesurer 7 fois la hauteur d'un point de calame.",
    },
  },
  {
    id: "cal_002", category: "arabic", type: "calligraphy", difficulty: 2,
    question: "Trace la lettre : م (Mim)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "م",
      letterTranslit: "Mim — prononcé [m]",
      strokeHints: ["Petit cercle fermé en bas à gauche", "Courbe vers la droite puis queue vers le bas"],
      passCoverage: 0.38,
    },
  },
  {
    id: "cal_003", category: "arabic", type: "calligraphy", difficulty: 3,
    question: "Trace le mot : الله",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "الله",
      letterTranslit: "Allah [al-lāh] — le nom de Dieu",
      strokeHints: ["Alif (ا) en haut à droite", "Double Lam (لل) en courbe", "Ha (ه) en boucle à gauche"],
      passCoverage: 0.40,
    },
    culturalCapsule: {
      title: "الله — la calligraphie la plus sacrée",
      text: "Le nom d'Allah en Thuluth avec ses ligatures secrètes a inspiré des générations de calligraphes depuis le VIIe siècle. Chaque trait est une méditation sur l'unicité divine.",
    },
  },
  {
    id: "cal_004", category: "arabic", type: "calligraphy", difficulty: 2,
    question: "Trace la lettre : ب (Ba)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "ب",
      letterTranslit: "Ba — prononcé [b]",
      strokeHints: ["Ligne horizontale légèrement courbée vers le bas", "Un point en dessous à gauche"],
      passCoverage: 0.35,
    },
    explanation: "Le Ba (ب) est la 2e lettre. La Basmala commence par Bsm (بسم) — 'Au nom de'.",
  },
  {
    id: "cal_005", category: "arabic", type: "calligraphy", difficulty: 2,
    question: "Trace la lettre : ن (Noun)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "ن",
      letterTranslit: "Noun — prononcé [n]",
      strokeHints: ["Arc de cercle ouvert vers le haut", "Un point au centre en dessus"],
      passCoverage: 0.35,
    },
    culturalCapsule: {
      title: "Noun — la lettre de la lumière",
      text: "Le Noun (ن) ouvre la sourate Al-Qalam (68:1) : 'Noun. Par le calame et ce qu'ils écrivent.' Les calligraphes y voient un encrier — le récipient de la connaissance.",
    },
  },
  {
    id: "cal_006", category: "arabic", type: "calligraphy", difficulty: 1,
    question: "Trace la lettre : و (Waw)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "و",
      letterTranslit: "Waw — prononcé [w] ou [ū]",
      strokeHints: ["Petit cercle en haut à droite", "Queue qui descend et part vers la gauche"],
      passCoverage: 0.32,
    },
    explanation: "Waw (و) est aussi la conjonction 'et'. En abjad, elle vaut 6.",
  },
  {
    id: "cal_007", category: "arabic", type: "calligraphy", difficulty: 3,
    question: "Trace le mot : نور (Nour — lumière)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "نور",
      letterTranslit: "Nūr [noûr] — lumière",
      strokeHints: ["Noun (ن) : arc avec point", "Waw (و) : boucle avec queue", "Ra (ر) : courbe vers le bas"],
      passCoverage: 0.38,
    },
    culturalCapsule: {
      title: "النور — la sourate de la Lumière",
      text: "An-Nur 24:35 : 'Allah est la Lumière des cieux et de la terre.' Ce verset a inspiré l'un des chefs-d'œuvre de la calligraphie islamique.",
    },
  },
  {
    id: "cal_008", category: "arabic", type: "calligraphy", difficulty: 3,
    question: "Trace le mot : بسم (Bism — au nom de)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "بسم",
      letterTranslit: "Bism [biss-m] — au nom de",
      strokeHints: ["Ba (ب) : trait horizontal avec point", "Sin (س) : trois dents", "Mim (م) : boucle avec queue"],
      passCoverage: 0.38,
    },
  },

  // ── ÈRE IV — Les Empires ────────────────────────────────────────
  {
    id: "ere4_001", category: "history", type: "mcq", difficulty: 3,
    question: "Quel sultan ottoman conquit Constantinople et à quel âge ?",
    options: [
      { text: "Suleiman Ier, 28 ans",    correct: false },
      { text: "Mehmed II, 21 ans",        correct: true  },
      { text: "Selim Ier, 35 ans",        correct: false },
      { text: "Bayezid II, 42 ans",       correct: false },
    ],
    explanation: "Mehmed II (El-Fatih / le Conquérant) prit Constantinople à 21 ans en 1453, après 53 jours de siège. Il fit transformer Sainte-Sophie en mosquée et Istanbul devint la nouvelle capitale ottomane.",
  },
  {
    id: "ere4_002", category: "history", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que le 'Kanun' dans l'empire ottoman de Suleiman Ier ?",
    options: [
      { text: "Le titre du chef militaire",              correct: false },
      { text: "Un code de lois laïques parallèle à la charia", correct: true  },
      { text: "Le palais principal d'Istanbul",          correct: false },
      { text: "La langue administrative officielle",     correct: false },
    ],
    culturalCapsule: { title: "Suleiman 'al-Qanuni' — le Législateur", text: "Suleiman Ier (1520-1566) fut surnommé Al-Qanuni (le Législateur) pour avoir codifié le droit ottoman. Le Kanun complétait la charia avec des lois administratives, fiscales et pénales. Cette dualité droit religieux/droit laïque est caractéristique de l'empire ottoman à son apogée." },
  },
  {
    id: "ere4_003", category: "history", type: "mcq", difficulty: 4,
    question: "Qui était Roxelane (Hürrem Sultan) dans l'empire ottoman ?",
    options: [
      { text: "La mère de Mehmed II le Conquérant",       correct: false },
      { text: "L'épouse esclave d'origine ruthène devenue épouse légale de Suleiman Ier", correct: true  },
      { text: "La première sultane valide (mère régnante)", correct: false },
      { text: "Une princesse byzantine qui se convertit",  correct: false },
    ],
    explanation: "Hürrem Sultan (née Alexandra Lisowska, vers 1502-1558) fut une esclave ukrainienne devenue l'épouse légale de Suleiman Ier — chose inédite. Elle exercea une influence politique considérable et fut détestée par les Janissaires.",
  },
  {
    id: "ere4_004", category: "history", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que les 'Janissaires' dans l'empire ottoman ?",
    options: [
      { text: "Les juges religieux du calife",                             correct: false },
      { text: "L'infanterie d'élite ottomane composée d'anciens esclaves chrétiens convertis", correct: true  },
      { text: "Les négociants du Grand Bazar d'Istanbul",                  correct: false },
      { text: "Les scribes et comptables du trésor impérial",              correct: false },
    ],
    explanation: "Les Janissaires (Yeni Çeri — 'nouvelle armée') furent créés au XIVe siècle à partir du Devshirme. Fidèles au sultan, ils constituèrent l'armée la plus disciplinée d'Europe pendant deux siècles. Ils furent finalement massacrés par Mahmud II en 1826 lors de l'Incident Propice.",
  },
  {
    id: "ere4_005", category: "history", type: "mcq", difficulty: 3,
    question: "Quel empire islamique construisit le Taj Mahal et en quelle année ?",
    options: [
      { text: "Les Ottomans, en 1560",      correct: false },
      { text: "Les Moghols, entre 1632-1653", correct: true  },
      { text: "Les Safavides, en 1610",      correct: false },
      { text: "Les Abbassides, en 1200",     correct: false },
    ],
    culturalCapsule: { title: "Le Taj Mahal — l'amour en marbre", text: "Shah Jahan (1592-1666) fit construire le Taj Mahal à Agra pour sa femme Mumtaz Mahal, morte en 1631. 20 000 ouvriers travaillèrent 22 ans. Mausolée en marbre blanc incrusté de pierres semi-précieuses, il est classé au patrimoine mondial de l'UNESCO." },
  },
  {
    id: "ere4_006", category: "history", type: "mcq", difficulty: 4,
    question: "Comment l'empire moghol d'Akbar le Grand se distinguait-il religieusement ?",
    options: [
      { text: "Il imposait l'islam à tous ses sujets hindous",        correct: false },
      { text: "Il prônait la tolérance religieuse et créa le Din-i-Ilahi", correct: true  },
      { text: "Il interdisait l'hindouisme dans les grandes villes",  correct: false },
      { text: "Il se convertit lui-même au zoroastrisme",             correct: false },
    ],
    explanation: "Akbar (règne 1556-1605) abolit la jizya (taxe sur les non-musulmans), autorisa les mariages mixtes et créa le Din-i-Ilahi — un syncrétisme personnel mêlant islam, hindouisme, zoroastrisme et christianisme. Son empire comptait 75% d'hindous.",
  },
  {
    id: "ere4_007", category: "history", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que l'empire Songhaï et où se situait-il ?",
    options: [
      { text: "Un empire côtier d'Afrique de l'Est",                 correct: false },
      { text: "Un empire d'Afrique de l'Ouest centré sur le Niger (XVe-XVIe s.)", correct: true  },
      { text: "Un sultanat d'Arabie méridionale",                    correct: false },
      { text: "Un empire nomade des steppes d'Asie centrale",        correct: false },
    ],
    culturalCapsule: { title: "Songhaï — l'empire oublié", text: "L'empire Songhaï (1464-1591) fut l'un des plus grands d'Afrique, couvrant l'actuel Mali, Niger et Nigeria. Sous Askia Muhammad (règne 1493-1528), il devint un empire islamique avec Tombouctou comme capitale intellectuelle. Détruit par l'invasion marocaine de 1591." },
  },
  {
    id: "ere4_008", category: "history", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que l'empire safavide et quelle en était la particularité religieuse ?",
    options: [
      { text: "Un empire sunnite iranien fondé par Tamerlan",              correct: false },
      { text: "Un empire chiite iranien (1501-1722) qui fit du chiisme la religion d'État", correct: true  },
      { text: "Un sultanat kurde qui contrôlait la Perse",                 correct: false },
      { text: "Un empire mongol reconverti au shiisme",                    correct: false },
    ],
    explanation: "Shah Ismail Ier (1501-1524) fonda la dynastie safavide et imposa le chiisme duodécimain comme religion officielle en Iran. Cette décision créa la polarisation sunnite/chiite moderne (Ottomans sunnites vs Safavides chiites). Les grandes batailles : Chaldiran (1514).",
  },
  {
    id: "ere4_009", category: "history", type: "timeline", difficulty: 3,
    question: "Ordonne ces empires islamiques des XVe-XVIIe siècles",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Chute de Constantinople (Ottomans)",    year: 1453 },
        { text: "Fondation de l'empire moghol (Babur)",  year: 1526 },
        { text: "Shah Abbas Ier & Ispahan",              year: 1587 },
        { text: "Destruction de l'empire Songhaï",       year: 1591 },
      ],
    },
  },
  {
    id: "ere4_010", category: "history", type: "scholars_match", difficulty: 4,
    question: "Associe chaque bâtisseur à son monument",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Mehmed II",       work: "Mosquée Fatih — Istanbul" },
        { scholar: "Suleiman Ier",    work: "Mosquée Süleymaniye" },
        { scholar: "Shah Jahan",      work: "Taj Mahal — Agra" },
        { scholar: "Shah Abbas",      work: "Place de l'Imam — Isfahan" },
      ],
    },
  },

  // ── ÉTHIQUE ISLAMIQUE & TASSAWUF ─────────────────────────────────
  {
    id: "eth_001", category: "religion", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que le 'Tassawuf' (soufisme) en islam ?",
    options: [
      { text: "Une secte islamique hérétique",                              correct: false },
      { text: "La dimension spirituelle intérieure de l'islam — la purification du cœur", correct: true  },
      { text: "Un mouvement politique islamique moderniste",                correct: false },
      { text: "L'ensemble des règles de jurisprudence malékite",           correct: false },
    ],
    explanation: "Le Tassawuf (تصوف) — soufisme — cherche à développer l'ihsan : 'Adorer Allah comme si tu Le voyais.' Ses maîtres (Al-Ghazali, Junayd, Rumi, Ibn Arabi) ont produit une littérature spirituelle immense. Présent dans tous les madhabs, il n'est pas une secte mais une voie intérieure.",
  },
  {
    id: "eth_002", category: "religion", type: "mcq", difficulty: 3,
    question: "Qui était Al-Ghazali et pourquoi est-il surnommé 'la preuve de l'islam' ?",
    options: [
      { text: "Un général qui défendit Bagdad contre les Croisés",                correct: false },
      { text: "Un théologien qui réconcilia jurisprudence, philosophie et soufisme", correct: true  },
      { text: "Le fondateur de l'école Ash'arite",                                 correct: false },
      { text: "Le premier traducteur du Coran en persan",                          correct: false },
    ],
    culturalCapsule: { title: "Al-Ghazali — Hujjat al-Islam", text: "Abu Hamid al-Ghazali (1058-1111) vécut une crise spirituelle, abandonna sa chaire à Bagdad et passa 11 ans en retraite. Il écrivit l'Ihya Ulum al-Din — la 'Revivification des sciences religieuses' — synthèse monumentale de fiqh, éthique et spiritualité. Son œuvre réunit les croyants ordinaires et les mystiques." },
  },
  {
    id: "eth_003", category: "religion", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que l'Ihsan selon le hadith de Jibril ?",
    options: [
      { text: "L'ensemble des cinq piliers de l'islam",                         correct: false },
      { text: "Adorer Allah comme si tu Le voyais — le niveau le plus élevé de foi", correct: true  },
      { text: "La croyance en les six piliers de l'iman",                        correct: false },
      { text: "La prière nocturne volontaire (tahajjud)",                        correct: false },
    ],
    explanation: "Dans le hadith de Jibril (Muslim), l'islam a 3 degrés : Islam (pratiques extérieures), Iman (croyances intérieures) et Ihsan (excellence spirituelle). L'ihsan = 'Adorer Allah comme si tu Le voyais, et si tu ne Le vois pas, Lui voit.'",
  },
  {
    id: "eth_004", category: "religion", type: "mcq", difficulty: 2,
    question: "Que signifie 'Sabr' (صبر) dans l'éthique islamique ?",
    options: [
      { text: "La générosité envers les pauvres",   correct: false },
      { text: "La patience et la persévérance face à l'épreuve", correct: true  },
      { text: "La gratitude envers Allah",          correct: false },
      { text: "L'humilité devant les savants",     correct: false },
    ],
    explanation: "Sabr (patience) est mentionné 90 fois dans le Coran. 'Allah est avec les patients' (2:153). Trois formes : patience face aux épreuves, patience dans l'obéissance, patience pour éviter les péchés. Les savants disent que la moitié de la foi est Sabr et l'autre Shukr (gratitude).",
  },
  {
    id: "eth_005", category: "religion", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que le 'Maqasid al-Sharia' (objectifs de la loi islamique) ?",
    options: [
      { text: "Les 5 prières obligatoires",                                                correct: false },
      { text: "Les 5 objectifs fondamentaux protégés par l'islam : vie, raison, religion, descendance, richesse", correct: true  },
      { text: "Les 4 sources du fiqh : Coran, Sunna, Ijma', Qiyas",                       correct: false },
      { text: "Les 6 piliers de l'iman",                                                  correct: false },
    ],
    culturalCapsule: { title: "Maqasid — la finalité de la loi", text: "Al-Ghazali (XIe s.) puis al-Shatibi (XIVe s.) ont formalisé les 5 Maqasid : préserver la Religion (din), la Vie (nafs), la Raison (aql), la Descendance (nasl) et la Richesse (mal). Cette théorie permet d'appliquer les règles islamiques selon leur finalité réelle, pas seulement leur lettre." },
  },
  {
    id: "eth_006", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que la doctrine des Ash'arites en théologie islamique ?",
    options: [
      { text: "Ils affirment que le Coran est créé et que la raison prime sur la révélation",             correct: false },
      { text: "Ils affirment que le Coran est incréé et équilibrent raison et révélation (vs Mu'tazila)", correct: true  },
      { text: "Ils rejettent toute interprétation rationnelle du Coran",                                  correct: false },
      { text: "Ils croient que Allah a une forme physique",                                              correct: false },
    ],
    explanation: "Abu al-Hasan al-Ash'ari (873-935) fonda l'école Ash'arite contre les Mu'tazilites (qui faisaient primer la raison). Il affirme que les attributs d'Allah sont réels mais incomparables (bila kayf), et que le Coran (Parole divine) est incréé. L'Ash'arisme est la théologie dominante chez les Shaféites et Malékites.",
  },

  // ── SCIENCES ISLAMIQUES — Quran avancé ──────────────────────────
  {
    id: "sci_001", category: "quran", type: "mcq", difficulty: 4,
    question: "Combien de mots le Coran contient-il selon les compilateurs classiques ?",
    options: [
      { text: "Environ 30 000 mots",   correct: false },
      { text: "Environ 77 450 mots",   correct: true  },
      { text: "Environ 50 000 mots",   correct: false },
      { text: "Environ 100 000 mots",  correct: false },
    ],
    explanation: "Le Coran compte 6 236 versets, 114 sourates et environ 77 430-77 500 mots selon les méthodes de comptage. Ces chiffres sont importants pour les sciences du tajwid et de la mémorisation.",
  },
  {
    id: "sci_002", category: "quran", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que le 'Tajwid' ?",
    options: [
      { text: "La mémorisation complète du Coran",                    correct: false },
      { text: "Les règles de récitation correcte du Coran (prononciation, rythme)", correct: true  },
      { text: "L'exégèse du Coran par les savants",                   correct: false },
      { text: "La récitation collective du Coran en groupe",          correct: false },
    ],
    explanation: "Tajwid (تجويد — embellissement) est la science des règles de récitation du Coran. Elle couvre la prononciation des lettres (makharij), les règles de nasalisation (ghunna), d'allongement (madd) et d'assimilation (idgham). Sa maîtrise est une obligation pour les Huffaz.",
  },
  {
    id: "sci_003", category: "quran", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que l'Isnad dans les sciences du hadith ?",
    options: [
      { text: "La chaîne de transmission des narrateurs d'un hadith",   correct: true  },
      { text: "Le contenu textuel du hadith",                           correct: false },
      { text: "Le degré d'authenticité d'un hadith (sahih/hasan/da'if)",correct: false },
      { text: "La méthode d'abrogation des hadiths anciens",            correct: false },
    ],
    explanation: "L'Isnad (إسناد — chaîne) liste les transmetteurs d'un hadith depuis le Prophète ﷺ. Un hadith = Isnad (chaîne) + Matn (texte). La critique de l'isnad est la grande contribution islamique à la science de l'histoire et de la vérification des sources.",
  },
  {
    id: "sci_004", category: "quran", type: "mcq", difficulty: 4,
    question: "Que signifie 'Hadith Sahih' (authentique) selon les critères d'Al-Bukhari ?",
    options: [
      { text: "Un hadith récité par le Prophète ﷺ lui-même",            correct: false },
      { text: "Un hadith avec chaîne continue de transmetteurs fiables jusqu'au Prophète ﷺ", correct: true  },
      { text: "Un hadith approuvé par les 4 khalifes",                  correct: false },
      { text: "Un hadith mentionné dans le Coran",                      correct: false },
    ],
    explanation: "Al-Bukhari (810-870) posa 5 critères : 1) Chaîne ininterrompue (muttasil), 2) Tous les transmetteurs sont fiables (thiqat), 3) Bonne mémoire, 4) Pas d'anomalie (shadhdhudh), 5) Pas de défaut caché (illa). Son Sahih al-Bukhari est le livre le plus authentique après le Coran.",
  },
  {
    id: "sci_005", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que le 'Waqf' et son rôle dans la civilisation islamique ?",
    options: [
      { text: "Une forme d'impôt religieux obligatoire",                       correct: false },
      { text: "Une fondation caritative perpétuelle (bien dédié à Allah) finançant mosquées, écoles, hôpitaux", correct: true  },
      { text: "Le droit d'héritage islamique",                                 correct: false },
      { text: "Un conseil de sages délibérant sur les affaires de la Oumma",  correct: false },
    ],
    culturalCapsule: { title: "Le Waqf — l'État-providence islamique", text: "Le Waqf (وقف — immobilisation d'un bien) fut le moteur de la civilisation islamique pendant mille ans. Mosquées, universités (Al-Azhar fondé par Waqf en 972), hôpitaux, bibliothèques, caravansérails — tout était financé par des fondations wakf. L'Ottoman Empire avait 35 000 waqfs à son apogée." },
  },

  // ── ARABE — Niveau C1 ────────────────────────────────────────────
  {
    id: "ara_c1_001", category: "arabic", type: "mcq", difficulty: 4,
    question: "Quelle est la différence entre 'Fatha' (َ), 'Kasra' (ِ) et 'Damma' (ُ) en arabe ?",
    options: [
      { text: "Ce sont trois dialectes arabes différents",                          correct: false },
      { text: "Ce sont les trois signes vocaliques courts : a, i, u",               correct: true  },
      { text: "Ce sont les marques de genre masculin, féminin, neutre",             correct: false },
      { text: "Ce sont les trois conjugaisons du verbe arabe",                      correct: false },
    ],
    explanation: "En arabe, les voyelles courtes sont représentées par des signes diacritiques : fatha (َ) = /a/, kasra (ِ) = /i/, damma (ُ) = /u/. Ces signes sont absents dans la plupart des textes modernes et doivent être déduits du contexte — d'où la difficulté de l'arabe pour les apprenants.",
  },
  {
    id: "ara_c1_002", category: "arabic", type: "mcq", difficulty: 3,
    question: "Dans l'alphabet arabe, combien de lettres n'ont PAS de point ?",
    options: [
      { text: "5 lettres",    correct: false },
      { text: "6 lettres",    correct: false },
      { text: "14 lettres",   correct: true  },
      { text: "8 lettres",    correct: false },
    ],
    explanation: "Sur 28 lettres, 14 n'ont pas de point : alif, ha', dal, dhal, ra', zay, sin, sad, ta', zain, ayn, ghayn, lam, mim, waw. L'ajout des points diacritiques (i'jam) au VIIe siècle fut une révolution permettant d'éviter les ambiguïtés de lecture.",
  },
  {
    id: "ara_c1_003", category: "arabic", type: "mcq", difficulty: 4,
    question: "Comment s'appelle la poésie arabe classique en vers de 7 pieds (qasida) ?",
    options: [
      { text: "Ghazal",     correct: false },
      { text: "Qasida",     correct: true  },
      { text: "Ruba'i",     correct: false },
      { text: "Muwashshah", correct: false },
    ],
    explanation: "La Qasida (قصيدة) est la forme poétique arabe classique longue (30-100 vers). Elle comporte des sections : nasib (introduction amoureuse), rahil (voyage) et madih (panégyrique). Les Mu'allaqat ('poèmes suspendus') préislamiques sont les qasidas les plus célèbres.",
  },
  {
    id: "ara_c1_004", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie 'Basmala' et combien de fois apparaît-elle dans le Coran ?",
    options: [
      { text: "Allahu Akbar — 1 fois seulement au début",    correct: false },
      { text: "Bismillah ir-Rahman ir-Rahim — 114 fois (une par sourate sauf At-Tawba + 1 extra dans An-Naml)", correct: true  },
      { text: "Al-Fatiha — exactement 1 fois",              correct: false },
      { text: "Al-hamdulillah — 33 fois",                  correct: false },
    ],
    explanation: "La Basmala (بسملة) apparaît 113 fois au début des sourates + 1 fois au milieu de An-Naml (27:30) = 114 fois. Elle est absente au début de Sourate 9 (At-Tawba), ce qui est sujet d'un débat entre savants (oubli ou délibéré).",
  },

  // ── SCHOLARS MATCH — Association savants ↔ œuvres ───────────────
  {
    id: "sm_001", category: "history", type: "scholars_match", difficulty: 3,
    question: "Associe chaque savant à son œuvre principale",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Al-Khwarizmi",  work: "Kitāb al-Jabr (Algèbre)" },
        { scholar: "Ibn Sina",       work: "Canon de la Médecine" },
        { scholar: "Ibn Khaldoun",   work: "La Muqaddima" },
        { scholar: "Al-Idrisi",      work: "Tabula Rogeriana (carte du monde)" },
      ],
    },
    culturalCapsule: { title: "4 géants, 4 sciences", text: "Al-Khwarizmi (algèbre), Ibn Sina (médecine), Ibn Khaldoun (sociologie) et Al-Idrisi (cartographie) représentent quatre disciplines fondamentales de l'Âge d'Or islamique, chacun ayant révolutionné son domaine." },
  },
  {
    id: "sm_002", category: "history", type: "scholars_match", difficulty: 3,
    question: "Relie chaque prophète à son épreuve principale",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Ibrahim ﷺ",   work: "Le feu de Nimrod" },
        { scholar: "Yusuf ﷺ",    work: "La prison d'Égypte" },
        { scholar: "Moussa ﷺ",   work: "La mer Rouge" },
        { scholar: "Ayyub ﷺ",    work: "La maladie et la patience" },
      ],
    },
  },
  {
    id: "sm_003", category: "religion", type: "scholars_match", difficulty: 4,
    question: "Associe chaque savant à son école juridique (madhab)",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Abu Hanifa",         work: "École Hanafite" },
        { scholar: "Malik ibn Anas",     work: "École Malékite" },
        { scholar: "Al-Shafi'i",         work: "École Shaféite" },
        { scholar: "Ahmad ibn Hanbal",   work: "École Hanbalite" },
      ],
    },
  },
  {
    id: "sm_004", category: "history", type: "scholars_match", difficulty: 4,
    question: "Associe chaque empire islamique à sa capitale",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Omeyyades",         work: "Damas" },
        { scholar: "Abbassides",         work: "Bagdad" },
        { scholar: "Fatimides",          work: "Le Caire" },
        { scholar: "Ottomans",           work: "Istanbul" },
      ],
    },
  },
  {
    id: "sm_005", category: "quran", type: "scholars_match", difficulty: 3,
    question: "Associe chaque prophète à la sourate qui porte son nom",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Yusuf ﷺ",       work: "Sourate 12" },
        { scholar: "Ibrahim ﷺ",     work: "Sourate 14" },
        { scholar: "Maryam ﷺ",      work: "Sourate 19" },
        { scholar: "Moussa/Ta-Ha ﷺ",work: "Sourate 20" },
      ],
    },
    explanation: "Le Coran comporte plusieurs sourates nommées après des prophètes ou figures importantes. Yusuf (12), Ibrahim (14), Maryam (19) et Ta-Ha [Moussa] (20) sont parmi les plus connues.",
  },

  // ── RELIGION — Bases accessibles (diff 1-2) ─────────────────────
  {
    id: "rel_base_001", category: "religion", type: "mcq", difficulty: 1,
    question: "Quelle est la première chose que fait un musulman en se réveillant ?",
    options: [
      { text: "Lire le Coran",                        correct: false },
      { text: "Dire 'Al-hamdulillah alladhi ahyânâ'", correct: true  },
      { text: "Faire ses ablutions",                  correct: false },
      { text: "Prier Fajr immédiatement",             correct: false },
    ],
    explanation: "Le Prophète ﷺ a enseigné : en se réveillant, dire 'Al-hamdulillah alladhi ahyânâ ba'da mâ amâtanâ wa ilayhi an-nushûr' (Louange à Allah qui nous a fait revivre après nous avoir fait mourir, et vers Lui est la résurrection).",
  },
  {
    id: "rel_base_002", category: "religion", type: "mcq", difficulty: 1,
    question: "Combien de fois par jour les musulmans se prosternent-ils dans les 5 prières ?",
    options: [
      { text: "17 prosternations",  correct: false },
      { text: "34 prosternations",  correct: true  },
      { text: "10 prosternations",  correct: false },
      { text: "20 prosternations",  correct: false },
    ],
    explanation: "Chaque prière a des raka'at (unités) : Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, Isha 4 = 17 raka'at. Chaque raka'a contient 2 prosternations = 34 par jour. Ce chiffre montre le niveau d'humilité quotidien demandé.",
  },
  {
    id: "rel_base_003", category: "religion", type: "mcq", difficulty: 1,
    question: "Quel est le sens du mot 'Islam' en arabe ?",
    options: [
      { text: "La paix",                              correct: false },
      { text: "La soumission / la paix par la soumission", correct: true  },
      { text: "La foi",                               correct: false },
      { text: "La prière",                            correct: false },
    ],
    explanation: "Islam (إسلام) vient de la racine s-l-m (سلم) : paix, intégrité, soumission. Islama = se soumettre volontairement à Allah. Muslim = celui qui se soumet. Salam = paix. La paix découle de la soumission à la volonté divine.",
  },
  {
    id: "rel_base_004", category: "religion", type: "mcq", difficulty: 1,
    question: "Quelle est la durée du jeûne pendant le Ramadan ?",
    options: [
      { text: "De minuit à minuit",            correct: false },
      { text: "De l'aube (fajr) au coucher du soleil (maghrib)", correct: true  },
      { text: "De lever du soleil au coucher", correct: false },
      { text: "24h consécutives",              correct: false },
    ],
    explanation: "Le jeûne du Ramadan commence à Al-Fajr (l'aube, quand on distingue un fil blanc d'un fil noir) et se termine à Al-Maghrib (coucher du soleil). La nuit est une période de liberté alimentaire.",
  },
  {
    id: "rel_base_005", category: "religion", type: "mcq", difficulty: 1,
    question: "Combien de fois le pèlerinage (Hajj) est-il obligatoire dans une vie ?",
    options: [
      { text: "5 fois",          correct: false },
      { text: "1 fois",          correct: true  },
      { text: "Autant que possible", correct: false },
      { text: "1 fois tous les 10 ans", correct: false },
    ],
    explanation: "Le Hajj est obligatoire une seule fois dans la vie pour tout musulman capable physiquement et financièrement. Le Prophète ﷺ a dit : 'Le Hajj est une fois, celui qui en fait plus, c'est une volontaire.'",
  },
  {
    id: "rel_base_006", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que la 'Fitrah' en islam ?",
    options: [
      { text: "La prière du vendredi",                                          correct: false },
      { text: "La disposition naturelle de l'être humain à reconnaître Allah",  correct: true  },
      { text: "L'aumône obligatoire de fin de Ramadan",                         correct: false },
      { text: "La rupture du jeûne",                                            correct: false },
    ],
    explanation: "Fitrah (فطرة) est la nature originelle sur laquelle Allah a créé les humains — une prédisposition au monothéisme. Le Prophète ﷺ dit : 'Tout enfant naît sur la fitrah.' La circoncision, les poils des aisselles, le siwak font aussi partie des pratiques de la fitrah.",
  },
  {
    id: "rel_base_007", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que le 'Siwak' dans la tradition islamique ?",
    options: [
      { text: "Un type de prière nocturne",                      correct: false },
      { text: "Une brindille de nettoyage des dents recommandée", correct: true  },
      { text: "Une forme d'aumône discrète",                     correct: false },
      { text: "Un chapelet de 99 perles",                        correct: false },
    ],
    explanation: "Le Siwak (سواك) est une brindille de l'arbre arak (Salvadora persica) utilisée pour nettoyer les dents. Le Prophète ﷺ : 'Le siwak purifie la bouche et plaît au Seigneur.' Il est recommandé avant chaque prière et à plusieurs moments de la journée.",
  },
  {
    id: "rel_base_008", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que l'Adhan (أذان) ?",
    options: [
      { text: "La prière obligatoire",                              correct: false },
      { text: "L'appel à la prière lancé par le muezzin",           correct: true  },
      { text: "Le sermon du vendredi",                              correct: false },
      { text: "La prière funèbre sur un défunt",                    correct: false },
    ],
    explanation: "L'Adhan (appel) est prononcé 5 fois par jour par le muezzin depuis le minaret. Il commence par 'Allahu Akbar' (×4), puis la shahada, puis 'Hayya alas-salah' (×2 — Venez à la prière), 'Hayya alal-falah' (×2 — Venez au salut).",
  },
  {
    id: "rel_base_009", category: "religion", type: "mcq", difficulty: 1,
    question: "Combien y a-t-il de piliers de l'Iman (foi) en islam ?",
    options: [
      { text: "5 piliers",  correct: false },
      { text: "6 piliers",  correct: true  },
      { text: "4 piliers",  correct: false },
      { text: "7 piliers",  correct: false },
    ],
    explanation: "Les 6 piliers de l'Iman : 1) Croire en Allah, 2) Ses anges, 3) Ses livres, 4) Ses prophètes, 5) Le Jour dernier, 6) Le destin (qadar) bon et mauvais. Ces 6 piliers définissent la croyance (iman) par opposition aux pratiques (islam).",
  },
  {
    id: "rel_base_010", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que la 'Qibla' ?",
    options: [
      { text: "La direction de prière vers La Mecque",             correct: true  },
      { text: "Le tapis de prière",                               correct: false },
      { text: "La niche dans la mosquée indiquant la direction",  correct: false },
      { text: "L'heure exacte de la prière",                     correct: false },
    ],
    explanation: "La Qibla (قبلة — direction) est l'orientation vers la Ka'ba à La Mecque. Obligatoire pendant la prière sauf en voyage (on peut prier dans la direction générale). La Qibla originelle était Jérusalem (Al-Aqsa), changée vers La Mecque en 624 (2 AH).",
  },

  // ── CORAN — Accessible (diff 1-2) ────────────────────────────────
  {
    id: "qur_easy_001", category: "quran", type: "mcq", difficulty: 1,
    question: "Quelle est la plus courte sourate du Coran ?",
    options: [
      { text: "Al-Ikhlas (4 versets)",    correct: false },
      { text: "Al-Kawthar (3 versets)",   correct: true  },
      { text: "Al-Asr (3 versets)",       correct: false },
      { text: "An-Nasr (3 versets)",      correct: false },
    ],
    explanation: "Al-Kawthar (sourate 108) est la plus courte avec 3 versets courts. Al-Asr et An-Nasr ont aussi 3 versets mais sont plus longs en mots. Al-Kawthar révèle que le Prophète ﷺ a reçu Al-Kawthar (la rivière du paradis) en échange de ceux qui le haïssent.",
  },
  {
    id: "qur_easy_002", category: "quran", type: "mcq", difficulty: 1,
    question: "Quelle sourate est récitée à la mosquée chaque vendredi ?",
    options: [
      { text: "Al-Baqara",    correct: false },
      { text: "Al-Kahf",      correct: true  },
      { text: "Ya-Sin",       correct: false },
      { text: "Al-Mulk",      correct: false },
    ],
    explanation: "Al-Kahf (sourate 18 — La Caverne) est recommandée le vendredi : 'Celui qui lit Al-Kahf le vendredi, une lumière s'illumine pour lui d'un vendredi à l'autre.' Elle contient 4 histoires : les Gens de la Caverne, le Jardinier, Moussa et Al-Khidr, Dhul-Qarnayn.",
  },
  {
    id: "qur_easy_003", category: "quran", type: "mcq", difficulty: 1,
    question: "Quel verset est connu comme 'Ayat al-Kursi' (Verset du Trône) ?",
    options: [
      { text: "Al-Fatiha 1:1",       correct: false },
      { text: "Al-Baqara 2:255",     correct: true  },
      { text: "Al-Imran 3:18",       correct: false },
      { text: "An-Nisa 4:1",         correct: false },
    ],
    explanation: "Ayat al-Kursi (Al-Baqara 2:255) décrit la grandeur d'Allah : 'Allah — il n'y a de dieu que Lui, le Vivant, le Subsistant par Lui-même...' Le Prophète ﷺ a dit que c'est le plus grand verset du Coran. Sa récitation après chaque prière protège jusqu'à la prochaine.",
  },
  {
    id: "qur_easy_004", category: "quran", type: "mcq", difficulty: 1,
    question: "Combien de sourates le Coran contient-il ?",
    options: [
      { text: "99 sourates",   correct: false },
      { text: "100 sourates",  correct: false },
      { text: "114 sourates",  correct: true  },
      { text: "120 sourates",  correct: false },
    ],
    explanation: "Le Coran contient exactement 114 sourates. La plus longue est Al-Baqara (286 versets). La plus courte est Al-Kawthar (3 versets). Les sourates sont numérotées de 1 à 114 dans l'ordre de la compilation, pas de la révélation.",
  },
  {
    id: "qur_easy_005", category: "quran", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que le 'Juz' (جزء) dans le Coran ?",
    options: [
      { text: "Un verset du Coran",                      correct: false },
      { text: "Une des 30 parties égales du Coran",      correct: true  },
      { text: "Une sourate de 30 versets",               correct: false },
      { text: "La session de récitation d'une heure",    correct: false },
    ],
    explanation: "Le Coran est divisé en 30 Juz (sections) pour faciliter la récitation en un mois (1 juz/jour pendant Ramadan). Chaque juz = environ 20 pages. Chaque juz est divisé en 2 hizb, chaque hizb en 4 ruba'.",
  },
  {
    id: "qur_easy_006", category: "quran", type: "mcq", difficulty: 2,
    question: "Quelle est la sourate qui ne commence PAS par la Basmala ?",
    options: [
      { text: "Al-Fatiha",    correct: false },
      { text: "At-Tawba (9)", correct: true  },
      { text: "Al-Baqara",    correct: false },
      { text: "Al-Kahf",      correct: false },
    ],
    explanation: "At-Tawba (sourate 9) est la seule sourate sans Basmala au début. Les savants expliquent cela par son contenu dur (déclaration de guerre aux polythéistes) — le Prophète ﷺ est mort avant de préciser si elle devait en avoir une.",
  },
  {
    id: "qur_easy_007", category: "quran", type: "mcq", difficulty: 2,
    question: "Pendant combien d'années le Coran fut-il révélé ?",
    options: [
      { text: "10 ans",   correct: false },
      { text: "23 ans",   correct: true  },
      { text: "30 ans",   correct: false },
      { text: "40 ans",   correct: false },
    ],
    explanation: "Le Coran fut révélé sur 23 ans : 13 ans à La Mecque (610-622) et 10 ans à Médine (622-632). La première révélation fut Al-Alaq 96:1-5 dans la grotte de Hira. La dernière fut le verset 5:3 lors du pèlerinage d'adieu.",
  },
  {
    id: "qur_easy_008", category: "quran", type: "mcq", difficulty: 1,
    question: "Quelle sourate est récitée lors de chaque raka'a (unité) de prière ?",
    options: [
      { text: "Al-Baqara",     correct: false },
      { text: "Al-Fatiha",     correct: true  },
      { text: "Al-Ikhlas",     correct: false },
      { text: "Al-Falaq",      correct: false },
    ],
    explanation: "Al-Fatiha (L'Ouverture) est obligatoire dans chaque raka'a de chaque prière. Le Prophète ﷺ : 'Pas de prière valide sans Al-Fatiha.' Elle est récitée au moins 17 fois par jour dans les prières obligatoires.",
  },

  // ── HISTOIRE ISLAMIQUE — Accessible (diff 1-2) ───────────────────
  {
    id: "his_easy_001", category: "history", type: "mcq", difficulty: 1,
    question: "En quelle année a débuté le calendrier islamique (hégirien) ?",
    options: [
      { text: "570 EC",  correct: false },
      { text: "622 EC",  correct: true  },
      { text: "632 EC",  correct: false },
      { text: "610 EC",  correct: false },
    ],
    explanation: "Le calendrier hégirien (Al-Hijri) commence en 622 EC, année de la migration du Prophète ﷺ de La Mecque vers Médine. C'est Omar ibn al-Khattab qui l'institua comme calendrier officiel de l'État islamique en 638 EC.",
  },
  {
    id: "his_easy_002", category: "history", type: "mcq", difficulty: 1,
    question: "Comment s'appelait la ville de Médine avant l'islam ?",
    options: [
      { text: "Mecca",        correct: false },
      { text: "Yathrib",      correct: true  },
      { text: "Taïf",         correct: false },
      { text: "Al-Ula",       correct: false },
    ],
    explanation: "Médine s'appelait Yathrib avant la migration du Prophète ﷺ en 622. Après son arrivée, la ville fut renommée Al-Madina (La Ville) ou Madinat an-Nabi (La Ville du Prophète). Le Prophète ﷺ disait que même prononcer 'Yathrib' est makruh (déconseillé).",
  },
  {
    id: "his_easy_003", category: "history", type: "mcq", difficulty: 1,
    question: "Quel est le nom de l'épouse la plus célèbre du Prophète ﷺ avant l'islam ?",
    options: [
      { text: "Aïcha",    correct: false },
      { text: "Khadija",  correct: true  },
      { text: "Fatima",   correct: false },
      { text: "Hafsa",    correct: false },
    ],
    explanation: "Khadija bint Khuwaylid fut la première épouse du Prophète ﷺ. Veuve riche de 40 ans, elle l'avait d'abord engagé comme marchand. Leur union dura 25 ans. Elle fut la première croyante en sa mission et mourut en 619, l'année dite de la Tristesse.",
  },
  {
    id: "his_easy_004", category: "history", type: "mcq", difficulty: 2,
    question: "Quel est le nom du père du Prophète Muhammad ﷺ ?",
    options: [
      { text: "Abu Bakr",      correct: false },
      { text: "Abdullah",      correct: true  },
      { text: "Abd al-Muttalib", correct: false },
      { text: "Waraqa",        correct: false },
    ],
    explanation: "Le père du Prophète ﷺ était Abdullah ibn Abd al-Muttalib. Il mourut avant la naissance de Muhammad ﷺ (ou peu après selon certaines narrations). Abd al-Muttalib était son grand-père qui l'éleva après la mort de sa mère Amina.",
  },
  {
    id: "his_easy_005", category: "history", type: "mcq", difficulty: 1,
    question: "Comment s'appellent les deux grandes fêtes islamiques ?",
    options: [
      { text: "Eid al-Fitr et Eid al-Adha",       correct: true  },
      { text: "Mawlid et Achoura",                 correct: false },
      { text: "Ramadan et Hajj",                   correct: false },
      { text: "Eid al-Fitr et Isra' wal Mi'raj",   correct: false },
    ],
    explanation: "Les deux Eid : Eid al-Fitr (عيد الفطر — fête de la rupture du jeûne) le 1er Shawwal après le Ramadan, et Eid al-Adha (عيد الأضحى — fête du sacrifice) le 10 Dhul Hijja lors du Hajj. Le Prophète ﷺ : 'Chaque peuple a sa fête, et ces deux-là sont les nôtres.'",
  },
  {
    id: "his_easy_006", category: "history", type: "mcq", difficulty: 2,
    question: "Quel est le vrai nom de La Mecque en arabe classique ?",
    options: [
      { text: "Al-Haram",       correct: false },
      { text: "Mecca al-Mukarrama / Bakkah", correct: true  },
      { text: "Umm al-Qura",    correct: false },
      { text: "Al-Balad al-Amin", correct: false },
    ],
    explanation: "La Mecque est appelée dans le Coran 'Bakkah' (3:96) et 'Umm al-Qura' (6:92 — Mère des cités). 'Makkah al-Mukarrama' (La Mecque l'Honorée) est son titre officiel. Le Coran l'appelle aussi 'Al-Balad al-Amin' (3:97 — la cité sûre).",
  },
  {
    id: "his_easy_007", category: "history", type: "mcq", difficulty: 2,
    question: "Qui était Abu Bakr al-Siddiq par rapport au Prophète ﷺ ?",
    options: [
      { text: "Son oncle",                                          correct: false },
      { text: "Son meilleur ami et premier calife après sa mort",  correct: true  },
      { text: "Son beau-frère",                                    correct: false },
      { text: "Son cousin germain",                                correct: false },
    ],
    explanation: "Abu Bakr (573-634) fut le meilleur ami (khayru sahabi) du Prophète ﷺ, son compagnon dans la grotte de Thawr lors de l'Hégire, et le premier calife après sa mort. Son surnom 'al-Siddiq' (le Véridique) lui fut donné après avoir immédiatement cru au Mi'raj.",
  },
  {
    id: "his_easy_008", category: "history", type: "mcq", difficulty: 2,
    question: "Quel était le surnom du Prophète ﷺ chez ses contemporains avant la révélation ?",
    options: [
      { text: "Al-Amin (le Fidèle)",      correct: true  },
      { text: "Al-Murtada (le Choisi)",   correct: false },
      { text: "Al-Karim (le Généreux)",   correct: false },
      { text: "As-Sadiq (le Véridique)",  correct: false },
    ],
    explanation: "Avant la révélation, les Mecquois appelaient Muhammad ﷺ 'Al-Amin' (الأمين — le Fidèle, le Digne de confiance) en raison de sa probité. Ils lui confiaient leurs biens et leurs secrets. Cette réputation précède sa mission prophétique.",
  },

  // ── ARABE — Vocabulaire de base (diff 1-2) ──────────────────────
  {
    id: "ara_voc_001", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie 'As-salamu alaykum' ?",
    options: [
      { text: "Bonjour / Bonne journée",                        correct: false },
      { text: "La paix soit sur vous",                          correct: true  },
      { text: "Comment vas-tu ?",                               correct: false },
      { text: "Que Dieu te bénisse",                            correct: false },
    ],
    explanation: "As-salamu alaykum (السلام عليكم — la paix soit sur vous) est le salut islamique. La réponse complète est Wa alaykum as-salam wa rahmatullahi wa barakatuh (et sur vous la paix, la miséricorde d'Allah et Ses bénédictions). Le Prophète ﷺ a dit que diffuser le salut répand l'amour.",
  },
  {
    id: "ara_voc_002", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie 'Jazak Allahu khayran' ?",
    options: [
      { text: "Pardon / Excuse-moi",                    correct: false },
      { text: "Qu'Allah te récompense par le bien",     correct: true  },
      { text: "Que Dieu te pardonne",                   correct: false },
      { text: "Que ta santé soit bonne",               correct: false },
    ],
    explanation: "Jazak Allahu khayran (جزاك الله خيراً) est la formule de remerciement islamique. Le Prophète ﷺ : 'Celui à qui on fait du bien, s'il dit Jazak Allahu khayran, il a parfaitement répondu.' Réponse : Wa iyyak(a) (Et toi aussi).",
  },
  {
    id: "ara_voc_003", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie 'Masha'Allah' dans l'usage quotidien ?",
    options: [
      { text: "Si Allah le veut",                                           correct: false },
      { text: "Ce qu'Allah a voulu — exprime admiration et gratitude à Allah", correct: true  },
      { text: "Que Dieu nous pardonne",                                      correct: false },
      { text: "Au nom d'Allah",                                             correct: false },
    ],
    explanation: "Masha'Allah (ما شاء الله — ce qu'Allah a voulu) exprime l'émerveillement et le rappel que c'est Allah qui accorde les bienfaits. On le dit face à quelque chose de beau ou réussi pour se prémunir du mauvais œil. InshAllah = si Allah le veut (pour le futur).",
  },
  {
    id: "ara_voc_004", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que veut dire 'Astaghfirullah' ?",
    options: [
      { text: "Que Dieu bénisse",              correct: false },
      { text: "Je demande pardon à Allah",     correct: true  },
      { text: "Allahu Akbar",                  correct: false },
      { text: "Dieu est grand et sage",        correct: false },
    ],
    explanation: "Astaghfirullah (أستغفر الله — je demande pardon à Allah) est une formule d'istighfar (demande de pardon). Le Prophète ﷺ la répétait 70 à 100 fois par jour. Il se dit quand on regrette une faute, mais aussi comme formule de glorification d'Allah.",
  },
  {
    id: "ara_voc_005", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie 'Alhamdulillah' mot à mot ?",
    options: [
      { text: "Dieu est le plus grand",               correct: false },
      { text: "Toute louange appartient à Allah",      correct: true  },
      { text: "Gloire à Allah",                        correct: false },
      { text: "Allah est unique",                      correct: false },
    ],
    explanation: "Al-hamdulillah (الحمد لله) = Al-hamd (la louange) + li (à) + Allah = Toute louange est à Allah. C'est la 2e phrase du Coran après la Basmala. La 'Tasbiha complète' : SubhanAllah (Gloire) + Alhamdulillah (Louange) + Allahu Akbar (Dieu est grand) = les 3 formules fondamentales.",
  },
  {
    id: "ara_voc_006", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie le mot 'Ummah' (أمة) ?",
    options: [
      { text: "La mère en arabe",                          correct: false },
      { text: "La communauté des musulmans du monde entier", correct: true  },
      { text: "La ville de Médine",                         correct: false },
      { text: "La prière du vendredi",                     correct: false },
    ],
    explanation: "Ummah (أمة) désigne la communauté islamique mondiale — tous les musulmans forment une seule Ummah sans frontières nationales. Le Coran (3:110) : 'Vous êtes la meilleure communauté que l'on ait fait surgir pour les hommes.' Le terme signifie aussi 'nation' au sens large.",
  },
  {
    id: "ara_voc_007", category: "arabic", type: "mcq", difficulty: 1,
    question: "Comment dit-on 'Dieu' en arabe ?",
    options: [
      { text: "Ilah",   correct: false },
      { text: "Allah",  correct: true  },
      { text: "Rabb",   correct: false },
      { text: "Al-Haqq",correct: false },
    ],
    explanation: "Allah (الله) est le nom propre de Dieu en arabe, utilisé par les arabophones chrétiens, juifs et musulmans. Il ne s'emploie pas au pluriel et n'a pas de féminin — marquant son unicité absolue. Ilah = une divinité (générique), Rabb = Seigneur/Maître.",
  },
  {
    id: "ara_voc_008", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie 'Halal' et 'Haram' ?",
    options: [
      { text: "Bon / Mauvais (goût)",                    correct: false },
      { text: "Permis / Interdit par la loi islamique",  correct: true  },
      { text: "Sacré / Profane",                         correct: false },
      { text: "Propre / Sale (hygiène)",                 correct: false },
    ],
    explanation: "Halal (حلال — permis) désigne ce qu'Allah a autorisé. Haram (حرام — interdit) désigne ce qu'Il a interdit. Entre les deux : Makruh (déconseillé), Mubah (neutre), Mandub (recommandé). Ces catégories constituent l'échelle du Ahkam al-Sharia.",
  },
  {
    id: "ara_voc_009", category: "arabic", type: "mcq", difficulty: 1,
    question: "Que signifie 'Amin' (آمين) au sens religieux ?",
    options: [
      { text: "Merci à Allah",        correct: false },
      { text: "Ainsi soit-il / Réponds à notre prière", correct: true  },
      { text: "Louange à Allah",      correct: false },
      { text: "Que Dieu pardonne",    correct: false },
    ],
    explanation: "Amin (آمين) vient de la racine amana (foi, confiance). On le dit après Al-Fatiha et les du'a (invocations) pour signifier 'Exauce cette prière.' Le Prophète ﷺ a dit que 'Amin' des fidèles et des anges coïncident lors de la prière du vendredi — moment de l'exaucement.",
  },
  {
    id: "ara_voc_010", category: "arabic", type: "mcq", difficulty: 2,
    question: "Que signifie 'Tawbah' (توبة) ?",
    options: [
      { text: "La prière de nuit",                  correct: false },
      { text: "Le repentir sincère et le retour vers Allah", correct: true  },
      { text: "L'aumône secrète",                   correct: false },
      { text: "Le jeûne volontaire",                correct: false },
    ],
    explanation: "Tawbah (توبة — retour) est le repentir islamique. Conditions : regretter sincèrement, arrêter le péché immédiatement, décider de ne pas recommencer, réparer si un tiers est lésé. 'Allah aime ceux qui se repentent et ceux qui se purifient' (2:222). La Tawba n'a pas besoin d'un intermédiaire.",
  },

  // ── DARIJA — Vie quotidienne (diff 1-2) ─────────────────────────
  {
    id: "dar_voc_001", category: "darija", type: "mcq", difficulty: 1,
    question: "Comment dit-on 'Comment tu t'appelles ?' en darija ?",
    options: [
      { text: "Ach mak smiytk ?",    correct: true  },
      { text: "Kif dayr / dayra ?",  correct: false },
      { text: "Mnin nta / nti ?",    correct: false },
      { text: "Chhal men 'am ?",     correct: false },
    ],
    explanation: "'Ach mak smiytk?' = Quel est ton prénom? (masc.) / 'Ach mak smiytch?' (fém.). 'Kif dayr?' = Comment vas-tu ? 'Mnin nta?' = D'où es-tu ? 'Chhal men am?' = Quel âge as-tu ?",
  },
  {
    id: "dar_voc_002", category: "darija", type: "mcq", difficulty: 1,
    question: "Que signifie 'Safi' en darija marocaine ?",
    options: [
      { text: "C'est propre",                      correct: false },
      { text: "C'est bon / ça suffit / d'accord",  correct: true  },
      { text: "C'est délicieux",                   correct: false },
      { text: "C'est fini / terminé",              correct: false },
    ],
    explanation: "'Safi' (صافي) en darija signifie 'c'est bon, d'accord, assez, c'est réglé'. Ex: 'Safi, mshi!' = 'Ok, vas-y !' C'est l'un des mots les plus polyvalents du darija — approuvé, compris, terminé selon le contexte.",
  },
  {
    id: "dar_voc_003", category: "darija", type: "mcq", difficulty: 1,
    question: "Comment dit-on 'J'ai faim' en darija ?",
    options: [
      { text: "Ana 'atshan",         correct: false },
      { text: "Ana ji'an",           correct: true  },
      { text: "Bghet nakol",         correct: false },
      { text: "Ma kaynch makla",     correct: false },
    ],
    explanation: "'Ana ji'an' (أنا جيعان) = J'ai faim. 'Ana 'atshan' = J'ai soif. 'Bghet nakol' = Je veux manger. En darija, l'adjectif 'ji'an' vient de 'ju'' (faim en arabe classique جوع).",
  },
  {
    id: "dar_voc_004", category: "darija", type: "mcq", difficulty: 1,
    question: "Que signifie 'Zwina / Zwin' en darija ?",
    options: [
      { text: "Triste / Malheureux",  correct: false },
      { text: "Beau / Belle",         correct: true  },
      { text: "Cher / Coûteux",       correct: false },
      { text: "Nouveau / Moderne",    correct: false },
    ],
    explanation: "'Zwin' (masc.) / 'Zwina' (fém.) = beau/belle. 'Zwin bzzaf' = très beau. En arabe classique, 'husn' signifie beauté. 'Zwin' vient probablement de racines arabes dialectales. 'Mazyan' a le même sens et peut aussi signifier 'bien / correctement'.",
  },
  {
    id: "dar_voc_005", category: "darija", type: "mcq", difficulty: 2,
    question: "Que signifie 'Hshuma' (حشومة) en darija ?",
    options: [
      { text: "Honte / C'est honteux / Pudeur",   correct: true  },
      { text: "C'est trop cher",                  correct: false },
      { text: "Attention / Danger",               correct: false },
      { text: "C'est interdit / Haram",           correct: false },
    ],
    explanation: "'Hshuma' (حشومة) vient de 'hishma' arabe (pudeur, retenue). En darija, c'est une exclamation sociale forte : 'Tu n'as pas honte ?' On l'utilise pour signaler un comportement inapproprié ou embarrassant. Proche de la notion islamique de 'haya' (pudeur/retenue).",
  },
  {
    id: "dar_voc_006", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'Bienvenue' en darija marocaine ?",
    options: [
      { text: "Ahlan wa sahlan",    correct: false },
      { text: "Marhba bik / biki", correct: true  },
      { text: "Salam o alaykum",   correct: false },
      { text: "Yallah, dkhol",     correct: false },
    ],
    explanation: "'Marhba bik' (masc.) / 'Marhba biki' (fém.) = bienvenue. Vient de l'arabe 'marhaban' (espace large). 'Ahlan wa sahlan' est l'arabe classique. 'Tfddal / tfddli' = 'faites comme chez vous / entrez' est aussi utilisé. 'Yallah dkhol' = 'allez, entre' — moins formel.",
  },
  {
    id: "dar_voc_007", category: "darija", type: "mcq", difficulty: 1,
    question: "Que signifie 'Yallah' en darija ?",
    options: [
      { text: "Au revoir",              correct: false },
      { text: "Allez / Viens / Allons-y", correct: true  },
      { text: "Attention !",             correct: false },
      { text: "S'il te plaît",           correct: false },
    ],
    explanation: "'Yallah' (يالله) = 'Allons-y / allez / vite !' Vient de 'ya Allah' (ô Allah). Très utilisé pour inciter à l'action ou exprimer l'impatience. 'Yallah mshi!' = 'Allez, pars !' 'Yallah, shd rasek!' = 'Allez, dépêche-toi !'",
  },
  {
    id: "dar_voc_008", category: "darija", type: "mcq", difficulty: 2,
    question: "Que veut dire 'Hna' en darija ?",
    options: [
      { text: "Là-bas (loin)",             correct: false },
      { text: "Ici / Nous",                correct: true  },
      { text: "Maintenant",                correct: false },
      { text: "Ensemble",                  correct: false },
    ],
    explanation: "'Hna' (هنا) a deux sens selon le contexte : 1) 'ici' (lieu), ex: 'lgles hna!' = 'assieds-toi ici !'. 2) 'nous' (pronom), ex: 'hna mshina' = 'nous sommes allés'. En arabe classique, 'huna' = ici uniquement.",
  },

  // ── HISTOIRE — Plus de questions diff 2-3 ────────────────────────
  {
    id: "his_med_001", category: "history", type: "mcq", difficulty: 2,
    question: "Quelle fut la première mosquée construite dans l'histoire de l'islam ?",
    options: [
      { text: "La Grande Mosquée de La Mecque",    correct: false },
      { text: "La Mosquée de Quba à Médine",        correct: true  },
      { text: "La Mosquée Al-Aqsa à Jérusalem",    correct: false },
      { text: "La Mosquée du Prophète à Médine",   correct: false },
    ],
    explanation: "La Mosquée de Quba (مسجد قباء) fut construite par le Prophète ﷺ dès son arrivée à Médine en 622, avant même la Mosquée du Prophète (Al-Masjid an-Nabawi). Prière de 2 raka'at à Quba = récompense d'une Umra selon un hadith.",
  },
  {
    id: "his_med_002", category: "history", type: "mcq", difficulty: 2,
    question: "Quel calife a compilé le Coran en un seul volume standardisé ?",
    options: [
      { text: "Abu Bakr al-Siddiq",   correct: false },
      { text: "Othman ibn Affan",     correct: true  },
      { text: "Omar ibn al-Khattab",  correct: false },
      { text: "Ali ibn Abi Talib",    correct: false },
    ],
    explanation: "Othman ibn Affan (3e calife, 644-656) ordonna la standardisation du Coran en un seul codex (Mushaf Uthmani) et en envoya des copies aux grandes villes. Ce codex est la base de tous les Corans actuels. Abu Bakr avait initié la compilation écrite pour préserver le Coran après la mort de nombreux Huffaz.",
  },
  {
    id: "his_med_003", category: "history", type: "mcq", difficulty: 2,
    question: "Quel est le titre honorifique du Prophète ﷺ dans le Coran ?",
    options: [
      { text: "Al-Amin (le Fidèle)",          correct: false },
      { text: "Khatam an-Nabiyyin (le sceau des prophètes)", correct: true  },
      { text: "Rasul Allah (le messager d'Allah)", correct: false },
      { text: "Habib Allah (le bien-aimé d'Allah)", correct: false },
    ],
    explanation: "Khatam an-Nabiyyin (خاتم النبيين — Sceau des prophètes) est son titre coranique (33:40). Il est le dernier prophète — aucun autre ne viendra après lui. Ce principe est fondamental dans la croyance islamique.",
  },
  {
    id: "his_med_004", category: "history", type: "mcq", difficulty: 3,
    question: "Qui fonda Al-Azhar en 970 EC et dans quel but ?",
    options: [
      { text: "Les Abbassides — école de droit islamique",                              correct: false },
      { text: "Les Fatimides chiites — mosquée et université pour diffuser le chiisme", correct: true  },
      { text: "Saladin — pour répondre aux Croisés",                                   correct: false },
      { text: "Les Omeyyades — centre administratif",                                  correct: false },
    ],
    explanation: "Al-Azhar fut fondé en 970 par les Fatimides (califes chiites du Caire) pour diffuser l'enseignement chiite ismaélien. Après la conquête de Saladin en 1171, il devint une institution sunnite. Il est aujourd'hui la principale autorité religieuse sunnite mondiale.",
  },
  {
    id: "his_med_005", category: "history", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que la 'Nahda' (نهضة) dans l'histoire islamique moderne ?",
    options: [
      { text: "La révolution industrielle islamique du XIXe siècle",                    correct: false },
      { text: "Le mouvement de renaissance culturelle et intellectuelle arabe (XIXe-XXe s.)", correct: true  },
      { text: "La résistance à la colonisation par les armes",                          correct: false },
      { text: "La réforme administrative de l'empire ottoman",                         correct: false },
    ],
    explanation: "La Nahda (renaissance) fut un mouvement culturel/intellectuel arabo-islamique du XIXe-XXe siècle visant à moderniser la pensée islamique face à la colonisation. Figures : Jamal ad-Din al-Afghani, Muhammad Abduh, Rashid Rida. Leur question centrale : comment l'islam peut-il répondre aux défis de la modernité ?",
  },

  // ── SCHOLARS MATCH — supplémentaires ─────────────────────────────
  {
    id: "sm_008", category: "history", type: "scholars_match", difficulty: 2,
    question: "Associe chaque prophète à son pays/région d'origine",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Ibrahim ﷺ",  work: "Ur (Irak actuel)" },
        { scholar: "Moussa ﷺ",  work: "Égypte" },
        { scholar: "Issa ﷺ",    work: "Jérusalem (Palestine)" },
        { scholar: "Muhammad ﷺ",work: "La Mecque (Arabie)" },
      ],
    },
  },
  {
    id: "sm_009", category: "religion", type: "scholars_match", difficulty: 2,
    question: "Associe chaque pilier de l'Islam à son nom arabe",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Témoignage de foi",   work: "Shahada (شهادة)" },
        { scholar: "Prière",             work: "Salat (صلاة)" },
        { scholar: "Aumône purificatrice",work: "Zakat (زكاة)" },
        { scholar: "Pèlerinage",         work: "Hajj (حج)" },
      ],
    },
  },
  {
    id: "sm_010", category: "history", type: "scholars_match", difficulty: 3,
    question: "Associe chaque invention islamique médiévale à son inventeur",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Al-Jazari",          work: "Automates hydrauliques (horloge)" },
        { scholar: "Al-Zahrawi",         work: "Chirurgie moderne (instruments)" },
        { scholar: "Ibn al-Nafis",       work: "Circulation sanguine pulmonaire" },
        { scholar: "Abbas ibn Firnas",   work: "Premier vol humain (876 EC)" },
      ],
    },
    culturalCapsule: { title: "4 inventeurs, 4 révolutions", text: "Al-Jazari (horloge-éléphant), Al-Zahrawi (père de la chirurgie, Kitab al-Tasrif), Ibn al-Nafis (circulation sanguine, 300 ans avant Harvey) et Abbas ibn Firnas (premier vol humain avec une machine en 876 EC à Cordoue) illustrent la profondeur de l'innovation islamique médiévale." },
  },

  // ── TIMELINE — supplémentaires ───────────────────────────────────
  {
    id: "tl_sup_001", category: "religion", type: "timeline", difficulty: 2,
    question: "Ordonne les quatre grands livres saints par ordre de révélation",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "La Torah (Tawrat) — Moussa ﷺ",       year: -1300, hint: "vers 1300 av. J.-C." },
        { text: "Les Psaumes (Zabur) — Daoud ﷺ",       year: -1000, hint: "vers 1000 av. J.-C." },
        { text: "L'Évangile (Injil) — Issa ﷺ",         year: 0,     hint: "vers l'an 0"          },
        { text: "Le Coran — Muhammad ﷺ",               year: 610,   hint: "610 apr. J.-C."       },
      ],
    },
    explanation: "Les 4 grands livres islamiques : Torah (Moussa), Zabur/Psaumes (Daoud), Injil/Évangile (Issa), Coran (Muhammad ﷺ). Le Coran affirme confirmer et préserver les précédents qui ont été altérés.",
  },
  {
    id: "tl_sup_002", category: "history", type: "timeline", difficulty: 2,
    question: "Ordonne ces événements des premières années de l'islam",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Naissance du Prophète ﷺ à La Mecque",   year: 570 },
        { text: "Mort de Khadija et Abu Talib (Année de Tristesse)", year: 619 },
        { text: "Hégire vers Médine",                     year: 622 },
        { text: "Mort du Prophète ﷺ",                    year: 632 },
      ],
    },
  },
  {
    id: "tl_sup_003", category: "history", type: "timeline", difficulty: 3,
    question: "Ordonne ces grandes conquêtes islamiques",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Conquête de La Mecque",                     year: 630 },
        { text: "Conquête de Jérusalem (Omar)",              year: 638 },
        { text: "Conquête de la Perse — bataille de Qadisiyya", year: 636 },
        { text: "Conquête de l'Égypte",                      year: 641 },
      ],
    },
  },

  // ── ÈRE V — Islam contemporain (diff 4-5) ───────────────────────
  {
    id: "v_001", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que la 'Finance islamique' et sur quel principe repose-t-elle ?",
    options: [
      { text: "Finance réservée aux États islamiques",                       correct: false },
      { text: "Finance interdisant le riba (intérêt) et fondée sur le partage du risque", correct: true  },
      { text: "Finance qui n'utilise que des monnaies d'or et d'argent",     correct: false },
      { text: "Finance gérant les waqf (fondations pieuses) uniquement",     correct: false },
    ],
    culturalCapsule: { title: "Finance islamique — 3 000 milliards $", text: "La finance islamique a atteint 3 000 milliards de dollars en 2023. Elle est basée sur l'interdiction du riba (intérêt), le partage des profits/pertes (musharaka), et les sukuk (obligations islamiques). La Malaisie est le 1er marché mondial, suivie par l'Arabie Saoudite et les Émirats." },
  },
  {
    id: "v_002", category: "history", type: "mcq", difficulty: 3,
    question: "Combien y a-t-il de musulmans dans le monde en 2024 ?",
    options: [
      { text: "500 millions",   correct: false },
      { text: "1 milliard",     correct: false },
      { text: "1,8 milliard",   correct: true  },
      { text: "2,5 milliards",  correct: false },
    ],
    explanation: "En 2024, l'islam est la 2e religion mondiale avec environ 1,8 milliard de fidèles (23% de la population mondiale). Projection : il deviendra la 1re religion mondiale vers 2070 selon le Pew Research Center.",
  },
  {
    id: "v_003", category: "history", type: "mcq", difficulty: 3,
    question: "Quel est le pays avec la plus grande population musulmane au monde ?",
    options: [
      { text: "Arabie Saoudite",  correct: false },
      { text: "Pakistan",         correct: false },
      { text: "Indonésie",        correct: true  },
      { text: "Bangladesh",       correct: false },
    ],
    explanation: "L'Indonésie compte ~230 millions de musulmans (87% de sa population de 270 millions). Elle est suivie par le Pakistan (~220M), l'Inde (~200M) et le Bangladesh (~153M). L'Arabie Saoudite n'est que 12e.",
  },
  {
    id: "v_004", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'est-ce qu'Al-Azhar et quel est son rôle dans l'islam contemporain ?",
    options: [
      { text: "Le palais royal d'Égypte",                                           correct: false },
      { text: "La plus ancienne université du monde (970) et autorité religieuse sunnite mondiale", correct: true  },
      { text: "Le Parlement des États islamiques",                                   correct: false },
      { text: "La mosquée la plus grande d'Afrique",                                correct: false },
    ],
    explanation: "Al-Azhar (970) fut fondé par les Fatimides chiites, puis récupéré par Saladin pour l'enseignement sunnite. Aujourd'hui, ses fatwas ont un poids mondial. Le Grand Imam actuel, Ahmad Al-Tayyeb, intervient sur tout : terrorisme, Islam modéré, dialogue interreligieux.",
  },
  {
    id: "v_005", category: "history", type: "timeline", difficulty: 4,
    question: "Ordonne ces événements de l'histoire islamique moderne",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Chute de l'empire ottoman",           year: 1922 },
        { text: "Création de l'Organisation de la Conférence islamique", year: 1969 },
        { text: "Siège de Sarajevo (guerre de Bosnie)",  year: 1992 },
        { text: "Premier sukuk (obligation islamique)",  year: 2001 },
      ],
    },
  },

  // ── RELIGION — Questions difficiles supplémentaires ──────────────
  {
    id: "rel_adv_x01", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que la 'Silsila' (chaîne spirituelle) dans le soufisme ?",
    options: [
      { text: "La liste des savants qui ont mémorisé le Coran",                    correct: false },
      { text: "La chaîne de transmission spirituelle d'un maître soufi à son disciple jusqu'au Prophète ﷺ", correct: true  },
      { text: "Le catalogue des mosquées historiques",                              correct: false },
      { text: "La généalogie tribale des Quraysh",                                 correct: false },
    ],
    explanation: "La Silsila (سلسلة — chaîne) relie chaque maître soufi (sheikh) à son maître, jusqu'au Prophète ﷺ via Abu Bakr ou Ali. Les grandes Turuq (confréries soufies) : Qadiriyya, Naqshbandiyya, Shadhiliyya, Tijaniyya — chacune avec sa propre silsila.",
  },
  {
    id: "rel_adv_x02", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que le 'Dhikr' dans la pratique spirituelle islamique ?",
    options: [
      { text: "La récitation obligatoire du Coran après chaque prière",              correct: false },
      { text: "Le rappel / la mention continuelle d'Allah par des formules répétées", correct: true  },
      { text: "Le jeûne volontaire du lundi et jeudi",                               correct: false },
      { text: "La retraite spirituelle de 40 jours",                                 correct: false },
    ],
    explanation: "Le Dhikr (ذكر — rappel) est la pratique de répéter les noms et attributs d'Allah. 'Certes, c'est par le rappel d'Allah que les cœurs trouvent la quiétude' (13:28). Formes : Subhanallah (33×), Alhamdulillah (33×), Allahu Akbar (34×) après chaque prière.",
  },
  {
    id: "rel_adv_x03", category: "religion", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que l'Aqiqa dans la tradition islamique ?",
    options: [
      { text: "Le rituel de circoncision",                                         correct: false },
      { text: "Le sacrifice d'un ou deux moutons à la naissance d'un enfant",      correct: true  },
      { text: "La prière du matin avant le lever du soleil",                       correct: false },
      { text: "L'offrande du premier repas du Ramadan",                            correct: false },
    ],
    explanation: "L'Aqiqa (عقيقة) est le sacrifice accompli au 7e jour de la naissance (ou 14e, 21e) : 2 moutons pour un garçon, 1 pour une fille. La viande est partagée entre la famille et les pauvres. La tête est rasée ce jour et son poids en argent donné en aumône.",
  },
  {
    id: "rel_adv_x04", category: "religion", type: "mcq", difficulty: 3,
    question: "Combien y a-t-il de versets (ayat) dans le Coran ?",
    options: [
      { text: "5 000 versets",   correct: false },
      { text: "6 236 versets",   correct: true  },
      { text: "7 777 versets",   correct: false },
      { text: "8 000 versets",   correct: false },
    ],
    explanation: "Le Coran contient 6 236 versets selon la méthode de comptage la plus répandue (riwaya Hafs). D'autres méthodes donnent 6 214 ou 6 219. La différence tient à si certaines basmala sont comptées comme versets distincts.",
  },
  {
    id: "rel_adv_x05", category: "religion", type: "mcq", difficulty: 5,
    question: "Qu'est-ce que l'école 'Athari' en théologie islamique ?",
    options: [
      { text: "Une école qui nie les attributs d'Allah",                               correct: false },
      { text: "Une école qui accepte les attributs divins textuellement sans interprétation (ta'wil)", correct: true  },
      { text: "Une école centrée sur le droit comparé des madhabs",                    correct: false },
      { text: "Une branche moderne du salafisme politique",                             correct: false },
    ],
    explanation: "L'école Athariyya (الأثرية) affirme les attributs d'Allah tels qu'ils apparaissent dans le Coran et la Sunna, sans metaphorisation (ta'wil) ni anthropomorphisme (tashbih). Elle est associée à Ahmad ibn Hanbal et Ibn Taymiyya. Différente des Ash'arites qui utilisent le ta'wil et des Mutazilites qui nient les attributs.",
  },

  // ── CORAN — Questions avancées supplémentaires ──────────────────
  {
    id: "qur_adv_x01", category: "quran", type: "mcq", difficulty: 4,
    question: "Quelle est la sourate qui commence par 7 lettres isolées 'Ha-Mim-Ayn-Sin-Qaf' ?",
    options: [
      { text: "Sourate Ya-Sin (36)",             correct: false },
      { text: "Sourate Ash-Shura (42)",          correct: true  },
      { text: "Sourate Al-Mu'min (40)",           correct: false },
      { text: "Sourate Az-Zukhruf (43)",         correct: false },
    ],
    explanation: "Sourate Ash-Shura (42) commence par 5 lettres isolées : Ha-Mim (ح م) puis Ayn-Sin-Qaf (ع س ق) — ce sont parmi les combinaisons les plus longues des Muqatta'at.",
  },
  {
    id: "qur_adv_x02", category: "quran", type: "mcq", difficulty: 5,
    question: "Selon les savants, quelle est la 'Umm al-Suwar' (mère des sourates) et pourquoi ?",
    options: [
      { text: "Al-Baqara — la plus longue sourate",                          correct: false },
      { text: "Al-Fatiha — elle résume toute la religion et s'ouvre sur les 5 thèmes fondamentaux", correct: true  },
      { text: "Al-Ikhlas — la Tawhid concentrée",                            correct: false },
      { text: "Ya-Sin — cœur du Coran selon un hadith",                     correct: false },
    ],
    explanation: "Al-Fatiha est dite Umm al-Kitab (Mère du Livre) car elle résume : tawhid (Allah Rahman Rahim), jugement (Yawm al-Din), servitude (iyyaka na'budu), guidance (sirat), et distinction bien/mal. Elle est aussi récitée à chaque raka'a — pilier de la prière.",
  },
  {
    id: "qur_adv_x03", category: "quran", type: "mcq", difficulty: 3,
    question: "Quel prophète est mentionné dans le Coran comme 'Kalimullah' (celui à qui Allah parla directement) ?",
    options: [
      { text: "Ibrahim ﷺ",    correct: false },
      { text: "Moussa ﷺ",     correct: true  },
      { text: "Muhammad ﷺ",   correct: false },
      { text: "Issa ﷺ",       correct: false },
    ],
    explanation: "Moussa (Moïse) ﷺ est appelé Kalimullah (كليم الله — celui qu'Allah interpella) car Allah lui parla directement dans le buisson ardent au Sinaï, sans intermédiaire. Le Prophète Muhammad ﷺ reçut la révélation via Jibril (sauf les 50 prières lors du Mi'raj).",
  },

  // ── HISTOIRE — Civilisation islamique profonde ───────────────────
  {
    id: "his_adv_x01", category: "history", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que le 'Barid' dans l'empire islamique médiéval ?",
    options: [
      { text: "Le registre des impôts de l'État",                   correct: false },
      { text: "Le service postal/de renseignement de l'État islamique", correct: true  },
      { text: "La cour de justice du calife",                       correct: false },
      { text: "La garde personnelle du calife",                     correct: false },
    ],
    explanation: "Le Barid (بريد — courrier/poste) fut le service postal officiel des califats omeyyade et abbasside. Il transportait le courrier officiel mais aussi les rapports de renseignement sur les provinces. Certains califes utilisaient des pigeons voyageurs en complément.",
  },
  {
    id: "his_adv_x02", category: "history", type: "mcq", difficulty: 4,
    question: "Qui était Ibn al-Haytham et quelle est sa contribution principale ?",
    options: [
      { text: "Il découvrit la gravité avant Newton",                        correct: false },
      { text: "Il révolutionna l'optique en prouvant que l'œil reçoit la lumière (vs Platon qui disait qu'il l'émet)", correct: true  },
      { text: "Il inventa l'algèbre avec Al-Khwarizmi",                     correct: false },
      { text: "Il fut le premier à cartographier le ciel nocturne",          correct: false },
    ],
    culturalCapsule: { title: "Ibn al-Haytham — père de la méthode scientifique", text: "Ibn al-Haytham (965-1040) réfuta la théorie d'émission de Platon (l'œil envoie des rayons) en prouvant expérimentalement que l'œil reçoit la lumière. Son Kitab al-Manazir (Optique) influença Galilée, Kepler et Newton 600 ans plus tard. Il est aussi considéré le père de la méthode scientifique expérimentale." },
  },
  {
    id: "his_adv_x03", category: "history", type: "mcq", difficulty: 3,
    question: "Que signifie l'expression 'Pax Islamica' (Paix islamique) dans l'histoire médiévale ?",
    options: [
      { text: "L'accord de non-agression entre califats",                       correct: false },
      { text: "La période de stabilité économique et intellectuelle sous l'islam (VIIe-XIIIe s.)", correct: true  },
      { text: "Le traité de paix entre chrétiens et musulmans lors des Croisades", correct: false },
      { text: "La politique de tolérance des Omeyyades en Al-Andalus",          correct: false },
    ],
    explanation: "Par analogie avec la 'Pax Romana', la 'Pax Islamica' désigne la période VIIe-XIIIe siècles où les routes commerciales de l'empire islamique (de l'Atlantique à la Chine) permirent une circulation sans précédent de savoirs, marchandises et idées.",
  },

  // ── SCHOLARS MATCH supplémentaires ──────────────────────────────
  {
    id: "sm_006", category: "history", type: "scholars_match", difficulty: 3,
    question: "Associe chaque savant à sa discipline principale",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Al-Biruni",       work: "Géographie & Indologie" },
        { scholar: "Ibn al-Haytham",  work: "Optique & Physique" },
        { scholar: "Al-Battani",      work: "Astronomie" },
        { scholar: "Jabir ibn Hayyan",work: "Chimie & Alchimie" },
      ],
    },
    culturalCapsule: { title: "4 sciences, 4 révolutions", text: "Al-Biruni (géographie/indologie), Ibn al-Haytham (optique), Al-Battani (astronomie — cité par Copernic) et Jabir ibn Hayyan (chimie — origine du mot 'alcool' en arabe) représentent l'Âge d'Or des sciences islamiques naturelles." },
  },
  {
    id: "sm_007", category: "religion", type: "scholars_match", difficulty: 4,
    question: "Associe chaque courant théologique islamique à son fondateur",
    options: [{ text: "scholars_match", correct: true }],
    minigameData: {
      matchPairs: [
        { scholar: "Abu al-Hasan al-Ash'ari", work: "Ash'arisme" },
        { scholar: "Al-Maturidi",             work: "Maturidisme" },
        { scholar: "Wasil ibn Ata",           work: "Mutazilisme" },
        { scholar: "Ahmad ibn Hanbal",        work: "Atharisme" },
      ],
    },
  },

  // ── ÈRE II — L'Aube de l'Islam ──────────────────────────────────
  {
    id: "ere2_001", category: "religion", type: "mcq", difficulty: 2,
    question: "Pourquoi le Prophète ﷺ a-t-il envoyé des compagnons en Abyssinie en 615 ?",
    options: [
      { text: "Pour faire du commerce avec le roi",                      correct: false },
      { text: "Pour fuir la persécution des Quraysh",                    correct: true  },
      { text: "Pour convertir le roi Al-Negus",                          correct: false },
      { text: "Pour établir une ambassade diplomatique",                  correct: false },
    ],
    eventId: "arc_sira",
    culturalCapsule: { title: "La première Hijra", text: "En 615 EC, le Prophète ﷺ conseilla aux musulmans de se réfugier en Abyssinie chez le roi juste Al-Negus (Ashama ibn Abjar). C'est la première Hijra. 83 hommes et 18 femmes firent le voyage." },
  },
  {
    id: "ere2_002", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel compagnon récita la Sourate Maryam devant le roi Al-Negus, le faisant pleurer ?",
    options: [
      { text: "Abu Bakr al-Siddiq",     correct: false },
      { text: "Ja'far ibn Abi Talib",    correct: true  },
      { text: "Omar ibn al-Khattab",     correct: false },
      { text: "Bilal ibn Rabah",         correct: false },
    ],
    eventId: "arc_sira",
    explanation: "Ja'far ibn Abi Talib récita la Sourate Maryam (19) devant la cour d'Abyssinie. Le roi pleura en entendant les versets sur Issa et Maryam, et dit : 'La différence entre ce que vous dites sur Issa et ce que nous croyons n'est pas plus épaisse que ce bâton.'",
  },
  {
    id: "ere2_003", category: "religion", type: "mcq", difficulty: 1,
    question: "Qu'est-ce que l'Isra' wal Mi'raj ?",
    options: [
      { text: "La migration de La Mecque à Médine",                          correct: false },
      { text: "Le voyage nocturne de La Mecque à Jérusalem puis l'ascension aux cieux", correct: true  },
      { text: "La première révélation dans la grotte de Hira",               correct: false },
      { text: "Le pèlerinage d'adieu du Prophète ﷺ",                        correct: false },
    ],
    eventId: "arc_sira",
    culturalCapsule: { title: "Isra' & Mi'raj — la nuit des nuits", text: "En une seule nuit (27 Rajab selon l'opinion majoritaire), le Prophète ﷺ voyagea de La Mecque à Jérusalem (Isra') puis monta vers les cieux (Mi'raj), rencontrant les prophètes et recevant l'obligation des 5 prières." },
  },
  {
    id: "ere2_004", category: "religion", type: "mcq", difficulty: 2,
    question: "Combien de prières quotidiennes furent-elles initialement prescrites lors du Mi'raj, avant d'être ramenées à 5 ?",
    options: [
      { text: "10 prières",  correct: false },
      { text: "50 prières",  correct: true  },
      { text: "20 prières",  correct: false },
      { text: "7 prières",   correct: false },
    ],
    explanation: "Allah prescrivit d'abord 50 prières. Moussa ﷺ conseilla au Prophète ﷺ de demander une réduction — les allers-retours ramenèrent à 5 prières, chacune valant 10 en récompense. Total effectif : 50 récompenses pour 5 prières.",
  },
  {
    id: "ere2_005", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'est-ce que l'Hégire (Al-Hijra) de 622 ?",
    options: [
      { text: "La première bataille islamique",                     correct: false },
      { text: "La migration du Prophète ﷺ de La Mecque vers Médine", correct: true  },
      { text: "La conquête de La Mecque en 630",                    correct: false },
      { text: "Le décès du Prophète ﷺ",                            correct: false },
    ],
    eventId: "arc_sira",
    explanation: "L'Hégire (622 EC) marque le point de départ du calendrier islamique. Le Prophète ﷺ et Abu Bakr s'y cachèrent 3 jours dans la grotte de Thawr avant de rejoindre Médine. Cette migration fonda la première communauté islamique organisée.",
  },
  {
    id: "ere2_006", category: "religion", type: "mcq", difficulty: 2,
    question: "Qui était Bilal ibn Rabah et quel était son rôle unique ?",
    options: [
      { text: "Un général militaire d'Éthiopie",                        correct: false },
      { text: "Le premier muezzin — celui qui appelait à la prière",    correct: true  },
      { text: "Le premier cadi (juge) de Médine",                       correct: false },
      { text: "Le scribe personnel du Prophète ﷺ",                     correct: false },
    ],
    explanation: "Bilal ibn Rabah, esclave abyssinien libéré par Abu Bakr, fut choisi par le Prophète ﷺ comme premier muezzin en raison de sa voix puissante et mélodieuse. Il refusa de monter sur le minaret après la mort du Prophète ﷺ — trop douloureux.",
  },
  {
    id: "ere2_007", category: "religion", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que la Constitution de Médine (Sahifa al-Madina) ?",
    options: [
      { text: "Le premier document écrit du Coran",                                  correct: false },
      { text: "Un traité entre musulmans, juifs et tribus de Médine établissant une cité-état", correct: true  },
      { text: "Le traité de paix de Hudaybiyya avec les Quraysh",                    correct: false },
      { text: "Les règles de la mosquée du Prophète ﷺ",                             correct: false },
    ],
    eventId: "arc_sira",
    culturalCapsule: { title: "La Constitution de Médine — 622 EC", text: "La Sahifa al-Madina est le premier texte constitutionnel de l'histoire islamique. Elle définit les droits et devoirs des muslims, juifs et tribus arabes de Médine sous l'autorité du Prophète ﷺ. Modèle de coexistence plébiscité par les historiens modernes." },
  },
  {
    id: "ere2_008", category: "religion", type: "mcq", difficulty: 2,
    question: "Quelle est la signification de la bataille de Badr (624 EC) ?",
    options: [
      { text: "La première grande victoire militaire des musulmans contre les Quraysh",     correct: true  },
      { text: "La conquête de La Mecque",                                                   correct: false },
      { text: "La bataille où le Prophète ﷺ fut blessé",                                   correct: false },
      { text: "La victoire contre l'empire byzantin",                                       correct: false },
    ],
    explanation: "Badr (17 Ramadan 2 AH) : 313 musulmans mal équipés vainquirent ~1000 Quraysh. Le Coran en parle comme d'une victoire divine (3:123). 70 Quraysh tués, 70 prisonniers. Premier test majeur de la communauté médinoise.",
  },
  {
    id: "ere2_009", category: "religion", type: "mcq", difficulty: 3,
    question: "Pourquoi la bataille d'Uhud (625) fut-elle douloureuse pour les musulmans ?",
    options: [
      { text: "L'armée musulmane fut complètement détruite",                           correct: false },
      { text: "Les archers quittèrent leur poste par souci du butin, causant une contre-attaque", correct: true  },
      { text: "Le Prophète ﷺ fut capturé par les Quraysh",                            correct: false },
      { text: "Les alliés juifs de Médine trahirent les musulmans",                    correct: false },
    ],
    explanation: "À Uhud, les archers placés en position défensive quittèrent leur poste pensant la victoire acquise. Khalid ibn al-Walid (encore Quraysh) exploita cette brèche. 70 compagnons furent martyrisés dont Hamza, oncle du Prophète ﷺ.",
  },
  {
    id: "ere2_010", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel fut l'apport de Salmane al-Farisi à la bataille de Khandak (627) ?",
    options: [
      { text: "Il négocia la paix avec les tribus adverses",            correct: false },
      { text: "Il proposa de creuser un fossé défensif — stratégie perse inconnue en Arabie", correct: true  },
      { text: "Il mena la cavalerie muslimane au combat",               correct: false },
      { text: "Il convertit les alliés juifs de Médine",                correct: false },
    ],
    culturalCapsule: { title: "Le fossé — génie perse en Arabie", text: "Salmane al-Farisi, de culture perse, proposa de creuser un fossé (khandaq) autour de Médine. Inconnue en Arabie, cette tactique défensive stoppa une coalition de 10 000 guerriers pendant 27 jours. 'Salmane est de nous, ahl al-bayt,' dit le Prophète ﷺ." },
  },
  {
    id: "ere2_011", category: "religion", type: "mcq", difficulty: 3,
    question: "Quel est le traité de Hudaybiyya (628) et pourquoi est-il considéré comme une 'victoire claire' ?",
    options: [
      { text: "Un traité militaire imposé après la conquête de La Mecque",                   correct: false },
      { text: "Un traité de paix 10 ans qui permit la propagation de l'islam sans guerre",    correct: true  },
      { text: "L'accord de reddition de Khaybar",                                            correct: false },
      { text: "La trêve avec les Byzantins pour protéger les routes commerciales",            correct: false },
    ],
    explanation: "À Hudaybiyya, le Prophète ﷺ accepta des conditions apparemment défavorables (pas d'entrée à La Mecque ce year). Mais la paix de 10 ans permit une expansion massive : 100 000 combattants lors de la conquête de La Mecque vs 1 500 à Hudaybiyya. Le Coran l'appela 'fath mubin' (victoire évidente, 48:1).",
  },
  {
    id: "ere2_012", category: "religion", type: "mcq", difficulty: 2,
    question: "Qui était Khadija bint Khuwaylid et quel rôle joua-t-elle ?",
    options: [
      { text: "La première femme à diriger une tribu mecquoise",                        correct: false },
      { text: "La première épouse du Prophète ﷺ et première convertie à l'islam",      correct: true  },
      { text: "La fille du calife Omar ibn al-Khattab",                                 correct: false },
      { text: "Une savante qui compila les hadiths du Prophète ﷺ",                     correct: false },
    ],
    explanation: "Khadija bint Khuwaylid (555-619) fut la première personne à croire en la mission du Prophète ﷺ. Riche marchande, elle l'avait d'abord engagé puis épousé. Elle le soutint financièrement et moralement. Le Prophète ﷺ dit d'elle : 'Nulle femme ne m'a été meilleure.'",
  },

  // ── ÈRE II QUESTIONS — Timeline ──────────────────────────────────
  {
    id: "tl_ere2_001", category: "religion", type: "timeline", difficulty: 3,
    question: "Ordonne ces événements de la vie du Prophète ﷺ",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Première révélation (Hira)",               year: 610 },
        { text: "Première Hijra en Abyssinie",               year: 615 },
        { text: "Isra' wal Mi'raj — voyage nocturne",        year: 621 },
        { text: "Hégire vers Médine",                        year: 622 },
      ],
    },
    eventId: "arc_sira",
  },
  {
    id: "tl_ere2_002", category: "religion", type: "timeline", difficulty: 3,
    question: "Ordonne ces grandes batailles de la période médinoise",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Bataille de Badr",       year: 624 },
        { text: "Bataille d'Uhud",        year: 625 },
        { text: "Bataille de Khandak",    year: 627 },
        { text: "Conquête de La Mecque",  year: 630 },
      ],
    },
  },

  // ── TIMELINE — Ordre chronologique ──────────────────────────────
  {
    id: "tl_001", category: "history", type: "timeline", difficulty: 2,
    question: "Remets ces événements dans l'ordre chronologique",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Naissance du Prophète Muhammad ﷺ",   year: 570  },
        { text: "Première révélation (Hira)",           year: 610  },
        { text: "Hégire (migration vers Médine)",       year: 622  },
        { text: "Conquête de La Mecque",                year: 630  },
      ],
    },
    culturalCapsule: { title: "Les 60 ans du Prophète ﷺ", text: "Muhammad ﷺ naquit en 570, reçut la révélation à 40 ans (610), migra à Médine à 52 ans (622), et conquit La Mecque sans violence à 60 ans (630)." },
  },
  {
    id: "tl_002", category: "history", type: "timeline", difficulty: 2,
    question: "Ordonne les quatre califes dans le temps",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Califat d'Abu Bakr",   year: 632 },
        { text: "Califat d'Omar",        year: 634 },
        { text: "Califat d'Othman",      year: 644 },
        { text: "Califat d'Ali",         year: 656 },
      ],
    },
  },
  {
    id: "tl_003", category: "history", type: "timeline", difficulty: 3,
    question: "Remets ces dynasties islamiques dans l'ordre chronologique",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Omeyyades — Damas",       year: 661  },
        { text: "Abbassides — Bagdad",      year: 750  },
        { text: "Fatimides — Le Caire",     year: 909  },
        { text: "Empire ottoman — Istanbul",year: 1299 },
      ],
    },
    culturalCapsule: { title: "1600 ans de pouvoir islamique", text: "Omeyyades (661-750), Abbassides (750-1258), Fatimides (909-1171) et Ottomans (1299-1922) se succèdent et se chevauchent dans l'histoire islamique mondiale." },
  },
  {
    id: "tl_004", category: "history", type: "timeline", difficulty: 3,
    question: "Ordonne ces savants du plus ancien au plus récent",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Al-Khwarizmi — mathématiques", year: 780  },
        { text: "Ibn Sina — médecine",           year: 980  },
        { text: "Ibn Rushd — philosophie",       year: 1126 },
        { text: "Ibn Khaldoun — sociologie",     year: 1332 },
      ],
    },
  },
  {
    id: "tl_005", category: "religion", type: "timeline", difficulty: 2,
    question: "Ordonne ces prophètes du plus ancien au plus récent",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Ibrahim ﷺ — père des prophètes", year: -2000, hint: "vers 2000 av. J.-C." },
        { text: "Moussa ﷺ — la Torah",             year: -1300, hint: "vers 1300 av. J.-C." },
        { text: "Issa ﷺ — l'Injil",                year: 0,     hint: "vers l'an 0"          },
        { text: "Muhammad ﷺ — le Coran",           year: 570,   hint: "570 apr. J.-C."       },
      ],
    },
    culturalCapsule: { title: "La chaîne de la prophétie", text: "Les prophètes majeurs s'étalent sur 2500 ans d'histoire. Ibrahim et Muhammad ﷺ sont liés par leur descendance : Muhammad ﷺ est de la lignée d'Ismaïl, fils d'Ibrahim." },
  },
  {
    id: "tl_006", category: "history", type: "timeline", difficulty: 2,
    question: "Ordonne ces grandes mosquées par date de construction",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Mosquée de Médine",         year: 622  },
        { text: "Mosquée Al-Aqsa (Jérusalem)", year: 691 },
        { text: "Mosquée Al-Azhar (Le Caire)",  year: 972 },
        { text: "Mosquée Süleymaniye (Istanbul)",year: 1557},
      ],
    },
  },
  {
    id: "tl_007", category: "quran", type: "timeline", difficulty: 3,
    question: "Dans quel ordre ces sourates furent-elles révélées ?",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Al-Alaq (\"Lis au nom de ton Seigneur\")", year: 1,  hint: "1re révélée" },
        { text: "Al-Fatiha",                                  year: 5,  hint: "Mecquoise" },
        { text: "Al-Baqara",                                  year: 23, hint: "Médinoise" },
        { text: "Al-Maïda (\"Aujourd'hui, j'ai parachevé\")", year: 27, hint: "Dernière majeure" },
      ],
    },
    culturalCapsule: { title: "23 ans de révélation", text: "Le Coran fut révélé progressivement sur 23 ans (610-632). Al-Alaq fut la 1re sourate ; Al-Maïda contient l'un des derniers versets révélés." },
  },
  {
    id: "tl_008", category: "history", type: "timeline", difficulty: 3,
    question: "Ordonne ces conquêtes islamiques dans le temps",
    options: [{ text: "timeline", correct: true }],
    minigameData: {
      events: [
        { text: "Conquête de Jérusalem",          year: 637  },
        { text: "Conquête de l'Espagne (Al-Andalus)", year: 711 },
        { text: "Conquête de Constantinople",      year: 1453 },
        { text: "Prise de Grenade (fin Al-Andalus)", year: 1492 },
      ],
    },
  },

  // ── HADITH COMPLET — MCQ sur hadiths célèbres ────────────────────
  {
    id: "had_001", category: "religion", type: "mcq", difficulty: 1,
    question: "Complète ce hadith : 'Les actions dépendent des...'",
    options: [
      { text: "intentions",       correct: true  },
      { text: "paroles",          correct: false },
      { text: "circonstances",    correct: false },
      { text: "compagnons",       correct: false },
    ],
    explanation: "Hadith rapporté par Omar ibn al-Khattab : 'Les actions ne valent que par les intentions, et chaque homme n'a que ce qu'il a voulu.' (Al-Bukhari, Muslim)",
  },
  {
    id: "had_002", category: "religion", type: "mcq", difficulty: 1,
    question: "Complète ce hadith : 'Le musulman est celui dont les musulmans sont à l'abri de sa...'",
    options: [
      { text: "langue et de sa main",      correct: true  },
      { text: "jalousie et de sa colère",  correct: false },
      { text: "maison et de son argent",   correct: false },
      { text: "famille et de ses enfants", correct: false },
    ],
    explanation: "Hadith de Abdullah ibn Amr : 'Le musulman est celui dont les musulmans sont à l'abri de sa langue et de sa main.' (Al-Bukhari)",
  },
  {
    id: "had_003", category: "religion", type: "mcq", difficulty: 2,
    question: "Complète ce hadith du Prophète ﷺ : 'Cherchez le savoir, même en...'",
    options: [
      { text: "Chine",              correct: true  },
      { text: "enfer",              correct: false },
      { text: "exil",               correct: false },
      { text: "vieillesse",         correct: false },
    ],
    explanation: "'Cherchez le savoir, même en Chine.' Ce hadith exprime l'obligation de chercher la connaissance sans limites géographiques ni temporelles.",
  },
  {
    id: "had_004", category: "religion", type: "mcq", difficulty: 2,
    question: "Complète ce hadith : 'La meilleure des aumônes est celle que donne quelqu'un qui...'",
    options: [
      { text: "possède peu",               correct: true  },
      { text: "est le plus riche",          correct: false },
      { text: "donne en secret",            correct: false },
      { text: "n'attend rien en retour",    correct: false },
    ],
    explanation: "Hadith d'Abu Huraira : 'La meilleure des aumônes est celle que donne quelqu'un qui possède peu.' (Al-Bukhari) Cela montre que la valeur du don est liée à l'effort, pas à la quantité.",
  },
  {
    id: "had_005", category: "religion", type: "mcq", difficulty: 2,
    question: "Complète ce hadith : 'Nul d'entre vous n'est croyant tant qu'il n'aime pas pour son frère...'",
    options: [
      { text: "ce qu'il aime pour lui-même", correct: true  },
      { text: "ce qu'il possède",            correct: false },
      { text: "la réussite et le bonheur",   correct: false },
      { text: "ce qu'il aime pour sa famille",correct: false },
    ],
    culturalCapsule: { title: "La fraternité en islam", text: "Ce hadith d'Anas ibn Malik (Al-Bukhari, Muslim) définit la foi par l'amour fraternel. Il exige une générosité d'âme : vouloir pour autrui ce qu'on désire pour soi-même, et non juste l'absence de jalousie." },
  },
  {
    id: "had_006", category: "religion", type: "mcq", difficulty: 3,
    question: "Complète ce hadith : 'La pudeur (haya) est une branche de...'",
    options: [
      { text: "la foi (iman)",          correct: true  },
      { text: "la sagesse",              correct: false },
      { text: "l'adoration",            correct: false },
      { text: "la prière",              correct: false },
    ],
    explanation: "Hadith d'Abu Huraira : 'La foi comporte soixante-dix et quelques branches, et la pudeur est une branche de la foi.' (Al-Bukhari, Muslim) La haya (pudeur/retenue) est une valeur centrale en islam.",
  },

  // ── CALLIGRAPHIE ARABE (suite) ───────────────────────────────────
  {
    id: "cal_009", category: "arabic", type: "calligraphy", difficulty: 1,
    question: "Trace la lettre : ر (Ra)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "ر",
      letterTranslit: "Ra — prononcé [r]",
      strokeHints: ["Courbe courte vers le bas", "Commence à droite, incline vers la gauche"],
      passCoverage: 0.30,
    },
    explanation: "Ra (ر) est la 10e lettre. Roulée légèrement, surtout en début de mot.",
  },
  {
    id: "cal_010", category: "arabic", type: "calligraphy", difficulty: 2,
    question: "Trace la lettre : ت (Ta)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "ت",
      letterTranslit: "Ta — prononcé [t]",
      strokeHints: ["Trait horizontal légèrement courbé", "Deux points au-dessus"],
      passCoverage: 0.35,
    },
    explanation: "Ta (ت) est la 3e lettre. Presque identique au Ba (ب) mais avec deux points au-dessus.",
  },
  {
    id: "cal_011", category: "arabic", type: "calligraphy", difficulty: 2,
    question: "Trace la lettre : س (Sin)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "س",
      letterTranslit: "Sin — prononcé [s]",
      strokeHints: ["Trois dents horizontales", "Queue vers la gauche et le bas"],
      passCoverage: 0.36,
    },
    culturalCapsule: {
      title: "Sin — lettre de la paix",
      text: "Sin (س) commence le mot سَلَام (Salâm — paix). Dans le style Thuluth, ses trois dents sont tracées avec une légèreté comparable aux vagues de la mer.",
    },
  },
  {
    id: "cal_012", category: "arabic", type: "calligraphy", difficulty: 3,
    question: "Trace la lettre : ع (Ayn)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "ع",
      letterTranslit: "Ayn — prononcé [ʕ] (son guttural)",
      strokeHints: ["Petite boucle ouverte à droite", "Queue courbée vers le bas puis gauche"],
      passCoverage: 0.40,
    },
    culturalCapsule: {
      title: "Ayn — l'œil de l'alphabet",
      text: "Ayn (ع) est l'une des lettres les plus difficiles à prononcer pour les non-arabophones — son son guttural n'existe pas en français. Elle commence le mot عِلْم (ʕilm — science/connaissance).",
    },
  },
  {
    id: "cal_013", category: "arabic", type: "calligraphy", difficulty: 3,
    question: "Trace la lettre : ق (Qaf)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "ق",
      letterTranslit: "Qaf — prononcé [q] (profond dans la gorge)",
      strokeHints: ["Cercle quasi-complet", "Deux points en dessous", "Petite queue vers le bas"],
      passCoverage: 0.40,
    },
    explanation: "Qaf (ق) ouvre la sourate 50 : 'Qâf. Par le Coran glorieux.' Symbole du divin dans la tradition soufie.",
  },
  {
    id: "cal_014", category: "arabic", type: "calligraphy", difficulty: 4,
    question: "Trace le mot : محمد (Muhammad)",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "محمد",
      letterTranslit: "Muḥammad [mou-ħam-mad] — le Très Loué",
      strokeHints: ["Mim (م) : boucle à gauche", "Ha (ح) : courbe entre deux pattes", "Mim (م) : deuxième boucle", "Dal (د) : courbe finale"],
      passCoverage: 0.42,
    },
    culturalCapsule: {
      title: "محمد — le nom le plus porté au monde",
      text: "Le nom Muhammad (محمد) vient de la racine ḥ-m-d (louange). Le Prophète ﷺ est mentionné 4 fois dans le Coran sous ce nom. Des millions de calligraphes ont consacré leur vie à embellir ces quatre lettres.",
    },
  },
  {
    id: "cal_015", category: "arabic", type: "calligraphy", difficulty: 4,
    question: "Trace : بسم الله الرحمن الرحيم",
    options: [{ text: "calligraphy", correct: true }],
    minigameData: {
      letter: "بسم الله",
      letterTranslit: "Bismillāh ir-Raḥmān ir-Raḥīm — Au nom d'Allah, le Très Miséricordieux",
      strokeHints: ["Ba-Sin-Mim liés en un seul mouvement", "Alif-Lam-Lam-Ha pour Allah", "Détache chaque groupe"],
      passCoverage: 0.38,
    },
    culturalCapsule: {
      title: "La Basmala — le souffle de toute chose",
      text: "La Basmala ouvre 113 sourates du Coran (toutes sauf At-Tawba). Elle est récitée avant chaque action importante. En calligraphie, la maîtriser est l'une des premières grandes épreuves de l'apprenti.",
    },
  },

  // ── RELIGION — Difficile (diff 3-5) ─────────────────────────────
  {
    id: "rel_adv_001", category: "religion", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que le 'Ijma' en jurisprudence islamique ?",
    options: [
      { text: "L'opinion personnelle d'un savant",           correct: false },
      { text: "Le consensus des savants de la Oumma",        correct: true  },
      { text: "L'analogie avec un cas existant (Qiyas)",     correct: false },
      { text: "Le raisonnement par l'intérêt général",       correct: false },
    ],
    explanation: "L'Ijma (إجماع) est le consensus des savants musulmans sur une question religieuse. Avec le Coran, la Sunna et le Qiyas, c'est l'une des quatre sources du fiqh selon l'école Hanafite.",
  },
  {
    id: "rel_adv_002", category: "religion", type: "mcq", difficulty: 3,
    question: "Quels sont les quatre madhabs (écoles juridiques) sunnites ?",
    options: [
      { text: "Hanafite, Malékite, Shaféite, Hanbalite",    correct: true  },
      { text: "Hanafite, Malékite, Jafarite, Zaydite",       correct: false },
      { text: "Shaféite, Hanbalite, Ibadite, Mutazilite",    correct: false },
      { text: "Malékite, Hanbalite, Wahhabi, Salafi",        correct: false },
    ],
    culturalCapsule: { title: "Les 4 écoles du fiqh", text: "Abu Hanifa (699-767), Malik ibn Anas (711-795), Muhammad al-Shafi'i (767-820) et Ahmad ibn Hanbal (780-855) ont fondé les quatre grandes écoles juridiques. Elles divergent sur des points de détail mais s'accordent sur les fondamentaux." },
  },
  {
    id: "rel_adv_003", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'appelle-t-on 'Naskh' dans les sciences du Coran ?",
    options: [
      { text: "La mémorisation du Coran",                              correct: false },
      { text: "L'abrogation d'un verset par un verset ultérieur",      correct: true  },
      { text: "La calligraphie coufique ancienne",                     correct: false },
      { text: "La transmission orale du Coran",                        correct: false },
    ],
    explanation: "Le Naskh (نسخ — abrogation) est le remplacement d'une règle par une autre plus récente dans le texte coranique. Exemple : l'interdiction progressive de l'alcool. Les savants débattent du nombre exact de versets abrogés.",
  },
  {
    id: "rel_adv_004", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que la 'Aqida Tahawiyya ?",
    options: [
      { text: "Un traité de jurisprudence malékite",             correct: false },
      { text: "Un exposé de croyance sunnite du IXe siècle",    correct: true  },
      { text: "Un recueil de hadiths faibles",                   correct: false },
      { text: "La doctrine des Mutazilites sur le Coran",        correct: false },
    ],
    explanation: "La Aqida Tahawiyya est rédigée par Abu Ja'far al-Tahawi (853-933). Ce texte résume la croyance des Ahl al-Sunna wa al-Jama'a et fait encore autorité aujourd'hui dans les institutions traditionnelles.",
  },
  {
    id: "rel_adv_005", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que le 'Tawassul' et quel est son statut en islam ?",
    options: [
      { text: "L'intercession directe des saints — unanimement autorisée",              correct: false },
      { text: "Le fait de s'approcher d'Allah via des bonnes œuvres ou le Prophète ﷺ — débattu selon les savants", correct: true  },
      { text: "La prière collective du vendredi",                                        correct: false },
      { text: "L'utilisation des noms d'Allah dans les invocations (du'a)",              correct: false },
    ],
    explanation: "Le Tawassul (intercession) divise les savants. La majorité autorise l'intercession par les actes pieux ou par le Prophète ﷺ en vie. L'intercession par les morts est débattue entre Malékites/Shaféites (permis) et une minorité (interdit).",
  },
  {
    id: "rel_adv_006", category: "religion", type: "mcq", difficulty: 3,
    question: "Combien de Rukn (piliers) compte la prière islamique selon l'école Shaféite ?",
    options: [
      { text: "7 piliers",   correct: false },
      { text: "14 piliers",  correct: true  },
      { text: "5 piliers",   correct: false },
      { text: "17 piliers",  correct: false },
    ],
    explanation: "L'école Shaféite compte 14 arkan (piliers) de la salat : l'intention, le takbir d'entrée, la station debout, la Fatiha, l'inclinaison (ruku'), le redressement, les deux prosternations, l'assise finale, le tashahhud, la bénédiction sur le Prophète ﷺ, le salam.",
  },
  {
    id: "rel_adv_007", category: "religion", type: "mcq", difficulty: 3,
    question: "Quel est le seuil du Nisab (seuil de la Zakat) en or ?",
    options: [
      { text: "20 mithqal (environ 85g d'or)",   correct: true  },
      { text: "40 mithqal (environ 170g d'or)",  correct: false },
      { text: "10 mithqal (environ 43g d'or)",   correct: false },
      { text: "100 dirham d'argent uniquement",  correct: false },
    ],
    explanation: "Le Nisab or est de 20 mithqal (≈85g d'or pur). Pour l'argent : 200 dirhams (≈595g d'argent). La Zakat est due à 2,5% sur la valeur possédée pendant un an (hawl) au-dessus de ce seuil.",
  },
  {
    id: "rel_adv_008", category: "religion", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que la 'Sunna Mu'akkada' ?",
    options: [
      { text: "Une prière obligatoire ajoutée après la Fardh",            correct: false },
      { text: "Une sunna que le Prophète ﷺ accomplissait régulièrement et ne quittait que rarement", correct: true  },
      { text: "Une innovation approuvée par les savants",                  correct: false },
      { text: "La prière du vendredi en remplacement du Dhuhr",           correct: false },
    ],
    explanation: "La Sunna Mu'akkada (sunna confirmée) est celle que le Prophète ﷺ accomplissait systématiquement. Son abandon sans raison est déconseillé (makruh). Exemple : les 2 rakat avant le Fajr, les 2 rakat après le Maghrib.",
  },

  // ── HISTOIRE ISLAMIQUE — Difficile (diff 3-5) ───────────────────
  {
    id: "his_adv_001", category: "history", type: "mcq", difficulty: 3,
    question: "Qui était Al-Hajjaj ibn Yusuf et quel rôle a-t-il joué sous les Omeyyades ?",
    options: [
      { text: "Un poète de cour célèbre pour ses odes au calife",      correct: false },
      { text: "Un général et gouverneur redouté, maître de l'Irak et l'Iran", correct: true  },
      { text: "Le fondateur de la ville de Koufa",                     correct: false },
      { text: "Le premier cadi (juge) de Bagdad",                      correct: false },
    ],
    explanation: "Al-Hajjaj (661-714) fut le gouverneur de l'Iraq, connu pour sa rigueur extrême et l'expansion omeyyade vers l'Inde (Muhammad ibn Qasim) et l'Asie centrale. Il fit aussi normaliser l'écriture arabe avec les points diacritiques.",
  },
  {
    id: "his_adv_002", category: "history", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que la 'Maison de la Sagesse' (Bayt al-Hikma) de Bagdad ?",
    options: [
      { text: "Le palais royal des califes abbassides",                 correct: false },
      { text: "Un centre de traduction et de recherche scientifique fondé au IXe siècle", correct: true  },
      { text: "La première mosquée construite à Bagdad",                correct: false },
      { text: "Le trésor public des Abbassides",                       correct: false },
    ],
    culturalCapsule: { title: "Bayt al-Hikma — carrefour des savoirs", text: "Fondée sous Haroun al-Rashid et développée par Al-Ma'mun (813-833), la Maison de la Sagesse traduit des œuvres grecques, persanes et indiennes. Euclide, Aristote, Platon, Galien y deviennent accessibles en arabe. Elle brûle lors du sac mongol en 1258." },
  },
  {
    id: "his_adv_003", category: "history", type: "mcq", difficulty: 4,
    question: "Quelle est la signification de la bataille de Zallaqah (1086) en Al-Andalus ?",
    options: [
      { text: "La première défaite des musulmans face aux chrétiens en Espagne",       correct: false },
      { text: "La victoire des Almoravides sur Alphonse VI qui sauva Al-Andalus",      correct: true  },
      { text: "La conquête de Tolède par les musulmans",                               correct: false },
      { text: "La bataille finale de la Reconquista",                                  correct: false },
    ],
    explanation: "À Zallaqah (Sagrajas), Yusuf ibn Tashfin des Almoravides écrasa Alphonse VI de Castille. Cette victoire retarda la chute d'Al-Andalus d'un siècle. Ibn Tashfin était ensuite reparti en Afrique, laissant Alphonse affaibli mais vivant.",
  },
  {
    id: "his_adv_004", category: "history", type: "mcq", difficulty: 4,
    question: "Pourquoi le calife Al-Mu'tasim bil-lah (833-842) est-il historiquement controversé ?",
    options: [
      { text: "Il interdit la traduction des textes grecs",             correct: false },
      { text: "Il introduit les Turcs comme garde prétorienne, affaiblissant le pouvoir abbasside", correct: true  },
      { text: "Il abandonna Bagdad pour fonder une nouvelle capitale",  correct: false },
      { text: "Il imposa le Mutazilisme par la force (Mihna)",          correct: false },
    ],
    explanation: "Al-Mu'tasim fut le premier calife à recruter massivement des soldats turcs esclaves (ghulam). Si cela renforça l'armée, cela créa une élite turque qui finit par contrôler les califes successifs, inaugurant le déclin du pouvoir abbasside réel.",
  },
  {
    id: "his_adv_005", category: "history", type: "mcq", difficulty: 3,
    question: "Quel événement mit fin à l'empire abbasside de Bagdad en 1258 ?",
    options: [
      { text: "La conquête des Croisés",                        correct: false },
      { text: "Le sac de Bagdad par Hulagu Khan (Mongols)",     correct: true  },
      { text: "Une révolution interne des vizirs",              correct: false },
      { text: "La victoire ottomane sur les Abbassides",        correct: false },
    ],
    culturalCapsule: { title: "1258 — La fin d'un monde", text: "Hulagu Khan (petit-fils de Gengis Khan) détruit Bagdad en 7 jours. Le calife Al-Musta'sim est exécuté. Selon les chroniqueurs, les livres de la bibliothèque noircirent le Tigre. C'est la fin de l'Âge d'Or abbasside." },
  },
  {
    id: "his_adv_006", category: "history", type: "mcq", difficulty: 3,
    question: "Quel sultan ottoman conquit Constantinople en 1453 et quel était son âge ?",
    options: [
      { text: "Suleiman le Magnifique, 46 ans",     correct: false },
      { text: "Mehmed II (El-Fatih), 21 ans",       correct: true  },
      { text: "Selim Ier, 34 ans",                  correct: false },
      { text: "Bayezid II, 29 ans",                 correct: false },
    ],
    explanation: "Mehmed II, surnommé El-Fatih (le Conquérant), prit Constantinople à 21 ans après un siège de 53 jours. Il fit transformer Sainte-Sophie en mosquée et transforma Istanbul en nouvelle capitale ottomane.",
  },
  {
    id: "his_adv_007", category: "history", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que le 'Devshirme' dans l'empire ottoman ?",
    options: [
      { text: "Le système de collecte de l'impôt dans les provinces",       correct: false },
      { text: "Le recrutement forcé d'enfants chrétiens convertis pour l'armée et l'État", correct: true  },
      { text: "La langue administrative de la cour ottomane",               correct: false },
      { text: "Le titre du grand vizir sous les Ottomans",                  correct: false },
    ],
    explanation: "Le Devshirme (« ramassage ») était le système ottoman de recrutement d'enfants de familles chrétiennes, convertis à l'islam et formés pour servir dans les janissaires ou l'administration. Ces hommes pouvaient atteindre les plus hauts postes — Sokollu Mehmed Pacha fut grand vizir 14 ans.",
  },
  {
    id: "his_adv_008", category: "history", type: "mcq", difficulty: 3,
    question: "Qui était Saladin (Salah ad-Din) avant de reprendre Jérusalem en 1187 ?",
    options: [
      { text: "Le sultan seldjoukide de Perse",                           correct: false },
      { text: "Le vizir fatimide d'Égypte devenu sultan ayyoubide",       correct: true  },
      { text: "Le chef des Almoravides d'Afrique du Nord",                correct: false },
      { text: "Le calife abbasside de Bagdad",                           correct: false },
    ],
    culturalCapsule: { title: "Saladin — l'unificateur", text: "Salah ad-Din Yusuf ibn Ayyub (1137-1193) fut d'abord vizir du califat fatimide chiite d'Égypte avant d'unifier l'Égypte et la Syrie sous la bannière sunnite. Sa victoire à Hattin (1187) ouvrit la route de Jérusalem. Il est célèbre pour sa clémence envers les Croisés vaincus." },
  },
  {
    id: "his_adv_009", category: "history", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que la 'Fitna' (la grande discorde) dans l'histoire islamique ?",
    options: [
      { text: "Les guerres contre l'empire byzantin",                                correct: false },
      { text: "Les guerres civiles entre musulmans après l'assassinat d'Othman (656)", correct: true  },
      { text: "Les persécutions des Croisés contre les musulmans",                   correct: false },
      { text: "La période d'ignorance (Jahiliyya) avant l'islam",                   correct: false },
    ],
    explanation: "La Première Fitna (656-661) éclate après l'assassinat du calife Othman. Batailles de Jamal (656 — Ali vs Aïcha) et Siffin (657 — Ali vs Mu'awiya). Ce conflit creusa le schisme sunnite-chiite dont les échos persistent aujourd'hui.",
  },
  {
    id: "his_adv_010", category: "history", type: "mcq", difficulty: 3,
    question: "Quelle fut la réforme majeure introduite par Omar ibn al-Khattab ﺭﺿﻲ ﷲ ﻋﻨﻪ ?",
    options: [
      { text: "La compilation du Coran en un seul volume",              correct: false },
      { text: "La création du calendrier hégirien et le Diwan (registre d'État)", correct: true  },
      { text: "L'introduction de la monnaie islamique frappée",         correct: false },
      { text: "La fondation des premières écoles coraniques",           correct: false },
    ],
    explanation: "Omar ibn al-Khattab instaura le calendrier hégirien (622 = an 1) et créa le Diwan — un registre bureaucratique pour administrer l'État et distribuer les pensions aux soldats et familles. Ces réformes posèrent les bases administratives du premier empire islamique.",
  },

  // ── CORAN — Difficile (diff 3-5) ────────────────────────────────
  {
    id: "qur_adv_001", category: "quran", type: "mcq", difficulty: 3,
    question: "Qu'est-ce que les 'Muqatta'at' dans le Coran ?",
    options: [
      { text: "Les versets révélés à Médine uniquement",                    correct: false },
      { text: "Les lettres isolées au début de certaines sourates (Alif-Lam-Mim...)", correct: true  },
      { text: "Les sourates les plus courtes du Coran",                     correct: false },
      { text: "Les versets sur l'eschatologie (fin des temps)",             correct: false },
    ],
    explanation: "Les Muqatta'at (lettres détachées) ouvrent 29 sourates : Alif-Lam-Mim, Ha-Mim, Nun, Qaf, etc. Leur signification exacte reste mystérieuse. Ibn Abbas disait qu'elles font partie des 'secrets d'Allah'. Elles représentent 14 lettres distinctes sur 28.",
  },
  {
    id: "qur_adv_002", category: "quran", type: "mcq", difficulty: 3,
    question: "Combien de 'Sajda' (prosternations de récitation) le Coran contient-il ?",
    options: [
      { text: "7 sajda",   correct: false },
      { text: "14 sajda",  correct: true  },
      { text: "21 sajda",  correct: false },
      { text: "10 sajda",  correct: false },
    ],
    explanation: "Le Coran contient 14 sajda al-tilawa selon l'opinion majoritaire (15 selon Shaféites et Hanbalites). Quand on lit ou entend un verset de prosternation, il est recommandé (voire obligatoire selon certains) de se prosterner.",
  },
  {
    id: "qur_adv_003", category: "quran", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que la 'Qira'at Sab'a' ?",
    options: [
      { text: "Les 7 premières sourates révélées à La Mecque",             correct: false },
      { text: "Les 7 lectures coraniques canoniques transmises par les Imams de récitation", correct: true  },
      { text: "Les 7 dialectes arabes dans lesquels le Coran fut révélé",  correct: false },
      { text: "Les 7 copies du Coran d'Othman envoyées aux provinces",     correct: false },
    ],
    culturalCapsule: { title: "Les 7 lectures — science vivante", text: "Les Qira'at Sab'a sont les 7 lectures authentiques du Coran, transmises par chaîne ininterrompue (Nafi', Ibn Kathir, Abu Amr, Ibn Amir, Asim, Hamza, Al-Kisa'i). La lecture d'Hafs (transmission d'Asim) est la plus répandue aujourd'hui." },
  },
  {
    id: "qur_adv_004", category: "quran", type: "mcq", difficulty: 4,
    question: "Quel est le verset considéré comme 'le plus grand du Coran' selon un hadith célèbre ?",
    options: [
      { text: "Al-Fatiha (1:1)",           correct: false },
      { text: "Ayat al-Kursi (2:255)",      correct: true  },
      { text: "Al-Ikhlas (112:1)",          correct: false },
      { text: "La Basmala",                 correct: false },
    ],
    explanation: "Ubay ibn Ka'b demanda au Prophète ﷺ quel était le plus grand verset — il répondit : Ayat al-Kursi (Verset du Trône, 2:255). Ce verset décrit l'omniscience d'Allah et la Kursi (Chaise) qui englobe les cieux et la terre.",
  },
  {
    id: "qur_adv_005", category: "quran", type: "mcq", difficulty: 3,
    question: "Comment nomme-t-on la science qui étudie les circonstances de révélation des versets ?",
    options: [
      { text: "Tafsir",             correct: false },
      { text: "Asbab al-Nuzul",     correct: true  },
      { text: "Nasikh wa Mansukh",  correct: false },
      { text: "Gharib al-Quran",    correct: false },
    ],
    explanation: "Asbab al-Nuzul (أسباب النزول — les causes de la révélation) étudie le contexte historique de chaque verset. C'est une science fondamentale du tafsir : connaître le 'pourquoi' d'un verset éclaire souvent son sens et sa portée.",
  },
  {
    id: "qur_adv_006", category: "quran", type: "mcq", difficulty: 4,
    question: "Qu'est-ce que le 'I'jaz al-Quran' ?",
    options: [
      { text: "La mémorisation complète du Coran",                              correct: false },
      { text: "L'inimitabilité du Coran — son caractère miraculeux et inégalable", correct: true  },
      { text: "La codification du Coran sous le calife Othman",                 correct: false },
      { text: "La récitation du Coran selon les règles du tajwid",             correct: false },
    ],
    explanation: "L'I'jaz (إعجاز — impossibilité d'imiter) est le dogme de l'inimitabilité du Coran. Allah lance un défi (tahhaddi) : que les hommes et jinns produisent une seule sourate comparable (2:23). Les savants étudient l'inimitabilité linguistique, structurelle, prophétique et scientifique du texte.",
  },

  // ── ARABE — Difficile (diff 3-4) ────────────────────────────────
  {
    id: "ara_adv_001", category: "arabic", type: "mcq", difficulty: 3,
    question: "Quelle est la racine trilitère de base du mot 'Kitab' (كتاب — livre) ?",
    options: [
      { text: "ك-ت-ب (k-t-b)",    correct: true  },
      { text: "ك-ت-م (k-t-m)",    correct: false },
      { text: "ك-ر-م (k-r-m)",    correct: false },
      { text: "ك-س-ب (k-s-b)",    correct: false },
    ],
    explanation: "La racine ك-ت-ب (écrire) donne : كَتَبَ (écrire), كِتَاب (livre), كَاتِب (écrivain), مَكْتَبَة (bibliothèque), مَكْتُوب (lettre/écrit). L'arabe fonctionne par racines trilitères dont dérivent des dizaines de mots.",
  },
  {
    id: "ara_adv_002", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie le terme 'Barakah' (بَرَكَة) ?",
    options: [
      { text: "La prière du soir",          correct: false },
      { text: "La bénédiction divine abondante", correct: true  },
      { text: "La gratitude envers Allah",  correct: false },
      { text: "La protection des anges",   correct: false },
    ],
    explanation: "Baraka (بَرَكَة) vient de la racine b-r-k (s'agenouiller, chameau qui s'accroupit = stabilité). Elle désigne une bénédiction divine qui multiplie ce qu'elle touche. 'Tabarak Allah' (تبارك الله) — exaltée soit la Baraka d'Allah.",
  },
  {
    id: "ara_adv_003", category: "arabic", type: "mcq", difficulty: 3,
    question: "Quel est le pluriel du mot 'Wali' (وَلِيّ — saint / ami d'Allah) ?",
    options: [
      { text: "Awlad (أَوْلَاد)",    correct: false },
      { text: "Awliya (أَوْلِيَاء)", correct: true  },
      { text: "Waliyun (وَالِيُون)", correct: false },
      { text: "Wulat (وُلَاة)",      correct: false },
    ],
    explanation: "Awliya (أولياء) est le pluriel de Wali (وَلِيّ). Dans le Coran (10:62) : 'Certes, les alliés d'Allah n'ont rien à craindre.' Wulat (gouverneurs) est un autre pluriel de Wali mais dans le sens administratif.",
  },
  {
    id: "ara_adv_004", category: "arabic", type: "mcq", difficulty: 4,
    question: "Quelle est la différence entre 'Rabb' (رَبّ) et 'Ilah' (إِلَه) en arabe coranique ?",
    options: [
      { text: "Rabb = Dieu unique, Ilah = un dieu parmi d'autres",         correct: false },
      { text: "Rabb = Seigneur/Maître nourricier, Ilah = divinité adorée",  correct: true  },
      { text: "Ils sont synonymes dans le Coran",                          correct: false },
      { text: "Rabb = Allah spécifiquement, Ilah = terme générique",       correct: false },
    ],
    explanation: "Rabb (ربّ) désigne le Seigneur nourricier, éducateur, maître absolu. Ilah (إله) désigne toute divinité adorée. La Shahada 'La ilaha illa Allah' = 'Nulle divinité digne d'être adorée, sauf Allah.' Le Prophète ﷺ est 'Abd Allah' (serviteur d'Allah) et non 'Abd Rabb Allah'.",
  },
  {
    id: "ara_adv_005", category: "arabic", type: "mcq", difficulty: 3,
    question: "Que signifie 'Bismillah ir-Rahman ir-Rahim' mot à mot ?",
    options: [
      { text: "Au nom d'Allah, l'Omniprésent, l'Omniprésent",           correct: false },
      { text: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux", correct: true  },
      { text: "Par la gloire d'Allah, le Créateur, le Tout-Puissant",   correct: false },
      { text: "Au nom d'Allah, le Maître, le Garant",                   correct: false },
    ],
    explanation: "Rahman (رحمن) désigne la miséricorde universelle d'Allah vers toute Sa création (croyants et non-croyants). Rahim (رحيم) désigne la miséricorde particulière réservée aux croyants dans l'au-delà. Les deux viennent de la racine r-ḥ-m (matrice, affection maternelle).",
  },

  // ── DARIJA — Questions (diff 2-3) ────────────────────────────────
  {
    id: "dar_adv_001", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment dit-on 'Merci beaucoup' en darija marocaine ?",
    options: [
      { text: "Shukran jazilan",     correct: false },
      { text: "Choukran bezzaf",     correct: true  },
      { text: "Baraka Laoufik",      correct: false },
      { text: "Mamnounak bezzaf",    correct: false },
    ],
    explanation: "'Bezzaf' (بزاف) signifie 'beaucoup' en darija. 'Choukran bezzaf' (شكرا بزاف) est la formule courante. 'Baraka Laoufik' (بارك الله فيك) est une formule plus formelle et religieuse.",
  },
  {
    id: "dar_adv_002", category: "darija", type: "mcq", difficulty: 2,
    question: "Comment répondre 'ça va bien, al-hamdulillah' en darija ?",
    options: [
      { text: "Labas, al-hamdulillah",  correct: true  },
      { text: "Mzyan, inchallah",       correct: false },
      { text: "Wakha, Rabi ychafik",    correct: false },
      { text: "Safi, al-hamdulillah",   correct: false },
    ],
    explanation: "'Labas' (لاباس — ça va / pas de mal) vient de l'espagnol 'no hay mal'. 'Labas, al-hamdulillah' est la réponse standard au salut 'Labas alik ?' (Tu vas bien ?).",
  },
  {
    id: "dar_adv_003", category: "darija", type: "mcq", difficulty: 3,
    question: "Que signifie 'Nshalh' ou 'Inchallah' dans l'usage quotidien marocain ?",
    options: [
      { text: "Uniquement 'si Dieu le veut' pour l'avenir",                     correct: false },
      { text: "'Si Dieu le veut' — mais aussi parfois une façon polie de dire non ou peut-être", correct: true  },
      { text: "Une prière obligatoire avant toute action",                       correct: false },
      { text: "Une formule réservée aux imams et savants",                       correct: false },
    ],
    explanation: "Inchallah (إن شاء الله) est théologiquement correct et reconnu dans le Coran (18:23-24). Dans l'usage courant, il peut signifier 'oui probablement', 'peut-être' ou parfois un refus poli selon le contexte et l'intonation. Cette nuance est bien connue dans le monde arabophone.",
  },
  {
    id: "dar_adv_004", category: "darija", type: "mcq", difficulty: 2,
    question: "Que veut dire 'Mashi mouchkil' en darija ?",
    options: [
      { text: "C'est compliqué",      correct: false },
      { text: "Pas de problème",      correct: true  },
      { text: "Je ne sais pas",       correct: false },
      { text: "C'est interdit",       correct: false },
    ],
    explanation: "'Machi mouchkil' (ماشي مشكل — pas de problème) est l'équivalent de 'no problem'. 'Machi' (pas) + 'mouchkil' (problème en arabe). Très utilisé dans les conversations informelles marocaines.",
  },
  {
    id: "dar_adv_005", category: "darija", type: "mcq", difficulty: 3,
    question: "Comment dit-on 'Je cherche la mosquée' en darija ?",
    options: [
      { text: "Kancherch al-jami'",    correct: false },
      { text: "Kanqleb 'la jami'",     correct: true  },
      { text: "Bghit nmchi l'jami'",   correct: false },
      { text: "Wach kayn jami' hna ?", correct: false },
    ],
    explanation: "'Kanqleb' (كنقلب — je cherche) vient du verbe qelb/qleb. 'Kanqleb 'la jami'' = je cherche la mosquée. 'Bghet' (je veux), 'mchi' (aller) sont aussi corrects mais 'kanqleb' exprime spécifiquement 'chercher'.",
  },

  // ── QUESTIONS LIÉES AUX HISTOIRES — Ibrahim ──────────────────────
  {
    id: "story_ibr_001", category: "religion", type: "mcq", difficulty: 1,
    question: "Quel tyran a ordonné de jeter Ibrahim ﷺ dans le feu ?",
    options: [{ text: "Pharaon", correct: false }, { text: "Nimrod (Namroud)", correct: true }, { text: "Haman", correct: false }, { text: "Abu Lahab", correct: false }],
    eventId: "arc_ibrahim",
    culturalCapsule: { title: "Nimrod — le roi qui se croyait dieu", text: "Nimrod (نمرود) était un roi mésopotamien qui se réclamait de la divinité. Quand Ibrahim ﷺ brisa les idoles et défia sa logique, Nimrod ordonna de construire un immense bûcher. Selon le Coran, Allah dit au feu : 'Sois fraîcheur et paix pour Ibrahim.'" },
  },
  {
    id: "story_ibr_002", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'a fait Ibrahim ﷺ pour montrer que les idoles ne pouvaient se défendre ?",
    options: [
      { text: "Il les a jetées dans le fleuve", correct: false },
      { text: "Il les a toutes brisées sauf la plus grande", correct: true },
      { text: "Il a fui loin du village", correct: false },
      { text: "Il a prié devant elles pour montrer qu'elles ne répondaient pas", correct: false },
    ],
    eventId: "arc_ibrahim",
    explanation: "Ibrahim brisa toutes les idoles et laissa la hache sur la plus grande. Quand on l'accusa, il dit : 'C'est la grande qui l'a fait — interrogez-les si elles parlent !' Cet argument logique réduisit ses adversaires au silence.",
  },
  {
    id: "story_ibr_003", category: "religion", type: "mcq", difficulty: 2,
    question: "Qu'a construit Ibrahim ﷺ avec son fils Ismaïl ﷺ à La Mecque ?",
    options: [{ text: "La Mosquée Al-Aqsa", correct: false }, { text: "La Ka'ba", correct: true }, { text: "Le puits de Zamzam", correct: false }, { text: "La Mosquée du Prophète", correct: false }],
    eventId: "arc_ibrahim",
    culturalCapsule: { title: "La Ka'ba — maison d'Allah", text: "Ibrahim et Ismaïl construisirent la Ka'ba (الكعبة) en élevant chaque pierre en priant : 'Notre Seigneur, accepte de nous.' La pierre noire (Hajr al-Aswad) y fut placée par Ibrahim ﷺ. La Ka'ba reste depuis le centre de la qibla pour plus d'un milliard de musulmans." },
  },
  {
    id: "story_ibr_004", category: "religion", type: "mcq", difficulty: 3,
    question: "Quel est le lien entre Ibrahim ﷺ et le pèlerinage (Hajj) ?",
    options: [
      { text: "Ibrahim a tracé la route entre La Mecque et Médine", correct: false },
      { text: "Ibrahim a institué les rites du Hajj sur ordre divin", correct: true },
      { text: "Ibrahim a interdit l'accès à La Mecque aux non-croyants", correct: false },
      { text: "Ibrahim a planté le palmier sacré de Mina", correct: false },
    ],
    eventId: "arc_ibrahim",
    explanation: "Allah ordonna à Ibrahim d'appeler les gens au pèlerinage (Coran 22:27). Les rites du Hajj — la circumambulation, la sa'y entre Safa et Marwa, le séjour à Mina — commémorent les épreuves d'Ibrahim, Hajar et Ismaïl.",
  },

  // ── QUESTIONS LIÉES AUX HISTOIRES — Moussa ──────────────────────
  {
    id: "story_msa_001", category: "religion", type: "mcq", difficulty: 1,
    question: "Où fut placé bébé Moussa ﷺ pour le sauver de Pharaon ?",
    options: [{ text: "Dans une grotte du désert", correct: false }, { text: "Dans un couffin sur le Nil", correct: true }, { text: "Chez des nomades du Sinaï", correct: false }, { text: "Dans un temple d'Osiris", correct: false }],
    eventId: "arc_moussa",
    culturalCapsule: { title: "Le berceau sur le Nil", text: "La mère de Moussa, sur inspiration divine, le plaça dans un couffin et le confia au Nil. Le bébé finit par être recueilli par la famille de Pharaon elle-même — un signe de la protection divine." },
  },
  {
    id: "story_msa_002", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel était le bâton miraculeux de Moussa ﷺ capable de faire ?",
    options: [
      { text: "Guérir les malades au toucher", correct: false },
      { text: "Se transformer en serpent et fendre la mer", correct: true },
      { text: "Faire pleuvoir sur commande", correct: false },
      { text: "Écrire les commandements seul", correct: false },
    ],
    eventId: "arc_moussa",
    explanation: "Le bâton de Moussa se transforma en serpent devant les magiciens de Pharaon. C'est aussi lui qui frappa la mer pour la fendre en deux (Coran 20:77).",
  },
  {
    id: "story_msa_003", category: "religion", type: "mcq", difficulty: 2,
    question: "Qui était le frère de Moussa ﷺ qui l'assista dans sa mission ?",
    options: [{ text: "Issa", correct: false }, { text: "Haroun (Aaron)", correct: true }, { text: "Dawoud", correct: false }, { text: "Shuayb", correct: false }],
    eventId: "arc_moussa",
    explanation: "Moussa demanda à Allah de lui adjoindre son frère Haroun (Coran 20:29-32). Haroun était plus éloquent — un rappel que les prophètes s'entourent de soutiens complémentaires.",
  },
  {
    id: "story_msa_004", category: "religion", type: "mcq", difficulty: 3,
    question: "Combien de fois est mentionné le nom de Moussa dans le Coran ?",
    options: [{ text: "72 fois", correct: false }, { text: "136 fois", correct: true }, { text: "98 fois", correct: false }, { text: "25 fois", correct: false }],
    eventId: "arc_moussa",
    explanation: "Moussa ﷺ est le prophète le plus mentionné dans le Coran (136 fois), devant Ibrahim (69 fois) et Issa (25 fois).",
  },

  // ── QUESTIONS LIÉES AUX HISTOIRES — Yusuf ───────────────────────
  {
    id: "story_ysf_001", category: "religion", type: "mcq", difficulty: 1,
    question: "Qui jeta Yusuf ﷺ dans le puits par jalousie ?",
    options: [{ text: "Son père Yaqoub", correct: false }, { text: "Ses frères", correct: true }, { text: "Les soldats du roi d'Égypte", correct: false }, { text: "Des marchands de caravane", correct: false }],
    eventId: "arc_yusuf",
    culturalCapsule: { title: "La jalousie des frères", text: "Les frères de Yusuf, jaloux de l'amour que leur père Yaqoub lui portait, le jetèrent dans un puits. Cette épreuve initiale marque le début d'un long voyage — de l'esclavage au sommet du pouvoir." },
  },
  {
    id: "story_ysf_002", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel don exceptionnel Allah accorda-t-il à Yusuf ﷺ ?",
    options: [
      { text: "La capacité de guérir les malades", correct: false },
      { text: "L'interprétation des rêves", correct: true },
      { text: "La force surhumaine", correct: false },
      { text: "La connaissance des langues", correct: false },
    ],
    eventId: "arc_yusuf",
    explanation: "Yusuf interpréta le rêve du roi d'Égypte : 7 vaches grasses mangées par 7 maigres = 7 ans d'abondance suivis de 7 ans de famine. Cette interprétation le propulsa au rang de ministre.",
  },
  {
    id: "story_ysf_003", category: "religion", type: "mcq", difficulty: 2,
    question: "Combien d'années Yusuf ﷺ passa-t-il en prison selon le Coran ?",
    options: [{ text: "3 ans", correct: false }, { text: "7 ans", correct: false }, { text: "Plusieurs années (بِضْعَ سِنِينَ)", correct: true }, { text: "12 ans", correct: false }],
    eventId: "arc_yusuf",
    explanation: "Le Coran dit 'bidh'a sinîn' (بِضْعَ سِنِينَ — quelques années), généralement interprété comme 7 à 12 ans. Yusuf refusa la liberté sans preuves de son innocence.",
  },
  {
    id: "story_ysf_004", category: "religion", type: "mcq", difficulty: 3,
    question: "Que dit Yusuf ﷺ à ses frères quand il se révéla à eux en Égypte ?",
    options: [
      { text: "'Vous serez punis pour ce que vous m'avez fait'", correct: false },
      { text: "'Pas de reproche sur vous aujourd'hui — Allah vous pardonne'", correct: true },
      { text: "'Retournez chez mon père et revenez avec lui'", correct: false },
      { text: "'Je suis le ministre du roi, inclinez-vous'", correct: false },
    ],
    eventId: "arc_yusuf",
    culturalCapsule: { title: "Le pardon de Yusuf — modèle de noblesse", text: "Yusuf dit à ses frères : 'Pas de reproche sur vous aujourd'hui. Allah vous pardonne, Il est le Plus Miséricordieux des miséricordieux' (Coran 12:92). Ce pardon spontané, sans conditions, est cité par les savants comme l'un des exemples les plus purs de générosité d'âme dans le Coran." },
  },

  // ── QUESTIONS LIÉES AUX HISTOIRES — Maryam ──────────────────────
  {
    id: "story_mrm_001", category: "religion", type: "mcq", difficulty: 1,
    question: "Dans quelle sourate du Coran Maryam (Marie) ﷺ est-elle nommée ?",
    options: [{ text: "Sourate 19 — Maryam", correct: true }, { text: "Sourate 3 — Al-Imran", correct: false }, { text: "Les deux (19 et 3)", correct: false }, { text: "Sourate 2 — Al-Baqara", correct: false }],
    eventId: "arc_maryam",
    explanation: "Maryam est mentionnée dans plusieurs sourates, mais la sourate 19 porte son nom. Elle est la seule femme nommée explicitement dans le Coran.",
  },
  {
    id: "story_mrm_002", category: "religion", type: "mcq", difficulty: 2,
    question: "Quel miracle Issa ﷺ accomplit-il dès sa naissance pour défendre sa mère Maryam ?",
    options: [
      { text: "Il fit apparaître de la nourriture pour Maryam", correct: false },
      { text: "Il parla depuis son berceau pour témoigner de sa pureté", correct: true },
      { text: "Il guérit les malades qui se pressaient autour d'elle", correct: false },
      { text: "Il ordonna aux arbres de se plier pour la nourrir", correct: false },
    ],
    eventId: "arc_maryam",
    culturalCapsule: { title: "Issa parle depuis son berceau", text: "Quand son peuple accusa Maryam d'immoralité, Issa parla depuis son berceau : 'Je suis le serviteur d'Allah. Il m'a donné le Livre et fait prophète' (Coran 19:30). Ce miracle unique valida l'innocence de sa mère et sa propre mission." },
  },
  {
    id: "story_mrm_003", category: "religion", type: "mcq", difficulty: 3,
    question: "Quel rang Maryam ﷺ occupe-t-elle parmi les femmes selon un hadith célèbre ?",
    options: [
      { text: "La meilleure femme du monde", correct: false },
      { text: "L'une des quatre femmes les plus parfaites", correct: true },
      { text: "La première femme à entrer au paradis", correct: false },
      { text: "La seule prophétesse de l'islam", correct: false },
    ],
    eventId: "arc_maryam",
    explanation: "Le Prophète ﷺ a dit : 'Parmi les femmes qui ont atteint la perfection : Maryam bint Imran, Asiya, Khadija et Fatima.' (Al-Bukhari). Cette liste honore à la fois la dévotion, la sagesse et la bravoure.",
  },
];

type ArabicLevel = "none" | "beginner" | "intermediate" | "advanced";

const ARABIC_LEVEL_ORDER: ArabicLevel[] = ["none", "beginner", "intermediate", "advanced"];

function meetsArabicLevel(q: Question, userLevel: ArabicLevel): boolean {
  // La catégorie "arabic" implique la lecture de texte arabe → niveau beginner requis par défaut.
  // Les questions avec arabicRequired explicite ont la priorité.
  const categoryDefault: ArabicLevel = q.category === "arabic" ? "beginner" : "none";
  const required = q.arabicRequired ?? categoryDefault;
  return ARABIC_LEVEL_ORDER.indexOf(userLevel) >= ARABIC_LEVEL_ORDER.indexOf(required);
}

export function getQuestions(
  count = 10,
  history: Record<string, { nextDue: string }> = {},
  arabicLevel: ArabicLevel = "beginner",
): Question[] {
  const today = new Date().toISOString().split("T")[0];

  // Filter by arabic level first
  const eligible = QUESTIONS.filter(q => meetsArabicLevel(q, arabicLevel));

  // Priority 1: due questions (seen before, due today)
  const due = eligible.filter(q => {
    const h = history[q.id];
    return h && h.nextDue <= today;
  });

  // Priority 2: unseen questions
  const unseen = eligible.filter(q => !history[q.id]);

  // Mix and cap
  const pool: Question[] = [];
  for (const q of due)    if (pool.length < Math.ceil(count * 0.4)) pool.push(q);
  for (const q of unseen) if (pool.length < count) pool.push(q);

  // Fill remainder from eligible questions
  if (pool.length < count) {
    for (const q of eligible) {
      if (!pool.find(p => p.id === q.id)) pool.push(q);
      if (pool.length >= count) break;
    }
  }

  // Shuffle
  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}
