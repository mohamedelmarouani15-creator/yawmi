"use client";

import { useMemo } from "react";
import * as THREE from "three";
import IslamicArch from "../../maison-sagesse/shared/IslamicArch";
import OctagonalColumn from "../shared/OctagonalColumn";
import EnigmaTemoignage from "../scenes/EnigmaTemoignage";

const SIZE = 14;
const H = 9;

/** Dalles de marbre blanc/vert alternées — mêmes tuiles partagées, pas de texture. */
function MarbleFloor() {
  const white = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E8E4DA", roughness: 0.12, metalness: 0.22 }), []);
  const green = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0E4636", roughness: 0.1, metalness: 0.26 }), []);
  const tile = 1.75;
  const cols = Math.ceil(SIZE / tile);

  const tiles = useMemo(() => {
    const arr: { x: number; z: number; even: boolean }[] = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < cols; j++) {
        arr.push({ x: -SIZE / 2 + tile / 2 + i * tile, z: -SIZE / 2 + tile / 2 + j * tile, even: (i + j) % 2 === 0 });
      }
    }
    return arr;
  }, [cols]);

  return (
    <group>
      {tiles.map((t, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[t.x, 0, t.z]} receiveShadow>
          <planeGeometry args={[tile, tile]} />
          <primitive object={t.even ? white : green} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/** Bassin d'eau polygonal poli, au centre de la cour. */
function Pool() {
  const waterMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0B1A3A", roughness: 0.05, metalness: 0.3 }),
    []
  );
  return (
    <group position={[0, 0.015, 2.6]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.6, 10]} />
        <primitive object={waterMat} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[1.58, 1.78, 10]} />
        <meshStandardMaterial color="#C9BFA8" roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Banquette en cuir sombre. */
function LeatherBench({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.6, 0.16, 0.55]} />
        <meshStandardMaterial color="#241410" roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.5, -0.22]} castShadow>
        <boxGeometry args={[1.6, 0.5, 0.1]} />
        <meshStandardMaterial color="#241410" roughness={0.55} />
      </mesh>
    </group>
  );
}

/** Pupitre + parchemin scellé de cire rouge. */
function SealedLectern({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.55, 0]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.06, 0.4]} />
        <meshStandardMaterial color="#3D2410" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.5, 8]} />
        <meshStandardMaterial color="#241410" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.62, 0.06]} rotation={[-0.5, 0, 0]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial color="#D4B896" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.66, 0.13]} rotation={[-0.5, 0, 0]}>
        <circleGeometry args={[0.045, 10]} />
        <meshStandardMaterial color="#7A1F1F" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}

/**
 * Zone 2 — La Cour du Témoignage (Quête de la Balance). Marbre blanc/vert,
 * bassin poli, autel + balance de bronze (EnigmaTemoignage repositionné,
 * murs propres retirés), banquettes de cuir, pupitres scellés de cire,
 * puits de lumière blanc solennel — seule lumière à `castShadow` de cette
 * zone (budget perf : une seule ombre dynamique par zone).
 */
export default function CourTemoignage({ onConfirm }: { onConfirm?: () => void }) {
  const altarMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#D8D2C2", roughness: 0.25, metalness: 0.12 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E8E4DA", roughness: 0.5 }), []);

  return (
    <group>
      {/* Puits de lumière vertical, blanc, solennel — seul spot à ombre de la zone */}
      <spotLight
        position={[0, H - 0.5, -2]}
        target-position={[0, 0, -2]}
        angle={0.35}
        penumbra={0.6}
        intensity={6}
        distance={H + 2}
        color="#F4F2EC"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight color="#FFAA44" intensity={2.0} distance={8} decay={2} position={[3.5, 1.6, 4]} />
      <pointLight color="#FFAA44" intensity={2.0} distance={8} decay={2} position={[-3.5, 1.6, 4]} />
      {/* Lumière chaude rapprochée — détache nettement le volume du bassin et la balance de bronze de l'autel */}
      <pointLight color="#FFC266" intensity={1.8} distance={7} decay={2} position={[0, 1.6, 1]} />
      <pointLight color="#FFC266" intensity={1.6} distance={6.5} decay={2} position={[0, 2.2, -2]} />

      <MarbleFloor />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H + 4, 0]}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#04060A" roughness={1} />
      </mesh>

      {/* Mur extérieur (côté qui ne donne sur aucune autre zone) */}
      <mesh position={[SIZE / 2 - 0.1, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, H, SIZE]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Les 2 autres côtés (perpendiculaires) — aucune zone voisine de ce côté non plus */}
      <mesh position={[-SIZE / 2 + 0.1, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, H, SIZE]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[0, H / 2, -SIZE / 2 + 0.1]} receiveShadow castShadow>
        <boxGeometry args={[SIZE, H, 0.2]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Liseré vert au socle des murs — écho du damier marbre blanc/vert */}
      <mesh position={[-SIZE / 2 + 0.11, 0.4, 0]}>
        <boxGeometry args={[0.18, 0.6, SIZE]} />
        <meshStandardMaterial color="#0E4636" roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[SIZE / 2 - 0.11, 0.4, 0]}>
        <boxGeometry args={[0.18, 0.6, SIZE]} />
        <meshStandardMaterial color="#0E4636" roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.4, -SIZE / 2 + 0.11]}>
        <boxGeometry args={[SIZE, 0.6, 0.18]} />
        <meshStandardMaterial color="#0E4636" roughness={0.3} metalness={0.15} />
      </mesh>

      {/* Pans de mur encadrant la triple arcade — referme le reste du côté
          vestibule, qui ne laissait que des colonnes flottant dans le vide. */}
      {[-1, 1].map((side) => (
        <mesh key={`arcade-flank-${side}`} position={[side * 5.75, H / 2, SIZE / 2 - 0.1]} receiveShadow castShadow>
          <boxGeometry args={[2.5, H, 0.2]} />
          <primitive object={wallMat} attach="material" />
        </mesh>
      ))}

      {/* Seuil ouvert vers le Vestibule — triple arcade monumentale */}
      <OctagonalColumn position={[-1.8, 0, SIZE / 2 - 0.6]} height={H} color="#D8D2C2" accentColor="#C9BFA8" />
      <OctagonalColumn position={[1.8, 0, SIZE / 2 - 0.6]} height={H} color="#D8D2C2" accentColor="#C9BFA8" />
      <group position={[0, 0, SIZE / 2 - 0.6]}>
        <IslamicArch width={3} height={H * 0.6} depth={0.3} color="#D8D2C2" />
      </group>
      <group position={[-3.4, 0, SIZE / 2 - 0.6]}>
        <IslamicArch width={2.2} height={H * 0.5} depth={0.25} color="#D8D2C2" />
      </group>
      <group position={[3.4, 0, SIZE / 2 - 0.6]}>
        <IslamicArch width={2.2} height={H * 0.5} depth={0.25} color="#D8D2C2" />
      </group>

      <Pool />

      {/* Autel + balance (logique de puzzle inchangée) */}
      <mesh position={[0, 0.25, -2]} material={altarMat} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.5, 1.4]} />
      </mesh>
      <group position={[0, 0.5, -2]}>
        <EnigmaTemoignage onConfirm={onConfirm} />
      </group>

      <LeatherBench position={[-4.5, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
      <LeatherBench position={[4.5, 0, 1]} rotation={[0, -Math.PI / 2, 0]} />
      <SealedLectern position={[-4.8, 0, -2]} rotation={[0, Math.PI / 2, 0]} />
      <SealedLectern position={[4.8, 0, -2]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  );
}
