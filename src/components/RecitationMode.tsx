"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Loader2, ChevronRight, RotateCcw, Volume2, Play } from "lucide-react";
import { saveRecitation } from "@/lib/quran-recitation";
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
  type: string;
  position: number;
}

interface ReciteResult {
  transcribed: string;
  expected: string;
  score: number;
  errors: WordError[];
  tajwid_issues: TajwidIssue[];
  debug?: { transcribed_normalized: string; expected_normalized: string };
}

interface CoachResponse {
  encouragement: string;
  tajwid?:        string;
  pronunciation?: string;
  tafsir?:        string;
  next_focus?:    string;
  agents:         string[];
}

type RecordingState = "idle" | "recording" | "processing" | "result";
type GuidedPhase   = "listen" | "segments" | "full";

// ── Constants ────────────────────────────────────────────────────

const TAJWID_LABELS: Record<string, { fr: string; ar: string; color: string }> = {
  qalqala: { fr: "Léger écho",    ar: "قلقلة", color: "#ef4444" },
  ghunna:  { fr: "Nasalisation",  ar: "غُنَّة",  color: "#22c55e" },
  madd:    { fr: "Allongement",   ar: "مَدّ",    color: "#3b82f6" },
};

// ── Helpers ──────────────────────────────────────────────────────

function chunkWords(words: string[], maxGroups = 4): string[][] {
  if (words.length === 0) return [];
  const size = Math.ceil(words.length / Math.min(maxGroups, words.length));
  const out: string[][] = [];
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size));
  return out;
}

function feedbackConfig(score: number, isElder: boolean) {
  if (score >= 90) return {
    emoji: "🌟", title: "ما شاء الله", subtitle: "Excellent !",
    color: "var(--gold)", autoNext: true,
  };
  if (score >= 70) return {
    emoji: "👍", title: "Bien joué !",
    subtitle: isElder ? "Quelques ajustements à revoir :" : "Quelques mots à corriger :",
    color: "#22c55e", autoNext: false,
  };
  return {
    emoji: "💪", title: "On reprend ensemble",
    subtitle: "Écoute puis réessaie.",
    color: "rgba(248,244,236,0.7)", autoNext: false,
  };
}

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

function ayahAudioUrl(surahNumber: number, ayahNumber: number) {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNumber}${String(ayahNumber).padStart(3, "0")}.mp3`;
}

// ── Sub-components ───────────────────────────────────────────────

function WordHighlight({
  words,
  errors,
  currentWordIdx,
  state,
  highlightRange,
  fontSize = 26,
}: {
  words: string[];
  errors: WordError[];
  currentWordIdx: number;
  state: RecordingState;
  highlightRange?: [number, number]; // [start, end] inclusive — for segment mode
  fontSize?: number;
}) {
  const errorPositions = new Set(errors.map(e => e.position));

  return (
    <p
      className="text-right leading-loose"
      style={{ fontFamily: "var(--font-amiri)", direction: "rtl", fontSize, color: "var(--text)" }}
    >
      {words.map((word, i) => {
        const inRange = highlightRange ? i >= highlightRange[0] && i <= highlightRange[1] : true;
        let color = inRange ? "var(--text)" : "rgba(248,244,236,0.2)";
        let bg    = "transparent";

        if (state === "result" && inRange) {
          color = errorPositions.has(i) ? "#ef4444" : "#22c55e";
        } else if (state === "recording" && i === currentWordIdx && inRange) {
          color = "var(--gold)";
          bg    = "rgba(212,175,55,0.15)";
        }

        return (
          <span key={i} style={{ color, background: bg, borderRadius: 4, padding: "0 2px", transition: "color 0.3s, background 0.3s" }}>
            {word}{" "}
          </span>
        );
      })}
    </p>
  );
}

function MicButton({ state, onPress, onStop, size = 80 }: {
  state: RecordingState;
  onPress: () => void;
  onStop: () => void;
  size?: number;
}) {
  const isRecording  = state === "recording";
  const isProcessing = state === "processing";

  return (
    <motion.button
      onPointerDown={onPress}
      onPointerUp={isRecording ? onStop : undefined}
      onPointerLeave={isRecording ? onStop : undefined}
      disabled={isProcessing}
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: size, height: size,
        background: isRecording ? "rgba(239,68,68,0.15)" : isProcessing ? "rgba(212,175,55,0.1)" : "rgba(5,92,63,0.5)",
        border: `2px solid ${isRecording ? "#ef4444" : isProcessing ? "var(--gold)" : "rgba(5,92,63,0.8)"}`,
      }}
      animate={isRecording ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
    >
      {isProcessing ? (
        <Loader2 size={size * 0.35} className="animate-spin" style={{ color: "var(--gold)" }} />
      ) : isRecording ? (
        <span style={{ width: size * 0.22, height: size * 0.22, borderRadius: 3, background: "#ef4444", display: "block" }} />
      ) : (
        <Mic size={size * 0.35} style={{ color: "var(--gold)" }} />
      )}
    </motion.button>
  );
}

// ── Guided phases ─────────────────────────────────────────────────

function StepIndicator({ phase, segmentIdx, totalSegments }: {
  phase: GuidedPhase;
  segmentIdx: number;
  totalSegments: number;
}) {
  const steps = [
    { id: "listen",   label: "Écoute" },
    { id: "segments", label: "Répète" },
    { id: "full",     label: "Récite" },
  ];
  const activeIdx = steps.findIndex(s => s.id === phase);

  return (
    <div className="flex items-center justify-center gap-3 py-3">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: i < activeIdx ? "#22c55e" : i === activeIdx ? "var(--gold)" : "rgba(255,255,255,0.08)",
                color: i <= activeIdx ? "#0A0F0D" : "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {i < activeIdx ? "✓" : i + 1}
            </div>
            <span className="text-xs" style={{
              color: i === activeIdx ? "var(--gold)" : "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-dm-sans)",
            }}>
              {step.label}
              {step.id === "segments" && phase === "segments"
                ? ` ${segmentIdx + 1}/${totalSegments}`
                : ""}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 24, height: 1, background: i < activeIdx ? "#22c55e44" : "rgba(255,255,255,0.08)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Listen phase ──────────────────────────────────────────────────

function ListenPhase({
  ayah,
  surahNumber,
  words,
  isElder,
  tajwidTypes,
  fontSize,
  onNext,
}: {
  ayah: Ayah;
  surahNumber: number;
  words: string[];
  isElder: boolean;
  tajwidTypes: string[];
  fontSize: number;
  onNext: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const url = ayahAudioUrl(surahNumber, ayah.numberInSurah);

  function play() {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlaying(false);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setPlaying(true);
  }

  // Auto-play on mount
  useEffect(() => { play(); return () => { audioRef.current?.pause(); }; }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Verse display */}
      <div className="w-full rounded-2xl border p-5"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        {tajwidTypes.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tajwidTypes.map(type => {
              const t = TAJWID_LABELS[type];
              if (!t) return null;
              return (
                <span key={type} className="rounded-full px-2 py-0.5 text-xs"
                  style={{ background: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44`, fontFamily: "var(--font-dm-sans)" }}>
                  {isElder ? `${t.ar} · ` : ""}{t.fr}
                </span>
              );
            })}
          </div>
        )}
        <p className="text-right leading-loose"
          style={{ fontFamily: "var(--font-amiri)", direction: "rtl", fontSize, color: "var(--text)" }}>
          {words.join(" ")}
        </p>
      </div>

      {/* Play controls */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          onClick={play}
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: playing ? "rgba(212,175,55,0.15)" : "rgba(5,92,63,0.5)",
            border: `2px solid ${playing ? "var(--gold)" : "rgba(5,92,63,0.8)"}`,
          }}
          animate={playing ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={{ repeat: playing ? Infinity : 0, duration: 1.2 }}
        >
          {playing
            ? <span style={{ width: 14, height: 14, borderRadius: 2, background: "var(--gold)", display: "block" }} />
            : <Play size={22} style={{ color: "var(--gold)" }} />
          }
        </motion.button>
        <button onClick={play}
          className="text-xs opacity-50"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Écouter encore
        </button>
      </div>

      <button onClick={onNext}
        className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
        style={{ background: "rgba(5,92,63,0.5)", border: "1px solid rgba(5,92,63,0.8)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
        Répéter mot par mot <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ── Segment phase ─────────────────────────────────────────────────

function SegmentPhase({
  words,
  segments,
  segmentIdx,
  surahNumber,
  ayahNumber,
  isElder,
  fontSize,
  onSegmentDone,
}: {
  words: string[];
  segments: string[][];
  segmentIdx: number;
  surahNumber: number;
  ayahNumber: number;
  isElder: boolean;
  fontSize: number;
  onSegmentDone: (score: number) => void;
}) {
  const [recState,  setRecState]  = useState<RecordingState>("idle");
  const [result,    setResult]    = useState<ReciteResult | null>(null);
  const [showAudio, setShowAudio] = useState(false);
  const [wordIdx,   setWordIdx]   = useState(0);

  const mediaRef  = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const segment  = segments[segmentIdx] ?? [];
  const expected = segment.join(" ");
  // Global word offset for highlight
  const offset   = segments.slice(0, segmentIdx).reduce((a, s) => a + s.length, 0);
  const range: [number, number] = [offset, offset + segment.length - 1];

  // Reset on segment change
  useEffect(() => {
    setRecState("idle");
    setResult(null);
    setShowAudio(false);
    setWordIdx(0);
  }, [segmentIdx]);

  // Word advance during recording (within segment)
  useEffect(() => {
    if (recState !== "recording") {
      if (timerRef.current) clearInterval(timerRef.current);
      setWordIdx(0);
      return;
    }
    const ms = Math.max(700, 2500 / Math.max(segment.length, 1));
    let localIdx = 0;
    timerRef.current = setInterval(() => {
      localIdx++;
      if (localIdx < segment.length) setWordIdx(offset + localIdx);
      else { clearInterval(timerRef.current!); }
    }, ms);
    setWordIdx(offset);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [recState, segment.length, offset]); // eslint-disable-line react-hooks/exhaustive-deps

  const startRec = useCallback(async () => {
    if (recState !== "idle") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(500);
      mediaRef.current = mr;
      setRecState("recording");
      setResult(null);
    } catch { alert("Microphone inaccessible."); }
  }, [recState]);

  const stopRec = useCallback(async () => {
    if (recState !== "recording" || !mediaRef.current) return;
    setRecState("processing");
    await new Promise<void>(resolve => {
      mediaRef.current!.onstop = () => resolve();
      mediaRef.current!.stop();
      mediaRef.current!.stream.getTracks().forEach(t => t.stop());
    });
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("audio", blob, "segment.webm");
      fd.append("expected", expected);
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/quran/recite", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ReciteResult = await res.json();
      setResult(data);
      setRecState("result");
    } catch (err) {
      console.error("[SegmentPhase]", err);
      setRecState("idle");
    }
  }, [recState, expected]);

  const fb = result ? feedbackConfig(result.score, isElder) : null;
  const isLastSegment = segmentIdx >= segments.length - 1;
  const audioUrl = ayahAudioUrl(surahNumber, ayahNumber);

  return (
    <div className="flex flex-col gap-4">
      {/* Full verse with segment highlighted */}
      <div className="rounded-2xl border p-5"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <p className="mb-2 text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Répétez ce segment :
        </p>
        <WordHighlight
          words={words}
          errors={result?.errors ?? []}
          currentWordIdx={wordIdx}
          state={recState}
          highlightRange={range}
          fontSize={fontSize}
        />
        {/* Segment isolated display */}
        <div className="mt-3 rounded-xl p-3"
          style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
          <p className="text-right"
            style={{ fontFamily: "var(--font-amiri)", direction: "rtl", fontSize: fontSize + 2, color: "var(--gold)" }}>
            {expected}
          </p>
        </div>

        {/* Listen button for segment (full ayah audio) */}
        <button onClick={() => setShowAudio(v => !v)}
          className="mt-3 flex items-center gap-1.5 text-xs opacity-50"
          style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
          <Volume2 size={12} /> {isElder ? "Écouter ce verset" : "Audio"}
        </button>
        {showAudio && (
          <audio src={audioUrl} controls autoPlay className="mt-2 w-full rounded-xl" style={{ height: 36 }} />
        )}
      </div>

      {/* Segment feedback */}
      <AnimatePresence>
        {fb && result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl border p-4"
            style={{ borderColor: `${fb.color}33`, background: `${fb.color}0a` }}>
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontSize: 24 }}>{fb.emoji}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: fb.color, fontFamily: "var(--font-bricolage)" }}>{fb.title}</p>
                <p className="text-xs opacity-70" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{fb.subtitle}</p>
              </div>
              <span className="ml-auto text-xs font-bold" style={{ color: fb.color, fontFamily: "var(--font-dm-sans)" }}>
                {result.score}%
              </span>
            </div>
            {result.errors.length > 0 && result.score < 90 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {result.errors.slice(0, 3).map((e, i) => (
                  <span key={i} className="text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: "var(--text)" }}>
                    <span className="opacity-40">{e.word || "?"}</span>
                    <span className="opacity-25 mx-1">→</span>
                    <span style={{ color: "#22c55e", fontFamily: "var(--font-amiri)" }}>{e.suggestion}</span>
                  </span>
                ))}
              </div>
            )}
            {result.score < 90 && result.transcribed && (
              <div className="mb-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] uppercase tracking-wide opacity-40 mb-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>Entendu :</p>
                <p className="text-xs break-all text-right" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-amiri)", direction: "rtl" }}>{result.transcribed}</p>
              </div>
            )}
            <div className="flex gap-2">
              {!fb.autoNext && (
                <button onClick={() => { setRecState("idle"); setResult(null); }}
                  className="flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  <RotateCcw size={12} /> Réessayer
                </button>
              )}
              <button onClick={() => onSegmentDone(result.score)}
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold"
                style={{ background: "rgba(5,92,63,0.5)", border: "1px solid rgba(5,92,63,0.8)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {isLastSegment ? "Réciter entier" : "Segment suivant"} <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {recState === "idle" ? "Maintenez pour répéter ce segment"
           : recState === "recording" ? "Relâchez quand vous avez terminé…"
           : recState === "processing" ? "Analyse…"
           : ""}
        </p>
        <MicButton state={recState} onPress={startRec} onStop={stopRec} size={64} />
      </div>
    </div>
  );
}

// ── Full recitation phase ────────────────────────────────────────

function FullPhase({
  ayah,
  surahNumber,
  words,
  isElder,
  isKids,
  tajwidTypes,
  fontSize,
  isLast,
  onNext,
  onResult,
}: {
  ayah: Ayah;
  surahNumber: number;
  words: string[];
  isElder: boolean;
  isKids: boolean;
  tajwidTypes: string[];
  fontSize: number;
  isLast: boolean;
  onNext: () => void;
  onResult?: (score: number, tajwidTypes: string[]) => void;
}) {
  const [recState,     setRecState]     = useState<RecordingState>("idle");
  const [result,       setResult]       = useState<ReciteResult | null>(null);
  const [wordIdx,      setWordIdx]       = useState(0);
  const [showAudio,    setShowAudio]    = useState(false);
  const [coaching,     setCoaching]     = useState<CoachResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [showCoach,    setShowCoach]    = useState(true);

  const mediaRef   = useRef<MediaRecorder | null>(null);
  const chunksRef  = useRef<Blob[]>([]);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrl   = ayahAudioUrl(surahNumber, ayah.numberInSurah);
  const settings   = storage.getSettings();

  useEffect(() => {
    if (recState !== "recording") {
      if (timerRef.current) clearInterval(timerRef.current);
      setWordIdx(0);
      return;
    }
    const ms = Math.max(800, 3000 / Math.max(words.length, 1));
    timerRef.current = setInterval(() => {
      setWordIdx(prev => {
        if (prev < words.length - 1) return prev + 1;
        clearInterval(timerRef.current!);
        return prev;
      });
    }, ms);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [recState, words.length]);

  const startRec = useCallback(async () => {
    if (recState !== "idle") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(500);
      mediaRef.current = mr;
      setRecState("recording");
      setResult(null);
    } catch { alert("Microphone inaccessible."); }
  }, [recState]);

  const stopRec = useCallback(async () => {
    if (recState !== "recording" || !mediaRef.current) return;
    setRecState("processing");
    await new Promise<void>(resolve => {
      mediaRef.current!.onstop = () => resolve();
      mediaRef.current!.stop();
      mediaRef.current!.stream.getTracks().forEach(t => t.stop());
    });
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("audio", blob, "recitation.webm");
      fd.append("expected", ayah.text);
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/quran/recite", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ReciteResult = await res.json();
      setResult(data);
      setRecState("result");
      setCoaching(null);
      setShowCoach(true);

      // SM-2 persist — fire-and-forget
      const types = [...new Set(data.tajwid_issues.map((t: TajwidIssue) => t.type))];
      saveRecitation(surahNumber, ayah.numberInSurah, data.score, types).catch(() => {});
      onResult?.(data.score, types);

      // ── Chef Agent coaching — parallel sub-agents ─────────────
      setCoachLoading(true);
      fetch("/api/quran/coach", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          surahNumber,
          ayahNumber:   ayah.numberInSurah,
          ayahText:     ayah.text,
          transcribed:  data.transcribed,
          score:        data.score,
          errors:       data.errors,
          tajwidIssues: data.tajwid_issues,
          ageGroup:     settings.ageGroup ?? "18-35",
          arabicLevel:  settings.arabicLevel ?? "beginner",
        }),
      })
        .then(r => r.ok ? r.json() : null)
        .then((c: CoachResponse | null) => { if (c) setCoaching(c); })
        .catch(() => {})
        .finally(() => setCoachLoading(false));

    } catch (err) {
      console.error("[FullPhase]", err);
      setRecState("idle");
    }
  }, [recState, ayah, surahNumber, onResult, settings.ageGroup, settings.arabicLevel]);

  const fb = result ? feedbackConfig(result.score, isElder) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border p-5"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        {tajwidTypes.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tajwidTypes.map(type => {
              const t = TAJWID_LABELS[type];
              if (!t) return null;
              return (
                <span key={type} className="rounded-full px-2 py-0.5 text-xs"
                  style={{ background: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44`, fontFamily: "var(--font-dm-sans)" }}>
                  {isElder ? `${t.ar} · ` : ""}{t.fr}
                </span>
              );
            })}
          </div>
        )}
        <WordHighlight
          words={words}
          errors={result?.errors ?? []}
          currentWordIdx={wordIdx}
          state={recState}
          fontSize={fontSize}
        />
        {(isElder || (result && result.score < 70)) && (
          <div className="mt-4">
            {showAudio
              ? <audio src={audioUrl} controls autoPlay className="w-full rounded-xl" onEnded={() => setShowAudio(false)} style={{ height: 40 }} />
              : <button onClick={() => setShowAudio(true)}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                  <Volume2 size={14} /> Écouter le récitateur
                </button>
            }
          </div>
        )}
      </div>

      <AnimatePresence>
        {fb && result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="rounded-2xl border p-5"
            style={{ borderColor: `${fb.color}33`, background: `${fb.color}0a` }}>
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontSize: 28 }}>{fb.emoji}</span>
              <div>
                <p className="font-bold text-base" style={{ color: fb.color, fontFamily: "var(--font-bricolage)" }}>{fb.title}</p>
                <p className="text-sm opacity-70" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>{fb.subtitle}</p>
              </div>
              <span className="ml-auto font-bold" style={{ color: fb.color, fontFamily: "var(--font-dm-sans)" }}>
                {result.score}%
              </span>
            </div>
            {result.errors.length > 0 && result.score < 90 && (
              <div className="flex flex-col gap-1.5 mb-4">
                {result.errors.slice(0, 4).map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-dm-sans)", color: "var(--text)" }}>
                    <span className="opacity-50">{e.word || "(manquant)"}</span>
                    <span className="opacity-30">→</span>
                    <span style={{ color: "#22c55e", fontFamily: "var(--font-amiri)" }}>{e.suggestion}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Ce que Whisper a entendu — toujours visible si score < 90 */}
            {result.score < 90 && result.transcribed && (
              <div className="mb-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] uppercase tracking-wide opacity-40 mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  Whisper a entendu :
                </p>
                <p className="text-sm break-all text-right" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-amiri)", direction: "rtl" }}>
                  {result.transcribed}
                </p>
                {process.env.NODE_ENV === "development" && result.debug && (
                  <p className="text-[10px] opacity-25 mt-1 break-all" style={{ color: "var(--text)", direction: "rtl" }}>
                    norm: {result.debug.transcribed_normalized}
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              {!fb.autoNext && (
                <button onClick={() => { setRecState("idle"); setResult(null); setCoaching(null); }}
                  className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                  <RotateCcw size={14} /> Réessayer
                </button>
              )}
              <button onClick={onNext}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold"
                style={{ background: "rgba(5,92,63,0.5)", border: "1px solid rgba(5,92,63,0.8)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {isLast ? "Terminer" : "Verset suivant"} <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Coaching IA panel ──────────────────────────────────── */}
      <AnimatePresence>
        {(coachLoading || coaching) && result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "rgba(212,175,55,0.2)", background: "rgba(212,175,55,0.04)" }}>

            {/* Header — collapsible */}
            <button
              onClick={() => setShowCoach(v => !v)}
              className="flex w-full items-center justify-between px-4 py-3"
              style={{ borderBottom: showCoach ? "1px solid rgba(212,175,55,0.1)" : "none" }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 14 }}>🤖</span>
                <span className="text-xs font-semibold tracking-wide uppercase"
                  style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)", opacity: 0.8 }}>
                  Coaching IA
                </span>
                {!coachLoading && coaching && (
                  <div className="flex gap-1 ml-1">
                    {coaching.agents.slice(0, 3).map(a => (
                      <span key={a} className="rounded-full px-1.5 py-0.5 text-[9px] uppercase font-bold"
                        style={{ background: "rgba(212,175,55,0.15)", color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {coachLoading
                ? <Loader2 size={14} className="animate-spin" style={{ color: "var(--gold)", opacity: 0.6 }} />
                : <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{showCoach ? "▲" : "▼"}</span>
              }
            </button>

            {showCoach && (
              <div className="flex flex-col gap-3 px-4 py-3">
                {coachLoading && !coaching && (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 size={14} className="animate-spin" style={{ color: "var(--gold)" }} />
                    <p className="text-xs opacity-50" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                      Vos coachs analysent votre récitation…
                    </p>
                  </div>
                )}

                {coaching && (
                  <>
                    {/* Encouragement — always */}
                    {coaching.encouragement && (
                      <CoachSection icon="💚" label="Encouragement" text={coaching.encouragement} color="#22c55e" isElder={isElder} />
                    )}

                    {/* Tajwid — when errors */}
                    {coaching.tajwid && (
                      <CoachSection icon="📖" label="Agent Tajwid" text={coaching.tajwid} color="var(--gold)" isElder={isElder} />
                    )}

                    {/* Makhraj — when score low */}
                    {coaching.pronunciation && (
                      <CoachSection icon="👄" label="Agent Makhraj" text={coaching.pronunciation} color="#3b82f6" isElder={isElder} />
                    )}

                    {/* Tafsir — reward for good score */}
                    {coaching.tafsir && (
                      <CoachSection icon="📚" label="Agent Tafsir" text={coaching.tafsir} color="rgba(212,175,55,0.9)" isElder={isElder} />
                    )}

                    {/* Next focus */}
                    {coaching.next_focus && (
                      <div className="pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <p className="text-xs opacity-40 mb-0.5" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                          Prochaine session →
                        </p>
                        <p className="text-xs" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)", opacity: 0.7 }}>
                          {coaching.next_focus}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-3">
        <p className="text-xs opacity-40" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {recState === "idle" ? (isElder || isKids ? "Appuyez et maintenez pour réciter" : "Appuyez pour réciter")
           : recState === "recording" ? "Relâchez quand vous avez terminé…"
           : recState === "processing" ? "Analyse en cours…"
           : ""}
        </p>
        <MicButton state={recState} onPress={startRec} onStop={stopRec} />
      </div>
    </div>
  );
}

// ── Coach section component ──────────────────────────────────────

function CoachSection({ icon, label, text, color, isElder }: {
  icon: string; label: string; text: string; color: string; isElder: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span style={{ fontSize: 12 }}>{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-wide"
          style={{ color, fontFamily: "var(--font-dm-sans)", opacity: 0.8 }}>
          {label}
        </p>
      </div>
      <p style={{
        color: "var(--text)",
        fontFamily: "var(--font-dm-sans)",
        fontSize: isElder ? 14 : 13,
        lineHeight: 1.55,
        opacity: 0.85,
      }}>
        {text}
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

export interface RecitationModeProps {
  surahNumber: number;
  surahName: string;
  surahNameAr: string;
  ayahs: Ayah[];
  startIndex?: number;
  guided?: boolean;
  onClose: () => void;
}

export default function RecitationMode({
  surahNumber,
  surahName,
  surahNameAr,
  ayahs,
  startIndex = 0,
  guided = false,
  onClose,
}: RecitationModeProps) {
  const settings = storage.getSettings();
  const ageMode  = ageGroupToMode(settings.ageGroup);
  const isElder  = ageMode === "elder";
  const isKids   = ageMode === "kids";
  const fontSize = isKids || isElder ? 28 : 24;

  const [currentIdx,    setCurrentIdx]    = useState(startIndex);
  const [guidedPhase,   setGuidedPhase]   = useState<GuidedPhase>("listen");
  const [segmentIdx,    setSegmentIdx]    = useState(0);

  const ayah    = ayahs[currentIdx];
  const words   = ayah?.text.split(" ").filter(Boolean) ?? [];
  const isLast  = currentIdx >= ayahs.length - 1;
  const segments = chunkWords(words, 4);

  const tajwidTypes = [...new Set(detectLocalTajwid(ayah?.text ?? "").map(t => t.type))];

  function nextAyah() {
    if (isLast) { onClose(); return; }
    setCurrentIdx(prev => prev + 1);
    setGuidedPhase("listen");
    setSegmentIdx(0);
  }

  function handleSegmentDone(score: number) {
    const nextIdx = segmentIdx + 1;
    if (nextIdx < segments.length) {
      setSegmentIdx(nextIdx);
    } else {
      setGuidedPhase("full");
    }
    // If score was low, let them hear audio before moving on (handled inside SegmentPhase)
    void score;
  }

  // Reset guided state when ayah changes
  useEffect(() => {
    setGuidedPhase("listen");
    setSegmentIdx(0);
  }, [currentIdx]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1,  y: 0  }}
      exit={  { opacity: 0,  y: 20  }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#0A0F0D" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2"
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
            {surahName} · Verset {ayah?.numberInSurah ?? 1}/{ayahs.length}
            {guided && " · Mode guidé"}
          </p>
        </div>
        <div className="w-9" />
      </div>

      {/* Step indicator (guided only) */}
      {guided && (
        <StepIndicator phase={guidedPhase} segmentIdx={segmentIdx} totalSegments={segments.length} />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!guided ? (
          // Free mode — existing full-phase UI
          <FullPhase
            ayah={ayah}
            surahNumber={surahNumber}
            words={words}
            isElder={isElder}
            isKids={isKids}
            tajwidTypes={tajwidTypes}
            fontSize={fontSize}
            isLast={isLast}
            onNext={nextAyah}
          />
        ) : guidedPhase === "listen" ? (
          <ListenPhase
            ayah={ayah}
            surahNumber={surahNumber}
            words={words}
            isElder={isElder}
            tajwidTypes={tajwidTypes}
            fontSize={fontSize}
            onNext={() => setGuidedPhase("segments")}
          />
        ) : guidedPhase === "segments" ? (
          <SegmentPhase
            words={words}
            segments={segments}
            segmentIdx={segmentIdx}
            surahNumber={surahNumber}
            ayahNumber={ayah?.numberInSurah ?? 1}
            isElder={isElder}
            fontSize={fontSize}
            onSegmentDone={handleSegmentDone}
          />
        ) : (
          <FullPhase
            ayah={ayah}
            surahNumber={surahNumber}
            words={words}
            isElder={isElder}
            isKids={isKids}
            tajwidTypes={tajwidTypes}
            fontSize={fontSize}
            isLast={isLast}
            onNext={nextAyah}
          />
        )}
      </div>
    </motion.div>
  );
}
