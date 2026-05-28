export interface Zikr {
  id:     string;
  ar:     string;
  fr:     string;
  count:  number;
  source: string;
}

export const AZKAR_MATIN: Zikr[] = [
  {
    id: "m1", count: 1,
    ar: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nاللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...",
    fr: "Ayat al-Kursi — À réciter 1 fois le matin",
    source: "Al-Baqara 2:255",
  },
  {
    id: "m2", count: 3,
    ar: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    fr: "Sourate Al-Ikhlas",
    source: "Al-Ikhlas 112",
  },
  {
    id: "m3", count: 3,
    ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    fr: "Sourate Al-Falaq",
    source: "Al-Falaq 113",
  },
  {
    id: "m4", count: 3,
    ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    fr: "Sourate An-Nas",
    source: "An-Nas 114",
  },
  {
    id: "m5", count: 1,
    ar: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    fr: "Nous voilà au matin et le Royaume appartient à Allah...",
    source: "Abou Daoud",
  },
  {
    id: "m6", count: 1,
    ar: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    fr: "Ô Allah, c'est grâce à Toi que nous entrons dans le matin...",
    source: "Tirmidhi",
  },
  {
    id: "m7", count: 3,
    ar: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
    fr: "Je me satisfais d'Allah comme Seigneur, de l'Islam comme religion...",
    source: "Abou Daoud",
  },
  {
    id: "m8", count: 1,
    ar: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    fr: "Ô Vivant, ô Mainteneur, c'est par Ta miséricorde que j'implore...",
    source: "Al-Hakim",
  },
  {
    id: "m9", count: 10,
    ar: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    fr: "Nul dieu hormis Allah, seul sans associé. À Lui le Royaume et la louange...",
    source: "Mouslim",
  },
  {
    id: "m10", count: 100,
    ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    fr: "Gloire à Allah et Sa louange",
    source: "Mouslim",
  },
  {
    id: "m11", count: 10,
    ar: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    fr: "Ô Allah, envoie Tes bénédictions sur notre Prophète Muhammad ﷺ",
    source: "Al-Albani",
  },
  {
    id: "m12", count: 3,
    ar: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
    fr: "Ô Allah, préserve la santé de mon corps, de mon ouïe, de ma vue...",
    source: "Abou Daoud",
  },
];

export const AZKAR_SOIR: Zikr[] = [
  ...AZKAR_MATIN.slice(0, 4).map(z => ({ ...z, id: "s" + z.id })),
  {
    id: "s5", count: 1,
    ar: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    fr: "Nous voilà au soir et le Royaume appartient à Allah...",
    source: "Abou Daoud",
  },
  {
    id: "s6", count: 1,
    ar: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    fr: "Ô Allah, c'est grâce à Toi que nous entrons dans le soir...",
    source: "Tirmidhi",
  },
  {
    id: "s7", count: 3,
    ar: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    fr: "Je cherche refuge dans les Paroles parfaites d'Allah contre le mal de ce qu'Il a créé",
    source: "Mouslim",
  },
  {
    id: "s8", count: 1,
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    fr: "Ô Allah, je Te demande le pardon et la bonne santé en ce monde et dans l'au-delà",
    source: "Ibn Majah",
  },
  {
    id: "s9", count: 3,
    ar: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    fr: "Au nom d'Allah, avec Son Nom rien ne peut nuire, ni sur terre ni dans le ciel...",
    source: "Abou Daoud & Tirmidhi",
  },
  {
    id: "s10", count: 10,
    ar: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    fr: "Nul dieu hormis Allah, seul sans associé...",
    source: "Mouslim",
  },
  {
    id: "s11", count: 10,
    ar: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    fr: "Ô Allah, envoie Tes bénédictions sur notre Prophète Muhammad ﷺ",
    source: "Al-Albani",
  },
];
