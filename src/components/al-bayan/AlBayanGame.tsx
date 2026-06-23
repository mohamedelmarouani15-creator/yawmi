"use client";

import { useEffect, useRef, useCallback, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useProgress, Html } from "@react-three/drei";
import * as THREE from "three";

import { useAlBayanStore } from "@/lib/al-bayan/game-store";
import type { GamePhase } from "@/lib/al-bayan/types";

import MainHall from "./scenes/MainHall";
import EnigmaTemoignage from "./scenes/EnigmaTemoignage";
import EnigmaRasm from "./scenes/EnigmaRasm";
import EnigmaRoute from "./scenes/EnigmaRoute";

import IntroScreen from "./ui/IntroScreen";
import Timer from "./ui/Timer";
import EnigmaStatus from "./ui/EnigmaStatus";
import HintMailbox from "./ui/HintMailbox";
import CodeLock from "./ui/CodeLock";
import VictoryOverlay from "./ui/VictoryOverlay";
import FailureOverlay from "./ui/FailureOverlay";
import LookZone from "../maison-sagesse/shared/LookZone";

// ── Constantes navigation ─────────────────────────────────────
const SPEED = 4.2;
const PITCH_LIMIT = Math.PI / 2.8;

// Chaque salle a sa propre géométrie — la caméra doit être replacée et
// re-bornée à chaque changement de phase (cf. leçon apprise sur Maison de
// la Sagesse : sans ça, la caméra reste à la position de la salle
// précédente et peut se retrouver à l'extérieur des murs de la nouvelle).
const ROOM_BOUNDS: Record<string, { x: number; z: number }> = {
  "main-hall": { x: 8, z: 6 }, intro: { x: 8, z: 6 }, "code-lock": { x: 8, z: 6 },
  victory: { x: 8, z: 6 }, failure: { x: 8, z: 6 },
  "enigma-temoignage": { x: 5.3, z: 5.3 },
  "enigma-rasm": { x: 5.3, z: 5.3 },
  "enigma-route": { x: 5.3, z: 5.3 },
};
const SPAWN_POINTS: Record<string, { x: number; y: number; z: number; yaw: number }> = {
  "main-hall": { x: 0, y: 1.7, z: 6, yaw: 0 }, intro: { x: 0, y: 1.7, z: 6, yaw: 0 },
  "code-lock": { x: 0, y: 1.7, z: 6, yaw: 0 }, victory: { x: 0, y: 1.7, z: 6, yaw: 0 }, failure: { x: 0, y: 1.7, z: 6, yaw: 0 },
  "enigma-temoignage": { x: 0, y: 1.7, z: 5.5, yaw: 0 },
  "enigma-rasm": { x: 0, y: 1.7, z: 5.5, yaw: 0 },
  "enigma-route": { x: 0, y: 1.7, z: 5.5, yaw: 0 },
};

// ── Tone mapping ──────────────────────────────────────────────
function ToneMappingSetup() {
  const { gl } = useThree();
  useEffect(() => {
    // Mutation impérative du renderer Three.js — API native r3f, pas un état React.
    // eslint-disable-next-line react-hooks/immutability
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.3;
  }, [gl]);
  return null;
}

// ── Camera controller (FPS) ───────────────────────────────────
interface CameraControllerProps {
  phase: GamePhase;
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  yawRef: React.MutableRefObject<number>;
  pitchRef: React.MutableRefObject<number>;
}

function CameraController({ phase, joystickRef, yawRef, pitchRef }: CameraControllerProps) {
  const { camera } = useThree();
  const velX = useRef(0);
  const velZ = useRef(0);

  useEffect(() => {
    const spawn = SPAWN_POINTS[phase] ?? SPAWN_POINTS["main-hall"];
    camera.position.set(spawn.x, spawn.y, spawn.z);
    yawRef.current = spawn.yaw;
    pitchRef.current = -0.05;
    velX.current = 0;
    velZ.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, camera]);

  // useFrame mute la caméra à chaque frame (60fps) — pattern imposé par r3f.
  // eslint-disable-next-line react-hooks/immutability
  useFrame((_, delta) => {
    const joy = joystickRef.current;
    const dt = Math.min(delta, 0.1);
    const bounds = ROOM_BOUNDS[phase] ?? ROOM_BOUNDS["main-hall"];

    let fx = 0, fz = 0;
    if (joy.x !== 0 || joy.y !== 0) {
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      const rgt = new THREE.Vector3();
      rgt.crossVectors(fwd, new THREE.Vector3(0, 1, 0));
      fx += fwd.x * joy.y + rgt.x * joy.x;
      fz += fwd.z * joy.y + rgt.z * joy.x;
    }

    const len = Math.sqrt(fx * fx + fz * fz);
    if (len > 1) { fx /= len; fz /= len; }

    const ACCEL = 10;
    velX.current += (fx * SPEED - velX.current) * ACCEL * dt;
    velZ.current += (fz * SPEED - velZ.current) * ACCEL * dt;

    // eslint-disable-next-line react-hooks/immutability
    camera.position.x = Math.max(-bounds.x, Math.min(bounds.x, camera.position.x + velX.current * dt));
    camera.position.z = Math.max(-bounds.z, Math.min(bounds.z, camera.position.z + velZ.current * dt));
    camera.position.y = 1.7;

    camera.rotation.order = "YXZ";
    camera.rotation.y = yawRef.current;
    camera.rotation.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitchRef.current));
  });

  return null;
}

// ── Loading screen ────────────────────────────────────────────
function LoadingScreen() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: "#60a5fa", fontFamily: "sans-serif", textAlign: "center" }}>
        <div style={{ fontSize: 36 }}>📜</div>
        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Chargement... {Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

// ── Scene switcher ────────────────────────────────────────────
function SceneSwitcher({
  phase, onPhaseChange, onSolveEnigma, joystickRef, yawRef, pitchRef,
}: {
  phase: GamePhase;
  onPhaseChange: (p: GamePhase) => void;
  onSolveEnigma: (e: "A" | "B" | "C") => void;
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  yawRef: React.MutableRefObject<number>;
  pitchRef: React.MutableRefObject<number>;
}) {
  return (
    <>
      <CameraController phase={phase} joystickRef={joystickRef} yawRef={yawRef} pitchRef={pitchRef} />

      {(phase === "main-hall" || phase === "intro" || phase === "code-lock" || phase === "victory" || phase === "failure") && (
        <MainHall onPhaseChange={onPhaseChange} />
      )}
      {phase === "enigma-temoignage" && (
        <EnigmaTemoignage onConfirm={() => { onSolveEnigma("A"); onPhaseChange("main-hall"); }} />
      )}
      {phase === "enigma-rasm" && (
        <EnigmaRasm onConfirm={() => { onSolveEnigma("B"); onPhaseChange("main-hall"); }} />
      )}
      {phase === "enigma-route" && (
        <EnigmaRoute onConfirm={() => { onSolveEnigma("C"); onPhaseChange("main-hall"); }} />
      )}
    </>
  );
}

function isTouchCapable(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function passthroughTap(zoneEl: HTMLElement, x: number, y: number) {
  zoneEl.style.pointerEvents = "none";
  const target = document.elementFromPoint(x, y);
  zoneEl.style.pointerEvents = "auto";
  target?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window }));
}

// ── Main component ────────────────────────────────────────────
export function AlBayanGame() {
  const phase = useAlBayanStore((s) => s.phase);
  const isRunning = useAlBayanStore((s) => s.isRunning);
  const tick = useAlBayanStore((s) => s.tick);
  const setPhase = useAlBayanStore((s) => s.setPhase);
  const solveEnigma = useAlBayanStore((s) => s.solveEnigma);
  const enigmaA = useAlBayanStore((s) => s.enigmaA);
  const enigmaB = useAlBayanStore((s) => s.enigmaB);
  const enigmaC = useAlBayanStore((s) => s.enigmaC);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    // Détection client-only — indisponible côté SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouchDevice(isTouchCapable());
  }, []);

  const joystickRef = useRef({ x: 0, y: 0 });
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.05);

  // Lock orientation paysage sur mobile
  useEffect(() => {
    const lock = async () => {
      try {
        await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.("landscape");
      } catch { /* non supporté sur certains browsers */ }
    };
    lock();
    return () => {
      try { screen.orientation.unlock?.(); } catch { /* ignore */ }
    };
  }, []);

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // Auto code-lock quand les 3 énigmes résolues
  useEffect(() => {
    if (enigmaA.solved && enigmaB.solved && enigmaC.solved &&
        phase !== "code-lock" && phase !== "victory" && phase !== "failure") {
      setPhase("code-lock");
    }
  }, [enigmaA.solved, enigmaB.solved, enigmaC.solved, phase, setPhase]);

  const handleLook = useCallback((dx: number, dy: number) => {
    yawRef.current -= dx;
    pitchRef.current -= dy;
  }, []);

  if (phase === "idle") return <IntroScreen />;

  const inGame = phase !== "victory" && phase !== "failure" && phase !== "code-lock";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60, // couvre la BottomNav de l'app (z-50)
        width: "100dvw",
        height: "100dvh",
        background: "#0A0F0D",
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 60, near: 0.1, far: 100, position: [0, 1.7, 6] }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none" }}
      >
        <ambientLight intensity={0.3} color="#6090C0" />
        <directionalLight position={[5, 10, 5]} intensity={0.35} color="#A0C0FF" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

        <Suspense fallback={<LoadingScreen />}>
          <SceneSwitcher
            phase={phase}
            onPhaseChange={setPhase}
            onSolveEnigma={solveEnigma}
            joystickRef={joystickRef}
            yawRef={yawRef}
            pitchRef={pitchRef}
          />
        </Suspense>

        <ToneMappingSetup />
      </Canvas>

      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)",
      }} />

      {inGame && (
        <>
          <div
            style={{
              position: "absolute", inset: 0, right: "50%",
              zIndex: 9, touchAction: "none",
              pointerEvents: isTouchDevice ? "auto" : "none",
            }}
            onTouchStart={e => {
              const t = e.changedTouches[0];
              const el = e.currentTarget as HTMLElement;
              el.dataset.sx = String(t.clientX);
              el.dataset.sy = String(t.clientY);
              el.dataset.id = String(t.identifier);
              el.dataset.moved = "0";
            }}
            onTouchMove={e => {
              const el = e.currentTarget as HTMLElement;
              for (const t of Array.from(e.changedTouches)) {
                if (String(t.identifier) !== el.dataset.id) continue;
                const sx = Number(el.dataset.sx ?? t.clientX);
                const sy = Number(el.dataset.sy ?? t.clientY);
                const MAX = 55;
                const dx = Math.max(-MAX, Math.min(MAX, t.clientX - sx));
                const dy = Math.max(-MAX, Math.min(MAX, t.clientY - sy));
                if (Math.abs(t.clientX - sx) > 8 || Math.abs(t.clientY - sy) > 8) el.dataset.moved = "1";
                joystickRef.current = { x: dx / MAX, y: -dy / MAX };
              }
              e.preventDefault();
            }}
            onTouchEnd={e => {
              joystickRef.current = { x: 0, y: 0 };
              const el = e.currentTarget as HTMLElement;
              if (el.dataset.moved !== "1") {
                const t = e.changedTouches[0];
                passthroughTap(el, t.clientX, t.clientY);
              }
            }}
            onTouchCancel={() => { joystickRef.current = { x: 0, y: 0 }; }}
          />
          <LookZone onChange={handleLook} isTouchDevice={isTouchDevice} />
        </>
      )}

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
        <Timer />
        <EnigmaStatus />
      </div>

      <div style={{ position: "absolute", bottom: 64, left: 16, zIndex: 20 }}>
        <HintMailbox />
      </div>
      <div style={{ position: "absolute", bottom: 16, right: 16, zIndex: 20 }}>
        {(phase === "code-lock" || enigmaA.solved || enigmaB.solved || enigmaC.solved) && <CodeLock />}
      </div>

      {(phase === "enigma-temoignage" || phase === "enigma-rasm" || phase === "enigma-route") && (
        <button
          onClick={() => setPhase("main-hall")}
          style={{
            position: "absolute", top: 16, left: 16, zIndex: 20,
            display: "flex", alignItems: "center", gap: 8,
            borderRadius: 16, padding: "6px 12px",
            background: "rgba(10,15,13,0.88)",
            border: "1px solid rgba(212,175,55,0.25)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "rgba(212,175,55,0.7)",
            fontSize: 12,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← Hall
        </button>
      )}

      {phase === "victory" && <VictoryOverlay />}
      {phase === "failure" && <FailureOverlay />}
    </div>
  );
}
