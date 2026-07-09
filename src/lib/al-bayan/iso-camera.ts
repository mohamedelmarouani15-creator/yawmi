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

export const ISO_PITCH_DEFAULT = (40 * Math.PI) / 180; // 40° au spawn
// Plage de bascule au pouce droit (glissé vertical) — 15° (quasi à hauteur
// d'avatar, pour regarder loin dans un couloir) à 65° (plongée, pour
// embrasser une grande pièce d'un coup d'œil). Anciennement figé à 40°.
export const ISO_PITCH_MIN = (15 * Math.PI) / 180;
export const ISO_PITCH_MAX = (65 * Math.PI) / 180;
// Angle de départ au spawn (avant que le pouce droit ne le modifie).
export const ISO_YAW_DEFAULT = Math.PI / 4;

// Élargi (7 -> 10) avec le passage à l'échelle "Grand Riad" : embrasse
// davantage la scène (plus de contexte, plus de décor visible d'un coup
// d'œil) sans perdre le garde-fou anti-mur (la collision caméra dans
// AlBayanWorld.tsx raccourcit dynamiquement cette distance nominale dès
// qu'un mur est détecté, donc l'augmenter ici ne pousse jamais la caméra
// à travers un mur — seulement plus loin quand la place le permet).
export const ISO_DISTANCE = 10;
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
