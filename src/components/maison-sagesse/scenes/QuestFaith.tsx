"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import FloatingScroll from "../shared/FloatingScroll";
import CandleLight from "../shared/CandleLight";
import AmbientParticles from "../shared/AmbientParticles";
import { PILLAR_RIDDLES, PILLAR_LIFE_ORDER } from "@/lib/maison-sagesse/puzzle-logic";

const SCROLL_POSITIONS: Record<string, [number, number, number]> = {
  shahada: [-4, 1.6, -3],
  salat: [3, 1.8, -2],
  zakat: [-2.5, 1.4, 2],
  sawm: [4, 1.5, 2.5],
  hajj: [0, 1.7, -4],
};

const PILLARS_OF_ISLAM = PILLAR_LIFE_ORDER.map((id) => ({
  ...PILLAR_RIDDLES[id],
  position: SCROLL_POSITIONS[id],
}));

// Riddle reading modal — appears when a scroll is clicked
function RiddleModal({
  pillarId,
  position,
  onClose,
}: {
  pillarId: string;
  position: number | null;
  onClose: () => void;
}) {
  const pillar = PILLAR_RIDDLES[pillarId];
  return (
    <Html fullscreen>
      <motion.div
        className="w-full h-full flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", pointerEvents: "auto" }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-sm w-full rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(13,32,24,0.98) 0%, rgba(6,16,10,0.99) 100%)",
            border: "1px solid rgba(52,211,153,0.35)",
            boxShadow: "0 0 40px rgba(52,211,153,0.12)",
          }}
        >
          <p className="text-center mb-2" style={{ fontSize: 20, direction: "rtl", color: "#D4AF37", fontFamily: "serif" }}>
            {pillar.arabic}
          </p>
          <p
            className="rounded-xl p-3 mb-4"
            style={{
              fontSize: 12,
              lineHeight: 1.65,
              color: "rgba(248,244,236,0.85)",
              fontFamily: "var(--font-dm-sans)",
              background: "rgba(248,244,236,0.04)",
              border: "1px solid rgba(248,244,236,0.08)",
            }}
          >
            {pillar.riddle}
          </p>
          <p className="text-center mb-3" style={{ fontSize: 10, color: "rgba(212,175,55,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            {position !== null ? `Placé en position ${position + 1} dans la rangée.` : "Retiré de la rangée."}
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-xl py-2"
            style={{
              background: "rgba(52,211,153,0.15)",
              border: "1px solid rgba(52,211,153,0.3)",
              color: "#34d399",
              fontSize: 11,
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 700,
            }}
          >
            Refermer le parchemin
          </button>
        </motion.div>
      </motion.div>
    </Html>
  );
}

// Central pedestal where scrolls are placed in order
function Pedestal() {
  const baseMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3D2010",
        roughness: 0.85,
        metalness: 0.1,
      }),
    []
  );
  const topMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#8B7355",
        roughness: 0.7,
        metalness: 0.2,
        emissive: "#3D2A10",
        emissiveIntensity: 0.1,
      }),
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {/* Base step */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.1, 1.25, 0.2, 12]} />
        <primitive object={baseMat} attach="material" />
      </mesh>
      {/* Middle column */}
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.65, 0.72, 0.8, 10]} />
        <primitive object={baseMat} attach="material" />
      </mesh>
      {/* Top surface */}
      <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.9, 0.65, 0.2, 12]} />
        <primitive object={topMat} attach="material" />
      </mesh>
    </group>
  );
}

// Crescent and star in a wall niche — incandescent
function CrescentAndStar() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime();
      matRef.current.emissiveIntensity = 0.8 + Math.sin(t * 1.4) * 0.3;
    }
  });

  const emissiveMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFD700",
        emissive: "#FFA500",
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.8,
      }),
    []
  );

  return (
    <group position={[0, 4.5, -5.8]}>
      {/* Crescent: torus with a blocking sphere creating the crescent shape */}
      <group rotation={[0, 0, Math.PI * 0.15]}>
        <mesh castShadow>
          <torusGeometry args={[0.55, 0.12, 8, 32, Math.PI * 1.4]} />
          <primitive object={emissiveMat} attach="material" />
        </mesh>
      </group>
      {/* Star — 6-pointed using two triangles */}
      <mesh position={[0.55, 0.35, 0]} castShadow>
        <torusGeometry args={[0.2, 0.05, 5, 6]} />
        <primitive object={emissiveMat} attach="material" />
      </mesh>
      <pointLight
        ref={matRef as unknown as React.RefObject<THREE.PointLight>}
        color="#FFD700"
        intensity={1.2}
        distance={4}
        decay={2}
      />
    </group>
  );
}

// Niche housing
function WallNiche({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Niche recess */}
      <mesh receiveShadow>
        <boxGeometry args={[2.2, 3, 0.6]} />
        <meshStandardMaterial color="#1A0E08" roughness={0.95} />
      </mesh>
      {/* Niche arch top */}
      <mesh position={[0, 1.1, 0.05]}>
        <cylinderGeometry args={[1.1, 1.1, 0.3, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#2C1810" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Confirmation stone tablet
function ConfirmationTablet({ onConfirm, feedback }: { onConfirm?: () => void; feedback: string | null }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime();
      matRef.current.emissiveIntensity = hovered ? 0.8 + Math.sin(t * 4) * 0.2 : 0.25 + Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group
      position={[0, 0.5, 2.5]}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => { e.stopPropagation(); onConfirm?.(); }}
    >
      {/* Stone slab */}
      <mesh castShadow receiveShadow rotation={[-Math.PI * 0.08, 0, 0]}>
        <boxGeometry args={[2.4, 0.9, 0.12]} />
        <meshStandardMaterial
          ref={matRef}
          color="#3D2A10"
          emissive="#055C3F"
          emissiveIntensity={0.25}
          roughness={0.8}
          metalness={0.15}
        />
      </mesh>
      {/* Tablet legs */}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, -0.6, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.7, 6]} />
          <meshStandardMaterial color="#2C1810" roughness={0.9} />
        </mesh>
      ))}
      {/* Text */}
      <Html position={[0, 0.08, 0.07]} center>
        <span style={{ color: "#D4AF37", fontSize: "9px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(212,175,55,0.8)", pointerEvents: "none" }}>
          Valider l&apos;ordre
        </span>
      </Html>
      {feedback && (
        <Html position={[0, 0.7, 0.07]} center>
          <span style={{ color: "#f87171", fontSize: "10px", fontFamily: "var(--font-dm-sans)", fontWeight: 700, whiteSpace: "nowrap", textShadow: "0 0 8px rgba(0,0,0,0.8)", pointerEvents: "none" }}>
            {feedback}
          </span>
        </Html>
      )}
    </group>
  );
}

interface QuestFaithProps {
  onConfirm?: () => void;
}

export default function QuestFaith({ onConfirm }: QuestFaithProps) {
  const [order, setOrder] = useState<string[]>([]);
  const [modalPillar, setModalPillar] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleScrollClick = (pillarId: string) => {
    setOrder((prev) => {
      if (prev.includes(pillarId)) return prev.filter((id) => id !== pillarId);
      if (prev.length >= 5) return prev;
      return [...prev, pillarId];
    });
    setModalPillar(pillarId);
    setFeedback(null);
  };

  const handleConfirm = () => {
    if (order.length < 5) {
      setFeedback("Il manque encore des parchemins dans la rangée...");
      setTimeout(() => setFeedback(null), 2500);
      return;
    }
    const isCorrect = order.every((id, i) => id === PILLAR_LIFE_ORDER[i]);
    if (isCorrect) {
      onConfirm?.();
    } else {
      setFeedback("Cet ordre n'est pas le bon... reconsidérez la rangée.");
      setTimeout(() => setFeedback(null), 2500);
    }
  };
  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0D2018",
        roughness: 0.92,
        metalness: 0.02,
      }),
    []
  );

  return (
    <group>
      {/* ── Lighting ── */}
      <ambientLight color="#021508" intensity={0.35} />
      <pointLight color="#064A2F" intensity={1.8} distance={14} decay={1.5} position={[0, 5, 0]} castShadow />
      <pointLight color="#1A8040" intensity={0.8} distance={8} decay={2} position={[0, 4.5, -5]} />

      {/* ── Room walls 12×6×12 ── */}
      <mesh position={[0, 3, -6]} receiveShadow castShadow>
        <boxGeometry args={[12, 6, 0.25]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[0, 3, 6]} receiveShadow castShadow>
        <boxGeometry args={[12, 6, 0.25]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[-6, 3, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.25, 6, 12]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[6, 3, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.25, 6, 12]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0D1A10" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#060D08" roughness={0.95} />
      </mesh>

      {/* ── Niche with crescent/star on back wall ── */}
      <WallNiche position={[0, 3.8, -5.7]} />
      <CrescentAndStar />

      {/* ── Calligraphy panel on wall ── */}
      <mesh position={[0, 2.5, -5.65]} receiveShadow>
        <planeGeometry args={[5, 2]} />
        <meshStandardMaterial color="#D4B896" roughness={0.9} />
      </mesh>
      <Html position={[0, 2.5, -5.6]} center>
        <span style={{ color: "#3D2010", fontSize: "14px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "none", pointerEvents: "none", direction: "rtl" }}>
          أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ
        </span>
      </Html>

      {/* ── 5 Floating scrolls (pillar riddles) ── */}
      {PILLARS_OF_ISLAM.map((pillar) => {
        const pos = order.indexOf(pillar.id);
        return (
          <FloatingScroll
            key={pillar.id}
            position={pillar.position}
            glowing={true}
            label={pos !== -1 ? String(pos + 1) : undefined}
            onClick={() => handleScrollClick(pillar.id)}
          />
        );
      })}

      {/* ── Central pedestal ── */}
      <Pedestal />

      {/* ── Confirmation tablet ── */}
      <ConfirmationTablet onConfirm={handleConfirm} feedback={feedback} />

      {/* ── Riddle reading modal ── */}
      <AnimatePresence>
        {modalPillar && (
          <RiddleModal
            pillarId={modalPillar}
            position={order.indexOf(modalPillar) !== -1 ? order.indexOf(modalPillar) : null}
            onClose={() => setModalPillar(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Candles ── */}
      <CandleLight position={[-4.5, 0.4, -4.5]} intensity={1.0} />
      <CandleLight position={[4.5, 0.4, -4.5]} intensity={1.0} />
      <CandleLight position={[-4.5, 0.4, 4.5]} intensity={0.8} />
      <CandleLight position={[4.5, 0.4, 4.5]} intensity={0.8} />

      {/* ── Ambient dust ── */}
      <AmbientParticles />
    </group>
  );
}
