"use client";

import { useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress, Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { motion } from "framer-motion";

import { useMaisonSagesseStore } from "@/lib/maison-sagesse/game-store";
import type { GamePhase } from "@/lib/maison-sagesse/types";

// Scene components
import MainHall from "./scenes/MainHall";
import QuestFaith from "./scenes/QuestFaith";
import QuestScience from "./scenes/QuestScience";
import QuestWisdom from "./scenes/QuestWisdom";

// UI overlays
import IntroScreen from "./ui/IntroScreen";
import Timer45 from "./ui/Timer45";
import EnigmaStatus from "./ui/EnigmaStatus";
import AgentPanel from "./ui/AgentPanel";
import HintMailbox from "./ui/HintMailbox";
import CodeLock from "./ui/CodeLock";
import VictoryOverlay from "./ui/VictoryOverlay";
import FailureOverlay from "./ui/FailureOverlay";

import * as THREE from "three";

// ── Tone mapping (remplace postprocessing) ─────────────────────
function ToneMappingSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.4;
  }, [gl]);
  return null;
}

// ── Loading screen ─────────────────────────────────────────────

function LoadingScreen() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div
        className="flex flex-col items-center gap-4"
        style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: 36 }}
        >
          🌙
        </motion.div>
        <p style={{ fontSize: 12, color: "rgba(212,175,55,0.6)", letterSpacing: "0.15em" }}>
          Chargement... {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

// ── 3D Scene switcher ──────────────────────────────────────────

interface SceneSwitcherProps {
  phase: GamePhase;
  onPhaseChange: (p: GamePhase) => void;
  onSolveEnigma: (e: "A" | "B" | "C") => void;
}

function SceneSwitcher({ phase, onPhaseChange, onSolveEnigma }: SceneSwitcherProps) {
  if (phase === "main-hall" || phase === "intro") {
    return (
      <MainHall
        onPhaseChange={onPhaseChange}
      />
    );
  }

  if (phase === "quest-faith") {
    return (
      <QuestFaith
        onConfirm={() => {
          onSolveEnigma("A");
          onPhaseChange("main-hall");
        }}
      />
    );
  }

  if (phase === "quest-science") {
    return (
      <QuestScience />
    );
  }

  if (phase === "quest-wisdom") {
    return (
      <QuestWisdom
        onBookClick={() => {
          onSolveEnigma("C");
          onPhaseChange("main-hall");
        }}
      />
    );
  }

  if (phase === "code-lock" || phase === "victory" || phase === "failure") {
    return (
      <MainHall onPhaseChange={onPhaseChange} />
    );
  }

  return null;
}

// ── Main component ─────────────────────────────────────────────

export function MaisonSagesseGame() {
  const phase = useMaisonSagesseStore((s) => s.phase);
  const isRunning = useMaisonSagesseStore((s) => s.isRunning);
  const tick = useMaisonSagesseStore((s) => s.tick);
  const setPhase = useMaisonSagesseStore((s) => s.setPhase);
  const solveEnigma = useMaisonSagesseStore((s) => s.solveEnigma);
  const enigmaA = useMaisonSagesseStore((s) => s.enigmaA);
  const enigmaB = useMaisonSagesseStore((s) => s.enigmaB);
  const enigmaC = useMaisonSagesseStore((s) => s.enigmaC);

  // Timer ticker
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // Auto-transition to code-lock when all enigmas solved
  useEffect(() => {
    if (
      enigmaA.solved &&
      enigmaB.solved &&
      enigmaC.solved &&
      phase !== "code-lock" &&
      phase !== "victory" &&
      phase !== "failure"
    ) {
      setPhase("code-lock");
    }
  }, [enigmaA.solved, enigmaB.solved, enigmaC.solved, phase, setPhase]);

  // Intro screen — no canvas needed
  if (phase === "idle") {
    return <IntroScreen />;
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: "#0A0F0D" }}
    >
      {/* ── 3D Canvas ── */}
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 60, near: 0.1, far: 100, position: [0, 2, 8] }}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Ambient */}
        <ambientLight intensity={0.3} color="#FFA040" />
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.4}
          color="#FFD080"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <Suspense fallback={<LoadingScreen />}>
          <SceneSwitcher
            phase={phase}
            onPhaseChange={setPhase}
            onSolveEnigma={solveEnigma}
          />
        </Suspense>

        <ToneMappingSetup />
      </Canvas>

      {/* ── Vignette CSS ── */}
      <div className="absolute inset-0 pointer-events-none z-[5]"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)" }} />

      {/* ── UI overlays (pointer-events-none by default) ── */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <Timer45 />
        <EnigmaStatus />
        <AgentPanel />
      </div>

      {/* ── Interactive panels (pointer-events-auto) ── */}
      <div className="absolute bottom-16 left-4 z-20 flex flex-col items-start gap-2">
        <HintMailbox />
      </div>

      {/* Code lock - bottom right */}
      <div className="absolute bottom-4 right-4 z-20">
        {(phase === "code-lock" || enigmaA.solved || enigmaB.solved || enigmaC.solved) && (
          <CodeLock />
        )}
      </div>

      {/* Navigation back to main hall */}
      {(phase === "quest-faith" ||
        phase === "quest-science" ||
        phase === "quest-wisdom") && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => setPhase("main-hall")}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{
            background: "rgba(10,15,13,0.88)",
            border: "1px solid rgba(212,175,55,0.25)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "rgba(212,175,55,0.7)",
            fontSize: 12,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 700,
          }}
        >
          ← Hall
        </motion.button>
      )}

      {/* Game end overlays */}
      {phase === "victory" && <VictoryOverlay />}
      {phase === "failure" && <FailureOverlay />}
    </div>
  );
}
