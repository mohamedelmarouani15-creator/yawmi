"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Texture procédurale ─────────────────────────────────────────────
function makeTapisTexture(): THREE.CanvasTexture {
  const W = 480, H = 320;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#055C3F";
  ctx.fillRect(0, 0, W, H);

  const B = 18;
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = B;
  ctx.strokeRect(B / 2, B / 2, W - B, H - B);
  ctx.lineWidth = 2;
  ctx.strokeRect(B + 8, B + 8, W - (B + 8) * 2, H - (B + 8) * 2);

  // Mihrab (arche Qibla)
  const archCx = W / 2, archBaseY = H * 0.74, archW = 88, archH = 96;
  ctx.beginPath();
  ctx.moveTo(archCx - archW / 2, archBaseY);
  ctx.lineTo(archCx - archW / 2, archBaseY - archH * 0.5);
  ctx.quadraticCurveTo(archCx - archW / 2, archBaseY - archH, archCx, archBaseY - archH);
  ctx.quadraticCurveTo(archCx + archW / 2, archBaseY - archH, archCx + archW / 2, archBaseY - archH * 0.5);
  ctx.lineTo(archCx + archW / 2, archBaseY);
  ctx.closePath();
  ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.55; ctx.stroke();
  ctx.globalAlpha = 0.07; ctx.fillStyle = "#D4AF37"; ctx.fill(); ctx.globalAlpha = 1;

  // Étoile islamique à 8 branches
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.22, r = R * 0.42;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const radius = i % 2 === 0 ? R : r;
    const angle  = (i * Math.PI) / 8 - Math.PI / 2;
    const x = cx + radius * Math.cos(angle), y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#D4AF37"; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;

  ctx.beginPath(); ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = "#055C3F"; ctx.fill();
  ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 1.5; ctx.stroke();

  // Ornements d'angle
  [[B + 24, B + 24], [W - B - 24, B + 24], [B + 24, H - B - 24], [W - B - 24, H - B - 24]].forEach(([x, y]) => {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 1.5; ctx.globalAlpha = 0.65;
    ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(10,0); ctx.lineTo(0,10); ctx.lineTo(-10,0); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(6,0); ctx.moveTo(0,-6); ctx.lineTo(0,6); ctx.stroke();
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ── Shaders ─────────────────────────────────────────────────────────
// Ondulation verticale : vagues propagées de haut en bas (axe Y du plan)
const vertexShader = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec3 pos = position;
    pos.z += sin(pos.y * 5.0 + uTime * 2.2)  * 0.022;
    pos.z += cos(pos.y * 9.0 + uTime * 3.5)  * 0.010;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
const fragmentShader = /* glsl */`
  uniform sampler2D uTex;
  varying vec2 vUv;
  void main() { gl_FragColor = texture2D(uTex, vUv); }
`;

// ── Franges ─────────────────────────────────────────────────────────
// Le tapis est debout (group.rotation.x = PI/2).
// En espace local groupe (plan XZ, mesh rotation -PI/2) :
//   - bord inférieur du tapis debout = group Z = +0.41
//   - "vers le bas" en world = +group.Z direction (world.Y = -group.Z)
function makeFringeGeometry(): THREE.BufferGeometry {
  const count = 22;
  const pts: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = -0.55 + (i / (count - 1)) * 1.1;
    pts.push(x, 0, 0.41, x, 0, 0.54);  // fringe de 13cm sous le bord inférieur
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

// ── Props ────────────────────────────────────────────────────────────
export interface TapisVolantProps {
  // Mode standalone (page de test)
  basePosition?: [number, number, number];
  velocity?:     { x: number; z: number };
  // Mode piloté (jeu complet) — les refs sont mutées par TapisScene
  posRef?:     React.RefObject<THREE.Vector3>;
  yawRef?:     React.RefObject<number>;
  velRef?:     React.RefObject<{ x: number; z: number }>;
  victoryRef?: React.RefObject<boolean>; // signal one-shot : true → déclenche la danse
}

const DANCE_DUR = 0.65; // secondes

export default function TapisVolant({
  basePosition = [0, 0.3, 0],
  velocity     = { x: 0, z: 0 },
  posRef,
  yawRef,
  velRef,
  victoryRef,
}: TapisVolantProps) {
  const groupRef       = useRef<THREE.Group>(null!);
  const defaultPos     = useRef(new THREE.Vector3(...basePosition));
  const victoryStart   = useRef<number | null>(null); // horodatage début danse
  const uniformsRef = useRef<{
    uTime: { value: number };
    uTex:  { value: THREE.Texture | null };
  }>({ uTime: { value: 0 }, uTex: { value: null } });

  const texture   = useMemo(() => typeof window !== "undefined" ? makeTapisTexture() : null, []);
  const fringeGeo = useMemo(() => makeFringeGeometry(), []);

  if (texture && !uniformsRef.current.uTex.value) uniformsRef.current.uTex.value = texture;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    uniformsRef.current.uTime.value = t;
    if (!groupRef.current) return;

    // ── Signal de victoire → déclenche la danse ──────────────────
    if (victoryRef?.current && victoryStart.current === null) {
      victoryStart.current   = t;
      victoryRef.current     = false; // consommer le signal
    }

    // ── Calcul de l'animation de danse ───────────────────────────
    let danceJumpY   = 0;
    let danceWobbleZ = 0;
    let isDancing    = false;

    if (victoryStart.current !== null) {
      const p = (t - victoryStart.current) / DANCE_DUR;
      if (p < 1) {
        isDancing    = true;
        const env    = Math.sin(p * Math.PI);                       // enveloppe 0→peak→0
        danceJumpY   = env * 0.30;                                  // saut vers le haut
        danceWobbleZ = Math.sin(p * Math.PI * 4.5) * 0.26 * env;   // ±15° x2
      } else {
        victoryStart.current = null; // fin de la danse
      }
    }

    // ── Position — ref externe ou défaut ─────────────────────────
    const base = posRef?.current ?? defaultPos.current;
    groupRef.current.position.set(
      base.x,
      base.y + Math.sin(t * 1.2) * 0.08 + danceJumpY,
      base.z,
    );

    // Orientation yaw (+PI pour que la face décorée regarde vers l'avant)
    if (yawRef) groupRef.current.rotation.y = yawRef.current + Math.PI;

    // ── Inclinaison — tapis debout (base PI/2) ───────────────────
    const vel = velRef?.current ?? velocity;

    // Inclinaison avant/arrière selon la vitesse longitudinale
    const targetRotX = isDancing      ? Math.PI / 2
                     : vel.z > 0.5    ? Math.PI / 2 - 0.30   // penché vers l'avant
                     : vel.z < -0.5   ? Math.PI / 2 + 0.30   // penché vers l'arrière
                     :                  Math.PI / 2;          // debout au repos

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      isDancing ? 0.25 : 0.10,
    );
    // Direct (pas de lerp) pendant la danse pour garder le rythme
    groupRef.current.rotation.z = isDancing
      ? danceWobbleZ
      : THREE.MathUtils.lerp(groupRef.current.rotation.z, vel.x * -0.08, 0.12);
  });

  return (
    <group ref={groupRef} castShadow>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[1.2, 0.8, 20, 20]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniformsRef.current}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={fringeGeo}>
        <lineBasicMaterial color="#D4AF37" transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
}
