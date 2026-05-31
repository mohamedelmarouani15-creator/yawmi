import type { SVGProps } from "react";

type BaseProps = SVGProps<SVGSVGElement> & { size?: number };

/* ── Croissant + étoile (symbole universel) ─────────────────── */
export function CrescentStar({ size = 24, ...p }: BaseProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <path
        d="M19 9.5A8.5 8.5 0 0 1 9.5 20 8.5 8.5 0 0 1 4 14.5c2.3 1 5.1.4 7-1.5s2.5-4.7 1.5-7A8.5 8.5 0 0 1 19 9.5z"
        fill="currentColor"
      />
      <path
        d="M17 3l.55 1.7L19.25 4l-1.15 1.35L18.7 7l-1.7-.55L15.65 8l.5-1.75L14.3 5l1.75-.5L16.5 2.8 17 3z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ── Étoile 8 branches (zellige / girih) ────────────────────── */
export function Star8({ size = 24, ...p }: BaseProps) {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 90) * (Math.PI / 180);
    const b = ((i * 45 + 22.5) - 90) * (Math.PI / 180);
    const R = 11, r = 5;
    return `${12 + R * Math.cos(a)},${12 + R * Math.sin(a)} ${12 + r * Math.cos(b)},${12 + r * Math.sin(b)}`;
  }).join(" ");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <polygon points={pts} fill="currentColor" />
    </svg>
  );
}

/* ── Bismillah stylisé (SVG path calligraphique simplifié) ──── */
export function BismillahIcon({ size = 24, ...p }: BaseProps) {
  return (
    <svg width={size} height={size * 0.4} viewBox="0 0 120 48" fill="none" {...p}>
      <text
        x="60" y="36"
        textAnchor="middle"
        fontFamily="var(--font-amiri), serif"
        fontSize="32"
        fill="currentColor"
      >
        بسم الله
      </text>
    </svg>
  );
}

/* ── Mosquée silhouette ─────────────────────────────────────── */
export function MosqueIcon({ size = 24, ...p }: BaseProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* Corps principal */}
      <rect x="3" y="13" width="18" height="8" rx="0.5" fill="currentColor" opacity="0.9" />
      {/* Dôme central */}
      <path d="M8 13 Q12 4 16 13Z" fill="currentColor" />
      {/* Minaret gauche */}
      <rect x="2" y="7" width="3" height="14" rx="0.5" fill="currentColor" opacity="0.8" />
      <ellipse cx="3.5" cy="7" rx="1.5" ry="2" fill="currentColor" />
      {/* Minaret droit */}
      <rect x="19" y="7" width="3" height="14" rx="0.5" fill="currentColor" opacity="0.8" />
      <ellipse cx="20.5" cy="7" rx="1.5" ry="2" fill="currentColor" />
      {/* Fenêtre mihrab */}
      <path d="M10.5 21 L10.5 16 Q12 14 13.5 16 L13.5 21Z" fill="var(--bg, #061A12)" />
    </svg>
  );
}

/* ── Motif géométrique arabesque (carré répétable) ──────────── */
export function GeometricTile({ size = 24, ...p }: BaseProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      <polygon
        points="12,2 22,12 12,22 2,12"
        stroke="currentColor" strokeWidth="1" fill="none"
      />
      <polygon
        points="12,6 18,12 12,18 6,12"
        stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.6"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.8" />
      <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
    </svg>
  );
}

/* ── Arche mihrab (décorative, pour les headers) ────────────── */
export function MihrabArch({ size = 24, ...p }: BaseProps) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" fill="none" {...p}>
      <path
        d="M4 50 L4 22 Q4 4 20 4 Q36 4 36 22 L36 50Z"
        stroke="currentColor" strokeWidth="2" fill="none"
      />
      <path
        d="M8 50 L8 23 Q8 9 20 9 Q32 9 32 23 L32 50Z"
        stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"
      />
      {/* Clé de voûte */}
      <circle cx="20" cy="4" r="3" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/* ── Tasbih (chapelet) ──────────────────────────────────────── */
export function TasbihIcon({ size = 24, ...p }: BaseProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
      {/* Perles en arc */}
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const cx = 12 + 8 * Math.cos(rad);
        const cy = 12 + 8 * Math.sin(rad);
        return <circle key={deg} cx={cx} cy={cy} r={deg === 0 ? 2.2 : 1.5} fill="currentColor" opacity={deg === 0 ? 1 : 0.7} />;
      })}
      {/* Fil */}
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    </svg>
  );
}
