"use client";

import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useSettings }    from "@/hooks/useSettings";
import { PRAYER_LABELS, PRAYER_ORDER, formatTime } from "@/lib/prayer";
import { Qibla, Coordinates } from "adhan";
import Link from "next/link";
import { Settings2 } from "lucide-react";

function getQibla(lat: number, lng: number) {
  const coords  = new Coordinates(lat, lng);
  const bearing = Qibla(coords); // degrés depuis le Nord, sens horaire

  // Distance à la Mecque (Haversine)
  const R   = 6371;
  const lat1 = lat  * Math.PI / 180;
  const lat2 = 21.4225 * Math.PI / 180;
  const dLat = (21.4225 - lat) * Math.PI / 180;
  const dLng = (39.8262 - lng) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  const dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));

  return { bearing: Math.round(bearing), dist };
}

export default function PrieresPage() {
  const { times, nextPrayer, countdown } = usePrayerTimes();
  const { settings } = useSettings();
  const { bearing, dist } = getQibla(settings.lat, settings.lng);

  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Horaires du jour
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            Prières
          </h1>
        </div>
        <Link
          href="/profil"
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
          style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}
        >
          <Settings2 size={12} /> {settings.cityName}
        </Link>
      </div>

      {/* Prochaine prière */}
      {nextPrayer && times ? (
        <div
          className="relative overflow-hidden rounded-2xl p-5 text-center"
          style={{
            background: "linear-gradient(135deg, #055C3F 0%, #033d2a 100%)",
            boxShadow: "0 8px 32px rgba(5,92,63,0.3)",
          }}
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />
          <p className="text-xs tracking-widest uppercase opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Prochaine prière
          </p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
            {PRAYER_LABELS[nextPrayer].fr}
          </p>
          <p className="mt-0.5 text-sm opacity-60" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)" }}>
            {PRAYER_LABELS[nextPrayer].ar}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {formatTime(times[nextPrayer])}
          </p>
          <p className="mt-1 text-sm opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            dans {countdown}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
          <p className="text-sm opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Toutes les prières du jour sont passées.
          </p>
        </div>
      )}

      {/* Qibla */}
      <div
        className="flex items-center gap-5 rounded-2xl border p-5"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.12)" }}
      >
        {/* Boussole */}
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          {/* Cercle extérieur */}
          <svg width="80" height="80" className="absolute inset-0">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="1.5" />
            {/* N S E O */}
            {["N","E","S","O"].map((l, i) => {
              const angle = i * 90 * Math.PI / 180;
              const x = 40 + 28 * Math.sin(angle);
              const y = 40 - 28 * Math.cos(angle);
              return (
                <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="7" fill="rgba(248,244,236,0.25)" fontFamily="sans-serif">{l}</text>
              );
            })}
          </svg>
          {/* Flèche Qibla */}
          <div
            className="absolute flex h-16 w-16 items-center justify-center"
            style={{ transform: `rotate(${bearing}deg)` }}
          >
            <svg width="64" height="64" viewBox="0 0 64 64">
              {/* Pointe vers la Mecque */}
              <polygon points="32,6 37,32 32,28 27,32" fill="#D4AF37" />
              {/* Queue */}
              <polygon points="32,58 27,32 32,36 37,32" fill="rgba(212,175,55,0.3)" />
            </svg>
          </div>
          {/* Point central */}
          <div className="absolute h-2 w-2 rounded-full" style={{ background: "#D4AF37" }} />
        </div>

        {/* Infos */}
        <div className="flex flex-col gap-1">
          <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Qibla · القبلة
          </p>
          <p className="text-2xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
            {bearing}°
          </p>
          <p className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            depuis le Nord · {dist.toLocaleString("fr-FR")} km de La Mecque
          </p>
          <p className="mt-1 text-xs opacity-30 leading-snug" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Utilise une boussole physique et oriente-toi à {bearing}° depuis le Nord.
          </p>
        </div>
      </div>

      {/* Liste des prières */}
      <div className="flex flex-col gap-2">
        {PRAYER_ORDER.map((key) => {
          if (!times) return null;
          const isPast = times[key] < new Date();
          const isNext = key === nextPrayer;
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border px-4 py-3.5"
              style={{
                background: isNext ? "rgba(5,92,63,0.2)" : "rgba(255,255,255,0.02)",
                borderColor: isNext ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: isPast ? "#055C3F" : isNext ? "#D4AF37" : "rgba(255,255,255,0.15)" }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: isNext ? "#D4AF37" : "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {PRAYER_LABELS[key].fr}
                  </p>
                  <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-amiri)" }}>
                    {PRAYER_LABELS[key].ar}
                  </p>
                </div>
              </div>
              <p
                className="text-sm font-semibold tabular-nums"
                style={{
                  color: isPast ? "rgba(248,244,236,0.3)" : "#F8F4EC",
                  fontFamily: "var(--font-dm-sans)",
                  textDecoration: isPast ? "line-through" : "none",
                }}
              >
                {formatTime(times[key])}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
