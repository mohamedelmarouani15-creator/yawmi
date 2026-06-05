"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useSettings }    from "@/hooks/useSettings";
import { PRAYER_LABELS, PRAYER_ORDER, formatTime, computePrayerStreak, type PrayerKey } from "@/lib/prayer";
import { storage, todayKey } from "@/lib/storage";
import { Qibla, Coordinates } from "adhan";
import Link from "next/link";
import { Settings2, Volume2, VolumeX, ChevronDown, CheckCircle2, Circle, Moon, Sun, CloudSun, Star, Sunrise, Sunset, type LucideIcon } from "lucide-react";
import { MosqueIcon, CrescentStar } from "@/components/IslamicIcons";
import { ageGroupToMode } from "@/hooks/useAgeMode";
import { pageVariants, itemVariants, springTap } from "@/lib/motion";
import { Button, Card } from "@/components/ui";
import { useT } from "@/hooks/useT";

const RECITERS = [
  { id: "alafasy",    name: "Mishary Alafasy",      src: "/audio/adhan-alafasy.mp3"    },
  { id: "abdulbasit", name: "Abdul Basit Mujawwad", src: "/audio/adhan-abdulbasit.mp3" },
  { id: "thobaity",   name: "Ali Ahmed Mulla",      src: "/audio/adhan-thobaity.mp3"   },
  { id: "husary",     name: "Mahmoud Al-Husary",    src: "/audio/adhan-husary.mp3"     },
];

const PRAYER_ICON: Record<string, LucideIcon> = {
  fajr: Moon, sunrise: Sunrise, dhuhr: Sun, asr: CloudSun, maghrib: Sunset, isha: Star,
};

function getQibla(lat: number, lng: number) {
  const coords = new Coordinates(lat, lng);
  const bearing = Qibla(coords);
  const lat1 = lat * Math.PI / 180;
  const lat2 = 21.4225 * Math.PI / 180;
  const dLat = (21.4225 - lat) * Math.PI / 180;
  const dLng = (39.8262 - lng) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return { bearing: Math.round(bearing), dist: Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))) };
}

export default function PrieresPage() {
  const { times, nextPrayer, countdown } = usePrayerTimes();
  const { settings, save } = useSettings();
  const tt = useT();
  const ageMode = ageGroupToMode(settings.ageGroup);
  const { bearing, dist } = getQibla(settings.lat, settings.lng);
  const [showReciters, setShowReciters] = useState(false);
  const [donePrayers,  setDonePrayers]  = useState<Partial<Record<string, boolean>>>({});

  useEffect(() => {
    const log = storage.getPrayerLog();
    const today = log.find(l => l.date === todayKey());
    setDonePrayers(today?.done ?? {});
  }, []);

  const togglePrayerDone = useCallback((key: string) => {
    const next = { ...donePrayers, [key]: !donePrayers[key] };
    setDonePrayers(next);
    const log = storage.getPrayerLog().filter(l => l.date !== todayKey());
    storage.savePrayerLog([...log, { date: todayKey(), done: next }]);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
  }, [donePrayers]);

  const prayerStreak = computePrayerStreak(storage.getPrayerLog());

  const reciterId   = settings.adhanReciter ?? "alafasy";
  const reciter     = RECITERS.find(r => r.id === reciterId) ?? RECITERS[0];
  const prayerModes = settings.prayerModes ?? {};

  function togglePrayerMode(key: string) {
    const current = prayerModes[key] ?? "audio";
    save({ ...settings, prayerModes: { ...prayerModes, [key]: current === "audio" ? "silencieux" : "audio" } });
  }

  function selectReciter(id: string) {
    save({ ...settings, adhanReciter: id });
    setShowReciters(false);
  }

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 px-5 pt-12 pb-4"
    >
      {/* Header — mascotte kids */}
      {ageMode === "kids" ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 py-1">
          <MosqueIcon size={44} style={{ color: "var(--gold)" }} />
          <h1 className="text-xl font-bold text-center" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
            {tt("prieres.kids.title")}
          </h1>
          <p className="text-xs opacity-50 text-center" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {settings.cityName} · {prayerStreak > 0 ? `${prayerStreak} jour${prayerStreak > 1 ? "s" : ""} de suite !` : tt("prieres.kids.check")}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {tt("prieres.label")}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <MosqueIcon size={22} style={{ color: "var(--gold)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                {tt("prieres.title")}
              </h1>
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.94 }} transition={springTap}>
            <Link href="/profil"
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
              style={{ borderColor: "rgba(212,175,55,0.3)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              <Settings2 size={12} /> {settings.cityName}
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* Hero prochaine prière */}
      <motion.div variants={itemVariants}>
        {nextPrayer && times ? (
          <div className="relative overflow-hidden rounded-2xl p-5 text-center mihrab-card"
            style={{ background: "var(--gradient-primary)", boxShadow: "0 8px 32px rgba(5,92,63,0.3)" }}>
            <div className="pointer-events-none absolute right-4 top-4 opacity-15">
              <CrescentStar size={56} style={{ color: "var(--gold)" }} />
            </div>
            <p className="text-xs tracking-widest uppercase opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {tt("prieres.nextPrayer")}
            </p>
            {ageMode === "kids" && (() => { const Icon = PRAYER_ICON[nextPrayer]; return Icon ? <Icon size={32} className="mt-1" style={{ color: "var(--gold)" }} /> : null; })()}
            <p className="mt-1 text-4xl font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
              {PRAYER_LABELS[nextPrayer].fr}
            </p>
            {ageMode !== "kids" && (
              <p className="mt-0.5 text-sm opacity-60" style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)" }}>
                {PRAYER_LABELS[nextPrayer].ar}
              </p>
            )}
            <p className="mt-2 text-3xl font-semibold tabular-nums" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {formatTime(times[nextPrayer])}
            </p>
            <p className="mt-1 text-sm opacity-60" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              dans {countdown}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-sm opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Toutes les prières du jour sont passées.
            </p>
          </div>
        )}
      </motion.div>

      {/* Adhan + récitateur — masqué pour kids et elder */}
      {ageMode !== "kids" && ageMode !== "elder" && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3 rounded-2xl border px-5 py-4"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--gold-faint)" }}>
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Adhan · الأذان
            </p>
            <Button variant="ghost-gold" size="sm" icon={<ChevronDown size={11} />} onClick={() => setShowReciters(v => !v)}>
              {reciter.name}
            </Button>
          </div>
          <AnimatePresence>
            {showReciters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.25 }}
                className="flex flex-col gap-1.5 overflow-hidden"
              >
                {RECITERS.map(r => (
                  <motion.button key={r.id} onClick={() => selectReciter(r.id)}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-between rounded-xl border px-4 py-2.5 text-left"
                    style={{
                      background: reciterId === r.id ? "var(--bg-primary)" : "rgba(255,255,255,0.02)",
                      borderColor: reciterId === r.id ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                    }}>
                    <span className="text-sm" style={{ color: reciterId === r.id ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                      {r.name}
                    </span>
                    {reciterId === r.id && <span style={{ color: "var(--gold)" }}>✓</span>}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <audio key={reciter.src} src={reciter.src} controls playsInline preload="auto"
            className="w-full" style={{ height: 36, borderRadius: 10 }} />
        </motion.div>
      )}

      {/* Liste des prières */}
      <motion.div variants={itemVariants}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {ageMode === "kids" ? tt("prieres.kids.check") : tt("prieres.label")}
          </p>
          {prayerStreak > 0 && ageMode !== "kids" && (
            <span className="text-xs font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              ✦ {prayerStreak} jour{prayerStreak > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {PRAYER_ORDER.map((key: PrayerKey, idx) => {
            if (!times) return null;
            const isPast  = times[key] < new Date();
            const isNext  = key === nextPrayer;
            const mode    = prayerModes[key] ?? "audio";
            const isAudio = mode === "audio";

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.32, delay: idx * 0.045 }}
                className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                style={{
                  background: isNext ? "rgba(5,92,63,0.2)" : donePrayers[key] ? "rgba(5,92,63,0.08)" : "rgba(255,255,255,0.02)",
                  borderColor: isNext ? "rgba(212,175,55,0.3)" : donePrayers[key] ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.06)",
                }}>
                {/* Indicateur : icône pour kids, dot sinon */}
                {ageMode === "kids" ? (() => { const Icon = PRAYER_ICON[key]; return Icon ? <Icon size={18} style={{ color: "var(--gold)", flexShrink: 0 }} /> : null; })() : (
                  <div className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: isPast ? "var(--primary)" : isNext ? "var(--gold)" : "rgba(255,255,255,0.15)" }} />
                )}

                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: isNext ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {PRAYER_LABELS[key].fr}
                  </p>
                  {ageMode !== "kids" && (
                    <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-amiri)" }}>
                      {PRAYER_LABELS[key].ar}
                    </p>
                  )}
                </div>

                <p className="text-sm font-semibold tabular-nums"
                  style={{
                    color: isPast && !donePrayers[key] ? "var(--text-dim)" : "var(--text)",
                    fontFamily: "var(--font-dm-sans)",
                    textDecoration: isPast && !donePrayers[key] && ageMode !== "kids" ? "line-through" : "none",
                  }}>
                  {formatTime(times[key])}
                </p>

                {/* Cochage fait/pas fait */}
                {key !== "sunrise" && (
                  <motion.button
                    onClick={() => togglePrayerDone(key)}
                    whileTap={{ scale: 0.85 }}
                    transition={springTap}
                    style={{ color: donePrayers[key] ? "var(--gold)" : "rgba(255,255,255,0.2)" }}>
                    {donePrayers[key] ? <CheckCircle2 size={ageMode === "kids" ? 26 : 20} /> : <Circle size={ageMode === "kids" ? 26 : 20} />}
                  </motion.button>
                )}

                {/* Toggle son — masqué pour kids et elder */}
                {ageMode !== "kids" && ageMode !== "elder" && (
                  <motion.button
                    onClick={() => togglePrayerMode(key)}
                    whileTap={{ scale: 0.85 }}
                    transition={springTap}
                    className="flex h-7 w-7 items-center justify-center rounded-full border"
                    style={{
                      borderColor: isAudio ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.1)",
                      background:  isAudio ? "var(--gold-faint)" : "transparent",
                      color:       isAudio ? "var(--gold)" : "rgba(248,244,236,0.25)",
                    }}>
                    {isAudio ? <Volume2 size={12} /> : <VolumeX size={12} />}
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Calendrier mensuel — masqué pour kids */}
      {ageMode !== "kids" && (
        <motion.div variants={itemVariants}>
          <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Ce mois-ci · pratique privée
          </p>
          <div className="rounded-2xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.1)" }}>
            {(() => {
              const log   = storage.getPrayerLog();
              const now   = new Date();
              const year  = now.getFullYear();
              const month = now.getMonth();
              const tracked = PRAYER_ORDER.filter(k => k !== "sunrise");
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const firstDow    = new Date(year, month, 1).getDay();
              const pad = firstDow === 0 ? 6 : firstDow - 1;
              const DAY_LABELS = ["L","M","M","J","V","S","D"];
              return (
                <div>
                  <div className="grid grid-cols-7 mb-1">
                    {DAY_LABELS.map((d, i) => (
                      <div key={i} className="text-center text-xs pb-1 opacity-30"
                        style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: pad }).map((_, i) => <div key={`p${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const entry   = log.find(l => l.date === dateKey);
                      const isToday = dateKey === todayKey();
                      const isFuture = new Date(year, month, day) > now;
                      const allDone = !isFuture && !!entry && tracked.every(k => entry.done[k]);
                      const someDone = !isFuture && !!entry && tracked.some(k => entry.done[k]);
                      return (
                        <div key={day} className="flex flex-col items-center gap-0.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium"
                            style={{
                              background: allDone  ? "var(--primary)"
                                        : someDone ? "rgba(5,92,63,0.3)"
                                        : isToday  ? "rgba(212,175,55,0.15)"
                                        : "transparent",
                              border: isToday ? "1px solid rgba(212,175,55,0.5)" : "none",
                              color: allDone ? "var(--text)" : isToday ? "var(--gold)" : isFuture ? "rgba(248,244,236,0.2)" : "var(--text-muted)",
                              fontFamily: "var(--font-dm-sans)",
                            }}>
                            {day}
                          </div>
                          {allDone && <div className="h-1 w-1 rounded-full" style={{ background: "var(--gold)" }} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full" style={{ background: "var(--primary)" }} />
                      <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>5 prières</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full" style={{ background: "rgba(5,92,63,0.3)" }} />
                      <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Partiel</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Qibla */}
      <motion.div variants={itemVariants} whileTap={{ scale: 0.985 }} transition={springTap}>
        <Link href="/qibla"
          className="relative flex items-center justify-between overflow-hidden rounded-2xl border p-5"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.15)" }}>
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--gold), transparent)" }} />
          <div className="flex flex-col gap-1">
            <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {ageMode === "kids" ? tt("prieres.qiblaKids") : tt("prieres.qibla")}
            </p>
            <p className="text-3xl font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
              {bearing}°
            </p>
            <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {dist.toLocaleString("fr-FR")} km de La Mecque
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="30" fill="none" stroke="var(--border-gold)" strokeWidth="1" />
              <g transform={`rotate(${bearing}, 32, 32)`}>
                <polygon points="32,6 37,30 32,26 27,30" fill="var(--gold)" />
                <polygon points="32,58 27,34 32,38 37,34" fill="rgba(212,175,55,0.25)" />
              </g>
              <circle cx="32" cy="32" r="3" fill="var(--gold)" />
            </svg>
            <p className="text-xs font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              Ouvrir →
            </p>
          </div>
        </Link>
      </motion.div>
    </motion.main>
  );
}
