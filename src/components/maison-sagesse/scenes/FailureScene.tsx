"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import FloatingScroll from "../shared/FloatingScroll";

// Candle that dims progressively to darkness
function DimmingCandle({
  position,
  delay,
  started,
}: {
  position: [number, number, number];
  delay: number;
  started: boolean;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const [elapsed, setElapsed] = useState(0);

  useFrame((_, delta) => {
    if (!started) return;
    setElapsed((e) => e + delta);

    const progress = Math.max(0, elapsed - delay);
    const dimDuration = 2.5;
    const t = Math.min(progress / dimDuration, 1);
    const intensity = 1.2 * (1 - t);

    if (lightRef.current) {
      lightRef.current.intensity = Math.max(0, intensity);
    }
    if (flameRef.current) {
      const mat = flameRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, 1 - t);
      flameRef.current.scale.setScalar(Math.max(0.01, 1 - t));
    }
  });

  const flameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFC840",
        emissive: "#FF8800",
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 1,
        roughness: 0.2,
      }),
    []
  );

  const waxMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#F0E8C8", roughness: 0.9 }),
    []
  );

  return (
    <group position={position}>
      {/* Candle body */}
      <mesh material={waxMat} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.22, 8]} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} material={flameMat} position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
      </mesh>
      <pointLight ref={lightRef} color="#FFA040" intensity={1.2} distance={5} decay={2} position={[0, 0.14, 0]} />
    </group>
  );
}

// Scrolls that float upward toward ceiling
function AscendingScroll({
  position,
  delay,
  started,
}: {
  position: [number, number, number];
  delay: number;
  started: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !started) return;
    const t = clock.getElapsedTime();
    // Rise up from original position
    const rise = Math.max(0, t - delay) * 0.4;
    groupRef.current.position.y = position[1] + rise + Math.sin(t * 0.8) * 0.06;
    groupRef.current.rotation.y = t * 0.3;

    // Fade out as they rise
    const fade = Math.max(0, 1 - rise / 4);
    groupRef.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        (mesh.material as THREE.MeshStandardMaterial).opacity = fade;
        (mesh.material as THREE.MeshStandardMaterial).transparent = true;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.45, 12]} />
        <meshStandardMaterial color="#D4B896" roughness={0.85} transparent />
      </mesh>
    </group>
  );
}

// Floating moody text
function FloatingMoodText() {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Fade in slowly
    opacityRef.current = Math.min(1, t * 0.3);

    if (groupRef.current) {
      groupRef.current.position.y = 3.5 + Math.sin(t * 0.4) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 3.5, -2]}>
      <Html center>
        <span style={{ color: "#D4AF37", fontSize: "18px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(212,175,55,0.8)", pointerEvents: "none", direction: "rtl" }}>
          العلم ينتظر وقته...
        </span>
      </Html>
      <Html position={[0, -0.6, 0]} center>
        <span style={{ color: "#8B7355", fontSize: "11px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(139,115,85,0.8)", pointerEvents: "none" }}>
          Le savoir attend son heure...
        </span>
      </Html>
    </group>
  );
}

// Camera slowly pulls back (dolly)
function DollyCamera() {
  const { camera } = useThree();
  const startZ = useRef(8);

  useEffect(() => {
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 2, 0);
    startZ.current = 8;
  }, [camera]);

  useFrame((_, delta) => {
    if (camera.position.z < 16) {
      camera.position.z += delta * 0.6;
      camera.position.y += delta * 0.05;
      camera.lookAt(0, 2, 0);
    }
  });

  return null;
}

// Darkening ambient
function DarkeningAmbient({ started }: { started: boolean }) {
  const lightRef = useRef<THREE.AmbientLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current || !started) return;
    const t = clock.getElapsedTime();
    const intensity = Math.max(0.02, 0.4 - t * 0.03);
    lightRef.current.intensity = intensity;
  });

  return <ambientLight ref={lightRef} color="#1a0800" intensity={0.4} />;
}

const CANDLE_POSITIONS: [number, number, number][] = [
  [-5, 0.5, -4],
  [5, 0.5, -4],
  [-5, 0.5, 4],
  [5, 0.5, 4],
  [-2, 0.5, -6],
  [2, 0.5, -6],
];

const SCROLL_POSITIONS: [number, number, number][] = [
  [-3, 1.5, -2],
  [2, 1.8, -3],
  [-1, 1.4, 2],
  [3.5, 1.6, 1],
  [0, 1.5, -4],
];

interface FailureSceneProps {
  dollyCam?: boolean;
}

export default function FailureScene({ dollyCam = true }: FailureSceneProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 600);
    return () => clearTimeout(t);
  }, []);

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#120A04",
        roughness: 0.95,
        metalness: 0.01,
      }),
    []
  );

  return (
    <group>
      {/* ── Darkening ambient ── */}
      <DarkeningAmbient started={started} />

      {/* A single dim remaining point light */}
      <pointLight color="#5A3010" intensity={0.5} distance={10} decay={2} position={[0, 4, 0]} />

      {/* ── Room walls ── */}
      <mesh position={[0, 4, -8]} receiveShadow>
        <boxGeometry args={[20, 8, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[0, 4, 8]} receiveShadow>
        <boxGeometry args={[20, 8, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[-10, 4, 0]} receiveShadow>
        <boxGeometry args={[0.3, 8, 16]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[10, 4, 0]} receiveShadow>
        <boxGeometry args={[0.3, 8, 16]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color="#0A0A14" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color="#080408" roughness={0.95} />
      </mesh>

      {/* ── Candles going out one by one ── */}
      {CANDLE_POSITIONS.map((pos, i) => (
        <DimmingCandle key={i} position={pos} delay={i * 0.8} started={started} />
      ))}

      {/* ── Scrolls ascending to ceiling ── */}
      {SCROLL_POSITIONS.map((pos, i) => (
        <AscendingScroll key={i} position={pos} delay={i * 0.5 + 0.5} started={started} />
      ))}

      {/* ── Atmospheric floating text ── */}
      <FloatingMoodText />

      {/* ── Dolly back camera ── */}
      {dollyCam && <DollyCamera />}
    </group>
  );
}
