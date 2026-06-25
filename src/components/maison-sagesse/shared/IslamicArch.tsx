"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface IslamicArchProps {
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
}

/**
 * Horseshoe (Moorish) arch — built with ExtrudeGeometry.
 * The profile is a 2D shape: two vertical sides + a horseshoe arc at top
 * that extends slightly below the spring-line (characteristic of Islamic arch).
 */
export default function IslamicArch({
  width = 3,
  height = 5,
  depth = 0.35,
  color = "#8B7355",
}: IslamicArchProps) {
  const geometry = useMemo(() => {
    const hw = width / 2;       // half width of opening
    const wallT = 0.3;          // wall thickness
    const springH = height * 0.5; // height where the arc begins

    // Horseshoe radius — the arc center is at spring line
    const archR = hw + wallT * 0.5;

    // We build the SOLID arch frame (not just the opening) as a shape
    const shape = new THREE.Shape();

    // Outer left bottom → outer left top spring
    shape.moveTo(-(hw + wallT), 0);
    shape.lineTo(-(hw + wallT), springH);

    // Outer horseshoe arc — from left spring to right spring (going over top)
    // Horseshoe: arc goes slightly below center (270° arc for horseshoe effect)
    const outerR = archR + wallT * 0.5;
    const overhang = outerR * 0.18; // how far below spring-line the arch bulges
    shape.absarc(0, springH - overhang, outerR, Math.PI, 0, true);

    // Outer right top to bottom, then close back to the start. The outer
    // silhouette is a plain rectangle-plus-arch frame — it must never visit
    // the inner-wall points (hw, 0) / (hw, springH); those belong only to
    // the hole below. Routing the outer path through them first (as the
    // previous version did) skipped the actual bottom-right corner and
    // closed with one giant diagonal cutting across the whole arch — the
    // very same "diagonal beam" artifact, this time from the OUTER shape
    // rather than the hole.
    shape.lineTo(hw + wallT, 0);

    // Inner horseshoe arc (cutout) — smaller radius
    const innerR = hw;
    const innerCenterY = springH - innerR * 0.18;
    // We need to go right to left for the inner arc (hole). A THREE.Path's
    // moveTo() only sets the current point — it does NOT itself draw a
    // segment. Since absarc() starts its own curve at (hw, innerCenterY),
    // not at this moveTo's (hw, springH), that first segment must be drawn
    // explicitly, and the loop must be closed explicitly too: otherwise
    // Earcut closes it automatically by jumping straight from the path's
    // last point (-hw, 0) back to its first sampled point — a long
    // diagonal slicing clean across the arch opening (the "diagonal beam"
    // artifact visible from the main hall).
    const holePath = new THREE.Path();
    holePath.moveTo(hw, springH);
    holePath.lineTo(hw, innerCenterY);
    holePath.absarc(0, innerCenterY, innerR, 0, Math.PI, false);
    holePath.lineTo(-hw, 0);
    holePath.lineTo(hw, 0);
    holePath.lineTo(hw, springH);
    shape.holes.push(holePath);

    // Continue outer: left bottom
    shape.lineTo(-(hw + wallT), 0);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 2,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [width, height, depth]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.9,
        metalness: 0.05,
      }),
    [color]
  );

  // Decorative keystone — a small protruding block at the apex
  const keystoneGeo = useMemo(
    () => new THREE.BoxGeometry(width * 0.12, width * 0.06, depth + 0.08),
    [width, depth]
  );
  const keystoneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C8A84B",
        roughness: 0.7,
        metalness: 0.3,
      }),
    []
  );

  // Springer blocks at the sides (where arch meets wall)
  const springerGeo = useMemo(
    () => new THREE.BoxGeometry(0.35, 0.12, depth + 0.05),
    [depth]
  );

  const springH = height * 0.5;
  const archR = width / 2 + 0.3 * 0.5;
  const overhang = archR * 0.18;
  const apexY = springH - overhang + archR;

  return (
    <group>
      {/* Main arch frame — `userData.noCollide` : sa géométrie a un trou (le
          passage), mais une AABB ne connaît pas les trous et couvrirait tout
          le cadre, bouchant l'ouverture qu'elle est censée laisser franchir.
          L'occlusion caméra n'est pas concernée (raycasting réel, pas une
          boîte) ; seule la collision de déplacement (WePlayAvatar) doit
          ignorer ce mesh précis. */}
      <mesh geometry={geometry} material={material} receiveShadow castShadow position={[0, 0, -depth / 2]} userData={{ noCollide: true }} />

      {/* Keystone at apex */}
      <mesh
        geometry={keystoneGeo}
        material={keystoneMat}
        position={[0, apexY, 0]}
        castShadow
      />

      {/* Left springer */}
      <mesh
        geometry={springerGeo}
        material={keystoneMat}
        position={[-(width / 2 + 0.15), springH, 0]}
        castShadow
      />
      {/* Right springer */}
      <mesh
        geometry={springerGeo}
        material={keystoneMat}
        position={[width / 2 + 0.15, springH, 0]}
        castShadow
      />
    </group>
  );
}
