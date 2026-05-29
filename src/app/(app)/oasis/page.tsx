"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Flame, ChevronUp } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import { LOCATIONS } from "@/lib/game/locations";
import { SAGES } from "@/lib/game/sages";
import { xpProgress } from "@/lib/game/game-storage";

// ── Isometric rendering constants ─────────────────────────────
const W  = 22;  // horizontal pixels per iso x/y unit
const D  = 11;  // vertical depth pixels per iso x/y unit
const ZH = 22;  // vertical pixels per iso z unit

// Polygon point string helper
const pts = (coords: [number, number][]) =>
  coords.map(([x, y]) => `${x},${y}`).join(" ");

// Isometric box: cx,cy = screen position of the FRONT BOTTOM vertex
// sx,sy = tile size in x/y; sz = height in z units
function Cube({
  cx, cy, sx, sy, sz,
  top, left, right, stroke,
}: {
  cx: number; cy: number; sx: number; sy: number; sz: number;
  top: string; left: string; right: string; stroke?: string;
}) {
  const sw = stroke ? 0.5 : 0;
  return (
    <g>
      <polygon strokeWidth={sw} stroke={stroke || "none"} fill={left} points={pts([
        [cx - sx * W, cy - sy * D],
        [cx, cy],
        [cx, cy - sz * ZH],
        [cx - sx * W, cy - sy * D - sz * ZH],
      ])} />
      <polygon strokeWidth={sw} stroke={stroke || "none"} fill={right} points={pts([
        [cx, cy],
        [cx + sx * W, cy - sy * D],
        [cx + sx * W, cy - sy * D - sz * ZH],
        [cx, cy - sz * ZH],
      ])} />
      <polygon strokeWidth={sw} stroke={stroke || "none"} fill={top} points={pts([
        [cx, cy - 2 * sy * D - sz * ZH],
        [cx + sx * W, cy - sy * D - sz * ZH],
        [cx, cy - sz * ZH],
        [cx - sx * W, cy - sy * D - sz * ZH],
      ])} />
    </g>
  );
}

// ── Platform (shared by all cities) ──────────────────────────
function Platform({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  return (
    <Cube cx={cx} cy={cy} sx={2.3} sy={1.35} sz={0.4}
      top={`rgba(26,74,46,${a})`}
      left={`rgba(12,40,22,${a})`}
      right={`rgba(6,22,12,${a})`}
    />
  );
}

// ── City Buildings ─────────────────────────────────────────────
function Medine({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  const c   = (o=1) => `rgba(212,175,55,${a*o})`;
  const cL  = (o=1) => `rgba(175,142,44,${a*o})`;
  const cR  = (o=1) => `rgba(138,112,35,${a*o})`;
  const g   = (o=1) => `rgba(34,197,94,${a*o})`;
  const gD  = (o=1) => `rgba(21,128,61,${a*o})`;
  const by  = cy - 9;
  const topCenter = by - 1.65 * ZH - 0.9 * D * 2;
  return (
    <g>
      <Platform cx={cx} cy={cy} a={a} />
      <Cube cx={cx} cy={by} sx={1.6} sy={0.9} sz={1.65} top={c()} left={cL()} right={cR()} />
      <ellipse cx={cx} cy={topCenter + 3} rx={18} ry={9} fill={g()} />
      <ellipse cx={cx} cy={topCenter - 1} rx={12} ry={6} fill={gD()} />
      <Cube cx={cx - 29} cy={by} sx={0.38} sy={0.22} sz={3.0} top={c()} left={cL()} right={cR()} />
      <ellipse cx={cx - 29} cy={by - 3.0 * ZH - 0.22 * D * 2 - 2} rx={6} ry={3} fill={g()} />
      <Cube cx={cx + 29} cy={by} sx={0.38} sy={0.22} sz={3.0} top={c()} left={cL()} right={cR()} />
      <ellipse cx={cx + 29} cy={by - 3.0 * ZH - 0.22 * D * 2 - 2} rx={6} ry={3} fill={g()} />
    </g>
  );
}

function Fes({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  const t  = (o=1) => `rgba(74,186,112,${a*o})`;
  const l  = (o=1) => `rgba(50,148,85,${a*o})`;
  const r  = (o=1) => `rgba(30,110,60,${a*o})`;
  const gd = (o=1) => `rgba(212,175,55,${a*o})`;
  const gL = (o=1) => `rgba(175,142,44,${a*o})`;
  const by = cy - 9;
  return (
    <g>
      <Platform cx={cx} cy={cy} a={a} />
      <Cube cx={cx} cy={by} sx={1.9} sy={1.1} sz={1.45} top={t()} left={l()} right={r()} />
      <Cube cx={cx} cy={by - 1.45 * ZH} sx={0.75} sy={0.44} sz={0.55} top={gd()} left={gL()} right={`rgba(138,112,35,${a})`} />
      <Cube cx={cx - 30} cy={by} sx={0.35} sy={0.21} sz={2.75} top={t()} left={l()} right={r()} />
      <Cube cx={cx - 30} cy={by - 2.75 * ZH} sx={0.46} sy={0.28} sz={0.32} top={gd()} left={gL()} right={r()} />
    </g>
  );
}

function Cordoue({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  const t  = (o=1) => `rgba(210,95,45,${a*o})`;
  const l  = (o=1) => `rgba(178,72,28,${a*o})`;
  const r  = (o=1) => `rgba(142,52,18,${a*o})`;
  const cr = (o=1) => `rgba(245,228,198,${a*o})`;
  const cL = (o=1) => `rgba(220,200,168,${a*o})`;
  const by = cy - 9;
  return (
    <g>
      <Platform cx={cx} cy={cy} a={a} />
      <Cube cx={cx} cy={by} sx={2.2} sy={1.15} sz={1.1} top={cr()} left={cL()} right={l()} />
      {[-26, 0, 26].map(dx => (
        <Cube key={dx} cx={cx + dx} cy={by} sx={0.23} sy={0.13} sz={1.3} top={t()} left={l()} right={r()} />
      ))}
      <Cube cx={cx + 38} cy={by} sx={0.46} sy={0.28} sz={2.85} top={cr()} left={cL()} right={r()} />
      <Cube cx={cx + 38} cy={by - 2.85 * ZH} sx={0.58} sy={0.36} sz={0.36} top={t()} left={l()} right={r()} />
    </g>
  );
}

function Marrakech({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  const t  = (o=1) => `rgba(218,162,68,${a*o})`;
  const l  = (o=1) => `rgba(184,132,52,${a*o})`;
  const r  = (o=1) => `rgba(148,102,38,${a*o})`;
  const sd = (o=1) => `rgba(240,198,138,${a*o})`;
  const sL = (o=1) => `rgba(210,168,108,${a*o})`;
  const gd = (o=1) => `rgba(212,175,55,${a*o})`;
  const by = cy - 9;
  const bz = 0.9 * ZH;
  const mz = 2.25;
  const mTop = by - bz - mz * ZH - 0.4 * D * 2;
  return (
    <g>
      <Platform cx={cx} cy={cy} a={a} />
      <Cube cx={cx} cy={by} sx={1.65} sy={0.98} sz={0.9} top={sd()} left={sL()} right={l()} />
      <Cube cx={cx - 4} cy={by - bz} sx={0.68} sy={0.4} sz={mz} top={t()} left={l()} right={r()} />
      <Cube cx={cx - 4} cy={by - bz - 0.75 * ZH} sx={0.8} sy={0.5} sz={0.22} top={sd()} left={sL()} right={r()} />
      <Cube cx={cx - 4} cy={by - bz - 1.45 * ZH} sx={0.8} sy={0.5} sz={0.22} top={sd()} left={sL()} right={r()} />
      <Cube cx={cx - 4} cy={by - bz - mz * ZH} sx={0.28} sy={0.17} sz={0.8} top={gd()} left={l()} right={r()} />
      <ellipse cx={cx - 4} cy={mTop - 18 - 2} r={4} fill={gd()} opacity={a} />
    </g>
  );
}

function Damas({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  const t  = (o=1) => `rgba(96,165,250,${a*o})`;
  const l  = (o=1) => `rgba(59,130,246,${a*o})`;
  const r  = (o=1) => `rgba(37,99,235,${a*o})`;
  const wh = (o=1) => `rgba(245,245,252,${a*o})`;
  const wL = (o=1) => `rgba(218,218,240,${a*o})`;
  const by = cy - 9;
  const topY = by - 1.35 * ZH - 1.15 * D * 2;
  return (
    <g>
      <Platform cx={cx} cy={cy} a={a} />
      <Cube cx={cx} cy={by} sx={2.15} sy={1.2} sz={1.35} top={wh()} left={wL()} right={l()} />
      <ellipse cx={cx}      cy={topY}     rx={21} ry={9}  fill={t()} />
      <ellipse cx={cx}      cy={topY - 3} rx={14} ry={6}  fill={l()} />
      <ellipse cx={cx - 27} cy={topY + 5} rx={10} ry={5}  fill={t()} />
      <ellipse cx={cx + 27} cy={topY + 5} rx={10} ry={5}  fill={t()} />
      <Cube cx={cx - 37} cy={by} sx={0.29} sy={0.17} sz={3.2} top={t()} left={l()} right={r()} />
      <Cube cx={cx + 37} cy={by} sx={0.29} sy={0.17} sz={3.2} top={t()} left={l()} right={r()} />
    </g>
  );
}

function Bagdad({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  const t  = (o=1) => `rgba(134,229,118,${a*o})`;
  const l  = (o=1) => `rgba(88,180,78,${a*o})`;
  const r  = (o=1) => `rgba(58,130,52,${a*o})`;
  const gd = (o=1) => `rgba(212,175,55,${a*o})`;
  const gL = (o=1) => `rgba(175,142,44,${a*o})`;
  const by = cy - 9;
  const palTop = by - 1.5 * ZH - 0.55 * D * 2;
  return (
    <g>
      <Platform cx={cx} cy={cy} a={a} />
      <Cube cx={cx} cy={by} sx={2.1} sy={1.25} sz={0.7} top={t()} left={l()} right={r()} />
      <Cube cx={cx} cy={by - 0.7 * ZH} sx={1.45} sy={0.88} sz={0.7} top={`rgba(175,230,155,${a})`} left={`rgba(135,188,118,${a})`} right={r()} />
      <Cube cx={cx} cy={by - 1.4 * ZH} sx={0.85} sy={0.52} sz={1.65} top={gd()} left={gL()} right={`rgba(138,112,35,${a})`} />
      <ellipse cx={cx} cy={palTop - 2} rx={15} ry={7} fill={gd()} />
    </g>
  );
}

function Samarcande({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  const t  = (o=1) => `rgba(192,132,252,${a*o})`;
  const l  = (o=1) => `rgba(168,85,247,${a*o})`;
  const r  = (o=1) => `rgba(147,51,234,${a*o})`;
  const bl = (o=1) => `rgba(96,165,250,${a*o})`;
  const bL = (o=1) => `rgba(59,130,246,${a*o})`;
  const by = cy - 9;
  const topY = by - 1.65 * ZH - 1.1 * D * 2;
  return (
    <g>
      <Platform cx={cx} cy={cy} a={a} />
      <Cube cx={cx} cy={by} sx={1.95} sy={1.1} sz={1.65} top={t()} left={l()} right={r()} />
      <Cube cx={cx} cy={by - 1.65 * ZH} sx={2.05} sy={1.2} sz={0.3} top={bl()} left={bL()} right={`rgba(37,99,235,${a})`} />
      <Cube cx={cx - 33} cy={by} sx={0.43} sy={0.26} sz={2.65} top={t()} left={l()} right={r()} />
      <Cube cx={cx + 33} cy={by} sx={0.43} sy={0.26} sz={2.65} top={t()} left={l()} right={r()} />
      <ellipse cx={cx} cy={topY - 2}  rx={20} ry={13} fill={t()} />
      <ellipse cx={cx} cy={topY - 9}  rx={13} ry={8}  fill={l()} />
    </g>
  );
}

function Tombouctou({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  const t  = (o=1) => `rgba(200,128,68,${a*o})`;
  const l  = (o=1) => `rgba(162,98,48,${a*o})`;
  const r  = (o=1) => `rgba(124,73,33,${a*o})`;
  const sd = (o=1) => `rgba(220,168,98,${a*o})`;
  const sL = (o=1) => `rgba(188,142,78,${a*o})`;
  const by = cy - 9;
  return (
    <g>
      <Platform cx={cx} cy={cy} a={a} />
      <Cube cx={cx} cy={by} sx={1.85} sy={1.1} sz={1.5} top={t()} left={l()} right={r()} />
      <Cube cx={cx - 27} cy={by} sx={0.36} sy={0.22} sz={1.25} top={sd()} left={sL()} right={l()} />
      <Cube cx={cx + 27} cy={by} sx={0.36} sy={0.22} sz={1.25} top={sd()} left={sL()} right={r()} />
      <Cube cx={cx - 5}  cy={by - 1.5 * ZH} sx={0.72} sy={0.43} sz={1.42} top={sd()} left={sL()} right={l()} />
      <circle cx={cx - 5}  cy={by - 2.92 * ZH - 9} r={4} fill={sd()} opacity={a} />
      <circle cx={cx - 15} cy={by - 1.5 * ZH - 7}  r={3} fill={sd()} opacity={a} />
      <circle cx={cx + 5}  cy={by - 1.5 * ZH - 7}  r={3} fill={sd()} opacity={a} />
    </g>
  );
}

function LeCaire({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  const t  = (o=1) => `rgba(251,189,34,${a*o})`;
  const l  = (o=1) => `rgba(215,155,22,${a*o})`;
  const r  = (o=1) => `rgba(178,125,14,${a*o})`;
  const cr = (o=1) => `rgba(250,233,188,${a*o})`;
  const cL = (o=1) => `rgba(224,208,162,${a*o})`;
  const by = cy - 9;
  const topY = by - 1.45 * ZH - 1.1 * D * 2;
  return (
    <g>
      <Platform cx={cx} cy={cy} a={a} />
      <Cube cx={cx} cy={by} sx={2.05} sy={1.15} sz={1.45} top={cr()} left={cL()} right={l()} />
      <ellipse cx={cx}      cy={topY}     rx={19} ry={8}  fill={t()} />
      <ellipse cx={cx}      cy={topY - 3} rx={12} ry={5}  fill={l()} />
      {[-35, 35].map(dx => (
        <g key={dx}>
          <Cube cx={cx + dx} cy={by} sx={0.33} sy={0.2}  sz={2.05} top={t()} left={l()} right={r()} />
          <Cube cx={cx + dx} cy={by - 2.05 * ZH} sx={0.43} sy={0.27} sz={0.38} top={cr()} left={cL()} right={l()} />
          <Cube cx={cx + dx} cy={by - 2.43 * ZH} sx={0.29} sy={0.18} sz={0.92} top={t()} left={l()} right={r()} />
        </g>
      ))}
    </g>
  );
}

function LaMecque({ cx, cy, a }: { cx: number; cy: number; a: number }) {
  const bk  = (o=1) => `rgba(10,10,22,${a*o})`;
  const bkL = (o=1) => `rgba(20,20,38,${a*o})`;
  const bkR = (o=1) => `rgba(5,5,16,${a*o})`;
  const gd  = (o=1) => `rgba(212,175,55,${a*o})`;
  const gL  = (o=1) => `rgba(175,142,44,${a*o})`;
  const gR  = (o=1) => `rgba(138,112,35,${a*o})`;
  const by  = cy - 9;
  return (
    <g>
      {/* Wide marble court */}
      <Cube cx={cx} cy={cy} sx={3.1} sy={1.85} sz={0.3}
        top={`rgba(240,234,218,${a})`} left={`rgba(198,192,178,${a})`} right={`rgba(158,153,143,${a})`}
      />
      {/* Inner platform */}
      <Cube cx={cx} cy={by - 6.6} sx={2.05} sy={1.22} sz={0.42}
        top={`rgba(222,216,200,${a})`} left={`rgba(182,176,162,${a})`} right={`rgba(148,143,133,${a})`}
      />
      {/* Kaaba */}
      <Cube cx={cx} cy={by - 6.6 - 9.2} sx={1.32} sy={0.8} sz={1.82}
        top={bk()} left={bkL()} right={bkR()}
      />
      {/* Gold kiswah band */}
      <Cube cx={cx} cy={by - 6.6 - 9.2 - 0.65 * ZH} sx={1.38} sy={0.86} sz={0.22}
        top={gd()} left={gL()} right={gR()}
      />
      {/* Sacred glow */}
      <ellipse cx={cx} cy={by - 6.6 - 9.2 - 1.45 * ZH} rx={34} ry={14}
        fill={gd()} opacity={0.07 * a}
      />
      <ellipse cx={cx} cy={by - 6.6 - 9.2 - 1.45 * ZH} rx={22} ry={9}
        fill={gd()} opacity={0.04 * a}
      />
    </g>
  );
}

const BUILDINGS: Record<string, React.FC<{ cx: number; cy: number; a: number }>> = {
  medine: Medine, fes: Fes, cordoue: Cordoue, marrakech: Marrakech,
  damas: Damas, bagdad: Bagdad, samarcande: Samarcande,
  tombouctou: Tombouctou, le_caire: LeCaire, la_mecque: LaMecque,
};

// ── City positions (front-bottom vertex of platform) ──────────
const CITY_POS: Record<string, { cx: number; cy: number }> = {
  la_mecque:  { cx: 195, cy: 295 },
  le_caire:   { cx: 136, cy: 540 },
  tombouctou: { cx: 258, cy: 783 },
  samarcande: { cx: 130, cy: 1027 },
  bagdad:     { cx: 260, cy: 1270 },
  damas:      { cx: 128, cy: 1514 },
  marrakech:  { cx: 262, cy: 1756 },
  cordoue:    { cx: 126, cy: 2000 },
  fes:        { cx: 260, cy: 2242 },
  medine:     { cx: 195, cy: 2486 },
};

const ORDER = [
  "medine","fes","cordoue","marrakech","damas",
  "bagdad","samarcande","tombouctou","le_caire","la_mecque",
];

const SVG_H = 2700;

// ── Starfield ──────────────────────────────────────────────────
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: ((i * 137.508) % 390) | 0,
  y: ((i * 97.308) % SVG_H) | 0,
  r: 0.4 + (i % 3) * 0.45,
  op: 0.12 + (i % 6) * 0.06,
}));

// ── Path D attribute ──────────────────────────────────────────
function buildPathD() {
  return "M " + ORDER.map(id => {
    const { cx, cy } = CITY_POS[id];
    return `${cx},${cy - 85}`;
  }).join(" L ");
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{
            background: "rgba(10,35,20,0.96)",
            border: "1px solid rgba(212,175,55,0.3)",
            color: "#F8F4EC",
            fontFamily: "var(--font-dm-sans)",
            backdropFilter: "blur(8px)",
            whiteSpace: "nowrap",
          }}
        >
          🔒 {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function OasisPage() {
  const router = useRouter();
  const { state, locationUnlocked } = useGameState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [didScroll, setDidScroll] = useState(false);

  // Scroll to current location on first render
  useEffect(() => {
    if (!state || didScroll || !containerRef.current) return;
    const loc = state.currentLocation ?? "medine";
    const pos = CITY_POS[loc];
    if (!pos) return;
    const viewH = window.innerHeight;
    containerRef.current.scrollTop = Math.max(0, pos.cy - viewH / 2 + 80);
    setDidScroll(true);
  }, [state, didScroll]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleTap = (locId: string) => {
    if (!state) return;
    if (!locationUnlocked(locId)) {
      const loc = LOCATIONS.find(l => l.id === locId);
      setToast(`${loc?.nameFr} — ${loc?.requiredXP} XP requis`);
      return;
    }
    router.push(`/oasis/${locId}`);
  };

  const xp      = state?.xp ?? 0;
  const level   = state?.level ?? 1;
  const coins   = state?.coins ?? 0;
  const streak  = state?.gameStreak ?? 0;
  const prog    = xpProgress(xp);
  const curLoc  = state?.currentLocation ?? "medine";

  return (
    <div
      ref={containerRef}
      style={{ height: "100dvh", overflowY: "scroll", background: "#061A12", position: "relative" }}
    >
      {/* HUD */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: "linear-gradient(to bottom,rgba(6,26,18,0.97),transparent)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
            style={{ background: "rgba(212,175,55,0.14)", border: "1px solid rgba(212,175,55,0.28)", color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}
          >
            {level}
          </div>
          <div>
            <div className="flex gap-2 items-center">
              <span className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>Niv. {level}</span>
              <span className="text-xs font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>{xp} XP</span>
            </div>
            <div className="mt-0.5 h-1 w-24 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <motion.div className="h-full rounded-full" animate={{ width: `${prog * 100}%` }}
                style={{ background: "linear-gradient(to right,#055C3F,#D4AF37)" }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1">
              <Flame size={13} style={{ color: "#f97316" }} />
              <span className="text-xs font-bold" style={{ color: "#f97316", fontFamily: "var(--font-dm-sans)" }}>{streak}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
            <Star size={12} fill="#D4AF37" style={{ color: "#D4AF37" }} />
            <span className="text-xs font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>{coins}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center py-3">
        <p className="text-2xl" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)" }}>الواحة</p>
        <p className="text-[10px] tracking-[0.2em] uppercase opacity-35" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          L'Oasis du Savoir
        </p>
      </div>

      {/* Map SVG */}
      <svg width={390} height={SVG_H} viewBox={`0 0 390 ${SVG_H}`} style={{ display: "block", margin: "0 auto" }}>
        {/* Stars */}
        {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.op} />)}

        {/* Path glow */}
        <path d={buildPathD()} fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" />
        {/* Path dashes */}
        <path d={buildPathD()} fill="none" stroke="rgba(212,175,55,0.22)" strokeWidth={1.5} strokeDasharray="5 9" strokeLinecap="round" strokeLinejoin="round" />

        {/* Cities */}
        {ORDER.map(locId => {
          const loc = LOCATIONS.find(l => l.id === locId)!;
          const { cx, cy } = CITY_POS[locId];
          const unlocked = state ? locationUnlocked(locId) : locId === "medine";
          const isCurrent = locId === curLoc;
          const sage = SAGES.find(s => s.locationId === locId);
          const defeated = sage ? (state?.defeatedSages ?? []).includes(sage.id) : false;
          const Building = BUILDINGS[locId];
          const labelY = cy - 106;

          return (
            <motion.g key={locId}
              onClick={() => handleTap(locId)}
              style={{ cursor: unlocked ? "pointer" : "default" }}
              whileTap={unlocked ? { opacity: 0.8 } : {}}
            >
              {/* Pulse ring — current location */}
              {isCurrent && (
                <motion.circle cx={cx} cy={cy - 10} r={44} fill="none"
                  stroke={loc.color} strokeWidth={1.5} opacity={0.35}
                  animate={{ r: [42, 52, 42], opacity: [0.45, 0.1, 0.45] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Ground glow */}
              {unlocked && (
                <ellipse cx={cx} cy={cy} rx={38} ry={13} fill={loc.color} opacity={0.055} />
              )}

              {/* Building */}
              {Building && <Building cx={cx} cy={cy} a={unlocked ? 1 : 0.27} />}

              {/* Locked dim overlay */}
              {!unlocked && (
                <ellipse cx={cx} cy={cy - 65} rx={52} ry={52} fill="rgba(6,26,18,0.42)" />
              )}

              {/* Lock */}
              {!unlocked && (
                <>
                  <circle cx={cx} cy={cy - 68} r={15} fill="rgba(6,26,18,0.9)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                  <text x={cx} y={cy - 62} textAnchor="middle" fontSize={13}>🔒</text>
                </>
              )}

              {/* Trophy (sage defeated) */}
              {defeated && unlocked && (
                <>
                  <circle cx={cx + 30} cy={cy - 96} r={12} fill="rgba(212,175,55,0.88)" />
                  <text x={cx + 30} y={cy - 91} textAnchor="middle" fontSize={11}>🏆</text>
                </>
              )}

              {/* Labels */}
              <text x={cx} y={labelY - 20} textAnchor="middle" fontSize={12}
                fontFamily="var(--font-amiri)"
                fill={unlocked ? loc.color : "rgba(248,244,236,0.22)"}>
                {loc.name}
              </text>
              <text x={cx} y={labelY - 5} textAnchor="middle" fontSize={8}
                fontFamily="var(--font-dm-sans)"
                fill={unlocked ? "rgba(248,244,236,0.62)" : "rgba(248,244,236,0.18)"}>
                {loc.nameFr.toUpperCase()}
              </text>

              {/* XP requirement */}
              {!unlocked && (
                <text x={cx} y={cy - 42} textAnchor="middle" fontSize={8}
                  fontFamily="var(--font-dm-sans)" fill="rgba(212,175,55,0.45)">
                  {loc.requiredXP} XP
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* Scroll hint */}
      {!didScroll && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
          <ChevronUp size={15} style={{ color: "rgba(212,175,55,0.35)" }} />
          <p className="text-[10px]" style={{ color: "rgba(212,175,55,0.35)", fontFamily: "var(--font-dm-sans)" }}>
            Remonte vers La Mecque
          </p>
        </div>
      )}

      <Toast msg={toast ?? ""} show={!!toast} />
    </div>
  );
}
