"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Lantern from "./Lantern";

interface Props {
  onLanternTap?: () => void;
  puzzleSolved?: boolean;
}

function StarField() {
  // 80 étoiles distribuées sur la voûte céleste
  const stars = Array.from({ length: 80 }, (_, i) => {
    const phi   = Math.acos(2 * ((i * 0.618033) % 1) - 1);
    const theta = 2 * Math.PI * ((i * 0.381966) % 1);
    const r     = 35;
    return {
      key: i,
      pos: [
        r * Math.sin(phi) * Math.cos(theta),
        Math.abs(r * Math.cos(phi)) + 2,
        r * Math.sin(phi) * Math.sin(theta),
      ] as [number, number, number],
      size: 0.05 + (i % 4) * 0.02,
    };
  });

  return (
    <>
      {stars.map(s => (
        <mesh key={s.key} position={s.pos}>
          <sphereGeometry args={[s.size, 4, 4]} />
          <meshBasicMaterial color="#DDEEFF" />
        </mesh>
      ))}
    </>
  );
}

function Fountain() {
  const waterRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (waterRef.current)
      waterRef.current.position.y = 0.20 + Math.sin(clock.getElapsedTime() * 1.5) * 0.006;
  });

  return (
    <group>
      {/* Bassin */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[1.05, 1.1, 0.26, 40]} />
        <meshStandardMaterial color="#C4B89A" roughness={0.7} />
      </mesh>
      {/* Fond bassin */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 40]} />
        <meshStandardMaterial color="#2E5B6E" />
      </mesh>
      {/* Eau */}
      <mesh ref={waterRef} position={[0, 0.20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.88, 40]} />
        <meshStandardMaterial color="#2a7a9e" transparent opacity={0.88} roughness={0.05} metalness={0.2} />
      </mesh>
      {/* Colonne */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 0.9, 8]} />
        <meshStandardMaterial color="#C4B89A" roughness={0.7} />
      </mesh>
      {/* Vasque */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.28, 0.2, 0.18, 24]} />
        <meshStandardMaterial color="#C4B89A" roughness={0.65} />
      </mesh>
    </group>
  );
}

function Wall({ pos, rot }: { pos: [number, number, number]; rot: [number, number, number] }) {
  const W = 7; const H = 3.6;
  return (
    <group position={pos} rotation={rot}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, 0.22]} />
        <meshStandardMaterial color="#EDE5D0" roughness={0.88} />
      </mesh>
      {/* Corniche */}
      <mesh position={[0, H / 2 + 0.05, 0.05]}>
        <boxGeometry args={[W + 0.1, 0.2, 0.28]} />
        <meshStandardMaterial color="#C8BA9A" roughness={0.8} />
      </mesh>
      {/* 3 niches */}
      {[-2.1, 0, 2.1].map((x, i) => (
        <group key={i} position={[x, 0.55, 0.12]}>
          <mesh>
            <boxGeometry args={[0.6, 0.85, 0.09]} />
            <meshStandardMaterial color="#E5DCC5" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[0.48, 0.68, 0.04]} />
            <meshStandardMaterial color="#D8CCAC" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function OrangeTree({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.07, 1.3, 6]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.52, 10, 10]} />
        <meshStandardMaterial color="#1A5C2A" roughness={0.8} />
      </mesh>
      <mesh position={[0.22, 1.32, 0.15]} castShadow>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#1E6B30" roughness={0.8} />
      </mesh>
      {([[0.26, 0.92, 0.22], [-0.18, 1.02, 0.28], [0.1, 1.38, -0.22]] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#E8770A" roughness={0.5} emissive="#E8770A" emissiveIntensity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export default function Courtyard({ onLanternTap, puzzleSolved }: Props) {
  const W = 7; const H = 3.6;

  return (
    <group>
      {/* Ciel */}
      <mesh>
        <sphereGeometry args={[38, 20, 20]} />
        <meshBasicMaterial color="#06091A" side={THREE.BackSide} />
      </mesh>
      <StarField />

      {/* Éclairage ambiant nuit */}
      <ambientLight intensity={0.18} color="#2a3560" />
      <hemisphereLight args={["#1a2850", "#080D10", 0.25]} />

      {/* Sol zellige (vert profond) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, W]} />
        <meshStandardMaterial color="#0E4A2A" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Bordure pierre */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[W * 0.5 - 0.02, W * 0.67, 4, 1, Math.PI / 4]} />
        <meshStandardMaterial color="#B8AA88" roughness={0.82} />
      </mesh>

      {/* Murs */}
      <Wall pos={[0, H / 2, -W / 2]} rot={[0, 0, 0]} />
      <Wall pos={[0, H / 2,  W / 2]} rot={[0, Math.PI, 0]} />
      <Wall pos={[-W / 2, H / 2, 0]} rot={[0,  Math.PI / 2, 0]} />
      <Wall pos={[ W / 2, H / 2, 0]} rot={[0, -Math.PI / 2, 0]} />

      {/* Fontaine */}
      <Fountain />

      {/* Lanternes */}
      <Lantern position={[ 2.6, 0,  2.6]} color="#D4AF37" onTap={onLanternTap} solved={puzzleSolved} />
      <Lantern position={[-2.6, 0,  2.6]} color="#C4901A" />
      <Lantern position={[ 2.6, 0, -2.6]} color="#C4901A" />
      <Lantern position={[-2.6, 0, -2.6]} color="#B87A14" />

      {/* Orangers */}
      <OrangeTree pos={[ 2.2, 0,  0  ]} />
      <OrangeTree pos={[-2.2, 0,  0  ]} />
      <OrangeTree pos={[ 0,   0,  2.2]} />
      <OrangeTree pos={[ 0,   0, -2.2]} />
    </group>
  );
}
