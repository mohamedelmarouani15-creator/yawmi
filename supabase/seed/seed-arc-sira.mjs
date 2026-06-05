/**
 * Seed arc_sira — La vie du Prophète ﷺ (12 chapitres)
 * CONTENU À VALIDER PAR UNE PERSONNE QUALIFIÉE AVANT DIFFUSION PUBLIQUE
 *
 * Usage :
 *   npx tsx supabase/seed/seed-arc-sira.mjs
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
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("SUPABASE_URL ou SERVICE_ROLE_KEY manquant dans .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── 1. Insérer l'arc ─────────────────────────────────────────────────────────
console.log("Insertion de l'arc arc_sira...");
const { error: storyErr } = await supabase.from("stories").upsert(
  {
    id: "arc_sira",
    title: "La Sîra — La vie du Prophète ﷺ",
    title_ar: "السِّيرَةُ النَّبَوِيَّةُ",
    arc_type: "prophets",
    total_chapters: 12,
    status: "published",
    order_index: 5,
  },
  { onConflict: "id" }
);
if (storyErr) {
  console.error("Erreur insertion stories:", storyErr.message);
  process.exit(1);
}
console.log("arc_sira inséré/mis à jour dans stories.");

// ── 2. Chapitres ──────────────────────────────────────────────────────────────
const chapters = [
  // ── CHAPITRE 1 ────────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 1,
    title: "La naissance du Prophète ﷺ",
    narrative: `Je suis une pierre de la Ka'ba, posée là depuis qu'Ibrahim et Ismaïl — que la paix soit sur eux — élevèrent les murs de la Maison sacrée. J'ai vu passer les siècles, les pèlerins, les conquistadors et les poètes. Mais ce que je vais te raconter est l'événement que j'attendais depuis que j'existe.

Nous sommes en l'an 570 de l'ère chrétienne — l'Année de l'Éléphant, ainsi nommée parce qu'Abraha, gouverneur yéménite, avait marché sur La Mecque avec une armée montée sur des éléphants pour détruire la Ka'ba. Allah écarta cette armée par un prodige que le Coran rappelle dans la Sourate Al-Fil (105) : des oiseaux portant des pierres d'argile les anéantirent.

C'est dans cette même année que naquit, dans le quartier des Banu Hashim de La Mecque, un enfant orphelin de père. Son père, Abdullah ibn Abd al-Muttalib, était mort avant même sa naissance. Sa mère s'appelait Amina bint Wahb. L'enfant fut confié, selon la coutume arabe, à une nourrice des tribus du désert : Halima al-Sa'diyya, qui témoigna de bénédictions inhabituelles dans son foyer depuis l'arrivée de l'enfant.

Son grand-père Abd al-Muttalib lui donna un nom rare, presque inconnu parmi les Arabes : Muhammad — Celui qui est loué.

La leçon de la pierre : les grandes destinées naissent souvent dans la fragilité. Un orphelin dans un pays sans état — et c'est lui que l'histoire allait nommer "la miséricorde pour les mondes" (Sourate Al-Anbiya, 21:107).`,
    vocabulary: [
      {
        word_ar: "أَمِين",
        translit: "amin",
        definition_fr: "digne de confiance, honnête — surnom du Prophète ﷺ avant la révélation",
        example: "سُمِّيَ بِالأَمِينِ (il fut surnommé l'Amin)",
      },
      {
        word_ar: "سِيرَة",
        translit: "sira",
        definition_fr: "biographie, vie — utilisé pour désigner la vie du Prophète ﷺ",
        example: "السِّيرَةُ النَّبَوِيَّةُ (la biographie prophétique)",
      },
    ],
    questions: [
      {
        id: "sr1_q1",
        type: "comprehension",
        text: "En quelle année naquit le Prophète Muhammad ﷺ, et pourquoi cette année est-elle célèbre ?",
        options: [
          { text: "En 570, l'année où Ibrahim reconstruisit la Ka'ba", correct: false },
          { text: "En 570, l'Année de l'Éléphant — tentative avortée de détruire la Ka'ba", correct: true },
          { text: "En 622, l'année de la Hijra", correct: false },
          { text: "En 610, l'année de la première révélation", correct: false },
        ],
      },
      {
        id: "sr1_q2",
        type: "vocabulary",
        text: "Quel était le surnom du Prophète ﷺ avant la révélation, signifiant 'digne de confiance' ?",
        options: [
          { text: "الصَّادِق (al-Sadiq)", correct: false },
          { text: "الرَّحِيم (al-Rahim)", correct: false },
          { text: "الأَمِين (al-Amin)", correct: true },
          { text: "الكَرِيم (al-Karim)", correct: false },
        ],
      },
      {
        id: "sr1_q3",
        type: "reflection",
        text: "Le Prophète ﷺ naquit orphelin de père dans une société tribale. Qu'est-ce que cela t'inspire sur la façon dont Allah choisit Ses envoyés ?",
        reflection_prompt: "Prends le temps de réfléchir librement. La pierre t'écoute.",
      },
      {
        id: "sr1_q4",
        type: "spaced_repetition",
        text: "Retiens ce mot pour la suite : سِيرَة (sira) = la biographie du Prophète ﷺ.",
        options: [],
        spaced_ref: "sr1_q2",
      },
    ],
    values_shown: ["providence_divine", "confiance_en_allah", "fragilite_des_debuts"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 2 ────────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 2,
    title: "L'enfance et la jeunesse — Al-Amine",
    narrative: `Je suis toujours la pierre de la Ka'ba. J'ai vu cet enfant grandir dans les ruelles de La Mecque — d'abord confié à Halima al-Sa'diyya dans le désert, puis revenu auprès de sa mère Amina, puis orphelin de mère à l'âge de six ans (elle mourut lors d'un voyage à Yathrib), confié ensuite à son grand-père Abd al-Muttalib, qui mourut lui aussi deux ans plus tard. L'enfant avait huit ans.

C'est son oncle Abu Talib qui le recueillit alors et l'éleva avec ses propres enfants. Le Prophète ﷺ travailla comme berger pour des familles mecquoises — un métier humble que partagèrent de nombreux prophètes avant lui. Plus tard, il accompagna Abu Talib dans des caravanes commerciales jusqu'en Syrie.

Parmi les marchands et les tribus, un surnom s'imposa naturellement, sans qu'il le cherche : Al-Amine — le Digne de Confiance. Les Mecquois, qu'ils soient ses alliés ou ses adversaires, lui confiaient leurs affaires, leurs dépôts, leurs secrets. Ce surnom n'était pas un titre honorifique : c'était la description exacte de ce qu'ils observaient en lui.

Le Coran ne décrit pas ces années en détail — mais il nous dit que Allah formait Son Prophète ﷺ dans la discrétion. "N'est-ce pas Lui qui t'a trouvé orphelin et qui t'a recueilli ?" (Sourate Ad-Duha, 93:6)

La leçon de la pierre : la confiance se gagne acte par acte, jour après jour. Al-Amine n'est pas un titre qu'on reçoit — c'est celui qu'on devient.`,
    vocabulary: [
      {
        word_ar: "أَمَانَة",
        translit: "amana",
        definition_fr: "confiance, fidélité, intégrité — qualité centrale du Prophète ﷺ",
        example: "أَدُّوا الأَمَانَاتِ إِلَى أَهْلِهَا (rendez les dépôts à ceux qui vous les ont confiés) — Sourate An-Nisa, 4:58",
      },
      {
        word_ar: "صِدْق",
        translit: "sidq",
        definition_fr: "véracité, honnêteté — second surnom : al-Sadiq (le Véridique)",
        example: "الصِّدْقُ يَهْدِي إِلَى الْبِرِّ (la véracité conduit à la piété) — Hadith Muslim",
      },
    ],
    questions: [
      {
        id: "sr2_q1",
        type: "comprehension",
        text: "Pourquoi les Mecquois surnommaient-ils le Prophète ﷺ 'Al-Amine' ?",
        options: [
          { text: "Parce qu'il récitait le Coran mieux que les autres", correct: false },
          { text: "Parce qu'ils observaient en lui une honnêteté et une fiabilité constantes", correct: true },
          { text: "Parce que c'était un titre accordé par la tribu Quraysh", correct: false },
          { text: "Parce qu'il était le gardien de la Ka'ba", correct: false },
        ],
      },
      {
        id: "sr2_q2",
        type: "vocabulary",
        text: "Quel mot arabe désigne la confiance et l'intégrité — qualité fondamentale du Prophète ﷺ ?",
        options: [
          { text: "سِيرَة (sira)", correct: false },
          { text: "أَمَانَة (amana)", correct: true },
          { text: "رِسَالَة (risala)", correct: false },
          { text: "حِكْمَة (hikma)", correct: false },
        ],
      },
      {
        id: "sr2_q3",
        type: "reflection",
        text: "Le Prophète ﷺ gagna la confiance de tous avant même la révélation. Selon toi, pourquoi est-il important d'être fiable dans les petites choses ?",
        reflection_prompt: "Réfléchis librement.",
      },
      {
        id: "sr2_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 1 : comment appelle-t-on la biographie du Prophète ﷺ en arabe ?",
        options: [
          { text: "أَمَانَة (amana)", correct: false },
          { text: "سِيرَة (sira)", correct: true },
          { text: "صِدْق (sidq)", correct: false },
          { text: "رِسَالَة (risala)", correct: false },
        ],
        spaced_ref: "sr1_q2",
      },
    ],
    values_shown: ["amana", "confiance", "integrite", "formation_prophetique"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 3 ────────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 3,
    title: "Le mariage avec Khadija RA",
    narrative: `Je suis un parchemin de comptes, roulé dans la salle des caravanes de Khadija bint Khuwaylid. Je connais les chiffres de ses affaires : elle était l'une des femmes les plus riches et les plus respectées de La Mecque, marchande accomplie, veuve deux fois, mère de plusieurs enfants.

Elle cherchait un homme honnête pour gérer ses caravanes vers la Syrie. On lui parla de Muhammad, le jeune homme d'une vingtaine d'années que toute La Mecque appelait Al-Amine. Elle l'engagea. Il dirigea la caravane. Il en revint avec un bénéfice double de ce qu'elle escomptait.

Son serviteur Maysara lui raconta ce qu'il avait observé : sous une chaleur accablante, deux anges ombrageaient le jeune homme de leurs ailes. Khadija, femme d'esprit et de cœur, comprit que cet homme était différent.

C'est elle qui prit l'initiative de lui proposer le mariage. Muhammad avait 25 ans, Khadija 40. Les familles donnèrent leur accord. Ce mariage fut, selon les hadiths (Bukhari, Muslim), le plus important de sa vie — le plus aimé, le seul pendant lequel il ne prit aucune autre épouse.

Khadija devint sa confidente, son soutien, son ancrage. Et quinze ans plus tard, lorsque viendrait la première révélation et la peur qui l'accompagnait, c'est vers elle qu'il courrait — et c'est elle qui lui dirait les mots les plus réconfortants de l'histoire.

La leçon du parchemin : les grandes unions sont celles où deux âmes se soutiennent dans ce que l'autre n'ose pas encore nommer.`,
    vocabulary: [
      {
        word_ar: "نِكَاح",
        translit: "nikah",
        definition_fr: "mariage islamique — contrat sacré entre deux personnes",
        example: "النِّكَاحُ مِنْ سُنَّتِي (le mariage fait partie de ma sunna) — Hadith Ibn Majah",
      },
      {
        word_ar: "سَكِينَة",
        translit: "sakina",
        definition_fr: "tranquillité, sérénité, paix intérieure — que le mariage apporte",
        example: "وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً (Il a mis entre vous affection et miséricorde) — Sourate Ar-Rum, 30:21",
      },
    ],
    questions: [
      {
        id: "sr3_q1",
        type: "comprehension",
        text: "Qui prit l'initiative de proposer le mariage à Muhammad ﷺ, et pourquoi ?",
        options: [
          { text: "La famille de Muhammad ﷺ proposa le mariage à la famille de Khadija", correct: false },
          { text: "Khadija RA prit l'initiative, impressionnée par son honnêteté et ce qu'avait rapporté son serviteur", correct: true },
          { text: "Le grand-père Abd al-Muttalib arrangea le mariage avant de mourir", correct: false },
          { text: "Abu Talib proposa le mariage lors d'une caravane", correct: false },
        ],
      },
      {
        id: "sr3_q2",
        type: "vocabulary",
        text: "Quel mot arabe désigne la tranquillité et la paix intérieure que le mariage doit apporter ?",
        options: [
          { text: "أَمَانَة (amana)", correct: false },
          { text: "نِكَاح (nikah)", correct: false },
          { text: "سَكِينَة (sakina)", correct: true },
          { text: "حِكْمَة (hikma)", correct: false },
        ],
      },
      {
        id: "sr3_q3",
        type: "reflection",
        text: "Khadija RA était plus âgée, plus riche et plus établie. Elle choisit Muhammad ﷺ pour sa droiture et non sa fortune. Que penses-tu des critères qui doivent guider une union ?",
        reflection_prompt: "Réfléchis sans pression.",
      },
      {
        id: "sr3_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 2 : quel mot désigne l'intégrité et la fiabilité — qualité qui valut à Muhammad ﷺ son surnom ?",
        options: [
          { text: "سَكِينَة (sakina)", correct: false },
          { text: "أَمَانَة (amana)", correct: true },
          { text: "نِكَاح (nikah)", correct: false },
          { text: "سِيرَة (sira)", correct: false },
        ],
        spaced_ref: "sr2_q2",
      },
    ],
    values_shown: ["mariage", "confiance", "soutien_mutuel", "amour"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 4 ────────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 4,
    title: "La première révélation — Hira",
    narrative: `Je suis un rocher de la grotte de Hira, creusée dans le mont An-Nur aux abords de La Mecque. Depuis des années, un homme vient ici, seul, pour se retirer du monde — pour penser, pour prier, pour chercher. Son nom : Muhammad ibn Abdullah. Il a maintenant 40 ans.

Ces retraites spirituelles s'appelaient al-tahannuth — une forme de piété solitaire. Il y passait parfois plusieurs nuits de suite, emportant des provisions, avant de redescendre vers La Mecque.

En ce soir du Ramadan de l'an 610, tout changea.

L'ange Jibril (Gabriel) apparut. Le Coran nous rapporte les premiers mots révélés — les tous premiers — avec leur verbe inaugural : اقْرَأْ — Lis ! (Sourate Al-'Alaq, 96:1)

Le Prophète ﷺ répondit, selon les hadiths de Bukhari, qu'il ne savait pas lire. L'ange le serra contre lui trois fois, puis récita : "Lis au nom de ton Seigneur qui a créé — qui a créé l'homme d'une adhérence. Lis ! Ton Seigneur est le Très-Généreux, qui a enseigné par le calame." (96:1-4)

Le Prophète ﷺ descendit de la grotte, tremblant, dit la Sîra. Il rejoignit Khadija et lui dit : "Couvre-moi !" Elle le couvrit, le réchauffa. Puis il lui raconta. Et Khadija prononça ces mots qui traversèrent l'histoire : "Non, par Allah, Il ne t'humiliera jamais. Tu maintiens les liens de parenté, tu portes les charges des autres, tu honores l'hôte, tu soutiens la vérité."

La leçon du rocher : la révélation commença par un ordre — Lis ! — mais la première réponse humaine fut celle d'une épouse qui connaissait le cœur de son mari.`,
    vocabulary: [
      {
        word_ar: "وَحْي",
        translit: "wahy",
        definition_fr: "révélation divine reçue par un prophète",
        example: "وَمَا يَنطِقُ عَنِ الْهَوَىٰ — إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ (Il ne parle pas sous l'empire de la passion — ce n'est qu'une révélation inspirée) — Sourate An-Najm, 53:3-4",
      },
      {
        word_ar: "اقْرَأْ",
        translit: "iqra",
        definition_fr: "Lis ! — premier mot révélé du Coran (Sourate Al-'Alaq, 96:1)",
        example: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ (Lis au nom de ton Seigneur qui a créé)",
      },
    ],
    questions: [
      {
        id: "sr4_q1",
        type: "comprehension",
        text: "Quel fut le tout premier mot révélé du Coran, dans la grotte de Hira ?",
        options: [
          { text: "بِسْمِ (Bismi — Au nom de)", correct: false },
          { text: "اقْرَأْ (Iqra' — Lis !)", correct: true },
          { text: "الحَمْدُ (Al-Hamdu — La louange)", correct: false },
          { text: "قُلْ (Qul — Dis !)", correct: false },
        ],
      },
      {
        id: "sr4_q2",
        type: "vocabulary",
        text: "Quel mot arabe désigne la révélation divine transmise aux prophètes ?",
        options: [
          { text: "اقْرَأْ (iqra)", correct: false },
          { text: "سِيرَة (sira)", correct: false },
          { text: "وَحْي (wahy)", correct: true },
          { text: "أَمَانَة (amana)", correct: false },
        ],
      },
      {
        id: "sr4_q3",
        type: "reflection",
        text: "Khadija réconforta le Prophète ﷺ en listant ses bonnes qualités. Penses-tu que savoir reconnaître les vertus de quelqu'un est une forme d'amour ?",
        reflection_prompt: "Il n'y a pas de mauvaise réponse. Réfléchis librement.",
      },
      {
        id: "sr4_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 3 : quel mot désigne la sérénité et la paix que le mariage apporte ?",
        options: [
          { text: "وَحْي (wahy)", correct: false },
          { text: "سَكِينَة (sakina)", correct: true },
          { text: "اقْرَأْ (iqra)", correct: false },
          { text: "صِدْق (sidq)", correct: false },
        ],
        spaced_ref: "sr3_q2",
      },
    ],
    values_shown: ["revelation", "foi", "soutien_de_khadija", "debut_du_coran"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 5 ────────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 5,
    title: "Les premières années de la Da'wa",
    narrative: `Je suis le seuil de la maison d'Al-Arqam ibn Abi Al-Arqam, sur la pente du mont Safa à La Mecque. Cette maison fut le premier lieu de rassemblement discret des premiers muslims — une sorte d'école de foi cachée aux regards des Quraysh.

Après la révélation, le Prophète ﷺ commença à appeler à l'islam en secret, pendant trois ans. Les premiers à répondre à son appel furent ceux qui le connaissaient le mieux : Khadija RA (la première), Ali ibn Abi Talib (son cousin, alors enfant), Zayd ibn Haritha (son affranchi), Abu Bakr al-Siddiq (son ami intime).

Puis vint l'ordre coranique de prêcher ouvertement. Le Coran lui dit : "Avertis ta famille la plus proche." (Sourate Ash-Shu'ara, 26:214) Le Prophète ﷺ rassembla les Banu Hashim sur le mont Safa et leur parla. La plupart ne répondirent pas — mais ils ne purent nier son intégrité.

La da'wa — l'appel à l'islam — ne commença pas par des épées ni par la politique. Elle commença par la parole, l'exemple, la patience et la conviction. Les premiers convertis le suivirent non par peur ni par intérêt : ils suivirent parce qu'ils voyaient en lui la vérité vivante.

La leçon du seuil : toute grande transformation commence par quelques personnes convaincues, réunies discrètement, portant une lumière qu'elles ne peuvent pas garder pour elles seules.`,
    vocabulary: [
      {
        word_ar: "دَعْوَة",
        translit: "da'wa",
        definition_fr: "appel, invitation à l'islam",
        example: "الدَّعْوَةُ إِلَى اللَّهِ بِالْحِكْمَةِ (l'appel vers Allah avec sagesse) — Sourate An-Nahl, 16:125",
      },
      {
        word_ar: "صَحَابَة",
        translit: "sahaba",
        definition_fr: "compagnons du Prophète ﷺ — ceux qui le connurent croyants",
        example: "أَصْحَابُ النَّبِيِّ ﷺ (les compagnons du Prophète ﷺ)",
      },
    ],
    questions: [
      {
        id: "sr5_q1",
        type: "comprehension",
        text: "Quelle fut la première phase de la da'wa du Prophète ﷺ après la révélation ?",
        options: [
          { text: "Il prêcha immédiatement à la Ka'ba devant tous les Quraysh", correct: false },
          { text: "Il envoya des lettres aux rois et souverains", correct: false },
          { text: "Il prêcha secrètement pendant trois ans, rassemblant les premiers muslims discrètement", correct: true },
          { text: "Il migra immédiatement à Médine pour y établir l'islam", correct: false },
        ],
      },
      {
        id: "sr5_q2",
        type: "vocabulary",
        text: "Quel mot arabe désigne l'appel ou l'invitation à l'islam ?",
        options: [
          { text: "سِيرَة (sira)", correct: false },
          { text: "صَحَابَة (sahaba)", correct: false },
          { text: "دَعْوَة (da'wa)", correct: true },
          { text: "وَحْي (wahy)", correct: false },
        ],
      },
      {
        id: "sr5_q3",
        type: "reflection",
        text: "Les premiers muslims rejoignirent l'islam non par contrainte mais par conviction personnelle. Qu'est-ce que cela dit sur la nature de la foi islamique ?",
        reflection_prompt: "Partage ta réflexion librement.",
      },
      {
        id: "sr5_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 4 : quel fut le tout premier mot révélé du Coran ?",
        options: [
          { text: "الرَّحْمَن (al-Rahman)", correct: false },
          { text: "اقْرَأْ (iqra')", correct: true },
          { text: "بِسْمِ (bismi)", correct: false },
          { text: "الحَمْدُ (al-hamdu)", correct: false },
        ],
        spaced_ref: "sr4_q1",
      },
    ],
    values_shown: ["da_wa", "patience", "premiers_croyants", "courage_de_la_foi"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 6 ────────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 6,
    title: "Les persécutions des Quraysh",
    narrative: `Je suis un parchemin sur lequel les chefs Quraysh inscrivirent leur boycott. Ce document fut accroché à l'intérieur de la Ka'ba comme un pacte solennel : aucun commerce, aucun mariage, aucune relation avec les Banu Hashim et Banu Muttalib tant qu'ils protégeraient Muhammad.

Mais avant d'en arriver là, les Quraysh essayèrent d'autres méthodes.

Ils se moquèrent d'abord. Puis intimidèrent. Puis torturèrent les plus faibles — ceux qui n'avaient ni tribu ni protection. Bilal ibn Rabah, esclave, fut étendu sur le sable brûlant de La Mecque sous une pierre pesante, contraint de renier. Il répétait : Ahad, Ahad — Un, Un. Il fut racheté et libéré par Abu Bakr al-Siddiq.

Yasir et Sumayyah — deux compagnons parmi les premiers — furent martyrisés pour leur foi. Sumayyah bint Khayyat est considérée comme la première martyre de l'islam.

Face à cette pression, le Prophète ﷺ conseilla à un groupe de compagnons de se réfugier en Abyssinie, chez le roi chrétien Al-Negus (Ashama ibn Abjar), réputé pour sa justice. C'est la première Hijra, en 615 EC.

La leçon du parchemin : les persécutions ne visaient pas seulement les corps — elles visaient la foi. Mais une foi que l'on choisit librement, dans la douleur, est une foi que rien ne peut arracher.`,
    vocabulary: [
      {
        word_ar: "صَبْر",
        translit: "sabr",
        definition_fr: "patience, endurance dans l'épreuve",
        example: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ (Allah est avec les patients) — Sourate Al-Baqara, 2:153",
      },
      {
        word_ar: "شَهِيد",
        translit: "shahid",
        definition_fr: "martyr — celui qui meurt pour sa foi",
        example: "Sumayyah bint Khayyat : première shahida de l'islam",
      },
    ],
    questions: [
      {
        id: "sr6_q1",
        type: "comprehension",
        text: "Qui fut racheté par Abu Bakr al-Siddiq et libéré de la torture des Quraysh ?",
        options: [
          { text: "Sumayyah bint Khayyat", correct: false },
          { text: "Bilal ibn Rabah", correct: true },
          { text: "Khadija RA", correct: false },
          { text: "Ja'far ibn Abi Talib", correct: false },
        ],
      },
      {
        id: "sr6_q2",
        type: "vocabulary",
        text: "Quel mot arabe désigne celui ou celle qui meurt pour sa foi ?",
        options: [
          { text: "صَبْر (sabr)", correct: false },
          { text: "صَحَابَة (sahaba)", correct: false },
          { text: "شَهِيد (shahid)", correct: true },
          { text: "أَمِين (amin)", correct: false },
        ],
      },
      {
        id: "sr6_q3",
        type: "reflection",
        text: "Bilal répétait 'Ahad, Ahad' sous la torture. Qu'est-ce que ce mot (Un, Un — l'unicité divine) signifie-t-il comme acte de résistance dans ce contexte ?",
        reflection_prompt: "Réfléchis à ce que cela coûte de tenir une conviction.",
      },
      {
        id: "sr6_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 5 : comment appelle-t-on les compagnons du Prophète ﷺ en arabe ?",
        options: [
          { text: "شَهِيد (shahid)", correct: false },
          { text: "صَحَابَة (sahaba)", correct: true },
          { text: "دَعْوَة (da'wa)", correct: false },
          { text: "أَمَانَة (amana)", correct: false },
        ],
        spaced_ref: "sr5_q2",
      },
    ],
    values_shown: ["sabr", "martyre", "epreuve", "perseverance_dans_la_foi"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 7 ────────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 7,
    title: "L'Année de la Tristesse",
    narrative: `Je suis la lampe de la chambre où reposait Khadija RA dans ses derniers jours. J'ai éclairé bien des nuits depuis le mariage — vingt-cinq années de vie commune, de confiance, de foi partagée.

En l'an 619 EC, à dix ans de la révélation, deux pertes se succédèrent si rapidement que les historiens de la Sîra donnèrent à cette année un nom : 'Am al-Huzn — l'Année de la Tristesse.

D'abord Abu Talib, l'oncle qui avait protégé le Prophète ﷺ depuis l'enfance et qui, malgré ses années de protection, mourut sans professer l'islam. Puis, quelques semaines plus tard, Khadija RA — la première croyante, la femme qui avait couvert le Prophète ﷺ dans la peur de la révélation, qui l'avait soutenu de ses biens, de son intelligence et de son amour pendant un quart de siècle.

Le Prophète ﷺ porta ce deuil profondément. La Sîra rapporte qu'il parlait d'elle avec une tendresse inaltérable bien après sa mort. Lorsqu'une femme l'interrogeait sur elle, il répondait avec affection et mémoire vive.

Après ces deux pertes, La Mecque devint encore plus hostile. Sans l'oncle Abu Talib, la protection tribale s'effrita. Le Prophète ﷺ tenta de chercher soutien à Taif — et fut rejeté avec violence.

La leçon de la lampe : le deuil n'est pas un signe de faiblesse. Pleurer ceux qu'on aime est une marque de la miséricorde qu'Allah met dans les cœurs — Sourate Al-Anbiya, 21:107.`,
    vocabulary: [
      {
        word_ar: "حُزْن",
        translit: "huzn",
        definition_fr: "tristesse, chagrin",
        example: "عَامُ الْحُزْنِ (l'Année de la Tristesse) — nom donné à l'an 619 EC",
      },
      {
        word_ar: "رَحْمَة",
        translit: "rahma",
        definition_fr: "miséricorde, compassion — qualité du Prophète ﷺ",
        example: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ (Nous ne t'avons envoyé que comme miséricorde pour les mondes) — Sourate Al-Anbiya, 21:107",
      },
    ],
    questions: [
      {
        id: "sr7_q1",
        type: "comprehension",
        text: "Pourquoi l'an 619 est-il appelé 'Am al-Huzn (l'Année de la Tristesse) ?",
        options: [
          { text: "La bataille d'Uhud causa de nombreuses pertes", correct: false },
          { text: "La mort d'Abu Talib puis de Khadija RA en quelques semaines", correct: true },
          { text: "Le boycott des Banu Hashim dura cette année-là", correct: false },
          { text: "Le Prophète ﷺ fut exilé de La Mecque", correct: false },
        ],
      },
      {
        id: "sr7_q2",
        type: "vocabulary",
        text: "Quel mot coranique désigne la miséricorde du Prophète ﷺ pour les mondes ?",
        options: [
          { text: "حُزْن (huzn)", correct: false },
          { text: "رَحْمَة (rahma)", correct: true },
          { text: "شَهِيد (shahid)", correct: false },
          { text: "صَبْر (sabr)", correct: false },
        ],
      },
      {
        id: "sr7_q3",
        type: "reflection",
        text: "Le Prophète ﷺ éprouva une vraie tristesse en perdant ceux qu'il aimait. Que penses-tu du fait qu'un prophète pleure ? Est-ce une leçon pour nous ?",
        reflection_prompt: "Réfléchis librement — il n'y a pas de mauvaise réponse.",
      },
      {
        id: "sr7_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 6 : comment appelle-t-on la patience et l'endurance dans l'épreuve en arabe ?",
        options: [
          { text: "رَحْمَة (rahma)", correct: false },
          { text: "حُزْن (huzn)", correct: false },
          { text: "صَبْر (sabr)", correct: true },
          { text: "دَعْوَة (da'wa)", correct: false },
        ],
        spaced_ref: "sr6_q1",
      },
    ],
    values_shown: ["deuil", "misericorde", "patience", "humanite_du_prophete"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 8 ────────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 8,
    title: "Al-Isrâ wal-Miraj — Le voyage nocturne",
    narrative: `Je suis le seuil de la Mosquée Al-Aqsa à Jérusalem — le rocher sacré, la terre des prophètes. J'ai vu Abraham, David, Salomon, Jésus passer. Ce soir, je vais voir quelque chose d'unique dans toute l'histoire.

Le Coran ouvre la Sourate Al-Isra' (17) avec ces mots : "Gloire à Celui qui a fait voyager de nuit Son serviteur depuis la mosquée al-Haram vers la mosquée al-Aqsa dont Nous avons béni les alentours, pour lui montrer Nos signes." (17:1)

En une seule nuit — la nuit du 27 Rajab selon l'opinion majoritaire, en l'an 621 — le Prophète ﷺ voyagea de La Mecque à Jérusalem (al-Isra') sur Al-Buraq, monture céleste. Il y rencontra les prophètes et dirigea leur prière. Puis commença le Mi'raj — l'ascension à travers les cieux.

À chaque ciel, il croisa un prophète : Adam au premier, Yahya et Issa au second, Yusuf au troisième, Idris au quatrième, Harun au cinquième, Musa au sixième, Ibrahim au septième. Puis il s'approcha d'Allah — jusqu'à la distance de deux arcs ou plus près encore, selon le Coran (53:9).

Là fut prescrit le don des cinq prières quotidiennes — initialement 50, ramenées à 5 par les allers-retours conseillés par Musa, chacune valant 10 en récompense.

La leçon du seuil : ce voyage fut un don d'Allah à Son Prophète ﷺ après l'Année de la Tristesse. La montée vers les cieux après les pertes terrestres — c'est le rythme de la vie du croyant.`,
    vocabulary: [
      {
        word_ar: "مِعْرَاج",
        translit: "mi'raj",
        definition_fr: "ascension — montée du Prophète ﷺ vers les cieux",
        example: "لَيْلَةُ الْمِعْرَاجِ (la nuit de l'ascension)",
      },
      {
        word_ar: "صَلَاة",
        translit: "salat",
        definition_fr: "prière — don reçu lors du Mi'raj, obligation des 5 prières",
        example: "أَقِمِ الصَّلَاةَ (accomplis la prière) — commandement coranique",
      },
    ],
    questions: [
      {
        id: "sr8_q1",
        type: "comprehension",
        text: "Quelle obligation majeure le Prophète ﷺ reçut-il lors du Mi'raj ?",
        options: [
          { text: "Le jeûne du Ramadan", correct: false },
          { text: "Le pèlerinage à La Mecque", correct: false },
          { text: "Les cinq prières quotidiennes", correct: true },
          { text: "La zakât (aumône obligatoire)", correct: false },
        ],
      },
      {
        id: "sr8_q2",
        type: "vocabulary",
        text: "Quel mot arabe désigne l'ascension du Prophète ﷺ vers les cieux ?",
        options: [
          { text: "صَلَاة (salat)", correct: false },
          { text: "مِعْرَاج (mi'raj)", correct: true },
          { text: "وَحْي (wahy)", correct: false },
          { text: "حُزْن (huzn)", correct: false },
        ],
      },
      {
        id: "sr8_q3",
        type: "reflection",
        text: "Les 5 prières furent accordées après l'Année de la Tristesse. Penses-tu que la prière peut être un lien entre l'homme et Allah dans les moments de douleur ?",
        reflection_prompt: "Réfléchis sans contrainte.",
      },
      {
        id: "sr8_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 7 : quel mot désigne la miséricorde du Prophète ﷺ pour les mondes ?",
        options: [
          { text: "مِعْرَاج (mi'raj)", correct: false },
          { text: "صَلَاة (salat)", correct: false },
          { text: "رَحْمَة (rahma)", correct: true },
          { text: "حُزْن (huzn)", correct: false },
        ],
        spaced_ref: "sr7_q2",
      },
    ],
    values_shown: ["mi_raj", "priere", "ascension", "don_divin"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 9 ────────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 9,
    title: "La Hijra vers Médine",
    narrative: `Je suis la porte de la maison d'Abu Bakr al-Siddiq à La Mecque. Cette nuit-là, deux hommes partirent de chez moi dans l'obscurité — Muhammad ﷺ et Abu Bakr — pour un voyage qui allait changer le cours de l'histoire.

Les Quraysh avaient planifié l'assassinat du Prophète ﷺ lors de la nuit du départ — un représentant de chaque tribu devait frapper simultanément pour diluer la responsabilité du sang. Le Coran décrit leur complot : "Et quand les mécréants complotaient contre toi pour t'emprisonner, te tuer ou t'expulser..." (Sourate Al-Anfal, 8:30)

Le Prophète ﷺ quitta sa maison la nuit — Ali ibn Abi Talib dormit dans son lit pour brouiller les pistes. Les deux hommes se réfugièrent trois jours dans la grotte de Thawr, au sud de La Mecque. Le Coran rapporte que lorsqu'Abu Bakr fut effrayé, le Prophète ﷺ dit : "Ne t'attriste pas — Allah est avec nous." (9:40)

Puis la route vers Yathrib (Médine), à 450 km au nord. Ils arrivèrent à Quba, aux abords de Médine, où le Prophète ﷺ posa la première pierre d'une mosquée — la mosquée de Quba, dont le Coran dit qu'elle fut fondée dès le premier jour sur la piété. (9:108)

La Hijra de 622 EC devint l'an 1 du calendrier islamique — non parce que c'est la naissance de l'islam, mais parce que c'est le moment où la communauté (umma) prit forme.

La leçon de la porte : la Hijra n'est pas une fuite — c'est une fondation.`,
    vocabulary: [
      {
        word_ar: "هِجْرَة",
        translit: "hijra",
        definition_fr: "migration, émigration — la migration de La Mecque à Médine en 622",
        example: "السَّنَةُ الهِجْرِيَّةُ (l'année hégirienne) — calendrier islamique",
      },
      {
        word_ar: "أُمَّة",
        translit: "umma",
        definition_fr: "communauté, nation — la communauté des croyants",
        example: "وَكَذَٰلِكَ جَعَلْنَاكُمْ أُمَّةً وَسَطًا (Ainsi vous avons-Nous fait une communauté équilibrée) — Sourate Al-Baqara, 2:143",
      },
    ],
    questions: [
      {
        id: "sr9_q1",
        type: "comprehension",
        text: "Pourquoi la Hijra de 622 EC est-elle le point de départ du calendrier islamique ?",
        options: [
          { text: "Parce que c'est la date de naissance du Prophète ﷺ", correct: false },
          { text: "Parce que c'est à partir de ce moment que la communauté musulmane (umma) prit forme", correct: true },
          { text: "Parce que la première bataille islamique eut lieu cette année-là", correct: false },
          { text: "Parce que le Coran fut compilé lors de la Hijra", correct: false },
        ],
      },
      {
        id: "sr9_q2",
        type: "vocabulary",
        text: "Quel mot arabe désigne la communauté des croyants ?",
        options: [
          { text: "هِجْرَة (hijra)", correct: false },
          { text: "صَحَابَة (sahaba)", correct: false },
          { text: "أُمَّة (umma)", correct: true },
          { text: "دَعْوَة (da'wa)", correct: false },
        ],
      },
      {
        id: "sr9_q3",
        type: "reflection",
        text: "Le Prophète ﷺ rassura Abu Bakr dans la grotte : 'Allah est avec nous.' Comment la foi peut-elle transformer notre rapport à la peur ?",
        reflection_prompt: "Réfléchis librement.",
      },
      {
        id: "sr9_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 8 : quel don majeur le Prophète ﷺ ramena-t-il du Mi'raj pour toute la umma ?",
        options: [
          { text: "La zakât", correct: false },
          { text: "Le jeûne de Ramadan", correct: false },
          { text: "Les cinq prières quotidiennes", correct: true },
          { text: "Le pèlerinage", correct: false },
        ],
        spaced_ref: "sr8_q1",
      },
    ],
    values_shown: ["hijra", "umma", "confiance_en_allah", "fondation_communaute"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 10 ───────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 10,
    title: "La mosquée du Prophète ﷺ et la Charte de Médine",
    narrative: `Je suis une colonne de palmier dressée dans la première mosquée de Médine — la Mosquée du Prophète ﷺ. On m'a planté dans ce sol de terre battue avec d'autres troncs, couverts de branches de palme pour former un toit. Simple, sobre, ouvert au ciel par endroits.

Le Prophète ﷺ construisit lui-même avec ses compagnons. Il portait les briques, creusait le sol, chantait avec eux. La Sîra rapporte qu'ils scandaient : "Allahumma la khayr illa khayr al-Akhira — Ô Allah, le seul bien véritable est le bien de l'Au-delà."

Mais la mosquée fut plus qu'un lieu de prière. Elle fut le centre de la nouvelle cité : un lieu d'enseignement, de justice, de rassemblement, de soin.

Parallèlement, le Prophète ﷺ établit deux actes fondateurs pour Médine :

Premièrement, la fraternité (mu'akhah) : chaque immigrant mecquois (muhajir) fut apparié avec un Médinois (ansar) qui partageait avec lui ses biens, son foyer et ses droits. Ce geste sans précédent dans l'histoire arabe transforma des étrangers en frères.

Deuxièmement, la Sahifa al-Madina — la Charte de Médine : un traité entre les tribus musulmanes, juives et arabes de Médine, définissant les droits et devoirs de chaque groupe. Les historiens modernes la considèrent comme l'un des premiers textes constitutionnels de l'histoire.

La leçon de la colonne : une mosquée n'est pas un bâtiment — c'est une communauté.`,
    vocabulary: [
      {
        word_ar: "أَنْصَار",
        translit: "ansar",
        definition_fr: "les Auxiliaires — Médinois qui accueillirent et soutinrent les immigrants",
        example: "وَالَّذِينَ آوَوا وَّنَصَرُوا (et ceux qui ont donné asile et porté secours) — Sourate Al-Anfal, 8:72",
      },
      {
        word_ar: "مُهَاجِر",
        translit: "muhajir",
        definition_fr: "immigrant — celui qui a migré de La Mecque à Médine pour l'islam",
        example: "الَّذِينَ هَاجَرُوا فِي سَبِيلِ اللَّهِ (ceux qui ont émigré dans la voie d'Allah) — Sourate An-Nisa, 4:100",
      },
    ],
    questions: [
      {
        id: "sr10_q1",
        type: "comprehension",
        text: "Que désigne la 'mu'akhah' établie par le Prophète ﷺ à Médine ?",
        options: [
          { text: "Le traité de paix avec les tribus juives de Médine", correct: false },
          { text: "La fraternité entre un immigrant mecquois et un Médinois, partageant biens et droits", correct: true },
          { text: "La construction commune de la mosquée du Prophète ﷺ", correct: false },
          { text: "Le système de défense militaire de Médine", correct: false },
        ],
      },
      {
        id: "sr10_q2",
        type: "vocabulary",
        text: "Comment appelle-t-on les Médinois qui accueillirent et soutinrent les immigrants mecquois ?",
        options: [
          { text: "مُهَاجِر (muhajir)", correct: false },
          { text: "صَحَابَة (sahaba)", correct: false },
          { text: "أَنْصَار (ansar)", correct: true },
          { text: "أُمَّة (umma)", correct: false },
        ],
      },
      {
        id: "sr10_q3",
        type: "reflection",
        text: "Les Ansar partagèrent leurs maisons et leurs biens avec des inconnus. Qu'est-ce que ce geste dit sur la notion de fraternité en islam ?",
        reflection_prompt: "Réfléchis à ce que signifie vraiment accueillir quelqu'un.",
      },
      {
        id: "sr10_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 9 : quel mot désigne la communauté des croyants en arabe ?",
        options: [
          { text: "أَنْصَار (ansar)", correct: false },
          { text: "مُهَاجِر (muhajir)", correct: false },
          { text: "أُمَّة (umma)", correct: true },
          { text: "هِجْرَة (hijra)", correct: false },
        ],
        spaced_ref: "sr9_q2",
      },
    ],
    values_shown: ["fraternite", "accueil", "construction_communaute", "mosquee"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 11 ───────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 11,
    title: "Badr, Uhud, Khandaq — les années d'épreuve",
    narrative: `Je suis un fossé creusé dans la terre de Médine. En 627 EC, des milliers de mains m'ont ouvert dans le sol dur — pendant des jours — pour défendre la ville contre une coalition de dix mille guerriers. C'est la bataille du Khandaq (le fossé), suggérée par Salmane al-Farisi, Persan devenu l'un des compagnons les plus proches du Prophète ﷺ.

Mais avant le Khandaq, il y eut Badr.

Badr (624 EC) : 313 musulmans, mal équipés, face à environ mille Quraysh venus protéger leur caravane commerciale. La victoire fut totale pour les musulmans. Le Coran dit : "Vous n'avez pas tué, c'est Allah qui a tué. Et tu n'as pas lancé quand tu as lancé, c'est Allah qui a lancé." (Sourate Al-Anfal, 8:17) Badr ancra la foi dans les cœurs.

Puis Uhud (625 EC) : victoire transformée en revers partiel quand les archers, désobéissant à l'ordre du Prophète ﷺ, quittèrent leur poste pour le butin. Soixante-dix compagnons furent martyrisés, dont Hamza ibn Abd al-Muttalib, oncle du Prophète ﷺ. Le Coran transforme cette défaite en leçon de discipline et d'obéissance. (3:152)

Et le Khandaq — la bataille du fossé. L'innovation stratégique de Salmane bloqua la coalition pendant vingt-sept jours. Une tempête et des dissensions dans les rangs ennemis finirent par les disperser.

La leçon du fossé : certaines batailles se gagnent avec l'intelligence avant les armes. Et chaque épreuve — même la défaite — est un enseignement.`,
    vocabulary: [
      {
        word_ar: "جِهَاد",
        translit: "jihad",
        definition_fr: "effort, lutte — au sens premier : effort sur soi-même ; au sens militaire : défense de la communauté",
        example: "أَفْضَلُ الجِهَادِ كَلِمَةُ حَقٍّ عِنْدَ سُلْطَانٍ جَائِرٍ (le meilleur jihad est une parole de vérité devant un souverain injuste) — Hadith Abu Dawud",
      },
      {
        word_ar: "شُورَى",
        translit: "shura",
        definition_fr: "consultation — principe de gouvernance islamique (Salmane fut consulté pour le fossé)",
        example: "وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ (et leurs affaires se règlent par consultation mutuelle) — Sourate Ash-Shura, 42:38",
      },
    ],
    questions: [
      {
        id: "sr11_q1",
        type: "comprehension",
        text: "Quelle fut la stratégie décisive suggérée par Salmane al-Farisi lors de la bataille du Khandaq ?",
        options: [
          { text: "Attaquer la coalition de nuit par surprise", correct: false },
          { text: "Négocier un traité de paix avec les Quraysh", correct: false },
          { text: "Creuser un fossé autour de Médine — tactique défensive inconnue en Arabie", correct: true },
          { text: "Se réfugier dans la mosquée du Prophète ﷺ", correct: false },
        ],
      },
      {
        id: "sr11_q2",
        type: "vocabulary",
        text: "Quel principe islamique de gouvernance fut illustré par la consultation de Salmane al-Farisi ?",
        options: [
          { text: "جِهَاد (jihad)", correct: false },
          { text: "شُورَى (shura)", correct: true },
          { text: "أُمَّة (umma)", correct: false },
          { text: "هِجْرَة (hijra)", correct: false },
        ],
      },
      {
        id: "sr11_q3",
        type: "reflection",
        text: "La défaite partielle d'Uhud eut lieu à cause d'une désobéissance. Le Coran en fait une leçon. Penses-tu que l'échec peut être plus formateur que la victoire ?",
        reflection_prompt: "Réfléchis librement.",
      },
      {
        id: "sr11_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 10 : comment appelle-t-on les immigrants mecquois qui migrèrent à Médine pour l'islam ?",
        options: [
          { text: "أَنْصَار (ansar)", correct: false },
          { text: "مُهَاجِر (muhajir)", correct: true },
          { text: "شُورَى (shura)", correct: false },
          { text: "جِهَاد (jihad)", correct: false },
        ],
        spaced_ref: "sr10_q2",
      },
    ],
    values_shown: ["jihad_defensif", "consultation", "epreuve", "courage_et_obedience"],
    rewards: { xp: 30, coins: 10 },
  },

  // ── CHAPITRE 12 ───────────────────────────────────────────────
  {
    story_id: "arc_sira",
    chapter_number: 12,
    title: "La conquête de La Mecque et les dernières années",
    narrative: `Je suis à nouveau la pierre de la Ka'ba. L'an 630 EC — huit ans après la Hijra. Le Prophète ﷺ entre à La Mecque à la tête de dix mille croyants. La ville qui l'avait chassé, qui avait torturé ses compagnons, qui avait comploté pour le tuer, est maintenant devant lui.

Il entre la tête baissée, en signe d'humilité devant Allah. Pas d'arrogance, pas de discours de vengeance. Le Coran venait de révéler, lors du traité de Hudaybiyya deux ans plus tôt : "Lorsque vient le secours d'Allah et la victoire — tu vois les gens entrer en masse dans la religion d'Allah — alors glorifie ton Seigneur et demande-Lui pardon." (Sourate An-Nasr, 110:1-3)

Devant la foule des Mecquois rassemblés, attendant leur sort, il prononça des mots de pardon général. La Ka'ba fut purifiée des idoles : le Prophète ﷺ en fit le tour, frappant chaque idole de son bâton en récitant : "La vérité est venue et la fausseté s'est évanouie." (17:81)

Deux ans plus tard, en 632 EC, lors du Hajj de l'Adieu, il prononça son dernier grand discours sur le mont Arafat — des paroles sur les droits humains, l'égalité, la sacralité du sang et des biens. Il dit aux compagnons : "Ai-je transmis ?" Ils dirent : "Oui." Il dit : "Ô Allah, sois témoin."

Il mourut le 12 Rabi' al-Awwal, l'an 11 de l'Hégire (632 EC), entre les bras d'Aïcha RA.

La leçon de la pierre : celui qui entra victorieux en humilité est le même qui naquit orphelin dans cette ville. La sîra est complète — et elle continue dans chaque croyant qui porte son héritage.`,
    vocabulary: [
      {
        word_ar: "فَتْح",
        translit: "fath",
        definition_fr: "conquête, ouverture, victoire — la conquête de La Mecque en 630",
        example: "إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا (Nous t'avons accordé une victoire éclatante) — Sourate Al-Fath, 48:1",
      },
      {
        word_ar: "عَفْو",
        translit: "afw",
        definition_fr: "pardon, clémence accordée même quand on a le pouvoir de punir",
        example: "خُذِ الْعَفْوَ (pratique l'indulgence) — Sourate Al-A'raf, 7:199",
      },
    ],
    questions: [
      {
        id: "sr12_q1",
        type: "comprehension",
        text: "Comment le Prophète ﷺ entra-t-il à La Mecque lors de la conquête de 630 ?",
        options: [
          { text: "En conquérant militaire montrant sa puissance", correct: false },
          { text: "La tête baissée en signe d'humilité devant Allah, accordant un pardon général", correct: true },
          { text: "Il envoya ses généraux en avant et attendit la reddition", correct: false },
          { text: "Il exigea d'abord que tous les Quraysh se convertissent", correct: false },
        ],
      },
      {
        id: "sr12_q2",
        type: "vocabulary",
        text: "Quel mot arabe désigne le pardon accordé même quand on a le pouvoir de punir — geste du Prophète ﷺ à La Mecque ?",
        options: [
          { text: "فَتْح (fath)", correct: false },
          { text: "جِهَاد (jihad)", correct: false },
          { text: "عَفْو (afw)", correct: true },
          { text: "شُورَى (shura)", correct: false },
        ],
      },
      {
        id: "sr12_q3",
        type: "reflection",
        text: "La sîra commence avec un orphelin et se termine avec un pardon général. Qu'est-ce que ce parcours dit sur la vision islamique de la miséricorde et du pouvoir ?",
        reflection_prompt: "Prends ton temps. C'est la dernière leçon de la pierre.",
      },
      {
        id: "sr12_q4",
        type: "spaced_repetition",
        text: "Rappel du chapitre 11 : quel est le principe de consultation en gouvernance islamique ?",
        options: [
          { text: "عَفْو (afw)", correct: false },
          { text: "فَتْح (fath)", correct: false },
          { text: "شُورَى (shura)", correct: true },
          { text: "جِهَاد (jihad)", correct: false },
        ],
        spaced_ref: "sr11_q2",
      },
    ],
    values_shown: ["pardon", "victoire_avec_humilite", "fin_de_la_sira", "heritage_prophetique"],
    rewards: { xp: 50, coins: 20, mosque_object: "seal_of_prophet", location_unlock: "medine" },
  },
];

// ── 3. Insérer les chapitres un par un ───────────────────────────────────────
console.log(`Insertion de ${chapters.length} chapitres...`);

for (const ch of chapters) {
  const { error: chErr } = await supabase.from("story_chapters").upsert(
    {
      story_id: ch.story_id,
      chapter_number: ch.chapter_number,
      title: ch.title,
      narrative: ch.narrative,
      vocabulary: ch.vocabulary,
      questions: ch.questions,
      values_shown: ch.values_shown,
      rewards: ch.rewards,
    },
    { onConflict: "story_id,chapter_number" }
  );

  if (chErr) {
    console.error(`Erreur chapitre ${ch.chapter_number}:`, chErr.message);
  } else {
    console.log(`  Chapitre ${ch.chapter_number} — ${ch.title} : OK`);
  }
}

console.log("\nTerminé. Arc Sîra (12 chapitres) inséré/mis à jour dans Supabase.");
console.log("RAPPEL : CONTENU À VALIDER PAR UNE PERSONNE QUALIFIÉE AVANT DIFFUSION PUBLIQUE");
