/**
 * Relaie un tap (pas un drag) reçu par une zone tactile plein-écran
 * (joystick, look-zone...) jusqu'au véritable élément sous le doigt —
 * typiquement le canvas r3f, pour qu'un portail/porte 3D ou un bouton UI
 * réagisse normalement au tap.
 *
 * Deux pièges, vérifiés en runtime :
 *
 * 1. r3f n'appelle le handler `onClick` d'un mesh que si ce mesh figure
 *    dans son `initialHits` interne, peuplé uniquement par un vrai
 *    `pointerdown` natif sur le canvas — un simple `MouseEvent("click")`
 *    de synthèse ne suffit jamais à lui seul. On relaie donc le triplet
 *    pointerdown → pointerup → click, pas juste le clic final.
 *
 * 2. Les zones tactiles (mouvement à gauche, regard à droite) se
 *    chevauchent sur une bande étroite au centre de l'écran. Masquer
 *    uniquement la zone d'origine n'y suffit pas : l'autre zone, elle
 *    aussi en pointer-events:auto, reste sous le doigt. On masque donc
 *    en boucle tout ce qui n'est pas le canvas, jusqu'à l'atteindre (ou
 *    abandonner après quelques tentatives), puis on restaure tout.
 */
export function dispatchPassthroughTap(x: number, y: number) {
  const hidden: Array<[HTMLElement, string]> = [];
  let target: Element | null = document.elementFromPoint(x, y);

  let attempts = 0;
  while (target && target.tagName !== "CANVAS" && attempts < 8) {
    const el = target as HTMLElement;
    hidden.push([el, el.style.pointerEvents]);
    el.style.pointerEvents = "none";
    const next = document.elementFromPoint(x, y);
    if (next === target) break; // plus rien dessous, on s'arrête là où on est
    target = next;
    attempts++;
  }

  const opts = { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window };
  target?.dispatchEvent(new PointerEvent("pointerdown", { ...opts, pointerId: 1, pointerType: "touch", isPrimary: true }));
  target?.dispatchEvent(new PointerEvent("pointerup", { ...opts, pointerId: 1, pointerType: "touch", isPrimary: true }));
  target?.dispatchEvent(new MouseEvent("click", opts));

  for (const [el, prev] of hidden) el.style.pointerEvents = prev;
}
