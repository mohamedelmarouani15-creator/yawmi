"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";
import LibraryEnvironment from "./LibraryEnvironment";
import CandleSystem       from "./CandleSystem";
import AstrolabeDecor     from "./AstrolabeDecor";
import CinematicIntro     from "./CinematicIntro";
import GameTimer          from "./GameTimer";
import ManuscriptObject   from "./ManuscriptObject";
import Enigme             from "./Enigme";
import KnowledgeReveal    from "./KnowledgeReveal";
import CompanionVoice     from "./CompanionVoice";
import VictorySequence    from "./VictorySequence";
// VirtualJoystick supprimé — remplacé par dual-stick invisible ci-dessous
import LookZone           from "@/components/escape3d/LookZone";
import { useTombouctouAudio } from "@/hooks/useTombouctouAudio";
import { useTombouctouSession } from "@/hooks/useTombouctouSession";
import { MANUSCRIPTS }    from "@/lib/escape/tombouctou";
import FamilyLobby        from "./FamilyLobby";
import OtherPlayers       from "./OtherPlayers";
import { useAuth }        from "@/hooks/useAuth";

// ── Constantes navigation ────────────────────────────────────────
const SPEED       = 4.2
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

// ── VictoryCamera : élève la caméra pendant la victoire ─────────
function VictoryCamera({ activeRef }: { activeRef: React.RefObject<boolean> }) {
  const { camera } = useThree();
  const startRef   = useRef<number | null>(null);
  const startY     = useRef(1.7);

  useFrame(({ clock }, delta) => {
    if (!activeRef.current) return;
    if (startRef.current === null) {
      startRef.current = clock.getElapsedTime();
      startY.current   = camera.position.y;
    }
    const elapsed = clock.getElapsedTime() - startRef.current;
    const t       = Math.min(elapsed / 5, 1);
    const ease    = 1 - Math.pow(1 - t, 2);
    camera.position.y = THREE.MathUtils.lerp(startY.current, 7.5, ease);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, -0.45, delta * 0.6);
  });
  return null;
}

// ── VictoryLights : lumières dorées pendant la victoire ──────────
function VictoryLights({ activeRef }: { activeRef: React.RefObject<boolean> }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const ambRef   = useRef<THREE.AmbientLight>(null);

  useFrame((_, delta) => {
    if (!activeRef.current) return;
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity, 3.5, delta * 0.7
      );
    }
    if (ambRef.current) {
      ambRef.current.intensity = THREE.MathUtils.lerp(
        ambRef.current.intensity, 1.8, delta * 0.5
      );
      ambRef.current.color.lerp(new THREE.Color("#D4AF37"), delta * 0.4);
    }
  });

  return (
    <>
      <pointLight ref={lightRef} position={[0, 7, 0]}
        color="#D4AF37" intensity={0} distance={25} decay={1.2} castShadow={false} />
      <ambientLight ref={ambRef} color="#0A0A05" intensity={0.18} />
    </>
  );
}

// ── ProximityChecker ─────────────────────────────────────────────
function ProximityChecker({
  introComplete,
  solvedRef,
  isMobile,
  onNearby,
}: {
  introComplete: boolean;
  solvedRef:     React.RefObject<boolean[]>;
  isMobile:      boolean;
  onNearby:      (id: number | null) => void;
}) {
  const { camera } = useThree();
  const lastRef    = useRef<number | null>(null);

  useFrame(() => {
    if (!introComplete) return;
    let nearest: number | null = null;
    let minDist = isMobile ? 3.5 : 2.8;  // zone plus large sur mobile

    MANUSCRIPTS.forEach(m => {
      if (solvedRef.current?.[m.id]) return;
      const dx   = camera.position.x - m.position[0];
      const dz   = camera.position.z - m.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) { minDist = dist; nearest = m.id; }
    });

    if (nearest !== lastRef.current) {
      lastRef.current = nearest;
      onNearby(nearest);
    }
  });

  return null;
}

// ── CameraController (gameplay) ──────────────────────────────────
interface CtrlProps {
  joystickRef: React.RefObject<{ x: number; y: number }>;
  keysRef:     React.RefObject<Record<string, boolean>>;
  yawRef:      React.MutableRefObject<number>;
  pitchRef:    React.MutableRefObject<number>;
}

interface CtrlPropsExt extends CtrlProps {
  sendPosition?: (x: number, y: number, z: number) => void;
}

function CameraController({ joystickRef, keysRef, yawRef, pitchRef, sendPosition }: CtrlPropsExt) {
  const { camera } = useThree();
  // Momentum (Phase 6)
  const velX = useRef(0);
  const velZ = useRef(0);

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
      // Direction relative à la caméra (VirtualJoystick retourne déjà Y positif = avant)
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      const rgt = new THREE.Vector3();
      rgt.crossVectors(fwd, new THREE.Vector3(0, 1, 0));
      // joy.y > 0 = poussé en haut = avancer
      // joy.x > 0 = poussé à droite = strafe droit
      fx += fwd.x * joy.y + rgt.x * joy.x;
      fz += fwd.z * joy.y + rgt.z * joy.x;
    }

    const len = Math.sqrt(fx * fx + fz * fz);
    if (len > 1) { fx /= len; fz /= len; }

    // Momentum : accélération lisse (ACCEL haute = très réactif)
    const ACCEL = 10;
    velX.current += (fx * SPEED - velX.current) * ACCEL * dt;
    velZ.current += (fz * SPEED - velZ.current) * ACCEL * dt;

    const nx = camera.position.x + velX.current * dt;
    const nz = camera.position.z + velZ.current * dt;
    const cx = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, nx));
    const cz = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, nz));

    if (!blocked(cx, camera.position.z)) camera.position.x = cx;
    if (!blocked(camera.position.x, cz)) camera.position.z = cz;
    camera.position.y = 1.7;

    camera.rotation.order = "YXZ";
    camera.rotation.y = yawRef.current;
    camera.rotation.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitchRef.current));

    // Broadcast position (Mode Famille)
    sendPosition?.(camera.position.x, camera.position.y, camera.position.z);
  });

  return null;
}

// ════════════════════════════════════════════════════════════════
// Composant principal
// ════════════════════════════════════════════════════════════════
export default function TombouctouScene() {
  // ── État ──────────────────────────────────────────────────────
  const [introComplete,    setIntroComplete]    = useState(false);
  const [timerVisible,     setTimerVisible]     = useState(false);
  const [isTension,        setIsTension]        = useState(false);
  const [locked,           setLocked]           = useState(false);
  const [isMobile,         setIsMobile]         = useState(false);
  const [firstTime,        setFirstTime]        = useState(true);
  const [showLobby,        setShowLobby]        = useState(true);
  // Manuscrits
  const [solvedMs,         setSolvedMs]         = useState<boolean[]>(Array(5).fill(false));
  const [nearbyMs,         setNearbyMs]         = useState<number | null>(null);
  const [activeEnigme,     setActiveEnigme]     = useState<number | null>(null);
  const [revealingMs,      setRevealingMs]      = useState<number | null>(null);
  const [victoryActive,    setVictoryActive]    = useState(false);
  const [hintsUsed,        setHintsUsed]        = useState(0);
  const [gameSeconds,      setGameSeconds]      = useState(30 * 60);
  const [timerPaused,      setTimerPaused]      = useState(false);
  const solvedRef        = useRef<boolean[]>(Array(5).fill(false));
  const victoryActiveRef = useRef(false);

  // ── Refs partagés Canvas ↔ HTML ───────────────────────────────
  const introPhaseRef      = useRef(0);
  const tensionTargetRef   = useRef(0);   // 0 ou 1, set par GameTimer
  const tensionLevelRef    = useRef(0);   // 0→1 lissé, lu par Three.js
  const joystickRef        = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const keysRef            = useRef<Record<string, boolean>>({});
  const yawRef             = useRef(0.0);
  const pitchRef           = useRef(-0.05);
  const containerRef       = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { startAudio, stopAudio, setTension: setAudioTension } = useTombouctouAudio();

  // ── Session famille (Phase 5) ────────────────────────────────
  const displayName = user?.email?.split("@")[0] ?? "Gardien";
  const session = useTombouctouSession(user?.id ?? null, displayName);

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
    // Phase 4 — game over géré là
  }, []);

  // ── Manuscrits ─────────────────────────────────────────────────
  const handleSolve = useCallback((id: number) => {
    setActiveEnigme(null);
    setSolvedMs(prev => { const n=[...prev]; n[id]=true; return n; });
    solvedRef.current[id] = true;
    setRevealingMs(id);
    // Broadcaster aux autres joueurs (Mode Famille)
    const title = MANUSCRIPTS[id]?.title ?? "";
    session.sendSolved(id, title);
  }, [session]);

  const handleCloseReveal = useCallback(() => {
    setRevealingMs(null);
  }, []);

  // ── Victoire : tous les manuscrits résolus ─────────────────────
  useEffect(() => {
    if (solvedMs.every(Boolean) && !victoryActiveRef.current) {
      victoryActiveRef.current = true;
      setVictoryActive(true);
      setTimerPaused(true);
    }
  }, [solvedMs]);

  const handleExamine = useCallback(() => {
    if (nearbyMs !== null && !solvedRef.current[nearbyMs]) {
      setActiveEnigme(nearbyMs);
    }
  }, [nearbyMs]);

  // Fermeture Enigme avec Échap
  useEffect(() => {
    if (!activeEnigme && !revealingMs) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveEnigme(null);
        setRevealingMs(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeEnigme, revealingMs]);

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

  const dpr = typeof window !== "undefined"
    ? (isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2))
    : 1;

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
        <VictoryCamera activeRef={victoryActiveRef} />
        <VictoryLights activeRef={victoryActiveRef} />

        {/* Scène */}
        <LibraryEnvironment />
        <CandleSystem tensionLevelRef={tensionLevelRef} isMobile={isMobile} />
        <AstrolabeDecor />

        {/* Manuscrits 3D */}
        {MANUSCRIPTS.map(m => (
          <ManuscriptObject
            key={m.id}
            id={m.id}
            position={m.position}
            isNearby={nearbyMs === m.id}
            isSolved={solvedMs[m.id]}
          />
        ))}

        {/* Autres joueurs (Mode Famille) */}
        {session.isMultiplayer && (
          <OtherPlayers players={session.players} myUserId={user?.id ?? null} />
        )}

        {/* Détecteur de proximité */}
        <ProximityChecker
          introComplete={introComplete}
          solvedRef={solvedRef}
          isMobile={isMobile}
          onNearby={setNearbyMs}
        />

        {/* Caméra : intro OU jeu */}
        {!introComplete
          ? <IntroCameraController introPhaseRef={introPhaseRef} />
          : <CameraController
              joystickRef={joystickRef}
              keysRef={keysRef}
              yawRef={yawRef}
              pitchRef={pitchRef}
              sendPosition={session.sendPosition}
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

      {/* ── Lobby famille (avant intro) ── */}
      {showLobby && !introComplete && (
        <FamilyLobby
          onSolo={() => setShowLobby(false)}
          onCreateFamily={(code) => { session.createSession(); setShowLobby(false); }}
          onJoinFamily={(code) => { session.joinSession(code); setShowLobby(false); }}
          roleLabel={session.roleLabel}
          myRole={session.myRole}
          sessionCode={session.sessionCode}
          playerCount={session.players.length}
        />
      )}

      {/* ── Notifications famille ── */}
      <div style={{
        position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
        zIndex: 85, display: "flex", flexDirection: "column", gap: 6, width: "90%", maxWidth: 380,
        pointerEvents: "none",
      }}>
        {session.notifications.map(n => (
          <motion.div key={n.id}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: "rgba(4,14,8,0.88)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(212,175,55,0.28)", borderRadius: 10,
              padding: "8px 14px", textAlign: "center",
            }}>
            <p style={{ color: "rgba(212,175,55,0.85)", fontSize: 12, margin: 0,
              fontFamily: "var(--font-dm-sans, system-ui)" }}>{n.text}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Badge rôle (Mode Famille) ── */}
      {session.isMultiplayer && introComplete && !victoryActive && (
        <div style={{
          position: "fixed", top: 16, left: 16, zIndex: 80,
          background: "rgba(4,14,8,0.82)", backdropFilter: "blur(6px)",
          border: "1px solid rgba(212,175,55,0.22)", borderRadius: 10,
          padding: "6px 12px",
        }}>
          <p style={{ color: "#D4AF37", fontSize: 11, letterSpacing: "0.12em",
            fontFamily: "var(--font-dm-sans, system-ui)", margin: 0 }}>
            {session.roleLabel}
          </p>
        </div>
      )}

      {/* ── Enigme overlay ── */}
      {activeEnigme !== null && (
        <Enigme
          manuscriptId={activeEnigme}
          canSeeHint={session.canSeeHint}
          onSolve={handleSolve}
          onClose={() => setActiveEnigme(null)}
          onError={() => {}}
        />
      )}

      {/* ── Révélation savoir ── */}
      {revealingMs !== null && activeEnigme === null && (
        <KnowledgeReveal
          manuscriptId={revealingMs}
          onClose={handleCloseReveal}
        />
      )}

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
        visible={timerVisible && !victoryActive}
        paused={timerPaused}
        onTensionChange={handleTensionChange}
        onTimeUp={handleTimeUp}
        onTick={setGameSeconds}
      />

      {/* ── Compagnon sage ── */}
      <CompanionVoice
        nearbyMs={nearbyMs}
        solvedMs={solvedMs}
        introComplete={introComplete}
        victoryActive={victoryActive}
      />

      {/* ── Séquence de victoire ── */}
      {victoryActive && (
        <VictorySequence
          timeRemaining={gameSeconds}
          hintsUsed={hintsUsed}
          onReplay={() => { window.location.reload(); }}
        />
      )}

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

      {/* ── Bouton EXAMINER ── */}
      {introComplete && nearbyMs !== null && !solvedMs[nearbyMs] && !activeEnigme && !revealingMs && (
        isMobile ? (
          // Mobile : côté GAUCHE au-dessus du joystick, hors LookZone (droite 55%)
          // touchAction manipulation = tap immédiat sans délai 300ms
          <button
            onTouchEnd={e => { e.preventDefault(); handleExamine(); }}
            onClick={handleExamine}
            style={{
              position: "fixed",
              bottom: 165,
              left: "50%", transform: "translateX(-50%)",
              background: "rgba(212,175,55,0.22)",
              border: "2px solid rgba(212,175,55,0.7)",
              borderRadius: 18, padding: "18px 32px",
              color: "#D4AF37", fontWeight: 700, fontSize: 15,
              letterSpacing: "0.1em", cursor: "pointer",
              fontFamily: "var(--font-dm-sans, system-ui)",
              boxShadow: "0 0 28px rgba(212,175,55,0.25)",
              zIndex: 20,
              minHeight: 64,
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            📜 EXAMINER
          </button>
        ) : (
          // Desktop : centré bas
          <motion.button
            key={`exam-${nearbyMs}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleExamine}
            style={{
              position: "fixed",
              bottom: 70,
              left: "50%", transform: "translateX(-50%)",
              background: "rgba(212,175,55,0.15)",
              border: "1.5px solid rgba(212,175,55,0.55)",
              borderRadius: 14, padding: "12px 28px",
              color: "#D4AF37", fontWeight: 700, fontSize: 13,
              letterSpacing: "0.1em", cursor: "pointer",
              fontFamily: "var(--font-dm-sans, system-ui)",
              boxShadow: "0 0 20px rgba(212,175,55,0.12)",
              zIndex: 20,
            }}
          >
            📜 EXAMINER · {MANUSCRIPTS[nearbyMs]?.title}
          </motion.button>
        )
      )}

      {/* ── Contrôles mobiles dual-stick invisible ── */}
      {isMobile && introComplete && (
        <>
          {/* Zone gauche — mouvement (invisible, style Fortnite) */}
          <div
            style={{ position: "absolute", inset: 0, right: "50%", zIndex: 10, touchAction: "none" }}
            onTouchStart={e => {
              const t = e.changedTouches[0];
              (e.currentTarget as HTMLElement).dataset.sx = String(t.clientX);
              (e.currentTarget as HTMLElement).dataset.sy = String(t.clientY);
              (e.currentTarget as HTMLElement).dataset.id = String(t.identifier);
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
            }}
            onTouchEnd={() => { joystickRef.current = { x: 0, y: 0 }; }}
            onTouchCancel={() => { joystickRef.current = { x: 0, y: 0 }; }}
          />
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
