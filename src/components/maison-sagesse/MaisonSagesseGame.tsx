"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress, Html } from "@react-three/drei";
import * as THREE from "three";

import { useMaisonSagesseStore } from "@/lib/maison-sagesse/game-store";
import { ISO_YAW_DEFAULT } from "@/lib/al-bayan/iso-camera";
import { dispatchPassthroughTap } from "@/lib/touch-passthrough";
import { resumeAudio, startAmbient, stopAmbient, playSolve, playVictory, playFailure } from "@/lib/maison-sagesse/audio-engine";
import { triggerShake } from "@/lib/camera-shake";

import MaisonSagesseWorld from "./world/MaisonSagesseWorld";
import MaisonSagessePostProcessing from "./world/PostProcessing";
import VictoryScene from "./scenes/VictoryScene";
import FailureScene from "./scenes/FailureScene";

import IntroScreen from "./ui/IntroScreen";
import Timer45 from "./ui/Timer45";
import EnigmaStatus from "./ui/EnigmaStatus";
import AgentPanel from "./ui/AgentPanel";
import HintMailbox from "./ui/HintMailbox";
import CodeLock from "./ui/CodeLock";
import VictoryOverlay from "./ui/VictoryOverlay";
import FailureOverlay from "./ui/FailureOverlay";

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

const ZONE_CENTERS = [
  { id: "hall", label: "Hall", icon: "🏛️", x: 0, z: 0 },
  { id: "science", label: "Science", icon: "⭐", x: 0, z: -20 },
  { id: "faith", label: "Foi", icon: "🌙", x: -22, z: 0 },
  { id: "wisdom", label: "Sagesse", icon: "📖", x: 22, z: 0 },
] as const;

function ZoneMiniMap({ avatarRef }: { avatarRef: { readonly current: THREE.Group | null } }) {
  const [currentZone, setCurrentZone] = useState<string>("hall");

  useEffect(() => {
    const id = setInterval(() => {
      const pos = avatarRef.current?.position;
      if (!pos) return;
      let closest: (typeof ZONE_CENTERS)[number] = ZONE_CENTERS[0];
      let minDist = Infinity;
      for (const z of ZONE_CENTERS) {
        const d = Math.hypot(pos.x - z.x, pos.z - z.z);
        if (d < minDist) { minDist = d; closest = z; }
      }
      setCurrentZone(closest.id);
    }, 400);
    return () => clearInterval(id);
  }, [avatarRef]);

  return (
    <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 3, pointerEvents: "none" }}>
      {ZONE_CENTERS.map((z) => {
        const active = z.id === currentZone;
        return (
          <div
            key={z.id}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "3px 8px 3px 5px", borderRadius: 8,
              background: active ? "rgba(212,175,55,0.18)" : "rgba(10,10,8,0.70)",
              border: `1px solid ${active ? "rgba(212,175,55,0.55)" : "rgba(255,255,255,0.06)"}`,
              backdropFilter: "blur(8px)", transition: "all 0.25s", opacity: active ? 1 : 0.5,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#D4AF37" : "rgba(255,255,255,0.18)", boxShadow: active ? "0 0 6px #D4AF37" : "none", flexShrink: 0 }} />
            <span style={{ fontSize: 8, fontFamily: "var(--font-dm-sans)", fontWeight: active ? 800 : 600, color: active ? "rgba(255,235,180,0.95)" : "rgba(255,255,255,0.3)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
              {z.icon} {z.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function isTouchCapable(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// ── Main component ────────────────────────────────────────────
export function MaisonSagesseGame() {
  const phase       = useMaisonSagesseStore((s) => s.phase);
  const isRunning   = useMaisonSagesseStore((s) => s.isRunning);
  const tick        = useMaisonSagesseStore((s) => s.tick);
  const solveEnigma = useMaisonSagesseStore((s) => s.solveEnigma);
  const enigmaA     = useMaisonSagesseStore((s) => s.enigmaA);
  const enigmaB     = useMaisonSagesseStore((s) => s.enigmaB);
  const enigmaC     = useMaisonSagesseStore((s) => s.enigmaC);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouchDevice(isTouchCapable());
  }, []);

  const joystickRef    = useRef({ x: 0, y: 0 });
  const yawRef         = useRef(ISO_YAW_DEFAULT);
  const avatarRef      = useRef<THREE.Group>(null);
  const hallSunRef     = useRef<THREE.Mesh>(null);
  const cameraReadyRef = useRef(true); // pas de cinématique d'intro pour l'instant

  const [joyVis, setJoyVis] = useState({ x: 0, y: 0, active: false });
  const [lookActive, setLookActive] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

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

  // Audio ambiant — démarré au premier geste après l'entrée en jeu
  useEffect(() => {
    if (phase === "idle") {
      stopAmbient();
      return;
    }
    const handler = () => {
      resumeAudio();
      startAmbient();
    };
    window.addEventListener("touchstart", handler, { once: true });
    window.addEventListener("click", handler, { once: true });
    return () => {
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("click", handler);
    };
  }, [phase]);

  // Son + secousse caméra à la résolution d'une quête
  const prevSolvedRef = useRef({ A: false, B: false, C: false });
  useEffect(() => {
    const prev = prevSolvedRef.current;
    if ((enigmaA.solved && !prev.A) || (enigmaB.solved && !prev.B) || (enigmaC.solved && !prev.C)) {
      playSolve();
      triggerShake(0.12, 0.5);
    }
    prevSolvedRef.current = { A: enigmaA.solved, B: enigmaB.solved, C: enigmaC.solved };
  }, [enigmaA.solved, enigmaB.solved, enigmaC.solved]);

  // Fanfare + secousse ample à la victoire
  const victoryPlayedRef = useRef(false);
  useEffect(() => {
    if (phase === "victory" && !victoryPlayedRef.current) {
      victoryPlayedRef.current = true;
      playVictory();
      triggerShake(0.22, 1.1);
    }
    if (phase !== "victory") victoryPlayedRef.current = false;
  }, [phase]);

  // Descente sombre au temps écoulé
  const failurePlayedRef = useRef(false);
  useEffect(() => {
    if (phase === "failure" && !failurePlayedRef.current) {
      failurePlayedRef.current = true;
      playFailure();
      triggerShake(0.08, 0.8);
    }
    if (phase !== "failure") failurePlayedRef.current = false;
  }, [phase]);

  // Clavier desktop — WASD/flèches pour le déplacement, Q/E pour l'orientation
  useEffect(() => {
    const pressed = new Set<string>();
    const update = () => {
      let x = 0, y = 0;
      if (pressed.has("arrowleft") || pressed.has("a")) x -= 1;
      if (pressed.has("arrowright") || pressed.has("d")) x += 1;
      if (pressed.has("arrowup") || pressed.has("w")) y += 1;
      if (pressed.has("arrowdown") || pressed.has("s")) y -= 1;
      joystickRef.current = { x, y };
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      pressed.add(k);
      if (k === "q") yawRef.current += 0.08;
      if (k === "e") yawRef.current -= 0.08;
      update();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      pressed.delete(e.key.toLowerCase());
      update();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  if (!mounted) return null;
  if (phase === "idle") return <IntroScreen />;

  const inGame = phase !== "victory" && phase !== "failure";
  const anyEnigmaSolved = enigmaA.solved || enigmaB.solved || enigmaC.solved;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        width: "100dvw", height: "100dvh",
        background: "#0A0F0D", overflow: "hidden", touchAction: "none",
      }}
    >
      <Canvas
        shadows="percentage"
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 40, near: 0.1, far: 120, position: [8, 8, 8] }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none" }}
      >
        <Suspense fallback={<LoadingScreen />}>
          {inGame ? (
            <MaisonSagesseWorld
              avatarRef={avatarRef}
              joystickRef={joystickRef}
              yawRef={yawRef}
              cameraReadyRef={cameraReadyRef}
              onConfirmFaith={() => solveEnigma("A")}
              onConfirmScience={() => solveEnigma("B")}
              onConfirmWisdom={() => solveEnigma("C")}
              solvedFaith={enigmaA.solved}
              solvedScience={enigmaB.solved}
              solvedWisdom={enigmaC.solved}
              hallSunRef={hallSunRef}
            />
          ) : phase === "victory" ? (
            <VictoryScene />
          ) : (
            <FailureScene />
          )}
        </Suspense>

        <MaisonSagessePostProcessing sunRef={inGame ? hallSunRef : undefined} />
      </Canvas>

      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)",
      }} />

      {inGame && (
        <>
          {isTouchDevice ? (
            <>
              <div
                style={{ position: "absolute", inset: 0, right: "50%", zIndex: 9, touchAction: "none" }}
                onTouchStart={e => {
                  const t = e.changedTouches[0];
                  const el = e.currentTarget as HTMLElement;
                  el.dataset.sx = String(t.clientX);
                  el.dataset.sy = String(t.clientY);
                  el.dataset.id = String(t.identifier);
                  el.dataset.moved = "0";
                  setJoyVis({ x: 0, y: 0, active: true });
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
                    setJoyVis({ x: dx / MAX, y: -dy / MAX, active: true });
                  }
                }}
                onTouchEnd={e => {
                  joystickRef.current = { x: 0, y: 0 };
                  setJoyVis({ x: 0, y: 0, active: false });
                  const el = e.currentTarget as HTMLElement;
                  if (el.dataset.moved !== "1") {
                    const t = e.changedTouches[0];
                    dispatchPassthroughTap(t.clientX, t.clientY);
                  }
                }}
                onTouchCancel={() => {
                  joystickRef.current = { x: 0, y: 0 };
                  setJoyVis({ x: 0, y: 0, active: false });
                }}
              />
              <div
                style={{ position: "absolute", inset: 0, left: "50%", zIndex: 9, touchAction: "none" }}
                onTouchStart={e => {
                  const t = e.changedTouches[0];
                  const el = e.currentTarget as HTMLElement;
                  el.dataset.sx = String(t.clientX);
                  el.dataset.sy = String(t.clientY);
                  el.dataset.lx = String(t.clientX);
                  el.dataset.ly = String(t.clientY);
                  el.dataset.id = String(t.identifier);
                  el.dataset.moved = "0";
                  setLookActive(true);
                }}
                onTouchMove={e => {
                  const el = e.currentTarget as HTMLElement;
                  for (const t of Array.from(e.changedTouches)) {
                    if (String(t.identifier) !== el.dataset.id) continue;
                    const sx = Number(el.dataset.sx ?? t.clientX);
                    const sy = Number(el.dataset.sy ?? t.clientY);
                    const lx = Number(el.dataset.lx ?? t.clientX);
                    if (Math.abs(t.clientX - sx) > 8 || Math.abs(t.clientY - sy) > 8) {
                      el.dataset.moved = "1";
                    }
                    if (el.dataset.moved === "1") {
                      yawRef.current -= (t.clientX - lx) * 0.004;
                    }
                    el.dataset.lx = String(t.clientX);
                    el.dataset.ly = String(t.clientY);
                  }
                }}
                onTouchEnd={e => {
                  const el = e.currentTarget as HTMLElement;
                  if (el.dataset.moved !== "1") {
                    const t = e.changedTouches[0];
                    dispatchPassthroughTap(t.clientX, t.clientY);
                  }
                  el.dataset.moved = "0";
                  setLookActive(false);
                }}
                onTouchCancel={() => setLookActive(false)}
              />
            </>
          ) : (
            <div
              style={{
                position: "absolute", top: 16, right: 16, zIndex: 20,
                borderRadius: 16, padding: "6px 12px",
                background: "rgba(10,15,13,0.88)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "rgba(212,175,55,0.8)",
                fontSize: 11, fontFamily: "var(--font-dm-sans)", fontWeight: 700,
                pointerEvents: "none",
              }}
            >
              ⌨️ WASD : marcher · Q/E : orienter
            </div>
          )}

          {isTouchDevice && (
            <>
              <div
                style={{
                  position: "absolute", bottom: 88, left: 32, zIndex: 15, pointerEvents: "none",
                  width: 78, height: 78, borderRadius: "50%",
                  border: `2px solid rgba(212,175,55,${joyVis.active ? 0.55 : 0.22})`,
                  background: `rgba(212,175,55,${joyVis.active ? 0.10 : 0.04})`,
                  backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{ position: "absolute", width: 1, height: 28, background: "rgba(212,175,55,0.25)" }} />
                <div style={{ position: "absolute", width: 28, height: 1, background: "rgba(212,175,55,0.25)" }} />
                <div
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "linear-gradient(135deg, #D4AF37, #FFE08A)",
                    boxShadow: "0 0 14px rgba(212,175,55,0.6)",
                    transform: `translate(${joyVis.x * 22}px, ${-joyVis.y * 22}px)`,
                    transition: joyVis.active ? "none" : "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                    opacity: joyVis.active ? 1 : 0.5,
                  }}
                />
              </div>

              <div
                style={{
                  position: "absolute", bottom: 88, right: 32, zIndex: 15, pointerEvents: "none",
                  width: 68, height: 68, borderRadius: "50%",
                  border: `2px solid rgba(96,165,250,${lookActive ? 0.55 : 0.20})`,
                  background: `rgba(96,165,250,${lookActive ? 0.10 : 0.04})`,
                  backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2,
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <span style={{ fontSize: 16, opacity: lookActive ? 1 : 0.5 }}>↻</span>
                <span style={{ fontSize: 7, fontFamily: "var(--font-dm-sans)", color: `rgba(96,165,250,${lookActive ? 0.9 : 0.4})`, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Vue
                </span>
              </div>
            </>
          )}
        </>
      )}

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
        <Timer45 />
        <EnigmaStatus />
        <AgentPanel />
        {inGame && <ZoneMiniMap avatarRef={avatarRef} />}
      </div>

      <div style={{ position: "absolute", bottom: 64, left: 16, zIndex: 20 }}>
        <HintMailbox />
      </div>
      <div style={{ position: "absolute", bottom: 16, right: 16, zIndex: 20 }}>
        {anyEnigmaSolved && <CodeLock />}
      </div>

      {phase === "victory" && <VictoryOverlay />}
      {phase === "failure" && <FailureOverlay />}
    </div>
  );
}
