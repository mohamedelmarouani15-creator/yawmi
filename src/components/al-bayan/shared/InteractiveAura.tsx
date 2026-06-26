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

  const innerMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [color]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
      ringMat.opacity = 0.18 + 0.28 * pulse;
      ringRef.current.scale.setScalar(1 + 0.11 * Math.sin(t * 2.2));
    }
    innerMat.opacity = 0.08 + 0.10 * Math.sin(t * 1.5);
  });

  return (
    <group position={position}>
      {/* Anneau extérieur pulsant */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.62, radius, 44]} />
        <primitive object={ringMat} attach="material" />
      </mesh>
      {/* Disque intérieur doux */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.60, 36]} />
        <primitive object={innerMat} attach="material" />
      </mesh>
      {/* Lueur ambiante douce — pas trop forte pour ne pas surcharger le Bloom */}
      <pointLight color={color} intensity={0.35} distance={2.8} position={[0, 0.5, 0]} />
    </group>
  );
}
