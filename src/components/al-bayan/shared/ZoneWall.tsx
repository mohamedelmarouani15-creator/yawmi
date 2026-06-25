"use client";

interface ZoneWallProps {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  roughness?: number;
  metalness?: number;
}

/** Pan de mur opaque simple (boxGeometry) — referme les côtés de zone qui
 * n'ont ni arche ni paroi décorative dédiée, pour qu'aucune zone ne flotte
 * au-dessus du vide. */
export default function ZoneWall({ position, size, rotation, color, roughness = 0.85, metalness = 0.05 }: ZoneWallProps) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}
