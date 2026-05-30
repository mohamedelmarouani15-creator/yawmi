"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { avatarVert, avatarFrag } from "@/lib/escape3d/shaders";

interface Props {
  position: [number, number, number];
  rotation: number;
  color:    string;
  isLocal?: boolean;
}

export default function PlayerAvatar({ position, rotation, color, isLocal = false }: Props) {
  const groupRef   = useRef<THREE.Group>(null!);
  const bodyMatRef = useRef<THREE.ShaderMaterial>(null!);

  const col = new THREE.Color(color);

  useFrame(({ clock }) => {
    if (bodyMatRef.current) {
      bodyMatRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
    if (groupRef.current && isLocal) {
      // Légère oscillation verticale (marche)
      const t = clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(t * 6) * 0.015;
    }
  });

  const shaderProps = {
    vertexShader:   avatarVert,
    fragmentShader: avatarFrag,
    uniforms: {
      uColor: { value: col },
      uTime:  { value: 0 },
    },
    transparent: true,
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotation, 0]}
    >
      {/* Corps */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.55, 6, 12]} />
        <shaderMaterial ref={bodyMatRef} {...shaderProps} />
      </mesh>

      {/* Tête */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <shaderMaterial
          vertexShader={avatarVert}
          fragmentShader={avatarFrag}
          uniforms={{ uColor: { value: col }, uTime: { value: 0 } }}
          transparent
        />
      </mesh>

      {/* Halo au sol */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.34, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>

      {/* Étiquette couleur visible en multijoueur */}
      {!isLocal && (
        <mesh position={[0, 1.45, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  );
}
