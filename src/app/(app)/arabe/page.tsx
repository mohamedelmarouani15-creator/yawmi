"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Lock, Volume2, PenLine, Flame, Mic,
} from "lucide-react";
import { LESSONS, LEVEL_META, getLessonsByLevel, type ArabeLevel } from "@/lib/arabe/curriculum";
import { arabeProgress } from "@/lib/arabe/progress";
import { storage } from "@/lib/storage";
import { useState } from "react";

const LEVELS: ArabeLevel[] = ["debutant", "intermediaire", "avance"];

export default function ArabePage() {
  const router = useRouter();
  const [progress] = useState(() => arabeProgress.get());
  const settings   = storage.getSettings();
  const ageGroup   = settings.ageGroup   ?? "18-35";
  const arabicLevel = settings.arabicLevel ?? "none";
  const [activeLevel, setActiveLevel] = useState<ArabeLevel>(() =>
    arabicLevel === "intermediate" ? "intermediaire" :
    arabicLevel === "advanced"     ? "avance" :
    "debutant"
  );

  const completedCount = arabeProgress.completedCount();
  const totalLessons   = LESSONS.length;
  const stats = arabeProgress.getStats();

  const pronouncePct = stats.pronunciationAttempts > 0
    ? Math.round((stats.pronunciationSuccesses / stats.pronunciationAttempts) * 100)
    : 0;

  const greeting =
    ageGroup === "4-10"  ? "Apprends l'arabe en t'amusant !" :
    ageGroup === "11-17" ? "Maîtrise la langue du Coran" :
    "Cours d'arabe islamique complet";

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: "#020a05" }}>

      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pt-safe-top pt-4 pb-4"
        style={{ background: "rgba(2,10,5,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
        <div className="flex items-center gap-3 mb-3">
          <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}>
            <ArrowLeft size={16} />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-black" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              Cours d&apos;arabe
            </h1>
            <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-amiri)" }}>
              تعلم العربية
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
              {completedCount}/{totalLessons}
            </p>
            <p className="text-[10px] opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>leçons</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div className="h-full rounded-full"
            animate={{ width: `${(completedCount / totalLessons) * 100}%` }}
            transition={{ duration: 0.8 }}
            style={{ background: "var(--gold)" }}
          />
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-5">

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl px-4 py-3"
          style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
            {greeting}
          </p>
          <p className="text-xs opacity-60 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Prof IA Ustadh Nour s&apos;adapte à ton âge et ton niveau à chaque leçon
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-4 gap-2">
          {[
            {
              icon: CheckCircle2,
              value: completedCount,
              label: "Leçons",
              color: "#34d399",
            },
            {
              icon: Mic,
              value: `${pronouncePct}%`,
              label: "Prononciation",
              color: "#a78bfa",
            },
            {
              icon: PenLine,
              value: stats.writingValidations,
              label: "Écritures",
              color: "#D4AF37",
            },
            {
              icon: Flame,
              value: stats.streakDays,
              label: "Jours",
              color: "#f97316",
            },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1 rounded-2xl py-3"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}20` }}>
              <Icon size={16} style={{ color }} />
              <p className="text-base font-black leading-none" style={{ color, fontFamily: "var(--font-bricolage)" }}>
                {value}
              </p>
              <p className="text-[9px] opacity-40 text-center leading-tight"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Level tabs */}
        <div className="flex gap-2">
          {LEVELS.map(level => {
            const meta    = LEVEL_META[level];
            const lessons = getLessonsByLevel(level);
            const done    = lessons.filter(l => arabeProgress.isCompleted(l.id)).length;
            const isActive = activeLevel === level;
            return (
              <motion.button key={level} onClick={() => setActiveLevel(level)}
                whileTap={{ scale: 0.96 }}
                className="flex-1 rounded-2xl px-3 py-2.5 text-center"
                style={{
                  background: isActive ? `${meta.color}18` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isActive ? meta.color + "55" : "rgba(255,255,255,0.08)"}`,
                }}>
                <p className="text-base">{meta.icon}</p>
                <p className="text-[11px] font-bold mt-0.5"
                  style={{ color: isActive ? meta.color : "rgba(248,244,236,0.5)", fontFamily: "var(--font-dm-sans)" }}>
                  {meta.label}
                </p>
                <p className="text-[9px] opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {done}/{lessons.length}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Lesson list */}
        <div className="flex flex-col gap-2.5">
          {getLessonsByLevel(activeLevel).map((lesson, i) => {
            const meta     = LEVEL_META[lesson.level];
            const done     = arabeProgress.isCompleted(lesson.id);
            const isCurrent = progress.currentLessonId === lesson.id;
            const prevDone  = i === 0 || arabeProgress.isCompleted(getLessonsByLevel(activeLevel)[i - 1]?.id ?? "");
            const locked    = !done && !prevDone && i > 0;

            return (
              <motion.button key={lesson.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                disabled={locked}
                onClick={() => !locked && router.push(`/arabe/${lesson.id}`)}
                whileTap={!locked ? { scale: 0.97 } : {}}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left w-full"
                style={{
                  background: done ? `${meta.color}12` : isCurrent ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${done ? meta.color + "40" : isCurrent ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"}`,
                  opacity: locked ? 0.4 : 1,
                }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: done ? `${meta.color}22` : "rgba(255,255,255,0.05)" }}>
                  {locked
                    ? <Lock size={14} style={{ color: "rgba(248,244,236,0.3)" }} />
                    : done
                      ? <CheckCircle2 size={18} style={{ color: meta.color }} />
                      : <span className="text-base">{meta.icon}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-tight"
                    style={{ color: done ? meta.color : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {lesson.title}
                  </p>
                  <p className="text-[11px] opacity-50 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-amiri)" }}>
                    {lesson.titleAr}
                  </p>
                  <p className="text-[10px] opacity-40 mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {lesson.subtitle}
                  </p>
                </div>
                {/* Badges */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {isCurrent && !done && (
                    <span className="text-[9px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5"
                      style={{ background: "rgba(212,175,55,0.15)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                      En cours
                    </span>
                  )}
                  {done && (
                    <span className="text-[9px] font-bold" style={{ color: meta.color }}>✓</span>
                  )}
                  {/* Pronunciation / writing badge for alphabet lessons */}
                  {lesson.id.startsWith("alphabet") && (
                    <div className="flex gap-1">
                      <Volume2 size={9} style={{ color: "rgba(248,244,236,0.2)" }} />
                      <PenLine size={9} style={{ color: "rgba(248,244,236,0.2)" }} />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
