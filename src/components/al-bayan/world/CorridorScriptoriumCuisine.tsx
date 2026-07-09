"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import LockedDoor from "../shared/LockedDoor";

// Passage secret en coordonnées MONDE reliant l'ouverture taillée dans le
// mur "-Z local" du Scriptorium (monde X≈-20.9, Z∈[-1.6,1.6], y=-0.6 — même
// niveau que le Scriptorium) à la Cuisine. Porte verrouillée tant que les 3
// manuscrits ne sont pas replacés dans l'ordre chronologique.
const SCRIPTORIUM_OPENING_X = -20.9;
const CUISINE_OPENING_X = -26.9;
const WIDTH = 3.2;
const HALL_HEIGHT = 3.4;
const Y = -0.6;

interface CorridorScriptoriumCuisineProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  cuisineUnlocked: boolean;
}

export default function CorridorScriptoriumCuisine({ avatarRef, cuisineUnlocked }: CorridorScriptoriumCuisineProps) {
  void avatarRef;
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1E1810", roughness: 0.7, metalness: 0.04 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2E2416", roughness: 0.82 }), []);

  const length = SCRIPTORIUM_OPENING_X - CUISINE_OPENING_X;
  const centerX = (SCRIPTORIUM_OPENING_X + CUISINE_OPENING_X) / 2;

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

      <mesh
        position={[centerX, Y + HALL_HEIGHT - 0.4, 0]}
        rotation={[0, 0, Math.PI / 2]}
        userData={{ noCollide: true }}
      >
        <cylinderGeometry args={[WIDTH / 2, WIDTH / 2, length, 16, 1, true, 0, Math.PI]} />
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

      <CandleLight position={[centerX, Y + 0.6, 0]} intensity={0.85} avatarRef={avatarRef} />
      <pointLight color="#D4954A" intensity={1.3} distance={7} decay={2} position={[centerX, Y + 2, 0]} />
    </group>
  );
}
