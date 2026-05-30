"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { SpotLight, MeshReflectorMaterial, Sparkles } from "@react-three/drei";
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

      ctx.fillStyle = check ? "#0E4A2A" : "#0A3D22";
      ctx.fillRect(x, y, tile, tile);

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

      ctx.strokeStyle = "#051A0E";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

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
      {/* Bassin marbre */}
      <mesh receiveShadow position={[0, 0.13, 0]}>
        <cylinderGeometry args={[1.05, 1.12, 0.28, 48]} />
        <meshStandardMaterial color="#C4B89A" roughness={0.65} metalness={0.05} />
      </mesh>
      {/* Fond bassin zellige */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 48]} />
        <meshStandardMaterial color="#1A5C6A" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Surface de l'eau avec MeshReflectorMaterial */}
      <mesh ref={waterRef} position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.86, 48]} />
        <MeshReflectorMaterial
          blur={[200, 100]}
          mixStrength={60}
          roughness={0.2}
          color="#1a4a5a"
          mirror={0.6}
        />
      </mesh>

      {/* Reflet lumineux eau — pointLight sous-marin */}
      <pointLight position={[0, 0.3, 0]} color="#4af" intensity={1.2} distance={2.5} decay={2} />

      {/* Colonne centrale de la fontaine */}
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
          <mesh position={[-sideW / 2 - DOOR_W / 2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[sideW, H, 0.24]} />
            <meshStandardMaterial color="#EDE5D0" roughness={0.92} />
          </mesh>
          <mesh position={[ sideW / 2 + DOOR_W / 2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[sideW, H, 0.24]} />
            <meshStandardMaterial color="#EDE5D0" roughness={0.92} />
          </mesh>
          <mesh position={[0, DOOR_H / 2 + (H - DOOR_H) / 2, 0]} receiveShadow>
            <boxGeometry args={[DOOR_W, H - DOOR_H, 0.24]} />
            <meshStandardMaterial color="#EDE5D0" roughness={0.92} />
          </mesh>
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
      {/* Niches avec éclairage doré intégré */}
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
          {/* Lumière dorée dans les niches */}
          <pointLight position={[0, 0, 0.15]} color="#D4AF37" intensity={0.8} distance={1.5} decay={2} />
        </group>
      ))}
    </group>
  );
}

// Colonnes de marbre aux 4 coins
function Column({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      {/* Fût cylindrique marbre */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.15, 3.8, 12]} />
        <meshStandardMaterial color="#E8E4D8" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Chapiteau doré */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.14, 0.22, 12]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.25} metalness={0.6} emissive="#D4AF37" emissiveIntensity={0.15} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -1.85, 0]}>
        <cylinderGeometry args={[0.2, 0.18, 0.1, 12]} />
        <meshStandardMaterial color="#C4B89A" roughness={0.5} />
      </mesh>
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
      {/* Feuillage principal */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <sphereGeometry args={[0.58, 12, 12]} />
        <meshStandardMaterial color="#1A5C2A" roughness={0.85} />
      </mesh>
      {/* Feuillage secondaire */}
      <mesh position={[0.28, 1.38, 0.2]} castShadow>
        <sphereGeometry args={[0.38, 10, 10]} />
        <meshStandardMaterial color="#206830" roughness={0.85} />
      </mesh>
      {/* Feuillage tertiaire */}
      <mesh position={[-0.22, 1.5, -0.18]} castShadow>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#1A6B2A" roughness={0.85} />
      </mesh>
      {/* Oranges */}
      {([
        [0.28, 0.94, 0.24],
        [-0.2, 1.04, 0.3],
        [0.12, 1.4, -0.24],
        [-0.32, 1.28, 0.1],
        [0.22, 1.6, 0.18],
      ] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.068, 8, 8]} />
          <meshStandardMaterial color="#E07A0A" roughness={0.45} emissive="#E07A0A" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Stars() {
  const stars = useMemo(() => Array.from({ length: 160 }, (_, i) => {
    const phi   = Math.acos(2 * ((i * 0.618033) % 1) - 1);
    const theta = 2 * Math.PI * ((i * 0.381966) % 1);
    const r = 34;
    return {
      pos: [r * Math.sin(phi) * Math.cos(theta), Math.abs(r * Math.cos(phi)) + 1, r * Math.sin(phi) * Math.sin(theta)] as [number, number, number],
      // Tailles variées : petites, moyennes, grandes
      s:   0.03 + (i % 5) * 0.022,
      br:  0.5 + (i % 4) * 0.18,
    };
  }), []);

  return (
    <>
      {stars.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[s.s, 4, 4]} />
          <meshBasicMaterial color={new THREE.Color(s.br, s.br, s.br * 1.15)} />
        </mesh>
      ))}
    </>
  );
}

// SpotLight enveloppant chaque lanterne de la cour
function LanternSpotLight({ position }: { position: [number, number, number] }) {
  return (
    <SpotLight
      position={[position[0], position[1] + 1.72, position[2]]}
      color="#FFB040"
      intensity={4}
      distance={6}
      angle={0.4}
      penumbra={0.9}
      castShadow
      attenuation={4}
    />
  );
}

export default function Courtyard({ onLanternTap, puzzleSolved }: Props) {
  const W = 7; const H = 3.8;
  const zelligeTex = useMemo(() => typeof window !== "undefined" ? makeZelligeTexture() : null, []);

  return (
    <group>
      {/* Ciel nocturne */}
      <mesh>
        <sphereGeometry args={[36, 20, 20]} />
        <meshBasicMaterial color="#06081A" side={THREE.BackSide} />
      </mesh>
      <Stars />

      {/* Éclairage : ambiant froid + lune dramatique */}
      <ambientLight intensity={0.22} color="#1a2550" />
      <hemisphereLight args={["#1a2550", "#080D0A", 0.3]} />

      {/* Lumière de lune — directionnelle froide et forte */}
      <directionalLight
        position={[5, 12, 4]}
        intensity={0.6}
        color="#8899ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
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

      {/* 4 colonnes marbre aux coins */}
      <Column pos={[ 2.8, 1.9,  2.8]} />
      <Column pos={[-2.8, 1.9,  2.8]} />
      <Column pos={[ 2.8, 1.9, -2.8]} />
      <Column pos={[-2.8, 1.9, -2.8]} />

      {/* Fontaine avec MeshReflectorMaterial */}
      <Fountain />

      {/* Lanternes + SpotLights chaudes */}
      <Lantern position={[ 2.6, 0,  2.6]} color="#D4AF37" onTap={onLanternTap} solved={puzzleSolved} />
      <Lantern position={[-2.6, 0,  2.6]} color="#C88C1A" />
      <Lantern position={[ 2.6, 0, -2.6]} color="#C88C1A" />
      <Lantern position={[-2.6, 0, -2.6]} color="#B87820" />

      {/* SpotLights drei pour chaque lanterne */}
      <LanternSpotLight position={[ 2.6, 0,  2.6]} />
      <LanternSpotLight position={[-2.6, 0,  2.6]} />
      <LanternSpotLight position={[ 2.6, 0, -2.6]} />
      <LanternSpotLight position={[-2.6, 0, -2.6]} />

      {/* Lucioles / Sparkles dans la cour */}
      <Sparkles
        count={40}
        scale={6}
        size={0.8}
        speed={0.2}
        color="#FFD080"
        opacity={0.6}
      />

      {/* Orangers améliorés */}
      {/* Arbres en diagonale — dégagent les 4 axes de vue vers les portes */}
      <OrangeTree pos={[ 2.0, 0,  2.0]} />
      <OrangeTree pos={[-2.0, 0,  2.0]} />
      <OrangeTree pos={[ 2.0, 0, -2.0]} />
      <OrangeTree pos={[-2.0, 0, -2.0]} />
    </group>
  );
}
