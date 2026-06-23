"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Flame, Coins, Package, ShoppingCart, BookOpen } from "lucide-react";
import { springTap } from "@/lib/motion";
import { useGameState } from "@/hooks/useGameState";
import { LOCATIONS } from "@/lib/game/locations";
import { SAGES } from "@/lib/game/sages";
import { xpProgress, xpInCurrentLevel, gameStorage, computeCurrentEnergyFromState, ENERGY_MAX } from "@/lib/game/game-storage";
import { getEraForLevel, ERA_CONDITIONS, MANUSCRIPTS, getCurrentEraIndex, stagesDone } from "@/lib/game/stages";
import { getActiveEvents } from "@/lib/game/events";
import type { Category } from "@/lib/game/types";
import { EventBanner } from "@/components/EventBanner";
import { useT } from "@/hooks/useT";
import { useLang } from "@/hooks/useLang";

// ── Isometric constants ────────────────────────────────────────
const W  = 22;
const D  = 11;
const ZH = 22;

const BUILDING_SCALE = 1.65; // global scale applied to all buildings

const pts = (coords: [number, number][]) =>
  coords.map(([x, y]) => `${x},${y}`).join(" ");

// Isometric cube — ref point (cx,cy) = front-bottom vertex
function Cube({
  cx, cy, sx, sy, sz, top, left, right,
}: {
  cx: number; cy: number; sx: number; sy: number; sz: number;
  top: string; left: string; right: string;
}) {
  return (
    <g>
      <polygon fill={left} points={pts([
        [cx - sx*W, cy - sy*D],
        [cx, cy],
        [cx, cy - sz*ZH],
        [cx - sx*W, cy - sy*D - sz*ZH],
      ])} />
      <polygon fill={right} points={pts([
        [cx, cy],
        [cx + sx*W, cy - sy*D],
        [cx + sx*W, cy - sy*D - sz*ZH],
        [cx, cy - sz*ZH],
      ])} />
      <polygon fill={top} points={pts([
        [cx, cy - 2*sy*D - sz*ZH],
        [cx + sx*W, cy - sy*D - sz*ZH],
        [cx, cy - sz*ZH],
        [cx - sx*W, cy - sy*D - sz*ZH],
      ])} />
    </g>
  );
}

// ── Shared platform ────────────────────────────────────────────
function Platform({ a }: { a: number }) {
  return (
    <Cube cx={0} cy={0} sx={2.3} sy={1.35} sz={0.4}
      top={`rgba(26,74,46,${a})`}
      left={`rgba(12,40,22,${a})`}
      right={`rgba(6,22,12,${a})`}
    />
  );
}

// ── City buildings (all using origin 0,0 = front-bottom vertex) ─
function Medine({ a }: { a: number }) {
  const c  = (o=1) => `rgba(212,175,55,${a*o})`;
  const cL = (o=1) => `rgba(175,142,44,${a*o})`;
  const cR = (o=1) => `rgba(138,112,35,${a*o})`;
  const g  = (o=1) => `rgba(34,197,94,${a*o})`;
  const gD = (o=1) => `rgba(21,128,61,${a*o})`;
  const by = -9;
  const topC = by - 1.65*ZH - 0.9*D*2;
  return (
    <g>
      <Platform a={a} />
      <Cube cx={0}   cy={by} sx={1.6}  sy={0.9}  sz={1.65} top={c()}  left={cL()}  right={cR()} />
      <ellipse cx={0}   cy={topC+3} rx={18} ry={9} fill={g()} />
      <ellipse cx={0}   cy={topC-1} rx={12} ry={6} fill={gD()} />
      <Cube cx={-29} cy={by} sx={0.38} sy={0.22} sz={3.0} top={c()}  left={cL()}  right={cR()} />
      <ellipse cx={-29} cy={by - 3.0*ZH - 0.22*D*2 - 2} rx={6} ry={3} fill={g()} />
      <Cube cx={29}  cy={by} sx={0.38} sy={0.22} sz={3.0} top={c()}  left={cL()}  right={cR()} />
      <ellipse cx={29}  cy={by - 3.0*ZH - 0.22*D*2 - 2} rx={6} ry={3} fill={g()} />
    </g>
  );
}

function Fes({ a }: { a: number }) {
  const t  = (o=1) => `rgba(74,186,112,${a*o})`;
  const l  = (o=1) => `rgba(50,148,85,${a*o})`;
  const r  = (o=1) => `rgba(30,110,60,${a*o})`;
  const gd = (o=1) => `rgba(212,175,55,${a*o})`;
  const gL = (o=1) => `rgba(175,142,44,${a*o})`;
  const by = -9;
  return (
    <g>
      <Platform a={a} />
      <Cube cx={0}   cy={by}           sx={1.9}  sy={1.1}  sz={1.45} top={t()}  left={l()}  right={r()} />
      <Cube cx={0}   cy={by - 1.45*ZH} sx={0.75} sy={0.44} sz={0.55} top={gd()} left={gL()} right={`rgba(138,112,35,${a})`} />
      <Cube cx={-30} cy={by}           sx={0.35} sy={0.21} sz={2.75} top={t()}  left={l()}  right={r()} />
      <Cube cx={-30} cy={by - 2.75*ZH} sx={0.46} sy={0.28} sz={0.32} top={gd()} left={gL()} right={r()} />
    </g>
  );
}

function Cordoue({ a }: { a: number }) {
  const t  = (o=1) => `rgba(210,95,45,${a*o})`;
  const l  = (o=1) => `rgba(178,72,28,${a*o})`;
  const r  = (o=1) => `rgba(142,52,18,${a*o})`;
  const cr = (o=1) => `rgba(245,228,198,${a*o})`;
  const cL = (o=1) => `rgba(220,200,168,${a*o})`;
  const by = -9;
  return (
    <g>
      <Platform a={a} />
      <Cube cx={0}  cy={by} sx={2.2}  sy={1.15} sz={1.1}  top={cr()} left={cL()} right={l()} />
      {[-26, 0, 26].map(dx => (
        <Cube key={dx} cx={dx} cy={by} sx={0.23} sy={0.13} sz={1.3} top={t()} left={l()} right={r()} />
      ))}
      <Cube cx={38} cy={by}           sx={0.46} sy={0.28} sz={2.85} top={cr()} left={cL()} right={r()} />
      <Cube cx={38} cy={by - 2.85*ZH} sx={0.58} sy={0.36} sz={0.36} top={t()}  left={l()}  right={r()} />
    </g>
  );
}

function Marrakech({ a }: { a: number }) {
  const t  = (o=1) => `rgba(218,162,68,${a*o})`;
  const l  = (o=1) => `rgba(184,132,52,${a*o})`;
  const r  = (o=1) => `rgba(148,102,38,${a*o})`;
  const sd = (o=1) => `rgba(240,198,138,${a*o})`;
  const sL = (o=1) => `rgba(210,168,108,${a*o})`;
  const gd = (o=1) => `rgba(212,175,55,${a*o})`;
  const by = -9;
  return (
    <g>
      <Platform a={a} />
      <Cube cx={0}  cy={by}             sx={1.65} sy={0.98} sz={0.9}  top={sd()} left={sL()} right={l()} />
      <Cube cx={-4} cy={by - 0.9*ZH}   sx={0.68} sy={0.4}  sz={2.25} top={t()}  left={l()}  right={r()} />
      <Cube cx={-4} cy={by - 1.65*ZH}  sx={0.8}  sy={0.5}  sz={0.22} top={sd()} left={sL()} right={r()} />
      <Cube cx={-4} cy={by - 2.35*ZH}  sx={0.8}  sy={0.5}  sz={0.22} top={sd()} left={sL()} right={r()} />
      <Cube cx={-4} cy={by - 3.15*ZH}  sx={0.28} sy={0.17} sz={0.8}  top={gd()} left={l()}  right={r()} />
      <circle cx={-4} cy={by - 4.05*ZH - 8} r={4} fill={gd()} opacity={a} />
    </g>
  );
}

function Damas({ a }: { a: number }) {
  const t  = (o=1) => `rgba(96,165,250,${a*o})`;
  const l  = (o=1) => `rgba(59,130,246,${a*o})`;
  const r  = (o=1) => `rgba(37,99,235,${a*o})`;
  const wh = (o=1) => `rgba(245,245,252,${a*o})`;
  const wL = (o=1) => `rgba(218,218,240,${a*o})`;
  const by = -9;
  const topY = by - 1.35*ZH - 1.15*D*2;
  return (
    <g>
      <Platform a={a} />
      <Cube cx={0}   cy={by} sx={2.15} sy={1.2}  sz={1.35} top={wh()} left={wL()} right={l()} />
      <ellipse cx={0}   cy={topY}   rx={21} ry={9}  fill={t()} />
      <ellipse cx={0}   cy={topY-3} rx={14} ry={6}  fill={l()} />
      <ellipse cx={-27} cy={topY+5} rx={10} ry={5}  fill={t()} />
      <ellipse cx={27}  cy={topY+5} rx={10} ry={5}  fill={t()} />
      <Cube cx={-37} cy={by} sx={0.29} sy={0.17} sz={3.2} top={t()} left={l()} right={r()} />
      <Cube cx={37}  cy={by} sx={0.29} sy={0.17} sz={3.2} top={t()} left={l()} right={r()} />
    </g>
  );
}

function Bagdad({ a }: { a: number }) {
  const t  = (o=1) => `rgba(134,229,118,${a*o})`;
  const l  = (o=1) => `rgba(88,180,78,${a*o})`;
  const r  = (o=1) => `rgba(58,130,52,${a*o})`;
  const gd = (o=1) => `rgba(212,175,55,${a*o})`;
  const gL = (o=1) => `rgba(175,142,44,${a*o})`;
  const by = -9;
  const palTop = by - 1.5*ZH - 0.55*D*2;
  return (
    <g>
      <Platform a={a} />
      <Cube cx={0} cy={by}          sx={2.1}  sy={1.25} sz={0.7}  top={t()} left={l()} right={r()} />
      <Cube cx={0} cy={by - 0.7*ZH} sx={1.45} sy={0.88} sz={0.7}  top={`rgba(175,230,155,${a})`} left={`rgba(135,188,118,${a})`} right={r()} />
      <Cube cx={0} cy={by - 1.4*ZH} sx={0.85} sy={0.52} sz={1.65} top={gd()} left={gL()} right={`rgba(138,112,35,${a})`} />
      <ellipse cx={0} cy={palTop-2} rx={15} ry={7} fill={gd()} />
    </g>
  );
}

function Samarcande({ a }: { a: number }) {
  const t  = (o=1) => `rgba(192,132,252,${a*o})`;
  const l  = (o=1) => `rgba(168,85,247,${a*o})`;
  const r  = (o=1) => `rgba(147,51,234,${a*o})`;
  const bl = (o=1) => `rgba(96,165,250,${a*o})`;
  const bL = (o=1) => `rgba(59,130,246,${a*o})`;
  const by = -9;
  const topY = by - 1.65*ZH - 1.1*D*2;
  return (
    <g>
      <Platform a={a} />
      <Cube cx={0}   cy={by}           sx={1.95} sy={1.1}  sz={1.65} top={t()}  left={l()}  right={r()} />
      <Cube cx={0}   cy={by - 1.65*ZH} sx={2.05} sy={1.2}  sz={0.3}  top={bl()} left={bL()} right={`rgba(37,99,235,${a})`} />
      <Cube cx={-33} cy={by}           sx={0.43} sy={0.26} sz={2.65} top={t()}  left={l()}  right={r()} />
      <Cube cx={33}  cy={by}           sx={0.43} sy={0.26} sz={2.65} top={t()}  left={l()}  right={r()} />
      <ellipse cx={0} cy={topY-2} rx={20} ry={13} fill={t()} />
      <ellipse cx={0} cy={topY-9} rx={13} ry={8}  fill={l()} />
    </g>
  );
}

function Tombouctou({ a }: { a: number }) {
  const t  = (o=1) => `rgba(200,128,68,${a*o})`;
  const l  = (o=1) => `rgba(162,98,48,${a*o})`;
  const r  = (o=1) => `rgba(124,73,33,${a*o})`;
  const sd = (o=1) => `rgba(220,168,98,${a*o})`;
  const sL = (o=1) => `rgba(188,142,78,${a*o})`;
  const by = -9;
  return (
    <g>
      <Platform a={a} />
      <Cube cx={0}  cy={by}           sx={1.85} sy={1.1}  sz={1.5}  top={t()}  left={l()}  right={r()} />
      <Cube cx={-27} cy={by}          sx={0.36} sy={0.22} sz={1.25} top={sd()} left={sL()} right={l()} />
      <Cube cx={27}  cy={by}          sx={0.36} sy={0.22} sz={1.25} top={sd()} left={sL()} right={r()} />
      <Cube cx={-5} cy={by - 1.5*ZH} sx={0.72} sy={0.43} sz={1.42} top={sd()} left={sL()} right={l()} />
      <circle cx={-5}  cy={by - 2.92*ZH - 9} r={4} fill={sd()} opacity={a} />
      <circle cx={-15} cy={by - 1.5*ZH - 7}  r={3} fill={sd()} opacity={a} />
      <circle cx={5}   cy={by - 1.5*ZH - 7}  r={3} fill={sd()} opacity={a} />
    </g>
  );
}

function LeCaire({ a }: { a: number }) {
  const t  = (o=1) => `rgba(251,189,34,${a*o})`;
  const l  = (o=1) => `rgba(215,155,22,${a*o})`;
  const r  = (o=1) => `rgba(178,125,14,${a*o})`;
  const cr = (o=1) => `rgba(250,233,188,${a*o})`;
  const cL = (o=1) => `rgba(224,208,162,${a*o})`;
  const by = -9;
  const topY = by - 1.45*ZH - 1.1*D*2;
  return (
    <g>
      <Platform a={a} />
      <Cube cx={0}  cy={by} sx={2.05} sy={1.15} sz={1.45} top={cr()} left={cL()} right={l()} />
      <ellipse cx={0}  cy={topY}   rx={19} ry={8}  fill={t()} />
      <ellipse cx={0}  cy={topY-3} rx={12} ry={5}  fill={l()} />
      {[-35, 35].map(dx => (
        <g key={dx}>
          <Cube cx={dx} cy={by}             sx={0.33} sy={0.2}  sz={2.05} top={t()}  left={l()}  right={r()} />
          <Cube cx={dx} cy={by - 2.05*ZH}   sx={0.43} sy={0.27} sz={0.38} top={cr()} left={cL()} right={l()} />
          <Cube cx={dx} cy={by - 2.43*ZH}   sx={0.29} sy={0.18} sz={0.92} top={t()}  left={l()}  right={r()} />
        </g>
      ))}
    </g>
  );
}

function LaMecque({ a }: { a: number }) {
  const bk  = (o=1) => `rgba(10,10,22,${a*o})`;
  const bkL = (o=1) => `rgba(20,20,38,${a*o})`;
  const bkR = (o=1) => `rgba(5,5,16,${a*o})`;
  const gd  = (o=1) => `rgba(212,175,55,${a*o})`;
  const gL  = (o=1) => `rgba(175,142,44,${a*o})`;
  const gR  = (o=1) => `rgba(138,112,35,${a*o})`;
  const by  = -9;
  return (
    <g>
      <Cube cx={0} cy={0}          sx={3.1}  sy={1.85} sz={0.3}
        top={`rgba(240,234,218,${a})`} left={`rgba(198,192,178,${a})`} right={`rgba(158,153,143,${a})`} />
      <Cube cx={0} cy={by - 6.6}   sx={2.05} sy={1.22} sz={0.42}
        top={`rgba(222,216,200,${a})`} left={`rgba(182,176,162,${a})`} right={`rgba(148,143,133,${a})`} />
      <Cube cx={0} cy={by - 6.6 - 9.2} sx={1.32} sy={0.8} sz={1.82}
        top={bk()} left={bkL()} right={bkR()} />
      <Cube cx={0} cy={by - 6.6 - 9.2 - 0.65*ZH} sx={1.38} sy={0.86} sz={0.22}
        top={gd()} left={gL()} right={gR()} />
      <ellipse cx={0} cy={by - 6.6 - 9.2 - 1.45*ZH} rx={40} ry={16} fill={gd()} opacity={0.07*a} />
    </g>
  );
}

const BUILDINGS: Record<string, React.FC<{ a: number }>> = {
  medine: Medine, fes: Fes, cordoue: Cordoue, marrakech: Marrakech,
  damas: Damas, bagdad: Bagdad, samarcande: Samarcande,
  tombouctou: Tombouctou, le_caire: LeCaire, la_mecque: LaMecque,
};

// ── City flags ─────────────────────────────────────────────────
const FLAGS: Record<string, string> = {
  medine: "🇸🇦", fes: "🇲🇦", cordoue: "🇪🇸", marrakech: "🇲🇦",
  damas: "🇸🇾", bagdad: "🇮🇶", samarcande: "🇺🇿",
  tombouctou: "🇲🇱", le_caire: "🇪🇬", la_mecque: "🇸🇦",
};

// ── City positions ─────────────────────────────────────────────
const CITY_POS: Record<string, { cx: number; cy: number }> = {
  la_mecque:  { cx: 195, cy: 305 },
  le_caire:   { cx: 255, cy: 610 },
  tombouctou: { cx: 135, cy: 915 },
  samarcande: { cx: 255, cy: 1220 },
  bagdad:     { cx: 135, cy: 1525 },
  damas:      { cx: 255, cy: 1830 },
  marrakech:  { cx: 135, cy: 2135 },
  cordoue:    { cx: 255, cy: 2440 },
  fes:        { cx: 135, cy: 2745 },
  medine:     { cx: 195, cy: 3050 },
};

const ORDER = [
  "medine","fes","cordoue","marrakech","damas",
  "bagdad","samarcande","tombouctou","le_caire","la_mecque",
];

const SVG_H = 3250;

// ── Stars ──────────────────────────────────────────────────────
const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: ((i * 137.508 + 23) % 390) | 0,
  y: ((i * 97.308 + 40) % SVG_H) | 0,
  r: 0.4 + (i % 4) * 0.4,
  op: 0.08 + (i % 7) * 0.055,
}));

// Larger "feature" stars with twinkle animation
const FEATURE_STARS = Array.from({ length: 18 }, (_, i) => ({
  x: ((i * 223.1 + 80) % 370) | 0,
  y: ((i * 173.7 + 120) % (SVG_H - 200)) | 0,
  r: 1.2 + (i % 3) * 0.6,
}));

// ── Smooth bezier path ─────────────────────────────────────────
function buildPath() {
  const vis = (id: string) => ({ x: CITY_POS[id].cx, y: CITY_POS[id].cy - 100 });
  const p = ORDER.map(vis);
  let d = `M ${p[0].x},${p[0].y}`;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i];
    const tension = 70;
    d += ` C ${a.x},${a.y - tension} ${b.x},${b.y + tension} ${b.x},${b.y}`;
  }
  return d;
}

// ── Glass city card ────────────────────────────────────────────
function CityCard({
  locId, location, unlocked, defeated, isCurrent, sage, stagesN,
}: {
  locId: string;
  location: { name: string; nameFr: string; color: string; requiredXP: number };
  unlocked: boolean; defeated: boolean; isCurrent: boolean;
  sage: { name: string } | undefined;
  stagesN: number;
}) {
  const tt = useT();
  const lang = useLang();
  const isAr = lang === "ar";
  const W_CARD = 148, H_CARD = 72, RX = 15;
  const x = -W_CARD / 2;
  const y = 18; // below front vertex

  const borderColor = isCurrent
    ? "rgba(212,175,55,0.7)"
    : defeated ? "rgba(212,175,55,0.35)"
    : unlocked ? `${location.color}55`
    : "rgba(255,255,255,0.08)";

  const bgFill = isCurrent
    ? "rgba(15,40,25,0.92)"
    : "rgba(8,22,14,0.88)";

  // Status badge
  const badgeY = y + 52;
  const badgeW = 110, badgeH = 18, badgeR = 9;
  const badgeBg = defeated
    ? "var(--border-gold)"
    : unlocked && sage
    ? `${location.color}28`
    : "rgba(255,255,255,0.05)";
  const badgeText = defeated
    ? tt("oasis.badge.defeated")
    : unlocked && sage
    ? tt("oasis.badge.available")
    : !unlocked
    ? `⊘  ${location.requiredXP} ${tt("oasis.badge.locked").replace("⊘ ", "")}`
    : tt("oasis.badge.start");
  const badgeColor = defeated
    ? "var(--gold)"
    : unlocked && sage
    ? location.color
    : unlocked
    ? "rgba(248,244,236,0.45)"
    : "rgba(212,175,55,0.55)";

  return (
    <g>
      {/* Glass card */}
      <rect x={x} y={y} width={W_CARD} height={H_CARD} rx={RX}
        fill={bgFill}
        stroke={borderColor}
        strokeWidth={isCurrent ? 1.5 : 1}
      />
      {/* Inner highlight top edge */}
      <line x1={x + RX} y1={y + 0.5} x2={x + W_CARD - RX} y2={y + 0.5}
        stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

      {/* Country flag */}
      <text x={x + W_CARD - 14} y={y + 20} textAnchor="middle" fontSize={11}>
        {FLAGS[locId] ?? ""}
      </text>

      {/* Arabic name */}
      <text x={x + (W_CARD / 2) - 4} y={y + 24}
        textAnchor="middle" fontSize={15}
        fontFamily="var(--font-amiri)"
        fill={unlocked ? location.color : "rgba(248,244,236,0.38)"}>
        {location.name}
      </text>

      {/* French/transliteration name — hidden in AR mode */}
      {!isAr && (
        <text x={x + W_CARD / 2} y={y + 38}
          textAnchor="middle" fontSize={8}
          fontFamily="var(--font-dm-sans)"
          fill={unlocked ? "rgba(248,244,236,0.48)" : "rgba(248,244,236,0.28)"}
          letterSpacing="1.8">
          {location.nameFr.toUpperCase()}
        </text>
      )}

      {/* Status badge */}
      <rect x={-badgeW / 2} y={badgeY} width={badgeW} height={badgeH} rx={badgeR}
        fill={badgeBg} />
      <text x={0} y={badgeY + 12.5}
        textAnchor="middle" fontSize={7.5}
        fontFamily="var(--font-dm-sans)"
        fill={badgeColor} fontWeight="700"
        letterSpacing="0.5">
        {badgeText}
      </text>

      {/* Stage stars — shown when at least 1 stage done */}
      {unlocked && stagesN > 0 && (
        <text x={52} y={y + 17} textAnchor="middle" fontSize={9}>
          {stagesN >= 1 ? "★" : "☆"}{stagesN >= 2 ? "★" : "☆"}{stagesN >= 3 ? "★" : "☆"}
        </text>
      )}
    </g>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{
            background: "rgba(8,28,16,0.96)",
            border: "1px solid rgba(212,175,55,0.3)",
            color: "var(--text)",
            fontFamily: "var(--font-dm-sans)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function OasisPage() {
  const router = useRouter();
  const { state, locationUnlocked } = useGameState();
  const tt = useT();
  const lang = useLang();
  const isAr = lang === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const didScrollRef = useRef(false);

  useEffect(() => {
    if (!state || didScrollRef.current || !containerRef.current) return;
    const loc = state.currentLocation ?? "medine";
    const pos = CITY_POS[loc];
    if (!pos) return;
    const viewH = window.innerHeight;
    containerRef.current.scrollTop = Math.max(0, pos.cy - viewH / 2 + 100);
    didScrollRef.current = true;
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleTap = (locId: string) => {
    if (!state) return;
    if (!locationUnlocked(locId)) {
      const loc = LOCATIONS.find(l => l.id === locId);
      setToast(`⊘ ${isAr ? (loc?.name ?? loc?.nameFr) : loc?.nameFr} — ${loc?.requiredXP} XP requis`);
      return;
    }
    router.push(`/oasis/${locId}`);
  };

  const xp        = state?.xp ?? 0;
  const level     = state?.level ?? 1;
  const coins     = state?.coins ?? 0;
  const streak    = state?.gameStreak ?? 0;
  const prog      = xpProgress(xp);
  const xpInLvl   = xpInCurrentLevel(xp);
  const curLoc    = state?.currentLocation ?? "medine";
  const unlocked  = state?.unlockedLocations ?? ["medine"];
  const chests    = state?.chestsAvailable ?? 0;
  const pathD     = buildPath();
  const liveState    = gameStorage.get();
  const energy       = computeCurrentEnergyFromState(liveState);
  const era          = getEraForLevel(level);
  const dailyQuests  = gameStorage.getDailyQuests();
  const categoryMastery = liveState.categoryMastery ?? { theologie: 0, histoire: 0, coran: 0, arabe: 0, ethique: 0, sira: 0, fiqh: 0 };
  const completedArcs   = liveState.completedArcs ?? [];
  const avgMastery      = Math.round(Object.values(categoryMastery).reduce((a, b) => a + b, 0) / 7);
  const currentEraIdx   = getCurrentEraIndex(level, completedArcs.length, avgMastery);
  const nextEra         = ERA_CONDITIONS.find(e => e.eraIndex === currentEraIdx + 1);
  const manuscripts      = liveState.manuscripts ?? {};
  const activeEvents     = getActiveEvents();
  const era2Cond         = ERA_CONDITIONS.find(e => e.eraIndex === 2)!;
  const era3Cond         = ERA_CONDITIONS.find(e => e.eraIndex === 3)!;
  const era4Cond         = ERA_CONDITIONS.find(e => e.eraIndex === 4)!;
  const era5Cond         = ERA_CONDITIONS.find(e => e.eraIndex === 5)!;
  const ere2Unlocked     = level >= era2Cond.minLevel && completedArcs.length >= era2Cond.minArcsRead && avgMastery >= era2Cond.minAvgMastery;
  const ere3Unlocked     = level >= era3Cond.minLevel && completedArcs.length >= era3Cond.minArcsRead && avgMastery >= era3Cond.minAvgMastery;
  const ere4Unlocked     = level >= era4Cond.minLevel && completedArcs.length >= era4Cond.minArcsRead && avgMastery >= era4Cond.minAvgMastery;
  const ere5Unlocked     = level >= era5Cond.minLevel && completedArcs.length >= era5Cond.minArcsRead && avgMastery >= era5Cond.minAvgMastery;
  const weeklyChallenge  = gameStorage.getWeeklyChallenge();
  const defeatedCount    = liveState.defeatedSages?.length ?? 0;

  const unlockedCount = ORDER.filter(id => locationUnlocked(id) || unlocked.includes(id)).length;

  return (
    <div
      ref={containerRef}
      style={{ height: "100dvh", overflowY: "scroll", background: "var(--bg)", position: "relative" }}
    >
      {/* ── Premium HUD ── */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: "rgba(5,20,12,0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(212,175,55,0.1)",
        }}
      >
        <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
          {/* Level orb with XP arc */}
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            <svg width={44} height={44} className="absolute" style={{ rotate: "-90deg" }}>
              <circle cx={22} cy={22} r={19} fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth={2.5} />
              <motion.circle cx={22} cy={22} r={19} fill="none"
                stroke="url(#xpGrad)" strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 19}`}
                animate={{ strokeDashoffset: 2 * Math.PI * 19 * (1 - prog) }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
            <span className="text-base font-black relative z-10" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
              {level}
            </span>
          </div>

          {/* XP bar + label */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-bold" style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
                NIVEAU {level}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                {xp.toLocaleString()} XP
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${prog * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ background: "linear-gradient(to right,#055C3F 0%,#0d9a60 50%,#D4AF37 100%)" }}
              />
            </div>
            <p className="text-[9px] mt-0.5" style={{ color: "var(--text-dim)", fontFamily: "var(--font-dm-sans)" }}>
              {xpInLvl} / 200 → Niv. {level + 1}
            </p>
          </div>

          {/* Right badges */}
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            {streak > 0 && (
              <div className="flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.22)" }}>
                <Flame size={11} style={{ color: "#f97316" }} />
                <span className="text-xs font-bold" style={{ color: "#f97316", fontFamily: "var(--font-dm-sans)" }}>{streak}</span>
              </div>
            )}
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1"
              style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
              <Coins size={11} style={{ color: "var(--gold)" }} />
              <span className="text-xs font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>{coins}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1"
              style={{ background: energy < 10 ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.06)", border: `1px solid ${energy < 10 ? "rgba(248,113,113,0.3)" : "rgba(255,255,255,0.1)"}` }}>
              <span className="text-[10px]">⚡</span>
              <span className="text-xs font-bold" style={{ color: energy < 10 ? "#f87171" : "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>{energy}/{ENERGY_MAX}</span>
            </div>
            <Link href="/oasis/shop">
              <div className="flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", cursor: "pointer" }}>
                {chests > 0 ? <Package size={11} style={{ color: "#a78bfa" }} /> : <ShoppingCart size={11} style={{ color: "#a78bfa" }} />}
                {chests > 0 && (
                  <span className="text-xs font-bold" style={{ color: "#a78bfa", fontFamily: "var(--font-dm-sans)" }}>{chests}</span>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Daily quests strip */}
        <div className="flex items-center gap-2 px-4 pb-1 overflow-x-auto scrollbar-none">
          {dailyQuests.map(q => {
            const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
            return (
              <div key={q.id} className="flex-shrink-0 rounded-2xl border px-3 py-2 min-w-[130px]"
                style={{
                  background: q.completed ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.04)",
                  borderColor: q.completed ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.08)",
                }}>
                <p className="text-[10px] font-bold truncate"
                  style={{ color: q.completed ? "#4ade80" : "rgba(248,244,236,0.7)", fontFamily: "var(--font-dm-sans)" }}>
                  {q.completed ? "✓ " : ""}{q.title}
                </p>
                <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: q.completed ? "#4ade80" : "var(--gold)" }} />
                </div>
                <p className="text-[9px] mt-0.5 opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {q.progress}/{q.target} · +{q.rewardXP}XP
                </p>
              </div>
            );
          })}
        </div>

        {/* Era badge */}
        <div className="flex items-center justify-center gap-2 pb-1">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ background: `${era.color}15`, border: `1px solid ${era.color}30` }}>
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: era.color, fontFamily: "var(--font-dm-sans)" }}>
              {era.name}
            </span>
            <span className="text-[10px] opacity-60" style={{ color: era.color, fontFamily: "var(--font-dm-sans)" }}>
              — {era.subtitle}
            </span>
          </div>
        </div>

        {/* Journey progress dots */}
        <div className="flex items-center justify-center gap-1.5 pb-2.5">
          {ORDER.map((id) => {
            const done = unlocked.includes(id);
            const cur  = id === curLoc;
            return (
              <motion.div key={id}
                animate={{
                  width: cur ? 18 : done ? 7 : 5,
                  height: cur ? 7 : done ? 7 : 5,
                  background: cur ? "var(--gold)" : done ? "var(--primary)" : "rgba(255,255,255,0.1)",
                }}
                transition={{ duration: 0.35 }}
                style={{ borderRadius: cur ? 4 : "50%" }}
              />
            );
          })}
          <span className="text-[9px] ml-1.5" style={{ color: "rgba(212,175,55,0.4)", fontFamily: "var(--font-dm-sans)" }}>
            {unlockedCount}/10
          </span>
        </div>
      </div>

      {/* ── Page title ── */}
      <div className="text-center py-4">
        <p className="text-[26px] leading-none" style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)" }}>الواحة</p>
        <p className="text-[9px] tracking-[0.25em] uppercase mt-0.5" style={{ color: "var(--text-dim)", fontFamily: "var(--font-dm-sans)" }}>
          {tt("oasis.title")}
        </p>
      </div>

      {/* ── Événement islamique actif ── */}
      <EventBanner />

      {/* ── Escape Games ── */}
      <div className="px-4 mb-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/oasis/escape")}
          className="w-full rounded-2xl p-4 text-left flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg,rgba(30,15,5,0.95) 0%,rgba(100,70,10,0.3) 50%,rgba(4,6,8,0.95) 100%)",
            border: "1px solid rgba(212,175,55,0.5)",
            boxShadow: "0 0 32px rgba(212,175,55,0.12), inset 0 0 32px rgba(212,175,55,0.03)",
          }}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ background: "rgba(212,175,55,0.12)" }}>
            🏛️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-semibold tracking-widest uppercase"
                style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                ✦ Escape Games • 3D Immersif
              </span>
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              Aventures immersives
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
              Le Secret de la Maison de la Sagesse, et bientôt d&apos;autres salles
            </p>
          </div>
          <span style={{ color: "#D4AF37", fontSize: 18, flexShrink: 0 }}>→</span>
        </motion.button>
      </div>

      {/* ── Capsules culturelles ── */}
      <div className="px-4 mb-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/oasis/culture")}
          className="w-full rounded-2xl p-4 text-left flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg,rgba(30,20,5,0.9) 0%,rgba(12,8,2,0.95) 100%)",
            border: "1px solid rgba(212,175,55,0.25)",
          }}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ background: "var(--gold-faint)" }}>
            ✦
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-semibold tracking-widest uppercase"
              style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              {tt("oasis.library")}
            </span>
            <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {tt("oasis.librarySub")}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
              {tt("oasis.libraryDesc")}
            </p>
          </div>
          <span style={{ color: "var(--gold)", fontSize: 18, flexShrink: 0 }}>→</span>
        </motion.button>
      </div>

      {/* ── Isometric SVG map ── */}
      <svg
        width={390} height={SVG_H}
        viewBox={`0 0 390 ${SVG_H}`}
        style={{ display: "block", margin: "0 auto", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
          {/* Glow filter for active buildings */}
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-lg" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Radial gradient for La Mecque special glow */}
          <radialGradient id="mecqueGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
          {/* Subtle region gradient */}
          <radialGradient id="regionGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background subtle gradient blobs */}
        <ellipse cx={195} cy={350} rx={160} ry={120} fill="url(#mecqueGlow)" />
        <ellipse cx={195} cy={1800} rx={200} ry={300} fill="url(#regionGlow)" />
        <ellipse cx={195} cy={3050} rx={180} ry={200} fill="url(#regionGlow)" />

        {/* Starfield */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.op} />
        ))}
        {/* Feature stars */}
        {FEATURE_STARS.map((s, i) => (
          <circle key={`f${i}`} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={0.25} />
        ))}

        {/* ── Path — 4 layers ── */}
        {/* Outer glow */}
        <path d={pathD} fill="none" stroke="rgba(212,175,55,0.04)" strokeWidth={60} strokeLinecap="round" />
        {/* Mid glow */}
        <path d={pathD} fill="none" stroke="rgba(212,175,55,0.07)" strokeWidth={24} strokeLinecap="round" />
        {/* Inner glow */}
        <path d={pathD} fill="none" stroke="rgba(212,175,55,0.13)" strokeWidth={8} strokeLinecap="round" />
        {/* Dashed center line */}
        <path d={pathD} fill="none" stroke="rgba(212,175,55,0.55)" strokeWidth={1.5}
          strokeDasharray="5 9" strokeLinecap="round" />

        {/* Path connection dots */}
        {ORDER.map(id => {
          const { cx, cy } = CITY_POS[id];
          return (
            <circle key={`dot-${id}`} cx={cx} cy={cy - 100} r={2.5}
              fill="rgba(212,175,55,0.5)" />
          );
        })}

        {/* ── Cities ── */}
        {ORDER.map(locId => {
          const loc     = LOCATIONS.find(l => l.id === locId)!;
          const { cx, cy } = CITY_POS[locId];
          const isUnlk  = state ? locationUnlocked(locId) : locId === "medine";
          const isCur   = locId === curLoc;
          const sage    = SAGES.find(s => s.locationId === locId);
          const def     = sage ? (state?.defeatedSages ?? []).includes(sage.id) : false;
          const Building = BUILDINGS[locId];
          const alpha   = isUnlk ? 1 : 0.38;

          return (
            <motion.g
              key={locId}
              onClick={() => handleTap(locId)}
              style={{ cursor: isUnlk ? "pointer" : "default" }}
              whileTap={isUnlk ? { scale: 0.97 } : {}}
            >
              {/* Wide ground glow for unlocked */}
              {isUnlk && (
                <ellipse cx={cx} cy={cy} rx={70} ry={22}
                  fill={loc.color} opacity={0.05}
                />
              )}

              {/* Current city: animated pulse rings */}
              {isCur && (
                <>
                  <motion.circle cx={cx} cy={cy - 60} r={55} fill="none"
                    stroke={loc.color} strokeWidth={1.5} opacity={0.4}
                    animate={{ r: [52, 65, 52], opacity: [0.45, 0.08, 0.45] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.circle cx={cx} cy={cy - 60} r={40} fill="none"
                    stroke={loc.color} strokeWidth={0.8} opacity={0.25}
                    animate={{ r: [38, 48, 38], opacity: [0.3, 0.05, 0.3] }}
                    transition={{ duration: 2.8, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </>
              )}

              {/* La Mecque special glow */}
              {locId === "la_mecque" && isUnlk && (
                <ellipse cx={cx} cy={cy - 80} rx={80} ry={40}
                  fill="url(#mecqueGlow)" />
              )}

              {/* Building with scale */}
              {Building && (
                <g
                  transform={`translate(${cx},${cy}) scale(${BUILDING_SCALE})`}
                  filter={isUnlk && isCur ? "url(#glow)" : undefined}
                >
                  <Building a={alpha} />
                </g>
              )}

              {/* Glass city card — BELOW the building */}
              <g transform={`translate(${cx}, ${cy})`}>
                <CityCard
                  locId={locId}
                  location={loc}
                  unlocked={isUnlk}
                  defeated={def}
                  isCurrent={isCur}
                  sage={sage}
                  stagesN={stagesDone(liveState.locationStages ?? {}, locId)}
                />
              </g>
            </motion.g>
          );
        })}

        {/* Avatar supprimé — ne servait à rien */}
      </svg>

      <Toast msg={toast ?? ""} show={!!toast} />

      {/* ── BIBLIOTHÈQUE DU SAVANT ── */}
      <div className="px-4 pb-10 flex flex-col gap-6 mt-2">

        {/* Weekly challenge card */}
        {weeklyChallenge && (
          <div className="rounded-3xl border p-4"
            style={{ background: weeklyChallenge.completed ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.03)", borderColor: weeklyChallenge.completed ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] uppercase tracking-widest opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Défi de la semaine
              </p>
              {weeklyChallenge.completed && <span className="text-[10px] font-bold" style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>✓ Récompense: +{weeklyChallenge.rewardXP}XP</span>}
            </div>
            <p className="text-sm font-black mb-1" style={{ color: weeklyChallenge.completed ? "#4ade80" : "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {weeklyChallenge.completed ? "✦ " : ""}{weeklyChallenge.title}
            </p>
            <p className="text-xs opacity-50 mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {weeklyChallenge.description}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(weeklyChallenge.progress / weeklyChallenge.target * 100))}%`, background: weeklyChallenge.completed ? "#4ade80" : "#D4AF37" }} />
              </div>
              <span className="text-xs font-bold" style={{ color: weeklyChallenge.completed ? "#4ade80" : "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                {weeklyChallenge.progress}/{weeklyChallenge.target}
              </span>
            </div>
          </div>
        )}

        {/* Active seasonal event */}
        {activeEvents.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border px-4 py-3 flex items-center gap-3"
            style={{ background: `${activeEvents[0].color}10`, borderColor: `${activeEvents[0].color}30` }}>
            <span className="text-2xl">{activeEvents[0].emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-black" style={{ color: activeEvents[0].color, fontFamily: "var(--font-bricolage)" }}>
                {activeEvents[0].name} — bonus actif !
              </p>
              <p className="text-[10px] opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {activeEvents[0].description}
              </p>
            </div>
          </motion.div>
        )}

        {/* Ère II portal */}
        <motion.button
          onClick={() => router.push("/oasis/ere2")}
          whileTap={{ scale: 0.97 }} transition={springTap}
          className="rounded-3xl border p-4 flex items-center gap-4 text-left w-full"
          style={{
            background: ere2Unlocked ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.03)",
            borderColor: ere2Unlocked ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)",
          }}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
            style={{ background: ere2Unlocked ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)" }}>
            {ere2Unlocked ? "🌙" : "🔒"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm"
              style={{ color: ere2Unlocked ? "#34d399" : "rgba(248,244,236,0.3)", fontFamily: "var(--font-bricolage)" }}>
              Ère II — L&apos;Aube de l&apos;Islam
            </p>
            <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {ere2Unlocked
                ? "5 lieux · Bilal, Aïcha, Salmane, Al-Negus, Sa'd ibn Mu'adh"
                : `Niv. ${era2Cond.minLevel} + ${era2Cond.minArcsRead} arcs + maîtrise ${era2Cond.minAvgMastery}% · ${level}/${era2Cond.minLevel}`}
            </p>
          </div>
          <span className="text-sm opacity-40" style={{ color: "var(--text)" }}>→</span>
        </motion.button>

        {/* Ère III portal */}
        <motion.button onClick={() => router.push("/oasis/ere3")}
          whileTap={{ scale: 0.97 }} transition={springTap}
          className="rounded-3xl border p-4 flex items-center gap-4 text-left w-full"
          style={{ background: ere3Unlocked ? "rgba(96,165,250,0.06)" : "rgba(255,255,255,0.03)", borderColor: ere3Unlocked ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.06)" }}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
            style={{ background: ere3Unlocked ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.04)" }}>
            {ere3Unlocked ? "✨" : "🔒"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm" style={{ color: ere3Unlocked ? "#60a5fa" : "rgba(248,244,236,0.3)", fontFamily: "var(--font-bricolage)" }}>
              Ère III — L&apos;Âge d&apos;Or
            </p>
            <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {ere3Unlocked ? "5 lieux · Ibn al-Haytham, Hafez, Omar Khayyam..." : `Niv. ${era3Cond.minLevel} + ${era3Cond.minArcsRead} arcs + maîtrise ${era3Cond.minAvgMastery}%`}
            </p>
          </div>
          <span className="text-sm opacity-40" style={{ color: "var(--text)" }}>→</span>
        </motion.button>

        {/* Ère IV portal */}
        <motion.button onClick={() => router.push("/oasis/ere4")}
          whileTap={{ scale: 0.97 }} transition={springTap}
          className="rounded-3xl border p-4 flex items-center gap-4 text-left w-full"
          style={{ background: ere4Unlocked ? "rgba(249,115,22,0.06)" : "rgba(255,255,255,0.02)", borderColor: ere4Unlocked ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.05)" }}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
            style={{ background: ere4Unlocked ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.03)" }}>
            {ere4Unlocked ? "🏛️" : "🔒"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm" style={{ color: ere4Unlocked ? "#f97316" : "rgba(248,244,236,0.25)", fontFamily: "var(--font-bricolage)" }}>
              Ère IV — Les Empires
            </p>
            <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {ere4Unlocked ? "5 lieux · Suleiman, Akbar, Mulla Sadra, Askia, Ibn Battuta" : `Niv. ${era4Cond.minLevel} + ${era4Cond.minArcsRead} arcs + maîtrise ${era4Cond.minAvgMastery}%`}
            </p>
          </div>
          <span className="text-sm opacity-30" style={{ color: "var(--text)" }}>→</span>
        </motion.button>

        {/* Confrérie + Liga row */}
        <div className="flex gap-3">
          <motion.button onClick={() => router.push("/oasis/confrerie")}
            whileTap={{ scale: 0.97 }} transition={springTap}
            className="flex-1 rounded-3xl border p-4 flex flex-col items-start gap-2 text-left"
            style={{ background: "rgba(167,139,250,0.05)", borderColor: "rgba(167,139,250,0.18)" }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg"
              style={{ background: "rgba(167,139,250,0.1)" }}>👨‍👩‍👧</div>
            <div>
              <p className="font-black text-sm" style={{ color: "#a78bfa", fontFamily: "var(--font-bricolage)" }}>Confrérie</p>
              <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Progresser en famille
              </p>
            </div>
          </motion.button>

          <motion.button onClick={() => router.push("/oasis/liga")}
            whileTap={{ scale: 0.97 }} transition={springTap}
            className="flex-1 rounded-3xl border p-4 flex flex-col items-start gap-2 text-left"
            style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.2)" }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg"
              style={{ background: "rgba(212,175,55,0.1)" }}>
              <Swords size={18} style={{ color: "#D4AF37" }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>Liga</p>
              <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Classement hebdo
              </p>
            </div>
          </motion.button>
        </div>

        {/* Ère V portal */}
        <motion.button onClick={() => router.push("/oasis/ere5")}
          whileTap={{ scale: 0.97 }} transition={springTap}
          className="rounded-3xl border p-4 flex items-center gap-4 text-left w-full"
          style={{ background: ere5Unlocked ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.02)", borderColor: ere5Unlocked ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.05)" }}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
            style={{ background: ere5Unlocked ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)" }}>
            {ere5Unlocked ? "⭐" : "🔒"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm" style={{ color: ere5Unlocked ? "#FFD700" : "rgba(248,244,236,0.2)", fontFamily: "var(--font-bricolage)" }}>
              Ère V — La Maîtrise
            </p>
            <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {ere5Unlocked ? "Al-Azhar · Sarajevo · Kuala Lumpur — Islam contemporain" : `Niv. ${era5Cond.minLevel} + ${era5Cond.minArcsRead} arcs + maîtrise ${era5Cond.minAvgMastery}%`}
            </p>
          </div>
          <span className="text-sm opacity-30" style={{ color: "var(--text)" }}>→</span>
        </motion.button>

        {/* Prestige portal */}
        {defeatedCount >= 8 && (
          <motion.button onClick={() => router.push("/oasis/prestige")}
            whileTap={{ scale: 0.97 }} transition={springTap}
            className="rounded-3xl border p-4 flex items-center gap-4 text-left w-full"
            style={{ background: "rgba(255,215,0,0.08)", borderColor: "rgba(255,215,0,0.35)" }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
              style={{ background: "rgba(255,215,0,0.15)" }}>⭐</div>
            <div className="flex-1">
              <p className="font-black text-sm" style={{ color: "#FFD700", fontFamily: "var(--font-bricolage)" }}>Mode Hafiz — Prestige</p>
              <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {liveState.prestigeLevel ? `★ Prestige × ${liveState.prestigeLevel} · ` : ""}Recommence avec questions max-diff
              </p>
            </div>
            <span className="text-sm opacity-40" style={{ color: "var(--text)" }}>→</span>
          </motion.button>
        )}

        {/* Classement */}
        <motion.button onClick={() => router.push("/oasis/classement")}
          whileTap={{ scale: 0.97 }} transition={springTap}
          className="rounded-3xl border p-4 flex items-center gap-4 text-left w-full"
          style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.15)" }}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
            style={{ background: "rgba(212,175,55,0.1)" }}>🏆</div>
          <div className="flex-1">
            <p className="font-black text-sm" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>Classement mondial</p>
            <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Top joueurs par XP · Niv. {level}
            </p>
          </div>
          <span className="text-sm opacity-40" style={{ color: "var(--text)" }}>→</span>
        </motion.button>

        {/* Progression vers la prochaine Ère */}
        {nextEra && (
          <div className="rounded-3xl border p-4"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: `${nextEra.color}30` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[9px] uppercase tracking-widest opacity-40 mb-0.5"
                  style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Prochaine ère
                </p>
                <p className="text-sm font-black"
                  style={{ color: nextEra.color, fontFamily: "var(--font-bricolage)" }}>
                  {nextEra.name} — {nextEra.subtitle}
                </p>
              </div>
              <span className="text-2xl opacity-60">🗺️</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: `Niveau ${nextEra.minLevel}`,          done: level >= nextEra.minLevel,          value: `${level}/${nextEra.minLevel}` },
                { label: `${nextEra.minArcsRead} histoires lues`, done: completedArcs.length >= nextEra.minArcsRead, value: `${completedArcs.length}/${nextEra.minArcsRead}` },
                { label: `Maîtrise ${nextEra.minAvgMastery}%`,  done: avgMastery >= nextEra.minAvgMastery,done2: true, value: `${avgMastery}/${nextEra.minAvgMastery}%` },
              ].map(({ label, done, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-sm">{done ? "✅" : "⬜"}</span>
                  <span className="flex-1 text-xs" style={{ color: done ? "rgba(74,222,128,0.8)" : "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                    {label}
                  </span>
                  <span className="text-[10px] font-bold"
                    style={{ color: done ? "#4ade80" : `${nextEra.color}88`, fontFamily: "var(--font-dm-sans)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maîtrise par catégorie */}
        <div className="rounded-3xl border p-4"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(212,175,55,0.12)" }}>
          <p className="text-[9px] uppercase tracking-widest opacity-40 mb-3"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Maîtrise par catégorie
          </p>
          {([
            { id: "theologie", label: "Théologie", icon: "🕌" },
            { id: "histoire",  label: "Histoire",  icon: "📜" },
            { id: "coran",     label: "Coran",     icon: "📖" },
            { id: "arabe",     label: "Arabe",     icon: "✍️" },
            { id: "ethique",   label: "Éthique",   icon: "🌿" },
            { id: "sira",      label: "Sira",      icon: "🌙" },
            { id: "fiqh",      label: "Fiqh",      icon: "⚖️" },
          ] as { id: Category; label: string; icon: string }[]).map(({ id, label, icon }) => {
            const pct = Math.round(categoryMastery[id] ?? 0);
            const barColor = pct >= 80 ? "#4ade80" : pct >= 50 ? "#D4AF37" : "#60a5fa";
            return (
              <div key={id} className="mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                    {icon} {label}
                  </span>
                  <span className="text-xs font-bold" style={{ color: barColor, fontFamily: "var(--font-dm-sans)" }}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div className="h-full rounded-full"
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ background: barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Manuscrits */}
        <div className="rounded-3xl border p-4"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(167,139,250,0.15)" }}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} style={{ color: "#a78bfa" }} />
            <p className="text-[9px] uppercase tracking-widest opacity-40"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Manuscrits à assembler
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {MANUSCRIPTS.map(m => {
              const collected = manuscripts[m.id] ?? 0;
              const pct       = Math.round((collected / m.pages) * 100);
              const complete  = collected >= m.pages;
              return (
                <div key={m.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-xs font-semibold"
                        style={{ color: complete ? m.color : "rgba(248,244,236,0.7)", fontFamily: "var(--font-dm-sans)" }}>
                        {complete ? "✦ " : ""}{m.title}
                      </span>
                      <span className="text-[9px] ml-1.5 opacity-40"
                        style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                        {m.author}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold"
                      style={{ color: m.color, fontFamily: "var(--font-dm-sans)" }}>
                      {collected}/{m.pages}p
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div className="h-full rounded-full"
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ background: complete ? `linear-gradient(to right, ${m.color}, #D4AF37)` : m.color }}
                    />
                  </div>
                  {complete && m.unlocks && (
                    <p className="text-[9px] mt-0.5" style={{ color: m.color, fontFamily: "var(--font-dm-sans)" }}>
                      ✦ Débloque : {m.unlocks}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
