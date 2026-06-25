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

const VARIANT_STYLE: Record<Hud3DLabelVariant, CSSProperties> = {
  tag: {
    padding: "4px 10px",
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(248,244,236,0.88)",
    background: "linear-gradient(135deg, rgba(10,10,6,0.92), rgba(16,12,4,0.95))",
    border: "1px solid rgba(212,175,55,0.22)",
    borderRadius: 8,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.06)",
    whiteSpace: "nowrap" as const,
    fontFamily: "var(--font-dm-sans)",
  },
  title: {
    padding: "5px 12px",
    fontSize: 10,
    fontWeight: 800,
    color: "#D4AF37",
    background: "linear-gradient(135deg, rgba(14,10,2,0.94), rgba(20,14,4,0.96))",
    border: "1px solid rgba(212,175,55,0.35)",
    borderRadius: 10,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.55), 0 0 16px rgba(212,175,55,0.08)",
    whiteSpace: "nowrap" as const,
    fontFamily: "var(--font-dm-sans)",
  },
  panel: {
    padding: "10px 16px",
    fontSize: 11,
    fontWeight: 700,
    color: "#F8F4EC",
    background: "linear-gradient(135deg, rgba(16,12,4,0.96), rgba(10,8,2,0.98))",
    border: "1px solid rgba(212,175,55,0.3)",
    borderRadius: 14,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
    fontFamily: "var(--font-dm-sans)",
  },
  beacon: {
    padding: "6px 14px",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.04em",
    color: "#F0C84A",
    background: "linear-gradient(135deg, rgba(30,20,4,0.96), rgba(20,14,2,0.98))",
    border: "1px solid rgba(212,175,55,0.5)",
    borderRadius: 12,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 2px 16px rgba(212,175,55,0.18), inset 0 1px 0 rgba(212,175,55,0.12)",
    whiteSpace: "nowrap" as const,
    fontFamily: "var(--font-dm-sans)",
    animation: "albayan-beacon-pulse 2.5s ease-in-out infinite",
  },
};

const BEACON_KEYFRAMES = `
@keyframes albayan-beacon-pulse {
  0%, 100% { box-shadow: 0 2px 16px rgba(212,175,55,0.18), inset 0 1px 0 rgba(212,175,55,0.12); }
  50%       { box-shadow: 0 2px 28px rgba(212,175,55,0.38), inset 0 1px 0 rgba(212,175,55,0.20); }
}
`;

export default function Hud3DLabel({
  position,
  children,
  variant = "tag",
  accent,
  interactive = false,
}: Hud3DLabelProps) {
  const base = VARIANT_STYLE[variant];
  const accentOverride: CSSProperties | undefined = accent
    ? { borderColor: `${accent}55`, color: accent }
    : undefined;

  return (
    <Html position={position} center zIndexRange={[10, 0]}>
      {variant === "beacon" && (
        <style>{BEACON_KEYFRAMES}</style>
      )}
      <div
        style={{
          ...base,
          pointerEvents: interactive ? "auto" : "none",
          textAlign: "center",
          ...accentOverride,
        }}
      >
        {children}
      </div>
    </Html>
  );
}
