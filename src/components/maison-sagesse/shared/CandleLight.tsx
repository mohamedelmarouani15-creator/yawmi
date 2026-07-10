"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Au-delà de cette distance, le joueur est dans une autre zone (murs opaques
// entre elles) : geler le sway/scintillement plutôt que de les calculer pour
// une bougie invisible. Voir AmbientParticles.tsx pour le même garde-fou.
const ACTIVE_RADIUS = 20;

interface CandleLightProps {
  position: [number, number, number];
  intensity?: number;
  /** Ref MONDE de l'avatar — si absent (ex: usages al-bayan, corridors),
   * l'animation tourne toujours, comme avant ce garde-fou. */
  avatarRef?: React.RefObject<THREE.Group | null>;
}

// Inner flame mesh that flickers and sways
function FlameMesh({ avatarRef }: { avatarRef?: React.RefObject<THREE.Group | null> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (avatarRef?.current) {
      mesh.getWorldPosition(worldPos);
      if (worldPos.distanceTo(avatarRef.current.position) > ACTIVE_RADIUS) return;
    }

    const t = clock.getElapsedTime();

    // Gentle sway
    mesh.rotation.z = Math.sin(t * 3.1 + 0.5) * 0.08;
    mesh.rotation.x = Math.sin(t * 2.7) * 0.04;

    // Scale flicker — the flame breathes
    const flicker = 1 + Math.sin(t * 8.3) * 0.06 + Math.sin(t * 13.7) * 0.04;
    mesh.scale.set(flicker * 0.8, flicker, flicker * 0.8);

    // Emissive pulse
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.2 + Math.sin(t * 7.1) * 0.3 + Math.sin(t * 11.3) * 0.2;
  });

  const geometry = useMemo(() => {
    // Teardrop-like flame: stretched sphere, narrow at top
    const geo = new THREE.SphereGeometry(0.04, 6, 8);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      // Taper the top half inward to create a flame shape
      if (y > 0) {
        const factor = 1 - y / 0.04 * 0.6;
        pos.setX(i, pos.getX(i) * factor);
        pos.setZ(i, pos.getZ(i) * factor);
      }
      // Stretch vertically
      pos.setY(i, y * 2.2);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFC840",
        emissive: "#FF8800",
        emissiveIntensity: 1.2,
        roughness: 0.2,
        metalness: 0,
        transparent: true,
        opacity: 0.92,
      }),
    []
  );

  return <mesh ref={meshRef} geometry={geometry} material={material} castShadow={false} />;
}

// Candle body (wax pillar)
function CandleBody() {
  const geometry = useMemo(() => new THREE.CylinderGeometry(0.035, 0.04, 0.22, 8), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#F0E8C8",
        roughness: 0.9,
        metalness: 0,
      }),
    []
  );
  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
}

// Candle holder / base
function CandleHolder() {
  const geometry = useMemo(() => new THREE.CylinderGeometry(0.06, 0.07, 0.04, 10), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#7A5C2A",
        roughness: 0.6,
        metalness: 0.4,
      }),
    []
  );
  return <mesh geometry={geometry} material={material} position={[0, -0.13, 0]} castShadow receiveShadow />;
}

export default function CandleLight({ position, intensity = 1.5, avatarRef }: CandleLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const light = lightRef.current;
    if (!light) return;

    if (avatarRef?.current) {
      light.getWorldPosition(worldPos);
      if (worldPos.distanceTo(avatarRef.current.position) > ACTIVE_RADIUS) {
        // `visible = false` (pas juste une intensité figée) : three.js exclut
        // les lumières invisibles du tableau envoyé au shader (WebGLLights),
        // donc ça retire vraiment son coût par-fragment — pas seulement son
        // scintillement. Le villa entier (toutes les pièces + corridors)
        // reste monté en permanence, donc sans ce garde-fou chaque bougie
        // contribue à CHAQUE fragment de la scène, où que soit le joueur.
        light.visible = false;
        return;
      }
    }
    light.visible = true;

    const t = clock.getElapsedTime();
    // Organic flicker using multiple sine waves at prime frequencies
    const flicker =
      intensity *
      (1 +
        Math.sin(t * 6.7) * 0.12 +
        Math.sin(t * 11.3) * 0.08 +
        Math.sin(t * 17.9) * 0.05);
    light.intensity = Math.max(0, flicker);
  });

  return (
    <group position={position}>
      {/* Wax body */}
      <CandleBody />
      {/* Metal holder */}
      <CandleHolder />
      {/* Flame sits above wick */}
      <group position={[0, 0.14, 0]}>
        <FlameMesh avatarRef={avatarRef} />
        {/* Warm glow point light */}
        {/* No castShadow: a shadow-casting point light per candle (6-7 per
            scene) means 6-7 extra shadow-map render passes every frame —
            the single biggest mobile GPU/heat cost in this scene. The
            directional light's shadow already grounds the room. */}
        <pointLight
          ref={lightRef}
          color="#FFA040"
          intensity={intensity}
          distance={5}
          decay={2}
        />
      </group>
    </group>
  );
}
