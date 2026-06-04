"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { springTap } from "@/lib/motion";
import { useState } from "react";
import { useT } from "@/hooks/useT";
import { useLang } from "@/hooks/useLang";
import { pick } from "@/lib/content-i18n";

const CATEGORY_FILTERS = ["Tous", "Sages", "Streak", "Questions", "Niveau", "Mosquée"] as const;
type Filter = typeof CATEGORY_FILTERS[number];

function achievementCategory(id: string): Filter {
  if (id.startsWith("sage"))    return "Sages";
  if (id.startsWith("streak"))  return "Streak";
  if (id.startsWith("question") || id === "perfect_game") return "Questions";
  if (id.startsWith("level"))   return "Niveau";
  if (id === "mosque_1")        return "Mosquée";
  return "Tous";
}

export default function TropheesPage() {
  const router = useRouter();
  const { state } = useGameState();
  const tt = useT();
  const lang = useLang();
  const isRtl = lang === "ar" || lang === "darija";
  const [filter, setFilter] = useState<Filter>("Tous");
  const [lastUnlocked, setLastUnlocked] = useState<string | null>(null);

  const unlockedIds = state?.achievements ?? [];
  const totalUnlocked = unlockedIds.length;
  const totalAch = ACHIEVEMENTS.length;

  const filtered = ACHIEVEMENTS.filter(a =>
    filter === "Tous" || achievementCategory(a.id) === filter
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col px-5 pt-11 pb-32 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 55%)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.18)", color: "var(--text)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            {tt("profil.trophies")}
          </h1>
          <p className="text-xs" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
            {totalUnlocked}/{totalAch} {tt("profil.trophiesSub").split(" ")[0]}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${(totalUnlocked / totalAch) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ background: "linear-gradient(to right,#D4AF37,#22c55e)" }}
          />
        </div>
        <p className="text-xs" style={{ color: "rgba(248,244,236,0.35)", fontFamily: "var(--font-dm-sans)" }}>
          {Math.round((totalUnlocked / totalAch) * 100)}% complété
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATEGORY_FILTERS.map(cat => (
          <motion.button
            key={cat}
            onClick={() => setFilter(cat)}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: filter === cat ? "var(--border-gold)" : "rgba(255,255,255,0.04)",
              color: filter === cat ? "var(--gold)" : "rgba(248,244,236,0.4)",
              border: `1px solid ${filter === cat ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Achievements grid */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((ach, idx) => {
            const unlocked = unlockedIds.includes(ach.id);
            return (
              <motion.div
                key={ach.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03, duration: 0.25 }}
                className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
                style={{
                  background: unlocked ? "rgba(212,175,55,0.05)" : "rgba(255,255,255,0.02)",
                  borderColor: unlocked ? "rgba(212,175,55,0.25)" : "rgba(255,255,255,0.06)",
                }}
              >
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{
                    background: unlocked ? "var(--gold-faint)" : "rgba(255,255,255,0.04)",
                    filter: unlocked ? "none" : "grayscale(1)",
                    opacity: unlocked ? 1 : 0.35,
                  }}>
                  {ach.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate"
                    style={{ color: unlocked ? "var(--gold)" : "rgba(248,244,236,0.4)", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-bricolage)" }}>
                    {pick(ach.t, lang, "title", ach.titleAr && lang === "ar" ? ach.titleAr : ach.title)}
                  </p>
                  <p className="text-xs truncate"
                    style={{ color: "rgba(248,244,236,0.35)", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-dm-sans)" }}>
                    {pick(ach.t, lang, "description", ach.descriptionAr && lang === "ar" ? ach.descriptionAr : ach.description)}
                  </p>
                </div>

                {/* Status */}
                {unlocked ? (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "var(--border-gold)" }}>
                    <span style={{ color: "var(--gold)", fontSize: 14 }}>✓</span>
                  </motion.div>
                ) : (
                  <div className="h-7 w-7 shrink-0 rounded-full border-2 border-dashed"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={40} className="mb-3 mx-auto" style={{ color: "rgba(212,175,55,0.4)" }} />
          <p className="text-sm" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
            {tt("profil.trophiesSub")}
          </p>
        </div>
      )}

      {/* Unlocked achievement toast */}
      <AnimatePresence>
        {lastUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 flex items-center gap-2 z-50"
            style={{ background: "rgba(15,35,22,0.97)", border: "1px solid rgba(212,175,55,0.4)", boxShadow: "0 0 24px rgba(212,175,55,0.2)" }}>
            <Trophy size={20} style={{ color: "var(--gold)" }} />
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--gold)", fontFamily: "var(--font-bricolage)" }}>
                {tt("quiz.achievement")}
              </p>
              <p className="text-xs" style={{ color: "rgba(248,244,236,0.6)", fontFamily: isRtl ? "var(--font-amiri)" : "var(--font-dm-sans)" }}>
                {(() => { const a = ACHIEVEMENTS.find(x => x.id === lastUnlocked); return a ? pick(a.t, lang, "title", a.titleAr && lang === "ar" ? a.titleAr : a.title ?? "") : ""; })()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
