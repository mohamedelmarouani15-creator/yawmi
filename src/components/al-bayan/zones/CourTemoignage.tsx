"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import IslamicArch from "../../maison-sagesse/shared/IslamicArch";
import OctagonalColumn from "../shared/OctagonalColumn";
import InteractiveAura from "../shared/InteractiveAura";
import ProximityPrompt from "../../maison-sagesse/shared/ProximityPrompt";
import { usePBRMaterial } from "@/lib/al-bayan/pbr-materials";
import { PotteryCluster } from "../shared/CorridorDecor";
import DistanceCulledLight from "../shared/DistanceCulledLight";
import { ASTROLABE_RINGS, ASTROLABE_TOLERANCE_DEG, FOUNTAIN_INSCRIPTION } from "@/lib/al-bayan/puzzle-logic";

// Passage à l'échelle "Grand Riad" — empreinte au sol explicitement fixée à
// 60x60 (brief), JS dérive le facteur pour repositionner proportionnellement
// tout ce qui était calé sur l'ancienne taille (14). La hauteur suit un
// facteur plus mesuré (HS) pour rester praticable côté éclairage/collision.
export const SIZE = 60;
const JS = SIZE / 14;
const HS = 1.8;
const H = 9 * HS;

// Triple arcade — les 3 arches doivent faire au moins 3 unités de large
// (passage caméra orbitale + avatar sans secousse). Calculs dérivés plutôt
// que des nombres magiques, pour que colonnes/pans de mur restent cohérents
// si on retouche une largeur.
const CENTER_ARCH_HALF = 1.5 * JS;
const SIDE_ARCH_HALF = 1.5 * JS;
const COLUMN_X = 1.8 * JS;
const ARCH_GAP = 0.3 * JS;
const SIDE_ARCH_X = COLUMN_X + ARCH_GAP + SIDE_ARCH_HALF;
const SIDE_ARCH_OUTER = SIDE_ARCH_X + SIDE_ARCH_HALF;
const FLANK_START = SIDE_ARCH_OUTER + 0.2 * JS;
const FLANK_WIDTH = SIZE / 2 - FLANK_START;
const FLANK_X = (FLANK_START + SIZE / 2) / 2;
const ARCADE_Z = SIZE / 2 - 0.6 * JS;

// Corridor vers le Scriptorium — ouverture taillée dans le mur "+X local"
// (qui correspond, une fois la rotation -90° de la zone appliquée, à un
// couloir qui part vers le monde +Z, au-delà du Vestibule). Voir
// CorridorCourScriptorium.tsx pour le raccord complet.
export const CORRIDOR_OPENING_LOCAL_Z = 17;
export const CORRIDOR_OPENING_HALF = 4;

// Passage vers le Majlis — ouverture taillée dans le mur "-Z local", monde
// +X, direction opposée au reste du complexe. Verrouillé tant que
// l'astrolabe n'est pas résolu — cf. CorridorJardinMajlis.tsx.
export const MAJLIS_GAP_HALF = 4;
const MAJLIS_SEG_LEN = (SIZE - MAJLIS_GAP_HALF * 2) / 2;
const MAJLIS_SEG_X = MAJLIS_GAP_HALF + MAJLIS_SEG_LEN / 2;

/** Pseudo-aléatoire déterministe (même valeur à chaque rendu pour un `n`
 * donné) — évite d'appeler Math.random() pendant le rendu (impur, cf.
 * react-hooks/purity), tout en gardant un aspect "dispersé" naturel. */
function seededRandom(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Lanterne en fer forgé suspendue à une arche — flamme animée + halo, la
 * couleur passe de l'orange chaleureux au blanc pur une fois l'astrolabe
 * résolu (retour visuel immédiat demandé). */
function ForgedLantern({ position, lit }: { position: [number, number, number]; lit: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const glassRef = useRef<THREE.MeshStandardMaterial>(null);
  const targetColor = useMemo(() => new THREE.Color(lit ? "#F8F4EC" : "#FFA940"), [lit]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flicker = 1 + Math.sin(t * 6.3) * 0.08 + Math.sin(t * 10.7) * 0.05;
    if (lightRef.current) {
      lightRef.current.color.lerp(targetColor, 0.04);
      lightRef.current.intensity = (lit ? 2.2 : 1.6) * flicker;
    }
    if (glassRef.current) glassRef.current.color.lerp(targetColor, 0.04);
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
        <meshStandardMaterial color="#2C1810" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Cage en fer forgé */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]} position={[0.13, 0, 0]} castShadow>
          <boxGeometry args={[0.02, 0.34, 0.02]} />
          <meshStandardMaterial color="#1A0F08" roughness={0.4} metalness={0.75} />
        </mesh>
      ))}
      <mesh castShadow>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial ref={glassRef} color="#FFA940" emissive="#FFA940" emissiveIntensity={1.4} roughness={0.2} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} color="#FFA940" intensity={1.6} distance={5} decay={2} />
    </group>
  );
}

/** Lanterne sur pied en fer forgé — jalonne les allées, contrairement à
 * `ForgedLantern` (suspendue à une arche) celle-ci se pose au sol. */
function LanternPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 1.8, 8]} />
        <meshStandardMaterial color="#1A0F08" roughness={0.4} metalness={0.7} />
      </mesh>
      <ForgedLantern position={[0, 1.9, 0]} lit={true} />
    </group>
  );
}

const PLANTER_LEAF_COLORS = ["#1F4A1F", "#2C5E2C", "#3A6B3A"];

/** Jardinière de pierre avec végétation dense — feuillage en instances basses poly. */
function PlanterBox({ position, rotation, seed = 0 }: { position: [number, number, number]; rotation?: [number, number, number]; seed?: number }) {
  const stoneMat = usePBRMaterial("terracotta", { repeat: [1, 0.5], roughnessIntensity: 0.9 });
  const leaves = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: (seededRandom(seed + i) - 0.5) * 0.7,
        z: (seededRandom(seed + i + 100) - 0.5) * 0.35,
        y: 0.32 + seededRandom(seed + i + 200) * 0.28,
        scale: 0.14 + seededRandom(seed + i + 300) * 0.12,
        color: PLANTER_LEAF_COLORS[i % PLANTER_LEAF_COLORS.length],
      })),
    [seed]
  );

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.4, 0.4]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={[l.x, l.y, l.z]} castShadow>
          <icosahedronGeometry args={[l.scale, 0]} />
          <meshStandardMaterial color={l.color} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/** Palmier stylisé — tronc incliné légèrement + palmes basses poly en éventail. */
function PalmTree({ position, scale = 1, seed = 0 }: { position: [number, number, number]; scale?: number; seed?: number }) {
  const lean = (seededRandom(seed) - 0.5) * 0.12;
  const fronds = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + seededRandom(seed + i + 40) * 0.4;
        const droop = 0.35 + seededRandom(seed + i + 80) * 0.25;
        return { a, droop };
      }),
    [seed]
  );
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2.2, 0]} rotation={[0, 0, lean]} castShadow>
        <cylinderGeometry args={[0.1, 0.22, 4.4, 8]} />
        <meshStandardMaterial color="#5C4A2A" roughness={0.85} />
      </mesh>
      <group position={[Math.sin(lean) * 4.4, 4.3, 0]}>
        {fronds.map((f, i) => (
          <mesh key={i} position={[Math.cos(f.a) * 0.5, -f.droop * 0.6, Math.sin(f.a) * 0.5]} rotation={[f.droop, f.a, 0]} castShadow>
            <coneGeometry args={[0.35, 2.6, 4]} />
            <meshStandardMaterial color="#2C5E2C" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Oranger stylisé — feuillage sphérique dense + points orange (fruits). */
function OrangeTree({ position, scale = 1, seed = 0 }: { position: [number, number, number]; scale?: number; seed?: number }) {
  const fruits = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = seededRandom(seed + i) * Math.PI * 2;
        const r = 0.55 + seededRandom(seed + i + 30) * 0.3;
        const y = 1.6 + seededRandom(seed + i + 60) * 0.9;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, y };
      }),
    [seed]
  );
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 1.4, 8]} />
        <meshStandardMaterial color="#4A3A22" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <icosahedronGeometry args={[1.0, 1]} />
        <meshStandardMaterial color="#2E5E2A" roughness={0.85} />
      </mesh>
      {fruits.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, f.z]} castShadow>
          <sphereGeometry args={[0.09, 6, 6]} />
          <meshStandardMaterial color="#E8892E" emissive="#7A3A0A" emissiveIntensity={0.15} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** Allée pavée — bande de pierre au sol, légèrement surélevée du zellige
 * environnant, pas de collision (purement décorative/de repère visuel). */
function PavedPath({ from, to, width = 3.2 }: { from: [number, number]; to: [number, number]; width?: number }) {
  const stoneMat = usePBRMaterial("marble", { repeat: [1, 3], color: "#B8AE96", roughnessIntensity: 0.7 });
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dx, dz);
  const cx = (from[0] + to[0]) / 2;
  const cz = (from[1] + to[1]) / 2;
  return (
    <mesh position={[cx, 0.006, cz]} rotation={[-Math.PI / 2, 0, angle]} userData={{ noCollide: true }}>
      <planeGeometry args={[width, length]} />
      <primitive object={stoneMat} attach="material" />
    </mesh>
  );
}

/** Jet d'eau animé — colonne de fines particules montant puis retombant en
 * cloche, boucle continue. */
function WaterJet({ position, height = 1.4 }: { position: [number, number, number]; height?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 32;
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => seededRandom(i)), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const phase = (t * 0.8 + seeds[i]) % 1;
      const y = phase * height;
      const spread = phase * phase * 0.5;
      const angle = seeds[i] * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * spread, y, Math.sin(angle) * spread);
      dummy.scale.setScalar(0.03 + (1 - phase) * 0.02);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={position} userData={{ noCollide: true }}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#BFE0FF" emissive="#4A90D9" emissiveIntensity={0.3} transparent opacity={0.7} roughness={0.1} />
    </instancedMesh>
  );
}

/** Bassin monumental en zelliges avec fontaine centrale — l'inscription
 * gravée sur la margelle donne les indices de l'astrolabe. */
function Fountain() {
  const marbleMat = usePBRMaterial("marble", { repeat: [2, 2] });
  const zelligeRimMat = usePBRMaterial("zellige", { repeat: [6, 6] });
  const RADIUS = 5.2;
  return (
    <group position={[0, 0.015, 11]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[RADIUS, 24]} />
        <meshStandardMaterial color="#0B1A3A" roughness={0.05} metalness={0.3} />
      </mesh>
      {/* Margelle en zelliges animés — tube (pas un ringGeometry plat) pour
          une vraie collision, cf. audit : un anneau plat reste sous le
          seuil de hauteur du moteur de collision et laisse l'avatar
          traverser le bassin. */}
      <mesh position={[0, -0.25, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[RADIUS + 0.45, RADIUS + 0.45, 0.6, 24, 1, true]} />
        <primitive object={zelligeRimMat} attach="material" />
      </mesh>
      {/* Colonne centrale + vasque d'où jaillit le jet */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.3, 1.1, 12]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      <mesh position={[0, 1.16, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.38, 0.2, 14]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      <WaterJet position={[0, 1.28, 0]} height={1.3} />
    </group>
  );
}

/** Astrolabe monumental — 3 anneaux orientables (indices gravés sur la
 * fontaine), déverrouille le Majlis une fois les 3 alignés simultanément. */
function AstrolabePuzzle({
  avatarRef,
  onSolved,
  solved,
}: {
  avatarRef: React.RefObject<THREE.Group | null>;
  onSolved: () => void;
  solved: boolean;
}) {
  const [angles, setAngles] = useState<Record<string, number>>({ heures: 0, mois: 0, etoiles: 0 });
  const ringRefs = useRef<Record<string, THREE.Group | null>>({});

  const allAligned = ASTROLABE_RINGS.every((ring) => {
    const diff = Math.abs(((angles[ring.id] - ring.targetDeg + 540) % 360) - 180);
    return diff <= ASTROLABE_TOLERANCE_DEG;
  });

  useEffect(() => {
    if (allAligned && !solved) onSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAligned, solved]);

  useFrame(() => {
    for (const ring of ASTROLABE_RINGS) {
      const g = ringRefs.current[ring.id];
      if (g) g.rotation.y = THREE.MathUtils.degToRad(angles[ring.id]);
    }
  });

  const ringMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#C8A84B", emissive: "#7A5A20", emissiveIntensity: 0.25, roughness: 0.35, metalness: 0.8 }),
    []
  );

  return (
    <group position={[0, 0, -9]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.22, 1.4, 8]} />
        <meshStandardMaterial color="#3D2A10" roughness={0.6} metalness={0.2} />
      </mesh>
      {ASTROLABE_RINGS.map((ring, i) => (
        <group key={ring.id} ref={(el) => { ringRefs.current[ring.id] = el; }} position={[0, 1.4 + i * 0.03, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={ringMat} castShadow>
            <torusGeometry args={[0.77 - i * 0.2, 0.028, 6, 32]} />
          </mesh>
          <mesh position={[0.77 - i * 0.2, 0, 0]} material={ringMat} castShadow>
            <coneGeometry args={[0.06, 0.14, 4]} />
          </mesh>
        </group>
      ))}

      {!solved && (
        // zoneOffset=[0,0,0] + localPosition = position MONDE précalculée :
        // cette zone est tournée (rotationY=-π/2 dans AlBayanWorld.tsx),
        // ProximityPrompt fait une simple addition sans tenir compte de la
        // rotation — lui passer la coordonnée locale brute donnerait un
        // rayon de proximité centré au mauvais endroit. Local (0,0,-9) +
        // rotation -90° + offset zone (53,0,0) = monde (62,0,0).
        <ProximityPrompt avatarRef={avatarRef} zoneOffset={[0, 0, 0]} localPosition={[62, 0, 0]} radius={3.2}>
          {(inRange) =>
            inRange && (
              <Html position={[0, 2.6, 0]} center distanceFactor={9}>
                <div
                  className="flex flex-col items-center gap-2 rounded-2xl px-4 py-3"
                  style={{ background: "rgba(10,15,13,0.85)", border: "1px solid rgba(212,175,55,0.4)", backdropFilter: "blur(10px)", width: 220 }}
                >
                  <span style={{ fontSize: 9, color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)", textAlign: "center" }}>
                    {FOUNTAIN_INSCRIPTION.slice(0, 90)}…
                  </span>
                  {ASTROLABE_RINGS.map((ring) => {
                    const diff = Math.abs(((angles[ring.id] - ring.targetDeg + 540) % 360) - 180);
                    const ok = diff <= ASTROLABE_TOLERANCE_DEG;
                    return (
                      <div key={ring.id} className="flex flex-col items-center gap-0.5" style={{ width: "100%" }}>
                        <span style={{ fontSize: 9, color: ok ? "#34d399" : "#D4AF37", fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}>
                          {ring.label} — {Math.round(angles[ring.id])}° {ok ? "✓" : ""}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={359}
                          value={angles[ring.id]}
                          onChange={(e) => setAngles((prev) => ({ ...prev, [ring.id]: Number(e.target.value) }))}
                          style={{ width: "100%", accentColor: "#D4AF37" }}
                        />
                      </div>
                    );
                  })}
                </div>
              </Html>
            )
          }
        </ProximityPrompt>
      )}
    </group>
  );
}

/** Banquette en cuir sombre. */
function LeatherBench({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const leatherMat = usePBRMaterial("leather", { repeat: [2, 1] });
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.28, 0]} castShadow material={leatherMat}>
        <boxGeometry args={[1.6, 0.16, 0.55]} />
      </mesh>
      <mesh position={[0, 0.5, -0.22]} castShadow material={leatherMat}>
        <boxGeometry args={[1.6, 0.5, 0.1]} />
      </mesh>
    </group>
  );
}

/**
 * Zone 2 — Le Jardin Majestueux (ex-Cour du Témoignage). 60x60 unités à
 * ciel ouvert : bassin monumental en zelliges à jet d'eau animé, allées
 * pavées en croix, palmiers et orangers, lanternes en fer forgé, astrolabe
 * monumental dont les 3 anneaux — orientés selon les indices gravés sur la
 * fontaine — déverrouillent le passage vers le Majlis.
 */
export default function CourTemoignage({
  onSolveAstrolabe,
  astrolabeSolved,
  avatarRef,
}: {
  onSolveAstrolabe?: () => void;
  astrolabeSolved?: boolean;
  avatarRef: React.RefObject<THREE.Group | null>;
}) {
  const zelligeMat = usePBRMaterial("zellige", { repeat: [16, 16] });
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E8E4DA", roughness: 0.5 }), []);

  return (
    <group>
      <ambientLight color="#4A3520" intensity={0.32} />
      {/* Puits de lumière vertical, blanc, solennel — seul spot à ombre de la zone */}
      <spotLight
        position={[0, H - 1, -9]}
        target-position={[0, 0, -9]}
        angle={0.4}
        penumbra={0.6}
        intensity={9}
        distance={H + 8}
        color="#F4F2EC"
        castShadow
        shadow-mapSize-width={640}
        shadow-mapSize-height={640}
      />
      <DistanceCulledLight color="#FFAA44" intensity={4.5} distance={20} decay={2} position={[15, 5, 15]} avatarRef={avatarRef} activeRadius={55} />
      <DistanceCulledLight color="#FFAA44" intensity={4.5} distance={20} decay={2} position={[-15, 5, 15]} avatarRef={avatarRef} activeRadius={55} />
      <DistanceCulledLight color="#FFC266" intensity={4.0} distance={18} decay={2} position={[0, 5, 11]} avatarRef={avatarRef} activeRadius={55} />
      <DistanceCulledLight color="#FFC266" intensity={3.4} distance={16} decay={2} position={[0, 6, -9]} avatarRef={avatarRef} activeRadius={55} />
      <DistanceCulledLight color="#E8A33D" intensity={2.6} distance={18} decay={2} position={[-20, 6, -5]} avatarRef={avatarRef} activeRadius={55} />
      <DistanceCulledLight color="#E8A33D" intensity={2.6} distance={18} decay={2} position={[20, 6, -5]} avatarRef={avatarRef} activeRadius={55} />

      {/* Sol en zelliges (mosaïque géométrique) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <primitive object={zelligeMat} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H + 12, 0]}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#101828" roughness={0.9} />
      </mesh>

      {/* Allées en croix pavées, centrées sur le bassin */}
      <PavedPath from={[0, -26]} to={[0, 26]} width={3.6} />
      <PavedPath from={[-26, 11]} to={[26, 11]} width={3.6} />

      {/* Mur vers le Scriptorium (corridor) */}
      <mesh
        position={[SIZE / 2 - 0.1, H / 2, (-SIZE / 2 + (CORRIDOR_OPENING_LOCAL_Z - CORRIDOR_OPENING_HALF)) / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.2, H, SIZE / 2 + (CORRIDOR_OPENING_LOCAL_Z - CORRIDOR_OPENING_HALF)]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh
        position={[SIZE / 2 - 0.1, H / 2, (SIZE / 2 + (CORRIDOR_OPENING_LOCAL_Z + CORRIDOR_OPENING_HALF)) / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.2, H, SIZE / 2 - (CORRIDOR_OPENING_LOCAL_Z + CORRIDOR_OPENING_HALF)]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[-SIZE / 2 + 0.1, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, H, SIZE]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Mur vers le Majlis — percé au centre, verrouillé par l'astrolabe */}
      <mesh position={[-MAJLIS_SEG_X, H / 2, -SIZE / 2 + 0.1]} receiveShadow castShadow>
        <boxGeometry args={[MAJLIS_SEG_LEN, H, 0.2]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[MAJLIS_SEG_X, H / 2, -SIZE / 2 + 0.1]} receiveShadow castShadow>
        <boxGeometry args={[MAJLIS_SEG_LEN, H, 0.2]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Pans de mur encadrant la triple arcade */}
      {[-1, 1].map((side) => (
        <mesh key={`arcade-flank-${side}`} position={[side * FLANK_X, H / 2, SIZE / 2 - 0.1]} receiveShadow castShadow>
          <boxGeometry args={[FLANK_WIDTH, H, 0.2]} />
          <primitive object={wallMat} attach="material" />
        </mesh>
      ))}

      {/* Seuil ouvert vers le Vestibule — triple arcade monumentale */}
      <OctagonalColumn position={[-COLUMN_X, 0, ARCADE_Z]} height={H} color="#D8D2C2" accentColor="#C9BFA8" />
      <OctagonalColumn position={[COLUMN_X, 0, ARCADE_Z]} height={H} color="#D8D2C2" accentColor="#C9BFA8" />
      <group position={[0, 0, ARCADE_Z]}>
        <IslamicArch width={CENTER_ARCH_HALF * 2} height={H * 0.6} depth={0.3 * JS} color="#D8D2C2" />
      </group>
      <group position={[-SIDE_ARCH_X, 0, ARCADE_Z]}>
        <IslamicArch width={SIDE_ARCH_HALF * 2} height={H * 0.55} depth={0.25 * JS} color="#D8D2C2" />
      </group>
      <group position={[SIDE_ARCH_X, 0, ARCADE_Z]}>
        <IslamicArch width={SIDE_ARCH_HALF * 2} height={H * 0.55} depth={0.25 * JS} color="#D8D2C2" />
      </group>
      <ForgedLantern position={[-COLUMN_X, H * 0.55, ARCADE_Z]} lit={!!astrolabeSolved} />
      <ForgedLantern position={[COLUMN_X, H * 0.55, ARCADE_Z]} lit={!!astrolabeSolved} />

      <Fountain />

      <InteractiveAura position={[0, 0.02, -9]} color="#D4AF37" radius={2.2} />
      <AstrolabePuzzle avatarRef={avatarRef} onSolved={() => onSolveAstrolabe?.()} solved={!!astrolabeSolved} />

      {/* Bancs de cuir aux abords du bassin */}
      <LeatherBench position={[-8, 0, 16]} rotation={[0, Math.PI / 2, 0]} />
      <LeatherBench position={[8, 0, 16]} rotation={[0, -Math.PI / 2, 0]} />
      <LeatherBench position={[-8, 0, 5]} rotation={[0, Math.PI / 2, 0]} />
      <LeatherBench position={[8, 0, 5]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Jardinières le long des allées */}
      {[
        [-24, 20], [24, 20], [-24, -2], [24, -2], [-24, -22], [24, -22],
        [-13, -24], [13, -24], [-4, 24], [4, 24],
      ].map(([x, z], i) => (
        <PlanterBox key={i} position={[x, 0, z]} rotation={[0, seededRandom(i + 500) * Math.PI, 0]} seed={i * 7} />
      ))}

      {/* Végétation volumétrique dense — palmiers et orangers dans les
          quatre quadrants, plus la clairière autour du bassin */}
      <PalmTree position={[-19, 0, 19]} scale={1.1} seed={1} />
      <PalmTree position={[19, 0, 19]} scale={0.95} seed={2} />
      <PalmTree position={[-19, 0, -19]} scale={1.05} seed={3} />
      <PalmTree position={[19, 0, -19]} scale={1.0} seed={4} />
      <PalmTree position={[-22, 0, 3]} scale={0.9} seed={5} />
      <PalmTree position={[22, 0, 3]} scale={0.9} seed={6} />
      <OrangeTree position={[-16, 0, 8]} scale={1.0} seed={7} />
      <OrangeTree position={[16, 0, 8]} scale={1.0} seed={8} />
      <OrangeTree position={[-10, 0, 20]} scale={0.85} seed={9} />
      <OrangeTree position={[10, 0, 20]} scale={0.85} seed={10} />
      <OrangeTree position={[-16, 0, -18]} scale={0.9} seed={11} />
      <OrangeTree position={[16, 0, -18]} scale={0.9} seed={12} />

      {/* Lanternes sur pied jalonnant les allées en croix */}
      <LanternPost position={[0, 0, 20]} />
      <LanternPost position={[0, 0, -20]} />
      <LanternPost position={[-20, 0, 11]} />
      <LanternPost position={[20, 0, 11]} />
      <LanternPost position={[-9, 0, 3]} />
      <LanternPost position={[9, 0, 3]} />

      {/* Amas de poteries près des banquettes du bassin — retour utilisateur :
          encore trop peu de décor. Volontairement PAS dans l'arcade
          d'entrée : les arches latérales sont un passage ouvert (largeur
          SIDE_ARCH_HALF*2), y poser du décor l'aurait planté en plein
          milieu du chemin de marche. */}
      <PotteryCluster position={[-11, 0, 16]} />
      <PotteryCluster position={[11, 0, 5]} />
    </group>
  );
}
