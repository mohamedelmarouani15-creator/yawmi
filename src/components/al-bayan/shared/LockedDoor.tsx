"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LockedDoorProps {
  /** Centre du seuil, au sol. */
  position: [number, number, number];
  /** Orientation du seuil (0 = porte dans le plan XZ, vantaux pivotant vers +Z). */
  rotationY?: number;
  width: number;
  height: number;
  unlocked: boolean;
  color?: string;
}

/**
 * Porte à deux vantaux qui bloque un passage tant qu'une énigme n'est pas
 * résolue, puis pivote hors du chemin. Deux mécanismes découplés :
 * - Visuel : chaque vantail pivote en douceur (useFrame + damp) autour de
 *   son gond, comme une vraie porte.
 * - Collision : `userData.noCollide` bascule dès `unlocked=true`, sans
 *   attendre la fin de l'animation — le joueur n'est jamais bloqué par un
 *   vantail encore visuellement entrouvert. Le parent doit incrémenter le
 *   `collidersVersion` de `WePlayAvatar` quand `unlocked` change, sans quoi
 *   la liste de colliders (figée au montage) ne serait jamais reconstruite.
 */
export default function LockedDoor({ position, rotationY = 0, width, height, unlocked, color = "#2C1810" }: LockedDoorProps) {
  const leftGroupRef = useRef<THREE.Group>(null);
  const rightGroupRef = useRef<THREE.Group>(null);
  const leftMeshRef = useRef<THREE.Mesh>(null);
  const rightMeshRef = useRef<THREE.Mesh>(null);
  const leafWidth = width / 2;

  useEffect(() => {
    if (leftMeshRef.current) leftMeshRef.current.userData.noCollide = unlocked;
    if (rightMeshRef.current) rightMeshRef.current.userData.noCollide = unlocked;
  }, [unlocked]);

  useFrame((_, delta) => {
    const target = unlocked ? Math.PI / 2 - 0.08 : 0;
    if (leftGroupRef.current) {
      leftGroupRef.current.rotation.y = THREE.MathUtils.damp(leftGroupRef.current.rotation.y, -target, 3.5, delta);
    }
    if (rightGroupRef.current) {
      rightGroupRef.current.rotation.y = THREE.MathUtils.damp(rightGroupRef.current.rotation.y, target, 3.5, delta);
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={leftGroupRef} position={[-leafWidth / 2, 0, 0]}>
        <mesh ref={leftMeshRef} position={[-leafWidth / 2, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[leafWidth, height, 0.12]} />
          <meshStandardMaterial color={color} roughness={0.75} metalness={0.15} />
        </mesh>
        {/* Ferrure décorative — bande verticale au bord libre du vantail */}
        <mesh position={[-leafWidth + 0.04, height / 2, 0.07]} castShadow>
          <boxGeometry args={[0.05, height * 0.94, 0.02]} />
          <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.75} />
        </mesh>
      </group>
      <group ref={rightGroupRef} position={[leafWidth / 2, 0, 0]}>
        <mesh ref={rightMeshRef} position={[leafWidth / 2, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[leafWidth, height, 0.12]} />
          <meshStandardMaterial color={color} roughness={0.75} metalness={0.15} />
        </mesh>
        <mesh position={[leafWidth - 0.04, height / 2, 0.07]} castShadow>
          <boxGeometry args={[0.05, height * 0.94, 0.02]} />
          <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.75} />
        </mesh>
      </group>
    </group>
  );
}
