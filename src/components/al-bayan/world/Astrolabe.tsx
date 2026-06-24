"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Centerpiece du Sanctuaire — grand mécanisme d'astrolabe en laiton,
 * anneaux concaves imbriqués tournant lentement, adapté de
 * `ArmillarySphere` (maison-sagesse/scenes/QuestScience.tsx), agrandi et
 * sans interactivité (purement décoratif/atmosphérique ici).
 */
function Ring({ rx = 0, ry = 0, rz = 0, r = 1.1, tube = 0.04, material }: { rx?: number; ry?: number; rz?: number; r?: number; tube?: number; material: THREE.Material }) {
  return (
    <mesh rotation={[rx, ry, rz]} castShadow={false}>
      <torusGeometry args={[r, tube, 8, 48]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

interface AstrolabeProps {
  scale?: number;
}

export default function Astrolabe({ scale = 2.6 }: AstrolabeProps) {
  const outerRef = useRef<THREE.Group>(null);
  const middleRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const needleRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) outerRef.current.rotation.y = t * 0.07;
    if (middleRef.current) middleRef.current.rotation.x = t * 0.06;
    if (innerRef.current) innerRef.current.rotation.z = t * 0.05;
    if (needleRef.current) needleRef.current.rotation.y = t * 0.12;
  });

  const brassMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D4AF37",
        emissive: "#7A5A20",
        emissiveIntensity: 0.18,
        roughness: 0.28,
        metalness: 0.88,
      }),
    []
  );
  const standMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5C3D1A", roughness: 0.55, metalness: 0.5 }), []);

  return (
    <group scale={scale}>
      {/* Pied */}
      <mesh position={[0, -1.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 1.4, 10]} />
        <primitive object={standMat} attach="material" />
      </mesh>
      <mesh position={[0, -2.35, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.12, 12]} />
        <primitive object={standMat} attach="material" />
      </mesh>

      <group ref={outerRef}>
        <Ring rx={0} ry={0} rz={0} r={1.3} material={brassMat} />
        <Ring rx={0} ry={Math.PI / 3} rz={0} r={1.24} material={brassMat} />
        <Ring rx={0} ry={-Math.PI / 3} rz={0} r={1.24} material={brassMat} />
      </group>
      <group ref={middleRef}>
        <Ring rx={Math.PI / 4} ry={0} rz={0} r={1.02} material={brassMat} />
        <Ring rx={-Math.PI / 4} ry={0} rz={0} r={0.98} material={brassMat} />
      </group>
      <group ref={innerRef}>
        <Ring rx={0} ry={0} rz={Math.PI / 6} r={0.74} material={brassMat} />
        <Ring rx={0} ry={0} rz={-Math.PI / 6} r={0.7} material={brassMat} />
      </group>

      {/* Aiguilles fines (alidades) */}
      <group ref={needleRef}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.5, 0.018, 0.018]} />
          <primitive object={brassMat} attach="material" />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[1.5, 0.018, 0.018]} />
          <primitive object={brassMat} attach="material" />
        </mesh>
      </group>

      {/* Sphère céleste centrale */}
      <mesh>
        <sphereGeometry args={[0.42, 16, 12]} />
        <meshStandardMaterial color="#1B3A6B" emissive="#0A1A40" emissiveIntensity={0.5} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}
