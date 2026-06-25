import { useRef } from "react";
import * as THREE from "three";
import { isDescendantOf } from "./scene-utils";

const MIN_OCCLUDER_HEIGHT = 0.3;

/**
 * Liste (calculée une seule fois, la scène étant statique après montage)
 * des meshes assez "hauts" pour compter comme mur/meuble/colonne — partagée
 * entre l'occlusion caméra (fade) et la collision caméra (raccourcissement
 * de distance avant même de toucher un mur). `InstancedMesh` (livres,
 * lattice moucharabieh) hérite `type === "Mesh"` de three.js sans type
 * distinct ; sa boîte englobante via `Box3.setFromObject` couvre TOUTES ses
 * instances à la fois, donc le filtre de hauteur n'est pas pertinent pour
 * lui — on l'inclut toujours (le raycasting teste chaque instance
 * individuellement, donc une particule de 0.008 de rayon n'a quasiment
 * aucune chance d'être touchée, sans risque de faux positif).
 */
export function collectOccluderCandidates(scene: THREE.Scene, avatar: THREE.Object3D): THREE.Mesh[] {
  const list: THREE.Mesh[] = [];
  const box = new THREE.Box3();
  scene.traverse((obj) => {
    if (obj.type !== "Mesh") return;
    if (isDescendantOf(obj, avatar)) return;
    const mesh = obj as THREE.Mesh;
    if (mesh instanceof THREE.InstancedMesh) {
      list.push(mesh);
      return;
    }
    box.setFromObject(mesh);
    if (box.max.y - box.min.y < MIN_OCCLUDER_HEIGHT) return;
    list.push(mesh);
  });
  return list;
}

/** Ref paresseuse : peuplée au premier appel où l'avatar existe, jamais recalculée ensuite. */
export function useOccluderCandidatesRef() {
  return useRef<THREE.Mesh[] | null>(null);
}
