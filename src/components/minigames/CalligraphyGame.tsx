"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/lib/game/types";

interface Props {
  question: Question;
  onComplete: (isCorrect: boolean) => void;
  color: string;
}

interface Point { x: number; y: number }

const CANVAS_SIZE = 300;
const STROKE_WIDTH = 14;
const PASS_COVERAGE = 0.45; // 45% of reference letter must be covered

// Compute coverage: what fraction of the reference (black) pixels are covered by drawn pixels
function computeCoverage(refCanvas: HTMLCanvasElement, drawCanvas: HTMLCanvasElement): number {
  const refCtx  = refCanvas.getContext("2d")!;
  const drawCtx = drawCanvas.getContext("2d")!;
  const refData  = refCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
  const drawData = drawCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

  let refPixels  = 0;
  let hitPixels  = 0;

  for (let i = 0; i < refData.length; i += 4) {
    const refAlpha  = refData[i + 3];
    const drawAlpha = drawData[i + 3];
    if (refAlpha > 50) {
      refPixels++;
      if (drawAlpha > 50) hitPixels++;
    }
  }
  return refPixels === 0 ? 0 : hitPixels / refPixels;
}

// Draw the reference letter onto a canvas using canvas text API
function drawReference(canvas: HTMLCanvasElement, letter: string, color = "rgba(212,175,55,0.18)") {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fillStyle = color;
  ctx.font = `bold ${CANVAS_SIZE * 0.72}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
}

// Draw reference to offscreen canvas in solid black (for coverage computation)
function drawReferenceBlack(canvas: HTMLCanvasElement, letter: string) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.font = `bold ${CANVAS_SIZE * 0.72}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
}

export default function CalligraphyGame({ question, onComplete, color }: Props) {
  const letter       = question.minigameData?.letter ?? question.question;
  const strokeHints  = question.minigameData?.strokeHints ?? [];
  const passThreshold = question.minigameData?.passCoverage ?? PASS_COVERAGE;

  const visCanvasRef  = useRef<HTMLCanvasElement>(null);  // visible reference letter
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);  // user drawing
  const refBlackRef   = useRef<HTMLCanvasElement>(null);  // offscreen for scoring
  const userBlackRef  = useRef<HTMLCanvasElement>(null);  // offscreen for scoring

  const [isDrawing,  setIsDrawing]  = useState(false);
  const [paths,      setPaths]      = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [submitted,  setSubmitted]  = useState(false);
  const [coverage,   setCoverage]   = useState(0);
  const [score,      setScore]      = useState<"correct" | "incorrect" | null>(null);
  const [hintIdx,    setHintIdx]    = useState(0);

  // Initialize canvases
  useEffect(() => {
    if (!visCanvasRef.current || !refBlackRef.current) return;
    drawReference(visCanvasRef.current, letter);
    drawReferenceBlack(refBlackRef.current, letter);
  }, [letter]);

  // Redraw user strokes on drawCanvas
  const redrawStrokes = useCallback((allPaths: Point[][], currentPt: Point[] = []) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = color;
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const path of [...allPaths, currentPt]) {
      if (path.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
      ctx.stroke();
    }
  }, [color]);

  // Also mirror strokes to userBlack (for scoring)
  const redrawBlack = useCallback((allPaths: Point[][]) => {
    const canvas = userBlackRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const path of allPaths) {
      if (path.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
      ctx.stroke();
    }
  }, []);

  const getPos = (e: React.TouchEvent | React.MouseEvent): Point => {
    const canvas = drawCanvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (submitted) return;
    e.preventDefault();
    setIsDrawing(true);
    const pt = getPos(e);
    setCurrentPath([pt]);
  }, [submitted]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || submitted) return;
    e.preventDefault();
    const pt = getPos(e);
    setCurrentPath(prev => {
      const newPath = [...prev, pt];
      redrawStrokes(paths, newPath);
      return newPath;
    });
  }, [isDrawing, submitted, paths, redrawStrokes]);

  const endDraw = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      const newPaths = [...paths, currentPath];
      setPaths(newPaths);
      setCurrentPath([]);
      redrawStrokes(newPaths);
      redrawBlack(newPaths);
    }
  }, [isDrawing, currentPath, paths, redrawStrokes, redrawBlack]);

  const clear = useCallback(() => {
    setPaths([]);
    setCurrentPath([]);
    redrawStrokes([]);
    redrawBlack([]);
  }, [redrawStrokes, redrawBlack]);

  const submit = useCallback(() => {
    if (paths.length === 0) return;
    redrawBlack(paths);

    const cov = computeCoverage(refBlackRef.current!, userBlackRef.current!);
    setCoverage(Math.round(cov * 100));
    const correct = cov >= passThreshold;
    setScore(correct ? "correct" : "incorrect");
    setSubmitted(true);
    setTimeout(() => onComplete(correct), 1400);
  }, [paths, redrawBlack, passThreshold, onComplete]);

  const strokeCount = paths.length;
  const hasDrawing  = strokeCount > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Question header */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest mb-1"
          style={{ color: "rgba(212,175,55,0.6)", fontFamily: "var(--font-dm-sans)" }}>
          Calligraphie au doigt
        </p>
        <p className="text-base font-semibold"
          style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>
          {question.question !== letter ? question.question : `Trace la lettre : ${letter}`}
        </p>
      </div>

      {/* Canvas area */}
      <div className="relative mx-auto" style={{ width: "100%", maxWidth: CANVAS_SIZE, aspectRatio: "1" }}>
        {/* Background reference */}
        <canvas
          ref={visCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 w-full h-full rounded-2xl"
          style={{ background: "rgba(5,20,12,0.95)", border: "1px solid rgba(212,175,55,0.15)" }}
        />

        {/* Drawing layer */}
        <canvas
          ref={drawCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 w-full h-full rounded-2xl"
          style={{ touchAction: "none", cursor: submitted ? "default" : "crosshair" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />

        {/* Offscreen canvases (scoring only) */}
        <canvas ref={refBlackRef}  width={CANVAS_SIZE} height={CANVAS_SIZE} className="hidden" />
        <canvas ref={userBlackRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="hidden" />

        {/* Result overlay */}
        <AnimatePresence>
          {submitted && score && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
              style={{ background: score === "correct" ? "rgba(34,197,94,0.15)" : "rgba(248,113,113,0.12)" }}
            >
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                style={{ fontSize: 52 }}
              >
                {score === "correct" ? "✓" : "✗"}
              </motion.span>
              <p className="text-sm font-bold mt-2"
                style={{ color: score === "correct" ? "#4ade80" : "#f87171", fontFamily: "var(--font-dm-sans)" }}>
                {score === "correct" ? "Belle calligraphie !" : "Continue à t'entraîner"}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(248,244,236,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                Couverture : {coverage}%{score === "correct" ? "" : ` (min. ${Math.round(passThreshold * 100)}%)`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stroke hints */}
      {strokeHints.length > 0 && !submitted && (
        <div className="flex flex-col gap-1.5">
          <AnimatePresence>
            {strokeHints.slice(0, hintIdx + 1).map((hint, i) => (
              <motion.div
                key={i}
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
            <button
              onClick={() => setHintIdx(h => h + 1)}
              className="text-xs text-left px-3"
              style={{ color: `${color}80`, fontFamily: "var(--font-dm-sans)" }}
            >
              + Indice suivant
            </button>
          )}
        </div>
      )}

      {/* Controls */}
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
              background: hasDrawing ? `linear-gradient(135deg,${color},#055C3F)` : "rgba(255,255,255,0.06)",
              color: hasDrawing ? "#F8F4EC" : "rgba(248,244,236,0.3)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Valider
          </motion.button>
        </div>
      )}

      {/* Stroke counter */}
      {!submitted && hasDrawing && (
        <p className="text-center text-xs" style={{ color: "rgba(248,244,236,0.3)", fontFamily: "var(--font-dm-sans)" }}>
          {strokeCount} trait{strokeCount > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
