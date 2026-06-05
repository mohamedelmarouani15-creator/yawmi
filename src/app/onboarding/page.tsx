"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ChevronRight, ChevronLeft, MapPin, Settings2, Sparkles,
  Star, Zap, Moon, Home, Crown,
  Minus, Leaf, BookOpen,
  Heart, Compass, Map,
  Globe, Type, MessageCircle, Languages,
} from "lucide-react";
import { CITIES } from "@/lib/cities";
import { CALC_METHOD_LABELS, type CalcMethodKey } from "@/lib/prayer";
import { storage, type YawmiSettings } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────
const STEPS = [
  "bienvenue", "age", "arabic", "objectif", "mode", "langue", "ville", "methode", "pret",
] as const;
type Step = typeof STEPS[number];

const QUIZ_NUM: Partial<Record<Step, number>> = {
  age: 1, arabic: 2, objectif: 3, mode: 4, langue: 5,
};

const ARABIC_LABELS: Record<string, string> = {
  none: "Aucun", beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé",
};
const OBJECTIVE_LABELS: Record<string, string> = {
  apprendre: "Apprendre", pratiquer: "Pratiquer", explorer: "Explorer",
};

// ── Animations ─────────────────────────────────────────────────
const slide = {
  enter: { opacity: 0, x: 28 },
  center: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] } },
  exit:  { opacity: 0, x: -28, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] } },
};

// ── Sub-components (defined before main for clarity) ───────────

function QuizHeader({ num, total, title, arabic }: {
  num: number; total: number; title: string; arabic: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(248,244,236,0.35)", fontFamily: "var(--font-dm-sans)" }}>
          Question {num} sur {total}
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <motion.div key={i}
              animate={{ width: i < num ? 18 : 6, background: i < num ? "var(--gold)" : "rgba(255,255,255,0.15)" }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-[1.6rem] font-bold leading-tight"
          style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          {title}
        </h2>
        <p className="mt-0.5 text-xl"
          style={{ color: "var(--gold-dim)", fontFamily: "var(--font-amiri)" }}>
          {arabic}
        </p>
      </div>
    </div>
  );
}

function RowCard({ icon, label, sub, selected, onClick }: {
  icon: React.ReactNode; label: string; sub: string; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left"
      style={{
        background: selected ? "var(--bg-card-active)" : "rgba(255,255,255,0.03)",
        borderColor: selected ? "rgba(212,175,55,0.55)" : "rgba(255,255,255,0.07)",
        boxShadow: selected ? "0 0 20px rgba(5,92,63,0.22)" : "none",
        transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
      }}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: selected ? "rgba(212,175,55,0.14)" : "var(--bg-card-active)",
          color: selected ? "var(--gold)" : "rgba(212,175,55,0.5)",
        }}>
        {icon}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-semibold leading-tight"
          style={{ color: selected ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          {label}
        </span>
        <span className="text-xs leading-snug"
          style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
          {sub}
        </span>
      </div>
      {selected && (
        <Check size={16} className="ml-auto shrink-0" style={{ color: "var(--gold)" }} />
      )}
    </motion.button>
  );
}

function GridCard({ icon, label, sub, selected, onClick }: {
  icon: React.ReactNode; label: string; sub: string; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      className="relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center"
      style={{
        background: selected ? "var(--bg-card-active)" : "rgba(255,255,255,0.03)",
        borderColor: selected ? "rgba(212,175,55,0.55)" : "rgba(255,255,255,0.07)",
        boxShadow: selected ? "0 0 20px rgba(5,92,63,0.22)" : "none",
        transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
      }}>
      {selected && (
        <div className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: "var(--gold)" }}>
          <Check size={10} style={{ color: "var(--bg)" }} />
        </div>
      )}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          background: selected ? "rgba(212,175,55,0.14)" : "var(--bg-card-active)",
          color: selected ? "var(--gold)" : "rgba(212,175,55,0.5)",
        }}>
        {icon}
      </div>
      <span className="text-sm font-semibold leading-tight"
        style={{ color: selected ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-bricolage)" }}>
        {label}
      </span>
      <span className="text-xs leading-snug"
        style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
        {sub}
      </span>
    </motion.button>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function OnboardingPage() {
  const router   = useRouter();
  const [step,   setStep]     = useState<Step>("bienvenue");
  const [search, setSearch]   = useState("");
  const [draft,  setDraft]    = useState<YawmiSettings>(() => storage.getSettings());
  const [advancing, setAdv]   = useState(false);

  const stepIndex = STEPS.indexOf(step);
  const progress  = stepIndex / (STEPS.length - 1);
  const quizNum   = QUIZ_NUM[step];

  function next() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }

  function back() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  }

  function autoAdvance(update: Partial<YawmiSettings>) {
    if (advancing) return;
    setAdv(true);
    setDraft(d => ({ ...d, ...update }));
    setTimeout(() => {
      setAdv(false);
      next();
    }, 360);
  }

  async function finish() {
    storage.saveSettings(draft);
    localStorage.setItem("yawmi_onboarded", "1");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch("/api/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ageGroup:      draft.ageGroup,
            arabicLevel:   draft.arabicLevel,
            mainObjective: draft.mainObjective,
            appMode:       draft.appMode,
            motherTongue:  draft.motherTongue,
          }),
        });
      }
    } catch { /* localStorage est la source de vérité */ }

    router.replace("/accueil");
  }

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="relative flex min-h-screen flex-col bg-[#061A12] overflow-hidden">

      {/* Fond atmosphérique */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 55% at 50% 25%, rgba(5,92,63,0.22) 0%, transparent 72%)" }} />
      <div className="pointer-events-none absolute -top-28 -right-28 h-80 w-80 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />
      <div className="pointer-events-none absolute bottom-0 -left-20 h-60 w-60 rounded-full opacity-5"
        style={{ background: "radial-gradient(circle, #055C3F, transparent)" }} />

      {/* Bouton retour — visible dès la 2e étape */}
      <AnimatePresence>
        {stepIndex > 0 && (
          <motion.button
            key="back-btn"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            onClick={back}
            aria-label="Étape précédente"
            className="absolute left-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(248,244,236,0.5)",
            }}
          >
            <ChevronLeft size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Barre de progression globale */}
      <div className="relative z-10 mx-6 mt-14 h-0.5 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full rounded-full"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ background: "var(--gradient-bar)" }}
        />
      </div>

      {/* Contenu par étape */}
      <AnimatePresence mode="wait">
        <motion.div key={step}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          className="relative z-10 flex flex-1 flex-col"
        >

          {/* ─── BIENVENUE ────────────────────────────────────────── */}
          {step === "bienvenue" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs tracking-widest uppercase"
                  style={{ borderColor: "rgba(212,175,55,0.3)", color: "var(--gold)", background: "rgba(212,175,55,0.06)" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gold)" }} />
                  Application familiale musulmane
                </div>
                <h1 className="text-7xl font-extrabold leading-none tracking-tight"
                  style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                  Yawmi
                </h1>
                <div className="flex items-center gap-3">
                  <span className="block h-px w-12"
                    style={{ background: "linear-gradient(to right, transparent, #D4AF37)" }} />
                  <span className="text-xs" style={{ color: "rgba(212,175,55,0.5)" }}>✦</span>
                  <span className="block h-px w-12"
                    style={{ background: "linear-gradient(to left, transparent, #D4AF37)" }} />
                </div>
                <p className="text-5xl font-bold"
                  style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)" }}>
                  يومي
                </p>
              </div>
              <p className="max-w-xs text-base leading-relaxed"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
                Prières, Coran, Dhikr et aventures islamiques — tout ce dont votre famille a besoin au quotidien.
              </p>
              <div className="flex flex-col items-center gap-3">
                <button onClick={next}
                  className="flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold active:scale-95"
                  style={{
                    background: "var(--gradient-primary)",
                    color: "var(--text)",
                    fontFamily: "var(--font-dm-sans)",
                    boxShadow: "0 0 32px rgba(5,92,63,0.4)",
                    transition: "transform 0.1s",
                  }}>
                  Commencer <ChevronRight size={16} />
                </button>
                <p className="text-xs" style={{ color: "rgba(248,244,236,0.25)", fontFamily: "var(--font-dm-sans)" }}>
                  5 questions rapides pour personnaliser l'expérience
                </p>
              </div>
            </div>
          )}

          {/* ─── Q1 : ÂGE ─────────────────────────────────────────── */}
          {step === "age" && (
            <div className="flex flex-1 flex-col gap-6 px-5 pt-6">
              <QuizHeader num={1} total={5} title="Quel est ton âge ?" arabic="كم عمرك؟" />
              <div className="flex flex-col gap-3">
                {[
                  { value: "4-10",  icon: <Star size={20} />,  label: "4 – 10 ans",  sub: "Petit explorateur" },
                  { value: "11-17", icon: <Zap size={20} />,   label: "11 – 17 ans", sub: "Jeune curieux" },
                  { value: "18-35", icon: <Moon size={20} />,  label: "18 – 35 ans", sub: "Adulte actif" },
                  { value: "36-55", icon: <Home size={20} />,  label: "36 – 55 ans", sub: "Parent de famille" },
                  { value: "55+",   icon: <Crown size={20} />, label: "55 ans et +", sub: "Sage de la famille" },
                ].map(opt => (
                  <RowCard key={opt.value}
                    icon={opt.icon} label={opt.label} sub={opt.sub}
                    selected={draft.ageGroup === opt.value}
                    onClick={() => autoAdvance({ ageGroup: opt.value as YawmiSettings["ageGroup"] })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── Q2 : NIVEAU ARABE ────────────────────────────────── */}
          {step === "arabic" && (
            <div className="flex flex-1 flex-col gap-6 px-5 pt-6">
              <QuizHeader num={2} total={5} title="Ton niveau en arabe ?" arabic="ما مستواك في العربية؟" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "none",         icon: <Minus size={22} />,    label: "Aucun",          sub: "Je ne connais pas l'arabe" },
                  { value: "beginner",     icon: <Leaf size={22} />,     label: "Débutant",        sub: "Je connais quelques mots" },
                  { value: "intermediate", icon: <BookOpen size={22} />, label: "Intermédiaire",   sub: "Je lis et comprends un peu" },
                  { value: "advanced",     icon: <Star size={22} />,     label: "Avancé",          sub: "Je lis couramment" },
                ].map(opt => (
                  <GridCard key={opt.value}
                    icon={opt.icon} label={opt.label} sub={opt.sub}
                    selected={draft.arabicLevel === opt.value}
                    onClick={() => autoAdvance({ arabicLevel: opt.value as YawmiSettings["arabicLevel"] })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── Q3 : OBJECTIF ────────────────────────────────────── */}
          {step === "objectif" && (
            <div className="flex flex-1 flex-col gap-6 px-5 pt-6">
              <QuizHeader num={3} total={5} title="Ton objectif principal ?" arabic="ما هدفك الرئيسي؟" />
              <div className="flex flex-col gap-3">
                {[
                  { value: "apprendre", icon: <BookOpen size={20} />, label: "Apprendre",     sub: "Découvrir l'islam, l'arabe et l'histoire" },
                  { value: "pratiquer", icon: <Heart size={20} />,    label: "Pratiquer",     sub: "Renforcer ma pratique quotidienne" },
                  { value: "explorer",  icon: <Compass size={20} />,  label: "Tout explorer", sub: "Jeux, histoires, défis en famille" },
                ].map(opt => (
                  <RowCard key={opt.value}
                    icon={opt.icon} label={opt.label} sub={opt.sub}
                    selected={draft.mainObjective === opt.value}
                    onClick={() => autoAdvance({ mainObjective: opt.value as YawmiSettings["mainObjective"] })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── Q4 : MODE ────────────────────────────────────────── */}
          {step === "mode" && (
            <div className="flex flex-1 flex-col gap-6 px-5 pt-6">
              <QuizHeader num={4} total={5} title="Comment utiliser Yawmi ?" arabic="كيف تريد استخدام يومي؟" />
              <div className="flex gap-3">
                {[
                  {
                    value: "pratiquant",
                    icon: <Moon size={28} />,
                    label: "Pratiquant",
                    sub: "Prières, Coran et Dhikr au premier plan",
                  },
                  {
                    value: "explorateur",
                    icon: <Map size={28} />,
                    label: "Explorateur",
                    sub: "Jeux et aventures islamiques",
                  },
                ].map(opt => {
                  const sel = draft.appMode === opt.value;
                  return (
                    <motion.button key={opt.value}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => autoAdvance({ appMode: opt.value as YawmiSettings["appMode"] })}
                      className="relative flex flex-1 flex-col items-center gap-3 rounded-2xl border px-4 py-7 text-center"
                      style={{
                        background: sel ? "var(--bg-card-active)" : "rgba(255,255,255,0.03)",
                        borderColor: sel ? "rgba(212,175,55,0.55)" : "rgba(255,255,255,0.07)",
                        boxShadow: sel ? "0 0 22px rgba(5,92,63,0.25)" : "none",
                        transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
                      }}>
                      {sel && (
                        <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full"
                          style={{ background: "var(--gold)" }}>
                          <Check size={10} style={{ color: "var(--bg)" }} />
                        </div>
                      )}
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                        style={{
                          background: sel ? "rgba(212,175,55,0.14)" : "var(--bg-card-active)",
                          color: sel ? "var(--gold)" : "rgba(212,175,55,0.5)",
                        }}>
                        {opt.icon}
                      </div>
                      <span className="text-base font-bold leading-tight"
                        style={{ color: sel ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                        {opt.label}
                      </span>
                      <span className="text-xs leading-relaxed"
                        style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
                        {opt.sub}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Q5 : LANGUE ──────────────────────────────────────── */}
          {step === "langue" && (
            <div className="flex flex-1 flex-col gap-6 px-5 pt-6">
              <QuizHeader num={5} total={5} title="Ta langue maternelle ?" arabic="ما لغتك الأم؟" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "français",  icon: <span style={{fontSize:26}}>🇫🇷</span>, label: "Français",  sub: "Ma langue principale" },
                  { value: "arabe",     icon: <span style={{fontSize:26}}>🌙</span>,  label: "العربية",  sub: "Arabic" },
                  { value: "darija",    icon: <span style={{fontSize:26}}>🇲🇦</span>, label: "Darija",   sub: "Dialecte maghrébin" },
                  { value: "anglais",   icon: <span style={{fontSize:26}}>🇬🇧</span>, label: "English",  sub: "Anglais" },
                  { value: "espagnol",  icon: <span style={{fontSize:26}}>🇪🇸</span>, label: "Español",  sub: "Espagnol" },
                  { value: "turc",      icon: <span style={{fontSize:26}}>🇹🇷</span>, label: "Türkçe",   sub: "Turc" },
                ].map(opt => (
                  <GridCard key={opt.value}
                    icon={opt.icon} label={opt.label} sub={opt.sub}
                    selected={draft.motherTongue === opt.value}
                    onClick={() => autoAdvance({ motherTongue: opt.value as YawmiSettings["motherTongue"] })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── VILLE ────────────────────────────────────────────── */}
          {step === "ville" && (
            <div className="flex flex-1 flex-col gap-5 px-5 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "var(--border-primary)", color: "var(--gold)" }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold"
                    style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                    Ta ville
                  </h2>
                  <p className="text-xs"
                    style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
                    Pour calculer les horaires de prières
                  </p>
                </div>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une ville…"
                className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none"
                style={{ borderColor: "var(--border-gold)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
                autoFocus />
              <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto pb-28">
                {filteredCities.map(c => {
                  const sel = draft.cityName === c.name;
                  return (
                    <button key={c.name}
                      onClick={() => setDraft(d => ({ ...d, cityName: c.name, lat: c.lat, lng: c.lng }))}
                      className="flex items-center justify-between rounded-xl border px-4 py-3"
                      style={{
                        background: sel ? "var(--bg-primary)" : "rgba(255,255,255,0.02)",
                        borderColor: sel ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                        transition: "background 0.12s, border-color 0.12s",
                      }}>
                      <span className="text-sm"
                        style={{ color: sel ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                        {c.name}
                      </span>
                      {sel && <Check size={16} style={{ color: "var(--gold)" }} />}
                    </button>
                  );
                })}
              </div>
              <div className="fixed bottom-6 left-5 right-5 z-20">
                <button onClick={next} disabled={!draft.cityName}
                  className="w-full rounded-full py-4 text-sm font-semibold active:scale-95 disabled:opacity-30"
                  style={{
                    background: "var(--gradient-primary)",
                    color: "var(--text)",
                    fontFamily: "var(--font-dm-sans)",
                    boxShadow: "0 0 24px rgba(5,92,63,0.35)",
                    transition: "transform 0.1s",
                  }}>
                  Continuer avec {draft.cityName} →
                </button>
              </div>
            </div>
          )}

          {/* ─── MÉTHODE ──────────────────────────────────────────── */}
          {step === "methode" && (
            <div className="flex flex-1 flex-col gap-5 px-5 pt-8 pb-28">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "var(--border-primary)", color: "var(--gold)" }}>
                  <Settings2 size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold"
                    style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                    Méthode de calcul
                  </h2>
                  <p className="text-xs"
                    style={{ color: "rgba(248,244,236,0.45)", fontFamily: "var(--font-dm-sans)" }}>
                    Choisir selon ta région ou ton école
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto">
                {(Object.entries(CALC_METHOD_LABELS) as [CalcMethodKey, string][]).map(([key, label]) => {
                  const sel = draft.method === key;
                  return (
                    <button key={key}
                      onClick={() => setDraft(d => ({ ...d, method: key }))}
                      className="flex items-center justify-between rounded-xl border px-4 py-3.5"
                      style={{
                        background: sel ? "var(--bg-primary)" : "rgba(255,255,255,0.02)",
                        borderColor: sel ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                        transition: "background 0.12s, border-color 0.12s",
                      }}>
                      <span className="text-sm"
                        style={{ color: sel ? "var(--gold)" : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                        {label}
                      </span>
                      {sel && <Check size={16} style={{ color: "var(--gold)" }} />}
                    </button>
                  );
                })}
              </div>
              <div className="fixed bottom-6 left-5 right-5 z-20">
                <button onClick={next}
                  className="w-full rounded-full py-4 text-sm font-semibold active:scale-95"
                  style={{
                    background: "var(--gradient-primary)",
                    color: "var(--text)",
                    fontFamily: "var(--font-dm-sans)",
                    boxShadow: "0 0 24px rgba(5,92,63,0.35)",
                    transition: "transform 0.1s",
                  }}>
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ─── PRÊT ─────────────────────────────────────────────── */}
          {step === "pret" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-7 px-8 text-center">
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: "spring", stiffness: 300, damping: 20 }}
                className="flex h-24 w-24 items-center justify-center rounded-full border-2"
                style={{ borderColor: "rgba(212,175,55,0.4)", background: "rgba(5,92,63,0.3)" }}>
                <Sparkles size={36} style={{ color: "var(--gold)" }} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                <h2 className="text-3xl font-bold"
                  style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
                  Yawmi est prêt !
                </h2>
                <p className="mt-2 text-base leading-relaxed"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
                  Tout est configuré pour {draft.cityName}.
                </p>
              </motion.div>

              {/* Récap du profil */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-xs rounded-2xl border px-5 py-4"
                style={{ borderColor: "rgba(212,175,55,0.15)", background: "rgba(5,92,63,0.1)" }}>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Âge",            value: draft.ageGroup ?? "—" },
                    { label: "Niveau arabe",    value: ARABIC_LABELS[draft.arabicLevel] },
                    { label: "Objectif",        value: OBJECTIVE_LABELS[draft.mainObjective ?? ""] ?? "—" },
                    { label: "Mode",            value: draft.appMode === "pratiquant" ? "Pratiquant" : "Explorateur" },
                    { label: "Langue",          value: draft.motherTongue ? draft.motherTongue.charAt(0).toUpperCase() + draft.motherTongue.slice(1) : "—" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs"
                        style={{ color: "rgba(248,244,236,0.38)", fontFamily: "var(--font-dm-sans)" }}>
                        {row.label}
                      </span>
                      <span className="text-xs font-semibold"
                        style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.97 }}
                onClick={finish}
                className="w-full max-w-xs rounded-full py-4 text-sm font-semibold"
                style={{
                  background: "var(--gradient-gold)",
                  color: "var(--bg)",
                  fontFamily: "var(--font-dm-sans)",
                  boxShadow: "0 0 32px rgba(212,175,55,0.3)",
                }}>
                Accéder à Yawmi ✦
              </motion.button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Indicateur de question (visible uniquement sur les étapes quiz) */}
      {quizNum !== undefined && (
        <div className="relative z-10 pb-6 flex justify-center">
          <p className="text-xs" style={{ color: "rgba(248,244,236,0.2)", fontFamily: "var(--font-dm-sans)" }}>
            Appuie sur une réponse pour continuer
          </p>
        </div>
      )}
    </main>
  );
}
