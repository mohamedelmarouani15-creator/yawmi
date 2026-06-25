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
import { getCameraOffset, getCameraDir, ISO_DISTANCE, ISO_FOLLOW_LERP } from "@/lib/al-bayan/iso-camera";
import { collectOccluderCandidates } from "@/lib/al-bayan/occluder-candidates";

// Distance minimale (jamais la caméra ne s'approche plus que ça de
// l'avatar, même collée à un mur) et marge gardée entre la caméra et le mur
// détecté (évite qu'elle ne "touche" littéralement la face intérieure).
const MIN_CAM_DISTANCE = 2.6;
const CAM_WALL_MARGIN = 0.4;

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
  yawRef: React.MutableRefObject<number>;
}

/**
 * Caméra isométrique ORBITALE : l'inclinaison reste fixe (cf. iso-camera.ts),
 * mais la rotation horizontale suit désormais `yawRef` (pouce droit) en
 * direct — caméra ET avatar tournent ensemble autour du même axe vertical.
 * Seule la POSITION est lissée (lerp) ; l'angle change instantanément avec
 * le doigt, exactement comme la rotation de l'avatar.
 *
 * Collision caméra : un avatar plaqué contre un mur par le moteur de
 * collision (WePlayAvatar) pousse la position caméra théorique
 * (avatar + offset) au-delà de ce même mur — la caméra se retrouvait
 * dehors, dans le vide sombre entre les salles, à regarder l'avatar à
 * travers une épaisseur de mur que l'occlusion seule ne suffit pas
 * toujours à compenser (mur dense type étagères). On raccourcit donc la
 * DISTANCE (jamais l'angle) dès qu'un rayon avatar→caméra détecte un mur
 * avant la distance nominale, pour que la caméra reste toujours du bon
 * côté — recalculé chaque frame puisque l'angle d'orbite change en direct.
 */
// Rayon central + 2 latéraux (±26°, autour de l'axe vertical) — un seul
// rayon au centre rate les murs qui ne coupent que le bord du champ de
// vision (cas vécu : avatar plaqué dans un angle de salle, la moitié de
// l'écran restait noire malgré le raccourcissement de distance basé sur le
// seul rayon central).
const CAM_RAY_ANGLES = [0, 0.46, -0.46];

function IsoCameraFollow({ avatarRef, yawRef }: IsoCameraFollowProps) {
  const { camera, scene } = useThree();
  const desired = useRef(new THREE.Vector3());
  const candidates = useRef<THREE.Mesh[] | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const rayDir = useRef(new THREE.Vector3());

  useFrame(() => {
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
 * isométrique orbitale (pitch fixe, yaw piloté par le pouce droit).
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
      {/* Sécurité anti-pixellisation des ombres uniquement — pas un éclairage
          global plat, juste assez pour déboucher le noir total. */}
      <ambientLight color="#3a3220" intensity={0.2} />

      <Sparkles count={140} scale={[40, 6, 40]} size={1.6} speed={0.15} color="#D4AF37" opacity={0.5} />

      {/* Dalle de fondation continue sous tout le complexe, sous le niveau
          le plus bas (Scriptorium, y=-0.6) — garde-fou : même si deux sols
          de zone ne se recouvrent pas exactement à une jointure, il n'y a
          jamais de vide noir sous les pieds de l'avatar. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]} receiveShadow>
        <planeGeometry args={[WORLD_BOUNDS.x * 2.2, WORLD_BOUNDS.z * 2.2]} />
        <meshStandardMaterial color="#08070A" roughness={0.95} />
      </mesh>

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
      <IsoCameraFollow avatarRef={avatarRef} yawRef={yawRef} />
      <OcclusionFader avatarRef={avatarRef} />
      <InitialSpawn avatarRef={avatarRef} yawRef={yawRef} />
      <ToneMappingSetup />
    </group>
  );
}
