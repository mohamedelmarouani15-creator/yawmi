"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { useAlBayanStore } from "@/lib/al-bayan/game-store";
import { dispatchPassthroughTap } from "@/lib/touch-passthrough";
import { ISO_YAW_DEFAULT } from "@/lib/al-bayan/iso-camera";

import IntroScreen from "@/components/al-bayan/ui/IntroScreen";
import AlBayanWorld from "@/components/al-bayan/world/AlBayanWorld";
import AlBayanPostProcessing from "@/components/al-bayan/world/PostProcessing";
import LoadingVeil from "@/components/al-bayan/ui/LoadingVeil";
import Timer from "@/components/al-bayan/ui/Timer";
import EnigmaStatus from "@/components/al-bayan/ui/EnigmaStatus";
import HintMailbox from "@/components/al-bayan/ui/HintMailbox";
import CodeLock from "@/components/al-bayan/ui/CodeLock";
import VictoryOverlay from "@/components/al-bayan/ui/VictoryOverlay";
import FailureOverlay from "@/components/al-bayan/ui/FailureOverlay";
import { resumeAudio, startAmbient, stopAmbient, playSolve } from "@/lib/al-bayan/audio-engine";

// Sensibilité de rotation au glissé tactile (pouce droit)
const LOOK_SENS = 0.004;
const LOOK_DRAG_THRESHOLD = 8;

const ZONE_CENTERS = [
  { id: "vestibule", label: "Vestibule", icon: "🏛️", x: 0, z: 0 },
  { id: "cour", label: "Cour", icon: "⚖️", x: 15, z: 0 },
  { id: "scriptorium", label: "Scriptorium", icon: "✒️", x: -14.5, z: 0 },
  { id: "sanctuaire", label: "Sanctuaire", icon: "🔭", x: 0, z: -14 },
] as const;

function ZoneMiniMap({ avatarRef }: { avatarRef: { readonly current: THREE.Group | null } }) {
  const [currentZone, setCurrentZone] = useState<string>("vestibule");

  useEffect(() => {
    const id = setInterval(() => {
      const pos = avatarRef.current?.position;
      if (!pos) return;
      let closest: typeof ZONE_CENTERS[number] = ZONE_CENTERS[0];
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
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        pointerEvents: "none",
      }}
    >
      {ZONE_CENTERS.map((z) => {
        const active = z.id === currentZone;
        return (
          <div
            key={z.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 8px 3px 5px",
              borderRadius: 8,
              background: active ? "rgba(61,127,232,0.18)" : "rgba(10,10,8,0.70)",
              border: `1px solid ${active ? "rgba(61,127,232,0.55)" : "rgba(255,255,255,0.06)"}`,
              backdropFilter: "blur(8px)",
              transition: "all 0.25s",
              opacity: active ? 1 : 0.5,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: active ? "#3D7FE8" : "rgba(255,255,255,0.18)",
                boxShadow: active ? "0 0 6px #3D7FE8" : "none",
                flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: 8,
              fontFamily: "var(--font-dm-sans)",
              fontWeight: active ? 800 : 600,
              color: active ? "rgba(200,220,255,0.95)" : "rgba(255,255,255,0.3)",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}>
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

/**
 * Point d'entrée unique d'al-bayan : monde 3D ouvert sur une seule page,
 * plus de routes par salle (cf. plan de refonte — l'ancien layout.tsx +
 * les sous-dossiers temoignage/rasm/codicilles/coffret sont supprimés).
 */
export default function AlBayanPage() {
  const phase = useAlBayanStore((s) => s.phase);
  const isRunning = useAlBayanStore((s) => s.isRunning);
  const tick = useAlBayanStore((s) => s.tick);
  const enigmaA = useAlBayanStore((s) => s.enigmaA);
  const enigmaB = useAlBayanStore((s) => s.enigmaB);
  const enigmaC = useAlBayanStore((s) => s.enigmaC);
  const solveEnigma = useAlBayanStore((s) => s.solveEnigma);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouchDevice(isTouchCapable());
  }, []);

  // Voile de chargement — visible pendant l'intro cinématique (~3s)
  const [showVeil, setShowVeil] = useState(true);
  useEffect(() => {
    if (phase === "idle") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowVeil(true);
    const t = setTimeout(() => setShowVeil(false), 3200);
    return () => clearTimeout(t);
  }, [phase]);

  // Audio — démarré au premier geste après changement de phase
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

  // Joystick visuel — suivi de position pour le dot interne
  const [joyVis, setJoyVis] = useState({ x: 0, y: 0, active: false });
  const [lookActive, setLookActive] = useState(false);

  // `phase` vient du store Zustand persisté en localStorage : côté SSR il
  // vaut toujours sa valeur par défaut ('idle'). Sans cette garde, un
  // rechargement de page en pleine partie ferait un premier rendu sans
  // Canvas puis un second AVEC Canvas dès l'hydratation — mismatch qui
  // fait planter le reconciler R3F. On attend le montage client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const joystickRef = useRef({ x: 0, y: 0 });
  const yawRef = useRef(ISO_YAW_DEFAULT);
  const avatarRef = useRef<THREE.Group>(null);

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

  // Clavier desktop — WASD/flèches pour le déplacement, Q/E pour
  // l'orientation : permet de tester le monde ouvert sans appareil
  // tactile ni émulation. Sans risque sur mobile (aucun clavier physique).
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

  // Son de résolution — uniquement quand une énigme passe de non-résolue à résolue
  const prevSolvedRef = useRef({ A: false, B: false, C: false });
  useEffect(() => {
    const prev = prevSolvedRef.current;
    if ((enigmaA.solved && !prev.A) || (enigmaB.solved && !prev.B) || (enigmaC.solved && !prev.C)) {
      playSolve();
    }
    prevSolvedRef.current = { A: enigmaA.solved, B: enigmaB.solved, C: enigmaC.solved };
  }, [enigmaA.solved, enigmaB.solved, enigmaC.solved]);

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
        shadows="percentage"
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        // Angle réduit (50° -> 28°) : un FOV large laisse le bord du champ de
        // vision dépasser largement le mur testé par les rayons de collision
        // caméra dans un angle de salle serré (vu : moitié d'écran noire —
        // pas un mur sombre, du vide pur derrière le bord du cadre). Un
        // objectif plus "long" rapproche le rendu d'une vraie isométrique et
        // réduit cette marge d'erreur sans changer la position/distance.
        camera={{ fov: 36, near: 0.1, far: 100, position: [8, 8, 8] }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none" }}
      >
        <AlBayanWorld
          avatarRef={avatarRef}
          joystickRef={joystickRef}
          yawRef={yawRef}
          onConfirmTemoignage={() => solveEnigma("A")}
          onConfirmRasm={() => solveEnigma("B")}
          onConfirmRoute={() => solveEnigma("C")}
        />
        <AlBayanPostProcessing />
      </Canvas>

      {/* Voile de chargement — par-dessus le Canvas, en dessous du HUD */}
      <LoadingVeil visible={showVeil} />

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
              {/* Zone d'orientation (pouce droit) — même mécanisme React
                  (onTouchStart/Move/End inline) que la zone de déplacement
                  ci-dessus, plutôt que l'ancien composant LookZone qui
                  attachait ses propres listeners DOM bruts via un effet
                  recréé à chaque rendu du parent (handleLook non mémoïsé) :
                  ça pouvait couper un glissé en cours sur certains appareils. */}
              <div
                style={{ position: "absolute", inset: 0, left: "45%", zIndex: 9, touchAction: "none" }}
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
                    if (Math.abs(t.clientX - sx) > LOOK_DRAG_THRESHOLD || Math.abs(t.clientY - sy) > LOOK_DRAG_THRESHOLD) {
                      el.dataset.moved = "1";
                    }
                    if (el.dataset.moved === "1") {
                      yawRef.current -= (t.clientX - lx) * LOOK_SENS;
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
                border: "1px solid rgba(96,165,250,0.3)",
                color: "rgba(96,165,250,0.8)",
                fontSize: 11,
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 700,
                pointerEvents: "none",
              }}
            >
              ⌨️ WASD : marcher · Q/E : orienter
            </div>
          )}

          {/* ── Joystick visuel (gauche) ──────────────────────────── */}
          {isTouchDevice && (
            <>
              <div
                style={{
                  position: "absolute",
                  bottom: 88,
                  left: 32,
                  zIndex: 15,
                  pointerEvents: "none",
                  width: 78,
                  height: 78,
                  borderRadius: "50%",
                  border: `2px solid rgba(61,127,232,${joyVis.active ? 0.55 : 0.22})`,
                  background: `rgba(61,127,232,${joyVis.active ? 0.10 : 0.04})`,
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                {/* Croix de guidage */}
                <div style={{ position: "absolute", width: 1, height: 28, background: "rgba(61,127,232,0.25)" }} />
                <div style={{ position: "absolute", width: 28, height: 1, background: "rgba(61,127,232,0.25)" }} />
                {/* Dot de position */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3D7FE8, #6FA8FF)",
                    boxShadow: "0 0 14px rgba(61,127,232,0.6)",
                    transform: `translate(${joyVis.x * 22}px, ${-joyVis.y * 22}px)`,
                    transition: joyVis.active ? "none" : "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                    opacity: joyVis.active ? 1 : 0.5,
                  }}
                />
              </div>

              {/* ── Indicateur rotation (droite) ────────────────────── */}
              <div
                style={{
                  position: "absolute",
                  bottom: 88,
                  right: 32,
                  zIndex: 15,
                  pointerEvents: "none",
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  border: `2px solid rgba(212,175,55,${lookActive ? 0.55 : 0.20})`,
                  background: `rgba(212,175,55,${lookActive ? 0.10 : 0.04})`,
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 2,
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <span style={{ fontSize: 16, opacity: lookActive ? 1 : 0.5 }}>↻</span>
                <span style={{
                  fontSize: 7,
                  fontFamily: "var(--font-dm-sans)",
                  color: `rgba(212,175,55,${lookActive ? 0.9 : 0.4})`,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}>
                  Vue
                </span>
              </div>
            </>
          )}
        </>
      )}

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
        <Timer />
        <EnigmaStatus />
        {/* Mini-carte de zones — rappel spatial discret */}
        <ZoneMiniMap avatarRef={avatarRef} />
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
