"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/lib/game/types";
import { ArabicText } from "@/components/ArabicText";

interface Props {
  question: Question;
  onComplete: (isCorrect: boolean) => void;
  color: string;
}

interface Point { x: number; y: number }

const CANVAS_SIZE   = 300;
const STROKE_WIDTH  = 14;
// Seuil minimal de points tracés pour valider (indépendant de la couverture pixel)
const MIN_POINTS    = 15;

// Dessine la lettre de référence sur le canvas visible (guide gris)
function paintGuide(canvas: HTMLCanvasElement, letter: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  // Essaie plusieurs polices pour maximiser la compatibilité arabe
  ctx.fillStyle = "rgba(212,175,55,0.18)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fonts = [
    `bold ${CANVAS_SIZE * 0.68}px 'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif`,
    `bold ${CANVAS_SIZE * 0.68}px Arial`,
  ];
  for (const font of fonts) {
    ctx.font = font;
    ctx.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 10);
    // Vérifie que quelque chose a été rendu (pixel non-vide)
    const pixel = ctx.getImageData(CANVAS_SIZE / 2, CANVAS_SIZE / 2, 1, 1).data;
    if (pixel[3] > 0) break;
  }
}

export default function CalligraphyGame({ question, onComplete, color }: Props) {
  const letter         = question.minigameData?.letter ?? question.question;
  const letterTranslit = question.minigameData?.letterTranslit ?? question.transliteration;
  const strokeHints    = question.minigameData?.strokeHints ?? [];

  // ── Refs pour éviter les problèmes de closure ──────────────────
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const isDrawingRef  = useRef(false);
  const pathsRef      = useRef<Point[][]>([]);   // tous les tracés terminés
  const curPathRef    = useRef<Point[]>([]);      // tracé en cours
  const totalPointsRef = useRef(0);              // total points accumulés

  // ── State minimal pour déclencher les re-renders ───────────────
  const [pointCount,  setPointCount]  = useState(0);   // pour activer Valider
  const [submitted,   setSubmitted]   = useState(false);
  const [score,       setScore]       = useState<"correct" | "incorrect" | null>(null);
  const [hintIdx,     setHintIdx]     = useState(0);

  // Dessine le guide à l'init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Fond sombre
    ctx.fillStyle = "rgba(5,20,12,0.95)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // Lettre guide
    paintGuide(canvas, letter);
  }, [letter]);

  // ── Dessin des traits sur le canvas ──────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Efface et redessine fond + guide
    ctx.fillStyle = "rgba(5,20,12,0.95)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    paintGuide(canvas, letter);

    // Redessine tous les tracés
    ctx.strokeStyle = color;
    ctx.lineWidth   = STROKE_WIDTH;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";

    const allPaths = [...pathsRef.current, curPathRef.current];
    for (const path of allPaths) {
      if (path.length === 0) continue;
      ctx.beginPath();
      // Pour un point unique, dessine un cercle
      if (path.length === 1) {
        ctx.arc(path[0].x, path[0].y, STROKE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();
      }
    }
  }, [color, letter]);

  // ── Récupère les coordonnées depuis un PointerEvent ───────────
  const getPos = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_SIZE / rect.width),
      y: (e.clientY - rect.top)  * (CANVAS_SIZE / rect.height),
    };
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (submitted) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    e.preventDefault();
    isDrawingRef.current = true;
    const pt = getPos(e);
    curPathRef.current = [pt];
    totalPointsRef.current += 1;
    redraw();
    setPointCount(c => c + 1);
  }, [submitted, redraw]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current || submitted) return;
    e.preventDefault();
    const pt = getPos(e);
    curPathRef.current = [...curPathRef.current, pt];
    totalPointsRef.current += 1;
    redraw();
    // Déclenche un re-render toutes les 5 points pour mettre à jour le compteur
    if (totalPointsRef.current % 5 === 0) setPointCount(totalPointsRef.current);
  }, [submitted, redraw]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    e.preventDefault();
    const finishedPath = curPathRef.current;
    if (finishedPath.length >= 1) {
      pathsRef.current = [...pathsRef.current, finishedPath];
    }
    curPathRef.current = [];
    redraw();
    setPointCount(totalPointsRef.current);
  }, [redraw]);

  const clear = useCallback(() => {
    pathsRef.current = [];
    curPathRef.current = [];
    totalPointsRef.current = 0;
    setPointCount(0);
    redraw();
  }, [redraw]);

  const submit = useCallback(() => {
    const pts = totalPointsRef.current;
    if (pts === 0) return;

    // Scoring par densité de points : accessible à tous sans dépendre du rendu de police
    // On considère correct si ≥ MIN_POINTS tracés (l'effort compte)
    const correct = pts >= MIN_POINTS;
    setScore(correct ? "correct" : "incorrect");
    setSubmitted(true);
    // Signale le résultat au quiz engine immédiatement (pas de délai artificiel)
    onComplete(correct);
  }, [onComplete]);

  const hasDrawing = pointCount > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "rgba(212,175,55,0.6)", fontFamily: "var(--font-dm-sans)" }}>
          Calligraphie au doigt
        </p>
        <p className="text-sm mb-3"
          style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
          {question.question !== letter ? question.question : "Trace la lettre en suivant le guide"}
        </p>
        <ArabicText
          arabic={letter}
          translit={letterTranslit}
          fontSize={letter.length === 1 ? 48 : 32}
          color={color}
          showAudio
        />
      </div>

      {/* Canvas — Pointer Events, touch-action none sur le conteneur aussi */}
      <div
        className="relative mx-auto rounded-2xl overflow-hidden"
        style={{
          width: "100%",
          maxWidth: CANVAS_SIZE,
          aspectRatio: "1",
          touchAction: "none",       // empêche le scroll de consommer les events
          border: "1px solid rgba(212,175,55,0.15)",
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full"
          style={{
            touchAction: "none",
            cursor: submitted ? "default" : "crosshair",
            display: "block",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
        />

        {/* Overlay résultat */}
        <AnimatePresence>
          {submitted && score && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                background: score === "correct"
                  ? "rgba(34,197,94,0.18)"
                  : "rgba(248,113,113,0.15)",
              }}
            >
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ fontSize: 56 }}
              >
                {score === "correct" ? "✓" : "✗"}
              </motion.span>
              <p className="text-sm font-bold mt-2 text-center px-4"
                style={{
                  color: score === "correct" ? "#4ade80" : "#f87171",
                  fontFamily: "var(--font-dm-sans)",
                }}>
                {score === "correct"
                  ? "Beau tracé ! Continue ainsi."
                  : `Entraîne-toi encore (${pointCount} pt${pointCount > 1 ? "s" : ""} tracés, min. ${MIN_POINTS})`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hints */}
      {strokeHints.length > 0 && !submitted && (
        <div className="flex flex-col gap-1.5">
          <AnimatePresence>
            {strokeHints.slice(0, hintIdx + 1).map((hint, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.12)" }}
              >
                <span className="text-xs font-bold" style={{ color, fontFamily: "var(--font-dm-sans)" }}>
                  {i + 1}
                </span>
                <p className="text-xs" style={{ color: "rgba(248,244,236,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                  {hint}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          {hintIdx < strokeHints.length - 1 && (
            <button onClick={() => setHintIdx(h => h + 1)}
              className="text-xs text-left px-3"
              style={{ color: `${color}80`, fontFamily: "var(--font-dm-sans)" }}>
              + Indice suivant
            </button>
          )}
        </div>
      )}

      {/* Boutons */}
      {!submitted && (
        <div className="flex gap-3">
          <motion.button
            onClick={clear}
            disabled={!hasDrawing}
            whileTap={hasDrawing ? { scale: 0.97 } : {}}
            className="flex-1 rounded-full py-3 text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: hasDrawing ? "rgba(248,244,236,0.6)" : "rgba(248,244,236,0.2)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Effacer
          </motion.button>
          <motion.button
            onClick={submit}
            disabled={!hasDrawing}
            whileTap={hasDrawing ? { scale: 0.97 } : {}}
            className="flex-[2] rounded-full py-3 text-sm font-semibold"
            style={{
              background: hasDrawing
                ? `linear-gradient(135deg,${color},#055C3F)`
                : "rgba(255,255,255,0.06)",
              color: hasDrawing ? "var(--text)" : "var(--text-dim)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {hasDrawing ? `Valider (${pointCount} pts)` : "Trace d'abord la lettre"}
          </motion.button>
        </div>
      )}
    </div>
  );
}
