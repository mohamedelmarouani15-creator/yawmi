"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DistanceCulledLightProps {
  color?: string;
  intensity?: number;
  distance?: number;
  decay?: number;
  position?: [number, number, number];
  castShadow?: boolean;
  avatarRef?: React.RefObject<THREE.Group | null>;
  /** Rayon au-delà duquel la lumière est désactivée (`visible = false`).
   * three.js exclut les lumières invisibles du tableau envoyé au shader
   * (WebGLLights.setup), donc ça retire vraiment leur coût par-fragment —
   * pas juste leur contribution visuelle. Généreux par défaut (45) pour
   * couvrir même la plus grande pièce (Jardin, 60×60, demi-diagonale
   * ≈42) sans que sa propre lumière s'éteigne alors que le joueur y est
   * encore. */
  activeRadius?: number;
}

/**
 * Le villa entier (7 pièces + 5 corridors) reste monté en permanence —
 * AlBayanWorld ne démonte rien selon la zone courante. Sans ce culling, une
 * trentaine de `pointLight` fixes (lumière d'ambiance de chaque pièce)
 * contribuent à CHAQUE fragment de la scène en permanence, où que soit le
 * joueur — mesure directe en jeu : un scénario de test attendait 4s et en a
 * pris 64s de temps réel. Si `avatarRef` est omis, se comporte comme un
 * `pointLight` normal (toujours actif).
 */
export default function DistanceCulledLight({
  color,
  intensity,
  distance,
  decay,
  position,
  castShadow,
  avatarRef,
  activeRadius = 45,
}: DistanceCulledLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const worldPos = useRef(new THREE.Vector3()).current;

  useFrame(() => {
    const light = lightRef.current;
    if (!light || !avatarRef?.current) return;
    light.getWorldPosition(worldPos);
    light.visible = worldPos.distanceTo(avatarRef.current.position) <= activeRadius;
  });

  return (
    <pointLight
      ref={lightRef}
      color={color}
      intensity={intensity}
      distance={distance}
      decay={decay}
      position={position}
      castShadow={castShadow}
    />
  );
}
