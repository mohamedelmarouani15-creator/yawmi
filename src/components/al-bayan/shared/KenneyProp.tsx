"use client";

import { useGLTF } from "@react-three/drei";

/**
 * Meuble CC0 issu du pack "Furniture Kit" de Kenney (kenney.nl/assets/furniture-kit,
 * licence CC0 — voir public/models/kenney-furniture/LICENSE.txt). Modèles
 * low-poly (5-25 Ko chacun, glTF binaire) choisis précisément pour rester dans
 * le budget mobile après le combat perf de cette session — voir CorridorDecor.tsx
 * et DistanceCulledLight.tsx pour le même souci ailleurs dans al-bayan.
 *
 * `useGLTF` met en cache la scène chargée par URL ; chaque instance doit
 * cloner cette scène (`.clone()`) sinon toutes les occurrences d'un même
 * meuble partageraient le même objet three.js et se déplaceraient ensemble.
 */
export type KenneyPropName =
  | "bench"
  | "benchCushion"
  | "benchCushionLow"
  | "bookcaseClosed"
  | "bookcaseClosedDoors"
  | "bookcaseClosedWide"
  | "bookcaseOpen"
  | "bookcaseOpenLow"
  | "books"
  | "lampRoundFloor"
  | "lampWall"
  | "pillow"
  | "pillowBlue"
  | "pillowBlueLong"
  | "pillowLong"
  | "pottedPlant"
  | "rugDoormat"
  | "rugRectangle"
  | "rugRound"
  | "rugRounded"
  | "rugSquare"
  | "sideTable"
  | "sideTableDrawers"
  | "tableCoffee";

function modelPath(name: KenneyPropName) {
  return `/models/kenney-furniture/${name}.glb`;
}

export function KenneyProp({
  name,
  position,
  rotation,
  scale = 1,
}: {
  name: KenneyPropName;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}) {
  const { scene } = useGLTF(modelPath(name));
  const cloned = scene.clone(true);
  return <primitive object={cloned} position={position} rotation={rotation} scale={scale} />;
}

/** Précharge les modèles utilisés dès le montage du monde, même logique que
 * `preloadAlBayanPBR` pour les textures — évite un pop-in visible la première
 * fois qu'un joueur approche d'un meuble. */
export function preloadKenneyProps(names: readonly KenneyPropName[]) {
  for (const name of names) useGLTF.preload(modelPath(name));
}
