// Zones praticables du riad complet
// Chaque zone est un rectangle [xMin, xMax, zMin, zMax]

const ZONES: [number, number, number, number][] = [
  // Cour centrale
  [-3.3,  3.3, -3.3,  3.3],
  // Passages (portes dans les murs)
  [-0.8,  0.8, -4.0, -3.3], // → Bibliothèque (Nord)
  [-0.8,  0.8,  3.3,  4.0], // → Salon (Sud)
  [ 3.3,  4.0, -0.8,  0.8], // → Cuisine (Est)
  [-4.0, -3.3, -0.8,  0.8], // → Hammam (Ouest)
  // Pièces
  [-2.9,  2.9, -8.5, -3.8], // Bibliothèque
  [-2.9,  2.9,  3.8,  8.5], // Salon
  [ 3.8,  8.5, -2.9,  2.9], // Cuisine
  [-8.5, -3.8, -2.9,  2.9], // Hammam
];

export function isWalkable(x: number, z: number): boolean {
  // Fontaine au centre
  if (x * x + z * z < 1.25 * 1.25) return false;
  return ZONES.some(([xMin, xMax, zMin, zMax]) =>
    x >= xMin && x <= xMax && z >= zMin && z <= zMax
  );
}

export type RoomId = "courtyard" | "library" | "salon" | "cuisine" | "hammam";

export function getRoom(x: number, z: number): RoomId {
  if (x >= -2.9 && x <= 2.9 && z <= -3.8) return "library";
  if (x >= -2.9 && x <= 2.9 && z >=  3.8) return "salon";
  if (x >=  3.8 && z >= -2.9 && z <=  2.9) return "cuisine";
  if (x <= -3.8 && z >= -2.9 && z <=  2.9) return "hammam";
  return "courtyard";
}

export const ROOM_NAMES: Record<RoomId, string> = {
  courtyard: "Cour centrale",
  library:   "La Bibliothèque",
  salon:     "Le Salon",
  cuisine:   "La Cuisine",
  hammam:    "Le Hammam",
};
