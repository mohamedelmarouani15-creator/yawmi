"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import CandleLight from "../shared/CandleLight";
import AmbientParticles from "../shared/AmbientParticles";
import IslamicArch from "../shared/IslamicArch";
import LightShaftSun from "../../al-bayan/world/LightShaftSun";
import EmberParticles from "../../al-bayan/shared/EmberParticles";
import ZoneWall from "../../al-bayan/shared/ZoneWall";
import { HALL, CORRIDOR_HALF_WIDTH } from "@/lib/maison-sagesse/zone-layout";

const { W, H, D } = HALL;
const GAP = CORRIDOR_HALF_WIDTH;
const WOOD_TRIM = "#8B7355";

/** Repère lumineux d'entrée de zone — purement décoratif (aucun onClick,
 * aucune collision) : la traversée se fait en marchant à travers
 * l'ouverture du mur, pas par un clic sur un portail. Remplace
 * l'ancien DoorwayPortal cliquable. */
function ZoneThreshold({
  position,
  rotation,
  glowColor,
  arabicLabel,
  frenchLabel,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  glowColor: string;
  arabicLabel: string;
  frenchLabel: string;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.6 + Math.sin(t * 1.6) * 0.3;
    if (lightRef.current) lightRef.current.intensity = pulse;
    if (matRef.current) matRef.current.emissiveIntensity = pulse * 0.5;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Arche décorative encadrant le seuil — ne bloque jamais le passage */}
      <mesh position={[0, 2.9, 0]} userData={{ noCollide: true }}>
        <torusGeometry args={[GAP + 0.3, 0.1, 8, 20, Math.PI]} />
        <meshStandardMaterial ref={matRef} color={glowColor} emissive={glowColor} emissiveIntensity={0.5} roughness={0.4} metalness={0.5} />
      </mesh>
      <pointLight ref={lightRef} color={glowColor} intensity={0.6} distance={5} decay={2} position={[0, 1.5, 0]} />
      <Html position={[0, 3.4, 0]} center>
        <div style={{ textAlign: "center", pointerEvents: "none" }}>
          <div style={{ color: "#F8F4EC", fontSize: 14, fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(248,244,236,0.8)", direction: "rtl" }}>
            {arabicLabel}
          </div>
          <div style={{ color: glowColor, fontSize: 10, fontFamily: "serif", whiteSpace: "nowrap", textShadow: `0 0 8px ${glowColor}` }}>
            {frenchLabel}
          </div>
        </div>
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

  const starPositions = useMemo(() => {
    const positions: [number, number][] = [];
    for (let ix = -4; ix <= 4; ix++) {
      for (let iz = -3; iz <= 3; iz++) {
        positions.push([ix * 2.2, iz * 2.2]);
      }
    }
    return positions;
  }, []);

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

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

  const domeSphere = useMemo(() => {
    const geo = new THREE.SphereGeometry(W * 0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45);
    return geo;
  }, []);

  const medallionGeo = useMemo(() => new THREE.TorusGeometry(0.6, 0.08, 4, 8), []);

  const bandPositions = useMemo(() => {
    const count = 20;
    const positions: [number, number, number, number][] = [];
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
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]} receiveShadow userData={{ noCollide: true }}>
        <planeGeometry args={[W, D]} />
        <primitive object={ceilingMat} attach="material" />
      </mesh>

      <mesh
        geometry={domeSphere}
        material={ceilingMat}
        position={[0, H, 0]}
        rotation={[Math.PI, 0, 0]}
        userData={{ noCollide: true }}
      />

      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 5;
        return (
          <mesh
            key={i}
            geometry={medallionGeo}
            material={arabesqueMat}
            position={[Math.cos(angle) * r, H - 0.05, Math.sin(angle) * r]}
            rotation={[Math.PI / 2, 0, angle]}
            userData={{ noCollide: true }}
          />
        );
      })}

      {bandPositions.map(([x, z, ry], i) => (
        <mesh key={i} material={arabesqueMat} position={[x, H - 0.08, z]} rotation={[0, ry, 0]} castShadow userData={{ noCollide: true }}>
          <boxGeometry args={[1.1, 0.12, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

interface MainHallProps {
  sunRef?: React.Ref<THREE.Mesh>;
}

/**
 * Zone hub — Le Grand Hall. Trois ouvertures taillées dans les murs
 * (ouest→Foi, nord→Science, est→Sagesse) qu'on traverse en marchant, plus
 * de portails cliquables. Chaque ouverture est signalée par un
 * `ZoneThreshold` purement décoratif.
 */
export default function MainHall({ sunRef }: MainHallProps) {
  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2C1810",
        roughness: 0.92,
        metalness: 0.02,
      }),
    []
  );

  // Segments des murs percés — largeur pleine moins la moitié de l'ouverture,
  // centrés de part et d'autre du seuil (voir zone-layout.ts pour GAP).
  const backSegW = (W - GAP * 2) / 2;
  const backSegX = GAP + backSegW / 2;
  const sideSegD = (D - GAP * 2) / 2;
  const sideSegZ = GAP + sideSegD / 2;

  return (
    <group>
      <ambientLight color="#1a0a00" intensity={0.3} />

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

      <IslamicFloor />

      {/* Mur arrière (nord) — percé pour le corridor vers Science */}
      <ZoneWall position={[-backSegX, H / 2, -D / 2]} size={[backSegW, H, 0.3]} color="#2C1810" roughness={0.92} metalness={0.02} />
      <ZoneWall position={[backSegX, H / 2, -D / 2]} size={[backSegW, H, 0.3]} color="#2C1810" roughness={0.92} metalness={0.02} />
      <ZoneWall position={[0, H - 0.6, -D / 2]} size={[GAP * 2, 1.2, 0.34]} color={WOOD_TRIM} roughness={0.55} metalness={0.1} />

      {/* Mur avant (sud) — plein, aucune zone voisine */}
      <mesh position={[0, H / 2, D / 2]} receiveShadow castShadow>
        <boxGeometry args={[W, H, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Mur ouest — percé pour le corridor vers la Foi */}
      <ZoneWall position={[-W / 2, H / 2, -sideSegZ]} size={[0.3, H, sideSegD]} color="#2C1810" roughness={0.92} metalness={0.02} />
      <ZoneWall position={[-W / 2, H / 2, sideSegZ]} size={[0.3, H, sideSegD]} color="#2C1810" roughness={0.92} metalness={0.02} />
      <ZoneWall position={[-W / 2, H - 0.6, 0]} size={[0.34, 1.2, GAP * 2]} color={WOOD_TRIM} roughness={0.55} metalness={0.1} />

      {/* Mur est — percé pour le corridor vers la Sagesse */}
      <ZoneWall position={[W / 2, H / 2, -sideSegZ]} size={[0.3, H, sideSegD]} color="#2C1810" roughness={0.92} metalness={0.02} />
      <ZoneWall position={[W / 2, H / 2, sideSegZ]} size={[0.3, H, sideSegD]} color="#2C1810" roughness={0.92} metalness={0.02} />
      <ZoneWall position={[W / 2, H - 0.6, 0]} size={[0.34, 1.2, GAP * 2]} color={WOOD_TRIM} roughness={0.55} metalness={0.1} />

      <VaultedCeiling />

      <OctagonalColumn position={[-5, 0, -4]} />
      <OctagonalColumn position={[5, 0, -4]} />
      <OctagonalColumn position={[-5, 0, 4]} />
      <OctagonalColumn position={[5, 0, 4]} />

      <group position={[0, 0, -4]}>
        <IslamicArch width={4} height={5.5} depth={0.3} />
      </group>
      <group position={[0, 0, 4]}>
        <IslamicArch width={4} height={5.5} depth={0.3} />
      </group>

      <CandleLight position={[-5, 0.5, -4]} intensity={1.2} />
      <CandleLight position={[5, 0.5, -4]} intensity={1.2} />
      <CandleLight position={[-5, 0.5, 4]} intensity={1.2} />
      <CandleLight position={[5, 0.5, 4]} intensity={1.2} />
      <CandleLight position={[-8, 1.2, -6]} intensity={0.9} />
      <CandleLight position={[8, 1.2, -6]} intensity={0.9} />
      <EmberParticles position={[-5, 0.65, -4]} count={9} color="#FFC24D" />
      <EmberParticles position={[5, 0.65, -4]} count={9} color="#FFC24D" />

      <BookShelf position={[-9.5, 1.5, -5]} rotation={[0, Math.PI / 2, 0]} />
      <BookShelf position={[-9.5, 1.5, 1]} rotation={[0, Math.PI / 2, 0]} />
      <BookShelf position={[9.5, 1.5, -5]} rotation={[0, -Math.PI / 2, 0]} />
      <BookShelf position={[9.5, 1.5, 1]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Seuils décoratifs — plus aucune interaction, on traverse en marchant */}
      <ZoneThreshold position={[0, 0, -D / 2 + 0.2]} glowColor="#1B3A6B" arabicLabel="العلم" frenchLabel="La Voie de la Science" />
      <ZoneThreshold position={[-W / 2 + 0.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} glowColor="#055C3F" arabicLabel="الإيمان" frenchLabel="La Voie de la Foi" />
      <ZoneThreshold position={[W / 2 - 0.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} glowColor="#D4AF37" arabicLabel="الحكمة" frenchLabel="La Voie de la Sagesse" />

      <AmbientParticles />

      <LightShaftSun ref={sunRef} position={[0, H - 0.4, 0]} color="#FFD87A" size={2.6} />
    </group>
  );
}
