"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TOMBOUCTOU_CLUES, type TombouktouClue } from "@/lib/escape3d/tombouctou-puzzles";

function ClueOrb({ clue, index }: { clue: TombouktouClue; index: number }) {
  const meshRef  = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const phase    = index * 1.13;
  const baseY    = clue.position[1];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;
    const y = baseY + Math.sin(t * 1.4) * 0.12;
    if (meshRef.current) {
      meshRef.current.position.y = y;
      meshRef.current.rotation.y = t * 0.8;
      meshRef.current.rotation.x = t * 0.3;
    }
    if (lightRef.current) {
      lightRef.current.position.y = y;
      lightRef.current.intensity  = 0.45 + Math.sin(t * 2.6 + 0.4) * 0.12;
    }
  });

  return (
    <group position={[clue.position[0], 0, clue.position[2]]}>
      <pointLight ref={lightRef} color="#D4AF37" intensity={0.45} distance={2.4} decay={2} />
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial
          color="#D4AF37"
          emissive="#D4AF37"
          emissiveIntensity={1.4}
          metalness={0.5}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

export default function ClueObjects({ discoveredClues }: { discoveredClues: string[] }) {
  return (
    <>
      {TOMBOUCTOU_CLUES
        .filter(c => !discoveredClues.includes(c.id))
        .map((clue, i) => (
          <ClueOrb key={clue.id} clue={clue} index={i} />
        ))}
    </>
  );
}
