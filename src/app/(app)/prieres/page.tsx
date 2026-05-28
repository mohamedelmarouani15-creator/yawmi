"use client";

import { useRef, useState } from "react";
import { usePrayerTimes }   from "@/hooks/usePrayerTimes";
import { useSettings }      from "@/hooks/useSettings";
import { PRAYER_LABELS, PRAYER_ORDER, formatTime } from "@/lib/prayer";
import { Qibla, Coordinates } from "adhan";
import Link from "next/link";
import { Pause, Play, Settings2 } from "lucide-react";

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [adhanPlaying, setAdhanPlaying] = useState(false);
  const [adhanError,   setAdhanError]   = useState(false);

  function toggleAdhan() {
    const a = audioRef.current;
    if (!a) return;
    setAdhanError(false);
    if (adhanPlaying) {
      a.pause();
      a.currentTime = 0;
      setAdhanPlaying(false);
    } else {
      a.play()
        .then(() => setAdhanPlaying(true))
        .catch(() => setAdhanError(true));
    }
  }
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

      {/* Adhan */}
      <div
        className="flex items-center justify-between rounded-2xl border px-5 py-4"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.12)" }}
      >
        <div>
          <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Adhan · الأذان
          </p>
          <p className="mt-0.5 text-sm font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {adhanPlaying ? "En cours de lecture…" : "Mishary Rashid Alafasy"}
          </p>
        </div>
        <button
          onClick={toggleAdhan}
          className="flex h-12 w-12 items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            background: adhanPlaying
              ? "rgba(212,175,55,0.2)"
              : "linear-gradient(135deg, #055C3F, #0a8a5e)",
            boxShadow: adhanPlaying ? "none" : "0 0 20px rgba(5,92,63,0.4)",
            border: adhanPlaying ? "1px solid rgba(212,175,55,0.3)" : "none",
          }}
        >
          {adhanPlaying
            ? <Pause size={18} style={{ color: "#D4AF37" }} />
            : <Play  size={18} fill="#F8F4EC" style={{ color: "#F8F4EC", marginLeft: 2 }} />
          }
        </button>
        <audio ref={audioRef} src="/audio/adhan.mp3"
          onEnded={() => setAdhanPlaying(false)}
          onError={() => setAdhanError(true)} />
        {adhanError && (
          <p className="mt-2 text-xs text-center" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>
            ⚠️ Vérifie que le son n'est pas coupé (bouton sur le côté de l'iPhone)
          </p>
        )}
      </div>

      {/* Qibla */}
      <Link
        href="/qibla"
        className="relative flex items-center justify-between overflow-hidden rounded-2xl border p-5 transition-all active:scale-[0.98]"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />
        <div className="flex flex-col gap-1">
          <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Qibla · القبلة
          </p>
          <p className="text-3xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
            {bearing}°
          </p>
          <p className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {dist.toLocaleString("fr-FR")} km de La Mecque
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
            <g transform={`rotate(${bearing}, 32, 32)`}>
              <polygon points="32,6 37,30 32,26 27,30" fill="#D4AF37" />
              <polygon points="32,58 27,34 32,38 37,34" fill="rgba(212,175,55,0.25)" />
            </g>
            <circle cx="32" cy="32" r="3" fill="#D4AF37" />
          </svg>
          <p className="text-xs font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
            Ouvrir →
          </p>
        </div>
      </Link>

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
