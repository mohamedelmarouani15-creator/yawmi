"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import OctagonalColumn from "../shared/OctagonalColumn";
import LockedDoor from "../shared/LockedDoor";
import { WallSconce, MonumentalVase, CorridorRug, PotteryCluster, CushionBench, MashrabiyaScreen } from "../shared/CorridorDecor";
import { KenneyProp } from "../shared/KenneyProp";
import DistanceCulledLight from "../shared/DistanceCulledLight";
import { usePBRMaterial } from "@/lib/al-bayan/pbr-materials";

// Corridor en coordonnées MONDE (pas niché dans le repère tourné du Jardin)
// reliant l'ouverture taillée dans le mur "-Z local" du Jardin (monde
// X≈82.9, Z∈[-4,4] — cf. le calcul en commentaire dans CourTemoignage.tsx)
// au seuil du Majlis. Porte verrouillée tant que l'astrolabe du Jardin n'est
// pas résolu (voir puzzle-logic.ts / game-store.ts). Colonnades de chaque
// côté pour une perspective de couloir voûté, longueur ~18 unités (brief).
const JARDIN_OPENING_X = 82.9;
const MAJLIS_OPENING_X = 101.1;
const WIDTH = 8;
const HALL_HEIGHT = 6.4;

interface CorridorJardinMajlisProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  majlisUnlocked: boolean;
}

export default function CorridorJardinMajlis({ avatarRef, majlisUnlocked }: CorridorJardinMajlisProps) {
  const length = MAJLIS_OPENING_X - JARDIN_OPENING_X;
  const centerX = (JARDIN_OPENING_X + MAJLIS_OPENING_X) / 2;
  const floorMat = usePBRMaterial("terracotta", { repeat: [length / 4, WIDTH / 2], color: "#5A4326", roughnessIntensity: 0.8 });
  const wallMat = usePBRMaterial("plaster", { repeat: [length / 6, HALL_HEIGHT / 3], color: "#5C4A34" });

  const columnXs = useMemo(() => {
    const count = Math.max(2, Math.round(length / 9));
    return Array.from({ length: count }, (_, i) => JARDIN_OPENING_X + ((i + 0.5) / count) * length);
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

      {/* Colonnades — perspective de couloir voûté */}
      {columnXs.map((x, i) => (
        <group key={`col-${i}`}>
          <OctagonalColumn position={[x, 0, -WIDTH / 2 + 0.5]} height={HALL_HEIGHT - 0.4} shadows={false} />
          <OctagonalColumn position={[x, 0, WIDTH / 2 - 0.5]} height={HALL_HEIGHT - 0.4} shadows={false} />
        </group>
      ))}

      {/* Appliques en métal ciselé — une paire par colonne. */}
      {columnXs.map((x, i) => (
        <group key={`sconce-${i}`}>
          <WallSconce position={[x, HALL_HEIGHT * 0.5, -WIDTH / 2 + 0.15]} rotationY={0} />
          <WallSconce position={[x, HALL_HEIGHT * 0.5, WIDTH / 2 - 0.15]} rotationY={Math.PI} />
        </group>
      ))}
      <MonumentalVase position={[JARDIN_OPENING_X + 1.4, 0, -WIDTH / 2 + 0.9]} scale={1.3} />
      <MonumentalVase position={[MAJLIS_OPENING_X - 1.4, 0, WIDTH / 2 - 0.9]} scale={1.3} />
      <PotteryCluster position={[JARDIN_OPENING_X + 1.6, 0, WIDTH / 2 - 0.6]} />
      <PotteryCluster position={[MAJLIS_OPENING_X - 1.6, 0, -WIDTH / 2 + 0.6]} />
      <CushionBench position={[centerX - length * 0.18, 0, -WIDTH / 2 + 0.5]} />
      <MashrabiyaScreen position={[centerX + length * 0.18, HALL_HEIGHT * 0.42, WIDTH / 2 - 0.05]} rotationY={Math.PI} />
      <CorridorRug position={[centerX, 0.015, 0]} width={length * 0.4} length={WIDTH * 0.55} />
      <KenneyProp name="pottedPlant" position={[centerX, 0, -WIDTH / 2 + 0.7]} scale={2.2} />

      <mesh
        position={[centerX, HALL_HEIGHT - 0.4, 0]}
        rotation={[0, 0, Math.PI / 2]}
        userData={{ noCollide: true }}
      >
        <cylinderGeometry args={[WIDTH / 2, WIDTH / 2, length, 20, 1, true, 0, Math.PI]} />
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

      <CandleLight position={[centerX - length / 4, 0.6, 0]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[centerX + length / 4, 0.6, 0]} intensity={1.0} avatarRef={avatarRef} />
      <DistanceCulledLight color="#E8A33D" intensity={2.2} distance={16} decay={2} position={[centerX, 3, 0]} avatarRef={avatarRef} activeRadius={30} />
    </group>
  );
}
