"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import CandleLight from "../shared/CandleLight";
import AmbientParticles from "../shared/AmbientParticles";
import IslamicArch from "../shared/IslamicArch";
import type { GamePhase } from "@/lib/maison-sagesse/types";

// Room dimensions
const W = 20;  // width
const H = 8;   // height
const D = 16;  // depth

interface DoorwayPortalProps {
  position: [number, number, number];
  glowColor: string;
  arabicLabel: string;
  frenchLabel: string;
  targetPhase: GamePhase;
  onPhaseChange: (phase: GamePhase) => void;
}

function DoorwayPortal({
  position,
  glowColor,
  arabicLabel,
  frenchLabel,
  targetPhase,
  onPhaseChange,
}: DoorwayPortalProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.5 + Math.sin(t * 1.8) * 0.3 + (hovered ? 0.4 : 0);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + Math.sin(t * 2.1) * 0.4 + (hovered ? 0.8 : 0);
    }
  });

  const frameGeo = useMemo(() => new THREE.BoxGeometry(3.3, 5.3, 0.15), []);
  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#8B7355",
        roughness: 0.85,
        metalness: 0.1,
      }),
    []
  );

  const portalGeo = useMemo(() => new THREE.PlaneGeometry(3, 5), []);

  return (
    <group position={position}>
      {/* Stone frame */}
      <mesh geometry={frameGeo} material={frameMat} castShadow receiveShadow />

      {/* Glowing portal surface */}
      <mesh
        position={[0, 0, 0.1]}
        geometry={portalGeo}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onClick={() => onPhaseChange(targetPhase)}
      >
        <meshStandardMaterial
          ref={matRef}
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.72}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Portal glow light */}
      <pointLight
        ref={lightRef}
        color={glowColor}
        intensity={1.2}
        distance={6}
        decay={2}
        position={[0, 0, 1]}
      />

      {/* Arabic label */}
      <Html position={[0, 3.2, 0.2]} center>
        <span style={{ color: "#F8F4EC", fontSize: "16px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(248,244,236,0.8)", pointerEvents: "none", direction: "rtl" }}>
          {arabicLabel}
        </span>
      </Html>

      {/* French label */}
      <Html position={[0, 2.7, 0.2]} center>
        <span style={{ color: "#D4AF37", fontSize: "11px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(212,175,55,0.8)", pointerEvents: "none" }}>
          {frenchLabel}
        </span>
      </Html>
    </group>
  );
}

// Octagonal column
function OctagonalColumn({ position }: { position: [number, number, number] }) {
  const shaftGeo = useMemo(() => new THREE.CylinderGeometry(0.3, 0.32, H - 0.4, 8), []);
  const capitalGeo = useMemo(() => new THREE.CylinderGeometry(0.42, 0.3, 0.3, 8), []);
  const baseGeo = useMemo(() => new THREE.CylinderGeometry(0.38, 0.44, 0.25, 8), []);
  const stoneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#6B5740",
        roughness: 0.88,
        metalness: 0.05,
      }),
    []
  );
  const accentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#8B7355",
        roughness: 0.8,
        metalness: 0.1,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Base */}
      <mesh geometry={baseGeo} material={accentMat} position={[0, 0.125, 0]} castShadow receiveShadow />
      {/* Shaft */}
      <mesh geometry={shaftGeo} material={stoneMat} position={[0, H / 2, 0]} castShadow receiveShadow />
      {/* Capital */}
      <mesh geometry={capitalGeo} material={accentMat} position={[0, H - 0.15, 0]} castShadow receiveShadow />
    </group>
  );
}

// Bookshelf unit
function BookShelf({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const shelfGeo = useMemo(() => new THREE.BoxGeometry(3.5, 0.07, 0.5), []);
  const shelfMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#3D2010", roughness: 0.9 }),
    []
  );

  const bookColors = ["#6B2020", "#204060", "#206030", "#604020", "#402060", "#205050", "#603020"];

  const [books] = useState(() => {
    const result: { x: number; w: number; h: number; color: string }[] = [];
    let x = -1.6;
    while (x < 1.6) {
      const w = 0.08 + Math.random() * 0.1;
      const h = 0.28 + Math.random() * 0.15;
      const color = bookColors[Math.floor(Math.random() * bookColors.length)];
      result.push({ x, w, h, color });
      x += w + 0.01;
    }
    return result;
  });

  const shelves = [0.5, 1.5, 2.5, 3.5];

  return (
    <group position={position} rotation={rotation}>
      {/* Back panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.6, 4.2, 0.08]} />
        <meshStandardMaterial color="#2C1810" roughness={0.95} />
      </mesh>

      {/* Shelves */}
      {shelves.map((sy) => (
        <mesh key={sy} geometry={shelfGeo} material={shelfMat} position={[0, sy, 0.21]} castShadow />
      ))}

      {/* Books on each shelf */}
      {shelves.map((sy) =>
        books.map((b, i) => (
          <mesh key={`${sy}-${i}`} castShadow position={[b.x + b.w / 2, sy + 0.04 + b.h / 2, 0.23]}>
            <boxGeometry args={[b.w, b.h, 0.35]} />
            <meshStandardMaterial color={b.color} roughness={0.85} />
          </mesh>
        ))
      )}
    </group>
  );
}

// Geometric floor tile pattern (Islamic 8-pointed star repeat via geometry)
function IslamicFloor() {
  // Main dark marble floor
  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1A1A2E",
        roughness: 0.3,
        metalness: 0.15,
        envMapIntensity: 0.5,
      }),
    []
  );

  // Gold inlay star tiles
  const starMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C8A84B",
        emissive: "#8B6914",
        emissiveIntensity: 0.15,
        roughness: 0.4,
        metalness: 0.6,
      }),
    []
  );

  // Build 8-pointed star inlays at regular grid positions
  const starPositions = useMemo(() => {
    const positions: [number, number][] = [];
    for (let ix = -4; ix <= 4; ix++) {
      for (let iz = -3; iz <= 3; iz++) {
        positions.push([ix * 2.2, iz * 2.2]);
      }
    }
    return positions;
  }, []);

  // 8-pointed star shape (two overlapping squares rotated 45°)
  const starGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const r = 0.5;
    const ir = 0.22;
    const pts = 8;
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
    <group>
      {/* Main floor slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Gold star inlays — slightly raised */}
      {starPositions.map(([x, z], i) => (
        <mesh
          key={i}
          geometry={starGeo}
          material={starMat}
          rotation={[-Math.PI / 2, 0, Math.PI / 8]}
          position={[x, 0.003, z]}
        />
      ))}
    </group>
  );
}

// Vaulted ceiling with arabesque band
function VaultedCeiling() {
  const ceilingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1C1008",
        roughness: 0.9,
        metalness: 0.0,
      }),
    []
  );

  const arabesqueMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C8A84B",
        emissive: "#8B6914",
        emissiveIntensity: 0.2,
        roughness: 0.6,
        metalness: 0.4,
      }),
    []
  );

  // Dome segment (ellipsoid cap)
  const domeSphere = useMemo(() => {
    const geo = new THREE.SphereGeometry(W * 0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45);
    return geo;
  }, []);

  // Arabesque band boxes around the ceiling perimeter
  const bandPositions = useMemo(() => {
    const count = 20;
    const positions: [number, number, number, number][] = []; // x, z, ry, isLong
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const rx = Math.cos(t) * (W / 2 - 0.1);
      const rz = Math.sin(t) * (D / 2 - 0.1);
      positions.push([rx, rz, -t + Math.PI / 2, 0]);
    }
    return positions;
  }, []);

  return (
    <group>
      {/* Flat main ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <primitive object={ceilingMat} attach="material" />
      </mesh>

      {/* Dome above center */}
      <mesh
        geometry={domeSphere}
        material={ceilingMat}
        position={[0, H, 0]}
        rotation={[Math.PI, 0, 0]}
      />

      {/* Arabesque relief medallions on ceiling */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 5;
        return (
          <mesh
            key={i}
            geometry={new THREE.TorusGeometry(0.6, 0.08, 4, 8)}
            material={arabesqueMat}
            position={[Math.cos(angle) * r, H - 0.05, Math.sin(angle) * r]}
            rotation={[Math.PI / 2, 0, angle]}
          />
        );
      })}

      {/* Ceiling band (frieze) */}
      {bandPositions.map(([x, z, ry], i) => (
        <mesh key={i} material={arabesqueMat} position={[x, H - 0.08, z]} rotation={[0, ry, 0]} castShadow>
          <boxGeometry args={[1.1, 0.12, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

interface MainHallProps {
  onPhaseChange: (phase: GamePhase) => void;
}

export default function MainHall({ onPhaseChange }: MainHallProps) {
  // Wall material — warm stone
  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2C1810",
        roughness: 0.92,
        metalness: 0.02,
      }),
    []
  );

  return (
    <group>
      {/* ── Ambient lighting ── */}
      <ambientLight color="#1a0a00" intensity={0.3} />

      {/* Central gold light from dome */}
      <pointLight
        color="#FFD700"
        intensity={2}
        distance={18}
        decay={1.8}
        position={[0, H - 0.5, 0]}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
      />

      {/* ── Floor ── */}
      <IslamicFloor />

      {/* ── Walls ── */}
      {/* Back wall */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow castShadow>
        <boxGeometry args={[W, H, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, H / 2, D / 2]} receiveShadow castShadow>
        <boxGeometry args={[W, H, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-W / 2, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, H, D]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Right wall */}
      <mesh position={[W / 2, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, H, D]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* ── Ceiling ── */}
      <VaultedCeiling />

      {/* ── Columns — 4 octagonal ── */}
      <OctagonalColumn position={[-5, 0, -4]} />
      <OctagonalColumn position={[5, 0, -4]} />
      <OctagonalColumn position={[-5, 0, 4]} />
      <OctagonalColumn position={[5, 0, 4]} />

      {/* ── Islamic arches between columns ── */}
      <group position={[0, 0, -4]}>
        <IslamicArch width={4} height={5.5} depth={0.3} />
      </group>
      <group position={[0, 0, 4]}>
        <IslamicArch width={4} height={5.5} depth={0.3} />
      </group>

      {/* ── Candle lights — on columns and shelves ── */}
      <CandleLight position={[-5, 0.5, -4]} intensity={1.2} />
      <CandleLight position={[5, 0.5, -4]} intensity={1.2} />
      <CandleLight position={[-5, 0.5, 4]} intensity={1.2} />
      <CandleLight position={[5, 0.5, 4]} intensity={1.2} />
      <CandleLight position={[-8, 1.2, -6]} intensity={0.9} />
      <CandleLight position={[8, 1.2, -6]} intensity={0.9} />

      {/* ── Bookshelves on side walls ── */}
      <BookShelf position={[-9.5, 1.5, -5]} rotation={[0, Math.PI / 2, 0]} />
      <BookShelf position={[-9.5, 1.5, 1]} rotation={[0, Math.PI / 2, 0]} />
      <BookShelf position={[9.5, 1.5, -5]} rotation={[0, -Math.PI / 2, 0]} />
      <BookShelf position={[9.5, 1.5, 1]} rotation={[0, -Math.PI / 2, 0]} />

      {/* ── Three doorways on the back wall ── */}
      {/* Faith — left */}
      <DoorwayPortal
        position={[-6, 2.5, -D / 2 + 0.2]}
        glowColor="#055C3F"
        arabicLabel="الإيمان"
        frenchLabel="La Voie de la Foi"
        targetPhase="quest-faith"
        onPhaseChange={onPhaseChange}
      />
      {/* Science — center */}
      <DoorwayPortal
        position={[0, 2.5, -D / 2 + 0.2]}
        glowColor="#1B3A6B"
        arabicLabel="العلم"
        frenchLabel="La Voie de la Science"
        targetPhase="quest-science"
        onPhaseChange={onPhaseChange}
      />
      {/* Wisdom — right */}
      <DoorwayPortal
        position={[6, 2.5, -D / 2 + 0.2]}
        glowColor="#D4AF37"
        arabicLabel="الحكمة"
        frenchLabel="La Voie de la Sagesse"
        targetPhase="quest-wisdom"
        onPhaseChange={onPhaseChange}
      />

      {/* ── Floating dust particles ── */}
      <AmbientParticles />
    </group>
  );
}
