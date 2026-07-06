"use client";

import { forwardRef } from "react";
import * as THREE from "three";

interface LightShaftSunProps {
  position: [number, number, number];
  color?: string;
  size?: number;
}

/**
 * Source lumineuse pour l'effet GodRays (rayons crépusculaires) — un disque
 * émissif additif, invisible en tant qu'objet (pas de matière physique),
 * placé derrière une cloison ajourée (moucharabieh) pour que l'effet crée
 * des faisceaux de lumière traversant les perforations, occludés par la
 * profondeur de scène comme de vrais rayons de soleil.
 */
const LightShaftSun = forwardRef<THREE.Mesh, LightShaftSunProps>(
  ({ position, color = "#FFE8B0", size = 1.6 }, ref) => (
    <mesh ref={ref} position={position}>
      <circleGeometry args={[size, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
    </mesh>
  )
);

LightShaftSun.displayName = "LightShaftSun";

export default LightShaftSun;
