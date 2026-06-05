"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Moon, BookOpen, Users, Settings, Sun, CheckCircle2, Compass, Star, Palmtree, ScrollText } from "lucide-react";
import type React from "react";
import { CrescentStar, TasbihIcon, Star8 } from "@/components/IslamicIcons";
import { ageGroupToMode } from "@/hooks/useAgeMode";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useSettings }    from "@/hooks/useSettings";
import { useT }           from "@/hooks/useT";
import { useAuth }        from "@/hooks/useAuth";
import { PRAYER_LABELS, computePrayerStreak }  from "@/lib/prayer";
import { storage, todayKey } from "@/lib/storage";
import { getHijriDate, formatHijri } from "@/lib/hijri";
import { getUpcomingEvents, formatGregorian } from "@/lib/islamic-events";
import { useEffect, useState } from "react";
import { pageVariants, itemVariants, tapScale, springTap } from "@/lib/motion";
import { Card } from "@/components/ui";
import type { ComputedPrayerTimes } from "@/lib/prayer";
import type { MosqueStage } from "@/components/MosqueIsometrique";
import dynamic from "next/dynamic";
const MosqueIsometrique = dynamic(() => import("@/components/MosqueIsometrique"), { ssr: false });
import { EventBanner } from "@/components/EventBanner";
import { HadithCard } from "@/components/HadithCard";
import { AnimatePresence, motion as m2 } from "framer-motion";
import { useContextualMessage } from "@/hooks/useContextualMessage";
import { useMosqueeGameLink } from "@/hooks/useMosqueeGameLink";

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

const DAILY_ARABIC_WORDS = [
  { ar: "صَبْر",     transliteration: "Sabr",     fr: "Patience",           category: "vertu" },
  { ar: "شُكْر",    transliteration: "Shukr",    fr: "Gratitude",          category: "vertu" },
  { ar: "تَوَكُّل", transliteration: "Tawakkul", fr: "Confiance en Allah", category: "foi"   },
  { ar: "إِخْلَاص", transliteration: "Ikhlas",   fr: "Sincérité",          category: "foi"   },
  { ar: "رَحْمَة",  transliteration: "Rahma",    fr: "Miséricorde",        category: "attribut" },
  { ar: "نُور",     transliteration: "Nour",     fr: "Lumière",            category: "concept" },
  { ar: "هُدَى",    transliteration: "Huda",     fr: "Guidance",           category: "foi"   },
];

function getDailyArabicWord() {
  return DAILY_ARABIC_WORDS[new Date().getDay() % DAILY_ARABIC_WORDS.length];
}

function getTodayStats() {
  const log    = storage.getDhikrLog().find(s => s.date === todayKey());
  const tasks  = storage.getTasks();
  const done   = tasks.filter(t => t.done).length;
  const totalDhikr = Object.values(log?.counts ?? {}).reduce((a, b) => a + b, 0);
  const prayerLog  = storage.getPrayerLog();
  const todayEntry = prayerLog.find(l => l.date === todayKey());
  const tracked    = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const prayersDoneToday = todayEntry
    ? tracked.filter(k => todayEntry.done[k as keyof typeof todayEntry.done]).length
    : 0;
  return { totalDhikr, tasksDone: done, tasksTotal: tasks.length, prayersDoneToday };
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

type ShortcutDef = { href: string; icon: React.ComponentType<{ size?: number }>; labelKey: string };

const SHORTCUTS: ShortcutDef[] = [
  { href: "/prieres", icon: CrescentStar, labelKey: "nav.prayers" },
  { href: "/coran",   icon: BookOpen,     labelKey: "nav.quran"   },
  { href: "/dhikr",   icon: TasbihIcon,   labelKey: "nav.dhikr"   },
  { href: "/azkar",   icon: Star8,        labelKey: "nav.dhikr"   },
  { href: "/famille", icon: Users,        labelKey: "nav.family"  },
];

const SHORTCUTS_KIDS: ShortcutDef[] = [
  { href: "/oasis",   icon: Compass,      labelKey: "nav.play"    },
  { href: "/coran",   icon: BookOpen,     labelKey: "nav.quran"   },
  { href: "/dhikr",   icon: TasbihIcon,   labelKey: "nav.dhikr"   },
  { href: "/azkar",   icon: Star8,        labelKey: "nav.dhikr"   },
];

const SHORTCUTS_ELDER: ShortcutDef[] = [
  { href: "/prieres", icon: CrescentStar, labelKey: "nav.prayers" },
  { href: "/coran",   icon: BookOpen,     labelKey: "nav.quran"   },
  { href: "/dhikr",   icon: TasbihIcon,   labelKey: "nav.dhikr"   },
];

export default function AccueilPage() {
  const { times, nextPrayer, countdown } = usePrayerTimes();
  const { settings } = useSettings();
  const { user }     = useAuth();
  const tt           = useT();
  const { message: ctxMsg, dismiss: dismissCtx } = useContextualMessage();
  useMosqueeGameLink(); // Connexion mosquée ↔ jeu : octroie les récompenses de streak
  const [stats,       setStats]      = useState({ totalDhikr: 0, tasksDone: 0, tasksTotal: 0, prayersDoneToday: 0 });
  const [azkarStatus, setAzkarStatus] = useState({ showMatin: false, showSoir: false, matinDone: false, soirDone: false });
  const [mosqueData,  setMosqueData]  = useState<{ stage: MosqueStage; streak: number }>({ stage: 1, streak: 0 });
  const ageMode       = ageGroupToMode(settings.ageGroup);
  const isPratiquant  = (settings.appMode ?? "pratiquant") === "pratiquant";
  const mainObjective = settings.mainObjective;
  const dhikr         = getDailyDhikr();
  const arabicWord    = getDailyArabicWord();
  const firstName  = user?.user_metadata?.display_name?.split(" ")[0] ?? null;
  const hijri      = getHijriDate();
  const upcomingEvents = getUpcomingEvents(3);

  useEffect(() => {
    setStats(getTodayStats());
    setAzkarStatus(getAzkarStatus(times));
    // Calcul stade mosquée depuis prayer log
    const streak = computePrayerStreak(storage.getPrayerLog());
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
      {/* Mascotte enfants */}
      {ageMode === "kids" && (
        <motion.div variants={itemVariants} className="relative flex flex-col items-center gap-3 py-2">
          <Link
            href="/profil"
            className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border opacity-30"
            style={{ borderColor: "rgba(212,175,55,0.3)", color: "var(--text)" }}
            aria-label="Paramètres"
          >
            <Settings size={14} />
          </Link>
          <motion.span
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 1.8, delay: 0.5, ease: "easeInOut" }}
            style={{ display: "inline-block", color: "var(--gold)" }}
          >
            <Star size={52} />
          </motion.span>
          <p className="text-xl font-bold text-center" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
            Salam {firstName ?? "petit(e)"} !
          </p>
          <p className="text-sm opacity-60 text-center" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Qu&apos;est-ce qu&apos;on apprend aujourd&apos;hui ?
          </p>
        </motion.div>
      )}

      {ageMode !== "kids" && <EventBanner />}

      <AnimatePresence>
        {ctxMsg && ageMode !== "kids" && (
          <m2.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mx-4 mt-2 rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{
              background: "rgba(212,175,55,0.07)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <ScrollText size={18} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 1 }} />
            <p className="flex-1 text-sm leading-relaxed"
              style={{ color: "rgba(248,244,236,0.75)", fontFamily: "var(--font-dm-sans)" }}>
              {ctxMsg.text}
            </p>
            <button
              onClick={dismissCtx}
              style={{ color: "var(--text-dim)", fontSize: 16, flexShrink: 0, marginTop: 1 }}
              aria-label="Fermer"
            >
              ✕
            </button>
          </m2.div>
        )}
      </AnimatePresence>

      {ageMode !== "kids" && (
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {tt("common.greeting")}
            </p>
            <h1 className="mt-1 text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {firstName ?? tt("common.welcome")}
            </h1>
          </div>
          <motion.div whileTap={tapScale} transition={springTap}>
            <Link
              href="/profil"
              className="flex h-10 w-10 items-center justify-center rounded-full border"
              style={{ borderColor: "rgba(212,175,55,0.3)", color: "var(--gold)" }}
            >
              <Settings size={18} />
            </Link>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between rounded-xl border px-4 py-3"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}
      >
        <div>
          <p className="text-xs opacity-40 tracking-widest uppercase" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {tt("accueil.calendar")}
          </p>
          <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {hijri.monthFr} {hijri.year} H
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)" }}>
            {formatHijri(hijri)}
          </p>
          {hijri.isRamadan && (
            <p className="text-xs mt-0.5" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              ✦ Ramadan Mubarak
            </p>
          )}
          {hijri.isJumua && !hijri.isRamadan && (
            <p className="text-xs mt-0.5 opacity-60" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              Jumu&apos;ah Mubarak
            </p>
          )}
        </div>
      </motion.div>

      {/* ── EXPLORATEUR : CTA jeu en tête ── */}
      {!isPratiquant && ageMode !== "kids" && ageMode !== "elder" && (
        <motion.div variants={itemVariants}>
          <Link href="/oasis">
            <motion.div
              whileTap={{ scale: 0.97 }} transition={springTap}
              className="relative overflow-hidden rounded-2xl p-5"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
            >
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                <Compass size={72} style={{ color: "var(--gold)" }} />
              </div>
              <p className="text-xs tracking-widest uppercase opacity-60 mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                L&apos;Oasis
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
                Explore &amp; apprends
              </p>
              <p className="text-sm opacity-60 mt-1" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Quiz, histoires et escape games islamiques
              </p>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* ── EXPLORATEUR : carte Grande Histoire ── */}
      {!isPratiquant && ageMode !== "kids" && ageMode !== "elder" && (
        <motion.div variants={itemVariants}>
          <Link href="/histoire">
            <motion.div
              whileTap={{ scale: 0.985 }} transition={springTap}
              className="flex items-center gap-4 rounded-2xl border px-4 py-4"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--gold-faint)" }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                style={{ background: "var(--gold-faint)", color: "var(--gold)" }}>
                <BookOpen size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                  La Grande Histoire
                </p>
                <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Aventures dans l&apos;histoire islamique
                </p>
              </div>
              <span className="text-xs opacity-40 shrink-0" style={{ color: "var(--text)" }}>→</span>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* ── PRATIQUANT : carte prière grande avec streak ── */}
      {isPratiquant && nextPrayer && times && (
        <motion.div variants={itemVariants} whileTap={{ scale: 0.985 }} transition={springTap}>
          <Link
            href="/prieres"
            className="relative block overflow-hidden rounded-2xl p-5"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 8px 32px rgba(5,92,63,0.3)",
            }}
          >
            <div className="pointer-events-none absolute right-4 top-4 opacity-15">
              <CrescentStar size={52} style={{ color: "var(--gold)" }} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-widest uppercase opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {tt("accueil.nextPrayer")} · {settings.cityName}
                </p>
                <p className="mt-1 text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
                  {PRAYER_LABELS[nextPrayer].fr}
                  <span className="ml-2 text-base opacity-50" style={{ fontFamily: "var(--font-amiri)" }}>
                    {PRAYER_LABELS[nextPrayer].ar}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                  {countdown}
                </p>
                <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  restant
                </p>
              </div>
            </div>
            {mosqueData.streak > 0 && (
              <div className="mt-3 pt-3 flex items-center gap-2 border-t" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
                <CrescentStar size={12} style={{ color: "var(--gold)", opacity: 0.7 }} />
                <p className="text-xs opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {mosqueData.streak} jour{mosqueData.streak > 1 ? "s" : ""} de prières complètes
                </p>
              </div>
            )}
          </Link>
        </motion.div>
      )}

      {/* ── EXPLORATEUR : carte prière compacte ── */}
      {!isPratiquant && nextPrayer && times && (
        <motion.div variants={itemVariants} whileTap={{ scale: 0.985 }} transition={springTap}>
          <Link
            href="/prieres"
            className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
            style={{ background: "rgba(5,92,63,0.12)", borderColor: "rgba(5,92,63,0.3)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{ background: "rgba(5,92,63,0.2)", color: "var(--gold)" }}>
              <CrescentStar size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                {PRAYER_LABELS[nextPrayer].fr}
                <span className="ml-2 text-xs opacity-50" style={{ fontFamily: "var(--font-amiri)" }}>
                  {PRAYER_LABELS[nextPrayer].ar}
                </span>
              </p>
              <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {countdown} restant · {settings.cityName}
              </p>
            </div>
            <span className="text-xs opacity-40 shrink-0" style={{ color: "var(--text)" }}>→</span>
          </Link>
        </motion.div>
      )}

      {/* CTA jeu enfants */}
      {ageMode === "kids" && (
        <motion.div variants={itemVariants}>
          <Link href="/oasis">
            <motion.div
              whileTap={{ scale: 0.97 }} transition={springTap}
              className="flex items-center justify-between rounded-2xl p-5"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
            >
              <div>
                <p className="text-base font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
                  L&apos;Oasis t&apos;attend !
                </p>
                <p className="text-xs opacity-70 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Apprends l&apos;islam en jouant
                </p>
              </div>
              <Palmtree size={38} style={{ color: "var(--gold)" }} />
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* Azkar — time-based, toujours visible */}
      {(azkarStatus.showMatin || azkarStatus.showSoir) && (
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          {azkarStatus.showMatin && (
            <Link href="/azkar">
              <motion.div whileTap={{ scale: 0.97 }} transition={springTap}
                className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
                style={{
                  background: azkarStatus.matinDone ? "rgba(5,92,63,0.15)" : "rgba(212,175,55,0.05)",
                  borderColor: azkarStatus.matinDone ? "rgba(212,175,55,0.25)" : "var(--border-gold)",
                }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                  style={{ background: "var(--gold-faint)", color: "var(--gold)" }}>
                  <Sun size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                    {tt("accueil.azkarMorning")}
                  </p>
                  <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {azkarStatus.matinDone ? tt("accueil.azkarDone") : tt("accueil.azkarMorningPending")}
                  </p>
                </div>
                {azkarStatus.matinDone
                  ? <CheckCircle2 size={18} style={{ color: "var(--gold)", flexShrink: 0 }} />
                  : <span className="text-xs opacity-40 shrink-0" style={{ color: "var(--text)" }}>→</span>
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
                  borderColor: azkarStatus.soirDone ? "rgba(212,175,55,0.25)" : "var(--border-gold)",
                }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                  style={{ background: "var(--gold-faint)", color: "var(--gold)" }}>
                  <Moon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                    {tt("accueil.azkarEvening")}
                  </p>
                  <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {azkarStatus.soirDone ? tt("accueil.azkarDone") : tt("accueil.azkarEveningPending")}
                  </p>
                </div>
                {azkarStatus.soirDone
                  ? <CheckCircle2 size={18} style={{ color: "var(--gold)", flexShrink: 0 }} />
                  : <span className="text-xs opacity-40 shrink-0" style={{ color: "var(--text)" }}>→</span>
                }
              </motion.div>
            </Link>
          )}
        </motion.div>
      )}

      {/* ── OBJECTIF : apprendre — mot arabe + histoire ── */}
      {mainObjective === "apprendre" && ageMode !== "kids" && ageMode !== "elder" && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Pour apprendre aujourd&apos;hui
          </p>

          {/* Mot arabe du jour */}
          <div
            className="rounded-2xl border p-4"
            style={{ background: "rgba(212,175,55,0.05)", borderColor: "var(--border-gold)" }}
          >
            <p className="text-xs opacity-50 mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Mot arabe du jour · {arabicWord.category}
            </p>
            <p className="text-3xl font-bold leading-loose" style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)", direction: "rtl", textAlign: "right" }}>
              {arabicWord.ar}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {arabicWord.fr}
            </p>
            <p className="text-xs opacity-40 mt-0.5 italic" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {arabicWord.transliteration}
            </p>
          </div>

          {/* Suggestion chapitre Grande Histoire */}
          <Link href="/histoire">
            <motion.div
              whileTap={{ scale: 0.985 }} transition={springTap}
              className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                style={{ background: "var(--gold-faint)", color: "var(--gold)" }}>
                <ScrollText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Reprends la Grande Histoire
                </p>
                <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Chapitre suivant disponible
                </p>
              </div>
              <span className="text-xs opacity-40 shrink-0" style={{ color: "var(--text)" }}>→</span>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* ── OBJECTIF : pratiquer — streak + compteur prières ── */}
      {mainObjective === "pratiquer" && ageMode !== "kids" && ageMode !== "elder" && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Ta pratique du jour
          </p>

          {/* Streak + prières en grande carte */}
          <Link href="/prieres">
            <motion.div
              whileTap={{ scale: 0.985 }} transition={springTap}
              className="rounded-2xl border p-4"
              style={{ background: "rgba(5,92,63,0.12)", borderColor: "rgba(5,92,63,0.3)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-50 mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    Prières accomplis aujourd&apos;hui
                  </p>
                  <p className="text-3xl font-bold tabular-nums" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
                    {stats.prayersDoneToday}
                    <span className="text-base opacity-40 ml-1">/5</span>
                  </p>
                </div>
                {mosqueData.streak > 0 && (
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
                      {mosqueData.streak}
                    </p>
                    <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                      jour{mosqueData.streak > 1 ? "s" : ""} de suite
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((p, i) => {
                  const keys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
                  const prayerLog = storage.getPrayerLog();
                  const todayEntry = prayerLog.find(l => l.date === todayKey());
                  const done = todayEntry?.done[keys[i] as keyof typeof todayEntry.done] ?? false;
                  return (
                    <div key={p} className="flex-1 rounded-lg py-1 text-center text-xs"
                      style={{
                        background: done ? "rgba(5,92,63,0.4)" : "rgba(255,255,255,0.04)",
                        color: done ? "var(--gold)" : "var(--text-muted)",
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "10px",
                      }}>
                      {p}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </Link>

          {/* Dhikr count */}
          {stats.totalDhikr > 0 && (
            <div className="flex items-center gap-3 rounded-xl border px-4 py-3"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}>
              <TasbihIcon size={16} style={{ color: "var(--gold)", opacity: 0.7, flexShrink: 0 }} />
              <p className="text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                <span className="font-bold" style={{ color: "var(--gold)" }}>{stats.totalDhikr}</span>
                <span className="opacity-50 ml-1">dhikrs aujourd&apos;hui</span>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── OBJECTIF : explorer — défi famille + toutes sections ── */}
      {mainObjective === "explorer" && ageMode !== "kids" && ageMode !== "elder" && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Explore aujourd&apos;hui
          </p>

          {/* Défi du jour famille */}
          <Link href="/famille">
            <motion.div
              whileTap={{ scale: 0.985 }} transition={springTap}
              className="flex items-center gap-4 rounded-2xl border px-4 py-4"
              style={{ background: "rgba(212,175,55,0.05)", borderColor: "var(--border-gold)" }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                style={{ background: "var(--gold-faint)", color: "var(--gold)" }}>
                <Users size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                  Défi du jour en famille
                </p>
                <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Quiz, duels et tâches partagées
                </p>
              </div>
              <span className="text-xs opacity-40 shrink-0" style={{ color: "var(--text)" }}>→</span>
            </motion.div>
          </Link>

          {/* Grille toutes sections */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: "/oasis",   label: "Jouer",    icon: Compass  },
              { href: "/histoire", label: "Histoire", icon: ScrollText },
              { href: "/coran",   label: "Coran",    icon: BookOpen  },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <motion.div
                  whileTap={{ scale: 0.93 }} transition={springTap}
                  className="flex flex-col items-center gap-2 rounded-2xl border py-4"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: "var(--gold-faint)", color: "var(--gold)" }}>
                    <Icon size={16} />
                  </div>
                  <p className="text-xs opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{label}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── PRATIQUANT : stats du jour + mosquée ── */}
      {isPratiquant && ageMode !== "elder" && ageMode !== "kids" && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          {[
            { value: stats.totalDhikr, label: tt("accueil.dhikrsToday") },
            { value: `${stats.tasksDone}/${stats.tasksTotal}`, label: tt("accueil.familyTasks") },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>{value}</p>
              <p className="mt-1 text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {isPratiquant && ageMode !== "elder" && ageMode !== "kids" && (
        <motion.div variants={itemVariants}>
          <Link href="/mosquee">
            <motion.div whileTap={{ scale: 0.985 }} transition={springTap}
              className="rounded-2xl border p-4"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--gold-faint)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Ma mosquée
                </p>
                <span className="text-xs opacity-40" style={{ color: "var(--text)" }}>Voir →</span>
              </div>
              <MosqueIsometrique stage={mosqueData.stage} streak={mosqueData.streak} />
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* Hadith du jour — commun (non enfants, non elder) */}
      {ageMode !== "kids" && ageMode !== "elder" && (
        <HadithCard showArabic showLearnMore={false} />
      )}

      {/* Dhikr du jour — commun */}
      <motion.div variants={itemVariants}>
      <Card variant="gold" padding="lg">
        <div className="flex items-center gap-2">
          <TasbihIcon size={14} style={{ color: "var(--gold)", opacity: 0.55 }} />
          <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Dhikr du jour
          </p>
        </div>
        <p className="mt-3 text-xl font-bold leading-loose text-right" style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
          {dhikr.ar}
        </p>
        <p className="mt-1 text-sm opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {dhikr.fr}
        </p>
      </Card>
      </motion.div>

      {/* Événements islamiques — commun */}
      {ageMode !== "elder" && ageMode !== "kids" && upcomingEvents.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Prochains événements
          </p>
          <div className="flex flex-col gap-2">
            {upcomingEvents.map(ev => (
              <div key={ev.name} className="flex items-center justify-between rounded-xl border px-4 py-3"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{ev.name}</p>
                  <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{ev.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                    {ev.daysUntil === 0 ? "Aujourd'hui !" : ev.daysUntil === 1 ? "Demain" : `${ev.daysUntil}j`}
                  </p>
                  <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {formatGregorian(ev.gregorianDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── EXPLORATEUR : stats du jour ── */}
      {!isPratiquant && ageMode !== "elder" && ageMode !== "kids" && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          {[
            { value: stats.totalDhikr, label: tt("accueil.dhikrsToday") },
            { value: `${stats.tasksDone}/${stats.tasksTotal}`, label: tt("accueil.familyTasks") },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>{value}</p>
              <p className="mt-1 text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── FALLBACK : mainObjective null (onboarding pas complété) ── */}
      {!mainObjective && ageMode !== "kids" && ageMode !== "elder" && (
        <motion.div variants={itemVariants}>
          <Link href="/onboarding">
            <motion.div
              whileTap={{ scale: 0.985 }} transition={springTap}
              className="flex items-center gap-4 rounded-2xl border px-4 py-4"
              style={{ background: "rgba(212,175,55,0.05)", borderColor: "var(--border-gold)" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                style={{ background: "var(--gold-faint)", color: "var(--gold)" }}>
                <Star8 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                  Personnalise ton expérience
                </p>
                <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Dis-nous ce que tu veux apprendre
                </p>
              </div>
              <span className="text-xs opacity-40 shrink-0" style={{ color: "var(--text)" }}>→</span>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* ── PRATIQUANT : CTA jeu discret en bas ── */}
      {isPratiquant && ageMode !== "kids" && ageMode !== "elder" && (
        <motion.div variants={itemVariants}>
          <Link href="/oasis">
            <motion.div
              whileTap={{ scale: 0.97 }} transition={springTap}
              className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.08)" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                style={{ background: "var(--gold-faint)", color: "var(--gold)" }}>
                <Compass size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold opacity-70" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  L&apos;Oasis
                </p>
                <p className="text-xs opacity-40 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Quiz et aventures islamiques
                </p>
              </div>
              <span className="text-xs opacity-30 shrink-0" style={{ color: "var(--text)" }}>→</span>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* Raccourcis — set adapté par âge */}
      {(() => {
        const shortcuts =
          ageMode === "kids"  ? SHORTCUTS_KIDS  :
          ageMode === "elder" ? SHORTCUTS_ELDER :
          SHORTCUTS;
        const cols =
          ageMode === "elder" ? "grid-cols-3" :
          ageMode === "kids"  ? "grid-cols-4" :
          "grid-cols-5";
        return (
          <motion.div variants={itemVariants}>
            <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {tt("accueil.shortcuts")}
            </p>
            <div className={`grid ${cols} gap-2`}>
              {shortcuts.map(({ href, icon: Icon, labelKey }) => (
                <motion.div key={href} whileTap={{ scale: 0.91 }} transition={springTap}>
                  <Link
                    href={href}
                    className="flex flex-col items-center gap-2 rounded-2xl border py-4"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--border-primary)", color: "var(--gold)" }}>
                      <Icon size={18} />
                    </div>
                    <p className="text-xs opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{tt(labelKey)}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })()}
    </motion.main>
  );
}
