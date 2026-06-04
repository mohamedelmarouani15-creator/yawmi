"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Swords, Trophy, Lock, Star, Zap } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import { getLocation } from "@/lib/game/locations";
import { getSageForLocation } from "@/lib/game/sages";
import { springTap } from "@/lib/motion";
import { useT } from "@/hooks/useT";
import { useLang } from "@/hooks/useLang";
import { pick } from "@/lib/content-i18n";
import { SagePortrait } from "@/components/SagePortrait";
import staticT from "@/lib/static-translations.json";

export default function LieuPage() {
  const { lieu } = useParams() as { lieu: string };
  const router   = useRouter();
  const tt       = useT();
  const lang     = useLang();
  const isRtl    = lang === "ar" || lang === "darija";
  const { state, locationUnlocked } = useGameState();

  const location = getLocation(lieu);
  const sage     = getSageForLocation(lieu);
  const unlocked = locationUnlocked(lieu);
  const defeated = state?.defeatedSages.includes(sage?.id ?? "") ?? false;
  const color    = location?.color ?? "#D4AF37";

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

  // ── Terminal cities (Médine / La Mecque) ─────────────────────
  if (!sage) {
    return (
      <div className="relative flex flex-col items-center justify-center px-6 text-center"
        style={{ minHeight: "100dvh", background: "#020a05", overflow: "hidden" }}>
        {/* Atmospheric bg */}
        <div className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${color}20 0%, transparent 70%)` }} />

        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }}
          className="absolute top-12 left-5 flex h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}>
          <ArrowLeft size={16} />
        </motion.button>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-6xl mb-4" style={{ fontFamily: "var(--font-amiri)", color }}>
          {lieu === "la_mecque" ? "مكة المكرمة" : "المدينة المنورة"}
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-2xl font-black mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          {locationName}
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm opacity-55 leading-relaxed max-w-xs mb-10" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {locationDesc}
        </motion.p>

        {lieu === "medine" && (
          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            onClick={() => router.push("/oasis/quiz/medine")} whileTap={{ scale: 0.96 }}
            className="rounded-full px-10 py-4 text-base font-black w-full max-w-xs"
            style={{ background: `linear-gradient(135deg,${color},#055C3F)`, color: "#0a0f0d",
              fontFamily: "var(--font-bricolage)", boxShadow: `0 4px 28px ${color}55` }}>
            <Swords size={18} className="inline mr-2" />{tt("lieu.start")}
          </motion.button>
        )}

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          onClick={() => router.back()} whileTap={{ scale: 0.95 }}
          className="mt-4 rounded-full px-6 py-2.5 text-sm"
          style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
          ← {tt("lieu.backMap")}
        </motion.button>
      </div>
    );
  }

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
          {isRtl
            ? `تحتاج ${location.requiredXP} نقطة خبرة`
            : `${location.requiredXP} XP requis pour débloquer`}
        </motion.p>
        <div className="flex gap-2 mb-8">
          <div className="rounded-2xl border px-5 py-3 text-center"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-xl font-black" style={{ color: "rgba(248,244,236,0.5)", fontFamily: "var(--font-bricolage)" }}>
              {location.requiredXP}
            </p>
            <p className="text-xs opacity-40 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>XP requis</p>
          </div>
          <div className="rounded-2xl border px-5 py-3 text-center"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-xl font-black" style={{ color: "rgba(248,244,236,0.5)", fontFamily: "var(--font-bricolage)" }}>
              {state?.xp ?? 0}
            </p>
            <p className="text-xs opacity-40 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Ton XP</p>
          </div>
        </div>
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

        {/* Sage portrait — large, centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
          className="relative mb-5"
          style={{ filter: `drop-shadow(0 0 30px ${color}66) drop-shadow(0 0 60px ${color}33)` }}
        >
          {/* Glow ring */}
          <motion.div className="absolute -inset-4 rounded-full"
            style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <SagePortrait sageId={sage.portrait} color={color} size={140} />

          {/* Specialty badge */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest"
            style={{ background: `${color}22`, color, border: `1px solid ${color}44`, backdropFilter: "blur(8px)" }}>
            {sage.specialty}
          </motion.div>
        </motion.div>

        {/* Sage name + title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-center mt-5 mb-3">
          <h1 className="text-3xl font-black mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)", letterSpacing: "-0.02em" }}>
            {sageName}
          </h1>
          <p className="text-sm font-semibold" style={{ color: `${color}cc`, fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-dm-sans)" }}>
            {sageTitle}
          </p>
        </motion.div>

        {/* Dialogue quote */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mx-auto max-w-sm text-center mb-6 px-2">
          <p className="text-sm leading-relaxed opacity-60 italic"
            style={{ color: "var(--text)", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-dm-sans)", direction: isRtl ? "rtl" : "ltr" }}>
            &ldquo;{defeated ? sageSuccess : sageIntro}&rdquo;
          </p>
        </motion.div>

        {/* Battle stats */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex gap-3 w-full max-w-xs mb-8">
          <div className="flex-1 rounded-2xl border px-4 py-3 text-center"
            style={{ background: `${color}0d`, borderColor: `${color}25` }}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Zap size={12} style={{ color }} />
              <span className="text-lg font-black" style={{ color, fontFamily: "var(--font-bricolage)" }}>+{sage.reward.xp}</span>
            </div>
            <p className="text-[9px] uppercase tracking-widest opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {tt("lieu.xpWin")}
            </p>
          </div>
          <div className="flex-1 rounded-2xl border px-4 py-3 text-center"
            style={{ background: `${color}0d`, borderColor: `${color}25` }}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star size={12} fill={color} style={{ color }} />
              <span className="text-lg font-black" style={{ color, fontFamily: "var(--font-bricolage)" }}>{sage.victoryRequirement}/10</span>
            </div>
            <p className="text-[9px] uppercase tracking-widest opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {tt("lieu.required")}
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="w-full max-w-xs flex flex-col gap-3">
          {defeated ? (
            <>
              <div className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold"
                style={{ background: `${color}15`, color, fontFamily: "var(--font-dm-sans)", border: `1px solid ${color}35` }}>
                <Trophy size={16} /> {tt("lieu.sageDefeated")}
              </div>
              <motion.button onClick={() => router.push(`/oasis/quiz/${lieu}`)} whileTap={{ scale: 0.96 }} transition={springTap}
                className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black"
                style={{ background: "rgba(255,255,255,0.06)", color: "var(--text)", fontFamily: "var(--font-bricolage)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Swords size={16} /> {tt("lieu.replay")}
              </motion.button>
            </>
          ) : (
            <motion.button onClick={() => router.push(`/oasis/quiz/${lieu}`)}
              whileTap={{ scale: 0.96 }} transition={springTap}
              className="flex items-center justify-center gap-3 rounded-2xl py-5 text-base font-black relative overflow-hidden"
              style={{ background: `linear-gradient(135deg,${color},#055C3F)`, color: "#0a0f0d",
                fontFamily: "var(--font-bricolage)", boxShadow: `0 4px 32px ${color}55`, fontSize: 17 }}>
              {/* Shimmer */}
              <motion.div className="absolute inset-0"
                style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
              />
              <Swords size={20} /> {tt("lieu.challenge")}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
