"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TRAIL_COUNT = 28;
const EMIT_INTERVAL = 0.07; // seconds between particle spawns
const LIFETIME = 0.9; // seconds before a particle disappears
const MIN_MOVE = 0.025; // minimum displacement to emit

interface TrailParticle {
  x: number;
  z: number;
  age: number;
  alive: boolean;
}

interface AvatarTrailProps {
  avatarRef: React.RefObject<THREE.Group | null>;
}

/**
 * Traînée de particules anneaux bleus derrière l'avatar en mouvement.
 * Chaque particule est un anneau plat qui grossit puis disparaît.
 */
export default function AvatarTrail({ avatarRef }: AvatarTrailProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useRef<TrailParticle[]>(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, z: 0, age: LIFETIME, alive: false }))
  );
  const lastEmit = useRef(0);
  const lastPos = useRef(new THREE.Vector3());
  const dummy = useRef(new THREE.Object3D());

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#3D7FE8",
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  const hidden = useMemo(() => {
    const m = new THREE.Matrix4();
    m.makeScale(0, 0, 0);
    return m;
  }, []);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    const avatar = avatarRef.current;
    if (!mesh || !avatar) return;

    const t = clock.getElapsedTime();
    const moved = avatar.position.distanceTo(lastPos.current) > MIN_MOVE;

    // Spawn new particle when moving
    if (moved && t - lastEmit.current > EMIT_INTERVAL) {
      const slot = particles.current.findIndex((p) => !p.alive);
      if (slot >= 0) {
        particles.current[slot] = {
          x: avatar.position.x,
          z: avatar.position.z,
          age: 0,
          alive: true,
        };
        lastEmit.current = t;
        lastPos.current.copy(avatar.position);
      }
    }

    // Update all particles
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const p = particles.current[i];
      if (!p.alive) {
        mesh.setMatrixAt(i, hidden);
        continue;
      }
      p.age += delta;
      if (p.age >= LIFETIME) {
        p.alive = false;
        mesh.setMatrixAt(i, hidden);
        continue;
      }
      const life = p.age / LIFETIME; // 0→1
      // Scale: grows from 0.3 to 1.1 then shrinks to 0
      const scale = Math.sin(life * Math.PI) * 0.9 + 0.2;
      mat.opacity = (1 - life) * 0.45;

      dummy.current.position.set(p.x, 0.06, p.z);
      dummy.current.rotation.x = -Math.PI / 2;
      dummy.current.scale.setScalar(scale);
      dummy.current.updateMatrix();
      mesh.setMatrixAt(i, dummy.current.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TRAIL_COUNT]}>
      <ringGeometry args={[0.16, 0.36, 18]} />
      <primitive object={mat} attach="material" />
    </instancedMesh>
  );
}
