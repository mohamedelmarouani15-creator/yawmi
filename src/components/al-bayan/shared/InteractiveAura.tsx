"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface InteractiveAuraProps {
  position?: [number, number, number];
  color?: string;
  radius?: number;
}

/**
 * Auréole interactive au sol : anneau doré pulsant + faisceau vertical +
 * petite lumière ambiante. Indique visuellement les objets cliquables dans
 * les zones du puzzle.
 */
export default function InteractiveAura({
  position = [0, 0.02, 0],
  color = "#D4AF37",
  radius = 1.1,
}: InteractiveAuraProps) {
  const ringRef = useRef<THREE.Mesh>(null);

  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [color]
  );

  const beamMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [color]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
      ringMat.opacity = 0.2 + 0.38 * pulse;
      ringRef.current.scale.setScalar(1 + 0.11 * Math.sin(t * 2.2));
    }
    beamMat.opacity = 0.06 + 0.06 * Math.sin(t * 1.7);
  });

  return (
    <group position={position}>
      {/* Anneau horizontal pulsant */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.62, radius, 44]} />
        <primitive object={ringMat} attach="material" />
      </mesh>
      {/* Faisceau vertical (cône large, faces arrière) */}
      <mesh position={[0, 1.4, 0]}>
        <coneGeometry args={[radius * 0.55, 2.8, 14, 1, true]} />
        <primitive object={beamMat} attach="material" />
      </mesh>
      {/* Lueur ambiante douce */}
      <pointLight color={color} intensity={0.55} distance={3.2} position={[0, 0.8, 0]} />
    </group>
  );
}
