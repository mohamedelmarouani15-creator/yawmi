"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../shared/CandleLight";
import { HALL, QUEST_SIZE, CORRIDOR_HALF_WIDTH, ZONES } from "@/lib/maison-sagesse/zone-layout";

// Hauteur des murs de corridor — alignée sur la PLUS PETITE des deux zones
// reliées (les 3 corridors relient tous le Hall, H=8, à une quête, H=6) pour
// ne jamais dépasser le mur de la salle de quête à la jonction : un mur de
// corridor à hauteur du Hall créerait un surplomb visible de ~2 unités
// exactement là où le corridor débouche dans la quête (décrochage constaté
// à l'audit). Rester plus bas que le Hall aussi est cohérent avec l'esprit
// « resserré » déjà assumé pour la voûte (CEIL_H, plus basse que les deux).
const CORRIDOR_WALL_HEIGHT = QUEST_SIZE.H;
const CEIL_H = 3.6; // hauteur de la voûte du corridor (plus bas que les salles, effet resserré)

interface StraightCorridorProps {
  /** 'x' relie deux zones alignées en X (est/ouest) ; 'z' en Z (nord/sud). */
  axis: "x" | "z";
  /** Bord de la zone de départ (monde) sur l'axe de circulation. */
  near: number;
  /** Bord de la zone d'arrivée (monde) sur l'axe de circulation. */
  far: number;
  /** Position fixe (monde) sur l'axe perpendiculaire — généralement 0. */
  cross: number;
}

/** Corridor rectiligne en coordonnées MONDE reliant deux ouvertures déjà
 * taillées dans les murs des zones (voir MainHall.tsx / QuestFaith.tsx /
 * QuestScience.tsx / QuestWisdom.tsx). Toutes les zones étant au même niveau
 * Y=0 ici (contrairement à al-bayan), aucune marche n'est nécessaire. */
function StraightCorridor({ axis, near, far, cross }: StraightCorridorProps) {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1E1408", roughness: 0.7, metalness: 0.05 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2C1810", roughness: 0.85 }), []);

  const length = Math.abs(far - near);
  const center = (near + far) / 2;
  const width = CORRIDOR_HALF_WIDTH * 2;

  const floorSize: [number, number, number] = axis === "z" ? [width, 0.1, length] : [length, 0.1, width];
  const floorPos: [number, number, number] = axis === "z" ? [cross, 0, center] : [center, 0, cross];

  const wallSize: [number, number, number] = axis === "z" ? [0.3, CORRIDOR_WALL_HEIGHT, length] : [length, CORRIDOR_WALL_HEIGHT, 0.3];
  const wallOffset = width / 2;
  const wallAPos: [number, number, number] =
    axis === "z" ? [cross - wallOffset, CORRIDOR_WALL_HEIGHT / 2 - 0.4, center] : [center, CORRIDOR_WALL_HEIGHT / 2 - 0.4, cross - wallOffset];
  const wallBPos: [number, number, number] =
    axis === "z" ? [cross + wallOffset, CORRIDOR_WALL_HEIGHT / 2 - 0.4, center] : [center, CORRIDOR_WALL_HEIGHT / 2 - 0.4, cross + wallOffset];

  const vaultRotation: [number, number, number] = axis === "z" ? [0, 0, 0] : [0, 0, Math.PI / 2];
  const vaultLength = length;

  const candleCount = Math.max(1, Math.floor(length / 4));
  const candlePositions = Array.from({ length: candleCount }, (_, i) => {
    const t = (i + 0.5) / candleCount;
    const pos = near + (far - near) * t;
    return axis === "z" ? ([cross, 0.6, pos] as [number, number, number]) : ([pos, 0.6, cross] as [number, number, number]);
  });

  return (
    <group>
      <mesh position={floorPos} receiveShadow castShadow>
        <boxGeometry args={floorSize} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      <mesh position={wallAPos} receiveShadow castShadow>
        <boxGeometry args={wallSize} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={wallBPos} receiveShadow castShadow>
        <boxGeometry args={wallSize} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Voûte décorative — jamais un obstacle (noCollide) */}
      <mesh
        position={[axis === "z" ? cross : center, CEIL_H, axis === "z" ? center : cross]}
        rotation={vaultRotation}
        userData={{ noCollide: true }}
      >
        <cylinderGeometry args={[width / 2, width / 2, vaultLength, 16, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#241A0C" roughness={0.85} side={THREE.BackSide} />
      </mesh>

      {candlePositions.map((pos, i) => (
        <CandleLight key={i} position={pos} intensity={0.85} />
      ))}
    </group>
  );
}

/** Les 3 corridors reliant le Hall aux 3 quêtes. */
export default function Corridors() {
  const hallHalfW = HALL.W / 2;
  const hallHalfD = HALL.D / 2;
  const questHalfW = QUEST_SIZE.W / 2;
  const questHalfD = QUEST_SIZE.D / 2;

  return (
    <group>
      {/* Hall ↔ Science (nord, axe Z) */}
      <StraightCorridor axis="z" near={-hallHalfD} far={ZONES.science.position[2] + questHalfD} cross={0} />
      {/* Hall ↔ Foi (ouest, axe X) */}
      <StraightCorridor axis="x" near={-hallHalfW} far={ZONES.faith.position[0] + questHalfW} cross={0} />
      {/* Hall ↔ Sagesse (est, axe X) */}
      <StraightCorridor axis="x" near={hallHalfW} far={ZONES.wisdom.position[0] - questHalfW} cross={0} />
    </group>
  );
}
