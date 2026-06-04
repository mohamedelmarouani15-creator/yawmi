function Face({ cx = 50, cy = 92, skin = "#C8956A" }: { cx?: number; cy?: number; skin?: string }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={21} ry={26} fill={skin} />
      <ellipse cx={cx - 7} cy={cy - 4} rx={3.5} ry={2.5} fill="#3d2b1a" />
      <ellipse cx={cx + 7} cy={cy - 4} rx={3.5} ry={2.5} fill="#3d2b1a" />
      <path d={`M ${cx-4},${cy+10} Q ${cx},${cy+13} ${cx+4},${cy+10}`}
        fill="none" stroke="#7A5230" strokeWidth={1.2} strokeLinecap="round" />
    </>
  );
}

function Body({ color, cx = 50 }: { color: string; cx?: number }) {
  return (
    <path d={`M ${cx},138 Q ${cx-30},128 ${cx-35},180 L ${cx+35},180 Q ${cx+30},128 ${cx},138 Z`}
      fill={color} opacity={0.85} />
  );
}

function Turban({ color, cx = 50, cy = 60 }: { color: string; cx?: number; cy?: number }) {
  return (
    <>
      <ellipse cx={cx} cy={cy + 2} rx={30} ry={10} fill={color} opacity={0.9} />
      <path d={`M ${cx-30},${cy+2} Q ${cx-38},${cy-18} ${cx},${cy-22} Q ${cx+38},${cy-18} ${cx+30},${cy+2} Z`}
        fill={color} opacity={0.9} />
      <path d={`M ${cx+12},${cy-22} Q ${cx+18},${cy-32} ${cx+14},${cy-22}`}
        fill="none" stroke={color} strokeWidth={2.5} opacity={0.65} strokeLinecap="round" />
    </>
  );
}

function Beard({ cx = 50, cy = 106 }: { cx?: number; cy?: number }) {
  return (
    <path d={`M ${cx-22},${cy} Q ${cx-20},${cy+26} ${cx},${cy+34} Q ${cx+20},${cy+26} ${cx+22},${cy}`}
      fill="#7A5230" opacity={0.72} />
  );
}

export function SagePortrait({ sageId, color, size = 100 }: { sageId: string; color: string; size?: number }) {
  const scroll = (x: number, y: number) => (
    <g>
      <rect x={x} y={y} width={22} height={30} rx={3} fill="#F5DEB3" opacity={0.92} />
      <ellipse cx={x + 11} cy={y} rx={11} ry={4} fill="#E8D5A0" />
      <ellipse cx={x + 11} cy={y + 30} rx={11} ry={4} fill="#E8D5A0" />
      {[0, 6, 12, 18].map(dy => (
        <line key={dy} x1={x + 4} y1={y + 7 + dy} x2={x + 18} y2={y + 7 + dy}
          stroke={color} strokeWidth={0.8} opacity={0.45} />
      ))}
    </g>
  );

  const book = (x: number, y: number, c = color) => (
    <g>
      <rect x={x} y={y} width={24} height={30} rx={2} fill={c} opacity={0.9} />
      <rect x={x} y={y} width={4} height={30} rx={1} fill="rgba(0,0,0,0.25)" />
      <line x1={x + 8} y1={y + 8} x2={x + 22} y2={y + 8} stroke="#F5DEB3" strokeWidth={0.8} opacity={0.5} />
      <line x1={x + 8} y1={y + 13} x2={x + 22} y2={y + 13} stroke="#F5DEB3" strokeWidth={0.8} opacity={0.5} />
      <line x1={x + 8} y1={y + 18} x2={x + 19} y2={y + 18} stroke="#F5DEB3" strokeWidth={0.8} opacity={0.5} />
    </g>
  );

  const portraits: Record<string, React.ReactNode> = {
    al_idrissi: (
      <g>
        <Body color={color} />
        <Turban color={color} />
        <Face />
        <Beard />
        <rect x={60} y={110} width={26} height={22} rx={2} fill="#F5DEB3" opacity={0.9} />
        <path d="M 62,117 Q 67,114 72,118 Q 77,121 82,118" fill="none" stroke={color} strokeWidth={1} opacity={0.6} />
        <circle cx={14} cy={120} r={9} fill="none" stroke={color} strokeWidth={0.9} opacity={0.7} />
        <line x1={14} y1={112} x2={14} y2={128} stroke={color} strokeWidth={1} opacity={0.7} />
        <line x1={6} y1={120} x2={22} y2={120} stroke={color} strokeWidth={1} opacity={0.7} />
        <polygon points="14,112 12,117 16,117" fill={color} opacity={0.8} />
      </g>
    ),
    ibn_rushd: (
      <g>
        <Body color={color} />
        <Turban color={color} />
        <Face skin="#B87D4B" />
        <Beard />
        {book(58, 108)}
        <path d="M 18,105 Q 24,120 20,140" fill="none" stroke="#F5DEB3" strokeWidth={2} strokeLinecap="round" />
        <path d="M 18,105 Q 10,112 16,118" fill="#F5DEB3" opacity={0.7} />
        <path d="M 18,105 Q 26,112 22,118" fill="#F5DEB3" opacity={0.5} />
      </g>
    ),
    ibn_toumert: (
      <g>
        <Body color={color} />
        <path d="M 20,62 Q 12,42 50,36 Q 88,42 80,62 Q 80,75 50,78 Q 20,75 20,62 Z" fill={color} opacity={0.9} />
        <ellipse cx={50} cy={64} rx={30} ry={9} fill={color} opacity={0.8} />
        <Face skin="#A0714F" />
        <Beard />
        <line x1={16} y1={95} x2={20} y2={180} stroke="#8B6914" strokeWidth={5} strokeLinecap="round" />
        <circle cx={16} cy={93} r={5} fill="var(--gold)" opacity={0.9} />
        {scroll(62, 115)}
      </g>
    ),
    ibn_asaker: (
      <g>
        <Body color={color} />
        <Turban color={color} />
        <Face skin="#C4925E" />
        <Beard />
        {[0, 8, 16].map((dy, i) => (
          <rect key={i} x={58 - i * 2} y={108 + dy} width={26} height={10} rx={1}
            fill={i === 0 ? "#F5DEB3" : i === 1 ? "#E8D0A0" : "#DCC090"} opacity={0.9} />
        ))}
        <path d="M 18,100 Q 22,115 19,138" fill="none" stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round" />
        <path d="M 18,100 Q 12,107 15,112" fill="var(--gold)" opacity={0.6} />
      </g>
    ),
    al_khwarizmi: (
      <g>
        <Body color={color} />
        <Turban color={color} />
        <Face skin="#B87D4B" />
        <Beard />
        <rect x={58} y={108} width={26} height={32} rx={3} fill="#1A1A2E" opacity={0.9} />
        <text x={71} y={122} textAnchor="middle" fontSize={7} fill={color} opacity={0.9} fontWeight="bold">١٢٣</text>
        <text x={71} y={132} textAnchor="middle" fontSize={7} fill={color} opacity={0.7}>x²+y</text>
        <line x1={14} y1={108} x2={22} y2={136} stroke="var(--gold)" strokeWidth={2} strokeLinecap="round" />
        <line x1={28} y1={108} x2={22} y2={136} stroke="var(--gold)" strokeWidth={2} strokeLinecap="round" />
        <circle cx={14} cy={107} r={2} fill="var(--gold)" />
        <circle cx={28} cy={107} r={2} fill="var(--gold)" />
      </g>
    ),
    ibn_sina: (
      <g>
        <Body color={color} />
        <Turban color={color} />
        <Face skin="#C8956A" />
        <Beard />
        {book(58, 108, "#8B0000")}
        <rect x={13} y={112} width={10} height={3} rx={1} fill="var(--gold)" opacity={0.8} />
        <rect x={17} y={108} width={3} height={10} rx={1} fill="var(--gold)" opacity={0.8} />
        <path d="M 16,124 Q 12,128 12,136 Q 12,142 20,142 Q 28,142 28,136 Q 28,128 24,124 Z"
          fill="rgba(74,222,128,0.25)" stroke={color} strokeWidth={1} opacity={0.8} />
      </g>
    ),
    ahmad_baba: (
      <g>
        <Body color={color} />
        <ellipse cx={50} cy={63} rx={28} ry={8} fill={color} opacity={0.9} />
        <path d="M 22,63 Q 14,44 50,38 Q 86,44 78,63 Z" fill={color} opacity={0.85} />
        <path d="M 22,63 Q 50,55 78,63" fill="none" stroke="var(--gold)" strokeWidth={2} opacity={0.6} />
        <Face skin="#7A4E2D" />
        <Beard />
        {[0, 9, 18].map((dy, i) => (
          <g key={i}>
            <rect x={58 - i} y={106 + dy} width={24} height={11} rx={2}
              fill={i === 0 ? "#8B4513" : i === 1 ? "#A0522D" : "#CD853F"} opacity={0.9} />
            <line x1={61 - i} y1={111 + dy} x2={79 - i} y2={111 + dy}
              stroke="#F5DEB3" strokeWidth={0.7} opacity={0.5} />
          </g>
        ))}
      </g>
    ),
    ibn_khaldoun: (
      <g>
        <Body color={color} />
        <Turban color={color} />
        <Face skin="#B87D4B" />
        <Beard />
        {book(57, 106)}
        <path d="M 18,100 Q 14,115 17,138" fill="none" stroke="#F5DEB3" strokeWidth={2} strokeLinecap="round" />
        <path d="M 18,100 Q 11,107 14,114" fill="#F5DEB3" opacity={0.75} />
        <ellipse cx={18} cy={140} rx={5} ry={3} fill="#2d1810" opacity={0.8} />
        <path d="M 7,118 Q 14,108 22,118 Q 30,128 38,118" fill="none"
          stroke={color} strokeWidth={1} opacity={0.5} strokeLinecap="round" />
      </g>
    ),
  };

  return (
    <svg width={size} height={size * 1.8} viewBox="0 0 100 180">
      {portraits[sageId] ?? portraits.al_idrissi}
    </svg>
  );
}
