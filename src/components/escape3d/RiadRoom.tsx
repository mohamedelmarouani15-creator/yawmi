"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Géométrie commune ─────────────────────────────────────────
const DOOR_W = 1.6;
const DOOR_H = 2.6;
const WALL_T = 0.24;
const ROOM_H = 3.6;
const WALL_COLOR   = "#EDE5D0";
const STONE_COLOR  = "#C4B89A";
const CEILING_COLOR = "#E8DFC8";

function RoomShell({ width = 6, depth = 5, doorAxis }: {
  width?: number;
  depth?: number;
  doorAxis: "z" | "x"; // z = porte sur face avant/arrière, x = porte sur côté
}) {
  const sideW = (width - DOOR_W) / 2;

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
        <meshStandardMaterial color={CEILING_COLOR} roughness={0.9} side={THREE.BackSide} />
      </mesh>

      {/* Mur du fond */}
      <mesh position={[0, ROOM_H / 2, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, ROOM_H, WALL_T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>

      {/* Murs latéraux */}
      <mesh position={[-width / 2, ROOM_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, ROOM_H, depth]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>
      <mesh position={[ width / 2, ROOM_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, ROOM_H, depth]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>

      {/* Mur d'entrée avec porte : deux segments + linteau */}
      <mesh position={[-sideW / 2 - DOOR_W / 2, ROOM_H / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[sideW, ROOM_H, WALL_T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>
      <mesh position={[ sideW / 2 + DOOR_W / 2, ROOM_H / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[sideW, ROOM_H, WALL_T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>
      {/* Linteau au-dessus de la porte */}
      <mesh position={[0, DOOR_H + (ROOM_H - DOOR_H) / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[DOOR_W, ROOM_H - DOOR_H, WALL_T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>

      {/* Arche décorative */}
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
      {[0.5, 1.1, 1.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]}>
          <boxGeometry args={[2.0, 0.06, 0.28]} />
          <meshStandardMaterial color="#3A2008" roughness={0.8} />
        </mesh>
      ))}
      {/* Livres */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-0.85 + i * 0.16, 0.28 + Math.floor(i / 6) * 0.62, 0.1]} castShadow>
          <boxGeometry args={[0.12, 0.35 + (i % 3) * 0.08, 0.22]} />
          <meshStandardMaterial
            color={["#8B0000", "#1A3A6A", "#1A5C2A", "#8B6914"][i % 4]}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Library({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const candleRef = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    if (candleRef.current) {
      const t = clock.getElapsedTime();
      candleRef.current.intensity = 1.8 * (0.85 + 0.15 * Math.sin(t * 6.7));
    }
  });

  return (
    <group position={[0, 0, -6.15]}>
      <RoomShell width={6} depth={5} doorAxis="z" />

      {/* Lumières */}
      <ambientLight intensity={0.15} color="#3a2a10" />
      <pointLight ref={candleRef} position={[0, 2.5, 0]} color="#D4922A" intensity={1.8} distance={6} decay={2} castShadow />
      <pointLight position={[0, 1.2, -1.5]} color="#C4801A" intensity={0.8} distance={4} decay={2} />

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
        {/* Chandelier */}
        <mesh position={[0.45, 0.82, 0.15]}>
          <cylinderGeometry args={[0.02, 0.025, 0.12, 6]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} emissive="#FFB020" emissiveIntensity={0.8} />
        </mesh>
        <pointLight position={[0.45, 0.98, 0.15]} color="#FFB020" intensity={0.6} distance={2.5} decay={2} />
      </group>

      {/* Astrolabe décoratif */}
      <mesh position={[-1.8, 1.5, -0.8]} castShadow rotation={[0.3, 0.5, 0]}>
        <torusGeometry args={[0.22, 0.025, 8, 24]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.25} metalness={0.8} emissive="#D4AF37" emissiveIntensity={0.2} />
      </mesh>

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

// ── Le Salon ─────────────────────────────────────────────────
export function Salon({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  return (
    <group position={[0, 0, 6.15]}>
      <RoomShell width={6} depth={5} doorAxis="z" />

      <ambientLight intensity={0.18} color="#2a1a30" />
      <pointLight position={[0, 2.8, 0]} color="#C878D4" intensity={1.5} distance={6} decay={2} castShadow />
      <pointLight position={[1.5, 1.5, -1]} color="#D4AF37" intensity={0.9} distance={4} decay={2} />

      {/* Tapis */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.5, 3.5]} />
        <meshStandardMaterial color="#8B1A1A" roughness={0.9} />
      </mesh>

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
          emissiveIntensity={solved ? 0.7 : 0.3}
        />
      </mesh>

      {!solved && onPuzzleTap && (
        <mesh position={[0, 2.38, -2.3]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.18, 24]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Lanterne suspendue */}
      <mesh position={[0, 3.0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 6]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 2.65, 0]}>
        <dodecahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#D4AF37" transparent opacity={0.55} roughness={0.1} emissive="#D4AF37" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[0, 2.65, 0]} color="#C878D4" intensity={0.7} distance={3} decay={2} />
    </group>
  );
}

// ── La Cuisine ────────────────────────────────────────────────
export function Cuisine({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  return (
    <group position={[6.15, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <RoomShell width={6} depth={5} doorAxis="z" />

      <ambientLight intensity={0.2} color="#2a1a08" />
      <pointLight position={[0, 2.5, 0]} color="#E0780A" intensity={2.0} distance={7} decay={2} castShadow />

      {/* Sol carrelage terre cuite */}
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} />
        <meshStandardMaterial color="#B84A1A" roughness={0.85} />
      </mesh>

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

      {/* Jarre de miel (énigme) */}
      <group position={[1.2, 0, 0.5]}>
        <mesh castShadow onClick={onPuzzleTap}>
          <cylinderGeometry args={[0.22, 0.18, 0.55, 12]} />
          <meshStandardMaterial
            color={solved ? "#D4AF37" : "#C88A1A"}
            roughness={0.5}
            emissive={solved ? "#D4AF37" : "#A86A00"}
            emissiveIntensity={solved ? 0.7 : 0.4}
          />
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

      {/* Herbes suspendues */}
      {[[-1, 3.1, -1], [0.5, 3.1, 0.5], [-0.5, 3.0, 1]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.2, i * 0.8, 0.1]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 4]} />
          <meshStandardMaterial color={["#1A6B1A", "#2A8B2A", "#1A5B1A"][i]} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ── Le Hammam ─────────────────────────────────────────────────
function SteamParticles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 20;
  const positions = useRef(
    Float32Array.from({ length: count * 3 }, (_, i) => {
      if (i % 3 === 0) return (Math.random() - 0.5) * 1.6;
      if (i % 3 === 1) return Math.random() * 1.5;
      return (Math.random() - 0.5) * 1.6;
    })
  );

  useFrame(() => {
    const arr = ref.current?.geometry.attributes.position.array as Float32Array;
    if (!arr) return;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += 0.004;
      arr[i * 3]     += (Math.random() - 0.5) * 0.002;
      if (arr[i * 3 + 1] > 1.5) {
        arr[i * 3 + 1] = 0;
        arr[i * 3]     = (Math.random() - 0.5) * 1.4;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={[0, 0.3, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#AACCDD" size={0.06} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

export function Hammam({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  return (
    <group position={[-6.15, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <RoomShell width={6} depth={5} doorAxis="z" />

      <ambientLight intensity={0.22} color="#102030" />
      <pointLight position={[0, 2.8, 0]} color="#88BBDD" intensity={1.4} distance={7} decay={2} castShadow />

      {/* Sol marbre */}
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} />
        <meshStandardMaterial color="#DDD8CC" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Bassin central (énigme) */}
      <group position={[0, 0, -0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.9, 0.95, 0.3, 32]} />
          <meshStandardMaterial color="#E8E0D0" roughness={0.3} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.78, 32]} />
          <meshStandardMaterial color="#B0C8D8" roughness={0.05} metalness={0.2} transparent opacity={0.9} emissive="#8AB0C0" emissiveIntensity={0.2} />
        </mesh>
        <SteamParticles />

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

      {/* Petits bassins côtés */}
      {[[-1.8, 0.25, -1.5], [1.8, 0.25, -1.5]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[0.35, 0.38, 0.22, 16]} />
            <meshStandardMaterial color="#E0D8C8" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 16]} />
            <meshStandardMaterial color="#88AACC" transparent opacity={0.8} roughness={0.05} />
          </mesh>
        </group>
      ))}

      {/* Mosaïque au mur */}
      {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
        <mesh key={i} position={[x, 1.4, -2.38]}>
          <boxGeometry args={[0.5, 0.5, 0.04]} />
          <meshStandardMaterial
            color={["#1A6B8A", "#D4AF37", "#1A6B8A", "#D4AF37"][i]}
            roughness={0.3}
            emissive={["#1A6B8A", "#D4AF37", "#1A6B8A", "#D4AF37"][i]}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}
