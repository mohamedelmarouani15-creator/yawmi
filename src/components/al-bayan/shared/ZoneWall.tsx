"use client";

import type * as THREE from "three";

interface ZoneWallProps {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  roughness?: number;
  metalness?: number;
  /** Matériau PBR (usePBRMaterial) à utiliser à la place du
   * meshStandardMaterial plat par défaut — `color`/`roughness`/`metalness`
   * sont alors ignorés (déjà réglés sur le matériau fourni). */
  material?: THREE.Material;
}

/** Pan de mur opaque simple (boxGeometry) — referme les côtés de zone qui
 * n'ont ni arche ni paroi décorative dédiée, pour qu'aucune zone ne flotte
 * au-dessus du vide. */
export default function ZoneWall({ position, size, rotation, color, roughness = 0.85, metalness = 0.05, material }: ZoneWallProps) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={size} />
      {material ? (
        <primitive object={material} attach="material" />
      ) : (
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      )}
    </mesh>
  );
}
