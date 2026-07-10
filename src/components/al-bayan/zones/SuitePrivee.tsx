"use client";

import { Html } from "@react-three/drei";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import Moucharabieh from "../shared/Moucharabieh";
import InteractiveAura from "../shared/InteractiveAura";
import CodeLock from "../ui/CodeLock";
import { usePBRMaterial } from "@/lib/al-bayan/pbr-materials";
import { WallSconce, MonumentalVase, PotteryCluster, CushionBench } from "../shared/CorridorDecor";
import DistanceCulledLight from "../shared/DistanceCulledLight";

export const SUITE_SIZE = 24;
export const SUITE_H = 7 * 1.8;
// Position monde — cf. calcul dans CorridorMajlisSuite.tsx : le mur "-X
// local" (gap au centre) doit atterrir sur SUITE_OPENING_X.
export const SUITE_POSITION: [number, number, number] = [167, 0, 0];

const GAP_HALF = 3.5;
const SEG_LEN = (SUITE_SIZE - GAP_HALF * 2) / 2;
const SEG_Z = GAP_HALF + SEG_LEN / 2;

/** Point d'eau sculpté — petite vasque de marbre au coin de la suite,
 * filet d'eau continu (décoratif, pas de puzzle ici). */
function SculptedWaterPoint({ position }: { position: [number, number, number] }) {
  const marbleMat = usePBRMaterial("marble", { repeat: [1, 1] });
  return (
    <group position={position}>
      <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.35, 16, 1, true]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.0, 16]} />
        <meshStandardMaterial color="#0B1A3A" roughness={0.08} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow material={marbleMat}>
        <cylinderGeometry args={[0.1, 0.14, 1.0, 10]} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow material={marbleMat}>
        <sphereGeometry args={[0.16, 10, 10]} />
      </mesh>
    </group>
  );
}

/** Divan bas avec dais léger — assise privée de la suite. */
function CanopyDivan({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const velvetMat = usePBRMaterial("velvet", { repeat: [1.5, 1] });
  const woodMat = usePBRMaterial("wood-dark", { repeat: [1, 1] });
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow material={velvetMat}>
        <boxGeometry args={[2.6, 0.5, 1.4]} />
      </mesh>
      <mesh position={[0, 0.62, -0.55]} castShadow material={velvetMat}>
        <boxGeometry args={[2.6, 0.5, 0.15]} />
      </mesh>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 1.6, -0.6]} castShadow material={woodMat}>
          <cylinderGeometry args={[0.05, 0.05, 3.0, 8]} />
        </mesh>
      ))}
      {[-1.15, 1.15].map((x) => (
        <mesh key={`front-${x}`} position={[x, 1.6, 0.6]} castShadow material={woodMat}>
          <cylinderGeometry args={[0.05, 0.05, 3.0, 8]} />
        </mesh>
      ))}
      <mesh position={[0, 3.05, 0]} material={woodMat}>
        <boxGeometry args={[2.5, 0.08, 1.4]} />
      </mesh>
    </group>
  );
}

interface SuitePriveeProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  jarsRead?: boolean;
  safeOpen?: boolean;
}

/**
 * Zone 6 — La Suite Privée, au-delà du Majlis. Coffre en cèdre contenant la
 * lentille de cristal — s'ouvre avec le code à 4 chiffres lu sur les jarres
 * de la Cuisine. Divan à dais, point d'eau sculpté, moucharabiehs.
 */
export default function SuitePrivee({ avatarRef, jarsRead, safeOpen }: SuitePriveeProps) {
  const plasterMat = usePBRMaterial("plaster", { repeat: [2, 2] });
  const carpetMat = usePBRMaterial("carpet", { repeat: [3, 3], color: "#8fa3c8" });
  const woodMat = usePBRMaterial("wood-dark", { repeat: [1, 1] });

  return (
    <group>
      <ambientLight color="#2A2038" intensity={0.48} />
      <DistanceCulledLight color="#9FC8FF" intensity={3.6} distance={22} decay={2} position={[0, SUITE_H - 1, 0]} castShadow avatarRef={avatarRef} />
      <DistanceCulledLight color="#FFC266" intensity={2.8} distance={16} decay={2} position={[-6, 2, -6]} avatarRef={avatarRef} />
      <DistanceCulledLight color="#FFC266" intensity={2.8} distance={16} decay={2} position={[6, 2, 6]} avatarRef={avatarRef} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SUITE_SIZE, SUITE_SIZE]} />
        <primitive object={carpetMat} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, SUITE_H, 0]}>
        <planeGeometry args={[SUITE_SIZE, SUITE_SIZE]} />
        <meshStandardMaterial color="#12101E" roughness={0.9} />
      </mesh>

      {/* Mur vers le Majlis — percé au centre */}
      <mesh position={[-SUITE_SIZE / 2 + 0.1, SUITE_H / 2, -SEG_Z]} receiveShadow castShadow>
        <boxGeometry args={[0.2, SUITE_H, SEG_LEN]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[-SUITE_SIZE / 2 + 0.1, SUITE_H / 2, SEG_Z]} receiveShadow castShadow>
        <boxGeometry args={[0.2, SUITE_H, SEG_LEN]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      {/* 3 autres côtés — pleins, avec moucharabiehs sur 2 pans */}
      <mesh position={[SUITE_SIZE / 2 - 0.1, SUITE_H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, SUITE_H, SUITE_SIZE]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[0, SUITE_H / 2, -SUITE_SIZE / 2 + 0.1]} receiveShadow castShadow>
        <boxGeometry args={[SUITE_SIZE, SUITE_H, 0.2]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[0, SUITE_H / 2, SUITE_SIZE / 2 - 0.1]} receiveShadow castShadow>
        <boxGeometry args={[SUITE_SIZE, SUITE_H, 0.2]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <group position={[0, SUITE_H / 2 - 1.2, -SUITE_SIZE / 2 + 0.5]}>
        <Moucharabieh width={7} height={SUITE_H - 2} cellSize={0.32} />
      </group>
      <group position={[0, SUITE_H / 2 - 1.2, SUITE_SIZE / 2 - 0.5]}>
        <Moucharabieh width={7} height={SUITE_H - 2} cellSize={0.32} />
      </group>

      <SculptedWaterPoint position={[8, 0, -8]} />
      <CanopyDivan position={[0, 0, -7]} />

      {/* Coffre en cèdre — ouvert par le code lu sur les jarres de la Cuisine */}
      <group position={[0, 0, 6]}>
        <InteractiveAura position={[0, 0.02, 0]} color="#D4AF37" radius={1.6} />
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow material={woodMat}>
          <boxGeometry args={[1.1, 0.6, 0.6]} />
        </mesh>
        <mesh position={[0, 0.62, 0]} castShadow material={woodMat}>
          <boxGeometry args={[1.15, 0.05, 0.65]} />
        </mesh>
        {!safeOpen && jarsRead && (
          <Html position={[0, 1.1, 0]} center distanceFactor={9}>
            <div style={{ pointerEvents: "auto" }}>
              <CodeLock />
            </div>
          </Html>
        )}
        {safeOpen && (
          <Html position={[0, 1.0, 0]} center distanceFactor={9}>
            <span
              style={{
                fontSize: 10,
                color: "#34d399",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 700,
                background: "rgba(10,15,13,0.8)",
                padding: "6px 10px",
                borderRadius: 8,
                whiteSpace: "nowrap",
              }}
            >
              ✓ Le coffre est ouvert — la lentille de cristal a été récupérée
            </span>
          </Html>
        )}
      </group>

      <CandleLight position={[-9, 0.4, 6]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[9, 0.4, 6]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[0, 0.4, -10]} intensity={0.9} avatarRef={avatarRef} />

      {/* Décor supplémentaire — retour utilisateur : pièce presque vide en
          dehors du divan, du coffre et du point d'eau. */}
      <MonumentalVase position={[-SUITE_SIZE / 2 + 2, 0, -SUITE_SIZE / 2 + 2]} scale={1.4} />
      <MonumentalVase position={[SUITE_SIZE / 2 - 2, 0, SUITE_SIZE / 2 - 2]} scale={1.4} />
      <PotteryCluster position={[-8, 0, 8]} />
      <PotteryCluster position={[8, 0, -2]} />
      <CushionBench position={[-8, 0, -2]} rotationY={Math.PI / 2} length={2.2} />
      <WallSconce position={[SUITE_SIZE / 2 - 0.15, SUITE_H * 0.4, -6]} rotationY={-Math.PI / 2} />
      <WallSconce position={[SUITE_SIZE / 2 - 0.15, SUITE_H * 0.4, 6]} rotationY={-Math.PI / 2} />
      <WallSconce position={[-6, SUITE_H * 0.4, -SUITE_SIZE / 2 + 0.15]} rotationY={0} />
      <WallSconce position={[6, SUITE_H * 0.4, SUITE_SIZE / 2 - 0.15]} rotationY={Math.PI} />

      <AmbientParticles avatarRef={avatarRef} />
    </group>
  );
}
