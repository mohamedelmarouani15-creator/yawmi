"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface OctagonalColumnProps {
  position: [number, number, number];
  height?: number;
  radius?: number;
  color?: string;
  accentColor?: string;
}

/**
 * Colonne octogonale (base + fût + chapiteau), extraite de l'ancien
 * MainHall d'al-bayan où elle était une fonction locale non réutilisable.
 * Paramétrée pour servir aux rangées de colonnes entre les 4 zones du
 * monde ouvert.
 */
export default function OctagonalColumn({
  position,
  height = 11,
  radius = 0.3,
  color = "#5C4A38",
  accentColor = "#7A6450",
}: OctagonalColumnProps) {
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.88 }), [color]);
  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.8 }), [accentColor]);
  const baseGeo = useMemo(() => new THREE.CylinderGeometry(radius * 1.2, radius * 1.4, 0.25, 8), [radius]);
  const shaftGeo = useMemo(() => new THREE.CylinderGeometry(radius * 0.93, radius, height - 0.4, 8), [radius, height]);
  const capGeo = useMemo(() => new THREE.CylinderGeometry(radius * 1.33, radius * 0.93, 0.3, 8), [radius]);

  return (
    <group position={position}>
      <mesh geometry={baseGeo} material={accentMat} position={[0, 0.125, 0]} castShadow receiveShadow />
      <mesh geometry={shaftGeo} material={stoneMat} position={[0, height / 2, 0]} castShadow receiveShadow />
      <mesh geometry={capGeo} material={accentMat} position={[0, height - 0.15, 0]} castShadow receiveShadow />
    </group>
  );
}
