export interface Zikr {
  id:             string;
  ar:             string;
  transliteration:string;
  fr:             string;
  count:          number;
  source:         string;
}

export const AZKAR_MATIN: Zikr[] = [
  {
    id: "m1", count: 1,
    ar: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nاللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...",
    transliteration: "A'udhu billahi minash-shaytanir-rajim. Allahu la ilaha illa huwal-hayyul-qayyum...",
    fr: "Ayat al-Kursi — À réciter 1 fois le matin",
    source: "Al-Baqara 2:255",
  },
  {
    id: "m2", count: 3,
    ar: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    transliteration: "Qul huwallahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.",
    fr: "Sourate Al-Ikhlas",
    source: "Al-Ikhlas 112",
  },
  {
    id: "m3", count: 3,
    ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    transliteration: "Qul a'udhu bi rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.",
    fr: "Sourate Al-Falaq",
    source: "Al-Falaq 113",
  },
  {
    id: "m4", count: 3,
    ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    transliteration: "Qul a'udhu bi rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.",
    fr: "Sourate An-Nas",
    source: "An-Nas 114",
  },
  {
    id: "m5", count: 1,
    ar: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    fr: "Nous voilà au matin et le Royaume appartient à Allah",
    source: "Abou Daoud",
  },
  {
    id: "m6", count: 1,
    ar: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaikan-nushur.",
    fr: "Ô Allah, c'est grâce à Toi que nous entrons dans le matin",
    source: "Tirmidhi",
  },
  {
    id: "m7", count: 3,
    ar: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
    transliteration: "Raditu billahi rabban, wa bil-islami dinan, wa bi Muhammadin sallallahu 'alayhi wa sallama nabiyyan.",
    fr: "Je me satisfais d'Allah comme Seigneur, de l'Islam comme religion et de Muhammad ﷺ comme Prophète",
    source: "Abou Daoud",
  },
  {
    id: "m8", count: 1,
    ar: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    transliteration: "Ya Hayyu ya Qayyum, bi rahmatika astaghith, aslih li sha'ni kullahu, wa la takilni ila nafsi tarfata 'ayn.",
    fr: "Ô Vivant, ô Mainteneur, par Ta miséricorde j'implore, corrige toutes mes affaires",
    source: "Al-Hakim",
  },
  {
    id: "m9", count: 10,
    ar: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    fr: "Nul dieu hormis Allah, seul sans associé. À Lui le Royaume et la louange.",
    source: "Mouslim",
  },
  {
    id: "m10", count: 100,
    ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhanallahi wa bihamdihi.",
    fr: "Gloire à Allah et Sa louange",
    source: "Mouslim",
  },
  {
    id: "m11", count: 10,
    ar: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    transliteration: "Allahumma salli wa sallim 'ala nabiyyina Muhammad.",
    fr: "Ô Allah, envoie Tes bénédictions et la paix sur notre Prophète Muhammad ﷺ",
    source: "Al-Albani",
  },
  {
    id: "m12", count: 3,
    ar: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa ant.",
    fr: "Ô Allah, préserve la santé de mon corps, de mon ouïe et de ma vue. Il n'est de dieu que Toi.",
    source: "Abou Daoud",
  },
];

export const AZKAR_SOIR: Zikr[] = [
  ...AZKAR_MATIN.slice(0, 4).map(z => ({ ...z, id: "s" + z.id })),
  {
    id: "s5", count: 1,
    ar: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    fr: "Nous voilà au soir et le Royaume appartient à Allah",
    source: "Abou Daoud",
  },
  {
    id: "s6", count: 1,
    ar: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilaykal-masir.",
    fr: "Ô Allah, c'est grâce à Toi que nous entrons dans le soir",
    source: "Tirmidhi",
  },
  {
    id: "s7", count: 3,
    ar: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bi kalimatillahit-tammati min sharri ma khalaq.",
    fr: "Je cherche refuge dans les Paroles parfaites d'Allah contre le mal de ce qu'Il a créé",
    source: "Mouslim",
  },
  {
    id: "s8", count: 1,
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhira.",
    fr: "Ô Allah, je Te demande le pardon et la bonne santé en ce monde et dans l'au-delà",
    source: "Ibn Majah",
  },
  {
    id: "s9", count: 3,
    ar: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i, wa huwas-sami'ul-'alim.",
    fr: "Au nom d'Allah, avec Son Nom rien ne peut nuire, ni sur terre ni dans le ciel.",
    source: "Abou Daoud & Tirmidhi",
  },
  {
    id: "s10", count: 10,
    ar: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    fr: "Nul dieu hormis Allah, seul sans associé. À Lui le Royaume et la louange.",
    source: "Mouslim",
  },
  {
    id: "s11", count: 10,
    ar: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    transliteration: "Allahumma salli wa sallim 'ala nabiyyina Muhammad.",
    fr: "Ô Allah, envoie Tes bénédictions et la paix sur notre Prophète Muhammad ﷺ",
    source: "Al-Albani",
  },
];
