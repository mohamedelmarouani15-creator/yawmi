"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Lock, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { springTap, pageVariants, itemVariants } from "@/lib/motion";

interface ChapterMeta {
  chapter_number: number;
  title: string;
}

interface StoryProgress {
  current_chapter: number;
  completed_chapters: number[];
}

export default function StoryChaptersPage() {
  const { storyId } = useParams() as { storyId: string };
  const router = useRouter();

  const [chapters,  setChapters]  = useState<ChapterMeta[]>([]);
  const [progress,  setProgress]  = useState<StoryProgress | null>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [{ data: chaps }, { data: prog }] = await Promise.all([
        supabase
          .from("story_chapters")
          .select("chapter_number, title")
          .eq("story_id", storyId)
          .order("chapter_number"),
        supabase
          .from("story_progress")
          .select("current_chapter, completed_chapters")
          .eq("user_id", session.user.id)
          .eq("story_id", storyId)
          .single(),
      ]);

      setChapters(chaps ?? []);
      setProgress(prog);
      setLoading(false);
    }
    load();
  }, [storyId]);

  const current   = progress?.current_chapter ?? 1;
  const completed = progress?.completed_chapters ?? [];

  const TITLES: Record<string, string> = {
    arc_yusuf:      "L'histoire de Yûsuf",
    arc_ibrahim:    "Ibrahim et le Feu",
    arc_moussa:     "Moussa et Pharaon",
    arc_maryam:     "Maryam, la choisie",
    arc_sira:       "La Sîra — La vie du Prophète ﷺ",
    arc_sahaba:     "Les Compagnons du Prophète ﷺ",
    arc_hijra:      "La Hijra — La Grande Migration",
    arc_ismail:     "Ismaïl et le Sacrifice",
    arc_isra_miraj: "Al-Isrâ wal-Miraj",
    arc_souleimane: "Souleimane, le Roi Sage",
  };

  return (
    <motion.main
      variants={pageVariants} initial="initial" animate="animate"
      className="flex flex-col px-5 pt-12 pb-32 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.18)", color: "var(--text)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <div>
          <h1 className="text-lg font-bold"
            style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            {TITLES[storyId] ?? "Histoire"}
          </h1>
          <p className="text-xs opacity-40"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {completed.length}/{chapters.length} chapitres lus
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {chapters.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6">
          <div className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${(completed.length / chapters.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ background: "linear-gradient(to right,#D4AF37,#22c55e)" }}
            />
          </div>
          <p className="text-xs mt-1 opacity-35"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {Math.round((completed.length / chapters.length) * 100)}% terminé
          </p>
        </motion.div>
      )}

      {/* Chapitres */}
      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 rounded-full border-2"
            style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {chapters.map((ch) => {
            const isDone    = completed.includes(ch.chapter_number);
            const isCurrent = ch.chapter_number === current;
            const isLocked  = ch.chapter_number > current;

            return (
              <motion.button
                key={ch.chapter_number}
                variants={itemVariants}
                onClick={() => !isLocked && router.push(`/histoire/${storyId}/${ch.chapter_number}`)}
                whileTap={!isLocked ? { scale: 0.97 } : {}}
                transition={springTap}
                className="flex items-center gap-4 rounded-2xl border px-4 py-4 text-left"
                style={{
                  background: isCurrent
                    ? "var(--bg-gold)"
                    : isDone
                    ? "rgba(74,222,128,0.05)"
                    : "rgba(255,255,255,0.02)",
                  borderColor: isCurrent
                    ? "rgba(212,175,55,0.35)"
                    : isDone
                    ? "rgba(74,222,128,0.2)"
                    : "rgba(255,255,255,0.06)",
                  cursor: isLocked ? "default" : "pointer",
                  opacity: isLocked ? 0.45 : 1,
                }}
              >
                {/* Numéro / icône */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: isDone
                      ? "rgba(74,222,128,0.12)"
                      : isCurrent
                      ? "var(--gold-faint)"
                      : "rgba(255,255,255,0.05)",
                  }}>
                  {isDone ? (
                    <CheckCircle2 size={18} style={{ color: "#4ade80" }} />
                  ) : isLocked ? (
                    <Lock size={16} style={{ color: "var(--text-dim)" }} />
                  ) : isCurrent ? (
                    <BookOpen size={17} style={{ color: "var(--gold)" }} />
                  ) : (
                    <span className="text-sm font-bold"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-bricolage)" }}>
                      {ch.chapter_number}
                    </span>
                  )}
                </div>

                {/* Titre */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs opacity-40 mb-0.5"
                    style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    Chapitre {ch.chapter_number}
                  </p>
                  <p className="text-sm font-semibold truncate"
                    style={{
                      color: isDone ? "#4ade80" : isCurrent ? "var(--gold)" : "var(--text)",
                      fontFamily: "var(--font-bricolage)",
                    }}>
                    {ch.title}
                  </p>
                </div>

                {isCurrent && (
                  <span className="shrink-0 text-xs font-semibold rounded-full px-2.5 py-1"
                    style={{
                      background: "rgba(212,175,55,0.15)",
                      color: "var(--gold)",
                      border: "1px solid rgba(212,175,55,0.3)",
                      fontFamily: "var(--font-dm-sans)",
                    }}>
                    Lire
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.main>
  );
}
