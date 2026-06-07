"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import AmbientParticles from "../shared/AmbientParticles";
import CandleLight from "../shared/CandleLight";

const CONFETTI_COUNT = 500;

// Golden confetti falling from above
function GoldenConfetti() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Each confetti piece: initial x, z, speed, phase, rotation speed
  const confettiData = useMemo(() => {
    const data = new Float32Array(CONFETTI_COUNT * 6);
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      data[i * 6 + 0] = (Math.random() - 0.5) * 18;   // x
      data[i * 6 + 1] = Math.random() * 10 + 2;         // initial Y (above)
      data[i * 6 + 2] = (Math.random() - 0.5) * 14;   // z
      data[i * 6 + 3] = 0.3 + Math.random() * 0.8;    // fall speed
      data[i * 6 + 4] = Math.random() * Math.PI * 2;  // phase
      data[i * 6 + 5] = (Math.random() - 0.5) * 4;    // sway speed
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const bx = confettiData[i * 6 + 0];
      const initY = confettiData[i * 6 + 1];
      const bz = confettiData[i * 6 + 2];
      const speed = confettiData[i * 6 + 3];
      const phase = confettiData[i * 6 + 4];
      const sway = confettiData[i * 6 + 5];

      // Y falls over time, loops back to top
      const y = initY - ((t * speed + phase) % (initY + 2));
      const x = bx + Math.sin(t * sway + phase) * 0.4;
      const z = bz + Math.cos(t * sway * 0.7 + phase) * 0.3;

      dummy.position.set(x, y, z);
      dummy.rotation.set(t * sway, t * sway * 1.3, t * sway * 0.7);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const geo = useMemo(() => new THREE.PlaneGeometry(0.06, 0.1), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D4AF37",
        emissive: "#C8A84B",
        emissiveIntensity: 0.6,
        side: THREE.DoubleSide,
        roughness: 0.4,
        metalness: 0.5,
      }),
    []
  );

  return <instancedMesh ref={meshRef} args={[geo, mat, CONFETTI_COUNT]} />;
}

// The treasure chest that opens
function TreasureChest({ open }: { open: boolean }) {
  const lidRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lidRef.current) {
      const targetRot = open ? -Math.PI * 0.65 : 0;
      lidRef.current.rotation.x += (targetRot - lidRef.current.rotation.x) * 0.06;
    }
    if (lightRef.current && open) {
      const t = clock.getElapsedTime();
      lightRef.current.intensity = 3 + Math.sin(t * 3) * 0.8;
    }
  });

  const woodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#5C3010",
        roughness: 0.85,
        metalness: 0.05,
      }),
    []
  );
  const metalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C8A84B",
        roughness: 0.35,
        metalness: 0.85,
      }),
    []
  );
  const glowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFD700",
        emissive: "#FFD700",
        emissiveIntensity: 1.5,
        roughness: 0.2,
        transparent: true,
        opacity: 0.7,
      }),
    []
  );

  return (
    <group position={[0, 0.3, -1]}>
      {/* Chest body */}
      <mesh material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.75, 0.9]} />
      </mesh>
      {/* Metal bands */}
      {[-0.4, 0, 0.4].map((x) => (
        <mesh key={x} material={metalMat} position={[x, 0, 0]}>
          <boxGeometry args={[0.06, 0.77, 0.92]} />
        </mesh>
      ))}
      {/* Latch */}
      <mesh material={metalMat} position={[0, 0.38, 0.46]}>
        <boxGeometry args={[0.14, 0.1, 0.04]} />
      </mesh>
      {/* Corner hardware */}
      {[-0.65, 0.65].flatMap((x) =>
        [-0.44, 0.44].map((z) => (
          <mesh key={`${x}${z}`} material={metalMat} position={[x, 0.38, z]}>
            <boxGeometry args={[0.09, 0.09, 0.09]} />
          </mesh>
        ))
      )}

      {/* Lid — pivots at back edge */}
      <group ref={lidRef} position={[0, 0.38, -0.45]}>
        <mesh material={woodMat} castShadow position={[0, 0.06, 0.45]}>
          <boxGeometry args={[1.4, 0.12, 0.9]} />
        </mesh>
        {/* Lid metal bands */}
        {[-0.4, 0, 0.4].map((x) => (
          <mesh key={x} material={metalMat} position={[x, 0.06, 0.45]}>
            <boxGeometry args={[0.06, 0.13, 0.92]} />
          </mesh>
        ))}
      </group>

      {/* Gold light burst from inside when open */}
      {open && (
        <>
          <pointLight
            ref={lightRef}
            color="#FFD700"
            intensity={3}
            distance={8}
            decay={2}
            position={[0, 0.5, 0]}
          />
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <primitive object={glowMat} attach="material" />
          </mesh>
        </>
      )}
    </group>
  );
}

// Floating Arabic text "الحمد لله"
function FloatingArabicText() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = 4.5 + Math.sin(t * 0.9) * 0.2;
      const scale = 1 + Math.sin(t * 1.4) * 0.05;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 4.5, -3]}>
      <Html center>
        <span style={{ color: "#D4AF37", fontSize: "40px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(212,175,55,0.8)", pointerEvents: "none", direction: "rtl" }}>
          الحمد لله
        </span>
      </Html>
    </group>
  );
}

// God rays — simulated light cones from dome
function GodRays() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.08;
    }
  });

  const rayMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFD700",
        emissive: "#D4AF37",
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  );

  return (
    <group ref={groupRef} position={[0, 7.8, 0]}>
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            material={rayMat}
            rotation={[0, angle, 0]}
          >
            <coneGeometry args={[5, 10, 4, 1, true]} />
          </mesh>
        );
      })}
    </group>
  );
}

// Slow orbiting camera
function OrbitCamera() {
  const { camera } = useThree();
  const angle = useRef(0);

  useFrame((_, delta) => {
    angle.current += delta * 0.15;
    camera.position.x = Math.sin(angle.current) * 10;
    camera.position.z = Math.cos(angle.current) * 10;
    camera.position.y = 4;
    camera.lookAt(0, 2, 0);
  });

  return null;
}

interface VictorySceneProps {
  autoOrbit?: boolean;
}

export default function VictoryScene({ autoOrbit = true }: VictorySceneProps) {
  const [chestOpen, setChestOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChestOpen(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Room — bright version of main hall
  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3D2010",
        roughness: 0.88,
        metalness: 0.05,
      }),
    []
  );

  return (
    <group>
      {/* ── Bright lighting ── */}
      <ambientLight color="#3D2010" intensity={0.8} />
      <pointLight color="#FFD700" intensity={4} distance={20} decay={1.4} position={[0, 7, 0]} castShadow />
      <pointLight color="#FFA040" intensity={2} distance={12} decay={2} position={[-6, 3, -4]} />
      <pointLight color="#FFA040" intensity={2} distance={12} decay={2} position={[6, 3, -4]} />

      {/* ── Room (compact version of main hall) ── */}
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
        <meshStandardMaterial color="#1A1A2E" roughness={0.3} metalness={0.15} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color="#1C1008" roughness={0.9} />
      </mesh>

      {/* ── God rays from dome ── */}
      <GodRays />

      {/* ── Treasure chest ── */}
      <TreasureChest open={chestOpen} />

      {/* ── Floating victory text ── */}
      <FloatingArabicText />

      {/* ── Golden confetti rain ── */}
      <GoldenConfetti />

      {/* ── Many candles at max intensity ── */}
      <CandleLight position={[-8, 0.5, -4]} intensity={2} />
      <CandleLight position={[8, 0.5, -4]} intensity={2} />
      <CandleLight position={[-8, 0.5, 4]} intensity={2} />
      <CandleLight position={[8, 0.5, 4]} intensity={2} />
      <CandleLight position={[-5, 0.5, -6]} intensity={1.5} />
      <CandleLight position={[5, 0.5, -6]} intensity={1.5} />

      {/* ── Ambient dust ── */}
      <AmbientParticles />

      {/* ── Orbiting camera ── */}
      {autoOrbit && <OrbitCamera />}
    </group>
  );
}
