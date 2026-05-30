"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Courtyard    from "./Courtyard";
import PlayerAvatar from "./PlayerAvatar";
import VirtualJoystick from "./VirtualJoystick";
import PuzzleModal  from "./PuzzleModal";
import { getPuzzleById } from "@/lib/escape3d/puzzles";
import { PLAYER_COLORS } from "@/lib/escape3d/types";

const WALK_SPEED = 2.8;
const BOUNDS     = 2.9;

function TPSCamera({ target }: { target: React.RefObject<THREE.Vector3> }) {
  const { camera } = useThree();
  const lerpPos = useRef(new THREE.Vector3(0, 5, 5));

  useFrame((_, delta) => {
    if (!target.current) return;
    const ideal = new THREE.Vector3(
      target.current.x,
      target.current.y + 4,
      target.current.z + 5,
    );
    lerpPos.current.lerp(ideal, 1 - Math.pow(0.015, delta));
    camera.position.copy(lerpPos.current);
    camera.lookAt(target.current.x, target.current.y + 0.5, target.current.z);
  });

  return null;
}

function PlayerController({ joystick, posTarget, onPositionChange }: {
  joystick:         React.RefObject<{ x: number; y: number }>;
  posTarget:        React.RefObject<THREE.Vector3>;
  onPositionChange: (pos: [number, number, number], rot: number) => void;
}) {
  const pos = useRef(new THREE.Vector3(0, 0, 1.5));
  const rot = useRef(0);

  useFrame((_, delta) => {
    const jx = joystick.current?.x ?? 0;
    const jy = joystick.current?.y ?? 0;
    if (Math.abs(jx) < 0.08 && Math.abs(jy) < 0.08) return;

    const speed = WALK_SPEED * delta;
    const angle = Math.atan2(jx, jy);
    rot.current = angle;
    pos.current.x = THREE.MathUtils.clamp(pos.current.x + Math.sin(angle) * speed, -BOUNDS, BOUNDS);
    pos.current.z = THREE.MathUtils.clamp(pos.current.z - Math.cos(angle) * speed, -BOUNDS, BOUNDS);
    const d = Math.sqrt(pos.current.x ** 2 + pos.current.z ** 2);
    if (d < 1.2) { pos.current.x *= 1.2 / d; pos.current.z *= 1.2 / d; }
    posTarget.current?.copy(pos.current);
    onPositionChange([pos.current.x, 0, pos.current.z], rot.current);
  });

  return null;
}

export default function RiadScene() {
  const [playerPos, setPlayerPos]   = useState<[number, number, number]>([0, 0, 1.5]);
  const [playerRot, setPlayerRot]   = useState(0);
  const [activePuzzleId, setActive] = useState<string | null>(null);
  const [solved, setSolved]         = useState<Record<string, boolean>>({});

  const joystick  = useRef({ x: 0, y: 0 });
  const camTarget = useRef(new THREE.Vector3(0, 0, 1.5));

  const onJoystick         = useCallback((v: { x: number; y: number }) => { joystick.current = v; }, []);
  const onPositionChange   = useCallback((pos: [number, number, number], rot: number) => {
    setPlayerPos(pos); setPlayerRot(rot);
  }, []);

  const puzzle = activePuzzleId ? getPuzzleById(activePuzzleId) : null;
  const handleSolve = (correct: boolean) => {
    if (activePuzzleId && correct) setSolved(s => ({ ...s, [activePuzzleId]: true }));
    setActive(null);
  };

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>
      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)",
      }} />

      <Canvas
        camera={{ position: [0, 5, 5], fov: 65, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#0A1020"]} />
        <fog attach="fog" args={["#080D18", 12, 38]} />

        <Courtyard
          onLanternTap={() => setActive("lantern_bismillah")}
          puzzleSolved={solved["lantern_bismillah"]}
        />
        <PlayerAvatar position={playerPos} rotation={playerRot} color={PLAYER_COLORS[0]} isLocal />
        <PlayerController joystick={joystick} posTarget={camTarget} onPositionChange={onPositionChange} />
        <TPSCamera target={camTarget} />
      </Canvas>

      {/* Joystick */}
      <div style={{ position: "absolute", bottom: 32, left: 32, zIndex: 10 }}>
        <VirtualJoystick onChange={onJoystick} />
      </div>

      {/* Titre */}
      <p style={{
        position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, pointerEvents: "none", color: "#D4AF37", opacity: 0.6,
        fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
        fontFamily: "var(--font-dm-sans)",
      }}>Le Riad — Cour centrale</p>

      {/* Indicateur */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: solved["lantern_bismillah"] ? "#05C36F" : "#D4AF37" }} />
        <span style={{ fontSize: 11, color: "#F8F4EC", opacity: 0.55, fontFamily: "var(--font-dm-sans)" }}>Lanterne Sud</span>
      </div>

      {/* Succès */}
      {solved["lantern_bismillah"] && (
        <div style={{
          position: "absolute", bottom: 144, left: 16, right: 16, zIndex: 10,
          background: "rgba(5,92,63,0.92)", border: "1px solid rgba(5,195,111,0.4)",
          borderRadius: 16, padding: "14px 20px", textAlign: "center",
        }}>
          <p style={{ color: "#F8F4EC", fontSize: 15, fontFamily: "var(--font-dm-sans)" }}>✨ Le riad s'illumine</p>
        </div>
      )}

      {puzzle && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <PuzzleModal puzzle={puzzle} onSolve={handleSolve} onClose={() => setActive(null)} />
        </div>
      )}
    </div>
  );
}
