"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Courtyard from "./Courtyard";

export default function RiadScene() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        camera={{ position: [0, 4, 6], fov: 60, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Courtyard />
      </Canvas>
    </div>
  );
}
