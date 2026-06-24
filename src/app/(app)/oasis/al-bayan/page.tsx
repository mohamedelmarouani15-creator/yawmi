"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { useAlBayanStore } from "@/lib/al-bayan/game-store";
import { dispatchPassthroughTap } from "@/lib/touch-passthrough";

import IntroScreen from "@/components/al-bayan/ui/IntroScreen";
import AlBayanWorld from "@/components/al-bayan/world/AlBayanWorld";
import Timer from "@/components/al-bayan/ui/Timer";
import EnigmaStatus from "@/components/al-bayan/ui/EnigmaStatus";
import HintMailbox from "@/components/al-bayan/ui/HintMailbox";
import CodeLock from "@/components/al-bayan/ui/CodeLock";
import VictoryOverlay from "@/components/al-bayan/ui/VictoryOverlay";
import FailureOverlay from "@/components/al-bayan/ui/FailureOverlay";
import LookZone from "@/components/maison-sagesse/shared/LookZone";

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
  const yawRef = useRef(0);
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

  const handleLook = (dx: number) => {
    yawRef.current -= dx;
  };

  if (!mounted) return null;
  if (phase === "idle") return <IntroScreen />;

  const inGame = phase !== "victory" && phase !== "failure";
  const anyEnigmaSolved = enigmaA.solved || enigmaB.solved || enigmaC.solved;

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
        camera={{ fov: 50, near: 0.1, far: 100, position: [8, 8, 8] }}
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
                  // Pas de e.preventDefault() : touch-action:"none" suffit déjà
                  // (cf. src/lib/touch-passthrough.ts pour le détail).
                }}
                onTouchEnd={e => {
                  joystickRef.current = { x: 0, y: 0 };
                  const el = e.currentTarget as HTMLElement;
                  if (el.dataset.moved !== "1") {
                    const t = e.changedTouches[0];
                    dispatchPassthroughTap(t.clientX, t.clientY);
                  }
                }}
                onTouchCancel={() => { joystickRef.current = { x: 0, y: 0 }; }}
              />
              <LookZone onChange={handleLook} isTouchDevice={isTouchDevice} />
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
        {anyEnigmaSolved && <CodeLock />}
      </div>

      {phase === "victory" && <VictoryOverlay />}
      {phase === "failure" && <FailureOverlay />}
    </div>
  );
}
