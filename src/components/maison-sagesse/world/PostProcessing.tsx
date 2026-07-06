"use client";

import { useEffect, useState } from "react";
import { EffectComposer, Bloom, Vignette, ChromaticAberration, GodRays } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

const CA_OFFSET = new THREE.Vector2(0.0003, 0.0003);

interface MaisonSagessePostProcessingProps {
  sunRef?: React.RefObject<THREE.Mesh | null>;
}

/**
 * Pipeline de post-processing de Maison de la Sagesse — jusqu'ici inexistant
 * (contrairement à al-bayan). Même famille d'effets qu'al-bayan, teinte plus
 * dorée (le hall est éclairé par une lumière chaude tombant du dôme plutôt
 * que le bleu nocturne d'al-bayan) :
 * - GodRays → faisceau tombant du dôme central (LightShaftSun, MainHall.tsx)
 * - Bloom → les portails (vert/bleu/or) et les bougies rayonnent
 * - Vignette → resserre l'attention sur le hall
 * - ChromaticAberration → même léger grain cinématique qu'al-bayan
 */
export default function MaisonSagessePostProcessing({ sunRef }: MaisonSagessePostProcessingProps) {
  // Voir al-bayan/world/PostProcessing.tsx : jamais de lecture de `.current`
  // pendant le rendu (react-hooks/refs), un effet post-montage copie le mesh
  // dans un state une fois la ref peuplée.
  const [sunMesh, setSunMesh] = useState<THREE.Mesh | null>(null);
  useEffect(() => {
    if (sunRef?.current) setSunMesh(sunRef.current);
  }, [sunRef]);

  return (
    <EffectComposer multisampling={0}>
      {sunMesh ? (
        <GodRays
          sun={sunMesh}
          blendFunction={BlendFunction.SCREEN}
          samples={45}
          density={0.7}
          decay={0.82}
          weight={0.45}
          exposure={0.32}
          clampMax={1}
          kernelSize={2}
          blur
        />
      ) : (
        <></>
      )}
      <Bloom
        mipmapBlur
        intensity={0.85}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.1}
        radius={0.75}
      />
      <Vignette eskil={false} offset={0.1} darkness={0.62} />
      <ChromaticAberration offset={CA_OFFSET} />
    </EffectComposer>
  );
}
