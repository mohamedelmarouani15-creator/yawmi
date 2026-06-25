/**
 * Caméra isométrique ORBITALE pour al-bayan : l'inclinaison (pitch) est
 * fixe, mais la rotation horizontale (yaw) suit désormais le pouce droit en
 * direct — la caméra tourne autour de l'avatar comme dans un jeu d'action
 * classique, au lieu d'un angle figé à 45°. L'avatar tourne avec elle
 * (même `yawRef`), donc viser une porte reste visuellement intuitif.
 *
 * Comme le yaw change en direct, le joystick gauche doit être reprojeté
 * CHAQUE FRAME avec le yaw courant (et non plus une constante précalculée)
 * pour que "pousser vers le haut" continue d'aller vers le fond de l'écran
 * quel que soit l'angle d'orbite actuel.
 */

export const ISO_PITCH = Math.PI / 4; // 45° — fixe, l'orbite ne change que l'horizontale
// Angle de départ au spawn (avant que le pouce droit ne le modifie) — même
// cadrage par défaut qu'avec l'ancienne caméra fixe à 45°.
export const ISO_YAW_DEFAULT = Math.PI / 4;

// Une valeur trop grande pousse la caméra à travers le mur derrière
// l'avatar dès qu'il est proche d'une paroi (vérifié : à 11, la caméra se
// retrouvait à 1,5 unité DERRIÈRE le mur d'étagères du Vestibule — écran
// quasi noir car on regardait son dos opaque de très près). 7 garde assez
// de marge dans toutes les zones tout en laissant le recul isométrique.
export const ISO_DISTANCE = 7;
// Resserré (0.1 -> 0.08) : suivi plus doux, "drone fluide", moins de
// secousse perceptible quand l'avatar change brusquement de direction.
export const ISO_FOLLOW_LERP = 0.08;

const cosPitch = Math.cos(ISO_PITCH);
const sinPitch = Math.sin(ISO_PITCH);

/** Décalage caméra (avatar -> caméra) pour le yaw d'orbite courant. */
export function getCameraOffset(yaw: number) {
  return {
    x: ISO_DISTANCE * cosPitch * Math.sin(yaw),
    y: ISO_DISTANCE * sinPitch,
    z: ISO_DISTANCE * cosPitch * Math.cos(yaw),
  };
}

/** Même direction, normalisée (longueur 1) — sert à la collision caméra
 * (raccourcir la distance sans changer d'angle quand un mur est détecté). */
export function getCameraDir(yaw: number) {
  return {
    x: cosPitch * Math.sin(yaw),
    y: sinPitch,
    z: cosPitch * Math.cos(yaw),
  };
}

/**
 * Projette une entrée de joystick (-1..1 sur x et y, y>0 = pouce vers le
 * haut) dans le plan XZ du monde, alignée sur l'écran de la caméra pour le
 * yaw d'orbite COURANT (passé en paramètre, pas une constante) : x>0 =
 * écran-droite, y>0 = vers le fond de l'écran. Retourne un vecteur déjà
 * normalisé (longueur ≤ 1) — au runtime `len` peut être 0, géré par l'appelant.
 */
export function projectJoystickToWorld(joyX: number, joyY: number, yaw: number) {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const moveX = cosYaw * joyX - sinYaw * joyY;
  const moveZ = -sinYaw * joyX - cosYaw * joyY;
  return { x: moveX, z: moveZ };
}
