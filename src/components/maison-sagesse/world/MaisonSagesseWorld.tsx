"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

import WePlayAvatar from "../../al-bayan/scenes/WePlayAvatar";
import { getCameraOffset, getCameraDir, ISO_DISTANCE, ISO_FOLLOW_LERP } from "@/lib/al-bayan/iso-camera";
import { collectOccluderCandidates } from "@/lib/al-bayan/occluder-candidates";
import { getShakeOffset } from "@/lib/camera-shake";
import { playFootstep } from "@/lib/maison-sagesse/audio-engine";
import { ZONES, WORLD_BOUNDS, SPAWN } from "@/lib/maison-sagesse/zone-layout";

import MainHall from "../scenes/MainHall";
import QuestFaith from "../scenes/QuestFaith";
import QuestScience from "../scenes/QuestScience";
import QuestWisdom from "../scenes/QuestWisdom";
import Corridors from "./Corridors";

const MIN_CAM_DISTANCE = 1.8;
const CAM_WALL_MARGIN = 0.4;
const CAM_RAY_ANGLES = [0, 0.46, -0.46];
// Volontairement plus large que le BASE_FOV=36 d'al-bayan (voir
// al-bayan/world/AlBayanWorld.tsx) : le Hall (20x16) et les salles de quête
// (12x12) sont physiquement plus grandes que les zones d'al-bayan, à même
// ISO_DISTANCE=7 il faut un champ plus ouvert pour cadrer assez de la pièce.
// Ce n'est pas une dérive accidentelle de la duplication caméra.
const BASE_FOV = 40;

interface IsoCameraFollowProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  yawRef: React.MutableRefObject<number>;
  cameraReadyRef: React.MutableRefObject<boolean>;
}

/** Caméra isométrique orbitale — même logique qu'al-bayan/world/AlBayanWorld.tsx
 * (dupliquée plutôt que ré-exportée, pour ne pas risquer de régresser
 * al-bayan en la refactorant sous pression de temps). */
function IsoCameraFollow({ avatarRef, yawRef, cameraReadyRef }: IsoCameraFollowProps) {
  const { camera, scene } = useThree();
  const perspCamera = camera as THREE.PerspectiveCamera;
  const desired = useRef(new THREE.Vector3());
  const candidates = useRef<THREE.Mesh[] | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const rayDir = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!cameraReadyRef.current) return;
    const avatar = avatarRef.current;
    if (!avatar) return;

    if (!candidates.current) {
      candidates.current = collectOccluderCandidates(scene, avatar);
    }

    const yaw = yawRef.current;
    let distance = ISO_DISTANCE;
    for (const angle of CAM_RAY_ANGLES) {
      const d = getCameraDir(yaw + angle);
      rayDir.current.set(d.x, d.y, d.z);
      raycaster.current.set(avatar.position, rayDir.current);
      raycaster.current.near = 0.1;
      raycaster.current.far = ISO_DISTANCE;
      const hits = raycaster.current.intersectObjects(candidates.current, false);
      if (hits.length > 0) {
        distance = Math.min(distance, Math.max(MIN_CAM_DISTANCE, hits[0].distance - CAM_WALL_MARGIN));
      }
    }

    const offset = getCameraOffset(yaw);
    const scale = distance / ISO_DISTANCE;
    desired.current.set(
      avatar.position.x + offset.x * scale,
      avatar.position.y + offset.y * scale,
      avatar.position.z + offset.z * scale
    );
    camera.position.lerp(desired.current, ISO_FOLLOW_LERP);

    camera.position.y += Math.sin(performance.now() * 0.00035) * 0.025;

    const shake = getShakeOffset();
    camera.position.x += shake.x;
    camera.position.y += shake.y * 0.5;

    camera.lookAt(avatar.position.x, avatar.position.y + 1.1, avatar.position.z);

    if (perspCamera.isPerspectiveCamera) {
      const targetFov = BASE_FOV + shake.fovPunch;
      if (Math.abs(perspCamera.fov - targetFov) > 0.01) {
        perspCamera.fov = targetFov;
        perspCamera.updateProjectionMatrix();
      }
    }
  });

  return null;
}

function ToneMappingSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.3;
  }, [gl]);
  return null;
}

function InitialSpawn({ avatarRef, yawRef }: { avatarRef: React.RefObject<THREE.Group | null>; yawRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useEffect(() => {
    avatarRef.current?.position.set(SPAWN.x, SPAWN.y, SPAWN.z);
    const offset = getCameraOffset(yawRef.current);
    camera.position.set(SPAWN.x + offset.x, SPAWN.y + offset.y, SPAWN.z + offset.z);
    camera.lookAt(SPAWN.x, SPAWN.y + 1.1, SPAWN.z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface MaisonSagesseWorldProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  yawRef: React.MutableRefObject<number>;
  cameraReadyRef: React.MutableRefObject<boolean>;
  onConfirmFaith?: () => void;
  onConfirmScience?: () => void;
  onConfirmWisdom?: () => void;
  solvedFaith?: boolean;
  solvedScience?: boolean;
  solvedWisdom?: boolean;
  hallSunRef?: React.Ref<THREE.Mesh>;
}

/**
 * Monde ouvert persistant de Maison de la Sagesse — même architecture
 * qu'al-bayan/world/AlBayanWorld.tsx : un hub (le Hall) et 3 zones de quête
 * disposées en étoile, reliées par des corridors qu'on traverse en marchant.
 * Avatar en 3e personne + caméra isométrique orbitale, plus de caméra FPS
 * désincarnée.
 */
export default function MaisonSagesseWorld({
  avatarRef,
  joystickRef,
  yawRef,
  cameraReadyRef,
  onConfirmFaith,
  onConfirmScience,
  onConfirmWisdom,
  solvedFaith,
  solvedScience,
  solvedWisdom,
  hallSunRef,
}: MaisonSagesseWorldProps) {
  return (
    <group>
      <fog attach="fog" args={["#0A0810", 30, 70]} />
      <hemisphereLight args={["#2A1860", "#4A3010", 0.35] as unknown as [string, string, number]} />
      <ambientLight color="#2A2010" intensity={0.4} />

      <Sparkles count={160} scale={[50, 8, 50]} size={1.3} speed={0.1} color="#D4AF37" opacity={0.4} />

      {/* Dalle de fondation continue sous tout le complexe. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow userData={{ noCollide: true }}>
        <planeGeometry args={[WORLD_BOUNDS.x * 2.2, WORLD_BOUNDS.z * 2.2]} />
        <meshStandardMaterial color="#0A0806" roughness={0.95} />
      </mesh>

      <group position={ZONES.hall.position}>
        <MainHall sunRef={hallSunRef} avatarRef={avatarRef} />
      </group>
      <group position={ZONES.science.position}>
        <QuestScience onConfirm={onConfirmScience} avatarRef={avatarRef} zoneOffset={ZONES.science.position} solved={solvedScience} />
      </group>
      <group position={ZONES.faith.position}>
        <QuestFaith onConfirm={onConfirmFaith} avatarRef={avatarRef} zoneOffset={ZONES.faith.position} solved={solvedFaith} />
      </group>
      <group position={ZONES.wisdom.position}>
        <QuestWisdom onConfirm={onConfirmWisdom} avatarRef={avatarRef} zoneOffset={ZONES.wisdom.position} solved={solvedWisdom} />
      </group>

      <Corridors />

      <WePlayAvatar
        ref={avatarRef}
        joystickRef={joystickRef}
        yawRef={yawRef}
        bounds={WORLD_BOUNDS}
        glowColor="#D4AF37"
        onFootstep={playFootstep}
      />

      <IsoCameraFollow avatarRef={avatarRef} yawRef={yawRef} cameraReadyRef={cameraReadyRef} />
      <InitialSpawn avatarRef={avatarRef} yawRef={yawRef} />
      <ToneMappingSetup />
    </group>
  );
}
