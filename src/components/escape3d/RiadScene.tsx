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

const WALK_SPEED   = 2.5;
const PLAYER_BOUND = 2.8;
const CAM_DISTANCE = 5;
const CAM_HEIGHT   = 2.8;
const CAM_BOUND    = 3.0; // caméra reste dans la cour

// ── Contrôleur joueur + caméra orbitale ──────────────────────
interface ControllerProps {
  moveStick:  React.RefObject<{ x: number; y: number }>;
  lookStick:  React.RefObject<{ x: number; y: number }>;
  posTarget:  React.RefObject<THREE.Vector3>;
  onPosRot:   (pos: [number, number, number], rot: number) => void;
}

function Controller({ moveStick, lookStick, posTarget, onPosRot }: ControllerProps) {
  const { camera } = useThree();
  const pos     = useRef(new THREE.Vector3(0, 0, 1.5));
  const azimuth = useRef(0); // angle horizontal de la caméra (radians)

  useFrame((_, delta) => {
    // ── Rotation caméra (joystick droit) ────────────────────
    const lx = lookStick.current?.x ?? 0;
    if (Math.abs(lx) > 0.06) {
      azimuth.current -= lx * 2.2 * delta;
    }

    // ── Déplacement (joystick gauche) ───────────────────────
    const mx = moveStick.current?.x ?? 0;
    const my = moveStick.current?.y ?? 0;
    if (Math.abs(mx) > 0.06 || Math.abs(my) > 0.06) {
      // Direction relative à la caméra
      const camFwd  = new THREE.Vector3(
        -Math.sin(azimuth.current),
        0,
        -Math.cos(azimuth.current),
      );
      const camRight = new THREE.Vector3(
        Math.cos(azimuth.current),
        0,
        -Math.sin(azimuth.current),
      );
      const speed = WALK_SPEED * delta;
      pos.current.addScaledVector(camFwd,   my * speed);
      pos.current.addScaledVector(camRight, mx * speed);

      // Bornes joueur
      pos.current.x = THREE.MathUtils.clamp(pos.current.x, -PLAYER_BOUND, PLAYER_BOUND);
      pos.current.z = THREE.MathUtils.clamp(pos.current.z, -PLAYER_BOUND, PLAYER_BOUND);
      // Collision fontaine
      const d = Math.sqrt(pos.current.x ** 2 + pos.current.z ** 2);
      if (d < 1.2) { pos.current.x *= 1.2 / d; pos.current.z *= 1.2 / d; }
    }

    // ── Position caméra (derrière le joueur) ─────────────────
    const offsetX = Math.sin(azimuth.current) * CAM_DISTANCE;
    const offsetZ = Math.cos(azimuth.current) * CAM_DISTANCE;

    const camX = THREE.MathUtils.clamp(pos.current.x + offsetX, -CAM_BOUND, CAM_BOUND);
    const camZ = THREE.MathUtils.clamp(pos.current.z + offsetZ, -CAM_BOUND, CAM_BOUND);
    const camY = CAM_HEIGHT;

    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
    camera.lookAt(pos.current.x, 0.8, pos.current.z);

    // ── Mise à jour état React ───────────────────────────────
    posTarget.current?.copy(pos.current);
    const faceAngle = Math.atan2(
      moveStick.current?.x ?? 0,
      moveStick.current?.y ?? 0,
    );
    onPosRot([pos.current.x, 0, pos.current.z], -azimuth.current + faceAngle);
  });

  return null;
}

export default function RiadScene() {
  const [playerPos, setPlayerPos]   = useState<[number, number, number]>([0, 0, 1.5]);
  const [playerRot, setPlayerRot]   = useState(0);
  const [activePuzzleId, setActive] = useState<string | null>(null);
  const [solved, setSolved]         = useState<Record<string, boolean>>({});

  const moveStick = useRef({ x: 0, y: 0 });
  const lookStick = useRef({ x: 0, y: 0 });
  const camTarget = useRef(new THREE.Vector3(0, 0, 1.5));

  const onMove = useCallback((v: { x: number; y: number }) => { moveStick.current = v; }, []);
  const onLook = useCallback((v: { x: number; y: number }) => { lookStick.current = v; }, []);
  const onPosRot = useCallback((pos: [number, number, number], rot: number) => {
    setPlayerPos(pos); setPlayerRot(rot);
  }, []);

  const puzzle     = activePuzzleId ? getPuzzleById(activePuzzleId) : null;
  const handleSolve = (correct: boolean) => {
    if (activePuzzleId && correct) setSolved(s => ({ ...s, [activePuzzleId]: true }));
    setActive(null);
  };

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>
      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.72) 100%)",
      }} />

      <Canvas
        camera={{ position: [0, CAM_HEIGHT, CAM_DISTANCE], fov: 65, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#0A1020"]} />
        <fog attach="fog" args={["#0A1020", 12, 38]} />

        <Courtyard
          onLanternTap={() => setActive("lantern_bismillah")}
          puzzleSolved={solved["lantern_bismillah"]}
        />
        <PlayerAvatar position={playerPos} rotation={playerRot} color={PLAYER_COLORS[0]} isLocal />
        <Controller
          moveStick={moveStick}
          lookStick={lookStick}
          posTarget={camTarget}
          onPosRot={onPosRot}
        />
      </Canvas>

      {/* Joystick gauche — déplacement */}
      <div style={{ position: "absolute", bottom: 32, left: 28, zIndex: 10 }}>
        <p style={{
          textAlign: "center", marginBottom: 6, fontSize: 9,
          color: "#D4AF37", opacity: 0.5, letterSpacing: "0.1em",
          fontFamily: "var(--font-dm-sans)", textTransform: "uppercase",
        }}>Déplacer</p>
        <VirtualJoystick onChange={onMove} />
      </div>

      {/* Joystick droit — rotation caméra */}
      <div style={{ position: "absolute", bottom: 32, right: 28, zIndex: 10 }}>
        <p style={{
          textAlign: "center", marginBottom: 6, fontSize: 9,
          color: "#D4AF37", opacity: 0.5, letterSpacing: "0.1em",
          fontFamily: "var(--font-dm-sans)", textTransform: "uppercase",
        }}>Regarder</p>
        <VirtualJoystick onChange={onLook} />
      </div>

      {/* Titre */}
      <p style={{
        position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, pointerEvents: "none", color: "#D4AF37", opacity: 0.6,
        fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
        fontFamily: "var(--font-dm-sans)",
      }}>Le Riad — Cour centrale</p>

      {/* Indicateur énigme */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: solved["lantern_bismillah"] ? "#05C36F" : "#D4AF37" }} />
        <span style={{ fontSize: 11, color: "#F8F4EC", opacity: 0.55, fontFamily: "var(--font-dm-sans)" }}>
          Lanterne Sud-Est
        </span>
      </div>

      {solved["lantern_bismillah"] && (
        <div style={{
          position: "absolute", bottom: 160, left: 16, right: 16, zIndex: 10,
          background: "rgba(5,92,63,0.92)", border: "1px solid rgba(5,195,111,0.4)",
          borderRadius: 16, padding: "14px 20px", textAlign: "center",
        }}>
          <p style={{ color: "#F8F4EC", fontSize: 15, fontFamily: "var(--font-dm-sans)" }}>
            ✨ Le riad s'illumine
          </p>
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
