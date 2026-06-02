"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import TapisVolant from "./TapisVolant";
import LibraryObjects, { LIBRARY_OBJECTS, PROX_THRESHOLD } from "./LibraryObjects";
import { getEscapeRoom } from "@/lib/game/escape-rooms";
import type { EscapeLock } from "@/lib/game/escape-rooms";
import { gameStorage } from "@/lib/game/game-storage";

const SPEED      = 4.0;    // vitesse clavier (unités/s)
const TURN_SPEED = 2.2;    // virage clavier (rad/s)
const MOVE_SPEED = 0.022;  // touch mouvement (unités/pixel) — pur avant/arrière
const LOOK_SPEED = 0.010;  // touch rotation (rad/pixel) — plus réactif
const BOUNDS     = { xMin: -6.5, xMax: 6.5, zMin: -9.5, zMax: 9.5 };
const STORAGE_KEY = "escape_room_bibliotheque_1";
const ROOM_COLOR  = "#8B4513";

// ── Mouvement du tapis ──────────────────────────────────────────────
function TapisMovement({ moveRef, lookRef, inputRef, posRef, yawRef, velRef, nearIdRef }: {
  moveRef:   React.RefObject<{ x: number; z: number }>;
  lookRef:   React.RefObject<{ x: number }>;
  inputRef:  React.RefObject<{ x: number; y: number }>;
  posRef:    React.RefObject<THREE.Vector3>;
  yawRef:    React.RefObject<number>;
  velRef:    React.RefObject<{ x: number; z: number }>;
  nearIdRef: React.RefObject<string | null>;
}) {
  useFrame((_, dt) => {
    // === ROTATION ===
    const touchLook = lookRef.current.x;           // delta touch (zone droite)
    const keyLook   = inputRef.current.x * TURN_SPEED * dt;  // clavier
    yawRef.current += touchLook + keyLook;
    lookRef.current.x = 0;                         // consommé

    // === DÉPLACEMENT — pur avant/arrière (pas de strafe touch) ===
    const mz = moveRef.current.z + inputRef.current.y * SPEED * dt;

    // Consommer moveRef : le tapis s'arrête si le doigt ne glisse plus
    moveRef.current.z = 0;

    // Signal visuel pour TapisVolant (inclinaison avant/arrière + banking virage)
    velRef.current = { x: touchLook * 12, z: mz };

    if (Math.abs(mz) < 0.0001) return;

    // Ralentissement de proximité près des objets
    let mult = 1.0;
    if (nearIdRef.current) {
      const obj = LIBRARY_OBJECTS.find(o => o.id === nearIdRef.current);
      if (obj) {
        const dx = posRef.current.x - obj.position[0];
        const dz = posRef.current.z - obj.position[2];
        const d  = Math.sqrt(dx * dx + dz * dz);
        mult = d < 0.85 ? 0.04
             : d < PROX_THRESHOLD ? (d - 0.85) / (PROX_THRESHOLD - 0.85) * 0.35
             : 1.0;
      }
    }

    const yaw  = yawRef.current;
    const newX = posRef.current.x + Math.sin(yaw) * mz * mult;
    const newZ = posRef.current.z + Math.cos(yaw) * mz * mult;
    posRef.current.x = Math.max(BOUNDS.xMin, Math.min(BOUNDS.xMax, newX));
    posRef.current.z = Math.max(BOUNDS.zMin, Math.min(BOUNDS.zMax, newZ));
  });
  return null;
}

// ── Détection de proximité ──────────────────────────────────────────
function ProximityDetector({ posRef, nearIdRef, setNearId }: {
  posRef:    React.RefObject<THREE.Vector3>;
  nearIdRef: React.MutableRefObject<string | null>;
  setNearId: (id: string | null) => void;
}) {
  useFrame(() => {
    let closest: string | null = null;
    let minDist = PROX_THRESHOLD;
    LIBRARY_OBJECTS.forEach(obj => {
      const dx = posRef.current.x - obj.position[0];
      const dz = posRef.current.z - obj.position[2];
      const d  = Math.sqrt(dx * dx + dz * dz);
      if (d < minDist) { minDist = d; closest = obj.id; }
    });
    if (closest !== nearIdRef.current) {
      nearIdRef.current = closest;
      setNearId(closest);
    }
  });
  return null;
}

// ── Caméra follow ───────────────────────────────────────────────────
function CameraFollower({ posRef, yawRef }: {
  posRef: React.RefObject<THREE.Vector3>;
  yawRef: React.RefObject<number>;
}) {
  const targetPos  = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    const yaw = yawRef.current;
    const pos = posRef.current;
    // Caméra troisième personne — style Weeplay (3.5u derrière, 2u au-dessus)
    targetPos.current.set(
      pos.x - Math.sin(yaw) * 3.5,
      pos.y + 2.0,
      pos.z - Math.cos(yaw) * 3.5,
    );
    camera.position.lerp(targetPos.current, 0.06);
    lookTarget.current.set(pos.x, pos.y + 0.4, pos.z);
    camera.lookAt(lookTarget.current);
  });
  return null;
}

// ── Spotlight qui suit le tapis ─────────────────────────────────────
function CarpetSpotLight({ posRef }: { posRef: React.RefObject<THREE.Vector3> }) {
  const lightRef = useRef<THREE.SpotLight>(null!);
  useFrame(() => {
    if (!lightRef.current || !posRef.current) return;
    const p = posRef.current;
    lightRef.current.position.set(p.x, p.y + 3.5, p.z);
    lightRef.current.target.position.set(p.x, p.y, p.z);
    lightRef.current.target.updateMatrixWorld();
  });
  return <spotLight ref={lightRef} color="#D4AF37" intensity={0.5} angle={0.4} penumbra={0.8} decay={2} distance={6} />;
}

// ── Bougie — pointLight flickering ──────────────────────────────────
function CandleLight({ position, index }: {
  position: [number, number, number];
  index:    number;
}) {
  const lightRef = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    lightRef.current.intensity = 1.6 + Math.sin(clock.getElapsedTime() * 3.5 + index * 1.7) * 0.3;
  });
  return (
    <pointLight
      ref={lightRef}
      position={position}
      color="#FF9040"
      intensity={1.6}
      distance={7}
      decay={2}
    />
  );
}

// ── Sol de la bibliothèque ──────────────────────────────────────────
function LibraryFloor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 24]} />
        <meshStandardMaterial color="#2A1A0A" roughness={0.85} metalness={0.04} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => i - 5).flatMap(ix =>
        Array.from({ length: 13 }, (_, j) => j - 6).map(iz => (
          <mesh key={`t${ix}${iz}`} rotation={[-Math.PI / 2, 0, 0]} position={[ix * 1.8, -0.499, iz * 1.8]}>
            <planeGeometry args={[1.72, 1.72]} />
            <meshStandardMaterial color={((ix + iz) % 2 === 0) ? "#1E1208" : "#241508"} roughness={0.9} />
          </mesh>
        ))
      )}
      {([[-5, -7], [5, -7], [-5, 7], [5, 7], [-5, 0], [5, 0]] as [number,number][]).map(([x, z]) => (
        <mesh key={`col${x}${z}`} position={[x, 1, z]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 5, 0.4]} />
          <meshStandardMaterial color="#3A2010" roughness={0.8} />
        </mesh>
      ))}
      {([[-6, -5], [-6, 0], [-6, 5], [6, -5], [6, 0], [6, 5]] as [number,number][]).map(([x, z]) => (
        <group key={`shelf${x}${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.28, 3.2, 1.8]} />
            <meshStandardMaterial color="#1A0A02" roughness={0.9} />
          </mesh>
          {[0.2, 0.55, 0.9, 1.25, 1.6, 1.95, 2.3, 2.65].map((h, bi) => (
            <mesh key={bi} position={[(x < 0 ? 0.17 : -0.17), h - 1, (bi % 3 - 1) * 0.52]} castShadow>
              <boxGeometry args={[0.11, 0.30, 0.44]} />
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

// ── Scène Three.js ──────────────────────────────────────────────────
function Scene({ moveRef, lookRef, inputRef, posRef, yawRef, velRef, nearIdRef, setNearId, nearId, solvedLocks, victoryRef }: {
  moveRef:    React.RefObject<{ x: number; z: number }>;
  lookRef:    React.RefObject<{ x: number }>;
  inputRef:   React.RefObject<{ x: number; y: number }>;
  posRef:     React.RefObject<THREE.Vector3>;
  yawRef:     React.RefObject<number>;
  velRef:     React.RefObject<{ x: number; z: number }>;
  nearIdRef:  React.MutableRefObject<string | null>;
  setNearId:  (id: string | null) => void;
  nearId:     string | null;
  solvedLocks: number[];
  victoryRef: React.RefObject<boolean>;
}) {
  return (
    <>
      <color attach="background" args={["#080502"]} />
      <fog attach="fog" args={["#080502", 8, 22]} />
      <Stars radius={60} depth={50} count={2000} factor={1.5} fade speed={0.3} />
      <Environment preset="night" />
      {/* Ambiance de base */}
      <ambientLight intensity={0.5} color="#0A1A0F" />
      <hemisphereLight args={[0x1A2744, 0x061A12, 0.6]} />

      {/* Lune — rayon entrant par une fenêtre imaginaire */}
      <directionalLight color="#2A4A7F" intensity={0.8} position={[-9, 8, -6]} />

      {/* Bougies sur les étagères — 6 positions, intensité pulsante */}
      <CandleLight position={[-5.5, 1.2, -5]} index={0} />
      <CandleLight position={[-5.5, 1.2,  0]} index={1} />
      <CandleLight position={[-5.5, 1.2,  5]} index={2} />
      <CandleLight position={[ 5.5, 1.2, -5]} index={3} />
      <CandleLight position={[ 5.5, 1.2,  0]} index={4} />
      <CandleLight position={[ 5.5, 1.2,  5]} index={5} />

      {/* Spots sur les manuscrits — 2 unités au-dessus de chaque objet */}
      {([[0,2,-4.5],[3.5,2,0],[-3.5,2,0],[0,2,4.5]] as [number,number,number][]).map((p, i) => (
        <pointLight key={`ms${i}`} position={p} color="#D4AF37" intensity={0.6} distance={2.5} decay={2} />
      ))}

      {/* Spotlight qui suit le tapis */}
      <CarpetSpotLight posRef={posRef} />
      <LibraryFloor />
      <TapisVolant posRef={posRef} yawRef={yawRef} velRef={velRef} victoryRef={victoryRef} />
      <LibraryObjects nearId={nearId} solvedLocks={solvedLocks} tapisPos={posRef} />
      <TapisMovement moveRef={moveRef} lookRef={lookRef} inputRef={inputRef}
        posRef={posRef} yawRef={yawRef} velRef={velRef} nearIdRef={nearIdRef} />
      <ProximityDetector posRef={posRef} nearIdRef={nearIdRef} setNearId={setNearId} />
      <CameraFollower posRef={posRef} yawRef={yawRef} />
    </>
  );
}

// ── Modal cadenas ────────────────────────────────────────────────────
function LockModal({ lock, onSolve, onClose }: {
  lock:    EscapeLock;
  onSolve: (lockId: number) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const isCorrect = selected !== null && lock.options[selected]?.correct;

  const submit = useCallback(() => {
    if (selected === null) return;
    setRevealed(true);
    if (lock.options[selected]?.correct)
      setTimeout(() => { onSolve(lock.id); onClose(); }, 1200);
  }, [selected, lock, onSolve, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.82)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
        style={{ background: "linear-gradient(180deg,#0A1A0E 0%,#061A12 100%)", border: "1px solid rgba(212,175,55,0.22)" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
            style={{ background: `${ROOM_COLOR}22` }}>{lock.icon}</div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-0.5"
              style={{ color: `${ROOM_COLOR}99`, fontFamily: "var(--font-dm-sans)" }}>Cadenas {lock.id + 1}/4</p>
            <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>{lock.label}</p>
          </div>
          <button onClick={onClose} className="ml-auto opacity-40 hover:opacity-70"
            style={{ color: "var(--text)", fontSize: 20 }}>✕</button>
        </div>

        <p className="text-base font-semibold leading-snug mb-5"
          style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>{lock.question}</p>

        <div className="flex flex-col gap-2 mb-4">
          {lock.options.map((opt, idx) => {
            let bg = "rgba(255,255,255,0.02)", border = "rgba(255,255,255,0.07)", textC = "var(--text)";
            if (revealed) {
              if (opt.correct) { bg = "rgba(74,222,128,0.09)"; border = "rgba(74,222,128,0.4)"; textC = "#4ade80"; }
              else if (selected === idx) { bg = "rgba(248,113,113,0.09)"; border = "rgba(248,113,113,0.4)"; textC = "#f87171"; }
            } else if (selected === idx) { bg = `${ROOM_COLOR}18`; border = ROOM_COLOR; textC = ROOM_COLOR; }
            return (
              <motion.button key={idx} onClick={() => !revealed && setSelected(idx)} disabled={revealed}
                whileTap={!revealed ? { scale: 0.97 } : {}}
                className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left"
                style={{ background: bg, borderColor: border }}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.05)", color: textC, fontFamily: "var(--font-dm-sans)" }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm" style={{ color: textC, fontFamily: "var(--font-dm-sans)" }}>{opt.text}</span>
              </motion.button>
            );
          })}
        </div>

        {!hintUsed
          ? <motion.button onClick={() => setHintUsed(true)} whileTap={{ scale: 0.97 }}
              className="w-full rounded-xl py-2.5 text-xs font-semibold mb-3"
              style={{ background: "rgba(255,255,255,0.03)", color: "rgba(248,244,236,0.4)",
                border: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-dm-sans)" }}>
              💡 Voir l&apos;indice (-5 pièces)
            </motion.button>
          : <p className="text-xs mb-3 px-3 py-2 rounded-xl"
              style={{ background: `${ROOM_COLOR}12`, color: `${ROOM_COLOR}cc`,
                border: `1px solid ${ROOM_COLOR}28`, fontFamily: "var(--font-dm-sans)" }}>
              💡 {lock.hint}
            </p>
        }

        <motion.button onClick={submit} disabled={selected === null || revealed}
          whileTap={selected !== null && !revealed ? { scale: 0.97 } : {}}
          className="w-full rounded-full py-3.5 text-sm font-semibold"
          style={{
            background: revealed
              ? isCorrect ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(248,113,113,0.2)"
              : selected !== null ? `linear-gradient(135deg,${ROOM_COLOR},#3A1800)` : "rgba(255,255,255,0.06)",
            color: revealed ? (isCorrect ? "var(--text)" : "#f87171") : selected !== null ? "var(--text)" : "var(--text-dim)",
            fontFamily: "var(--font-dm-sans)",
          }}>
          {revealed ? (isCorrect ? "🔓 Cadenas ouvert !" : "❌ Mauvaise réponse") : "Valider"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Export principal ────────────────────────────────────────────────
export default function TapisScene() {
  // Refs mouvement / rotation
  const moveRef   = useRef({ x: 0, z: 0 });   // touch zone gauche
  const lookRef   = useRef({ x: 0 });           // touch zone droite
  const inputRef  = useRef({ x: 0, y: 0 });    // clavier
  const posRef    = useRef(new THREE.Vector3(0, 0.5, 0));
  const yawRef    = useRef(0);
  const velRef    = useRef({ x: 0, z: 0 });    // pour les inclinaisons visuelles
  const nearIdRef = useRef<string | null>(null);
  const victoryRef = useRef(false);

  // Suivi des touches style Weeplay — une par zone max
  const moveTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const prevMove    = useRef({ x: 0, y: 0 });
  const prevLook    = useRef({ x: 0 });
  const overlayRef  = useRef<HTMLDivElement>(null);

  // Indicateur visuel zone gauche (cercle doré au point de contact)
  const [indicator, setIndicator] = useState<{ x: number; y: number } | null>(null);

  const [nearId,      setNearId]      = useState<string | null>(null);
  const [activeLock,  setActiveLock]  = useState<EscapeLock | null>(null);
  const [flash,       setFlash]       = useState(false);
  const [isPortrait,  setIsPortrait]  = useState(false);
  const [solvedLocks, setSolvedLocks] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
  });

  const nearObj    = LIBRARY_OBJECTS.find(o => o.id === nearId) ?? null;
  const nearSolved = nearObj ? solvedLocks.includes(nearObj.lockId) : false;
  const allSolved  = solvedLocks.length >= 4;

  // Chrono — 30 minutes
  const startedAtRef = useRef(typeof window !== "undefined" ? Date.now() : 0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  useEffect(() => {
    if (allSolved) return;
    const id = setInterval(() => {
      setTimeLeft(Math.max(0, 30 * 60 - Math.floor((Date.now() - startedAtRef.current) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [allSolved]);
  const timerMins   = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const timerSecs   = (timeLeft % 60).toString().padStart(2, "0");
  const timerUrgent = timeLeft < 5 * 60;

  // Détection et verrouillage de l'orientation paysage
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth);
    check();
    try {
      const orient = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      orient.lock?.("landscape")?.catch(() => {});
    } catch {}
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => { window.removeEventListener("resize", check); window.removeEventListener("orientationchange", check); };
  }, []);

  // ── Dual stick style Weeplay ──────────────────────────────────────
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      for (const touch of Array.from(e.changedTouches)) {
        const isLeft = touch.clientX < window.innerWidth * 0.5;
        if (isLeft && moveTouchId.current === null) {
          moveTouchId.current = touch.identifier;
          prevMove.current = { x: touch.clientX, y: touch.clientY };
          setIndicator({ x: touch.clientX, y: touch.clientY });
        } else if (!isLeft && lookTouchId.current === null) {
          lookTouchId.current = touch.identifier;
          prevLook.current = { x: touch.clientX };
        }
      }
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === moveTouchId.current) {
          const dx = touch.clientX - prevMove.current.x;
          const dy = touch.clientY - prevMove.current.y;
          prevMove.current = { x: touch.clientX, y: touch.clientY };
          // Axe vertical uniquement — pas de strafe touch
          moveRef.current.z = -dy * MOVE_SPEED;
        } else if (touch.identifier === lookTouchId.current) {
          const dx = touch.clientX - prevLook.current.x;
          prevLook.current = { x: touch.clientX };
          lookRef.current.x += dx * LOOK_SPEED;
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === moveTouchId.current) {
          moveTouchId.current = null;
          moveRef.current.x = 0;
          moveRef.current.z = 0;
          setIndicator(null);
        } else if (touch.identifier === lookTouchId.current) {
          lookTouchId.current = null;
        }
      }
    }

    function onTouchCancel() {
      moveTouchId.current = null;
      lookTouchId.current = null;
      moveRef.current.x = 0;
      moveRef.current.z = 0;
      setIndicator(null);
    }

    overlay.addEventListener("touchstart",  onTouchStart, { passive: false });
    overlay.addEventListener("touchmove",   onTouchMove,  { passive: false });
    overlay.addEventListener("touchend",    onTouchEnd,   { passive: true });
    overlay.addEventListener("touchcancel", onTouchCancel, { passive: true });
    return () => {
      overlay.removeEventListener("touchstart",  onTouchStart);
      overlay.removeEventListener("touchmove",   onTouchMove);
      overlay.removeEventListener("touchend",    onTouchEnd);
      overlay.removeEventListener("touchcancel", onTouchCancel);
    };
  }, []);

  // Clavier WASD / flèches (desktop)
  useEffect(() => {
    const keys = new Set<string>();
    const read = () => {
      inputRef.current = {
        x: (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0),
        y: (keys.has("ArrowUp")    || keys.has("w") ? 1 : 0) - (keys.has("ArrowDown")  || keys.has("s") ? 1 : 0),
      };
    };
    const down = (e: KeyboardEvent) => { if (!activeLock) { keys.add(e.key); read(); } };
    const up   = (e: KeyboardEvent) => { keys.delete(e.key); read(); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [activeLock]);

  const solveLock = useCallback((lockId: number) => {
    setSolvedLocks(prev => {
      const next = prev.includes(lockId) ? prev : [...prev, lockId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (next.length === 4 && prev.length < 4) {
        gameStorage.addXP(400);
        gameStorage.addCoins(100);
        gameStorage.addChest();
        gameStorage.addChest();
      }
      return next;
    });
    victoryRef.current = true;
    setFlash(true);
    setTimeout(() => setFlash(false), 480);
  }, []);

  const openExamine = useCallback(() => {
    if (!nearObj) return;
    const room = getEscapeRoom("room_bibliotheque_1");
    if (room) setActiveLock(room.locks[nearObj.lockId]);
  }, [nearObj]);

  return (
    <>
      <Canvas
        camera={{ position: [0, 2, 4], fov: 65, near: 0.05, far: 60 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
        shadows
        style={{ width: "100%", height: "100%" }}
      >
        <Scene
          moveRef={moveRef} lookRef={lookRef} inputRef={inputRef}
          posRef={posRef} yawRef={yawRef} velRef={velRef}
          nearIdRef={nearIdRef} setNearId={setNearId}
          nearId={nearId} solvedLocks={solvedLocks} victoryRef={victoryRef}
        />
      </Canvas>

      {/* Overlay invisible — capture les touches mobile */}
      <div
        ref={overlayRef}
        style={{ position: "absolute", inset: 0, zIndex: 10, touchAction: "none", userSelect: "none" }}
      />

      {/* Indicateur tactile Weeplay — cercle doré au point de contact */}
      {indicator && (
        <div style={{
          position: "absolute",
          left: indicator.x - 25,
          top:  indicator.y - 25,
          width: 50, height: 50,
          borderRadius: "50%",
          border: "2px solid #D4AF37",
          background: "transparent",
          opacity: 0.3,
          pointerEvents: "none",
          zIndex: 15,
          transition: "opacity 0.1s ease",
        }} />
      )}

      {/* Message portrait → paysage */}
      <AnimatePresence>
        {isPortrait && (
          <motion.div
            key="portrait-warning"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 50,
              background: "rgba(8,5,2,0.96)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 16,
            }}
          >
            <span style={{ fontSize: 48 }}>↻</span>
            <p style={{ color: "var(--gold)", fontSize: 18, fontWeight: 700,
              fontFamily: "var(--font-bricolage)", textAlign: "center", padding: "0 32px" }}>
              Tourne ton iPhone pour jouer
            </p>
            <p style={{ color: "rgba(248,244,236,0.45)", fontSize: 13,
              fontFamily: "var(--font-dm-sans)", textAlign: "center" }}>
              Le Tapis Voyageur se pilote en mode paysage
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash doré — victoire cadenas */}
      <AnimatePresence>
        {flash && (
          <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ position: "absolute", inset: 0, zIndex: 15, pointerEvents: "none",
              background: "radial-gradient(ellipse at 50% 60%, rgba(212,175,55,0.38) 0%, transparent 70%)" }}
          />
        )}
      </AnimatePresence>

      {/* ── Tasbih — progression des manuscrits (top centre) ─────── */}
      <div style={{
        position: "absolute",
        top: "calc(14px + env(safe-area-inset-top))",
        left: "50%", transform: "translateX(-50%)",
        zIndex: 20, pointerEvents: "none",
        display: "flex", alignItems: "center",
      }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <div style={{
                width: 16, height: 1.5,
                background: solvedLocks.includes(i - 1) && solvedLocks.includes(i)
                  ? "rgba(212,175,55,0.55)" : "rgba(212,175,55,0.15)",
              }} />
            )}
            <motion.div
              animate={solvedLocks.includes(i) ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.35 }}
              style={{
                width: solvedLocks.includes(i) ? 12 : 7,
                height: solvedLocks.includes(i) ? 12 : 7,
                borderRadius: "50%",
                background: solvedLocks.includes(i) ? "#D4AF37" : "rgba(212,175,55,0.15)",
                border: "1px solid rgba(212,175,55,0.35)",
                boxShadow: solvedLocks.includes(i) ? "0 0 8px rgba(212,175,55,0.65)" : "none",
                transition: "all 0.3s ease",
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Chrono sablier (top droite) ──────────────────────────── */}
      {!allSolved && (
        <div style={{
          position: "absolute",
          top: "calc(10px + env(safe-area-inset-top))",
          right: "calc(16px + env(safe-area-inset-right))",
          zIndex: 20, pointerEvents: "none",
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(0,0,0,0.45)",
          border: `1px solid ${timerUrgent ? "rgba(239,68,68,0.4)" : "rgba(212,175,55,0.2)"}`,
          borderRadius: 20, padding: "7px 12px",
          backdropFilter: "blur(8px)",
        }}>
          <span style={{ fontSize: 13 }}>⏳</span>
          <motion.span
            animate={timerUrgent ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{
              color: timerUrgent ? "#ef4444" : "var(--gold)",
              fontSize: 13, fontWeight: 700,
              fontFamily: "var(--font-dm-sans)", letterSpacing: "0.08em",
            }}
          >
            {timerMins}:{timerSecs}
          </motion.span>
        </div>
      )}

      {/* ── Bouton EXAMINER (bas centre) ─────────────────────────── */}
      <AnimatePresence>
        {nearObj && !nearSolved && !activeLock && !allSolved && (
          <div
            key={`examiner-${nearObj.id}`}
            style={{
              position: "absolute",
              bottom: "calc(30px + env(safe-area-inset-bottom))",
              left: "50%", transform: "translateX(-50%)",
              zIndex: 20, width: "70%", maxWidth: 400,
            }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 26, duration: 0.3 }}
            >
              <motion.button
                onClick={openExamine}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: "100%", height: 56,
                  background: "#D4AF37", color: "#061A12",
                  fontSize: 16, fontWeight: 700,
                  border: "none", borderRadius: 28, cursor: "pointer",
                  fontFamily: "var(--font-bricolage)", letterSpacing: "2px",
                  textTransform: "uppercase",
                  boxShadow: "0 0 24px rgba(212,175,55,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                <span style={{ fontSize: 20 }}>{nearObj.icon}</span>
                Examiner
              </motion.button>
              <p style={{
                textAlign: "center", marginTop: 7,
                color: "rgba(212,175,55,0.5)", fontSize: 10,
                fontFamily: "var(--font-dm-sans)", letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}>
                {nearObj.label}
              </p>
            </motion.div>
          </div>
        )}

        {/* Objet déjà résolu */}
        {nearObj && nearSolved && !activeLock && (
          <div
            key={`solved-${nearObj.id}`}
            style={{
              position: "absolute",
              bottom: "calc(30px + env(safe-area-inset-bottom))",
              left: "50%", transform: "translateX(-50%)",
              zIndex: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(4,8,5,0.88)", border: "1px solid rgba(74,222,128,0.35)",
                borderRadius: 28, padding: "12px 22px",
                backdropFilter: "blur(12px)", whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 16 }}>{nearObj.icon}</span>
              <p style={{ color: "#4ade80", fontSize: 10, letterSpacing: "0.12em",
                textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", margin: 0 }}>
                ✓ Cadenas ouvert
              </p>
            </motion.div>
          </div>
        )}

        {/* Victoire */}
        {allSolved && (
          <motion.div
            key="victory"
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "absolute", bottom: "calc(30px + env(safe-area-inset-bottom))",
              left: 16, right: 16, zIndex: 20,
              background: "rgba(5,92,63,0.96)", border: "1px solid rgba(5,195,111,0.55)",
              borderRadius: 20, padding: "18px 24px", textAlign: "center",
              backdropFilter: "blur(12px)",
            }}
          >
            <p style={{ color: "var(--gold)", fontSize: 15, fontFamily: "var(--font-bricolage)", fontWeight: 600, margin: 0 }}>
              🌙 Le Tapis Voyageur a sauvé la connaissance de Tombouctou.
            </p>
            <p style={{ color: "rgba(248,244,236,0.6)", fontSize: 11, marginTop: 6,
              fontFamily: "var(--font-dm-sans)", margin: "6px 0 0" }}>
              Son voyage continue…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal cadenas */}
      <AnimatePresence>
        {activeLock && (
          <LockModal lock={activeLock} onSolve={solveLock} onClose={() => setActiveLock(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
