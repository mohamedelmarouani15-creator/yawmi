"use client";

import { Canvas } from "@react-three/fiber";

export default function RiadScene() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        camera={{ position: [0, 3, 6], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1} />
        <pointLight position={[5, 5, 5]} />
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#D4AF37" />
        </mesh>
      </Canvas>
    </div>
  );
}
