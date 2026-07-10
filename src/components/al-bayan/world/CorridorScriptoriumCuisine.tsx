"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import OctagonalColumn from "../shared/OctagonalColumn";
import LockedDoor from "../shared/LockedDoor";
import { WallSconce, MonumentalVase, CorridorRug, PotteryCluster, CushionBench, MashrabiyaScreen } from "../shared/CorridorDecor";
import { KenneyProp } from "../shared/KenneyProp";
import DistanceCulledLight from "../shared/DistanceCulledLight";

// Passage secret en coordonnées MONDE reliant l'ouverture taillée dans le
// mur "-Z local" du Scriptorium (monde X≈-63.5, y=-1.1 — même niveau que le
// Scriptorium) à la Cuisine. Porte verrouillée tant que les 3 manuscrits ne
// sont pas replacés dans l'ordre chronologique.
const SCRIPTORIUM_OPENING_X = -63.5;
const CUISINE_OPENING_X = -81.5;
const WIDTH = 8;
const HALL_HEIGHT = 6;
const Y = -1.1;

interface CorridorScriptoriumCuisineProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  cuisineUnlocked: boolean;
}

export default function CorridorScriptoriumCuisine({ avatarRef, cuisineUnlocked }: CorridorScriptoriumCuisineProps) {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1E1810", roughness: 0.7, metalness: 0.04 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2E2416", roughness: 0.82 }), []);

  const length = SCRIPTORIUM_OPENING_X - CUISINE_OPENING_X;
  const centerX = (SCRIPTORIUM_OPENING_X + CUISINE_OPENING_X) / 2;

  const columnXs = useMemo(() => {
    const count = Math.max(2, Math.round(length / 9));
    return Array.from({ length: count }, (_, i) => CUISINE_OPENING_X + ((i + 0.5) / count) * length);
  }, [length]);

  return (
    <group>
      <mesh position={[centerX, Y, 0]} receiveShadow castShadow>
        <boxGeometry args={[length, 0.1, WIDTH]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      <mesh position={[centerX, Y + HALL_HEIGHT / 2 - 0.4, -WIDTH / 2]} receiveShadow castShadow>
        <boxGeometry args={[length, HALL_HEIGHT, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[centerX, Y + HALL_HEIGHT / 2 - 0.4, WIDTH / 2]} receiveShadow castShadow>
        <boxGeometry args={[length, HALL_HEIGHT, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {columnXs.map((x, i) => (
        <group key={`col-${i}`}>
          <OctagonalColumn position={[x, Y, -WIDTH / 2 + 0.5]} height={HALL_HEIGHT - 0.4} shadows={false} />
          <OctagonalColumn position={[x, Y, WIDTH / 2 - 0.5]} height={HALL_HEIGHT - 0.4} shadows={false} />
        </group>
      ))}
      {columnXs.map((x, i) => (
        <group key={`sconce-${i}`}>
          <WallSconce position={[x, Y + HALL_HEIGHT * 0.5, -WIDTH / 2 + 0.15]} rotationY={0} />
          <WallSconce position={[x, Y + HALL_HEIGHT * 0.5, WIDTH / 2 - 0.15]} rotationY={Math.PI} />
        </group>
      ))}
      <MonumentalVase position={[SCRIPTORIUM_OPENING_X - 1.3, Y, -WIDTH / 2 + 0.8]} scale={1.1} />
      <MonumentalVase position={[CUISINE_OPENING_X + 1.3, Y, WIDTH / 2 - 0.8]} scale={1.1} />
      <PotteryCluster position={[SCRIPTORIUM_OPENING_X - 1.5, Y, WIDTH / 2 - 0.55]} />
      <PotteryCluster position={[CUISINE_OPENING_X + 1.5, Y, -WIDTH / 2 + 0.55]} />
      <CushionBench position={[centerX - length * 0.15, Y, -WIDTH / 2 + 0.5]} />
      <MashrabiyaScreen position={[centerX + length * 0.15, Y + HALL_HEIGHT * 0.4, WIDTH / 2 - 0.05]} rotationY={Math.PI} />
      <CorridorRug position={[centerX, Y + 0.015, 0]} width={length * 0.4} length={WIDTH * 0.55} />
      <KenneyProp name="pottedPlant" position={[centerX, Y, -WIDTH / 2 + 0.7]} scale={2.2} />

      <mesh
        position={[centerX, Y + HALL_HEIGHT - 0.4, 0]}
        rotation={[0, 0, Math.PI / 2]}
        userData={{ noCollide: true }}
      >
        <cylinderGeometry args={[WIDTH / 2, WIDTH / 2, length, 20, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#241C10" roughness={0.85} side={THREE.BackSide} />
      </mesh>

      <LockedDoor
        position={[SCRIPTORIUM_OPENING_X - 0.3, Y, 0]}
        rotationY={-Math.PI / 2}
        width={WIDTH}
        height={HALL_HEIGHT - 0.4}
        unlocked={cuisineUnlocked}
        color="#2C1810"
      />

      <CandleLight position={[centerX, Y + 0.6, 0]} intensity={1.0} avatarRef={avatarRef} />
      <DistanceCulledLight color="#D4954A" intensity={2.0} distance={14} decay={2} position={[centerX, Y + 3, 0]} avatarRef={avatarRef} activeRadius={30} />
    </group>
  );
}
