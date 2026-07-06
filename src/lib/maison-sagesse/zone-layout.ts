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
