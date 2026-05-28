"use client";

import { useState, useEffect, useCallback } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Qibla, Coordinates } from "adhan";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/* ── helpers ─────────────────────────────────────────────────────────────── */
function haversine(lat: number, lng: number) {
  const R   = 6371;
  const φ1  = lat * Math.PI / 180;
  const φ2  = 21.4225 * Math.PI / 180;
  const Δφ  = (21.4225 - lat) * Math.PI / 180;
  const Δλ  = (39.8262 - lng) * Math.PI / 180;
  const a   = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function angleDiff(a: number, b: number) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

/* ── arch SVG path helper ─────────────────────────────────────────────────── */
function archPath(cx: number, baseY: number, w: number, h: number) {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const topY = baseY - h;
  const curveY = topY + h * 0.35;
  return `M ${x0},${baseY} L ${x0},${curveY} C ${x0},${topY} ${cx},${topY - h*0.08} ${cx},${topY - h*0.08} C ${cx},${topY - h*0.08} ${x1},${topY} ${x1},${curveY} L ${x1},${baseY} Z`;
}

/* ── isometric Kaaba ─────────────────────────────────────────────────────── */
function Kaaba({ opacity, scale }: { opacity: number; scale: number }) {
  const s = scale;
  // cube dimensions
  const W = 36 * s, H = 40 * s, D = 14 * s;
  // top diamond
  const topPts = `0,${-H/2-D} ${W/2},${-H/2} 0,${-H/2+D} ${-W/2},${-H/2}`;
  // front left face
  const frontL = `${-W/2},${-H/2} 0,${-H/2+D} 0,${H/2+D} ${-W/2},${H/2}`;
  // front right face
  const frontR = `0,${-H/2+D} ${W/2},${-H/2} ${W/2},${H/2} 0,${H/2+D}`;
  // kiswa band (gold) on left face — centered
  const kY = -H/2 + D + H*0.15;
  const kBand = `${-W/2},${kY} 0,${kY+D} 0,${kY+D+H*0.12} ${-W/2},${kY+H*0.12}`;
  // door on left face
  const dX = -W/4, dW = W * 0.22, dH = H * 0.35;
  const dY = H/2 + D - dH - H*0.06;

  return (
    <g opacity={opacity} style={{ transition: "opacity 0.6s ease, transform 0.6s ease" }}>
      {/* Shadow */}
      <ellipse cx="0" cy={H/2 + D + 6*s} rx={W*0.6} ry={4*s}
        fill="rgba(0,0,0,0.5)" />

      {/* Top face */}
      <polygon points={topPts} fill="#1a0e04" stroke="#D4AF37" strokeWidth={0.6*s} strokeOpacity="0.6" />

      {/* Right face */}
      <polygon points={frontR} fill="#110902" stroke="#D4AF37" strokeWidth={0.4*s} strokeOpacity="0.3" />

      {/* Left face */}
      <polygon points={frontL} fill="#1c1006" stroke="#D4AF37" strokeWidth={0.4*s} strokeOpacity="0.4" />

      {/* Kiswa band */}
      <polygon points={kBand} fill="#D4AF37" opacity="0.75" />

      {/* Arabic calligraphy on kiswa (simplified) */}
      <text x={-W/4} y={kY + D + H*0.065} textAnchor="middle"
        fontSize={5*s} fill="#061A12" fontFamily="serif" opacity="0.9">لا إله</text>

      {/* Door */}
      <rect x={dX - dW/2} y={dY} width={dW} height={dH}
        fill="#D4AF37" opacity="0.9" rx={dW*0.3} />
      <rect x={dX - dW/2 + 1.5*s} y={dY + 1.5*s} width={dW - 3*s} height={dH - 1.5*s}
        fill="#8B6914" opacity="0.9" rx={dW*0.2} />

      {/* Handle */}
      <circle cx={dX + dW/8} cy={dY + dH*0.55} r={1.2*s} fill="#D4AF37" />
    </g>
  );
}

/* ── main component ──────────────────────────────────────────────────────── */
export default function QiblaPage() {
  const { settings }    = useSettings();
  const [heading,   setHeading]   = useState<number | null>(null);
  const [permitted, setPermitted] = useState(false);
  const [aligned,   setAligned]   = useState(false);

  const bearing = Math.round(Qibla(new Coordinates(settings.lat, settings.lng)));
  const dist    = haversine(settings.lat, settings.lng);

  const diff  = heading !== null ? angleDiff(heading, bearing) : 180;
  const score = Math.max(0, 1 - diff / 40);           // 0 → 1
  const isOn  = diff < 5 && heading !== null;

  // Vibration + state
  useEffect(() => {
    if (isOn && !aligned) {
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate([40, 60, 120, 60, 200]);
      setAligned(true);
    }
    if (!isOn) setAligned(false);
  }, [isOn, aligned]);

  // Permission + orientation
  const activate = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = await (DeviceOrientationEvent as any).requestPermission();
        if (r === "granted") setPermitted(true);
      } else {
        setPermitted(true);
      }
    } catch { setPermitted(true); }
  }, []);

  useEffect(() => {
    if (!permitted) return;
    const h = (e: DeviceOrientationEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const v = (e as any).webkitCompassHeading ?? (e.absolute ? (360 - (e.alpha ?? 0)) : null);
      if (v !== null) setHeading(v);
    };
    window.addEventListener("deviceorientationabsolute", h as EventListener, true);
    window.addEventListener("deviceorientation",         h as EventListener, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", h as EventListener, true);
      window.removeEventListener("deviceorientation",         h as EventListener, true);
    };
  }, [permitted]);

  /* ── visual params ─────────────────────────────────────────────────────── */
  const glow     = score ** 1.4;
  const kaabaVis = Math.max(0, score * 2 - 0.6);
  const kaabaScl = 0.55 + score * 0.7;
  const rayAlpha = score ** 2.5;
  const corridors= Math.ceil(score * 6);

  const W = 320, H = 460;
  const CX = W / 2, BASE = H;
  const ARCH_W = 260, ARCH_H = 380;

  const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#020a05]">

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 55%,
            rgba(212,175,55,${glow * 0.18}) 0%,
            rgba(5,92,63,${glow * 0.12}) 40%,
            transparent 70%)`,
          transition: "background 0.4s ease",
        }} />

      {/* Header */}
      <div className="relative z-10 flex w-full items-center justify-between px-5 pt-12">
        <Link href="/prieres"
          className="flex h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.2)", color: "#F8F4EC" }}>
          <ArrowLeft size={18} />
        </Link>
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)" }}>
            القبلة
          </p>
          <p className="text-xs opacity-40 -mt-1" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {settings.cityName} · {dist.toLocaleString("fr-FR")} km
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xl font-bold tabular-nums" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
            {bearing}°
          </p>
          {heading !== null && (
            <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              cap {Math.round(heading)}°
            </p>
          )}
        </div>
      </div>

      {/* ── Portal SVG ────────────────────────────────────────────────────── */}
      <div className="relative z-10 mt-2">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            {/* Arch clip */}
            <clipPath id="portalClip">
              <path d={archPath(CX, BASE, ARCH_W, ARCH_H)} />
            </clipPath>

            {/* Gold glow filter */}
            <filter id="glowF" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" result="b" />
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>

            {/* Radial gradients */}
            <radialGradient id="innerGlow" cx="50%" cy="55%" r="50%">
              <stop offset="0%"   stopColor="#D4AF37" stopOpacity={glow * 0.55} />
              <stop offset="35%"  stopColor="#D4AF37" stopOpacity={glow * 0.18} />
              <stop offset="70%"  stopColor="#055C3F" stopOpacity={glow * 0.08} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="skyGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%"   stopColor="#0a1f10" />
              <stop offset="100%" stopColor="#020a05" />
            </radialGradient>
          </defs>

          {/* ── Interior (clipped to arch) ─────────────────────────────── */}
          <g clipPath="url(#portalClip)">

            {/* Sky */}
            <rect width={W} height={H} fill="url(#skyGrad)" />

            {/* Stars */}
            {[
              [80,60],[120,40],[200,55],[240,35],[160,25],[60,90],
              [280,70],[40,120],[260,100],[170,80],[100,110],[220,90],
            ].map(([x,y], i) => (
              <circle key={i} cx={x} cy={y} r={Math.random() > 0.5 ? 1 : 0.6}
                fill="white" opacity={0.15 + Math.random()*0.3} />
            ))}

            {/* Atmospheric glow */}
            <ellipse cx={CX} cy={H * 0.58} rx="110" ry="80"
              fill="url(#innerGlow)"
              style={{ transition: "all 0.3s ease" }} />

            {/* Light rays */}
            {RAYS.map((deg, i) => {
              const rad = (deg - 90) * Math.PI / 180;
              const len = 180;
              return (
                <line key={i}
                  x1={CX} y1={H * 0.58}
                  x2={CX + Math.cos(rad)*len} y2={H*0.58 + Math.sin(rad)*len}
                  stroke="#D4AF37"
                  strokeWidth={i % 3 === 0 ? 0.8 : 0.4}
                  strokeOpacity={rayAlpha * (i % 2 === 0 ? 0.4 : 0.2)}
                  style={{ transition: "stroke-opacity 0.4s ease" }}
                />
              );
            })}

            {/* Depth corridors */}
            {[0.9, 0.75, 0.6, 0.46, 0.33, 0.22].map((scale, i) => {
              const visible = i < corridors;
              const cw = ARCH_W * scale;
              const ch = ARCH_H * scale;
              const baseShift = BASE - ARCH_H * (1 - scale) * 0.3;
              return (
                <path key={i}
                  d={archPath(CX, baseShift, cw, ch)}
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth={1.2 - i * 0.15}
                  strokeOpacity={visible ? (0.5 - i * 0.06) * glow : 0}
                  style={{ transition: "stroke-opacity 0.5s ease" }}
                />
              );
            })}

            {/* Ground plane */}
            <ellipse cx={CX} cy={H * 0.88} rx="100" ry="14"
              fill="none" stroke="#D4AF37" strokeWidth="0.4"
              strokeOpacity={glow * 0.25}
              style={{ transition: "stroke-opacity 0.4s ease" }} />

            {/* Kaaba */}
            <g transform={`translate(${CX}, ${H * 0.58})`}
              style={{ transition: "transform 0.4s ease" }}>
              <Kaaba opacity={kaabaVis} scale={kaabaScl} />
            </g>

            {/* Alignment flash */}
            {isOn && (
              <rect width={W} height={H}
                fill="rgba(212,175,55,0.06)"
                style={{ animation: "none" }} />
            )}

            {/* Calligraphie قِبْلَة */}
            <g opacity={kaabaVis > 0.8 ? Math.min(1, (kaabaVis - 0.8) * 5) : 0}
              style={{ transition: "opacity 0.8s ease" }}>
              <text x={CX} y={H * 0.18}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="38" fontWeight="700"
                fill="#D4AF37"
                fontFamily="serif"
                filter="url(#softGlow)"
              >
                قِبْلَة
              </text>
            </g>

          </g>

          {/* ── Arch frame (outside clip) ──────────────────────────────── */}
          {/* Outer decorative border */}
          <path d={archPath(CX, BASE, ARCH_W + 12, ARCH_H + 8)}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeOpacity={0.12 + glow * 0.15}
            style={{ transition: "stroke-opacity 0.4s ease" }} />

          {/* Main arch border */}
          <path d={archPath(CX, BASE, ARCH_W, ARCH_H)}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2.5"
            strokeOpacity={0.25 + glow * 0.65}
            filter="url(#glowF)"
            style={{ transition: "stroke-opacity 0.4s ease" }} />

          {/* Inner arch border */}
          <path d={archPath(CX, BASE, ARCH_W - 14, ARCH_H - 10)}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.7"
            strokeOpacity={0.1 + glow * 0.3}
            style={{ transition: "stroke-opacity 0.4s ease" }} />

          {/* Corner ornaments */}
          {[[CX - ARCH_W/2, BASE - ARCH_H * 0.62], [CX + ARCH_W/2, BASE - ARCH_H * 0.62]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="5"
                fill="none" stroke="#D4AF37" strokeWidth="1"
                strokeOpacity={0.2 + glow * 0.5}
                style={{ transition: "stroke-opacity 0.4s ease" }} />
              <circle cx={x} cy={y} r="2"
                fill="#D4AF37"
                fillOpacity={0.1 + glow * 0.6}
                style={{ transition: "fill-opacity 0.4s ease" }} />
            </g>
          ))}

          {/* Alignment indicator — bottom arc */}
          <path
            d={`M ${CX - 80},${H - 10} A 80,10 0 0,1 ${CX + 80},${H - 10}`}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity={isOn ? 0.9 : glow * 0.4}
            strokeDasharray={`${score * 160} 160`}
            style={{ transition: "all 0.3s ease" }} />

        </svg>
      </div>

      {/* ── Bottom UI ────────────────────────────────────────────────────── */}
      <div className="relative z-10 -mt-8 flex w-full flex-col items-center gap-4 px-6 pb-6">

        {/* Alignment status */}
        {heading !== null ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1.5">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-1 w-6 rounded-full transition-all duration-300"
                  style={{ background: i / 8 < score ? "#D4AF37" : "rgba(212,175,55,0.15)" }} />
              ))}
            </div>
            <p className="text-xs" style={{
              color: isOn ? "#D4AF37" : "rgba(248,244,236,0.4)",
              fontFamily: "var(--font-dm-sans)",
              transition: "color 0.3s",
            }}>
              {isOn ? "✦ Parfaitement aligné — Allahu Akbar" : `${Math.round(diff)}° de la Qibla`}
            </p>
          </div>
        ) : (
          <button onClick={activate}
            className="flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #055C3F, #0a8a5e)",
              color: "#F8F4EC",
              fontFamily: "var(--font-dm-sans)",
              boxShadow: "0 0 30px rgba(5,92,63,0.4)",
            }}>
            Activer la boussole
          </button>
        )}
      </div>
    </main>
  );
}
