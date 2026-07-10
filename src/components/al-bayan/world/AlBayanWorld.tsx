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
import Majlis, { MAJLIS_POSITION } from "../zones/Majlis";
import Cuisine, { CUISINE_POSITION } from "../zones/Cuisine";
import SuitePrivee, { SUITE_POSITION } from "../zones/SuitePrivee";
import OcclusionFader from "./OcclusionFader";
import CorridorCourScriptorium from "./CorridorCourScriptorium";
import CorridorScriptoriumSanctuaire from "./CorridorScriptoriumSanctuaire";
import CorridorJardinMajlis from "./CorridorJardinMajlis";
import CorridorScriptoriumCuisine from "./CorridorScriptoriumCuisine";
import CorridorMajlisSuite from "./CorridorMajlisSuite";
import AvatarTrail from "./AvatarTrail";
import IncenseSmoke from "./IncenseSmoke";
import CinematicIntro from "./CinematicIntro";
import { getCameraOffset, getCameraDir, ISO_DISTANCE, ISO_FOLLOW_LERP } from "@/lib/al-bayan/iso-camera";
import { collectOccluderCandidates } from "@/lib/al-bayan/occluder-candidates";
import { getShakeOffset } from "@/lib/camera-shake";

// Distance minimale (jamais la caméra ne s'approche plus que ça de
// l'avatar, même collée à un mur) et marge gardée entre la caméra et le mur
// détecté (évite qu'elle ne "touche" littéralement la face intérieure).
// Réduit (2.6 -> 1.8) : les corridors d'interconnexion ne font que 3 unités
// de large — avec l'ancienne valeur, la caméra ne pouvait jamais se loger
// à l'intérieur même après raccourcissement (bug constaté : écran noir au
// passage du corridor Scriptorium↔Sanctuaire).
const MIN_CAM_DISTANCE = 1.8;
const CAM_WALL_MARGIN = 0.4;

// ── Disposition du monde — un seul groupe par zone, footprints qui se
// chevauchent légèrement aux seuils pour ne jamais laisser de "vide" où
// l'avatar marcherait dans le néant (cf. plan : zones carrées/rondes de
// rayon connu, recouvrement volontaire d'environ 1 unité). ──────────────
const ZONES = {
  vestibule: { position: [0, 0, 0] as [number, number, number], rotationY: 0 },
  courTemoignage: { position: [53, 0, 0] as [number, number, number], rotationY: -Math.PI / 2 },
  scriptorium: { position: [-44, -1.1, 0] as [number, number, number], rotationY: Math.PI / 2 },
  sanctuaire: { position: [0, 0.7, -43] as [number, number, number], rotationY: 0 },
};

// Bornes englobantes généreuses pour tout le complexe (simple rectangle
// symétrique, cf. discipline de clamp déjà utilisée ailleurs dans l'app —
// le clamp reste volontairement simple même si le monde n'est plus
// symétrique autour de l'origine). Couvre la Suite Privée (centre x=167,
// demi-taille 12) côté est et la Cuisine (centre x=-98, demi-taille 16.5)
// côté ouest, plus le Sanctuaire (centre z=-43, rayon 24) côté sud.
export const WORLD_BOUNDS = { x: 185, z: 72 };

interface IsoCameraFollowProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  yawRef: React.MutableRefObject<number>;
  pitchRef: React.MutableRefObject<number>;
  cameraReadyRef: React.MutableRefObject<boolean>;
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
// Rayon central + 2 latéraux — l'angle DOIT suivre le demi-FOV horizontal
// réel (BASE_FOV vertical + aspect ratio ~1.6), sinon les rayons latéraux
// ne couvrent plus le bord réel de l'écran et le garde-fou anti-mur rate
// les murs qui ne coupent que le bord du champ de vision (cas vécu : avatar
// plaqué dans un angle de salle, la moitié de l'écran restait noire malgré
// le raccourcissement de distance basé sur le seul rayon central).
const CAM_RAY_ANGLES = [0, 0.60, -0.60];
// Élargi (36° -> 46°) : retour utilisateur direct — à 36° et à la distance
// resserrée d'ISO_DISTANCE (7.5), on ne voit qu'une toute petite tranche
// des pièces "Grand Riad" (jusqu'à 60 unités de large), donnant l'impression
// que le décor ajouté est quasi absent alors qu'il est bien là, juste hors
// champ. CAM_RAY_ANGLES ci-dessus recalculé pour ce nouveau FOV (voir
// commentaire au-dessus).
const BASE_FOV = 46;

function IsoCameraFollow({ avatarRef, yawRef, pitchRef, cameraReadyRef }: IsoCameraFollowProps) {
  const { camera, scene } = useThree();
  const perspCamera = camera as THREE.PerspectiveCamera;
  const desired = useRef(new THREE.Vector3());
  const candidates = useRef<THREE.Mesh[] | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const rayDir = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    if (!cameraReadyRef.current) return; // cinematic intro en cours
    const avatar = avatarRef.current;
    if (!avatar) return;
    const t = clock.getElapsedTime();

    if (!candidates.current) {
      candidates.current = collectOccluderCandidates(scene, avatar);
    }

    const yaw = yawRef.current;
    const pitch = pitchRef.current;
    let distance = ISO_DISTANCE;
    for (const angle of CAM_RAY_ANGLES) {
      const d = getCameraDir(yaw + angle, pitch);
      rayDir.current.set(d.x, d.y, d.z);
      raycaster.current.set(avatar.position, rayDir.current);
      raycaster.current.near = 0.1;
      raycaster.current.far = ISO_DISTANCE;
      const hits = raycaster.current.intersectObjects(candidates.current, false);
      if (hits.length > 0) {
        distance = Math.min(distance, Math.max(MIN_CAM_DISTANCE, hits[0].distance - CAM_WALL_MARGIN));
      }
    }

    const offset = getCameraOffset(yaw, pitch);
    const scale = distance / ISO_DISTANCE;
    desired.current.set(
      avatar.position.x + offset.x * scale,
      avatar.position.y + offset.y * scale,
      avatar.position.z + offset.z * scale
    );
    camera.position.lerp(desired.current, ISO_FOLLOW_LERP);

    // Respiration ambiante — très légère dérive verticale continue, pour
    // que la caméra ne soit jamais parfaitement figée même à l'arrêt.
    camera.position.y += Math.sin(t * 0.35) * 0.025;

    // Secousse d'impact (résolution d'énigme / victoire) — décalage caméra
    // additif + léger coup de zoom (FOV), voir lib/camera-shake.ts.
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
    gl.toneMappingExposure = 1.5;
  }, [gl]);
  return null;
}

const SPAWN = { x: 0, y: 0, z: 0 };

/** Place l'avatar et "snap" la caméra au spawn une seule fois au montage
 * du monde (plus de changement de route à chaque salle désormais). */
function InitialSpawn({ avatarRef, yawRef, pitchRef }: { avatarRef: React.RefObject<THREE.Group | null>; yawRef: React.MutableRefObject<number>; pitchRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useEffect(() => {
    avatarRef.current?.position.set(SPAWN.x, SPAWN.y, SPAWN.z);
    const offset = getCameraOffset(yawRef.current, pitchRef.current);
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
  pitchRef: React.MutableRefObject<number>;
  astrolabeSolved?: boolean;
  onSolveAstrolabe?: () => void;
  majlisUnlocked?: boolean;
  libraryClueFound?: boolean;
  onFindLibraryClue?: () => void;
  manuscriptsSolved?: boolean;
  onSolveManuscripts?: () => void;
  cuisineUnlocked?: boolean;
  jarsRead?: boolean;
  onReadJars?: () => void;
  safeOpen?: boolean;
  lensCollected?: boolean;
  lensPlaced?: boolean;
  onPlaceLens?: () => void;
  sunRef?: React.Ref<THREE.Mesh>;
  vestibuleSunRef?: React.Ref<THREE.Mesh>;
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
  pitchRef,
  astrolabeSolved,
  onSolveAstrolabe,
  majlisUnlocked,
  libraryClueFound,
  onFindLibraryClue,
  manuscriptsSolved,
  onSolveManuscripts,
  cuisineUnlocked,
  jarsRead,
  onReadJars,
  safeOpen,
  lensCollected,
  lensPlaced,
  onPlaceLens,
  sunRef,
  vestibuleSunRef,
}: AlBayanWorldProps) {
  const cameraReadyRef = useRef(false);
  // Recalcule la liste des colliders de WePlayAvatar quand une porte
  // verrouillée s'ouvre (LockedDoor bascule userData.noCollide) — sans ça
  // le collider figé au montage continuerait de bloquer l'avatar même
  // après déverrouillage visuel. La porte Majlis↔Suite Privée se déverrouille
  // directement sur jarsRead (pas de flag dédié — cf. CorridorMajlisSuite).
  const collidersVersion = Number(!!majlisUnlocked) + Number(!!cuisineUnlocked) * 2 + Number(!!jarsRead) * 4;

  return (
    <group>
      {/* Brouillard exponentiel (FogExp2) plutôt que linéaire : une teinte
          ocre/ambre très sombre qui épaissit progressivement avec la
          distance donne de la profondeur aux longs corridors sans le "mur"
          net d'un fog linéaire near/far. */}
      {/* Densité réduite (0.015 -> 0.006) : à l'échelle "Grand Riad" (pièces
          jusqu'à 60 unités, galeries de 70), l'ancienne densité rendait tout
          quasi noir au-delà de ~25 unités — un fog pensé pour des pièces
          3x plus petites. */}
      <fogExp2 attach="fog" args={["#0b0805", 0.006]} />
      {/* Fill global : ambiance lumineuse chaude qui débouche les salles sombres
          sans tuer le contrast dramatique — hémisphère et ambient tous deux
          teintés ambre/or (réf. utilisateur : riad au flambeau, pas de teinte
          bleu-nuit froide qui casse l'atmosphère "sable chaud"). */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <hemisphereLight args={["#4A3418", "#4A2800", 0.6] as any} />
      <ambientLight color="#4A3820" intensity={0.9} />

      <Sparkles count={160} scale={[220, 20, 150]} size={1.4} speed={0.12} color="#D4AF37" opacity={0.4} />

      {/* Dalle de fondation continue sous tout le complexe, sous le niveau
          le plus bas (Scriptorium/Cuisine, y=-1.1) — garde-fou : même si
          deux sols de zone ne se recouvrent pas exactement à une jointure,
          il n'y a jamais de vide noir sous les pieds de l'avatar. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]} receiveShadow>
        <planeGeometry args={[WORLD_BOUNDS.x * 2.2, WORLD_BOUNDS.z * 2.2]} />
        <meshStandardMaterial color="#08070A" roughness={0.95} />
      </mesh>

      <group position={ZONES.vestibule.position} rotation={[0, ZONES.vestibule.rotationY, 0]}>
        <Vestibule sunRef={vestibuleSunRef} avatarRef={avatarRef} />
      </group>
      <group position={ZONES.courTemoignage.position} rotation={[0, ZONES.courTemoignage.rotationY, 0]}>
        <CourTemoignage onSolveAstrolabe={onSolveAstrolabe} astrolabeSolved={astrolabeSolved} avatarRef={avatarRef} />
      </group>
      <group position={ZONES.scriptorium.position} rotation={[0, ZONES.scriptorium.rotationY, 0]}>
        <Scriptorium
          sunRef={sunRef}
          avatarRef={avatarRef}
          libraryClueFound={libraryClueFound}
          manuscriptsSolved={manuscriptsSolved}
          onSolveManuscripts={onSolveManuscripts}
        />
      </group>
      <group position={ZONES.sanctuaire.position} rotation={[0, ZONES.sanctuaire.rotationY, 0]}>
        <Sanctuaire avatarRef={avatarRef} lensCollected={lensCollected} lensPlaced={lensPlaced} onPlaceLens={onPlaceLens} />
      </group>
      <group position={MAJLIS_POSITION}>
        <Majlis avatarRef={avatarRef} libraryClueFound={libraryClueFound} onFindLibraryClue={onFindLibraryClue} />
      </group>
      <group position={CUISINE_POSITION}>
        <Cuisine avatarRef={avatarRef} jarsRead={jarsRead} onReadJars={onReadJars} />
      </group>
      <group position={SUITE_POSITION}>
        <SuitePrivee avatarRef={avatarRef} jarsRead={jarsRead} safeOpen={safeOpen} />
      </group>

      {/* Corridors d'interconnexion supplémentaires (en plus de l'étoile
          centrée sur le Vestibule) — coordonnées MONDE directes, pas
          nichés dans le repère tourné d'une zone. */}
      <CorridorCourScriptorium avatarRef={avatarRef} />
      <CorridorScriptoriumSanctuaire avatarRef={avatarRef} />
      <CorridorJardinMajlis avatarRef={avatarRef} majlisUnlocked={!!majlisUnlocked} />
      <CorridorScriptoriumCuisine avatarRef={avatarRef} cuisineUnlocked={!!cuisineUnlocked} />
      <CorridorMajlisSuite avatarRef={avatarRef} jarsRead={!!jarsRead} />

      <WePlayAvatar
        ref={avatarRef}
        joystickRef={joystickRef}
        yawRef={yawRef}
        bounds={WORLD_BOUNDS}
        collidersVersion={collidersVersion}
      />
      <AvatarTrail avatarRef={avatarRef} />

      {/* Colonnes de fumée d'encens dans le Vestibule */}
      <IncenseSmoke position={[7.2, 0.08, -8.4]} />
      <IncenseSmoke position={[-7.2, 0.08, -8.4]} />

      <IsoCameraFollow avatarRef={avatarRef} yawRef={yawRef} pitchRef={pitchRef} cameraReadyRef={cameraReadyRef} />
      <CinematicIntro
        avatarRef={avatarRef}
        yawRef={yawRef}
        pitchRef={pitchRef}
        onComplete={() => { cameraReadyRef.current = true; }}
      />
      <OcclusionFader avatarRef={avatarRef} />
      <InitialSpawn avatarRef={avatarRef} yawRef={yawRef} pitchRef={pitchRef} />
      <ToneMappingSetup />
    </group>
  );
}
