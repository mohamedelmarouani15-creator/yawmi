"use client";

import { useMemo } from "react";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import OctagonalColumn from "../shared/OctagonalColumn";
import { WallSconce, MonumentalVase, CorridorRug } from "../shared/CorridorDecor";

// Grande galerie diagonale en espace MONDE reliant l'ouverture du mur "+X
// local" du Jardin (monde X≈36, Z≈30, y=0) à celle du mur "-X local" du
// Scriptorium (monde X≈-33.5, Z≈19.5, y=-1.1). Les deux zones se trouvant
// de part et d'autre du Vestibule mais sur des murs dont la normale pointe
// dans la même direction monde (cf. calcul dans CourTemoignage.tsx /
// Scriptorium.tsx), la galerie contourne le Vestibule par le nord — ce
// détour en fait la plus longue liaison du complexe (~70 unités), assumée
// comme la "grande galerie à colonnades" du brief plutôt que contrainte à
// la fourchette 15-20u des liaisons directes. Longueur/angle dérivés
// géométriquement des deux points plutôt que des constantes à la main.
const JARDIN_OPENING = { x: 36, y: 0, z: 30 };
const SCRIPTORIUM_OPENING = { x: -33.5, y: -1.1, z: 19.5 };

const DX = JARDIN_OPENING.x - SCRIPTORIUM_OPENING.x;
const DZ = JARDIN_OPENING.z - SCRIPTORIUM_OPENING.z;
const LENGTH = Math.hypot(DX, DZ);
const ANGLE = Math.atan2(DZ, DX);
const RISE = JARDIN_OPENING.y - SCRIPTORIUM_OPENING.y; // +1.1 (Scriptorium -> Jardin)

const WIDTH = 6;
const HALL_HEIGHT = 6.4;
const STAIR_RUN = 5; // longueur (le long de la galerie) occupée par les marches, côté Jardin
const WALL_SEGMENTS = 16; // cf. commentaire sur le débordement d'AABB des parois (corridor Scriptorium↔Sanctuaire)

export default function CorridorCourScriptorium({ avatarRef }: { avatarRef?: React.RefObject<THREE.Group | null> }) {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#241B10", roughness: 0.7, metalness: 0.05 }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#352818", roughness: 0.8 }), []);
  const stepMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3A3024", roughness: 0.85 }), []);

  const flatLength = LENGTH - STAIR_RUN;
  const stepCount = 4;
  const stepRun = STAIR_RUN / stepCount;
  const stepRise = RISE / stepCount;

  const columnDs = useMemo(() => {
    const count = Math.max(3, Math.round(flatLength / 11));
    return Array.from({ length: count }, (_, i) => ((i + 0.5) / count) * flatLength);
  }, [flatLength]);

  return (
    // Groupe positionné au seuil Scriptorium, tourné vers le seuil Jardin —
    // tout le reste est exprimé en coordonnées locales le long de l'axe X.
    <group position={[SCRIPTORIUM_OPENING.x, SCRIPTORIUM_OPENING.y, SCRIPTORIUM_OPENING.z]} rotation={[0, -ANGLE, 0]}>
      {/* Tronçon plat (niveau Scriptorium) */}
      <mesh position={[flatLength / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[flatLength, 0.1, WIDTH]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Escalier montant vers le Jardin (4 marches, +RISE au total) */}
      {Array.from({ length: stepCount }, (_, i) => (
        <mesh
          key={i}
          position={[flatLength + stepRun * (i + 0.5), stepRise * (i + 0.5), 0]}
          material={stepMat}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[stepRun, stepRise * (i + 1), WIDTH]} />
        </mesh>
      ))}

      {/* Colonnades — segments courts (cf. débordement d'AABB d'une longue
          boîte tournée) doublant de rôle de paroi latérale ET de rythme
          visuel pour la perspective infinie demandée. */}
      {[-1, 1].map((side) =>
        Array.from({ length: WALL_SEGMENTS }, (_, i) => {
          const segCenter = (LENGTH / WALL_SEGMENTS) * (i + 0.5);
          return (
            <mesh key={`${side}-${i}`} position={[segCenter, HALL_HEIGHT / 2 - 0.4 + (segCenter > flatLength ? RISE : 0), side * (WIDTH / 2 + 0.15)]} receiveShadow castShadow>
              <boxGeometry args={[LENGTH / WALL_SEGMENTS, HALL_HEIGHT, 0.3]} />
              <primitive object={wallMat} attach="material" />
            </mesh>
          );
        })
      )}

      {columnDs.map((d, i) => (
        <group key={`col-${i}`}>
          <OctagonalColumn position={[d, 0, -WIDTH / 2 + 0.6]} height={HALL_HEIGHT - 0.4} shadows={false} />
          <OctagonalColumn position={[d, 0, WIDTH / 2 - 0.6]} height={HALL_HEIGHT - 0.4} shadows={false} />
        </group>
      ))}
      {columnDs.map((d, i) => (
        <group key={`sconce-${i}`}>
          <WallSconce position={[d, HALL_HEIGHT * 0.5, -WIDTH / 2 + 0.15]} rotationY={0} />
          <WallSconce position={[d, HALL_HEIGHT * 0.5, WIDTH / 2 - 0.15]} rotationY={Math.PI} />
        </group>
      ))}
      <MonumentalVase position={[1.6, 0, -WIDTH / 2 + 0.9]} scale={1.3} />
      <MonumentalVase position={[flatLength - 1.6, 0, WIDTH / 2 - 0.9]} scale={1.3} />
      <CorridorRug position={[flatLength * 0.35, 0.015, 0]} width={7} length={WIDTH * 0.55} />
      <CorridorRug position={[flatLength * 0.7, 0.015, 0]} width={7} length={WIDTH * 0.55} />

      {/* Voûte en berceau — demi-cylindre couché, axe le long de la galerie.
          `noCollide` : un plafond décoratif n'a aucune raison de bloquer un
          déplacement au sol, cf. corridor Scriptorium↔Sanctuaire. */}
      <mesh
        position={[LENGTH / 2, HALL_HEIGHT - 0.4 + RISE / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ noCollide: true }}
      >
        <cylinderGeometry args={[WIDTH / 2 + 0.3, WIDTH / 2 + 0.3, LENGTH, 20, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#2A2014" roughness={0.85} side={THREE.BackSide} />
      </mesh>

      {Array.from({ length: 6 }, (_, i) => (
        <CandleLight key={i} position={[(flatLength / 5) * i, 0.6, 0]} intensity={0.85} avatarRef={avatarRef} />
      ))}
      <pointLight color="#E8A33D" intensity={2.4} distance={20} decay={2} position={[flatLength * 0.3, 3, 0]} />
      <pointLight color="#E8A33D" intensity={2.4} distance={20} decay={2} position={[flatLength * 0.7, 3, 0]} />
    </group>
  );
}
