"use client";

import { Html } from "@react-three/drei";
import * as THREE from "three";
import CandleLight from "../../maison-sagesse/shared/CandleLight";
import AmbientParticles from "../../maison-sagesse/shared/AmbientParticles";
import InteractiveAura from "../shared/InteractiveAura";
import ProximityPrompt from "../../maison-sagesse/shared/ProximityPrompt";
import { usePBRMaterial } from "@/lib/al-bayan/pbr-materials";
import { JAR_CODE, KITCHEN_CLUE } from "@/lib/al-bayan/puzzle-logic";

export const CUISINE_SIZE = 11;
export const CUISINE_H = 4.6;
export const CUISINE_Y = -0.6;
// Position monde — cf. calcul dans CorridorScriptoriumCuisine.tsx : le mur
// "+X local" (gap au centre) doit atterrir sur CUISINE_OPENING_X=-26.9.
export const CUISINE_POSITION: [number, number, number] = [-32.3, CUISINE_Y, 0];

const GAP_HALF = 1.6;
const SEG_LEN = (CUISINE_SIZE - GAP_HALF * 2) / 2;
const SEG_Z = GAP_HALF + SEG_LEN / 2;

/** Jarre en terre cuite — les 4 "gravées" (avec un chiffre) forment le code
 * du coffre, lues de gauche à droite ; les autres sont purement décoratives. */
function OilJar({ position, digit, scale = 1 }: { position: [number, number, number]; digit?: number; scale?: number }) {
  const terracottaMat = usePBRMaterial("terracotta", { repeat: [1, 1] });
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow material={terracottaMat}>
        <sphereGeometry args={[0.28, 12, 10]} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow material={terracottaMat}>
        <cylinderGeometry args={[0.09, 0.14, 0.16, 10]} />
      </mesh>
      {digit !== undefined && (
        <Html position={[0, 0.42, 0]} center distanceFactor={9}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: "#D4AF37",
              fontFamily: "var(--font-dm-sans)",
              textShadow: "0 0 6px rgba(0,0,0,0.9)",
              pointerEvents: "none",
            }}
          >
            {digit}
          </span>
        </Html>
      )}
    </group>
  );
}

/** Étagère du fond — 4 jarres gravées (le code) parmi des poteries décoratives. */
function JarShelf({ avatarRef, jarsRead, onRead }: { avatarRef: React.RefObject<THREE.Group | null>; jarsRead: boolean; onRead: () => void }) {
  const woodMat = usePBRMaterial("wood-dark", { repeat: [2, 0.3] });
  return (
    <group position={[0, 0, -4.6]}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow material={woodMat}>
        <boxGeometry args={[6, 1.6, 0.3]} />
      </mesh>
      {JAR_CODE.map((d, i) => (
        <OilJar key={`code-${i}`} position={[-1.8 + i * 1.2, 1.5, 0.15]} digit={d} />
      ))}
      {/* Poteries décoratives, sans chiffre — le joueur doit distinguer les
          4 jarres gravées des autres. */}
      <OilJar position={[-2.6, 0.28, 0.3]} scale={1.3} />
      <OilJar position={[2.6, 0.28, 0.3]} scale={1.3} />

      {!jarsRead && (
        <ProximityPrompt avatarRef={avatarRef} zoneOffset={CUISINE_POSITION} localPosition={[0, 0, -4.6]} radius={2.6}>
          {(inRange) =>
            inRange && (
              <Html position={[0, 2.3, 0]} center distanceFactor={9}>
                <div
                  className="flex flex-col items-center gap-2 rounded-2xl px-4 py-3"
                  style={{ background: "rgba(10,15,13,0.85)", border: "1px solid rgba(212,175,55,0.4)", backdropFilter: "blur(10px)", maxWidth: 220 }}
                >
                  <span style={{ fontSize: 9, color: "rgba(248,244,236,0.7)", fontFamily: "var(--font-dm-sans)", textAlign: "center" }}>
                    {KITCHEN_CLUE}
                  </span>
                  <button
                    onClick={onRead}
                    style={{
                      pointerEvents: "auto",
                      background: "linear-gradient(135deg, #7a5c1a 0%, #D4AF37 50%, #7a5c1a 100%)",
                      border: "1px solid rgba(212,175,55,0.7)",
                      color: "#0A0F0D",
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: 800,
                      fontSize: 11,
                      borderRadius: 10,
                      padding: "6px 14px",
                      cursor: "pointer",
                    }}
                  >
                    Lire les jarres
                  </button>
                </div>
              </Html>
            )
          }
        </ProximityPrompt>
      )}
    </group>
  );
}

/** Panier en osier tressé. */
function WickerBasket({ position }: { position: [number, number, number] }) {
  const wickerMat = usePBRMaterial("wicker", { repeat: [1, 1] });
  return (
    <mesh position={position} castShadow receiveShadow material={wickerMat}>
      <cylinderGeometry args={[0.32, 0.24, 0.4, 10]} />
    </mesh>
  );
}

/** Mortier en pierre avec pilon. */
function StoneMortar({ position }: { position: [number, number, number] }) {
  const stoneMat = usePBRMaterial("marble", { repeat: [1, 1], color: "#c9c0a8", roughnessIntensity: 0.85 });
  return (
    <group position={position}>
      <mesh castShadow receiveShadow material={stoneMat}>
        <cylinderGeometry args={[0.22, 0.16, 0.24, 12]} />
      </mesh>
      <mesh position={[0.05, 0.25, 0]} rotation={[0, 0, 0.5]} castShadow material={stoneMat}>
        <cylinderGeometry args={[0.04, 0.05, 0.35, 8]} />
      </mesh>
    </group>
  );
}

interface CuisineProps {
  avatarRef: React.RefObject<THREE.Group | null>;
  jarsRead?: boolean;
  onReadJars?: () => void;
}

/**
 * Zone 6 — La Cuisine traditionnelle, accessible uniquement par le passage
 * secret révélé par les manuscrits du Scriptorium. Poteries d'argile,
 * jarres d'huile, mortier de pierre, paniers d'osier — 4 jarres gravées
 * donnent le code du coffre du Majlis.
 */
export default function Cuisine({ avatarRef, jarsRead, onReadJars }: CuisineProps) {
  const terracottaFloor = usePBRMaterial("terracotta", { repeat: [3, 3], roughnessIntensity: 0.8 });
  const plasterMat = usePBRMaterial("plaster", { repeat: [2, 1.5] });

  return (
    <group>
      <ambientLight color="#3D2A10" intensity={0.28} />
      <pointLight color="#E8A33D" intensity={2.2} distance={10} decay={2} position={[0, CUISINE_H - 0.4, 0]} castShadow />
      <pointLight color="#FFC266" intensity={1.4} distance={7} decay={2} position={[0, 1.4, -3]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CUISINE_SIZE, CUISINE_SIZE]} />
        <primitive object={terracottaFloor} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CUISINE_H, 0]}>
        <planeGeometry args={[CUISINE_SIZE, CUISINE_SIZE]} />
        <meshStandardMaterial color="#1A1008" roughness={0.9} />
      </mesh>

      {/* Mur vers le Scriptorium (passage secret) — percé au centre */}
      <mesh position={[CUISINE_SIZE / 2 - 0.1, CUISINE_H / 2, -SEG_Z]} receiveShadow castShadow>
        <boxGeometry args={[0.2, CUISINE_H, SEG_LEN]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[CUISINE_SIZE / 2 - 0.1, CUISINE_H / 2, SEG_Z]} receiveShadow castShadow>
        <boxGeometry args={[0.2, CUISINE_H, SEG_LEN]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      {/* 3 autres côtés — pleins */}
      <mesh position={[-CUISINE_SIZE / 2 + 0.1, CUISINE_H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, CUISINE_H, CUISINE_SIZE]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[0, CUISINE_H / 2, -CUISINE_SIZE / 2 + 0.1]} receiveShadow castShadow>
        <boxGeometry args={[CUISINE_SIZE, CUISINE_H, 0.2]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>
      <mesh position={[0, CUISINE_H / 2, CUISINE_SIZE / 2 - 0.1]} receiveShadow castShadow>
        <boxGeometry args={[CUISINE_SIZE, CUISINE_H, 0.2]} />
        <primitive object={plasterMat} attach="material" />
      </mesh>

      <InteractiveAura position={[0, 0.02, -4.6]} color="#D4AF37" radius={1.6} />
      <JarShelf avatarRef={avatarRef} jarsRead={!!jarsRead} onRead={() => onReadJars?.()} />

      <StoneMortar position={[-3.2, 0.12, 2]} />
      <StoneMortar position={[3.2, 0.12, 2]} />
      <WickerBasket position={[-4, 0.2, -1]} />
      <WickerBasket position={[4, 0.2, -1]} />
      <WickerBasket position={[-4, 0.2, 3.5]} />

      <CandleLight position={[-4.3, 0.4, -3]} intensity={0.9} avatarRef={avatarRef} />
      <CandleLight position={[4.3, 0.4, -3]} intensity={0.9} avatarRef={avatarRef} />

      <AmbientParticles avatarRef={avatarRef} />
    </group>
  );
}
