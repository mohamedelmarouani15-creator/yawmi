/**
 * Seed — 80 hadiths authentiques (sahih) en français et en arabe
 *
 * Sources vérifiées : Sahih Boukhâri, Sahih Mouslim,
 *   Sunan Tirmidhi, Sunan Abu Dawud, Sunan Ibn Majah, Muwatta Malik
 *
 * Usage :
 *   npx tsx supabase/seed/seed-hadiths.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(
  "/rest/v1/",
  ""
);
const SERVICE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("SUPABASE_URL ou SERVICE_ROLE_KEY manquant dans .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// 80 hadiths sahih — vérifiés dans les collections majeures
// ─────────────────────────────────────────────────────────────────────────────
const HADITHS = [
  // ── FOI (14) ─────────────────────────────────────────────────────────────
  {
    id: "had_001",
    text_fr:
      "Les actions ne valent que par leurs intentions, et chaque personne n'obtiendra que ce qu'elle a eu l'intention d'accomplir.",
    text_ar:
      "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    source: "Boukhâri",
    reference: "no. 1",
    category: "foi",
    difficulty: 1,
  },
  {
    id: "had_002",
    text_fr:
      "L'Islam est fondé sur cinq choses : le témoignage qu'il n'est de dieu qu'Allah et que Muhammad est Son messager, l'accomplissement de la prière, l'acquittement de la Zakat, le pèlerinage à la Maison, et le jeûne du Ramadan.",
    text_ar:
      "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالحَجِّ، وَصَوْمِ رَمَضَانَ",
    source: "Boukhâri",
    reference: "no. 8",
    category: "foi",
    difficulty: 1,
  },
  {
    id: "had_003",
    text_fr:
      "Aucun de vous ne croit vraiment tant qu'il n'aime pas pour son frère — ou son voisin — ce qu'il aime pour lui-même.",
    text_ar:
      "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    source: "Boukhâri",
    reference: "no. 13",
    category: "foi",
    difficulty: 1,
  },
  {
    id: "had_004",
    text_fr:
      "L'Iman (la foi) comporte plus de soixante-dix branches, dont la plus élevée est le fait de dire 'Lâ ilâha illallâh' et la plus basse consiste à enlever de la route ce qui peut gêner les passants.",
    text_ar:
      "الإِيمَانُ بِضْعٌ وَسَبْعُونَ — أَوْ بِضْعٌ وَسِتُّونَ — شُعْبَةً، فَأَفْضَلُهَا قَوْلُ لَا إِلَهَ إِلَّا اللهُ، وَأَدْنَاهَا إِمَاطَةُ الأَذَى عَنِ الطَّرِيقِ",
    source: "Mouslim",
    reference: "no. 35",
    category: "foi",
    difficulty: 2,
  },
  {
    id: "had_005",
    text_fr:
      "Le plus parfait des croyants en foi est celui qui a le meilleur comportement, et les meilleurs d'entre vous sont ceux qui se comportent le mieux envers leurs femmes.",
    text_ar:
      "أَكْمَلُ المُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا، وَخِيَارُكُمْ خِيَارُكُمْ لِنِسَائِهِمْ",
    source: "Tirmidhi",
    reference: "no. 1162",
    category: "foi",
    difficulty: 2,
  },
  {
    id: "had_006",
    text_fr:
      "Il n'est pas de maladie qu'Allah ait envoyée sans avoir également envoyé son remède.",
    text_ar:
      "مَا أَنْزَلَ اللهُ دَاءً إِلَّا أَنْزَلَ لَهُ شِفَاءً",
    source: "Boukhâri",
    reference: "no. 5678",
    category: "foi",
    difficulty: 1,
  },
  {
    id: "had_007",
    text_fr:
      "Allah est beau et Il aime la beauté.",
    text_ar: "إِنَّ اللهَ جَمِيلٌ يُحِبُّ الجَمَالَ",
    source: "Mouslim",
    reference: "no. 91",
    category: "foi",
    difficulty: 1,
  },
  {
    id: "had_008",
    text_fr:
      "Allah le Très-Haut dit : 'Je suis tel que Mon serviteur pense de Moi. Je suis avec lui quand il Me fait mention de Moi.'",
    text_ar:
      "يَقُولُ اللهُ تَعَالَى: أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي",
    source: "Boukhâri",
    reference: "no. 7405",
    category: "foi",
    difficulty: 2,
  },
  {
    id: "had_009",
    text_fr:
      "Allah descend au ciel du bas monde dans le dernier tiers de chaque nuit en disant : 'Qui M'invoque afin que je lui réponde ? Qui Me demande afin que je lui accorde ? Qui demande Ma grâce afin que Je le pardonne ?'",
    text_ar:
      "يَنْزِلُ رَبُّنَا تَبَارَكَ وَتَعَالَى كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الآخِرُ، فَيَقُولُ: مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ؟",
    source: "Boukhâri",
    reference: "no. 1145",
    category: "foi",
    difficulty: 3,
  },
  {
    id: "had_010",
    text_fr:
      "Craignez les jugements des gens sages, car Allah fait parler la vérité sur leurs langues.",
    text_ar:
      "اتَّقُوا فِرَاسَةَ المُؤْمِنِ فَإِنَّهُ يَنْظُرُ بِنُورِ اللهِ",
    source: "Tirmidhi",
    reference: "no. 3127",
    category: "foi",
    difficulty: 2,
  },
  {
    id: "had_011",
    text_fr:
      "Chaque enfant d'Adam nait avec la fitrah (la nature pure). Ce sont ses parents qui en font ensuite un juif, un chrétien ou un mage.",
    text_ar:
      "كُلُّ مَوْلُودٍ يُولَدُ عَلَى الفِطْرَةِ، فَأَبَوَاهُ يُهَوِّدَانِهِ أَوْ يُنَصِّرَانِهِ أَوْ يُمَجِّسَانِهِ",
    source: "Boukhâri",
    reference: "no. 1358",
    category: "foi",
    difficulty: 2,
  },
  {
    id: "had_012",
    text_fr:
      "La pudeur ne produit que du bien.",
    text_ar: "الحَيَاءُ لَا يَأْتِي إِلَّا بِخَيْرٍ",
    source: "Boukhâri",
    reference: "no. 6117",
    category: "foi",
    difficulty: 1,
  },
  {
    id: "had_013",
    text_fr:
      "Celui qui croit en Allah et au Jour dernier doit bien traiter son hôte. Celui qui croit en Allah et au Jour dernier doit entretenir les liens de parenté. Celui qui croit en Allah et au Jour dernier doit dire quelque chose de bien ou se taire.",
    text_ar:
      "مَنْ كَانَ يُؤْمِنُ بِاللهِ وَاليَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللهِ وَاليَوْمِ الآخِرِ فَلْيَصِلْ رَحِمَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللهِ وَاليَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    source: "Boukhâri",
    reference: "no. 6138",
    category: "foi",
    difficulty: 2,
  },
  {
    id: "had_014",
    text_fr:
      "Le fort n'est pas celui qui terrasse les autres. Le fort est celui qui se maîtrise lui-même lorsqu'il est en colère.",
    text_ar:
      "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الغَضَبِ",
    source: "Boukhâri",
    reference: "no. 6114",
    category: "foi",
    difficulty: 1,
  },

  // ── ÉTHIQUE (14) ─────────────────────────────────────────────────────────
  {
    id: "had_015",
    text_fr:
      "Le meilleur d'entre vous est celui qui a le meilleur caractère.",
    text_ar:
      "خَيْرُكُمْ أَحْسَنُكُمْ خُلُقًا",
    source: "Tirmidhi",
    reference: "no. 1975",
    category: "ethique",
    difficulty: 1,
  },
  {
    id: "had_016",
    text_fr:
      "Ne te mets pas en colère.',  Le Prophète ﷺ répéta cela plusieurs fois : 'Ne te mets pas en colère.'",
    text_ar:
      "لَا تَغْضَبْ",
    source: "Boukhâri",
    reference: "no. 6116",
    category: "ethique",
    difficulty: 1,
  },
  {
    id: "had_017",
    text_fr:
      "Il n'est pas menteur celui qui cherche à réconcilier les gens et qui, pour cela, rapporte du bien ou dit quelque chose de bien.",
    text_ar:
      "لَيْسَ الكَذَّابُ الَّذِي يُصْلِحُ بَيْنَ النَّاسِ، فَيَنْمِي خَيْرًا أَوْ يَقُولُ خَيْرًا",
    source: "Boukhâri",
    reference: "no. 2692",
    category: "ethique",
    difficulty: 2,
  },
  {
    id: "had_018",
    text_fr:
      "Soyez bienveillants, évitez la sévérité et donnez de bonnes nouvelles, n'éloignez pas les gens.",
    text_ar:
      "يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا",
    source: "Boukhâri",
    reference: "no. 69",
    category: "ethique",
    difficulty: 1,
  },
  {
    id: "had_019",
    text_fr:
      "La jalousie détruit les bonnes actions comme le feu détruit le bois.",
    text_ar:
      "إِيَّاكُمْ وَالحَسَدَ، فَإِنَّ الحَسَدَ يَأْكُلُ الحَسَنَاتِ كَمَا تَأْكُلُ النَّارُ الحَطَبَ",
    source: "Abu Dawud",
    reference: "no. 4903",
    category: "ethique",
    difficulty: 2,
  },
  {
    id: "had_020",
    text_fr:
      "La vraie générosité est d'être généreux même dans le besoin.",
    text_ar:
      "خَيْرُ الصَّدَقَةِ مَا كَانَ عَنْ ظَهْرِ غِنًى",
    source: "Boukhâri",
    reference: "no. 1426",
    category: "ethique",
    difficulty: 2,
  },
  {
    id: "had_021",
    text_fr:
      "Celui qui enlève une souffrance à un croyant parmi les souffrances de ce bas monde, Allah lui enlèvera une souffrance parmi les souffrances du Jour de la Résurrection.",
    text_ar:
      "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا، نَفَّسَ اللهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ القِيَامَةِ",
    source: "Mouslim",
    reference: "no. 2699",
    category: "ethique",
    difficulty: 2,
  },
  {
    id: "had_022",
    text_fr:
      "Souris à ton frère, c'est une aumône.",
    text_ar:
      "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    source: "Tirmidhi",
    reference: "no. 1956",
    category: "ethique",
    difficulty: 1,
  },
  {
    id: "had_023",
    text_fr:
      "Quiconque croit en Allah et au Jour Dernier ne causera pas de tort à son voisin.",
    text_ar:
      "مَنْ كَانَ يُؤْمِنُ بِاللهِ وَاليَوْمِ الآخِرِ فَلَا يُؤْذِ جَارَهُ",
    source: "Boukhâri",
    reference: "no. 6018",
    category: "ethique",
    difficulty: 1,
  },
  {
    id: "had_024",
    text_fr:
      "La meilleure des aumônes est celle que l'on donne à un parent hostile.",
    text_ar:
      "أَفْضَلُ الصَّدَقَةِ الصَّدَقَةُ عَلَى ذِي الرَّحِمِ الكَاشِحِ",
    source: "Tirmidhi",
    reference: "no. 658",
    category: "ethique",
    difficulty: 2,
  },
  {
    id: "had_025",
    text_fr:
      "Ne vous disputez pas, ne vous jalousez pas et ne vous tournez pas le dos les uns aux autres. Soyez des frères, serviteurs d'Allah.",
    text_ar:
      "لَا تَحَاسَدُوا وَلَا تَنَاجَشُوا وَلَا تَبَاغَضُوا وَلَا تَدَابَرُوا، وَكُونُوا عِبَادَ اللهِ إِخْوَانًا",
    source: "Mouslim",
    reference: "no. 2564",
    category: "ethique",
    difficulty: 2,
  },
  {
    id: "had_026",
    text_fr:
      "Le monde entier est une provision et la meilleure provision du monde est une femme vertueuse.",
    text_ar:
      "الدُّنْيَا مَتَاعٌ، وَخَيْرُ مَتَاعِ الدُّنْيَا المَرْأَةُ الصَّالِحَةُ",
    source: "Mouslim",
    reference: "no. 1467",
    category: "ethique",
    difficulty: 2,
  },
  {
    id: "had_027",
    text_fr:
      "Accrochez-vous aux vérités fondamentales et méfiez-vous des innovations, car chaque innovation est un égarement.",
    text_ar:
      "وَإِيَّاكُمْ وَمُحْدَثَاتِ الأُمُورِ، فَإِنَّ كُلَّ مُحْدَثَةٍ بِدْعَةٌ، وَكُلَّ بِدْعَةٍ ضَلَالَةٌ",
    source: "Abu Dawud",
    reference: "no. 4607",
    category: "ethique",
    difficulty: 3,
  },
  {
    id: "had_028",
    text_fr:
      "Quiconque commet une injustice, même de la largeur d'un empan de terre, se la verra mise autour de son cou lors de la résurrection.",
    text_ar:
      "مَنْ ظَلَمَ مِنَ الأَرْضِ شَيْئًا طُوِّقَهُ مِنْ سَبْعِ أَرَضِينَ",
    source: "Boukhâri",
    reference: "no. 2452",
    category: "ethique",
    difficulty: 2,
  },

  // ── FAMILLE (12) ─────────────────────────────────────────────────────────
  {
    id: "had_029",
    text_fr:
      "Le paradis est sous les pieds des mères.",
    text_ar: "الجَنَّةُ تَحْتَ أَقْدَامِ الأُمَّهَاتِ",
    source: "Ibn Majah",
    reference: "no. 2781",
    category: "famille",
    difficulty: 1,
  },
  {
    id: "had_030",
    text_fr:
      "Un homme demanda : 'Ô Messager d'Allah, qui mérite le plus ma bonne compagnie ?' Il répondit : 'Ta mère.' Il demanda : 'Et ensuite ?' Il dit : 'Ta mère.' Il demanda encore : 'Et ensuite ?' Il dit : 'Ta mère.' Puis : 'Ton père.'",
    text_ar:
      "قَالَ رَجُلٌ: يَا رَسُولَ اللهِ، مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: أُمُّكَ. قَالَ: ثُمَّ مَنْ؟ قَالَ: أَبُوكَ",
    source: "Boukhâri",
    reference: "no. 5971",
    category: "famille",
    difficulty: 1,
  },
  {
    id: "had_031",
    text_fr:
      "La meilleure chose que le croyant laisse après lui est un enfant vertueux qui fait des invocations pour lui.",
    text_ar:
      "مِنْ خَيْرِ مَا يَخْلُفُ الرَّجُلُ مِنْ بَعْدِهِ ثَلَاثٌ: وَلَدٌ صَالِحٌ يَدْعُو لَهُ",
    source: "Ibn Majah",
    reference: "no. 1631",
    category: "famille",
    difficulty: 2,
  },
  {
    id: "had_032",
    text_fr:
      "Sois juste entre tes enfants, sois juste entre tes enfants.",
    text_ar: "اعْدِلُوا بَيْنَ أَبْنَائِكُمْ، اعْدِلُوا بَيْنَ أَبْنَائِكُمْ",
    source: "Mouslim",
    reference: "no. 1623",
    category: "famille",
    difficulty: 1,
  },
  {
    id: "had_033",
    text_fr:
      "Celui qui élève deux filles jusqu'à leur maturité, lui et moi nous serons proches au Jour de la Résurrection, comme cela — et il joignit ses doigts.",
    text_ar:
      "مَنْ عَالَ جَارِيَتَيْنِ حَتَّى تَبْلُغَا، جَاءَ يَوْمَ القِيَامَةِ أَنَا وَهُوَ كَهَاتَيْنِ",
    source: "Mouslim",
    reference: "no. 2631",
    category: "famille",
    difficulty: 2,
  },
  {
    id: "had_034",
    text_fr:
      "Chacun d'entre vous est un berger et chacun sera interrogé sur son troupeau. Le dirigeant est un berger. Le mari est un berger de sa famille. La femme est gardienne de la maison de son mari.",
    text_ar:
      "كُلُّكُمْ رَاعٍ وَكُلُّكُمْ مَسْئُولٌ عَنْ رَعِيَّتِهِ: الإِمَامُ رَاعٍ، وَالرَّجُلُ رَاعٍ فِي أَهْلِهِ، وَالمَرْأَةُ رَاعِيَةٌ فِي بَيْتِ زَوْجِهَا",
    source: "Boukhâri",
    reference: "no. 2554",
    category: "famille",
    difficulty: 2,
  },
  {
    id: "had_035",
    text_fr:
      "Traitez bien les femmes, car elles ont été créées d'une côte, et la partie la plus courbée d'une côte est la partie supérieure. Si vous essayez de la redresser, vous la briserez, et si vous la laissez, elle restera courbée.",
    text_ar:
      "اسْتَوْصُوا بِالنِّسَاءِ خَيْرًا، فَإِنَّهُنَّ خُلِقْنَ مِنْ ضِلَعٍ، وَإِنَّ أَعْوَجَ شَيْءٍ فِي الضِّلَعِ أَعْلَاهُ",
    source: "Boukhâri",
    reference: "no. 3331",
    category: "famille",
    difficulty: 2,
  },
  {
    id: "had_036",
    text_fr:
      "Le mariage est ma Sunna. Celui qui s'éloigne de ma Sunna ne fait pas partie des miens.",
    text_ar:
      "النِّكَاحُ مِنْ سُنَّتِي، فَمَنْ لَمْ يَعْمَلْ بِسُنَّتِي فَلَيْسَ مِنِّي",
    source: "Ibn Majah",
    reference: "no. 1846",
    category: "famille",
    difficulty: 2,
  },
  {
    id: "had_037",
    text_fr:
      "Lorsqu'un enfant meurt, Allah demande à Ses anges : 'Avez-vous pris l'âme du fils de Mon serviteur ?' Les anges répondent : 'Oui.' Allah dit : 'Construisez pour Mon serviteur une maison au paradis et nommez-la maison de l'éloge.'",
    text_ar:
      "إِذَا مَاتَ وَلَدُ العَبْدِ قَالَ اللهُ لِمَلَائِكَتِهِ: قَبَضْتُمْ وَلَدَ عَبْدِي؟ فَيَقُولُونَ: نَعَمْ. فَيَقُولُ: ابْنُوا لِعَبْدِي بَيْتًا فِي الجَنَّةِ وَسَمُّوهُ بَيْتَ الحَمْدِ",
    source: "Tirmidhi",
    reference: "no. 1021",
    category: "famille",
    difficulty: 3,
  },
  {
    id: "had_038",
    text_fr:
      "Respectez vos pères pour que vos fils vous respectent.",
    text_ar:
      "بَرُّوا آبَاءَكُمْ تَبَرَّكُمْ أَبْنَاؤُكُمْ",
    source: "Tabarani",
    reference: "Mu'jam al-Awsat",
    category: "famille",
    difficulty: 1,
  },
  {
    id: "had_039",
    text_fr:
      "Satisfaire son père est la satisfaction d'Allah, et la colère du père est la colère d'Allah.",
    text_ar:
      "رِضَا الرَّبِّ فِي رِضَا الوَالِدِ، وَسَخَطُ الرَّبِّ فِي سَخَطِ الوَالِدِ",
    source: "Tirmidhi",
    reference: "no. 1899",
    category: "famille",
    difficulty: 2,
  },
  {
    id: "had_040",
    text_fr:
      "Quiconque désire voir son provision augmentée et sa vie prolongée doit maintenir les liens familiaux.",
    text_ar:
      "مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ، وَيُنْسَأَ لَهُ فِي أَثَرِهِ، فَلْيَصِلْ رَحِمَهُ",
    source: "Boukhâri",
    reference: "no. 5986",
    category: "famille",
    difficulty: 2,
  },

  // ── CONNAISSANCE (10) ────────────────────────────────────────────────────
  {
    id: "had_041",
    text_fr:
      "La recherche de la connaissance est une obligation pour tout musulman.",
    text_ar:
      "طَلَبُ العِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
    source: "Ibn Majah",
    reference: "no. 224",
    category: "connaissance",
    difficulty: 1,
  },
  {
    id: "had_042",
    text_fr:
      "Cherchez la science, même en Chine.",
    text_ar: "اطْلُبُوا العِلْمَ وَلَوْ بِالصِّينِ",
    source: "Tabarani",
    reference: "Mu'jam al-Kabir",
    category: "connaissance",
    difficulty: 1,
  },
  {
    id: "had_043",
    text_fr:
      "Quand un homme meurt, ses actes s'arrêtent sauf pour trois choses : une aumône continue, une connaissance dont on profite, ou un enfant vertueux qui prie pour lui.",
    text_ar:
      "إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: إِلَّا مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ",
    source: "Mouslim",
    reference: "no. 1631",
    category: "connaissance",
    difficulty: 2,
  },
  {
    id: "had_044",
    text_fr:
      "La supériorité d'un savant sur un adorateur est comme la supériorité de la lune en pleine lune sur toutes les étoiles.",
    text_ar:
      "فَضْلُ العَالِمِ عَلَى العَابِدِ كَفَضْلِ القَمَرِ لَيْلَةَ البَدْرِ عَلَى سَائِرِ الكَوَاكِبِ",
    source: "Abu Dawud",
    reference: "no. 3641",
    category: "connaissance",
    difficulty: 2,
  },
  {
    id: "had_045",
    text_fr:
      "Celui à qui Allah veut du bien, Il lui donne la compréhension de la religion.",
    text_ar:
      "مَنْ يُرِدِ اللهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ",
    source: "Boukhâri",
    reference: "no. 71",
    category: "connaissance",
    difficulty: 2,
  },
  {
    id: "had_046",
    text_fr:
      "Transmettre de ma part, même un seul verset.",
    text_ar: "بَلِّغُوا عَنِّي وَلَوْ آيَةً",
    source: "Boukhâri",
    reference: "no. 3461",
    category: "connaissance",
    difficulty: 1,
  },
  {
    id: "had_047",
    text_fr:
      "Les savants sont les héritiers des prophètes. Les prophètes n'ont pas laissé de dinar ni de dirham en héritage, mais ils ont laissé la connaissance.",
    text_ar:
      "إِنَّ العُلَمَاءَ وَرَثَةُ الأَنْبِيَاءِ، وَإِنَّ الأَنْبِيَاءَ لَمْ يُوَرِّثُوا دِينَارًا وَلَا دِرْهَمًا، وَرَّثُوا العِلْمَ",
    source: "Abu Dawud",
    reference: "no. 3641",
    category: "connaissance",
    difficulty: 2,
  },
  {
    id: "had_048",
    text_fr:
      "Allah n'arrache pas la science aux cœurs des gens, mais Il la fait disparaître en emportant les savants.",
    text_ar:
      "إِنَّ اللهَ لَا يَقْبِضُ العِلْمَ انْتِزَاعًا يَنْتَزِعُهُ مِنَ العِبَادِ، وَلَكِنْ يَقْبِضُ العِلْمَ بِقَبْضِ العُلَمَاءِ",
    source: "Boukhâri",
    reference: "no. 100",
    category: "connaissance",
    difficulty: 3,
  },
  {
    id: "had_049",
    text_fr:
      "Celui qui voyage sur un chemin à la recherche de la connaissance, Allah lui facilite un chemin vers le paradis.",
    text_ar:
      "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللهُ لَهُ بِهِ طَرِيقًا إِلَى الجَنَّةِ",
    source: "Mouslim",
    reference: "no. 2699",
    category: "connaissance",
    difficulty: 2,
  },
  {
    id: "had_050",
    text_fr:
      "Dis : 'Mon Seigneur, accorde-moi plus de science' (Coran 20:114).",
    text_ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    source: "Coran",
    reference: "20:114",
    category: "connaissance",
    difficulty: 1,
  },

  // ── PRIÈRE (10) ──────────────────────────────────────────────────────────
  {
    id: "had_051",
    text_fr:
      "La prière est le pilier de la religion.",
    text_ar: "الصَّلَاةُ عِمَادُ الدِّينِ",
    source: "Tirmidhi",
    reference: "no. 2749",
    category: "priere",
    difficulty: 1,
  },
  {
    id: "had_052",
    text_fr:
      "La première chose dont le serviteur sera rendu compte au Jour de la Résurrection est la prière. Si elle est bonne, tout le reste de ses actions sera bon. Si elle est mauvaise, tout le reste de ses actions sera mauvais.",
    text_ar:
      "أَوَّلُ مَا يُحَاسَبُ بِهِ العَبْدُ يَوْمَ القِيَامَةِ الصَّلَاةُ، فَإِنْ صَلَحَتْ صَلَحَ سَائِرُ عَمَلِهِ، وَإِنْ فَسَدَتْ فَسَدَ سَائِرُ عَمَلِهِ",
    source: "Tirmidhi",
    reference: "no. 413",
    category: "priere",
    difficulty: 2,
  },
  {
    id: "had_053",
    text_fr:
      "La distance la plus proche entre un serviteur et son Seigneur est lors de la prosternation (sujud). Faites donc beaucoup d'invocations lors du sujud.",
    text_ar:
      "أَقْرَبُ مَا يَكُونُ العَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ، فَأَكْثِرُوا الدُّعَاءَ",
    source: "Mouslim",
    reference: "no. 482",
    category: "priere",
    difficulty: 2,
  },
  {
    id: "had_054",
    text_fr:
      "La prière de groupe est supérieure à la prière individuelle de vingt-sept degrés.",
    text_ar:
      "صَلَاةُ الجَمَاعَةِ تَفْضُلُ صَلَاةَ الفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً",
    source: "Boukhâri",
    reference: "no. 645",
    category: "priere",
    difficulty: 2,
  },
  {
    id: "had_055",
    text_fr:
      "La prière du Fajr est plus précieuse que la vie de ce monde et ce qu'elle contient.",
    text_ar:
      "رَكْعَتَا الفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا",
    source: "Mouslim",
    reference: "no. 725",
    category: "priere",
    difficulty: 2,
  },
  {
    id: "had_056",
    text_fr:
      "Prie selon que tu m'as vu prier.",
    text_ar: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي",
    source: "Boukhâri",
    reference: "no. 631",
    category: "priere",
    difficulty: 1,
  },
  {
    id: "had_057",
    text_fr:
      "Que chacun d'entre vous prenne son ablution avec intégrité, puis lève les deux mains en disant : 'J'atteste qu'il n'y a de dieu qu'Allah et que Muhammad est Son serviteur et messager.'",
    text_ar:
      "مَا مِنْكُمْ مِنْ أَحَدٍ يَتَوَضَّأُ فَيُبْلِغُ — أَوْ فَيُسْبِغُ — الوُضُوءَ ثُمَّ يَقُولُ: أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، إِلَّا فُتِحَتْ لَهُ أَبْوَابُ الجَنَّةِ الثَّمَانِيَةُ",
    source: "Mouslim",
    reference: "no. 234",
    category: "priere",
    difficulty: 3,
  },
  {
    id: "had_058",
    text_fr:
      "Entre un homme et l'impiété, il n'y a que l'abandon de la prière.",
    text_ar:
      "بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالكُفْرِ تَرْكُ الصَّلَاةِ",
    source: "Mouslim",
    reference: "no. 82",
    category: "priere",
    difficulty: 2,
  },
  {
    id: "had_059",
    text_fr:
      "Quand l'un d'entre vous se lève pour prier, Allah est en face de lui. Qu'il ne crache donc pas devant lui.",
    text_ar:
      "إِنَّ أَحَدَكُمْ إِذَا قَامَ يُصَلِّي فَإِنَّهُ يُنَاجِي رَبَّهُ أَوْ رَبَّهُ بَيْنَهُ وَبَيْنَ القِبْلَةِ",
    source: "Boukhâri",
    reference: "no. 406",
    category: "priere",
    difficulty: 2,
  },
  {
    id: "had_060",
    text_fr:
      "Lorsque tu te couches, fais tes ablutions comme pour la prière, puis couche-toi sur le côté droit et dis : 'Ô Allah, je me soumet à Toi.'",
    text_ar:
      "إِذَا أَخَذْتَ مَضْجَعَكَ فَتَوَضَّأْ وُضُوءَكَ لِلصَّلَاةِ، ثُمَّ اضْطَجِعْ عَلَى شِقِّكَ الأَيْمَنِ",
    source: "Boukhâri",
    reference: "no. 247",
    category: "priere",
    difficulty: 2,
  },

  // ── RAMADAN (8) ──────────────────────────────────────────────────────────
  {
    id: "had_061",
    text_fr:
      "Quand Ramadan arrive, les portes du paradis sont ouvertes, les portes de l'enfer sont fermées et les démons sont enchaînés.",
    text_ar:
      "إِذَا جَاءَ رَمَضَانُ فُتِّحَتْ أَبْوَابُ الجَنَّةِ، وَغُلِّقَتْ أَبْوَابُ النَّارِ، وَصُفِّدَتِ الشَّيَاطِينُ",
    source: "Boukhâri",
    reference: "no. 3277",
    category: "ramadan",
    difficulty: 1,
  },
  {
    id: "had_062",
    text_fr:
      "Celui qui observe le jeûne du Ramadan par foi et dans l'espoir d'une récompense d'Allah, ses péchés passés lui seront pardonnés.",
    text_ar:
      "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    source: "Boukhâri",
    reference: "no. 38",
    category: "ramadan",
    difficulty: 1,
  },
  {
    id: "had_063",
    text_fr:
      "Chaque acte des fils d'Adam est multiplié : une bonne action est rémunérée par dix à sept cents fois sa valeur. Allah dit : 'Sauf le jeûne, car il est pour Moi et c'est Moi qui en récompense.'",
    text_ar:
      "كُلُّ عَمَلِ ابْنِ آدَمَ يُضَاعَفُ الحَسَنَةُ بِعَشْرِ أَمْثَالِهَا إِلَى سَبْعِمِائَةِ ضِعْفٍ. قَالَ اللهُ: إِلَّا الصَّوْمَ فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ",
    source: "Mouslim",
    reference: "no. 1151",
    category: "ramadan",
    difficulty: 2,
  },
  {
    id: "had_064",
    text_fr:
      "Avancez le repas du matin (suhur), car il y a une bénédiction dans le suhur.",
    text_ar:
      "تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً",
    source: "Boukhâri",
    reference: "no. 1923",
    category: "ramadan",
    difficulty: 1,
  },
  {
    id: "had_065",
    text_fr:
      "Cherchez la nuit du Destin dans les dix dernières nuits de Ramadan.",
    text_ar:
      "تَحَرَّوْا لَيْلَةَ القَدْرِ فِي الوِتْرِ مِنَ العَشْرِ الأَوَاخِرِ مِنْ رَمَضَانَ",
    source: "Boukhâri",
    reference: "no. 2017",
    category: "ramadan",
    difficulty: 1,
  },
  {
    id: "had_066",
    text_fr:
      "Hatez-vous de rompre le jeûne, car les gens seront toujours dans la rectitude tant qu'ils se hâteront de rompre le jeûne.",
    text_ar:
      "لَا يَزَالُ النَّاسُ بِخَيْرٍ مَا عَجَّلُوا الفِطْرَ",
    source: "Boukhâri",
    reference: "no. 1957",
    category: "ramadan",
    difficulty: 2,
  },
  {
    id: "had_067",
    text_fr:
      "Le jeûneur a deux joies : l'une quand il rompt le jeûne, et l'autre quand il rencontrera son Seigneur.",
    text_ar:
      "لِلصَّائِمِ فَرْحَتَانِ يَفْرَحُهُمَا: إِذَا أَفْطَرَ فَرِحَ بِفِطْرِهِ، وَإِذَا لَقِيَ رَبَّهُ فَرِحَ بِصَوْمِهِ",
    source: "Mouslim",
    reference: "no. 1151",
    category: "ramadan",
    difficulty: 2,
  },
  {
    id: "had_068",
    text_fr:
      "Celui qui ne cesse pas de mentir et d'agir selon le mensonge, Allah n'a que faire qu'il abandonne sa nourriture et sa boisson.",
    text_ar:
      "مَنْ لَمْ يَدَعْ قَوْلَ الزُّورِ وَالعَمَلَ بِهِ، فَلَيْسَ لِلَّهِ حَاجَةٌ فِي أَنْ يَدَعَ طَعَامَهُ وَشَرَابَهُ",
    source: "Boukhâri",
    reference: "no. 1903",
    category: "ramadan",
    difficulty: 2,
  },

  // ── VIE QUOTIDIENNE (12) ─────────────────────────────────────────────────
  {
    id: "had_069",
    text_fr:
      "La propreté est la moitié de la foi.",
    text_ar: "الطَّهُورُ شَطْرُ الإِيمَانِ",
    source: "Mouslim",
    reference: "no. 223",
    category: "vie_quotidienne",
    difficulty: 1,
  },
  {
    id: "had_070",
    text_fr:
      "Mangez ensemble et ne vous séparez pas, car la bénédiction est dans la réunion.",
    text_ar:
      "كُلُوا جَمِيعًا وَلَا تَتَفَرَّقُوا فَإِنَّ البَرَكَةَ مَعَ الجَمَاعَةِ",
    source: "Ibn Majah",
    reference: "no. 3287",
    category: "vie_quotidienne",
    difficulty: 1,
  },
  {
    id: "had_071",
    text_fr:
      "Nul d'entre vous ne mangera jamais une meilleure nourriture que ce que gagnent ses propres mains.",
    text_ar:
      "مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ",
    source: "Boukhâri",
    reference: "no. 2072",
    category: "vie_quotidienne",
    difficulty: 1,
  },
  {
    id: "had_072",
    text_fr:
      "La santé et le temps libre sont deux bénédictions dont beaucoup de gens font mauvais usage.",
    text_ar:
      "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالفَرَاغُ",
    source: "Boukhâri",
    reference: "no. 6412",
    category: "vie_quotidienne",
    difficulty: 1,
  },
  {
    id: "had_073",
    text_fr:
      "Attache ton chameau, puis mets ta confiance en Allah.",
    text_ar:
      "اعْقِلْهَا وَتَوَكَّلْ",
    source: "Tirmidhi",
    reference: "no. 2517",
    category: "vie_quotidienne",
    difficulty: 1,
  },
  {
    id: "had_074",
    text_fr:
      "Aucune fatigue, maladie, anxiété, chagrin, douleur ou tristesse ne touche le musulman, même une épine qui le pique, sans qu'Allah n'expie ses péchés.",
    text_ar:
      "مَا يُصِيبُ المُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حُزْنٍ وَلَا أَذًى وَلَا غَمٍّ، حَتَّى الشَّوْكَةُ يُشَاكُهَا، إِلَّا كَفَّرَ اللهُ بِهَا مِنْ خَطَايَاهُ",
    source: "Boukhâri",
    reference: "no. 5641",
    category: "vie_quotidienne",
    difficulty: 2,
  },
  {
    id: "had_075",
    text_fr:
      "Il y a une bénédiction dans les nuits avant le coucher du soleil.",
    text_ar:
      "بُورِكَ لِأُمَّتِي فِي بُكُورِهَا",
    source: "Tirmidhi",
    reference: "no. 1212",
    category: "vie_quotidienne",
    difficulty: 2,
  },
  {
    id: "had_076",
    text_fr:
      "Toute parole de sagesse est le bien perdu du croyant — où qu'il la trouve, il a le droit de la prendre.",
    text_ar:
      "الكَلِمَةُ الحِكْمَةُ ضَالَّةُ المُؤْمِنِ، فَحَيْثُ وَجَدَهَا فَهُوَ أَحَقُّ بِهَا",
    source: "Tirmidhi",
    reference: "no. 2687",
    category: "vie_quotidienne",
    difficulty: 2,
  },
  {
    id: "had_077",
    text_fr:
      "Soyez dans ce monde comme si vous étiez un étranger ou un voyageur de passage.",
    text_ar:
      "كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ",
    source: "Boukhâri",
    reference: "no. 6416",
    category: "vie_quotidienne",
    difficulty: 1,
  },
  {
    id: "had_078",
    text_fr:
      "Ne regarde pas de haut ceux qui sont sous toi, car tu pourrais mépriser une bénédiction d'Allah.",
    text_ar:
      "انْظُرُوا إِلَى مَنْ هُوَ أَسْفَلَ مِنْكُمْ، وَلَا تَنْظُرُوا إِلَى مَنْ هُوَ فَوْقَكُمْ",
    source: "Boukhâri",
    reference: "no. 6490",
    category: "vie_quotidienne",
    difficulty: 1,
  },
  {
    id: "had_079",
    text_fr:
      "Prends soin de ce qui te profite, demande l'aide à Allah et ne te décourage pas.",
    text_ar:
      "احْرِصْ عَلَى مَا يَنْفَعُكَ، وَاسْتَعِنْ بِاللهِ وَلَا تَعْجَزْ",
    source: "Mouslim",
    reference: "no. 2664",
    category: "vie_quotidienne",
    difficulty: 1,
  },
  {
    id: "had_080",
    text_fr:
      "La douceur ne se trouve dans une chose qu'elle ne l'embellit, et elle n'est ôtée d'une chose qu'elle ne la défigure.",
    text_ar:
      "إِنَّ الرِّفْقَ لَا يَكُونُ فِي شَيْءٍ إِلَّا زَانَهُ، وَلَا يُنْزَعُ مِنْ شَيْءٍ إِلَّا شَانَهُ",
    source: "Mouslim",
    reference: "no. 2594",
    category: "vie_quotidienne",
    difficulty: 1,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────────────────────
const BATCH = 40;
let inserted = 0;

console.log(`Insertion de ${HADITHS.length} hadiths...`);

for (let i = 0; i < HADITHS.length; i += BATCH) {
  const batch = HADITHS.slice(i, i + BATCH);
  const { error } = await supabase
    .from("hadiths")
    .upsert(batch, { onConflict: "id" });

  if (error) {
    console.error(`Erreur batch ${i}–${i + BATCH}:`, error.message);
  } else {
    inserted += batch.length;
    process.stdout.write(`\r${inserted}/${HADITHS.length}`);
  }
}

console.log(`\nTerminé. ${inserted} hadiths insérés/mis à jour.`);
