"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WePlayAvatarProps {
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  yawRef: React.MutableRefObject<number>;
  speed?: number;
  bounds: { x: number; z: number };
}

const GLOW_COLOR = "#5EEAD4"; // teal/cyan, assorti à l'ambiance de la bibliothèque

// Coque de halo : même géométrie qu'un membre du corps, légèrement agrandie,
// faces arrière, additive — imite un glow/bloom sans EffectComposer (coûteux
// sur mobile).
const haloMat = new THREE.MeshBasicMaterial({
  color: GLOW_COLOR,
  transparent: true,
  opacity: 0.35,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

interface BodyPartProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: [number, number, number];
  rotation?: [number, number, number];
  glowScale?: number;
}

function BodyPart({ geometry, material, position, rotation, glowScale = 1.18 }: BodyPartProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} material={material} castShadow />
      <mesh geometry={geometry} material={haloMat} scale={glowScale} />
    </group>
  );
}

/**
 * Silhouette humanoïde lumineuse, sans visage par choix éthique : tête,
 * torse effilé, deux bras, deux jambes — rendu en émissif cyan plein avec un
 * halo (coque additive) pour un effet "néon hologramme" sans coût de
 * post-processing. Avance dans la direction du regard (yawRef), piloté par
 * le joystick tactile. Le ref exposé est le THREE.Group lui-même, lu
 * directement par le contrôleur de caméra à chaque frame pour le suivi en
 * 3e personne.
 */
const WePlayAvatar = forwardRef<THREE.Group, WePlayAvatarProps>(
  ({ joystickRef, yawRef, speed = 4, bounds }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    useImperativeHandle(ref, () => groupRef.current as THREE.Group);

    const bodyMat = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: GLOW_COLOR,
          emissive: GLOW_COLOR,
          emissiveIntensity: 2.2,
          roughness: 0.25,
          metalness: 0.1,
          toneMapped: false,
        }),
      []
    );

    const headGeo = useMemo(() => new THREE.SphereGeometry(0.16, 24, 24), []);
    const torsoGeo = useMemo(() => new THREE.CylinderGeometry(0.1, 0.16, 0.62, 12), []);
    const armGeo = useMemo(() => new THREE.CapsuleGeometry(0.045, 0.46, 4, 8), []);
    const legGeo = useMemo(() => new THREE.CapsuleGeometry(0.07, 0.58, 4, 8), []);

    useFrame((_, delta) => {
      const group = groupRef.current;
      if (!group) return;
      const joy = joystickRef.current;
      const dt = Math.min(delta, 0.1);

      if (joy.x !== 0 || joy.y !== 0) {
        const yaw = yawRef.current;
        // Déplacement relatif à la direction du regard (yaw), comme une
        // marche en 3e personne classique. Calcul scalaire direct (sin/cos)
        // plutôt que des THREE.Vector3 — évite deux allocations par frame
        // pendant exactement les frames où le joystick est actif.
        const sinYaw = Math.sin(yaw);
        const cosYaw = Math.cos(yaw);
        const moveX = sinYaw * joy.y + cosYaw * joy.x;
        const moveZ = cosYaw * joy.y - sinYaw * joy.x;
        const len = Math.sqrt(moveX * moveX + moveZ * moveZ) || 1;

        group.position.x = THREE.MathUtils.clamp(group.position.x + (moveX / len) * speed * dt, -bounds.x, bounds.x);
        group.position.z = THREE.MathUtils.clamp(group.position.z + (moveZ / len) * speed * dt, -bounds.z, bounds.z);
        group.rotation.y = Math.atan2(moveX, moveZ);
      }
    });

    return (
      <group ref={groupRef}>
        <BodyPart geometry={headGeo} material={bodyMat} position={[0, 1.5, 0]} />
        <BodyPart geometry={torsoGeo} material={bodyMat} position={[0, 1.12, 0]} />
        <BodyPart geometry={armGeo} material={bodyMat} position={[-0.21, 1.1, 0]} rotation={[0, 0, 0.08]} glowScale={1.3} />
        <BodyPart geometry={armGeo} material={bodyMat} position={[0.21, 1.1, 0]} rotation={[0, 0, -0.08]} glowScale={1.3} />
        <BodyPart geometry={legGeo} material={bodyMat} position={[-0.09, 0.43, 0]} glowScale={1.22} />
        <BodyPart geometry={legGeo} material={bodyMat} position={[0.09, 0.43, 0]} glowScale={1.22} />

        {/* Lueur de contact cyan discrète au sol */}
        <pointLight position={[0, 0.1, 0]} intensity={0.8} color={GLOW_COLOR} distance={2.4} />
      </group>
    );
  }
);

WePlayAvatar.displayName = "WePlayAvatar";

export default WePlayAvatar;
