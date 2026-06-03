"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, LogOut, Volume2, VolumeX, Star, Zap, Moon, Home, Crown, Sun, Sunrise, Swords, CalendarDays, Trophy, Languages, Sprout, BookOpen, PenTool, GraduationCap, type LucideIcon } from "lucide-react";
import { MosqueIcon } from "@/components/IslamicIcons";
import { useAuth }        from "@/hooks/useAuth";
import { useSettings }    from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { CALC_METHOD_LABELS, MADHAB_LABELS, computePrayerTimes, type CalcMethodKey, type MadhabKey } from "@/lib/prayer";
import { CITIES } from "@/lib/cities";
import { storage, todayKey } from "@/lib/storage";
import { pageVariants, itemVariants, springTap } from "@/lib/motion";
import { Button, Card } from "@/components/ui";

function getStats() {
  const log    = storage.getDhikrLog();
  const tasks  = storage.getTasks();
  const today  = log.find(s => s.date === todayKey());
  let streak = 0;
  const DHIKR_IDS = ["subhan", "hamdou", "akbar"];
  const TARGETS   = { subhan: 33, hamdou: 33, akbar: 34 };
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const s = log.find(x => x.date === key);
    const done = DHIKR_IDS.every(id => (s?.counts[id] ?? 0) >= (TARGETS as Record<string, number>)[id]);
    if (done) streak++;
    else if (i > 0) break;
  }

  const totalDhikrAll = log.reduce((acc, s) => acc + Object.values(s.counts).reduce((a, b) => a + b, 0), 0);
  const doneTasks = tasks.filter(t => t.done).length;

  return { streak, totalDhikrAll, doneTasks, totalTasks: tasks.length };
}

const AGE_OPTIONS = [
  { value: "4-10",  icon: <Star size={12} />,  label: "4 – 10 ans" },
  { value: "11-17", icon: <Zap size={12} />,   label: "11 – 17 ans" },
  { value: "18-35", icon: <Moon size={12} />,  label: "18 – 35 ans" },
  { value: "36-55", icon: <Home size={12} />,  label: "36 – 55 ans" },
  { value: "55+",   icon: <Crown size={12} />, label: "55 ans +" },
] as const;

export default function ProfilPage() {
  const { user, signOut }   = useAuth();
  const { settings, save }  = useSettings();
  const { permission, prefs, toggle } = useNotifications();
  const [citySearch,   setCitySearch]   = useState("");
  const [showCities,   setShowCities]   = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [notifMsg,     setNotifMsg]     = useState<string | null>(null);
  const stats = getStats();

  const displayName = user?.user_metadata?.display_name as string | undefined;
  const initial = (displayName ?? user?.email ?? "?").charAt(0).toUpperCase();

  const filtered = CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  function selectCity(c: { name: string; lat: number; lng: number }) {
    save({ ...settings, cityName: c.name, lat: c.lat, lng: c.lng });
    setCitySearch(""); setShowCities(false); flash();
  }

  function selectMethod(method: CalcMethodKey) {
    save({ ...settings, method }); flash();
  }

  function selectMadhab(madhab: MadhabKey) {
    save({ ...settings, madhab }); flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 px-5 pt-12 pb-4"
    >
      {/* Header avec avatar */}
      <motion.div variants={itemVariants} className="flex items-start gap-4">
        {/* Avatar lettre */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold"
          style={{
            background: settings.appMode === "explorateur"
              ? "linear-gradient(135deg, rgba(212,175,55,0.28), rgba(184,148,46,0.12))"
              : "linear-gradient(135deg, rgba(5,92,63,0.55), rgba(10,138,94,0.22))",
            border: settings.appMode === "explorateur"
              ? "1px solid rgba(212,175,55,0.3)"
              : "1px solid rgba(5,92,63,0.5)",
            color: settings.appMode === "explorateur" ? "var(--gold)" : "#4ade80",
            fontFamily: "var(--font-bricolage)",
          }}>
          {initial}
        </div>

        {/* Identité */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs tracking-widest uppercase opacity-40"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Mon compte
          </p>
          <h1 className="mt-0.5 text-2xl font-bold truncate"
            style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            {displayName ?? "Profil"}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {user?.email && (
              <p className="text-xs opacity-35 truncate"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {user.email}
              </p>
            )}
            {settings.ageGroup && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: "var(--gold-faint)", color: "var(--gold)", border: "1px solid rgba(212,175,55,0.2)" }}>
                {AGE_OPTIONS.find(o => o.value === settings.ageGroup)?.icon}
                {settings.ageGroup} ans
              </span>
            )}
          </div>
        </div>

        {/* Déconnexion */}
        {user && (
          <Button variant="ghost" size="sm" icon={<LogOut size={12} />} onClick={signOut}>
            Déco
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {[
          { value: stats.streak,       label: "Jours\nconsécutifs" },
          { value: stats.totalDhikrAll, label: "Total\ndhikrs" },
          { value: `${stats.doneTasks}/${stats.totalTasks}`, label: "Tâches\nterminées" },
        ].map(({ value, label }) => (
          <Card key={label} variant="gold" padding="none" className="flex flex-col items-center py-4">
            <p className="text-xl font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
              {value}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-center text-xs opacity-50 leading-tight"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {label}
            </p>
          </Card>
        ))}
      </motion.div>

      {/* ── Section Mon expérience ──────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.12)" }} />
          <p className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)", opacity: 0.7 }}>
            Mon expérience
          </p>
          <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.12)" }} />
        </div>
        <p className="mb-4 text-xs opacity-30 text-center leading-relaxed"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Ces réglages personnalisent le Compagnon IA, les contenus et l'interface.
          Aucun onboarding requis — le changement est immédiat.
        </p>
      </motion.div>

      {/* Tranche d'âge */}
      <motion.div variants={itemVariants}>
        <p className="mb-1 text-xs tracking-widest uppercase opacity-40"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Tranche d'âge
        </p>
        <p className="mb-3 text-xs opacity-30 leading-relaxed"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Personnalise le Compagnon IA et les contenus proposés
        </p>
        <div className="flex flex-wrap gap-2">
          {AGE_OPTIONS.map(opt => {
            const active = settings.ageGroup === opt.value;
            return (
              <motion.button key={opt.value}
                whileTap={{ scale: 0.94 }} transition={springTap}
                onClick={() => { save({ ...settings, ageGroup: opt.value }); flash(); }}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: active ? "rgba(5,92,63,0.28)" : "rgba(255,255,255,0.03)",
                  borderColor: active ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)",
                  color: active ? "var(--gold)" : "var(--text-muted)",
                  transition: "background 0.15s, border-color 0.15s, color 0.15s",
                  fontFamily: "var(--font-dm-sans)",
                }}>
                {opt.icon}
                {opt.label}
                {active && <Check size={10} />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Mode app */}
      <motion.div variants={itemVariants}>
        <p className="mb-1 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Mon mode
        </p>
        <p className="mb-3 text-xs opacity-30 leading-relaxed" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Change le ton et le rythme de l'app
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: "pratiquant"  as const, label: "Pratiquant",  sub: "Suivi complet, streaks, jeu" },
            { id: "explorateur" as const, label: "Explorateur", sub: "Découverte, sans pression" },
          ]).map(({ id, label, sub }) => {
            const active = (settings.appMode ?? "pratiquant") === id;
            return (
              <motion.button key={id}
                onClick={() => { save({ ...settings, appMode: id }); flash(); }}
                whileTap={{ scale: 0.95 }} transition={springTap}
                className="flex flex-col gap-1 rounded-xl border px-4 py-3.5 text-left"
                style={{
                  background: active ? "var(--bg-primary)" : "rgba(255,255,255,0.02)",
                  borderColor: active ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: active ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {label}
                  </p>
                  {active && <Check size={14} style={{ color: "var(--gold)" }} />}
                </div>
                <p className="text-xs opacity-40 leading-tight" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {sub}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Langue maternelle */}
      <motion.div variants={itemVariants}>
        <p className="mb-1 text-xs tracking-widest uppercase opacity-40"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Langue maternelle
        </p>
        <p className="mb-3 text-xs opacity-30 leading-relaxed"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Influence les explications du Compagnon et les traductions proposées
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: "français" as const, label: "Français",      sub: "Langue principale" },
            { id: "arabe"    as const, label: "Arabe",          sub: "العربية" },
            { id: "darija"   as const, label: "Darija",         sub: "Dialecte marocain / maghrébin" },
            { id: "autre"    as const, label: "Autre langue",   sub: "Non listée" },
          ] as const).map(({ id, label, sub }) => {
            const active = (settings.motherTongue ?? null) === id;
            return (
              <motion.button key={id}
                onClick={() => { save({ ...settings, motherTongue: id }); flash(); }}
                whileTap={{ scale: 0.95 }} transition={springTap}
                className="flex items-center gap-2 rounded-xl border px-4 py-3 text-left"
                style={{
                  background: active ? "var(--bg-primary)" : "rgba(255,255,255,0.02)",
                  borderColor: active ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                }}>
                <Languages size={15} style={{ color: active ? "var(--gold)" : "rgba(248,244,236,0.35)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate"
                    style={{ color: active ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {label}
                  </p>
                  <p className="text-xs opacity-40 truncate"
                    style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {sub}
                  </p>
                </div>
                {active && <Check size={13} style={{ color: "var(--gold)", flexShrink: 0 }} />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Thème d'affichage */}
      <motion.div variants={itemVariants}>
        <p className="mb-1 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Thème d&apos;affichage
        </p>
        <p className="mb-3 text-xs opacity-30 leading-relaxed" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Nuit par défaut — passe au jour manuellement ou automatiquement
        </p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "night" as const, Icon: Moon,    label: "Nuit",  sub: "Sombre" },
            { id: "day"   as const, Icon: Sun,      label: "Jour",  sub: "Clair"  },
            { id: "auto"  as const, Icon: Sunrise,  label: "Auto",  sub: "Fajr→Maghrib" },
          ] as { id: "night"|"day"|"auto"; Icon: LucideIcon; label: string; sub: string }[]).map(({ id, Icon, label, sub }) => {
            const active = (settings.themeMode ?? "night") === id;
            return (
              <motion.button key={id}
                onClick={() => {
                  const next = { ...settings, themeMode: id };
                  save(next);
                  // Applique immédiatement sans attendre le prochain tick du hook
                  if (id !== "auto") {
                    document.documentElement.dataset.theme = id;
                  } else {
                    const times = computePrayerTimes(next.lat, next.lng, next.method, next.madhab);
                    const now = new Date();
                    document.documentElement.dataset.theme =
                      now >= times.fajr && now < times.maghrib ? "day" : "night";
                  }
                  flash();
                }}
                whileTap={{ scale: 0.95 }} transition={springTap}
                className="flex flex-col items-center gap-1.5 rounded-xl border py-3.5 text-center"
                style={{
                  background: active ? "var(--bg-primary)" : "rgba(255,255,255,0.02)",
                  borderColor: active ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                }}>
                <Icon size={22} style={{ color: active ? "var(--gold)" : "var(--text-dim)" }} />
                <p className="text-xs font-semibold" style={{ color: active ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {label}
                </p>
                <p className="text-[10px] opacity-35 leading-tight" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {sub}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Niveau arabe */}
      <motion.div variants={itemVariants}>
        <p className="mb-1 text-xs tracking-widest uppercase opacity-40"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Mon niveau en arabe
        </p>
        <p className="mb-3 text-xs opacity-30 leading-relaxed"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Adapte les questions de calligraphie et les versets à ton niveau
        </p>
        <div className="flex flex-col gap-2">
          {([
            { id: "none"         as const, label: "Je ne lis pas l'arabe", sub: "Aucune question d'écriture arabe", Icon: Sprout },
            { id: "beginner"     as const, label: "Débutant",               sub: "Je connais quelques lettres",      Icon: BookOpen },
            { id: "intermediate" as const, label: "Intermédiaire",          sub: "Je lis lentement",                 Icon: PenTool },
            { id: "advanced"     as const, label: "Avancé",                 sub: "Je lis et j'écris couramment",     Icon: GraduationCap },
          ] as const).map(({ id, label, sub, Icon }) => {
            const active = (settings.arabicLevel ?? "beginner") === id;
            return (
              <motion.button key={id}
                onClick={() => { save({ ...settings, arabicLevel: id }); flash(); }}
                whileTap={{ scale: 0.97 }} transition={springTap}
                className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left"
                style={{
                  background: active ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.02)",
                  borderColor: active ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                }}>
                <Icon size={20} style={{ color: active ? "var(--gold)" : "rgba(248,244,236,0.35)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: active ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {label}
                  </p>
                  <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {sub}
                  </p>
                </div>
                {active && <Check size={14} style={{ color: "var(--gold)" }} />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Mode Adhan */}
      <motion.div variants={itemVariants}>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Mode Adhan
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["audio", "silencieux"] as const).map(mode => {
            const active = (settings.adhanMode ?? "audio") === mode;
            return (
              <motion.button
                key={mode}
                onClick={() => { save({ ...settings, adhanMode: mode }); flash(); }}
                whileTap={{ scale: 0.95 }}
                transition={springTap}
                className="flex items-center gap-3 rounded-xl border px-4 py-3.5"
                style={{
                  background: active ? "var(--bg-primary)" : "rgba(255,255,255,0.02)",
                  borderColor: active ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "var(--border-primary)", color: "var(--gold)" }}>
                  {mode === "audio" ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium capitalize" style={{ color: active ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {mode === "audio" ? "Audio" : "Silencieux"}
                  </p>
                  <p className="text-xs opacity-40 leading-tight" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {mode === "audio" ? "Joue l'adhan" : "Sans son"}
                  </p>
                </div>
                {active && <Check size={14} className="ml-auto" style={{ color: "var(--gold)" }} />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants}>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Notifications
        </p>
        <div className="flex flex-col gap-2">
          {([
            { key: "prayers" as const, Icon: MosqueIcon, label: "Rappels de prières",  sub: "Horaires des 5 prières" },
            { key: "duels"   as const, Icon: Swords,     label: "Défis famille",       sub: "Quand on te défie ou c'est ton tour" },
            { key: "daily"   as const, Icon: CalendarDays, label: "Défi du jour",      sub: "Rappel quotidien" },
          ] as { key: "prayers"|"duels"|"daily"; Icon: React.ComponentType<{size?:number;style?:React.CSSProperties}>; label: string; sub: string }[]).map(({ key, Icon, label, sub }) => {
            const active = prefs[key];
            return (
              <motion.button key={key}
                onClick={async () => {
                  const result = await toggle(key, user?.id ?? undefined);
                  if (result === "needs-standalone") setNotifMsg("📲 iOS : appuie sur Partager → « Sur l'écran d'accueil » puis relance l'app");
                  else if (result === "denied")       setNotifMsg("❌ Autorise les notifications dans Réglages → " + (key === "prayers" ? "Notifications" : "Safari / Yawmi"));
                  else if (result === "unsupported")  setNotifMsg(key === "prayers" ? "❌ Notifications non disponibles sur ce navigateur" : "📲 Pour les défis : ajoute l'app à l'écran d'accueil (iOS 16.4+) ou utilise Chrome sur Android");
                  else                                setNotifMsg(null);
                }}
                whileTap={{ scale: 0.97 }} transition={springTap}
                className="flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left"
                style={{
                  background:   active ? "rgba(5,92,63,0.2)"        : "rgba(255,255,255,0.02)",
                  borderColor:  active ? "rgba(212,175,55,0.3)"      : "rgba(255,255,255,0.06)",
                }}>
                <Icon size={20} style={{ color: active ? "var(--gold)" : "rgba(248,244,236,0.4)", flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: active ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {label}
                  </p>
                  <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {sub}
                  </p>
                </div>
                <div className="flex h-6 w-11 items-center rounded-full px-0.5"
                  style={{ background: active ? "var(--primary)" : "rgba(255,255,255,0.1)", transition: "background 0.2s" }}>
                  <div className="h-5 w-5 rounded-full"
                    style={{ background: active ? "var(--gold)" : "rgba(255,255,255,0.4)", transform: active ? "translateX(20px)" : "translateX(0)", transition: "transform 0.2s" }} />
                </div>
              </motion.button>
            );
          })}
          {notifMsg && (
            <p className="text-xs px-1 leading-relaxed" style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>
              {notifMsg}
            </p>
          )}
        </div>
      </motion.div>

      {/* Ville */}
      <motion.div variants={itemVariants}>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Ville pour les horaires de prière
        </p>
        <motion.button
          onClick={() => setShowCities(v => !v)}
          whileTap={{ scale: 0.97 }}
          transition={springTap}
          className="flex w-full items-center justify-between rounded-xl border px-4 py-3"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--border-gold)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {settings.cityName}
          </span>
          <span className="text-xs opacity-40" style={{ color: "var(--text)" }}>Changer →</span>
        </motion.button>
        <AnimatePresence>
          {showCities && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.25 }}
              className="mt-2 flex flex-col gap-1 rounded-xl border p-3 overflow-hidden"
              style={{ background: "rgba(6,26,18,0.98)", borderColor: "rgba(212,175,55,0.15)" }}>
              <input
                value={citySearch} onChange={e => setCitySearch(e.target.value)}
                placeholder="Rechercher une ville…"
                className="mb-2 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
                autoFocus />
              {filtered.map(c => (
                <motion.button key={c.name} onClick={() => selectCity(c)}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-white/5">
                  <span className="text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{c.name}</span>
                  {settings.cityName === c.name && <Check size={14} style={{ color: "var(--gold)" }} />}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Trophées link */}
      <motion.div variants={itemVariants}>
        <Link href="/profil/trophees">
          <div className="flex items-center gap-4 rounded-2xl border px-4 py-4 mb-6"
            style={{ background: "rgba(212,175,55,0.05)", borderColor: "var(--border-gold)", cursor: "pointer" }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: "var(--gold-faint)" }}>
              <Trophy size={22} style={{ color: "var(--gold)" }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
                Trophées & Achievements
              </p>
              <p className="text-xs" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                Voir ta progression et tes médailles
              </p>
            </div>
            <span style={{ color: "rgba(212,175,55,0.5)", fontSize: 18 }}>›</span>
          </div>
        </Link>
      </motion.div>

      {/* Méthode de calcul */}
      <motion.div variants={itemVariants}>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Méthode de calcul des prières
        </p>
        <div className="flex flex-col gap-2">
          {(Object.entries(CALC_METHOD_LABELS) as [CalcMethodKey, string][]).map(([key, label]) => (
            <motion.button key={key} onClick={() => selectMethod(key)}
              whileTap={{ scale: 0.97 }}
              transition={springTap}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={{
                background: settings.method === key ? "rgba(5,92,63,0.2)" : "rgba(255,255,255,0.02)",
                borderColor: settings.method === key ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)",
              }}>
              <span className="text-sm" style={{ color: settings.method === key ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {label}
              </span>
              {settings.method === key && <Check size={16} style={{ color: "var(--gold)" }} />}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* École juridique pour Asr */}
      <motion.div variants={itemVariants}>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          École juridique (calcul de Asr)
        </p>
        <div className="flex flex-col gap-2">
          {(Object.entries(MADHAB_LABELS) as [MadhabKey, string][]).map(([key, label]) => (
            <motion.button key={key} onClick={() => selectMadhab(key)}
              whileTap={{ scale: 0.97 }}
              transition={springTap}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={{
                background: (settings.madhab ?? "Shafi") === key ? "rgba(5,92,63,0.2)" : "rgba(255,255,255,0.02)",
                borderColor: (settings.madhab ?? "Shafi") === key ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)",
              }}>
              <span className="text-sm" style={{ color: (settings.madhab ?? "Shafi") === key ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {label}
              </span>
              {(settings.madhab ?? "Shafi") === key && <Check size={16} style={{ color: "var(--gold)" }} />}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Toast saved */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--primary)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            ✓ Sauvegardé
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
