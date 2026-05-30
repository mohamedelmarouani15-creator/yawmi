"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Moon, BookOpen, RotateCcw, Users, Settings, Star, Sun, CheckCircle2 } from "lucide-react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useSettings }    from "@/hooks/useSettings";
import { useAuth }        from "@/hooks/useAuth";
import { PRAYER_LABELS }  from "@/lib/prayer";
import { storage, todayKey } from "@/lib/storage";
import { getHijriDate, formatHijri } from "@/lib/hijri";
import { getUpcomingEvents, formatGregorian } from "@/lib/islamic-events";
import { useEffect, useState } from "react";
import { pageVariants, itemVariants, tapScale, springTap } from "@/lib/motion";
import type { ComputedPrayerTimes } from "@/lib/prayer";
import type { MosqueStage } from "@/components/MosqueIsometrique";
import dynamic from "next/dynamic";
const MosqueIsometrique = dynamic(() => import("@/components/MosqueIsometrique"), { ssr: false });

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
  return DAILY_DHIKRS[new Date().getDay() % DAILY_DHIKRS.length];
}

function getTodayStats() {
  const log    = storage.getDhikrLog().find(s => s.date === todayKey());
  const tasks  = storage.getTasks();
  const done   = tasks.filter(t => t.done).length;
  const totalDhikr = Object.values(log?.counts ?? {}).reduce((a, b) => a + b, 0);
  return { totalDhikr, tasksDone: done, tasksTotal: tasks.length };
}

function getAzkarStatus(times: ComputedPrayerTimes | null) {
  const now  = new Date();
  const key  = todayKey();

  const matinCount = (() => {
    try { const c = JSON.parse(localStorage.getItem(`azkar_matin_${key}`) ?? "{}"); return Object.keys(c).length; } catch { return 0; }
  })();
  const soirCount = (() => {
    try { const c = JSON.parse(localStorage.getItem(`azkar_soir_${key}`) ?? "{}"); return Object.keys(c).length; } catch { return 0; }
  })();

  const matinDone = matinCount >= 12;
  const soirDone  = soirCount  >= 11;

  if (!times) return { showMatin: true, showSoir: false, matinDone, soirDone };

  const fajr    = times["fajr"]?.getTime()    ?? 0;
  const dhuhr   = times["dhuhr"]?.getTime()   ?? 0;
  const asr     = times["asr"]?.getTime()     ?? 0;
  const t = now.getTime();

  const showMatin = t >= fajr && t < dhuhr + 3600_000;
  const showSoir  = t >= asr;
  return { showMatin, showSoir, matinDone, soirDone };
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
  const { user }     = useAuth();
  const [stats,       setStats]      = useState({ totalDhikr: 0, tasksDone: 0, tasksTotal: 0 });
  const [azkarStatus, setAzkarStatus] = useState({ showMatin: false, showSoir: false, matinDone: false, soirDone: false });
  const [mosqueData,  setMosqueData]  = useState<{ stage: MosqueStage; streak: number }>({ stage: 1, streak: 0 });
  const dhikr      = getDailyDhikr();
  const firstName  = user?.user_metadata?.display_name?.split(" ")[0] ?? null;
  const hijri      = getHijriDate();
  const upcomingEvents = getUpcomingEvents(3);

  useEffect(() => {
    setStats(getTodayStats());
    setAzkarStatus(getAzkarStatus(times));
    // Calcul stade mosquée depuis prayer log
    const log     = storage.getPrayerLog();
    const tracked = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const entry = log.find(l => l.date === key);
      if (tracked.every(k => entry?.done[k])) streak++;
      else if (i > 0) break;
    }
    const stage: MosqueStage = streak >= 30 ? 3 : streak >= 7 ? 2 : 1;
    setMosqueData({ stage, streak });
  }, [times]);

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 px-5 pt-12 pb-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Assalamu alaykum
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {firstName ? `${firstName}` : "Bienvenue"}
          </h1>
        </div>
        <motion.div whileTap={tapScale} transition={springTap}>
          <Link
            href="/profil"
            className="flex h-10 w-10 items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}
          >
            <Settings size={18} />
          </Link>
        </motion.div>
      </motion.div>

      {/* Date Hijri */}
      <motion.div
        variants={itemVariants}
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
              Jumu&apos;ah Mubarak
            </p>
          )}
        </div>
      </motion.div>

      {/* Prochaine prière */}
      {nextPrayer && times && (
        <motion.div variants={itemVariants} whileTap={{ scale: 0.985 }} transition={springTap}>
          <Link
            href="/prieres"
            className="relative block overflow-hidden rounded-2xl p-5"
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
        </motion.div>
      )}

      {/* Cartes Azkar (heure-based) */}
      {(azkarStatus.showMatin || azkarStatus.showSoir) && (
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          {azkarStatus.showMatin && (
            <Link href="/azkar">
              <motion.div whileTap={{ scale: 0.97 }} transition={springTap}
                className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
                style={{
                  background: azkarStatus.matinDone ? "rgba(5,92,63,0.15)" : "rgba(212,175,55,0.05)",
                  borderColor: azkarStatus.matinDone ? "rgba(212,175,55,0.25)" : "rgba(212,175,55,0.2)",
                }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                  style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}>
                  <Sun size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                    Azkar du matin
                  </p>
                  <p className="text-xs opacity-50 mt-0.5" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {azkarStatus.matinDone ? "Complétés — بارك الله فيك ✦" : "Après Fajr · 12 invocations"}
                  </p>
                </div>
                {azkarStatus.matinDone
                  ? <CheckCircle2 size={18} style={{ color: "#D4AF37", flexShrink: 0 }} />
                  : <span className="text-xs opacity-40 shrink-0" style={{ color: "#F8F4EC" }}>→</span>
                }
              </motion.div>
            </Link>
          )}
          {azkarStatus.showSoir && (
            <Link href="/azkar?session=soir">
              <motion.div whileTap={{ scale: 0.97 }} transition={springTap}
                className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
                style={{
                  background: azkarStatus.soirDone ? "rgba(5,92,63,0.15)" : "rgba(212,175,55,0.05)",
                  borderColor: azkarStatus.soirDone ? "rgba(212,175,55,0.25)" : "rgba(212,175,55,0.2)",
                }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                  style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}>
                  <Moon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#D4AF37", fontFamily: "var(--font-dm-sans)" }}>
                    Azkar du soir
                  </p>
                  <p className="text-xs opacity-50 mt-0.5" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {azkarStatus.soirDone ? "Complétés — بارك الله فيك ✦" : "Après Asr · 11 invocations"}
                  </p>
                </div>
                {azkarStatus.soirDone
                  ? <CheckCircle2 size={18} style={{ color: "#D4AF37", flexShrink: 0 }} />
                  : <span className="text-xs opacity-40 shrink-0" style={{ color: "#F8F4EC" }}>→</span>
                }
              </motion.div>
            </Link>
          )}
        </motion.div>
      )}

      {/* Stats du jour */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {[
          { value: stats.totalDhikr,  label: "Dhikrs aujourd'hui" },
          { value: `${stats.tasksDone}/${stats.tasksTotal}`, label: "Tâches famille" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}>
            <p className="text-2xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>{value}</p>
            <p className="mt-1 text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Mosquée isométrique */}
      <motion.div variants={itemVariants}>
        <Link href="/mosquee">
          <motion.div whileTap={{ scale: 0.985 }} transition={springTap}
            className="rounded-2xl border p-4"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.12)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                Ma mosquée
              </p>
              <span className="text-xs opacity-40" style={{ color: "#F8F4EC" }}>Voir →</span>
            </div>
            <MosqueIsometrique stage={mosqueData.stage} streak={mosqueData.streak} />
          </motion.div>
        </Link>
      </motion.div>

      {/* Dhikr du jour */}
      <motion.div
        variants={itemVariants}
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
      </motion.div>

      {/* Événements islamiques */}
      {upcomingEvents.length > 0 && (
        <motion.div variants={itemVariants}>
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
        </motion.div>
      )}

      {/* Raccourcis */}
      <motion.div variants={itemVariants}>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Accès rapide
        </p>
        <div className="grid grid-cols-5 gap-2">
          {SHORTCUTS.map(({ href, icon: Icon, label }) => (
            <motion.div key={href} whileTap={{ scale: 0.91 }} transition={springTap}>
              <Link
                href={href}
                className="flex flex-col items-center gap-2 rounded-2xl border py-4"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37" }}>
                  <Icon size={18} />
                </div>
                <p className="text-xs opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{label}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.main>
  );
}
