"use client";

import { useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, ContactShadows, Float } from "@react-three/drei";
import LookZone from "./LookZone";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import Courtyard    from "./Courtyard";
import { Library, Salon, Cuisine, Hammam } from "./RiadRoom";
import PlayerAvatar from "./PlayerAvatar";
import VirtualJoystick from "./VirtualJoystick";
import PuzzleModal  from "./PuzzleModal";
import { getPuzzleById } from "@/lib/escape3d/puzzles";
import { PLAYER_COLORS } from "@/lib/escape3d/types";
import { isWalkable, getRoom, ROOM_NAMES } from "@/lib/escape3d/bounds";

const WALK_SPEED = 3.2;
const CAM_DIST   = 5.5;

// Azimuth cible par pièce — caméra se place automatiquement pour voir l'intérieur
const ROOM_AZIMUTH: Record<string, number> = {
  courtyard: Math.PI,
  library:   0,
  salon:     Math.PI,
  cuisine:  -Math.PI / 2,
  hammam:    Math.PI / 2,
};

// Élévation cible par pièce
const ROOM_ELEVATION: Record<string, number> = {
  courtyard: 0.52,
  library:   0.42,
  salon:     0.42,
  cuisine:   0.42,
  hammam:    0.42,
};

function Controller({ moveStick, lookDelta, onPosRot, currentRoom }: {
  moveStick:   React.RefObject<{ x: number; y: number }>;
  lookDelta:   React.RefObject<{ dx: number; dy: number }>;
  onPosRot:    (pos: [number, number, number], rot: number) => void;
  currentRoom: string;
}) {
  const { camera } = useThree();
  const pos       = useRef(new THREE.Vector3(0, 0, 1.5));
  const azimuth   = useRef(Math.PI);
  const elevation = useRef(0.52);
  const camPos    = useRef(new THREE.Vector3(0, 3.2, 5.5));
  const prevRoom  = useRef("courtyard");

  useFrame((_, delta) => {
    // ── Auto-orientation à l'entrée d'une pièce ──────────────
    if (currentRoom !== prevRoom.current) {
      prevRoom.current = currentRoom;
      // On ne force pas l'angle si l'utilisateur est en train de drag
    }
    const targetAz  = ROOM_AZIMUTH[currentRoom]  ?? Math.PI;
    const targetEl  = ROOM_ELEVATION[currentRoom] ?? 0.52;

    // Ajustement automatique doux — seulement si le drag est inactif
    const dragging = Math.abs(lookDelta.current.dx) > 0.001 || Math.abs(lookDelta.current.dy) > 0.001;
    if (!dragging) {
      // Diff angulaire la plus courte
      let diff = targetAz - azimuth.current;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      azimuth.current   += diff   * Math.min(delta * 3.5, 1);
      elevation.current += (targetEl - elevation.current) * Math.min(delta * 3.5, 1);
    }

    // ── Drag manuel ───────────────────────────────────────────
    azimuth.current   += lookDelta.current.dx * 55 * delta;
    elevation.current  = THREE.MathUtils.clamp(
      elevation.current - lookDelta.current.dy * 55 * delta,
      0.12, 1.1,
    );
    lookDelta.current.dx *= 0.80;
    lookDelta.current.dy *= 0.80;

    // ── Mouvement relatif à l'écran ───────────────────────────
    // La caméra regarde le joueur → on dérive fwd/right de la caméra
    const mx  = moveStick.current?.x ?? 0;
    const my  = moveStick.current?.y ?? 0;
    const len = Math.sqrt(mx * mx + my * my);
    if (len > 0.06) {
      // Vecteur "vers l'écran" = direction caméra → joueur, projeté XZ
      const toCam = new THREE.Vector3(
        camPos.current.x - pos.current.x,
        0,
        camPos.current.z - pos.current.z,
      ).normalize();
      // Forward = vers le fond de l'écran (oppose de toCam)
      const fwdX = -toCam.x, fwdZ = -toCam.z;
      const rgtX = -toCam.z, rgtZ =  toCam.x; // perpendiculaire
      const spd  = WALK_SPEED * delta;
      const nx   = pos.current.x + (fwdX * my + rgtX * mx) * spd;
      const nz   = pos.current.z + (fwdZ * my + rgtZ * mx) * spd;
      if (isWalkable(nx,             pos.current.z)) pos.current.x = nx;
      if (isWalkable(pos.current.x,  nz))            pos.current.z = nz;
    }

    // ── Caméra orbitale ───────────────────────────────────────
    const cosE = Math.cos(elevation.current);
    const sinE = Math.sin(elevation.current);

    // Bounds caméra dynamiques selon la pièce
    const inRoom = currentRoom !== "courtyard";
    const bound  = inRoom ? 7.5 : 3.2;

    const targetCam = new THREE.Vector3(
      THREE.MathUtils.clamp(pos.current.x + Math.sin(azimuth.current) * CAM_DIST * cosE, -bound, bound),
      pos.current.y + CAM_DIST * sinE,
      THREE.MathUtils.clamp(pos.current.z + Math.cos(azimuth.current) * CAM_DIST * cosE, -bound, bound),
    );
    camPos.current.lerp(targetCam, 1 - Math.pow(0.004, delta));
    camera.position.copy(camPos.current);
    camera.lookAt(pos.current.x, pos.current.y + 0.7, pos.current.z);

    const faceAng = len > 0.06 ? Math.atan2(mx, my) + azimuth.current - Math.PI : playerFaceRef.current;
    playerFaceRef.current = faceAng;
    onPosRot([pos.current.x, 0, pos.current.z], faceAng);
  });

  return null;
}

// Ref externe pour la direction du visage
const playerFaceRef = { current: 0 };

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
  const [currentRoom, setCurrentRoom] = useState("courtyard");

  const moveStick = useRef({ x: 0, y: 0 });
  const lookDelta = useRef({ dx: 0, dy: 0 });

  const onMove   = useCallback((v: { x: number; y: number }) => { moveStick.current = v; }, []);
  const onLook   = useCallback((dx: number, dy: number) => {
    lookDelta.current.dx += dx;
    lookDelta.current.dy += dy;
  }, []);
  const onPosRot = useCallback((pos: [number, number, number], rot: number) => {
    setPlayerPos(pos); setPlayerRot(rot);
    setCurrentRoom(getRoom(pos[0], pos[2]));
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
        camera={{ position: [0, 3.2, 5.5], fov: 60, near: 0.1, far: 80 }}
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
        <Library  onPuzzleTap={() => setActive("library_iqra")}    solved={solved["library_iqra"]} />
        <Salon    onPuzzleTap={() => setActive("salon_sabr")}       solved={solved["salon_sabr"]} />
        <Cuisine  onPuzzleTap={() => setActive("cuisine_honey")}    solved={solved["cuisine_honey"]} />
        <Hammam   onPuzzleTap={() => setActive("hammam_taharah")}   solved={solved["hammam_taharah"]} />

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

        <Controller moveStick={moveStick} lookDelta={lookDelta} onPosRot={onPosRot} currentRoom={currentRoom} />

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
      {/* Nom de la pièce */}
      <p style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 10, pointerEvents: "none", color: "#D4AF37", opacity: 0.65, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap" }}>
        {ROOM_NAMES[currentRoom as keyof typeof ROOM_NAMES] ?? "Le Riad"}
      </p>
      {/* Compteur d'énigmes */}
      <div style={{ position: "absolute", top: 18, right: 18, zIndex: 10, display: "flex", alignItems: "center", gap: 7 }}>
        {(["lantern_bismillah","library_iqra","salon_sabr","cuisine_honey","hammam_taharah"] as const).map(id => (
          <div key={id} style={{ width: 7, height: 7, borderRadius: "50%", background: solved[id] ? "#05C36F" : "rgba(212,175,55,0.35)", boxShadow: solved[id] ? "0 0 6px #05C36F" : "none" }} />
        ))}
      </div>

      {/* Message victoire totale */}
      {["lantern_bismillah","library_iqra","salon_sabr","cuisine_honey","hammam_taharah"].every(id => solved[id]) && (
        <div style={{ position: "absolute", bottom: 155, left: 16, right: 16, zIndex: 10, background: "rgba(5,92,63,0.96)", border: "1px solid rgba(5,195,111,0.6)", borderRadius: 20, padding: "18px 24px", textAlign: "center", backdropFilter: "blur(12px)" }}>
          <p style={{ color: "#D4AF37", fontSize: 17, fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>🌙 Le riad a révélé tous ses secrets</p>
          <p style={{ color: "#F8F4EC", fontSize: 12, opacity: 0.7, marginTop: 6, fontFamily: "var(--font-dm-sans)" }}>5 énigmes résolues — la famille s'échappe ensemble</p>
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
