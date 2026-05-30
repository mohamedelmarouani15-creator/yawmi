"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lanternVert, lanternFrag } from "@/lib/escape3d/shaders";

interface Props {
  position: [number, number, number];
  color?:   string;
  onTap?:   () => void;
  solved?:  boolean;
}

export default function Lantern({ position, color = "#D4AF37", onTap, solved = false }: Props) {
  const lightRef   = useRef<THREE.PointLight>(null!);
  const glassRef   = useRef<THREE.ShaderMaterial>(null!);
  const groupRef   = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);

  const col = new THREE.Color(color);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Scintillement de flamme
    if (lightRef.current) {
      const flicker = 0.85 + 0.15 * Math.sin(t * 7.3 + position[0])
                            + 0.05 * Math.sin(t * 13.7 + position[2]);
      lightRef.current.intensity = (solved ? 2.5 : 1.8) * flicker;
      lightRef.current.color.setHSL(0.1, 0.8, solved ? 0.7 : 0.55);
    }
    if (glassRef.current) {
      glassRef.current.uniforms.uTime.value  = t;
      glassRef.current.uniforms.uPulse.value = hovered ? 1.5 : 1.0;
    }
    // Légère rotation si survol
    if (groupRef.current && hovered) {
      groupRef.current.rotation.y = Math.sin(t * 1.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Poteau */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 1.6, 8]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Corps de la lanterne */}
      <group position={[0, 1.7, 0]}>
        {/* Vitraux — parois translucides avec shader arabesque */}
        {[0, 1, 2, 3].map(i => (
          <mesh
            key={i}
            rotation={[0, (i * Math.PI) / 2, 0]}
            position={[0.095 * Math.sin((i * Math.PI) / 2), 0, 0.095 * Math.cos((i * Math.PI) / 2)]}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onClick={onTap}
          >
            <planeGeometry args={[0.19, 0.26]} />
            <shaderMaterial
              ref={i === 0 ? glassRef : undefined}
              vertexShader={lanternVert}
              fragmentShader={lanternFrag}
              uniforms={{
                uTime:  { value: 0 },
                uColor: { value: col },
                uPulse: { value: 1.0 },
              }}
              transparent
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* Toit */}
        <mesh position={[0, 0.17, 0]}>
          <coneGeometry args={[0.15, 0.12, 4]} />
          <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Base */}
        <mesh position={[0, -0.17, 0]}>
          <boxGeometry args={[0.22, 0.04, 0.22]} />
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

        {/* Halo de résolution */}
        {solved && (
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.08} />
          </mesh>
        )}
      </group>

      {/* Indicateur interactif */}
      {!solved && onTap && (
        <mesh position={[0, 2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.12, 24]} />
          <meshBasicMaterial color={color} transparent opacity={hovered ? 0.9 : 0.5} />
        </mesh>
      )}
    </group>
  );
}
