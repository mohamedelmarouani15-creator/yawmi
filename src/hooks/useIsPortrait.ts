"use client";

import { useEffect, useState } from "react";

/** Suit l'orientation de la fenêtre via `matchMedia` (met à jour au resize
 * ET à la rotation) — `false` au premier rendu serveur/hydratation. */
export function useIsPortrait() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isPortrait;
}
