"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface FloatingScrollProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  glowing?: boolean;
  onClick?: () => void;
  label?: string;
}

export default function FloatingScroll({
  position,
  rotation = [0, 0, 0],
  glowing = false,
  onClick,
  label,
}: FloatingScrollProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  // Stable base Y for the oscillation
  const baseY = position[1];
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.getElapsedTime();

    // Levitation: gentle sine on Y
    group.position.y = baseY + Math.sin(t * 0.8 + phase) * 0.08;

    // Slow Z-axis spin
    group.rotation.y = rotation[1] + t * 0.25;

    // Hover scale
    const targetScale = onClick && hovered ? 1.15 : 1;
    group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // Glow flicker
    if (glowRef.current) {
      glowRef.current.intensity = 0.4 + Math.sin(t * 3.1 + phase) * 0.15;
    }
  });

  // Parchment cylinder (flatten slightly on Z for scroll look)
  const scrollGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12), []);
  const scrollMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D4B896",
        roughness: 0.85,
        metalness: 0,
        emissive: glowing ? "#C8A84B" : "#000000",
        emissiveIntensity: glowing ? 0.12 : 0,
      }),
    [glowing]
  );

  // End caps of the scroll (rod ends)
  const capGeo = useMemo(() => new THREE.CylinderGeometry(0.072, 0.072, 0.04, 10), []);
  const capMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#7A5C2A",
        roughness: 0.5,
        metalness: 0.5,
        emissive: glowing ? "#C8A84B" : "#000000",
        emissiveIntensity: glowing ? 0.2 : 0,
      }),
    [glowing]
  );

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={() => {
        if (onClick) {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      {/* Scroll body — rotate so the cylinder is horizontal */}
      <mesh geometry={scrollGeo} material={scrollMat} rotation={[0, 0, Math.PI / 2]} castShadow />
      {/* End cap left */}
      <mesh geometry={capGeo} material={capMat} rotation={[0, 0, Math.PI / 2]} position={[-0.245, 0, 0]} castShadow />
      {/* End cap right */}
      <mesh geometry={capGeo} material={capMat} rotation={[0, 0, Math.PI / 2]} position={[0.245, 0, 0]} castShadow />

      {/* Decorative string wrap */}
      <mesh castShadow>
        <torusGeometry args={[0.062, 0.008, 4, 20]} />
        <meshStandardMaterial color="#5C3D1A" roughness={0.8} />
      </mesh>

      {/* Golden glow emitter when glowing=true */}
      {glowing && (
        <>
          <pointLight
            ref={glowRef}
            color="#D4AF37"
            intensity={0.4}
            distance={2.5}
            decay={2}
          />
          {/* Subtle glow sphere */}
          <mesh>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial
              color="#D4AF37"
              transparent
              opacity={0.08}
              roughness={1}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* Billboard label above the scroll */}
      {label && (
        <Html position={[0, 0.35, 0]} center>
          <span style={{ color: "#F8F4EC", fontSize: "9px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(248,244,236,0.8)", pointerEvents: "none" }}>
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}
