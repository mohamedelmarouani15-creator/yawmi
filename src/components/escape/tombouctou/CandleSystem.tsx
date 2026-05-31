"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 12 positions réparties : 3 tables + 4 nord + 4 sud + 1 chandelier
const CANDLE_POSITIONS: [number, number, number][] = [
  // Tables (zone centrale)
  [-1.2, 0.93,  0.0],
  [ 0.0, 0.93,  0.6],
  [ 1.2, 0.93, -0.4],
  // Étagères nord
  [-7.2, 0.42, -6.3],
  [-2.4, 0.42, -6.3],
  [ 2.4, 0.42, -6.3],
  [ 7.2, 0.42, -6.3],
  // Étagères sud
  [-7.2, 0.42,  6.3],
  [-2.4, 0.42,  6.3],
  [ 2.4, 0.42,  6.3],
  [ 7.2, 0.42,  6.3],
  // Chandelier suspendu (centre, hauteur)
  [ 0.0, 5.8,   0.0],
];

// Intensité de base différente par bougie (diversité visuelle)
const BASE_INTENSITY = [0.85, 0.75, 0.90, 0.70, 0.80, 0.88, 0.72, 0.83, 0.76, 0.87, 0.79, 0.95];

interface Props {
  tensionLevelRef: React.MutableRefObject<number>;
  isMobile?: boolean;
}

// Couleurs normale → tension
const COLOR_NORMAL  = new THREE.Color("#FF8C42");
const COLOR_TENSION = new THREE.Color("#FF2008");

export default function CandleSystem({ tensionLevelRef, isMobile = false }: Props) {
  // Sur mobile : 6 bougies (tables + chandelier), sinon 12
  const positions  = isMobile ? CANDLE_POSITIONS.slice(0, 7) : CANDLE_POSITIONS;
  const lightRefs = useRef<(THREE.PointLight | null)[]>([]);
  const flameRefs = useRef<(THREE.Mesh | null)[]>([]);
  const innerRefs = useRef<(THREE.Mesh | null)[]>([]);
  const lerpColor = new THREE.Color();

  useFrame(({ clock }) => {
    const t       = clock.getElapsedTime();
    const tension = tensionLevelRef.current;

    // Couleur interpolée selon tension
    lerpColor.lerpColors(COLOR_NORMAL, COLOR_TENSION, tension);

    lightRefs.current.forEach((light, i) => {
      if (!light) return;
      const base  = BASE_INTENSITY[i] ?? 0.8;
      const phase = i * 1.7;
      light.intensity = (base + tension * 0.3)
        + Math.sin(t * 3.5 + phase) * 0.25
        + (Math.random() - 0.5) * 0.05;
      light.color.copy(lerpColor);
    });
    flameRefs.current.forEach((flame, i) => {
      if (!flame) return;
      const phase = i * 1.7;
      flame.scale.y = 1 + Math.sin(t * 4.0 + phase) * 0.22;
      flame.rotation.z = Math.sin(t * 7.0 + phase) * 0.055;
      if ((flame.material as THREE.MeshBasicMaterial).color) {
        (flame.material as THREE.MeshBasicMaterial).color.copy(lerpColor);
      }
    });
    innerRefs.current.forEach((inner, i) => {
      if (!inner) return;
      const phase = i * 1.7;
      inner.scale.y = 1 + Math.sin(t * 4.5 + phase + 0.3) * 0.18;
    });
  });

  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Lumière point — pas d'ombre pour la performance mobile */}
          <pointLight
            ref={(el) => { lightRefs.current[i] = el; }}
            color="#FF8C42"
            intensity={BASE_INTENSITY[i] ?? 0.8}
            distance={i === 11 ? 6 : 3.2}  // chandelier porte plus loin
            decay={2}
            castShadow={false}
          />

          {/* Plateau de cire */}
          <mesh>
            <cylinderGeometry args={[0.058, 0.058, 0.008, 14]} />
            <meshStandardMaterial color="#7A5C38" metalness={0.25} roughness={0.7} />
          </mesh>

          {/* Cire */}
          <mesh position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.028, 0.032, 0.22, 10]} />
            <meshStandardMaterial color="#F0E8D0" roughness={0.85} />
          </mesh>

          {/* Flamme principale (cône orange) */}
          <mesh
            ref={(el) => { flameRefs.current[i] = el; }}
            position={[0, 0.245, 0]}
          >
            <coneGeometry args={[0.018, 0.085, 7]} />
            <meshBasicMaterial color="#FF7A20" />
          </mesh>

          {/* Cœur de flamme (plus brillant, plus petit) */}
          <mesh
            ref={(el) => { innerRefs.current[i] = el; }}
            position={[0, 0.24, 0]}
          >
            <coneGeometry args={[0.007, 0.045, 6]} />
            <meshBasicMaterial color="#FFE080" />
          </mesh>
        </group>
      ))}
    </>
  );
}
