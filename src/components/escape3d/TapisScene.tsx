"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import * as THREE from "three";
import TapisVolant from "./TapisVolant";

export default function TapisScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.8, 3.5], fov: 60 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.25,
      }}
      shadows
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#020a05"]} />
      <fog attach="fog" args={["#020a05", 12, 35]} />

      {/* Ciel étoilé */}
      <Stars radius={60} depth={50} count={3000} factor={2} fade speed={0.4} />

      {/* Environnement nocturne pour les réflexions */}
      <Environment preset="night" />

      {/* Lumière ambiante douce */}
      <ambientLight intensity={0.35} color="#b8d4f0" />

      {/* Point lumineux doré au-dessus — halo magique */}
      <pointLight
        position={[0, 3.5, 0]}
        intensity={4}
        color="#D4AF37"
        distance={8}
        decay={2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* Lumière de remplissage latérale */}
      <pointLight position={[3, 1, 2]} intensity={1.2} color="#ffffff" distance={10} decay={2} />

      {/* Sol sombre — pour voir l'ombre portée du tapis */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#060e08" roughness={1} metalness={0} />
      </mesh>

      {/* Le tapis */}
      <TapisVolant basePosition={[0, 0.4, 0]} />

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={1.5}
        maxDistance={10}
        maxPolarAngle={Math.PI * 0.82}
        target={[0, 0.4, 0]}
      />
    </Canvas>
  );
}
