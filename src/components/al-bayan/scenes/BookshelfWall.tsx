"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface BookshelfWallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  rows?: number;
  booksPerRow?: number;
}

// Palette chaude façon vieille bibliothèque — cuirs ambrés, rouges profonds,
// bruns, dorés, avec quelques teintes plus sombres pour la variation.
const BOOK_COLORS = [
  "#8B5A2B", "#A0522D", "#6B3F1D", "#C9A227", "#7A1F1F",
  "#5C3A21", "#9C6B30", "#3F2A1A", "#B8860B", "#4A2511",
  "#6E4423", "#8C7A3D",
];

const SHELF_LIP_COLOR = "#1A1208";

/**
 * Mur d'étagères dense rendu en InstancedMesh (une seule géométrie/draw call
 * pour des centaines de tranches de livres) — garde la perf mobile tout en
 * donnant la densité visuelle de la bibliothèque surréaliste de référence.
 */
export default function BookshelfWall({
  position,
  rotation,
  width,
  height,
  rows = 9,
  booksPerRow = 36,
}: BookshelfWallProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = rows * booksPerRow;

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.05 }),
    []
  );

  // Backing wall (fond sombre derrière les livres, légèrement en retrait).
  const backWallGeo = useMemo(() => new THREE.BoxGeometry(width, height, 0.15), [width, height]);
  const backWallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0E0A06", roughness: 0.95 }), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const rowHeight = height / rows;
    const colWidth = width / booksPerRow;
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < booksPerRow; c++) {
        const jitterW = colWidth * (0.78 + Math.random() * 0.18);
        const jitterH = rowHeight * (0.7 + Math.random() * 0.28);
        const depth = 0.22 + Math.random() * 0.08;
        const x = -width / 2 + colWidth * (c + 0.5) + (Math.random() - 0.5) * colWidth * 0.08;
        const y = -height / 2 + rowHeight * (r + 0.5) - (rowHeight - jitterH) / 2 + rowHeight * 0.06;
        dummy.position.set(x, y, depth / 2);
        dummy.rotation.set(0, 0, (Math.random() - 0.5) * 0.04);
        dummy.scale.set(jitterW, jitterH, depth);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, new THREE.Color(BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)]));
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [rows, booksPerRow, width, height]);

  const shelfLips = useMemo(() => {
    const lips: { y: number }[] = [];
    const rowHeight = height / rows;
    for (let r = 1; r < rows; r++) lips.push({ y: -height / 2 + rowHeight * r });
    return lips;
  }, [rows, height]);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={backWallGeo} material={backWallMat} position={[0, 0, -0.08]} receiveShadow />
      <instancedMesh ref={meshRef} args={[geometry, material, count]} castShadow receiveShadow />
      {shelfLips.map((lip, idx) => (
        <mesh key={idx} position={[0, lip.y, 0.12]} receiveShadow>
          <boxGeometry args={[width, 0.03, 0.4]} />
          <meshStandardMaterial color={SHELF_LIP_COLOR} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
