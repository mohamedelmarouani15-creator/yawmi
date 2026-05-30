"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Lantern from "./Lantern";

const WALL_COLOR  = "#F0EAD8";
const STONE_COLOR = "#C4B89A";
const WOOD_COLOR  = "#3D1F0A";
const FLOOR_COLOR = "#1A5C3A"; // vert profond en attendant le zellige

interface Props {
  onLanternTap?: () => void;
  puzzleSolved?: boolean;
}

function Wall({ position, rotation, width = 7 }: {
  position: [number, number, number];
  rotation: [number, number, number];
  width?: number;
}) {
  const H = 3.5;
  return (
    <group position={position} rotation={rotation}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[width, H, 0.22]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>
      {/* Corniche */}
      <mesh position={[0, H / 2 - 0.05, 0.08]}>
        <boxGeometry args={[width + 0.1, 0.18, 0.3]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.8} />
      </mesh>
      {/* Niches décoratives */}
      {[-2, 0, 2].map((x, i) => (
        <group key={i} position={[x, 0.6, 0.12]}>
          <mesh>
            <boxGeometry args={[0.55, 0.8, 0.08]} />
            <meshStandardMaterial color="#E8DFCA" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[0.45, 0.65, 0.04]} />
            <meshStandardMaterial color="#D4C8A8" roughness={1} />
          </mesh>
        </group>
      ))}
      {/* Poutres */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[(-2 + i) * (width / 5), H / 2 - 0.35, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
          <meshStandardMaterial color={WOOD_COLOR} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Fountain() {
  const waterRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      // Légère oscillation de la surface
      waterRef.current.position.y = 0.19 + Math.sin(clock.getElapsedTime() * 1.5) * 0.005;
    }
  });

  return (
    <group>
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[1.05, 1.1, 0.25, 48]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 48]} />
        <meshStandardMaterial color="#2E5B6E" roughness={0.3} />
      </mesh>
      {/* Eau */}
      <mesh ref={waterRef} position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.88, 48]} />
        <meshStandardMaterial
          color="#1a6b8a"
          transparent
          opacity={0.85}
          roughness={0.05}
          metalness={0.3}
        />
      </mesh>
      {/* Colonne */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.7} />
      </mesh>
      {/* Vasque */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.3, 0.22, 0.18, 24]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.65} />
      </mesh>
    </group>
  );
}

function OrangeTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.07, 1.2, 6]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.55, 10, 10]} />
        <meshStandardMaterial color="#1A5C2A" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, 1.3, 0.15]} castShadow>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshStandardMaterial color="#1E6B30" roughness={0.8} />
      </mesh>
      {[[0.25, 0.95, 0.2], [-0.2, 1.05, 0.3], [0.1, 1.35, -0.25]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#E8770A" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export default function Courtyard({ onLanternTap, puzzleSolved }: Props) {
  const W  = 7;
  const WH = 3.5;

  return (
    <group>
      {/* Ciel nocturne */}
      <mesh>
        <sphereGeometry args={[38, 24, 24]} />
        <meshBasicMaterial color="#080D20" side={THREE.BackSide} />
      </mesh>

      {/* Étoiles simples */}
      {Array.from({ length: 120 }, (_, i) => {
        const phi   = Math.acos(2 * ((i * 0.618033) % 1) - 1);
        const theta = 2 * Math.PI * ((i * 0.381966) % 1);
        const r = 36;
        return (
          <mesh key={i} position={[
            r * Math.sin(phi) * Math.cos(theta),
            Math.abs(r * Math.cos(phi)),
            r * Math.sin(phi) * Math.sin(theta),
          ]}>
            <sphereGeometry args={[0.06 + (i % 3) * 0.03, 4, 4]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        );
      })}

      {/* Lumières */}
      <ambientLight intensity={0.12} color="#1a2a4a" />
      <hemisphereLight args={["#1a3050", "#0A0F0D", 0.2]} />

      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, W]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.6} />
      </mesh>
      {/* Bordure sol */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[W * 0.5 - 0.01, W * 0.68, 4, 1, Math.PI / 4]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.85} />
      </mesh>

      {/* Murs */}
      <Wall position={[0, WH / 2, -W / 2]} rotation={[0, 0, 0]} />
      <Wall position={[0, WH / 2,  W / 2]} rotation={[0, Math.PI, 0]} />
      <Wall position={[-W / 2, WH / 2, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Wall position={[ W / 2, WH / 2, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Fontaine */}
      <Fountain />

      {/* Lanternes */}
      <Lantern position={[ 2.6, 0,  2.6]} color="#D4AF37" onTap={onLanternTap} solved={puzzleSolved} />
      <Lantern position={[-2.6, 0,  2.6]} color="#C4901A" />
      <Lantern position={[ 2.6, 0, -2.6]} color="#C4901A" />
      <Lantern position={[-2.6, 0, -2.6]} color="#B87A14" />

      {/* Orangers */}
      <OrangeTree position={[ 2.2, 0,  0  ]} />
      <OrangeTree position={[-2.2, 0,  0  ]} />
      <OrangeTree position={[ 0,   0,  2.2]} />
      <OrangeTree position={[ 0,   0, -2.2]} />
    </group>
  );
}
