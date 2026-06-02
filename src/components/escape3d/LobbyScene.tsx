"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { LobbyPlayer } from "@/hooks/useEscapeLobby";
import { SLOT_COLORS } from "@/hooks/useEscapeLobby";

// Slots : 2×2, face au centre
const SLOT_POSITIONS: [number, number, number][] = [
  [-2.2, 0, -1.8],  // 0 : arrière gauche
  [ 2.2, 0, -1.8],  // 1 : arrière droit
  [-2.2, 0,  1.8],  // 2 : avant gauche
  [ 2.2, 0,  1.8],  // 3 : avant droit
];

// ── Texture sol zellige ───────────────────────────────────────────────
function makeZelligeTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0A1A10";
  ctx.fillRect(0, 0, S, S);
  const tile = 32;
  for (let x = 0; x < S; x += tile) {
    for (let y = 0; y < S; y += tile) {
      // Carreau
      ctx.fillStyle = (((x + y) / tile) % 2 === 0) ? "#0D1F14" : "#091509";
      ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
      // Croix
      ctx.strokeStyle = "rgba(212,175,55,0.18)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x + tile / 2, y); ctx.lineTo(x + tile / 2, y + tile);
      ctx.moveTo(x, y + tile / 2); ctx.lineTo(x + tile, y + tile / 2);
      ctx.stroke();
      // Losange
      ctx.strokeStyle = "rgba(212,175,55,0.08)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x + tile / 2, y + 4);
      ctx.lineTo(x + tile - 4, y + tile / 2);
      ctx.lineTo(x + tile / 2, y + tile - 4);
      ctx.lineTo(x + 4, y + tile / 2);
      ctx.closePath();
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  return tex;
}

// ── Mini tapis flottant par slot ──────────────────────────────────────
function FloatingCarpet({ slot, occupied, yOffset }: { slot: number; occupied: boolean; yOffset: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const color = SLOT_COLORS[slot];
  const [r, g, b] = new THREE.Color(color).toArray();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = 0.35 + Math.sin(clock.getElapsedTime() * 1.4 + slot * 1.1) * 0.06 + yOffset;
    if (occupied) {
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.9 + slot) * 0.04;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.9, 0.6, 8, 8]} />
      <meshStandardMaterial
        color={occupied ? "#055C3F" : "#061A10"}
        emissive={new THREE.Color(r * 0.15, g * 0.15, b * 0.15)}
        opacity={occupied ? 1 : 0.3}
        transparent
        roughness={0.6}
        metalness={0.2}
      />
    </mesh>
  );
}

// ── Anneau de sol (halo de couleur) ──────────────────────────────────
function SlotRing({ color, occupied }: { color: string; occupied: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = occupied
      ? 0.55 + Math.sin(clock.getElapsedTime() * 2) * 0.15
      : 0.15;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
      <ringGeometry args={[0.52, 0.72, 48]} />
      <meshStandardMaterial
        color={color} emissive={color} emissiveIntensity={0.4}
        opacity={0.15} transparent
      />
    </mesh>
  );
}

// ── Bougie ────────────────────────────────────────────────────────────
function Candle({ position }: { position: [number, number, number] }) {
  const flameRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flicker = 0.7 + Math.sin(t * 7.3 + position[0]) * 0.15 + Math.cos(t * 4.1 + position[2]) * 0.1;
    if (flameRef.current) flameRef.current.scale.setScalar(flicker);
    if (lightRef.current) lightRef.current.intensity = 0.9 * flicker;
  });

  return (
    <group position={position}>
      {/* Corps */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
        <meshStandardMaterial color="#D4B87A" />
      </mesh>
      {/* Flamme */}
      <mesh ref={flameRef} position={[0, 0.26, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#FFB347" emissive="#FF8030" emissiveIntensity={2} />
      </mesh>
      <pointLight ref={lightRef} color="#FF8030" intensity={0.9} distance={3} decay={2} position={[0, 0.26, 0]} />
    </group>
  );
}

// ── Grande porte du fond ──────────────────────────────────────────────
function LobbyDoor({ open }: { open: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (!ref.current) return;
    const target = open ? -Math.PI / 2 : 0;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, target, 0.04);
  });

  return (
    <group position={[0, 0, -4.8]}>
      {/* Encadrement */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[2.4, 3.2, 0.12]} />
        <meshStandardMaterial color="#1A0A02" roughness={0.9} />
      </mesh>
      {/* Arche */}
      <mesh position={[0, 3.0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.12, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#1A0A02" roughness={0.9} />
      </mesh>
      {/* Panneau de porte (pivot sur le bord gauche) */}
      <group ref={ref} position={[-1.1, 0, 0]}>
        <mesh position={[1.1, 1.4, 0]}>
          <boxGeometry args={[2.2, 2.8, 0.08]} />
          <meshStandardMaterial color="#2A1004" roughness={0.85} metalness={0.05} />
        </mesh>
        {/* Poignée */}
        <mesh position={[1.9, 1.4, 0.06]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Ornement */}
        <mesh position={[1.1, 1.4, 0.05]}>
          <torusGeometry args={[0.5, 0.015, 8, 32]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} emissive="#D4AF37" emissiveIntensity={0.15} />
        </mesh>
      </group>
      {/* Lumière de l'autre côté de la porte */}
      {open && <pointLight color="#D4AF37" intensity={2} distance={8} decay={2} position={[0, 1.5, -1]} />}
    </group>
  );
}

// ── Scène principale ──────────────────────────────────────────────────
export default function LobbyScene({ players, countdown }: {
  players:   LobbyPlayer[];
  countdown: number | null;
}) {
  const zelligeTex = useMemo(() => typeof window !== "undefined" ? makeZelligeTexture() : null, []);
  const doorOpen = countdown !== null && countdown <= 0;

  const playerBySlot = (slot: number) => players.find(p => p.slot === slot) ?? null;

  return (
    <>
      {/* Ambiance */}
      <color attach="background" args={["#030C06"]} />
      <fog attach="fog" args={["#030C06", 8, 20]} />
      <ambientLight intensity={0.35} color="#0A1A0F" />
      <hemisphereLight args={[0x1A2744, 0x061A12, 0.5]} />
      {/* Lune — fenêtre imaginaire */}
      <directionalLight color="#2A4A7F" intensity={0.6} position={[3, 6, -2]} />

      {/* Sol zellige */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial map={zelligeTex} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Murs */}
      {([
        { pos: [0, 2, -5] as [number,number,number],  rot: [0, 0, 0] as [number,number,number], w: 12 },
        { pos: [0, 2,  5] as [number,number,number],  rot: [0, Math.PI, 0] as [number,number,number], w: 12 },
        { pos: [-5, 2, 0] as [number,number,number],  rot: [0, Math.PI / 2, 0] as [number,number,number], w: 10 },
        { pos: [ 5, 2, 0] as [number,number,number],  rot: [0, -Math.PI / 2, 0] as [number,number,number], w: 10 },
      ]).map((wall, i) => (
        <mesh key={i} position={wall.pos} rotation={wall.rot} receiveShadow>
          <planeGeometry args={[wall.w, 4]} />
          <meshStandardMaterial color="#0D1A0F" roughness={0.95} />
        </mesh>
      ))}

      {/* Bougies aux angles */}
      <Candle position={[-4.2, 0, -4.2]} />
      <Candle position={[ 4.2, 0, -4.2]} />
      <Candle position={[-4.2, 0,  4.2]} />
      <Candle position={[ 4.2, 0,  4.2]} />
      {/* Bougies au-dessus des arches murales */}
      <Candle position={[-4.2, 1.8, 0]} />
      <Candle position={[ 4.2, 1.8, 0]} />

      {/* Lanterne centrale suspendue */}
      <group position={[0, 3.2, 0]}>
        <mesh>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#2A1A06" metalness={0.6} roughness={0.4} />
        </mesh>
        <pointLight color="#D4AF37" intensity={0.6} distance={6} decay={2} />
      </group>

      {/* Grande porte */}
      <LobbyDoor open={doorOpen} />

      {/* 4 emplacements joueurs */}
      {SLOT_POSITIONS.map((pos, slot) => {
        const player = playerBySlot(slot);
        const occupied = player !== null;
        const color = SLOT_COLORS[slot];

        return (
          <group key={slot} position={pos}>
            {/* Halo de sol */}
            <SlotRing color={color} occupied={occupied} />

            {/* Tapis flottant */}
            <FloatingCarpet slot={slot} occupied={occupied} yOffset={0} />

            {/* Lumière de couleur sous le tapis */}
            {occupied && (
              <pointLight color={color} intensity={0.4} distance={2.5} decay={2} position={[0, 0.2, 0]} />
            )}

            {/* Étiquette joueur */}
            <Html
              position={[0, 1.1, 0]}
              center
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              <div style={{
                textAlign: "center",
                whiteSpace: "nowrap",
                background: "rgba(4,8,4,0.75)",
                border: `1px solid ${occupied ? color : "rgba(255,255,255,0.08)"}`,
                borderRadius: 12, padding: "4px 10px",
                backdropFilter: "blur(4px)",
              }}>
                <p style={{
                  color: occupied ? "#F8F4EC" : "rgba(255,255,255,0.22)",
                  fontSize: 11, fontWeight: 700, margin: 0,
                  fontFamily: "var(--font-bricolage)",
                }}>
                  {occupied ? player!.name : "En attente…"}
                </p>
                {occupied && player!.ready && (
                  <p style={{ color: "#22c55e", fontSize: 9, margin: "2px 0 0", fontFamily: "var(--font-dm-sans)", letterSpacing: "0.1em" }}>
                    ✓ PRÊT
                  </p>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}
