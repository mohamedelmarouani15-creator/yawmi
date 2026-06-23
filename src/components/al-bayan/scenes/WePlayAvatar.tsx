"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WePlayAvatarProps {
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  yawRef: React.MutableRefObject<number>;
  speed?: number;
  bounds: { x: number; z: number };
}

/**
 * Silhouette bleue type "WePlay" — sans visage par choix éthique, simple
 * figurine chibi (tête sphère, buste capsule, pieds). Avance dans la
 * direction où regarde la caméra (yawRef), pilotée par le joystick tactile.
 * Le ref exposé est le THREE.Group lui-même, lu directement par le
 * contrôleur de caméra à chaque frame pour le suivi en 3e personne.
 */
const WePlayAvatar = forwardRef<THREE.Group, WePlayAvatarProps>(
  ({ joystickRef, yawRef, speed = 4, bounds }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    useImperativeHandle(ref, () => groupRef.current as THREE.Group);

    useFrame((_, delta) => {
      const group = groupRef.current;
      if (!group) return;
      const joy = joystickRef.current;
      const dt = Math.min(delta, 0.1);

      if (joy.x !== 0 || joy.y !== 0) {
        const yaw = yawRef.current;
        // Déplacement relatif à la direction du regard (yaw), comme une
        // marche en 3e personne classique.
        const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
        const rgt = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
        const moveX = fwd.x * joy.y + rgt.x * joy.x;
        const moveZ = fwd.z * joy.y + rgt.z * joy.x;
        const len = Math.sqrt(moveX * moveX + moveZ * moveZ) || 1;

        group.position.x = THREE.MathUtils.clamp(group.position.x + (moveX / len) * speed * dt, -bounds.x, bounds.x);
        group.position.z = THREE.MathUtils.clamp(group.position.z + (moveZ / len) * speed * dt, -bounds.z, bounds.z);
        group.rotation.y = Math.atan2(moveX, moveZ);
      }
    });

    return (
      <group ref={groupRef}>
        {/* Tête : sphère sans visage, respect du choix éthique */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.2} roughness={0.1} metalness={0.1} />
        </mesh>

        {/* Buste */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.6, 16, 32]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>

        {/* Pieds */}
        <mesh position={[-0.15, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#0369a1" />
        </mesh>
        <mesh position={[0.15, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#0369a1" />
        </mesh>

        {/* Lueur de contact bleue discrète au sol */}
        <pointLight position={[0, 0.1, 0]} intensity={0.6} color="#38bdf8" distance={2} />
      </group>
    );
  }
);

WePlayAvatar.displayName = "WePlayAvatar";

export default WePlayAvatar;
