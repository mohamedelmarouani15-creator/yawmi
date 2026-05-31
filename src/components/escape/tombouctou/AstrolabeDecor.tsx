"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BRASS = "#C8A84B";
const BRASS_DARK = "#8A6A2A";

export default function AstrolabeDecor() {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.y = t * 0.08;
    if (ring1Ref.current) ring1Ref.current.rotation.x = t * 0.14;
    if (ring2Ref.current) ring2Ref.current.rotation.z = t * 0.11;
    if (ring3Ref.current) ring3Ref.current.rotation.x = -t * 0.09;
  });

  return (
    // Positionné sur la table centrale, légèrement en avant
    <group position={[0, 1.02, -1.2]}>

      {/* Piédestal */}
      <mesh position={[0, -0.72, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 1.3, 12]} />
        <meshStandardMaterial color="#3D2B1A" roughness={0.95} />
      </mesh>
      {/* Base du piédestal */}
      <mesh position={[0, -1.35, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.04, 16]} />
        <meshStandardMaterial color={BRASS_DARK} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Anneau extérieur */}
      <group ref={groupRef}>
        <mesh ref={ring1Ref} castShadow>
          <torusGeometry args={[0.52, 0.022, 10, 56]} />
          <meshStandardMaterial
            color={BRASS} metalness={0.75} roughness={0.28}
            emissive={BRASS} emissiveIntensity={0.08}
          />
        </mesh>

        {/* Anneau médian */}
        <mesh ref={ring2Ref} rotation={[0, Math.PI/5, 0]} castShadow>
          <torusGeometry args={[0.365, 0.018, 10, 56]} />
          <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.28} />
        </mesh>

        {/* Anneau intérieur */}
        <mesh ref={ring3Ref} rotation={[Math.PI/2, 0, Math.PI/7]} castShadow>
          <torusGeometry args={[0.22, 0.014, 10, 48]} />
          <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.28} />
        </mesh>

        {/* Centre — sphère brillante */}
        <mesh castShadow>
          <sphereGeometry args={[0.072, 20, 20]} />
          <meshStandardMaterial
            color={BRASS} metalness={0.85} roughness={0.18}
            emissive={BRASS} emissiveIntensity={0.15}
          />
        </mesh>

        {/* Petites marques graduées sur l'anneau ext */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a)*0.52, Math.sin(a)*0.52, 0]}>
              <boxGeometry args={[0.008, 0.03, 0.008]} />
              <meshStandardMaterial color={BRASS_DARK} metalness={0.5} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
