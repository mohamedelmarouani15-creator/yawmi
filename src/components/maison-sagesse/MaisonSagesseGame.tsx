"use client";

import { useEffect, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useProgress, Html } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

import { useMaisonSagesseStore } from "@/lib/maison-sagesse/game-store";
import type { GamePhase } from "@/lib/maison-sagesse/types";

import MainHall from "./scenes/MainHall";
import QuestFaith from "./scenes/QuestFaith";
import QuestScience from "./scenes/QuestScience";
import QuestWisdom from "./scenes/QuestWisdom";

import IntroScreen from "./ui/IntroScreen";
import Timer45 from "./ui/Timer45";
import EnigmaStatus from "./ui/EnigmaStatus";
import AgentPanel from "./ui/AgentPanel";
import HintMailbox from "./ui/HintMailbox";
import CodeLock from "./ui/CodeLock";
import VictoryOverlay from "./ui/VictoryOverlay";
import FailureOverlay from "./ui/FailureOverlay";
import LookZone from "./shared/LookZone";

// ── Constantes navigation ─────────────────────────────────────
const SPEED       = 4.2;
const PITCH_LIMIT = Math.PI / 2.8;

// ── Tone mapping ──────────────────────────────────────────────
function ToneMappingSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.4;
  }, [gl]);
  return null;
}

// ── Camera controller (FPS) ───────────────────────────────────
interface CameraControllerProps {
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  yawRef:      React.MutableRefObject<number>;
  pitchRef:    React.MutableRefObject<number>;
}

function CameraController({ joystickRef, yawRef, pitchRef }: CameraControllerProps) {
  const { camera } = useThree();
  const velX = useRef(0);
  const velZ = useRef(0);

  useFrame((_, delta) => {
    const joy = joystickRef.current;
    const dt  = Math.min(delta, 0.1);

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

    camera.position.x = Math.max(-9, Math.min(9, camera.position.x + velX.current * dt));
    camera.position.z = Math.max(-7, Math.min(7, camera.position.z + velZ.current * dt));
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
      <div style={{ color: "#D4AF37", fontFamily: "sans-serif", textAlign: "center" }}>
        <div style={{ fontSize: 36 }}>🌙</div>
        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
          Chargement... {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

// ── Scene switcher ────────────────────────────────────────────
function SceneSwitcher({
  phase,
  onPhaseChange,
  onSolveEnigma,
  joystickRef,
  yawRef,
  pitchRef,
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
      <CameraController joystickRef={joystickRef} yawRef={yawRef} pitchRef={pitchRef} />

      {(phase === "main-hall" || phase === "intro" || phase === "code-lock" || phase === "victory" || phase === "failure") && (
        <MainHall onPhaseChange={onPhaseChange} />
      )}
      {phase === "quest-faith" && (
        <QuestFaith onConfirm={() => { onSolveEnigma("A"); onPhaseChange("main-hall"); }} />
      )}
      {phase === "quest-science" && <QuestScience />}
      {phase === "quest-wisdom" && (
        <QuestWisdom onBookClick={() => { onSolveEnigma("C"); onPhaseChange("main-hall"); }} />
      )}
    </>
  );
}

// ── Main component ────────────────────────────────────────────
export function MaisonSagesseGame() {
  const phase      = useMaisonSagesseStore((s) => s.phase);
  const isRunning  = useMaisonSagesseStore((s) => s.isRunning);
  const tick       = useMaisonSagesseStore((s) => s.tick);
  const setPhase   = useMaisonSagesseStore((s) => s.setPhase);
  const solveEnigma = useMaisonSagesseStore((s) => s.solveEnigma);
  const enigmaA    = useMaisonSagesseStore((s) => s.enigmaA);
  const enigmaB    = useMaisonSagesseStore((s) => s.enigmaB);
  const enigmaC    = useMaisonSagesseStore((s) => s.enigmaC);

  // Refs joystick / caméra
  const joystickRef = useRef({ x: 0, y: 0 });
  const yawRef      = useRef(0);
  const pitchRef    = useRef(-0.05);

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

  // LookZone handler → met à jour yaw/pitch
  const handleLook = useCallback((dx: number, dy: number) => {
    yawRef.current   -= dx;
    pitchRef.current -= dy;
  }, []);

  if (phase === "idle") return <IntroScreen />;

  const inGame = phase !== "victory" && phase !== "failure" && phase !== "code-lock";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100dvw",
        height: "100dvh",
        background: "#0A0F0D",
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      {/* ── 3D Canvas plein écran ── */}
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 60, near: 0.1, far: 100, position: [0, 1.7, 8] }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.3} color="#FFA040" />
        <directionalLight position={[5, 10, 5]} intensity={0.4} color="#FFD080"
          castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

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

      {/* ── Vignette CSS ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)",
      }} />

      {/* ── Dual-stick mobile (seulement en jeu) ── */}
      {inGame && (
        <>
          {/* Zone gauche — mouvement */}
          <div
            style={{
              position: "absolute", inset: 0, right: "50%",
              zIndex: 9, touchAction: "none",
            }}
            onTouchStart={e => {
              const t = e.changedTouches[0];
              const el = e.currentTarget as HTMLElement;
              el.dataset.sx = String(t.clientX);
              el.dataset.sy = String(t.clientY);
              el.dataset.id = String(t.identifier);
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
                joystickRef.current = { x: dx / MAX, y: -dy / MAX };
              }
              e.preventDefault();
            }}
            onTouchEnd={() => { joystickRef.current = { x: 0, y: 0 }; }}
            onTouchCancel={() => { joystickRef.current = { x: 0, y: 0 }; }}
          />
          {/* Zone droite — regard */}
          <LookZone onChange={handleLook} />
        </>
      )}

      {/* ── UI overlay ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
        <Timer45 />
        <EnigmaStatus />
        <AgentPanel />
      </div>

      {/* ── Panels interactifs ── */}
      <div style={{ position: "absolute", bottom: 64, left: 16, zIndex: 20 }}>
        <HintMailbox />
      </div>
      <div style={{ position: "absolute", bottom: 16, right: 16, zIndex: 20 }}>
        {(phase === "code-lock" || enigmaA.solved || enigmaB.solved || enigmaC.solved) && (
          <CodeLock />
        )}
      </div>

      {/* ── Bouton retour Hall ── */}
      {(phase === "quest-faith" || phase === "quest-science" || phase === "quest-wisdom") && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.93 }}
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
        </motion.button>
      )}

      {phase === "victory" && <VictoryOverlay />}
      {phase === "failure" && <FailureOverlay />}
    </div>
  );
}
