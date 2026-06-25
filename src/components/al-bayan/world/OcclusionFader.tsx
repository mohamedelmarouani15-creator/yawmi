"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { collectOccluderCandidates } from "@/lib/al-bayan/occluder-candidates";

// Tout décor entre la caméra et l'avatar devient semi-transparent au lieu de
// "manger" l'écran en plein noir (cas vécu : étagères/murs traversés par la
// caméra isométrique). Les dalles fines (sol, tapis, plateaux) sont ignorées
// via un seuil de hauteur, sinon le sol entier clignoterait en transparence
// dès qu'il croise le rayon caméra→avatar.
const FADE_OPACITY = 0.2;

// Un seul rayon vers le centre de l'avatar manque les occludeurs qui ne
// bloquent qu'une épaule/un bord de la silhouette (cas vécu : colonne qui
// mord juste le bras sans toucher le centre du torse). On échantillonne
// plusieurs points de son volume (pieds, torse, tête, épaules, devant/derrière).
const SAMPLE_OFFSETS: [number, number, number][] = [
  [0, 0.2, 0],
  [0, 0.9, 0],
  [0, 1.55, 0],
  [0.24, 1.0, 0],
  [-0.24, 1.0, 0],
  [0, 1.0, 0.24],
  [0, 1.0, -0.24],
];

interface FadedEntry {
  material: THREE.Material & { opacity: number };
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
}

export default function OcclusionFader({ avatarRef }: { avatarRef: React.RefObject<THREE.Group | null> }) {
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const faded = useRef(new Map<THREE.Mesh, FadedEntry>());
  const candidates = useRef<THREE.Mesh[] | null>(null);
  const target = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());

  useFrame(() => {
    const avatar = avatarRef.current;
    if (!avatar) return;

    // Collecte unique (au premier appel où l'avatar existe) des meshes assez
    // hauts pour être un mur/meuble — les zones sont statiques une fois
    // montées, pas besoin de recalculer ensuite.
    if (!candidates.current) {
      candidates.current = collectOccluderCandidates(scene, avatar);
    }

    const stillBlocking = new Set<THREE.Mesh>();

    for (const offset of SAMPLE_OFFSETS) {
      target.current.set(avatar.position.x + offset[0], avatar.position.y + offset[1], avatar.position.z + offset[2]);
      dir.current.copy(target.current).sub(camera.position);
      const distToTarget = dir.current.length();
      if (distToTarget < 0.01) continue;
      dir.current.normalize();

      raycaster.current.set(camera.position, dir.current);
      raycaster.current.near = 0.05;
      raycaster.current.far = Math.max(0.1, distToTarget - 0.25);

      const hits = raycaster.current.intersectObjects(candidates.current, false);
      for (const hit of hits) stillBlocking.add(hit.object as THREE.Mesh);
    }

    for (const mesh of stillBlocking) {
      if (faded.current.has(mesh)) continue;
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (!mat) continue;
      faded.current.set(mesh, {
        material: mat as THREE.Material & { opacity: number },
        opacity: (mat as THREE.Material & { opacity: number }).opacity,
        transparent: mat.transparent,
        depthWrite: mat.depthWrite,
      });
      mat.transparent = true;
      (mat as THREE.Material & { opacity: number }).opacity = FADE_OPACITY;
      mat.depthWrite = false;
    }

    for (const [mesh, original] of faded.current) {
      if (stillBlocking.has(mesh)) continue;
      original.material.transparent = original.transparent;
      original.material.opacity = original.opacity;
      original.material.depthWrite = original.depthWrite;
      faded.current.delete(mesh);
    }
  });

  return null;
}
