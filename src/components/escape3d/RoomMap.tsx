"use client";

import { motion } from "framer-motion";
import type { RoomId } from "@/lib/escape3d/bounds";
import { PUZZLE_IDS } from "@/lib/escape3d/riad-progress";

// Puzzle ID associé à chaque pièce
const ROOM_PUZZLE: Record<RoomId, string> = {
  courtyard: "lantern_bismillah",
  library:   "library_iqra",
  salon:     "salon_sabr",
  cuisine:   "cuisine_honey",
  hammam:    "hammam_taharah",
};

const ROOM_ICON: Record<RoomId, string> = {
  courtyard: "🌿",
  library:   "📚",
  salon:     "🛋",
  cuisine:   "🍯",
  hammam:    "💧",
};

// Positions en grille (col, row) sur une grille 3×3 centrée
const ROOM_GRID: Record<RoomId, [number, number]> = {
  courtyard: [1, 1],
  library:   [1, 0],
  salon:     [1, 2],
  cuisine:   [2, 1],
  hammam:    [0, 1],
};

const CELL = 30;
const GAP  = 4;

interface Props {
  currentRoom: RoomId;
  solved:      Record<string, boolean>;
}

export default function RoomMap({ currentRoom, solved }: Props) {
  const rooms = Object.keys(ROOM_GRID) as RoomId[];

  // Lignes reliant la cour aux 4 pièces
  const LINES: [RoomId, RoomId][] = [
    ["courtyard","library"],
    ["courtyard","salon"],
    ["courtyard","cuisine"],
    ["courtyard","hammam"],
  ];

  return (
    <div style={{
      position: "absolute", bottom: 28, right: 16, zIndex: 12,
      pointerEvents: "none",
    }}>
      <svg
        width={3 * (CELL + GAP) - GAP + 4}
        height={3 * (CELL + GAP) - GAP + 4}
        style={{ overflow: "visible" }}
      >
        {/* Lignes de connexion */}
        {LINES.map(([a, b]) => {
          const [ac, ar] = ROOM_GRID[a];
          const [bc, br] = ROOM_GRID[b];
          const x1 = ac * (CELL + GAP) + CELL / 2 + 2;
          const y1 = ar * (CELL + GAP) + CELL / 2 + 2;
          const x2 = bc * (CELL + GAP) + CELL / 2 + 2;
          const y2 = br * (CELL + GAP) + CELL / 2 + 2;
          return (
            <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(212,175,55,0.18)" strokeWidth={1.5} strokeDasharray="3 3" />
          );
        })}

        {/* Noeuds de pièce */}
        {rooms.map(room => {
          const [col, row] = ROOM_GRID[room];
          const cx = col * (CELL + GAP) + CELL / 2 + 2;
          const cy = row * (CELL + GAP) + CELL / 2 + 2;
          const isCurrent = room === currentRoom;
          const puzzleId  = ROOM_PUZZLE[room];
          const isSolved  = solved[puzzleId];

          const ringColor = isCurrent ? "#D4AF37"
            : isSolved ? "#05C36F"
            : "rgba(255,255,255,0.15)";

          const bgColor = isCurrent ? "rgba(212,175,55,0.22)"
            : isSolved ? "rgba(5,195,111,0.15)"
            : "rgba(10,15,13,0.7)";

          return (
            <g key={room}>
              {/* Halo pièce courante */}
              {isCurrent && (
                <motion.circle
                  cx={cx} cy={cy} r={CELL / 2 + 3}
                  fill="rgba(212,175,55,0.12)"
                  animate={{ r: [CELL / 2 + 2, CELL / 2 + 5, CELL / 2 + 2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              {/* Cercle fond */}
              <circle cx={cx} cy={cy} r={CELL / 2}
                fill={bgColor} stroke={ringColor} strokeWidth={isCurrent ? 1.5 : 1} />
              {/* Icône */}
              <text x={cx} y={cy + 5} textAnchor="middle" fontSize={13}>
                {ROOM_ICON[room]}
              </text>
              {/* Coche si résolu */}
              {isSolved && !isCurrent && (
                <text x={cx + CELL / 2 - 3} y={cy - CELL / 2 + 5}
                  textAnchor="middle" fontSize={8} fill="#05C36F">✓</text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Légende */}
      <p style={{
        color: "rgba(212,175,55,0.4)", fontSize: 8, letterSpacing: "0.12em",
        textTransform: "uppercase", fontFamily: "var(--font-dm-sans)",
        textAlign: "center", marginTop: 4,
      }}>
        {Object.values(solved).filter(Boolean).length}/{PUZZLE_IDS.length} résolus
      </p>
    </div>
  );
}
