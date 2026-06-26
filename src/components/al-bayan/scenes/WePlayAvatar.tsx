"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { projectJoystickToWorld } from "@/lib/al-bayan/iso-camera";
import { isDescendantOf } from "@/lib/al-bayan/scene-utils";

const COLLIDER_MIN_HEIGHT = 0.4;
const AVATAR_RADIUS = 0.28;
const AVATAR_COLLIDER_HEIGHT = 1.7;

interface WePlayAvatarProps {
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  yawRef: React.MutableRefObject<number>;
  speed?: number;
  bounds: { x: number; z: number };
}

const GLOW_COLOR = "#3D7FE8"; // bleu islamique — silhouette sans visage

const BOB_AMPLITUDE = 0.038;
const BOB_BASE_FREQ = 5.5;
const BOB_FREQ_RANGE = 5.5;
const TILT_MAX = (7 * Math.PI) / 180; // le thobe ondule sobrement
const SLEEVE_SWING_MAX = (18 * Math.PI) / 180; // manches amples, swing réduit
const RISE_RATE = 9;
const FALL_RATE = 16;

// Halo de glow — coque BackSide additive pour simuler un bloom sans post-processing
const haloMat = new THREE.MeshBasicMaterial({
  color: GLOW_COLOR,
  transparent: true,
  opacity: 0.18,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

/**
 * Avatar islamique en thobe (djellaba) bleu lumineux, sans visage.
 *
 * Silhouette :
 * - Robe issue d'une LatheGeometry (surface de révolution) — large en bas,
 *   s'affine vers le col à y=1.42.
 * - Tête sphérique (sans trait de visage) + kufi.
 * - Deux manches cylindriques articulées aux épaules.
 *
 * La logique de déplacement (joystick projeté, collision AABB, clamp bornes)
 * et l'amortissement de magnitude (RISE_RATE / FALL_RATE) sont inchangés
 * par rapport à la version stick-figure.
 */
const WePlayAvatar = forwardRef<THREE.Group, WePlayAvatarProps>(
  ({ joystickRef, yawRef, speed = 4, bounds }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const leftSleeveRef = useRef<THREE.Group>(null);
    const rightSleeveRef = useRef<THREE.Group>(null);
    const bobPhase = useRef(0);
    const movingMag = useRef(0);
    useImperativeHandle(ref, () => groupRef.current as THREE.Group);

    const { scene } = useThree();
    const colliders = useRef<THREE.Box3[] | null>(null);
    const scratchBox = useRef(new THREE.Box3());

    useEffect(() => {
      const avatar = groupRef.current;
      if (!avatar) return;
      const list: THREE.Box3[] = [];
      scene.traverse((obj) => {
        if (obj.type !== "Mesh" || obj instanceof THREE.InstancedMesh) return;
        if (isDescendantOf(obj, avatar)) return;
        if (obj.userData?.noCollide) return;
        const box = new THREE.Box3().setFromObject(obj as THREE.Mesh);
        if (box.max.y - box.min.y < COLLIDER_MIN_HEIGHT) return;
        list.push(box);
      });
      colliders.current = list;
    }, [scene]);

    function collidesAt(x: number, z: number): boolean {
      const list = colliders.current;
      if (!list) return false;
      const box = scratchBox.current;
      box.min.set(x - AVATAR_RADIUS, 0.05, z - AVATAR_RADIUS);
      box.max.set(x + AVATAR_RADIUS, AVATAR_COLLIDER_HEIGHT, z + AVATAR_RADIUS);
      for (const obstacle of list) {
        if (obstacle.intersectsBox(box)) return true;
      }
      return false;
    }

    const bodyMat = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: GLOW_COLOR,
          emissive: GLOW_COLOR,
          emissiveIntensity: 2.8,
          roughness: 0.15,
          metalness: 0.2,
          toneMapped: false,
        }),
      []
    );

    // ── Géométries ──────────────────────────────────────────────────────────
    // Thobe : surface de révolution (LatheGeometry) — profil (r, y) représente
    // une djellaba ample en bas qui s'affine vers le col.
    const robeGeo = useMemo(() => {
      const pts = [
        new THREE.Vector2(0.41, 0.00), // bord inférieur de l'ourlet
        new THREE.Vector2(0.35, 0.20), // bas de la robe, légèrement rentré
        new THREE.Vector2(0.29, 0.52), // milieu de la robe
        new THREE.Vector2(0.24, 0.88), // taille
        new THREE.Vector2(0.20, 1.14), // buste/épaules
        new THREE.Vector2(0.15, 1.34), // encolure
        new THREE.Vector2(0.00, 1.42), // sommet du col (fermeture)
      ];
      return new THREE.LatheGeometry(pts, 22);
    }, []);

    // Tête (sphère — aucun visage par respect éthique islamique)
    const headGeo = useMemo(() => new THREE.SphereGeometry(0.155, 22, 22), []);

    // Kufi (calotte de prière cylindrique plate)
    const kufiGeo = useMemo(() => new THREE.CylinderGeometry(0.122, 0.148, 0.092, 14), []);

    // Manche : cylindre légèrement évasé en haut (épaule) vers le bas (poignet)
    const sleeveGeo = useMemo(
      () => new THREE.CylinderGeometry(0.062, 0.096, 0.50, 10),
      []
    );

    // ── Frame : déplacement + animation ─────────────────────────────────────
    useFrame((_, delta) => {
      const group = groupRef.current;
      const body = bodyRef.current;
      if (!group || !body) return;
      const joy = joystickRef.current;
      const dt = Math.min(delta, 0.1);

      const { x: moveX, z: moveZ } = projectJoystickToWorld(joy.x, joy.y, yawRef.current);
      const rawLen = Math.hypot(moveX, moveZ);
      const mag = Math.min(1, rawLen);

      if (mag > 0.01) {
        const len = rawLen || 1;
        const nextX = THREE.MathUtils.clamp(group.position.x + (moveX / len) * mag * speed * dt, -bounds.x, bounds.x);
        const nextZ = THREE.MathUtils.clamp(group.position.z + (moveZ / len) * mag * speed * dt, -bounds.z, bounds.z);

        if (!collidesAt(nextX, nextZ)) {
          group.position.x = nextX;
          group.position.z = nextZ;
        } else {
          if (!collidesAt(nextX, group.position.z)) group.position.x = nextX;
          if (!collidesAt(group.position.x, nextZ)) group.position.z = nextZ;
        }
      }

      const rate = mag > movingMag.current ? RISE_RATE : FALL_RATE;
      movingMag.current += (mag - movingMag.current) * Math.min(1, rate * dt);
      const m = movingMag.current;

      if (m > 0.004) {
        bobPhase.current += dt * (BOB_BASE_FREQ + BOB_FREQ_RANGE * m);
        body.position.y = Math.sin(bobPhase.current) * BOB_AMPLITUDE * m;
        body.rotation.x = TILT_MAX * m;

        // Manches en opposition de phase (comme les bras humains à la marche)
        const swing = Math.sin(bobPhase.current) * SLEEVE_SWING_MAX * m;
        if (leftSleeveRef.current) leftSleeveRef.current.rotation.x = -swing;
        if (rightSleeveRef.current) rightSleeveRef.current.rotation.x = swing;
      } else {
        bobPhase.current = 0;
        movingMag.current = 0;
        body.position.y = 0;
        body.rotation.x = 0;
        if (leftSleeveRef.current) leftSleeveRef.current.rotation.x = 0;
        if (rightSleeveRef.current) rightSleeveRef.current.rotation.x = 0;
      }

      // Orientation : le pouce droit (yawRef) tourne l'avatar ET la caméra ensemble
      group.rotation.y = yawRef.current;
    });

    return (
      <group ref={groupRef}>
        <group ref={bodyRef}>
          {/* ── Robe / Thobe ── */}
          <mesh geometry={robeGeo} material={bodyMat} castShadow />
          {/* Halo de glow : même géométrie agrandie, BackSide additive */}
          <mesh geometry={robeGeo} material={haloMat} scale={[1.08, 1.025, 1.08]} />

          {/* ── Tête (sans visage) ── */}
          <group position={[0, 1.59, 0]}>
            <mesh geometry={headGeo} material={bodyMat} castShadow />
            <mesh geometry={headGeo} material={haloMat} scale={1.19} />
          </group>

          {/* ── Kufi ── */}
          <mesh geometry={kufiGeo} material={bodyMat} position={[0, 1.705, 0]} castShadow />

          {/* ── Manche gauche — pivot à l'épaule gauche ── */}
          <group ref={leftSleeveRef} position={[-0.21, 1.22, 0]}>
            {/* légèrement écarté vers l'extérieur + incliné vers le bas */}
            <group position={[-0.045, -0.24, 0]} rotation={[0, 0, -(Math.PI / 9)]}>
              <mesh geometry={sleeveGeo} material={bodyMat} castShadow />
              <mesh geometry={sleeveGeo} material={haloMat} scale={1.18} />
            </group>
          </group>

          {/* ── Manche droite ── */}
          <group ref={rightSleeveRef} position={[0.21, 1.22, 0]}>
            <group position={[0.045, -0.24, 0]} rotation={[0, 0, Math.PI / 9]}>
              <mesh geometry={sleeveGeo} material={bodyMat} castShadow />
              <mesh geometry={sleeveGeo} material={haloMat} scale={1.18} />
            </group>
          </group>
        </group>

        {/* Lueur de contact au sol — reste au ras du plancher, hors du groupe
            qui bascule, pour ne pas "voler" avec le bob de la robe. */}
        <pointLight position={[0, 0.1, 0]} intensity={0.85} color={GLOW_COLOR} distance={2.5} />
      </group>
    );
  }
);

WePlayAvatar.displayName = "WePlayAvatar";

export default WePlayAvatar;
