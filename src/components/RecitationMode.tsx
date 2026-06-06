"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Loader2, ChevronRight, RotateCcw, Volume2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { ageGroupToMode } from "@/hooks/useAgeMode";

// ── Types ────────────────────────────────────────────────────────

interface Ayah {
  numberInSurah: number;
  text: string;
}

interface WordError {
  word: string;
  position: number;
  suggestion: string;
}

interface TajwidIssue {
  type: string; // qalqala | ghunna | madd
  position: number;
}

interface ReciteResult {
  transcribed: string;
  expected: string;
  score: number;
  errors: WordError[];
  tajwid_issues: TajwidIssue[];
}

type RecordingState = "idle" | "recording" | "processing" | "result";

// ── Tajwid color map ─────────────────────────────────────────────

const TAJWID_LABELS: Record<string, { fr: string; ar: string; color: string }> = {
  qalqala: { fr: "Prononcez avec un léger écho", ar: "قلقلة", color: "#ef4444" },
  ghunna:  { fr: "Nasalisation",                 ar: "غُنَّة",  color: "#22c55e" },
  madd:    { fr: "Allongement",                  ar: "مَدّ",    color: "#3b82f6" },
};

// ── Helpers ──────────────────────────────────────────────────────

function feedbackConfig(score: number, isElder: boolean) {
  if (score >= 90) return {
    emoji: "🌟",
    title: "ما شاء الله",
    subtitle: "Excellent !",
    color: "var(--gold)",
    autoNext: true,
  };
  if (score >= 70) return {
    emoji: "👍",
    title: "Bien joué !",
    subtitle: isElder ? "Quelques ajustements à revoir :" : "Quelques mots à corriger :",
    color: "#22c55e",
    autoNext: false,
  };
  return {
    emoji: "💪",
    title: "On reprend ensemble",
    subtitle: "Écoute le récitateur puis réessaie.",
    color: "rgba(248,244,236,0.7)",
    autoNext: false,
  };
}

// ── Word highlight component ─────────────────────────────────────

function WordHighlight({
  words,
  errors,
  currentWordIdx,
  state,
}: {
  words: string[];
  errors: WordError[];
  currentWordIdx: number;
  state: RecordingState;
}) {
  const errorPositions = new Set(errors.map(e => e.position));

  return (
    <p
      className="text-right leading-loose"
      style={{
        fontFamily: "var(--font-amiri)",
        direction: "rtl",
        fontSize: 26,
        color: "var(--text)",
      }}
    >
      {words.map((word, i) => {
        let color = "var(--text)";
        let bg    = "transparent";

        if (state === "result") {
          color = errorPositions.has(i) ? "#ef4444" : "#22c55e";
        } else if (state === "recording" && i === currentWordIdx) {
          color = "var(--gold)";
          bg    = "rgba(212,175,55,0.15)";
        }

        return (
          <span
            key={i}
            style={{
              color,
              background: bg,
              borderRadius: 4,
              padding: "0 2px",
              transition: "color 0.3s, background 0.3s",
            }}
          >
            {word}{" "}
          </span>
        );
      })}
    </p>
  );
}

// ── Mic button ───────────────────────────────────────────────────

function MicButton({
  state,
  onPress,
  onStop,
}: {
  state: RecordingState;
  onPress: () => void;
  onStop: () => void;
}) {
  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  return (
    <motion.button
      onPointerDown={onPress}
      onPointerUp={isRecording ? onStop : undefined}
      onPointerLeave={isRecording ? onStop : undefined}
      disabled={isProcessing}
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: 80,
        height: 80,
        background: isRecording
          ? "rgba(239,68,68,0.15)"
          : isProcessing
            ? "rgba(212,175,55,0.1)"
            : "rgba(5,92,63,0.5)",
        border: `2px solid ${
          isRecording ? "#ef4444" : isProcessing ? "var(--gold)" : "rgba(5,92,63,0.8)"
        }`,
      }}
      animate={isRecording ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
    >
      {isProcessing ? (
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--gold)" }} />
      ) : isRecording ? (
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 3,
            background: "#ef4444",
            display: "block",
          }}
        />
      ) : (
        <Mic size={28} style={{ color: "var(--gold)" }} />
      )}
    </motion.button>
  );
}

// ── Main component ───────────────────────────────────────────────

export interface RecitationModeProps {
  surahNumber: number;
  surahName: string;
  surahNameAr: string;
  ayahs: Ayah[];
  startIndex?: number;
  onClose: () => void;
}

export default function RecitationMode({
  surahNumber,
  surahName,
  surahNameAr,
  ayahs,
  startIndex = 0,
  onClose,
}: RecitationModeProps) {
  const settings  = storage.getSettings();
  const ageMode   = ageGroupToMode(settings.ageGroup);
  const isElder   = ageMode === "elder";
  const isKids    = ageMode === "kids";
  const fontSize  = isKids || isElder ? 28 : 24;

  const [currentIdx,     setCurrentIdx]     = useState(startIndex);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [result,         setResult]         = useState<ReciteResult | null>(null);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [showAudio,      setShowAudio]      = useState(false);

  const mediaRef    = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ayah = ayahs[currentIdx];
  const words = ayah?.text.split(" ").filter(Boolean) ?? [];
  const isLast = currentIdx >= ayahs.length - 1;

  // Auto-advance word highlight during recording
  useEffect(() => {
    if (recordingState !== "recording") {
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
      setCurrentWordIdx(0);
      return;
    }
    const msPerWord = Math.max(800, 3000 / Math.max(words.length, 1));
    wordTimerRef.current = setInterval(() => {
      setCurrentWordIdx(prev => {
        if (prev < words.length - 1) return prev + 1;
        clearInterval(wordTimerRef.current!);
        return prev;
      });
    }, msPerWord);
    return () => { if (wordTimerRef.current) clearInterval(wordTimerRef.current); };
  }, [recordingState, words.length]);

  const startRecording = useCallback(async () => {
    if (recordingState !== "idle") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(500);
      mediaRef.current = mr;
      setRecordingState("recording");
      setResult(null);
    } catch {
      alert("Microphone inaccessible. Vérifiez les permissions.");
    }
  }, [recordingState]);

  const stopRecording = useCallback(async () => {
    if (recordingState !== "recording" || !mediaRef.current) return;
    setRecordingState("processing");

    await new Promise<void>(resolve => {
      mediaRef.current!.onstop = () => resolve();
      mediaRef.current!.stop();
      mediaRef.current!.stream.getTracks().forEach(t => t.stop());
    });

    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });

      const fd = new FormData();
      fd.append("audio",    blob,       "recitation.webm");
      fd.append("expected", ayah.text);

      const token = (await import("@/lib/supabase")).supabase.auth;
      const { data: { session } } = await token.getSession();

      const res = await fetch("/api/quran/recite", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: fd,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ReciteResult = await res.json();
      setResult(data);
      setRecordingState("result");
    } catch (err) {
      console.error("[RecitationMode]", err);
      setRecordingState("idle");
      alert("Erreur lors de l'analyse. Réessayez.");
    }
  }, [recordingState, ayah]);

  function nextAyah() {
    if (isLast) { onClose(); return; }
    setCurrentIdx(prev => prev + 1);
    setRecordingState("idle");
    setResult(null);
  }

  function retry() {
    setRecordingState("idle");
    setResult(null);
  }

  const fb = result ? feedbackConfig(result.score, isElder) : null;

  // Detect unique tajwid types in this ayah
  const tajwidTypes = result
    ? [...new Set(result.tajwid_issues.map(t => t.type))]
    : [...new Set(
        detectLocalTajwid(ayah?.text ?? "").map(t => t.type)
      )];

  const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNumber}${String(ayah?.numberInSurah).padStart(3, "0")}.mp3`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1,  y: 0  }}
      exit={  { opacity: 0,  y: 20  }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#0A0F0D" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)" }}>
          <X size={16} />
        </button>
        <div className="text-center">
          <p style={{ fontFamily: "var(--font-amiri)", fontSize: 18, color: "var(--gold)", direction: "rtl" }}>
            {surahNameAr}
          </p>
          <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {surahName} · Verset {ayah?.numberInSurah ?? 1} / {ayahs.length}
          </p>
        </div>
        {/* Score circle */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2"
          style={{
            borderColor: result
              ? result.score >= 90 ? "var(--gold)"
              : result.score >= 70 ? "#22c55e"
              : "rgba(255,255,255,0.2)"
              : "rgba(255,255,255,0.1)",
            color: result ? "var(--gold)" : "rgba(255,255,255,0.3)",
          }}>
          <span className="text-xs font-bold" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {result ? result.score : "—"}
          </span>
        </div>
      </div>

      {/* Verse area */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="rounded-2xl border p-5"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>

          {/* Tajwid color legend */}
          {tajwidTypes.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {tajwidTypes.map(type => {
                const t = TAJWID_LABELS[type];
                if (!t) return null;
                return (
                  <span key={type}
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{
                      background: `${t.color}22`,
                      color: t.color,
                      border: `1px solid ${t.color}44`,
                      fontFamily: "var(--font-dm-sans)",
                    }}>
                    {isElder ? `${t.ar} · ` : ""}{t.fr}
                  </span>
                );
              })}
            </div>
          )}

          {/* Verse text with word highlights */}
          {ayah && (
            <WordHighlight
              words={words}
              errors={result?.errors ?? []}
              currentWordIdx={currentWordIdx}
              state={recordingState}
            />
          )}

          {/* Audio player for low-score or elder */}
          {(isElder || (result && result.score < 70)) && (
            <div className="mt-4">
              {showAudio ? (
                <audio
                  src={audioUrl}
                  controls
                  autoPlay
                  className="w-full rounded-xl"
                  onEnded={() => setShowAudio(false)}
                  style={{ height: 40 }}
                />
              ) : (
                <button
                  onClick={() => setShowAudio(true)}
                  className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm"
                  style={{
                    borderColor: "rgba(212,175,55,0.3)",
                    color: "var(--gold)",
                    fontFamily: "var(--font-dm-sans)",
                  }}>
                  <Volume2 size={15} /> Écouter le récitateur
                </button>
              )}
            </div>
          )}
        </div>

        {/* Feedback panel */}
        <AnimatePresence>
          {fb && result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1,  y: 0  }}
              exit={  { opacity: 0,  y: 10  }}
              className="mt-4 rounded-2xl border p-5"
              style={{ borderColor: `${fb.color}33`, background: `${fb.color}0a` }}>

              <div className="flex items-center gap-3 mb-3">
                <span style={{ fontSize: 28 }}>{fb.emoji}</span>
                <div>
                  <p className="font-bold text-base"
                    style={{ color: fb.color, fontFamily: "var(--font-bricolage)" }}>
                    {fb.title}
                  </p>
                  <p className="text-sm opacity-70"
                    style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                    {fb.subtitle}
                  </p>
                </div>
              </div>

              {/* Error list */}
              {result.errors.length > 0 && result.score < 90 && (
                <div className="flex flex-col gap-1.5 mb-4">
                  {result.errors.slice(0, 4).map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm"
                      style={{ fontFamily: "var(--font-dm-sans)", color: "var(--text)" }}>
                      <span className="opacity-50">{e.word || "(manquant)"}</span>
                      <span className="opacity-30">→</span>
                      <span style={{ color: "#22c55e", fontFamily: "var(--font-amiri)" }}>
                        {e.suggestion}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Transcription debug (dev only) */}
              {process.env.NODE_ENV === "development" && (
                <p className="text-xs opacity-30 mb-3 break-all"
                  style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)", direction: "rtl" }}>
                  {result.transcribed}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!fb.autoNext && (
                  <button onClick={retry}
                    className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold"
                    style={{
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "var(--text)",
                      fontFamily: "var(--font-dm-sans)",
                    }}>
                    <RotateCcw size={14} /> Réessayer
                  </button>
                )}
                <button onClick={nextAyah}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{
                    background: "rgba(5,92,63,0.5)",
                    border: "1px solid rgba(5,92,63,0.8)",
                    color: "var(--text)",
                    fontFamily: "var(--font-dm-sans)",
                  }}>
                  {isLast ? "Terminer" : "Verset suivant"} <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Record button */}
      <div
        className="flex flex-col items-center gap-3 px-5 py-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {recordingState === "idle"       ? (isElder || isKids ? "Appuyez et maintenez pour réciter" : "Appuyez pour réciter")
           : recordingState === "recording"  ? "Relâchez quand vous avez terminé…"
           : recordingState === "processing" ? "Analyse en cours…"
           : ""}
        </p>
        <MicButton
          state={recordingState}
          onPress={startRecording}
          onStop={stopRecording}
        />
      </div>
    </motion.div>
  );
}

// ── Local tajwid detection (client-side, same logic as server) ───

function detectLocalTajwid(text: string) {
  const issues: { type: string; position: number }[] = [];
  const words = text.split(/\s+/);
  words.forEach((word, idx) => {
    if (/[قطبجد]/.test(word)) issues.push({ type: "qalqala", position: idx });
    if (/[نم]ّ/.test(word))   issues.push({ type: "ghunna",  position: idx });
    if (/[آأإا][َُِ]|[وي](?=ْ)/.test(word)) issues.push({ type: "madd", position: idx });
  });
  return issues;
}
