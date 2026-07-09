"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EmberParticlesProps {
  position: [number, number, number];
  count?: number;
  color?: string;
  spread?: number;
  riseHeight?: number;
}

/**
 * Étincelles montantes — contrairement à AmbientParticles (poussière lente,
 * dérive sur place), celles-ci montent depuis une source (bougie, brasier)
 * et se réinitialisent en boucle une fois `riseHeight` atteint, avec un
 * fondu de sortie. Additive + petite taille pour rester subtil, attrape
 * bien le Bloom du post-processing.
 */
export default function EmberParticles({
  position,
  count = 14,
  color = "#FF9A3C",
  spread = 0.18,
  riseHeight = 1.4,
}: EmberParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const [seeds] = useState(() => {
    const arr = new Float32Array(count * 4); // offsetX, offsetZ, speed, phase
    for (let i = 0; i < count; i++) {
      arr[i * 4 + 0] = (Math.random() - 0.5) * spread * 2;
      arr[i * 4 + 1] = (Math.random() - 0.5) * spread * 2;
      arr[i * 4 + 2] = 0.35 + Math.random() * 0.35; // vitesse de montée
      arr[i * 4 + 3] = Math.random(); // phase initiale (0..1 = décalage dans le cycle)
    }
    return arr;
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const ox = seeds[i * 4 + 0];
      const oz = seeds[i * 4 + 1];
      const speed = seeds[i * 4 + 2];
      const phase = seeds[i * 4 + 3];

      // Cycle 0..1 en boucle, décalé par particule pour ne pas monter en bloc
      const cycle = ((t * speed * 0.4 + phase) % 1);
      const y = cycle * riseHeight;
      const wobble = Math.sin(t * 3 + phase * 10) * 0.04 * cycle;

      dummy.position.set(position[0] + ox + wobble, position[1] + y, position[2] + oz);
      const scale = (1 - cycle) * 0.9 + 0.1; // rétrécit en montant
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    void delta;
  });

  const geometry = useMemo(() => new THREE.SphereGeometry(0.012, 4, 4), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [color]
  );

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />;
}
