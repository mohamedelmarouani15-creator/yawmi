"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, MapPin, Settings2, Sparkles } from "lucide-react";
import { CITIES } from "@/lib/cities";
import { CALC_METHOD_LABELS, type CalcMethodKey } from "@/lib/prayer";
import { storage, type YawmiSettings } from "@/lib/storage";

const STEPS = ["bienvenue", "ville", "methode", "pret"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [step,   setStep]   = useState<Step>("bienvenue");
  const [search, setSearch] = useState("");
  const [draft,  setDraft]  = useState<YawmiSettings>(() => storage.getSettings());

  const stepIndex = STEPS.indexOf(step);
  const progress  = stepIndex / (STEPS.length - 1);

  function next() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }

  function finish() {
    storage.saveSettings(draft);
    if (typeof localStorage !== "undefined")
      localStorage.setItem("yawmi_onboarded", "1");
    router.replace("/accueil");
  }

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="relative flex min-h-screen flex-col bg-[#061A12] overflow-hidden">

      {/* Fond */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(5,92,63,0.25) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />

      {/* Barre de progression */}
      <div className="relative z-10 mx-6 mt-14 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%`, background: "linear-gradient(to right, #055C3F, #D4AF37)" }} />
      </div>

      {/* ── Étape 1 : Bienvenue ───────────────────────────────────────── */}
      {step === "bienvenue" && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs tracking-widest uppercase"
              style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37", background: "rgba(212,175,55,0.06)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#D4AF37" }} />
              Application familiale musulmane
            </div>
            <h1 className="text-7xl font-extrabold leading-none tracking-tight"
              style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
              Yawmi
            </h1>
            <div className="flex items-center gap-3">
              <span className="block h-px w-12" style={{ background: "linear-gradient(to right, transparent, #D4AF37)" }} />
              <span className="text-xs" style={{ color: "rgba(212,175,55,0.5)" }}>✦</span>
              <span className="block h-px w-12" style={{ background: "linear-gradient(to left, transparent, #D4AF37)" }} />
            </div>
            <p className="text-5xl font-bold" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)" }}>
              يومي
            </p>
          </div>
          <p className="max-w-xs text-base leading-relaxed opacity-50"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
            Prières, Coran, Dhikr et espace famille — tout ce dont vous avez besoin au quotidien.
          </p>
          <button onClick={next}
            className="mt-4 flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #055C3F, #0a8a5e)",
              color: "#F8F4EC", fontFamily: "var(--font-dm-sans)",
              boxShadow: "0 0 32px rgba(5,92,63,0.4)",
            }}>
            Commencer <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Étape 2 : Ville ───────────────────────────────────────────── */}
      {step === "ville" && (
        <div className="relative z-10 flex flex-1 flex-col gap-5 px-5 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37" }}>
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
                Ta ville
              </h2>
              <p className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                Pour calculer les horaires de prières
              </p>
            </div>
          </div>

          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
            style={{ borderColor: "rgba(212,175,55,0.2)", color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
            autoFocus />

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pb-24">
            {filteredCities.map(c => {
              const selected = draft.cityName === c.name;
              return (
                <button key={c.name}
                  onClick={() => setDraft(d => ({ ...d, cityName: c.name, lat: c.lat, lng: c.lng }))}
                  className="flex items-center justify-between rounded-xl border px-4 py-3 transition-all"
                  style={{
                    background: selected ? "rgba(5,92,63,0.25)" : "rgba(255,255,255,0.02)",
                    borderColor: selected ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                  }}>
                  <span className="text-sm" style={{ color: selected ? "#D4AF37" : "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {c.name}
                  </span>
                  {selected && <Check size={16} style={{ color: "#D4AF37" }} />}
                </button>
              );
            })}
          </div>

          <div className="fixed bottom-6 left-5 right-5">
            <button onClick={next} disabled={!draft.cityName}
              className="w-full rounded-full py-4 text-sm font-semibold transition-all active:scale-95 disabled:opacity-30"
              style={{
                background: "linear-gradient(135deg, #055C3F, #0a8a5e)",
                color: "#F8F4EC", fontFamily: "var(--font-dm-sans)",
                boxShadow: "0 0 24px rgba(5,92,63,0.35)",
              }}>
              Continuer avec {draft.cityName} →
            </button>
          </div>
        </div>
      )}

      {/* ── Étape 3 : Méthode ─────────────────────────────────────────── */}
      {step === "methode" && (
        <div className="relative z-10 flex flex-1 flex-col gap-5 px-5 pt-8 pb-28">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(5,92,63,0.4)", color: "#D4AF37" }}>
              <Settings2 size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
                Méthode de calcul
              </h2>
              <p className="text-xs opacity-50" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                Choisir selon ta région ou ton école
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {(Object.entries(CALC_METHOD_LABELS) as [CalcMethodKey, string][]).map(([key, label]) => {
              const selected = draft.method === key;
              return (
                <button key={key}
                  onClick={() => setDraft(d => ({ ...d, method: key }))}
                  className="flex items-center justify-between rounded-xl border px-4 py-3.5 transition-all"
                  style={{
                    background: selected ? "rgba(5,92,63,0.25)" : "rgba(255,255,255,0.02)",
                    borderColor: selected ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                  }}>
                  <span className="text-sm" style={{ color: selected ? "#D4AF37" : "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                    {label}
                  </span>
                  {selected && <Check size={16} style={{ color: "#D4AF37" }} />}
                </button>
              );
            })}
          </div>

          <div className="fixed bottom-6 left-5 right-5">
            <button onClick={next}
              className="w-full rounded-full py-4 text-sm font-semibold transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #055C3F, #0a8a5e)",
                color: "#F8F4EC", fontFamily: "var(--font-dm-sans)",
                boxShadow: "0 0 24px rgba(5,92,63,0.35)",
              }}>
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* ── Étape 4 : Prêt ────────────────────────────────────────────── */}
      {step === "pret" && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2"
            style={{ borderColor: "rgba(212,175,55,0.4)", background: "rgba(5,92,63,0.3)" }}>
            <Sparkles size={32} style={{ color: "#D4AF37" }} />
          </div>

          <div>
            <h2 className="text-3xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
              C'est parti !
            </h2>
            <p className="mt-2 text-base opacity-50 leading-relaxed"
              style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
              Yawmi est prêt pour {draft.cityName}.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-xs">
            {[
              "Horaires de prières en temps réel",
              "Qibla avec boussole interactive",
              "Lecture du Coran",
              "Tasbih avec suivi de streak",
              "Espace famille partagé",
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "#055C3F" }}>
                  <Check size={11} style={{ color: "#F8F4EC" }} />
                </div>
                <p className="text-sm opacity-60" style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}>
                  {f}
                </p>
              </div>
            ))}
          </div>

          <button onClick={finish}
            className="mt-4 w-full max-w-xs rounded-full py-4 text-sm font-semibold transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #D4AF37, #b8942e)",
              color: "#061A12", fontFamily: "var(--font-dm-sans)",
              boxShadow: "0 0 32px rgba(212,175,55,0.3)",
            }}>
            Accéder à Yawmi ✦
          </button>
        </div>
      )}
    </main>
  );
}
