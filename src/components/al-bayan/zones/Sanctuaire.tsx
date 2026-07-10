"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import ProximityPrompt from "../../maison-sagesse/shared/ProximityPrompt";
import Astrolabe from "../world/Astrolabe";
import Hud3DLabel from "../shared/Hud3DLabel";
import IncenseSmoke from "../world/IncenseSmoke";
import { usePBRMaterial } from "@/lib/al-bayan/pbr-materials";
import { MonumentalVase, PotteryCluster } from "../shared/CorridorDecor";

// Passage à l'échelle "Grand Riad" — RADIUS x3, hauteur x1.8.
export const RADIUS = 8 * 3;
export const H = 9 * 1.8;
// "surélevée" — l'offset Y (+0.7) est appliqué par AlBayanWorld, pas ici.

// Enceinte circulaire — ouverte sur un seul arc combiné qui couvre à la
// fois le seuil du Vestibule (theta=PI/2) ET le corridor vers le
// Scriptorium (theta≈0.769 rad). Les angles ne changent pas avec l'échelle
// (seul le rayon grandit, donc l'ouverture physique grandit avec lui).
const GAP_HALF_ANGLE = 0.4;
const VESTIBULE_THETA = Math.PI / 2;
const SCRIPTORIUM_THETA = 0.769;
const WALL_THETA_START = VESTIBULE_THETA + GAP_HALF_ANGLE;
const WALL_THETA_LENGTH = Math.PI * 2 - (WALL_THETA_START - (SCRIPTORIUM_THETA - GAP_HALF_ANGLE));

/** Étoile à 8 branches émissive incrustée dans le marbre — même principe que les tapis d'or de maison-sagesse. */
function StarInlay({ position, rotZ }: { position: [number, number]; rotZ: number }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const r = 0.24, ir = 0.1, pts = 8;
    for (let i = 0; i < pts * 2; i++) {
      const angle = (i * Math.PI) / pts - Math.PI / 2;
      const radius = i % 2 === 0 ? r : ir;
      if (i === 0) shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      else shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, rotZ]} position={[position[0], 0.004, position[1]]}>
      <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} roughness={0.4} metalness={0.6} />
    </mesh>
  );
}

// Rotation par étoile dérivée de l'indice (déterministe, pas de Math.random
// au rendu — react-hooks/purity l'interdit dans le corps d'un composant).
// Rayon multiplié pour occuper tout le sol désormais 3x plus vaste.
const STAR_LAYOUT: { position: [number, number]; rotZ: number }[] = Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2 + i * 0.7;
  const r = 4.5 + (i % 8) * 2.4;
  return { position: [Math.cos(a) * r, Math.sin(a) * r], rotZ: (i * 0.41) % Math.PI };
});

/** Grand lustre du Sanctuaire — logement vide au centre jusqu'à ce que la
 * lentille de cristal (récupérée dans le coffre de la Suite Privée) y soit
 * posée. Une fois posée, projette un faisceau qui frappe le mur et révèle
 * la trappe de sortie (voir ExitBeam). */
function ChandelierLensSlot({
  avatarRef,
  lensCollected,
  lensPlaced,
  onPlaceLens,
}: {
  avatarRef: React.RefObject<THREE.Group | null>;
  lensCollected: boolean;
  lensPlaced: boolean;
  onPlaceLens: () => void;
}) {
  const copperMat = usePBRMaterial("copper", { repeat: [1, 1], roughnessIntensity: 0.3, metalness: 0.8 });
  const lensRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (lensRef.current && lensPlaced) {
      lensRef.current.rotation.y = clock.getElapsedTime() * 0.6;
    }
  });

  return (
    <group position={[0, H * 0.72, 0]}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 3.6, 6]} />
        <meshStandardMaterial color="#1A0F08" roughness={0.6} />
      </mesh>
      <mesh castShadow material={copperMat}>
        <torusGeometry args={[1.0, 0.08, 8, 32]} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * 1.0, 0.14, Math.sin(angle) * 1.0]}>
            <mesh castShadow material={copperMat}>
              <cylinderGeometry args={[0.028, 0.035, 0.22, 6]} />
            </mesh>
            <mesh position={[0, 0.17, 0]}>
              <sphereGeometry args={[0.045, 6, 6]} />
              <meshStandardMaterial color="#FFC840" emissive="#FF8800" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* Logement central — vide tant que la lentille n'est pas posée */}
      {lensPlaced ? (
        <mesh ref={lensRef} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.07, 20]} />
          <meshPhysicalMaterial color="#BFE0FF" transmission={0.85} roughness={0.05} thickness={0.4} ior={1.5} emissive="#9FC8FF" emissiveIntensity={0.3} />
        </mesh>
      ) : (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.32, 20]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {lensCollected && !lensPlaced && (
        <ProximityPrompt avatarRef={avatarRef} zoneOffset={[0, 0.7, -43]} localPosition={[0, H * 0.72, 0]} radius={3.6}>
          {(inRange) =>
            inRange && (
              <Html position={[0, 1.1, 0]} center distanceFactor={9}>
                <button
                  onClick={onPlaceLens}
                  style={{
                    pointerEvents: "auto",
                    background: "linear-gradient(135deg, #7a5c1a 0%, #D4AF37 50%, #7a5c1a 100%)",
                    border: "1px solid rgba(212,175,55,0.7)",
                    color: "#0A0F0D",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: 800,
                    fontSize: 11,
                    borderRadius: 10,
                    padding: "8px 14px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Placer la lentille de cristal
                </button>
              </Html>
            )
          }
        </ProximityPrompt>
      )}
      <pointLight color="#FFA040" intensity={3.2} distance={15} decay={2} />
    </group>
  );
}

/** Faisceau + trappe de sortie — apparaît uniquement une fois la lentille
 * posée sur le lustre (transition fluide en useFrame plutôt qu'un pop
 * instantané). */
function ExitBeamAndTrapdoor({ lensPlaced }: { lensPlaced: boolean }) {
  const beamRef = useRef<THREE.Mesh>(null);
  const trapdoorMat = useRef<THREE.MeshStandardMaterial>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    const target = lensPlaced ? 1 : 0;
    progress.current = THREE.MathUtils.damp(progress.current, target, 2.5, delta);
    if (beamRef.current) {
      beamRef.current.scale.y = progress.current;
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity = progress.current * 0.5;
    }
    if (trapdoorMat.current) {
      trapdoorMat.current.emissiveIntensity = progress.current * 0.9;
    }
  });

  const wallX = -RADIUS * Math.cos(2.4);
  const wallZ = RADIUS * Math.sin(2.4);

  return (
    <group>
      <mesh ref={beamRef} position={[0, H * 0.36, 0]} userData={{ noCollide: true }}>
        <cylinderGeometry args={[0.14, 0.6, H * 0.72, 12, 1, true]} />
        <meshBasicMaterial color="#BFE0FF" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[wallX * 0.92, 2.2, wallZ * 0.92]} rotation={[0, -2.4, 0]} userData={{ noCollide: true }}>
        <boxGeometry args={[2.9, 4.3, 0.09]} />
        <meshStandardMaterial ref={trapdoorMat} color="#0A0A0A" emissive="#BFE0FF" emissiveIntensity={0} roughness={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

interface SanctuaireProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  lensCollected?: boolean;
  lensPlaced?: boolean;
  onPlaceLens?: () => void;
}

/**
 * Zone 7 — Le Sanctuaire. Plateforme circulaire surélevée, dôme ouvert sur
 * un ciel nocturne, marbre noir incrusté d'étoiles dorées, grand astrolabe
 * décoratif au centre, lustre à la lentille de cristal — dernière énigme :
 * poser la lentille révèle le faisceau qui désigne la trappe de sortie.
 */
export default function Sanctuaire({ avatarRef, lensCollected, lensPlaced, onPlaceLens }: SanctuaireProps) {
  const marbleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#181828", roughness: 0.18, metalness: 0.35 }), []);

  return (
    <group>
      <ambientLight color="#2A3A55" intensity={0.35} />
      {/* Puits céleste bleu argenté à travers la coupole */}
      <spotLight
        position={[0, H + 3, 0]}
        target-position={[0, 0, 0]}
        angle={0.55}
        penumbra={0.5}
        intensity={12}
        distance={H + 15}
        color="#9FC8FF"
      />
      <pointLight color="#3D7FE8" intensity={3.2} distance={27} decay={2} position={[0, 4.5, 0]} />
      <pointLight color="#6090C8" intensity={2.4} distance={21} decay={2} position={[0, 12, -18]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[RADIUS, RADIUS, 0.08, 64]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      {STAR_LAYOUT.map((s, i) => <StarInlay key={i} position={s.position} rotZ={s.rotZ} />)}

      <mesh position={[0, H * 0.4, 0]}>
        <sphereGeometry args={[RADIUS * 1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial color="#0E1A2E" roughness={0.7} side={THREE.BackSide} />
      </mesh>
      <group position={[0, H * 1.15, 0]}>
        <Stars radius={90} depth={20} count={400} factor={3} fade speed={0.3} />
      </group>

      <mesh position={[0, H / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[RADIUS, RADIUS, H, 64, 1, true, WALL_THETA_START, WALL_THETA_LENGTH]} />
        <meshStandardMaterial color="#14141A" roughness={0.78} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      <group position={[0, 2.4, 0]}>
        <Astrolabe scale={5.6} />
      </group>
      <Hud3DLabel position={[0, 9.0, 0]} variant="beacon">🔭 L&apos;Astrolabe</Hud3DLabel>

      <ChandelierLensSlot avatarRef={avatarRef} lensCollected={!!lensCollected} lensPlaced={!!lensPlaced} onPlaceLens={() => onPlaceLens?.()} />
      <ExitBeamAndTrapdoor lensPlaced={!!lensPlaced} />

      <CandleLight position={[-15, 0.4, 6]} intensity={1.4} avatarRef={avatarRef} />
      <CandleLight position={[15, 0.4, -6]} intensity={1.4} avatarRef={avatarRef} />
      <CandleLight position={[-10, 0.4, -14]} intensity={1.1} avatarRef={avatarRef} />
      <CandleLight position={[10, 0.4, 14]} intensity={1.1} avatarRef={avatarRef} />
      <IncenseSmoke position={[-15, 0.46, 6]} />
      <IncenseSmoke position={[15, 0.46, -6]} />

      {/* Poteries et vases longeant la paroi circulaire — retour utilisateur :
          la salle restait bien trop vide en dehors de l'astrolabe central.
          Les deux seuils (Vestibule à π/2, Scriptorium à 0.769, chacun
          ±GAP_HALF_ANGLE=0.4) couvrent ensemble l'arc [0.369, 1.971] — tous
          les angles ci-dessous restent strictement dans l'arc plein
          [1.971, 2π+0.369] pour ne pas planter du décor en plein seuil. */}
      {[2.618, 3.403, 4.189, 4.974, 5.760].map((angle, i) => (
        <MonumentalVase
          key={i}
          position={[(RADIUS - 2) * Math.cos(angle), 0, (RADIUS - 2) * Math.sin(angle)]}
          scale={1.2}
        />
      ))}
      <PotteryCluster position={[(RADIUS - 2) * Math.cos(2.094), 0, (RADIUS - 2) * Math.sin(2.094)]} />
      <PotteryCluster position={[(RADIUS - 2) * Math.cos(0.262), 0, (RADIUS - 2) * Math.sin(0.262)]} />
    </group>
  );
}
