// Motif géométrique islamique zellige — fond décoratif réutilisable

interface Props {
  opacity?: number;
  color?: string;
  tileSize?: number;
  className?: string;
}

export default function ZelligePattern({
  opacity = 0.04,
  color = "#D4AF37",
  tileSize = 80,
  className = "",
}: Props) {
  const id = `zellige-${tileSize}`;
  const c = tileSize / 2;
  const r = tileSize * 0.45;

  // Points de l'étoile à 8 branches
  function starPath(cx: number, cy: number, outer: number, inner: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI / 8) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? outer : inner;
      pts.push(`${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`);
    }
    return `M${pts.join(" L")} Z`;
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={id} x="0" y="0" width={tileSize} height={tileSize} patternUnits="userSpaceOnUse">
            {/* Étoile à 8 branches */}
            <path
              d={starPath(c, c, r * 0.5, r * 0.22)}
              fill="none"
              stroke={color}
              strokeWidth="0.7"
            />
            {/* Losanges aux coins */}
            <path
              d={`M${c} 4 L${tileSize - 4} ${c} L${c} ${tileSize - 4} L4 ${c} Z`}
              fill="none"
              stroke={color}
              strokeWidth="0.4"
              opacity="0.5"
            />
            {/* Cercle central */}
            <circle cx={c} cy={c} r={r * 0.1} fill="none" stroke={color} strokeWidth="0.5" />
            {/* Croix de connexion */}
            <line x1={c} y1={0} x2={c} y2={tileSize} stroke={color} strokeWidth="0.25" opacity="0.3" />
            <line x1={0} y1={c} x2={tileSize} y2={c} stroke={color} strokeWidth="0.25" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
