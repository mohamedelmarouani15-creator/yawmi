"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Star, Trophy } from "lucide-react";
import { gameStorage, computeCurrentEnergy, ENERGY_MAX } from "@/lib/game/game-storage";
import { getEraForLevel, ERA_CONDITIONS, MANUSCRIPTS, getCurrentEraIndex } from "@/lib/game/stages";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { springTap } from "@/lib/motion";
import type { Category } from "@/lib/game/types";

const SCHOLAR_TITLES = [
  { min: 0,  title: "Étudiant",    titleAr: "الطالب",      color: "rgba(248,244,236,0.4)" },
  { min: 15, title: "Taleb",       titleAr: "طالب العلم",  color: "#60a5fa" },
  { min: 30, title: "Alim",        titleAr: "العالِم",     color: "#34d399" },
  { min: 50, title: "Hafiz",       titleAr: "الحافظ",      color: "#D4AF37" },
  { min: 65, title: "Mujtahid",    titleAr: "المجتهد",     color: "#f97316" },
  { min: 80, title: "Faqih",       titleAr: "الفقيه",      color: "#a78bfa" },
  { min: 95, title: "Imam al-Ilm", titleAr: "إمام العلم",  color: "#FFD700" },
];

function getTitle(avgMastery: number) {
  return [...SCHOLAR_TITLES].reverse().find(t => avgMastery >= t.min) ?? SCHOLAR_TITLES[0];
}

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "religion", label: "Théologie",  icon: "🕌" },
  { id: "history",  label: "Histoire",   icon: "📜" },
  { id: "quran",    label: "Coran",       icon: "📖" },
  { id: "arabic",   label: "Arabe",       icon: "✍️" },
  { id: "darija",   label: "Darija",      icon: "🗣️" },
];

export default function SavantPage() {
  const router = useRouter();
  const state  = gameStorage.get();
  const energy = computeCurrentEnergy(state.energy, state.lastEnergyUpdate);

  const level           = state.level ?? 1;
  const completedArcs   = state.completedArcs ?? [];
  const categoryMastery = state.categoryMastery ?? {};
  const manuscripts     = state.manuscripts ?? {};
  const defeatedSages   = state.defeatedSages ?? [];
  const locationStages  = state.locationStages ?? {};
  const achievements    = state.achievements ?? [];

  const avgMastery    = Math.round(Object.values(categoryMastery).reduce((a: number, b: number) => a + b, 0) / 5);
  const era           = getEraForLevel(level);
  const eraIdx        = getCurrentEraIndex(level, completedArcs.length, avgMastery);
  const title         = getTitle(avgMastery);
  const nextTitle     = SCHOLAR_TITLES.find(t => t.min > avgMastery) ?? null;
  const masteredLocs  = Object.values(locationStages).filter(v => v >= 3).length;
  const completedMss  = MANUSCRIPTS.filter(m => (manuscripts[m.id] ?? 0) >= m.pages).length;
  const nextEra       = ERA_CONDITIONS.find(e => e.eraIndex === eraIdx + 1);

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col px-5 pt-12 pb-10 gap-5 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}>

      {/* Back */}
      <div className="flex items-center gap-3 mb-2">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <h1 className="text-lg font-black" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
          Profil du Savant
        </h1>
      </div>

      {/* Scholar title card */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl border p-5 text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${title.color}12 0%,rgba(5,20,12,0.9) 100%)`, borderColor: `${title.color}40` }}>
        <div className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 20%,${title.color}10 0%,transparent 70%)` }} />

        {/* Era badge */}
        <div className="flex justify-center mb-3">
          <span className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest"
            style={{ background: `${era.color}18`, color: era.color, border: `1px solid ${era.color}30`, fontFamily: "var(--font-dm-sans)" }}>
            {era.name} — {era.subtitle}
          </span>
        </div>

        {/* Big title */}
        <p className="text-4xl font-black mb-1" style={{ color: title.color, fontFamily: "var(--font-bricolage)" }}>
          {title.title}
        </p>
        <p className="text-lg mb-4" style={{ color: `${title.color}99`, fontFamily: "var(--font-amiri)" }}>
          {title.titleAr}
        </p>

        {/* Mastery ring */}
        <div className="flex items-center justify-center gap-5 mt-2">
          <div className="relative flex items-center justify-center">
            <svg width={80} height={80} className="-rotate-90">
              <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
              <motion.circle cx={40} cy={40} r={32} fill="none"
                stroke={title.color} strokeWidth={5} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32}
                initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - avgMastery / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }} />
            </svg>
            <div className="absolute text-center">
              <p className="text-lg font-black" style={{ color: title.color, fontFamily: "var(--font-bricolage)" }}>{avgMastery}%</p>
              <p className="text-[8px] opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>maîtrise</p>
            </div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 mb-1">
              <Star size={11} style={{ color: "#D4AF37" }} />
              <span className="text-xs" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>Niv. {level}</span>
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <Trophy size={11} style={{ color: "#D4AF37" }} />
              <span className="text-xs" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>{defeatedSages.length} sages</span>
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen size={11} style={{ color: "#D4AF37" }} />
              <span className="text-xs" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>{completedArcs.length} histoires</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">⚡</span>
              <span className="text-xs" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>{energy}/{ENERGY_MAX}</span>
            </div>
          </div>
        </div>

        {nextTitle && (
          <p className="text-[10px] mt-3 opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Prochain titre : <span style={{ color: nextTitle.color }}>{nextTitle.title}</span> à {nextTitle.min}%
          </p>
        )}
      </motion.div>

      {/* Category mastery bars */}
      <div className="rounded-3xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
        <p className="text-[9px] uppercase tracking-widest opacity-40 mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Attributs du Savant
        </p>
        {CATEGORIES.map(({ id, label, icon }) => {
          const pct      = Math.round(categoryMastery[id] ?? 0);
          const barColor = pct >= 80 ? "#4ade80" : pct >= 50 ? "#D4AF37" : pct >= 25 ? "#60a5fa" : "rgba(248,244,236,0.2)";
          return (
            <div key={id} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "rgba(248,244,236,0.65)", fontFamily: "var(--font-dm-sans)" }}>{icon} {label}</span>
                <span className="text-xs font-bold" style={{ color: barColor, fontFamily: "var(--font-dm-sans)" }}>{pct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div className="h-full rounded-full"
                  animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
                  style={{ background: `linear-gradient(to right,${barColor}88,${barColor})` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Manuscripts */}
      <div className="rounded-3xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(167,139,250,0.12)" }}>
        <p className="text-[9px] uppercase tracking-widest opacity-40 mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          📜 Manuscrits · {completedMss}/{MANUSCRIPTS.length}
        </p>
        {MANUSCRIPTS.map(m => {
          const collected = manuscripts[m.id] ?? 0;
          const pct = Math.round((collected / m.pages) * 100);
          const done = collected >= m.pages;
          return (
            <div key={m.id} className="mb-2.5">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-semibold" style={{ color: done ? m.color : "rgba(248,244,236,0.55)", fontFamily: "var(--font-dm-sans)" }}>
                  {done ? "✦ " : ""}{m.title} <span className="opacity-40">— {m.author}</span>
                </span>
                <span className="text-[10px] font-bold" style={{ color: m.color, fontFamily: "var(--font-dm-sans)" }}>
                  {collected}/{m.pages}p
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8 }} style={{ background: m.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Progression ère */}
      {nextEra && (
        <div className="rounded-3xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: `${nextEra.color}20` }}>
          <p className="text-[9px] uppercase tracking-widest opacity-40 mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Prochaine ère : {nextEra.name}
          </p>
          {[
            { label: `Niv. ${nextEra.minLevel}`, done: level >= nextEra.minLevel, val: `${level}/${nextEra.minLevel}` },
            { label: `${nextEra.minArcsRead} arcs`, done: completedArcs.length >= nextEra.minArcsRead, val: `${completedArcs.length}/${nextEra.minArcsRead}` },
            { label: `Maîtrise ${nextEra.minAvgMastery}%`, done: avgMastery >= nextEra.minAvgMastery, val: `${avgMastery}/${nextEra.minAvgMastery}%` },
          ].map(({ label, done, val }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{done ? "✅" : "⬜"}</span>
              <span className="flex-1 text-xs" style={{ color: done ? "rgba(74,222,128,0.8)" : "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                {label}
              </span>
              <span className="text-[10px] font-bold" style={{ color: done ? "#4ade80" : `${nextEra.color}88`, fontFamily: "var(--font-dm-sans)" }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: masteredLocs, label: "Lieux maîtrisés", icon: "🏆" },
          { val: achievements.length, label: "Trophées", icon: "⭐" },
          { val: state.totalCorrectAnswers ?? 0, label: "Réponses justes", icon: "✅" },
        ].map(({ val, label, icon }) => (
          <div key={label} className="rounded-2xl border p-3 text-center"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-xl font-black" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>{icon}</p>
            <p className="text-lg font-black" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>{val}</p>
            <p className="text-[9px] opacity-40 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{label}</p>
          </div>
        ))}
      </div>
    </motion.main>
  );
}
