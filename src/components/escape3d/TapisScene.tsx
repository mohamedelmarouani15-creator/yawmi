"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import TapisVolant from "./TapisVolant";
import VirtualJoystick from "./VirtualJoystick";
import LibraryObjects, { LIBRARY_OBJECTS, PROX_THRESHOLD } from "./LibraryObjects";
import { getEscapeRoom } from "@/lib/game/escape-rooms";
import type { EscapeLock } from "@/lib/game/escape-rooms";
import { gameStorage } from "@/lib/game/game-storage";

const SPEED       = 4.0;
const TURN_SPEED  = 2.2;
const BOUNDS      = { xMin: -6.5, xMax: 6.5, zMin: -9.5, zMax: 9.5 };
const STORAGE_KEY = "escape_room_bibliotheque_1";
const ROOM_COLOR  = "#8B4513";

// ── Mouvement du tapis ──────────────────────────────────────────────
function TapisMovement({ inputRef, posRef, yawRef, velRef, nearIdRef }: {
  inputRef:  React.RefObject<{ x: number; y: number }>;
  posRef:    React.RefObject<THREE.Vector3>;
  yawRef:    React.RefObject<number>;
  velRef:    React.RefObject<{ x: number; z: number }>;
  nearIdRef: React.RefObject<string | null>;
}) {
  useFrame((_, dt) => {
    const inp = inputRef.current;
    if (!inp) return;

    // Ralentissement progressif près des objets
    let minDist = Infinity;
    if (nearIdRef.current) {
      const obj = LIBRARY_OBJECTS.find(o => o.id === nearIdRef.current);
      if (obj) {
        const dx = posRef.current.x - obj.position[0];
        const dz = posRef.current.z - obj.position[2];
        minDist = Math.sqrt(dx * dx + dz * dz);
      }
    }
    const speedMult = minDist < 0.85 ? 0.04
                    : minDist < PROX_THRESHOLD ? (minDist - 0.85) / (PROX_THRESHOLD - 0.85) * 0.35
                    : 1.0;

    yawRef.current += inp.x * TURN_SPEED * dt;

    const fwd = inp.y;
    const vx  = Math.sin(yawRef.current) * fwd * SPEED * speedMult;
    const vz  = -Math.cos(yawRef.current) * fwd * SPEED * speedMult;

    posRef.current.x = Math.max(BOUNDS.xMin, Math.min(BOUNDS.xMax, posRef.current.x + vx * dt));
    posRef.current.z = Math.max(BOUNDS.zMin, Math.min(BOUNDS.zMax, posRef.current.z + vz * dt));

    velRef.current = { x: inp.x * SPEED * speedMult * 0.35, z: fwd * SPEED * speedMult };
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
    targetPos.current.set(
      pos.x - Math.sin(yaw) * 2.5,
      pos.y + 1.5,
      pos.z + Math.cos(yaw) * 2.5,
    );
    camera.position.lerp(targetPos.current, 0.08);
    lookTarget.current.set(pos.x, pos.y + 0.3, pos.z);
    camera.lookAt(lookTarget.current);
  });
  return null;
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
function Scene({ inputRef, posRef, yawRef, velRef, nearIdRef, setNearId, nearId, solvedLocks, victoryRef }: {
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
      <ambientLight intensity={0.28} color="#c8a870" />
      <pointLight position={[0, 5, 0]}  intensity={3.5} color="#D4AF37" distance={12} decay={2} castShadow />
      <pointLight position={[-6, 3, 0]} intensity={1.4} color="#ff9944" distance={14} decay={2} />
      <pointLight position={[ 6, 3, 0]} intensity={1.4} color="#ff9944" distance={14} decay={2} />
      <LibraryFloor />
      <TapisVolant posRef={posRef} yawRef={yawRef} velRef={velRef} victoryRef={victoryRef} />
      <LibraryObjects nearId={nearId} solvedLocks={solvedLocks} tapisPos={posRef} />
      <TapisMovement   inputRef={inputRef} posRef={posRef} yawRef={yawRef} velRef={velRef} nearIdRef={nearIdRef} />
      <ProximityDetector posRef={posRef} nearIdRef={nearIdRef} setNearId={setNearId} />
      <CameraFollower  posRef={posRef} yawRef={yawRef} />
    </>
  );
}

// ── Modal cadenas (réutilisé depuis escape/[room]/page.tsx) ─────────
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
  const inputRef   = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const posRef     = useRef(new THREE.Vector3(0, 0.3, 0));
  const yawRef     = useRef(0);
  const velRef     = useRef({ x: 0, z: 0 });
  const nearIdRef  = useRef<string | null>(null);
  const victoryRef = useRef(false);

  const [nearId,      setNearId]      = useState<string | null>(null);
  const [activeLock,  setActiveLock]  = useState<EscapeLock | null>(null);
  const [flash,       setFlash]       = useState(false);
  const [solvedLocks, setSolvedLocks] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
  });

  const nearObj    = LIBRARY_OBJECTS.find(o => o.id === nearId) ?? null;
  const nearSolved = nearObj ? solvedLocks.includes(nearObj.lockId) : false;
  const allSolved  = solvedLocks.length >= 4;

  const solveLock = useCallback((lockId: number) => {
    setSolvedLocks(prev => {
      const next = prev.includes(lockId) ? prev : [...prev, lockId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      // Récompenses au dernier cadenas (une seule fois)
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

  const onJoystick = useCallback((v: { x: number; y: number }) => {
    inputRef.current = v;
  }, []);

  // Clavier WASD / flèches
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
          inputRef={inputRef} posRef={posRef} yawRef={yawRef}
          velRef={velRef} nearIdRef={nearIdRef} setNearId={setNearId}
          nearId={nearId} solvedLocks={solvedLocks} victoryRef={victoryRef}
        />
      </Canvas>

      {/* Flash doré — victoire cadenas */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute", inset: 0, zIndex: 15, pointerEvents: "none",
              background: "radial-gradient(ellipse at 50% 60%, rgba(212,175,55,0.38) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Joystick */}
      <div style={{ position: "absolute", bottom: 36, left: 28, zIndex: 20, touchAction: "none" }}>
        <VirtualJoystick onChange={onJoystick} />
      </div>

      {/* Légende clavier */}
      <p style={{
        position: "absolute", bottom: 20, right: 20, zIndex: 10, pointerEvents: "none",
        color: "rgba(212,175,55,0.28)", fontSize: 9, fontFamily: "var(--font-dm-sans)",
        letterSpacing: "0.15em", textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        WASD · flèches
      </p>

      {/* Bouton EXAMINER */}
      <AnimatePresence>
        {nearObj && !nearSolved && !activeLock && !allSolved && (
          <motion.div
            key="examiner"
            initial={{ y: 64, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{   y: 64, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{
              position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
              zIndex: 20, display: "flex", alignItems: "center", gap: 12,
              background: "rgba(4,6,8,0.92)", border: "1px solid rgba(212,175,55,0.38)",
              borderRadius: 28, padding: "10px 10px 10px 18px",
              backdropFilter: "blur(14px)",
              boxShadow: "0 0 28px rgba(212,175,55,0.15)",
            }}
          >
            <span style={{ fontSize: 22 }}>{nearObj.icon}</span>
            <p style={{
              color: "var(--gold)", fontSize: 11, letterSpacing: "0.1em",
              textTransform: "uppercase", fontFamily: "var(--font-dm-sans)",
              whiteSpace: "nowrap",
            }}>
              {nearObj.label}
            </p>
            <motion.button
              onClick={openExamine}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "linear-gradient(135deg,#D4AF37,#8B6914)",
                border: "none", borderRadius: 18, padding: "9px 18px",
                color: "#0A0F0D", fontSize: 11, fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.12em", textTransform: "uppercase",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Examiner
            </motion.button>
          </motion.div>
        )}

        {/* Objet déjà résolu */}
        {nearObj && nearSolved && !activeLock && (
          <motion.div
            key="solved"
            initial={{ y: 64, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{   y: 64, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{
              position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
              zIndex: 20, display: "flex", alignItems: "center", gap: 10,
              background: "rgba(4,6,8,0.88)", border: "1px solid rgba(74,222,128,0.35)",
              borderRadius: 28, padding: "10px 20px",
              backdropFilter: "blur(12px)",
            }}
          >
            <span style={{ fontSize: 18 }}>{nearObj.icon}</span>
            <p style={{
              color: "#4ade80", fontSize: 11, letterSpacing: "0.12em",
              textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap",
            }}>
              ✓ Cadenas ouvert
            </p>
          </motion.div>
        )}

        {/* Victoire */}
        {allSolved && (
          <motion.div
            key="victory"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            style={{
              position: "absolute", bottom: 80, left: 16, right: 16, zIndex: 20,
              background: "rgba(5,92,63,0.96)", border: "1px solid rgba(5,195,111,0.55)",
              borderRadius: 20, padding: "18px 24px", textAlign: "center",
              backdropFilter: "blur(12px)",
            }}
          >
            <p style={{ color: "var(--gold)", fontSize: 16, fontFamily: "var(--font-bricolage)", fontWeight: 600 }}>
              🌙 Le Tapis Voyageur a sauvé la connaissance de Tombouctou.
            </p>
            <p style={{ color: "var(--text)", fontSize: 12, opacity: 0.65, marginTop: 6, fontFamily: "var(--font-dm-sans)" }}>
              Son voyage continue…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal cadenas */}
      <AnimatePresence>
        {activeLock && (
          <LockModal
            lock={activeLock}
            onSolve={solveLock}
            onClose={() => setActiveLock(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
