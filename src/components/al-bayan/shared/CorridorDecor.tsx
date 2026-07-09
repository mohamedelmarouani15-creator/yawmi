"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePBRMaterial } from "@/lib/al-bayan/pbr-materials";

/**
 * Décor léger pour les longues galeries à colonnades (brief : "appliques
 * en métal ciselé, vases monumentaux, tapis") — volontairement SANS
 * `castShadow`/`receiveShadow` : les corridors n'ont aucune lumière à
 * ombres, ces flags n'auraient ajouté aucun rendu visible tout en coûtant
 * un passage d'ombre réel si une lumière voisine déborde sur le seuil (cf.
 * même discipline que OctagonalColumn `shadows={false}` dans les
 * corridors). Chaque applique porte elle-même une petite lumière NON
 * ombrée, ce qui comble aussi les zones sombres entre les points lumineux
 * centraux des corridors.
 */

/** Applique murale en métal ciselé — plaque + flamme animée, se fixe
 * directement au mur (position donnée = point d'ancrage sur la paroi). */
export function WallSconce({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const copperMat = usePBRMaterial("copper", { repeat: [1, 1], roughnessIntensity: 0.35, metalness: 0.75 });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flicker = 1 + Math.sin(t * 7.1 + position[0]) * 0.1 + Math.sin(t * 11.3 + position[2]) * 0.06;
    if (lightRef.current) lightRef.current.intensity = 1.3 * flicker;
    if (flameRef.current) flameRef.current.scale.setScalar(flicker);
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Plaque ciselée contre le mur */}
      <mesh position={[0, 0, -0.03]} material={copperMat}>
        <boxGeometry args={[0.22, 0.34, 0.03]} />
      </mesh>
      {/* Bras */}
      <mesh position={[0, -0.02, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={copperMat}>
        <cylinderGeometry args={[0.015, 0.02, 0.22, 6]} />
      </mesh>
      {/* Coupelle */}
      <mesh position={[0, -0.04, 0.2]} material={copperMat}>
        <cylinderGeometry args={[0.07, 0.05, 0.03, 10]} />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.06, 0.2]}>
        <coneGeometry args={[0.03, 0.09, 6]} />
        <meshStandardMaterial color="#FFC840" emissive="#FF8800" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} color="#FFA040" intensity={1.3} distance={7} decay={2} position={[0, 0.06, 0.2]} />
    </group>
  );
}

/** Vase monumental en céramique — silhouette galbée, purement décoratif. */
export function MonumentalVase({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const terracottaMat = usePBRMaterial("terracotta", { repeat: [1, 1.4] });
  return (
    <group position={position} scale={scale}>
      <mesh material={terracottaMat}>
        <cylinderGeometry args={[0.05, 0.14, 0.3, 12]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} material={terracottaMat}>
        <sphereGeometry args={[0.32, 12, 10]} />
      </mesh>
      <mesh position={[0, 0.72, 0]} material={terracottaMat}>
        <cylinderGeometry args={[0.14, 0.22, 0.22, 12]} />
      </mesh>
      <mesh position={[0, 0.86, 0]} material={terracottaMat}>
        <cylinderGeometry args={[0.16, 0.13, 0.06, 12]} />
      </mesh>
    </group>
  );
}

/** Tapis berbère au sol — bande décorative sans collision, jalonne les
 * longues galeries entre les colonnades. */
export function CorridorRug({ position, rotationY = 0, width = 2.6, length = 4.4 }: { position: [number, number, number]; rotationY?: number; width?: number; length?: number }) {
  const carpetMat = usePBRMaterial("carpet", { repeat: [1, 2], color: "#8a2f2f" });
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotationY]} userData={{ noCollide: true }}>
      <planeGeometry args={[width, length]} />
      <primitive object={carpetMat} attach="material" />
    </mesh>
  );
}
