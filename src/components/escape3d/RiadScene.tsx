"use client";

import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, SMAA } from "@react-three/postprocessing";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import Courtyard from "./Courtyard";
import { Library, Salon, Cuisine, Hammam } from "./RiadRoom";
import PuzzleModal from "./PuzzleModal";
import { getPuzzleById } from "@/lib/escape3d/puzzles";
import { ROOM_NAMES } from "@/lib/escape3d/bounds";
import type { RoomId } from "@/lib/escape3d/bounds";
import { useEscapeAudio } from "./useEscapeAudio";

// ── Positions caméra (hauteur œil) par pièce ──────────────────────
// Caméras placées près de l'entrée, regardant DANS la pièce (vers le mur du fond)
const ROOM_VIEWS: Record<RoomId, { pos: [number, number, number]; yaw: number }> = {
  courtyard: { pos: [0,     1.6,  0.5],  yaw: 0           }, // regard vers bibliothèque
  library:   { pos: [0,     1.6, -4.6],  yaw: 0           }, // regard vers fond (-z)
  salon:     { pos: [0,     1.6,  7.8],  yaw: 0           }, // regard vers fond (+z->-z)
  cuisine:   { pos: [4.6,   1.6,  0  ],  yaw: Math.PI/2   }, // regard vers fond (+x)
  hammam:    { pos: [-4.6,  1.6,  0  ],  yaw: -Math.PI/2  }, // regard vers fond (-x)
};

// ── Portails depuis la cour ───────────────────────────────────────
const COURTYARD_DOORS: Array<{ to: RoomId; pos: [number,number,number]; rotY: number }> = [
  { to: "library", pos: [0,   1.3, -3.4],  rotY: 0          },
  { to: "salon",   pos: [0,   1.3,  3.4],  rotY: 0          },
  { to: "cuisine", pos: [3.4, 1.3,  0  ],  rotY: Math.PI/2  },
  { to: "hammam",  pos: [-3.4,1.3,  0  ],  rotY: Math.PI/2  },
];

// ── Portails retour vers la cour (depuis chaque pièce) ────────────
const BACK_DOORS: Partial<Record<RoomId, { pos: [number,number,number]; rotY: number }>> = {
  library: { pos: [0,   1.3, -4.1],  rotY: 0         },
  salon:   { pos: [0,   1.3,  4.1],  rotY: 0         },
  cuisine: { pos: [4.1, 1.3,  0  ],  rotY: Math.PI/2 },
  hammam:  { pos: [-4.1,1.3,  0  ],  rotY: Math.PI/2 },
};

// ── Portail lumineux ──────────────────────────────────────────────
function DoorPortal({ pos, rotY, label, onClick }: {
  pos:     [number, number, number];
  rotY:    number;
  label?:  string;
  onClick: () => void;
}) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.opacity = 0.08 + 0.06 * Math.sin(clock.getElapsedTime() * 2.4);
  });

  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Zone cliquable */}
      <mesh onClick={onClick}>
        <planeGeometry args={[1.65, 2.65]} />
        <meshBasicMaterial ref={matRef} color="#D4AF37" transparent opacity={0.08}
          side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Linteau */}
      <mesh position={[0, 1.33, 0.01]}>
        <boxGeometry args={[1.72, 0.045, 0.018]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
      </mesh>
      {/* Pieds */}
      {([-0.835, 0.835] as const).map(x => (
        <mesh key={x} position={[x, 0, 0.01]}>
          <boxGeometry args={[0.028, 2.66, 0.018]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.45} />
        </mesh>
      ))}
      {/* Petite flèche indicateur */}
      {label && (
        <mesh position={[0, -1.45, 0.02]}>
          <planeGeometry args={[0.6, 0.18]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.0} />
        </mesh>
      )}
    </group>
  );
}

// ── Swipe-to-look avec inertie ─────────────────────────────────────
function InputHandler({ yawVelRef, pitchVelRef, isDraggingRef }: {
  yawVelRef:     React.RefObject<number>;
  pitchVelRef:   React.RefObject<number>;
  isDraggingRef: React.RefObject<boolean>;
}) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    let pid: number | null = null;
    let sx = 0, sy = 0, lx = 0, ly = 0;

    function down(e: PointerEvent) {
      if (pid !== null) return;
      pid = e.pointerId;
      sx = lx = e.clientX;
      sy = ly = e.clientY;
      isDraggingRef.current = false;
      // Couper l'inertie quand on recommence à toucher
      yawVelRef.current   = 0;
      pitchVelRef.current = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch {}
    }

    function move(e: PointerEvent) {
      if (e.pointerId !== pid) return;
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 7)
        isDraggingRef.current = true;
      if (isDraggingRef.current) {
        // Accumule la vélocité proportionnellement au mouvement
        yawVelRef.current   -= (e.clientX - lx) * 0.003;
        pitchVelRef.current += (e.clientY - ly) * 0.003;
      }
      lx = e.clientX; ly = e.clientY;
    }

    function up(e: PointerEvent) {
      if (e.pointerId !== pid) return;
      pid = null;
      requestAnimationFrame(() => { isDraggingRef.current = false; });
    }

    canvas.addEventListener("pointerdown",   down, { passive: true });
    canvas.addEventListener("pointermove",   move, { passive: true });
    canvas.addEventListener("pointerup",     up,   { passive: true });
    canvas.addEventListener("pointercancel", up,   { passive: true });
    return () => {
      canvas.removeEventListener("pointerdown",   down);
      canvas.removeEventListener("pointermove",   move);
      canvas.removeEventListener("pointerup",     up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [gl, yawVelRef, pitchVelRef, isDraggingRef]);

  return null;
}

// ── Contrôleur caméra avec inertie ───────────────────────────────
function CameraController({ yawRef, pitchRef, yawVelRef, pitchVelRef, currentRef }: {
  yawRef:      React.RefObject<number>;
  pitchRef:    React.RefObject<number>;
  yawVelRef:   React.RefObject<number>;
  pitchVelRef: React.RefObject<number>;
  currentRef:  React.RefObject<RoomId>;
}) {
  useFrame(({ camera }, dt) => {
    // Decay de l'inertie (frame-rate independent) — 0.92^(dt*60)
    const decay = Math.pow(0.92, dt * 60);
    yawVelRef.current   *= decay;
    pitchVelRef.current *= decay;

    // Seuil minimal pour éviter la dérive infinie
    if (Math.abs(yawVelRef.current)   < 0.0001) yawVelRef.current   = 0;
    if (Math.abs(pitchVelRef.current) < 0.0001) pitchVelRef.current = 0;

    // Intégration des vélocités dans yaw/pitch
    yawRef.current   = (yawRef.current   ?? 0) + yawVelRef.current;
    pitchRef.current = Math.max(-0.42, Math.min(0.42,
      (pitchRef.current ?? 0) + pitchVelRef.current
    ));

    // Position fixe dans la pièce courante (téléportation gérée par goTo)
    camera.position.set(...ROOM_VIEWS[currentRef.current].pos);

    // Direction de regard
    const y = yawRef.current;
    const p = pitchRef.current;
    const D = 10;
    camera.lookAt(
      camera.position.x + Math.sin(y) * D * Math.cos(p),
      camera.position.y + Math.sin(p) * D,
      camera.position.z - Math.cos(y) * D * Math.cos(p),
    );
  });

  return null;
}

// ── Scène principale ──────────────────────────────────────────────
export default function RiadScene() {
  const [room,      setRoom]      = useState<RoomId>("courtyard");
  const [puzzle,    setPuzzle]    = useState<string | null>(null);
  const [solved,    setSolved]    = useState<Record<string, boolean>>({});
  const [traveling, setTraveling] = useState(false);
  const [hint,      setHint]      = useState(true);
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [fadeLabel,   setFadeLabel]   = useState("");

  const audio = useEscapeAudio();

  const yawRef        = useRef(0);
  const pitchRef      = useRef(0);
  const yawVelRef     = useRef(0);
  const pitchVelRef   = useRef(0);
  const isDraggingRef = useRef(false);
  const currentRef    = useRef<RoomId>("courtyard");

  // Masquer l'indice après 4 secondes
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Transition fade-to-black + téléportation instantanée
  const goTo = useCallback((dest: RoomId) => {
    if (traveling || isDraggingRef.current) return;
    audio.init();  // init au premier tap (browser policy)
    audio.playFootstep();
    yawRef.current      = ROOM_VIEWS[dest].yaw;
    pitchRef.current    = 0;
    yawVelRef.current   = 0;
    pitchVelRef.current = 0;
    setFadeOpacity(1);
    setTimeout(() => {
      currentRef.current = dest;
      audio.changeRoom(dest);
      setRoom(dest);
      setTraveling(false);
      setFadeLabel(ROOM_NAMES[dest]);
      setTimeout(() => setFadeOpacity(0), 80);
    }, 300);
    setTraveling(true);
    setHint(false);
  }, [traveling, audio]);

  const openPuzzle = useCallback((id: string) => {
    if (!isDraggingRef.current) { audio.init(); setPuzzle(id); }
  }, [audio]);

  const solve = (ok: boolean) => {
    if (ok) audio.playSuccess(); else audio.playFail();
    if (puzzle && ok) setSolved(s => ({ ...s, [puzzle]: true }));
    setPuzzle(null);
  };

  const pDef   = puzzle ? getPuzzleById(puzzle) : null;
  const allDone = ["lantern_bismillah","library_iqra","salon_sabr","cuisine_honey","hammam_taharah"]
    .every(id => solved[id]);

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.52) 100%)",
      }} />

      {/* Overlay fade-to-black avec nom de pièce */}
      <div style={{
        position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
        background:"rgba(0,0,0,1)",
        opacity: fadeOpacity,
        transition: fadeOpacity===1 ? "opacity 0.3s ease-in" : "opacity 0.5s ease-out",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        {fadeOpacity > 0.5 && fadeLabel && (
          <p style={{ color:"#D4AF37", fontSize:11, letterSpacing:"0.25em", textTransform:"uppercase", fontFamily:"var(--font-dm-sans)", opacity:0.8 }}>
            {fadeLabel}
          </p>
        )}
      </div>

      <Canvas
        camera={{ position: [0, 1.6, 0.5], fov: 80, near: 0.05, far: 80 }}
        gl={{
          antialias: false, // SMAA s'occupe de l'antialiasing
          alpha: false, stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15,
        }}
        shadows
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#040608"]} />
        <fog attach="fog" args={["#040608", 20, 60]} />

        {/* Environment nocturne pour les réflexions PBR */}
        <Environment preset="night" />

        {/* Ombres douces globales */}

        {/* Décors */}
        <Courtyard
          onLanternTap={() => openPuzzle("lantern_bismillah")}
          puzzleSolved={solved["lantern_bismillah"]}
        />
        <Library  onPuzzleTap={() => openPuzzle("library_iqra")}    solved={solved["library_iqra"]}    />
        <Salon    onPuzzleTap={() => openPuzzle("salon_sabr")}      solved={solved["salon_sabr"]}      />
        <Cuisine  onPuzzleTap={() => openPuzzle("cuisine_honey")}   solved={solved["cuisine_honey"]}   />
        <Hammam   onPuzzleTap={() => openPuzzle("hammam_taharah")}  solved={solved["hammam_taharah"]}  />

        {/* Portails depuis la cour */}
        {room === "courtyard" && COURTYARD_DOORS.map(d => (
          <DoorPortal key={d.to} pos={d.pos} rotY={d.rotY}
            onClick={() => !traveling && goTo(d.to)} />
        ))}

        {/* Portail retour */}
        {room !== "courtyard" && BACK_DOORS[room] && (
          <DoorPortal
            pos={BACK_DOORS[room]!.pos}
            rotY={BACK_DOORS[room]!.rotY}
            onClick={() => !traveling && goTo("courtyard")}
          />
        )}

        <InputHandler
          yawVelRef={yawVelRef}
          pitchVelRef={pitchVelRef}
          isDraggingRef={isDraggingRef}
        />
        <CameraController
          yawRef={yawRef}
          pitchRef={pitchRef}
          yawVelRef={yawVelRef}
          pitchVelRef={pitchVelRef}
          currentRef={currentRef}
        />

        <Suspense fallback={null}>
          <EffectComposer multisampling={0}>
            <SMAA />
            <Bloom intensity={1.6} luminanceThreshold={0.28} luminanceSmoothing={0.6} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Nom de la pièce */}
      <p style={{
        position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, pointerEvents: "none",
        color: "#D4AF37", opacity: 0.6, fontSize: 10,
        letterSpacing: "0.2em", textTransform: "uppercase",
        fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap",
      }}>
        {ROOM_NAMES[room]}
      </p>

      {/* Dots énigmes */}
      <div style={{ position: "absolute", top: 18, right: 18, zIndex: 10, display: "flex", gap: 6 }}>
        {["lantern_bismillah","library_iqra","salon_sabr","cuisine_honey","hammam_taharah"].map(id => (
          <div key={id} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: solved[id] ? "#05C36F" : "rgba(212,175,55,0.28)",
            boxShadow: solved[id] ? "0 0 6px #05C36F" : "none",
            transition: "all 0.4s",
          }} />
        ))}
      </div>

      {/* Indice initial */}
      {hint && (
        <p style={{
          position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
          zIndex: 10, pointerEvents: "none",
          color: "rgba(212,175,55,0.5)", fontSize: 10, letterSpacing: "0.14em",
          textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap",
          animation: "fadeOut 1s 3s forwards",
        }}>
          Glisse pour regarder · Touche les portes pour entrer
        </p>
      )}

      {/* Bouton retour */}
      {room !== "courtyard" && !traveling && (
        <button
          onClick={() => goTo("courtyard")}
          style={{
            position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)",
            zIndex: 10,
            background: "rgba(4,6,8,0.75)", border: "1px solid rgba(212,175,55,0.28)",
            borderRadius: 24, padding: "9px 20px",
            color: "#D4AF37", fontSize: 10, letterSpacing: "0.14em",
            textTransform: "uppercase", fontFamily: "var(--font-dm-sans)",
            cursor: "pointer", backdropFilter: "blur(10px)",
          }}>
          ← Cour centrale
        </button>
      )}

      {/* Victoire */}
      {allDone && (
        <div style={{
          position: "absolute", bottom: 90, left: 16, right: 16, zIndex: 10,
          background: "rgba(5,92,63,0.96)", border: "1px solid rgba(5,195,111,0.55)",
          borderRadius: 20, padding: "18px 24px", textAlign: "center",
          backdropFilter: "blur(12px)",
        }}>
          <p style={{ color: "#D4AF37", fontSize: 16, fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>
            🌙 Le riad a livré tous ses secrets
          </p>
          <p style={{ color: "#F8F4EC", fontSize: 12, opacity: 0.7, marginTop: 5,
            fontFamily: "var(--font-dm-sans)" }}>
            5 énigmes résolues — la famille s&apos;échappe
          </p>
        </div>
      )}

      {/* Indicateur centre écran — visible dans les pièces */}
      {room !== "courtyard" && !puzzle && (
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          zIndex:8, pointerEvents:"none",
          width:6, height:6, borderRadius:"50%",
          background:"rgba(212,175,55,0.7)",
          boxShadow:"0 0 8px rgba(212,175,55,0.5)",
        }} />
      )}

      {/* Modal énigme */}
      {pDef && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <PuzzleModal puzzle={pDef} onSolve={solve} onClose={() => setPuzzle(null)} />
        </div>
      )}

      <style>{`
        @keyframes fadeOut { to { opacity: 0; } }
      `}</style>
    </div>
  );
}
