"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { SpotLight, MeshReflectorMaterial, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// ── Géométrie commune ─────────────────────────────────────────
const DOOR_W = 1.6;
const DOOR_H = 2.6;
const WALL_T = 0.24;
const ROOM_H = 3.6;
const WALL_COLOR   = "#EDE5D0";
const STONE_COLOR  = "#C4B89A";
const CEILING_COLOR = "#E8DFC8";

function RoomShell({ width = 6, depth = 5 }: {
  width?: number;
  depth?: number;
  doorAxis?: "z" | "x";
}) {
  const sideW = (width - DOOR_W) / 2;
  const bz = -depth / 2; // z du mur du fond

  return (
    <>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#8B6914" roughness={0.75} />
      </mesh>

      {/* Plafond avec caissons */}
      <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={CEILING_COLOR} roughness={0.9} side={THREE.BackSide} />
      </mesh>
      {/* Poutres plafond */}
      {[-1.5, 0, 1.5].map(x => (
        <mesh key={x} position={[x, ROOM_H - 0.08, 0]}>
          <boxGeometry args={[0.18, 0.16, depth]} />
          <meshStandardMaterial color="#5C3A1E" roughness={0.85} />
        </mesh>
      ))}

      {/* Mur du fond — avec lambris + niches */}
      <mesh position={[0, ROOM_H / 2, bz]} castShadow receiveShadow>
        <boxGeometry args={[width, ROOM_H, WALL_T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>
      {/* Lambris bas (panneau de soubassement) */}
      <mesh position={[0, 0.45, bz + 0.03]}>
        <boxGeometry args={[width - 0.1, 0.9, 0.05]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.8} />
      </mesh>
      {/* Frise horizontale à hauteur d'œil */}
      <mesh position={[0, 1.05, bz + 0.03]}>
        <boxGeometry args={[width - 0.1, 0.07, 0.04]} />
        <meshStandardMaterial color="#B8A888" roughness={0.75} metalness={0.05} />
      </mesh>
      {/* 3 niches arabesques sur le mur du fond */}
      {[-1.8, 0, 1.8].map(x => (
        <group key={x} position={[x, 2.1, bz + 0.04]}>
          {/* Enfoncement de niche */}
          <mesh position={[0, 0, -0.04]}>
            <boxGeometry args={[0.72, 1.0, 0.1]} />
            <meshStandardMaterial color="#D8CCAC" roughness={0.95} />
          </mesh>
          {/* Arc de niche */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.72, 0.1, 0.06]} />
            <meshStandardMaterial color={STONE_COLOR} roughness={0.8} />
          </mesh>
          {/* Pilastres */}
          {[-0.36, 0.36].map(px => (
            <mesh key={px} position={[px, 0, 0]}>
              <boxGeometry args={[0.07, 1.0, 0.06]} />
              <meshStandardMaterial color={STONE_COLOR} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Murs latéraux */}
      <mesh position={[-width / 2, ROOM_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, ROOM_H, depth]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>
      <mesh position={[ width / 2, ROOM_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, ROOM_H, depth]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>
      {/* Lambris murs latéraux */}
      {[-width / 2 + 0.06, width / 2 - 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.45, 0]}>
          <boxGeometry args={[0.04, 0.9, depth - 0.1]} />
          <meshStandardMaterial color={STONE_COLOR} roughness={0.8} />
        </mesh>
      ))}

      {/* Mur d'entrée avec porte */}
      <mesh position={[-sideW / 2 - DOOR_W / 2, ROOM_H / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[sideW, ROOM_H, WALL_T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>
      <mesh position={[ sideW / 2 + DOOR_W / 2, ROOM_H / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[sideW, ROOM_H, WALL_T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>
      <mesh position={[0, DOOR_H + (ROOM_H - DOOR_H) / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[DOOR_W, ROOM_H - DOOR_H, WALL_T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>

      {/* Arche décorative porte */}
      <mesh position={[0, DOOR_H - 0.1, depth / 2 + 0.02]}>
        <boxGeometry args={[DOOR_W + 0.12, 0.14, 0.06]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.8} />
      </mesh>
      <mesh position={[-DOOR_W / 2 - 0.06, DOOR_H / 2, depth / 2 + 0.02]}>
        <boxGeometry args={[0.1, DOOR_H, 0.06]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.8} />
      </mesh>
      <mesh position={[ DOOR_W / 2 + 0.06, DOOR_H / 2, depth / 2 + 0.02]}>
        <boxGeometry args={[0.1, DOOR_H, 0.06]} />
        <meshStandardMaterial color={STONE_COLOR} roughness={0.8} />
      </mesh>
    </>
  );
}

// ── La Bibliothèque ───────────────────────────────────────────
function Bookshelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Structure */}
      <mesh castShadow>
        <boxGeometry args={[2.2, 2.8, 0.3]} />
        <meshStandardMaterial color="#4A2E12" roughness={0.85} />
      </mesh>
      {/* Étagères */}
      {[0.4, 1.0, 1.6, 2.2].map((y, i) => (
        <mesh key={i} position={[0, y - 1.4 + 1.4, 0.05]}>
          <boxGeometry args={[2.0, 0.06, 0.28]} />
          <meshStandardMaterial color="#3A2008" roughness={0.8} />
        </mesh>
      ))}
      {/* Livres — 3 rangées, plus denses */}
      {Array.from({ length: 18 }, (_, i) => {
        const row = Math.floor(i / 6);
        const col = i % 6;
        const isTilted = i % 7 === 3;
        const colors = ["#8B0000", "#1A3A6A", "#1A5C2A", "#8B6914", "#4A1A8B", "#8B4A1A"];
        return (
          <mesh
            key={i}
            position={[-0.85 + col * 0.28, -0.85 + row * 0.65, 0.1]}
            rotation={[0, 0, isTilted ? -0.25 : 0]}
            castShadow
          >
            <boxGeometry args={[0.2, 0.4 + (i % 3) * 0.08, 0.22]} />
            <meshStandardMaterial
              color={colors[i % colors.length]}
              roughness={0.9}
              emissive={colors[i % colors.length]}
              emissiveIntensity={0.08}
            />
          </mesh>
        );
      })}
      {/* Quelques livres tombés */}
      <mesh position={[0.6, -0.82, 0.18]} rotation={[Math.PI / 2, 0, 0.3]} castShadow>
        <boxGeometry args={[0.2, 0.04, 0.32]} />
        <meshStandardMaterial color="#C04A1A" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Flamme animée pour les chandelles
function Flame({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + 0.02 + 0.012 * Math.sin(t * 9.3 + position[0]);
      meshRef.current.position.x = position[0] + 0.008 * Math.sin(t * 6.7);
      const s = 0.85 + 0.15 * Math.sin(t * 11.2);
      meshRef.current.scale.set(s, s + 0.2 * Math.sin(t * 8), s);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 * (0.8 + 0.2 * Math.sin(t * 8.5 + position[0] * 4));
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={position} castShadow>
        <sphereGeometry args={[0.022, 6, 6]} />
        <meshStandardMaterial color="#FF8800" emissive="#FF6600" emissiveIntensity={3} roughness={0.2} />
      </mesh>
      <pointLight
        ref={lightRef}
        position={position}
        color="#E8921A"
        intensity={1.5}
        distance={2.5}
        decay={2}
      />
    </>
  );
}

export function Library({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const astrolabeLightRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    if (astrolabeLightRef.current) {
      const t = clock.getElapsedTime();
      astrolabeLightRef.current.intensity = 0.8 + 0.4 * Math.sin(t * 3.2);
    }
  });

  return (
    <group position={[0, 0, -6.15]}>
      <RoomShell width={6} depth={5} doorAxis="z" />

      {/* Sol bois sombre */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} />
        <meshStandardMaterial color="#3A2208" roughness={0.85} />
      </mesh>

      {/* Ambiant chaud brûlé */}
      <ambientLight intensity={0.4} color="#603020" />

      {/* Chandelier central SpotLight */}
      <SpotLight
        position={[0, 3.5, 0]}
        color="#FFB020"
        intensity={4}
        angle={0.5}
        penumbra={0.8}
        castShadow
        distance={7}
        attenuation={5}
      />

      {/* Géométrie chandelier suspendu */}
      <mesh position={[0, 3.3, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.02, 0.25, 8]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} emissive="#D4AF37" emissiveIntensity={0.4} />
      </mesh>

      {/* Bibliothèques */}
      <Bookshelf position={[-2.2, 1.4, -2.3]} />
      <Bookshelf position={[ 2.2, 1.4, -2.3]} />

      {/* Pupitre avec manuscrit (énigme) */}
      <group position={[0, 0, -0.5]}>
        {/* Table */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[1.2, 0.06, 0.8]} />
          <meshStandardMaterial color="#5C3A1E" roughness={0.8} />
        </mesh>
        {/* Pied */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.7, 8]} />
          <meshStandardMaterial color="#4A2E12" roughness={0.85} />
        </mesh>
        {/* Manuscrit interactif */}
        <mesh
          position={[0, 0.77, 0]}
          rotation={[-0.3, 0, 0]}
          onClick={onPuzzleTap}
          castShadow
        >
          <boxGeometry args={[0.7, 0.02, 0.5]} />
          <meshStandardMaterial
            color={solved ? "#D4AF37" : "#F0E8D0"}
            roughness={0.6}
            emissive={solved ? "#D4AF37" : "#C8B880"}
            emissiveIntensity={solved ? 0.6 : 0.15}
          />
        </mesh>

        {/* Chandelles sur bureau avec flammes animées */}
        <mesh position={[0.45, 0.82, 0.15]} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.12, 6]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} emissive="#FFB020" emissiveIntensity={0.8} />
        </mesh>
        <Flame position={[0.45, 0.93, 0.15]} />

        <mesh position={[-0.38, 0.79, 0.1]} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 0.08, 6]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} emissive="#FFB020" emissiveIntensity={0.8} />
        </mesh>
        <Flame position={[-0.38, 0.88, 0.1]} />
      </group>

      {/* Dust Sparkles dans le faisceau lumineux */}
      <Sparkles
        count={30}
        scale={2}
        size={0.3}
        speed={0.05}
        color="#FFE8A0"
        opacity={0.3}
        position={[0, 2, 0]}
      />

      {/* Astrolabe décoratif avec lumière pulsante */}
      <mesh position={[-1.8, 1.5, -0.8]} castShadow rotation={[0.3, 0.5, 0]}>
        <torusGeometry args={[0.22, 0.025, 8, 24]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.25} metalness={0.8} emissive="#D4AF37" emissiveIntensity={0.3} />
      </mesh>
      <pointLight
        ref={astrolabeLightRef}
        position={[-1.8, 1.5, -0.8]}
        color="#D4AF37"
        intensity={0.8}
        distance={1.8}
        decay={2}
      />

      {/* Indicateur interactif */}
      {!solved && onPuzzleTap && (
        <mesh position={[0, 1.12, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.18, 24]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ── Tapis marocain procédural ──────────────────────────────────
function makeCarpetTexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;

  // Fond bordeaux
  ctx.fillStyle = "#8B1A1A";
  ctx.fillRect(0, 0, size, size);

  // Bordure dorée
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 14;
  ctx.strokeRect(14, 14, size - 28, size - 28);
  ctx.lineWidth = 4;
  ctx.strokeRect(26, 26, size - 52, size - 52);

  // Motif géométrique central : étoiles à 8 branches
  const drawStar = (cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const inner = r * 0.42;
      if (i === 0) ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      else ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      const mid = angle + Math.PI / 8;
      ctx.lineTo(cx + Math.cos(mid) * inner, cy + Math.sin(mid) * inner);
    }
    ctx.closePath();
  };

  // Grande étoile centrale
  ctx.fillStyle = "#D4AF37";
  drawStar(size / 2, size / 2, 80);
  ctx.fill();
  ctx.fillStyle = "#8B1A1A";
  drawStar(size / 2, size / 2, 48);
  ctx.fill();

  // Petites étoiles aux coins
  for (const [cx, cy] of [[96, 96], [416, 96], [96, 416], [416, 416]]) {
    ctx.fillStyle = "#D4AF37";
    drawStar(cx, cy, 36);
    ctx.fill();
    ctx.fillStyle = "#8B1A1A";
    drawStar(cx, cy, 20);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// ── Le Salon ─────────────────────────────────────────────────
export function Salon({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const carpetTex = useMemo(() => typeof window !== "undefined" ? makeCarpetTexture() : null, []);

  return (
    <group position={[0, 0, 6.15]}>
      <RoomShell width={6} depth={5} doorAxis="z" />

      {/* Sol bois sombre base */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} />
        <meshStandardMaterial color="#2A1A08" roughness={0.85} />
      </mesh>

      {/* Tapis marocain procédural */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.5, 3.5]} />
        <meshStandardMaterial
          map={carpetTex ?? undefined}
          color={carpetTex ? "#ffffff" : "#8B1A1A"}
          roughness={0.9}
        />
      </mesh>

      {/* Ambiant violet nocturne */}
      <ambientLight intensity={0.5} color="#6030a0" />

      {/* Lustre central SpotLight */}
      <SpotLight
        position={[0, 3.4, 0]}
        color="#C878D4"
        intensity={5}
        angle={0.6}
        penumbra={0.9}
        castShadow
        distance={8}
        attenuation={5}
      />

      {/* Géométrie lustre */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 6]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 2.85, 0]}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#D4AF37" transparent opacity={0.55} roughness={0.1} emissive="#D4AF37" emissiveIntensity={1.0} />
      </mesh>

      {/* Fenêtre vitrail simulée — 3 pointlights colorés */}
      <pointLight position={[-2.7, 1.8, -0.5]} color="#FF4444" intensity={1.5} distance={4} decay={2} />
      <pointLight position={[-2.7, 1.8,  0.5]} color="#4444FF" intensity={1.5} distance={4} decay={2} />
      <pointLight position={[-2.7, 1.8,  0  ]} color="#D4AF37" intensity={1.5} distance={4} decay={2} />

      {/* Panneau vitrail simplifié */}
      {[[0, 0, "#FF4444"], [0, 0.3, "#4444FF"], [0, 0.6, "#D4AF37"]].map(([dz, dy, col], i) => (
        <mesh key={i} position={[-2.88, 1.6 + Number(dy), Number(dz) - 0.3]}>
          <boxGeometry args={[0.02, 0.5, 0.35]} />
          <meshStandardMaterial color={String(col)} transparent opacity={0.35} emissive={String(col)} emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* Coussins */}
      {[[-1.8, 0, 1.6], [0, 0, 1.6], [1.8, 0, 1.6], [-1.5, 0, -1.8], [1.5, 0, -1.8]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.18, z]} castShadow>
          <boxGeometry args={[0.7, 0.22, 0.7]} />
          <meshStandardMaterial color={["#D4222A", "#1A3A8B", "#1A6B2A", "#8B6914", "#6B1A6B"][i]} roughness={0.85} />
        </mesh>
      ))}

      {/* Table basse */}
      <mesh position={[0, 0.22, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.06, 0.9]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Fumée d'encens */}
      <Sparkles
        count={20}
        scale={[0.3, 2, 0.3]}
        size={0.4}
        speed={0.1}
        color="#C8C0FF"
        opacity={0.4}
        position={[0.8, 0.4, -1]}
      />

      {/* Calligraphie sur le mur du fond (énigme) */}
      <mesh
        position={[0, 2.0, -2.38]}
        onClick={onPuzzleTap}
        castShadow
      >
        <boxGeometry args={[1.8, 0.7, 0.05]} />
        <meshStandardMaterial
          color={solved ? "#D4AF37" : "#C4A850"}
          roughness={0.4}
          emissive={solved ? "#D4AF37" : "#A88030"}
          emissiveIntensity={solved ? 0.8 : 0.4}
        />
      </mesh>
      {/* Lumière derrière la calligraphie */}
      <pointLight
        position={[0, 2.0, -2.2]}
        color={solved ? "#D4AF37" : "#C4A850"}
        intensity={solved ? 2.0 : 0.8}
        distance={3}
        decay={2}
      />

      {!solved && onPuzzleTap && (
        <mesh position={[0, 2.38, -2.3]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.18, 24]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ── La Cuisine ────────────────────────────────────────────────
function Fireplace() {
  const flame1 = useRef<THREE.Mesh>(null!);
  const flame2 = useRef<THREE.Mesh>(null!);
  const flame3 = useRef<THREE.Mesh>(null!);
  const fireLightRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flame1.current) {
      flame1.current.scale.set(
        0.8 + 0.2 * Math.sin(t * 12.3),
        0.9 + 0.15 * Math.sin(t * 8.7),
        0.8 + 0.2 * Math.sin(t * 11)
      );
      flame1.current.position.y = 0.22 + 0.02 * Math.sin(t * 9.1);
    }
    if (flame2.current) {
      flame2.current.scale.set(
        0.7 + 0.3 * Math.sin(t * 10.5 + 1),
        0.8 + 0.2 * Math.sin(t * 7.3 + 2),
        0.7 + 0.3 * Math.sin(t * 9.8 + 0.5)
      );
      flame2.current.position.x = 0.12 + 0.015 * Math.sin(t * 7.2);
      flame2.current.position.y = 0.18 + 0.025 * Math.sin(t * 10.4);
    }
    if (flame3.current) {
      flame3.current.scale.set(
        0.6 + 0.25 * Math.sin(t * 13.1 + 2),
        0.7 + 0.2 * Math.sin(t * 9.5 + 1),
        0.6 + 0.25 * Math.sin(t * 11.7)
      );
      flame3.current.position.x = -0.1 + 0.012 * Math.sin(t * 8.8);
      flame3.current.position.y = 0.2 + 0.02 * Math.sin(t * 11.2 + 0.8);
    }
    if (fireLightRef.current) {
      fireLightRef.current.intensity = 4 * (0.85 + 0.15 * Math.sin(t * 9.3));
    }
  });

  return (
    <group position={[-2.2, 0, -2.3]}>
      {/* Ouverture en brique */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.7, 1.0, 0.18]} />
        <meshStandardMaterial color="#6B2A10" roughness={0.95} />
      </mesh>
      {/* Intérieur (noir de suie) */}
      <mesh position={[0, 0.55, -0.06]}>
        <boxGeometry args={[0.56, 0.82, 0.05]} />
        <meshStandardMaterial color="#1A0A04" roughness={1.0} />
      </mesh>

      {/* Bûches */}
      <mesh position={[-0.08, 0.08, -0.02]} rotation={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.42, 6]} />
        <meshStandardMaterial color="#2A1A08" roughness={0.95} />
      </mesh>
      <mesh position={[0.08, 0.07, -0.01]} rotation={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.028, 0.38, 6]} />
        <meshStandardMaterial color="#2A1A08" roughness={0.95} />
      </mesh>

      {/* Flamme 1 — grande */}
      <mesh ref={flame1} position={[0, 0.22, -0.02]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#FF4400" emissive="#FF4400" emissiveIntensity={3} roughness={0.2} transparent opacity={0.9} />
      </mesh>
      {/* Flamme 2 — droite */}
      <mesh ref={flame2} position={[0.12, 0.18, -0.02]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FF7700" emissive="#FF6600" emissiveIntensity={3} roughness={0.2} transparent opacity={0.85} />
      </mesh>
      {/* Flamme 3 — gauche petite */}
      <mesh ref={flame3} position={[-0.1, 0.2, -0.02]}>
        <sphereGeometry args={[0.065, 8, 8]} />
        <meshStandardMaterial color="#FFAA00" emissive="#FF9900" emissiveIntensity={3} roughness={0.2} transparent opacity={0.8} />
      </mesh>

      {/* Lumière du feu */}
      <pointLight
        ref={fireLightRef}
        position={[0, 0.5, 0.2]}
        color="#FF6600"
        intensity={4}
        distance={5}
        decay={2}
      />
    </group>
  );
}

export function Cuisine({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  return (
    <group position={[6.15, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <RoomShell width={6} depth={5} doorAxis="z" />

      {/* Sol carrelage terre cuite */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} />
        <meshStandardMaterial
          color="#B84A1A"
          roughness={0.85}
          emissive="#200800"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Ambiant chaud */}
      <ambientLight intensity={0.5} color="#803010" />

      {/* SpotLight principale */}
      <SpotLight
        position={[0, 3, 0]}
        color="#E07820"
        intensity={3.5}
        angle={0.55}
        penumbra={0.8}
        castShadow
        distance={8}
        attenuation={5}
      />

      {/* Feu dans l'âtre */}
      <Fireplace />

      {/* Étagères avec tajines */}
      <mesh position={[-2.2, 1.8, -2.2]} castShadow>
        <boxGeometry args={[1.8, 0.06, 0.4]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.8} />
      </mesh>
      {[[-1.8, 0.25, -2.2], [-1.3, 0.25, -2.2], [-0.8, 0.25, -2.2]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.24, 0.18, 16]} />
            <meshStandardMaterial color={["#8B4000", "#C04A00", "#A03800"][i]} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <coneGeometry args={[0.2, 0.32, 16]} />
            <meshStandardMaterial color={["#7A3800", "#B04200", "#903200"][i]} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Jarre de miel avec MeshTransmissionMaterial */}
      <group position={[1.2, 0, 0.5]}>
        <mesh castShadow onClick={onPuzzleTap}>
          <cylinderGeometry args={[0.22, 0.18, 0.55, 12]} />
          {solved ? (
            <meshStandardMaterial
              color="#D4AF37"
              roughness={0.5}
              emissive="#D4AF37"
              emissiveIntensity={0.7}
            />
          ) : (
            <MeshTransmissionMaterial
              roughness={0.1}
              thickness={0.5}
              transmission={0.95}
              color="#E8A020"
              ior={1.45}
              chromaticAberration={0.05}
            />
          )}
        </mesh>
        <mesh position={[0, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 0.1, 12]} />
          <meshStandardMaterial color="#8B5000" roughness={0.7} />
        </mesh>
        {!solved && onPuzzleTap && (
          <mesh position={[0, 0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.18, 24]} />
            <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* Herbes suspendues avec emissive subtle */}
      {[[-1, 3.1, -1], [0.5, 3.1, 0.5], [-0.5, 3.0, 1]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.2, i * 0.8, 0.1]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 4]} />
          <meshStandardMaterial
            color={["#1A6B1A", "#2A8B2A", "#1A5B1A"][i]}
            roughness={0.9}
            emissive={["#1A6B1A", "#2A8B2A", "#1A5B1A"][i]}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Le Hammam ─────────────────────────────────────────────────
// Eau animée pour les petits bassins
function AnimatedWater({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Légère rotation pour simuler le mouvement de l'eau
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.02;
    }
  });
  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.3, 16]} />
      <meshStandardMaterial
        color="#88AACC"
        transparent
        opacity={0.8}
        roughness={0.05}
        metalness={0.2}
        emissive="#3A6A8A"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

export function Hammam({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  return (
    <group position={[-6.15, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <RoomShell width={6} depth={5} doorAxis="z" />

      {/* Sol marbre réfléchissant */}
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} />
        <MeshReflectorMaterial
          blur={[400, 200]}
          mixStrength={40}
          roughness={0.05}
          color="#D8D4CC"
          mirror={0.5}
          depthScale={0.5}
        />
      </mesh>

      {/* Ambiant bleu vapeur */}
      <ambientLight intensity={0.6} color="#204060" />

      {/* SpotLight principale bleue */}
      <SpotLight
        position={[0, 3.5, -0.5]}
        color="#88BBDD"
        intensity={4.5}
        angle={0.45}
        penumbra={0.85}
        castShadow
        distance={9}
        attenuation={5}
      />

      {/* Bassin central (énigme) */}
      <group position={[0, 0, -0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.9, 0.95, 0.3, 32]} />
          <meshStandardMaterial color="#E8E0D0" roughness={0.3} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.78, 32]} />
          <meshStandardMaterial
            color="#B0C8D8"
            roughness={0.05}
            metalness={0.2}
            transparent
            opacity={0.9}
            emissive="#8AB0C0"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Vapeur / Steam Sparkles */}
        <Sparkles
          count={60}
          scale={[1.8, 2, 1.8]}
          size={1.5}
          speed={0.08}
          color="#AACCEE"
          opacity={0.25}
          position={[0, 0.5, 0]}
        />

        {/* Plaque énigme sur le bord */}
        <mesh
          position={[0, 0.2, 0.85]}
          rotation={[-0.2, 0, 0]}
          onClick={onPuzzleTap}
        >
          <boxGeometry args={[0.8, 0.25, 0.05]} />
          <meshStandardMaterial
            color={solved ? "#D4AF37" : "#C0B898"}
            roughness={0.4}
            emissive={solved ? "#D4AF37" : "#A09070"}
            emissiveIntensity={solved ? 0.7 : 0.25}
          />
        </mesh>
        {!solved && onPuzzleTap && (
          <mesh position={[0, 0.55, 0.85]}>
            <ringGeometry args={[0.08, 0.13, 24]} />
            <meshBasicMaterial color="#88BBDD" transparent opacity={0.7} />
          </mesh>
        )}
      </group>

      {/* Petits bassins côtés avec eau animée */}
      {[[-1.8, 0.25, -1.5], [1.8, 0.25, -1.5]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[0.35, 0.38, 0.22, 16]} />
            <meshStandardMaterial color="#E0D8C8" roughness={0.35} />
          </mesh>
          <AnimatedWater position={[0, 0.08, 0]} />
        </group>
      ))}

      {/* Mosaïques au mur avec emissive et lumières derrière */}
      {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 1.4, -2.38]}>
            <boxGeometry args={[0.5, 0.5, 0.04]} />
            <meshStandardMaterial
              color={["#1A6B8A", "#D4AF37", "#1A6B8A", "#D4AF37"][i]}
              roughness={0.3}
              emissive={["#1A6B8A", "#D4AF37", "#1A6B8A", "#D4AF37"][i]}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Lumière derrière chaque mosaïque */}
          <pointLight
            position={[x, 1.4, -2.1]}
            color={["#1A6B8A", "#D4AF37", "#1A6B8A", "#D4AF37"][i]}
            intensity={0.6}
            distance={1.8}
            decay={2}
          />
        </group>
      ))}

      {/* Rangée basse de mosaïques */}
      {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
        <group key={`low-${i}`}>
          <mesh position={[x, 0.6, -2.38]}>
            <boxGeometry args={[0.4, 0.4, 0.04]} />
            <meshStandardMaterial
              color={["#D4AF37", "#1A6B8A", "#D4AF37", "#1A6B8A"][i]}
              roughness={0.3}
              emissive={["#D4AF37", "#1A6B8A", "#D4AF37", "#1A6B8A"][i]}
              emissiveIntensity={0.3}
            />
          </mesh>
          <pointLight
            position={[x, 0.6, -2.1]}
            color={["#D4AF37", "#1A6B8A", "#D4AF37", "#1A6B8A"][i]}
            intensity={0.4}
            distance={1.5}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}
