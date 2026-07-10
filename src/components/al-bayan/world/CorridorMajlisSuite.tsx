"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import OctagonalColumn from "../shared/OctagonalColumn";
import LockedDoor from "../shared/LockedDoor";
import { WallSconce, MonumentalVase, CorridorRug, PotteryCluster, CushionBench, MashrabiyaScreen } from "../shared/CorridorDecor";

// Corridor en coordonnées MONDE reliant l'ouverture taillée dans le mur "+X
// local" du Majlis (monde X≈136.9) à celle du mur "-X local" de la Suite
// Privée (monde X≈155.1). Porte verrouillée tant que le code des jarres
// n'est pas connu (jarsRead) — le joueur doit d'abord passer par la
// Cuisine avant de pouvoir ouvrir le coffre.
const MAJLIS_OPENING_X = 136.9;
const SUITE_OPENING_X = 155.1;
const WIDTH = 7;
const HALL_HEIGHT = 5.6;

interface CorridorMajlisSuiteProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  jarsRead: boolean;
}

export default function CorridorMajlisSuite({ avatarRef, jarsRead }: CorridorMajlisSuiteProps) {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1E1A26", roughness: 0.7, metalness: 0.05 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2C2636", roughness: 0.8 }), []);

  const length = SUITE_OPENING_X - MAJLIS_OPENING_X;
  const centerX = (MAJLIS_OPENING_X + SUITE_OPENING_X) / 2;

  const columnXs = useMemo(() => {
    const count = Math.max(2, Math.round(length / 9));
    return Array.from({ length: count }, (_, i) => MAJLIS_OPENING_X + ((i + 0.5) / count) * length);
  }, [length]);

  return (
    <group>
      <mesh position={[centerX, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[length, 0.1, WIDTH]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      <mesh position={[centerX, HALL_HEIGHT / 2 - 0.4, -WIDTH / 2]} receiveShadow castShadow>
        <boxGeometry args={[length, HALL_HEIGHT, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[centerX, HALL_HEIGHT / 2 - 0.4, WIDTH / 2]} receiveShadow castShadow>
        <boxGeometry args={[length, HALL_HEIGHT, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {columnXs.map((x, i) => (
        <group key={`col-${i}`}>
          <OctagonalColumn position={[x, 0, -WIDTH / 2 + 0.45]} height={HALL_HEIGHT - 0.4} shadows={false} />
          <OctagonalColumn position={[x, 0, WIDTH / 2 - 0.45]} height={HALL_HEIGHT - 0.4} shadows={false} />
        </group>
      ))}
      {columnXs.map((x, i) => (
        <group key={`sconce-${i}`}>
          <WallSconce position={[x, HALL_HEIGHT * 0.5, -WIDTH / 2 + 0.15]} rotationY={0} />
          <WallSconce position={[x, HALL_HEIGHT * 0.5, WIDTH / 2 - 0.15]} rotationY={Math.PI} />
        </group>
      ))}
      <MonumentalVase position={[MAJLIS_OPENING_X + 1.3, 0, -WIDTH / 2 + 0.8]} scale={1.1} />
      <MonumentalVase position={[SUITE_OPENING_X - 1.3, 0, WIDTH / 2 - 0.8]} scale={1.1} />
      <PotteryCluster position={[MAJLIS_OPENING_X + 1.5, 0, WIDTH / 2 - 0.55]} />
      <PotteryCluster position={[SUITE_OPENING_X - 1.5, 0, -WIDTH / 2 + 0.55]} />
      <CushionBench position={[centerX - length * 0.15, 0, -WIDTH / 2 + 0.5]} />
      <MashrabiyaScreen position={[centerX + length * 0.15, HALL_HEIGHT * 0.4, WIDTH / 2 - 0.05]} rotationY={Math.PI} />
      <CorridorRug position={[centerX, 0.015, 0]} width={length * 0.4} length={WIDTH * 0.55} />

      <mesh
        position={[centerX, HALL_HEIGHT - 0.4, 0]}
        rotation={[0, 0, Math.PI / 2]}
        userData={{ noCollide: true }}
      >
        <cylinderGeometry args={[WIDTH / 2, WIDTH / 2, length, 20, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#241F2E" roughness={0.85} side={THREE.BackSide} />
      </mesh>

      <LockedDoor
        position={[MAJLIS_OPENING_X + 0.3, 0, 0]}
        rotationY={Math.PI / 2}
        width={WIDTH}
        height={HALL_HEIGHT - 0.4}
        unlocked={jarsRead}
        color="#2C1810"
      />

      <CandleLight position={[centerX, 0.6, 0]} intensity={0.95} avatarRef={avatarRef} />
      <pointLight color="#9FC8FF" intensity={1.6} distance={13} decay={2} position={[centerX, 3, 0]} />
    </group>
  );
}
