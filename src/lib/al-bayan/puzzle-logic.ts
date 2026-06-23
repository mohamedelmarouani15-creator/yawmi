// ── Constantes globales ───────────────────────────────────────────────────

export const SOLUTION = { a: 2, b: 7, c: 4 } as const;
export const GAME_DURATION = 2700; // 45 minutes en secondes

// ── Énigme A — Le Poids du Témoignage (Dhûl-Shahâdatayn) ──────────────────
// Lors de la compilation du Coran sous Abû Bakr, Zayd ibn Thâbit ne trouva
// les deux derniers versets d'At-Tawba (9:128-129) que chez un seul homme :
// Khuzayma ibn Thâbit al-Ansârî. Normalement deux témoins étaient requis,
// mais le Prophète ﷺ avait jugé — après un litige sur la vente d'un cheval
// avec un bédouin — que le témoignage de Khuzayma valait celui de deux
// hommes, lui donnant le surnom de "Dhûl-Shahâdatayn" (Celui aux deux
// témoignages). Poser sa tablette sur la balance vaut donc 2 → Chiffre A = 2.

export interface WitnessCandidate {
  id: string;
  name: string;
  arabic: string;
  weight: 1 | 2;
}

export const WITNESS_CANDIDATES: WitnessCandidate[] = [
  { id: "khuzayma", name: "Khuzayma ibn Thâbit", arabic: "خزيمة بن ثابت", weight: 2 },
  { id: "zayd",     name: "Zayd ibn Thâbit",     arabic: "زيد بن ثابت",     weight: 1 },
  { id: "uthman",   name: "Uthmân ibn Affân",    arabic: "عثمان بن عفان",  weight: 1 },
  { id: "umar",     name: "Umar ibn al-Khattâb",  arabic: "عمر بن الخطاب",  weight: 1 },
  { id: "ali",      name: "Ali ibn Abi Tâlib",    arabic: "علي بن أبي طالب", weight: 1 },
];

export const REQUIRED_WEIGHT = 2;

export const RECIT_CHEVAL = `Un jour, le Prophète ﷺ acheta un cheval à un bédouin et lui demanda de le suivre pour récupérer le paiement. \
En chemin, des hommes proposèrent un meilleur prix au bédouin, qui se mit à nier avoir vendu le cheval. \
Khuzayma ibn Thâbit, témoin de la transaction, prit la défense du Prophète ﷺ. \
Le bédouin s'étonna : « Comment témoignes-tu sans avoir vu la transaction de près ? » \
Khuzayma répondit : « Je témoigne de ta véracité parce que je sais que le Prophète ﷺ ne dit que la vérité. » \
Le Prophète ﷺ déclara alors : « Celui pour qui Khuzayma témoigne, cela lui suffit comme témoignage de deux hommes. »`;

export const PARCHEMIN_TEMOIGNAGE = `Ô apprenti, une balance de bronze garde le secret du premier chiffre. \
Sur son plateau gauche repose le parchemin des deux derniers versets d'At-Tawba — \
la Loi exige le poids de deux témoignages pour qu'il soit validé. \
Examine le récit du cheval gravé dans cette salle, puis pose sur le plateau droit \
le nom du compagnon dont le témoignage, à lui seul, pèse comme celui de deux hommes. \
Quand la balance s'équilibre, le premier chiffre du Coffre t'est révélé.`;

export const HINTS_TEMOIGNAGE: [string, string, string] = [
  `Un parchemin froissé glissé sous la porte...\n'La balance ne s'équilibrera qu'avec UN seul nom — mais ce n'est pas n'importe lequel. Examine le récit gravé près de la balance : il parle d'un cheval et d'un bédouin.'`,
  `Une nouvelle lettre...\n'Le Prophète ﷺ a dit d'un compagnon que son témoignage seul valait celui de deux hommes. Cherche ce nom parmi les tablettes : c'est lui qui a défendu la vérité du Prophète ﷺ devant le bédouin malhonnête.'`,
  `Solution directe...\n'Le compagnon est Khuzayma ibn Thâbit, surnommé Dhûl-Shahâdatayn (« Celui aux deux témoignages »). Pose sa tablette sur le plateau droit. Son poids est DEUX. Le chiffre A est 2.'`,
];

// ── Énigme B — Le Rasm Primitif ────────────────────────────────────────────
// Les plus anciens manuscrits coraniques (rasm 'uthmânî) ne portaient aucun
// point diacritique : des lettres comme ب ت ث ن ي partageaient la même forme
// nue. Le mot à reconstituer est فتبينوا (fa-tabayyanû, « vérifiez,
// clarifiez ») — Sourate Al-Hujurât, verset 6 — qui porte la racine même
// d'« Al-Bayân ». Chiffre B = nombre de lettres du mot = 7.

export type DotPattern = "none" | "above-1" | "above-2" | "above-3" | "below-1" | "below-2";

export interface RasmLetter {
  id: string;
  shape: string; // forme nue (sans points), à titre indicatif visuel
  correct: DotPattern;
}

export const TARGET_WORD = "فتبينوا";
export const TARGET_WORD_FR = "fa-tabayyanû";
export const TARGET_WORD_MEANING = "« …vérifiez, clarifiez… » — Sourate Al-Hujurât, verset 6";

export const RASM_LETTERS: RasmLetter[] = [
  { id: "L1", shape: "ف", correct: "above-1" },
  { id: "L2", shape: "ت", correct: "above-2" },
  { id: "L3", shape: "ب", correct: "below-1" },
  { id: "L4", shape: "ي", correct: "below-2" },
  { id: "L5", shape: "ن", correct: "above-1" },
  { id: "L6", shape: "و", correct: "none" },
  { id: "L7", shape: "ا", correct: "none" },
];

export const DOT_TILES: { id: DotPattern; label: string }[] = [
  { id: "none",    label: "Aucun point" },
  { id: "above-1", label: "1 point dessus" },
  { id: "above-2", label: "2 points dessus" },
  { id: "above-3", label: "3 points dessus" },
  { id: "below-1", label: "1 point dessous" },
  { id: "below-2", label: "2 points dessous" },
];

export const PARCHEMIN_RASM = `Ô apprenti, les premiers copistes du Coran n'utilisaient aucun point : \
une même forme nue pouvait être lue de plusieurs façons. Sept lettres muettes attendent \
sur ce manuscrit. Pose sur chacune le point qui lui revient, et un mot de la Sourate \
Al-Hujurât apparaîtra — un mot qui porte en lui le sens même d'Al-Bayân : la clarté. \
Compte ensuite les lettres de ce mot : ce nombre est le deuxième chiffre du Coffre.`;

export const HINTS_RASM: [string, string, string] = [
  `Un parchemin froissé glissé sous la porte...\n'Avant les points, une même forme servait à plusieurs lettres : ب ت ث se ressemblent, ainsi que ن et ي. Observe bien chaque forme avant de choisir.'`,
  `Une nouvelle lettre...\n'Le mot à reconstituer vient de la Sourate Al-Hujurât (49:6) : il signifie « vérifiez, clarifiez ». Il commence par le son "fa", puis "ta", "ba", "ya", "noun", "waw", "alif".'`,
  `Solution directe...\n'Le mot est فتبينوا (fa-tabayyanû). Points : ف=1 dessus, ت=2 dessus, ب=1 dessous, ي=2 dessous, ن=1 dessus, و et ا=aucun. Il compte SEPT lettres. Le chiffre B est 7.'`,
];

// ── Énigme C — La Route des Codicilles ────────────────────────────────────
// Le calife Uthmân ibn Affân fit établir une version standardisée du Coran
// et en envoya des copies aux grands centres de l'empire. Les historiens
// ne s'accordent pas sur un nombre exact (4, 5, 6 ou 7 selon les sources),
// mais un consensus solide existe sur QUATRE villes : Médine (gardée par
// Uthmân), Bassora, Koufa et Damas. Chiffre C = 4.

export interface CityCandidate {
  id: string;
  name: string;
  consensus: boolean; // fait partie des 4 villes du consensus
}

export const CITY_CANDIDATES: CityCandidate[] = [
  { id: "medine",   name: "Médine",   consensus: true },
  { id: "bassora",  name: "Bassora",  consensus: true },
  { id: "koufa",    name: "Koufa",    consensus: true },
  { id: "damas",    name: "Damas",    consensus: true },
  { id: "le_caire", name: "Le Caire", consensus: false }, // fondée en 969, bien après Uthmân
  { id: "bahrein",  name: "Bahreïn",  consensus: false }, // mentionnée par certains historiens seulement
  { id: "yemen",    name: "Yémen",    consensus: false }, // idem
  { id: "jerusalem",name: "Jérusalem",consensus: false }, // absente des récits historiques
];

export const REQUIRED_CITIES = CITY_CANDIDATES.filter((c) => c.consensus).map((c) => c.id);

export const PARCHEMIN_ROUTE = `Ô apprenti, le calife Uthmân ibn Affân fit établir une copie unique et fidèle du Coran, \
puis en envoya des exemplaires aux grandes villes de l'empire pour que tous récitent d'une seule voix. \
Sur cette carte, plusieurs villes scintillent — certaines ont réellement reçu une copie, \
d'autres ne sont que des rumeurs d'historiens peu sûrs. Active uniquement les villes \
sur lesquelles les historiens s'accordent : ni plus, ni moins. Leur nombre est le troisième \
et dernier chiffre du Coffre.`;

export const HINTS_ROUTE: [string, string, string] = [
  `Un parchemin froissé glissé sous la porte...\n'Toutes les villes affichées sur la carte n'ont pas la même certitude historique. Certaines ne sont mentionnées que par un seul historien — méfie-toi des rumeurs.'`,
  `Une nouvelle lettre...\n'Quatre villes reviennent dans presque toutes les sources : la ville où vivait le calife lui-même, et trois grandes cités de l'empire naissant — l'une en Irak occidental, l'une en Irak méridional, l'une en Syrie.'`,
  `Solution directe...\n'Les quatre villes du consensus sont Médine, Koufa, Bassora et Damas. Active uniquement celles-ci. Leur nombre est QUATRE. Le chiffre C est 4. Combinaison finale : 2-7-4.'`,
];

// ── Métadonnées des énigmes ───────────────────────────────────────────────

export interface EnigmaMeta {
  id: "A" | "B" | "C";
  phase: "enigma-temoignage" | "enigma-rasm" | "enigma-route";
  title: string;
  subtitle: string;
  digit: number;
  parchemin: string;
  hints: [string, string, string];
  childRole: string;
}

export const ENIGMA_A: EnigmaMeta = {
  id: "A",
  phase: "enigma-temoignage",
  title: "Le Poids du Témoignage",
  subtitle: "Dhûl-Shahâdatayn",
  digit: SOLUTION.a,
  parchemin: PARCHEMIN_TEMOIGNAGE,
  hints: HINTS_TEMOIGNAGE,
  childRole: "L'enfant lit le récit du cheval et choisit le nom du bon compagnon.",
};

export const ENIGMA_B: EnigmaMeta = {
  id: "B",
  phase: "enigma-rasm",
  title: "Le Rasm Primitif",
  subtitle: "Les lettres sans points",
  digit: SOLUTION.b,
  parchemin: PARCHEMIN_RASM,
  hints: HINTS_RASM,
  childRole: "L'enfant pose les points sur chaque lettre et compte les lettres du mot.",
};

export const ENIGMA_C: EnigmaMeta = {
  id: "C",
  phase: "enigma-route",
  title: "La Route des Codicilles",
  subtitle: "Les villes du consensus",
  digit: SOLUTION.c,
  parchemin: PARCHEMIN_ROUTE,
  hints: HINTS_ROUTE,
  childRole: "L'enfant active les villes sur la carte et compte celles qui s'allument.",
};

export const ALL_ENIGMAS: Record<"A" | "B" | "C", EnigmaMeta> = {
  A: ENIGMA_A,
  B: ENIGMA_B,
  C: ENIGMA_C,
};
