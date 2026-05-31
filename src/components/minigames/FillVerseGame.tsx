"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/lib/game/types";
import { useArabicAudio } from "@/hooks/useArabicAudio";

interface Props {
  question: Question;
  onComplete: (isCorrect: boolean) => void;
  color: string;
}

export default function FillVerseGame({ question, onComplete, color }: Props) {
  const verse        = question.minigameData?.verse ?? question.question;
  const verseTranslit = question.minigameData?.verseTranslit;
  const parts        = verse.split("___");
  const correctOption = question.options.find(o => o.correct);
  const { speak, speaking } = useArabicAudio();

  const [selected, setSelected]   = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === correctOption?.text;

  const submit = useCallback(() => {
    if (!selected) return;
    setSubmitted(true);
    setTimeout(() => onComplete(selected === correctOption?.text), 1200);
  }, [selected, correctOption, onComplete]);

  return (
    <div className="flex flex-col gap-5">
      {/* Verse display with blank */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(212,175,55,0.04)",
          border: "1px solid rgba(212,175,55,0.15)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest"
            style={{ color: "rgba(212,175,55,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            Complète le verset
          </p>
          {/* Audio button */}
          <motion.button
            onClick={() => speak(verse.replace("___", "..."))}
            whileTap={{ scale: 0.9 }}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: speaking ? "rgba(212,175,55,0.25)" : "var(--gold-faint)", border: "1px solid rgba(212,175,55,0.3)" }}
            aria-label="Écouter le verset"
          >
            <motion.span
              animate={speaking ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.6, repeat: speaking ? Infinity : 0 }}
              style={{ fontSize: 12 }}
            >
              {speaking ? "🔊" : "▶"}
            </motion.span>
          </motion.button>
        </div>
        <p
          className="text-lg leading-relaxed text-center"
          style={{
            color: "var(--text)",
            fontFamily: "var(--font-amiri)",
            direction: "rtl",
          }}
        >
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <motion.span
                  animate={submitted ? {} : { opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block px-3 mx-1 rounded-lg"
                  style={{
                    background: submitted
                      ? isCorrect ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"
                      : selected
                      ? `${color}25`
                      : "rgba(212,175,55,0.1)",
                    color: submitted
                      ? isCorrect ? "#4ade80" : "#f87171"
                      : selected ? color : "rgba(212,175,55,0.5)",
                    border: `1px dashed ${submitted ? (isCorrect ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)") : `${color}40`}`,
                    minWidth: 80,
                    textAlign: "center",
                    fontFamily: "var(--font-amiri)",
                  }}
                >
                  {selected ?? "___"}
                </motion.span>
              )}
            </span>
          ))}
        </p>
        {/* Translittération */}
        {verseTranslit && (
          <p className="text-xs text-center mt-2 italic"
            style={{ color: "var(--gold-dim)", fontFamily: "var(--font-dm-sans)" }}>
            {verseTranslit}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {question.options.map((opt, idx) => {
          const isSelected = selected === opt.text;
          const showFeedback = submitted;
          const isOptCorrect = opt.correct;

          let bg = "rgba(255,255,255,0.02)";
          let border = "rgba(255,255,255,0.07)";
          let textC = "var(--text)";

          if (showFeedback) {
            if (isOptCorrect) { bg = "rgba(74,222,128,0.09)"; border = "rgba(74,222,128,0.4)"; textC = "#4ade80"; }
            else if (isSelected && !isOptCorrect) { bg = "rgba(248,113,113,0.09)"; border = "rgba(248,113,113,0.4)"; textC = "#f87171"; }
          } else if (isSelected) {
            bg = `${color}14`; border = color; textC = color;
          }

          return (
            <motion.button
              key={idx}
              onClick={() => !submitted && setSelected(opt.text)}
              whileTap={!submitted ? { scale: 0.96 } : {}}
              className="rounded-xl border py-2.5 px-2 text-center flex flex-col items-center gap-0.5"
              style={{ background: bg, borderColor: border }}
            >
              <span style={{ color: textC, fontSize: 15, fontFamily: "var(--font-amiri)", direction: "rtl" }}>
                {opt.text}
              </span>
              {opt.transliteration && (
                <span style={{ color: `${textC}70`, fontSize: 10, fontFamily: "var(--font-dm-sans)", fontStyle: "italic" }}>
                  {opt.transliteration}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation after submit */}
      <AnimatePresence>
        {submitted && !isCorrect && correctOption && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-center"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            Bonne réponse : <span style={{ color: "#4ade80", fontFamily: "var(--font-amiri)" }}>{correctOption.text}</span>
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        onClick={submit}
        disabled={!selected || submitted}
        whileTap={selected && !submitted ? { scale: 0.97 } : {}}
        className="w-full rounded-full py-3.5 text-sm font-semibold"
        style={{
          background: selected && !submitted
            ? `linear-gradient(135deg,${color},#055C3F)`
            : "rgba(255,255,255,0.06)",
          color: selected && !submitted ? "var(--text)" : "var(--text-dim)",
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        Valider
      </motion.button>
    </div>
  );
}
