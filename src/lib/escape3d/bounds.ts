// Zones praticables du riad complet
// Chaque zone est un rectangle [xMin, xMax, zMin, zMax]

const ZONES: [number, number, number, number][] = [
  // Cour centrale
  [-3.2,  3.2, -3.2,  3.2],
  // Passages — alignés avec les portes DOOR_W=1.6 → ±0.8
  [-0.78, 0.78, -3.75, -3.2], // → Bibliothèque (Nord)
  [-0.78, 0.78,  3.2,  3.75], // → Salon (Sud)
  [ 3.2,  3.75, -0.78, 0.78], // → Cuisine (Est)
  [-3.75,-3.2,  -0.78, 0.78], // → Hammam (Ouest)
  // Pièces
  [-2.8,  2.8, -8.4, -3.7], // Bibliothèque
  [-2.8,  2.8,  3.7,  8.4], // Salon
  [ 3.7,  8.4, -2.8,  2.8], // Cuisine
  [-8.4, -3.7, -2.8,  2.8], // Hammam
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
