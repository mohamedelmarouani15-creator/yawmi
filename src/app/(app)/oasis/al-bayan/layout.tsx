"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

import { useAlBayanStore } from "@/lib/al-bayan/game-store";
import { dispatchPassthroughTap } from "@/lib/touch-passthrough";

import WePlayAvatar from "@/components/al-bayan/scenes/WePlayAvatar";
import MainHall from "@/components/al-bayan/scenes/MainHall";
import EnigmaTemoignage from "@/components/al-bayan/scenes/EnigmaTemoignage";
import EnigmaRasm from "@/components/al-bayan/scenes/EnigmaRasm";
import EnigmaRoute from "@/components/al-bayan/scenes/EnigmaRoute";
import Timer from "@/components/al-bayan/ui/Timer";
import EnigmaStatus from "@/components/al-bayan/ui/EnigmaStatus";
import HintMailbox from "@/components/al-bayan/ui/HintMailbox";
import CodeLock from "@/components/al-bayan/ui/CodeLock";
import VictoryOverlay from "@/components/al-bayan/ui/VictoryOverlay";
import FailureOverlay from "@/components/al-bayan/ui/FailureOverlay";
import LookZone from "@/components/maison-sagesse/shared/LookZone";

// ── Constantes navigation ─────────────────────────────────────
// Caméra 3e personne : distance/hauteur fixes derrière l'avatar.
const FOLLOW_DISTANCE = 4.8;
const FOLLOW_HEIGHT = 2.6;
const FOLLOW_LERP = 0.12;

// Chaque salle a sa propre géométrie — la caméra doit être replacée et
// re-bornée à chaque changement de route (et non plus de "phase" interne,
// puisque chaque énigme est maintenant sa propre page).
type RoomKey = "hub" | "temoignage" | "rasm" | "codicilles" | "coffret";

function roomKeyFromPathname(pathname: string): RoomKey {
  const last = pathname.split("/").filter(Boolean).pop();
  if (last === "temoignage" || last === "rasm" || last === "codicilles" || last === "coffret") return last;
  return "hub";
}

const ROOM_BOUNDS: Record<RoomKey, { x: number; z: number }> = {
  hub: { x: 8, z: 6 }, coffret: { x: 8, z: 6 },
  temoignage: { x: 5.3, z: 5.3 }, rasm: { x: 5.3, z: 5.3 }, codicilles: { x: 5.3, z: 5.3 },
};
// Position de départ de l'AVATAR dans chaque salle (la caméra se déduit
// de cette position, pas l'inverse, en 3e personne).
// yaw=PI : l'avatar (et la caméra derrière lui) regarde vers -Z, où se
// trouve le contenu intéressant de chaque salle (portes, murs d'énigme).
//
// Important : la caméra se place à FOLLOW_DISTANCE (4.8) DERRIÈRE ce point
// (donc encore plus loin du centre, vers le mur dans le dos de l'avatar).
// spawn.z doit donc rester assez petit pour que spawn.z + FOLLOW_DISTANCE
// tienne dans ROOM_BOUNDS.z, sinon la caméra se retrouve hors de la salle,
// à travers le mur (c'était le bug : écran noir dans toutes les salles).
const SPAWN_POINTS: Record<RoomKey, { x: number; z: number; yaw: number }> = {
  hub: { x: 0, z: 0.8, yaw: Math.PI }, coffret: { x: 0, z: 0.8, yaw: Math.PI },
  temoignage: { x: 0, z: 0.3, yaw: Math.PI },
  rasm: { x: 0, z: 0.3, yaw: Math.PI },
  codicilles: { x: 0, z: 0.3, yaw: Math.PI },
};

// ── Tone mapping ──────────────────────────────────────────────
function ToneMappingSetup() {
  const { gl } = useThree();
  useEffect(() => {
    // Mutation impérative du renderer Three.js — API native r3f, pas un état React.
    // eslint-disable-next-line react-hooks/immutability
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.3;
  }, [gl]);
  return null;
}

// ── Caméra 3e personne — suit l'avatar (uniquement sur tactile ; sur
// desktop c'est OrbitControls, ciblé sur l'avatar, qui pilote la caméra). ──
interface CameraFollowProps {
  roomKey: RoomKey;
  isTouchDevice: boolean;
  avatarRef: React.RefObject<THREE.Group | null>;
  yawRef: React.MutableRefObject<number>;
}

// La caméra 3e personne se place à FOLLOW_DISTANCE derrière l'avatar — mais
// près d'un mur (l'avatar fait face aux portes, dos au mur opposé), ce point
// "derrière" peut tomber HORS de la salle, voire au-delà du mur lui-même
// (ex. hub : spawn.z=4.5 + FOLLOW_DISTANCE=4.8 = 9.3, alors que le mur est à
// D/2=7 et la borne de jeu à z=6). La caméra se retrouvait alors dehors,
// à regarder la salle de l'extérieur à travers un mur — d'où l'écran qui
// restait noir dans toutes les salles. On clampe donc la position calculée
// aux mêmes ROOM_BOUNDS que l'avatar, avec une petite marge anti-clipping.
function clampToRoom(x: number, z: number, bounds: { x: number; z: number }, margin = 0.4) {
  return {
    x: THREE.MathUtils.clamp(x, -bounds.x + margin, bounds.x - margin),
    z: THREE.MathUtils.clamp(z, -bounds.z + margin, bounds.z - margin),
  };
}

function CameraFollow({ roomKey, isTouchDevice, avatarRef, yawRef }: CameraFollowProps) {
  const { camera } = useThree();

  useEffect(() => {
    const spawn = SPAWN_POINTS[roomKey];
    const bounds = ROOM_BOUNDS[roomKey];
    avatarRef.current?.position.set(spawn.x, 0, spawn.z);
    yawRef.current = spawn.yaw;
    const behind = new THREE.Vector3(Math.sin(spawn.yaw), 0, Math.cos(spawn.yaw)).multiplyScalar(-FOLLOW_DISTANCE);
    const camPos = clampToRoom(spawn.x + behind.x, spawn.z + behind.z, bounds);
    camera.position.set(camPos.x, FOLLOW_HEIGHT, camPos.z);
    camera.lookAt(spawn.x, 1.2, spawn.z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomKey, camera]);

  // Sur desktop, OrbitControls gère seul la caméra — ce contrôleur ne sert
  // qu'au suivi tactile (sinon les deux systèmes se disputeraient la caméra).
  useFrame(() => {
    if (!isTouchDevice) return;
    const avatar = avatarRef.current;
    if (!avatar) return;
    const yaw = yawRef.current;
    const bounds = ROOM_BOUNDS[roomKey];
    const behind = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).multiplyScalar(-FOLLOW_DISTANCE);
    const camPos = clampToRoom(avatar.position.x + behind.x, avatar.position.z + behind.z, bounds);
    const desired = new THREE.Vector3(camPos.x, FOLLOW_HEIGHT, camPos.z);
    camera.position.lerp(desired, FOLLOW_LERP);
    camera.lookAt(avatar.position.x, 1.2, avatar.position.z);
  });

  return null;
}

// Sur desktop, garde la cible d'OrbitControls calée sur l'avatar (qui ne se
// déplace pas au clavier ici — c'est un orbit-viewer autour du personnage).
function DesktopOrbitTarget({ avatarRef, controlsRef }: { avatarRef: React.RefObject<THREE.Group | null>; controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  useFrame(() => {
    const avatar = avatarRef.current;
    const controls = controlsRef.current;
    if (!avatar || !controls) return;
    controls.target.set(avatar.position.x, 1.2, avatar.position.z);
  });
  return null;
}

function isTouchCapable(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// Voir src/lib/touch-passthrough.ts pour pourquoi un simple clic de
// synthèse ne suffit pas à ouvrir un portail 3D.

export default function AlBayanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const roomKey = roomKeyFromPathname(pathname);

  const phase = useAlBayanStore((s) => s.phase);
  const isRunning = useAlBayanStore((s) => s.isRunning);
  const tick = useAlBayanStore((s) => s.tick);
  const enigmaA = useAlBayanStore((s) => s.enigmaA);
  const enigmaB = useAlBayanStore((s) => s.enigmaB);
  const enigmaC = useAlBayanStore((s) => s.enigmaC);
  const solveEnigma = useAlBayanStore((s) => s.solveEnigma);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    // Détection client-only — indisponible côté SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouchDevice(isTouchCapable());
  }, []);

  // `phase` vient du store Zustand persisté en localStorage : côté SSR il
  // vaut toujours sa valeur par défaut ('idle'), même si une partie est déjà
  // en cours sur ce navigateur. Sans cette garde, un rechargement de page en
  // pleine partie ferait un premier rendu sans Canvas puis un second AVEC
  // Canvas dès l'hydratation — ce mismatch fait planter le reconciler R3F.
  // On attend le montage client avant de faire confiance à `phase`.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const joystickRef = useRef({ x: 0, y: 0 });
  const yawRef = useRef(0);
  const avatarRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<OrbitControlsImpl>(null);

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

  // Navigue automatiquement vers le coffret quand les 3 énigmes sont résolues.
  useEffect(() => {
    if (enigmaA.solved && enigmaB.solved && enigmaC.solved && roomKey !== "coffret" && phase === "playing") {
      router.push("/oasis/al-bayan/coffret");
    }
  }, [enigmaA.solved, enigmaB.solved, enigmaC.solved, roomKey, phase, router]);

  const handleLook = useCallback((dx: number) => {
    // En 3e personne la caméra regarde toujours l'avatar (lookAt) ; seul le
    // yaw (angle d'orbite horizontal) compte, le pitch n'est pas utilisé.
    yawRef.current -= dx;
  }, []);

  // Partie pas encore démarrée : seul le hub (écran d'intro) est valide —
  // une salle d'énigme ne peut pas s'afficher sans Canvas/jeu en cours.
  useEffect(() => {
    if (phase === "idle" && roomKey !== "hub") {
      router.replace("/oasis/al-bayan");
    }
  }, [phase, roomKey, router]);

  if (!mounted || phase === "idle") return <>{children}</>;

  const inGame = phase !== "victory" && phase !== "failure";

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
        // "percentage" = THREE.PCFShadowMap. shadows={true} demande à r3f
        // le PCFSoftShadowMap historique, que three.js a déprécié (warning
        // console à chaque frame) en faveur de PCFShadowMap.
        shadows="percentage"
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 60, near: 0.1, far: 100, position: [0, 1.7, 6] }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none" }}
      >
        <ambientLight intensity={0.3} color="#6090C0" />
        <directionalLight position={[5, 10, 5]} intensity={0.35} color="#A0C0FF" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

        {/* Le contenu de chaque route ne passe JAMAIS par `{children}` ici :
            cette prop porte l'enrobage interne du App Router (segments,
            boundaries) et le placer tel quel dans le reconciler R3F du
            Canvas casse le rendu (erreur "Script is not part of the THREE
            namespace"). La scène à afficher se déduit donc directement de
            `roomKey`, déjà calculé depuis l'URL. */}
        {roomKey === "temoignage" ? (
          <EnigmaTemoignage
            onConfirm={() => {
              solveEnigma("A");
              router.push("/oasis/al-bayan");
            }}
          />
        ) : roomKey === "rasm" ? (
          <EnigmaRasm
            onConfirm={() => {
              solveEnigma("B");
              router.push("/oasis/al-bayan");
            }}
          />
        ) : roomKey === "codicilles" ? (
          <EnigmaRoute
            onConfirm={() => {
              solveEnigma("C");
              router.push("/oasis/al-bayan");
            }}
          />
        ) : (
          <MainHall
            onOpenTemoignage={() => router.push("/oasis/al-bayan/temoignage")}
            onOpenRasm={() => router.push("/oasis/al-bayan/rasm")}
            onOpenRoute={() => router.push("/oasis/al-bayan/codicilles")}
          />
        )}
        <WePlayAvatar ref={avatarRef} joystickRef={joystickRef} yawRef={yawRef} bounds={ROOM_BOUNDS[roomKey]} />
        <CameraFollow roomKey={roomKey} isTouchDevice={isTouchDevice} avatarRef={avatarRef} yawRef={yawRef} />
        {!isTouchDevice && (
          <>
            <OrbitControls
              ref={orbitRef}
              makeDefault
              enablePan={false}
              minDistance={2}
              maxDistance={7}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2.1}
            />
            <DesktopOrbitTarget avatarRef={avatarRef} controlsRef={orbitRef} />
          </>
        )}
        <ToneMappingSetup />
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
                  // Pas de e.preventDefault() ici : ce conteneur a déjà
                  // touch-action: "none" en CSS, qui bloque le scroll/zoom du
                  // navigateur sans passer par le JS. React attache ce handler
                  // en mode passif, donc preventDefault() y échoue silencieusement
                  // et le navigateur log un avertissement à chaque mouvement —
                  // CSS suffit, ce call était redondant et inopérant.
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
              🖱️ Glisser pour orbiter
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
        {(roomKey === "coffret" || enigmaA.solved || enigmaB.solved || enigmaC.solved) && <CodeLock />}
      </div>

      {(roomKey === "temoignage" || roomKey === "rasm" || roomKey === "codicilles") && (
        <button
          onClick={() => router.push("/oasis/al-bayan")}
          style={{
            position: "absolute", top: 16, left: 16, zIndex: 20,
            display: "flex", alignItems: "center", gap: 8,
            borderRadius: 16, padding: "6px 12px",
            background: "rgba(10,15,13,0.88)",
            border: "1px solid rgba(212,175,55,0.25)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "rgba(212,175,55,0.7)",
            fontSize: 12,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← Hall
        </button>
      )}

      {phase === "victory" && <VictoryOverlay />}
      {phase === "failure" && <FailureOverlay />}
    </div>
  );
}
