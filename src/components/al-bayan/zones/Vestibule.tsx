"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Stars } from "@react-three/drei";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import IslamicArch from "../../maison-sagesse/shared/IslamicArch";
import OctagonalColumn from "../shared/OctagonalColumn";
import BookshelfWall from "../scenes/BookshelfWall";

const W = 18;
const D = 14;
const H = 11;

/** Tapis géométrique à motifs — trois rectangles superposés, sans texture. */
function Rug({ position, width = 3.4, depth = 5.2 }: { position: [number, number, number]; width?: number; depth?: number }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#5C1A24" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[width * 0.78, depth * 0.82]} />
        <meshStandardMaterial color="#16204A" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[width * 0.5, depth * 0.55]} />
        <meshStandardMaterial color="#C8A84B" emissive="#8B6914" emissiveIntensity={0.08} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Comptoir d'accueil en bois de cèdre — boîtes assemblées, pas de modèle. */
function CedarCounter({ position }: { position: [number, number, number] }) {
  const darkCedar = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3D2410", roughness: 0.4, metalness: 0.18 }), []);
  const lightCedar = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5C3A1E", roughness: 0.35, metalness: 0.14 }), []);
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} material={darkCedar} castShadow receiveShadow>
        <boxGeometry args={[4.4, 1.1, 1.2]} />
      </mesh>
      <mesh position={[0, 1.13, 0]} material={lightCedar} castShadow>
        <boxGeometry args={[4.6, 0.08, 1.32]} />
      </mesh>
      {[-1.9, 0, 1.9].map((x) => (
        <mesh key={x} position={[x, 0.05, 0]} material={darkCedar} castShadow>
          <boxGeometry args={[0.18, 0.1, 1.2]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Zone 1 — Le Grand Vestibule des Traducteurs (spawn). Anciennement
 * `scenes/MainHall.tsx` ; perd ses 3 portails cliquables (plus de
 * navigation par route, on y entre/sort en marchant) et gagne le décor du
 * brief : sol calcaire, comptoir cèdre, tapis, étagères dans le fond.
 */
export default function Vestibule() {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#C9BFA8", roughness: 0.14, metalness: 0.07 }), []);
  const ceilingMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#050302", roughness: 1 }), []);

  return (
    <group>
      <pointLight color="#FFAA44" intensity={2.2} distance={9} decay={2} position={[0, 1.7, -1]} castShadow={false} />
      <pointLight color="#E8A33D" intensity={2.6} distance={8.5} decay={2} position={[-W / 2 + 2.5, 3.2, 4]} />
      <pointLight color="#E8A33D" intensity={2.6} distance={8.5} decay={2} position={[W / 2 - 2.5, 3.2, 4]} />

      <group position={[0, H + 8, 0]}>
        <Stars radius={40} depth={5} count={150} factor={1.5} fade speed={0.4} />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <primitive object={floorMat} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H + 6, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={ceilingMat} attach="material" />
      </mesh>

      <Rug position={[-3.2, 0.001, 4]} />
      <Rug position={[3.2, 0.001, 4]} />

      {/* Mur du fond (entrée du complexe — seul côté sans zone voisine) */}
      <BookshelfWall position={[0, (H + 5) / 2, D / 2 - 0.08]} rotation={[0, Math.PI, 0]} width={W} height={H + 5} rows={18} booksPerRow={40} />

      {/* Seuils ouverts vers les 3 autres zones — colonnes + arche, pas de
          mur opaque : on y marche directement. */}
      <OctagonalColumn position={[-4.5, 0, -3.5]} height={H} />
      <OctagonalColumn position={[4.5, 0, -3.5]} height={H} />
      <group position={[0, 0, -D / 2 + 0.3]}>
        <IslamicArch width={4.5} height={6} depth={0.3} />
      </group>
      <OctagonalColumn position={[-W / 2 + 1, 0, 0]} height={H} />
      <group position={[-W / 2 + 0.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <IslamicArch width={4.5} height={6} depth={0.3} />
      </group>
      <OctagonalColumn position={[W / 2 - 1, 0, 0]} height={H} />
      <group position={[W / 2 - 0.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <IslamicArch width={4.5} height={6} depth={0.3} />
      </group>

      <CedarCounter position={[0, 0, -1.5]} />

      <CandleLight position={[-4.5, 0.4, -3.5]} intensity={1.3} />
      <CandleLight position={[4.5, 0.4, -3.5]} intensity={1.3} />
      <CandleLight position={[-2, 1.16, -1.5]} intensity={0.85} />
      <CandleLight position={[2, 1.16, -1.5]} intensity={0.85} />

      <AmbientParticles />
    </group>
  );
}
