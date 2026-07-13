"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Bibliothèque de matériaux PBR CC0 (ambientCG, aucune attribution requise)
// téléchargés dans public/textures/al-bayan/<nom>/{color,roughness,normal}.jpg
// — cf. le module de décoration par zone (villa/riad). Chaque appelant peut
// régler son propre `repeat` (échelle du motif) sans affecter les autres
// meshes utilisant le même matériau de base : les textures sont clonées par
// instance (drei met en cache et RÉUTILISE le même objet Texture pour une
// URL donnée — muter `.repeat` dessus sans clone ferait fuiter le réglage
// d'un mesh vers tous les autres).
export const PBR_MATERIAL_NAMES = [
  "terracotta",
  "wood-dark",
  "copper",
  "wicker",
  "carpet",
  "marble",
  "zellige",
  "leather",
  "velvet",
  "plaster",
] as const;

export type PBRMaterialName = (typeof PBR_MATERIAL_NAMES)[number];

interface PBRMaterialOptions {
  /** Répétition du motif sur la surface (mapping UV natif du mesh). */
  repeat?: [number, number];
  /** Teinte multipliée sur la carte couleur (laisser blanc pour la couleur native). */
  color?: string;
  /** Multiplicateur appliqué à la roughnessMap (1 = valeur native de la texture). */
  roughnessIntensity?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  /** Intensité de la normalMap (défaut [1,1] = valeur native). Monter au-delà
   * de 1 accentue le relief perçu (briques/stucs plus "ciselés") sans coût
   * supplémentaire — c'est le même normalMap, juste appliqué plus fort. */
  normalScale?: [number, number];
}

function texturePath(name: PBRMaterialName, map: "color" | "roughness" | "normal") {
  return `/textures/al-bayan/${name}/${map}.jpg`;
}

/**
 * Matériau PBR complet (albédo + rugosité + normal map) prêt à assigner via
 * `<primitive object={mat} attach="material" />`. Doit être appelé sous un
 * `<Suspense>` (useTexture suspend pendant le chargement réseau).
 */
export function usePBRMaterial(name: PBRMaterialName, options: PBRMaterialOptions = {}): THREE.MeshStandardMaterial {
  const {
    repeat = [1, 1],
    color = "#ffffff",
    roughnessIntensity = 1,
    metalness = 0,
    emissive,
    emissiveIntensity,
    normalScale = [1, 1],
  } = options;

  const [colorMap, roughnessMap, normalMap] = useTexture([
    texturePath(name, "color"),
    texturePath(name, "roughness"),
    texturePath(name, "normal"),
  ]);

  return useMemo(() => {
    const c = colorMap.clone();
    const r = roughnessMap.clone();
    const n = normalMap.clone();
    for (const tex of [c, r, n]) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat[0], repeat[1]);
      tex.needsUpdate = true;
    }
    c.colorSpace = THREE.SRGBColorSpace;

    return new THREE.MeshStandardMaterial({
      map: c,
      roughnessMap: r,
      normalMap: n,
      normalScale: new THREE.Vector2(normalScale[0], normalScale[1]),
      roughness: roughnessIntensity,
      metalness,
      color,
      ...(emissive ? { emissive, emissiveIntensity: emissiveIntensity ?? 0.3 } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorMap, roughnessMap, normalMap, repeat[0], repeat[1], color, roughnessIntensity, metalness, emissive, emissiveIntensity, normalScale[0], normalScale[1]]);
}

/** Précharge toutes les textures utilisées par une zone dès le montage du
 * monde, pour éviter un pop-in visible à la première approche d'un objet
 * décoré (le Suspense ne se redéclenche qu'une fois par URL non résolue). */
export function preloadAlBayanPBR(names: readonly PBRMaterialName[]) {
  for (const name of names) {
    useTexture.preload(texturePath(name, "color"));
    useTexture.preload(texturePath(name, "roughness"));
    useTexture.preload(texturePath(name, "normal"));
  }
}
