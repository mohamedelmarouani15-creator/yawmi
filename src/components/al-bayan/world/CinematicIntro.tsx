"use client";

import { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCameraOffset } from "@/lib/al-bayan/iso-camera";

const DURATION = 2.8; // seconds
const START_Y_EXTRA = 22; // altitude supplémentaire du point de départ
const START_DIST_MULT = 2.2; // multiplicateur de distance horizontale au départ

interface CinematicIntroProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  yawRef: React.MutableRefObject<number>;
  onComplete?: () => void;
}

/**
 * Balayage cinématique à l'ouverture : la caméra descend d'une vue plongeante
 * à la position isométrique normale en DURATION secondes. Pendant ce temps,
 * IsoCameraFollow est suspendu (cameraReadyRef=false).
 */
export default function CinematicIntro({ avatarRef, yawRef, onComplete }: CinematicIntroProps) {
  const { camera } = useThree();
  const startT = useRef<number | null>(null);
  const done = useRef(false);

  useFrame(({ clock }) => {
    if (done.current) return;
    const avatar = avatarRef.current;
    if (!avatar) return;

    if (startT.current === null) {
      startT.current = clock.getElapsedTime();
    }

    const elapsed = clock.getElapsedTime() - startT.current;
    const raw = Math.min(elapsed / DURATION, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - raw, 3);

    const offset = getCameraOffset(yawRef.current);
    const tx = avatar.position.x + offset.x;
    const ty = avatar.position.y + offset.y;
    const tz = avatar.position.z + offset.z;

    const sx = avatar.position.x + offset.x * START_DIST_MULT;
    const sy = avatar.position.y + offset.y + START_Y_EXTRA;
    const sz = avatar.position.z + offset.z * START_DIST_MULT;

    camera.position.set(
      THREE.MathUtils.lerp(sx, tx, ease),
      THREE.MathUtils.lerp(sy, ty, ease),
      THREE.MathUtils.lerp(sz, tz, ease)
    );
    camera.lookAt(avatar.position.x, avatar.position.y + 1.1, avatar.position.z);

    if (raw >= 1) {
      done.current = true;
      onComplete?.();
    }
  });

  return null;
}
