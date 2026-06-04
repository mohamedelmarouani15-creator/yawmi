"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Billboard, Float } from "@react-three/drei";
import * as THREE from "three";
import type { LocationDef } from "@/lib/game/types";

// ── 3D World positions for each location ──────────────────────────
const CITY_POS: Record<string, [number, number, number]> = {
  medine:     [ 0.0,  0, -4.2],
  fes:        [ 0.85, 0, -3.3],
  cordoue:    [-0.85, 0, -2.4],
  marrakech:  [ 0.9,  0, -1.5],
  damas:      [-0.85, 0, -0.6],
  bagdad:     [ 0.8,  0,  0.3],
  samarcande: [-0.7,  0,  1.2],
  tombouctou: [ 0.85, 0,  2.1],
  le_caire:   [-0.85, 0,  3.0],
  la_mecque:  [ 0.0,  0,  3.9],
};

const ORDER = ["medine","fes","cordoue","marrakech","damas","bagdad","samarcande","tombouctou","le_caire","la_mecque"];

// ── Floating player ring ─────────────────────────────────────────
function PlayerRing({ color }: { color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 0.8;
      ringRef.current.position.y = 0.15 + Math.sin(Date.now() * 0.002) * 0.08;
    }
  });
  return (
    <mesh ref={ringRef} position={[0, 0.15, 0]}>
      <torusGeometry args={[0.55, 0.04, 8, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.9} />
    </mesh>
  );
}

// ── City 3D model ────────────────────────────────────────────────
function CityModel({
  location, isUnlocked, isDefeated, isCurrent, isLaMecque, onClick,
}: {
  location: LocationDef;
  isUnlocked: boolean;
  isDefeated: boolean;
  isCurrent: boolean;
  isLaMecque: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const pos = CITY_POS[location.id] ?? [0, 0, 0];
  const col = isUnlocked ? location.color : "#1e2a20";
  const emissiveInt = isUnlocked ? (hovered ? 0.6 : 0.3) : 0;
  const opacity     = isUnlocked ? 1 : 0.45;

  // Subtle idle bob
  useFrame((state) => {
    if (!groupRef.current || isCurrent) return;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7 + pos[2]) * 0.015;
  });

  return (
    <group
      ref={groupRef}
      position={pos as [number, number, number]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Scale on hover */}
      <group scale={hovered ? 1.08 : 1}>
        {/* Platform */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.6, 0.65, 0.08, 8]} />
          <meshStandardMaterial color={col} roughness={0.6} metalness={0.2} transparent opacity={opacity} />
        </mesh>

        {/* Main building body */}
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.48, 0.48, 0.48]} />
          <meshStandardMaterial color={col} roughness={0.4} metalness={0.15}
            emissive={col} emissiveIntensity={emissiveInt * 0.3} transparent opacity={opacity} />
        </mesh>

        {/* Dome */}
        <mesh position={[0, 0.65, 0]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={col} roughness={0.2} metalness={0.4}
            emissive={col} emissiveIntensity={emissiveInt} transparent opacity={opacity} />
        </mesh>

        {/* Dome tip */}
        <mesh position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.04, 6, 4]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={isUnlocked ? 1 : 0} />
        </mesh>

        {/* Minaret */}
        <mesh position={[0.28, 0.45, 0.1]}>
          <cylinderGeometry args={[0.035, 0.05, 0.75, 6]} />
          <meshStandardMaterial color={col} roughness={0.5} transparent opacity={opacity} />
        </mesh>
        {/* Minaret cap */}
        <mesh position={[0.28, 0.87, 0.1]}>
          <coneGeometry args={[0.07, 0.12, 6]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={isUnlocked ? 0.8 : 0} />
        </mesh>

        {/* La Mecque: extra tall minaret */}
        {isLaMecque && (
          <>
            <mesh position={[-0.28, 0.55, -0.1]}>
              <cylinderGeometry args={[0.035, 0.05, 0.9, 6]} />
              <meshStandardMaterial color={col} roughness={0.5} transparent opacity={opacity} />
            </mesh>
            <mesh position={[-0.28, 1.02, -0.1]}>
              <coneGeometry args={[0.07, 0.12, 6]} />
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={isUnlocked ? 1.2 : 0} />
            </mesh>
            {/* Kaaba */}
            <mesh position={[0, 0.35, -0.15]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
            </mesh>
          </>
        )}
      </group>

      {/* City glow light */}
      {isUnlocked && (
        <pointLight position={[0, 1, 0]} color={col} intensity={hovered ? 1.5 : 0.7} distance={2.5} decay={2} />
      )}

      {/* Player indicator */}
      {isCurrent && <PlayerRing color={col} />}

      {/* Defeated crown */}
      {isDefeated && (
        <Billboard position={[0, 1.3, 0]}>
          <Text fontSize={0.18} color="#D4AF37" anchorX="center" anchorY="middle">✓</Text>
        </Billboard>
      )}

      {/* City name label */}
      <Billboard position={[0, isLaMecque ? 1.6 : 1.3, 0]}>
        <Text
          fontSize={isCurrent ? 0.17 : 0.14}
          color={isUnlocked ? "white" : "rgba(255,255,255,0.3)"}
          anchorX="center"
          anchorY="middle"
          outlineColor="black"
          outlineWidth={0.015}
        >
          {location.nameFr}
        </Text>
      </Billboard>

      {/* Lock icon for locked cities */}
      {!isUnlocked && (
        <Billboard position={[0, 0.9, 0]}>
          <Text fontSize={0.2} color="rgba(255,255,255,0.25)" anchorX="center" anchorY="middle">⊘</Text>
        </Billboard>
      )}
    </group>
  );
}

// ── Glowing path ─────────────────────────────────────────────────
function PathLine({ unlockedIds }: { unlockedIds: string[] }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    }
  });

  const curve = useMemo(() => {
    const pts = ORDER.map(id => {
      const p = CITY_POS[id];
      return new THREE.Vector3(p[0], 0.08, p[2]);
    });
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.025, 6, false), [curve]);

  return (
    <mesh geometry={tubeGeo}>
      <meshStandardMaterial ref={matRef}
        color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5}
        roughness={0.2} metalness={0.3} transparent opacity={0.7}
      />
    </mesh>
  );
}

// ── Animated particles along path ───────────────────────────────
function PathParticles() {
  const count = 20;
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count]);

  const curve = useMemo(() => {
    const pts = ORDER.map(id => {
      const p = CITY_POS[id];
      return new THREE.Vector3(p[0], 0.12, p[2]);
    });
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  useFrame((state) => {
    offsets.forEach((_, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      const t = ((offsets[i] + state.clock.elapsedTime * 0.05) % 1);
      const pt = curve.getPoint(t);
      mesh.position.copy(pt);
      mesh.position.y = 0.15 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.02;
    });
  });

  return (
    <>
      {offsets.map((_, i) => (
        <mesh key={i} ref={el => { meshRefs.current[i] = el; }}>
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={2} />
        </mesh>
      ))}
    </>
  );
}

// ── Ground plane ─────────────────────────────────────────────────
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial
        color="#040e08"
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  );
}

// ── Camera auto-aim ──────────────────────────────────────────────
function CameraController({ targetZ }: { targetZ: number }) {
  const { camera } = useThree();
  const targetRef = useRef(targetZ);
  targetRef.current = targetZ;

  useFrame((_, dt) => {
    const targetPos = new THREE.Vector3(0, 9, targetRef.current + 5.5);
    camera.position.lerp(targetPos, dt * 1.5);
    camera.lookAt(0, 0, targetRef.current);
  });

  return null;
}

// ── Main scene ───────────────────────────────────────────────────
function Scene({
  locations, unlockedIds, defeatedIds, currentLocation, onLocClick,
}: {
  locations: LocationDef[];
  unlockedIds: string[];
  defeatedIds: string[];
  currentLocation: string;
  onLocClick: (id: string) => void;
}) {
  const curPos  = CITY_POS[currentLocation] ?? [0, 0, 0];
  const curLocZ = curPos[2];

  return (
    <>
      {/* Camera */}
      <CameraController targetZ={curLocZ} />

      {/* Lights */}
      <ambientLight intensity={0.4} color="#1a2f1f" />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#ffeedd" />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#D4AF37" distance={12} />

      {/* Fog */}
      <fog attach="fog" args={["#020a05", 8, 22]} />

      {/* Stars */}
      <Stars radius={20} depth={10} count={800} factor={2} saturation={0} fade speed={0.5} />

      {/* Ground */}
      <Ground />

      {/* Path */}
      <PathLine unlockedIds={unlockedIds} />
      <PathParticles />

      {/* Cities */}
      {locations.map(loc => (
        <CityModel
          key={loc.id}
          location={loc}
          isUnlocked={unlockedIds.includes(loc.id)}
          isDefeated={defeatedIds.includes(loc.sageId ?? "")}
          isCurrent={currentLocation === loc.id}
          isLaMecque={loc.id === "la_mecque"}
          onClick={() => onLocClick(loc.id)}
        />
      ))}

      {/* OrbitControls — limited rotation, no pan */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.5}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
        rotateSpeed={0.5}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

// ── Exported canvas wrapper ──────────────────────────────────────
export default function OasisMap3D({
  locations, unlockedIds, defeatedIds, currentLocation, onLocClick,
}: {
  locations: LocationDef[];
  unlockedIds: string[];
  defeatedIds: string[];
  currentLocation: string;
  onLocClick: (id: string) => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 45, position: [0, 9, 6], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      style={{ background: "#020a05", touchAction: "none" }}
    >
      <Scene
        locations={locations}
        unlockedIds={unlockedIds}
        defeatedIds={defeatedIds}
        currentLocation={currentLocation}
        onLocClick={onLocClick}
      />
    </Canvas>
  );
}
