"use client";

import Link from "next/link";
import { Moon, BookOpen, RotateCcw, Users, Settings, Star } from "lucide-react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useSettings }    from "@/hooks/useSettings";
import { useAuth }        from "@/hooks/useAuth";
import { PRAYER_LABELS }  from "@/lib/prayer";
import { storage, todayKey } from "@/lib/storage";
import { getHijriDate, formatHijri } from "@/lib/hijri";
import { getUpcomingEvents, formatGregorian } from "@/lib/islamic-events";
import { useEffect, useState } from "react";

const DAILY_DHIKRS = [
  { ar: "سُبْحَانَ اللّهِ وَبِحَمْدِهِ", fr: "Subhan Allahi wa bihamdihi" },
  { ar: "أَسْتَغْفِرُ اللهَ", fr: "Astaghfirullah" },
  { ar: "لَا إِلَهَ إِلَّا اللهُ", fr: "La ilaha illallah" },
  { ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", fr: "Allahumma salli ala Muhammad" },
  { ar: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ", fr: "Bismillahi ar-rahmani ar-rahim" },
  { ar: "رَبِّ زِدْنِي عِلْمًا", fr: "Rabbi zidni ilma" },
  { ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", fr: "Hasbunallahu wa ni'ma al-wakil" },
];

function getDailyDhikr() {
  const day = new Date().getDay();
  return DAILY_DHIKRS[day % DAILY_DHIKRS.length];
}

function getTodayStats() {
  const log    = storage.getDhikrLog().find(s => s.date === todayKey());
  const tasks  = storage.getTasks();
  const done   = tasks.filter(t => t.done).length;
  const counts = log?.counts ?? {};
  const totalDhikr = Object.values(counts).reduce((a, b) => a + b, 0);
  return { totalDhikr, tasksDone: done, tasksTotal: tasks.length };
}

const SHORTCUTS = [
  { href: "/prieres", icon: Moon,      label: "Prières"  },
  { href: "/coran",   icon: BookOpen,  label: "Coran"    },
  { href: "/dhikr",   icon: RotateCcw, label: "Dhikr"    },
  { href: "/azkar",   icon: Star,      label: "Azkar"    },
  { href: "/famille", icon: Users,     label: "Famille"  },
];

export default function AccueilPage() {
  const { times, nextPrayer, countdown } = usePrayerTimes();
  const { settings } = useSettings();
  const [stats, setStats] = useState({ totalDhikr: 0, tasksDone: 0, tasksTotal: 0 });
  const dhikr = getDailyDhikr();

  useEffect(() => {
    setStats(getTodayStats());
  }, []);

  const { user } = useAuth();
  const firstName = user?.user_metadata?.display_name?.split(" ")[0] ?? null;
  const hijri          = getHijriDate();
  const upcomingEvents = getUpcomingEvents(3);

  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Assalamu alaykum
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {firstName ? `${firstName} 👋` : "Bienvenue 👋"}
          </h1>
        </div>
        <Link
          href="/profil"
          className="flex h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}
        >
          <Settings size={18} />
        </Link>
      </div>

      {/* Date Hijri */}
      <div
        className="flex items-center justify-between rounded-xl border px-4 py-3"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}
      >
        <div>
          <p className="text-xs opacity-40 tracking-widest uppercase" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Calendrier islamique
          </p>
          <p className="mt-0.5 text-sm font-medium" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {hijri.monthFr} {hijri.year} H
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)" }}>
            {formatHijri(hijri)}
          </p>
          {hijri.isRamadan && (
            <p className="text-xs mt-0.5" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
              ✦ Ramadan Mubarak
            </p>
          )}
          {hijri.isJumua && !hijri.isRamadan && (
            <p className="text-xs mt-0.5 opacity-60" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
              Jumu'ah Mubarak
            </p>
          )}
        </div>
      </div>

      {/* Prochaine prière */}
      {nextPrayer && times && (
        <Link
          href="/prieres"
          className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, #055C3F 0%, #033d2a 100%)",
            boxShadow: "0 8px 32px rgba(5,92,63,0.3)",
          }}
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-widest uppercase opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                Prochaine prière · {settings.cityName}
              </p>
              <p className="mt-1 text-2xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
                {PRAYER_LABELS[nextPrayer].fr}
                <span className="ml-2 text-base opacity-50" style={{ fontFamily: "var(--font-amiri)" }}>
                  {PRAYER_LABELS[nextPrayer].ar}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
                {countdown}
              </p>
              <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                restant
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Stats du jour */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}>
          <p className="text-2xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>{stats.totalDhikr}</p>
          <p className="mt-1 text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>Dhikrs aujourd'hui</p>
        </div>
        <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}>
          <p className="text-2xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
            {stats.tasksDone}/{stats.tasksTotal}
          </p>
          <p className="mt-1 text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>Tâches famille</p>
        </div>
      </div>

      {/* Dhikr du jour */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.12)" }}
      >
        <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Dhikr du jour
        </p>
        <p className="mt-3 text-xl font-bold leading-loose text-right" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
          {dhikr.ar}
        </p>
        <p className="mt-1 text-sm opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          {dhikr.fr}
        </p>
      </div>

      {/* Événements islamiques */}
      {upcomingEvents.length > 0 && (
        <div>
          <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Prochains événements
          </p>
          <div className="flex flex-col gap-2">
            {upcomingEvents.map(ev => (
              <div key={ev.name} className="flex items-center justify-between rounded-xl border px-4 py-3"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{ev.name}</p>
                  <p className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{ev.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                    {ev.daysUntil === 0 ? "Aujourd'hui !" : ev.daysUntil === 1 ? "Demain" : `${ev.daysUntil}j`}
                  </p>
                  <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {formatGregorian(ev.gregorianDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raccourcis */}
      <div>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Accès rapide
        </p>
        <div className="grid grid-cols-5 gap-2">
          {SHORTCUTS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl border py-4 transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37" }}>
                <Icon size={18} />
              </div>
              <p className="text-xs opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
