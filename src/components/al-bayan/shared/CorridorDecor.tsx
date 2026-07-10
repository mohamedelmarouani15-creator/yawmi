"use client";

import { useMemo, useRef } from "react";
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

/** Amas de poterie au sol (3-4 jarres de tailles variées) — densifie les
 * niches et pieds de mur, dans l'esprit des étagères chargées de poteries
 * de la référence utilisateur (riad marocain, lumière au flambeau). */
export function PotteryCluster({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const terracottaMat = usePBRMaterial("terracotta", { repeat: [1, 1.2] });
  const copperMat = usePBRMaterial("copper", { repeat: [1, 1], roughnessIntensity: 0.4, metalness: 0.6 });
  const jars = useMemo(
    () => [
      { dx: 0, dz: 0, rt: 0.09, rb: 0.13, h: 0.24, mat: "clay" as const },
      { dx: 0.19, dz: 0.07, rt: 0.05, rb: 0.08, h: 0.16, mat: "clay" as const },
      { dx: -0.16, dz: 0.11, rt: 0.06, rb: 0.09, h: 0.3, mat: "copper" as const },
      { dx: 0.05, dz: -0.18, rt: 0.045, rb: 0.07, h: 0.13, mat: "clay" as const },
    ],
    []
  );
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {jars.map((j, i) => (
        <mesh key={i} position={[j.dx, j.h / 2, j.dz]} material={j.mat === "clay" ? terracottaMat : copperMat}>
          <cylinderGeometry args={[j.rt, j.rb, j.h, 10]} />
        </mesh>
      ))}
    </group>
  );
}

/** Banquette basse chargée de coussins sur un tapis court — coin salon
 * ponctuant les galeries, comme les banquettes garnies de la référence. */
export function CushionBench({ position, rotationY = 0, length = 1.7 }: { position: [number, number, number]; rotationY?: number; length?: number }) {
  const woodMat = usePBRMaterial("wood-dark", { repeat: [1, 1] });
  const velvetColors = useMemo(() => ["#8a2f2f", "#B5842A", "#3F5D3A"], []);
  const seatCount = velvetColors.length;
  const seatWidth = length / seatCount - 0.05;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.2, 0]} material={woodMat}>
        <boxGeometry args={[length, 0.06, 0.5]} />
      </mesh>
      {[-length / 2 + 0.08, length / 2 - 0.08].map((lx, i) => (
        <mesh key={i} position={[lx, 0.1, 0]} material={woodMat}>
          <boxGeometry args={[0.08, 0.2, 0.44]} />
        </mesh>
      ))}
      {velvetColors.map((c, i) => (
        <mesh key={i} position={[-length / 2 + 0.28 + i * (length / seatCount), 0.32, 0]}>
          <boxGeometry args={[seatWidth, 0.14, 0.4]} />
          <meshStandardMaterial color={c} roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

/** Panneau moucharabieh (claustra en bois ajouré) fixé au mur — silhouette
 * décorative sans collision, purement visuelle. */
export function MashrabiyaScreen({ position, rotationY = 0, width = 1.3, height = 2.0 }: { position: [number, number, number]; rotationY?: number; width?: number; height?: number }) {
  const woodMat = usePBRMaterial("wood-dark", { repeat: [1, 1.5] });
  const strutColor = "#160E06";
  const struts = useMemo(() => Array.from({ length: 5 }, (_, i) => -width / 2 + ((i + 0.5) / 5) * width), [width]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} userData={{ noCollide: true }}>
      <mesh material={woodMat}>
        <boxGeometry args={[width, height, 0.035]} />
      </mesh>
      {struts.map((sx, i) => (
        <mesh key={`a-${i}`} position={[sx, 0, 0.02]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.018, height * 1.25, 0.015]} />
          <meshStandardMaterial color={strutColor} roughness={0.7} />
        </mesh>
      ))}
      {struts.map((sx, i) => (
        <mesh key={`b-${i}`} position={[sx, 0, 0.02]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.018, height * 1.25, 0.015]} />
          <meshStandardMaterial color={strutColor} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
