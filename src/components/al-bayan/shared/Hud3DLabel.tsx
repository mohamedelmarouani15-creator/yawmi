"use client";

import type { CSSProperties, ReactNode } from "react";
import { Html } from "@react-three/drei";

type Hud3DLabelVariant = "tag" | "title" | "panel";

interface Hud3DLabelProps {
  position: [number, number, number];
  children: ReactNode;
  variant?: Hud3DLabelVariant;
  accent?: string;
  interactive?: boolean;
}

const BASE: CSSProperties = {
  background: "rgba(6,8,6,0.6)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  border: "1px solid rgba(212,175,55,0.25)",
  borderRadius: 10,
  whiteSpace: "nowrap",
  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
  fontFamily: "var(--font-dm-sans)",
  textAlign: "center",
};

const VARIANT_STYLE: Record<Hud3DLabelVariant, CSSProperties> = {
  tag: { padding: "3px 9px", fontSize: 9, fontWeight: 600, color: "rgba(248,244,236,0.85)" },
  title: { padding: "5px 12px", fontSize: 10, fontWeight: 700, color: "#D4AF37" },
  panel: { padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#F8F4EC" },
};

/**
 * Bulle/panneau HTML ancré dans l'espace 3D (drei `Html`), fond sombre flou
 * — remplace les `<span>` flottants sans arrière-plan qui se chevauchaient
 * et devenaient illisibles selon le décor derrière eux.
 */
export default function Hud3DLabel({ position, children, variant = "tag", accent, interactive = false }: Hud3DLabelProps) {
  const style: CSSProperties = {
    ...BASE,
    ...VARIANT_STYLE[variant],
    ...(accent ? { borderColor: accent, color: accent } : null),
    pointerEvents: interactive ? "auto" : "none",
  };

  return (
    <Html position={position} center zIndexRange={[10, 0]}>
      <div style={style}>{children}</div>
    </Html>
  );
}
