"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import Courtyard   from "./Courtyard";
import PlayerAvatar from "./PlayerAvatar";
import VirtualJoystick from "./VirtualJoystick";
import PuzzleModal from "./PuzzleModal";
import { getPuzzleById } from "@/lib/escape3d/puzzles";
import { PLAYER_COLORS } from "@/lib/escape3d/types";

const WALK_SPEED = 2.8;
const BOUNDS     = 2.9;  // limite de déplacement dans la cour

// ── Caméra TPS qui suit le joueur ──────────────────────────────
function TPSCamera({ target }: { target: React.RefObject<THREE.Vector3> }) {
  const { camera } = useThree();
  const lerpPos    = useRef(new THREE.Vector3(0, 4, 6));

  useFrame((_, delta) => {
    if (!target.current) return;
    const ideal = new THREE.Vector3(
      target.current.x,
      target.current.y + 3.2,
      target.current.z + 4.5,
    );
    lerpPos.current.lerp(ideal, 1 - Math.pow(0.02, delta));
    camera.position.copy(lerpPos.current);
    camera.lookAt(
      target.current.x,
      target.current.y + 0.7,
      target.current.z,
    );
  });

  return null;
}

// ── Contrôleur du joueur ──────────────────────────────────────
interface ControllerProps {
  joystick:  React.RefObject<{ x: number; y: number }>;
  posTarget: React.RefObject<THREE.Vector3>;
  onPositionChange: (pos: [number, number, number], rot: number) => void;
}

function PlayerController({ joystick, posTarget, onPositionChange }: ControllerProps) {
  const pos = useRef(new THREE.Vector3(0, 0, 1.5));
  const rot = useRef(0);

  useFrame((_, delta) => {
    const jx = joystick.current?.x ?? 0;
    const jy = joystick.current?.y ?? 0;
    if (Math.abs(jx) < 0.08 && Math.abs(jy) < 0.08) return;

    const speed  = WALK_SPEED * delta;
    const angle  = Math.atan2(jx, jy);
    rot.current  = angle;

    pos.current.x += Math.sin(angle) * speed;
    pos.current.z -= Math.cos(angle) * speed;

    // Bornes de la cour
    pos.current.x = THREE.MathUtils.clamp(pos.current.x, -BOUNDS, BOUNDS);
    pos.current.z = THREE.MathUtils.clamp(pos.current.z, -BOUNDS, BOUNDS);

    // Évite la fontaine (rayon ~1.1)
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

// ── Scène principale ─────────────────────────────────────────
export default function RiadScene() {
  const [playerPos, setPlayerPos]   = useState<[number, number, number]>([0, 0, 1.5]);
  const [playerRot, setPlayerRot]   = useState(0);
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
    if (activePuzzleId) {
      if (correct) setSolved(s => ({ ...s, [activePuzzleId]: true }));
    }
    setActive(null);
  }

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>
      {/* ── Canvas Three.js ──────────────────────────────────── */}
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 60, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%", background: "#080D10" }}
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

        {/* Post-processing */}
        <EffectComposer>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
          <Vignette offset={0.38} darkness={0.65} />
        </EffectComposer>
      </Canvas>

      {/* ── HUD ──────────────────────────────────────────────── */}
      {/* Joystick */}
      <div className="absolute bottom-8 left-8" style={{ zIndex: 10 }}>
        <VirtualJoystick onChange={onJoystick} />
      </div>

      {/* Titre scène */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none"
        style={{ zIndex: 10 }}>
        <p className="text-xs tracking-widest uppercase opacity-50"
          style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
          Le Riad — Cour centrale
        </p>
      </div>

      {/* Indicateur énigmes */}
      <div className="absolute top-6 right-5 flex flex-col gap-1.5 pointer-events-none" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full"
            style={{ background: solved["lantern_bismillah"] ? "#05C36F" : "#D4AF37" }} />
          <span className="text-xs opacity-60"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Lanterne du Sud
          </span>
        </div>
      </div>

      {/* Succès si toutes les énigmes résolues */}
      {solved["lantern_bismillah"] && (
        <div
          className="absolute inset-x-4 bottom-36 rounded-2xl px-5 py-4 text-center pointer-events-none"
          style={{
            background: "rgba(5,92,63,0.9)",
            border: "1px solid rgba(5,195,111,0.4)",
            zIndex: 10,
          }}>
          <p className="text-base font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            ✨ Le riad s'illumine
          </p>
          <p className="text-xs mt-1 opacity-70" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Tu as trouvé le mot béni qui ouvre toutes les portes.
          </p>
        </div>
      )}

      {/* ── Modale d'énigme ──────────────────────────────────── */}
      {puzzle && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <PuzzleModal
            puzzle={puzzle}
            onSolve={handleSolve}
            onClose={() => setActive(null)}
          />
        </div>
      )}
    </div>
  );
}
