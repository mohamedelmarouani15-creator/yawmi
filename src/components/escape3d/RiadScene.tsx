"use client";

import { useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, ContactShadows, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import Courtyard from "./Courtyard";
import { Library, Salon, Cuisine, Hammam } from "./RiadRoom";
import PlayerAvatar from "./PlayerAvatar";
import VirtualJoystick from "./VirtualJoystick";
import PuzzleModal from "./PuzzleModal";
import { getPuzzleById } from "@/lib/escape3d/puzzles";
import { PLAYER_COLORS } from "@/lib/escape3d/types";
import { isWalkable, getRoom, ROOM_NAMES } from "@/lib/escape3d/bounds";

// ─────────────────────────────────────────────────────────────────
// Caméra fixe par pièce — comme dans les vrais escape games
// ─────────────────────────────────────────────────────────────────
const ROOM_CAMERAS: Record<string, {
  offset: [number, number, number]; // position caméra relative au joueur
  right:  [number, number];         // direction "droite" sur l'écran → [dx, dz]
  fwd:    [number, number];         // direction "avant" sur l'écran → [dx, dz]
}> = {
  courtyard: { offset: [0, 7, 5],   right: [1, 0],  fwd: [0, -1] },
  library:   { offset: [0, 3, 4],   right: [1, 0],  fwd: [0, -1] },
  salon:     { offset: [0, 3, -4],  right: [-1, 0], fwd: [0,  1] },
  cuisine:   { offset: [-4, 3, 0],  right: [0, -1], fwd: [1,  0] },
  hammam:    { offset: [4, 3, 0],   right: [0,  1], fwd: [-1, 0] },
};

const SPEED = 2.8;

function Controller({ moveStick, onUpdate, roomRef }: {
  moveStick: React.RefObject<{ x: number; y: number }>;
  onUpdate:  (pos: [number, number, number], yaw: number) => void;
  roomRef:   React.RefObject<string>;
}) {
  const pos    = useRef(new THREE.Vector3(0, 0, 1.5));
  const camPos = useRef(new THREE.Vector3(0, 7, 6.5));
  const camTgt = useRef(new THREE.Vector3(0, 0, 1.5));
  const yaw    = useRef(0);

  // On stocke la caméra dans une ref pour l'utiliser dans useFrame
  const cameraRef = useRef<THREE.Camera | null>(null);

  useFrame(({ camera }, dt) => {
    cameraRef.current = camera;
    const room  = roomRef.current ?? "courtyard";
    const cfg   = ROOM_CAMERAS[room] ?? ROOM_CAMERAS.courtyard;
    const mx    = moveStick.current?.x ?? 0;
    const my    = moveStick.current?.y ?? 0;
    const len   = Math.sqrt(mx * mx + my * my);

    // ── Mouvement — axes fixes par pièce, jamais de confusion ──
    if (len > 0.04) {
      const spd = SPEED * dt;
      const [rx, rz] = cfg.right;
      const [fx, fz] = cfg.fwd;
      const dx = (rx * mx + fx * my) * spd;
      const dz = (rz * mx + fz * my) * spd;

      const nx = pos.current.x + dx;
      const nz = pos.current.z + dz;

      if      (isWalkable(nx, nz))            { pos.current.x = nx; pos.current.z = nz; }
      else if (isWalkable(nx, pos.current.z)) { pos.current.x = nx; }
      else if (isWalkable(pos.current.x, nz)) { pos.current.z = nz; }

      // Orientation avatar vers la direction de déplacement
      if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
        yaw.current = Math.atan2(-dx, -dz);
      }
    }

    // ── Caméra fixe — suit le joueur avec lerp doux ────────────
    const [ox, oy, oz] = cfg.offset;
    const targetPos = new THREE.Vector3(
      pos.current.x + ox,
      pos.current.y + oy,
      pos.current.z + oz,
    );
    camPos.current.lerp(targetPos, 1 - Math.pow(0.002, dt));
    camera.position.copy(camPos.current);

    // Caméra regarde un point légèrement au-dessus du joueur
    camTgt.current.lerp(
      new THREE.Vector3(pos.current.x, pos.current.y + 0.5, pos.current.z),
      1 - Math.pow(0.002, dt),
    );
    camera.lookAt(camTgt.current);

    onUpdate([pos.current.x, 0, pos.current.z], yaw.current);
  });

  return null;
}

function LanternParticles({ position }: { position: [number, number, number] }) {
  const ref   = useRef<THREE.Points>(null!);
  const count = 8;
  const buf   = useRef(Float32Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 0.35));
  const spd   = useRef(Array.from({ length: count }, () => 0.003 + Math.random() * 0.003));

  useFrame(() => {
    const a = ref.current?.geometry.attributes.position.array as Float32Array;
    if (!a) return;
    for (let i = 0; i < count; i++) {
      a[i * 3 + 1] += spd.current[i];
      if (a[i * 3 + 1] > 1.2) {
        a[i * 3 + 1] = 0;
        a[i * 3]     = (Math.random() - 0.5) * 0.3;
        a[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={[position[0], position[1] + 1.72, position[2]]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buf.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FFD080" size={0.028} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

export default function RiadScene() {
  const [playerPos, setPos] = useState<[number, number, number]>([0, 0, 1.5]);
  const [playerYaw, setYaw] = useState(0);
  const [puzzle, setPuzzle]  = useState<string | null>(null);
  const [solved, setSolved]  = useState<Record<string, boolean>>({});
  const [roomLabel, setRoom] = useState("Cour centrale");

  const moveStick = useRef({ x: 0, y: 0 });
  const roomRef   = useRef("courtyard");

  const onMove = useCallback((v: { x: number; y: number }) => { moveStick.current = v; }, []);

  const onUpdate = useCallback((pos: [number, number, number], yaw: number) => {
    setPos(pos); setYaw(yaw);
    const r = getRoom(pos[0], pos[2]);
    if (r !== roomRef.current) {
      roomRef.current = r;
      setRoom(ROOM_NAMES[r]);
    }
  }, []);

  const solve = (ok: boolean) => {
    if (puzzle && ok) setSolved(s => ({ ...s, [puzzle]: true }));
    setPuzzle(null);
  };

  const pDef   = puzzle ? getPuzzleById(puzzle) : null;
  const allDone = ["lantern_bismillah","library_iqra","salon_sabr","cuisine_honey","hammam_taharah"]
    .every(id => solved[id]);

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.78) 100%)" }} />

      <Canvas
        shadows="soft"
        camera={{ position: [0, 7, 6.5], fov: 55, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: false, alpha: false, stencil: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={["#040608"]} />
        <fog attach="fog" args={["#040608", 12, 38]} />
        <Stars radius={32} depth={12} count={1200} factor={3} saturation={0.4} fade speed={0.4} />

        <Courtyard  onLanternTap={() => setPuzzle("lantern_bismillah")} puzzleSolved={solved["lantern_bismillah"]} />
        <Library    onPuzzleTap={() => setPuzzle("library_iqra")}       solved={solved["library_iqra"]} />
        <Salon      onPuzzleTap={() => setPuzzle("salon_sabr")}         solved={solved["salon_sabr"]} />
        <Cuisine    onPuzzleTap={() => setPuzzle("cuisine_honey")}      solved={solved["cuisine_honey"]} />
        <Hammam     onPuzzleTap={() => setPuzzle("hammam_taharah")}     solved={solved["hammam_taharah"]} />

        <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={14} blur={2.5} far={5} />

        {([[2.6,0,2.6],[-2.6,0,2.6],[2.6,0,-2.6],[-2.6,0,-2.6]] as [number,number,number][]).map((p,i) => (
          <LanternParticles key={i} position={p} />
        ))}

        <Float speed={1.2} rotationIntensity={0} floatIntensity={0.06}>
          <PlayerAvatar position={playerPos} rotation={playerYaw} color={PLAYER_COLORS[0]} isLocal />
        </Float>

        <Controller moveStick={moveStick} onUpdate={onUpdate} roomRef={roomRef} />

        <Suspense fallback={null}>
          <EffectComposer multisampling={4}>
            <Bloom intensity={1.8} luminanceThreshold={0.25} luminanceSmoothing={0.6} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Joystick — seul contrôle */}
      <div style={{ position: "absolute", bottom: 28, left: 24, zIndex: 10 }}>
        <VirtualJoystick onChange={onMove} />
      </div>

      {/* HUD */}
      <p style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 10, pointerEvents: "none", color: "#D4AF37", opacity: 0.65, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap" }}>
        {roomLabel}
      </p>
      <div style={{ position: "absolute", top: 18, right: 18, zIndex: 10, display: "flex", gap: 6 }}>
        {["lantern_bismillah","library_iqra","salon_sabr","cuisine_honey","hammam_taharah"].map(id => (
          <div key={id} style={{ width: 7, height: 7, borderRadius: "50%", background: solved[id] ? "#05C36F" : "rgba(212,175,55,0.28)", boxShadow: solved[id] ? "0 0 6px #05C36F" : "none", transition: "all 0.4s" }} />
        ))}
      </div>

      {allDone && (
        <div style={{ position: "absolute", bottom: 120, left: 16, right: 16, zIndex: 10, background: "rgba(5,92,63,0.96)", border: "1px solid rgba(5,195,111,0.55)", borderRadius: 20, padding: "18px 24px", textAlign: "center", backdropFilter: "blur(12px)" }}>
          <p style={{ color: "#D4AF37", fontSize: 16, fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>🌙 Le riad a livré tous ses secrets</p>
          <p style={{ color: "#F8F4EC", fontSize: 12, opacity: 0.7, marginTop: 5, fontFamily: "var(--font-dm-sans)" }}>5 énigmes résolues — la famille s'échappe</p>
        </div>
      )}

      {pDef && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <PuzzleModal puzzle={pDef} onSolve={solve} onClose={() => setPuzzle(null)} />
        </div>
      )}
    </div>
  );
}
