"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { projectJoystickToWorld } from "@/lib/al-bayan/iso-camera";
import { isDescendantOf } from "@/lib/al-bayan/scene-utils";
import { playFootstep as playFootstepAlBayan } from "@/lib/al-bayan/audio-engine";

const COLLIDER_MIN_HEIGHT = 0.4;
const AVATAR_RADIUS = 0.28;
const AVATAR_COLLIDER_HEIGHT = 1.7;

interface WePlayAvatarProps {
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  yawRef: React.MutableRefObject<number>;
  speed?: number;
  bounds: { x: number; z: number };
  /** Bleu islamique par défaut (al-bayan) — passer une autre couleur pour
   * réutiliser cet avatar dans un autre jeu (ex: doré pour maison-sagesse). */
  glowColor?: string;
  /** Callback de bruit de pas — par défaut celui d'al-bayan ; passer celui
   * d'un autre moteur audio pour un jeu qui réutilise cet avatar. */
  onFootstep?: () => void;
  /** Incrémenter cette valeur force un nouveau balayage de la scène pour
   * reconstruire la liste des colliders — nécessaire pour les portes/passages
   * verrouillés dont le `userData.noCollide` change dynamiquement après
   * résolution d'une énigme (la liste est normalement figée au montage). */
  collidersVersion?: number;
}

const BOB_AMPLITUDE = 0.038;
const BOB_BASE_FREQ = 5.5;
const BOB_FREQ_RANGE = 5.5;
const TILT_MAX = (7 * Math.PI) / 180; // le thobe ondule sobrement
const SLEEVE_SWING_MAX = (18 * Math.PI) / 180; // manches amples, swing réduit
const RISE_RATE = 9;
const FALL_RATE = 16;

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
  ({ joystickRef, yawRef, speed = 4, bounds, glowColor = "#3D7FE8", onFootstep = playFootstepAlBayan, collidersVersion = 0 }, ref) => {
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
    }, [scene, collidersVersion]);

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

    // emissiveIntensity réduite (1.6 -> 0.55) et toneMapped réactivé : à
    // l'ancienne valeur, une émissivité uniforme aussi forte + le Bloom en
    // post-traitement écrasaient tout le modelé (robe, manches, tête, kufi)
    // en un blob bleu plat sans détail — retour utilisateur direct
    // ("je veux voir un vrai personnage"). Le personnage a pourtant déjà une
    // vraie silhouette sculptée ; il fallait juste arrêter de la cramer.
    // `toneMapped: true` laisse l'éclairage ambiant/ponctuel de la pièce
    // creuser un vrai modelé (ombres portées par les plis) au lieu d'un
    // aplat auto-illuminé.
    const bodyMat = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: glowColor,
          emissive: glowColor,
          emissiveIntensity: 0.55,
          roughness: 0.35,
          metalness: 0.1,
          toneMapped: true,
        }),
      [glowColor]
    );

    // Halo de glow — opacité réduite (0.18 -> 0.08) pour le même motif :
    // un halo trop marqué noie la silhouette dans le Bloom au lieu de
    // simplement souligner ses contours.
    const haloMat = useMemo(
      () =>
        new THREE.MeshBasicMaterial({
          color: glowColor,
          transparent: true,
          opacity: 0.08,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      [glowColor]
    );

    // Accent doré (kufi + ceinture) — retour utilisateur : même après le
    // réglage d'émissivité ci-dessus, la silhouette reste dure à distinguer
    // dans les pièces sombres où l'éclairage ambiant ne suffit pas à creuser
    // le modelé par ombrage seul. Un vrai contraste de COULEUR (pas
    // seulement de lumière) reste lisible quelles que soient les conditions
    // d'éclairage de la pièce — cf. palette dorée déjà établie de l'appli
    // (#D4AF37).
    const accentMat = useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: "#D4AF37",
          emissive: "#B8860B",
          emissiveIntensity: 0.4,
          roughness: 0.3,
          metalness: 0.6,
          toneMapped: true,
        }),
      []
    );

    const beltGeo = useMemo(() => new THREE.TorusGeometry(0.245, 0.022, 8, 20), []);

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
        if (m > 0.5) onFootstep();

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

          {/* ── Kufi — teinte dorée, contraste de couleur lisible même dans
              les pièces sombres où l'ombrage seul ne suffit pas ── */}
          <mesh geometry={kufiGeo} material={accentMat} position={[0, 1.705, 0]} castShadow />

          {/* ── Ceinture dorée à la taille — même motif de contraste ── */}
          <mesh geometry={beltGeo} material={accentMat} position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow />

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
        <pointLight position={[0, 0.1, 0]} intensity={0.85} color={glowColor} distance={2.5} />
      </group>
    );
  }
);

WePlayAvatar.displayName = "WePlayAvatar";

export default WePlayAvatar;
