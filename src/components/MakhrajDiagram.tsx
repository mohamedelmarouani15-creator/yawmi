"use client";

type Zone = "throat" | "back_tongue" | "mid_tongue" | "front_tongue" | "teeth" | "lips" | null;

interface Props {
  zone: Zone;
  letter?: string;
}

const ZONE_LABELS: Record<NonNullable<Zone>, { fr: string; color: string }> = {
  throat:       { fr: "Gorge (حلق)",       color: "#ef4444" },
  back_tongue:  { fr: "Langue arrière",    color: "#f59e0b" },
  mid_tongue:   { fr: "Milieu de langue",  color: "#22c55e" },
  front_tongue: { fr: "Pointe de langue",  color: "#3b82f6" },
  teeth:        { fr: "Dents",             color: "#a855f7" },
  lips:         { fr: "Lèvres",            color: "#ec4899" },
};

export default function MakhrajDiagram({ zone, letter }: Props) {
  if (!zone) return null;
  const info = ZONE_LABELS[zone];

  return (
    <div className="flex items-center gap-3 rounded-xl p-3"
      style={{ background: `${info.color}10`, border: `1px solid ${info.color}30` }}>
      {/* SVG profil bouche simplifié */}
      <svg width="56" height="56" viewBox="0 0 60 60" fill="none">
        {/* Contour tête */}
        <ellipse cx="30" cy="28" rx="20" ry="24" stroke="rgba(248,244,236,0.2)" strokeWidth="1.5" />
        {/* Lèvres */}
        <path d="M18 38 Q30 44 42 38" stroke={zone === "lips" ? info.color : "rgba(248,244,236,0.15)"}
          strokeWidth={zone === "lips" ? "2.5" : "1.5"} fill="none" />
        {/* Dents (ligne) */}
        <line x1="20" y1="36" x2="40" y2="36"
          stroke={zone === "teeth" ? info.color : "rgba(248,244,236,0.1)"} strokeWidth="1.5" />
        {/* Langue */}
        <path d="M20 38 Q30 42 40 38 Q38 44 30 45 Q22 44 20 38Z"
          fill={
            zone === "front_tongue" ? `${info.color}60` :
            zone === "mid_tongue"   ? `${info.color}40` :
            zone === "back_tongue"  ? `${info.color}20` :
            "rgba(248,244,236,0.05)"
          }
          stroke={
            ["front_tongue","mid_tongue","back_tongue"].includes(zone) ? info.color : "rgba(248,244,236,0.1)"
          }
          strokeWidth="1" />
        {/* Gorge */}
        <ellipse cx="30" cy="50" rx="6" ry="5"
          fill={zone === "throat" ? `${info.color}50` : "rgba(248,244,236,0.03)"}
          stroke={zone === "throat" ? info.color : "rgba(248,244,236,0.08)"} strokeWidth="1" />
      </svg>

      <div>
        <div className="flex items-center gap-2">
          {letter && (
            <span style={{
              fontFamily: "var(--font-amiri)", fontSize: 22,
              color: info.color, direction: "rtl",
            }}>
              {letter}
            </span>
          )}
          <span className="text-xs font-semibold"
            style={{ color: info.color, fontFamily: "var(--font-dm-sans)" }}>
            {info.fr}
          </span>
        </div>
        <p className="text-[10px] opacity-40 mt-0.5"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Point d&apos;articulation (مخرج)
        </p>
      </div>
    </div>
  );
}
