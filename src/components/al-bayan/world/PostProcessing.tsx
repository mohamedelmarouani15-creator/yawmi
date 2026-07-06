"use client";

import { useEffect, useState } from "react";
import { EffectComposer, Bloom, Vignette, ChromaticAberration, GodRays } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

// Constant — avoids creating a new Vector2 every render
const CA_OFFSET = new THREE.Vector2(0.00035, 0.00035);

interface AlBayanPostProcessingProps {
  sunRef?: React.RefObject<THREE.Mesh | null>;
  vestibuleSunRef?: React.RefObject<THREE.Mesh | null>;
}

/**
 * Post-processing pipeline d'al-bayan :
 * - GodRays (×2) → faisceaux à travers le moucharabieh du Scriptorium ET
 *   lucarne haute du Vestibule (sources : LightShaftSun, voir zones/*.tsx)
 * - Bloom mipmapBlur → l'avatar bleu (#3D7FE8, emissiveIntensity 2.8) illumine l'espace
 * - Vignette → assombrit les coins (atmosphère de salle secrète)
 * - ChromaticAberration → légère aberration chromatique pour un look cinématique
 */
export default function AlBayanPostProcessing({ sunRef, vestibuleSunRef }: AlBayanPostProcessingProps) {
  // Les refs des soleils (mesh dans zones/Scriptorium.tsx et Vestibule.tsx)
  // ne sont peuplées qu'après le commit initial de l'arbre — on ne doit
  // jamais lire `.current` pendant le rendu (react-hooks/refs) : un effet
  // post-montage copie chaque mesh dans un state, qui déclenche alors le
  // re-rendu ajoutant son GodRays.
  const [sunMesh, setSunMesh] = useState<THREE.Mesh | null>(null);
  const [vestibuleSunMesh, setVestibuleSunMesh] = useState<THREE.Mesh | null>(null);
  useEffect(() => {
    if (sunRef?.current) setSunMesh(sunRef.current);
  }, [sunRef]);
  useEffect(() => {
    if (vestibuleSunRef?.current) setVestibuleSunMesh(vestibuleSunRef.current);
  }, [vestibuleSunRef]);

  return (
    <EffectComposer multisampling={0}>
      {sunMesh ? (
        <GodRays
          sun={sunMesh}
          blendFunction={BlendFunction.SCREEN}
          samples={45}
          density={0.65}
          decay={0.8}
          weight={0.4}
          exposure={0.28}
          clampMax={1}
          kernelSize={2}
          blur
        />
      ) : (
        // Fragment vide le temps que la ref du soleil se peuple (1er frame) —
        // EffectComposer exige des enfants stables, pas de retour null direct.
        <></>
      )}
      {vestibuleSunMesh ? (
        <GodRays
          sun={vestibuleSunMesh}
          blendFunction={BlendFunction.SCREEN}
          samples={40}
          density={0.55}
          decay={0.82}
          weight={0.35}
          exposure={0.24}
          clampMax={1}
          kernelSize={2}
          blur
        />
      ) : (
        <></>
      )}
      <Bloom
        mipmapBlur
        intensity={0.9}
        luminanceThreshold={0.60}
        luminanceSmoothing={0.08}
        radius={0.78}
      />
      <Vignette eskil={false} offset={0.09} darkness={0.68} />
      <ChromaticAberration offset={CA_OFFSET} />
    </EffectComposer>
  );
}
