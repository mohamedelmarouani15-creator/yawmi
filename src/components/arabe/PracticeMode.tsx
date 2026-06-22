"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Mic, PenLine, CheckCircle2, ChevronRight, RotateCcw } from "lucide-react";
import type { Lesson } from "@/lib/arabe/curriculum";
import PronunciationButton from "./PronunciationButton";
import VoiceInput from "./VoiceInput";
import WritingPhotoCapture from "./WritingPhotoCapture";
import { arabeProgress } from "@/lib/arabe/progress";

type Step = "listen" | "repeat" | "write";

const STEPS: { id: Step; label: string; icon: React.ComponentType<{ size?: number }>; desc: string }[] = [
  { id: "listen", label: "Écoute",     icon: Volume2,  desc: "L'app prononce les mots — écoute attentivement" },
  { id: "repeat", label: "Répétition", icon: Mic,      desc: "Répète chaque mot à voix haute avec ton micro" },
  { id: "write",  label: "Écriture",   icon: PenLine,  desc: "Trace les lettres principales dans la zone de dessin" },
];

interface PracticeModeProps {
  lesson: Lesson;
  color: string;
}

export default function PracticeMode({ lesson, color }: PracticeModeProps) {
  const [step, setStep]               = useState<Step>("listen");
  const [wordIdx, setWordIdx]         = useState(0);
  const [, setListenDone]             = useState<Set<number>>(new Set());
  const [repeatScores, setRepeatScores] = useState<Record<number, number>>({});
  const [writeDone, setWriteDone]     = useState<Set<number>>(new Set());
  const [practiceComplete, setPracticeComplete] = useState(false);

  const vocab = lesson.vocab;
  const currentWord = vocab[wordIdx];

  // Alphabet lessons get writing step; others skip it
  const isAlphabetLesson = lesson.id.startsWith("alphabet");
  const availableSteps = isAlphabetLesson ? STEPS : STEPS.filter(s => s.id !== "write");

  const stepIndex  = availableSteps.findIndex(s => s.id === step);

  function markListenDone(idx: number) {
    setListenDone(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }

  function handleRepeatResult(idx: number, score: number) {
    setRepeatScores(prev => ({ ...prev, [idx]: score }));
    // Record pronunciation stat
    arabeProgress.recordPronunciation(lesson.id, score >= 60);
  }

  function handleWriteValidated(idx: number) {
    setWriteDone(prev => {
      const next = new Set(prev);
      next.add(idx);
      arabeProgress.recordWriting(lesson.id);
      return next;
    });
  }

  function nextWord() {
    if (wordIdx < vocab.length - 1) {
      setWordIdx(wordIdx + 1);
    } else {
      // All words done for this step → advance step
      const nextStep = availableSteps[stepIndex + 1];
      if (nextStep) {
        setStep(nextStep.id);
        setWordIdx(0);
      } else {
        setPracticeComplete(true);
      }
    }
  }

  function reset() {
    setStep("listen");
    setWordIdx(0);
    setListenDone(new Set());
    setRepeatScores({});
    setWriteDone(new Set());
    setPracticeComplete(false);
  }

  if (practiceComplete) {
    const avgScore = Object.values(repeatScores).length > 0
      ? Math.round(Object.values(repeatScores).reduce((a, b) => a + b, 0) / Object.values(repeatScores).length)
      : null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-8"
      >
        <div className="h-16 w-16 rounded-full flex items-center justify-center"
          style={{ background: `${color}20`, border: `2px solid ${color}` }}>
          <CheckCircle2 size={32} style={{ color }} />
        </div>
        <div className="text-center">
          <p className="text-lg font-black" style={{ color, fontFamily: "var(--font-bricolage)" }}>
            Pratique terminée !
          </p>
          {avgScore !== null && (
            <p className="text-sm opacity-70 mt-1" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Score moyen prononciation : <span style={{ color }} className="font-bold">{avgScore}%</span>
            </p>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={reset}
          className="flex items-center gap-2 rounded-2xl px-5 py-3"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}
        >
          <RotateCcw size={14} />
          <span className="text-sm font-semibold">Recommencer</span>
        </motion.button>
      </motion.div>
    );
  }

  const currentStepMeta = availableSteps[stepIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Step progress */}
      <div className="flex gap-2">
        {availableSteps.map((s, i) => {
          const Icon = s.icon;
          const isActive   = s.id === step;
          const isComplete = i < stepIndex;
          return (
            <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center`}
                style={{
                  background: isComplete
                    ? "rgba(34,197,94,0.2)"
                    : isActive
                      ? `${color}22`
                      : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isComplete ? "#22c55e" : isActive ? color : "rgba(255,255,255,0.1)"}`,
                  color: isComplete ? "#22c55e" : isActive ? color : "rgba(248,244,236,0.3)",
                }}>
                {isComplete ? <CheckCircle2 size={14} /> : <Icon size={14} />}
              </div>
              <span className="text-[9px] font-bold"
                style={{ color: isActive ? color : "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)" }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step instruction */}
      <div className="rounded-xl px-3 py-2"
        style={{ background: `${color}0a`, border: `1px solid ${color}20` }}>
        <p className="text-xs" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
          {currentStepMeta.desc}
        </p>
      </div>

      {/* Word counter */}
      <div className="flex items-center justify-between">
        <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Mot {wordIdx + 1} / {vocab.length}
        </p>
        <div className="flex gap-1">
          {vocab.map((_, i) => (
            <div key={i} className="h-1.5 w-4 rounded-full"
              style={{ background: i <= wordIdx ? color : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Word card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${step}-${wordIdx}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-2xl px-5 py-5 flex flex-col gap-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Arabic word */}
          <div className="text-center">
            <p className="text-5xl mb-1" style={{ color, fontFamily: "var(--font-amiri)", direction: "rtl" }}>
              {currentWord.arabic}
            </p>
            <p className="text-sm font-semibold opacity-60"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {currentWord.transliteration}
            </p>
            <p className="text-xs opacity-40 mt-0.5"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {currentWord.french}
            </p>
          </div>

          {/* Step-specific content */}
          {step === "listen" && (
            <div className="flex flex-col items-center gap-3">
              <PronunciationButton
                arabic={currentWord.arabic}
                transliteration={currentWord.transliteration}
                size="md"
                color={color}
              />
              <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Appuie sur le bouton pour écouter
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { markListenDone(wordIdx); nextWord(); }}
                className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold"
                style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
              >
                Suivant <ChevronRight size={14} />
              </motion.button>
            </div>
          )}

          {step === "repeat" && (
            <div className="flex flex-col items-center gap-3">
              <VoiceInput
                expectedText={currentWord.arabic}
                transliteration={currentWord.transliteration}
                color={color}
                onResult={score => handleRepeatResult(wordIdx, score)}
              />
              <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Appuie sur le micro et prononce le mot
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={nextWord}
                className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold"
                style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
              >
                {repeatScores[wordIdx] !== undefined ? "Suivant" : "Passer"}
                <ChevronRight size={14} />
              </motion.button>
            </div>
          )}

          {step === "write" && (
            <div className="flex flex-col gap-3">
              <WritingPhotoCapture
                letter={currentWord.arabic}
                transliteration={currentWord.transliteration}
                french={currentWord.french}
                lessonId={lesson.id}
                color={color}
                onValidated={() => handleWriteValidated(wordIdx)}
              />
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={nextWord}
                className="flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold"
                style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}
              >
                {writeDone.has(wordIdx) ? "Suivant" : "Passer"}
                <ChevronRight size={14} />
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
