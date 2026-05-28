"use client";

import { useState, useEffect, useCallback } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Qibla, Coordinates } from "adhan";
import { ArrowLeft, Navigation } from "lucide-react";
import Link from "next/link";

function haversine(lat: number, lng: number): number {
  const lat1 = lat * Math.PI / 180;
  const lat2 = 21.4225 * Math.PI / 180;
  const dLat = (21.4225 - lat) * Math.PI / 180;
  const dLng = (39.8262 - lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
const CARDINALS = [
  { deg: 0,   label: "N" },
  { deg: 90,  label: "E" },
  { deg: 180, label: "S" },
  { deg: 270, label: "O" },
];

export default function QiblaPage() {
  const { settings } = useSettings();
  const [heading,     setHeading]     = useState<number | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [asked,       setAsked]       = useState(false);

  const bearing = Math.round(Qibla(new Coordinates(settings.lat, settings.lng)));
  const dist    = haversine(settings.lat, settings.lng);

  // Rotation du cadran : quand le téléphone tourne, le cadran suit
  const dialRotation  = heading !== null ? -heading : 0;
  // La flèche Qibla est fixe dans le référentiel géographique
  const arrowRotation = bearing;

  const requestPermission = useCallback(async () => {
    setAsked(true);
    try {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (DeviceOrientationEvent as any).requestPermission === "function"
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === "granted") setHasPermission(true);
      } else {
        setHasPermission(true);
      }
    } catch {
      setHasPermission(true);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    const handler = (e: DeviceOrientationEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const h = (e as any).webkitCompassHeading ?? (e.absolute ? (360 - (e.alpha ?? 0)) : null);
      if (h !== null) setHeading(h);
    };
    window.addEventListener("deviceorientationabsolute", handler as EventListener, true);
    window.addEventListener("deviceorientation",         handler as EventListener, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler as EventListener, true);
      window.removeEventListener("deviceorientation",         handler as EventListener, true);
    };
  }, [hasPermission]);

  const SIZE  = 300;
  const CX    = SIZE / 2;
  const R_OUT = 130; // cadran
  const R_TIC = 118; // base ticks
  const R_LBL = 104; // labels cardinaux

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#061A12] overflow-hidden">

      {/* Glow central */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #055C3F 0%, transparent 70%)" }} />

      {/* Header */}
      <div className="relative z-10 flex w-full items-center justify-between px-5 pt-12 pb-2">
        <Link
          href="/prieres"
          className="flex h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "#F8F4EC" }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="text-center">
          <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Direction
          </p>
          <h1 className="text-xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Qibla · القبلة
          </h1>
        </div>
        <div className="h-10 w-10" />
      </div>

      {/* Ville + bearing */}
      <div className="relative z-10 mt-2 flex flex-col items-center gap-1">
        <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          {settings.cityName} · {dist.toLocaleString("fr-FR")} km de La Mecque
        </p>
        <p className="text-4xl font-bold tabular-nums" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
          {bearing}°
        </p>
        <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>depuis le Nord</p>
      </div>

      {/* Boussole */}
      <div className="relative z-10 mt-6 flex items-center justify-center">

        {/* Halo extérieur */}
        <div className="absolute rounded-full"
          style={{
            width: SIZE + 40, height: SIZE + 40,
            background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)",
          }} />

        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <defs>
            {/* Gradient cadran */}
            <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#0d2e1e" />
              <stop offset="100%" stopColor="#061A12" />
            </radialGradient>
            {/* Gradient flèche */}
            <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#b8942e" />
            </linearGradient>
            {/* Glow filtre */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="arrowGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Fond du cadran — tourne avec le téléphone */}
          <g transform={`rotate(${dialRotation}, ${CX}, ${CX})`}
            style={{ transition: "transform 0.15s ease-out" }}>

            {/* Cercle de fond */}
            <circle cx={CX} cy={CX} r={R_OUT} fill="url(#dialGrad)" />
            <circle cx={CX} cy={CX} r={R_OUT} fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />

            {/* Ticks */}
            {TICKS.map(deg => {
              const rad  = (deg - 90) * Math.PI / 180;
              const isMaj = deg % 30 === 0;
              const len  = isMaj ? 10 : 5;
              const x1   = CX + R_TIC * Math.cos(rad);
              const y1   = CX + R_TIC * Math.sin(rad);
              const x2   = CX + (R_TIC - len) * Math.cos(rad);
              const y2   = CX + (R_TIC - len) * Math.sin(rad);
              return (
                <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isMaj ? "rgba(212,175,55,0.5)" : "rgba(248,244,236,0.15)"}
                  strokeWidth={isMaj ? 1.5 : 0.8} />
              );
            })}

            {/* Cardinaux */}
            {CARDINALS.map(({ deg, label }) => {
              const rad = (deg - 90) * Math.PI / 180;
              const x   = CX + R_LBL * Math.cos(rad);
              const y   = CX + R_LBL * Math.sin(rad);
              return (
                <text key={label} x={x} y={y}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={label === "N" ? "13" : "11"}
                  fontWeight="700"
                  fill={label === "N" ? "#D4AF37" : "rgba(248,244,236,0.6)"}
                  fontFamily="sans-serif"
                  filter={label === "N" ? "url(#glow)" : undefined}
                >
                  {label}
                </text>
              );
            })}

            {/* Degrés tous les 30° */}
            {[30,60,120,150,210,240,300,330].map(deg => {
              const rad = (deg - 90) * Math.PI / 180;
              const x   = CX + (R_LBL - 2) * Math.cos(rad);
              const y   = CX + (R_LBL - 2) * Math.sin(rad);
              return (
                <text key={deg} x={x} y={y}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fill="rgba(248,244,236,0.25)" fontFamily="sans-serif"
                >
                  {deg}
                </text>
              );
            })}

            {/* Cercle intérieur décoratif */}
            <circle cx={CX} cy={CX} r="82" fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.5" />
            <circle cx={CX} cy={CX} r="60" fill="rgba(5,92,63,0.15)" stroke="rgba(212,175,55,0.1)" strokeWidth="0.5" />
          </g>

          {/* Flèche Qibla — fixe dans le référentiel géographique */}
          <g transform={`rotate(${arrowRotation}, ${CX}, ${CX})`}
            style={{ transition: "transform 0.3s ease-out" }}
            filter="url(#arrowGlow)"
          >
            {/* Ombre flèche */}
            <polygon
              points={`${CX},${CX - 70} ${CX + 10},${CX + 10} ${CX},${CX - 5} ${CX - 10},${CX + 10}`}
              fill="rgba(0,0,0,0.3)"
              transform="translate(2,2)"
            />
            {/* Flèche principale (vers Qibla) */}
            <polygon
              points={`${CX},${CX - 72} ${CX + 10},${CX + 10} ${CX},${CX - 5} ${CX - 10},${CX + 10}`}
              fill="url(#arrowGrad)"
            />
            {/* Queue flèche */}
            <polygon
              points={`${CX},${CX + 55} ${CX + 7},${CX + 10} ${CX},${CX - 5} ${CX - 7},${CX + 10}`}
              fill="rgba(212,175,55,0.2)"
            />
            {/* Pointe dorée */}
            <circle cx={CX} cy={CX - 72} r="4" fill="#D4AF37" />
          </g>

          {/* Centre */}
          <circle cx={CX} cy={CX} r="8"  fill="#061A12" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" />
          <circle cx={CX} cy={CX} r="3"  fill="#D4AF37" />
        </svg>
      </div>

      {/* Infos bas */}
      <div className="relative z-10 mt-6 flex flex-col items-center gap-2 px-8 text-center">
        {heading !== null ? (
          <p className="text-sm font-medium" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
            Cap actuel : {Math.round(heading)}° · Boussole active ✓
          </p>
        ) : (
          <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {asked ? "Boussole non disponible — oriente-toi manuellement à" : "Active la boussole pour une direction en temps réel"} {!asked && ""}
          </p>
        )}

        {/* Bouton permission */}
        {!hasPermission && (
          <button
            onClick={requestPermission}
            className="mt-3 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #055C3F, #0a8a5e)",
              color: "#F8F4EC",
              fontFamily: "var(--font-dm-sans)",
              boxShadow: "0 0 24px rgba(5,92,63,0.4)",
            }}
          >
            <Navigation size={16} /> Activer la boussole
          </button>
        )}

        <p className="mt-4 text-xs opacity-20" style={{ color: "#F8F4EC", fontFamily: "var(--font-amiri)" }}>
          وَمِنْ حَيْثُ خَرَجْتَ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ
        </p>
        <p className="text-xs opacity-20" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Coran 2:149
        </p>
      </div>
    </main>
  );
}
