"use client";

import { useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, ContactShadows, Float } from "@react-three/drei";
import LookZone from "./LookZone";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
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
const CAM_ELEV     = 0.52;
const CAM_BOUND    = 3.1;

function Controller({ moveStick, lookDelta, onPosRot }: {
  moveStick: React.RefObject<{ x: number; y: number }>;
  lookDelta: React.RefObject<{ dx: number; dy: number }>;
  onPosRot:  (pos: [number, number, number], rot: number) => void;
}) {
  const { camera } = useThree();
  const pos      = useRef(new THREE.Vector3(0, 0, 1.5));
  const azimuth  = useRef(Math.PI);
  const elevation = useRef(CAM_ELEV); // angle vertical dynamique
  const camPos   = useRef(new THREE.Vector3(0, CAM_DIST * Math.sin(CAM_ELEV), CAM_DIST * Math.cos(CAM_ELEV)));

  useFrame((_, delta) => {
    // Rotation caméra via delta de drag (style Minecraft)
    azimuth.current   += lookDelta.current.dx * 60 * delta;
    elevation.current  = THREE.MathUtils.clamp(
      elevation.current - lookDelta.current.dy * 60 * delta,
      0.15,  // min : ~8° (pas trop bas)
      1.2,   // max : ~68° (pas derrière la tête)
    );
    lookDelta.current.dx *= 0.82;
    lookDelta.current.dy *= 0.82;
    void delta;

    const mx = moveStick.current?.x ?? 0;
    const my = moveStick.current?.y ?? 0;
    const len = Math.sqrt(mx * mx + my * my);
    if (len > 0.06) {
      const fwdX = -Math.sin(azimuth.current);
      const fwdZ = -Math.cos(azimuth.current);
      const rgtX =  Math.cos(azimuth.current);
      const rgtZ = -Math.sin(azimuth.current);
      const spd = WALK_SPEED * delta;
      pos.current.x = THREE.MathUtils.clamp(pos.current.x + (fwdX * my + rgtX * mx) * spd, -PLAYER_BOUND, PLAYER_BOUND);
      pos.current.z = THREE.MathUtils.clamp(pos.current.z + (fwdZ * my + rgtZ * mx) * spd, -PLAYER_BOUND, PLAYER_BOUND);
      const d = Math.sqrt(pos.current.x ** 2 + pos.current.z ** 2);
      if (d < 1.2) { pos.current.x *= 1.2 / d; pos.current.z *= 1.2 / d; }
    }

    const cosE = Math.cos(elevation.current), sinE = Math.sin(elevation.current);
    const targetCam = new THREE.Vector3(
      THREE.MathUtils.clamp(pos.current.x + Math.sin(azimuth.current) * CAM_DIST * cosE, -CAM_BOUND, CAM_BOUND),
      pos.current.y + CAM_DIST * sinE,
      THREE.MathUtils.clamp(pos.current.z + Math.cos(azimuth.current) * CAM_DIST * cosE, -CAM_BOUND, CAM_BOUND),
    );
    camPos.current.lerp(targetCam, 1 - Math.pow(0.005, delta));
    camera.position.copy(camPos.current);
    camera.lookAt(pos.current.x, pos.current.y + 0.7, pos.current.z);

    const moveAngle = len > 0.06 ? -azimuth.current + Math.atan2(mx, my) : 0;
    onPosRot([pos.current.x, 0, pos.current.z], moveAngle);
  });

  return null;
}

// Particules flottantes autour des lanternes
function LanternParticles({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 12;
  const positions = useRef(
    Float32Array.from({ length: count * 3 }, (_, i) => {
      const idx = Math.floor(i / 3);
      if (i % 3 === 0) return (Math.random() - 0.5) * 0.6;
      if (i % 3 === 1) return Math.random() * 1.2;
      return (Math.random() - 0.5) * 0.6;
    })
  );
  const speeds = useRef(Array.from({ length: count }, () => 0.2 + Math.random() * 0.3));

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds.current[i] * 0.005;
      if (arr[i * 3 + 1] > 1.5) {
        arr[i * 3 + 1] = 0;
        arr[i * 3]     = (Math.random() - 0.5) * 0.5;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = clock.getElapsedTime() * 0.2;
  });

  return (
    <points ref={ref} position={[position[0], position[1] + 1.6, position[2]]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FFD070" size={0.035} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function RiadScene() {
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 1.5]);
  const [playerRot, setPlayerRot] = useState(0);
  const [activePuzzleId, setActive] = useState<string | null>(null);
  const [solved, setSolved] = useState<Record<string, boolean>>({});

  const moveStick = useRef({ x: 0, y: 0 });
  const lookDelta = useRef({ dx: 0, dy: 0 });

  const onMove   = useCallback((v: { x: number; y: number }) => { moveStick.current = v; }, []);
  const onLook   = useCallback((dx: number, dy: number) => {
    lookDelta.current.dx += dx;
    lookDelta.current.dy += dy;
  }, []);
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
        background: "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.88) 100%)",
      }} />

      <Canvas
        shadows="soft"
        camera={{ position: [0, CAM_DIST * Math.sin(CAM_ELEV), CAM_DIST * Math.cos(CAM_ELEV)], fov: 60, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%" }}
        gl={{
          antialias: false, // postprocessing gère l'AA
          alpha: false,
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <color attach="background" args={["#040608"]} />
        <fog attach="fog" args={["#040608", 11, 34]} />

        {/* Ciel étoilé Drei */}
        <Stars radius={32} depth={12} count={1200} factor={3} saturation={0.4} fade speed={0.4} />

        <Courtyard
          onLanternTap={() => setActive("lantern_bismillah")}
          puzzleSolved={solved["lantern_bismillah"]}
        />

        {/* Ombres au contact */}
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.55}
          scale={10}
          blur={2.5}
          far={4}
          color="#000000"
        />

        {/* Particules lanternes */}
        {[[2.6, 0, 2.6], [-2.6, 0, 2.6], [2.6, 0, -2.6], [-2.6, 0, -2.6]].map((p, i) => (
          <LanternParticles key={i} position={p as [number, number, number]} />
        ))}

        {/* Avatar flottant */}
        <Float speed={1.2} rotationIntensity={0} floatIntensity={0.08}>
          <PlayerAvatar position={playerPos} rotation={playerRot} color={PLAYER_COLORS[0]} isLocal />
        </Float>

        <Controller moveStick={moveStick} lookDelta={lookDelta} onPosRot={onPosRot} />

        {/* Post-processing */}
        <Suspense fallback={null}>
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={1.8}
              luminanceThreshold={0.25}
              luminanceSmoothing={0.6}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Joystick gauche — déplacement */}
      <div style={{ position: "absolute", bottom: 28, left: 24, zIndex: 10 }}>
        <VirtualJoystick onChange={onMove} />
      </div>

      {/* Zone droite invisible — drag pour regarder (style Minecraft) */}
      <LookZone onChange={onLook} />

      {/* HUD */}
      <p style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 10, pointerEvents: "none", color: "#D4AF37", opacity: 0.6, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-dm-sans)" }}>
        Le Riad
      </p>
      <div style={{ position: "absolute", top: 18, right: 18, zIndex: 10, display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: solved["lantern_bismillah"] ? "#05C36F" : "#D4AF37", boxShadow: `0 0 8px ${solved["lantern_bismillah"] ? "#05C36F" : "#D4AF37"}` }} />
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
