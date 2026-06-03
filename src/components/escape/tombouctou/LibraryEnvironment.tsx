"use client";

import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

// ── Shaders ──────────────────────────────────────────────────────

const ZELLIGE_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Sol : étoile islamique à 8 branches (2 carrés superposés ±45°)
const ZELLIGE_FRAG = /* glsl */`
varying vec2 vUv;

void main() {
  vec2 uv = fract(vUv * 7.0) - 0.5;

  // Carré 1 — aligné
  float sq1 = max(abs(uv.x), abs(uv.y));

  // Carré 2 — pivoté 45°
  const float S = 0.7071067811865476;
  vec2 rot = vec2((uv.x + uv.y) * S, (uv.y - uv.x) * S);
  float sq2 = max(abs(rot.x), abs(rot.y));

  // Étoile = union des deux carrés
  float d = min(sq1, sq2);

  // Couleurs
  vec3 base  = vec3(0.157, 0.114, 0.055);  // #281D0E fond sombre
  vec3 tile  = vec3(0.22,  0.165, 0.082);  // #382A15 tuile
  vec3 edge  = vec3(0.52,  0.427, 0.133);  // or atténué

  float starR = 0.33;
  float edgeW = 0.024;

  float inStar = smoothstep(starR + 0.012, starR, d);
  float onEdge = smoothstep(starR + edgeW + 0.01, starR + edgeW, d)
               * (1.0 - smoothstep(starR + 0.006, starR - 0.002, d));

  vec3 col = mix(base, tile, inStar);
  col = mix(col, edge, onEdge * 0.75);

  // Micro-variation par tuile (usure naturelle)
  float tid  = dot(floor(vUv * 7.0), vec2(127.1, 311.7));
  float vary = fract(sin(tid) * 43758.5) * 0.035;
  col += vary;

  gl_FragColor = vec4(col, 1.0);
}`;

const WIN_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Fenêtre : ciel nocturne avec croissant de lune et étoiles
const WIN_FRAG = /* glsl */`
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  // Ciel nocturne dégradé
  vec3 skyTop    = vec3(0.018, 0.024, 0.07);
  vec3 skyBottom = vec3(0.04, 0.055, 0.14);
  vec3 sky       = mix(skyBottom, skyTop, vUv.y);

  // Croissant de lune (coin supérieur droit)
  vec2 moonC  = vec2(0.70, 0.80);
  vec2 moonS  = vec2(0.62, 0.85);  // centre de l'ombre pour le croissant
  float moon  = smoothstep(0.11, 0.08, length(vUv - moonC));
  float shad  = smoothstep(0.10, 0.07, length(vUv - moonS));
  float crescent = clamp(moon - shad * 1.1, 0.0, 1.0);

  // Halo lunaire
  float halo  = exp(-length(vUv - moonC) * 7.5) * 0.18;

  // Étoiles discrètes
  vec2  sUv   = vUv * 35.0;
  float sHash = hash(floor(sUv));
  float sDist = length(fract(sUv) - 0.5);
  float star  = step(0.94, sHash) * smoothstep(0.45, 0.0, sDist) * 0.5;

  // Assemblage
  vec3 moonColor = vec3(0.88, 0.90, 0.97);
  vec3 col = sky;
  col += vec3(0.25, 0.35, 0.55) * halo;
  col  = mix(col, moonColor, crescent);
  col += vec3(0.75, 0.80, 1.0) * star;

  // Vignette légère (cadre de fenêtre)
  float vig = 1.0 - smoothstep(0.38, 0.52, length(vUv - 0.5));
  col *= mix(0.6, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}`;

// ── Couleurs livres ───────────────────────────────────────────────
const BOOK_COLORS = [
  new THREE.Color("#1A4028"), // vert forêt
  new THREE.Color("#4A1818"), // bordeaux
  new THREE.Color("#3A2808"), // brun-or
  new THREE.Color("#0A1838"), // bleu nuit
  new THREE.Color("#2A1830"), // prune
  new THREE.Color("#1A2818"), // olive
  new THREE.Color("#483A14"), // ocre vieilli
  new THREE.Color("#200808"), // rouge profond
  new THREE.Color("#1E3A28"), // émeraude
  new THREE.Color("#352010"), // cuivre sombre
];

// ── Génération des livres ─────────────────────────────────────────
function useBookInstances(count: number) {
  return useMemo(() => {
    const dummy    = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    const colors:   THREE.Color[]   = [];

    const place = (
      cx: number, cz: number,
      rotY: number,
      shelfW: number,
      levels: number,
    ) => {
      const spacing  = 0.085;
      const perLevel = Math.floor(shelfW / spacing);
      for (let lv = 0; lv < levels; lv++) {
        for (let b = 0; b < perLevel; b++) {
          if (matrices.length >= count) return;
          // Léger désordre pour naturel
          const slant = (Math.random() - 0.5) * 0.12;
          dummy.position.set(
            cx + (-shelfW/2 + b * spacing + spacing/2),
            lv * 1.32 + 0.24,
            cz
          );
          dummy.rotation.set(slant, rotY, 0);
          dummy.scale.set(1, 0.72 + Math.random() * 0.56, 1 + Math.random() * 0.22);
          dummy.updateMatrix();
          matrices.push(dummy.matrix.clone());
          colors.push(BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)]);
        }
      }
    };

    // Étagères nord (z = -6.68) — 4 unités
    [-7.5, -2.5, 2.5, 7.5].forEach(x => place(x, -6.68, 0, 2.1, 5));
    // Étagères est (x = 9.18) — 2 unités
    // Pour mur est, les livres sont orientés face ouest
    // on permute cx/cz dans la fonction via un wrapper :
    [-3.0, 2.8].forEach(z => {
      const spacing  = 0.085;
      const shelfW   = 2.1;
      const perLevel = Math.floor(shelfW / spacing);
      for (let lv = 0; lv < 5; lv++) {
        for (let b = 0; b < perLevel; b++) {
          if (matrices.length >= count) return;
          const slant = (Math.random() - 0.5) * 0.1;
          dummy.position.set(
            9.18,
            lv * 1.32 + 0.24,
            z + (-shelfW/2 + b * spacing + spacing/2)
          );
          dummy.rotation.set(slant, -Math.PI/2, 0);
          dummy.scale.set(1, 0.72 + Math.random() * 0.56, 1 + Math.random() * 0.22);
          dummy.updateMatrix();
          matrices.push(dummy.matrix.clone());
          colors.push(BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)]);
        }
      }
    });
    // Étagères ouest (x = -9.18) — 2 unités
    [-3.0, 2.8].forEach(z => {
      const spacing  = 0.085;
      const shelfW   = 2.1;
      const perLevel = Math.floor(shelfW / spacing);
      for (let lv = 0; lv < 5; lv++) {
        for (let b = 0; b < perLevel; b++) {
          if (matrices.length >= count) return;
          const slant = (Math.random() - 0.5) * 0.1;
          dummy.position.set(
            -9.18,
            lv * 1.32 + 0.24,
            z + (-shelfW/2 + b * spacing + spacing/2)
          );
          dummy.rotation.set(slant, Math.PI/2, 0);
          dummy.scale.set(1, 0.72 + Math.random() * 0.56, 1 + Math.random() * 0.22);
          dummy.updateMatrix();
          matrices.push(dummy.matrix.clone());
          colors.push(BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)]);
        }
      }
    });

    return { matrices, colors, count: matrices.length };
  }, [count]);
}

// ── Instanced mesh livres ─────────────────────────────────────────
function Books() {
  const ref     = useRef<THREE.InstancedMesh>(null);
  const MAX     = 300;
  const { matrices, colors, count } = useBookInstances(MAX);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    colors.forEach((c, i)   => mesh.setColorAt(i, c));
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.count = count;
  }, [matrices, colors, count]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX]}>
      <boxGeometry args={[0.062, 0.22, 0.155]} />
      <meshStandardMaterial roughness={0.92} metalness={0} />
    </instancedMesh>
  );
}

// ── Table de lecture ──────────────────────────────────────────────
function ReadingTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Plateau */}
      <mesh position={[0, 0.87, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.5, 0.055, 0.85]} />
        <meshStandardMaterial color="#4A3520" roughness={0.88} metalness={0.04} />
      </mesh>
      {/* Tranche plateau */}
      <mesh position={[0, 0.845, 0]}>
        <boxGeometry args={[1.51, 0.02, 0.86]} />
        <meshStandardMaterial color="#3A2810" roughness={0.9} />
      </mesh>
      {/* 4 pieds */}
      {[[-0.65, -0.35], [0.65, -0.35], [-0.65, 0.35], [0.65, 0.35]].map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.43, pz]} castShadow>
          <cylinderGeometry args={[0.038, 0.042, 0.87, 10]} />
          <meshStandardMaterial color="#3A2810" roughness={0.9} />
        </mesh>
      ))}
      {/* Parchemin posé sur la table */}
      <mesh position={[0.1, 0.9, 0.05]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.5, 0.005, 0.38]} />
        <meshStandardMaterial color="#DDD0A8" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ── Unité d'étagère ───────────────────────────────────────────────
function ShelfUnit({
  position, rotY = 0, width = 2.3
}: {
  position: [number, number, number];
  rotY?: number;
  width?: number;
}) {
  const h = 7.2;  // hauteur totale sol→plafond
  const d = 0.36; // profondeur

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Montant gauche */}
      <mesh position={[-(width/2 + 0.04), h/2, 0]} castShadow>
        <boxGeometry args={[0.07, h, d]} />
        <meshStandardMaterial color="#3D2B1A" roughness={0.93} />
      </mesh>
      {/* Montant droit */}
      <mesh position={[width/2 + 0.04, h/2, 0]} castShadow>
        <boxGeometry args={[0.07, h, d]} />
        <meshStandardMaterial color="#3D2B1A" roughness={0.93} />
      </mesh>
      {/* 6 tablettes */}
      {[0, 1.2, 2.4, 3.6, 4.8, 6.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} receiveShadow>
          <boxGeometry args={[width + 0.06, 0.045, d]} />
          <meshStandardMaterial color="#4A3520" roughness={0.88} />
        </mesh>
      ))}
      {/* Panneau arrière (assombrit) */}
      <mesh position={[0, h/2, -(d/2 - 0.01)]}>
        <boxGeometry args={[width + 0.1, h, 0.018]} />
        <meshStandardMaterial color="#1E1208" roughness={1} />
      </mesh>
    </group>
  );
}

// ── Fenêtre haute ─────────────────────────────────────────────────
function Window({
  position, rotY = 0
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  const winMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   WIN_VERT,
    fragmentShader: WIN_FRAG,
    side:           THREE.DoubleSide,
    transparent:    true,
  }), []);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Vitre avec shader ciel nocturne */}
      <mesh>
        <planeGeometry args={[1.1, 1.7]} />
        <primitive object={winMat} />
      </mesh>
      {/* Encadrement bois */}
      {/* Haut */}
      <mesh position={[0, 0.87, 0.01]}>
        <boxGeometry args={[1.24, 0.08, 0.06]} />
        <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
      </mesh>
      {/* Bas */}
      <mesh position={[0, -0.87, 0.01]}>
        <boxGeometry args={[1.24, 0.08, 0.06]} />
        <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
      </mesh>
      {/* Gauche */}
      <mesh position={[-0.58, 0, 0.01]}>
        <boxGeometry args={[0.07, 1.7, 0.06]} />
        <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
      </mesh>
      {/* Droite */}
      <mesh position={[0.58, 0, 0.01]}>
        <boxGeometry args={[0.07, 1.7, 0.06]} />
        <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
      </mesh>
      {/* Croisillon */}
      <mesh position={[0, 0.02, 0.01]}>
        <boxGeometry args={[1.1, 0.05, 0.04]} />
        <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
      </mesh>
      {/* Lumière lune entrant */}
      <spotLight
        position={[0, 0, 0.3]}
        target-position={[0, -1, 2]}
        color="#1A3A5C"
        intensity={0.65}
        angle={0.22}
        penumbra={0.8}
        distance={14}
        castShadow={false}
      />
    </group>
  );
}

// ── Étoiles (Points) ─────────────────────────────────────────────
function Stars() {
  const points = useMemo(() => {
    const count = 180;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 22;
      pos[i*3+1] = 4 + Math.random() * 6;
      pos[i*3+2] = -8.2 - Math.random() * 3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  return (
    <points geometry={points}>
      <pointsMaterial color="#C8D8FF" size={0.025} sizeAttenuation />
    </points>
  );
}

// ── Environnement complet ─────────────────────────────────────────
export default function LibraryEnvironment() {
  const floorMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   ZELLIGE_VERT,
    fragmentShader: ZELLIGE_FRAG,
    side:           THREE.FrontSide,
  }), []);

  return (
    <>
      {/* Lumière ambiante — assez pour voir les contours */}
      <ambientLight color="#1E1A10" intensity={0.35} />
      {/* Lune — éclairage hémisphérique nuit naturelle */}
      <hemisphereLight args={["#1A2744", "#0A0A05", 0.4]} />

      {/* SOL zellige */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 15, 1, 1]} />
        <primitive object={floorMat} />
      </mesh>

      {/* PLAFOND bois sombre */}
      <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#140D06" roughness={1} />
      </mesh>

      {/* MURS */}
      {/* Nord */}
      <mesh position={[0, 4, -7.5]} receiveShadow>
        <boxGeometry args={[20, 8, 0.25]} />
        <meshStandardMaterial color="#1A140A" roughness={0.95} />
      </mesh>
      {/* Sud */}
      <mesh position={[0, 4, 7.5]}>
        <boxGeometry args={[20, 8, 0.25]} />
        <meshStandardMaterial color="#1A140A" roughness={0.95} />
      </mesh>
      {/* Est */}
      <mesh position={[10, 4, 0]}>
        <boxGeometry args={[0.25, 8, 15]} />
        <meshStandardMaterial color="#1A140A" roughness={0.95} />
      </mesh>
      {/* Ouest */}
      <mesh position={[-10, 4, 0]}>
        <boxGeometry args={[0.25, 8, 15]} />
        <meshStandardMaterial color="#1A140A" roughness={0.95} />
      </mesh>

      {/* ÉTAGÈRES nord (mur -Z) */}
      <ShelfUnit position={[-7.5, 0, -7.22]} />
      <ShelfUnit position={[-2.5, 0, -7.22]} />
      <ShelfUnit position={[ 2.5, 0, -7.22]} />
      <ShelfUnit position={[ 7.5, 0, -7.22]} />

      {/* ÉTAGÈRES est */}
      <ShelfUnit position={[9.22, 0, -3.0]} rotY={-Math.PI/2} />
      <ShelfUnit position={[9.22, 0,  2.8]} rotY={-Math.PI/2} />

      {/* ÉTAGÈRES ouest */}
      <ShelfUnit position={[-9.22, 0, -3.0]} rotY={Math.PI/2} />
      <ShelfUnit position={[-9.22, 0,  2.8]} rotY={Math.PI/2} />

      {/* TABLES DE LECTURE (zone centrale) */}
      <ReadingTable position={[ 0,   0,  0.8]} />
      <ReadingTable position={[-2.6, 0, -0.5]} />
      <ReadingTable position={[ 2.6, 0, -0.5]} />

      {/* FENÊTRES — mur nord, en hauteur */}
      <Window position={[-4.5, 6.0, -7.36]} />
      <Window position={[ 4.5, 6.0, -7.36]} />
      {/* Fenêtres latérales */}
      <Window position={[ 9.86, 5.8,  0 ]} rotY={-Math.PI/2} />
      <Window position={[-9.86, 5.8,  0 ]} rotY={ Math.PI/2} />

      {/* LIVRES (InstancedMesh) */}
      <Books />

      {/* ÉTOILES derrière les fenêtres nord */}
      <Stars />

      {/* Sol supplémentaire sous les étagères (évite le vide) */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#1A1208" roughness={1} />
      </mesh>
    </>
  );
}
