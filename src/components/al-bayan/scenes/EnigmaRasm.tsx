"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import Hud3DLabel from "../shared/Hud3DLabel";
import RasmOverlay from "../ui/RasmOverlay";

// Manuscrit central — examiner pour ouvrir l'overlay de points
function ManuscriptTable({ onExamine }: { onExamine: () => void }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime();
      matRef.current.emissiveIntensity = hovered ? 0.7 : 0.2 + Math.sin(t * 1.3) * 0.1;
    }
  });

  return (
    <group position={[0, 0.5, 0]}>
      {/* Table */}
      <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.08, 1.5]} />
        <meshStandardMaterial color="#1C2840" roughness={0.85} />
      </mesh>
      {[-0.9, 0.9].flatMap((x) => [-0.6, 0.6].map((z) => (
        <mesh key={`${x}${z}`} position={[x, -0.75, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.8, 6]} />
          <meshStandardMaterial color="#101828" roughness={0.9} />
        </mesh>
      )))}

      {/* Parchemin */}
      <mesh
        position={[0, -0.28, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
        onClick={(e) => { e.stopPropagation(); onExamine(); }}
      >
        <planeGeometry args={[1.7, 1.1]} />
        <meshStandardMaterial ref={matRef} color="#D4B896" emissive="#60a5fa" emissiveIntensity={0.2} roughness={0.85} />
      </mesh>
      {/* Balise de quête — hauteur constante 2.2 au-dessus de l'objet */}
      <Hud3DLabel position={[0, 2.2, 0]} variant="beacon" accent="#60a5fa">📖 Examiner le manuscrit</Hud3DLabel>
    </group>
  );
}

interface EnigmaRasmProps {
  onConfirm?: () => void;
}

export default function EnigmaRasm({ onConfirm }: EnigmaRasmProps) {
  const [showOverlay, setShowOverlay] = useState(false);

  // Pas de murs/sol propres ici : le Scriptorium (zone dédiée) les fournit
  // désormais — cf. zones/Scriptorium.tsx.
  return (
    <group>
      <ManuscriptTable onExamine={() => setShowOverlay(true)} />

      <CandleLight position={[-4.5, 0.4, -4.5]} intensity={1.0} />
      <CandleLight position={[4.5, 0.4, -4.5]} intensity={1.0} />
      <CandleLight position={[-4.5, 0.4, 4.5]} intensity={0.8} />
      <CandleLight position={[4.5, 0.4, 4.5]} intensity={0.8} />
      <AmbientParticles />

      <AnimatePresence>
        {showOverlay && (
          <Html fullscreen>
            <RasmOverlay
              onClose={() => setShowOverlay(false)}
              onSolved={() => {
                setShowOverlay(false);
                onConfirm?.();
              }}
            />
          </Html>
        )}
      </AnimatePresence>
    </group>
  );
}
