/**
 * Caméra isométrique ORBITALE pour al-bayan : la rotation horizontale (yaw)
 * ET l'inclinaison (pitch) suivent le pouce droit en direct — glissé
 * horizontal = orbite autour de l'avatar, glissé vertical = incline la
 * caméra (regarder en haut d'un couloir voûté / regarder vers le bas d'une
 * pièce vaste). L'avatar tourne avec le yaw (même `yawRef`), donc viser une
 * porte reste visuellement intuitif ; le pitch ne fait qu'incliner la
 * caméra, jamais l'avatar.
 *
 * Comme yaw ET pitch changent en direct, le joystick gauche doit être
 * reprojeté CHAQUE FRAME avec le yaw courant (et non plus une constante
 * précalculée) pour que "pousser vers le haut" continue d'aller vers le
 * fond de l'écran quel que soit l'angle d'orbite actuel.
 */

// Repassé de 40° à 28° (retour utilisateur : angle "compliqué", vue trop
// plongeante/lointaine façon drone) — plus proche d'une vue "à l'épaule"
// façon jeu d'aventure 3e personne (cf. capture de référence envoyée),
// qui rapproche aussi visuellement le décor au lieu de l'écraser dans une
// vaste étendue de sol vue de haut.
export const ISO_PITCH_DEFAULT = (28 * Math.PI) / 180;
// Plage de bascule au pouce droit (glissé vertical) — 15° (quasi à hauteur
// d'avatar, pour regarder loin dans un couloir) à 55° (vue plus plongeante
// pour les grandes pièces, sans revenir à l'ancienne vue drone à 65°).
export const ISO_PITCH_MIN = (15 * Math.PI) / 180;
export const ISO_PITCH_MAX = (55 * Math.PI) / 180;
// Angle de départ au spawn (avant que le pouce droit ne le modifie).
export const ISO_YAW_DEFAULT = Math.PI / 4;

// Resserré (10 -> 7.5) : le passage à 10 pour "embrasser" les grandes
// pièces du Grand Riad a eu l'effet inverse en pratique — vue trop
// lointaine, décor qui semble épars, navigation difficile à juger (retour
// utilisateur direct). Le garde-fou anti-mur (collision caméra dans
// AlBayanWorld.tsx) continue de raccourcir cette distance nominale près
// d'un mur, donc la resserrer ici est sans risque, juste plus proche par
// défaut en terrain dégagé.
export const ISO_DISTANCE = 7.5;
// Resserré (0.1 -> 0.08) : suivi plus doux, "drone fluide", moins de
// secousse perceptible quand l'avatar change brusquement de direction.
export const ISO_FOLLOW_LERP = 0.08;

/** Décalage caméra (avatar -> caméra) pour le yaw/pitch d'orbite courants. */
export function getCameraOffset(yaw: number, pitch: number = ISO_PITCH_DEFAULT) {
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  return {
    x: ISO_DISTANCE * cosPitch * Math.sin(yaw),
    y: ISO_DISTANCE * sinPitch,
    z: ISO_DISTANCE * cosPitch * Math.cos(yaw),
  };
}

/** Même direction, normalisée (longueur 1) — sert à la collision caméra
 * (raccourcir la distance sans changer d'angle quand un mur est détecté). */
export function getCameraDir(yaw: number, pitch: number = ISO_PITCH_DEFAULT) {
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
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
