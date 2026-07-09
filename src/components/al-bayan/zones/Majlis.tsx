"use client";

import { useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import InteractiveAura from "../shared/InteractiveAura";
import ProximityPrompt from "../../maison-sagesse/shared/ProximityPrompt";
import CodeLock from "../ui/CodeLock";
import { usePBRMaterial } from "@/lib/al-bayan/pbr-materials";
import { LIBRARY_CLUE } from "@/lib/al-bayan/puzzle-logic";

export const MAJLIS_SIZE = 12;
export const MAJLIS_H = 5;
// Position monde — cf. calcul dans CorridorJardinMajlis.tsx : le mur "-X
// local" (gap au centre) doit atterrir sur MAJLIS_OPENING_X=27.9.
export const MAJLIS_POSITION: [number, number, number] = [33.8, 0, 0];

const GAP_HALF = 1.6;
const SEG_LEN = (MAJLIS_SIZE - GAP_HALF * 2) / 2;
const SEG_Z = GAP_HALF + SEG_LEN / 2;

/** Pile de coussins en velours — plusieurs coussins empilés/décalés dans un angle. */
function CushionPile({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const velvetMat = usePBRMaterial("velvet", { repeat: [1, 1] });
  const cushions = useMemo(
    () => [
      { x: 0, z: 0, y: 0.14, s: 0.55, rot: 0.1 },
      { x: 0.25, z: 0.15, y: 0.13, s: 0.5, rot: -0.3 },
      { x: -0.2, z: 0.22, y: 0.4, s: 0.48, rot: 0.4 },
    ],
    []
  );
  return (
    <group position={position} rotation={rotation}>
      {cushions.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation={[0, c.rot, 0]} castShadow material={velvetMat}>
          <boxGeometry args={[c.s, c.s * 0.5, c.s]} />
        </mesh>
      ))}
    </group>
  );
}

/** Table basse sculptée + plateau en cuivre poli (roughness basse -> reflets). */
function LowTable({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const woodMat = usePBRMaterial("wood-dark", { repeat: [1, 1] });
  const copperMat = usePBRMaterial("copper", { repeat: [1, 1], roughnessIntensity: 0.25, metalness: 0.85 });
  return (
    <group position={position} rotation={rotation}>
      {[-0.35, 0.35].map((x) =>
        [-0.35, 0.35].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.18, z]} castShadow material={woodMat}>
            <cylinderGeometry args={[0.03, 0.03, 0.36, 8]} />
          </mesh>
        ))
      )}
      <mesh position={[0, 0.38, 0]} castShadow material={copperMat}>
        <cylinderGeometry args={[0.55, 0.55, 0.03, 24]} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.55, 0.015, 6, 24]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

/** Grand lustre suspendu — chaîne + corps en cuivre + bougies (non
 * shadow-casting, cf. discipline perf CandleLight). */
function Chandelier({ position }: { position: [number, number, number] }) {
  const copperMat = usePBRMaterial("copper", { repeat: [1, 1], roughnessIntensity: 0.3, metalness: 0.8 });
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.2, 6]} />
        <meshStandardMaterial color="#2C1810" roughness={0.6} />
      </mesh>
      <mesh castShadow material={copperMat}>
        <torusGeometry args={[0.5, 0.05, 8, 24]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * 0.5, 0.1, Math.sin(angle) * 0.5]}>
            <mesh castShadow material={copperMat}>
              <cylinderGeometry args={[0.02, 0.025, 0.15, 6]} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshStandardMaterial color="#FFC840" emissive="#FF8800" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      <pointLight color="#FFA040" intensity={2.5} distance={8} decay={2} />
    </group>
  );
}

/** Tapis berbère au centre — sous un coin duquel se cache l'indice pour le
 * Scriptorium. Un simple clic (proximité) révèle le parchemin. */
function ClueRug({ avatarRef, onFound, found }: { avatarRef: React.RefObject<THREE.Group | null>; onFound: () => void; found: boolean }) {
  const [lifted, setLifted] = useState(false);
  return (
    <group position={[0, 0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color="#7A1F1F" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[3.2, 2.2]} />
        <meshStandardMaterial color="#C8A84B" roughness={0.85} />
      </mesh>

      {!found && (
        // zoneOffset=[0,0,0] : Majlis n'est pas tournée, MAJLIS_POSITION + (0,0,0) = position monde du tapis.
        <ProximityPrompt avatarRef={avatarRef} zoneOffset={MAJLIS_POSITION} localPosition={[0, 0, 0]} radius={2.5}>
          {(inRange) =>
            inRange && (
              <Html position={[0, 0.6, 0]} center distanceFactor={9}>
                {lifted ? (
                  <div
                    className="rounded-xl px-3 py-2"
                    style={{ background: "rgba(10,15,13,0.9)", border: "1px solid rgba(212,175,55,0.5)", maxWidth: 220, pointerEvents: "none" }}
                  >
                    <span style={{ fontSize: 9, color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>{LIBRARY_CLUE}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setLifted(true);
                      onFound();
                    }}
                    style={{
                      pointerEvents: "auto",
                      background: "linear-gradient(135deg, #7a5c1a 0%, #D4AF37 50%, #7a5c1a 100%)",
                      border: "1px solid rgba(212,175,55,0.7)",
                      color: "#0A0F0D",
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: 800,
                      fontSize: 11,
                      borderRadius: 10,
                      padding: "8px 14px",
                      cursor: "pointer",
                    }}
                  >
                    Soulever le tapis
                  </button>
                )}
              </Html>
            )
          }
        </ProximityPrompt>
      )}
    </group>
  );
}

interface MajlisProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  libraryClueFound?: boolean;
  onFindLibraryClue?: () => void;
  jarsRead?: boolean;
  safeOpen?: boolean;
}

/**
 * Zone 5 — Le Majlis (Grand Salon). Coussins de velours, tables basses en
 * bois sculpté et cuivre poli, grand lustre suspendu, tapis berbère
 * dissimulant l'indice menant au Scriptorium, coffre en cèdre (ouvert avec
 * le code lu sur les jarres de la Cuisine) contenant la lentille de cristal.
 */
export default function Majlis({ avatarRef, libraryClueFound, onFindLibraryClue, jarsRead, safeOpen }: MajlisProps) {
  const plasterMat = usePBRMaterial("plaster", { repeat: [2, 2] });
  const carpetMat = usePBRMaterial("carpet", { repeat: [3, 3] });
  const woodMat = usePBRMaterial("wood-dark", { repeat: [1, 1] });

  return (
    <group>
      <ambientLight color="#3D2A10" intensity={0.3} />
      <pointLight color="#E8A33D" intensity={2.2} distance={12} decay={2} position={[0, MAJLIS_H - 0.6, 0]} castShadow />
      <pointLight color="#FFC266" intensity={1.6} distance={8} decay={2} position={[-3, 1.6, -3]} />
      <pointLight color="#FFC266" intensity={1.6} distance={8} decay={2} position={[3, 1.6, 3]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MAJLIS_SIZE, MAJLIS_SIZE]} />
        <primitive object={carpetMat} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, MAJLIS_H, 0]}>
        <planeGeometry args={[MAJLIS_SIZE, MAJLIS_SIZE]} />
        <meshStandardMaterial color="#1A1008" roughness={0.9} />
      </mesh>

      {/* Mur vers le Jardin (corridor) — percé au centre */}
      <mesh position={[-MAJLIS_SIZE / 2 + 0.1, MAJLIS_H / 2, -SEG_Z]} receiveShadow castShadow>
        <boxGeometry args={[0.2, MAJLIS_H, SEG_LEN]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[-MAJLIS_SIZE / 2 + 0.1, MAJLIS_H / 2, SEG_Z]} receiveShadow castShadow>
        <boxGeometry args={[0.2, MAJLIS_H, SEG_LEN]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      {/* 3 autres côtés — pleins, aucune zone voisine */}
      <mesh position={[MAJLIS_SIZE / 2 - 0.1, MAJLIS_H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, MAJLIS_H, MAJLIS_SIZE]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[0, MAJLIS_H / 2, -MAJLIS_SIZE / 2 + 0.1]} receiveShadow castShadow>
        <boxGeometry args={[MAJLIS_SIZE, MAJLIS_H, 0.2]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[0, MAJLIS_H / 2, MAJLIS_SIZE / 2 - 0.1]} receiveShadow castShadow>
        <boxGeometry args={[MAJLIS_SIZE, MAJLIS_H, 0.2]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>

      <ClueRug avatarRef={avatarRef} onFound={() => onFindLibraryClue?.()} found={!!libraryClueFound} />
      <Chandelier position={[0, MAJLIS_H - 0.7, 0]} />

      <CushionPile position={[-4.3, 0, -4.3]} rotation={[0, 0.6, 0]} />
      <CushionPile position={[4.3, 0, -4.3]} rotation={[0, -0.6, 0]} />
      <CushionPile position={[-4.3, 0, 4.3]} rotation={[0, 2.4, 0]} />
      <CushionPile position={[4.3, 0, 4.3]} rotation={[0, -2.4, 0]} />
      <LowTable position={[-2.5, 0, 0]} />
      <LowTable position={[2.5, 0, 0]} />

      {/* Coffre en cèdre — ouvert par le code lu sur les jarres de la Cuisine */}
      <group position={[0, 0, 4]}>
        <InteractiveAura position={[0, 0.02, 0]} color="#D4AF37" radius={1.2} />
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

      <CandleLight position={[-5.3, 0.4, -1]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[5.3, 0.4, 1]} intensity={1.0} avatarRef={avatarRef} />

      <AmbientParticles avatarRef={avatarRef} />
    </group>
  );
}
