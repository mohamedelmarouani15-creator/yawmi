"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import OctagonalColumn from "../shared/OctagonalColumn";
import { WallSconce, MonumentalVase, CorridorRug, PotteryCluster, CushionBench, MashrabiyaScreen } from "../shared/CorridorDecor";
import { KenneyProp } from "../shared/KenneyProp";
import DistanceCulledLight from "../shared/DistanceCulledLight";

// Corridor diagonal en espace MONDE reliant l'ouverture du mur "nord" du
// Scriptorium (monde X≈-44, Z≈-19.4, y=-1.1) à l'ouverture taillée dans
// l'enceinte circulaire du Sanctuaire (theta≈0.769 rad depuis son centre,
// y=0.7 — "surélevée"). Les deux points + l'angle/longueur sont dérivés
// géométriquement plutôt que des constantes à la main, pour rester exacts
// si l'un des deux seuils bouge un jour.
const SCRIPTORIUM_OPENING = { x: -44, y: -1.1, z: -19.4 };
const SANCTUAIRE_CENTER = { x: 0, y: 0.7, z: -43 };
const SANCTUAIRE_RADIUS = 24;
const SANCTUAIRE_THETA = 0.769; // doit rester identique à Sanctuaire.tsx

const SANCTUAIRE_OPENING = {
  x: SANCTUAIRE_CENTER.x - SANCTUAIRE_RADIUS * Math.cos(SANCTUAIRE_THETA),
  y: SANCTUAIRE_CENTER.y,
  z: SANCTUAIRE_CENTER.z + SANCTUAIRE_RADIUS * Math.sin(SANCTUAIRE_THETA),
};

const DX = SANCTUAIRE_OPENING.x - SCRIPTORIUM_OPENING.x;
const DZ = SANCTUAIRE_OPENING.z - SCRIPTORIUM_OPENING.z;
const LENGTH = Math.hypot(DX, DZ);
const ANGLE = Math.atan2(DZ, DX); // rotation Y du corridor (axe local = longueur)
const RISE = SANCTUAIRE_OPENING.y - SCRIPTORIUM_OPENING.y; // Scriptorium -> Sanctuaire surélevé

const WIDTH = 6;
const HALL_HEIGHT = 6;
const STAIR_RUN = 6; // longueur (le long du corridor) occupée par les marches, côté Sanctuaire
const WALL_SEGMENTS = 8; // cf. commentaire sur le débordement d'AABB des parois

export default function CorridorScriptoriumSanctuaire({ avatarRef }: { avatarRef?: React.RefObject<THREE.Group | null> }) {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1C1812", roughness: 0.65, metalness: 0.08 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2C261C", roughness: 0.8 }), []);
  const stepMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3A3024", roughness: 0.85 }), []);

  const flatLength = LENGTH - STAIR_RUN;
  const stepCount = 5;
  const stepRun = STAIR_RUN / stepCount;
  const stepRise = RISE / stepCount;

  const columnDs = useMemo(() => {
    const count = Math.max(2, Math.round(flatLength / 11));
    return Array.from({ length: count }, (_, i) => ((i + 0.5) / count) * flatLength);
  }, [flatLength]);

  return (
    // Groupe positionné au seuil Scriptorium, tourné vers le seuil Sanctuaire
    // — tout le reste est exprimé en coordonnées locales le long de l'axe X.
    <group position={[SCRIPTORIUM_OPENING.x, SCRIPTORIUM_OPENING.y, SCRIPTORIUM_OPENING.z]} rotation={[0, -ANGLE, 0]}>
      {/* Tronçon plat (niveau Scriptorium) */}
      <mesh position={[flatLength / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[flatLength, 0.1, WIDTH]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Escalier montant vers le Sanctuaire */}
      {Array.from({ length: stepCount }, (_, i) => (
        <mesh
          key={i}
          position={[flatLength + stepRun * (i + 0.5), stepRise * (i + 0.5), 0]}
          material={stepMat}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[stepRun, stepRise * (i + 1), WIDTH]} />
        </mesh>
      ))}

      {/* Parois latérales — découpées en segments courts plutôt qu'une
          poutre unique sur toute la longueur. Le corridor est incliné
          (ANGLE) ; l'AABB d'une longue boîte tournée déborde largement de
          sa vraie épaisseur (bug constaté à l'échelle précédente). Des
          segments courts ramènent ce débordement à une fraction négligeable. */}
      {[-1, 1].map((side) =>
        Array.from({ length: WALL_SEGMENTS }, (_, i) => {
          const segCenter = (LENGTH / WALL_SEGMENTS) * (i + 0.5);
          return (
            <mesh key={`${side}-${i}`} position={[segCenter, HALL_HEIGHT / 2 - 0.4 + (segCenter > flatLength ? RISE : 0), side * (WIDTH / 2 + 0.15)]} receiveShadow castShadow>
              <boxGeometry args={[LENGTH / WALL_SEGMENTS, HALL_HEIGHT, 0.3]} />
              <primitive object={wallMat} attach="material" />
            </mesh>
          );
        })
      )}

      {columnDs.map((d, i) => (
        <group key={`col-${i}`}>
          <OctagonalColumn position={[d, 0, -WIDTH / 2 + 0.6]} height={HALL_HEIGHT - 0.4} shadows={false} />
          <OctagonalColumn position={[d, 0, WIDTH / 2 - 0.6]} height={HALL_HEIGHT - 0.4} shadows={false} />
        </group>
      ))}
      {columnDs.map((d, i) => (
        <group key={`sconce-${i}`}>
          <WallSconce position={[d, HALL_HEIGHT * 0.5, -WIDTH / 2 + 0.15]} rotationY={0} />
          <WallSconce position={[d, HALL_HEIGHT * 0.5, WIDTH / 2 - 0.15]} rotationY={Math.PI} />
        </group>
      ))}
      <MonumentalVase position={[1.5, 0, -WIDTH / 2 + 0.9]} scale={1.2} />
      <MonumentalVase position={[flatLength - 1.5, 0, WIDTH / 2 - 0.9]} scale={1.2} />
      <PotteryCluster position={[1.7, 0, WIDTH / 2 - 0.55]} />
      <PotteryCluster position={[flatLength - 1.7, 0, -WIDTH / 2 + 0.55]} />
      <CushionBench position={[flatLength * 0.6, 0, -WIDTH / 2 + 0.5]} />
      <MashrabiyaScreen position={[flatLength * 0.25, HALL_HEIGHT * 0.4, WIDTH / 2 - 0.05]} rotationY={Math.PI} />
      <CorridorRug position={[flatLength * 0.4, 0.015, 0]} width={6} length={WIDTH * 0.55} />
      <KenneyProp name="pottedPlant" position={[flatLength * 0.75, 0, WIDTH / 2 - 0.7]} scale={2.2} />

      {/* Voûte en berceau — demi-cylindre couché, axe le long du corridor.
          `noCollide` : la rotation composée (cylindre + groupe incliné de
          ANGLE) produit une AABB qui plonge jusque dans la hauteur de
          collision de l'avatar sur toute la longueur du corridor. Un
          plafond décoratif n'a de toute façon aucune raison de bloquer un
          déplacement au sol. */}
      <mesh
        position={[LENGTH / 2, HALL_HEIGHT - 0.4 + RISE / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ noCollide: true }}
      >
        <cylinderGeometry args={[WIDTH / 2 + 0.3, WIDTH / 2 + 0.3, LENGTH, 20, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#241F16" roughness={0.85} side={THREE.BackSide} />
      </mesh>

      <CandleLight position={[flatLength * 0.25, 0.6, 0]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[flatLength * 0.55, 0.6, 0]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[flatLength * 0.85, 0.6, 0]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[flatLength + STAIR_RUN * 0.7, 0.6 + RISE * 0.7, 0]} intensity={1.0} avatarRef={avatarRef} />
      <DistanceCulledLight color="#9FC8FF" intensity={1.8} distance={16} decay={2} position={[LENGTH - 2, 3 + RISE, 0]} avatarRef={avatarRef} activeRadius={30} />
    </group>
  );
}
