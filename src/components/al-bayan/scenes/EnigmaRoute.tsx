"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import { CITY_CANDIDATES, REQUIRED_CITIES } from "@/lib/al-bayan/puzzle-logic";

// Positions des villes sur la carte (table au centre de la salle)
const CITY_POSITIONS: Record<string, [number, number]> = {
  medine:    [0, 0.3],
  bassora:   [1.6, -0.7],
  koufa:     [1.2, 0.9],
  damas:     [0.4, 1.6],
  le_caire:  [-1.6, -0.5],
  bahrein:   [2.2, 0.2],
  yemen:     [0.8, -1.7],
  jerusalem: [-0.8, 1.4],
};

interface CityNodeProps {
  id: string;
  name: string;
  active: boolean;
  position: [number, number];
  onToggle: () => void;
}

function CityNode({ name, active, position, onToggle }: CityNodeProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime();
      matRef.current.emissiveIntensity = active ? 0.8 + Math.sin(t * 2) * 0.2 : hovered ? 0.4 : 0.15;
    }
  });

  return (
    <group
      position={[position[0], 0.05, position[1]]}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.06, 16]} />
        <meshStandardMaterial ref={matRef} color={active ? "#34d399" : "#8B6914"} emissive={active ? "#34d399" : "#C8A84B"} emissiveIntensity={0.2} roughness={0.5} metalness={0.6} />
      </mesh>
      <Html position={[0, 0.25, 0]} center>
        <span style={{ fontSize: 9, color: active ? "#34d399" : "rgba(248,244,236,0.65)", fontFamily: "var(--font-dm-sans)", fontWeight: active ? 800 : 600, whiteSpace: "nowrap", pointerEvents: "none" }}>
          {active ? "✓ " : ""}{name}
        </span>
      </Html>
    </group>
  );
}

function MapTable({ activated, onToggleCity }: { activated: Set<string>; onToggleCity: (id: string) => void }) {
  const tableMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1B3A2E", roughness: 0.6, metalness: 0.1 }), []);

  return (
    <group position={[0, 0.5, 0]}>
      <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.2, 3.4, 0.1, 24]} />
        <primitive object={tableMat} attach="material" />
      </mesh>
      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1, 12]} />
        <meshStandardMaterial color="#5C3D1A" roughness={0.6} metalness={0.4} />
      </mesh>

      {CITY_CANDIDATES.map((city) => (
        <CityNode
          key={city.id}
          id={city.id}
          name={city.name}
          active={activated.has(city.id)}
          position={CITY_POSITIONS[city.id]}
          onToggle={() => onToggleCity(city.id)}
        />
      ))}
    </group>
  );
}

interface EnigmaRouteProps {
  onConfirm?: () => void;
}

export default function EnigmaRoute({ onConfirm }: EnigmaRouteProps) {
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0E1A14", roughness: 0.92 }), []);
  const [activated, setActivated] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleCity = (id: string) => {
    setActivated((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setFeedback(null);
  };

  const handleConfirm = () => {
    const required = new Set(REQUIRED_CITIES);
    const matches = activated.size === required.size && [...activated].every((id) => required.has(id));
    if (matches) {
      onConfirm?.();
    } else {
      setFeedback(`${activated.size} ville${activated.size > 1 ? "s" : ""} activée${activated.size > 1 ? "s" : ""} — ce n'est pas encore le bon ensemble...`);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <group>
      <ambientLight color="#0a1410" intensity={0.35} />
      <pointLight color="#34d399" intensity={1.4} distance={14} decay={1.6} position={[0, 5, 0]} />

      <mesh position={[0, 3, -6]} receiveShadow castShadow><boxGeometry args={[12, 6, 0.25]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh position={[0, 3, 6]} receiveShadow castShadow><boxGeometry args={[12, 6, 0.25]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh position={[-6, 3, 0]} receiveShadow castShadow><boxGeometry args={[0.25, 6, 12]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh position={[6, 3, 0]} receiveShadow castShadow><boxGeometry args={[0.25, 6, 12]} /><primitive object={wallMat} attach="material" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#0A1410" roughness={0.7} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#060A08" roughness={0.95} /></mesh>

      <MapTable activated={activated} onToggleCity={toggleCity} />

      <Html position={[0, 3.3, -2]} center>
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleConfirm}
            style={{ pointerEvents: "auto", background: "linear-gradient(135deg,#1a7a4f,#34d399)", border: "1px solid rgba(52,211,153,0.7)", color: "#0A0F0D", fontFamily: "var(--font-dm-sans)", fontWeight: 800, fontSize: 11, borderRadius: 10, padding: "8px 16px", cursor: "pointer" }}
          >
            Sceller la route ({activated.size} ville{activated.size > 1 ? "s" : ""})
          </button>
          {feedback && (
            <span style={{ fontSize: 10, color: "#f87171", fontFamily: "var(--font-dm-sans)", fontWeight: 700, textShadow: "0 0 8px rgba(0,0,0,0.8)" }}>
              {feedback}
            </span>
          )}
        </div>
      </Html>

      <CandleLight position={[-4.5, 0.4, -4.5]} intensity={1.0} />
      <CandleLight position={[4.5, 0.4, -4.5]} intensity={1.0} />
      <AmbientParticles />
    </group>
  );
}
