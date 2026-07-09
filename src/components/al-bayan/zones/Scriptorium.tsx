"use client";

import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import Moucharabieh from "../shared/Moucharabieh";
import InteractiveAura from "../shared/InteractiveAura";
import ProximityPrompt from "../../maison-sagesse/shared/ProximityPrompt";
import LightShaftSun from "../world/LightShaftSun";
import EmberParticles from "../shared/EmberParticles";
import { usePBRMaterial } from "@/lib/al-bayan/pbr-materials";
import { MANUSCRIPTS } from "@/lib/al-bayan/puzzle-logic";

// Passage à l'échelle "Grand Riad" — SS=3 (empreinte + décor), hauteur x1.8.
const SS = 3;
const HS = 1.8;
export const SIZE = 13 * SS;
export const H = 7 * HS;
const STEP_DOWN = 1.1; // écart de niveau Vestibule (y=0) -> Scriptorium (y=-1.1)

// Ouvertures de corridor taillées dans les murs "sud" (vers le Jardin, via
// une longue galerie diagonale) et "nord" (vers le Sanctuaire) — cf.
// CorridorCourScriptorium.tsx / CorridorScriptoriumSanctuaire.tsx pour le
// calcul complet des positions monde correspondantes.
export const CORRIDOR_COUR_LOCAL_Z = 10.5;
export const CORRIDOR_COUR_HALF = 4;
export const CORRIDOR_SANCTUAIRE_LOCAL_Z = 0;
export const CORRIDOR_SANCTUAIRE_HALF = 4;

// Passage secret vers la Cuisine — ouverture taillée dans le mur "-Z local".
// Verrouillé tant que les 3 manuscrits ne sont pas dans l'ordre.
export const CUISINE_GAP_HALF = 4;
const CUISINE_SEG_LEN = (SIZE - CUISINE_GAP_HALF * 2) / 2;
const CUISINE_SEG_X = CUISINE_GAP_HALF + CUISINE_SEG_LEN / 2;

/** Table de copiste basse inclinée — décor, pas interactif. */
function CopyistTable({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.32, 0]} rotation={[-0.28, 0, 0]} castShadow>
        <boxGeometry args={[1.1, 0.06, 0.7]} />
        <meshStandardMaterial color="#1C2840" roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.15, 0.25]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.32, 6]} />
        <meshStandardMaterial color="#101828" roughness={0.9} />
      </mesh>
      {/* Encrier en bronze */}
      <mesh position={[0.35, 0.42, 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.08, 8]} />
        <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Plume */}
      <mesh position={[-0.3, 0.42, -0.05]} rotation={[0, 0, 0.6]} castShadow>
        <coneGeometry args={[0.015, 0.32, 5]} />
        <meshStandardMaterial color="#D4D4D4" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Bibliothèque murale — étagères pleines de parchemins roulés, décor dense
 * pour le Scriptorium (brief : "bibliothèques pleines de parchemins"). */
function ScrollShelf({ position, rotation, width = 3.4 }: { position: [number, number, number]; rotation?: [number, number, number]; width?: number }) {
  const woodMat = usePBRMaterial("wood-dark", { repeat: [1, 0.4] });
  const rows = 4;
  const perRow = Math.max(4, Math.round(width * 3));
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow material={woodMat}>
        <boxGeometry args={[width, rows * 0.62, 0.4]} />
      </mesh>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: perRow }, (_, c) => {
          const x = -width / 2 + 0.25 + (c / (perRow - 1)) * (width - 0.5);
          const y = -rows * 0.31 + 0.31 + r * 0.62;
          const hue = 30 + ((r * perRow + c) % 5) * 8;
          return (
            <mesh key={`${r}-${c}`} position={[x, y, 0.22]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.32, 8]} />
              <meshStandardMaterial color={`hsl(${hue},45%,55%)`} roughness={0.75} />
            </mesh>
          );
        })
      )}
    </group>
  );
}

/** Spot droit au-dessus d'un panneau moucharabieh, visant le sol juste
 * en dessous — projette le motif géométrique du treillis (cf. `castShadow`
 * ajouté sur ses lattes dans Moucharabieh.tsx) comme une ombre nette plutôt
 * que de rester un simple habillage décoratif sans effet au sol. */
function MoucharabiehSpot({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);

  return (
    <>
      <spotLight
        ref={lightRef}
        position={[position[0], H - 0.9, position[2]]}
        angle={0.32}
        penumbra={0.35}
        intensity={7}
        distance={27}
        decay={2}
        color="#E8C27A"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0015}
      />
      <object3D ref={targetRef} position={[position[0], 0, position[2]]} />
    </>
  );
}

/** Deux marches en pierre menant vers le Vestibule (côté +Z, plus haut). */
function StepsUp() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3A3024", roughness: 0.85 }), []);
  return (
    <group position={[0, 0, SIZE / 2 - 0.9]}>
      <mesh position={[0, STEP_DOWN * 0.66, 1.2]} material={mat} receiveShadow castShadow>
        <boxGeometry args={[12, STEP_DOWN * 0.66, 2.4]} />
      </mesh>
      <mesh position={[0, STEP_DOWN * 0.33, 3.3]} material={mat} receiveShadow castShadow>
        <boxGeometry args={[12, STEP_DOWN * 0.33, 2.4]} />
      </mesh>
    </group>
  );
}

/** Un manuscrit posé sur l'étagère — épaisseur, tranche dorée, année visible. */
function ManuscriptBook({ position, manuscript, correct }: { position: [number, number, number]; manuscript: (typeof MANUSCRIPTS)[number]; correct: boolean }) {
  const leatherMat = usePBRMaterial("leather", { repeat: [1, 1], color: correct ? "#8fbf9f" : "#ffffff" });
  return (
    <group position={position}>
      <mesh castShadow material={leatherMat}>
        <boxGeometry args={[0.5, 0.7, 0.18]} />
      </mesh>
      <mesh position={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[0.46, 0.66, 0.01]} />
        <meshStandardMaterial color="#D4B896" roughness={0.85} />
      </mesh>
      <Html position={[0, 0.42, 0.1]} center distanceFactor={9}>
        <span style={{ fontSize: 9, color: correct ? "#34d399" : "#D4AF37", fontFamily: "var(--font-dm-sans)", fontWeight: 700, whiteSpace: "nowrap", textShadow: "0 0 6px rgba(0,0,0,0.8)" }}>
          {manuscript.year}
        </span>
      </Html>
    </group>
  );
}

/** Étagère des 3 manuscrits — un indice trouvé dans le Majlis (sous un
 * tapis) doit d'abord être découvert ; les replacer dans l'ordre
 * chronologique révèle le passage secret vers la Cuisine. */
function ManuscriptShelf({
  avatarRef,
  libraryClueFound,
  onSolved,
  solved,
}: {
  avatarRef: React.RefObject<THREE.Group | null>;
  libraryClueFound: boolean;
  onSolved: () => void;
  solved: boolean;
}) {
  const [slots, setSlots] = useState<string[]>(() => [MANUSCRIPTS[1].id, MANUSCRIPTS[2].id, MANUSCRIPTS[0].id]);
  const woodMat = usePBRMaterial("wood-dark", { repeat: [2, 0.3] });

  const allCorrect = slots.every((id, idx) => MANUSCRIPTS.find((m) => m.id === id)?.correctSlot === idx);

  useEffect(() => {
    if (allCorrect && libraryClueFound && !solved) onSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCorrect, libraryClueFound, solved]);

  const cycle = (slotIdx: number) => {
    setSlots((prev) => {
      const currentIdx = MANUSCRIPTS.findIndex((m) => m.id === prev[slotIdx]);
      const next = MANUSCRIPTS[(currentIdx + 1) % MANUSCRIPTS.length].id;
      const copy = [...prev];
      copy[slotIdx] = next;
      return copy;
    });
  };

  return (
    <group position={[0, 0, -1.5]}>
      <mesh position={[0, 0.55, -0.15]} castShadow receiveShadow material={woodMat}>
        <boxGeometry args={[2.4, 1.1, 0.3]} />
      </mesh>
      {[-0.7, 0, 0.7].map((x, idx) => {
        const manuscript = MANUSCRIPTS.find((m) => m.id === slots[idx])!;
        const correct = manuscript.correctSlot === idx;
        return <ManuscriptBook key={idx} position={[x, 0.55, 0.05]} manuscript={manuscript} correct={correct} />;
      })}

      {!solved && (
        // zoneOffset=[0,0,0] : position monde précalculée (zone tournée
        // rotationY=+π/2, position (-44,-1.1,0) ; local (0,0,-1.5) -> monde (-45.5,-1.1,0)).
        <ProximityPrompt avatarRef={avatarRef} zoneOffset={[0, 0, 0]} localPosition={[-45.5, -1.1, 0]} radius={3.2}>
          {(inRange) =>
            inRange && (
              <Html position={[0, 1.5, 0]} center distanceFactor={9}>
                {libraryClueFound ? (
                  <div className="flex gap-2">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => cycle(idx)}
                        style={{
                          pointerEvents: "auto",
                          background: "rgba(10,15,13,0.85)",
                          border: "1px solid rgba(212,175,55,0.5)",
                          color: "#D4AF37",
                          fontFamily: "var(--font-dm-sans)",
                          fontWeight: 700,
                          fontSize: 10,
                          borderRadius: 10,
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Position {idx + 1} ↻
                      </button>
                    ))}
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(248,244,236,0.6)",
                      fontFamily: "var(--font-dm-sans)",
                      background: "rgba(10,15,13,0.8)",
                      padding: "6px 10px",
                      borderRadius: 8,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Un indice manque pour ranger ces manuscrits...
                  </span>
                )}
              </Html>
            )
          }
        </ProximityPrompt>
      )}
    </group>
  );
}

/**
 * Zone 3 — Le Scriptorium de la Calligraphie. En contrebas du Vestibule
 * (cf. offset Y appliqué par AlBayanWorld), cloisons moucharabieh filtrant
 * la lumière projetée au sol, bibliothèques chargées de parchemins, tables
 * de copiste, lampes à l'huile, étagère des 3 manuscrits à ranger dans
 * l'ordre chronologique.
 */
export default function Scriptorium({
  sunRef,
  avatarRef,
  libraryClueFound,
  manuscriptsSolved,
  onSolveManuscripts,
}: {
  sunRef?: Ref<THREE.Mesh>;
  avatarRef: React.RefObject<THREE.Group | null>;
  libraryClueFound?: boolean;
  manuscriptsSolved?: boolean;
  onSolveManuscripts?: () => void;
}) {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#30200E", roughness: 0.55, metalness: 0.06 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#261A0C", roughness: 0.85 }), []);

  return (
    <group>
      <pointLight color="#E8A33D" intensity={5.5} distance={24} decay={2} position={[-9, 4.5, -6]} />
      <pointLight color="#E8A33D" intensity={5.5} distance={24} decay={2} position={[9, 4.5, -6]} />
      {/* Lumière chaude basse, au niveau des tables de copiste */}
      <pointLight color="#FFAA44" intensity={3.5} distance={18} decay={2} position={[0, 2.6, 3]} />
      {/* Fill de fond pour déboucher le mur du fond */}
      <pointLight color="#D4954A" intensity={2.8} distance={20} decay={2} position={[0, 7, -15]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <primitive object={floorMat} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#1A1008" roughness={1} />
      </mesh>

      {/* Mur vers le Jardin — percé d'une ouverture pour la galerie Jardin↔Scriptorium */}
      <mesh
        position={[-SIZE / 2 + 0.1, H / 2, (-SIZE / 2 + (CORRIDOR_COUR_LOCAL_Z - CORRIDOR_COUR_HALF)) / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.2, H, SIZE / 2 + (CORRIDOR_COUR_LOCAL_Z - CORRIDOR_COUR_HALF)]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh
        position={[-SIZE / 2 + 0.1, H / 2, (SIZE / 2 + (CORRIDOR_COUR_LOCAL_Z + CORRIDOR_COUR_HALF)) / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.2, H, SIZE / 2 - (CORRIDOR_COUR_LOCAL_Z + CORRIDOR_COUR_HALF)]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Mur vers le Sanctuaire — percé d'une ouverture pour le corridor Scriptorium↔Sanctuaire */}
      <mesh
        position={[SIZE / 2 - 0.1, H / 2, (-SIZE / 2 + (CORRIDOR_SANCTUAIRE_LOCAL_Z - CORRIDOR_SANCTUAIRE_HALF)) / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.2, H, SIZE / 2 + (CORRIDOR_SANCTUAIRE_LOCAL_Z - CORRIDOR_SANCTUAIRE_HALF)]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh
        position={[SIZE / 2 - 0.1, H / 2, (SIZE / 2 + (CORRIDOR_SANCTUAIRE_LOCAL_Z + CORRIDOR_SANCTUAIRE_HALF)) / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.2, H, SIZE / 2 - (CORRIDOR_SANCTUAIRE_LOCAL_Z + CORRIDOR_SANCTUAIRE_HALF)]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Mur vers la Cuisine — désormais percé (passage secret, révélé par
          la résolution des 3 manuscrits). */}
      <mesh position={[-CUISINE_SEG_X, H / 2, -SIZE / 2 + 0.1]} receiveShadow castShadow>
        <boxGeometry args={[CUISINE_SEG_LEN, H, 0.2]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[CUISINE_SEG_X, H / 2, -SIZE / 2 + 0.1]} receiveShadow castShadow>
        <boxGeometry args={[CUISINE_SEG_LEN, H, 0.2]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Cloisons moucharabieh — séparation ajourée vers le Vestibule */}
      <group position={[-9.6, H / 2 - 0.9, SIZE / 2 - 1.5]}>
        <Moucharabieh width={10.2} height={H - 1.8} cellSize={0.32} />
      </group>
      <group position={[9.6, H / 2 - 0.9, SIZE / 2 - 1.5]}>
        <Moucharabieh width={10.2} height={H - 1.8} cellSize={0.32} />
      </group>
      <MoucharabiehSpot position={[-9.6, 0, SIZE / 2 - 1.5]} />
      <MoucharabiehSpot position={[9.6, 0, SIZE / 2 - 1.5]} />
      {/* Pans pleins flanquant les moucharabiehs jusqu'aux coins — sans
          cela les coins de la pièce restaient ouverts sur le vide. */}
      {[-1, 1].map((side) => (
        <mesh key={`mouch-flank-${side}`} position={[side * 17.1, H / 2, SIZE / 2 - 0.1]} receiveShadow castShadow>
          <boxGeometry args={[4.8, H, 0.2]} />
          <primitive object={wallMat} attach="material" />
        </mesh>
      ))}

      <StepsUp />

      {/* Source des rayons de lumière (GodRays) — placée côté Vestibule,
          au-delà des cloisons moucharabieh, pour que la lumière semble
          filtrer à travers les perforations ajourées. */}
      <LightShaftSun ref={sunRef} position={[0, H / 2 + 1.5, SIZE / 2 + 6.6]} size={4} />

      {/* Bibliothèques murales chargées de parchemins */}
      <ScrollShelf position={[-SIZE / 2 + 0.5, 1.5, -8]} rotation={[0, Math.PI / 2, 0]} width={11} />
      <ScrollShelf position={[SIZE / 2 - 0.5, 1.5, -8]} rotation={[0, -Math.PI / 2, 0]} width={11} />

      {/* Auréole interactive — étagère des manuscrits */}
      <InteractiveAura position={[0, 0.02, -1.5]} color="#60a5fa" radius={2.2} />

      <ManuscriptShelf avatarRef={avatarRef} libraryClueFound={!!libraryClueFound} onSolved={() => onSolveManuscripts?.()} solved={!!manuscriptsSolved} />

      <CopyistTable position={[-11, 0, 4.5]} rotation={[0, 0.4, 0]} />
      <CopyistTable position={[11, 0, 4.5]} rotation={[0, -0.4, 0]} />
      <CopyistTable position={[-11.4, 0, -7.5]} rotation={[0, 0.9, 0]} />
      <CopyistTable position={[11.4, 0, -7.5]} rotation={[0, -0.9, 0]} />
      <CopyistTable position={[0, 0, -13]} rotation={[0, 0, 0]} />

      <CandleLight position={[-13.5, 0.4, -9]} intensity={1.4} avatarRef={avatarRef} />
      <CandleLight position={[13.5, 0.4, -9]} intensity={1.4} avatarRef={avatarRef} />
      <CandleLight position={[0, 0.4, 10.5]} intensity={1.2} avatarRef={avatarRef} />
      <EmberParticles position={[-13.5, 0.55, -9]} count={11} />
      <EmberParticles position={[13.5, 0.55, -9]} count={11} />

      <AmbientParticles avatarRef={avatarRef} />
    </group>
  );
}
