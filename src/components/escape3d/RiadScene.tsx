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

const WALK_SPEED   = 3.0;
const PLAYER_BOUND = 2.8;
const CAM_DIST     = 5.5;
const CAM_ELEV     = 0.52; // ~30° elevation en radians
const CAM_BOUND    = 3.1;

function Controller({ moveStick, lookStick, onPosRot }: {
  moveStick: React.RefObject<{ x: number; y: number }>;
  lookStick: React.RefObject<{ x: number; y: number }>;
  onPosRot:  (pos: [number, number, number], rot: number) => void;
}) {
  const { camera } = useThree();
  const pos        = useRef(new THREE.Vector3(0, 0, 1.5));
  const azimuth    = useRef(Math.PI); // commence face à la fontaine
  const camPos     = useRef(new THREE.Vector3(0, CAM_DIST * Math.sin(CAM_ELEV), CAM_DIST * Math.cos(CAM_ELEV)));

  useFrame((_, delta) => {
    // ── Rotation caméra (stick droit, X seulement) ──────────
    const lx = lookStick.current?.x ?? 0;
    if (Math.abs(lx) > 0.05) azimuth.current += lx * 2.0 * delta;

    // ── Mouvement (stick gauche) — relatif à la caméra ──────
    const mx = moveStick.current?.x ?? 0;
    const my = moveStick.current?.y ?? 0;
    const len = Math.sqrt(mx * mx + my * my);

    if (len > 0.06) {
      // Vecteurs de direction caméra projetés sur XZ
      const fwdX = -Math.sin(azimuth.current);
      const fwdZ = -Math.cos(azimuth.current);
      const rgtX =  Math.cos(azimuth.current);
      const rgtZ = -Math.sin(azimuth.current);

      const spd = WALK_SPEED * delta;
      pos.current.x = THREE.MathUtils.clamp(pos.current.x + (fwdX * my + rgtX * mx) * spd, -PLAYER_BOUND, PLAYER_BOUND);
      pos.current.z = THREE.MathUtils.clamp(pos.current.z + (fwdZ * my + rgtZ * mx) * spd, -PLAYER_BOUND, PLAYER_BOUND);

      // Évite la fontaine
      const d = Math.sqrt(pos.current.x ** 2 + pos.current.z ** 2);
      if (d < 1.2) { pos.current.x *= 1.2 / d; pos.current.z *= 1.2 / d; }
    }

    // ── Caméra orbitale autour du joueur ────────────────────
    const cosElev = Math.cos(CAM_ELEV);
    const sinElev = Math.sin(CAM_ELEV);
    const targetCam = new THREE.Vector3(
      THREE.MathUtils.clamp(pos.current.x + Math.sin(azimuth.current) * CAM_DIST * cosElev, -CAM_BOUND, CAM_BOUND),
      pos.current.y + CAM_DIST * sinElev,
      THREE.MathUtils.clamp(pos.current.z + Math.cos(azimuth.current) * CAM_DIST * cosElev, -CAM_BOUND, CAM_BOUND),
    );
    camPos.current.lerp(targetCam, 1 - Math.pow(0.005, delta));
    camera.position.copy(camPos.current);
    camera.lookAt(pos.current.x, pos.current.y + 0.7, pos.current.z);

    // ── Rotation avatar vers la direction de marche ─────────
    const moveAngle = len > 0.06
      ? -azimuth.current + Math.atan2(mx, my)
      : 0;

    onPosRot([pos.current.x, 0, pos.current.z], moveAngle);
  });

  return null;
}

export default function RiadScene() {
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 1.5]);
  const [playerRot, setPlayerRot] = useState(0);
  const [activePuzzleId, setActive] = useState<string | null>(null);
  const [solved, setSolved] = useState<Record<string, boolean>>({});

  const moveStick = useRef({ x: 0, y: 0 });
  const lookStick = useRef({ x: 0, y: 0 });

  const onMove   = useCallback((v: { x: number; y: number }) => { moveStick.current = v; }, []);
  const onLook   = useCallback((v: { x: number; y: number }) => { lookStick.current = v; }, []);
  const onPosRot = useCallback((pos: [number, number, number], rot: number) => {
    setPlayerPos(pos); setPlayerRot(rot);
  }, []);

  const puzzle      = activePuzzleId ? getPuzzleById(activePuzzleId) : null;
  const handleSolve = (correct: boolean) => {
    if (activePuzzleId && correct) setSolved(s => ({ ...s, [activePuzzleId]: true }));
    setActive(null);
  };

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>
      {/* Vignette CSS */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
      }} />

      <Canvas
        shadows="soft"
        camera={{ position: [0, CAM_DIST * Math.sin(CAM_ELEV), CAM_DIST * Math.cos(CAM_ELEV)], fov: 60, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%", filter: "saturate(1.15) brightness(1.05)" }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <color attach="background" args={["#060810"]} />
        <fog attach="fog" args={["#060810", 10, 35]} />

        <Courtyard
          onLanternTap={() => setActive("lantern_bismillah")}
          puzzleSolved={solved["lantern_bismillah"]}
        />
        <PlayerAvatar position={playerPos} rotation={playerRot} color={PLAYER_COLORS[0]} isLocal />
        <Controller moveStick={moveStick} lookStick={lookStick} onPosRot={onPosRot} />
      </Canvas>

      {/* ── Double joystick ─────────────────────────────────── */}
      <div style={{ position: "absolute", bottom: 28, left: 24, zIndex: 10 }}>
        <p style={{ textAlign: "center", marginBottom: 5, fontSize: 9, color: "#D4AF37", opacity: 0.45, letterSpacing: "0.12em", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase" }}>
          Déplacer
        </p>
        <VirtualJoystick onChange={onMove} />
      </div>
      <div style={{ position: "absolute", bottom: 28, right: 24, zIndex: 10 }}>
        <p style={{ textAlign: "center", marginBottom: 5, fontSize: 9, color: "#D4AF37", opacity: 0.45, letterSpacing: "0.12em", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase" }}>
          Regarder
        </p>
        <VirtualJoystick onChange={onLook} />
      </div>

      {/* HUD */}
      <p style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 10, pointerEvents: "none", color: "#D4AF37", opacity: 0.55, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-dm-sans)" }}>
        Le Riad
      </p>
      <div style={{ position: "absolute", top: 18, right: 18, zIndex: 10, display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: solved["lantern_bismillah"] ? "#05C36F" : "#D4AF37", boxShadow: solved["lantern_bismillah"] ? "0 0 8px #05C36F" : "0 0 8px #D4AF37" }} />
        <span style={{ fontSize: 10, color: "#F8F4EC", opacity: 0.5, fontFamily: "var(--font-dm-sans)" }}>Énigme 1/1</span>
      </div>

      {solved["lantern_bismillah"] && (
        <div style={{ position: "absolute", bottom: 155, left: 16, right: 16, zIndex: 10, background: "rgba(5,92,63,0.95)", border: "1px solid rgba(5,195,111,0.5)", borderRadius: 16, padding: "14px 20px", textAlign: "center", backdropFilter: "blur(8px)" }}>
          <p style={{ color: "#F8F4EC", fontSize: 15, fontFamily: "var(--font-dm-sans)" }}>✨ Bismillah — le riad s'illumine</p>
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
