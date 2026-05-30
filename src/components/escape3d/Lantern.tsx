"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
  color?:   string;
  onTap?:   () => void;
  solved?:  boolean;
}

export default function Lantern({ position, color = "#D4AF37", onTap, solved = false }: Props) {
  const lightRef  = useRef<THREE.PointLight>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime();
      const flicker = 0.85 + 0.15 * Math.sin(t * 7.3 + position[0])
                           + 0.05 * Math.sin(t * 13.7);
      lightRef.current.intensity = (solved ? 2.5 : 1.8) * flicker;
    }
  });

  return (
    <group position={position}>
      {/* Poteau */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 1.6, 8]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.8} metalness={0.3} />
      </mesh>

      <group position={[0, 1.7, 0]}>
        {/* Corps lanterne */}
        <mesh
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={onTap}
          castShadow
        >
          <boxGeometry args={[0.2, 0.28, 0.2]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.55}
            roughness={0.1}
            metalness={0.1}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.4}
          />
        </mesh>

        {/* Toit */}
        <mesh position={[0, 0.2, 0]}>
          <coneGeometry args={[0.14, 0.12, 4]} />
          <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Source lumineuse */}
        <pointLight
          ref={lightRef}
          color={color}
          intensity={1.8}
          distance={5}
          decay={2}
          castShadow
          shadow-mapSize={[256, 256]}
        />
      </group>

      {/* Anneau indicateur interactif */}
      {!solved && onTap && (
        <mesh position={[0, 2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.13, 24]} />
          <meshBasicMaterial color={color} transparent opacity={hovered ? 0.9 : 0.4} />
        </mesh>
      )}

      {/* Halo résolu */}
      {solved && (
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.07} />
        </mesh>
      )}
    </group>
  );
}
