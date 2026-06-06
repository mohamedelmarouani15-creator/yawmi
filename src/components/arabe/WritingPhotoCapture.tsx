"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw, Send, Loader2, CheckCircle2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { arabeProgress } from "@/lib/arabe/progress";

interface WritingPhotoCaptureProps {
  letter: string;           // Mot arabe à écrire (ex: بسم الله)
  transliteration: string;  // Translitération (ex: bismillah)
  french?: string;          // Traduction française
  lessonId: string;
  color?: string;
  onValidated?: (score: number) => void;
}

type Phase = "guide" | "preview" | "result";

export default function WritingPhotoCapture({
  letter,
  transliteration,
  french = "",
  lessonId,
  color = "#D4AF37",
  onValidated,
}: WritingPhotoCaptureProps) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [phase, setPhase]         = useState<Phase>("guide");
  const [preview, setPreview]     = useState<string | null>(null);
  const [imageB64, setImageB64]   = useState<string | null>(null);
  const [mimeType, setMimeType]   = useState("image/jpeg");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<{
    score: number; emoji: string; feedback: string; encouragement: string;
  } | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const settings  = storage.getSettings();
  const ageGroup  = settings.ageGroup ?? "18-35";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compresser via canvas avant envoi (photo téléphone = 3-7MB, limite Anthropic ~1MB)
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1024; // max dimension px
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8); // 80% qualité
      URL.revokeObjectURL(objectUrl);
      setMimeType("image/jpeg");
      setPreview(dataUrl);
      setImageB64(dataUrl.split(",")[1]);
      setPhase("preview");
    };
    img.src = objectUrl;
  }

  async function analyse() {
    if (!imageB64) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/arabe/analyser-ecriture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageB64,
          mimeType,
          wordAr: letter,
          wordFr: french || transliteration,
          ageGroup,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setResult(data);
      setPhase("result");
      arabeProgress.recordWriting(lessonId);
      onValidated?.(data.score ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPhase("guide");
    setPreview(null);
    setImageB64(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const scoreColor =
    (result?.score ?? 0) >= 8 ? "#22c55e" :
    (result?.score ?? 0) >= 5 ? "#D4AF37" : "#f97316";

  return (
    <div className="flex flex-col gap-4">

      {/* Mot à écrire — toujours visible */}
      <div className="rounded-2xl px-5 py-5 text-center"
        style={{ background: `${color}0a`, border: `1px solid ${color}25` }}>
        <p className="text-xs opacity-50 mb-2 uppercase tracking-widest"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          Écris ce mot sur papier
        </p>
        <p className="text-4xl leading-relaxed mb-1"
          style={{ color, fontFamily: "var(--font-amiri)", direction: "rtl" }}>
          {letter}
        </p>
        <p className="text-sm opacity-60"
          style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
          {transliteration}{french ? ` — ${french}` : ""}
        </p>
      </div>

      {/* Instructions */}
      {phase === "guide" && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-2xl px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              "✏️ Prends une feuille et un crayon",
              "✍️ Écris le mot en arabe de ton mieux",
              "📸 Prends en photo ton écriture",
              "🤖 L'IA t'analyse et te donne un score",
            ].map((step, i) => (
              <p key={i} className="text-sm" style={{ color: "rgba(248,244,236,0.7)", fontFamily: "var(--font-dm-sans)" }}>
                {step}
              </p>
            ))}
          </div>

          {/* label = trigger natif garanti sur iOS/Android */}
          <motion.label
            whileTap={{ scale: 0.97 }}
            htmlFor="writing-photo-input"
            className="flex items-center justify-center gap-2 rounded-2xl py-4 font-black text-sm cursor-pointer"
            style={{ background: `linear-gradient(135deg,${color},#055C3F)`, color: "#0a0f0d", fontFamily: "var(--font-bricolage)" }}>
            <Camera size={18} /> Prendre en photo
          </motion.label>

          {/* Fallback galerie si caméra indispo */}
          <motion.label
            whileTap={{ scale: 0.97 }}
            htmlFor="writing-gallery-input"
            className="flex items-center justify-center gap-2 rounded-2xl py-2.5 text-xs cursor-pointer opacity-60"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            📁 Choisir depuis la galerie
          </motion.label>
          <input
            id="writing-gallery-input"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </motion.div>
      )}

      {/* Preview */}
      <AnimatePresence>
        {phase === "preview" && preview && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-3">
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${color}30` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Ton écriture" className="w-full object-contain max-h-60" />
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center" style={{ fontFamily: "var(--font-dm-sans)" }}>
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                <RotateCcw size={14} /> Reprendre
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={analyse} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold disabled:opacity-50"
                style={{ background: color, color: "#0a0f0d", fontFamily: "var(--font-bricolage)" }}>
                {loading
                  ? <><Loader2 size={14} className="animate-spin" /> Analyse…</>
                  : <><Send size={14} /> Analyser</>
                }
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résultat */}
      <AnimatePresence>
        {phase === "result" && result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3">
            {/* Score */}
            <div className="rounded-2xl px-5 py-5 text-center"
              style={{ background: `${scoreColor}12`, border: `1px solid ${scoreColor}40` }}>
              <p className="text-4xl mb-1">{result.emoji}</p>
              <p className="text-5xl font-black mb-1"
                style={{ color: scoreColor, fontFamily: "var(--font-bricolage)" }}>
                {result.score}/10
              </p>
              <p className="text-sm leading-relaxed mt-2 opacity-80"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                {result.feedback}
              </p>
              {result.encouragement && (
                <p className="text-xs mt-3 opacity-60 italic"
                  style={{ color: "var(--gold)", fontFamily: "var(--font-amiri)" }}>
                  {result.encouragement}
                </p>
              )}
            </div>

            {/* Preview miniature */}
            {preview && (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Ton écriture" className="w-full object-contain max-h-32 opacity-70" />
              </div>
            )}

            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                <RotateCcw size={14} /> Réessayer
              </motion.button>
              {result.score >= 6 && (
                <div className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold"
                  style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#22c55e", fontFamily: "var(--font-dm-sans)" }}>
                  <CheckCircle2 size={14} /> Validé ✓
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input caméra — visible mais invisible visuellement, label le déclenche */}
      <input
        ref={inputRef}
        id="writing-photo-input"
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
