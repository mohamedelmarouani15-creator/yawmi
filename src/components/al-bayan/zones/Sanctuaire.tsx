"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Stars } from "@react-three/drei";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import Astrolabe from "../world/Astrolabe";
import EnigmaRoute from "../scenes/EnigmaRoute";
import Hud3DLabel from "../shared/Hud3DLabel";

const RADIUS = 8;
const H = 9;
// "surélevée" — l'offset Y (+0.4) est appliqué par AlBayanWorld, pas ici.

// Enceinte circulaire — ouverte uniquement sur l'arc qui fait face au
// Vestibule (+Z, theta=PI/2 dans la paramétrisation de CylinderGeometry :
// x=-r*cos(theta), z=r*sin(theta)). Le reste du cercle (~316°) est un vrai
// mur de pierre, plus le pan plat unique d'avant qui laissait presque tout
// le pourtour ouvert sur le vide.
const GAP_HALF_ANGLE = 0.4;
const WALL_THETA_START = Math.PI / 2 + GAP_HALF_ANGLE;
const WALL_THETA_LENGTH = Math.PI * 2 - GAP_HALF_ANGLE * 2;

/** Étoile à 8 branches émissive incrustée dans le marbre — même principe que les tapis d'or de maison-sagesse. */
function StarInlay({ position, rotZ }: { position: [number, number]; rotZ: number }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const r = 0.18, ir = 0.08, pts = 8;
    for (let i = 0; i < pts * 2; i++) {
      const angle = (i * Math.PI) / pts - Math.PI / 2;
      const radius = i % 2 === 0 ? r : ir;
      if (i === 0) shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      else shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, rotZ]} position={[position[0], 0.004, position[1]]}>
      <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} roughness={0.4} metalness={0.6} />
    </mesh>
  );
}

// Rotation par étoile dérivée de l'indice (déterministe, pas de Math.random
// au rendu — react-hooks/purity l'interdit dans le corps d'un composant).
const STAR_LAYOUT: { position: [number, number]; rotZ: number }[] = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2 + i * 0.7;
  const r = 1.5 + (i % 5) * 1.3;
  return { position: [Math.cos(a) * r, Math.sin(a) * r], rotZ: (i * 0.41) % Math.PI };
});

/**
 * Zone 4 — Le Sanctuaire de l'Astrolabe (Quête de la Route). Plateforme
 * circulaire surélevée, dôme ouvert sur un ciel nocturne, marbre noir
 * incrusté d'étoiles dorées émissives, grand astrolabe en laiton au
 * centre (purement décoratif), table-carte (EnigmaRoute) excentrée pour
 * ne pas se superposer au centerpiece.
 */
export default function Sanctuaire({ onConfirm }: { onConfirm?: () => void }) {
  const marbleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0A0A0E", roughness: 0.2, metalness: 0.3 }), []);

  return (
    <group>
      {/* Puits céleste bleu argenté à travers la coupole — tranche avec le chaud du reste du complexe */}
      <spotLight
        position={[0, H + 1, 0]}
        target-position={[0, 0, 0]}
        angle={0.55}
        penumbra={0.5}
        intensity={4}
        distance={H + 4}
        color="#9FC8FF"
      />
      <pointLight color="#5EEAD4" intensity={0.9} distance={7} decay={2} position={[0, 1.5, 0]} />

      {/* Sol circulaire en marbre noir */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[RADIUS, RADIUS, 0.08, 48]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      {STAR_LAYOUT.map((s, i) => <StarInlay key={i} position={s.position} rotZ={s.rotZ} />)}

      {/* Dôme ouvert — segment de sphère, même technique que VaultedCeiling (maison-sagesse) */}
      <mesh position={[0, H * 0.4, 0]}>
        <sphereGeometry args={[RADIUS * 1.05, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial color="#0E1A2E" roughness={0.7} side={THREE.BackSide} />
      </mesh>
      <group position={[0, H * 1.15, 0]}>
        <Stars radius={30} depth={8} count={250} factor={2} fade speed={0.3} />
      </group>

      {/* Enceinte circulaire en pierre de taille sombre — referme tout le
          pourtour sauf l'arc face au Vestibule. */}
      <mesh position={[0, H / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[RADIUS, RADIUS, H, 48, 1, true, WALL_THETA_START, WALL_THETA_LENGTH]} />
        <meshStandardMaterial color="#14141A" roughness={0.78} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      <group position={[0, 0.8, 0]}>
        <Astrolabe scale={2.6} />
      </group>
      {/* Balise de quête — hauteur constante 2.2 au-dessus de l'objet, repère visible de loin */}
      <Hud3DLabel position={[0, 3.0, 0]} variant="beacon">🔭 L&apos;Astrolabe</Hud3DLabel>

      <group position={[3.4, 0, 2.4]}>
        <EnigmaRoute onConfirm={onConfirm} />
      </group>

      <CandleLight position={[-5, 0.4, 2]} intensity={1.2} />
      <CandleLight position={[5, 0.4, -2]} intensity={1.2} />
    </group>
  );
}
