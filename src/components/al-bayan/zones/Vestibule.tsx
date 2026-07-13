"use client";

import { useMemo, type Ref } from "react";
import * as THREE from "three";
import { Stars } from "@react-three/drei";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import IslamicArch from "../../maison-sagesse/shared/IslamicArch";
import OctagonalColumn from "../shared/OctagonalColumn";
import BookshelfWall from "../scenes/BookshelfWall";
import ZoneWall from "../shared/ZoneWall";
import LightShaftSun from "../world/LightShaftSun";
import EmberParticles from "../shared/EmberParticles";
import { WallSconce, MonumentalVase, PotteryCluster, CushionBench, MashrabiyaScreen } from "../shared/CorridorDecor";
import DistanceCulledLight from "../shared/DistanceCulledLight";
import { KenneyProp } from "../shared/KenneyProp";
import { usePBRMaterial } from "@/lib/al-bayan/pbr-materials";

// Passage à l'échelle "Grand Riad" — le sol est multiplié par S (empreinte),
// la hauteur suit un facteur plus mesuré HS (une pièce 3x plus vaste au sol
// n'a pas besoin d'un plafond 3x plus haut pour donner un sentiment
// d'immensité — sinon l'éclairage/l'ambiance ne suivent plus).
const S = 3;
const HS = 1.8;
const W = 18 * S;
const D = 14 * S;
const H = 11 * HS;
const BRICK = "#7A3B22";
const WOOD_TRIM = "#2B1A0E";
// Demi-largeur de l'ouverture (arche IslamicArch width=4.5*S) — tout ce qui
// dépasse cette largeur, sur chaque côté avec seuil, doit être un vrai mur.
const GAP = 2.4 * S;

/** Tapis à motifs — base en vraie texture PBR tissée, bordure + médaillon en
 * accent plat par-dessus (le tissage réel n'a besoin d'être visible que sur
 * la plus grande surface). */
function Rug({ position, width = 3.4, depth = 5.2 }: { position: [number, number, number]; width?: number; depth?: number }) {
  const carpetMat = usePBRMaterial("carpet", { repeat: [width / 1.6, depth / 1.6], color: "#5C1A24" });
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <primitive object={carpetMat} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[width * 0.78, depth * 0.82]} />
        <meshStandardMaterial color="#16204A" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[width * 0.5, depth * 0.55]} />
        <meshStandardMaterial color="#C8A84B" emissive="#8B6914" emissiveIntensity={0.08} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Comptoir d'accueil en bois de cèdre — boîtes assemblées, pas de modèle. */
function CedarCounter({ position }: { position: [number, number, number] }) {
  const darkCedar = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3D2410", roughness: 0.4, metalness: 0.18 }), []);
  const lightCedar = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5C3A1E", roughness: 0.35, metalness: 0.14 }), []);
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} material={darkCedar} castShadow receiveShadow>
        <boxGeometry args={[4.4, 1.1, 1.2]} />
      </mesh>
      <mesh position={[0, 1.13, 0]} material={lightCedar} castShadow>
        <boxGeometry args={[4.6, 0.08, 1.32]} />
      </mesh>
      {[-1.9, 0, 1.9].map((x) => (
        <mesh key={x} position={[x, 0.05, 0]} material={darkCedar} castShadow>
          <boxGeometry args={[0.18, 0.1, 1.2]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Zone 1 — Le Grand Vestibule des Traducteurs (spawn). Anciennement
 * `scenes/MainHall.tsx` ; perd ses 3 portails cliquables (plus de
 * navigation par route, on y entre/sort en marchant) et gagne le décor du
 * brief : sol calcaire, comptoir cèdre, tapis, étagères dans le fond.
 */
export default function Vestibule({ sunRef, avatarRef }: { sunRef?: Ref<THREE.Mesh>; avatarRef?: React.RefObject<THREE.Group | null> }) {
  const floorMat = usePBRMaterial("marble", { repeat: [W / 8, D / 8], color: "#C9BFA8", roughnessIntensity: 0.35 });
  const ceilingMat = usePBRMaterial("wood-dark", { repeat: [W / 6, D / 6], color: "#3A2A18" });

  return (
    <group>
      <ambientLight color="#4A3520" intensity={0.32} />
      <DistanceCulledLight color="#FFAA44" intensity={3.2} distance={13 * S} decay={2} position={[0, 1.7 * HS, -1 * S]} castShadow={false} avatarRef={avatarRef} activeRadius={50} />
      <DistanceCulledLight color="#E8A33D" intensity={3.6} distance={12 * S} decay={2} position={[-W / 2 + 2.5 * S, 3.2 * HS, 4 * S]} avatarRef={avatarRef} activeRadius={50} />
      <DistanceCulledLight color="#E8A33D" intensity={3.6} distance={12 * S} decay={2} position={[W / 2 - 2.5 * S, 3.2 * HS, 4 * S]} avatarRef={avatarRef} activeRadius={50} />
      {/* Fill haut pour illuminer le plafond poutres */}
      <DistanceCulledLight color="#C8842A" intensity={1.4} distance={14 * S} decay={2} position={[0, H - 1, 0]} avatarRef={avatarRef} activeRadius={50} />

      <group position={[0, H + 8, 0]}>
        <Stars radius={40 * S} depth={5} count={150} factor={1.5} fade speed={0.4} />
      </group>

      {/* Source des rayons de lumière (GodRays) — lucarne haute du Vestibule,
          première pièce vue par le joueur au spawn. */}
      {/* Taille réduite (1.8*HS -> 0.7*HS) : à l'échelle "Grand Riad" et avec le
          Bloom actuel, le disque plein cadre finissait en gros halo blanc
          écrasant tout le champ de vision (retour utilisateur : capture
          d'écran montrant un "soleil" géant surexposé au Vestibule). Le
          GodRays n'a besoin que d'une petite source ponctuelle. */}
      <LightShaftSun ref={sunRef} position={[0, H - 1, -2 * S]} color="#FFE0A0" size={0.7 * HS} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <primitive object={floorMat} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H + 6, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={ceilingMat} attach="material" />
      </mesh>

      <Rug position={[-3.2 * S, 0.001, 4 * S]} width={3.4 * S} depth={5.2 * S} />
      <Rug position={[3.2 * S, 0.001, 4 * S]} width={3.4 * S} depth={5.2 * S} />
      <Rug position={[-20, 0.001, -8]} width={7} depth={11} />
      <Rug position={[20, 0.001, -8]} width={7} depth={11} />

      {/* Mur du fond (entrée du complexe — seul côté sans zone voisine) */}
      <BookshelfWall position={[0, (H + 5) / 2, D / 2 - 0.08]} rotation={[0, Math.PI, 0]} width={W} height={H + 5} rows={18} booksPerRow={40} />

      {/* Seuils ouverts vers les 3 autres zones — colonnes + arche, pas de
          mur opaque : on y marche directement. */}
      <OctagonalColumn position={[-4.5 * S, 0, -3.5 * S]} height={H} />
      <OctagonalColumn position={[4.5 * S, 0, -3.5 * S]} height={H} />
      <group position={[0, 0, -D / 2 + 0.3 * S]}>
        <IslamicArch width={4.5 * S} height={6 * HS} depth={0.3 * S} />
      </group>
      {/* Colonnes en flanc (Z=±3, hors de la largeur de l'arche 4.5 = trou
          ≈±2.25) — un seul pilier centré en Z=0 se retrouvait pile dans le
          passage une fois la collision réelle en place (bug constaté :
          avatar bloqué au seuil est, invisible avant que la collision
          n'existe puisqu'on traversait la colonne sans contact). */}
      <OctagonalColumn position={[-W / 2 + 1, 0, -3 * S]} height={H} />
      <OctagonalColumn position={[-W / 2 + 1, 0, 3 * S]} height={H} />
      <group position={[-W / 2 + 0.6 * S, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <IslamicArch width={4.5 * S} height={6 * HS} depth={0.3 * S} />
      </group>
      <OctagonalColumn position={[W / 2 - 1, 0, -3 * S]} height={H} />
      <OctagonalColumn position={[W / 2 - 1, 0, 3 * S]} height={H} />
      <group position={[W / 2 - 0.6 * S, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <IslamicArch width={4.5 * S} height={6 * HS} depth={0.3 * S} />
      </group>

      {/* Pans de mur encadrant les 3 arches — brique de terre cuite + liseré
          de bois sombre en couronne, pour ne plus laisser les colonnes
          flotter seules au-dessus du vide entre les zones. */}
      {[-1, 1].map((side) => (
        <group key={`south-${side}`}>
          <ZoneWall
            position={[side * (GAP + (W / 2 - GAP) / 2), H / 2, -D / 2 + 0.15]}
            size={[W / 2 - GAP, H, 0.3]}
            color={BRICK}
          />
          <ZoneWall
            position={[side * (GAP + (W / 2 - GAP) / 2), H - 0.3, -D / 2 + 0.15]}
            size={[W / 2 - GAP, 0.5, 0.34]}
            color={WOOD_TRIM}
            roughness={0.55}
            metalness={0.1}
          />
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={`west-${side}`}>
          <ZoneWall
            position={[-W / 2 + 0.15, H / 2, side * (GAP + (D / 2 - GAP) / 2)]}
            size={[0.3, H, D / 2 - GAP]}
            color={BRICK}
          />
          <ZoneWall
            position={[-W / 2 + 0.15, H - 0.3, side * (GAP + (D / 2 - GAP) / 2)]}
            size={[0.34, 0.5, D / 2 - GAP]}
            color={WOOD_TRIM}
            roughness={0.55}
            metalness={0.1}
          />
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={`east-${side}`}>
          <ZoneWall
            position={[W / 2 - 0.15, H / 2, side * (GAP + (D / 2 - GAP) / 2)]}
            size={[0.3, H, D / 2 - GAP]}
            color={BRICK}
          />
          <ZoneWall
            position={[W / 2 - 0.15, H - 0.3, side * (GAP + (D / 2 - GAP) / 2)]}
            size={[0.34, 0.5, D / 2 - GAP]}
            color={WOOD_TRIM}
            roughness={0.55}
            metalness={0.1}
          />
        </group>
      ))}

      <CedarCounter position={[0, 0, -1.5 * S]} />

      {/* Décor supplémentaire — retour utilisateur : les pièces (hors
          couloirs) restaient bien trop vides à l'échelle "Grand Riad". */}
      <MonumentalVase position={[-W / 2 + 3, 0, D / 2 - 2]} scale={1.6} />
      <MonumentalVase position={[W / 2 - 3, 0, D / 2 - 2]} scale={1.6} />

      {/* Vrais meubles CC0 (pack Kenney) — cf. shared/KenneyProp.tsx */}
      <KenneyProp name="pottedPlant" position={[-W / 2 + 6, 0, D / 2 - 5]} scale={2.4} />
      <KenneyProp name="pottedPlant" position={[W / 2 - 6, 0, D / 2 - 5]} scale={2.4} />
      <KenneyProp name="sideTable" position={[-16, 0, 15]} scale={2.6} rotation={[0, 0.4, 0]} />
      <KenneyProp name="rugRound" position={[16, 0.01, -14]} scale={2.6} />
      <PotteryCluster position={[-4 * S, 0, -0.5 * S]} />
      <PotteryCluster position={[4 * S, 0, -0.5 * S]} />
      <CushionBench position={[-16, 0, -2]} rotationY={Math.PI / 2} length={2.4} />
      <CushionBench position={[16, 0, -2]} rotationY={-Math.PI / 2} length={2.4} />
      {/* z = -14 (pas -4) : |z| doit dépasser GAP (7.2) pour tomber sur le
          pan de mur plein plutôt qu'en plein milieu de l'arche latérale
          ouverte — même piège que dans le Jardin, corrigé ici avant envoi. */}
      <MashrabiyaScreen position={[-W / 2 + 0.2, H * 0.32, -14]} rotationY={Math.PI / 2} width={2.4} height={3.2} />
      <MashrabiyaScreen position={[W / 2 - 0.2, H * 0.32, -14]} rotationY={-Math.PI / 2} width={2.4} height={3.2} />
      <WallSconce position={[-W / 2 + 0.15, H * 0.42, D / 2 - 6]} rotationY={Math.PI / 2} />
      <WallSconce position={[W / 2 - 0.15, H * 0.42, D / 2 - 6]} rotationY={-Math.PI / 2} />
      <WallSconce position={[-W / 2 + 0.15, H * 0.42, -D / 2 + 6]} rotationY={Math.PI / 2} />
      <WallSconce position={[W / 2 - 0.15, H * 0.42, -D / 2 + 6]} rotationY={-Math.PI / 2} />

      <CandleLight position={[-4.5 * S, 0.4, -3.5 * S]} intensity={1.3} avatarRef={avatarRef} />
      <CandleLight position={[4.5 * S, 0.4, -3.5 * S]} intensity={1.3} avatarRef={avatarRef} />
      <CandleLight position={[-2 * S, 1.16, -1.5 * S]} intensity={0.85} avatarRef={avatarRef} />
      <CandleLight position={[2 * S, 1.16, -1.5 * S]} intensity={0.85} avatarRef={avatarRef} />
      <CandleLight position={[-18, 0.4, -8]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[18, 0.4, -8]} intensity={1.0} avatarRef={avatarRef} />
      <CandleLight position={[-14, 0.4, 14]} intensity={0.9} avatarRef={avatarRef} />
      <CandleLight position={[14, 0.4, 14]} intensity={0.9} avatarRef={avatarRef} />
      <EmberParticles position={[-4.5 * S, 0.55, -3.5 * S]} count={9} />
      <EmberParticles position={[4.5 * S, 0.55, -3.5 * S]} count={9} />

      <AmbientParticles />
    </group>
  );
}
