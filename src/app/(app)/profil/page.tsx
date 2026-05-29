"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, LogOut, Volume2, VolumeX } from "lucide-react";
import { useAuth }        from "@/hooks/useAuth";
import { useSettings }    from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { CALC_METHOD_LABELS, type CalcMethodKey } from "@/lib/prayer";
import { CITIES } from "@/lib/cities";
import { storage, todayKey } from "@/lib/storage";
import { pageVariants, itemVariants, springTap } from "@/lib/motion";

function getStats() {
  const log    = storage.getDhikrLog();
  const tasks  = storage.getTasks();
  const today  = log.find(s => s.date === todayKey());
  const total  = Object.values(today?.counts ?? {}).reduce((a, b) => a + b, 0);

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

  void total;
  return { streak, totalDhikrAll, doneTasks, totalTasks: tasks.length };
}

export default function ProfilPage() {
  const { user, signOut }   = useAuth();
  const { settings, save }  = useSettings();
  const { enabled: notifEnabled, enable: enableNotif, disable: disableNotif, permission } = useNotifications();
  const [citySearch, setCitySearch] = useState("");
  const [showCities, setShowCities] = useState(false);
  const [saved,      setSaved]      = useState(false);
  const stats = getStats();

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
      {/* Header avec infos utilisateur */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Mon compte
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
            {user?.user_metadata?.display_name ?? "Profil"}
          </h1>
          {user && (
            <p className="mt-0.5 text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              {user.email}
            </p>
          )}
        </div>
        {user && (
          <motion.button
            onClick={signOut}
            whileTap={{ scale: 0.93 }}
            transition={springTap}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
            <LogOut size={12} /> Déconnexion
          </motion.button>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {[
          { value: stats.streak,       label: "Jours\nconsécutifs" },
          { value: stats.totalDhikrAll, label: "Total\ndhikrs" },
          { value: `${stats.doneTasks}/${stats.totalTasks}`, label: "Tâches\nterminées" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center rounded-xl border py-4"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.12)" }}>
            <p className="text-xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
              {value}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-center text-xs opacity-50 leading-tight"
              style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              {label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Mode Adhan */}
      <motion.div variants={itemVariants}>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
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
                  background: active ? "rgba(5,92,63,0.25)" : "rgba(255,255,255,0.02)",
                  borderColor: active ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37" }}>
                  {mode === "audio" ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium capitalize" style={{ color: active ? "#D4AF37" : "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {mode === "audio" ? "Audio" : "Silencieux"}
                  </p>
                  <p className="text-xs opacity-40 leading-tight" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {mode === "audio" ? "Joue l'adhan" : "Sans son"}
                  </p>
                </div>
                {active && <Check size={14} className="ml-auto" style={{ color: "#D4AF37" }} />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants}>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Rappels de prières
        </p>
        <div className="flex items-center justify-between rounded-xl border px-4 py-3.5"
          style={{
            background: notifEnabled ? "rgba(5,92,63,0.2)" : "rgba(255,255,255,0.02)",
            borderColor: notifEnabled ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)",
          }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37" }}>
              {notifEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>Notifications</p>
              <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                {permission === "denied" ? "Bloquées dans les réglages" : notifEnabled ? "Actives pour les 5 prières" : "Désactivées"}
              </p>
            </div>
          </div>
          {permission !== "denied" && (
            <motion.button
              onClick={notifEnabled ? disableNotif : () => enableNotif()}
              whileTap={{ scale: 0.93 }}
              transition={springTap}
              className="rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{
                background: notifEnabled ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#055C3F,#0a8a5e)",
                color: "#F8F4EC", fontFamily: "var(--font-dm-sans)",
              }}>
              {notifEnabled ? "Désactiver" : "Activer"}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Ville */}
      <motion.div variants={itemVariants}>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Ville pour les horaires de prière
        </p>
        <motion.button
          onClick={() => setShowCities(v => !v)}
          whileTap={{ scale: 0.97 }}
          transition={springTap}
          className="flex w-full items-center justify-between rounded-xl border px-4 py-3"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(212,175,55,0.2)" }}>
          <span className="text-sm font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {settings.cityName}
          </span>
          <span className="text-xs opacity-40" style={{ color: "#F8F4EC" }}>Changer →</span>
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
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
                autoFocus />
              {filtered.map(c => (
                <motion.button key={c.name} onClick={() => selectCity(c)}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-white/5">
                  <span className="text-sm" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{c.name}</span>
                  {settings.cityName === c.name && <Check size={14} style={{ color: "#D4AF37" }} />}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Méthode de calcul */}
      <motion.div variants={itemVariants}>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
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
              <span className="text-sm" style={{ color: settings.method === key ? "#D4AF37" : "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                {label}
              </span>
              {settings.method === key && <Check size={16} style={{ color: "#D4AF37" }} />}
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
            style={{ background: "#055C3F", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            ✓ Sauvegardé
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
