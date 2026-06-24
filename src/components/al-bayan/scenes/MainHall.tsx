"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Stars, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import IslamicArch from "../../maison-sagesse/shared/IslamicArch";
import BookshelfWall from "./BookshelfWall";

const W = 18;
const H = 11; // salle haute — sensation de tour de livres vertigineuse
const D = 14;

interface DoorwayPortalProps {
  position: [number, number, number];
  glowColor: string;
  arabicLabel: string;
  frenchLabel: string;
  onOpen: () => void;
}

function DoorwayPortal({ position, glowColor, arabicLabel, frenchLabel, onOpen }: DoorwayPortalProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.5 + Math.sin(t * 1.8) * 0.3 + (hovered ? 0.4 : 0);
    }
  });

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.3, 4.8, 0.15]} />
        <meshStandardMaterial color="#8B7355" roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh
        position={[0, 0, 0.1]}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
      >
        <planeGeometry args={[3, 4.5]} />
        <meshStandardMaterial
          ref={matRef}
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.72}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight color={glowColor} intensity={1.2} distance={6} decay={2} position={[0, 0, 1]} />
      <Html position={[0, 2.9, 0.2]} center>
        <span style={{ color: "#F8F4EC", fontSize: "15px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(248,244,236,0.8)", pointerEvents: "none", direction: "rtl" }}>
          {arabicLabel}
        </span>
      </Html>
      <Html position={[0, 2.45, 0.2]} center>
        <span style={{ color: "#D4AF37", fontSize: "10px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(212,175,55,0.8)", pointerEvents: "none" }}>
          {frenchLabel}
        </span>
      </Html>
    </group>
  );
}

function OctagonalColumn({ position }: { position: [number, number, number] }) {
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5C4A38", roughness: 0.88 }), []);
  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7A6450", roughness: 0.8 }), []);
  const baseGeo = useMemo(() => new THREE.CylinderGeometry(0.36, 0.42, 0.25, 8), []);
  const shaftGeo = useMemo(() => new THREE.CylinderGeometry(0.28, 0.3, H - 0.4, 8), []);
  const capGeo = useMemo(() => new THREE.CylinderGeometry(0.4, 0.28, 0.3, 8), []);
  return (
    <group position={position}>
      <mesh geometry={baseGeo} material={accentMat} position={[0, 0.125, 0]} castShadow receiveShadow />
      <mesh geometry={shaftGeo} material={stoneMat} position={[0, H / 2, 0]} castShadow receiveShadow />
      <mesh geometry={capGeo} material={accentMat} position={[0, H - 0.15, 0]} castShadow receiveShadow />
    </group>
  );
}

interface MainHallProps {
  onOpenTemoignage: () => void;
  onOpenRasm: () => void;
  onOpenRoute: () => void;
}

export default function MainHall({ onOpenTemoignage, onOpenRasm, onOpenRoute }: MainHallProps) {
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#221A10", roughness: 0.92 }), []);

  return (
    <group>
      {/* Ambiance froide teal en base, chaleur ambrée portée par les bougies
          et les étagères — contraste assumé façon bibliothèque surréaliste. */}
      <ambientLight color="#0C2A2E" intensity={0.4} />
      <hemisphereLight color="#1c4d52" groundColor="#0a0604" intensity={0.35} />
      {/* Lumière centrale volontairement courte portée : le haut des
          étagères reste sombre, façon tour qui se perd dans l'obscurité. */}
      <pointLight color="#D4AF37" intensity={1.4} distance={9} decay={2} position={[0, 5.5, 0]} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
      {/* Spots chauds rasants sur les étagères latérales, à hauteur de regard */}
      <pointLight color="#E8A33D" intensity={2.6} distance={8} decay={2} position={[-W / 2 + 2, 3.2, -2]} />
      <pointLight color="#E8A33D" intensity={2.6} distance={8} decay={2} position={[W / 2 - 2, 3.2, -2]} />
      <pointLight color="#E8A33D" intensity={1.8} distance={7} decay={2} position={[0, 5.8, D / 2 - 2]} />
      <pointLight color="#5EEAD4" intensity={0.5} distance={10} decay={2} position={[0, 1.5, 4]} />

      {/* Accent surréaliste discret au plafond — quelques points lumineux,
          aucun coût de post-processing (juste des points, pas de Bloom). */}
      <group position={[0, H + 8, 0]}>
        <Stars radius={40} depth={5} count={150} factor={1.5} fade speed={0.4} />
      </group>

      {/* Cible de chargement future : dès que public/models/*.glb existe et
          est passé à gltfjsx, remplacer ce bloc par <ScriptoriumModel />. */}
      <mesh position={[0, 1.4, -1]}>
        <boxGeometry args={[1.4, 2.8, 1.4]} />
        <meshBasicMaterial color="#D4AF37" wireframe transparent opacity={0.25} />
      </mesh>

      {/* Sol miroir — vrai reflet de l'avatar et des étagères, façon
          bibliothèque surréaliste. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <MeshReflectorMaterial
          blur={[0, 0]}
          resolution={1024}
          mixBlur={0}
          mixStrength={1.4}
          roughness={0.05}
          depthScale={0}
          color="#0B0F16"
          metalness={0.6}
          mirror={1}
        />
      </mesh>
      {/* Plafond très haut et sombre — se perd dans le noir, jamais
          vraiment vu, pour laisser les étagères grimper sans limite visible. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H + 6, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#050302" roughness={1} />
      </mesh>

      {/* Murs d'étagères — gauche, droite, et derrière le joueur */}
      <BookshelfWall position={[-W / 2 + 0.08, (H + 5) / 2, 0]} rotation={[0, Math.PI / 2, 0]} width={D} height={H + 5} rows={16} booksPerRow={32} />
      <BookshelfWall position={[W / 2 - 0.08, (H + 5) / 2, 0]} rotation={[0, -Math.PI / 2, 0]} width={D} height={H + 5} rows={16} booksPerRow={32} />
      <BookshelfWall position={[0, (H + 5) / 2, D / 2 - 0.08]} rotation={[0, Math.PI, 0]} width={W} height={H + 5} rows={16} booksPerRow={40} />

      {/* Back wall (portes) */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow castShadow>
        <boxGeometry args={[W, H, 0.3]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Columns + arches — répétées en profondeur pour l'effet de
          couloir d'arches façon référence */}
      <OctagonalColumn position={[-4.5, 0, -3.5]} />
      <OctagonalColumn position={[4.5, 0, -3.5]} />
      <group position={[0, 0, -3.5]}>
        <IslamicArch width={3.5} height={5} depth={0.3} />
      </group>
      <group position={[-6.2, 0, -0.5]}>
        <IslamicArch width={2.4} height={4.2} depth={0.25} color="#6B5740" />
      </group>
      <group position={[6.2, 0, -0.5]}>
        <IslamicArch width={2.4} height={4.2} depth={0.25} color="#6B5740" />
      </group>

      {/* Candles */}
      <CandleLight position={[-4.5, 0.4, -3.5]} intensity={1.0} />
      <CandleLight position={[4.5, 0.4, -3.5]} intensity={1.0} />
      <CandleLight position={[-7, 1.0, 0]} intensity={0.8} />
      <CandleLight position={[7, 1.0, 0]} intensity={0.8} />

      {/* Three doorways on the back wall */}
      <DoorwayPortal
        position={[-5.2, 2.3, -D / 2 + 0.2]}
        glowColor="#C8A84B"
        arabicLabel="ميزان الشهادة"
        frenchLabel="Le Poids du Témoignage"
        onOpen={onOpenTemoignage}
      />
      <DoorwayPortal
        position={[0, 2.3, -D / 2 + 0.2]}
        glowColor="#60a5fa"
        arabicLabel="الرسم البدائي"
        frenchLabel="Le Rasm Primitif"
        onOpen={onOpenRasm}
      />
      <DoorwayPortal
        position={[5.2, 2.3, -D / 2 + 0.2]}
        glowColor="#34d399"
        arabicLabel="طريق النسخ"
        frenchLabel="La Route des Codicilles"
        onOpen={onOpenRoute}
      />

      <AmbientParticles />
    </group>
  );
}
