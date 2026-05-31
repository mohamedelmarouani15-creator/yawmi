"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  position:  [number, number, number];
  isNearby:  boolean;
  isSolved:  boolean;
  id:        number;
}

// Textures de couverture canvas (généré procéduralement, titre arabe)
const COVER_LABELS: string[] = [
  "عِلْم",          // Connaissance
  "فَلَك",          // Astronomie
  "كِتَابَة",       // Écriture
  "خَرِيطَة",       // Carte
  "قُرْآن",        // Coran
];

function makeBookTexture(label: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width  = 128;
  canvas.height = 192;
  const ctx = canvas.getContext("2d")!;

  // Fond parchemin
  const grad = ctx.createLinearGradient(0, 0, 128, 192);
  grad.addColorStop(0, "#3A2510");
  grad.addColorStop(1, "#2A1808");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 192);

  // Bordure or
  ctx.strokeStyle = "rgba(212,175,55,0.55)";
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 116, 180);
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, 108, 172);

  // Lettre arabe centrée
  ctx.fillStyle = "rgba(212,175,55,0.82)";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 64, 96);

  // Trait décoratif
  ctx.strokeStyle = "rgba(212,175,55,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(20, 140); ctx.lineTo(108, 140); ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

export default function ManuscriptObject({ position, isNearby, isSolved, id }: Props) {
  const auraRef  = useRef<THREE.Mesh>(null);
  const glowRef  = useRef<THREE.PointLight>(null);
  const bookRef  = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => makeBookTexture(COVER_LABELS[id] ?? "✦"), [id]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Aura pulse
    if (auraRef.current) {
      const scale = 1 + Math.sin(t * 2.5) * 0.12;
      auraRef.current.scale.setScalar(scale);
      auraRef.current.rotation.z = t * 0.4;
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isNearby
        ? 0.55 + Math.sin(t * 3) * 0.2
        : isSolved ? 0.3 : 0;
    }

    // Lueur ponctuelle
    if (glowRef.current) {
      glowRef.current.intensity = isSolved
        ? 0.4 + Math.sin(t * 2) * 0.1
        : isNearby
          ? 0.25 + Math.sin(t * 3) * 0.1
          : 0;
    }

    // Léger flottement vertical si solved
    if (bookRef.current && isSolved) {
      bookRef.current.position.y = Math.sin(t * 1.5 + id) * 0.04;
    }
  });

  return (
    <group position={position}>
      {/* Corps du manuscrit */}
      <mesh ref={bookRef} castShadow>
        <boxGeometry args={[0.28, 0.38, 0.048]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.88}
          metalness={0.06}
          opacity={isSolved ? 1 : 0.55}
          transparent
          emissive={isSolved ? new THREE.Color("#D4AF37") : new THREE.Color("#000000")}
          emissiveIntensity={isSolved ? 0.12 : 0}
        />
      </mesh>

      {/* Tranche du manuscrit */}
      <mesh position={[-0.146, 0, 0]}>
        <boxGeometry args={[0.012, 0.38, 0.048]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Aura torique */}
      <mesh ref={auraRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.012, 8, 32]} />
        <meshBasicMaterial
          color="#D4AF37"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Seconde aura plus grande */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.4}>
        <torusGeometry args={[0.22, 0.006, 8, 32]} />
        <meshBasicMaterial
          color="#D4AF37"
          transparent
          opacity={isNearby ? 0.2 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lumière ponctuelle */}
      <pointLight
        ref={glowRef}
        color="#D4AF37"
        intensity={0}
        distance={2.5}
        decay={2}
        castShadow={false}
      />
    </group>
  );
}
