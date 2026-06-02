"use client";

import { useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Environment } from "@react-three/drei";
import * as THREE from "three";
import TapisVolant from "./TapisVolant";
import VirtualJoystick from "./VirtualJoystick";

const SPEED      = 4.0;  // unités/sec
const TURN_SPEED = 2.2;  // rad/sec
const BOUNDS     = { xMin: -7, xMax: 7, zMin: -10, zMax: 10 };

// ── Mouvement du tapis ──────────────────────────────────────────────
function TapisMovement({ inputRef, posRef, yawRef, velRef }: {
  inputRef: React.RefObject<{ x: number; y: number }>;
  posRef:   React.RefObject<THREE.Vector3>;
  yawRef:   React.RefObject<number>;
  velRef:   React.RefObject<{ x: number; z: number }>;
}) {
  useFrame((_, dt) => {
    const inp = inputRef.current;
    if (!inp) return;

    // Rotation (gauche/droite)
    yawRef.current += inp.x * TURN_SPEED * dt;

    // Avancement dans la direction courante
    const fwd = inp.y;
    const vx  = Math.sin(yawRef.current) * fwd * SPEED;
    const vz  = -Math.cos(yawRef.current) * fwd * SPEED;

    posRef.current.x = Math.max(BOUNDS.xMin, Math.min(BOUNDS.xMax, posRef.current.x + vx * dt));
    posRef.current.z = Math.max(BOUNDS.zMin, Math.min(BOUNDS.zMax, posRef.current.z + vz * dt));

    // Vélocité pour l'inclinaison visuelle
    velRef.current = { x: inp.x * SPEED * 0.4, z: fwd * SPEED };
  });
  return null;
}

// ── Caméra qui suit le tapis ────────────────────────────────────────
function CameraFollower({ posRef, yawRef }: {
  posRef: React.RefObject<THREE.Vector3>;
  yawRef: React.RefObject<number>;
}) {
  const targetPos  = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    const yaw = yawRef.current;
    const pos = posRef.current;

    // Derrière le tapis (+2.5 dans la direction opposée au yaw)
    targetPos.current.set(
      pos.x - Math.sin(yaw) * 2.5,
      pos.y + 1.5,
      pos.z + Math.cos(yaw) * 2.5,
    );

    camera.position.lerp(targetPos.current, 0.08);

    // Regarde vers le tapis, légèrement au-dessus du sol
    lookTarget.current.set(pos.x, pos.y + 0.3, pos.z);
    camera.lookAt(lookTarget.current);
  });
  return null;
}

// ── Sol de la bibliothèque ──────────────────────────────────────────
function LibraryFloor() {
  return (
    <>
      {/* Dalle principale */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 24]} />
        <meshStandardMaterial color="#2A1A0A" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Grille de carreaux (lignes) pour percevoir le mouvement */}
      {Array.from({ length: 11 }, (_, i) => i - 5).map(ix =>
        Array.from({ length: 13 }, (_, j) => j - 6).map(iz => (
          <mesh key={`t${ix}${iz}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[ix * 1.8, -0.499, iz * 1.8]}
          >
            <planeGeometry args={[1.72, 1.72]} />
            <meshStandardMaterial
              color={((ix + iz) % 2 === 0) ? "#1E1208" : "#241508"}
              roughness={0.9}
            />
          </mesh>
        ))
      )}

      {/* Colonnes (simples piliers de bibliothèque) */}
      {[[-5, -7], [5, -7], [-5, 7], [5, 7], [-5, 0], [5, 0]].map(([x, z]) => (
        <mesh key={`col${x}${z}`} position={[x, 1, z]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 5, 0.4]} />
          <meshStandardMaterial color="#3A2010" roughness={0.8} />
        </mesh>
      ))}

      {/* Étagères (boîtes allongées) */}
      {[[-6, -5], [-6, 0], [-6, 5], [6, -5], [6, 0], [6, 5]].map(([x, z]) => (
        <group key={`shelf${x}${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 3.2, 1.8]} />
            <meshStandardMaterial color="#1A0A02" roughness={0.9} />
          </mesh>
          {/* Livres (rectangles colorés) */}
          {[0.2, 0.5, 0.8, 1.1, 1.4, 1.7, 2.0, 2.3, 2.6].map((h, bi) => (
            <mesh key={bi} position={[(x < 0 ? 0.18 : -0.18), h - 1, (bi % 3 - 1) * 0.52]} castShadow>
              <boxGeometry args={[0.12, 0.32, 0.44]} />
              <meshStandardMaterial
                color={["#8B0000","#1A3A6B","#2E5C2E","#6B4B00","#4A0050"][bi % 5]}
                roughness={0.7}
              />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

// ── Scène principale ────────────────────────────────────────────────
function Scene({ inputRef, posRef, yawRef, velRef }: {
  inputRef: React.RefObject<{ x: number; y: number }>;
  posRef:   React.RefObject<THREE.Vector3>;
  yawRef:   React.RefObject<number>;
  velRef:   React.RefObject<{ x: number; z: number }>;
}) {
  return (
    <>
      <color attach="background" args={["#080502"]} />
      <fog attach="fog" args={["#080502", 8, 22]} />

      <Stars radius={60} depth={50} count={2000} factor={1.5} fade speed={0.3} />
      <Environment preset="night" />

      <ambientLight intensity={0.25} color="#c8a870" />
      {/* Halo doré au-dessus du tapis — suit via useFrame dans le tapis lui-même */}
      <pointLight position={[0, 4, 0]} intensity={3} color="#D4AF37" distance={10} decay={2} castShadow />
      <pointLight position={[-6, 3, 0]} intensity={1.2} color="#ff9944" distance={12} decay={2} />
      <pointLight position={[6, 3, 0]}  intensity={1.2} color="#ff9944" distance={12} decay={2} />

      <LibraryFloor />

      <TapisVolant
        basePosition={[0, 0.3, 0]}
        posRef={posRef}
        yawRef={yawRef}
        velRef={velRef}
      />

      <TapisMovement inputRef={inputRef} posRef={posRef} yawRef={yawRef} velRef={velRef} />
      <CameraFollower posRef={posRef} yawRef={yawRef} />
    </>
  );
}

// ── Export : Canvas + joystick + clavier ────────────────────────────
export default function TapisScene() {
  const inputRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const posRef   = useRef(new THREE.Vector3(0, 0.3, 0));
  const yawRef   = useRef(0);
  const velRef   = useRef({ x: 0, z: 0 });

  // Joystick onChange (vient de VirtualJoystick)
  const onJoystick = useCallback((v: { x: number; y: number }) => {
    inputRef.current = v;
  }, []);

  // Clavier WASD / flèches (desktop)
  useEffect(() => {
    const keys = new Set<string>();
    const read = () => {
      const x = (keys.has("ArrowRight") || keys.has("d") ? 1 : 0)
               - (keys.has("ArrowLeft")  || keys.has("a") ? 1 : 0);
      const y = (keys.has("ArrowUp")    || keys.has("w") ? 1 : 0)
               - (keys.has("ArrowDown")  || keys.has("s") ? 1 : 0);
      inputRef.current = { x, y };
    };
    const down = (e: KeyboardEvent) => { keys.add(e.key); read(); };
    const up   = (e: KeyboardEvent) => { keys.delete(e.key); read(); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 2, 4], fov: 65, near: 0.05, far: 60 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
        }}
        shadows
        style={{ width: "100%", height: "100%" }}
      >
        <Scene inputRef={inputRef} posRef={posRef} yawRef={yawRef} velRef={velRef} />
      </Canvas>

      {/* Joystick — en dehors du canvas, en bas à gauche */}
      <div style={{
        position: "absolute", bottom: 36, left: 28, zIndex: 20,
        touchAction: "none",
      }}>
        <VirtualJoystick onChange={onJoystick} />
      </div>

      {/* Légende clavier (desktop) */}
      <p style={{
        position: "absolute", bottom: 20, right: 20, zIndex: 10,
        pointerEvents: "none",
        color: "rgba(212,175,55,0.3)", fontSize: 9,
        fontFamily: "var(--font-dm-sans)", letterSpacing: "0.15em",
        textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        WASD · flèches
      </p>
    </>
  );
}
