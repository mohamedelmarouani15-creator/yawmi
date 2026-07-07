"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import FloatingScroll from "../shared/FloatingScroll";
import CandleLight from "../shared/CandleLight";
import AmbientParticles from "../shared/AmbientParticles";
import ProximityPrompt from "../shared/ProximityPrompt";
import ZoneWall from "../../al-bayan/shared/ZoneWall";
import InteractiveAura from "../../al-bayan/shared/InteractiveAura";
import { PILLAR_RIDDLES, PILLAR_LIFE_ORDER } from "@/lib/maison-sagesse/puzzle-logic";
import { QUEST_SIZE, CORRIDOR_HALF_WIDTH, wallGapSegment } from "@/lib/maison-sagesse/zone-layout";

const { W: SIZE, H } = QUEST_SIZE;
const GAP = CORRIDOR_HALF_WIDTH;

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

function Pedestal() {
  const baseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#3D2010", roughness: 0.85, metalness: 0.1 }),
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
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.1, 1.25, 0.2, 12]} />
        <primitive object={baseMat} attach="material" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.65, 0.72, 0.8, 10]} />
        <primitive object={baseMat} attach="material" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.9, 0.65, 0.2, 12]} />
        <primitive object={topMat} attach="material" />
      </mesh>
    </group>
  );
}

function CrescentAndStar() {
  const lightRef = useRef<THREE.PointLight>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const v = 0.8 + Math.sin(t * 1.4) * 0.3;
    if (matRef.current) matRef.current.emissiveIntensity = v;
    if (lightRef.current) lightRef.current.intensity = 1.2;
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
      <group rotation={[0, 0, Math.PI * 0.15]}>
        <mesh castShadow>
          <torusGeometry args={[0.55, 0.12, 8, 32, Math.PI * 1.4]} />
          <primitive object={emissiveMat} attach="material" ref={matRef} />
        </mesh>
      </group>
      <mesh position={[0.55, 0.35, 0]} castShadow>
        <torusGeometry args={[0.2, 0.05, 5, 6]} />
        <primitive object={emissiveMat} attach="material" />
      </mesh>
      <pointLight ref={lightRef} color="#FFD700" intensity={1.2} distance={4} decay={2} />
    </group>
  );
}

function WallNiche({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[2.2, 3, 0.6]} />
        <meshStandardMaterial color="#1A0E08" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.1, 0.05]}>
        <cylinderGeometry args={[1.1, 1.1, 0.3, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#2C1810" roughness={0.9} />
      </mesh>
    </group>
  );
}

interface QuestFaithProps {
  onConfirm?: () => void;
  avatarRef: React.RefObject<THREE.Group | null>;
  zoneOffset: readonly [number, number, number];
  /** Quête déjà résolue — le monde étant désormais ouvert et persistant (plus
   * de démontage de salle à la résolution), il faut geler l'interaction
   * nous-mêmes pour ne pas laisser un bouton de validation indéfiniment
   * cliquable après coup. */
  solved?: boolean;
}

export default function QuestFaith({ onConfirm, avatarRef, zoneOffset, solved }: QuestFaithProps) {
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
    () => new THREE.MeshStandardMaterial({ color: "#0D2018", roughness: 0.92, metalness: 0.02 }),
    []
  );

  // Segment du mur est (côté hall) percé pour le corridor.
  const { segLen: eastSegD, segOffset: eastSegZ } = wallGapSegment(SIZE, GAP);

  return (
    <group>
      <ambientLight color="#021508" intensity={0.35} />
      <pointLight color="#064A2F" intensity={1.8} distance={14} decay={1.5} position={[0, 5, 0]} castShadow />
      <pointLight color="#1A8040" intensity={0.8} distance={8} decay={2} position={[0, 4.5, -5]} />

      <mesh position={[0, 3, -6]} receiveShadow castShadow>
        <boxGeometry args={[SIZE, H, 0.25]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[0, 3, 6]} receiveShadow castShadow>
        <boxGeometry args={[SIZE, H, 0.25]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[-6, 3, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.25, H, SIZE]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Mur est — percé, débouche sur le corridor vers le Hall */}
      <ZoneWall position={[6, 3, -eastSegZ]} size={[0.25, H, eastSegD]} color="#0D2018" roughness={0.92} metalness={0.02} />
      <ZoneWall position={[6, 3, eastSegZ]} size={[0.25, H, eastSegD]} color="#0D2018" roughness={0.92} metalness={0.02} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#0D1A10" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]} userData={{ noCollide: true }}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#060D08" roughness={0.95} />
      </mesh>

      <WallNiche position={[0, 3.8, -5.7]} />
      <CrescentAndStar />

      <mesh position={[0, 2.5, -5.65]} receiveShadow>
        <planeGeometry args={[5, 2]} />
        <meshStandardMaterial color="#D4B896" roughness={0.9} />
      </mesh>
      <Html position={[0, 2.5, -5.6]} center>
        <span style={{ color: "#3D2010", fontSize: "14px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "none", pointerEvents: "none", direction: "rtl" }}>
          أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ
        </span>
      </Html>

      {/* ── Parchemins — sélection par proximité, plus de clic 3D ── */}
      {PILLARS_OF_ISLAM.map((pillar) => {
        const pos = order.indexOf(pillar.id);
        return (
          <group key={pillar.id}>
            <FloatingScroll
              position={pillar.position}
              glowing={true}
              label={pos !== -1 ? String(pos + 1) : undefined}
            />
            {!solved && <InteractiveAura position={[pillar.position[0], 0.02, pillar.position[2]]} color="#34d399" radius={0.9} />}
            {!solved && (
            <ProximityPrompt avatarRef={avatarRef} zoneOffset={zoneOffset} localPosition={pillar.position} radius={1.7}>
              {(inRange) =>
                inRange && (
                  <Html position={[pillar.position[0], pillar.position[1] - 0.5, pillar.position[2]]} center>
                    <button
                      onClick={() => handleScrollClick(pillar.id)}
                      style={{
                        pointerEvents: "auto",
                        background: pos !== -1 ? "rgba(52,211,153,0.85)" : "rgba(10,15,13,0.85)",
                        border: "1px solid rgba(52,211,153,0.6)",
                        color: pos !== -1 ? "#0A0F0D" : "#34d399",
                        fontFamily: "var(--font-dm-sans)",
                        fontWeight: 700,
                        fontSize: 10,
                        borderRadius: 10,
                        padding: "6px 12px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pos !== -1 ? "Retirer de la rangée" : "Lire ce parchemin"}
                    </button>
                  </Html>
                )
              }
            </ProximityPrompt>
            )}
          </group>
        );
      })}

      <Pedestal />

      {/* ── Tablette de confirmation — proximité au lieu du clic ── */}
      <group position={[0, 0.5, 2.5]}>
        <mesh castShadow receiveShadow rotation={[-Math.PI * 0.08, 0, 0]}>
          <boxGeometry args={[2.4, 0.9, 0.12]} />
          <meshStandardMaterial color="#3D2A10" emissive="#055C3F" emissiveIntensity={0.25} roughness={0.8} metalness={0.15} />
        </mesh>
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} position={[x, -0.6, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.7, 6]} />
            <meshStandardMaterial color="#2C1810" roughness={0.9} />
          </mesh>
        ))}
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
      <InteractiveAura position={[0, 0.02, 2.5]} color="#055C3F" radius={1} />
      {solved ? (
        <Html position={[0, 1.3, 2.5]} center>
          <span
            style={{
              pointerEvents: "none",
              background: "rgba(52,211,153,0.15)",
              border: "1px solid rgba(52,211,153,0.5)",
              color: "#34d399",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 800,
              fontSize: 11,
              borderRadius: 10,
              padding: "8px 14px",
              whiteSpace: "nowrap",
            }}
          >
            ✓ Voie de la Foi résolue
          </span>
        </Html>
      ) : (
        <ProximityPrompt avatarRef={avatarRef} zoneOffset={zoneOffset} localPosition={[0, 0, 2.5]} radius={1.8}>
          {(inRange) =>
            inRange && (
              <Html position={[0, 1.3, 2.5]} center>
                <button
                  onClick={handleConfirm}
                  style={{
                    pointerEvents: "auto",
                    background: "linear-gradient(135deg, #7a5c1a 0%, #D4AF37 50%, #7a5c1a 100%)",
                    border: "1px solid rgba(212,175,55,0.7)",
                    color: "#0A0F0D",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: 800,
                    fontSize: 11,
                    borderRadius: 10,
                    padding: "8px 14px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Valider l&apos;ordre des piliers
                </button>
              </Html>
            )
          }
        </ProximityPrompt>
      )}

      <AnimatePresence>
        {modalPillar && (
          <RiddleModal
            pillarId={modalPillar}
            position={order.indexOf(modalPillar) !== -1 ? order.indexOf(modalPillar) : null}
            onClose={() => setModalPillar(null)}
          />
        )}
      </AnimatePresence>

      <CandleLight position={[-4.5, 0.4, -4.5]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[4.5, 0.4, -4.5]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[-4.5, 0.4, 4.5]} intensity={0.8} avatarRef={avatarRef} />
      <CandleLight position={[4.5, 0.4, 4.5]} intensity={0.8} avatarRef={avatarRef} />

      <AmbientParticles avatarRef={avatarRef} />
    </group>
  );
}
