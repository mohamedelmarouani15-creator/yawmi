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
import { ASTROLABE_RINGS, ASTROLABE_TOLERANCE_DEG, FOUNTAIN_INSCRIPTION } from "@/lib/al-bayan/puzzle-logic";

const SIZE = 14;
const H = 9;

// Triple arcade — les 3 arches doivent faire au moins 3 unités de large
// (passage caméra orbitale + avatar sans secousse). Calculs dérivés plutôt
// que des nombres magiques, pour que colonnes/pans de mur restent cohérents
// si on retouche une largeur.
const CENTER_ARCH_HALF = 1.5; // largeur 3
const SIDE_ARCH_HALF = 1.5; // largeur 3 (élargi depuis 2.2)
const COLUMN_X = 1.8;
const ARCH_GAP = 0.3;
const SIDE_ARCH_X = COLUMN_X + ARCH_GAP + SIDE_ARCH_HALF;
const SIDE_ARCH_OUTER = SIDE_ARCH_X + SIDE_ARCH_HALF;
const FLANK_START = SIDE_ARCH_OUTER + 0.2;
const FLANK_WIDTH = SIZE / 2 - FLANK_START;
const FLANK_X = (FLANK_START + SIZE / 2) / 2;

// Corridor vers le Scriptorium — ouverture taillée dans le mur "extérieur"
// (local X=SIZE/2-0.1, qui correspond au monde Z≈+SIZE/2 une fois la
// rotation -90° de la zone appliquée). Centré sur le monde X=11.
const CORRIDOR_OPENING_LOCAL_Z = 4;
const CORRIDOR_OPENING_HALF = 1.6;

// Passage vers le Majlis — ouverture taillée dans le mur "-Z local" (qui
// correspond au monde X≈21.9, direction opposée au reste du complexe — cf.
// CorridorJardinMajlis.tsx pour le calcul complet). Verrouillé tant que
// l'astrolabe n'est pas résolu.
const MAJLIS_GAP_HALF = 1.6;
const MAJLIS_SEG_LEN = (SIZE - MAJLIS_GAP_HALF * 2) / 2;
const MAJLIS_SEG_X = MAJLIS_GAP_HALF + MAJLIS_SEG_LEN / 2;

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

/** Pseudo-aléatoire déterministe (même valeur à chaque rendu pour un `n`
 * donné) — évite d'appeler Math.random() pendant le rendu (impur, cf.
 * react-hooks/purity), tout en gardant un aspect "dispersé" naturel. */
function seededRandom(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const PLANTER_LEAF_COLORS = ["#1F4A1F", "#2C5E2C", "#3A6B3A"];

/** Jardinière de pierre avec végétation dense — feuillage en instances basses poly. */
function PlanterBox({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const stoneMat = usePBRMaterial("terracotta", { repeat: [1, 0.5], roughnessIntensity: 0.9 });
  const leaves = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: (seededRandom(i) - 0.5) * 0.7,
        z: (seededRandom(i + 100) - 0.5) * 0.35,
        y: 0.32 + seededRandom(i + 200) * 0.28,
        scale: 0.14 + seededRandom(i + 300) * 0.12,
        color: PLANTER_LEAF_COLORS[i % PLANTER_LEAF_COLORS.length],
      })),
    []
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

/** Jet d'eau animé — colonne de fines particules montant puis retombant en
 * cloche, boucle continue. */
function WaterJet({ position, height = 1.1 }: { position: [number, number, number]; height?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 24;
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => seededRandom(i)), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const phase = (t * 0.8 + seeds[i]) % 1;
      const y = phase * height;
      const spread = phase * phase * 0.35;
      const angle = seeds[i] * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * spread, y, Math.sin(angle) * spread);
      dummy.scale.setScalar(0.02 + (1 - phase) * 0.015);
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

/** Bassin polygonal avec fontaine centrale — l'inscription gravée sur la
 * margelle donne les indices de l'astrolabe (FOUNTAIN_INSCRIPTION). */
function Fountain() {
  const marbleMat = usePBRMaterial("marble", { repeat: [1.5, 1.5] });
  return (
    <group position={[0, 0.015, 2.6]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.6, 10]} />
        <meshStandardMaterial color="#0B1A3A" roughness={0.05} metalness={0.3} />
      </mesh>
      {/* Margelle — tube (pas un ringGeometry plat) pour une vraie collision,
          cf. audit : un anneau plat reste sous le seuil de hauteur du
          moteur de collision et laisse l'avatar traverser le bassin. */}
      <mesh position={[0, -0.2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.78, 1.78, 0.5, 10, 1, true]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      {/* Colonne centrale + vasque d'où jaillit le jet */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.7, 10]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.24, 0.12, 12]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      <WaterJet position={[0, 0.78, 0]} height={0.9} />
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
    <group position={[0, 0, -2]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1, 8]} />
        <meshStandardMaterial color="#3D2A10" roughness={0.6} metalness={0.2} />
      </mesh>
      {ASTROLABE_RINGS.map((ring, i) => (
        <group key={ring.id} ref={(el) => { ringRefs.current[ring.id] = el; }} position={[0, 1 + i * 0.02, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={ringMat} castShadow>
            <torusGeometry args={[0.55 - i * 0.14, 0.02, 6, 32]} />
          </mesh>
          <mesh position={[0.55 - i * 0.14, 0, 0]} material={ringMat} castShadow>
            <coneGeometry args={[0.04, 0.1, 4]} />
          </mesh>
        </group>
      ))}

      {!solved && (
        // zoneOffset=[0,0,0] + localPosition = position MONDE précalculée :
        // cette zone est tournée (rotationY=-π/2 dans AlBayanWorld.tsx),
        // ProximityPrompt fait une simple addition sans tenir compte de la
        // rotation — lui passer la coordonnée locale brute donnerait un
        // rayon de proximité centré au mauvais endroit. Position locale
        // (0,0,-2) + rotation -90° + offset zone (15,0,0) = monde (17,0,0).
        <ProximityPrompt avatarRef={avatarRef} zoneOffset={[0, 0, 0]} localPosition={[17, 0, 0]} radius={2.5}>
          {(inRange) =>
            inRange && (
              <Html position={[0, 2, 0]} center distanceFactor={9}>
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
 * Zone 2 — Le Jardin (ex-Cour du Témoignage). Zelliges au sol, lanternes en
 * fer forgé, jardinières, bassin à jet d'eau animé, astrolabe monumental
 * dont les 3 anneaux — orientés selon les indices gravés sur la fontaine —
 * déverrouillent le passage vers le Majlis.
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
  const zelligeMat = usePBRMaterial("zellige", { repeat: [4, 4] });
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E8E4DA", roughness: 0.5 }), []);

  return (
    <group>
      {/* Puits de lumière vertical, blanc, solennel — seul spot à ombre de la zone */}
      <spotLight
        position={[0, H - 0.5, -2]}
        target-position={[0, 0, -2]}
        angle={0.35}
        penumbra={0.6}
        intensity={6}
        distance={H + 2}
        color="#F4F2EC"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight color="#FFAA44" intensity={3.2} distance={10} decay={2} position={[3.5, 1.6, 4]} />
      <pointLight color="#FFAA44" intensity={3.2} distance={10} decay={2} position={[-3.5, 1.6, 4]} />
      <pointLight color="#FFC266" intensity={2.6} distance={9} decay={2} position={[0, 1.6, 1]} />
      <pointLight color="#FFC266" intensity={2.4} distance={8} decay={2} position={[0, 2.2, -2]} />
      <pointLight color="#E8A33D" intensity={1.6} distance={9} decay={2} position={[-5, 3.0, -1]} />
      <pointLight color="#E8A33D" intensity={1.6} distance={9} decay={2} position={[5, 3.0, -1]} />

      {/* Sol en zelliges (mosaïque géométrique) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <primitive object={zelligeMat} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H + 4, 0]}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#101828" roughness={0.9} />
      </mesh>

      {/* Mur vers le Scriptorium (corridor existant) */}
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

      {/* Mur vers le Majlis — désormais percé (auparavant plein, "aucune
          zone voisine" : ce n'est plus vrai depuis l'ajout du Majlis). */}
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
      <OctagonalColumn position={[-COLUMN_X, 0, SIZE / 2 - 0.6]} height={H} color="#D8D2C2" accentColor="#C9BFA8" />
      <OctagonalColumn position={[COLUMN_X, 0, SIZE / 2 - 0.6]} height={H} color="#D8D2C2" accentColor="#C9BFA8" />
      <group position={[0, 0, SIZE / 2 - 0.6]}>
        <IslamicArch width={CENTER_ARCH_HALF * 2} height={H * 0.6} depth={0.3} color="#D8D2C2" />
      </group>
      <group position={[-SIDE_ARCH_X, 0, SIZE / 2 - 0.6]}>
        <IslamicArch width={SIDE_ARCH_HALF * 2} height={H * 0.55} depth={0.25} color="#D8D2C2" />
      </group>
      <group position={[SIDE_ARCH_X, 0, SIZE / 2 - 0.6]}>
        <IslamicArch width={SIDE_ARCH_HALF * 2} height={H * 0.55} depth={0.25} color="#D8D2C2" />
      </group>
      <ForgedLantern position={[-COLUMN_X, H * 0.55, SIZE / 2 - 0.6]} lit={!!astrolabeSolved} />
      <ForgedLantern position={[COLUMN_X, H * 0.55, SIZE / 2 - 0.6]} lit={!!astrolabeSolved} />

      <Fountain />

      <InteractiveAura position={[0, 0.02, -2]} color="#D4AF37" radius={1.3} />
      <AstrolabePuzzle avatarRef={avatarRef} onSolved={() => onSolveAstrolabe?.()} solved={!!astrolabeSolved} />

      <LeatherBench position={[-4.5, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
      <LeatherBench position={[4.5, 0, 1]} rotation={[0, -Math.PI / 2, 0]} />
      <PlanterBox position={[-5.5, 0, -4.5]} rotation={[0, 0.3, 0]} />
      <PlanterBox position={[5.5, 0, -4.5]} rotation={[0, -0.3, 0]} />
      <PlanterBox position={[-5.5, 0, 4.5]} rotation={[0, -0.4, 0]} />
      <PlanterBox position={[5.5, 0, 4.5]} rotation={[0, 0.4, 0]} />
    </group>
  );
}
