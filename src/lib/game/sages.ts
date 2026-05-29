import type { SageDef } from "./types";

export const SAGES: SageDef[] = [
  {
    id: "al_idrissi",
    name: "Al-Idrissi",
    title: "Cartographe du monde",
    locationId: "fes",
    specialty: "Géographie & Cartographie",
    personality: "méthodique et contemplatif",
    portrait: "al_idrissi",
    dialogueIntro:
      "Ah, un voyageur qui cherche sa route ! Je suis Al-Idrissi, et j'ai cartographié le monde entier sur un disque d'argent pour le roi Roger II de Sicile. Avant d'entrer dans ma médersa, prouve-moi que tu mérites de naviguer dans les eaux du savoir…",
    dialogueSuccess:
      "Excellent ! Tu as la boussole du cœur et la carte de l'esprit. La Méditerranée ne te retient plus — file vers Cordoue, où le sage Ibn Rushd t'attend avec ses questions de philosophie.",
    dialogueFailure:
      "Les étoiles ne te guident pas encore assez bien, ami voyageur. Retourne étudier, et reviens. La connaissance n'est pas une destination — c'est un chemin que l'on reprend toujours.",
    reward: { xp: 200, coins: 50 },
    victoryRequirement: 7,
  },
  {
    id: "ibn_rushd",
    name: "Ibn Rushd",
    title: "Philosophe d'Andalousie",
    locationId: "cordoue",
    specialty: "Philosophie & Médecine",
    personality: "rigoureux et provocateur",
    portrait: "ibn_rushd",
    dialogueIntro:
      "Aristote a été oublié en Europe — c'est grâce à mes traductions en arabe qu'il a survécu. Je suis Ibn Rushd, Averroès pour les Latins. La raison et la foi ne s'opposent pas : elles s'éclairent. Montrons-le par tes réponses.",
    dialogueSuccess:
      "Tu raisonnes avec la clarté d'un philosophe ! La Mosquée-Cathédrale de Cordoue témoignera de ta sagesse. Maintenant, trace ta route vers Marrakech.",
    dialogueFailure:
      "La raison a besoin d'exercice, comme le muscle. Ne te décourage pas — Aristote lui-même a mis du temps avant de comprendre la physique. Reviens après avoir étudié.",
    reward: { xp: 300, coins: 75 },
    victoryRequirement: 7,
  },
  {
    id: "ibn_toumert",
    name: "Ibn Toumert",
    title: "Fondateur des Almohades",
    locationId: "marrakech",
    specialty: "Jurisprudence & Réforme",
    personality: "ferme et inspirant",
    portrait: "ibn_toumert",
    dialogueIntro:
      "J'ai traversé le désert pour ramener la vérité à mon peuple. Je suis Ibn Toumert, et la Koutoubia que tu vois fut érigée dans l'élan de ma réforme. Montre-moi la solidité de ton savoir.",
    dialogueSuccess:
      "Tu as la fermeté du Haut-Atlas ! La cité ocre t'ouvre ses portes. Damas est la prochaine étape de ton pèlerinage du savoir.",
    dialogueFailure:
      "Même les montagnes ont été façonnées par le temps. Persévère, et tu trouveras ta forme.",
    reward: { xp: 450, coins: 100 },
    victoryRequirement: 7,
  },
  {
    id: "ibn_asaker",
    name: "Ibn Asaker",
    title: "Historien de Damas",
    locationId: "damas",
    specialty: "Histoire & Biographies",
    personality: "patient et exhaustif",
    portrait: "ibn_asaker",
    dialogueIntro:
      "J'ai consacré ma vie à ne rien oublier : j'ai compilé 1300 biographies de compagnons et de savants. Je suis Ibn Asaker. La mémoire est le trésor des nations. Vois si la tienne est digne de Damas.",
    dialogueSuccess:
      "Ta mémoire est précieuse comme un manuscrit rare ! L'histoire t'appartient maintenant. Bagdad et Al-Khwarizmi t'attendent.",
    dialogueFailure:
      "Même mon encyclopédie de 80 volumes a pris 60 ans. La patience est la première vertu de l'historien.",
    reward: { xp: 600, coins: 130 },
    victoryRequirement: 7,
  },
  {
    id: "al_khwarizmi",
    name: "Al-Khwarizmi",
    title: "Père de l'algèbre",
    locationId: "bagdad",
    specialty: "Mathématiques & Astronomie",
    personality: "précis et méthodique",
    portrait: "al_khwarizmi",
    dialogueIntro:
      "Mon nom a donné le mot 'algorithme' et mon traité a donné 'algèbre' — al-jabr. Je suis Al-Khwarizmi, et la Maison de la Sagesse est mon atelier. Les nombres ont une logique implacable. Montrons si tu peux la suivre.",
    dialogueSuccess:
      "Parfait ! Tu calcules comme un astronome de Bagdad. Les routes de la soie mènent maintenant à Samarcande pour toi.",
    dialogueFailure:
      "L'équation est simple : connaissance = effort × temps. L'inconnue que tu dois résoudre, c'est ta curiosité. Reviens !",
    reward: { xp: 800, coins: 165 },
    victoryRequirement: 7,
  },
  {
    id: "ibn_sina",
    name: "Ibn Sina",
    title: "Prince des médecins",
    locationId: "samarcande",
    specialty: "Médecine & Philosophie",
    personality: "brillant et polyvalent",
    portrait: "ibn_sina",
    dialogueIntro:
      "J'ai écrit le Canon de la médecine à 21 ans. Avicenne, m'appellent les Latins. À Samarcande, carrefour du monde, je t'invite à mesurer l'étendue de ton savoir. Le corps, l'âme, l'univers — tout est lié.",
    dialogueSuccess:
      "Ton esprit est sain et ton savoir florissant ! Les caravanes du Mali t'attendent à Tombouctou.",
    dialogueFailure:
      "Un médecin qui ne connaît pas ses limites est dangereux. Étudie, puis reviens guéri de ton ignorance.",
    reward: { xp: 1000, coins: 200 },
    victoryRequirement: 7,
  },
  {
    id: "ahmad_baba",
    name: "Ahmad Baba",
    title: "Gardien des manuscrits",
    locationId: "tombouctou",
    specialty: "Lettres & Jurisprudence",
    personality: "passionné et défenseur de la dignité humaine",
    portrait: "ahmad_baba",
    dialogueIntro:
      "Tombouctou n'est pas le bout du monde — c'est son centre ! J'ai réuni jusqu'à 700 000 manuscrits ici. Je suis Ahmad Baba, et j'ai lutté contre l'esclavage avec ma plume. Montre-moi que le savoir africain t'est familier.",
    dialogueSuccess:
      "Magnifique ! Tu portes la lumière de Tombouctou en toi. Le Caire et Ibn Khaldoun t'y attendent.",
    dialogueFailure:
      "Les manuscrits de Tombouctou ont survécu aux invasions. Ta curiosité survivra à cet échec. Reviens !",
    reward: { xp: 1200, coins: 240 },
    victoryRequirement: 7,
  },
  {
    id: "ibn_khaldoun",
    name: "Ibn Khaldoun",
    title: "Père de la sociologie",
    locationId: "le_caire",
    specialty: "Sociologie & Histoire",
    personality: "analytique et visionnaire",
    portrait: "ibn_khaldoun",
    dialogueIntro:
      "J'ai compris avant tout le monde que les sociétés naissent, prospèrent et déclinent selon des lois précises. Je suis Ibn Khaldoun, et ma Muqaddima est le premier traité de sciences sociales de l'histoire. Prouve que tu comprends le monde.",
    dialogueSuccess:
      "Tu as l'œil d'un sociologue et l'âme d'un historien ! La Mecque est à portée — le sommet de ton voyage t'attend.",
    dialogueFailure:
      "Toute civilisation a ses hauts et ses bas. Ton savoir aussi. Reviens quand il sera au zénith.",
    reward: { xp: 1500, coins: 300 },
    victoryRequirement: 7,
  },
];

export function getSage(id: string): SageDef | undefined {
  return SAGES.find(s => s.id === id);
}

export function getSageForLocation(locationId: string): SageDef | undefined {
  return SAGES.find(s => s.locationId === locationId);
}
