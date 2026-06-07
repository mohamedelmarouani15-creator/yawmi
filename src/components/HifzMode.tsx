"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, CheckCircle2, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { saveRecitation } from "@/lib/quran-recitation";

/* ── Types ─────────────────────────────────────────────────── */

interface Ayah {
  numberInSurah: number;
  text: string;
}

interface HifzRecord {
  mastered: boolean;
  lastReviewed: string; // ISO date string
}

type HifzStore = Record<string, HifzRecord>; // key = "surah_ayah"

export interface HifzModeProps {
  surahNumber: number;
  surahName: string;
  ayahs: Ayah[];
  translations: Ayah[];
  startIndex?: number;  // 0-based index to begin from
  fontSize?: number;
  onClose: () => void;
  /** Called after the user marks any ayah as mastered (for achievement check) */
  onMastered?: (totalMastered: number) => void;
}

/* ── localStorage helpers ───────────────────────────────────── */

const HIFZ_KEY = "yawmi_hifz";

function loadHifzStore(): HifzStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HIFZ_KEY);
    return raw ? (JSON.parse(raw) as HifzStore) : {};
  } catch {
    return {};
  }
}

function saveHifzStore(store: HifzStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HIFZ_KEY, JSON.stringify(store));
}

function ayahKey(surah: number, ayah: number): string {
  return `${surah}_${ayah}`;
}

export function getTotalMasteredCount(): number {
  const store = loadHifzStore();
  return Object.values(store).filter((r) => r.mastered).length;
}

/* ── Component ──────────────────────────────────────────────── */

export default function HifzMode({
  surahNumber,
  surahName,
  ayahs,
  translations,
  startIndex = 0,
  fontSize = 21,
  onClose,
  onMastered,
}: HifzModeProps) {
  const [currentIdx, setCurrentIdx]     = useState(startIndex);
  const [hidden, setHidden]             = useState(false);
  const [revealMode, setRevealMode]     = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [sessionMastered, setSessionMastered] = useState<number[]>([]); // numberInSurah values
  const [hifzStore, setHifzStore]       = useState<HifzStore>(() => loadHifzStore());
  const [showAudio, setShowAudio]       = useState(false);
  const [justMastered, setJustMastered] = useState(false);

  const ayah        = ayahs[currentIdx];
  const translation = translations[currentIdx];
  const total       = ayahs.length;
  const key         = ayah ? ayahKey(surahNumber, ayah.numberInSurah) : "";
  const isMastered  = ayah ? (hifzStore[key]?.mastered ?? false) : false;

  /* Persist store to localStorage on change */
  useEffect(() => {
    saveHifzStore(hifzStore);
  }, [hifzStore]);

  /* Reset hidden state when navigating */
  useEffect(() => {
    setHidden(false);
    setJustMastered(false);
    setShowAudio(false);
    setRevealMode(false);
    setRevealedCount(0);
  }, [currentIdx]);

  const markMastered = useCallback(() => {
    if (!ayah) return;
    const k = ayahKey(surahNumber, ayah.numberInSurah);
    const updated: HifzStore = {
      ...hifzStore,
      [k]: { mastered: true, lastReviewed: new Date().toISOString() },
    };
    setHifzStore(updated);
    setJustMastered(true);

    // Synchroniser avec Supabase (fire-and-forget)
    saveRecitation(surahNumber, ayah.numberInSurah, 100, []).catch(() => {});

    // Update session mastered list (deduplicated)
    setSessionMastered((prev) =>
      prev.includes(ayah.numberInSurah) ? prev : [...prev, ayah.numberInSurah]
    );

    // Notify parent with total count from new store
    const newTotal = Object.values(updated).filter((r) => r.mastered).length;
    onMastered?.(newTotal);

    // Auto-advance after a brief pause
    setTimeout(() => {
      if (currentIdx < total - 1) {
        setCurrentIdx((i) => i + 1);
      }
    }, 600);
  }, [ayah, hifzStore, surahNumber, currentIdx, total, onMastered]);

  const repeatAudio = useCallback(() => {
    setShowAudio(false);
    // Force re-mount of audio element by toggling
    setTimeout(() => setShowAudio(true), 50);
  }, []);

  if (!ayah) return null;

  const audioSrc = `https://everyayah.com/data/Alafasy_128kbps/${String(surahNumber).padStart(3, "0")}${String(ayah.numberInSurah).padStart(3, "0")}.mp3`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(180deg, #020a05 0%, #061A12 100%)" }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(212,175,55,0.2)", color: "rgba(248,244,236,0.6)" }}
        >
          <X size={15} />
        </button>
        <div className="flex-1">
          <p className="text-xs tracking-widest uppercase" style={{ color: "rgba(212,175,55,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            Mode Hifz — {surahName}
          </p>
        </div>
        {/* Session progress */}
        <div
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: "rgba(212,175,55,0.1)",
            border: "1px solid rgba(212,175,55,0.25)",
            color: "var(--gold)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {sessionMastered.length}/{total} mémorisés
        </div>
      </div>

      {/* ── Progress bar ──────────────────────────────────────── */}
      <div className="px-5 mb-5">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${((currentIdx + 1) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ background: "linear-gradient(to right,#D4AF37,#22c55e)" }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <p className="text-xs" style={{ color: "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)" }}>
            Verset {ayah.numberInSurah} / {total}
          </p>
          <p className="text-xs" style={{ color: "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)" }}>
            {sessionMastered.length} mémorisé{sessionMastered.length !== 1 ? "s" : ""} cette session
          </p>
        </div>
      </div>

      {/* ── Ayah card ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-5 gap-4 overflow-y-auto pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {/* Ayah number badge */}
            <div className="flex justify-center mb-4">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: isMastered ? "rgba(34,197,94,0.2)" : "rgba(5,92,63,0.5)",
                  color: isMastered ? "#22c55e" : "var(--gold)",
                  border: `1px solid ${isMastered ? "rgba(34,197,94,0.4)" : "rgba(212,175,55,0.3)"}`,
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {ayah.numberInSurah}
              </div>
            </div>

            {/* Arabic text card */}
            <div
              className="rounded-2xl border p-6 mb-4 relative overflow-hidden"
              style={{
                background: justMastered
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(255,255,255,0.02)",
                borderColor: justMastered
                  ? "rgba(34,197,94,0.3)"
                  : isMastered
                  ? "rgba(34,197,94,0.2)"
                  : "rgba(212,175,55,0.15)",
                transition: "all 0.3s ease",
              }}
            >
              {hidden && !revealMode ? (
                /* Hidden state — dots mask */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap justify-center gap-2 py-4"
                >
                  {ayah.text.split(" ").map((w, wi) => (
                    <div
                      key={wi}
                      className="rounded-full"
                      style={{
                        height: 8,
                        width: Math.max(24, Math.min(64, w.length * 7)),
                        background: "rgba(212,175,55,0.25)",
                      }}
                    />
                  ))}
                </motion.div>
              ) : revealMode ? (
                /* Révélation progressive mot par mot */
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-right leading-loose"
                  style={{
                    fontSize,
                    color: "var(--text)",
                    fontFamily: "var(--font-amiri)",
                    direction: "rtl",
                  }}
                >
                  {ayah.text.split(" ").map((word, wi) => (
                    <span
                      key={wi}
                      style={{
                        opacity: wi < revealedCount ? 1 : 0.08,
                        transition: "opacity 0.3s ease",
                        background: wi === revealedCount - 1 ? "rgba(212,175,55,0.12)" : "transparent",
                        borderRadius: 4,
                        padding: "0 2px",
                        color: wi < revealedCount ? "var(--text)" : "rgba(255,255,255,0.15)",
                      }}
                    >
                      {word}{" "}
                    </span>
                  ))}
                </motion.p>
              ) : (
                /* Texte complet visible */
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-right leading-loose"
                  style={{
                    fontSize,
                    color: "var(--text)",
                    fontFamily: "var(--font-amiri)",
                    direction: "rtl",
                  }}
                >
                  {ayah.text}
                </motion.p>
              )}

              {/* Mastered badge overlay */}
              <AnimatePresence>
                {justMastered && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-3 right-3"
                  >
                    <CheckCircle2 size={22} color="#22c55e" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Translation (always visible in hifz mode to aid understanding) */}
            {translation && (
              <p
                className="leading-relaxed opacity-55 mb-4 px-1"
                style={{
                  fontSize: 14,
                  color: "var(--text)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {translation.text}
              </p>
            )}

            {/* Audio (lazy mount) */}
            {showAudio && (
              <audio
                key={audioSrc + Date.now()}
                src={audioSrc}
                autoPlay
                playsInline
                controls
                className="w-full mb-4"
                style={{ height: 36, borderRadius: 10 }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Action buttons ────────────────────────────────────── */}
      <div className="px-5 pb-8 pt-3 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Row 1 — cacher | révélation progressive | audio */}
        <div className="flex gap-2">
          {/* Bouton tout cacher / tout révéler */}
          <button
            onClick={() => { setHidden((v) => !v); setRevealMode(false); setRevealedCount(0); }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold"
            style={{
              borderColor: hidden ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)",
              color: hidden ? "var(--gold)" : "rgba(248,244,236,0.5)",
              background: hidden ? "rgba(212,175,55,0.08)" : "transparent",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {hidden ? <Eye size={15} /> : <EyeOff size={15} />}
            {hidden ? "Révéler" : "Cacher"}
          </button>

          {/* Bouton mode révélation mot par mot */}
          <button
            onClick={() => {
              if (revealMode) {
                const words = ayah.text.split(" ").filter(Boolean);
                setRevealedCount((prev) => Math.min(prev + 1, words.length));
              } else {
                setRevealMode(true);
                setHidden(false);
                setRevealedCount(1);
              }
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold"
            style={{
              borderColor: revealMode ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)",
              color: revealMode ? "#22c55e" : "rgba(248,244,236,0.5)",
              background: revealMode ? "rgba(34,197,94,0.08)" : "transparent",
              fontFamily: "var(--font-dm-sans)",
              minWidth: 44,
            }}
            title={revealMode ? "Mot suivant" : "Mode dictée"}
          >
            {revealMode ? (
              <>
                <ChevronRight size={15} />
                <span className="text-xs">
                  {Math.min(revealedCount, ayah.text.split(" ").filter(Boolean).length)}/
                  {ayah.text.split(" ").filter(Boolean).length}
                </span>
              </>
            ) : (
              <span className="text-xs">Dictée</span>
            )}
          </button>

          {/* Bouton repeat audio */}
          <button
            onClick={repeatAudio}
            className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              color: "rgba(248,244,236,0.5)",
              fontFamily: "var(--font-dm-sans)",
            }}
            title="Répéter l'audio"
          >
            <RotateCcw size={15} />
            Répéter
          </button>
        </div>

        {/* Row 2 — mastered + navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => currentIdx > 0 && setCurrentIdx((i) => i - 1)}
            disabled={currentIdx === 0}
            className="flex h-12 w-12 items-center justify-center rounded-xl border disabled:opacity-25"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              color: "rgba(248,244,236,0.6)",
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={markMastered}
            disabled={justMastered}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold disabled:opacity-60"
            style={{
              background: isMastered
                ? "rgba(34,197,94,0.15)"
                : "linear-gradient(135deg, rgba(5,92,63,0.8), rgba(3,61,42,0.9))",
              border: `1px solid ${isMastered ? "rgba(34,197,94,0.35)" : "rgba(212,175,55,0.25)"}`,
              color: isMastered ? "#22c55e" : "var(--gold)",
              fontFamily: "var(--font-dm-sans)",
              boxShadow: isMastered ? "none" : "0 4px 16px rgba(5,92,63,0.3)",
            }}
          >
            <CheckCircle2 size={16} />
            {isMastered ? "Deja maitrise" : "Maitrise"}
          </button>

          <button
            onClick={() => currentIdx < total - 1 && setCurrentIdx((i) => i + 1)}
            disabled={currentIdx === total - 1}
            className="flex h-12 w-12 items-center justify-center rounded-xl border disabled:opacity-25"
            style={{
              borderColor: "rgba(212,175,55,0.25)",
              color: "var(--gold)",
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
