"use client";

interface YawmiLogoProps {
  size?: number;
  showText?: boolean;
  color?: string;
}

export function YawmiLogo({ size = 72, showText = true, color = "#D4AF37" }: YawmiLogoProps) {
  const h = size;
  const w = size * 1.2;

  return (
    <div className="flex flex-col items-center gap-0">
      <svg width={w} height={h} viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left minaret */}
        <rect x="8" y="38" width="10" height="42" rx="2" fill={color} opacity="0.9" />
        <ellipse cx="13" cy="38" rx="5" ry="7" fill={color} />
        <rect x="11" y="32" width="4" height="6" rx="1" fill={color} />
        <ellipse cx="13" cy="32" rx="2.5" ry="3" fill={color} />

        {/* Right minaret */}
        <rect x="102" y="38" width="10" height="42" rx="2" fill={color} opacity="0.9" />
        <ellipse cx="107" cy="38" rx="5" ry="7" fill={color} />
        <rect x="105" y="32" width="4" height="6" rx="1" fill={color} />
        <ellipse cx="107" cy="32" rx="2.5" ry="3" fill={color} />

        {/* Side small domes */}
        <rect x="25" y="55" width="22" height="25" rx="2" fill={color} opacity="0.75" />
        <ellipse cx="36" cy="55" rx="11" ry="9" fill={color} opacity="0.85" />

        <rect x="73" y="55" width="22" height="25" rx="2" fill={color} opacity="0.75" />
        <ellipse cx="84" cy="55" rx="11" ry="9" fill={color} opacity="0.85" />

        {/* Main body */}
        <rect x="25" y="62" width="70" height="18" rx="0" fill={color} opacity="0.6" />

        {/* Main dome */}
        <rect x="35" y="46" width="50" height="34" rx="2" fill={color} />
        <ellipse cx="60" cy="46" rx="25" ry="20" fill={color} />

        {/* Crescent on main dome */}
        <ellipse cx="60" cy="28" rx="6" ry="6" fill={color} opacity="0.2" />
        <ellipse cx="62.5" cy="26" rx="5" ry="5" fill="#020a05" />
        <circle cx="60" cy="22" r="1.5" fill={color} />

        {/* Arched windows on main body */}
        <rect x="44" y="55" width="8" height="10" rx="4" fill="rgba(2,10,5,0.5)" />
        <rect x="56" y="55" width="8" height="10" rx="4" fill="rgba(2,10,5,0.5)" />
        <rect x="68" y="55" width="8" height="10" rx="4" fill="rgba(2,10,5,0.5)" />

        {/* Base platform */}
        <rect x="18" y="80" width="84" height="4" rx="2" fill={color} opacity="0.5" />
      </svg>

      {showText && (
        <div className="flex flex-col items-center mt-1">
          <p className="font-extrabold tracking-tight leading-none"
            style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)", fontSize: size * 0.44 }}>
            Yawmi
          </p>
          <p className="leading-none mt-0.5"
            style={{ color, fontFamily: "var(--font-amiri)", fontSize: size * 0.32 }}>
            يومي
          </p>
        </div>
      )}
    </div>
  );
}
