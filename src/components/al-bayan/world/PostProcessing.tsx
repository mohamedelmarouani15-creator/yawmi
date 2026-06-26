"use client";

import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";

// Constant — avoids creating a new Vector2 every render
const CA_OFFSET = new THREE.Vector2(0.00035, 0.00035);

/**
 * Post-processing pipeline d'al-bayan :
 * - Bloom mipmapBlur → l'avatar bleu (#3D7FE8, emissiveIntensity 2.8) illumine l'espace
 * - Vignette → assombrit les coins (atmosphère de salle secrète)
 * - ChromaticAberration → légère aberration chromatique pour un look cinématique
 */
export default function AlBayanPostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={1.6}
        luminanceThreshold={0.42}
        luminanceSmoothing={0.06}
        radius={0.85}
      />
      <Vignette eskil={false} offset={0.09} darkness={0.68} />
      <ChromaticAberration offset={CA_OFFSET} />
    </EffectComposer>
  );
}
