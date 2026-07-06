"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import ProximityPrompt from "../shared/ProximityPrompt";
import InteractiveAura from "../../al-bayan/shared/InteractiveAura";
import ZoneWall from "../../al-bayan/shared/ZoneWall";
import { QIBLA_BEARING_DEG, QIBLA_TOLERANCE_DEG } from "@/lib/maison-sagesse/puzzle-logic";
import { QUEST_SIZE, CORRIDOR_HALF_WIDTH } from "@/lib/maison-sagesse/zone-layout";

const { W: SIZE, H } = QUEST_SIZE;
const GAP = CORRIDOR_HALF_WIDTH;

function normalizeDeg(rad: number): number {
  const deg = (rad * 180) / Math.PI;
  return ((deg % 360) + 360) % 360;
}

function isWithinQiblaTolerance(headingDeg: number): boolean {
  const diff = Math.abs(headingDeg - QIBLA_BEARING_DEG);
  return Math.min(diff, 360 - diff) <= QIBLA_TOLERANCE_DEG;
}

const CELESTIAL_BODIES = [
  { nameAr: "الشمس", nameFr: "Shams", radius: 0.55, orbitR: 0, color: "#FFD700", emissive: "#FF8800", emissiveInt: 1.2 },
  { nameAr: "القمر", nameFr: "Qamar", radius: 0.28, orbitR: 2.8, color: "#E8E8D0", emissive: "#C0C0A0", emissiveInt: 0.3 },
  { nameAr: "عطارد", nameFr: "Otarid", radius: 0.14, orbitR: 1.8, color: "#B0A080", emissive: "#806040", emissiveInt: 0.1 },
  { nameAr: "الزهرة", nameFr: "Zouhra", radius: 0.22, orbitR: 2.3, color: "#E8D0A0", emissive: "#C0A060", emissiveInt: 0.2 },
  { nameAr: "المريخ", nameFr: "Marikh", radius: 0.18, orbitR: 3.5, color: "#C05030", emissive: "#A03020", emissiveInt: 0.15 },
  { nameAr: "المشتري", nameFr: "Mushtari", radius: 0.32, orbitR: 4.3, color: "#C0A070", emissive: "#907050", emissiveInt: 0.1 },
  { nameAr: "زحل", nameFr: "Zuhal", radius: 0.26, orbitR: 5.2, color: "#C0B060", emissive: "#907040", emissiveInt: 0.1 },
];

interface PlanetaryBodyProps {
  data: typeof CELESTIAL_BODIES[0];
  index: number;
  orbitSpeed: number;
  orbitY: number;
  discovered?: boolean;
}

function PlanetaryBody({ data, index, orbitSpeed, orbitY, discovered }: PlanetaryBodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => (index / CELESTIAL_BODIES.length) * Math.PI * 2, [index]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current && data.orbitR > 0) {
      groupRef.current.position.x = Math.cos(t * orbitSpeed + phase) * data.orbitR;
      groupRef.current.position.z = Math.sin(t * orbitSpeed + phase) * data.orbitR;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: discovered ? "#34d399" : data.emissive,
        emissiveIntensity: discovered ? 0.7 : data.emissiveInt,
        roughness: data.nameAr === "الشمس" ? 0.2 : 0.8,
        metalness: data.nameAr === "الشمس" ? 0 : 0.1,
      }),
    [data, discovered]
  );

  return (
    <group ref={groupRef} position={[data.orbitR, orbitY, 0]}>
      <mesh ref={meshRef} material={mat} castShadow userData={{ noCollide: true }}>
        <sphereGeometry args={[data.radius, 16, 12]} />
      </mesh>

      {data.orbitR === 0 && (
        <>
          <mesh userData={{ noCollide: true }}>
            <sphereGeometry args={[data.radius * 1.35, 12, 10]} />
            <meshStandardMaterial color="#FFD700" transparent opacity={0.12} roughness={1} depthWrite={false} />
          </mesh>
          <pointLight color="#FFD700" intensity={3} distance={12} decay={1.5} />
        </>
      )}

      {data.nameFr === "Zuhal" && (
        <mesh rotation={[Math.PI * 0.2, 0, 0]} userData={{ noCollide: true }}>
          <torusGeometry args={[data.radius * 1.6, data.radius * 0.12, 3, 32]} />
          <meshStandardMaterial color="#D4C060" roughness={0.7} transparent opacity={0.7} />
        </mesh>
      )}

      <Html position={[0, data.radius + 0.25, 0]} center>
        <span style={{ color: discovered ? "#34d399" : "#D4AF37", fontSize: data.orbitR === 0 ? "12px" : "9px", fontFamily: "serif", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(212,175,55,0.8)", pointerEvents: "none", direction: "rtl" }}>
          {data.nameAr}{discovered ? " ✓" : ""}
        </span>
      </Html>
    </group>
  );
}

function Ring({ rx = 0, ry = 0, rz = 0, r = 1.1, material }: { rx?: number; ry?: number; rz?: number; r?: number; material: THREE.Material }) {
  return (
    <mesh rotation={[rx, ry, rz]} userData={{ noCollide: true }}>
      <torusGeometry args={[r, 0.03, 6, 40]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function ArmillarySphere() {
  const outerRef = useRef<THREE.Group>(null);
  const middleRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) outerRef.current.rotation.y = t * 0.22;
    if (middleRef.current) middleRef.current.rotation.x = t * 0.18;
    if (innerRef.current) innerRef.current.rotation.z = t * 0.14;
  });

  const ringMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C8A84B",
        emissive: "#7A5A20",
        emissiveIntensity: 0.25,
        roughness: 0.4,
        metalness: 0.7,
      }),
    []
  );

  return (
    <group position={[0, 1.2, 3]} userData={{ noCollide: true }}>
      <mesh position={[0, -1.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 1.2, 8]} />
        <meshStandardMaterial color="#5C3D1A" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, -2.2, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.1, 10]} />
        <meshStandardMaterial color="#5C3D1A" roughness={0.6} metalness={0.5} />
      </mesh>

      <group ref={outerRef}>
        <Ring rx={0} ry={0} rz={0} r={1.1} material={ringMat} />
        <Ring rx={0} ry={Math.PI / 3} rz={0} r={1.05} material={ringMat} />
        <Ring rx={0} ry={-Math.PI / 3} rz={0} r={1.05} material={ringMat} />
      </group>
      <group ref={middleRef}>
        <Ring rx={Math.PI / 4} ry={0} rz={0} r={0.9} material={ringMat} />
        <Ring rx={-Math.PI / 4} ry={0} rz={0} r={0.88} material={ringMat} />
      </group>
      <group ref={innerRef}>
        <Ring rx={0} ry={0} rz={Math.PI / 6} r={0.7} material={ringMat} />
        <Ring rx={0} ry={0} rz={-Math.PI / 6} r={0.68} material={ringMat} />
      </group>
      <mesh>
        <sphereGeometry args={[0.4, 14, 10]} />
        <meshStandardMaterial color="#1B3A6B" emissive="#0A1A40" emissiveIntensity={0.5} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

function AstrolabeTable({ rotY }: { rotY: number }) {
  const diskMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C8A84B",
        emissive: "#7A5A20",
        emissiveIntensity: 0.2,
        roughness: 0.35,
        metalness: 0.75,
      }),
    []
  );

  return (
    <group position={[-4, 0, 2]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.07, 1.3]} />
        <meshStandardMaterial color="#3D2010" roughness={0.85} />
      </mesh>
      {[-0.7, 0.7].flatMap((x) =>
        [-0.5, 0.5].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.2, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
            <meshStandardMaterial color="#2C1810" roughness={0.9} />
          </mesh>
        ))
      )}
      <group position={[0, 0.56, 0]} rotation={[Math.PI / 2, rotY, 0]} userData={{ noCollide: true }}>
        <mesh material={diskMat} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.04, 32]} />
        </mesh>
        {[0.55, 0.4, 0.25].map((r) => (
          <mesh key={r} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.025]}>
            <torusGeometry args={[r, 0.008, 4, 32]} />
            <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.8} />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.03]}>
          <boxGeometry args={[1.3, 0.03, 0.015]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function OrbitRing({ radius }: { radius: number }) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1B3A6B",
        transparent: true,
        opacity: 0.2,
        roughness: 1,
        depthWrite: false,
      }),
    []
  );
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ noCollide: true }}>
      <torusGeometry args={[radius, 0.012, 3, 60]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

interface QuestScienceProps {
  onConfirm?: () => void;
  avatarRef: React.RefObject<THREE.Group | null>;
  zoneOffset: readonly [number, number, number];
}

export default function QuestScience({ onConfirm, avatarRef, zoneOffset }: QuestScienceProps) {
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#06061A", roughness: 0.95 }), []);

  const [rotY, setRotY] = useState(0);
  const [discovered, setDiscovered] = useState<Set<number>>(new Set());

  const headingDeg = useMemo(() => normalizeDeg(rotY), [rotY]);
  const angleOk = isWithinQiblaTolerance(headingDeg);
  const allFound = discovered.size === CELESTIAL_BODIES.length;
  const ready = angleOk && allFound;

  const observeNextPlanet = () => {
    setDiscovered((prev) => {
      if (prev.size >= CELESTIAL_BODIES.length) return prev;
      const next = new Set(prev);
      for (let i = 0; i < CELESTIAL_BODIES.length; i++) {
        if (!next.has(i)) { next.add(i); break; }
      }
      return next;
    });
  };

  // Segment du mur sud (côté hall) percé pour le corridor.
  const southSegW = (SIZE - GAP * 2) / 2;
  const southSegX = GAP + southSegW / 2;

  return (
    <group>
      <ambientLight color="#020210" intensity={0.4} />
      <pointLight color="#1B3A6B" intensity={1.5} distance={16} decay={1.5} position={[0, 5, 0]} />
      <pointLight color="#2A5080" intensity={0.8} distance={10} decay={2} position={[0, 5, -5]} />

      <mesh position={[0, 3, -6]} receiveShadow castShadow>
        <boxGeometry args={[SIZE, H, 0.25]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Mur sud — percé, débouche sur le corridor vers le Hall */}
      <ZoneWall position={[-southSegX, 3, 6]} size={[southSegW, H, 0.25]} color="#06061A" roughness={0.95} />
      <ZoneWall position={[southSegX, 3, 6]} size={[southSegW, H, 0.25]} color="#06061A" roughness={0.95} />
      <mesh position={[-6, 3, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.25, H, SIZE]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      <mesh position={[6, 3, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.25, H, SIZE]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#06061A" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]} userData={{ noCollide: true }}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#02020A" transparent opacity={0.3} roughness={1} depthWrite={false} />
      </mesh>

      <Stars radius={30} depth={50} count={2000} factor={3} saturation={0.2} fade speed={0.5} />

      <group position={[0, 2.5, -1]}>
        {CELESTIAL_BODIES.filter((b) => b.orbitR > 0).map((b) => (
          <OrbitRing key={b.nameAr} radius={b.orbitR} />
        ))}
        {CELESTIAL_BODIES.map((body, i) => (
          <PlanetaryBody
            key={body.nameAr}
            data={body}
            index={i}
            orbitSpeed={0.3 / (body.orbitR || 1) * (i % 2 === 0 ? 1 : -0.9)}
            orbitY={0}
            discovered={discovered.has(i)}
          />
        ))}
      </group>

      <ArmillarySphere />
      <AstrolabeTable rotY={rotY} />
      <InteractiveAura position={[0, 0.02, -1]} color="#60a5fa" radius={2} />
      <InteractiveAura position={[-4, 0.02, 2]} color="#D4AF37" radius={1.2} />

      {/* ── Observer les astres — bouton de proximité près de la sphère orbitale ── */}
      <ProximityPrompt avatarRef={avatarRef} zoneOffset={zoneOffset} localPosition={[0, 0, -1]} radius={2.4}>
        {(inRange) =>
          inRange && (
            <Html position={[0, 3.4, -1]} center>
              <div className="flex flex-col items-center gap-2" style={{ pointerEvents: "none" }}>
                <span style={{ fontSize: 9, color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)", background: "rgba(10,15,13,0.7)", padding: "3px 8px", borderRadius: 6 }}>
                  Astres observés : {discovered.size}/{CELESTIAL_BODIES.length}
                </span>
                {!allFound && (
                  <button
                    onClick={observeNextPlanet}
                    style={{
                      pointerEvents: "auto",
                      background: "linear-gradient(135deg, #1B3A6B 0%, #60a5fa 50%, #1B3A6B 100%)",
                      border: "1px solid rgba(96,165,250,0.6)",
                      color: "#F8F4EC",
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: 700,
                      fontSize: 11,
                      borderRadius: 10,
                      padding: "6px 14px",
                      cursor: "pointer",
                    }}
                  >
                    Observer un astre
                  </button>
                )}
              </div>
            </Html>
          )
        }
      </ProximityPrompt>

      {/* ── Astrolabe — molette HTML plutôt qu'un drag 3D fragile ── */}
      <ProximityPrompt avatarRef={avatarRef} zoneOffset={zoneOffset} localPosition={[-4, 0, 2]} radius={2}>
        {(inRange) =>
          inRange && (
            <Html position={[-4, 1.6, 2]} center>
              <div
                className="flex flex-col items-center gap-1.5 rounded-xl px-3 py-2"
                style={{
                  background: "rgba(10,15,13,0.85)",
                  border: `1px solid ${angleOk ? "rgba(52,211,153,0.5)" : "rgba(96,165,250,0.3)"}`,
                  width: 170,
                  pointerEvents: "auto",
                }}
              >
                <span style={{ fontSize: 9, color: "rgba(248,244,236,0.5)", fontFamily: "var(--font-dm-sans)" }}>
                  Cap de l&apos;astrolabe
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: angleOk ? "#34d399" : "#60a5fa", fontFamily: "var(--font-dm-sans)" }}>
                  {Math.round(headingDeg)}°
                </span>
                <input
                  type="range"
                  min={0}
                  max={359}
                  value={Math.round(headingDeg)}
                  onChange={(e) => setRotY((Number(e.target.value) * Math.PI) / 180)}
                  style={{ width: "100%", accentColor: "#D4AF37" }}
                />
              </div>
            </Html>
          )
        }
      </ProximityPrompt>

      {ready && (
        <ProximityPrompt avatarRef={avatarRef} zoneOffset={zoneOffset} localPosition={[-4, 0, 2]} radius={2}>
          {(inRange) =>
            inRange && (
              <Html position={[-4, 0.6, 2]} center>
                <button
                  onClick={onConfirm}
                  style={{
                    pointerEvents: "auto",
                    background: "linear-gradient(135deg, #7a5c1a 0%, #D4AF37 50%, #7a5c1a 100%)",
                    border: "1px solid rgba(212,175,55,0.7)",
                    color: "#0A0F0D",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: 800,
                    fontSize: 11,
                    borderRadius: 10,
                    padding: "8px 14px",
                    cursor: "pointer",
                  }}
                >
                  Confirmer la direction sacrée
                </button>
              </Html>
            )
          }
        </ProximityPrompt>
      )}
    </group>
  );
}
