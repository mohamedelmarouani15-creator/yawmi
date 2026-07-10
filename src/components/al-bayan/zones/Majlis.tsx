"use client";

import { useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import Moucharabieh from "../shared/Moucharabieh";
import ProximityPrompt from "../../maison-sagesse/shared/ProximityPrompt";
import { usePBRMaterial } from "@/lib/al-bayan/pbr-materials";
import { LIBRARY_CLUE } from "@/lib/al-bayan/puzzle-logic";
import { WallSconce, MonumentalVase, PotteryCluster } from "../shared/CorridorDecor";
import { KenneyProp } from "../shared/KenneyProp";
import DistanceCulledLight from "../shared/DistanceCulledLight";

// Passage à l'échelle "Grand Riad" — SIZE x3, hauteur x1.8 (cf. commentaire
// dans Vestibule.tsx pour le raisonnement).
const S = 3;
const HS = 1.8;
export const MAJLIS_SIZE = 12 * S;
export const MAJLIS_H = 5 * HS;
// Position monde — cf. calcul dans CorridorJardinMajlis.tsx : le mur "-X
// local" (gap au centre) doit atterrir sur MAJLIS_OPENING_X. Le mur "+X
// local" ouvre désormais vers la Suite Privée (cf. CorridorMajlisSuite.tsx).
export const MAJLIS_POSITION: [number, number, number] = [119, 0, 0];

const GAP_HALF = 4;
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
      { x: 0.1, z: -0.25, y: 0.13, s: 0.46, rot: 0.7 },
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

/** Grand lustre suspendu — chaîne + corps en cuivre + bougies (non
 * shadow-casting, cf. discipline perf CandleLight). */
function Chandelier({ position }: { position: [number, number, number] }) {
  const copperMat = usePBRMaterial("copper", { repeat: [1, 1], roughnessIntensity: 0.3, metalness: 0.8 });
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.8, 6]} />
        <meshStandardMaterial color="#2C1810" roughness={0.6} />
      </mesh>
      <mesh castShadow material={copperMat}>
        <torusGeometry args={[0.75, 0.07, 8, 32]} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * 0.75, 0.14, Math.sin(angle) * 0.75]}>
            <mesh castShadow material={copperMat}>
              <cylinderGeometry args={[0.026, 0.032, 0.2, 6]} />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color="#FFC840" emissive="#FF8800" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      <pointLight color="#FFA040" intensity={3.4} distance={13} decay={2} />
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
        <planeGeometry args={[10, 7.5]} />
        <meshStandardMaterial color="#7A1F1F" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[8.2, 5.8]} />
        <meshStandardMaterial color="#16204A" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[6, 4.2]} />
        <meshStandardMaterial color="#C8A84B" roughness={0.85} />
      </mesh>

      {!found && (
        // zoneOffset=[0,0,0] : Majlis n'est pas tournée, MAJLIS_POSITION + (0,0,0) = position monde du tapis.
        <ProximityPrompt avatarRef={avatarRef} zoneOffset={MAJLIS_POSITION} localPosition={[0, 0, 0]} radius={4.5}>
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
}

/**
 * Zone 5 — Le Grand Salon (Majlis), en U autour d'un tapis berbère central.
 * Coussins de velours, tables basses en bois sculpté et cuivre poli, grand
 * lustre suspendu, moucharabiehs projetant leurs ombres géométriques.
 * Le tapis dissimule l'indice menant au Scriptorium. Le coffre en cèdre
 * (ouvert avec le code des jarres) se trouve désormais dans la suite privée
 * attenante, au-delà du mur est.
 */
export default function Majlis({ avatarRef, libraryClueFound, onFindLibraryClue }: MajlisProps) {
  const plasterMat = usePBRMaterial("plaster", { repeat: [3, 3] });
  const carpetMat = usePBRMaterial("carpet", { repeat: [5, 5] });

  return (
    <group>
      <ambientLight color="#3D2A10" intensity={0.5} />
      {/* castShadow retiré : une lumière ponctuelle avec ombres force un rendu
          cubemap 6 faces à CHAQUE frame — de très loin le coût GPU le plus
          élevé de toute la scène (déjà noté et évité pour CandleLight, mais
          oublié ici). Aucune autre source d'ombre dans cette pièce, donc le
          sol n'aura plus d'ombres portées, contre un gain de perf majeur. */}
      <DistanceCulledLight color="#E8A33D" intensity={6.5} distance={34} decay={2} position={[0, MAJLIS_H - 1, 0]} avatarRef={avatarRef} />
      <DistanceCulledLight color="#FFC266" intensity={3.2} distance={20} decay={2} position={[-9, 3, -9]} avatarRef={avatarRef} />
      <DistanceCulledLight color="#FFC266" intensity={3.2} distance={20} decay={2} position={[9, 3, 9]} avatarRef={avatarRef} />
      <DistanceCulledLight color="#D4954A" intensity={2.4} distance={18} decay={2} position={[9, 3, -9]} avatarRef={avatarRef} />
      <DistanceCulledLight color="#D4954A" intensity={2.4} distance={18} decay={2} position={[-9, 3, 9]} avatarRef={avatarRef} />

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
      {/* Mur vers la Suite Privée — percé au centre (jamais verrouillé côté
          Majlis ; la porte gérée par CorridorMajlisSuite se verrouille
          jusqu'à ce que le code des jarres soit connu). */}
      <mesh position={[MAJLIS_SIZE / 2 - 0.1, MAJLIS_H / 2, -SEG_Z]} receiveShadow castShadow>
        <boxGeometry args={[0.2, MAJLIS_H, SEG_LEN]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[MAJLIS_SIZE / 2 - 0.1, MAJLIS_H / 2, SEG_Z]} receiveShadow castShadow>
        <boxGeometry args={[0.2, MAJLIS_H, SEG_LEN]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      {/* 2 autres côtés — pleins, avec moucharabiehs ajourés */}
      <mesh position={[0, MAJLIS_H / 2, -MAJLIS_SIZE / 2 + 0.1]} receiveShadow castShadow>
        <boxGeometry args={[MAJLIS_SIZE, MAJLIS_H, 0.2]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[0, MAJLIS_H / 2, MAJLIS_SIZE / 2 - 0.1]} receiveShadow castShadow>
        <boxGeometry args={[MAJLIS_SIZE, MAJLIS_H, 0.2]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <group position={[-9, MAJLIS_H / 2 - 1.4, -MAJLIS_SIZE / 2 + 0.5]}>
        <Moucharabieh width={9} height={MAJLIS_H - 2.5} cellSize={0.35} />
      </group>
      <group position={[9, MAJLIS_H / 2 - 1.4, -MAJLIS_SIZE / 2 + 0.5]}>
        <Moucharabieh width={9} height={MAJLIS_H - 2.5} cellSize={0.35} />
      </group>
      <group position={[-9, MAJLIS_H / 2 - 1.4, MAJLIS_SIZE / 2 - 0.5]}>
        <Moucharabieh width={9} height={MAJLIS_H - 2.5} cellSize={0.35} />
      </group>
      <group position={[9, MAJLIS_H / 2 - 1.4, MAJLIS_SIZE / 2 - 0.5]}>
        <Moucharabieh width={9} height={MAJLIS_H - 2.5} cellSize={0.35} />
      </group>

      <ClueRug avatarRef={avatarRef} onFound={() => onFindLibraryClue?.()} found={!!libraryClueFound} />
      <Chandelier position={[0, MAJLIS_H - 1.2, 0]} />

      {/* Assise en U — coussins le long de 3 côtés */}
      <CushionPile position={[-13, 0, -13]} rotation={[0, 0.6, 0]} />
      <CushionPile position={[13, 0, -13]} rotation={[0, -0.6, 0]} />
      <CushionPile position={[-13, 0, 0]} rotation={[0, 1.9, 0]} />
      <CushionPile position={[13, 0, 0]} rotation={[0, -1.9, 0]} />
      <CushionPile position={[-13, 0, 13]} rotation={[0, 2.4, 0]} />
      <CushionPile position={[13, 0, 13]} rotation={[0, -2.4, 0]} />
      {/* Vraies tables basses (pack CC0 Kenney) — remplacent LowTable
          procédural, cf. shared/KenneyProp.tsx */}
      <KenneyProp name="tableCoffee" position={[-7.5, 0, 0]} scale={2.2} />
      <KenneyProp name="tableCoffee" position={[7.5, 0, 0]} scale={2.2} />
      <KenneyProp name="tableCoffee" position={[0, 0, -8]} scale={2.2} />
      <KenneyProp name="tableCoffee" position={[0, 0, 8]} scale={2.2} />

      {/* Coussins et tapis ronds réels en complément de l'assise en U */}
      <KenneyProp name="rugRound" position={[-13, 0.01, -13]} scale={2.6} rotation={[0, 0.6, 0]} />
      <KenneyProp name="rugRound" position={[13, 0.01, 13]} scale={2.6} rotation={[0, -2.4, 0]} />
      <KenneyProp name="pillowBlue" position={[-13.6, 0.15, 0.4]} scale={1.4} rotation={[0, 1.2, 0]} />
      <KenneyProp name="pillowLong" position={[13.4, 0.15, -0.3]} scale={1.4} rotation={[0, -0.4, 0]} />

      <CandleLight position={[-15, 0.4, -3]} intensity={1.2} avatarRef={avatarRef} />
      <CandleLight position={[15, 0.4, 3]} intensity={1.2} avatarRef={avatarRef} />
      <CandleLight position={[-15, 0.4, 3]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[15, 0.4, -3]} intensity={1.0} avatarRef={avatarRef} />

      {/* Décor mural supplémentaire — retour utilisateur : la salle restait
          bien trop vide malgré l'assise en U et les tables. */}
      <MonumentalVase position={[-MAJLIS_SIZE / 2 + 2, 0, -MAJLIS_SIZE / 2 + 2]} scale={1.5} />
      <MonumentalVase position={[MAJLIS_SIZE / 2 - 2, 0, -MAJLIS_SIZE / 2 + 2]} scale={1.5} />
      <MonumentalVase position={[-MAJLIS_SIZE / 2 + 2, 0, MAJLIS_SIZE / 2 - 2]} scale={1.5} />
      <MonumentalVase position={[MAJLIS_SIZE / 2 - 2, 0, MAJLIS_SIZE / 2 - 2]} scale={1.5} />
      <PotteryCluster position={[-MAJLIS_SIZE / 2 + 1.6, 0, -SEG_Z]} />
      <PotteryCluster position={[-MAJLIS_SIZE / 2 + 1.6, 0, SEG_Z]} />
      <PotteryCluster position={[MAJLIS_SIZE / 2 - 1.6, 0, -SEG_Z]} />
      <PotteryCluster position={[MAJLIS_SIZE / 2 - 1.6, 0, SEG_Z]} />
      <WallSconce position={[0, MAJLIS_H * 0.42, -MAJLIS_SIZE / 2 + 0.15]} rotationY={0} />
      <WallSconce position={[0, MAJLIS_H * 0.42, MAJLIS_SIZE / 2 - 0.15]} rotationY={Math.PI} />
      <WallSconce position={[-14, MAJLIS_H * 0.42, -MAJLIS_SIZE / 2 + 0.15]} rotationY={0} />
      <WallSconce position={[14, MAJLIS_H * 0.42, -MAJLIS_SIZE / 2 + 0.15]} rotationY={0} />
      <WallSconce position={[-14, MAJLIS_H * 0.42, MAJLIS_SIZE / 2 - 0.15]} rotationY={Math.PI} />
      <WallSconce position={[14, MAJLIS_H * 0.42, MAJLIS_SIZE / 2 - 0.15]} rotationY={Math.PI} />

      <AmbientParticles avatarRef={avatarRef} />
    </group>
  );
}
