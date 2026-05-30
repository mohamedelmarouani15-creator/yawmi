"use client";

import { Canvas } from "@react-three/fiber";

export default function RiadScene() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 75 }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Fond rouge pour confirmer que le canvas rend bien */}
        <color attach="background" args={["#220000"]} />

        <ambientLight intensity={2} />

        {/* Sol large et brillant */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial color="#1A5C3A" />
        </mesh>

        {/* Mur face caméra */}
        <mesh position={[0, 1.75, -3.5]}>
          <boxGeometry args={[7, 3.5, 0.2]} />
          <meshBasicMaterial color="#F0EAD8" />
        </mesh>

        {/* Cube test au centre */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#D4AF37" />
        </mesh>
      </Canvas>
    </div>
  );
}
