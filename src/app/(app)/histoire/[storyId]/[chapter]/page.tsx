"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Volume2, Play, Pause, Square } from "lucide-react";
import { supabase }    from "@/lib/supabase";
import { gameStorage } from "@/lib/game/game-storage";
import { springTap }   from "@/lib/motion";
import { useArabicAudio }  from "@/hooks/useArabicAudio";
import { useNarrator, ARC_AMBIENT_LABEL } from "@/hooks/useNarrator";
import { useSettings }     from "@/hooks/useSettings";
import { ageGroupToMode }  from "@/hooks/useAgeMode";
import StoryPrologue       from "@/components/StoryPrologue";
import type { AgeMode }    from "@/hooks/useAgeMode";
import { useT }            from "@/hooks/useT";

// ── Types ──────────────────────────────────────────────────────
interface Vocabulary {
  word_ar:       string;
  translit:      string;
  definition_fr: string;
  example?:      string;
}

interface StoryQuestion {
  id:                 string;
  type:               "comprehension" | "vocabulary" | "reflection" | "spaced_repetition";
  text:               string;
  options?:           { text: string; correct: boolean }[];
  reflection_prompt?: string;
  spaced_ref?:        string;
}

interface Chapter {
  story_id:       string;
  chapter_number: number;
  title:          string;
  narrative:      string;
  vocabulary:     Vocabulary[];
  questions:      StoryQuestion[];
  values_shown:   string[];
  rewards:        Record<string, unknown>;
}

type Phase = "prologue" | "reading" | "vocab" | "questions" | "reward";

// ── Labels des types de questions (définis dans QuestionCard via tt) ─────

const TYPE_COLOR: Record<string, string> = {
  comprehension:     "#60a5fa",
  vocabulary:        "var(--gold)",
  reflection:        "#a78bfa",
  spaced_repetition: "#4ade80",
};

// ── QuestionCard ──────────────────────────────────────────────
function QuestionCard({
  question, questionIndex, total, onAnswer, color, ageMode,
}: {
  question:      StoryQuestion;
  questionIndex: number;
  total:         number;
  onAnswer:      (isCorrect: boolean) => void;
  color:         string;
  ageMode:       AgeMode;
}) {
  const tt = useT();
  const TYPE_LABEL: Record<string, string> = {
    comprehension:     tt("chapter.comprehension"),
    vocabulary:        tt("chapter.vocabulary"),
    reflection:        tt("chapter.reflection"),
    spaced_repetition: tt("chapter.memory"),
  };
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reflText, setReflText] = useState("");

  const isReflection = question.type === "reflection";
  const hasOptions   = (question.options?.length ?? 0) > 0;
  const qColor       = TYPE_COLOR[question.type] ?? color;
  const isKids       = ageMode === "kids";
  const isElder      = ageMode === "elder";

  const handleSelect = (idx: number) => { if (!revealed) setSelected(idx); };

  const handleSubmit = () => {
    if (isReflection) { setRevealed(true); setTimeout(() => onAnswer(true), 800); return; }
    if (selected === null || !hasOptions) return;
    setRevealed(true);
    const correct = question.options![selected]?.correct ?? false;
    setTimeout(() => onAnswer(correct), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Badge type + compteur */}
      <div className="flex items-center justify-between">
        <span className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: `${qColor}15`, color: qColor, border: `1px solid ${qColor}35`, fontFamily: "var(--font-dm-sans)" }}>
          {TYPE_LABEL[question.type] ?? question.type}
        </span>
        <span className="text-xs opacity-35" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {questionIndex + 1}/{total}
        </span>
      </div>

      {/* Question */}
      <p className="font-semibold leading-snug"
        style={{
          fontSize:   isKids ? 18 : isElder ? 19 : 16,
          color:      "var(--text)",
          fontFamily: "var(--font-bricolage)",
        }}>
        {question.text}
      </p>

      {/* Réflexion */}
      {isReflection && (
        <div className="flex flex-col gap-3">
          <p className="text-xs italic opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {question.reflection_prompt}
          </p>
          {!revealed && !isKids && (
            <textarea
              value={reflText}
              onChange={e => setReflText(e.target.value)}
              placeholder={tt("chapter.reflectionPlaceholder")}
              className="rounded-xl border px-3 py-2.5 text-sm resize-none"
              rows={3}
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text)", fontFamily: "var(--font-dm-sans)", outline: "none" }}
            />
          )}
          {revealed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-xl border p-3"
              style={{ background: "rgba(167,139,250,0.08)", borderColor: "rgba(167,139,250,0.25)" }}>
              <p className="text-sm" style={{ color: "#a78bfa", fontFamily: "var(--font-dm-sans)" }}>
                {isKids ? "✨ Super ! Tu as bien réfléchi !" : "✦ Il n'y a pas de bonne ou mauvaise réponse. Le tapis a noté ta réflexion."}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Options MCQ */}
      {hasOptions && !isReflection && (
        <div className="flex flex-col gap-2">
          {question.options!.map((opt, idx) => {
            let bg     = "rgba(255,255,255,0.02)";
            let border = "rgba(255,255,255,0.07)";
            let textC  = "var(--text)";

            if (revealed) {
              if (opt.correct) { bg = "rgba(74,222,128,0.09)"; border = "rgba(74,222,128,0.4)"; textC = "#4ade80"; }
              else if (selected === idx) { bg = "rgba(248,113,113,0.09)"; border = "rgba(248,113,113,0.4)"; textC = "#f87171"; }
            } else if (selected === idx) {
              bg = `${qColor}12`; border = qColor; textC = qColor;
            }

            return (
              <motion.button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                whileTap={!revealed ? { scale: 0.97 } : {}}
                className="flex items-center gap-3 rounded-xl border px-4 text-left"
                style={{
                  background: bg, borderColor: border,
                  minHeight: isKids ? 56 : isElder ? 60 : 48,
                }}
              >
                <span
                  className="flex shrink-0 items-center justify-center rounded-full font-bold"
                  style={{
                    width:      isKids || isElder ? 36 : 28,
                    height:     isKids || isElder ? 36 : 28,
                    fontSize:   isKids ? 14 : 12,
                    background: "rgba(255,255,255,0.05)",
                    color:      textC,
                    fontFamily: "var(--font-dm-sans)",
                  }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span style={{ fontSize: isKids ? 15 : isElder ? 16 : 14, color: textC, fontFamily: "var(--font-dm-sans)" }}>
                  {opt.text}
                </span>
                {revealed && opt.correct && <span className="ml-auto">✓</span>}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border p-3 overflow-hidden"
            style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.15)" }}>
            <p className="text-xs" style={{ color: "rgba(212,175,55,0.8)", fontFamily: "var(--font-dm-sans)" }}>
              {isReflection ? (isKids ? "✨ Super réflexion !" : "Belle réflexion. Continue l'histoire.")
                : question.options?.[selected!]?.correct
                ? (isKids ? "🎉 Bravo ! C'est la bonne réponse !" : "Exact. Bien lu !")
                : `La bonne réponse est : ${question.options?.find(o => o.correct)?.text ?? "—"}. L'histoire continue.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton valider */}
      {!revealed && (
        <motion.button
          onClick={handleSubmit}
          disabled={!isReflection && selected === null}
          whileTap={(isReflection || selected !== null) ? { scale: 0.97 } : {}}
          className="w-full rounded-full text-sm font-semibold"
          style={{
            padding:    isKids ? "1rem" : isElder ? "1.1rem" : "0.875rem",
            background: (isReflection || selected !== null)
              ? `linear-gradient(135deg,${qColor},#055C3F)`
              : "rgba(255,255,255,0.06)",
            color: (isReflection || selected !== null) ? "var(--text)" : "var(--text-dim)",
            fontFamily: "var(--font-dm-sans)",
            fontSize:   isElder ? 16 : 14,
          }}>
          {isReflection ? (reflText ? tt("chapter.validate") : tt("chapter.skip")) : tt("chapter.submit")}
        </motion.button>
      )}
    </motion.div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function ChapterPage() {
  const { storyId, chapter } = useParams() as { storyId: string; chapter: string };
  const chapterN = parseInt(chapter, 10);
  const router   = useRouter();
  const { settings } = useSettings();
  const tt           = useT();
  const ageMode      = ageGroupToMode(settings.ageGroup);
  const isKids       = ageMode === "kids";
  const isElder      = ageMode === "elder";

  const [data,          setData]          = useState<Chapter | null>(null);
  const [totalChapters, setTotalChapters] = useState<number>(10);
  const [phase,         setPhase]         = useState<Phase>(isKids ? "prologue" : "reading");
  const [qIndex,        setQIndex]        = useState(0);
  const [correctCount,  setCorrectCount]  = useState(0);
  const [rewards,       setRewards]       = useState<Record<string, unknown> | null>(null);
  const [loading,       setLoading]       = useState(true);
  const { speak }   = useArabicAudio();
  const narrator    = useNarrator(storyId, chapterN);

  const color = "var(--gold)";

  // Phases du parcours selon l'âge
  const phaseList: Phase[] = isKids
    ? ["prologue", "questions", "reward"]
    : ["reading", "vocab", "questions", "reward"];
  const phaseIndex = phaseList.indexOf(phase);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { langFromTongue } = await import("@/lib/i18n");
      const lang = langFromTongue(settings.motherTongue ?? null);
      const res = await fetch(`/api/story/chapter?storyId=${storyId}&chapter=${chapterN}&lang=${lang}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { router.back(); return; }
      const json = await res.json();
      setData(json.chapter);
      if (json.totalChapters) setTotalChapters(json.totalChapters);
      setLoading(false);
    }
    load();
  }, [storyId, chapterN, router, settings.motherTongue]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (isCorrect) setCorrectCount(c => c + 1);
    const questions = data?.questions ?? [];
    if (qIndex < questions.length - 1) {
      setQIndex(q => q + 1);
    } else {
      completeChapter();
    }
  }, [qIndex, data]); // eslint-disable-line

  const completeChapter = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !data) return;
    const res = await fetch("/api/story/answer", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
      body: JSON.stringify({ storyId, chapterNumber: chapterN, questionId: "chapter_complete", isCorrect: true, chapterCompleted: true }),
    });
    const json = await res.json();
    if (json.rewards) {
      if (json.rewards.xp)    gameStorage.addXP(json.rewards.xp);
      if (json.rewards.coins) gameStorage.addCoins(json.rewards.coins);
      setRewards(json.rewards);
      // Déclenche le message contextuel du Compagnon
      fetch(`/api/companion/context?hint=story_chapter`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => {});
    }
    // Track daily quest + mark arc completed if last chapter
    gameStorage.progressQuest("story_chapter", 1);
    if (chapterN >= totalChapters) {
      gameStorage.markArcCompleted(storyId);
    }
    gameStorage.push(); // sync vers Supabase après récompenses de chapitre
    setPhase("reward");
  }, [data, storyId, chapterN]); // eslint-disable-line

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
      <motion.div
        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-10 w-10 rounded-full border-2"
        style={{ borderColor: color, borderTopColor: "transparent" }}
      />
    </div>
  );

  if (!data) return null;

  // ── Phase : prologue (kids) ────────────────────────────────
  if (phase === "prologue") {
    return (
      <StoryPrologue
        narrative={data.narrative}
        storyId={storyId}
        chapterN={chapterN}
        onComplete={() => setPhase("questions")}
      />
    );
  }

  const vocab = data.vocabulary[0] ?? null;

  // ── Phase : récompense ────────────────────────────────────
  if (phase === "reward") {
    const isLast = chapterN >= totalChapters;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6"
        style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {isKids ? (
            <div className="text-center">
              <motion.p
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ fontSize: 64 }}>
                {isLast ? "🏆" : "⭐"}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-bold mt-2"
                style={{ color: color, fontFamily: "var(--font-bricolage)" }}>
                {isLast ? tt("chapter.finished") : tt("chapter.donekids")}
              </motion.p>
            </div>
          ) : (
            <p style={{ fontSize: 48 }}>{isLast ? "🏆" : "✦"}</p>
          )}
        </motion.div>

        {!isKids && (
          <div className="text-center">
            <p className="text-xl font-bold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {isLast ? tt("chapter.finished") : tt("chapter.done")}
            </p>
            <p className="text-sm opacity-55 mb-4" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {correctCount}/{data.questions.length} {tt("chapter.answers")}
            </p>
          </div>
        )}

        {isKids && (
          <p className="text-sm opacity-60 text-center" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {correctCount}/{data.questions.length} {tt("chapter.answers")} 🎯
          </p>
        )}

        {rewards && (
          <div className="flex gap-4 flex-wrap justify-center">
            {(rewards.xp as number) > 0 && (
              <div className="flex flex-col items-center rounded-2xl border px-5 py-3"
                style={{ background: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.25)" }}>
                <p className="text-2xl font-bold" style={{ color, fontFamily: "var(--font-bricolage)" }}>+{rewards.xp as number}</p>
                <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>XP</p>
              </div>
            )}
            {(rewards.coins as number) > 0 && (
              <div className="flex flex-col items-center rounded-2xl border px-5 py-3"
                style={{ background: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.25)" }}>
                <p className="text-2xl font-bold" style={{ color, fontFamily: "var(--font-bricolage)" }}>+{rewards.coins as number}</p>
                <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>🪙</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {!isLast && (
            <motion.button
              onClick={() => router.push(`/histoire/${storyId}/${chapterN + 1}`)}
              whileTap={{ scale: 0.97 }} transition={springTap}
              className="w-full rounded-full py-4 text-sm font-semibold"
              style={{ background: `linear-gradient(135deg,${color},#8B6914)`, color: "#0A1A0E", fontFamily: "var(--font-dm-sans)", fontSize: isElder ? 16 : 14 }}>
              {isKids ? tt("chapter.next") : tt("chapter.next").replace(" 🌟", "")}
            </motion.button>
          )}
          <motion.button
            onClick={() => router.push(`/histoire/${storyId}`)}
            whileTap={{ scale: 0.97 }} transition={springTap}
            className="w-full rounded-full py-3 text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            {tt("chapter.backChapters")}
          </motion.button>
        </div>
      </div>
    );
  }

  // Meta SEO dynamique via document
  useEffect(() => {
    if (!data) return;
    document.title = `${data.title} — La Grande Histoire · Yawmi`;
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = `Chapitre ${chapterN} : ${data.title}. ${data.narrative.slice(0, 120)}…`;
    return () => { document.title = "Yawmi"; };
  }, [data, chapterN]);

  return (
    <>
    <motion.main
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col px-5 pt-11 pb-32 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}
    >
      {/* Header + barre de progression */}
      <div className="flex items-center gap-3 mb-5">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border shrink-0"
          style={{ borderColor: "rgba(212,175,55,0.18)", color: "var(--text)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <div className="min-w-0 flex-1">
          <p className="text-xs opacity-35 truncate" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Chapitre {chapterN}
          </p>
          <p className="text-sm font-bold truncate" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)", fontSize: isElder ? 16 : 14 }}>
            {data.title}
          </p>
        </div>
        {/* Barre de progression par phase */}
        <div className="flex gap-1.5 shrink-0">
          {phaseList.filter(p => p !== "reward").map((p, i) => (
            <motion.div key={p}
              animate={{ width: i <= phaseIndex ? 20 : 8, opacity: i < phaseIndex ? 0.45 : i === phaseIndex ? 1 : 0.2 }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full"
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Phase : lecture ─── */}
        {phase === "reading" && (
          <motion.div key="reading"
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            className="flex flex-col gap-6"
          >
            {/* Barre narrateur */}
            <div className="flex items-center gap-3 rounded-2xl border px-4 py-3"
              style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.18)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                  🎧 {ARC_AMBIENT_LABEL[storyId] ?? "Ambiance"}
                </p>
                <p className="text-xs opacity-40 truncate" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {narrator.isLoading ? tt("chapter.generating") : narrator.isPlaying ? tt("chapter.narrating") : narrator.isPaused ? tt("chapter.paused") : tt("chapter.narrate")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!narrator.isPlaying && !narrator.isPaused && !narrator.isLoading && (
                  <motion.button
                    onClick={async () => {
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session) narrator.start(data.narrative, session.access_token);
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: "rgba(212,175,55,0.15)", color: "var(--gold)" }}>
                    <Play size={16} fill="var(--gold)" />
                  </motion.button>
                )}
                {narrator.isLoading && (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-9 w-9 rounded-full border-2"
                    style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
                )}
                {narrator.isPlaying && (
                  <motion.button onClick={narrator.pause} whileTap={{ scale: 0.9 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: "rgba(212,175,55,0.15)", color: "var(--gold)" }}>
                    <Pause size={16} />
                  </motion.button>
                )}
                {narrator.isPaused && (
                  <motion.button onClick={narrator.resume} whileTap={{ scale: 0.9 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: "rgba(212,175,55,0.15)", color: "var(--gold)" }}>
                    <Play size={16} fill="var(--gold)" />
                  </motion.button>
                )}
                {(narrator.isPlaying || narrator.isPaused) && (
                  <motion.button onClick={narrator.stop} whileTap={{ scale: 0.9 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                    <Square size={14} fill="#f87171" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Récit — plus grand pour les aînés */}
            <div className="flex flex-col gap-4">
              {data.narrative.split("\n\n").map((para, i) => (
                <p key={i} className="leading-[1.85]"
                  style={{
                    fontSize:   isElder ? (i === 0 ? 20 : 17) : (i === 0 ? 17 : 15),
                    color:      i === 0 ? "var(--text)" : "rgba(248,244,236,0.75)",
                    fontFamily: "var(--font-dm-sans)",
                  }}>
                  {para}
                </p>
              ))}
            </div>

            <motion.button
              onClick={() => { narrator.stop(); setPhase(vocab ? "vocab" : "questions"); }}
              whileTap={{ scale: 0.97 }} transition={springTap}
              className="w-full rounded-full py-4 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg,${color},#8B6914)`, color: "#0A1A0E", fontFamily: "var(--font-dm-sans)", fontSize: isElder ? 16 : 14, minHeight: isElder ? 60 : undefined }}>
              Continuer <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* ─── Phase : vocabulaire ─── */}
        {phase === "vocab" && vocab && (
          <motion.div key="vocab"
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            className="flex flex-col gap-5"
          >
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest mb-3 opacity-45"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {tt("chapter.vocab")}
              </p>
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-3xl border p-6 mb-4 flex flex-col items-center gap-3"
                style={{ background: "linear-gradient(135deg,rgba(212,175,55,0.08),rgba(6,26,18,0.97))", borderColor: "rgba(212,175,55,0.3)" }}>
                <p style={{ fontSize: isElder ? 72 : 60, fontFamily: "var(--font-amiri)", direction: "rtl", color }}>
                  {vocab.word_ar}
                </p>
                <button onClick={() => speak(vocab.word_ar)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)" }}>
                  <Volume2 size={13} style={{ color }} />
                  <span className="text-xs" style={{ color, fontFamily: "var(--font-dm-sans)" }}>{tt("chapter.listen")}</span>
                </button>
                <p style={{ fontSize: isElder ? 20 : 18, fontWeight: 600, color: "rgba(248,244,236,0.55)", fontFamily: "var(--font-dm-sans)" }}>
                  {vocab.translit}
                </p>
                <p style={{ fontSize: isElder ? 17 : 15, textAlign: "center", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {vocab.definition_fr}
                </p>
              </motion.div>
              {vocab.example && (
                <p className="text-sm italic opacity-45 text-center" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {vocab.example}
                </p>
              )}
            </div>
            <motion.button
              onClick={() => setPhase("questions")}
              whileTap={{ scale: 0.97 }} transition={springTap}
              className="w-full rounded-full py-4 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg,${color},#8B6914)`, color: "#0A1A0E", fontFamily: "var(--font-dm-sans)", fontSize: isElder ? 16 : 14, minHeight: isElder ? 60 : undefined }}>
              {tt("chapter.vocabContinue")} <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* ─── Phase : questions ─── */}
        {phase === "questions" && (
          <motion.div key={`q${qIndex}`}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>

            {/* Indicateur questions kids */}
            {isKids && (
              <div className="flex justify-center gap-1.5 mb-5">
                {data.questions.map((_, i) => (
                  <div key={i} className="h-2 rounded-full"
                    style={{ width: i < qIndex ? 20 : i === qIndex ? 28 : 8, background: i < qIndex ? "#4ade80" : i === qIndex ? color : "rgba(255,255,255,0.15)", transition: "all 0.3s" }} />
                ))}
              </div>
            )}

            <QuestionCard
              question={data.questions[qIndex]}
              questionIndex={qIndex}
              total={data.questions.length}
              onAnswer={handleAnswer}
              color={color}
              ageMode={ageMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation chapitre précédent / suivant (phase lecture uniquement) */}
      {phase === "reading" && (
        <div className="flex items-center justify-between gap-3 mt-4">
          {chapterN > 1 ? (
            <motion.button
              onClick={() => router.push(`/histoire/${storyId}/${chapterN - 1}`)}
              whileTap={{ scale: 0.95 }} transition={springTap}
              className="flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              <ArrowLeft size={13} /> Chapitre {chapterN - 1}
            </motion.button>
          ) : <div />}
          {chapterN < totalChapters && (
            <motion.button
              onClick={() => router.push(`/histoire/${storyId}/${chapterN + 1}`)}
              whileTap={{ scale: 0.95 }} transition={springTap}
              className="flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold"
              style={{ borderColor: "rgba(212,175,55,0.25)", color: "rgba(212,175,55,0.65)", fontFamily: "var(--font-dm-sans)" }}>
              Chapitre {chapterN + 1} <ChevronRight size={13} />
            </motion.button>
          )}
        </div>
      )}
    </motion.main>
    </>
  );
}

