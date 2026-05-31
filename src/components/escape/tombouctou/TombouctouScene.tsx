"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";
import LibraryEnvironment from "./LibraryEnvironment";
import CandleSystem       from "./CandleSystem";
import AstrolabeDecor     from "./AstrolabeDecor";
import VirtualJoystick    from "@/components/escape3d/VirtualJoystick";
import LookZone           from "@/components/escape3d/LookZone";
import { useTombouctouAudio } from "@/hooks/useTombouctouAudio";

// ── Constantes navigation ────────────────────────────────────────
const SPEED  = 3.8     // u/s
const BOUNDS = { x: 8.8, z: 6.8 }
const PITCH_LIMIT = Math.PI / 2.8

// Obstacles simples (zones bloquées — étagères)
const OBSTACLES = [
  { cx: -7.5, cz: -6.9, hw: 1.3, hd: 0.6 },
  { cx: -2.5, cz: -6.9, hw: 1.3, hd: 0.6 },
  { cx:  2.5, cz: -6.9, hw: 1.3, hd: 0.6 },
  { cx:  7.5, cz: -6.9, hw: 1.3, hd: 0.6 },
  { cx:  9.3, cz: -3.0, hw: 0.6, hd: 1.3 },
  { cx:  9.3, cz:  2.8, hw: 0.6, hd: 1.3 },
  { cx: -9.3, cz: -3.0, hw: 0.6, hd: 1.3 },
  { cx: -9.3, cz:  2.8, hw: 0.6, hd: 1.3 },
];

function blockedByObstacle(nx: number, nz: number): boolean {
  const r = 0.35; // rayon joueur
  for (const o of OBSTACLES) {
    if (
      nx > o.cx - o.hw - r && nx < o.cx + o.hw + r &&
      nz > o.cz - o.hd - r && nz < o.cz + o.hd + r
    ) return true;
  }
  return false;
}

// ── Contrôleur caméra (inside Canvas) ───────────────────────────
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

    // Direction de déplacement en worldspace
    let fx = 0, fz = 0;

    // Clavier — ZQSD (AZERTY) + WASD (QWERTY) + flèches
    const fwd = keys["z"] || keys["w"] || keys["ArrowUp"]    || keys["Z"] || keys["W"];
    const bwd = keys["s"] || keys["ArrowDown"]                || keys["S"];
    const lft = keys["q"] || keys["a"] || keys["ArrowLeft"]   || keys["Q"] || keys["A"];
    const rgt = keys["d"] || keys["ArrowRight"]               || keys["D"];

    if (fwd) { fx -= Math.sin(yaw); fz -= Math.cos(yaw); }
    if (bwd) { fx += Math.sin(yaw); fz += Math.cos(yaw); }
    if (lft) { fx -= Math.cos(yaw); fz += Math.sin(yaw); }
    if (rgt) { fx += Math.cos(yaw); fz -= Math.sin(yaw); }

    // Joystick mobile
    if (joy.x !== 0 || joy.y !== 0) {
      // joy.y positif = poussée vers l'avant
      fx += -joy.y * (-Math.sin(yaw)) + joy.x * Math.cos(yaw);
      fz += -joy.y * (-Math.cos(yaw)) - joy.x * Math.sin(yaw);
    }

    // Normalisation diagonale
    const len = Math.sqrt(fx*fx + fz*fz);
    if (len > 1) { fx /= len; fz /= len; }

    // Position candidate
    const nx = camera.position.x + fx * SPEED * dt;
    const nz = camera.position.z + fz * SPEED * dt;

    // Clamp bounds + obstacles
    const cx = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, nx));
    const cz = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, nz));

    if (!blockedByObstacle(cx, camera.position.z)) camera.position.x = cx;
    if (!blockedByObstacle(camera.position.x, cz)) camera.position.z = cz;
    camera.position.y = 1.7; // hauteur yeux fixe

    // Rotation caméra
    camera.rotation.order = "YXZ";
    camera.rotation.y = yawRef.current;
    camera.rotation.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitchRef.current));
  });

  return null;
}

// ── Scène principale ─────────────────────────────────────────────
export default function TombouctouScene() {
  const [locked,    setLocked]    = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs partagés Canvas ↔ HTML
  const joystickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const keysRef     = useRef<Record<string, boolean>>({});
  const yawRef      = useRef(0.0);
  const pitchRef    = useRef(-0.08); // légèrement incliné vers le bas

  const { startAudio, stopAudio } = useTombouctouAudio();

  // Détection mobile
  useEffect(() => {
    setIsMobile(
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 768
    );
  }, []);

  // Keyboard
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === "Escape") document.exitPointerLock?.();
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup",   up);
    };
  }, []);

  // Pointer lock (desktop)
  useEffect(() => {
    const onChange = () => setLocked(!!document.pointerLockElement);
    document.addEventListener("pointerlockchange", onChange);
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  // Mouvement souris
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;
      yawRef.current   -= e.movementX * 0.0022;
      pitchRef.current -= e.movementY * 0.0022;
      pitchRef.current  = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitchRef.current));
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  // Clic → pointer lock + audio
  const handleClick = useCallback(() => {
    startAudio();
    if (!isMobile) {
      containerRef.current?.requestPointerLock();
    }
  }, [isMobile, startAudio]);

  // LookZone mobile → met à jour yaw/pitch directement
  const handleLook = useCallback((dx: number, dy: number) => {
    yawRef.current   -= dx;
    pitchRef.current -= dy;
    pitchRef.current  = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitchRef.current));
  }, []);

  // Cleanup audio on unmount
  useEffect(() => () => stopAudio(), [stopAudio]);

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ position: "fixed", inset: 0, background: "#061A12" }}
    >
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ fov: 75, near: 0.1, far: 50, position: [0, 1.7, 5.5] }}
        gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
        dpr={dpr}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Fond et brouillard */}
        <color attach="background" args={["#061A12"]} />
        <fogExp2 attach="fog" args={["#061A12", 0.052]} />

        {/* Scène */}
        <LibraryEnvironment />
        <CandleSystem />
        <AstrolabeDecor />

        {/* Contrôleur caméra */}
        <CameraController
          joystickRef={joystickRef}
          keysRef={keysRef}
          yawRef={yawRef}
          pitchRef={pitchRef}
        />

        {/* Post-processing : bloom sur les flammes */}
        <EffectComposer multisampling={0}>
          <SMAA />
          <Bloom
            intensity={0.65}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.35}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {/* ── HUD desktop : message pointer lock ── */}
      {!isMobile && !locked && (
        <div style={{
          position: "absolute",
          bottom: 28, left: "50%", transform: "translateX(-50%)",
          color: "#D4AF37",
          fontSize: 12,
          fontFamily: "var(--font-dm-sans, system-ui)",
          letterSpacing: "0.1em",
          background: "rgba(6,26,18,0.82)",
          border: "1px solid rgba(212,175,55,0.28)",
          borderRadius: 999,
          padding: "9px 22px",
          pointerEvents: "none",
          opacity: 0.85,
          userSelect: "none",
        }}>
          Cliquez pour naviguer · ZQSD · Échap pour libérer
        </div>
      )}

      {/* ── Curseur personnalisé desktop locked ── */}
      {!isMobile && locked && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 6, height: 6,
          borderRadius: "50%",
          background: "rgba(212,175,55,0.7)",
          boxShadow: "0 0 8px rgba(212,175,55,0.5)",
          pointerEvents: "none",
        }} />
      )}

      {/* ── Contrôles mobiles ── */}
      {isMobile && (
        <>
          {/* Joystick bas-gauche */}
          <div style={{
            position: "absolute",
            bottom: 36, left: 24,
            zIndex: 10,
          }}>
            <VirtualJoystick onChange={v => { joystickRef.current = v; }} />
          </div>

          {/* Zone de regard (moitié droite) */}
          <LookZone onChange={handleLook} />

          {/* Indicateur EXAMINER (placeholder Phase 1 — activé en Phase 3) */}
          <div style={{
            position: "absolute",
            bottom: 36, right: 28,
            pointerEvents: "none",
            opacity: 0,  // invisible en Phase 1
          }}>
            <div style={{
              background: "rgba(212,175,55,0.15)",
              border: "1px solid rgba(212,175,55,0.4)",
              borderRadius: 12,
              padding: "14px 22px",
              color: "#D4AF37",
              fontSize: 13,
              fontFamily: "var(--font-dm-sans, system-ui)",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}>
              EXAMINER
            </div>
          </div>
        </>
      )}
    </div>
  );
}
