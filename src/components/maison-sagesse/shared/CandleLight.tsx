"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CandleLightProps {
  position: [number, number, number];
  intensity?: number;
}

// Inner flame mesh that flickers and sways
function FlameMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    // Gentle sway
    mesh.rotation.z = Math.sin(t * 3.1 + 0.5) * 0.08;
    mesh.rotation.x = Math.sin(t * 2.7) * 0.04;

    // Scale flicker — the flame breathes
    const flicker = 1 + Math.sin(t * 8.3) * 0.06 + Math.sin(t * 13.7) * 0.04;
    mesh.scale.set(flicker * 0.8, flicker, flicker * 0.8);

    // Emissive pulse
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.2 + Math.sin(t * 7.1) * 0.3 + Math.sin(t * 11.3) * 0.2;
  });

  const geometry = useMemo(() => {
    // Teardrop-like flame: stretched sphere, narrow at top
    const geo = new THREE.SphereGeometry(0.04, 6, 8);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      // Taper the top half inward to create a flame shape
      if (y > 0) {
        const factor = 1 - y / 0.04 * 0.6;
        pos.setX(i, pos.getX(i) * factor);
        pos.setZ(i, pos.getZ(i) * factor);
      }
      // Stretch vertically
      pos.setY(i, y * 2.2);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFC840",
        emissive: "#FF8800",
        emissiveIntensity: 1.2,
        roughness: 0.2,
        metalness: 0,
        transparent: true,
        opacity: 0.92,
      }),
    []
  );

  return <mesh ref={meshRef} geometry={geometry} material={material} castShadow={false} />;
}

// Candle body (wax pillar)
function CandleBody() {
  const geometry = useMemo(() => new THREE.CylinderGeometry(0.035, 0.04, 0.22, 8), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#F0E8C8",
        roughness: 0.9,
        metalness: 0,
      }),
    []
  );
  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
}

// Candle holder / base
function CandleHolder() {
  const geometry = useMemo(() => new THREE.CylinderGeometry(0.06, 0.07, 0.04, 10), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#7A5C2A",
        roughness: 0.6,
        metalness: 0.4,
      }),
    []
  );
  return <mesh geometry={geometry} material={material} position={[0, -0.13, 0]} castShadow receiveShadow />;
}

export default function CandleLight({ position, intensity = 1.5 }: CandleLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const light = lightRef.current;
    if (!light) return;
    const t = clock.getElapsedTime();
    // Organic flicker using multiple sine waves at prime frequencies
    const flicker =
      intensity *
      (1 +
        Math.sin(t * 6.7) * 0.12 +
        Math.sin(t * 11.3) * 0.08 +
        Math.sin(t * 17.9) * 0.05);
    light.intensity = Math.max(0, flicker);
  });

  return (
    <group position={position}>
      {/* Wax body */}
      <CandleBody />
      {/* Metal holder */}
      <CandleHolder />
      {/* Flame sits above wick */}
      <group position={[0, 0.14, 0]}>
        <FlameMesh />
        {/* Warm glow point light */}
        <pointLight
          ref={lightRef}
          color="#FFA040"
          intensity={intensity}
          distance={5}
          decay={2}
          castShadow
          shadow-mapSize-width={256}
          shadow-mapSize-height={256}
          shadow-camera-near={0.1}
          shadow-camera-far={6}
        />
      </group>
    </group>
  );
}
