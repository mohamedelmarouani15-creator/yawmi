"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import LockedDoor from "../shared/LockedDoor";

// Corridor en coordonnées MONDE (pas niché dans le repère tourné du Jardin)
// reliant l'ouverture taillée dans le mur "-Z local" du Jardin (monde
// X≈21.9, Z∈[-1.6,1.6] — cf. le calcul en commentaire dans CourTemoignage.tsx)
// au seuil du Majlis. Porte verrouillée tant que l'astrolabe du Jardin n'est
// pas résolu (voir puzzle-logic.ts / game-store.ts).
const JARDIN_OPENING_X = 21.9;
const MAJLIS_OPENING_X = 27.9;
const WIDTH = 3.2;
const HALL_HEIGHT = 3.6;

interface CorridorJardinMajlisProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  majlisUnlocked: boolean;
}

export default function CorridorJardinMajlis({ avatarRef, majlisUnlocked }: CorridorJardinMajlisProps) {
  void avatarRef; // réservé pour un futur badge de proximité sur la porte
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#241B10", roughness: 0.7, metalness: 0.05 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#352818", roughness: 0.8 }), []);

  const length = MAJLIS_OPENING_X - JARDIN_OPENING_X;
  const centerX = (JARDIN_OPENING_X + MAJLIS_OPENING_X) / 2;

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

      <mesh
        position={[centerX, HALL_HEIGHT - 0.4, 0]}
        rotation={[0, 0, Math.PI / 2]}
        userData={{ noCollide: true }}
      >
        <cylinderGeometry args={[WIDTH / 2, WIDTH / 2, length, 16, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#2A2014" roughness={0.85} side={THREE.BackSide} />
      </mesh>

      <LockedDoor
        position={[JARDIN_OPENING_X + 0.3, 0, 0]}
        rotationY={Math.PI / 2}
        width={WIDTH}
        height={HALL_HEIGHT - 0.4}
        unlocked={majlisUnlocked}
        color="#3D2A10"
      />

      <CandleLight position={[centerX, 0.6, 0]} intensity={0.9} avatarRef={avatarRef} />
      <pointLight color="#E8A33D" intensity={1.4} distance={7} decay={2} position={[centerX, 2, 0]} />
    </group>
  );
}
