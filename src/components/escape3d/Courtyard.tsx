"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { zelligenVert, zelligeFrag, waterVert, waterFrag, skyVert, skyFrag } from "@/lib/escape3d/shaders";
import Lantern from "./Lantern";

const WALL_COLOR   = "#F0EAD8";
const STUCCO_COLOR = "#E8DFCA";
const WOOD_COLOR   = "#3D1F0A";
const STONE_COLOR  = "#C4B89A";

interface Props {
  onLanternTap?: () => void;
  puzzleSolved?: boolean;
}

function Wall({ position, rotation, width = 7, height = 3.5 }: {
  position: [number, number, number];
  rotation: [number, number, number];
  width?: number;
  height?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Mur principal */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[width, height, 0.22]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>

      {/* Arche centrale */}
      <mesh position={[0, -0.3, 0.12]}>
        <boxGeometry args={[1.2, 2.4, 0.05]} />
        <meshStandardMaterial color={STUCCO_COLOR} roughness={0.95} />
      </mesh>

      {/* Corniche supérieure */}
      <mesh position={[0, height / 2 - 0.05, 0.08]}>
        <boxGeometry args={[width + 0.1, 0.18, 0.3]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.8} />
      </mesh>

      {/* Niches décoratives (3 par mur) */}
      {[-2, 0, 2].map((x, i) => (
        <group key={i} position={[x, 0.6, 0.12]}>
          <mesh>
            <boxGeometry args={[0.55, 0.8, 0.08]} />
            <meshStandardMaterial color={STUCCO_COLOR} roughness={0.95} />
          </mesh>
          {/* Ombre intérieure niche */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.45, 0.65, 0.04]} />
            <meshStandardMaterial color="#D4C8A8" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* Poutres bois (riad style) */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[(-2 + i) * (width / 5), height / 2 - 0.35, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} rotation-x={Math.PI / 2} />
          <meshStandardMaterial color={WOOD_COLOR} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Fountain() {
  const waterRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Bassin extérieur */}
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[1.05, 1.1, 0.25, 48]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.7} />
      </mesh>

      {/* Fond du bassin (zellige bleu) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 48]} />
        <meshStandardMaterial color="#2E5B6E" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Surface de l'eau */}
      <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.88, 48]} />
        <shaderMaterial
          ref={waterRef}
          vertexShader={waterVert}
          fragmentShader={waterFrag}
          uniforms={{ uTime: { value: 0 } }}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Colonne centrale */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.7} />
      </mesh>

      {/* Vasque supérieure */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.3, 0.22, 0.18, 24]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.65} />
      </mesh>

      {/* Motif zellige autour du bassin */}
      <mesh position={[0, 0.145, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.92, 1.04, 48]} />
        <meshStandardMaterial color="#7BA39A" roughness={0.4} />
      </mesh>
    </group>
  );
}

function OrangeTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Tronc */}
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.07, 1.2, 6]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
      </mesh>
      {/* Feuillage principal */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.55, 10, 10]} />
        <meshStandardMaterial color="#1A5C2A" roughness={0.8} />
      </mesh>
      {/* Feuillage secondaire */}
      <mesh position={[0.2, 1.3, 0.15]} castShadow>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshStandardMaterial color="#1E6B30" roughness={0.8} />
      </mesh>
      <mesh position={[-0.22, 1.25, -0.1]} castShadow>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#175225" roughness={0.8} />
      </mesh>
      {/* Oranges */}
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
  const skyMatRef = useRef<THREE.ShaderMaterial>(null!);
  const floorMatRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (skyMatRef.current)   skyMatRef.current.uniforms.uTime.value   = t;
    if (floorMatRef.current) floorMatRef.current.uniforms.uTime.value = t;
  });

  // Étoiles de zellige sur le sol — matériau partagé
  const zellMatUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  const W = 7;    // largeur cour
  const WH = 3.5; // hauteur murs

  return (
    <group>
      {/* ── Ciel ──────────────────────────────────────────────── */}
      <mesh>
        <sphereGeometry args={[40, 32, 32]} />
        <shaderMaterial
          ref={skyMatRef}
          vertexShader={skyVert}
          fragmentShader={skyFrag}
          uniforms={{ uTime: { value: 0 } }}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ── Lumière ambiante nuit ──────────────────────────────── */}
      <ambientLight intensity={0.08} color="#1a2a4a" />
      <hemisphereLight args={["#0a1a30", "#0A0F0D", 0.15]} />

      {/* ── Sol zellige ───────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, W, 1, 1]} />
        <shaderMaterial
          ref={floorMatRef}
          vertexShader={zelligenVert}
          fragmentShader={zelligeFrag}
          uniforms={zellMatUniforms}
        />
      </mesh>

      {/* ── Murs (4 côtés) ───────────────────────────────────── */}
      <Wall position={[0, WH / 2, -W / 2]} rotation={[0, 0, 0]} />
      <Wall position={[0, WH / 2,  W / 2]} rotation={[0, Math.PI, 0]} />
      <Wall position={[-W / 2, WH / 2, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Wall position={[ W / 2, WH / 2, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* ── Plafond ouvert — galerie haute ───────────────────── */}
      <mesh position={[0, WH, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[W * 0.42, W * 0.7, 4]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Fontaine centrale ─────────────────────────────────── */}
      <Fountain />

      {/* ── Lanternes aux coins ───────────────────────────────── */}
      <Lantern
        position={[2.6, 0, 2.6]}
        color="#D4AF37"
        onTap={onLanternTap}
        solved={puzzleSolved}
      />
      <Lantern position={[-2.6, 0,  2.6]} color="#C4901A" />
      <Lantern position={[ 2.6, 0, -2.6]} color="#C4901A" />
      <Lantern position={[-2.6, 0, -2.6]} color="#B87A14" />

      {/* ── Orangers ──────────────────────────────────────────── */}
      <OrangeTree position={[ 2.2, 0,  0  ]} />
      <OrangeTree position={[-2.2, 0,  0  ]} />
      <OrangeTree position={[ 0,   0,  2.2]} />
      <OrangeTree position={[ 0,   0, -2.2]} />

      {/* ── Carrelage périphérique (autour du zellige) ─────────── */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[W * 0.5 - 0.01, W * 0.7, 4, 1, Math.PI / 4]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.85} />
      </mesh>
    </group>
  );
}
