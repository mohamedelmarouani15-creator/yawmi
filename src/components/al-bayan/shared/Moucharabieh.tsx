"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface MoucharabiehProps {
  width?: number;
  height?: number;
  cellSize?: number;
  color?: string;
  slatThickness?: number;
}

/**
 * Cloison ajourée façon moucharabieh : un treillis de lattes en bois
 * disposées en croisillon (deux jeux de barres à ±45°), construit en
 * panneau plat dans le plan XY local — la pose (position/rotation) se
 * fait via le `<group>` appelant, comme pour `IslamicArch`.
 *
 * Deux `InstancedMesh` (un par diagonale) quel que soit le nombre de
 * lattes : même discipline perf que `BookshelfWall`/`AmbientParticles`,
 * pas de mesh individuel par latte.
 */
export default function Moucharabieh({
  width = 4,
  height = 4,
  cellSize = 0.32,
  color = "#2C1810",
  slatThickness = 0.035,
}: MoucharabiehProps) {
  const diagARef = useRef<THREE.InstancedMesh>(null);
  const diagBRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const positions = useMemo(() => {
    const cols = Math.ceil(width / cellSize) + 2;
    const rows = Math.ceil(height / cellSize) + 2;
    const pts: [number, number][] = [];
    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = -width / 2 - cellSize + i * cellSize;
        const y = -height / 2 - cellSize + j * cellSize;
        if (Math.abs(x) > width / 2 + cellSize * 0.5 || Math.abs(y) > height / 2 + cellSize * 0.5) continue;
        pts.push([x, y]);
      }
    }
    return pts;
  }, [width, height, cellSize]);

  const slatLen = cellSize * 1.42;
  const geometry = useMemo(() => new THREE.BoxGeometry(slatLen, slatThickness, slatThickness), [slatLen, slatThickness]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05 }), [color]);
  const maxCount = positions.length;

  useLayoutEffect(() => {
    function fill(mesh: THREE.InstancedMesh | null, angle: number) {
      if (!mesh) return;
      positions.forEach(([x, y], idx) => {
        dummy.position.set(x, y, 0);
        dummy.rotation.set(0, 0, angle);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    fill(diagARef.current, Math.PI / 4);
    fill(diagBRef.current, -Math.PI / 4);
  }, [positions, dummy]);

  return (
    <group>
      <instancedMesh ref={diagARef} args={[geometry, material, maxCount]} />
      <instancedMesh ref={diagBRef} args={[geometry, material, maxCount]} />
      {/* Cadre */}
      <mesh position={[0, height / 2, 0]}><boxGeometry args={[width + 0.1, 0.08, 0.08]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      <mesh position={[0, -height / 2, 0]}><boxGeometry args={[width + 0.1, 0.08, 0.08]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      <mesh position={[-width / 2, 0, 0]}><boxGeometry args={[0.08, height, 0.08]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      <mesh position={[width / 2, 0, 0]}><boxGeometry args={[0.08, height, 0.08]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
    </group>
  );
}
