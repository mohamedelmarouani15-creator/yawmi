"use client";

import { useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, ContactShadows, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import Courtyard from "./Courtyard";
import { Library, Salon, Cuisine, Hammam } from "./RiadRoom";
import PlayerAvatar from "./PlayerAvatar";
import VirtualJoystick from "./VirtualJoystick";
import LookZone from "./LookZone";
import PuzzleModal from "./PuzzleModal";
import { getPuzzleById } from "@/lib/escape3d/puzzles";
import { PLAYER_COLORS } from "@/lib/escape3d/types";
import { isWalkable, getRoom, ROOM_NAMES } from "@/lib/escape3d/bounds";

const SPEED = 3.5;

// Azimuth caméra à l'entrée de chaque pièce
const AUTO_AZ: Record<string, number> = {
  courtyard: Math.PI,
  library:   0,
  salon:     Math.PI,
  cuisine:  -Math.PI / 2,
  hammam:    Math.PI / 2,
};

function Scene({ moveStick, lookDelta, onPosRot, currentRoom }: {
  moveStick:   React.RefObject<{ x: number; y: number }>;
  lookDelta:   React.RefObject<{ dx: number; dy: number }>;
  onPosRot:    (pos: [number, number, number], rot: number) => void;
  currentRoom: React.RefObject<string>;
}) {
  const { camera } = useThree();

  // État de la caméra
  const az       = useRef(Math.PI);   // angle horizontal
  const el       = useRef(0.50);      // angle vertical (élévation)
  const dist     = useRef(5.5);       // distance caméra-joueur
  const playerXZ = useRef(new THREE.Vector3(0, 0, 1.5));
  const camPos   = useRef(new THREE.Vector3(0, 3, 5.5));
  const prevRoom = useRef("courtyard");

  useFrame((_, dt) => {
    const room = currentRoom.current;

    // ── 1. Auto-orient doux à l'entrée d'une pièce ─────────
    if (room !== prevRoom.current) {
      prevRoom.current = room;
    }
    const targetAz = AUTO_AZ[room] ?? Math.PI;
    const isDragging = Math.abs(lookDelta.current.dx) > 0.0005
                    || Math.abs(lookDelta.current.dy) > 0.0005;

    if (!isDragging) {
      let diff = targetAz - az.current;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      az.current += diff * Math.min(dt * 4, 1);
      el.current += (0.45 - el.current) * Math.min(dt * 4, 1);
    }

    // ── 2. Rotation manuelle (drag droite) ──────────────────
    az.current += lookDelta.current.dx * 2.2;
    el.current  = THREE.MathUtils.clamp(
      el.current - lookDelta.current.dy * 2.2,
      0.10, 1.15,
    );
    lookDelta.current.dx = 0;
    lookDelta.current.dy = 0;

    // ── 3. Position caméra orbitale ─────────────────────────
    const cosE = Math.cos(el.current);
    const sinE = Math.sin(el.current);
    const d    = dist.current;
    const cx   = playerXZ.current.x + Math.sin(az.current) * d * cosE;
    const cy   = playerXZ.current.y + d * sinE;
    const cz   = playerXZ.current.z + Math.cos(az.current) * d * cosE;
    camPos.current.lerp(new THREE.Vector3(cx, cy, cz), 1 - Math.pow(0.003, dt));
    camera.position.copy(camPos.current);
    camera.lookAt(playerXZ.current.x, playerXZ.current.y + 0.8, playerXZ.current.z);

    // ── 4. Mouvement — vecteurs extraits de la caméra ────────
    // Principe : joystick Y↑ = avance vers le fond de l'écran
    //            joystick X → droite = va à droite sur l'écran
    const mx  = moveStick.current?.x ?? 0;
    const my  = moveStick.current?.y ?? 0;
    const len = Math.sqrt(mx * mx + my * my);

    if (len > 0.05) {
      // Vecteur forward = de la caméra vers le joueur, projeté sur XZ
      const fwd = new THREE.Vector3(
        playerXZ.current.x - camera.position.x,
        0,
        playerXZ.current.z - camera.position.z,
      ).normalize();

      // Vecteur right = perpendiculaire à fwd en XZ, orienté vers la droite
      // right = fwd tourné de -90° autour de Y
      const rgt = new THREE.Vector3(fwd.z, 0, -fwd.x);

      const spd = SPEED * dt;
      const nx  = playerXZ.current.x + fwd.x * my * spd + rgt.x * mx * spd;
      const nz  = playerXZ.current.z + fwd.z * my * spd + rgt.z * mx * spd;

      if (isWalkable(nx, playerXZ.current.z)) playerXZ.current.x = nx;
      if (isWalkable(playerXZ.current.x, nz)) playerXZ.current.z = nz;
    }

    // ── 5. Avatar — face dans la direction du mouvement ─────
    const faceAngle = len > 0.05
      ? Math.atan2(mx, my) - az.current + Math.PI
      : 0;

    onPosRot(
      [playerXZ.current.x, 0, playerXZ.current.z],
      faceAngle,
    );
  });

  return null;
}

// Particules lanternes
function LanternParticles({ position }: { position: [number, number, number] }) {
  const ref   = useRef<THREE.Points>(null!);
  const count = 10;
  const pos   = useRef(Float32Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 0.5));
  const spd   = useRef(Array.from({ length: count }, () => 0.25 + Math.random() * 0.3));

  useFrame(() => {
    const arr = ref.current?.geometry.attributes.position.array as Float32Array;
    if (!arr) return;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += spd.current[i] * 0.006;
      if (arr[i * 3 + 1] > 1.4) {
        arr[i * 3 + 1] = 0;
        arr[i * 3]     = (Math.random() - 0.5) * 0.4;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={[position[0], position[1] + 1.7, position[2]]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FFD080" size={0.032} transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

export default function RiadScene() {
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 1.5]);
  const [playerRot, setPlayerRot] = useState(0);
  const [activePuzzleId, setActive] = useState<string | null>(null);
  const [solved, setSolved]         = useState<Record<string, boolean>>({});
  const [roomLabel, setRoomLabel]   = useState("Cour centrale");

  const moveStick  = useRef({ x: 0, y: 0 });
  const lookDelta  = useRef({ dx: 0, dy: 0 });
  const currentRoom = useRef("courtyard");

  const onMove = useCallback((v: { x: number; y: number }) => { moveStick.current = v; }, []);
  const onLook = useCallback((dx: number, dy: number) => {
    lookDelta.current.dx += dx;
    lookDelta.current.dy += dy;
  }, []);

  const onPosRot = useCallback((pos: [number, number, number], rot: number) => {
    setPlayerPos(pos);
    setPlayerRot(rot);
    const room = getRoom(pos[0], pos[2]);
    if (room !== currentRoom.current) {
      currentRoom.current = room;
      setRoomLabel(ROOM_NAMES[room]);
    }
  }, []);

  const puzzle = activePuzzleId ? getPuzzleById(activePuzzleId) : null;
  const handleSolve = (correct: boolean) => {
    if (activePuzzleId && correct) setSolved(s => ({ ...s, [activePuzzleId]: true }));
    setActive(null);
  };

  const allSolved = ["lantern_bismillah","library_iqra","salon_sabr","cuisine_honey","hammam_taharah"]
    .every(id => solved[id]);

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>
      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.82) 100%)" }} />

      <Canvas
        shadows="soft"
        camera={{ position: [0, 3, 5.5], fov: 60, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: false, alpha: false, stencil: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={["#040608"]} />
        <fog attach="fog" args={["#040608", 10, 36]} />
        <Stars radius={32} depth={12} count={1200} factor={3} saturation={0.4} fade speed={0.4} />

        <Courtyard
          onLanternTap={() => setActive("lantern_bismillah")}
          puzzleSolved={solved["lantern_bismillah"]}
        />
        <Library  onPuzzleTap={() => setActive("library_iqra")}   solved={solved["library_iqra"]} />
        <Salon    onPuzzleTap={() => setActive("salon_sabr")}      solved={solved["salon_sabr"]} />
        <Cuisine  onPuzzleTap={() => setActive("cuisine_honey")}   solved={solved["cuisine_honey"]} />
        <Hammam   onPuzzleTap={() => setActive("hammam_taharah")}  solved={solved["hammam_taharah"]} />

        <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={12} blur={2.5} far={4} />

        {([[2.6,0,2.6],[-2.6,0,2.6],[2.6,0,-2.6],[-2.6,0,-2.6]] as [number,number,number][]).map((p,i) => (
          <LanternParticles key={i} position={p} />
        ))}

        <Float speed={1.2} rotationIntensity={0} floatIntensity={0.07}>
          <PlayerAvatar position={playerPos} rotation={playerRot} color={PLAYER_COLORS[0]} isLocal />
        </Float>

        <Scene moveStick={moveStick} lookDelta={lookDelta} onPosRot={onPosRot} currentRoom={currentRoom} />

        <Suspense fallback={null}>
          <EffectComposer multisampling={4}>
            <Bloom intensity={1.8} luminanceThreshold={0.25} luminanceSmoothing={0.6} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Joystick gauche */}
      <div style={{ position: "absolute", bottom: 28, left: 24, zIndex: 10 }}>
        <VirtualJoystick onChange={onMove} />
      </div>

      {/* Zone drag droite */}
      <LookZone onChange={onLook} />

      {/* HUD — nom de la pièce */}
      <p style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 10, pointerEvents: "none", color: "#D4AF37", opacity: 0.65, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap" }}>
        {roomLabel}
      </p>

      {/* 5 points de progression */}
      <div style={{ position: "absolute", top: 18, right: 18, zIndex: 10, display: "flex", gap: 6 }}>
        {["lantern_bismillah","library_iqra","salon_sabr","cuisine_honey","hammam_taharah"].map(id => (
          <div key={id} style={{ width: 7, height: 7, borderRadius: "50%", background: solved[id] ? "#05C36F" : "rgba(212,175,55,0.3)", boxShadow: solved[id] ? "0 0 6px #05C36F" : "none", transition: "all 0.4s" }} />
        ))}
      </div>

      {/* Victoire */}
      {allSolved && (
        <div style={{ position: "absolute", bottom: 155, left: 16, right: 16, zIndex: 10, background: "rgba(5,92,63,0.96)", border: "1px solid rgba(5,195,111,0.55)", borderRadius: 20, padding: "18px 24px", textAlign: "center", backdropFilter: "blur(12px)" }}>
          <p style={{ color: "#D4AF37", fontSize: 16, fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>🌙 Le riad a livré tous ses secrets</p>
          <p style={{ color: "#F8F4EC", fontSize: 12, opacity: 0.7, marginTop: 5, fontFamily: "var(--font-dm-sans)" }}>5 énigmes résolues — la famille s'échappe ensemble</p>
        </div>
      )}

      {/* Puzzle modal */}
      {puzzle && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <PuzzleModal puzzle={puzzle} onSolve={handleSolve} onClose={() => setActive(null)} />
        </div>
      )}
    </div>
  );
}
