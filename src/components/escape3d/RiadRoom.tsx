"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { SpotLight, MeshReflectorMaterial, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { makeStucco, makeMarble, makeWood, makeTerracotta, makeLightWood } from "@/lib/escape3d/textures";

const DOOR_W = 1.6;
const DOOR_H = 2.6;
const WALL_T = 0.24;
const ROOM_H = 3.6;
const WALL   = "#EDE5D0";
const STONE  = "#C4B89A";
const CEIL   = "#E8DFC8";
const WOOD   = "#4A2E12";

// ── RoomShell : murs + sol + plafond + décors architecturaux ─────
function RoomShell({ width = 6, depth = 5 }: { width?: number; depth?: number; doorAxis?: "z" | "x" }) {
  const sideW = (width - DOOR_W) / 2;
  const bz    = -depth / 2;

  const stucco      = useMemo(() => typeof window !== "undefined" ? makeStucco(4) : null, []);
  const lightWoodMap = useMemo(() => typeof window !== "undefined" ? makeLightWood() : null, []);

  return (
    <>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#8B6914" roughness={0.75} />
      </mesh>

      {/* Plafond */}
      <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={CEIL} roughness={0.9} side={THREE.BackSide} />
      </mesh>
      {/* Poutres apparentes */}
      {[-1.5, 0, 1.5].map(x => (
        <mesh key={x} position={[x, ROOM_H - 0.09, 0]}>
          <boxGeometry args={[0.18, 0.18, depth]} />
          <meshPhysicalMaterial color="#3A1A05" roughness={0.7} metalness={0} clearcoat={0.2} clearcoatRoughness={0.5} map={lightWoodMap ?? undefined} />
        </mesh>
      ))}

      {/* Mur du fond */}
      <mesh position={[0, ROOM_H / 2, bz]} castShadow receiveShadow>
        <boxGeometry args={[width, ROOM_H, WALL_T]} />
        <meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      {/* Lambris bas mur du fond */}
      <mesh position={[0, 0.48, bz + 0.03]}>
        <boxGeometry args={[width - 0.08, 0.96, 0.06]} />
        <meshStandardMaterial color={STONE} roughness={0.82} />
      </mesh>
      {/* Frise à hauteur d'œil */}
      <mesh position={[0, 1.08, bz + 0.03]}>
        <boxGeometry args={[width - 0.08, 0.07, 0.04]} />
        <meshStandardMaterial color="#B8A270" roughness={0.7} metalness={0.08} />
      </mesh>
      {/* 3 niches sur mur du fond */}
      {[-1.8, 0, 1.8].map(x => (
        <group key={x} position={[x, 2.15, bz + 0.04]}>
          <mesh><boxGeometry args={[0.68, 0.96, 0.1]} /><meshStandardMaterial color="#D8CCAC" roughness={0.95} /></mesh>
          <mesh position={[0, 0.48, 0.02]}><boxGeometry args={[0.68, 0.08, 0.06]} /><meshStandardMaterial color={STONE} roughness={0.8} /></mesh>
          {[-0.34, 0.34].map(px => (
            <mesh key={px} position={[px, 0, 0.02]}><boxGeometry args={[0.07, 0.96, 0.06]} /><meshStandardMaterial color={STONE} roughness={0.8} /></mesh>
          ))}
        </group>
      ))}

      {/* Murs latéraux */}
      <mesh position={[-width / 2, ROOM_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, ROOM_H, depth]} /><meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      <mesh position={[width / 2, ROOM_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, ROOM_H, depth]} /><meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      {/* Lambris latéraux */}
      {[-width / 2 + 0.06, width / 2 - 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.48, 0]}><boxGeometry args={[0.05, 0.96, depth - 0.08]} /><meshStandardMaterial color={STONE} roughness={0.82} /></mesh>
      ))}
      {[-width / 2 + 0.06, width / 2 - 0.06].map((x, i) => (
        <mesh key={`f${i}`} position={[x, 1.08, 0]}><boxGeometry args={[0.04, 0.07, depth - 0.08]} /><meshStandardMaterial color="#B8A270" roughness={0.7} /></mesh>
      ))}

      {/* Mur d'entrée */}
      <mesh position={[-sideW / 2 - DOOR_W / 2, ROOM_H / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[sideW, ROOM_H, WALL_T]} /><meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      <mesh position={[sideW / 2 + DOOR_W / 2, ROOM_H / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[sideW, ROOM_H, WALL_T]} /><meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      <mesh position={[0, DOOR_H + (ROOM_H - DOOR_H) / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[DOOR_W, ROOM_H - DOOR_H, WALL_T]} /><meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      {/* Arche porte */}
      <mesh position={[0, DOOR_H - 0.1, depth / 2 + 0.02]}>
        <boxGeometry args={[DOOR_W + 0.12, 0.14, 0.06]} /><meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
      {[-DOOR_W / 2 - 0.06, DOOR_W / 2 + 0.06].map(x => (
        <mesh key={x} position={[x, DOOR_H / 2, depth / 2 + 0.02]}>
          <boxGeometry args={[0.1, DOOR_H, 0.06]} /><meshStandardMaterial color={STONE} roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

// ── Flamme de bougie ─────────────────────────────────────────────
function Flame({ position }: { position: [number, number, number] }) {
  const m = useRef<THREE.Mesh>(null!);
  const l = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (m.current) {
      const s = 0.85 + 0.15 * Math.sin(t * 11.2);
      m.current.scale.set(s, s + 0.2 * Math.sin(t * 8), s);
      m.current.position.set(position[0] + 0.008 * Math.sin(t * 6.7), position[1] + 0.012 * Math.sin(t * 9.3), position[2]);
    }
    if (l.current) l.current.intensity = 1.2 + 0.3 * Math.sin(t * 8.5);
  });
  return (
    <>
      <mesh ref={m} position={position}>
        <sphereGeometry args={[0.022, 6, 6]} />
        <meshStandardMaterial color="#FF8800" emissive="#FF6600" emissiveIntensity={4} roughness={0.2} />
      </mesh>
      <pointLight ref={l} position={position} color="#E8921A" intensity={1.2} distance={2.5} decay={2} />
    </>
  );
}

// ── Flamme de feu (grande) ───────────────────────────────────────
function FireFlame({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const m = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (m.current) {
      m.current.scale.set(scale * (0.8 + 0.2 * Math.sin(t * 12.3 + scale)), scale * (0.9 + 0.15 * Math.sin(t * 8.7)), scale * (0.8 + 0.2 * Math.sin(t * 11)));
      m.current.position.y = position[1] + 0.02 * Math.sin(t * 9.1 + scale);
    }
  });
  return (
    <mesh ref={m} position={position}>
      <sphereGeometry args={[0.1 * scale, 8, 8]} />
      <meshStandardMaterial color={scale > 1 ? "#FF4400" : "#FF7700"} emissive={scale > 1 ? "#FF4400" : "#FF6600"} emissiveIntensity={3.5} roughness={0.2} transparent opacity={0.9} />
    </mesh>
  );
}

// ── BIBLIOTHÈQUE ─────────────────────────────────────────────────
function BigBookshelf({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  const colors = ["#8B0000","#1A3A6A","#1A5C2A","#8B6914","#4A1A8B","#8B4A1A","#2A4A6A","#6B1A1A"];
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Caisse */}
      <mesh castShadow>
        <boxGeometry args={[2.5, 3.3, 0.38]} />
        <meshStandardMaterial color="#3A1E08" roughness={0.88} />
      </mesh>
      {/* 5 étagères */}
      {[0.28, 0.88, 1.46, 2.04, 2.62].map(y => (
        <mesh key={y} position={[0, y - 1.65 + 1.65, 0.08]}>
          <boxGeometry args={[2.3, 0.06, 0.34]} /><meshStandardMaterial color="#2A1208" roughness={0.85} />
        </mesh>
      ))}
      {/* Livres — 5 rangées × 9 livres */}
      {Array.from({ length: 45 }, (_, i) => {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const tilted = i % 8 === 5;
        const h = 0.32 + (i % 4) * 0.06;
        return (
          <mesh key={i} position={[-1.0 + col * 0.24, -1.5 + row * 0.58 + h / 2, 0.1]}
            rotation={[0, 0, tilted ? -0.22 : 0]} castShadow>
            <boxGeometry args={[0.18, h, 0.26]} />
            <meshStandardMaterial color={colors[i % colors.length]} roughness={0.9} emissive={colors[i % colors.length]} emissiveIntensity={0.06} />
          </mesh>
        );
      })}
      {/* Quelques objets déco sur une étagère */}
      <mesh position={[0.85, -0.2, 0.14]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.22, 8]} /><meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} emissive="#D4AF37" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function WallShelf({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  const colors = ["#8B0000","#1A5C2A","#8B6914","#4A1A8B"];
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh castShadow><boxGeometry args={[1.6, 0.07, 0.28]} /><meshStandardMaterial color={WOOD} roughness={0.85} /></mesh>
      <mesh position={[0, -0.14, 0]}><boxGeometry args={[1.6, 0.22, 0.04]} /><meshStandardMaterial color={WOOD} roughness={0.85} /></mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-0.6 + i * 0.2, 0.1 + (i % 3) * 0.04, 0.05]} castShadow>
          <boxGeometry args={[0.14, 0.26 + (i % 3) * 0.06, 0.2]} />
          <meshStandardMaterial color={colors[i % 4]} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function Library({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const astroRef = useRef<THREE.PointLight>(null!);
  const woodMap  = useMemo(() => typeof window !== "undefined" ? makeWood() : null, []);
  useFrame(({ clock }) => {
    if (astroRef.current) astroRef.current.intensity = 0.7 + 0.4 * Math.sin(clock.getElapsedTime() * 3.2);
  });

  return (
    <group position={[0, 0, -6.15]}>
      <RoomShell width={6} depth={5} />

      {/* Sol bois sombre */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} /><meshStandardMaterial color="#3A2208" roughness={0.82} map={woodMap ?? undefined} />
      </mesh>

      <ambientLight intensity={0.35} color="#704020" />

      {/* SpotLight chandelier central */}
      <SpotLight position={[0, 3.4, 0]} color="#FFB020" intensity={5} angle={0.55} penumbra={0.85} castShadow distance={8} attenuation={5} />
      <mesh position={[0, 3.25, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.04, 0.28, 10]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.15} metalness={0.85} emissive="#D4AF37" emissiveIntensity={0.5} />
      </mesh>

      {/* 3 bibliothèques couvrant tout le mur du fond */}
      <BigBookshelf position={[-1.8, 1.65, -2.28]} />
      <BigBookshelf position={[ 1.8, 1.65, -2.28]} />
      <BigBookshelf position={[ 0,   1.65, -2.28]} />

      {/* Étagères murales sur mur gauche (visibles depuis caméra) */}
      <WallShelf position={[-2.86, 1.9, -1.2]} rotY={Math.PI / 2} />
      <WallShelf position={[-2.86, 1.25, -0.2]} rotY={Math.PI / 2} />
      <WallShelf position={[-2.86, 2.55, -0.2]} rotY={Math.PI / 2} />

      {/* Fenêtre avec lumière sur mur droit */}
      <mesh position={[2.88, 2.0, -0.5]}>
        <boxGeometry args={[0.04, 0.9, 0.7]} />
        <meshStandardMaterial color="#C8D8F0" transparent opacity={0.35} emissive="#9AB8E0" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[2.5, 2.0, -0.5]} color="#C8D8F0" intensity={1.5} distance={4} decay={2} />

      {/* Pupitre avec manuscrit */}
      <group position={[0, 0, -0.8]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <boxGeometry args={[1.3, 0.07, 0.9]} /><meshStandardMaterial color="#5C3A1E" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.72, 8]} /><meshStandardMaterial color={WOOD} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.79, 0]} rotation={[-0.3, 0, 0]} onClick={onPuzzleTap} castShadow>
          <boxGeometry args={[0.75, 0.02, 0.55]} />
          {solved
            ? <meshPhysicalMaterial color="#D4AF37" roughness={0.4} emissive="#D4AF37" emissiveIntensity={0.7} clearcoat={0.5} clearcoatRoughness={0.2} />
            : <meshStandardMaterial color="#F0E8D0" roughness={0.6} emissive="#C8B880" emissiveIntensity={0.2} />
          }
        </mesh>
        {/* 2 bougies */}
        <mesh position={[0.48, 0.84, 0.18]} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.14, 6]} /><meshStandardMaterial color="#F5F0E0" roughness={0.6} emissive="#FFE8A0" emissiveIntensity={0.3} />
        </mesh>
        <Flame position={[0.48, 0.96, 0.18]} />
        <mesh position={[-0.4, 0.8, 0.12]} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 0.09, 6]} /><meshStandardMaterial color="#F5F0E0" roughness={0.6} emissive="#FFE8A0" emissiveIntensity={0.3} />
        </mesh>
        <Flame position={[-0.4, 0.88, 0.12]} />
      </group>

      {/* Globe terrestre */}
      <group position={[1.6, 0, -0.5]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.08, 0.72, 8]} /><meshStandardMaterial color={WOOD} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[0.3, 0, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} /><meshStandardMaterial color="#1A4A6A" roughness={0.5} metalness={0.1} emissive="#0A2A4A" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* Astrolabe */}
      <mesh position={[-1.8, 1.55, -0.9]} castShadow rotation={[0.3, 0.5, 0]}>
        <torusGeometry args={[0.26, 0.028, 8, 24]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.22} metalness={0.82} emissive="#D4AF37" emissiveIntensity={0.35} />
      </mesh>
      <pointLight ref={astroRef} position={[-1.8, 1.55, -0.9]} color="#D4AF37" intensity={0.7} distance={1.8} decay={2} />

      {/* Parchemins roulés sur étagères */}
      {[[0.8, 1.55, -2.05], [-0.8, 1.55, -2.05], [0.8, 2.15, -2.05]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.28, 8]} /><meshStandardMaterial color="#F0E8D0" roughness={0.7} />
        </mesh>
      ))}

      {/* Dust Sparkles */}
      <Sparkles count={35} scale={3} size={0.35} speed={0.04} color="#FFE8A0" opacity={0.28} position={[0, 2, -1]} />

      {!solved && onPuzzleTap && (
        <mesh position={[0, 1.15, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.13, 0.19, 24]} /><meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ── Tapis procédural ──────────────────────────────────────────────
function makeCarpet() {
  const s = 512, c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#7A1818"; ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 16; ctx.strokeRect(16, 16, s - 32, s - 32);
  ctx.lineWidth = 5; ctx.strokeRect(30, 30, s - 60, s - 60);
  const star = (cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, inn = r * 0.42;
      if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.lineTo(cx + Math.cos(a + Math.PI / 8) * inn, cy + Math.sin(a + Math.PI / 8) * inn);
    }
    ctx.closePath();
  };
  ctx.fillStyle = "#D4AF37"; star(s/2, s/2, 90); ctx.fill();
  ctx.fillStyle = "#7A1818"; star(s/2, s/2, 52); ctx.fill();
  [[96,96],[416,96],[96,416],[416,416],[256,96],[256,416],[96,256],[416,256]].forEach(([cx,cy]) => {
    ctx.fillStyle = "#D4AF37"; star(cx, cy, 32); ctx.fill();
    ctx.fillStyle = "#7A1818"; star(cx, cy, 18); ctx.fill();
  });
  return new THREE.CanvasTexture(c);
}

// ── SALON ─────────────────────────────────────────────────────────
export function Salon({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const carpet  = useMemo(() => typeof window !== "undefined" ? makeCarpet() : null, []);
  const woodMap = useMemo(() => typeof window !== "undefined" ? makeWood() : null, []);

  return (
    <group position={[0, 0, 6.15]}>
      <RoomShell width={6} depth={5} />

      {/* Sol parquet */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} /><meshStandardMaterial color="#2A1A08" roughness={0.85} map={woodMap ?? undefined} />
      </mesh>
      {/* Tapis central */}
      <mesh position={[0, 0.005, -0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.0, 3.8]} />
        <meshStandardMaterial map={carpet ?? undefined} color={carpet ? "#fff" : "#7A1818"} roughness={0.9} />
      </mesh>

      <ambientLight intensity={0.45} color="#5020A0" />

      {/* SpotLight lustre */}
      <SpotLight position={[0, 3.4, -0.3]} color="#C878D4" intensity={6} angle={0.62} penumbra={0.9} castShadow distance={8} attenuation={5} />
      <mesh position={[0, 3.22, -0.3]}>
        <cylinderGeometry args={[0.02, 0.02, 0.38, 6]} /><meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 2.84, -0.3]}>
        <dodecahedronGeometry args={[0.32, 0]} />
        <meshPhysicalMaterial color="#D4AF37" transmission={0.4} roughness={0.05} metalness={0.2} ior={1.5} thickness={0.3} emissive="#D4AF37" emissiveIntensity={0.8} />
      </mesh>

      {/* Banquette sur le mur du fond — bien visible depuis caméra */}
      <group position={[0, 0, -2.25]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[5.4, 0.28, 0.72]} /><meshPhysicalMaterial color="#6B1A1A" roughness={0.75} sheen={0.5} sheenColor="#8B2020" />
        </mesh>
        <mesh position={[0, 0.58, -0.28]}>
          <boxGeometry args={[5.4, 0.55, 0.12]} /><meshPhysicalMaterial color="#8B2020" roughness={0.75} sheen={0.5} sheenColor="#8B2020" />
        </mesh>
        {/* Coussins sur la banquette */}
        {[-2.0, -1.0, 0, 1.0, 2.0].map(x => (
          <mesh key={x} position={[x, 0.52, 0.12]} castShadow>
            <boxGeometry args={[0.78, 0.32, 0.68]} />
            <meshStandardMaterial color={["#D4222A","#1A3A8B","#1A6B2A","#8B6914","#6B1A6B"][Math.abs(Math.round(x)) % 5]} roughness={0.82} />
          </mesh>
        ))}
      </group>

      {/* Nattes / coussins de sol au centre */}
      {[[-1.5, 0, 0.4], [0, 0, 0.8], [1.5, 0, 0.4]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.16, z]} castShadow>
          <boxGeometry args={[0.8, 0.22, 0.8]} />
          <meshStandardMaterial color={["#C4222A","#2A4A9B","#1A7B3A"][i]} roughness={0.85} />
        </mesh>
      ))}

      {/* Table basse avec service à thé */}
      <group position={[0, 0, -0.6]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[1.5, 0.07, 0.95]} /><meshStandardMaterial color="#5C3A1E" roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Théière */}
        <mesh position={[0, 0.37, 0.1]} castShadow>
          <sphereGeometry args={[0.1, 10, 10]} /><meshStandardMaterial color="#D4AF37" roughness={0.25} metalness={0.75} emissive="#D4AF37" emissiveIntensity={0.15} />
        </mesh>
        {/* Petits verres */}
        {[-0.35, 0.35].map(x => (
          <mesh key={x} position={[x, 0.34, -0.1]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.09, 8]} /><meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.8} emissive="#D4AF37" emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>

      {/* Vitrail gauche — 3 panneaux colorés */}
      {[["#FF3333", -0.4], ["#D4AF37", 0], ["#3333FF", 0.4]].map(([col, dz], i) => (
        <group key={i} position={[-2.88, 1.95, Number(dz) - 0.2]}>
          <mesh><boxGeometry args={[0.03, 0.8, 0.35]} /><meshStandardMaterial color={String(col)} transparent opacity={0.4} emissive={String(col)} emissiveIntensity={0.7} /></mesh>
          <pointLight position={[0.4, 0, 0]} color={String(col)} intensity={1.2} distance={3.5} decay={2} />
        </group>
      ))}

      {/* Appliques murales dorées (mur droit) */}
      {[-0.8, 0.8].map(z => (
        <group key={z} position={[2.86, 2.0, z]}>
          <mesh><boxGeometry args={[0.04, 0.22, 0.12]} /><meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} /></mesh>
          <Flame position={[0, 0.14, 0.06]} />
        </group>
      ))}

      {/* Grande calligraphie (énigme) + niche éclairée */}
      <mesh position={[0, 2.15, -2.36]} onClick={onPuzzleTap} castShadow>
        <boxGeometry args={[2.0, 0.8, 0.06]} />
        <meshStandardMaterial color={solved ? "#D4AF37" : "#C4A850"} roughness={0.4} emissive={solved ? "#D4AF37" : "#A88030"} emissiveIntensity={solved ? 0.9 : 0.45} />
      </mesh>
      <pointLight position={[0, 2.15, -2.15]} color={solved ? "#D4AF37" : "#C4A850"} intensity={solved ? 2.5 : 1.0} distance={3.5} decay={2} />

      {/* Brûleur d'encens */}
      <group position={[1.0, 0.3, -1.0]}>
        <mesh castShadow><cylinderGeometry args={[0.08, 0.06, 0.18, 8]} /><meshStandardMaterial color="#D4AF37" roughness={0.28} metalness={0.72} /></mesh>
        <Sparkles count={18} scale={[0.25, 2.5, 0.25]} size={0.5} speed={0.08} color="#C8C0FF" opacity={0.5} position={[0, 0.5, 0]} />
      </group>

      {!solved && onPuzzleTap && (
        <mesh position={[0, 2.6, -2.28]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.13, 0.19, 24]} /><meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ── CUISINE ───────────────────────────────────────────────────────
function Fireplace() {
  const fl = useRef<THREE.PointLight>(null!);
  const f1 = useRef<THREE.Mesh>(null!), f2 = useRef<THREE.Mesh>(null!), f3 = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    [f1, f2, f3].forEach((r, i) => {
      if (!r.current) return;
      const s = 0.8 + 0.2 * Math.sin(t * (11 + i * 1.3) + i);
      r.current.scale.set(s, s + 0.15 * Math.sin(t * (8 + i)), s);
      r.current.position.y = [0.24, 0.19, 0.21][i] + 0.02 * Math.sin(t * 9 + i);
    });
    if (fl.current) fl.current.intensity = 4.5 + 1.5 * Math.sin(t * 9.3);
  });
  return (
    <group position={[-2.2, 0, -2.3]}>
      <mesh position={[0, 0.65, 0]} castShadow><boxGeometry args={[0.85, 1.1, 0.22]} /><meshStandardMaterial color="#5A2008" roughness={0.95} /></mesh>
      <mesh position={[0, 0.6, -0.06]}><boxGeometry args={[0.66, 0.88, 0.06]} /><meshStandardMaterial color="#1A0804" roughness={1.0} /></mesh>
      {/* Bûches */}
      {[[-0.09, 0.07, -0.02, 0.3], [0.09, 0.06, -0.01, -0.2]].map(([x, y, z, ry], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, ry, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.5, 6]} /><meshStandardMaterial color="#2A1208" roughness={0.95} />
        </mesh>
      ))}
      <mesh ref={f1} position={[0, 0.24, -0.02]}><sphereGeometry args={[0.13, 8, 8]} /><meshStandardMaterial color="#FF4400" emissive="#FF4400" emissiveIntensity={4} roughness={0.2} transparent opacity={0.9} /></mesh>
      <mesh ref={f2} position={[0.1, 0.19, -0.02]}><sphereGeometry args={[0.09, 8, 8]} /><meshStandardMaterial color="#FF7700" emissive="#FF6600" emissiveIntensity={4} roughness={0.2} transparent opacity={0.85} /></mesh>
      <mesh ref={f3} position={[-0.09, 0.21, -0.02]}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#FFAA00" emissive="#FF9900" emissiveIntensity={4} roughness={0.2} transparent opacity={0.8} /></mesh>
      <pointLight ref={fl} position={[0, 0.55, 0.25]} color="#FF6600" intensity={4.5} distance={6} decay={2} />
    </group>
  );
}

function TajineStack({ position }: { position: [number, number, number] }) {
  const cols = ["#8B4000", "#C04A00", "#7A3800"];
  return (
    <group position={position}>
      {cols.map((c, i) => (
        <group key={i} position={[0, i * 0.44, 0]}>
          <mesh castShadow><cylinderGeometry args={[0.21 - i * 0.01, 0.25 - i * 0.01, 0.2, 14]} /><meshStandardMaterial color={c} roughness={0.82} metalness={0.05} /></mesh>
          <mesh position={[0, 0.24, 0]} castShadow><coneGeometry args={[0.21 - i * 0.01, 0.34, 14]} /><meshStandardMaterial color={c} roughness={0.82} metalness={0.05} /></mesh>
        </group>
      ))}
    </group>
  );
}

export function Cuisine({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const terracottaTex = useMemo(() => typeof window !== "undefined" ? makeTerracotta() : null, []);

  return (
    <group position={[6.15, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <RoomShell width={6} depth={5} />

      {/* Sol terre cuite */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} /><meshStandardMaterial color="#B04A18" roughness={0.85} map={terracottaTex ?? undefined} />
      </mesh>

      <ambientLight intensity={0.4} color="#803010" />
      <SpotLight position={[0, 3.2, 0]} color="#E07820" intensity={4} angle={0.58} penumbra={0.85} castShadow distance={9} attenuation={5} />

      {/* Feu */}
      <Fireplace />

      {/* 3 niveaux d'étagères gauche (mur du fond côté gauche) */}
      {[0.55, 1.2, 1.85].map((y, row) => (
        <group key={y}>
          <mesh position={[-2.2, y, -1.8]} castShadow>
            <boxGeometry args={[1.8, 0.07, 0.42]} /><meshStandardMaterial color={WOOD} roughness={0.85} />
          </mesh>
          {Array.from({ length: 4 }, (_, i) => (
            <TajineStack key={i} position={[-2.2 + (i - 1.5) * 0.4, y + 0.07, -1.8]} />
          )).slice(0, row === 0 ? 3 : 2)}
        </group>
      ))}

      {/* Étagères droite avec jarres */}
      {[0.6, 1.3].map((y, row) => (
        <group key={y}>
          <mesh position={[2.2, y, -1.5]} castShadow>
            <boxGeometry args={[1.6, 0.07, 0.38]} /><meshStandardMaterial color={WOOD} roughness={0.85} />
          </mesh>
          {Array.from({ length: 3 }, (_, i) => (
            <mesh key={i} position={[1.5 + i * 0.5, y + 0.22, -1.5]} castShadow>
              <cylinderGeometry args={[0.14, 0.12, 0.38, 10]} />
              <meshStandardMaterial color={["#8B4000","#A03800","#6B3000"][i]} roughness={0.82} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Plan de travail central (hauteur d'œil depuis entrée) */}
      <group position={[0, 0, -1.8]}>
        <mesh position={[0, 0.88, 0]} castShadow>
          <boxGeometry args={[3.0, 0.09, 0.7]} /><meshPhysicalMaterial color="#5C3A1E" roughness={0.78} clearcoat={0.6} clearcoatRoughness={0.3} />
        </mesh>
        {/* Mortier + pilon */}
        <mesh position={[0.6, 0.98, 0.1]} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.14, 10]} /><meshStandardMaterial color="#C4B89A" roughness={0.7} />
        </mesh>
        {/* Plateau cuivré */}
        <mesh position={[-0.5, 0.96, 0.05]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 16]} /><meshStandardMaterial color="#C87820" roughness={0.3} metalness={0.6} emissive="#C87820" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* Rack de casseroles cuivre au plafond */}
      <mesh position={[0, 3.0, -1.0]} castShadow>
        <boxGeometry args={[2.2, 0.06, 0.3]} /><meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      {[-0.8, -0.2, 0.4, 1.0].map(x => (
        <group key={x} position={[x, 2.72, -1.0]}>
          <mesh><cylinderGeometry args={[0.015, 0.015, 0.3, 4]} /><meshStandardMaterial color="#888" roughness={0.4} /></mesh>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.18, 14]} /><meshStandardMaterial color="#C87820" roughness={0.15} metalness={0.88} emissive="#C87820" emissiveIntensity={0.12} />
          </mesh>
        </group>
      ))}

      {/* Herbes suspendues */}
      {[[-1.0, 3.08, -0.8], [0.4, 3.08, 0.6], [-0.4, 3.0, 1.1]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.2, i * 0.8, 0.1]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.38, 4]} />
          <meshStandardMaterial color={["#1A6B1A","#2A8B2A","#1A5B1A"][i]} roughness={0.9} emissive={["#1A6B1A","#2A8B2A","#1A5B1A"][i]} emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Jarre de miel (énigme) */}
      <group position={[1.2, 0, 0.5]}>
        <mesh castShadow onClick={onPuzzleTap}>
          <cylinderGeometry args={[0.22, 0.18, 0.58, 12]} />
          {solved
            ? <meshStandardMaterial color="#D4AF37" roughness={0.5} emissive="#D4AF37" emissiveIntensity={0.8} />
            : <MeshTransmissionMaterial roughness={0.1} thickness={0.5} transmission={0.95} color="#E8A020" ior={1.45} chromaticAberration={0.04} />
          }
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 0.1, 12]} /><meshStandardMaterial color="#8B5000" roughness={0.7} />
        </mesh>
        {!solved && onPuzzleTap && (
          <mesh position={[0, 0.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.18, 24]} /><meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* Grandes jarres de stockage au fond */}
      {[[-2.1, 0, 2.1], [-1.5, 0, 2.2], [-0.9, 0, 2.1]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.4 + i * 0.02, z]} castShadow>
          <cylinderGeometry args={[0.18 + i * 0.02, 0.15, 0.8 + i * 0.1, 12]} />
          <meshStandardMaterial color={["#7A3800","#9A4800","#6A2800"][i]} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// ── HAMMAM ────────────────────────────────────────────────────────
function MosaicWall({ width, height, z }: { width: number; height: number; z: number }) {
  const tilesX = Math.floor(width / 0.28);
  const tilesY = Math.floor(height / 0.28);
  const palette = ["#1A6B8A","#D4AF37","#2A8B2A","#8B1A1A","#4A1A8B","#1A4A8B"];
  return (
    <group>
      {Array.from({ length: tilesX * tilesY }, (_, i) => {
        const tx = i % tilesX, ty = Math.floor(i / tilesX);
        const col = palette[(tx + ty * 3) % palette.length];
        const isGold = (tx + ty) % 5 === 0;
        return (
          <mesh key={i} position={[-width / 2 + tx * 0.28 + 0.14, ty * 0.28 + 0.14, z]}>
            <boxGeometry args={[0.24, 0.24, 0.04]} />
            <meshStandardMaterial color={isGold ? "#D4AF37" : col} roughness={0.3} metalness={isGold ? 0.3 : 0.05} emissive={isGold ? "#D4AF37" : col} emissiveIntensity={isGold ? 0.25 : 0.12} />
          </mesh>
        );
      })}
    </group>
  );
}

function WaterSurface({ position }: { position: [number, number, number] }) {
  const m = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (m.current) m.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.7) * 0.015;
  });
  return (
    <mesh ref={m} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.78, 32]} />
      <meshPhysicalMaterial color="#A8C8D8" transmission={0.5} roughness={0.02} ior={1.33} thickness={0.8} metalness={0} />
    </mesh>
  );
}

export function Hammam({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const marbleTex = useMemo(() => typeof window !== "undefined" ? makeMarble() : null, []);

  return (
    <group position={[-6.15, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <RoomShell width={6} depth={5} />

      {/* Sol marbre réfléchissant */}
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} />
        <MeshReflectorMaterial blur={[300, 150]} mixStrength={35} roughness={0.06} color="#E0DCD4" mirror={0.45} depthScale={0.4} />
      </mesh>

      <ambientLight intensity={0.5} color="#1A4060" />
      <SpotLight position={[0, 3.5, -0.5]} color="#88BBDD" intensity={5} angle={0.48} penumbra={0.88} castShadow distance={10} attenuation={5} />

      {/* Mosaïque complète sur mur du fond (remplace les 4 panneaux séparés) */}
      <group position={[0, 0, -2.36]}>
        <MosaicWall width={5.8} height={2.8} z={0} />
      </group>

      {/* 2 colonnes marbre flanquant le bassin */}
      {[-1.4, 1.4].map(x => (
        <group key={x} position={[x, 0, -0.5]}>
          <mesh castShadow><cylinderGeometry args={[0.12, 0.15, 2.8, 12]} /><meshPhysicalMaterial color="#E8E4D8" map={marbleTex ?? undefined} roughness={0.08} metalness={0} clearcoat={0.9} clearcoatRoughness={0.05} /></mesh>
          {/* Chapiteau */}
          <mesh position={[0, 1.45, 0]} castShadow><cylinderGeometry args={[0.2, 0.12, 0.18, 12]} /><meshStandardMaterial color="#D8CCAC" roughness={0.4} /></mesh>
          {/* Base */}
          <mesh position={[0, -1.4, 0]}><cylinderGeometry args={[0.18, 0.18, 0.12, 12]} /><meshStandardMaterial color="#D8CCAC" roughness={0.4} /></mesh>
        </group>
      ))}

      {/* Étoile au plafond — skylight */}
      <mesh position={[0, 3.56, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 8]} />
        <meshStandardMaterial color="#88BBDD" emissive="#88BBDD" emissiveIntensity={1.2} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, 3.4, -0.5]} color="#88CCEE" intensity={2.5} distance={5} decay={2} />

      {/* Bassin central (énigme) */}
      <group position={[0, 0, -0.5]}>
        <mesh castShadow><cylinderGeometry args={[0.95, 1.0, 0.32, 36]} /><meshPhysicalMaterial color="#E8E0D0" roughness={0.15} metalness={0} clearcoat={0.8} clearcoatRoughness={0.05} /></mesh>
        <WaterSurface position={[0, 0.12, 0]} />
        <Sparkles count={70} scale={[2.0, 2.2, 2.0]} size={1.8} speed={0.06} color="#AACCEE" opacity={0.22} position={[0, 0.6, 0]} />
        {/* Jet d'eau central */}
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.018, 0.025, 0.85, 6]} /><meshStandardMaterial color="#88BBDD" transparent opacity={0.55} emissive="#88BBDD" emissiveIntensity={0.4} />
        </mesh>

        {/* Plaque énigme */}
        <mesh position={[0, 0.22, 0.92]} rotation={[-0.2, 0, 0]} onClick={onPuzzleTap}>
          <boxGeometry args={[0.85, 0.28, 0.05]} />
          <meshStandardMaterial color={solved ? "#D4AF37" : "#C0B898"} roughness={0.4} emissive={solved ? "#D4AF37" : "#A09070"} emissiveIntensity={solved ? 0.8 : 0.28} />
        </mesh>
        {!solved && onPuzzleTap && (
          <mesh position={[0, 0.58, 0.92]}>
            <ringGeometry args={[0.09, 0.14, 24]} /><meshBasicMaterial color="#88BBDD" transparent opacity={0.7} />
          </mesh>
        )}
      </group>

      {/* 2 petits bassins latéraux */}
      {[[-1.85, 0.28, -1.6], [1.85, 0.28, -1.6]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh><cylinderGeometry args={[0.38, 0.4, 0.24, 18]} /><meshStandardMaterial color="#E0D8C8" roughness={0.32} /></mesh>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.32, 18]} /><meshStandardMaterial color="#88AACC" transparent opacity={0.85} roughness={0.04} metalness={0.2} emissive="#3A6A8A" emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}

      {/* Niches avec bougies sur murs latéraux */}
      {[[-2.86, 1.9, -1.0], [-2.86, 1.9, 0.5], [2.86, 1.9, -1.0], [2.86, 1.9, 0.5]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh><boxGeometry args={[0.05, 0.38, 0.28]} /><meshStandardMaterial color="#D8CCAC" roughness={0.95} /></mesh>
          <mesh position={[i < 2 ? 0.02 : -0.02, -0.1, 0]}>
            <cylinderGeometry args={[0.025, 0.03, 0.12, 6]} /><meshStandardMaterial color="#F5F0E0" roughness={0.6} emissive="#FFE8A0" emissiveIntensity={0.3} />
          </mesh>
          <Flame position={[i < 2 ? 0.05 : -0.05, -0.02, 0]} />
        </group>
      ))}
    </group>
  );
}
