"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { projectJoystickToWorld } from "@/lib/al-bayan/iso-camera";
import { isDescendantOf } from "@/lib/al-bayan/scene-utils";

// Collision : seuls les meshes assez hauts (murs, meubles, colonnes) bloquent
// l'avatar — même seuil de hauteur que l'occlusion caméra, pour ignorer sol,
// tapis, plateaux de carte. Rayon/hauteur d'un petit cylindre de collision
// centré sur l'avatar (pas une sphère : on teste séparément X et Z pour
// glisser le long d'un mur plutôt que de se bloquer net en diagonale).
const COLLIDER_MIN_HEIGHT = 0.4;
const AVATAR_RADIUS = 0.28;
const AVATAR_COLLIDER_HEIGHT = 1.7;

interface WePlayAvatarProps {
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  yawRef: React.MutableRefObject<number>;
  speed?: number;
  bounds: { x: number; z: number };
}

const GLOW_COLOR = "#5EEAD4"; // teal/cyan, assorti à l'ambiance de la bibliothèque
const BOB_AMPLITUDE = 0.05;
const BOB_BASE_FREQ = 7;
const BOB_FREQ_RANGE = 7;
const TILT_MAX = (10 * Math.PI) / 180; // 10° — physique de course demandée
const LIMB_SWING_MAX = (34 * Math.PI) / 180; // amplitude de balancement jambes
const ARM_SWING_RATIO = 0.7; // bras = 70% de l'amplitude des jambes
// Amortissement de l'intensité visuelle (pas la vitesse de déplacement, qui
// reste instantanée pour la réactivité du contrôle) : montée fluide à
// l'accélération, friction progressive sur 3-4 frames (~60ms à 60 FPS) à
// l'arrêt plutôt qu'un arrêt net "robotique" — assez court pour rester
// précis, assez long pour ne pas claquer.
const RISE_RATE = 9;
const FALL_RATE = 16;

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

interface LimbProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  pivot: [number, number, number];
  hangLength: number;
  glowScale?: number;
}

/** Membre articulé : le groupe pivote à la hanche/épaule (le mesh est décalé
 * vers le bas de `hangLength`/2 à l'intérieur), pour un vrai balancement de
 * pendule plutôt qu'une rotation autour du centre du membre. */
const Limb = forwardRef<THREE.Group, LimbProps>(({ geometry, material, pivot, hangLength, glowScale = 1.22 }, ref) => (
  <group ref={ref} position={pivot}>
    <group position={[0, -hangLength / 2, 0]}>
      <mesh geometry={geometry} material={material} castShadow />
      <mesh geometry={geometry} material={haloMat} scale={glowScale} />
    </group>
  </group>
));
Limb.displayName = "Limb";

/**
 * Silhouette humanoïde lumineuse, sans visage par choix éthique : tête,
 * torse, deux bras et deux jambes articulés indépendamment — rendu en
 * émissif cyan plein avec un halo (coque additive) pour un effet "néon
 * hologramme" sans coût de post-processing.
 *
 * Animation de marche : jambes et bras se balancent en opposition de phase
 * (gauche/droite, bras contro-latéraux), amplitude et cadence proportionnelles
 * à un magnitude AMORTI (monte vite, retombe lentement) plutôt qu'au
 * joystick brut — élimine l'effet "glaçon qui glisse" et le décrochage net
 * à l'arrêt. Le déplacement réel reste piloté par le joystick brut pour
 * rester réactif ; seule l'habillage visuel (bob/tilt/balancement) est amorti.
 *
 * Contrôles (monde ouvert isométrique, caméra orbitale) :
 * - le déplacement (joystickRef) est projeté dans le repère écran de la
 *   caméra avec le yaw d'orbite COURANT (`projectJoystickToWorld(...,
 *   yawRef.current)`) — pousser vers le haut va toujours vers le fond de
 *   l'écran, quel que soit l'angle d'orbite actuel.
 * - l'orientation visuelle (rotation.y du groupe externe) vient du même
 *   `yawRef`, piloté par le pouce droit (zone tactile droite, page.tsx),
 *   qui fait aussi tourner la caméra (cf. AlBayanWorld.tsx) — caméra et
 *   avatar tournent ensemble.
 */
const WePlayAvatar = forwardRef<THREE.Group, WePlayAvatarProps>(
  ({ joystickRef, yawRef, speed = 4, bounds }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const bobPhase = useRef(0);
    const movingMag = useRef(0);
    useImperativeHandle(ref, () => groupRef.current as THREE.Group);

    const { scene } = useThree();
    const colliders = useRef<THREE.Box3[] | null>(null);
    const scratchBox = useRef(new THREE.Box3());

    // Collecte unique des volumes solides (murs, colonnes, comptoir, tables,
    // balance, astrolabe...) une fois la scène montée — elle est statique,
    // pas besoin de recalculer à chaque frame.
    useEffect(() => {
      const avatar = groupRef.current;
      if (!avatar) return;
      const list: THREE.Box3[] = [];
      scene.traverse((obj) => {
        // `InstancedMesh` hérite `type === "Mesh"` de three.js (aucun type
        // distinct défini) — sans cette exclusion explicite, un nuage de
        // particules (AmbientParticles) ou un lattice (Moucharabieh) produit
        // une boîte englobante couvrant TOUTES ses instances à la fois,
        // traitée comme un unique mur plein massif (bug constaté : avatar
        // bloqué dès le spawn par la boîte combinée de 200 grains de poussière).
        if (obj.type !== "Mesh" || obj instanceof THREE.InstancedMesh) return;
        if (isDescendantOf(obj, avatar)) return;
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
    const armLength = 0.55;
    const legLength = 0.72;

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

        // Collision stricte : on tente le déplacement complet, puis chaque
        // axe séparément s'il échoue (glisse le long du mur plutôt que de
        // se figer net en diagonale contre un coin).
        if (!collidesAt(nextX, nextZ)) {
          group.position.x = nextX;
          group.position.z = nextZ;
        } else {
          if (!collidesAt(nextX, group.position.z)) group.position.x = nextX;
          if (!collidesAt(group.position.x, nextZ)) group.position.z = nextZ;
        }
      }

      // Amortissement "poids réel" : monte vite vers la cible, retombe en
      // douceur — c'est ce magnitude amorti qui pilote TOUTE l'animation
      // (bob, inclinaison, balancement des membres), jamais le joystick brut.
      const rate = mag > movingMag.current ? RISE_RATE : FALL_RATE;
      movingMag.current += (mag - movingMag.current) * Math.min(1, rate * dt);
      const m = movingMag.current;

      if (m > 0.004) {
        bobPhase.current += dt * (BOB_BASE_FREQ + BOB_FREQ_RANGE * m);
        body.position.y = Math.sin(bobPhase.current) * BOB_AMPLITUDE * m;
        body.rotation.x = TILT_MAX * m;

        const swing = Math.sin(bobPhase.current) * LIMB_SWING_MAX * m;
        if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * ARM_SWING_RATIO;
        if (rightArmRef.current) rightArmRef.current.rotation.x = swing * ARM_SWING_RATIO;
      } else {
        bobPhase.current = 0;
        movingMag.current = 0;
        body.position.y = 0;
        body.rotation.x = 0;
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
      }

      // Orientation pilotée exclusivement par le pouce droit (yawRef) —
      // découplée du mouvement et de la caméra (qui reste fixe).
      group.rotation.y = yawRef.current;
    });

    return (
      <group ref={groupRef}>
        <group ref={bodyRef}>
          <group position={[0, 1.5, 0]}>
            <mesh geometry={headGeo} material={bodyMat} castShadow />
            <mesh geometry={headGeo} material={haloMat} scale={1.18} />
          </group>
          <group position={[0, 1.12, 0]}>
            <mesh geometry={torsoGeo} material={bodyMat} castShadow />
            <mesh geometry={torsoGeo} material={haloMat} scale={1.18} />
          </group>

          <Limb ref={leftArmRef} geometry={armGeo} material={bodyMat} pivot={[-0.21, 1.38, 0]} hangLength={armLength} glowScale={1.3} />
          <Limb ref={rightArmRef} geometry={armGeo} material={bodyMat} pivot={[0.21, 1.38, 0]} hangLength={armLength} glowScale={1.3} />
          <Limb ref={leftLegRef} geometry={legGeo} material={bodyMat} pivot={[-0.09, 0.78, 0]} hangLength={legLength} glowScale={1.22} />
          <Limb ref={rightLegRef} geometry={legGeo} material={bodyMat} pivot={[0.09, 0.78, 0]} hangLength={legLength} glowScale={1.22} />
        </group>

        {/* Lueur de contact cyan discrète au sol — hors du groupe qui
            bascule, pour rester ancrée au sol et ne pas flotter avec le bob. */}
        <pointLight position={[0, 0.1, 0]} intensity={0.8} color={GLOW_COLOR} distance={2.4} />
      </group>
    );
  }
);

WePlayAvatar.displayName = "WePlayAvatar";

export default WePlayAvatar;
