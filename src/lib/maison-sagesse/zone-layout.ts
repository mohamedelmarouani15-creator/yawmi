// Disposition du monde ouvert de Maison de la Sagesse — mêmes principes
// qu'al-bayan/world/AlBayanWorld.tsx (zones disposées en étoile autour d'un
// hub, corridors avec ouvertures taillées dans les murs, aucune zone ne
// flotte au-dessus du vide).
//
//        Science (nord)
//             |
//  Foi ── Hall (hub) ── Sagesse
//        (ouest)  (est)

export const HALL = { W: 20, H: 8, D: 16 };
export const QUEST_SIZE = { W: 12, H: 6, D: 12 };

export const CORRIDOR_LENGTH = 6;
export const CORRIDOR_HALF_WIDTH = 1.8;

// Centres des zones en coordonnées MONDE.
export const ZONES = {
  hall: { position: [0, 0, 0] as [number, number, number] },
  science: { position: [0, 0, -(HALL.D / 2 + CORRIDOR_LENGTH + QUEST_SIZE.D / 2)] as [number, number, number] },
  faith: { position: [-(HALL.W / 2 + CORRIDOR_LENGTH + QUEST_SIZE.W / 2), 0, 0] as [number, number, number] },
  wisdom: { position: [HALL.W / 2 + CORRIDOR_LENGTH + QUEST_SIZE.W / 2, 0, 0] as [number, number, number] },
};

// Bornes englobantes généreuses pour tout le complexe.
export const WORLD_BOUNDS = { x: HALL.W / 2 + CORRIDOR_LENGTH + QUEST_SIZE.W + 2, z: HALL.D / 2 + CORRIDOR_LENGTH + QUEST_SIZE.D + 2 };

// Point d'apparition — centre exact du hall, loin de tous les murs (comme
// al-bayan/world/AlBayanWorld.tsx : SPAWN au centre évite que le
// raccourcissement anti-clipping de la caméra ne colle un plan rapproché
// disgracieux dès l'arrivée dans la zone).
export const SPAWN = { x: 0, y: 0, z: 0 };

/**
 * Découpe un mur de longueur `size` centré en 0, percé au milieu d'une
 * ouverture de largeur `gap * 2` (le corridor), en deux segments symétriques.
 * Reprend une formule auparavant recopiée à la main dans MainHall.tsx (x2),
 * QuestFaith.tsx, QuestScience.tsx et QuestWisdom.tsx — centralisée ici pour
 * qu'un futur changement de CORRIDOR_HALF_WIDTH ou de taille de zone ne
 * puisse pas désynchroniser un mur d'une seule salle par oubli.
 */
export function wallGapSegment(size: number, gap: number) {
  const segLen = (size - gap * 2) / 2;
  const segOffset = gap + segLen / 2;
  return { segLen, segOffset };
}
