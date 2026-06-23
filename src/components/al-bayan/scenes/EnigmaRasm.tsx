"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
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
      <Html position={[0, -0.26, 0]} center>
        <span style={{ fontSize: 16, color: "#1C2840", fontFamily: "serif", whiteSpace: "nowrap", pointerEvents: "none", direction: "rtl" }}>
          ـ​ـ​ـ​ـ​ـ​ـ​ـ
        </span>
      </Html>
      <Html position={[0, -0.05, 0.6]} center>
        <span style={{ fontSize: 9, color: "#60a5fa", fontFamily: "var(--font-dm-sans)", fontWeight: 700, whiteSpace: "nowrap", pointerEvents: "none" }}>
          Examiner le manuscrit
        </span>
      </Html>
    </group>
  );
}

interface EnigmaRasmProps {
  onConfirm?: () => void;
}

export default function EnigmaRasm({ onConfirm }: EnigmaRasmProps) {
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0A0E18", roughness: 0.95 }), []);
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <group>
      <ambientLight color="#060810" intensity={0.35} />
      <pointLight color="#60a5fa" intensity={1.4} distance={14} decay={1.6} position={[0, 5, 0]} />

      <mesh position={[0, 3, -6]} receiveShadow castShadow><boxGeometry args={[12, 6, 0.25]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh position={[0, 3, 6]} receiveShadow castShadow><boxGeometry args={[12, 6, 0.25]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh position={[-6, 3, 0]} receiveShadow castShadow><boxGeometry args={[0.25, 6, 12]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh position={[6, 3, 0]} receiveShadow castShadow><boxGeometry args={[0.25, 6, 12]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#080B14" roughness={0.7} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#04060A" roughness={0.95} /></mesh>

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
