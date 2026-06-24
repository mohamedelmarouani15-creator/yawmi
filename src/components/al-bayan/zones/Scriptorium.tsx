"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import Moucharabieh from "../shared/Moucharabieh";
import EnigmaRasm from "../scenes/EnigmaRasm";

const SIZE = 13;
const H = 7;
const STEP_DOWN = 0.6; // "en contrebas, deux marches" — l'offset Y du groupe zone

/** Table de copiste basse inclinée — décor, pas interactif. */
function CopyistTable({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.32, 0]} rotation={[-0.28, 0, 0]} castShadow>
        <boxGeometry args={[1.1, 0.06, 0.7]} />
        <meshStandardMaterial color="#1C2840" roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.15, 0.25]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.32, 6]} />
        <meshStandardMaterial color="#101828" roughness={0.9} />
      </mesh>
      {/* Encrier en bronze */}
      <mesh position={[0.35, 0.42, 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.08, 8]} />
        <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Plume */}
      <mesh position={[-0.3, 0.42, -0.05]} rotation={[0, 0, 0.6]} castShadow>
        <coneGeometry args={[0.015, 0.32, 5]} />
        <meshStandardMaterial color="#D4D4D4" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Deux marches en pierre menant vers le Vestibule (côté +Z, plus haut). */
function StepsUp() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3A3024", roughness: 0.85 }), []);
  return (
    <group position={[0, 0, SIZE / 2 - 0.3]}>
      <mesh position={[0, STEP_DOWN * 0.66, 0.4]} material={mat} receiveShadow castShadow>
        <boxGeometry args={[4, STEP_DOWN * 0.66, 0.8]} />
      </mesh>
      <mesh position={[0, STEP_DOWN * 0.33, 1.1]} material={mat} receiveShadow castShadow>
        <boxGeometry args={[4, STEP_DOWN * 0.33, 0.8]} />
      </mesh>
    </group>
  );
}

/**
 * Zone 3 — Le Scriptorium de la Calligraphie (Quête du Rasm). En
 * contrebas du Vestibule (cf. offset Y appliqué par AlBayanWorld), cloisons
 * moucharabieh filtrant la lumière, tables de copiste, lampes à l'huile
 * (réutilise `CandleLight` tel quel — pas de nouvelle géométrie de lampe,
 * la flamme/lumière est déjà non-shadow-casting).
 */
export default function Scriptorium({ onConfirm }: { onConfirm?: () => void }) {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1B140A", roughness: 0.6, metalness: 0.08 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#120E08", roughness: 0.9 }), []);

  return (
    <group>
      <pointLight color="#E8A33D" intensity={2.6} distance={7.5} decay={2} position={[-3, 2.4, -2]} />
      <pointLight color="#E8A33D" intensity={2.6} distance={7.5} decay={2} position={[3, 2.4, -2]} />
      {/* Lumière chaude basse, au niveau des tables de copiste, pour en révéler le volume */}
      <pointLight color="#FFAA44" intensity={1.6} distance={5} decay={2} position={[0, 1.4, 1]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <primitive object={floorMat} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#040302" roughness={1} />
      </mesh>

      {/* Mur extérieur (côté qui ne donne sur aucune autre zone) */}
      <mesh position={[-SIZE / 2 + 0.1, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, H, SIZE]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Cloisons moucharabieh — séparation ajourée vers le Vestibule */}
      <group position={[-3.2, H / 2 - 0.5, SIZE / 2 - 0.5]}>
        <Moucharabieh width={3.4} height={H - 1} cellSize={0.3} />
      </group>
      <group position={[3.2, H / 2 - 0.5, SIZE / 2 - 0.5]}>
        <Moucharabieh width={3.4} height={H - 1} cellSize={0.3} />
      </group>

      <StepsUp />

      <group position={[0, 0, -0.5]}>
        <EnigmaRasm onConfirm={onConfirm} />
      </group>

      <CopyistTable position={[-3.6, 0, 1.5]} rotation={[0, 0.4, 0]} />
      <CopyistTable position={[3.6, 0, 1.5]} rotation={[0, -0.4, 0]} />
      <CopyistTable position={[-3.8, 0, -2.5]} rotation={[0, 0.9, 0]} />

      <CandleLight position={[-4.5, 0.4, -3]} intensity={1.2} />
      <CandleLight position={[4.5, 0.4, -3]} intensity={1.2} />
      <CandleLight position={[0, 0.4, 3.5]} intensity={1.0} />

      <AmbientParticles />
    </group>
  );
}
