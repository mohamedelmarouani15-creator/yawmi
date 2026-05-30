"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Lantern from "./Lantern";

interface Props {
  onLanternTap?: () => void;
  puzzleSolved?: boolean;
}

// Texture zellige procédurale via canvas 2D
function makeZelligeTexture() {
  const size = 512;
  const c    = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const tile = size / 8;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * tile;
      const y = row * tile;
      const check = (row + col) % 2;

      // Fond de la tuile
      ctx.fillStyle = check ? "#0E4A2A" : "#0A3D22";
      ctx.fillRect(x, y, tile, tile);

      // Étoile à 8 branches
      ctx.save();
      ctx.translate(x + tile / 2, y + tile / 2);
      ctx.fillStyle = check ? "#D4AF37" : "#B8922A";
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const inner = tile * 0.15;
        const outer = tile * 0.38;
        if (i === 0) ctx.moveTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        else ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        const midAngle = angle + Math.PI / 8;
        ctx.lineTo(Math.cos(midAngle) * inner, Math.sin(midAngle) * inner);
      }
      ctx.closePath();
      ctx.fill();

      // Contour joint
      ctx.strokeStyle = "#051A0E";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Joints entre tuiles
      ctx.strokeStyle = "#051A0E";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, tile - 2, tile - 2);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function Fountain() {
  const waterRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (waterRef.current)
      waterRef.current.rotation.y = clock.getElapsedTime() * 0.15;
  });

  return (
    <group>
      <mesh receiveShadow position={[0, 0.13, 0]}>
        <cylinderGeometry args={[1.05, 1.12, 0.28, 48]} />
        <meshStandardMaterial color="#C4B89A" roughness={0.65} metalness={0.05} />
      </mesh>
      {/* Fond bassin zellige */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 48]} />
        <meshStandardMaterial color="#1A5C6A" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Eau animée */}
      <mesh ref={waterRef} position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.86, 48]} />
        <meshStandardMaterial
          color="#1a7a9e"
          transparent opacity={0.82}
          roughness={0.02}
          metalness={0.35}
          emissive="#0a3a50"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.09, 0.95, 8]} />
        <meshStandardMaterial color="#C4B89A" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.06, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.18, 0.16, 24]} />
        <meshStandardMaterial color="#C4B89A" roughness={0.6} metalness={0.05} />
      </mesh>
    </group>
  );
}

const DOOR_W = 1.6;
const DOOR_H = 2.6;

function Wall({ pos, rot, hasDoor = false }: { pos: [number, number, number]; rot: [number, number, number]; hasDoor?: boolean }) {
  const W = 7; const H = 3.8;
  const sideW = (W - DOOR_W) / 2;

  return (
    <group position={pos} rotation={rot}>
      {hasDoor ? (
        <>
          {/* Mur gauche */}
          <mesh position={[-sideW / 2 - DOOR_W / 2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[sideW, H, 0.24]} />
            <meshStandardMaterial color="#EDE5D0" roughness={0.92} />
          </mesh>
          {/* Mur droit */}
          <mesh position={[ sideW / 2 + DOOR_W / 2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[sideW, H, 0.24]} />
            <meshStandardMaterial color="#EDE5D0" roughness={0.92} />
          </mesh>
          {/* Linteau */}
          <mesh position={[0, DOOR_H / 2 + (H - DOOR_H) / 2, 0]} receiveShadow>
            <boxGeometry args={[DOOR_W, H - DOOR_H, 0.24]} />
            <meshStandardMaterial color="#EDE5D0" roughness={0.92} />
          </mesh>
          {/* Arche */}
          <mesh position={[0, DOOR_H - 0.08, 0.12]}>
            <boxGeometry args={[DOOR_W + 0.14, 0.14, 0.08]} />
            <meshStandardMaterial color="#C4B89A" roughness={0.8} />
          </mesh>
          <mesh position={[-DOOR_W / 2 - 0.07, DOOR_H / 2 - H / 2, 0.12]}>
            <boxGeometry args={[0.1, DOOR_H, 0.08]} />
            <meshStandardMaterial color="#C4B89A" roughness={0.8} />
          </mesh>
          <mesh position={[ DOOR_W / 2 + 0.07, DOOR_H / 2 - H / 2, 0.12]}>
            <boxGeometry args={[0.1, DOOR_H, 0.08]} />
            <meshStandardMaterial color="#C4B89A" roughness={0.8} />
          </mesh>
        </>
      ) : (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[W, H, 0.24]} />
          <meshStandardMaterial color="#EDE5D0" roughness={0.92} metalness={0.0} />
        </mesh>
      )}
      {/* Corniche sculptée */}
      <mesh position={[0, H / 2 + 0.06, 0.06]} castShadow>
        <boxGeometry args={[W + 0.12, 0.22, 0.32]} />
        <meshStandardMaterial color="#D8CCAC" roughness={0.85} />
      </mesh>
      {/* Bande basse décorative */}
      <mesh position={[0, -H / 2 + 0.2, 0.08]}>
        <boxGeometry args={[W, 0.12, 0.18]} />
        <meshStandardMaterial color="#C8BA9A" roughness={0.8} />
      </mesh>
      {/* Niches */}
      {[-2.1, 0, 2.1].map((x, i) => (
        <group key={i} position={[x, 0.55, 0.13]}>
          <mesh>
            <boxGeometry args={[0.62, 0.9, 0.1]} />
            <meshStandardMaterial color="#E0D7BC" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.5, 0.72, 0.05]} />
            <meshStandardMaterial color="#C8BCAA" roughness={1.0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function OrangeTree({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh castShadow>
        <cylinderGeometry args={[0.048, 0.072, 1.35, 6]} />
        <meshStandardMaterial color="#4A2E12" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.18, 0]} castShadow>
        <sphereGeometry args={[0.54, 10, 10]} />
        <meshStandardMaterial color="#1A5C2A" roughness={0.85} />
      </mesh>
      <mesh position={[0.24, 1.35, 0.18]} castShadow>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshStandardMaterial color="#206830" roughness={0.85} />
      </mesh>
      {([[0.28, 0.94, 0.24], [-0.2, 1.04, 0.3], [0.12, 1.4, -0.24]] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.068, 8, 8]} />
          <meshStandardMaterial color="#E07A0A" roughness={0.45} emissive="#E07A0A" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Stars() {
  const stars = useMemo(() => Array.from({ length: 90 }, (_, i) => {
    const phi   = Math.acos(2 * ((i * 0.618033) % 1) - 1);
    const theta = 2 * Math.PI * ((i * 0.381966) % 1);
    const r = 34;
    return {
      pos: [r * Math.sin(phi) * Math.cos(theta), Math.abs(r * Math.cos(phi)) + 1, r * Math.sin(phi) * Math.sin(theta)] as [number, number, number],
      s:   0.04 + (i % 4) * 0.018,
      br:  0.6 + (i % 3) * 0.2,
    };
  }), []);

  return (
    <>
      {stars.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[s.s, 4, 4]} />
          <meshBasicMaterial color={new THREE.Color(s.br, s.br, s.br * 1.1)} />
        </mesh>
      ))}
    </>
  );
}

export default function Courtyard({ onLanternTap, puzzleSolved }: Props) {
  const W = 7; const H = 3.8;
  const zelligeTex = useMemo(() => typeof window !== "undefined" ? makeZelligeTexture() : null, []);

  return (
    <group>
      {/* Ciel */}
      <mesh>
        <sphereGeometry args={[36, 20, 20]} />
        <meshBasicMaterial color="#06081A" side={THREE.BackSide} />
      </mesh>
      <Stars />

      {/* Éclairage dramatique : ambiant froid + lanternes chaudes */}
      <ambientLight intensity={0.22} color="#1a2550" />
      <hemisphereLight args={["#1a2550", "#080D0A", 0.3]} />
      {/* Lumière de lune — directionnelle froide */}
      <directionalLight
        position={[8, 12, 6]}
        intensity={0.35}
        color="#b8c8ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Sol zellige */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, W]} />
        <meshStandardMaterial
          map={zelligeTex ?? undefined}
          color={zelligeTex ? "#ffffff" : "#0E4A2A"}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>
      {/* Bordure pierre autour du sol */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[W * 0.5 - 0.01, W * 0.68, 4, 1, Math.PI / 4]} />
        <meshStandardMaterial color="#B8AA88" roughness={0.78} />
      </mesh>

      {/* Murs — tous avec portes */}
      <Wall pos={[0, H / 2, -W / 2]} rot={[0, 0, 0]}            hasDoor />
      <Wall pos={[0, H / 2,  W / 2]} rot={[0, Math.PI, 0]}      hasDoor />
      <Wall pos={[-W / 2, H / 2, 0]} rot={[0,  Math.PI / 2, 0]} hasDoor />
      <Wall pos={[ W / 2, H / 2, 0]} rot={[0, -Math.PI / 2, 0]} hasDoor />

      {/* Fontaine */}
      <Fountain />

      {/* Lanternes */}
      <Lantern position={[ 2.6, 0,  2.6]} color="#D4AF37" onTap={onLanternTap} solved={puzzleSolved} />
      <Lantern position={[-2.6, 0,  2.6]} color="#C88C1A" />
      <Lantern position={[ 2.6, 0, -2.6]} color="#C88C1A" />
      <Lantern position={[-2.6, 0, -2.6]} color="#B87820" />

      {/* Orangers */}
      <OrangeTree pos={[ 2.2, 0,  0  ]} />
      <OrangeTree pos={[-2.2, 0,  0  ]} />
      <OrangeTree pos={[ 0,   0,  2.2]} />
      <OrangeTree pos={[ 0,   0, -2.2]} />
    </group>
  );
}
