// Arc mihrab — séparateur décoratif islamique pour sections sacrées

interface Props {
  className?: string;
  color?: string;
}

export default function MihrabBorder({ className = "", color = "rgba(212,175,55,0.25)" }: Props) {
  return (
    <div className={`flex items-center justify-center w-full py-2 ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 200 32"
        width="200"
        height="32"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {/* Ligne gauche */}
        <line x1="0" y1="16" x2="68" y2="16" stroke={color} strokeWidth="0.8" />

        {/* Arc mihrab central */}
        <path
          d="M72 28 L72 14 Q72 4 86 4 Q100 4 100 14 Q100 4 114 4 Q128 4 128 14 L128 28"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Point central */}
        <circle cx="100" cy="4" r="1.5" fill={color} />
        {/* Points latéraux */}
        <circle cx="72" cy="28" r="1" fill={color} />
        <circle cx="128" cy="28" r="1" fill={color} />

        {/* Ligne droite */}
        <line x1="132" y1="16" x2="200" y2="16" stroke={color} strokeWidth="0.8" />

        {/* Ornements */}
        <circle cx="68" cy="16" r="2" fill="none" stroke={color} strokeWidth="0.6" />
        <circle cx="132" cy="16" r="2" fill="none" stroke={color} strokeWidth="0.6" />
      </svg>
    </div>
  );
}
