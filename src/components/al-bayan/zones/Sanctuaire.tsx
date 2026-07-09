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

const RADIUS = 8;
const H = 9;
// "surélevée" — l'offset Y (+0.4) est appliqué par AlBayanWorld, pas ici.

// Enceinte circulaire — ouverte sur un seul arc combiné qui couvre à la
// fois le seuil du Vestibule (theta=PI/2, x=-r*cos(theta), z=r*sin(theta))
// ET le corridor vers le Scriptorium (theta≈0.769 rad, direction du vecteur
// Sanctuaire->Scriptorium). Les deux gaps se touchent presque (67°), on les
// fusionne en une seule ouverture plutôt que de laisser un pilier de pierre
// large de quelques degrés entre les deux. Le reste du cercle (~268°) est
// un vrai mur de pierre.
const GAP_HALF_ANGLE = 0.4;
const VESTIBULE_THETA = Math.PI / 2;
const SCRIPTORIUM_THETA = 0.769;
const WALL_THETA_START = VESTIBULE_THETA + GAP_HALF_ANGLE;
const WALL_THETA_LENGTH = Math.PI * 2 - (WALL_THETA_START - (SCRIPTORIUM_THETA - GAP_HALF_ANGLE));

/** Étoile à 8 branches émissive incrustée dans le marbre — même principe que les tapis d'or de maison-sagesse. */
function StarInlay({ position, rotZ }: { position: [number, number]; rotZ: number }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const r = 0.18, ir = 0.08, pts = 8;
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
const STAR_LAYOUT: { position: [number, number]; rotZ: number }[] = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2 + i * 0.7;
  const r = 1.5 + (i % 5) * 1.3;
  return { position: [Math.cos(a) * r, Math.sin(a) * r], rotZ: (i * 0.41) % Math.PI };
});

/** Grand lustre du Sanctuaire — logement vide au centre jusqu'à ce que la
 * lentille de cristal (récupérée dans le coffre du Majlis) y soit posée.
 * Une fois posée, projette un faisceau qui frappe le mur et révèle la
 * trappe de sortie (voir ExitBeam). */
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
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 2.4, 6]} />
        <meshStandardMaterial color="#1A0F08" roughness={0.6} />
      </mesh>
      <mesh castShadow material={copperMat}>
        <torusGeometry args={[0.7, 0.06, 8, 32]} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.7, 0.1, Math.sin(angle) * 0.7]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#FFC840" emissive="#FF8800" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        );
      })}

      {/* Logement central — vide tant que la lentille n'est pas posée */}
      {lensPlaced ? (
        <mesh ref={lensRef} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 20]} />
          <meshPhysicalMaterial color="#BFE0FF" transmission={0.85} roughness={0.05} thickness={0.3} ior={1.5} emissive="#9FC8FF" emissiveIntensity={0.3} />
        </mesh>
      ) : (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.15, 0.24, 20]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {lensCollected && !lensPlaced && (
        <ProximityPrompt avatarRef={avatarRef} zoneOffset={[0, 0.4, -14]} localPosition={[0, H * 0.72, 0]} radius={2.6}>
          {(inRange) =>
            inRange && (
              <Html position={[0, 0.8, 0]} center distanceFactor={9}>
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
      <pointLight color="#FFA040" intensity={2.2} distance={7} decay={2} />
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
        <cylinderGeometry args={[0.08, 0.35, H * 0.72, 12, 1, true]} />
        <meshBasicMaterial color="#BFE0FF" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[wallX * 0.92, 1.2, wallZ * 0.92]} rotation={[0, -2.4, 0]} userData={{ noCollide: true }}>
        <boxGeometry args={[1.6, 2.4, 0.05]} />
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
 * Zone 4 — Le Sanctuaire. Plateforme circulaire surélevée, dôme ouvert sur
 * un ciel nocturne, marbre noir incrusté d'étoiles dorées, grand astrolabe
 * décoratif au centre, lustre à la lentille de cristal — dernière énigme :
 * poser la lentille révèle le faisceau qui désigne la trappe de sortie.
 */
export default function Sanctuaire({ avatarRef, lensCollected, lensPlaced, onPlaceLens }: SanctuaireProps) {
  const marbleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#181828", roughness: 0.18, metalness: 0.35 }), []);

  return (
    <group>
      {/* Puits céleste bleu argenté à travers la coupole */}
      <spotLight
        position={[0, H + 1, 0]}
        target-position={[0, 0, 0]}
        angle={0.55}
        penumbra={0.5}
        intensity={6}
        distance={H + 5}
        color="#9FC8FF"
      />
      <pointLight color="#3D7FE8" intensity={1.6} distance={9} decay={2} position={[0, 1.5, 0]} />
      <pointLight color="#6090C8" intensity={1.2} distance={7} decay={2} position={[0, 4.0, -6]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[RADIUS, RADIUS, 0.08, 48]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      {STAR_LAYOUT.map((s, i) => <StarInlay key={i} position={s.position} rotZ={s.rotZ} />)}

      <mesh position={[0, H * 0.4, 0]}>
        <sphereGeometry args={[RADIUS * 1.05, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial color="#0E1A2E" roughness={0.7} side={THREE.BackSide} />
      </mesh>
      <group position={[0, H * 1.15, 0]}>
        <Stars radius={30} depth={8} count={250} factor={2} fade speed={0.3} />
      </group>

      <mesh position={[0, H / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[RADIUS, RADIUS, H, 48, 1, true, WALL_THETA_START, WALL_THETA_LENGTH]} />
        <meshStandardMaterial color="#14141A" roughness={0.78} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      <group position={[0, 0.8, 0]}>
        <Astrolabe scale={2.6} />
      </group>
      <Hud3DLabel position={[0, 3.0, 0]} variant="beacon">🔭 L&apos;Astrolabe</Hud3DLabel>

      <ChandelierLensSlot avatarRef={avatarRef} lensCollected={!!lensCollected} lensPlaced={!!lensPlaced} onPlaceLens={() => onPlaceLens?.()} />
      <ExitBeamAndTrapdoor lensPlaced={!!lensPlaced} />

      <CandleLight position={[-5, 0.4, 2]} intensity={1.2} avatarRef={avatarRef} />
      <CandleLight position={[5, 0.4, -2]} intensity={1.2} avatarRef={avatarRef} />
      <IncenseSmoke position={[-5, 0.46, 2]} />
      <IncenseSmoke position={[5, 0.46, -2]} />
    </group>
  );
}
