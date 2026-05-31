"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SessionPlayer } from "@/hooks/useTombouctouSession";

interface Props {
  players:  SessionPlayer[];
  myUserId: string | null;
}

// Avatar d'un autre joueur : sphère colorée + lumière douce
function PlayerAvatar({ player }: { player: SessionPlayer }) {
  const meshRef  = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Légère animation flottante
    if (meshRef.current) {
      meshRef.current.position.y = 1.9 + Math.sin(t * 1.2 + player.role) * 0.06;
    }
    // Pulse lumière
    if (lightRef.current) {
      lightRef.current.intensity = 0.18 + Math.sin(t * 2 + player.role) * 0.06;
    }
  });

  const color = new THREE.Color(player.color);

  return (
    <group position={[player.pos.x, 0, player.pos.z]}>
      {/* Corps */}
      <mesh ref={meshRef} position={[0, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Halo sous le joueur */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lumière douce */}
      <pointLight
        ref={lightRef}
        color={player.color}
        intensity={0.18}
        distance={2}
        decay={2}
        castShadow={false}
        position={[0, 1.9, 0]}
      />
    </group>
  );
}

export default function OtherPlayers({ players, myUserId }: Props) {
  return (
    <>
      {players
        .filter(p => p.userId !== myUserId)
        .map(p => <PlayerAvatar key={p.userId} player={p} />)
      }
    </>
  );
}
