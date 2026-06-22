"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, CheckCircle2, XCircle } from "lucide-react";

interface VoiceInputProps {
  expectedText: string;        // Arabic text expected
  transliteration: string;     // For display / comparison fallback
  color?: string;
  onResult?: (score: number) => void;
}

// Levenshtein distance for string similarity
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  return Math.round((1 - levenshtein(a, b) / maxLen) * 100);
}

type Status = "idle" | "listening" | "success" | "retry" | "unsupported";

export default function VoiceInput({
  expectedText,
  transliteration,
  color = "#D4AF37",
  onResult,
}: VoiceInputProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore]   = useState<number | null>(null);
  const [heard, setHeard]   = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef  = useRef<any>(null);
  const isListeningRef  = useRef(false); // avoid stale closure in onend

  const getSpeechAPI = useCallback(() => {
    if (typeof window === "undefined") return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechAPI();
    if (!SpeechRecognitionAPI) {
      setStatus("unsupported");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "ar-SA";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    isListeningRef.current = true;
    setStatus("listening");
    setScore(null);
    setHeard("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      // Check all alternatives for the best score
      let best = 0;
      let bestTranscript = "";
      for (let i = 0; i < event.results[0].length; i++) {
        const transcript = event.results[0][i].transcript.trim();
        const s = similarity(transcript, expectedText);
        if (s > best) { best = s; bestTranscript = transcript; }
      }
      setHeard(bestTranscript);
      isListeningRef.current = false;
      setScore(best);
      setStatus(best >= 60 ? "success" : "retry");
      onResult?.(best);
    };

    recognition.onerror = () => {
      setStatus("idle");
    };

    recognition.onend = () => {
      if (isListeningRef.current) { isListeningRef.current = false; setStatus("idle"); }
    };

    recognition.start();
  }, [expectedText, onResult, getSpeechAPI]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus("idle");
  }, []);

  if (status === "unsupported") {
    return (
      <span className="text-[10px] opacity-40 px-2 py-1" style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
        Micro non dispo
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={status === "listening" ? stop : startListening}
        className="h-8 w-8 flex items-center justify-center rounded-full"
        title={`Prononcer : ${transliteration}`}
        style={{
          background: status === "listening"
            ? "rgba(239,68,68,0.2)"
            : "rgba(255,255,255,0.06)",
          border: `1px solid ${status === "listening" ? "#ef4444" : "rgba(255,255,255,0.12)"}`,
          color: status === "listening" ? "#ef4444" : color,
        }}
      >
        {status === "listening" ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <MicOff size={13} />
          </motion.div>
        ) : (
          <Mic size={13} />
        )}
      </motion.button>

      <AnimatePresence>
        {score !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: status === "success"
                ? "rgba(34,197,94,0.15)"
                : "rgba(248,113,113,0.15)",
              border: `1px solid ${status === "success" ? "#22c55e44" : "#f8717144"}`,
            }}
          >
            {status === "success"
              ? <CheckCircle2 size={10} style={{ color: "#22c55e" }} />
              : <XCircle size={10} style={{ color: "#f87171" }} />
            }
            <span className="text-[9px] font-bold"
              style={{ color: status === "success" ? "#22c55e" : "#f87171", fontFamily: "var(--font-dm-sans)" }}>
              {score}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {heard && status !== "idle" && (
        <span className="text-[9px] opacity-40 text-center max-w-[80px] leading-tight"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)", direction: "rtl" }}>
          {heard}
        </span>
      )}
    </div>
  );
}
