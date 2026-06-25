import * as THREE from "three";

/** Vrai si `obj` est `ancestor` ou un de ses descendants dans le graphe de scène. */
export function isDescendantOf(obj: THREE.Object3D, ancestor: THREE.Object3D): boolean {
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    if (cur === ancestor) return true;
    cur = cur.parent;
  }
  return false;
}
