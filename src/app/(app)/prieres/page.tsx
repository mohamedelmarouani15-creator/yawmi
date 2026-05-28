"use client";

import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useSettings }    from "@/hooks/useSettings";
import { PRAYER_LABELS, PRAYER_ORDER, formatTime } from "@/lib/prayer";
import Link from "next/link";
import { Settings2 } from "lucide-react";

export default function PrieresPage() {
  const { times, nextPrayer, countdown } = usePrayerTimes();
  const { settings } = useSettings();

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
