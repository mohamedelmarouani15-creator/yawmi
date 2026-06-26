"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SMOKE_COUNT = 22;
const MAX_Y = 3.2;
const RISE_SPEED = 0.28;

interface SmokeParticle {
  y: number;
  drift: number;
  phase: number;
  speed: number;
}

interface IncenseSmokeProps {
  position?: [number, number, number];
}

/**
 * Colonne de fumée d'encens : particules sphériques qui montent de y=0 à
 * y=MAX_Y, grossissent puis se dissipent. Aucune texture requise.
 */
export default function IncenseSmoke({ position = [0, 0, 0] }: IncenseSmokeProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  const particles = useRef<SmokeParticle[]>(
    Array.from({ length: SMOKE_COUNT }, (_, i) => ({
      y: (i / SMOKE_COUNT) * MAX_Y, // stagger dès le départ
      drift: (((i * 17) % 10) / 10 - 0.5) * 0.18,
      phase: (i / SMOKE_COUNT) * Math.PI * 2,
      speed: RISE_SPEED + (((i * 7) % 5) / 5) * 0.12,
    }))
  );

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#C8B88A",
        transparent: true,
        opacity: 0.11,
        depthWrite: false,
      }),
    []
  );

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < SMOKE_COUNT; i++) {
      const p = particles.current[i];
      p.y += p.speed * delta;
      if (p.y > MAX_Y) {
        p.y = 0;
        p.drift = (Math.sin(t + p.phase) * 0.18);
      }

      const life = p.y / MAX_Y; // 0 → 1
      // Scale : monte jusqu'à 0.5 en milieu de vie, redescend à 0
      const scale = Math.sin(life * Math.PI) * 0.55 + 0.08;

      const xOffset = p.drift + Math.sin(t * 0.6 + p.phase) * 0.06;
      const zOffset = Math.cos(t * 0.5 + p.phase) * 0.05;

      dummy.current.position.set(xOffset, p.y, zOffset);
      dummy.current.scale.setScalar(scale);
      dummy.current.updateMatrix();
      mesh.setMatrixAt(i, dummy.current.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, SMOKE_COUNT]}>
        <sphereGeometry args={[0.14, 5, 5]} />
        <primitive object={mat} attach="material" />
      </instancedMesh>
    </group>
  );
}
