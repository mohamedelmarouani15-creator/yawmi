"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { SpotLight, MeshReflectorMaterial, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { makeStucco, makeMarble, makeWood, makeTerracotta, makeLightWood } from "@/lib/escape3d/textures";

const DOOR_W = 1.6;
const DOOR_H = 2.6;
const WALL_T = 0.24;
const ROOM_H = 3.6;
const WALL   = "#EDE5D0";
const STONE  = "#C4B89A";
const CEIL   = "#E8DFC8";
const WOOD   = "#4A2E12";

// ── RoomShell : murs + sol + plafond + décors architecturaux ─────
function RoomShell({ width = 6, depth = 5 }: { width?: number; depth?: number; doorAxis?: "z" | "x" }) {
  const sideW = (width - DOOR_W) / 2;
  const bz    = -depth / 2;

  const stucco      = useMemo(() => typeof window !== "undefined" ? makeStucco(4) : null, []);
  const lightWoodMap = useMemo(() => typeof window !== "undefined" ? makeLightWood() : null, []);

  return (
    <>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#8B6914" roughness={0.75} />
      </mesh>

      {/* Plafond */}
      <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={CEIL} roughness={0.9} side={THREE.BackSide} />
      </mesh>
      {/* Poutres apparentes */}
      {[-1.5, 0, 1.5].map(x => (
        <mesh key={x} position={[x, ROOM_H - 0.09, 0]}>
          <boxGeometry args={[0.18, 0.18, depth]} />
          <meshPhysicalMaterial color="#3A1A05" roughness={0.7} metalness={0} clearcoat={0.2} clearcoatRoughness={0.5} map={lightWoodMap ?? undefined} />
        </mesh>
      ))}

      {/* Mur du fond */}
      <mesh position={[0, ROOM_H / 2, bz]} castShadow receiveShadow>
        <boxGeometry args={[width, ROOM_H, WALL_T]} />
        <meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      {/* Lambris bas mur du fond */}
      <mesh position={[0, 0.48, bz + 0.03]}>
        <boxGeometry args={[width - 0.08, 0.96, 0.06]} />
        <meshStandardMaterial color={STONE} roughness={0.82} />
      </mesh>
      {/* Frise à hauteur d'œil */}
      <mesh position={[0, 1.08, bz + 0.03]}>
        <boxGeometry args={[width - 0.08, 0.07, 0.04]} />
        <meshStandardMaterial color="#B8A270" roughness={0.7} metalness={0.08} />
      </mesh>
      {/* 3 niches sur mur du fond */}
      {[-1.8, 0, 1.8].map(x => (
        <group key={x} position={[x, 2.15, bz + 0.04]}>
          <mesh><boxGeometry args={[0.68, 0.96, 0.1]} /><meshStandardMaterial color="#D8CCAC" roughness={0.95} /></mesh>
          <mesh position={[0, 0.48, 0.02]}><boxGeometry args={[0.68, 0.08, 0.06]} /><meshStandardMaterial color={STONE} roughness={0.8} /></mesh>
          {[-0.34, 0.34].map(px => (
            <mesh key={px} position={[px, 0, 0.02]}><boxGeometry args={[0.07, 0.96, 0.06]} /><meshStandardMaterial color={STONE} roughness={0.8} /></mesh>
          ))}
        </group>
      ))}

      {/* Murs latéraux */}
      <mesh position={[-width / 2, ROOM_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, ROOM_H, depth]} /><meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      <mesh position={[width / 2, ROOM_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, ROOM_H, depth]} /><meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      {/* Lambris latéraux */}
      {[-width / 2 + 0.06, width / 2 - 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.48, 0]}><boxGeometry args={[0.05, 0.96, depth - 0.08]} /><meshStandardMaterial color={STONE} roughness={0.82} /></mesh>
      ))}
      {[-width / 2 + 0.06, width / 2 - 0.06].map((x, i) => (
        <mesh key={`f${i}`} position={[x, 1.08, 0]}><boxGeometry args={[0.04, 0.07, depth - 0.08]} /><meshStandardMaterial color="#B8A270" roughness={0.7} /></mesh>
      ))}

      {/* Mur d'entrée */}
      <mesh position={[-sideW / 2 - DOOR_W / 2, ROOM_H / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[sideW, ROOM_H, WALL_T]} /><meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      <mesh position={[sideW / 2 + DOOR_W / 2, ROOM_H / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[sideW, ROOM_H, WALL_T]} /><meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      <mesh position={[0, DOOR_H + (ROOM_H - DOOR_H) / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[DOOR_W, ROOM_H - DOOR_H, WALL_T]} /><meshStandardMaterial color={WALL} roughness={0.82} map={stucco ?? undefined} />
      </mesh>
      {/* Arche porte */}
      <mesh position={[0, DOOR_H - 0.1, depth / 2 + 0.02]}>
        <boxGeometry args={[DOOR_W + 0.12, 0.14, 0.06]} /><meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
      {[-DOOR_W / 2 - 0.06, DOOR_W / 2 + 0.06].map(x => (
        <mesh key={x} position={[x, DOOR_H / 2, depth / 2 + 0.02]}>
          <boxGeometry args={[0.1, DOOR_H, 0.06]} /><meshStandardMaterial color={STONE} roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

// ── Flamme de bougie ─────────────────────────────────────────────
function Flame({ position }: { position: [number, number, number] }) {
  const m = useRef<THREE.Mesh>(null!);
  const l = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (m.current) {
      const s = 0.85 + 0.15 * Math.sin(t * 11.2);
      m.current.scale.set(s, s + 0.2 * Math.sin(t * 8), s);
      m.current.position.set(position[0] + 0.008 * Math.sin(t * 6.7), position[1] + 0.012 * Math.sin(t * 9.3), position[2]);
    }
    if (l.current) l.current.intensity = 1.2 + 0.3 * Math.sin(t * 8.5);
  });
  return (
    <>
      <mesh ref={m} position={position}>
        <sphereGeometry args={[0.022, 6, 6]} />
        <meshStandardMaterial color="#FF8800" emissive="#FF6600" emissiveIntensity={4} roughness={0.2} />
      </mesh>
      <pointLight ref={l} position={position} color="#E8921A" intensity={1.2} distance={2.5} decay={2} />
    </>
  );
}

// ── Flamme de feu (grande) ───────────────────────────────────────
function FireFlame({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const m = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (m.current) {
      m.current.scale.set(scale * (0.8 + 0.2 * Math.sin(t * 12.3 + scale)), scale * (0.9 + 0.15 * Math.sin(t * 8.7)), scale * (0.8 + 0.2 * Math.sin(t * 11)));
      m.current.position.y = position[1] + 0.02 * Math.sin(t * 9.1 + scale);
    }
  });
  return (
    <mesh ref={m} position={position}>
      <sphereGeometry args={[0.1 * scale, 8, 8]} />
      <meshStandardMaterial color={scale > 1 ? "#FF4400" : "#FF7700"} emissive={scale > 1 ? "#FF4400" : "#FF6600"} emissiveIntensity={3.5} roughness={0.2} transparent opacity={0.9} />
    </mesh>
  );
}

// ── BIBLIOTHÈQUE ISLAMIQUE ────────────────────────────────────────

function makeSpine(title: string, bg: string, fg = "#D4AF37"): THREE.CanvasTexture {
  const w = 26, h = 170;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  // Fond
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  // Bandes haut/bas
  ctx.fillStyle = fg + "55"; ctx.fillRect(0, 0, w, 12); ctx.fillRect(0, h-12, w, 12);
  // Bordure
  ctx.strokeStyle = fg; ctx.lineWidth = 0.8; ctx.strokeRect(1.5, 1.5, w-3, h-3);
  // Titre vertical
  ctx.save();
  ctx.translate(w/2, h/2); ctx.rotate(-Math.PI/2);
  ctx.fillStyle = fg; ctx.font = "bold 9px Arial";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(title.length > 18 ? title.slice(0,17)+"…" : title, 0, 0);
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

function makeOpenQuran(): THREE.CanvasTexture {
  const w = 512, h = 380;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#F8F3E4"; ctx.fillRect(0, 0, w, h);
  // Séparation reliure
  ctx.fillStyle = "#D0BF9A"; ctx.fillRect(w/2-2, 0, 4, h);
  // Cadres dorés page gauche
  ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 2.5;
  ctx.strokeRect(10, 10, w/2-14, h-20);
  ctx.strokeRect(16, 16, w/2-26, h-32);
  // Cadres dorés page droite
  ctx.strokeRect(w/2+4, 10, w/2-14, h-20);
  ctx.strokeRect(w/2+10, 16, w/2-26, h-32);
  // Bismillah doré en haut
  ctx.fillStyle = "#8B6200"; ctx.font = "bold 15px serif"; ctx.textAlign = "center";
  ctx.fillText("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", w/4, 38);
  ctx.fillText("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", 3*w/4, 38);
  // Versets arabes (réels)
  const versets = [
    "قُلْ هُوَ اللَّهُ أَحَدٌ","اللَّهُ الصَّمَدُ","لَمْ يَلِدْ وَلَمْ يُولَدْ",
    "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ","وَالْعَصْرِ","إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
    "إِلَّا الَّذِينَ آمَنُوا","وَعَمِلُوا الصَّالِحَاتِ","وَتَوَاصَوْا بِالْحَقِّ",
    "وَتَوَاصَوْا بِالصَّبْرِ","الرَّحْمَنُ عَلَّمَ الْقُرْآنَ",
  ];
  ctx.fillStyle = "#1A1008"; ctx.font = "12px serif"; ctx.textAlign = "right";
  versets.forEach((v, i) => {
    const y = 60 + i * 24;
    ctx.fillText(v, w/2 - 18, y);
    ctx.fillText(versets[(i+4)%versets.length], w - 18, y);
  });
  // Numéros de page
  ctx.fillStyle = "#8B6200"; ctx.font = "10px serif"; ctx.textAlign = "center";
  ctx.fillText("٥٤", w/4, h-16); ctx.fillText("٥٥", 3*w/4, h-16);
  return new THREE.CanvasTexture(c);
}

const SERIES = [
  { t:"القرآن الكريم",       bg:"#1A5C2A", fg:"#D4AF37",  vols:10, h:0.43, tk:0.055 },
  { t:"صحيح البخاري",        bg:"#1A2A70", fg:"#C8D4FF",  vols:9,  h:0.39, tk:0.042 },
  { t:"صحيح مسلم",          bg:"#15205A", fg:"#C8D4FF",  vols:8,  h:0.37, tk:0.040 },
  { t:"تفسير ابن كثير",      bg:"#5C3A1E", fg:"#D4AF37",  vols:8,  h:0.39, tk:0.042 },
  { t:"السيرة النبوية",      bg:"#6A1A48", fg:"#FFD0E4",  vols:5,  h:0.41, tk:0.042 },
  { t:"الفقه الإسلامي",     bg:"#6A1A1A", fg:"#FFD0D0",  vols:6,  h:0.37, tk:0.040 },
  { t:"رياض الصالحين",      bg:"#1A5C4A", fg:"#D4AF37",  vols:2,  h:0.41, tk:0.055 },
  { t:"البداية والنهاية",    bg:"#3A5C1A", fg:"#D0FFD0",  vols:14, h:0.35, tk:0.036 },
  { t:"مختار الصحاح",       bg:"#4A1A5C", fg:"#E0D0FF",  vols:2,  h:0.39, tk:0.052 },
  { t:"إحياء علوم الدين",   bg:"#5C2A1A", fg:"#D4AF37",  vols:4,  h:0.39, tk:0.050 },
  { t:"سنن أبي داود",       bg:"#1A3A5C", fg:"#C8D4FF",  vols:7,  h:0.37, tk:0.040 },
  { t:"مقدمة ابن خلدون",    bg:"#2A3A5C", fg:"#D4AF37",  vols:1,  h:0.45, tk:0.072 },
  { t:"الموطأ",             bg:"#2A5C3A", fg:"#D4AF37",  vols:2,  h:0.37, tk:0.055 },
  { t:"ألفية ابن مالك",     bg:"#5C4A1A", fg:"#D4AF37",  vols:1,  h:0.39, tk:0.065 },
];

function MassiveShelf({ position, rotY = 0, si = 0 }: {
  position: [number, number, number];
  rotY?: number;
  si?: number;
}) {
  const textures = useMemo(() =>
    typeof window !== "undefined"
      ? SERIES.map(s => makeSpine(s.t, s.bg, s.fg))
      : SERIES.map(() => null),
    []
  );

  const SW = 1.82, SH = 3.4, SD = 0.36;
  const ROWS = 6, ROW_H = SH / ROWS;

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Corps bois foncé */}
      <mesh castShadow>
        <boxGeometry args={[SW, SH, SD]} />
        <meshPhysicalMaterial color="#1E0C04" roughness={0.72} metalness={0} clearcoat={0.35} clearcoatRoughness={0.45} />
      </mesh>
      {/* Planches */}
      {Array.from({ length: ROWS + 1 }, (_, i) => (
        <mesh key={i} position={[0, -SH/2 + i * ROW_H, 0.02]}>
          <boxGeometry args={[SW - 0.06, 0.038, SD - 0.04]} />
          <meshPhysicalMaterial color="#120802" roughness={0.68} clearcoat={0.4} />
        </mesh>
      ))}
      {/* Livres rangée par rangée */}
      {Array.from({ length: ROWS }, (_, row) => {
        const rowY = -SH/2 + row * ROW_H + ROW_H / 2;
        const ser = SERIES[(si + row) % SERIES.length];
        const tex = textures[(si + row) % textures.length];
        const booksPerRow = Math.floor((SW - 0.06) / (ser.tk + 0.004));
        const totalW = booksPerRow * (ser.tk + 0.004);
        const startX = -totalW / 2 + ser.tk / 2;
        return Array.from({ length: booksPerRow }, (_, b) => {
          const bx = startX + b * (ser.tk + 0.004);
          const bh = ser.h * (0.88 + (b % 5) * 0.06);
          const tilt = b === booksPerRow - 2 ? 0.18 : 0;
          return (
            <mesh key={`${row}-${b}`}
              position={[bx, rowY + (bh - ser.h) * 0.5, 0.04]}
              rotation={[0, 0, tilt]}
              castShadow>
              <boxGeometry args={[ser.tk, bh, 0.28]} />
              <meshStandardMaterial
                map={tex ?? undefined}
                color={ser.bg}
                roughness={0.88}
                emissive={ser.bg}
                emissiveIntensity={0.05}
              />
            </mesh>
          );
        });
      })}
    </group>
  );
}

function OctaChandelier({ position }: { position: [number, number, number] }) {
  const lRef = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    if (lRef.current) lRef.current.intensity = 3.8 + 0.6 * Math.sin(clock.getElapsedTime() * 5.8);
  });
  const arms = 8;
  return (
    <group position={position}>
      {/* Chaîne */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.4, 6]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.18} metalness={0.82} />
      </mesh>
      {/* Corps octogonal */}
      <mesh>
        <cylinderGeometry args={[0.16, 0.11, 0.28, 8]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.18} metalness={0.78} emissive="#D4AF37" emissiveIntensity={0.22} />
      </mesh>
      {/* Anneau */}
      <mesh position={[0, -0.06, 0]}>
        <torusGeometry args={[0.21, 0.013, 6, 24]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.15} metalness={0.82} emissive="#D4AF37" emissiveIntensity={0.28} />
      </mesh>
      {/* 8 bras + bougies */}
      {Array.from({ length: arms }, (_, i) => {
        const a = (i / arms) * Math.PI * 2;
        const r = 0.42;
        const ax = Math.cos(a) * r, az = Math.sin(a) * r;
        return (
          <group key={i}>
            <mesh position={[ax*0.5, -0.06, az*0.5]} rotation={[0, -a, Math.PI/10]}>
              <cylinderGeometry args={[0.007, 0.009, r, 5]} />
              <meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh position={[ax, -0.13, az]}>
              <cylinderGeometry args={[0.022, 0.018, 0.06, 8]} />
              <meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.8} emissive="#D4AF37" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[ax, -0.08, az]}>
              <cylinderGeometry args={[0.014, 0.016, 0.09, 8]} />
              <meshStandardMaterial color="#F5F0E8" roughness={0.65} emissive="#FFE8A0" emissiveIntensity={0.2} />
            </mesh>
            <Flame position={[ax, -0.025, az]} />
          </group>
        );
      })}
      <pointLight ref={lRef} color="#FFB528" intensity={3.8} distance={9} decay={2} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
    </group>
  );
}

function Tasbih({ position }: { position: [number, number, number] }) {
  const count = 33;
  const rx = 0.14, rz = 0.09;
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const isMain = i % 11 === 0;
        return (
          <mesh key={i} position={[Math.cos(angle)*rx, 0, Math.sin(angle)*rz]} castShadow>
            <sphereGeometry args={[isMain ? 0.011 : 0.007, 6, 6]} />
            <meshPhysicalMaterial
              color={isMain ? "#D4AF37" : "#8B4A1A"}
              roughness={isMain ? 0.18 : 0.3}
              metalness={isMain ? 0.5 : 0.05}
              clearcoat={isMain ? 0.9 : 0.5}
            />
          </mesh>
        );
      })}
      <mesh position={[0, 0, -(rz + 0.04)]}>
        <cylinderGeometry args={[0.003, 0.003, 0.07, 4]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.25} metalness={0.75} />
      </mesh>
    </group>
  );
}

function Mashrabiya({ position }: { position: [number, number, number] }) {
  const sz = 0.9, cell = 7;
  const cs = sz / cell;
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[sz+0.1, sz+0.1, 0.04]} />
        <meshPhysicalMaterial color="#2A1008" roughness={0.58} clearcoat={0.35} />
      </mesh>
      {Array.from({length:cell+1},(_,i)=>(
        <mesh key={`h${i}`} position={[0,-sz/2+i*cs,0.015]}>
          <boxGeometry args={[sz,0.011,0.022]}/>
          <meshPhysicalMaterial color="#3A1808" roughness={0.55} clearcoat={0.4}/>
        </mesh>
      ))}
      {Array.from({length:cell+1},(_,i)=>(
        <mesh key={`v${i}`} position={[-sz/2+i*cs,0,0.015]}>
          <boxGeometry args={[0.011,sz,0.022]}/>
          <meshPhysicalMaterial color="#3A1808" roughness={0.55} clearcoat={0.4}/>
        </mesh>
      ))}
      <pointLight position={[0.3,0,0.4]} color="#FFA850" intensity={2.8} distance={5} decay={2}/>
      <mesh position={[0,0,-0.018]}>
        <planeGeometry args={[sz,sz]}/>
        <meshBasicMaterial color="#FFA050" transparent opacity={0.14}/>
      </mesh>
    </group>
  );
}

export function Library({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const astroRef = useRef<THREE.PointLight>(null!);
  const woodTex  = useMemo(() => typeof window !== "undefined" ? makeWood() : null, []);
  const quranTex = useMemo(() => typeof window !== "undefined" ? makeOpenQuran() : null, []);

  useFrame(({ clock }) => {
    if (astroRef.current)
      astroRef.current.intensity = 0.6 + 0.45 * Math.sin(clock.getElapsedTime() * 3.2);
  });

  return (
    <group position={[0, 0, -6.15]}>
      <RoomShell width={6} depth={5} />

      {/* Sol parquet */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} />
        <meshPhysicalMaterial color="#1E0C04" roughness={0.68} clearcoat={0.22} clearcoatRoughness={0.5} map={woodTex ?? undefined} />
      </mesh>

      {/* Ambiant très chaud */}
      <ambientLight intensity={0.22} color="#703020" />

      {/* Chandelier octogonal */}
      <OctaChandelier position={[0, 3.28, -0.4]} />

      {/* MUR DU FOND — 3 bibliothèques pleine hauteur */}
      <MassiveShelf position={[-1.82, 1.7, -2.3]}  si={0} />
      <MassiveShelf position={[0,     1.7, -2.3]}   si={4} />
      <MassiveShelf position={[1.82,  1.7, -2.3]}   si={8} />

      {/* MUR GAUCHE — 2 bibliothèques */}
      <MassiveShelf position={[-2.84, 1.7, -1.1]} rotY={Math.PI/2} si={2} />
      <MassiveShelf position={[-2.84, 1.7,  0.8]} rotY={Math.PI/2} si={6} />

      {/* MUR DROIT — fenêtre + bibliothèque */}
      <Mashrabiya position={[2.88, 2.18, -0.8]} />
      <MassiveShelf position={[2.84, 1.7, 0.8]} rotY={-Math.PI/2} si={10} />

      {/* GRAND BUREAU DE LECTURE */}
      <group position={[0, 0, -0.7]}>
        {/* Surface */}
        <mesh position={[0, 0.84, 0]} castShadow>
          <boxGeometry args={[1.65, 0.07, 1.05]} />
          <meshPhysicalMaterial color="#3A1A06" roughness={0.62} clearcoat={0.55} clearcoatRoughness={0.28} />
        </mesh>
        {/* 4 pieds */}
        {([[-0.68,-0.38],[-0.68,0.38],[0.68,-0.38],[0.68,0.38]] as [number,number][]).map(([x,z],i)=>(
          <mesh key={i} position={[x, 0.42, z]} castShadow>
            <cylinderGeometry args={[0.038, 0.055, 0.84, 8]} />
            <meshPhysicalMaterial color="#2A1008" roughness={0.6} clearcoat={0.3} />
          </mesh>
        ))}
        {/* Pupitre incliné avec Coran */}
        <group position={[0, 0.92, -0.28]} rotation={[-0.32, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.82, 0.04, 0.58]} />
            <meshPhysicalMaterial color="#2A1008" roughness={0.58} clearcoat={0.45} />
          </mesh>
          {/* Coran ouvert — objet interactif */}
          <mesh position={[0, 0.028, 0]} onClick={onPuzzleTap} castShadow>
            <boxGeometry args={[0.74, 0.016, 0.52]} />
            <meshPhysicalMaterial
              map={quranTex ?? undefined}
              color={solved ? "#D4AF37" : "#F5EDD8"}
              roughness={0.48}
              emissive={solved ? "#D4AF37" : "#E8D890"}
              emissiveIntensity={solved ? 0.6 : 0.14}
            />
          </mesh>
        </group>
        {/* Tasbih */}
        <Tasbih position={[-0.52, 0.88, 0.22]} />
        {/* Encrier + qalam */}
        <group position={[0.55, 0.9, 0.12]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.048, 0.038, 0.065, 10]} />
            <meshPhysicalMaterial color="#1A0808" roughness={0.25} metalness={0.1} clearcoat={0.85} />
          </mesh>
          <mesh position={[0.12, 0.055, 0]} rotation={[0,0,-0.28]} castShadow>
            <cylinderGeometry args={[0.006, 0.009, 0.24, 6]} />
            <meshStandardMaterial color="#C8A055" roughness={0.68} />
          </mesh>
        </group>
        {/* 2 chandelles sur le bureau */}
        {([-0.62, 0.55] as const).map((x,i) => (
          <group key={i} position={[x, 0.88, -0.3]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.018, 0.022, 0.12, 8]} />
              <meshStandardMaterial color="#F5F0E8" roughness={0.62} emissive="#FFE8A0" emissiveIntensity={0.22} />
            </mesh>
            <Flame position={[x, 1.01, -0.3]} />
          </group>
        ))}
      </group>

      {/* ASTROLABE amélioré */}
      <group position={[-1.82, 1.55, -0.95]}>
        <mesh castShadow rotation={[0.3, 0.5, 0]}>
          <torusGeometry args={[0.27, 0.026, 8, 24]} />
          <meshPhysicalMaterial color="#D4AF37" roughness={0.14} metalness={0.86} clearcoat={0.65} emissive="#D4AF37" emissiveIntensity={0.32} />
        </mesh>
        <mesh rotation={[0.3, 0.5+Math.PI/4, 0]}>
          <torusGeometry args={[0.25, 0.012, 6, 16]} />
          <meshStandardMaterial color="#B88820" roughness={0.18} metalness={0.82} emissive="#B88820" emissiveIntensity={0.22} />
        </mesh>
        <mesh rotation={[0.3, 0.5, 0]}>
          <circleGeometry args={[0.09, 16]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.12} metalness={0.82} emissive="#D4AF37" emissiveIntensity={0.45} />
        </mesh>
        <pointLight ref={astroRef} color="#D4AF37" intensity={0.6} distance={1.8} decay={2} />
      </group>

      {/* GLOBE TERRESTRE */}
      <group position={[1.62, 0, -0.5]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.075, 0.72, 8]} />
          <meshPhysicalMaterial color="#2A1008" roughness={0.68} clearcoat={0.3} />
        </mesh>
        <mesh position={[0, 1.08, 0]} rotation={[0.28, 0, 0]} castShadow>
          <sphereGeometry args={[0.22, 18, 18]} />
          <meshPhysicalMaterial color="#1A4A6A" roughness={0.42} metalness={0.04} clearcoat={0.55} emissive="#0A2A45" emissiveIntensity={0.18} />
        </mesh>
        <mesh position={[0, 1.08, 0]} rotation={[0.28, 0.5, 0]}>
          <torusGeometry args={[0.235, 0.008, 6, 24]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.18} metalness={0.82} emissive="#D4AF37" emissiveIntensity={0.22} />
        </mesh>
      </group>

      {/* Dust Sparkles */}
      <Sparkles count={45} scale={3.2} size={0.32} speed={0.04} color="#FFE8A0" opacity={0.26} position={[0, 2.1, -1]} />

      {/* Anneau interactif */}
      {!solved && onPuzzleTap && (
        <mesh position={[0, 1.22, -0.7]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[0.14, 0.2, 24]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.65} />
        </mesh>
      )}
    </group>
  );
}

// ── Tapis procédural ──────────────────────────────────────────────
function makeCarpet() {
  const s = 512, c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#7A1818"; ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 16; ctx.strokeRect(16, 16, s - 32, s - 32);
  ctx.lineWidth = 5; ctx.strokeRect(30, 30, s - 60, s - 60);
  const star = (cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, inn = r * 0.42;
      if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.lineTo(cx + Math.cos(a + Math.PI / 8) * inn, cy + Math.sin(a + Math.PI / 8) * inn);
    }
    ctx.closePath();
  };
  ctx.fillStyle = "#D4AF37"; star(s/2, s/2, 90); ctx.fill();
  ctx.fillStyle = "#7A1818"; star(s/2, s/2, 52); ctx.fill();
  [[96,96],[416,96],[96,416],[416,416],[256,96],[256,416],[96,256],[416,256]].forEach(([cx,cy]) => {
    ctx.fillStyle = "#D4AF37"; star(cx, cy, 32); ctx.fill();
    ctx.fillStyle = "#7A1818"; star(cx, cy, 18); ctx.fill();
  });
  return new THREE.CanvasTexture(c);
}

// ── SALON ─────────────────────────────────────────────────────────
export function Salon({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const carpet  = useMemo(() => typeof window !== "undefined" ? makeCarpet() : null, []);
  const woodMap = useMemo(() => typeof window !== "undefined" ? makeWood() : null, []);

  return (
    <group position={[0, 0, 6.15]}>
      <RoomShell width={6} depth={5} />

      {/* Sol parquet */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} /><meshStandardMaterial color="#2A1A08" roughness={0.85} map={woodMap ?? undefined} />
      </mesh>
      {/* Tapis central */}
      <mesh position={[0, 0.005, -0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.0, 3.8]} />
        <meshStandardMaterial map={carpet ?? undefined} color={carpet ? "#fff" : "#7A1818"} roughness={0.9} />
      </mesh>

      <ambientLight intensity={0.45} color="#5020A0" />

      {/* SpotLight lustre */}
      <SpotLight position={[0, 3.4, -0.3]} color="#C878D4" intensity={6} angle={0.62} penumbra={0.9} castShadow distance={8} attenuation={5} />
      <mesh position={[0, 3.22, -0.3]}>
        <cylinderGeometry args={[0.02, 0.02, 0.38, 6]} /><meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 2.84, -0.3]}>
        <dodecahedronGeometry args={[0.32, 0]} />
        <meshPhysicalMaterial color="#D4AF37" transmission={0.4} roughness={0.05} metalness={0.2} ior={1.5} thickness={0.3} emissive="#D4AF37" emissiveIntensity={0.8} />
      </mesh>

      {/* Banquette sur le mur du fond — bien visible depuis caméra */}
      <group position={[0, 0, -2.25]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[5.4, 0.28, 0.72]} /><meshPhysicalMaterial color="#6B1A1A" roughness={0.75} sheen={0.5} sheenColor="#8B2020" />
        </mesh>
        <mesh position={[0, 0.58, -0.28]}>
          <boxGeometry args={[5.4, 0.55, 0.12]} /><meshPhysicalMaterial color="#8B2020" roughness={0.75} sheen={0.5} sheenColor="#8B2020" />
        </mesh>
        {/* Coussins sur la banquette */}
        {[-2.0, -1.0, 0, 1.0, 2.0].map(x => (
          <mesh key={x} position={[x, 0.52, 0.12]} castShadow>
            <boxGeometry args={[0.78, 0.32, 0.68]} />
            <meshStandardMaterial color={["#D4222A","#1A3A8B","#1A6B2A","#8B6914","#6B1A6B"][Math.abs(Math.round(x)) % 5]} roughness={0.82} />
          </mesh>
        ))}
      </group>

      {/* Nattes / coussins de sol au centre */}
      {[[-1.5, 0, 0.4], [0, 0, 0.8], [1.5, 0, 0.4]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.16, z]} castShadow>
          <boxGeometry args={[0.8, 0.22, 0.8]} />
          <meshStandardMaterial color={["#C4222A","#2A4A9B","#1A7B3A"][i]} roughness={0.85} />
        </mesh>
      ))}

      {/* Table basse avec service à thé */}
      <group position={[0, 0, -0.6]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[1.5, 0.07, 0.95]} /><meshStandardMaterial color="#5C3A1E" roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Théière */}
        <mesh position={[0, 0.37, 0.1]} castShadow>
          <sphereGeometry args={[0.1, 10, 10]} /><meshStandardMaterial color="#D4AF37" roughness={0.25} metalness={0.75} emissive="#D4AF37" emissiveIntensity={0.15} />
        </mesh>
        {/* Petits verres */}
        {[-0.35, 0.35].map(x => (
          <mesh key={x} position={[x, 0.34, -0.1]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.09, 8]} /><meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.8} emissive="#D4AF37" emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>

      {/* Vitrail gauche — 3 panneaux colorés */}
      {[["#FF3333", -0.4], ["#D4AF37", 0], ["#3333FF", 0.4]].map(([col, dz], i) => (
        <group key={i} position={[-2.88, 1.95, Number(dz) - 0.2]}>
          <mesh><boxGeometry args={[0.03, 0.8, 0.35]} /><meshStandardMaterial color={String(col)} transparent opacity={0.4} emissive={String(col)} emissiveIntensity={0.7} /></mesh>
          <pointLight position={[0.4, 0, 0]} color={String(col)} intensity={1.2} distance={3.5} decay={2} />
        </group>
      ))}

      {/* Appliques murales dorées (mur droit) */}
      {[-0.8, 0.8].map(z => (
        <group key={z} position={[2.86, 2.0, z]}>
          <mesh><boxGeometry args={[0.04, 0.22, 0.12]} /><meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} /></mesh>
          <Flame position={[0, 0.14, 0.06]} />
        </group>
      ))}

      {/* Grande calligraphie (énigme) + niche éclairée */}
      <mesh position={[0, 2.15, -2.36]} onClick={onPuzzleTap} castShadow>
        <boxGeometry args={[2.0, 0.8, 0.06]} />
        <meshStandardMaterial color={solved ? "#D4AF37" : "#C4A850"} roughness={0.4} emissive={solved ? "#D4AF37" : "#A88030"} emissiveIntensity={solved ? 0.9 : 0.45} />
      </mesh>
      <pointLight position={[0, 2.15, -2.15]} color={solved ? "#D4AF37" : "#C4A850"} intensity={solved ? 2.5 : 1.0} distance={3.5} decay={2} />

      {/* Brûleur d'encens */}
      <group position={[1.0, 0.3, -1.0]}>
        <mesh castShadow><cylinderGeometry args={[0.08, 0.06, 0.18, 8]} /><meshStandardMaterial color="#D4AF37" roughness={0.28} metalness={0.72} /></mesh>
        <Sparkles count={18} scale={[0.25, 2.5, 0.25]} size={0.5} speed={0.08} color="#C8C0FF" opacity={0.5} position={[0, 0.5, 0]} />
      </group>

      {!solved && onPuzzleTap && (
        <mesh position={[0, 2.6, -2.28]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.13, 0.19, 24]} /><meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ── CUISINE ───────────────────────────────────────────────────────
function Fireplace() {
  const fl = useRef<THREE.PointLight>(null!);
  const f1 = useRef<THREE.Mesh>(null!), f2 = useRef<THREE.Mesh>(null!), f3 = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    [f1, f2, f3].forEach((r, i) => {
      if (!r.current) return;
      const s = 0.8 + 0.2 * Math.sin(t * (11 + i * 1.3) + i);
      r.current.scale.set(s, s + 0.15 * Math.sin(t * (8 + i)), s);
      r.current.position.y = [0.24, 0.19, 0.21][i] + 0.02 * Math.sin(t * 9 + i);
    });
    if (fl.current) fl.current.intensity = 4.5 + 1.5 * Math.sin(t * 9.3);
  });
  return (
    <group position={[-2.2, 0, -2.3]}>
      <mesh position={[0, 0.65, 0]} castShadow><boxGeometry args={[0.85, 1.1, 0.22]} /><meshStandardMaterial color="#5A2008" roughness={0.95} /></mesh>
      <mesh position={[0, 0.6, -0.06]}><boxGeometry args={[0.66, 0.88, 0.06]} /><meshStandardMaterial color="#1A0804" roughness={1.0} /></mesh>
      {/* Bûches */}
      {[[-0.09, 0.07, -0.02, 0.3], [0.09, 0.06, -0.01, -0.2]].map(([x, y, z, ry], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, ry, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.5, 6]} /><meshStandardMaterial color="#2A1208" roughness={0.95} />
        </mesh>
      ))}
      <mesh ref={f1} position={[0, 0.24, -0.02]}><sphereGeometry args={[0.13, 8, 8]} /><meshStandardMaterial color="#FF4400" emissive="#FF4400" emissiveIntensity={4} roughness={0.2} transparent opacity={0.9} /></mesh>
      <mesh ref={f2} position={[0.1, 0.19, -0.02]}><sphereGeometry args={[0.09, 8, 8]} /><meshStandardMaterial color="#FF7700" emissive="#FF6600" emissiveIntensity={4} roughness={0.2} transparent opacity={0.85} /></mesh>
      <mesh ref={f3} position={[-0.09, 0.21, -0.02]}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#FFAA00" emissive="#FF9900" emissiveIntensity={4} roughness={0.2} transparent opacity={0.8} /></mesh>
      <pointLight ref={fl} position={[0, 0.55, 0.25]} color="#FF6600" intensity={4.5} distance={6} decay={2} />
    </group>
  );
}

function TajineStack({ position }: { position: [number, number, number] }) {
  const cols = ["#8B4000", "#C04A00", "#7A3800"];
  return (
    <group position={position}>
      {cols.map((c, i) => (
        <group key={i} position={[0, i * 0.44, 0]}>
          <mesh castShadow><cylinderGeometry args={[0.21 - i * 0.01, 0.25 - i * 0.01, 0.2, 14]} /><meshStandardMaterial color={c} roughness={0.82} metalness={0.05} /></mesh>
          <mesh position={[0, 0.24, 0]} castShadow><coneGeometry args={[0.21 - i * 0.01, 0.34, 14]} /><meshStandardMaterial color={c} roughness={0.82} metalness={0.05} /></mesh>
        </group>
      ))}
    </group>
  );
}

export function Cuisine({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const terracottaTex = useMemo(() => typeof window !== "undefined" ? makeTerracotta() : null, []);

  return (
    <group position={[6.15, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <RoomShell width={6} depth={5} />

      {/* Sol terre cuite */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} /><meshStandardMaterial color="#B04A18" roughness={0.85} map={terracottaTex ?? undefined} />
      </mesh>

      <ambientLight intensity={0.4} color="#803010" />
      <SpotLight position={[0, 3.2, 0]} color="#E07820" intensity={4} angle={0.58} penumbra={0.85} castShadow distance={9} attenuation={5} />

      {/* Feu */}
      <Fireplace />

      {/* 3 niveaux d'étagères gauche (mur du fond côté gauche) */}
      {[0.55, 1.2, 1.85].map((y, row) => (
        <group key={y}>
          <mesh position={[-2.2, y, -1.8]} castShadow>
            <boxGeometry args={[1.8, 0.07, 0.42]} /><meshStandardMaterial color={WOOD} roughness={0.85} />
          </mesh>
          {Array.from({ length: 4 }, (_, i) => (
            <TajineStack key={i} position={[-2.2 + (i - 1.5) * 0.4, y + 0.07, -1.8]} />
          )).slice(0, row === 0 ? 3 : 2)}
        </group>
      ))}

      {/* Étagères droite avec jarres */}
      {[0.6, 1.3].map((y, row) => (
        <group key={y}>
          <mesh position={[2.2, y, -1.5]} castShadow>
            <boxGeometry args={[1.6, 0.07, 0.38]} /><meshStandardMaterial color={WOOD} roughness={0.85} />
          </mesh>
          {Array.from({ length: 3 }, (_, i) => (
            <mesh key={i} position={[1.5 + i * 0.5, y + 0.22, -1.5]} castShadow>
              <cylinderGeometry args={[0.14, 0.12, 0.38, 10]} />
              <meshStandardMaterial color={["#8B4000","#A03800","#6B3000"][i]} roughness={0.82} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Plan de travail central (hauteur d'œil depuis entrée) */}
      <group position={[0, 0, -1.8]}>
        <mesh position={[0, 0.88, 0]} castShadow>
          <boxGeometry args={[3.0, 0.09, 0.7]} /><meshPhysicalMaterial color="#5C3A1E" roughness={0.78} clearcoat={0.6} clearcoatRoughness={0.3} />
        </mesh>
        {/* Mortier + pilon */}
        <mesh position={[0.6, 0.98, 0.1]} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.14, 10]} /><meshStandardMaterial color="#C4B89A" roughness={0.7} />
        </mesh>
        {/* Plateau cuivré */}
        <mesh position={[-0.5, 0.96, 0.05]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 16]} /><meshStandardMaterial color="#C87820" roughness={0.3} metalness={0.6} emissive="#C87820" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* Rack de casseroles cuivre au plafond */}
      <mesh position={[0, 3.0, -1.0]} castShadow>
        <boxGeometry args={[2.2, 0.06, 0.3]} /><meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      {[-0.8, -0.2, 0.4, 1.0].map(x => (
        <group key={x} position={[x, 2.72, -1.0]}>
          <mesh><cylinderGeometry args={[0.015, 0.015, 0.3, 4]} /><meshStandardMaterial color="#888" roughness={0.4} /></mesh>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.18, 14]} /><meshStandardMaterial color="#C87820" roughness={0.15} metalness={0.88} emissive="#C87820" emissiveIntensity={0.12} />
          </mesh>
        </group>
      ))}

      {/* Herbes suspendues */}
      {[[-1.0, 3.08, -0.8], [0.4, 3.08, 0.6], [-0.4, 3.0, 1.1]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.2, i * 0.8, 0.1]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.38, 4]} />
          <meshStandardMaterial color={["#1A6B1A","#2A8B2A","#1A5B1A"][i]} roughness={0.9} emissive={["#1A6B1A","#2A8B2A","#1A5B1A"][i]} emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Jarre de miel (énigme) */}
      <group position={[1.2, 0, 0.5]}>
        <mesh castShadow onClick={onPuzzleTap}>
          <cylinderGeometry args={[0.22, 0.18, 0.58, 12]} />
          {solved
            ? <meshStandardMaterial color="#D4AF37" roughness={0.5} emissive="#D4AF37" emissiveIntensity={0.8} />
            : <MeshTransmissionMaterial roughness={0.1} thickness={0.5} transmission={0.95} color="#E8A020" ior={1.45} chromaticAberration={0.04} />
          }
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 0.1, 12]} /><meshStandardMaterial color="#8B5000" roughness={0.7} />
        </mesh>
        {!solved && onPuzzleTap && (
          <mesh position={[0, 0.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.18, 24]} /><meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* Grandes jarres de stockage au fond */}
      {[[-2.1, 0, 2.1], [-1.5, 0, 2.2], [-0.9, 0, 2.1]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.4 + i * 0.02, z]} castShadow>
          <cylinderGeometry args={[0.18 + i * 0.02, 0.15, 0.8 + i * 0.1, 12]} />
          <meshStandardMaterial color={["#7A3800","#9A4800","#6A2800"][i]} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// ── HAMMAM ────────────────────────────────────────────────────────
function MosaicWall({ width, height, z }: { width: number; height: number; z: number }) {
  const tilesX = Math.floor(width / 0.28);
  const tilesY = Math.floor(height / 0.28);
  const palette = ["#1A6B8A","#D4AF37","#2A8B2A","#8B1A1A","#4A1A8B","#1A4A8B"];
  return (
    <group>
      {Array.from({ length: tilesX * tilesY }, (_, i) => {
        const tx = i % tilesX, ty = Math.floor(i / tilesX);
        const col = palette[(tx + ty * 3) % palette.length];
        const isGold = (tx + ty) % 5 === 0;
        return (
          <mesh key={i} position={[-width / 2 + tx * 0.28 + 0.14, ty * 0.28 + 0.14, z]}>
            <boxGeometry args={[0.24, 0.24, 0.04]} />
            <meshStandardMaterial color={isGold ? "#D4AF37" : col} roughness={0.3} metalness={isGold ? 0.3 : 0.05} emissive={isGold ? "#D4AF37" : col} emissiveIntensity={isGold ? 0.25 : 0.12} />
          </mesh>
        );
      })}
    </group>
  );
}

function WaterSurface({ position }: { position: [number, number, number] }) {
  const m = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (m.current) m.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.7) * 0.015;
  });
  return (
    <mesh ref={m} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.78, 32]} />
      <meshPhysicalMaterial color="#A8C8D8" transmission={0.5} roughness={0.02} ior={1.33} thickness={0.8} metalness={0} />
    </mesh>
  );
}

export function Hammam({ onPuzzleTap, solved }: { onPuzzleTap?: () => void; solved?: boolean }) {
  const marbleTex = useMemo(() => typeof window !== "undefined" ? makeMarble() : null, []);

  return (
    <group position={[-6.15, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <RoomShell width={6} depth={5} />

      {/* Sol marbre réfléchissant */}
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 4.8]} />
        <MeshReflectorMaterial blur={[300, 150]} mixStrength={35} roughness={0.06} color="#E0DCD4" mirror={0.45} depthScale={0.4} />
      </mesh>

      <ambientLight intensity={0.5} color="#1A4060" />
      <SpotLight position={[0, 3.5, -0.5]} color="#88BBDD" intensity={5} angle={0.48} penumbra={0.88} castShadow distance={10} attenuation={5} />

      {/* Mosaïque complète sur mur du fond (remplace les 4 panneaux séparés) */}
      <group position={[0, 0, -2.36]}>
        <MosaicWall width={5.8} height={2.8} z={0} />
      </group>

      {/* 2 colonnes marbre flanquant le bassin */}
      {[-1.4, 1.4].map(x => (
        <group key={x} position={[x, 0, -0.5]}>
          <mesh castShadow><cylinderGeometry args={[0.12, 0.15, 2.8, 12]} /><meshPhysicalMaterial color="#E8E4D8" map={marbleTex ?? undefined} roughness={0.08} metalness={0} clearcoat={0.9} clearcoatRoughness={0.05} /></mesh>
          {/* Chapiteau */}
          <mesh position={[0, 1.45, 0]} castShadow><cylinderGeometry args={[0.2, 0.12, 0.18, 12]} /><meshStandardMaterial color="#D8CCAC" roughness={0.4} /></mesh>
          {/* Base */}
          <mesh position={[0, -1.4, 0]}><cylinderGeometry args={[0.18, 0.18, 0.12, 12]} /><meshStandardMaterial color="#D8CCAC" roughness={0.4} /></mesh>
        </group>
      ))}

      {/* Étoile au plafond — skylight */}
      <mesh position={[0, 3.56, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 8]} />
        <meshStandardMaterial color="#88BBDD" emissive="#88BBDD" emissiveIntensity={1.2} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, 3.4, -0.5]} color="#88CCEE" intensity={2.5} distance={5} decay={2} />

      {/* Bassin central (énigme) */}
      <group position={[0, 0, -0.5]}>
        <mesh castShadow><cylinderGeometry args={[0.95, 1.0, 0.32, 36]} /><meshPhysicalMaterial color="#E8E0D0" roughness={0.15} metalness={0} clearcoat={0.8} clearcoatRoughness={0.05} /></mesh>
        <WaterSurface position={[0, 0.12, 0]} />
        <Sparkles count={70} scale={[2.0, 2.2, 2.0]} size={1.8} speed={0.06} color="#AACCEE" opacity={0.22} position={[0, 0.6, 0]} />
        {/* Jet d'eau central */}
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.018, 0.025, 0.85, 6]} /><meshStandardMaterial color="#88BBDD" transparent opacity={0.55} emissive="#88BBDD" emissiveIntensity={0.4} />
        </mesh>

        {/* Plaque énigme */}
        <mesh position={[0, 0.22, 0.92]} rotation={[-0.2, 0, 0]} onClick={onPuzzleTap}>
          <boxGeometry args={[0.85, 0.28, 0.05]} />
          <meshStandardMaterial color={solved ? "#D4AF37" : "#C0B898"} roughness={0.4} emissive={solved ? "#D4AF37" : "#A09070"} emissiveIntensity={solved ? 0.8 : 0.28} />
        </mesh>
        {!solved && onPuzzleTap && (
          <mesh position={[0, 0.58, 0.92]}>
            <ringGeometry args={[0.09, 0.14, 24]} /><meshBasicMaterial color="#88BBDD" transparent opacity={0.7} />
          </mesh>
        )}
      </group>

      {/* 2 petits bassins latéraux */}
      {[[-1.85, 0.28, -1.6], [1.85, 0.28, -1.6]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh><cylinderGeometry args={[0.38, 0.4, 0.24, 18]} /><meshStandardMaterial color="#E0D8C8" roughness={0.32} /></mesh>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.32, 18]} /><meshStandardMaterial color="#88AACC" transparent opacity={0.85} roughness={0.04} metalness={0.2} emissive="#3A6A8A" emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}

      {/* Niches avec bougies sur murs latéraux */}
      {[[-2.86, 1.9, -1.0], [-2.86, 1.9, 0.5], [2.86, 1.9, -1.0], [2.86, 1.9, 0.5]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh><boxGeometry args={[0.05, 0.38, 0.28]} /><meshStandardMaterial color="#D8CCAC" roughness={0.95} /></mesh>
          <mesh position={[i < 2 ? 0.02 : -0.02, -0.1, 0]}>
            <cylinderGeometry args={[0.025, 0.03, 0.12, 6]} /><meshStandardMaterial color="#F5F0E0" roughness={0.6} emissive="#FFE8A0" emissiveIntensity={0.3} />
          </mesh>
          <Flame position={[i < 2 ? 0.05 : -0.05, -0.02, 0]} />
        </group>
      ))}
    </group>
  );
}
