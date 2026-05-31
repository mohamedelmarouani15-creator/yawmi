"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Volume2, Play, Pause, Square } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { gameStorage } from "@/lib/game/game-storage";
import { springTap } from "@/lib/motion";
import { useArabicAudio } from "@/hooks/useArabicAudio";
import { useNarrator, ARC_AMBIENT_LABEL } from "@/hooks/useNarrator";

// ── Types ──────────────────────────────────────────────────────
interface Vocabulary {
  word_ar: string;
  translit: string;
  definition_fr: string;
  example?: string;
}

interface StoryQuestion {
  id: string;
  type: "comprehension" | "vocabulary" | "reflection" | "spaced_repetition";
  text: string;
  options?: { text: string; correct: boolean }[];
  reflection_prompt?: string;
  spaced_ref?: string;
}

interface Chapter {
  story_id: string;
  chapter_number: number;
  title: string;
  narrative: string;
  vocabulary: Vocabulary[];
  questions: StoryQuestion[];
  values_shown: string[];
  rewards: Record<string, unknown>;
}

// ── Composant question ────────────────────────────────────────
function QuestionCard({
  question,
  questionIndex,
  total,
  onAnswer,
  color,
}: {
  question: StoryQuestion;
  questionIndex: number;
  total: number;
  onAnswer: (isCorrect: boolean) => void;
  color: string;
}) {
  const [selected, setSelected]   = useState<number | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const [reflText, setReflText]   = useState("");

  const isReflection = question.type === "reflection";
  const hasOptions   = (question.options?.length ?? 0) > 0;

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (isReflection) {
      setRevealed(true);
      setTimeout(() => onAnswer(true), 800);
      return;
    }
    if (selected === null || !hasOptions) return;
    setRevealed(true);
    const correct = question.options![selected]?.correct ?? false;
    setTimeout(() => onAnswer(correct), 1000);
  };

  const typeLabels: Record<string, string> = {
    comprehension:     "Compréhension",
    vocabulary:        "Vocabulaire",
    reflection:        "Réflexion",
    spaced_repetition: "Mémorisation",
  };

  const typeColors: Record<string, string> = {
    comprehension:     "#60a5fa",
    vocabulary:        "var(--gold)",
    reflection:        "#a78bfa",
    spaced_repetition: "#4ade80",
  };

  const qColor = typeColors[question.type] ?? color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Badge type */}
      <div className="flex items-center justify-between">
        <span className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: `${qColor}15`,
            color: qColor,
            border: `1px solid ${qColor}35`,
            fontFamily: "var(--font-dm-sans)",
          }}>
          {typeLabels[question.type]}
        </span>
        <span className="text-xs opacity-35"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {questionIndex + 1}/{total}
        </span>
      </div>

      {/* Question */}
      <p className="text-base font-semibold leading-snug"
        style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
        {question.text}
      </p>

      {/* Réflexion — textarea */}
      {isReflection && (
        <div className="flex flex-col gap-3">
          <p className="text-xs italic opacity-50"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {question.reflection_prompt}
          </p>
          {!revealed && (
            <textarea
              value={reflText}
              onChange={e => setReflText(e.target.value)}
              placeholder="Écris ta réflexion ici… ou passe si tu préfères."
              className="rounded-xl border px-3 py-2.5 text-sm resize-none"
              rows={3}
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "var(--text)",
                fontFamily: "var(--font-dm-sans)",
                outline: "none",
              }}
            />
          )}
          {revealed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-xl border p-3"
              style={{ background: "rgba(167,139,250,0.08)", borderColor: "rgba(167,139,250,0.25)" }}>
              <p className="text-sm" style={{ color: "#a78bfa", fontFamily: "var(--font-dm-sans)" }}>
                ✦ Il n&apos;y a pas de bonne ou mauvaise réponse à cette question. Le tapis a noté ta réflexion.
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
                className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left"
                style={{ background: bg, borderColor: border }}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.05)", color: textC, fontFamily: "var(--font-dm-sans)" }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm" style={{ color: textC, fontFamily: "var(--font-dm-sans)" }}>
                  {opt.text}
                </span>
                {revealed && opt.correct && <span style={{ marginLeft: "auto" }}>✓</span>}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Si pas d'erreur : message encourageant */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl border p-3 overflow-hidden"
            style={{
              background: "rgba(212,175,55,0.06)",
              borderColor: "rgba(212,175,55,0.15)",
            }}>
            <p className="text-xs" style={{ color: "rgba(212,175,55,0.8)", fontFamily: "var(--font-dm-sans)" }}>
              {isReflection
                ? "Belle réflexion. Continue l'histoire."
                : question.options?.[selected!]?.correct
                ? "Exact. Bien lu !"
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
          className="w-full rounded-full py-3.5 text-sm font-semibold"
          style={{
            background: (isReflection || selected !== null)
              ? `linear-gradient(135deg,${qColor},#055C3F)`
              : "rgba(255,255,255,0.06)",
            color: (isReflection || selected !== null) ? "var(--text)" : "var(--text-dim)",
            fontFamily: "var(--font-dm-sans)",
          }}>
          {isReflection ? (reflText ? "Valider ma réflexion" : "Passer") : "Valider"}
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

  const [data,          setData]          = useState<Chapter | null>(null);
  const [totalChapters, setTotalChapters] = useState<number>(10);
  const [phase,         setPhase]         = useState<"reading" | "vocab" | "questions" | "reward">("reading");
  const [qIndex,        setQIndex]        = useState(0);
  const [correctCount,  setCorrectCount]  = useState(0);
  const [rewards,       setRewards]       = useState<Record<string, unknown> | null>(null);
  const [loading,       setLoading]       = useState(true);
  const { speak }      = useArabicAudio();
  const narrator       = useNarrator(storyId, chapterN);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/story/chapter?storyId=${storyId}&chapter=${chapterN}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { router.back(); return; }
      const json = await res.json();
      setData(json.chapter);
      if (json.totalChapters) setTotalChapters(json.totalChapters);
      setLoading(false);
    }
    load();
  }, [storyId, chapterN, router]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (isCorrect) setCorrectCount(c => c + 1);
    const questions = data?.questions ?? [];
    if (qIndex < questions.length - 1) {
      setQIndex(q => q + 1);
    } else {
      // Tous les questions faites → complétion
      completeChapter();
    }
  }, [qIndex, data]);

  const completeChapter = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !data) return;

    const res = await fetch("/api/story/answer", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        storyId,
        chapterNumber:    chapterN,
        questionId:       "chapter_complete",
        isCorrect:        true,
        chapterCompleted: true,
      }),
    });

    const json = await res.json();
    if (json.rewards) {
      // Applique les récompenses localement aussi
      if (json.rewards.xp)     gameStorage.addXP(json.rewards.xp);
      if (json.rewards.coins)  gameStorage.addCoins(json.rewards.coins);
      setRewards(json.rewards);
    }
    setPhase("reward");
  }, [data, storyId, chapterN]);

  const color = "var(--gold)";

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--bg)" }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-10 w-10 rounded-full border-2"
        style={{ borderColor: color, borderTopColor: "transparent" }}
      />
    </div>
  );

  if (!data) return null;

  const vocab = data.vocabulary[0] ?? null;

  // ── Phase : récompense finale ──────────────────────────────
  if (phase === "reward") {
    const isLast = chapterN >= totalChapters;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6"
        style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-6xl">
          {isLast ? "🏆" : "✦"}
        </motion.div>
        <div className="text-center">
          <p className="text-xl font-bold mb-2"
            style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            {isLast ? "Histoire terminée !" : "Chapitre terminé !"}
          </p>
          <p className="text-sm opacity-55 mb-4"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {correctCount}/{data.questions.length} bonnes réponses
          </p>
          {rewards && (
            <div className="flex flex-col gap-2 mb-6">
              {(rewards.xp as number) > 0 && (
                <p className="text-sm" style={{ color: color, fontFamily: "var(--font-dm-sans)" }}>
                  +{rewards.xp as number} XP
                </p>
              )}
              {(rewards.coins as number) > 0 && (
                <p className="text-sm" style={{ color: color, fontFamily: "var(--font-dm-sans)" }}>
                  +{rewards.coins as number} 🪙
                </p>
              )}
              {!!rewards.locationUnlock && (
                <p className="text-sm" style={{ color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>
                  Nouveau lieu débloqué sur l&apos;Oasis !
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {!isLast && (
            <motion.button
              onClick={() => router.push(`/histoire/${storyId}/${chapterN + 1}`)}
              whileTap={{ scale: 0.97 }} transition={springTap}
              className="w-full rounded-full py-4 text-sm font-semibold"
              style={{ background: `linear-gradient(135deg,${color},#8B6914)`, color: "#0A1A0E", fontFamily: "var(--font-dm-sans)" }}>
              Chapitre suivant →
            </motion.button>
          )}
          <motion.button
            onClick={() => router.push(`/histoire/${storyId}`)}
            whileTap={{ scale: 0.97 }} transition={springTap}
            className="w-full rounded-full py-3 text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            Retour aux chapitres
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col px-5 pt-11 pb-32 min-h-screen"
      style={{ background: "linear-gradient(180deg,#020a05 0%,#061A12 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }} transition={springTap}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.18)", color: "var(--text)" }}>
          <ArrowLeft size={15} />
        </motion.button>
        <div>
          <p className="text-xs opacity-35" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Chapitre {chapterN}
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
            {data.title}
          </p>
        </div>
        {/* Phase indicator */}
        <div className="ml-auto flex gap-1.5">
          {(["reading","vocab","questions"] as const).map((p) => (
            <div key={p} className="h-1.5 w-5 rounded-full"
              style={{ background: phase === p ? color : "rgba(255,255,255,0.1)" }} />
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
                <p className="text-xs font-semibold truncate"
                  style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                  🎧 {ARC_AMBIENT_LABEL[storyId] ?? "Ambiance"}
                </p>
                <p className="text-xs opacity-40 truncate"
                  style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {narrator.isLoading ? "Génération en cours…" : narrator.isPlaying ? "Narration en cours…" : narrator.isPaused ? "En pause" : "Écouter l'histoire"}
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
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-9 w-9 rounded-full border-2"
                    style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
                  />
                )}
                {narrator.isPlaying && (
                  <motion.button
                    onClick={narrator.pause}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: "rgba(212,175,55,0.15)", color: "var(--gold)" }}>
                    <Pause size={16} />
                  </motion.button>
                )}
                {narrator.isPaused && (
                  <motion.button
                    onClick={narrator.resume}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: "rgba(212,175,55,0.15)", color: "var(--gold)" }}>
                    <Play size={16} fill="var(--gold)" />
                  </motion.button>
                )}
                {(narrator.isPlaying || narrator.isPaused) && (
                  <motion.button
                    onClick={narrator.stop}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                    <Square size={14} fill="#f87171" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Récit */}
            <div className="flex flex-col gap-4">
              {data.narrative.split("\n\n").map((para, i) => (
                <p key={i} className="text-base leading-[1.85] first:text-[17px]"
                  style={{ color: i === 0 ? "var(--text)" : "rgba(248,244,236,0.75)", fontFamily: "var(--font-dm-sans)" }}>
                  {para}
                </p>
              ))}
            </div>

            <motion.button
              onClick={() => { narrator.stop(); setPhase("vocab"); }}
              whileTap={{ scale: 0.97 }} transition={springTap}
              className="w-full rounded-full py-4 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg,${color},#8B6914)`, color: "#0A1A0E", fontFamily: "var(--font-dm-sans)" }}>
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
                Le mot de ce chapitre
              </p>
              {/* Mot arabe principal */}
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-3xl border p-6 mb-4 flex flex-col items-center gap-3"
                style={{
                  background: "linear-gradient(135deg,rgba(212,175,55,0.08),rgba(6,26,18,0.97))",
                  borderColor: "rgba(212,175,55,0.3)",
                }}>
                <p className="text-6xl" style={{ fontFamily: "var(--font-amiri)", direction: "rtl", color: color }}>
                  {vocab.word_ar}
                </p>
                <button
                  onClick={() => speak(vocab.word_ar)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)" }}>
                  <Volume2 size={13} style={{ color }} />
                  <span className="text-xs" style={{ color, fontFamily: "var(--font-dm-sans)" }}>Écouter</span>
                </button>
                <p className="text-lg font-semibold" style={{ color: "rgba(248,244,236,0.55)", fontFamily: "var(--font-dm-sans)" }}>
                  {vocab.translit}
                </p>
                <p className="text-base text-center" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {vocab.definition_fr}
                </p>
              </motion.div>
              {vocab.example && (
                <p className="text-sm italic opacity-45 text-center"
                  style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  {vocab.example}
                </p>
              )}
            </div>

            <motion.button
              onClick={() => setPhase("questions")}
              whileTap={{ scale: 0.97 }} transition={springTap}
              className="w-full rounded-full py-4 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg,${color},#8B6914)`, color: "#0A1A0E", fontFamily: "var(--font-dm-sans)" }}>
              Répondre aux questions <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* ─── Phase : questions ─── */}
        {phase === "questions" && (
          <motion.div key={`q${qIndex}`}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <QuestionCard
              question={data.questions[qIndex]}
              questionIndex={qIndex}
              total={data.questions.length}
              onAnswer={handleAnswer}
              color={color}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
