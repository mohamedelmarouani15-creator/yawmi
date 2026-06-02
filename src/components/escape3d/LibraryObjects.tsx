"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Définition des 4 objets ─────────────────────────────────────────
export interface LibraryObjectDef {
  id:       string;
  lockId:   number;
  label:    string;
  icon:     string;
  position: [number, number, number];
}

export const LIBRARY_OBJECTS: LibraryObjectDef[] = [
  { id: "manuscrit",  lockId: 0, label: "Manuscrit Bambara",      icon: "📜", position: [ 0,   0, -4.5] },
  { id: "traite",     lockId: 1, label: "Traité de jurisprudence", icon: "📖", position: [ 3.5, 0,  0  ] },
  { id: "enluminure", lockId: 2, label: "Enluminure sudanaise",    icon: "✍️", position: [-3.5, 0,  0  ] },
  { id: "songhai",    lockId: 3, label: "Tapis Songhaï",           icon: "🪣", position: [ 0,   0,  4.5] },
];

export const PROX_THRESHOLD = 1.6;

// ── Beam de connexion — rendu à la racine (coords monde) ────────────
export function ConnectionBeam({ tapisPos, worldTo }: {
  tapisPos: React.RefObject<THREE.Vector3>;
  worldTo:  [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef  = useRef<THREE.MeshBasicMaterial>(null!);
  const toV     = useRef(new THREE.Vector3(worldTo[0], worldTo[1] + 0.5, worldTo[2]));

  useFrame(({ clock }) => {
    if (!meshRef.current || !tapisPos.current) return;
    const from  = tapisPos.current;
    const pulse = Math.sin(clock.getElapsedTime() * 5) * 0.15 + 0.25;

    const mx   = (from.x + toV.current.x) / 2;
    const my   = (from.y + 0.1 + toV.current.y) / 2;
    const mz   = (from.z + toV.current.z) / 2;
    const dist = from.distanceTo(toV.current);

    meshRef.current.position.set(mx, my, mz);
    meshRef.current.scale.set(1, dist, 1);
    meshRef.current.lookAt(toV.current);
    meshRef.current.rotateX(Math.PI / 2);
    if (matRef.current) matRef.current.opacity = pulse;
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.012, 0.012, 1, 5]} />
      <meshBasicMaterial ref={matRef} color="#D4AF37" transparent opacity={0.25} depthWrite={false} />
    </mesh>
  );
}

// ── Halo + lumière par objet (espace local du group parent) ─────────
function ObjectGlow({ isNear, isSolved }: { isNear: boolean; isSolved: boolean }) {
  const ringRef  = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t     = clock.getElapsedTime();
    const pulse = isNear
      ? Math.sin(t * 3.8) * 0.5 + 0.5
      : Math.sin(t * 1.2) * 0.5 + 0.5;

    if (ringRef.current) {
      const s = isNear ? 1.0 + pulse * 0.22 : 0.9 + pulse * 0.08;
      ringRef.current.scale.setScalar(s);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isSolved
        ? 0.4 + pulse * 0.25
        : (isNear ? 0.55 + pulse * 0.4 : 0.10 + pulse * 0.1);
    }
    if (lightRef.current) {
      lightRef.current.intensity = isSolved
        ? 1.0 + pulse * 0.5
        : (isNear ? 2.8 + pulse * 2.2 : 0.35 + pulse * 0.25);
    }
  });

  const color = isSolved ? "#4ade80" : "#D4AF37";
  return (
    <>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[0.25, 0.62, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={0.35} distance={4} decay={2} />
    </>
  );
}

// ── Meshes individuels ──────────────────────────────────────────────
function ManuscritMesh({ solved }: { solved: boolean }) {
  return (
    <>
      <mesh position={[0, 0.18, 0.02]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.36, 8]} />
        <meshStandardMaterial color="#3A2010" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.38, 0]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.36, 0.04, 0.3]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.42, -0.02]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[0.28, 0.21]} />
        <meshStandardMaterial
          color={solved ? "#c8f5a0" : "#F0DEB0"}
          emissive={solved ? "#1a6b1a" : "#5C4010"}
          emissiveIntensity={solved ? 0.4 : 0.12}
          roughness={0.9} side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

function TraiteMesh({ solved }: { solved: boolean }) {
  return (
    <>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.20, 0.24, 8]} />
        <meshStandardMaterial color="#2A1A0A" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.28, 0]} rotation={[0, 0.4, 0.08]} castShadow>
        <boxGeometry args={[0.20, 0.26, 0.055]} />
        <meshStandardMaterial
          color={solved ? "#2E7C2E" : "#1A3A6B"}
          emissive={solved ? "#0a3a0a" : "#050e1f"}
          emissiveIntensity={0.15} roughness={0.55} metalness={0.08}
        />
      </mesh>
      <mesh position={[0, 0.3, 0.032]} rotation={[0, 0.4, 0.08]}>
        <planeGeometry args={[0.14, 0.03]} />
        <meshBasicMaterial color={solved ? "#4ade80" : "#D4AF37"} transparent opacity={0.6} />
      </mesh>
    </>
  );
}

function EnluminureMesh({ solved }: { solved: boolean }) {
  return (
    <>
      <mesh position={[0, 0.22, -0.02]} castShadow>
        <boxGeometry args={[0.055, 0.44, 0.055]} />
        <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.38, 0.32, 0.042]} />
        <meshStandardMaterial color="#3A2010" roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.52, 0.024]}>
        <planeGeometry args={[0.30, 0.24]} />
        <meshStandardMaterial
          color={solved ? "#a0f5c0" : "#F5E4B0"}
          emissive={solved ? "#1a6b3a" : "#6B4A00"}
          emissiveIntensity={solved ? 0.5 : 0.25}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0.52, 0.026]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshBasicMaterial color={solved ? "#4ade80" : "#D4AF37"} transparent opacity={0.45} />
      </mesh>
    </>
  );
}

function TapisSonghaiMesh({ solved }: { solved: boolean }) {
  return (
    <>
      <mesh position={[0, 0.13, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.38, 16]} />
        <meshStandardMaterial color={solved ? "#2E6B2E" : "#7A3B15"} roughness={0.72} />
      </mesh>
      {([-0.10, 0.10] as const).map(x => (
        <mesh key={x} position={[x, 0.13, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.135, 0.009, 6, 20]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.4} metalness={0.2} />
        </mesh>
      ))}
    </>
  );
}

// ── Export principal ────────────────────────────────────────────────
interface Props {
  nearId:      string | null;
  solvedLocks: number[];
  tapisPos:    React.RefObject<THREE.Vector3>;
}

export default function LibraryObjects({ nearId, solvedLocks, tapisPos }: Props) {
  const nearObj    = LIBRARY_OBJECTS.find(o => o.id === nearId) ?? null;
  const nearSolved = nearObj ? solvedLocks.includes(nearObj.lockId) : false;

  return (
    <>
      {LIBRARY_OBJECTS.map(obj => {
        const solved = solvedLocks.includes(obj.lockId);
        const near   = nearId === obj.id;
        return (
          <group key={obj.id} position={obj.position}>
            {obj.id === "manuscrit"  && <ManuscritMesh    solved={solved} />}
            {obj.id === "traite"     && <TraiteMesh       solved={solved} />}
            {obj.id === "enluminure" && <EnluminureMesh   solved={solved} />}
            {obj.id === "songhai"    && <TapisSonghaiMesh solved={solved} />}
            <ObjectGlow isNear={near} isSolved={solved} />
          </group>
        );
      })}

      {/* Beam à la racine (coords monde pures) */}
      {nearObj && !nearSolved && (
        <ConnectionBeam tapisPos={tapisPos} worldTo={nearObj.position} />
      )}
    </>
  );
}
