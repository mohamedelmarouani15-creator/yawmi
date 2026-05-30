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
  const glowRef   = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const col = new THREE.Color(color);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flicker = 0.82 + 0.18 * Math.sin(t * 7.1 + position[0] * 3)
                         + 0.06 * Math.sin(t * 17.3);
    if (lightRef.current) {
      lightRef.current.intensity = (solved ? 3.5 : 2.4) * flicker;
    }
    if (glowRef.current) {
      const s = (solved ? 1.4 : 1.0) * (0.9 + 0.1 * Math.sin(t * 4.2));
      glowRef.current.scale.setScalar(s);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.12 * flicker;
    }
  });

  return (
    <group position={position}>
      {/* Poteau */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 1.6, 8]} />
        <meshStandardMaterial color="#1a0e04" roughness={0.7} metalness={0.5} />
      </mesh>

      <group position={[0, 1.72, 0]}>
        {/* Corps — translucide avec glow */}
        <mesh
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={onTap}
          castShadow
        >
          <boxGeometry args={[0.18, 0.26, 0.18]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 1.8 : 1.2}
            transparent
            opacity={0.6}
            roughness={0.05}
            metalness={0.0}
          />
        </mesh>

        {/* Glow sphere autour de la lanterne */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.42, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.BackSide} />
        </mesh>

        {/* Toit métal */}
        <mesh position={[0, 0.17, 0]} castShadow>
          <coneGeometry args={[0.13, 0.11, 4]} />
          <meshStandardMaterial color="#5C3A00" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Base métal */}
        <mesh position={[0, -0.16, 0]}>
          <boxGeometry args={[0.2, 0.04, 0.2]} />
          <meshStandardMaterial color="#5C3A00" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Flamme / lumière */}
        <pointLight
          ref={lightRef}
          color={color}
          intensity={2.4}
          distance={6}
          decay={2}
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-near={0.1}
          shadow-camera-far={8}
        />

        {/* Indicateur interactif (anneau pulsant) */}
        {!solved && onTap && (
          <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.16, 24]} />
            <meshBasicMaterial color={color} transparent opacity={hovered ? 1.0 : 0.55} />
          </mesh>
        )}
      </group>
    </group>
  );
}
