"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Stars } from "@react-three/drei";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import Astrolabe from "../world/Astrolabe";
import EnigmaRoute from "../scenes/EnigmaRoute";

const RADIUS = 8;
const H = 9;
// "surélevée" — l'offset Y (+0.4) est appliqué par AlBayanWorld, pas ici.

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
      <pointLight color="#5EEAD4" intensity={0.9} distance={5.5} decay={2} position={[0, 1.5, 0]} />

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

      {/* Mur extérieur bas (le seul côté sans zone voisine, juste assez pour fermer la vue) */}
      <mesh position={[0, H * 0.18, -RADIUS + 0.4]} receiveShadow>
        <boxGeometry args={[RADIUS * 1.3, H * 0.36, 0.3]} />
        <meshStandardMaterial color="#0A0A0E" roughness={0.85} />
      </mesh>

      <group position={[0, 0.8, 0]}>
        <Astrolabe scale={2.6} />
      </group>

      <group position={[3.4, 0, 2.4]}>
        <EnigmaRoute onConfirm={onConfirm} />
      </group>

      <CandleLight position={[-5, 0.4, 2]} intensity={1.2} />
      <CandleLight position={[5, 0.4, -2]} intensity={1.2} />
    </group>
  );
}
