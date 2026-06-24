"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

import WePlayAvatar from "../scenes/WePlayAvatar";
import Vestibule from "../zones/Vestibule";
import CourTemoignage from "../zones/CourTemoignage";
import Scriptorium from "../zones/Scriptorium";
import Sanctuaire from "../zones/Sanctuaire";
import OcclusionFader from "./OcclusionFader";
import { ISO_CAMERA_OFFSET, ISO_FOLLOW_LERP } from "@/lib/al-bayan/iso-camera";

// ── Disposition du monde — un seul groupe par zone, footprints qui se
// chevauchent légèrement aux seuils pour ne jamais laisser de "vide" où
// l'avatar marcherait dans le néant (cf. plan : zones carrées/rondes de
// rayon connu, recouvrement volontaire d'environ 1 unité). ──────────────
const ZONES = {
  vestibule: { position: [0, 0, 0] as [number, number, number], rotationY: 0 },
  courTemoignage: { position: [15, 0, 0] as [number, number, number], rotationY: -Math.PI / 2 },
  scriptorium: { position: [-14.5, -0.6, 0] as [number, number, number], rotationY: Math.PI / 2 },
  sanctuaire: { position: [0, 0.4, -14] as [number, number, number], rotationY: 0 },
};

// Bornes englobantes généreuses pour tout le complexe (simple rectangle,
// cf. discipline de clamp déjà utilisée ailleurs dans l'app).
export const WORLD_BOUNDS = { x: 23, z: 23 };

interface IsoCameraFollowProps {
  avatarRef: React.RefObject<THREE.Group | null>;
}

/**
 * Caméra isométrique FIXE : angle constant (40°/45°, cf. iso-camera.ts),
 * seule la position suit l'avatar, avec un lerp. Ne réagit jamais au yaw
 * de l'avatar (contrairement à l'ancien CameraFollow 3e-personne).
 */
function IsoCameraFollow({ avatarRef }: IsoCameraFollowProps) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());

  useFrame(() => {
    const avatar = avatarRef.current;
    if (!avatar) return;
    desired.current.set(
      avatar.position.x + ISO_CAMERA_OFFSET.x,
      avatar.position.y + ISO_CAMERA_OFFSET.y,
      avatar.position.z + ISO_CAMERA_OFFSET.z
    );
    camera.position.lerp(desired.current, ISO_FOLLOW_LERP);
    camera.lookAt(avatar.position.x, avatar.position.y + 1.1, avatar.position.z);
  });

  return null;
}

function ToneMappingSetup() {
  const { gl } = useThree();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.25;
  }, [gl]);
  return null;
}

const SPAWN = { x: 0, y: 0, z: 0 };

/** Place l'avatar et "snap" la caméra au spawn une seule fois au montage
 * du monde (plus de changement de route à chaque salle désormais). */
function InitialSpawn({ avatarRef }: { avatarRef: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  useEffect(() => {
    avatarRef.current?.position.set(SPAWN.x, SPAWN.y, SPAWN.z);
    camera.position.set(SPAWN.x + ISO_CAMERA_OFFSET.x, SPAWN.y + ISO_CAMERA_OFFSET.y, SPAWN.z + ISO_CAMERA_OFFSET.z);
    camera.lookAt(SPAWN.x, SPAWN.y + 1.1, SPAWN.z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface AlBayanWorldProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  yawRef: React.MutableRefObject<number>;
  onConfirmTemoignage?: () => void;
  onConfirmRasm?: () => void;
  onConfirmRoute?: () => void;
}

/**
 * Scène racine du monde ouvert al-bayan : brouillard, lumière ambiante
 * unique (≠ une par zone — `ambientLight` est global en three.js, peu
 * importe sa position dans la hiérarchie), poussière dorée (`Sparkles`,
 * drei), les 4 zones posées à leurs offsets, l'avatar et la caméra
 * isométrique fixe.
 */
export default function AlBayanWorld({
  avatarRef,
  joystickRef,
  yawRef,
  onConfirmTemoignage,
  onConfirmRasm,
  onConfirmRoute,
}: AlBayanWorldProps) {
  return (
    <group>
      <fog attach="fog" args={["#05050a", 20, 55]} />
      <ambientLight color="#3a3220" intensity={0.28} />

      <Sparkles count={140} scale={[40, 6, 40]} size={1.6} speed={0.15} color="#D4AF37" opacity={0.5} />

      <group position={ZONES.vestibule.position} rotation={[0, ZONES.vestibule.rotationY, 0]}>
        <Vestibule />
      </group>
      <group position={ZONES.courTemoignage.position} rotation={[0, ZONES.courTemoignage.rotationY, 0]}>
        <CourTemoignage onConfirm={onConfirmTemoignage} />
      </group>
      <group position={ZONES.scriptorium.position} rotation={[0, ZONES.scriptorium.rotationY, 0]}>
        <Scriptorium onConfirm={onConfirmRasm} />
      </group>
      <group position={ZONES.sanctuaire.position} rotation={[0, ZONES.sanctuaire.rotationY, 0]}>
        <Sanctuaire onConfirm={onConfirmRoute} />
      </group>

      <WePlayAvatar ref={avatarRef} joystickRef={joystickRef} yawRef={yawRef} bounds={WORLD_BOUNDS} />
      <IsoCameraFollow avatarRef={avatarRef} />
      <OcclusionFader avatarRef={avatarRef} />
      <InitialSpawn avatarRef={avatarRef} />
      <ToneMappingSetup />
    </group>
  );
}
