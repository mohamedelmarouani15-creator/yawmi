"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Loader2, CheckCircle2, XCircle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { getLessonById, LEVEL_META, LESSONS } from "@/lib/arabe/curriculum";
import { arabeProgress } from "@/lib/arabe/progress";
import { storage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { springTap } from "@/lib/motion";

interface ChatMsg { role: "user" | "prof"; text: string }

export default function LeconPage() {
  const { lecon } = useParams() as { lecon: string };
  const router = useRouter();
  const lesson = getLessonById(lecon);
  const settings = storage.getSettings();
  const ageGroup = settings.ageGroup ?? "18-35";
  const arabicLevel = settings.arabicLevel ?? "none";

  const [exerciseDone, setExerciseDone]   = useState(false);
  const [selected, setSelected]           = useState<number | null>(null);
  const [showResult, setShowResult]       = useState(false);
  const [correct, setCorrect]             = useState(false);
  const [chatOpen, setChatOpen]           = useState(false);
  const [messages, setMessages]           = useState<ChatMsg[]>([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [showVocab, setShowVocab]         = useState(true);
  const [showExamples, setShowExamples]   = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lesson) arabeProgress.setCurrentLesson(lesson.id);
  }, [lesson]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!lesson) return (
    <div className="flex items-center justify-center h-screen" style={{ background: "#020a05" }}>
      <p style={{ color: "var(--text)" }}>Leçon introuvable.</p>
    </div>
  );

  const meta = LEVEL_META[lesson.level];

  function handleAnswer(idx: number) {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx === lesson!.exercise.correct;
    setCorrect(isCorrect);
    arabeProgress.recordExercise(lesson!.id, isCorrect);
    setExerciseDone(true);
    // Auto-open chat with contextual message
    setTimeout(() => {
      setChatOpen(true);
      const prompt = isCorrect
        ? `J'ai bien répondu à l'exercice. Donne-moi une info bonus sur ce sujet.`
        : `J'ai fait une erreur à l'exercice. La bonne réponse était "${lesson!.exercise.options[lesson!.exercise.correct]}". Explique-moi pourquoi.`;
      sendToAI(prompt, isCorrect);
    }, 800);
  }

  async function sendToAI(msg: string, lastCorrect?: boolean) {
    setMessages(m => [...m, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/arabe/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          question: msg,
          lessonId: lesson!.id,
          lessonTitle: lesson!.title,
          lessonContent: lesson!.explanation,
          ageGroup,
          arabicLevel,
          lastExerciseCorrect: lastCorrect ?? correct,
          lastScore: showResult ? (correct ? 10 : 0) : null,
        }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "prof", text: data.answer ?? "Désolé, une erreur est survenue." }]);
    } catch {
      setMessages(m => [...m, { role: "prof", text: "Je ne peux pas répondre pour l'instant. Réessaie." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    sendToAI(msg);
  }

  // Age-based label
  const profLabel = ageGroup === "4-10" ? "Maître Nour 🌟" : "Ustadh Nour";

  return (
    <div className="flex flex-col min-h-screen pb-6" style={{ background: "#020a05" }}>

      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pt-safe-top pt-4 pb-3"
        style={{ background: "rgba(2,10,5,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${meta.color}22` }}>
        <div className="flex items-center gap-3">
          <motion.button onClick={() => router.back()} whileTap={{ scale: 0.9 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(248,244,236,0.5)" }}>
            <ArrowLeft size={16} />
          </motion.button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold rounded-full px-2 py-0.5"
                style={{ background: `${meta.color}20`, color: meta.color, fontFamily: "var(--font-dm-sans)", fontSize: 10 }}>
                {meta.icon} {meta.label}
              </span>
            </div>
            <h1 className="text-sm font-black leading-tight truncate"
              style={{ color: "var(--text)", fontFamily: "var(--font-bricolage)" }}>
              {lesson.title}
            </h1>
          </div>
          {arabeProgress.isCompleted(lesson.id) && (
            <CheckCircle2 size={18} style={{ color: meta.color, flexShrink: 0 }} />
          )}
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4 pt-4">

        {/* Arabic title */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-3 rounded-2xl"
          style={{ background: `${meta.color}0a`, border: `1px solid ${meta.color}25` }}>
          <p className="text-3xl" style={{ color: meta.color, fontFamily: "var(--font-amiri)", direction: "rtl" }}>
            {lesson.titleAr}
          </p>
          <p className="text-xs opacity-50 mt-1" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {lesson.subtitle}
          </p>
        </motion.div>

        {/* Explanation */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl px-4 py-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Cours</p>
          <p className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {lesson.explanation}
          </p>
        </motion.div>

        {/* Vocab */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <button className="flex items-center justify-between w-full px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)" }}
            onClick={() => setShowVocab(v => !v)}>
            <span className="text-xs font-bold uppercase tracking-widest opacity-50"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Vocabulaire</span>
            {showVocab ? <ChevronUp size={14} style={{ color: "rgba(248,244,236,0.3)" }} /> : <ChevronDown size={14} style={{ color: "rgba(248,244,236,0.3)" }} />}
          </button>
          <AnimatePresence>
            {showVocab && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                style={{ overflow: "hidden" }}>
                <div className="flex flex-col gap-2 px-4 pb-3 pt-1">
                  {lesson.vocab.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{ background: `${meta.color}0a`, border: `1px solid ${meta.color}20` }}>
                      <p className="text-xl shrink-0" style={{ color: meta.color, fontFamily: "var(--font-amiri)", direction: "rtl", minWidth: 60, textAlign: "right" }}>
                        {v.arabic}
                      </p>
                      <div className="flex-1">
                        <p className="text-xs font-semibold" style={{ color: "rgba(248,244,236,0.7)", fontFamily: "var(--font-dm-sans)" }}>
                          {v.transliteration}
                        </p>
                        <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                          {v.french}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Examples */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <button className="flex items-center justify-between w-full px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)" }}
            onClick={() => setShowExamples(v => !v)}>
            <span className="text-xs font-bold uppercase tracking-widest opacity-50"
              style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Exemples</span>
            {showExamples ? <ChevronUp size={14} style={{ color: "rgba(248,244,236,0.3)" }} /> : <ChevronDown size={14} style={{ color: "rgba(248,244,236,0.3)" }} />}
          </button>
          <AnimatePresence>
            {showExamples && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                style={{ overflow: "hidden" }}>
                <div className="flex flex-col gap-2 px-4 pb-3 pt-1">
                  {lesson.examples.map((ex, i) => (
                    <div key={i} className="rounded-xl px-3 py-2.5"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-lg mb-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-amiri)", direction: "rtl", textAlign: "right" }}>
                        {ex.arabic}
                      </p>
                      <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                        {ex.transliteration}
                      </p>
                      <p className="text-xs opacity-70 italic mt-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                        {ex.french}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Exercise */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl px-4 py-4"
          style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${meta.color}30` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: meta.color, fontFamily: "var(--font-dm-sans)" }}>Exercice</p>
          <p className="text-sm font-semibold mb-3 leading-snug"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {lesson.exercise.question}
          </p>
          <div className="flex flex-col gap-2">
            {lesson.exercise.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrectOpt = idx === lesson.exercise.correct;
              const bgColor =
                !showResult ? (isSelected ? `${meta.color}22` : "rgba(255,255,255,0.03)") :
                isCorrectOpt ? "rgba(34,197,94,0.15)" :
                isSelected ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.02)";
              const borderColor =
                !showResult ? (isSelected ? meta.color : "rgba(255,255,255,0.08)") :
                isCorrectOpt ? "#22c55e" :
                isSelected ? "#f87171" : "rgba(255,255,255,0.05)";
              return (
                <motion.button key={idx} onClick={() => handleAnswer(idx)}
                  disabled={showResult}
                  whileTap={!showResult ? { scale: 0.97 } : {}}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left"
                  style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
                  <span className="text-xs font-bold shrink-0 h-5 w-5 flex items-center justify-center rounded-full"
                    style={{ background: isSelected ? meta.color : "rgba(255,255,255,0.08)", color: isSelected ? "#000" : "rgba(248,244,236,0.5)", fontFamily: "var(--font-dm-sans)" }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {opt}
                  </span>
                  {showResult && isCorrectOpt && <CheckCircle2 size={14} className="ml-auto shrink-0" style={{ color: "#22c55e" }} />}
                  {showResult && isSelected && !isCorrectOpt && <XCircle size={14} className="ml-auto shrink-0" style={{ color: "#f87171" }} />}
                </motion.button>
              );
            })}
          </div>

          {/* Result feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-xl px-3 py-2.5"
                style={{ background: correct ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${correct ? "#22c55e44" : "#f8717144"}` }}>
                <p className="text-xs font-bold mb-0.5" style={{ color: correct ? "#22c55e" : "#f87171", fontFamily: "var(--font-dm-sans)" }}>
                  {correct ? "✓ Bonne réponse !" : "✗ Pas tout à fait…"}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(248,244,236,0.7)", fontFamily: "var(--font-dm-sans)" }}>
                  {lesson.exercise.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Chat button / panel */}
        <div className="flex flex-col gap-3">
          <motion.button whileTap={{ scale: 0.97 }} transition={springTap}
            onClick={() => setChatOpen(o => !o)}
            className="flex items-center gap-2 rounded-2xl px-4 py-3 w-full"
            style={{ background: chatOpen ? `${meta.color}18` : "rgba(255,255,255,0.04)", border: `1px solid ${chatOpen ? meta.color + "50" : "rgba(255,255,255,0.1)"}` }}>
            <MessageSquare size={16} style={{ color: meta.color }} />
            <span className="text-sm font-semibold" style={{ color: chatOpen ? meta.color : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              Demander à {profLabel}
            </span>
            <span className="ml-auto text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
              {chatOpen ? "↑" : "↓"}
            </span>
          </motion.button>

          <AnimatePresence>
            {chatOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}>
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${meta.color}25`, background: "rgba(0,0,0,0.3)" }}>
                  {/* Prof header */}
                  <div className="flex items-center gap-2 px-4 py-3"
                    style={{ borderBottom: `1px solid rgba(255,255,255,0.06)`, background: `${meta.color}08` }}>
                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-sm"
                      style={{ background: `${meta.color}22` }}>📚</div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: meta.color, fontFamily: "var(--font-dm-sans)" }}>{profLabel}</p>
                      <p className="text-[9px] opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Prof d&apos;arabe islamique · IA</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex flex-col gap-2 px-3 py-3 max-h-64 overflow-y-auto">
                    {messages.length === 0 && (
                      <p className="text-xs text-center opacity-30 py-4" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                        Pose une question sur cette leçon…
                      </p>
                    )}
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[85%] rounded-2xl px-3 py-2"
                          style={{
                            background: msg.role === "user" ? `${meta.color}22` : "rgba(255,255,255,0.06)",
                            border: `1px solid ${msg.role === "user" ? meta.color + "40" : "rgba(255,255,255,0.08)"}`,
                          }}>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap"
                            style={{ color: msg.role === "user" ? meta.color : "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl px-3 py-2 flex items-center gap-2"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <Loader2 size={12} className="animate-spin" style={{ color: meta.color }} />
                          <span className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                            {profLabel} réfléchit…
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex items-center gap-2 px-3 pb-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
                    <input ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSend()}
                      placeholder="Ta question…"
                      className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "var(--text)",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    />
                    <motion.button onClick={handleSend} disabled={!input.trim() || loading}
                      whileTap={{ scale: 0.9 }}
                      className="h-8 w-8 flex items-center justify-center rounded-xl disabled:opacity-30"
                      style={{ background: meta.color, color: "#000" }}>
                      <Send size={13} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {exerciseDone && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 pb-4">
            <motion.button onClick={() => router.push("/arabe")}
              whileTap={{ scale: 0.96 }} transition={springTap}
              className="flex-1 rounded-2xl py-3.5 text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text)", fontFamily: "var(--font-dm-sans)", border: "1px solid rgba(255,255,255,0.1)" }}>
              ← Mes leçons
            </motion.button>
            <motion.button onClick={() => {
              const idx = LESSONS.findIndex(l => l.id === lesson.id);
              const next = LESSONS[idx + 1];
              if (next) router.push(`/arabe/${next.id}`);
              else router.push("/arabe");
            }}
              whileTap={{ scale: 0.96 }} transition={springTap}
              className="flex-1 rounded-2xl py-3.5 text-sm font-black"
              style={{ background: `linear-gradient(135deg,${meta.color},#055C3F)`, color: "#0a0f0d", fontFamily: "var(--font-bricolage)" }}>
              Leçon suivante →
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
