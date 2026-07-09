"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ProximityPromptProps {
  /** Ref MONDE de l'avatar (le même group que celui suivi par la caméra). */
  avatarRef: React.RefObject<THREE.Group | null>;
  /** Offset MONDE de la zone qui contient cet objet (ZONES.xxx.position). */
  zoneOffset: readonly [number, number, number];
  /** Position LOCALE de l'objet interactif dans sa zone. */
  localPosition: readonly [number, number, number];
  radius?: number;
  children: (inRange: boolean) => React.ReactNode;
}

/**
 * Remplace le modèle "survol + clic sur mesh 3D" (fragile sur tactile, cf.
 * touch-passthrough.ts) par une détection de proximité : le contenu (un
 * bouton HTML classique, jamais raté) n'apparaît que lorsque l'avatar
 * marche jusqu'à l'objet. Le state ne change que lors du franchissement du
 * rayon (pas à chaque frame), donc pas de re-render inutile.
 */
export default function ProximityPrompt({
  avatarRef,
  zoneOffset,
  localPosition,
  radius = 1.6,
  children,
}: ProximityPromptProps) {
  const [inRange, setInRange] = useState(false);
  const wasIn = useRef(false);

  useFrame(() => {
    const avatar = avatarRef.current;
    if (!avatar) return;
    const dx = avatar.position.x - (zoneOffset[0] + localPosition[0]);
    const dz = avatar.position.z - (zoneOffset[2] + localPosition[2]);
    const dist = Math.hypot(dx, dz);
    const now = dist < radius;
    if (now !== wasIn.current) {
      wasIn.current = now;
      setInRange(now);
    }
  });

  return <>{children(inRange)}</>;
}
