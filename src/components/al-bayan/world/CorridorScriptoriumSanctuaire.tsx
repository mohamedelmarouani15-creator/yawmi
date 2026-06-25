"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";

// Corridor diagonal en espace MONDE reliant l'ouverture du mur "nord" du
// Scriptorium (monde X≈-14.5, Z≈-6.4, y=-0.6) à l'ouverture taillée dans
// l'enceinte circulaire du Sanctuaire (theta≈0.769 rad depuis son centre,
// y=0.4 — "surélevée"). Les deux points + l'angle/longueur sont dérivés
// géométriquement plutôt que des constantes à la main, pour rester exacts
// si l'un des deux seuils bouge un jour.
const SCRIPTORIUM_OPENING = { x: -14.5, y: -0.6, z: -6.4 };
const SANCTUAIRE_CENTER = { x: 0, y: 0.4, z: -14 };
const SANCTUAIRE_RADIUS = 8;
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
const RISE = SANCTUAIRE_OPENING.y - SCRIPTORIUM_OPENING.y; // +1.0 (Scriptorium -> Sanctuaire surélevé)

const WIDTH = 3;
const HALL_HEIGHT = 3.6;
const STAIR_RUN = 3.2; // longueur (le long du corridor) occupée par les marches, côté Sanctuaire
const WALL_SEGMENTS = 6; // cf. commentaire sur le débordement d'AABB des parois

export default function CorridorScriptoriumSanctuaire() {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1C1812", roughness: 0.65, metalness: 0.08 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2C261C", roughness: 0.8 }), []);
  const stepMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3A3024", roughness: 0.85 }), []);

  const flatLength = LENGTH - STAIR_RUN;
  const stepCount = 4;
  const stepRun = STAIR_RUN / stepCount;
  const stepRise = RISE / stepCount;

  return (
    // Groupe positionné au seuil Scriptorium, tourné vers le seuil Sanctuaire
    // — tout le reste est exprimé en coordonnées locales le long de l'axe X.
    <group position={[SCRIPTORIUM_OPENING.x, SCRIPTORIUM_OPENING.y, SCRIPTORIUM_OPENING.z]} rotation={[0, -ANGLE, 0]}>
      {/* Tronçon plat (niveau Scriptorium) */}
      <mesh position={[flatLength / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[flatLength, 0.1, WIDTH]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Escalier montant vers le Sanctuaire (4 marches, +RISE au total) */}
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
          (~13°, ANGLE) ; l'AABB d'une longue boîte tournée déborde large-
          ment de sa vraie épaisseur (bug constaté : un mur de 9 unités à
          13° avait une AABB ~2,3 unités plus large que son épaisseur
          réelle, bloquant l'entrée du corridor depuis l'intérieur du
          Scriptorium alors qu'il n'y avait là aucune paroi). Des segments
          de ~1,5 unité ramènent ce débordement à une fraction négligeable. */}
      {[-1, 1].map((side) =>
        Array.from({ length: WALL_SEGMENTS }, (_, i) => {
          const segCenter = (LENGTH / WALL_SEGMENTS) * (i + 0.5);
          return (
            <mesh key={`${side}-${i}`} position={[segCenter, HALL_HEIGHT / 2 - 0.3 + RISE / 2, side * (WIDTH / 2 + 0.15)]} receiveShadow castShadow>
              <boxGeometry args={[LENGTH / WALL_SEGMENTS, HALL_HEIGHT, 0.3]} />
              <primitive object={wallMat} attach="material" />
            </mesh>
          );
        })
      )}

      {/* Voûte en berceau — demi-cylindre couché, axe le long du corridor.
          `noCollide` : la rotation composée (cylindre + groupe incliné de
          ANGLE) produit une AABB qui plonge jusque dans la hauteur de
          collision de l'avatar sur toute la longueur du corridor (bug
          constaté : un plafond bloquait l'entrée depuis l'intérieur du
          Scriptorium). Un plafond décoratif n'a de toute façon aucune
          raison de bloquer un déplacement au sol. */}
      <mesh
        position={[LENGTH / 2, HALL_HEIGHT - 0.3 + RISE / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ noCollide: true }}
      >
        <cylinderGeometry args={[WIDTH / 2 + 0.3, WIDTH / 2 + 0.3, LENGTH, 16, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#241F16" roughness={0.85} side={THREE.BackSide} />
      </mesh>

      <CandleLight position={[flatLength * 0.3, 0.6, 0]} intensity={0.9} />
      <CandleLight position={[flatLength * 0.7, 0.6, 0]} intensity={0.9} />
      <CandleLight position={[flatLength + STAIR_RUN * 0.7, 0.6 + RISE * 0.7, 0]} intensity={0.9} />
      <pointLight color="#9FC8FF" intensity={1.1} distance={6} decay={2} position={[LENGTH - 1, 1.5 + RISE, 0]} />
    </group>
  );
}
