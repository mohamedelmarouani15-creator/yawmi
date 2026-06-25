/**
 * Caméra isométrique fixe pour al-bayan : l'angle (40° d'inclinaison, 45°
 * de rotation) ne dépend jamais de l'orientation de l'avatar — seule sa
 * position suit, avec un lerp. Le joystick gauche doit donc être projeté
 * dans le repère écran défini par cet angle fixe (et non plus par le yaw
 * de l'avatar) pour que "pousser à gauche" aille bien à l'écran-gauche.
 *
 * Tout est en scalaires (pas de THREE.Vector3) pour éviter les allocations
 * par frame — même discipline que le reste du mouvement de l'avatar.
 */

export const ISO_YAW = Math.PI / 4; // 45°
export const ISO_PITCH = Math.PI / 4; // 45° — angle isométrique strict (cf. spec direction créative)
// Une valeur trop grande pousse la caméra à travers le mur derrière
// l'avatar dès qu'il est proche d'une paroi (vérifié : à 11, la caméra se
// retrouvait à 1,5 unité DERRIÈRE le mur d'étagères du Vestibule — écran
// quasi noir car on regardait son dos opaque de très près). 8 garde assez
// de marge dans toutes les zones (le contenu interactif de chaque zone
// reste à plusieurs unités de ses murs extérieurs).
// Réduit (8 -> 6) : avec un pitch de 45° (vs 40° avant) et des murs désormais
// réels sur tous les côtés de zone, un avatar plaqué contre un mur par la
// collision pousse vite la caméra (offset constant) au-delà de ce mur — la
// caméra se retrouve dehors, dans la zone morte sombre entre les salles.
// Plus la distance est grande, plus cette excursion est large. 6 réduit
// nettement l'ampleur du problème sans trop resserrer le cadrage iso.
export const ISO_DISTANCE = 7;
// Resserré (0.1 -> 0.08) : suivi plus doux, "drone fluide", moins de
// secousse perceptible quand l'avatar change brusquement de direction.
export const ISO_FOLLOW_LERP = 0.08;

const cosYaw = Math.cos(ISO_YAW);
const sinYaw = Math.sin(ISO_YAW);
const cosPitch = Math.cos(ISO_PITCH);
const sinPitch = Math.sin(ISO_PITCH);

/** Vecteur constant à ajouter à la position de l'avatar pour obtenir la position caméra. */
export const ISO_CAMERA_OFFSET = {
  x: ISO_DISTANCE * cosPitch * sinYaw,
  y: ISO_DISTANCE * sinPitch,
  z: ISO_DISTANCE * cosPitch * cosYaw,
};

/** Même direction, normalisée (magnitude exactement 1) — sert à raccourcir
 * la distance caméra sans changer d'angle quand un mur est détecté entre
 * l'avatar et la position caméra théorique. */
export const ISO_CAMERA_DIR = {
  x: ISO_CAMERA_OFFSET.x / ISO_DISTANCE,
  y: ISO_CAMERA_OFFSET.y / ISO_DISTANCE,
  z: ISO_CAMERA_OFFSET.z / ISO_DISTANCE,
};

/**
 * Projette une entrée de joystick (-1..1 sur x et y, y>0 = pouce vers le
 * haut) dans le plan XZ du monde, alignée sur l'écran de la caméra iso
 * fixe : x>0 = écran-droite, y>0 = vers le fond de l'écran (loin de la
 * caméra). Retourne un vecteur déjà normalisé (longueur ≤ 1) — au runtime
 * `len` peut être 0 si joyX=joyY=0, géré par l'appelant.
 */
export function projectJoystickToWorld(joyX: number, joyY: number) {
  const moveX = cosYaw * joyX - sinYaw * joyY;
  const moveZ = -sinYaw * joyX - cosYaw * joyY;
  return { x: moveX, z: moveZ };
}
