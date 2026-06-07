"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 200;

export default function AmbientParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Pre-compute random seeds per particle so they stay stable
  const seeds = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 4); // x, y, z, phase
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 4 + 0] = (Math.random() - 0.5) * 8;   // x  [-4, 4]
      arr[i * 4 + 1] = Math.random() * 6;             // y  [0, 6]
      arr[i * 4 + 2] = (Math.random() - 0.5) * 8;   // z  [-4, 4]
      arr[i * 4 + 3] = Math.random() * Math.PI * 2;  // random phase
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const bx = seeds[i * 4 + 0];
      const by = seeds[i * 4 + 1];
      const bz = seeds[i * 4 + 2];
      const phase = seeds[i * 4 + 3];

      // Sinusoidal drift: slow horizontal wander + gentle vertical float
      const x = bx + Math.sin(t * 0.18 + phase) * 0.4;
      const y = by + Math.sin(t * 0.12 + phase * 1.3) * 0.25 + Math.cos(t * 0.07 + phase) * 0.15;
      const z = bz + Math.cos(t * 0.15 + phase * 0.7) * 0.4;

      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  const geometry = useMemo(() => new THREE.SphereGeometry(0.008, 4, 4), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C8A84B",
        emissive: "#C8A84B",
        emissiveIntensity: 0.6,
        roughness: 1,
        metalness: 0,
      }),
    []
  );

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, PARTICLE_COUNT]}>
    </instancedMesh>
  );
}
