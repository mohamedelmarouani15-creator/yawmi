"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";
import LibraryEnvironment from "./LibraryEnvironment";
import CandleSystem       from "./CandleSystem";
import AstrolabeDecor     from "./AstrolabeDecor";
import CinematicIntro     from "./CinematicIntro";
import GameTimer          from "./GameTimer";
import VirtualJoystick    from "@/components/escape3d/VirtualJoystick";
import LookZone           from "@/components/escape3d/LookZone";
import { useTombouctouAudio } from "@/hooks/useTombouctouAudio";

// ── Constantes navigation ────────────────────────────────────────
const SPEED       = 3.8
const BOUNDS      = { x: 8.8, z: 6.8 }
const PITCH_LIMIT = Math.PI / 2.8

// Position départ joueur
const START_POS: [number, number, number] = [0, 1.7, 5.5]
// Position intro (très proche d'une bougie de table)
const INTRO_POS: [number, number, number] = [0, 1.7, 1.2]

// Obstacles étagères (bounding boxes simplifiées)
const OBSTACLES = [
  { cx: -7.5, cz: -7.0, hw: 1.35, hd: 0.55 },
  { cx: -2.5, cz: -7.0, hw: 1.35, hd: 0.55 },
  { cx:  2.5, cz: -7.0, hw: 1.35, hd: 0.55 },
  { cx:  7.5, cz: -7.0, hw: 1.35, hd: 0.55 },
  { cx:  9.3, cz: -3.0, hw: 0.55, hd: 1.35 },
  { cx:  9.3, cz:  2.8, hw: 0.55, hd: 1.35 },
  { cx: -9.3, cz: -3.0, hw: 0.55, hd: 1.35 },
  { cx: -9.3, cz:  2.8, hw: 0.55, hd: 1.35 },
];

function blocked(nx: number, nz: number) {
  const r = 0.35;
  return OBSTACLES.some(o =>
    nx > o.cx - o.hw - r && nx < o.cx + o.hw + r &&
    nz > o.cz - o.hd - r && nz < o.cz + o.hd + r
  );
}

// ════════════════════════════════════════════════════════════════
// Composants Three.js internes (inside Canvas)
// ════════════════════════════════════════════════════════════════

// ── FogController : anime la densité du brouillard ──────────────
function FogController({
  introPhaseRef, introComplete,
}: {
  introPhaseRef: React.MutableRefObject<number>;
  introComplete: boolean;
}) {
  const { scene } = useThree();

  useEffect(() => {
    // Brouillard très dense au départ (intro noir)
    scene.fog = new THREE.FogExp2(0x061A12, 1.5);
  }, [scene]);

  useFrame((_, delta) => {
    if (!(scene.fog instanceof THREE.FogExp2)) return;
    const phase   = introPhaseRef.current;
    let   target  = 1.5; // intro : très dense

    if (phase >= 3) {
      // Phase 3 (1.5s) → brouillard commence à se retirer
      target = 0.35;
    }
    if (phase >= 4) {
      // Phase 4 (2.5s) → brouillard continue de se retirer
      target = 0.12;
    }
    if (introComplete) {
      target = 0.052; // densité normale de jeu
    }

    // Lerp lissé
    const speed = introComplete ? 0.8 : 0.6;
    scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, target, delta * speed);
  });

  return null;
}

// ── IntroCameraController : anime la caméra pendant l'intro ─────
function IntroCameraController({
  introPhaseRef,
}: {
  introPhaseRef: React.MutableRefObject<number>;
}) {
  const { camera, clock } = useThree();
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Positionne la caméra sur la position intro au montage
    camera.position.set(...INTRO_POS);
    camera.rotation.set(-0.04, 0, 0);
    camera.rotation.order = "YXZ";
  }, [camera]);

  useFrame(() => {
    const phase = introPhaseRef.current;

    if (phase < 4) {
      // Phases 0-3 : caméra fixe sur la bougie centrale
      camera.position.set(...INTRO_POS);
      return;
    }

    // Phase 4+ : recul progressif vers START_POS
    if (startTimeRef.current === null) {
      startTimeRef.current = clock.getElapsedTime();
    }

    const elapsed  = clock.getElapsedTime() - startTimeRef.current;
    const duration = 3.5; // secondes pour aller de INTRO → START
    const t        = Math.min(elapsed / duration, 1.0);
    // Ease-out cubic
    const ease     = 1 - Math.pow(1 - t, 3);

    camera.position.x = THREE.MathUtils.lerp(INTRO_POS[0], START_POS[0], ease);
    camera.position.y = THREE.MathUtils.lerp(INTRO_POS[1], START_POS[1], ease);
    camera.position.z = THREE.MathUtils.lerp(INTRO_POS[2], START_POS[2], ease);
    // Légère élévation au milieu du recul
    camera.position.y = 1.7 + Math.sin(ease * Math.PI) * 0.25;
  });

  return null;
}

// ── TensionSmoothor : lisse le niveau de tension pour le Three.js ─
function TensionSmoothor({
  targetRef, levelRef,
}: {
  targetRef: React.MutableRefObject<number>;
  levelRef:  React.MutableRefObject<number>;
}) {
  useFrame((_, delta) => {
    // ~30s pour passer de 0 → 1 (comme spécifié)
    levelRef.current = THREE.MathUtils.lerp(
      levelRef.current, targetRef.current, delta * (1 / 30)
    );
  });
  return null;
}

// ── TensionLight : PointLight rouge globale en état tension ──────
function TensionLight({
  tensionLevelRef,
}: {
  tensionLevelRef: React.MutableRefObject<number>;
}) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (!lightRef.current) return;
    const level = tensionLevelRef.current;
    lightRef.current.intensity = level * 0.4;
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 6, 0]}
      color="#8B0000"
      intensity={0}
      distance={20}
      decay={1.5}
      castShadow={false}
    />
  );
}

// ── CameraController (gameplay) ──────────────────────────────────
interface CtrlProps {
  joystickRef: React.RefObject<{ x: number; y: number }>;
  keysRef:     React.RefObject<Record<string, boolean>>;
  yawRef:      React.MutableRefObject<number>;
  pitchRef:    React.MutableRefObject<number>;
}

function CameraController({ joystickRef, keysRef, yawRef, pitchRef }: CtrlProps) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const keys = keysRef.current;
    const joy  = joystickRef.current;
    const yaw  = yawRef.current;
    const dt   = Math.min(delta, 0.1);

    let fx = 0, fz = 0;
    if (keys["z"] || keys["w"] || keys["ArrowUp"])   { fx -= Math.sin(yaw); fz -= Math.cos(yaw); }
    if (keys["s"] || keys["ArrowDown"])               { fx += Math.sin(yaw); fz += Math.cos(yaw); }
    if (keys["q"] || keys["a"] || keys["ArrowLeft"])  { fx -= Math.cos(yaw); fz += Math.sin(yaw); }
    if (keys["d"] || keys["ArrowRight"])              { fx += Math.cos(yaw); fz -= Math.sin(yaw); }

    if (joy.x !== 0 || joy.y !== 0) {
      fx += -joy.y * (-Math.sin(yaw)) + joy.x * Math.cos(yaw);
      fz += -joy.y * (-Math.cos(yaw)) - joy.x * Math.sin(yaw);
    }

    const len = Math.sqrt(fx * fx + fz * fz);
    if (len > 1) { fx /= len; fz /= len; }

    const nx = camera.position.x + fx * SPEED * dt;
    const nz = camera.position.z + fz * SPEED * dt;
    const cx = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, nx));
    const cz = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, nz));

    if (!blocked(cx, camera.position.z)) camera.position.x = cx;
    if (!blocked(camera.position.x, cz)) camera.position.z = cz;
    camera.position.y = 1.7;

    camera.rotation.order = "YXZ";
    camera.rotation.y = yawRef.current;
    camera.rotation.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitchRef.current));
  });

  return null;
}

// ════════════════════════════════════════════════════════════════
// Composant principal
// ════════════════════════════════════════════════════════════════
export default function TombouctouScene() {
  // ── État ──────────────────────────────────────────────────────
  const [introComplete, setIntroComplete] = useState(false);
  const [timerVisible,  setTimerVisible]  = useState(false);
  const [isTension,     setIsTension]     = useState(false);
  const [locked,        setLocked]        = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);
  const [firstTime,     setFirstTime]     = useState(true);

  // ── Refs partagés Canvas ↔ HTML ───────────────────────────────
  const introPhaseRef      = useRef(0);
  const tensionTargetRef   = useRef(0);   // 0 ou 1, set par GameTimer
  const tensionLevelRef    = useRef(0);   // 0→1 lissé, lu par Three.js
  const joystickRef        = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const keysRef            = useRef<Record<string, boolean>>({});
  const yawRef             = useRef(0.0);
  const pitchRef           = useRef(-0.05);
  const containerRef       = useRef<HTMLDivElement>(null);

  const { startAudio, stopAudio, setTension: setAudioTension } = useTombouctouAudio();

  // ── Init ───────────────────────────────────────────────────────
  useEffect(() => {
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const seen = localStorage.getItem("yawmi_tombouctou_seen");
    setFirstTime(!seen);
  }, []);

  // ── Clavier ────────────────────────────────────────────────────
  useEffect(() => {
    if (!introComplete) return;
    const dn = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === "Escape") document.exitPointerLock?.();
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [introComplete]);

  // ── Pointer lock (desktop) ─────────────────────────────────────
  useEffect(() => {
    const onChange = () => setLocked(!!document.pointerLockElement);
    document.addEventListener("pointerlockchange", onChange);
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  useEffect(() => {
    if (!introComplete) return;
    const onMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;
      yawRef.current   -= e.movementX * 0.0022;
      pitchRef.current -= e.movementY * 0.0022;
      pitchRef.current  = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitchRef.current));
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [introComplete]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleIntroPhase = useCallback((phase: number) => {
    introPhaseRef.current = phase;
    if (phase === 1) startAudio(); // audio au début
  }, [startAudio]);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    setTimerVisible(true);
    localStorage.setItem("yawmi_tombouctou_seen", "1");
  }, []);

  const handleTensionChange = useCallback((active: boolean, level: number) => {
    tensionTargetRef.current = active ? 1 : 0;
    setIsTension(active);
    setAudioTension?.(level);
  }, [setAudioTension]);

  const handleTimeUp = useCallback(() => {
    // Phase 3 : game over — géré en Phase 4
    console.log("Temps écoulé — game over (Phase 4)");
  }, []);

  const handleClick = useCallback(() => {
    startAudio();
    if (!isMobile && introComplete) containerRef.current?.requestPointerLock();
  }, [isMobile, introComplete, startAudio]);

  const handleLook = useCallback((dx: number, dy: number) => {
    if (!introComplete) return;
    yawRef.current   -= dx;
    pitchRef.current -= dy;
    pitchRef.current  = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitchRef.current));
  }, [introComplete]);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;

  return (
    <div ref={containerRef} onClick={handleClick}
      style={{ position: "fixed", inset: 0, background: "#061A12" }}>

      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ fov: 75, near: 0.1, far: 50, position: [0, 1.7, 5.5] }}
        gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
        dpr={dpr}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#061A12"]} />

        {/* Contrôleurs Three.js */}
        <FogController introPhaseRef={introPhaseRef} introComplete={introComplete} />
        <TensionSmoothor targetRef={tensionTargetRef} levelRef={tensionLevelRef} />
        <TensionLight tensionLevelRef={tensionLevelRef} />

        {/* Scène */}
        <LibraryEnvironment />
        <CandleSystem tensionLevelRef={tensionLevelRef} />
        <AstrolabeDecor />

        {/* Caméra : intro OU jeu */}
        {!introComplete
          ? <IntroCameraController introPhaseRef={introPhaseRef} />
          : <CameraController
              joystickRef={joystickRef}
              keysRef={keysRef}
              yawRef={yawRef}
              pitchRef={pitchRef}
            />
        }

        {/* Post-processing */}
        <EffectComposer multisampling={0}>
          <SMAA />
          <Bloom
            intensity={isTension ? 1.1 : 0.65}
            luminanceThreshold={isTension ? 0.4 : 0.55}
            luminanceSmoothing={0.35}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {/* ── Intro cinématique (HTML overlay) ── */}
      {!introComplete && (
        <CinematicIntro
          onPhaseChange={handleIntroPhase}
          onComplete={handleIntroComplete}
          firstTime={firstTime}
        />
      )}

      {/* ── Chrono sablier ── */}
      <GameTimer
        visible={timerVisible}
        onTensionChange={handleTensionChange}
        onTimeUp={handleTimeUp}
      />

      {/* ── HUD desktop ── */}
      {!isMobile && introComplete && !locked && (
        <div style={{
          position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)",
          color: "#D4AF37", fontSize: 12, letterSpacing: "0.1em",
          fontFamily: "var(--font-dm-sans, system-ui)",
          background: "rgba(6,26,18,0.82)",
          border: "1px solid rgba(212,175,55,0.28)",
          borderRadius: 999, padding: "9px 22px",
          pointerEvents: "none", opacity: 0.8,
        }}>
          Cliquez pour naviguer · ZQSD · Échap pour libérer
        </div>
      )}

      {/* Viseur desktop (pointer lock actif) */}
      {!isMobile && locked && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 5, height: 5, borderRadius: "50%",
          background: "rgba(212,175,55,0.65)",
          boxShadow: "0 0 8px rgba(212,175,55,0.4)",
          pointerEvents: "none",
        }} />
      )}

      {/* Tension overlay CSS (rouge très subtil sur les bords) */}
      {isTension && (
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5,
          background: "radial-gradient(ellipse at center, transparent 60%, rgba(80,0,0,0.25) 100%)",
          animation: "tension-vignette 2s ease-in-out infinite",
        }} />
      )}

      {/* ── Contrôles mobiles ── */}
      {isMobile && introComplete && (
        <>
          <div style={{ position: "absolute", bottom: 36, left: 24, zIndex: 10 }}>
            <VirtualJoystick onChange={v => { joystickRef.current = v; }} />
          </div>
          <LookZone onChange={handleLook} />
        </>
      )}

      {/* CSS global pour animations HUD */}
      <style>{`
        @keyframes urgency-pulse {
          0%, 100% { box-shadow: 0 0 24px rgba(255,40,8,0.18); }
          50%       { box-shadow: 0 0 40px rgba(255,40,8,0.40); }
        }
        @keyframes tension-vignette {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1.0; }
        }
      `}</style>
    </div>
  );
}
