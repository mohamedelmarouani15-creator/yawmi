"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Texture procédurale du tapis ────────────────────────────────────
function makeTapisTexture(): THREE.CanvasTexture {
  const W = 480, H = 320;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Fond vert émeraude
  ctx.fillStyle = "#055C3F";
  ctx.fillRect(0, 0, W, H);

  // Bordure épaisse extérieure
  const B = 18;
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = B;
  ctx.strokeRect(B / 2, B / 2, W - B, H - B);

  // Bordure fine intérieure
  ctx.lineWidth = 2;
  ctx.strokeRect(B + 8, B + 8, W - (B + 8) * 2, H - (B + 8) * 2);

  // Mihrab (arche islamique en haut du tapis — indique la Qibla)
  const archCx = W / 2;
  const archBaseY = H * 0.74;
  const archW = 88, archH = 96;
  ctx.beginPath();
  ctx.moveTo(archCx - archW / 2, archBaseY);
  ctx.lineTo(archCx - archW / 2, archBaseY - archH * 0.5);
  ctx.quadraticCurveTo(archCx - archW / 2, archBaseY - archH, archCx, archBaseY - archH);
  ctx.quadraticCurveTo(archCx + archW / 2, archBaseY - archH, archCx + archW / 2, archBaseY - archH * 0.5);
  ctx.lineTo(archCx + archW / 2, archBaseY);
  ctx.closePath();
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.55;
  ctx.stroke();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = "#D4AF37";
  ctx.fill();
  ctx.globalAlpha = 1;

  // Étoile islamique à 8 branches au centre
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.22;
  const r = R * 0.42;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const radius = i % 2 === 0 ? R : r;
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#D4AF37";
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Cercle central vert (cœur de l'étoile)
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = "#055C3F";
  ctx.fill();
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Ornements losanges aux 4 coins
  [
    [B + 24, B + 24],
    [W - B - 24, B + 24],
    [B + 24, H - B - 24],
    [W - B - 24, H - B - 24],
  ].forEach(([x, y]) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(10, 0); ctx.lineTo(0, 10); ctx.lineTo(-10, 0);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-6, 0); ctx.lineTo(6, 0);
    ctx.moveTo(0, -6); ctx.lineTo(0, 6);
    ctx.stroke();
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ── Shader d'ondulation (vertex) ────────────────────────────────────
const vertexShader = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec3 pos = position;
    pos.z += sin(pos.x * 4.0 + uTime * 2.0)  * 0.020;
    pos.z += cos(pos.y * 3.0 + uTime * 1.5)  * 0.015;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform sampler2D uTex;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(uTex, vUv);
  }
`;

// ── Géométrie des franges ───────────────────────────────────────────
function makeFringeGeometry(): THREE.BufferGeometry {
  const count = 20;
  const pts: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = -0.55 + (i / (count - 1)) * 1.1;
    // Franges avant (z = -0.41)
    pts.push(x, 0, -0.41,  x, -0.08, -0.41);
    // Franges arrière (z = +0.41)
    pts.push(x, 0,  0.41,  x, -0.08,  0.41);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

// ── Composant ───────────────────────────────────────────────────────
export interface TapisVolantProps {
  basePosition?: [number, number, number];
  velocity?:     { x: number; z: number };
}

export default function TapisVolant({
  basePosition = [0, 0.3, 0],
  velocity     = { x: 0, z: 0 },
}: TapisVolantProps) {
  const groupRef    = useRef<THREE.Group>(null!);
  const uniformsRef = useRef<{
    uTime: { value: number };
    uTex:  { value: THREE.Texture | null };
  }>({ uTime: { value: 0 }, uTex: { value: null } });

  const texture  = useMemo(() => typeof window !== "undefined" ? makeTapisTexture() : null, []);
  const fringeGeo = useMemo(() => makeFringeGeometry(), []);

  // Injecter la texture dans les uniforms dès qu'elle est disponible
  if (texture && !uniformsRef.current.uTex.value) {
    uniformsRef.current.uTex.value = texture;
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    uniformsRef.current.uTime.value = t;

    if (!groupRef.current) return;

    // Flottement vertical doux
    groupRef.current.position.set(
      basePosition[0],
      basePosition[1] + Math.sin(t * 1.2) * 0.08,
      basePosition[2],
    );

    // Inclinaison vers l'avant en mouvement (style Aladin)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      velocity.z * -0.15,
      0.1,
    );
    // Inclinaison latérale dans les virages
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      velocity.x * -0.1,
      0.1,
    );
  });

  return (
    <group ref={groupRef} castShadow>
      {/* Corps du tapis — plan horizontal avec shader d'ondulation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[1.2, 0.8, 20, 20]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniformsRef.current}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Franges dorées aux deux extrémités */}
      <lineSegments geometry={fringeGeo}>
        <lineBasicMaterial color="#D4AF37" transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
}
