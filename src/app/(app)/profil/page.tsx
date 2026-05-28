"use client";

import { useState } from "react";
import { Bell, BellOff, Check, Volume2, VolumeX } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { CALC_METHOD_LABELS, type CalcMethodKey } from "@/lib/prayer";
import { CITIES } from "@/lib/cities";
import { storage, todayKey } from "@/lib/storage";

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

  const totalSessions = log.length;
  const totalDhikrAll = log.reduce((acc, s) => acc + Object.values(s.counts).reduce((a, b) => a + b, 0), 0);
  const doneTasks = tasks.filter(t => t.done).length;

  return { streak, totalDhikrAll, totalSessions, doneTasks, totalTasks: tasks.length };
}

export default function ProfilPage() {
  const { settings, save } = useSettings();
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
    setCitySearch("");
    setShowCities(false);
    flash();
  }

  function selectMethod(method: CalcMethodKey) {
    save({ ...settings, method });
    flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="flex flex-col gap-6 px-5 pt-12 pb-4">

      <div>
        <p className="text-xs tracking-widest uppercase opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Mon compte
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          Profil
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: stats.streak,       label: "Jours\nconsécutifs" },
          { value: stats.totalDhikrAll, label: "Total\ndhikrs" },
          { value: `${stats.doneTasks}/${stats.totalTasks}`, label: "Tâches\nterminées" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl border py-4"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.12)" }}
          >
            <p className="text-xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-bricolage)" }}>
              {value}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-center text-xs opacity-50 leading-tight"
              style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Mode Adhan */}
      <div>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Mode Adhan
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["audio", "silencieux"] as const).map(mode => {
            const active = (settings.adhanMode ?? "audio") === mode;
            return (
              <button
                key={mode}
                onClick={() => { save({ ...settings, adhanMode: mode }); flash(); }}
                className="flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all"
                style={{
                  background: active ? "rgba(5,92,63,0.25)" : "rgba(255,255,255,0.02)",
                  borderColor: active ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                }}
              >
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Rappels de prières
        </p>
        <div
          className="flex items-center justify-between rounded-xl border px-4 py-3.5"
          style={{
            background: notifEnabled ? "rgba(5,92,63,0.2)" : "rgba(255,255,255,0.02)",
            borderColor: notifEnabled ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37" }}>
              {notifEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                Notifications
              </p>
              <p className="text-xs opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                {permission === "denied" ? "Bloquées dans les réglages" : notifEnabled ? "Actives pour les 5 prières" : "Désactivées"}
              </p>
            </div>
          </div>
          {permission !== "denied" && (
            <button
              onClick={notifEnabled ? disableNotif : () => enableNotif()}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all active:scale-95"
              style={{
                background: notifEnabled ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#055C3F,#0a8a5e)",
                color: "#F8F4EC", fontFamily: "var(--font-dm-sans)",
              }}
            >
              {notifEnabled ? "Désactiver" : "Activer"}
            </button>
          )}
        </div>
      </div>

      {/* Ville */}
      <div>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Ville pour les horaires de prière
        </p>
        <button
          onClick={() => setShowCities(v => !v)}
          className="flex w-full items-center justify-between rounded-xl border px-4 py-3"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(212,175,55,0.2)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            {settings.cityName}
          </span>
          <span className="text-xs opacity-40" style={{ color: "#F8F4EC" }}>Changer →</span>
        </button>

        {showCities && (
          <div
            className="mt-2 flex flex-col gap-1 rounded-xl border p-3"
            style={{ background: "rgba(6,26,18,0.98)", borderColor: "rgba(212,175,55,0.15)" }}
          >
            <input
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              placeholder="Rechercher une ville…"
              className="mb-2 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
              autoFocus
            />
            {filtered.map(c => (
              <button
                key={c.name}
                onClick={() => selectCity(c)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all hover:bg-white/5"
              >
                <span className="text-sm" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>{c.name}</span>
                {settings.cityName === c.name && <Check size={14} style={{ color: "#D4AF37" }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Méthode de calcul */}
      <div>
        <p className="mb-3 text-xs tracking-widest uppercase opacity-40" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
          Méthode de calcul des prières
        </p>
        <div className="flex flex-col gap-2">
          {(Object.entries(CALC_METHOD_LABELS) as [CalcMethodKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => selectMethod(key)}
              className="flex items-center justify-between rounded-xl border px-4 py-3 transition-all"
              style={{
                background: settings.method === key ? "rgba(5,92,63,0.2)" : "rgba(255,255,255,0.02)",
                borderColor: settings.method === key ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.06)",
              }}
            >
              <span className="text-sm" style={{ color: settings.method === key ? "#D4AF37" : "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                {label}
              </span>
              {settings.method === key && <Check size={16} style={{ color: "#D4AF37" }} />}
            </button>
          ))}
        </div>
      </div>

      {saved && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold"
          style={{ background: "#055C3F", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
        >
          ✓ Paramètres sauvegardés
        </div>
      )}
    </main>
  );
}
