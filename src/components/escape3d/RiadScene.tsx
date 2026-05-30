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
  const lerpPos = useRef(new THREE.Vector3(0, 4, 6));

  useFrame((_, delta) => {
    if (!target.current) return;
    const ideal = new THREE.Vector3(
      target.current.x,
      target.current.y + 3.2,
      target.current.z + 4.5,
    );
    lerpPos.current.lerp(ideal, 1 - Math.pow(0.02, delta));
    camera.position.copy(lerpPos.current);
    camera.lookAt(target.current.x, target.current.y + 0.7, target.current.z);
  });

  return null;
}

interface ControllerProps {
  joystick:         React.RefObject<{ x: number; y: number }>;
  posTarget:        React.RefObject<THREE.Vector3>;
  onPositionChange: (pos: [number, number, number], rot: number) => void;
}

function PlayerController({ joystick, posTarget, onPositionChange }: ControllerProps) {
  const pos = useRef(new THREE.Vector3(0, 0, 1.5));
  const rot = useRef(0);

  useFrame((_, delta) => {
    const jx = joystick.current?.x ?? 0;
    const jy = joystick.current?.y ?? 0;
    if (Math.abs(jx) < 0.08 && Math.abs(jy) < 0.08) return;

    const speed = WALK_SPEED * delta;
    const angle = Math.atan2(jx, jy);
    rot.current = angle;

    pos.current.x += Math.sin(angle) * speed;
    pos.current.z -= Math.cos(angle) * speed;
    pos.current.x = THREE.MathUtils.clamp(pos.current.x, -BOUNDS, BOUNDS);
    pos.current.z = THREE.MathUtils.clamp(pos.current.z, -BOUNDS, BOUNDS);

    const d = Math.sqrt(pos.current.x ** 2 + pos.current.z ** 2);
    if (d < 1.25) {
      pos.current.x *= 1.25 / d;
      pos.current.z *= 1.25 / d;
    }

    if (posTarget.current) posTarget.current.copy(pos.current);
    onPositionChange([pos.current.x, 0, pos.current.z], rot.current);
  });

  return null;
}

export default function RiadScene() {
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 1.5]);
  const [playerRot, setPlayerRot] = useState(0);
  const [activePuzzleId, setActive] = useState<string | null>(null);
  const [solved, setSolved]         = useState<Record<string, boolean>>({});

  const joystick  = useRef({ x: 0, y: 0 });
  const camTarget = useRef(new THREE.Vector3(0, 0, 1.5));

  const onJoystick = useCallback((v: { x: number; y: number }) => {
    joystick.current = v;
  }, []);

  const onPositionChange = useCallback((pos: [number, number, number], rot: number) => {
    setPlayerPos(pos);
    setPlayerRot(rot);
  }, []);

  const puzzle = activePuzzleId ? getPuzzleById(activePuzzleId) : null;

  function handleSolve(correct: boolean) {
    if (activePuzzleId && correct) setSolved(s => ({ ...s, [activePuzzleId]: true }));
    setActive(null);
  }

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>
      {/* Vignette CSS */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.72) 100%)",
      }} />

      <Canvas
        shadows
        camera={{ position: [0, 4, 6], fov: 60, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={["#080D10", 14, 38]} />

        <Courtyard
          onLanternTap={() => setActive("lantern_bismillah")}
          puzzleSolved={solved["lantern_bismillah"]}
        />

        <PlayerAvatar
          position={playerPos}
          rotation={playerRot}
          color={PLAYER_COLORS[0]}
          isLocal
        />

        <PlayerController
          joystick={joystick}
          posTarget={camTarget}
          onPositionChange={onPositionChange}
        />

        <TPSCamera target={camTarget} />
      </Canvas>

      {/* Joystick */}
      <div style={{ position: "absolute", bottom: 32, left: 32, zIndex: 10 }}>
        <VirtualJoystick onChange={onJoystick} />
      </div>

      {/* Titre */}
      <div style={{
        position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, pointerEvents: "none", textAlign: "center",
      }}>
        <p style={{
          fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
          color: "#D4AF37", opacity: 0.55, fontFamily: "var(--font-dm-sans)",
        }}>
          Le Riad — Cour centrale
        </p>
      </div>

      {/* Indicateur énigme */}
      <div style={{
        position: "absolute", top: 24, right: 20, zIndex: 10,
        display: "flex", alignItems: "center", gap: 8, pointerEvents: "none",
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: solved["lantern_bismillah"] ? "#05C36F" : "#D4AF37",
        }} />
        <span style={{
          fontSize: 11, color: "#F8F4EC", opacity: 0.6,
          fontFamily: "var(--font-dm-sans)",
        }}>
          Lanterne du Sud
        </span>
      </div>

      {/* Succès */}
      {solved["lantern_bismillah"] && (
        <div style={{
          position: "absolute", bottom: 144, left: 16, right: 16, zIndex: 10,
          background: "rgba(5,92,63,0.92)", border: "1px solid rgba(5,195,111,0.4)",
          borderRadius: 16, padding: "14px 20px", textAlign: "center",
        }}>
          <p style={{ color: "#F8F4EC", fontSize: 15, fontFamily: "var(--font-dm-sans)" }}>
            ✨ Le riad s'illumine
          </p>
          <p style={{ color: "#F8F4EC", fontSize: 12, opacity: 0.7, marginTop: 4, fontFamily: "var(--font-dm-sans)" }}>
            Tu as trouvé le mot béni qui ouvre toutes les portes.
          </p>
        </div>
      )}

      {/* Modale d'énigme */}
      {puzzle && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <PuzzleModal puzzle={puzzle} onSolve={handleSolve} onClose={() => setActive(null)} />
        </div>
      )}
    </div>
  );
}
