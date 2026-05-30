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

// ─── Constantes ────────────────────────────────────────────────
const SPEED      = 3.0;   // unités/seconde
const TURN_SPEED = 2.2;   // rad/seconde (joystick gauche X)
const CAM_DIST   = 5.2;   // distance caméra-joueur
const CAM_SENS   = 0.55;  // sensibilité drag droit

// Orientation du joueur à l'entrée de chaque pièce
// yaw=0 → joueur face au nord (-Z), caméra au sud
const ROOM_YAW: Record<string, number> = {
  courtyard: 0,
  library:   0,
  salon:     Math.PI,
  cuisine:  -Math.PI / 2,
  hammam:    Math.PI / 2,
};

// ─── Contrôleur ────────────────────────────────────────────────
function Controller({ moveStick, lookDelta, onUpdate, roomRef }: {
  moveStick: React.RefObject<{ x: number; y: number }>;
  lookDelta: React.RefObject<{ dx: number; dy: number }>;
  onUpdate:  (pos: [number, number, number], yaw: number) => void;
  roomRef:   React.RefObject<string>;
}) {
  const { camera } = useThree();

  const pos    = useRef(new THREE.Vector3(0, 0, 1.5));
  const yaw    = useRef(0);       // rotation joueur (rad)
  const elev   = useRef(0.45);    // élévation caméra (rad)
  const camPos = useRef(new THREE.Vector3(0, 2.8, 5.2));
  const prevRoom = useRef("courtyard");
  const autoYaw  = useRef<number | null>(null);

  useFrame((_, dt) => {
    const room = roomRef.current;

    // ── Auto-orient à l'entrée d'une pièce ───────────────────
    if (room !== prevRoom.current) {
      prevRoom.current = room;
      autoYaw.current  = ROOM_YAW[room] ?? 0;
    }
    if (autoYaw.current !== null) {
      let diff = autoYaw.current - yaw.current;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      yaw.current += diff * Math.min(dt * 5, 1);
      if (Math.abs(diff) < 0.01) autoYaw.current = null;
    }

    // ── Input joystick gauche ─────────────────────────────────
    const mx = moveStick.current?.x ?? 0;
    const my = moveStick.current?.y ?? 0;

    // X = tourner le joueur (+ caméra suit)
    if (Math.abs(mx) > 0.04) {
      yaw.current -= mx * TURN_SPEED * dt;
      autoYaw.current = null; // l'utilisateur contrôle
    }

    // Y = avancer/reculer dans la direction qu'on regarde
    if (Math.abs(my) > 0.04) {
      const spd = SPEED * dt;
      // Direction de déplacement : celle vers laquelle le joueur fait face
      const dx = -Math.sin(yaw.current) * my * spd;
      const dz = -Math.cos(yaw.current) * my * spd;

      const nx = pos.current.x + dx;
      const nz = pos.current.z + dz;

      // Collision — essaie d'abord le mouvement complet, puis glisse
      if      (isWalkable(nx, nz))             { pos.current.x = nx; pos.current.z = nz; }
      else if (isWalkable(nx, pos.current.z))  { pos.current.x = nx; }
      else if (isWalkable(pos.current.x, nz))  { pos.current.z = nz; }
    }

    // ── Input drag droit ──────────────────────────────────────
    if (Math.abs(lookDelta.current.dx) > 0.0001) {
      yaw.current -= lookDelta.current.dx * CAM_SENS;
      autoYaw.current = null;
      lookDelta.current.dx *= 0.15;
    }
    if (Math.abs(lookDelta.current.dy) > 0.0001) {
      elev.current = THREE.MathUtils.clamp(
        elev.current - lookDelta.current.dy * CAM_SENS,
        0.10, 1.05,
      );
      lookDelta.current.dy *= 0.15;
    }

    // ── Position caméra (toujours derrière le joueur) ─────────
    const cosE = Math.cos(elev.current);
    const sinE = Math.sin(elev.current);
    const targetCam = new THREE.Vector3(
      pos.current.x + Math.sin(yaw.current) * CAM_DIST * cosE,
      pos.current.y + CAM_DIST * sinE,
      pos.current.z + Math.cos(yaw.current) * CAM_DIST * cosE,
    );
    // Lerp caméra pour fluidité
    camPos.current.lerp(targetCam, 1 - Math.pow(0.003, dt));
    camera.position.copy(camPos.current);
    camera.lookAt(pos.current.x, pos.current.y + 0.85, pos.current.z);

    onUpdate([pos.current.x, 0, pos.current.z], yaw.current);
  });

  return null;
}

// ─── Particules lanternes ──────────────────────────────────────
function LanternParticles({ position }: { position: [number, number, number] }) {
  const ref   = useRef<THREE.Points>(null!);
  const count = 10;
  const buf   = useRef(Float32Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 0.4));
  const spd   = useRef(Array.from({ length: count }, () => 0.003 + Math.random() * 0.003));

  useFrame(() => {
    const a = ref.current?.geometry.attributes.position.array as Float32Array;
    if (!a) return;
    for (let i = 0; i < count; i++) {
      a[i * 3 + 1] += spd.current[i];
      if (a[i * 3 + 1] > 1.3) {
        a[i * 3 + 1] = 0;
        a[i * 3]     = (Math.random() - 0.5) * 0.35;
        a[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={[position[0], position[1] + 1.72, position[2]]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buf.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FFD080" size={0.030} transparent opacity={0.60} sizeAttenuation />
    </points>
  );
}

// ─── Composant principal ───────────────────────────────────────
export default function RiadScene() {
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 1.5]);
  const [playerYaw, setPlayerYaw] = useState(0);
  const [activePuzzle, setActive]  = useState<string | null>(null);
  const [solved, setSolved]        = useState<Record<string, boolean>>({});
  const [roomLabel, setRoomLabel]  = useState("Cour centrale");

  const moveStick  = useRef({ x: 0, y: 0 });
  const lookDelta  = useRef({ dx: 0, dy: 0 });
  const roomRef    = useRef("courtyard");

  const onMove = useCallback((v: { x: number; y: number }) => { moveStick.current = v; }, []);
  const onLook = useCallback((dx: number, dy: number) => {
    lookDelta.current.dx += dx;
    lookDelta.current.dy += dy;
  }, []);

  const onUpdate = useCallback((pos: [number, number, number], yaw: number) => {
    setPlayerPos(pos);
    setPlayerYaw(yaw);
    const room = getRoom(pos[0], pos[2]);
    if (room !== roomRef.current) {
      roomRef.current = room;
      setRoomLabel(ROOM_NAMES[room]);
    }
  }, []);

  const puzzle = activePuzzle ? getPuzzleById(activePuzzle) : null;
  const solve  = (ok: boolean) => {
    if (activePuzzle && ok) setSolved(s => ({ ...s, [activePuzzle]: true }));
    setActive(null);
  };
  const allDone = ["lantern_bismillah","library_iqra","salon_sabr","cuisine_honey","hammam_taharah"].every(id => solved[id]);

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>
      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.82) 100%)" }} />

      <Canvas
        shadows="soft"
        camera={{ position: [0, 2.8, 5.2], fov: 60, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: false, alpha: false, stencil: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={["#040608"]} />
        <fog attach="fog" args={["#040608", 10, 36]} />
        <Stars radius={32} depth={12} count={1200} factor={3} saturation={0.4} fade speed={0.4} />

        <Courtyard  onLanternTap={() => setActive("lantern_bismillah")} puzzleSolved={solved["lantern_bismillah"]} />
        <Library    onPuzzleTap={() => setActive("library_iqra")}       solved={solved["library_iqra"]} />
        <Salon      onPuzzleTap={() => setActive("salon_sabr")}         solved={solved["salon_sabr"]} />
        <Cuisine    onPuzzleTap={() => setActive("cuisine_honey")}      solved={solved["cuisine_honey"]} />
        <Hammam     onPuzzleTap={() => setActive("hammam_taharah")}     solved={solved["hammam_taharah"]} />

        <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={12} blur={2.5} far={4} />

        {([[2.6,0,2.6],[-2.6,0,2.6],[2.6,0,-2.6],[-2.6,0,-2.6]] as [number,number,number][]).map((p,i) => (
          <LanternParticles key={i} position={p} />
        ))}

        <Float speed={1.2} rotationIntensity={0} floatIntensity={0.07}>
          <PlayerAvatar position={playerPos} rotation={playerYaw} color={PLAYER_COLORS[0]} isLocal />
        </Float>

        <Controller
          moveStick={moveStick}
          lookDelta={lookDelta}
          onUpdate={onUpdate}
          roomRef={roomRef}
        />

        <Suspense fallback={null}>
          <EffectComposer multisampling={4}>
            <Bloom intensity={1.8} luminanceThreshold={0.25} luminanceSmoothing={0.6} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Joystick gauche */}
      <div style={{ position: "absolute", bottom: 28, left: 24, zIndex: 10 }}>
        <p style={{ textAlign: "center", marginBottom: 4, fontSize: 8, color: "#D4AF37", opacity: 0.4, letterSpacing: "0.12em", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase" }}>
          ↑ avance · ← → tourne
        </p>
        <VirtualJoystick onChange={onMove} />
      </div>

      {/* Zone drag droite */}
      <LookZone onChange={onLook} />

      {/* HUD */}
      <p style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 10, pointerEvents: "none", color: "#D4AF37", opacity: 0.65, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap" }}>
        {roomLabel}
      </p>
      <div style={{ position: "absolute", top: 18, right: 18, zIndex: 10, display: "flex", gap: 6 }}>
        {["lantern_bismillah","library_iqra","salon_sabr","cuisine_honey","hammam_taharah"].map(id => (
          <div key={id} style={{ width: 7, height: 7, borderRadius: "50%", background: solved[id] ? "#05C36F" : "rgba(212,175,55,0.3)", boxShadow: solved[id] ? "0 0 6px #05C36F" : "none", transition: "all 0.4s" }} />
        ))}
      </div>

      {allDone && (
        <div style={{ position: "absolute", bottom: 155, left: 16, right: 16, zIndex: 10, background: "rgba(5,92,63,0.96)", border: "1px solid rgba(5,195,111,0.55)", borderRadius: 20, padding: "18px 24px", textAlign: "center", backdropFilter: "blur(12px)" }}>
          <p style={{ color: "#D4AF37", fontSize: 16, fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>🌙 Le riad a livré tous ses secrets</p>
          <p style={{ color: "#F8F4EC", fontSize: 12, opacity: 0.7, marginTop: 5, fontFamily: "var(--font-dm-sans)" }}>5 énigmes résolues — la famille s'échappe</p>
        </div>
      )}

      {puzzle && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <PuzzleModal puzzle={puzzle} onSolve={solve} onClose={() => setActive(null)} />
        </div>
      )}
    </div>
  );
}
