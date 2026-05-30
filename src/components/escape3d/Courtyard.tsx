"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Courtyard() {
  const waterRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.position.y = 0.19 + Math.sin(clock.getElapsedTime() * 1.5) * 0.005;
    }
  });

  const W = 7;

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 0]} intensity={2} color="#D4AF37" />

      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, W]} />
        <meshStandardMaterial color="#1A5C3A" />
      </mesh>

      {/* Fontaine */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.0, 1.05, 0.3, 32]} />
        <meshStandardMaterial color="#C4B89A" />
      </mesh>

      {/* Mur Nord */}
      <mesh position={[0, 1.75, -3.5]}>
        <boxGeometry args={[7, 3.5, 0.22]} />
        <meshStandardMaterial color="#F0EAD8" />
      </mesh>
      {/* Mur Sud */}
      <mesh position={[0, 1.75, 3.5]}>
        <boxGeometry args={[7, 3.5, 0.22]} />
        <meshStandardMaterial color="#F0EAD8" />
      </mesh>
      {/* Mur Ouest */}
      <mesh position={[-3.5, 1.75, 0]}>
        <boxGeometry args={[0.22, 3.5, 7]} />
        <meshStandardMaterial color="#F0EAD8" />
      </mesh>
      {/* Mur Est */}
      <mesh position={[3.5, 1.75, 0]}>
        <boxGeometry args={[0.22, 3.5, 7]} />
        <meshStandardMaterial color="#F0EAD8" />
      </mesh>
    </group>
  );
}
