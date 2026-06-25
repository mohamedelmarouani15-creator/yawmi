"use client";

import type { CSSProperties, ReactNode } from "react";
import { Html } from "@react-three/drei";

type Hud3DLabelVariant = "tag" | "title" | "panel" | "beacon";

interface Hud3DLabelProps {
  position: [number, number, number];
  children: ReactNode;
  variant?: Hud3DLabelVariant;
  accent?: string;
  interactive?: boolean;
}

const VARIANT_CLASS: Record<Hud3DLabelVariant, string> = {
  tag: "px-2.5 py-1 text-[9px] font-semibold text-[#F8F4EC]/85",
  title: "px-3 py-1.5 text-[10px] font-bold text-amber-400",
  panel: "px-4 py-2.5 text-[11px] font-bold text-[#F8F4EC]",
  beacon: "px-3.5 py-2 text-[11px] font-bold tracking-wide text-amber-300",
};

/**
 * Bulle/panneau HTML ancré dans l'espace 3D (drei `Html`) — fond noir
 * opaque à 80% flouté, bordure or ambré, coins arrondis. Remplace les
 * `<span>` flottants sans arrière-plan qui se chevauchaient et devenaient
 * illisibles selon le décor derrière eux.
 *
 * Pas de `distanceFactor` (taille à l'écran toujours fixe, en pixels) :
 * testé en vrai sur device, ce réglage faisait grossir les badges quand la
 * caméra s'approchait (l'inverse de l'effet recherché) — au point de
 * recouvrir d'autres badges et même le Timer/HintMailbox à l'écran. Une
 * taille fixe reste lisible et stable quelle que soit la distance.
 */
export default function Hud3DLabel({
  position,
  children,
  variant = "tag",
  accent,
  interactive = false,
}: Hud3DLabelProps) {
  const accentStyle: CSSProperties | undefined = accent
    ? { borderColor: accent, color: accent }
    : undefined;

  return (
    <Html position={position} center zIndexRange={[10, 0]}>
      <div
        className={`whitespace-nowrap rounded-xl border border-amber-500/30 bg-black/80 text-center font-sans shadow-lg backdrop-blur-md ${VARIANT_CLASS[variant]}`}
        style={{ pointerEvents: interactive ? "auto" : "none", ...accentStyle }}
      >
        {children}
      </div>
    </Html>
  );
}
