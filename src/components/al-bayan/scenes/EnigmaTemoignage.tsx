"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import { WITNESS_CANDIDATES, RECIT_CHEVAL, REQUIRED_WEIGHT } from "@/lib/al-bayan/puzzle-logic";

const TABLET_POSITIONS: Record<string, [number, number, number]> = {
  khuzayma: [-3.5, 1.5, -1],
  zayd:     [3.5, 1.6, -1],
  uthman:   [-2.5, 1.4, 2.5],
  umar:     [2.5, 1.5, 2.5],
  ali:      [0, 1.7, -3.2],
};

// Récit du cheval — objet examinable
function HorseRecitObject({ onExamine }: { onExamine: () => void }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime();
      matRef.current.emissiveIntensity = hovered ? 0.7 : 0.25 + Math.sin(t * 1.4) * 0.1;
    }
  });

  return (
    <group
      position={[0, 0.55, 3.2]}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      onClick={(e) => { e.stopPropagation(); onExamine(); }}
    >
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.5, 0.06]} />
        <meshStandardMaterial ref={matRef} color="#5C3D1A" emissive="#C8A84B" emissiveIntensity={0.25} roughness={0.8} />
      </mesh>
      <Html position={[0, 0.42, 0.04]} center>
        <span style={{ fontSize: 9, color: "#D4AF37", fontFamily: "var(--font-dm-sans)", fontWeight: 700, whiteSpace: "nowrap", pointerEvents: "none" }}>
          📜 Le Récit du Cheval
        </span>
      </Html>
    </group>
  );
}

function RecitModal({ onClose }: { onClose: () => void }) {
  return (
    <Html fullscreen>
      <motion.div
        className="w-full h-full flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", pointerEvents: "auto" }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-sm w-full rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, rgba(28,20,8,0.98) 0%, rgba(16,11,4,0.99) 100%)", border: "1px solid rgba(212,175,55,0.35)", boxShadow: "0 0 40px rgba(212,175,55,0.12)" }}
        >
          <p className="text-center mb-3" style={{ fontSize: 10, color: "rgba(212,175,55,0.6)", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>
            Le Récit du Cheval
          </p>
          <p className="rounded-xl p-3 mb-4" style={{ fontSize: 12, lineHeight: 1.65, color: "rgba(248,244,236,0.85)", fontFamily: "var(--font-dm-sans)", background: "rgba(248,244,236,0.04)", border: "1px solid rgba(248,244,236,0.08)" }}>
            {RECIT_CHEVAL}
          </p>
          <button onClick={onClose} className="w-full rounded-xl py-2" style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", fontSize: 11, fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}>
            Refermer le parchemin
          </button>
        </motion.div>
      </motion.div>
    </Html>
  );
}

interface WitnessTabletProps {
  id: string;
  name: string;
  arabic: string;
  position: [number, number, number];
  placed: boolean;
  onClick: () => void;
}

function WitnessTablet({ name, arabic, position, placed, onClick }: WitnessTabletProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime();
      matRef.current.emissiveIntensity = placed ? 0.7 : hovered ? 0.5 : 0.2 + Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group
      position={position}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.55, 0.08]} />
        <meshStandardMaterial
          ref={matRef}
          color={placed ? "#D4AF37" : "#3D2A10"}
          emissive={placed ? "#D4AF37" : "#C8A84B"}
          emissiveIntensity={0.25}
          roughness={0.7}
          metalness={placed ? 0.4 : 0.1}
        />
      </mesh>
      <Html position={[0, 0, 0.05]} center>
        <span style={{ fontSize: 14, color: placed ? "#0A0F0D" : "#D4AF37", fontFamily: "serif", whiteSpace: "nowrap", pointerEvents: "none", direction: "rtl" }}>
          {arabic}
        </span>
      </Html>
      <Html position={[0, -0.42, 0.05]} center>
        <span style={{ fontSize: 8, color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap", pointerEvents: "none" }}>
          {name}
        </span>
      </Html>
    </group>
  );
}

function BalanceScale({ weight, onConfirm, feedback }: { weight: 0 | 1 | 2; onConfirm: () => void; feedback: string | null }) {
  const beamRef = useRef<THREE.Group>(null);
  const leftPanRef = useRef<THREE.Group>(null);
  const rightPanRef = useRef<THREE.Group>(null);

  // Bascule visuelle : plateau droit descend si poids suffisant (2), penche légèrement vers la gauche sinon
  const targetTilt = weight >= REQUIRED_WEIGHT ? -0.18 : weight === 1 ? 0.06 : 0;

  useFrame(() => {
    if (beamRef.current) {
      beamRef.current.rotation.z += (targetTilt - beamRef.current.rotation.z) * 0.08;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Pied central */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 2, 8]} />
        <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.1, 12]} />
        <meshStandardMaterial color="#5C3D1A" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Poutre pivotante */}
      <group ref={beamRef} position={[0, 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.6, 0.06, 0.08]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Plateau gauche — parchemin At-Tawba (fixe) */}
        <group ref={leftPanRef} position={[-1.3, -0.4, 0]}>
          <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.01, 0.01, 0.8, 4]} /><meshStandardMaterial color="#8B6914" /></mesh>
          <mesh castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.06, 16]} />
            <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.5, 0.04, 0.35]} />
            <meshStandardMaterial color="#D4B896" roughness={0.85} />
          </mesh>
          <Html position={[0, 0.18, 0]} center>
            <span style={{ fontSize: 8, color: "#D4AF37", fontFamily: "var(--font-dm-sans)", fontWeight: 700, whiteSpace: "nowrap", pointerEvents: "none" }}>
              At-Tawba 128-129
            </span>
          </Html>
        </group>

        {/* Plateau droit — témoin */}
        <group ref={rightPanRef} position={[1.3, -0.4, 0]}>
          <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.01, 0.01, 0.8, 4]} /><meshStandardMaterial color="#8B6914" /></mesh>
          <mesh castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.06, 16]} />
            <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.7} />
          </mesh>
          <Html position={[0, 0.18, 0]} center>
            <span style={{ fontSize: 8, color: weight >= REQUIRED_WEIGHT ? "#34d399" : "rgba(248,244,236,0.5)", fontFamily: "var(--font-dm-sans)", fontWeight: 700, whiteSpace: "nowrap", pointerEvents: "none" }}>
              Poids : {weight}/2
            </span>
          </Html>
        </group>
      </group>

      {/* Confirmation */}
      <Html position={[0, -0.6, 0.8]} center>
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onConfirm}
            style={{ pointerEvents: "auto", background: "linear-gradient(135deg,#7a5c1a,#D4AF37)", border: "1px solid rgba(212,175,55,0.7)", color: "#0A0F0D", fontFamily: "var(--font-dm-sans)", fontWeight: 800, fontSize: 11, borderRadius: 10, padding: "8px 16px", cursor: "pointer" }}
          >
            Sceller le jugement
          </button>
          {feedback && (
            <span style={{ fontSize: 10, color: "#f87171", fontFamily: "var(--font-dm-sans)", fontWeight: 700, textShadow: "0 0 8px rgba(0,0,0,0.8)" }}>
              {feedback}
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}

interface EnigmaTemoignageProps {
  onConfirm?: () => void;
}

export default function EnigmaTemoignage({ onConfirm }: EnigmaTemoignageProps) {
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1A1208", roughness: 0.92 }), []);
  const [placedWitnessId, setPlacedWitnessId] = useState<string | null>(null);
  const [showRecit, setShowRecit] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const placedWitness = WITNESS_CANDIDATES.find((w) => w.id === placedWitnessId);
  const weight = (placedWitness?.weight ?? 0) as 0 | 1 | 2;

  const handleConfirm = () => {
    if (weight >= REQUIRED_WEIGHT) {
      onConfirm?.();
    } else {
      setFeedback(weight === 0 ? "Pose d'abord un témoin sur le plateau..." : "Le poids est insuffisant (1/2)...");
      setTimeout(() => setFeedback(null), 2200);
    }
  };

  return (
    <group>
      <ambientLight color="#1a1408" intensity={0.32} />
      <pointLight color="#D4AF37" intensity={1.6} distance={14} decay={1.5} position={[0, 5, 0]} castShadow />

      <mesh position={[0, 3, -6]} receiveShadow castShadow><boxGeometry args={[12, 6, 0.25]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh position={[0, 3, 6]} receiveShadow castShadow><boxGeometry args={[12, 6, 0.25]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh position={[-6, 3, 0]} receiveShadow castShadow><boxGeometry args={[0.25, 6, 12]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh position={[6, 3, 0]} receiveShadow castShadow><boxGeometry args={[0.25, 6, 12]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#120D08" roughness={0.7} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#0A0600" roughness={0.95} /></mesh>

      <BalanceScale weight={weight} onConfirm={handleConfirm} feedback={feedback} />

      {WITNESS_CANDIDATES.map((w) => (
        <WitnessTablet
          key={w.id}
          id={w.id}
          name={w.name}
          arabic={w.arabic}
          position={TABLET_POSITIONS[w.id]}
          placed={placedWitnessId === w.id}
          onClick={() => setPlacedWitnessId((cur) => (cur === w.id ? null : w.id))}
        />
      ))}

      <HorseRecitObject onExamine={() => setShowRecit(true)} />

      <CandleLight position={[-4.5, 0.4, -4.5]} intensity={1.0} />
      <CandleLight position={[4.5, 0.4, -4.5]} intensity={1.0} />
      <AmbientParticles />

      <AnimatePresence>
        {showRecit && <RecitModal onClose={() => setShowRecit(false)} />}
      </AnimatePresence>
    </group>
  );
}
