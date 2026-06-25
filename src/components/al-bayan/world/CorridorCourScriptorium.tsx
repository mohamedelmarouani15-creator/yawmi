"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";

// Corridor en espace MONDE (pas niché dans le repère tourné d'une zone) —
// relie l'ouverture taillée dans le mur "sud" de la Cour du Témoignage
// (monde X≈11, Z≈6.9) à celle taillée dans le mur "sud" du Scriptorium
// (monde X≈-11, Z≈6.4). Le corps principal démarre à Z=7.3, AU-DELÀ de la
// limite du Vestibule (Z=7) — un Z_NEAR plus bas chevauchait son volume
// (bug constaté : avatar bloqué presque au spawn par cette géométrie en
// conflit). De courtes jonctions relient chaque seuil de zone (6.9 / 6.4)
// au bord du corridor (7.3).
const COUR_OPENING_X = 11;
const SCRIPTORIUM_OPENING_X = -11;
const OPENING_HALF = 1.6;
const COUR_WALL_Z = 6.9;
const SCRIPTORIUM_WALL_Z = 6.4;
const Z_NEAR = 7.3; // bord proche du corps principal — clair du Vestibule (Z=7)
const Z_FAR = 10.3; // bord lointain (largeur du corps principal = 3)
const HALL_HEIGHT = 3.6;
const STEP_DOWN = 0.6; // écart de niveau Cour (y=0) -> Scriptorium (y=-0.6)

export default function CorridorCourScriptorium() {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#241B10", roughness: 0.7, metalness: 0.05 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#352818", roughness: 0.8 }), []);
  const stepMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3A3024", roughness: 0.85 }), []);

  const length = COUR_OPENING_X - SCRIPTORIUM_OPENING_X + OPENING_HALF * 2; // X∈[-12.6,12.6]
  const centerX = (COUR_OPENING_X + SCRIPTORIUM_OPENING_X) / 2; // 0
  const width = Z_FAR - Z_NEAR;
  const centerZ = (Z_NEAR + Z_FAR) / 2;
  const openingWidth = OPENING_HALF * 2;

  return (
    <group>
      {/* Corps principal du couloir, niveau Cour (y=0) */}
      <mesh position={[centerX, 0, centerZ]} receiveShadow castShadow>
        <boxGeometry args={[length, 0.1, width]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Jonction côté Cour — comble le petit écart entre son mur (Z=6.9) et le corps principal (Z=7.3) */}
      <mesh position={[COUR_OPENING_X, 0, (COUR_WALL_Z + Z_NEAR) / 2]} receiveShadow castShadow>
        <boxGeometry args={[openingWidth, 0.1, Z_NEAR - COUR_WALL_Z]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Jonction côté Scriptorium — comble l'écart Z=6.4 -> Z=7.3, plus les 2 marches descendantes */}
      <mesh position={[SCRIPTORIUM_OPENING_X, 0, (SCRIPTORIUM_WALL_Z + 0.45 + Z_NEAR) / 2]} receiveShadow castShadow>
        <boxGeometry args={[openingWidth, 0.1, Z_NEAR - (SCRIPTORIUM_WALL_Z + 0.45)]} />
        <primitive object={floorMat} attach="material" />
      </mesh>
      <mesh position={[SCRIPTORIUM_OPENING_X, -STEP_DOWN * 0.33, SCRIPTORIUM_WALL_Z + 0.45]} material={stepMat} receiveShadow castShadow>
        <boxGeometry args={[openingWidth, STEP_DOWN * 0.66, 0.9]} />
      </mesh>
      <mesh position={[SCRIPTORIUM_OPENING_X, -STEP_DOWN * 0.66, SCRIPTORIUM_WALL_Z + 0.05]} material={stepMat} receiveShadow castShadow>
        <boxGeometry args={[openingWidth, STEP_DOWN * 0.33, 0.5]} />
      </mesh>

      {/* Paroi lointaine (Z_FAR) — continue sur toute la longueur, aucune
          jonction ne débouche de ce côté. */}
      <mesh position={[centerX, HALL_HEIGHT / 2 - 0.4, Z_FAR]} receiveShadow castShadow>
        <boxGeometry args={[length, HALL_HEIGHT, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Paroi proche (Z_NEAR) — UNIQUEMENT la portion centrale : les deux
          jonctions (Cour à droite, Scriptorium à gauche) débouchent
          justement par ce côté. Un mur plein sur toute la longueur ici
          bloquait ses propres entrées (bug constaté : avatar bloqué pile
          au seuil, incapable de passer de Z=6.9/6.4 à Z=7.3). */}
      <mesh position={[centerX, HALL_HEIGHT / 2 - 0.4, Z_NEAR]} receiveShadow castShadow>
        <boxGeometry args={[length - openingWidth * 2, HALL_HEIGHT, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Voûte en berceau — demi-cylindre couché, axe le long de X.
          `noCollide` par cohérence avec le corridor Scriptorium↔Sanctuaire
          (cf. ce fichier) : un plafond décoratif ne doit jamais bloquer un
          déplacement au sol, même si celui-ci n'est pas tourné. */}
      <mesh position={[centerX, HALL_HEIGHT - 0.4, centerZ]} rotation={[0, 0, Math.PI / 2]} userData={{ noCollide: true }}>
        <cylinderGeometry args={[width / 2, width / 2, length, 16, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#2A2014" roughness={0.85} side={THREE.BackSide} />
      </mesh>

      <CandleLight position={[COUR_OPENING_X - 4, 0.6, centerZ]} intensity={0.9} />
      <CandleLight position={[0, 0.6, centerZ]} intensity={0.9} />
      <CandleLight position={[SCRIPTORIUM_OPENING_X + 4, 0.4, centerZ]} intensity={0.9} />
      <pointLight color="#E8A33D" intensity={1.4} distance={8} decay={2} position={[centerX, 2, centerZ]} />
    </group>
  );
}
