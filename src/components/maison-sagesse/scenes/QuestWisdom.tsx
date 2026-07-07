"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import * as THREE from "three";
import CandleLight from "../shared/CandleLight";
import AmbientParticles from "../shared/AmbientParticles";
import GrillePercee from "../ui/GrillePercee";
import ProximityPrompt from "../shared/ProximityPrompt";
import InteractiveAura from "../../al-bayan/shared/InteractiveAura";
import ZoneWall from "../../al-bayan/shared/ZoneWall";
import { QUEST_SIZE, CORRIDOR_HALF_WIDTH, wallGapSegment } from "@/lib/maison-sagesse/zone-layout";

const { W: SIZE, H } = QUEST_SIZE;
const GAP = CORRIDOR_HALF_WIDTH;

const PILLARS_OF_FAITH = [
  { label: "Allah", arabic: "الله" },
  { label: "Anges", arabic: "الملائكة" },
  { label: "Livres", arabic: "الكتب" },
  { label: "Prophètes", arabic: "الرسل" },
  { label: "Jugement", arabic: "اليوم الآخر" },
  { label: "Destin", arabic: "القدر" },
];

const BOOK_COLORS = [
  "#6B2020", "#204060", "#206030", "#604020",
  "#402060", "#205050", "#603020", "#3A4020",
  "#602040", "#204040", "#4A3010", "#103040",
];

interface BookProps {
  position: [number, number, number];
  colorIndex: number;
  width: number;
  height: number;
  revealed?: boolean;
  pillarsLabel?: string;
}

function Book({ position, colorIndex, width, height, revealed, pillarsLabel }: BookProps) {
  const color = BOOK_COLORS[colorIndex % BOOK_COLORS.length];

  const coverMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        metalness: 0.05,
        emissive: revealed ? "#D4AF37" : "#000000",
        emissiveIntensity: revealed ? 0.15 : 0,
      }),
    [color, revealed]
  );

  const pageMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#F0E8D0", roughness: 0.9 }),
    []
  );

  const goldMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#D4AF37", roughness: 0.4, metalness: 0.7 }),
    []
  );

  const depth = 0.35;

  return (
    <group position={position}>
      <mesh material={pageMat} castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[width * 0.9, height, depth * 0.85]} />
      </mesh>
      <mesh material={coverMat} castShadow receiveShadow position={[0, 0, depth / 2 + 0.005]}>
        <boxGeometry args={[width + 0.015, height + 0.01, 0.012]} />
      </mesh>
      <mesh material={coverMat} castShadow receiveShadow position={[0, 0, -depth / 2 - 0.005]}>
        <boxGeometry args={[width + 0.015, height + 0.01, 0.012]} />
      </mesh>
      <mesh material={coverMat} castShadow position={[-(width / 2 + 0.006), 0, 0]}>
        <boxGeometry args={[0.012, height + 0.01, depth + 0.025]} />
      </mesh>
      <mesh material={goldMat} position={[-(width / 2 + 0.013), 0, 0]}>
        <boxGeometry args={[0.006, height * 0.7, 0.015]} />
      </mesh>

      {revealed && pillarsLabel && (
        <Html position={[0, height / 2 + 0.15, 0]} center>
          <span style={{ color: "#D4AF37", fontSize: "9px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(212,175,55,0.8)", pointerEvents: "none", direction: "rtl" }}>
            {pillarsLabel}
          </span>
        </Html>
      )}
    </group>
  );
}

function LibraryShelf({ posX, posZ, rotY }: { posX: number; posZ: number; rotY: number }) {
  const shelfMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2C1810", roughness: 0.9 }), []);
  const rows = [0.6, 1.55, 2.5, 3.45, 4.4];
  const booksPerRow = 12;

  const bookData = useMemo(() => {
    return rows.flatMap((rowY) =>
      [...Array(booksPerRow)].map((_, col) => ({
        rowY,
        col,
        colorIdx: Math.floor(Math.random() * BOOK_COLORS.length),
        w: 0.1 + Math.random() * 0.08,
        h: 0.38 + Math.random() * 0.12,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group position={[posX, 0, posZ]} rotation={[0, rotY, 0]}>
      <mesh receiveShadow position={[0, 2.7, 0]}>
        <boxGeometry args={[4.5, 5.5, 0.1]} />
        <primitive object={shelfMat} attach="material" />
      </mesh>
      {rows.map((sy) => (
        <mesh key={sy} castShadow receiveShadow position={[0, sy, 0.24]}>
          <boxGeometry args={[4.5, 0.06, 0.45]} />
          <primitive object={shelfMat} attach="material" />
        </mesh>
      ))}
      {bookData.map((b, i) => {
        const startX = -2.1;
        const spacing = 4.4 / booksPerRow;
        const x = startX + b.col * spacing + b.w / 2;
        return (
          <Book key={i} position={[x, b.rowY + 0.04 + b.h / 2, 0.27]} colorIndex={b.colorIdx} width={b.w} height={b.h} />
        );
      })}
    </group>
  );
}

function CentralBook() {
  const particleRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (particleRef.current) {
      const t = clock.getElapsedTime();
      for (let i = 0; i < 40; i++) {
        const phase = (i / 40) * Math.PI * 2;
        const r = 0.3 + Math.sin(t * 2 + phase) * 0.2;
        const y = 1.4 + Math.abs(Math.sin(t * 1.5 + phase * 0.7)) * 0.8;
        dummy.position.set(Math.cos(phase) * r, y, Math.sin(phase) * r * 0.5);
        dummy.updateMatrix();
        particleRef.current.setMatrixAt(i, dummy.matrix);
      }
      particleRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const parchmentMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#D4B896", roughness: 0.88 }), []);
  const curtainMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2C1810", roughness: 0.8, transparent: true, opacity: 0.9 }),
    []
  );
  const goldMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#D4AF37", emissive: "#8B6914", emissiveIntensity: 0.3, roughness: 0.4, metalness: 0.7 }),
    []
  );

  return (
    <group position={[0, 0.8, 0.5]}>
      <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.08, 2.2]} />
        <meshStandardMaterial color="#2C1810" roughness={0.85} />
      </mesh>
      {[-1.4, 1.4].flatMap((x) =>
        [-0.9, 0.9].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.9, z]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 1.2, 6]} />
            <meshStandardMaterial color="#1C0E08" roughness={0.9} />
          </mesh>
        ))
      )}

      <mesh material={parchmentMat} castShadow receiveShadow rotation={[0, -Math.PI * 0.05, 0]} position={[-0.88, -0.12, 0]}>
        <boxGeometry args={[1.7, 0.02, 2]} />
      </mesh>
      <mesh material={parchmentMat} castShadow receiveShadow rotation={[0, Math.PI * 0.05, 0]} position={[0.88, -0.12, 0]}>
        <boxGeometry args={[1.7, 0.02, 2]} />
      </mesh>
      <mesh material={goldMat} position={[0, -0.1, 0]}>
        <boxGeometry args={[0.08, 0.04, 2.05]} />
      </mesh>

      <mesh material={curtainMat} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[3.5, 2, 0.06]} />
      </mesh>
      {[...Array(4)].map((_, row) =>
        [...Array(6)].map((_, col) => (
          <mesh key={`${row}${col}`} position={[-1.25 + col * 0.5, 0.05, -0.75 + row * 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.06, 8]} />
            <meshStandardMaterial color="#1C0E08" roughness={1} />
          </mesh>
        ))
      )}

      <instancedMesh ref={particleRef} args={[undefined, undefined, 40]} userData={{ noCollide: true }}>
        <sphereGeometry args={[0.025, 4, 4]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.8} />
      </instancedMesh>
    </group>
  );
}

function MonumentalCandle({ avatarRef }: { avatarRef?: React.RefObject<THREE.Group | null> }) {
  return (
    <group position={[0, 0, -4.5]}>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.4, 10]} />
        <meshStandardMaterial color="#5C3D1A" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 1.4, 10]} />
        <meshStandardMaterial color="#F0E8C0" roughness={0.9} />
      </mesh>
      <CandleLight position={[0, 1.75, -4.5]} intensity={2.5} avatarRef={avatarRef} />
    </group>
  );
}

interface QuestWisdomProps {
  onConfirm?: () => void;
  avatarRef: React.RefObject<THREE.Group | null>;
  zoneOffset: readonly [number, number, number];
  /** Quête déjà résolue — voir QuestFaith.tsx pour le pourquoi (monde ouvert
   * persistant, plus de démontage de salle à la résolution). */
  solved?: boolean;
}

export default function QuestWisdom({ onConfirm, avatarRef, zoneOffset, solved }: QuestWisdomProps) {
  const [showGrille, setShowGrille] = useState(false);

  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1C1008", roughness: 0.92, metalness: 0.02 }), []);

  // Segment du mur ouest (côté hall) percé pour le corridor.
  const { segLen: westSegD, segOffset: westSegZ } = wallGapSegment(SIZE, GAP);

  return (
    <group>
      <ambientLight color="#100800" intensity={0.3} />
      <pointLight color="#8B6914" intensity={2} distance={16} decay={1.5} position={[0, 5, 0]} castShadow />
      <pointLight color="#C8A84B" intensity={0.8} distance={8} decay={2} position={[-5, 3, -3]} />
      <pointLight color="#C8A84B" intensity={0.8} distance={8} decay={2} position={[5, 3, -3]} />

      <mesh position={[0, 3, -6]} receiveShadow castShadow>
        <boxGeometry args={[SIZE, H, 0.25]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[0, 3, 6]} receiveShadow castShadow>
        <boxGeometry args={[SIZE, H, 0.25]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Mur ouest — percé, débouche sur le corridor vers le Hall */}
      <ZoneWall position={[-6, 3, -westSegZ]} size={[0.25, H, westSegD]} color="#1C1008" roughness={0.92} metalness={0.02} />
      <ZoneWall position={[-6, 3, westSegZ]} size={[0.25, H, westSegD]} color="#1C1008" roughness={0.92} metalness={0.02} />
      <mesh position={[6, 3, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.25, H, SIZE]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#1C1008" roughness={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]} userData={{ noCollide: true }}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#0A0600" roughness={0.95} />
      </mesh>

      <LibraryShelf posX={0} posZ={-5.5} rotY={0} />
      <LibraryShelf posX={5.5} posZ={0} rotY={-Math.PI / 2} />

      {PILLARS_OF_FAITH.map((pillar, i) => (
        <Book key={pillar.label} position={[(-2.5 + i) * 0.6, 1.2, 4.5]} colorIndex={i} width={0.22} height={0.55} />
      ))}

      <CentralBook />
      {solved ? (
        <Html position={[0, 1.3, 1.3]} center>
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
            ✓ Voie de la Sagesse résolue
          </span>
        </Html>
      ) : (
        <>
          <InteractiveAura position={[0, 0.02, 0.5]} color="#D4AF37" radius={1.4} />
          <ProximityPrompt avatarRef={avatarRef} zoneOffset={zoneOffset} localPosition={[0, 0, 0.5]} radius={2.2}>
            {(inRange) =>
              inRange && (
                <Html position={[0, 1.3, 1.3]} center>
                  <button
                    onClick={() => setShowGrille(true)}
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
                    Examiner la grille
                  </button>
                </Html>
              )
            }
          </ProximityPrompt>
        </>
      )}

      <AnimatePresence>
        {showGrille && (
          <Html fullscreen>
            <GrillePercee
              onClose={() => setShowGrille(false)}
              onSolved={() => {
                setShowGrille(false);
                onConfirm?.();
              }}
            />
          </Html>
        )}
      </AnimatePresence>

      <MonumentalCandle avatarRef={avatarRef} />

      <CandleLight position={[-5, 0.5, -4]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[5, 0.5, -4]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[-5, 0.5, 3]} intensity={0.8} avatarRef={avatarRef} />
      <CandleLight position={[5, 0.5, 3]} intensity={0.8} avatarRef={avatarRef} />

      <AmbientParticles avatarRef={avatarRef} />
    </group>
  );
}
