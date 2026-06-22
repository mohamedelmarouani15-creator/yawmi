"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Lock, Star, BookOpen } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import { getLocation } from "@/lib/game/locations";
import { getSageForLocation } from "@/lib/game/sages";
import { currentStageIndex, getStageConfig, stagesDone, LOCATION_STORY_ARCS } from "@/lib/game/stages";
import { springTap } from "@/lib/motion";
import { useT } from "@/hooks/useT";
import { useLang } from "@/hooks/useLang";
import { pick } from "@/lib/content-i18n";
import { SagePortrait } from "@/components/SagePortrait";
import staticT from "@/lib/static-translations.json";
import { ALL_THEMES, isThemeCompleted, getThemeProgress, completedThemesCount } from "@/lib/game/locations";
import type { Category } from "@/lib/game/types";

const THEME_META: Record<Category, { label: string; icon: string; color: string }> = {
  theologie: { label: "Théologie", icon: "🕌", color: "var(--gold)" },
  histoire:  { label: "Histoire",  icon: "📜", color: "#60a5fa" },
  coran:     { label: "Coran",     icon: "📖", color: "#a78bfa" },
  arabe:     { label: "Arabe",     icon: "✍️", color: "#34d399" },
  ethique:   { label: "Éthique",   icon: "🌿", color: "#f97316" },
  sira:      { label: "Sira",      icon: "🌙", color: "#fb7185" },
  fiqh:      { label: "Fiqh",      icon: "⚖️", color: "#38bdf8" },
};

export default function LieuPage() {
  const { lieu } = useParams() as { lieu: string };
  const router   = useRouter();
  const tt       = useT();
  const lang     = useLang();
  const isRtl    = lang === "ar";
  const { state, locationUnlocked } = useGameState();

  const location    = getLocation(lieu);
  const sage        = getSageForLocation(lieu);
  const unlocked    = locationUnlocked(lieu);
  // energy system removed
  const hasEnergy = true; // energy removed
  // waitMs removed
  // waitMin removed
  const stagesDoneN = stagesDone(state?.locationStages ?? {}, lieu);
  const stageIdx    = currentStageIndex(state?.locationStages ?? {}, lieu);
  const stageCfg    = getStageConfig(stageIdx);
  const mastered    = stagesDoneN >= 3;
  const defeated    = state?.defeatedSages.includes(sage?.id ?? "") ?? false;
  const color       = location?.color ?? "#D4AF37";
  const storyArcs   = LOCATION_STORY_ARCS[lieu] ?? [];

  if (!location) return (
    <div className="flex items-center justify-center h-screen" style={{ background: "#020a05" }}>
      <p style={{ color: "var(--text)" }}>Lieu introuvable.</p>
    </div>
  );

  const sageT = sage ? (staticT.sages as Record<string, Record<string, Record<string,string>>>)[sage.id] : undefined;
  const locT  = (staticT.locations as Record<string, Record<string, Record<string,string>>>)[location.id];

  const sageName        = sage?.name ?? "";
  const sageTitle       = sage ? pick(sageT, lang, "title",          lang === "ar" ? (sage.titleAr          ?? sage.title)          : sage.title)          : "";
  const sageIntro       = sage ? pick(sageT, lang, "dialogueIntro",  lang === "ar" ? (sage.dialogueIntroAr  ?? sage.dialogueIntro)  : sage.dialogueIntro)  : "";
  const sageSuccess     = sage ? pick(sageT, lang, "dialogueSuccess",lang === "ar" ? (sage.dialogueSuccessAr?? sage.dialogueSuccess) : sage.dialogueSuccess) : "";
  const locationName    = isRtl ? location.name : location.nameFr;
  const locationCountry = pick(locT, lang, "country",     lang === "ar" ? (location.countryAr  ?? location.country)     : location.country);
  const locationDesc    = pick(locT, lang, "description", lang === "ar" ? (location.descriptionAr ?? location.description) : location.description);

  // ── Terminal cities sans sage (Médine, La Mecque) ───────────
  // Elles utilisent le même layout que les autres villes avec la grille de thèmes.
  // Pas de early-return ici — on tombe dans le bloc principal ci-dessous.

  // ── Locked ───────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="relative flex flex-col items-center justify-center px-6 text-center"
        style={{ minHeight: "100dvh", background: "#020a05", overflow: "hidden" }}>
        <div className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${color}0d 0%, transparent 65%)` }} />

        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }}
          className="absolute top-12 left-5 flex h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.4)" }}>
          <ArrowLeft size={16} />
        </motion.button>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 mb-6"
          style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
          <Lock size={32} style={{ color: "rgba(248,244,236,0.3)" }} />
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-xl font-black mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          {locationName}
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-sm opacity-50 mb-8" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Valide les 7 thèmes de la ville précédente pour débloquer
        </motion.p>
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.96 }} transition={springTap}
          className="rounded-full px-8 py-3.5 text-sm font-bold"
          style={{ background: "rgba(255,255,255,0.06)", color: "var(--text)", fontFamily: "var(--font-dm-sans)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {tt("lieu.continuePlay")}
        </motion.button>
      </div>
    );
  }

  // ── Boss intro (unlocked + sage) ─────────────────────────────
  return (
    <div className="relative flex flex-col" style={{ minHeight: "100dvh", background: "#020a05", overflow: "hidden" }}>

      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        <div style={{ background: `radial-gradient(ellipse 100% 55% at 50% 5%, ${color}28 0%, transparent 65%)` , position: "absolute", inset: 0 }} />
        <div style={{ background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${color}10 0%, transparent 70%)`, position: "absolute", inset: 0 }} />
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{ width: 2 + i % 3, height: 2 + i % 3, background: color, left: `${10 + i * 12}%`, top: `${15 + (i * 31) % 55}%` }}
            animate={{ y: [0, -12, 0], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* Back button */}
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
        className="absolute top-12 left-5 flex h-10 w-10 items-center justify-center rounded-full border z-10"
        style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.45)", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}>
        <ArrowLeft size={16} />
      </motion.button>

      {/* Defeated badge */}
      <AnimatePresence>
        {defeated && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="absolute top-12 right-5 flex items-center gap-1.5 rounded-full px-3 py-1.5 z-10"
            style={{ background: `${color}22`, border: `1px solid ${color}55` }}>
            <Trophy size={12} style={{ color }} />
            <span className="text-[10px] font-bold" style={{ color, fontFamily: "var(--font-dm-sans)" }}>Vaincu</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAGE HERO SECTION */}
      <div className="flex flex-col items-center pt-24 pb-6 px-6 flex-1">

        {/* Location label */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex items-center gap-2 mb-6">
          <span className="text-xs font-semibold tracking-widest uppercase opacity-50"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {locationCountry}
          </span>
          <span className="opacity-20" style={{ color: "var(--text)" }}>·</span>
          <span className="text-xs font-bold tracking-widest uppercase"
            style={{ color, fontFamily: "var(--font-dm-sans)" }}>
            {locationName}
          </span>
        </motion.div>

        {/* Hero section : sage si dispo, sinon nom de la ville */}
        {sage ? (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
              className="relative mb-5"
              style={{ filter: `drop-shadow(0 0 30px ${color}66) drop-shadow(0 0 60px ${color}33)` }}
            >
              <motion.div className="absolute -inset-4 rounded-full"
                style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <SagePortrait sageId={sage.portrait} color={color} size={140} />
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest"
                style={{ background: `${color}22`, color, border: `1px solid ${color}44`, backdropFilter: "blur(8px)" }}>
                {sage.specialty}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-center mt-5 mb-3">
              <h1 className="text-3xl font-black mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)", letterSpacing: "-0.02em" }}>
                {sageName}
              </h1>
              <p className="text-sm font-semibold" style={{ color: `${color}cc`, fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-dm-sans)" }}>
                {sageTitle}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mx-auto max-w-sm text-center mb-6 px-2">
              <p className="text-sm leading-relaxed opacity-60 italic"
                style={{ color: "var(--text)", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-dm-sans)", direction: isRtl ? "rtl" : "ltr" }}>
                &ldquo;{defeated ? sageSuccess : sageIntro}&rdquo;
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="flex gap-2 mb-4">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <div className="rounded-xl px-3 py-2 text-center"
                    style={{
                      background: stagesDoneN >= s ? `${color}22` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${stagesDoneN >= s ? color : "rgba(255,255,255,0.08)"}`,
                      minWidth: 72,
                    }}>
                    <span className="text-base">{stagesDoneN >= s ? "★" : "☆"}</span>
                    <p className="text-[9px] font-bold mt-0.5 uppercase tracking-wider"
                      style={{ color: stagesDoneN >= s ? color : "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)" }}>
                      {["Découverte","Épreuve","Maîtrise"][s - 1]}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        ) : (
          /* Ville sans sage (Médine, La Mecque) — affiche le nom + description */
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-center mb-8 mt-4 px-2">
            <p className="text-5xl mb-3" style={{ color, fontFamily: "var(--font-amiri)" }}>
              {lieu === "la_mecque" ? "مكة المكرمة" : lieu === "medine" ? "المدينة المنورة" : location.name}
            </p>
            <h1 className="text-2xl font-black mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {locationName}
            </h1>
            <p className="text-sm opacity-55 leading-relaxed max-w-xs mx-auto"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {locationDesc}
            </p>
          </motion.div>
        )}

        {/* Current stage info + battle stats */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex gap-3 w-full max-w-xs mb-5">
          <div className="flex-1 rounded-2xl border px-4 py-3 text-center"
            style={{ background: `${color}0d`, borderColor: `${color}25` }}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star size={12} fill={color} style={{ color }} />
              <span className="text-lg font-black" style={{ color, fontFamily: "var(--font-bricolage)" }}>
                {mastered ? (sage?.victoryRequirement ?? stageCfg.victoryReq) : stageCfg.victoryReq}/10
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-widest opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {mastered ? "Maîtrisé" : stageCfg.name}
            </p>
          </div>
          {/* ⚡ énergie supprimée */}
        </motion.div>

        {/* Theme grid — 7 themes to validate before next city */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="w-full max-w-sm flex flex-col gap-3 pb-8">


          {/* Progression globale de la ville */}
          {state && (() => {
            const done = completedThemesCount(state, lieu);
            return (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div className="h-full rounded-full"
                    animate={{ width: `${(done / 7) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ background: done === 7 ? "#22c55e" : color }}
                  />
                </div>
                <span className="text-xs font-bold shrink-0"
                  style={{ color: done === 7 ? "#22c55e" : color, fontFamily: "var(--font-dm-sans)" }}>
                  {done}/7
                </span>
              </div>
            );
          })()}

          <p className="text-[10px] uppercase tracking-widest opacity-40 text-center"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Complète les 7 thèmes pour débloquer la ville suivante
          </p>

          <div className="grid grid-cols-1 gap-2">
            {ALL_THEMES.map((theme, i) => {
              const meta       = THEME_META[theme];
              const completed  = state ? isThemeCompleted(state, lieu, theme) : false;
              const tp         = state ? getThemeProgress(state, lieu, theme) : null;

              return (
                <motion.button key={theme}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                  disabled={!hasEnergy}
                  onClick={() => hasEnergy && router.push(`/oasis/quiz/${lieu}?theme=${theme}`)}
                  whileTap={hasEnergy ? { scale: 0.97 } : {}}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
                  style={{
                    background: completed ? `${meta.color}18` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${completed ? meta.color + "55" : "rgba(255,255,255,0.08)"}`,
                    opacity: hasEnergy ? 1 : 0.6,
                  }}>
                  <span className="text-xl shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight"
                      style={{ color: completed ? meta.color : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                      {meta.label}
                    </p>
                    <p className="text-[10px] opacity-50 mt-0.5"
                      style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                      {completed
                        ? `Complété · meilleur score ${tp?.bestScore ?? 0}/10`
                        : tp
                          ? `${tp.attempts} tentative${tp.attempts > 1 ? "s" : ""} · meilleur ${tp.bestScore}/10`
                          : "10 questions à répondre"
                      }
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    {completed
                      ? <span className="text-base">✅</span>
                      : <span className="text-xs opacity-30" style={{ color: "var(--text)" }}>▶</span>
                    }
                    {tp && !completed && (
                      <span className="text-[9px] font-bold" style={{ color: meta.color }}>
                        Rejouer
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {mastered && (
            <div className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold mt-1"
              style={{ background: `${color}15`, color, fontFamily: "var(--font-dm-sans)", border: `1px solid ${color}35` }}>
              <Trophy size={14} /> {sage ? `${sage.name} vaincu — ` : ""}Ville maîtrisée
            </div>
          )}
        </motion.div>

        {/* Story arc teasers */}
        {storyArcs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="w-full max-w-xs mt-4 flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-widest opacity-40 text-center mb-1"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Histoires liées
            </p>
            {storyArcs.map(arc => (
              <motion.button key={arc.arcId}
                onClick={() => router.push(`/histoire/${arc.arcId}`)}
                whileTap={{ scale: 0.97 }} transition={springTap}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
                style={{ background: `${arc.color}10`, border: `1px solid ${arc.color}30` }}>
                <BookOpen size={14} style={{ color: arc.color, flexShrink: 0 }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: arc.color, fontFamily: "var(--font-dm-sans)" }}>
                    {arc.title}
                  </p>
                  <p className="text-[10px] opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    Lis pour débloquer des questions secrètes
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
