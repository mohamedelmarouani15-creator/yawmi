"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trash2, Check } from "lucide-react";

interface ArabicWritingCanvasProps {
  letter: string;           // The Arabic letter/word to trace
  transliteration: string;
  color?: string;
  onValidated?: () => void;
}

export default function ArabicWritingCanvas({
  letter,
  transliteration,
  color = "#D4AF37",
  onValidated,
}: ArabicWritingCanvasProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing]   = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [validated, setValidated]   = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Setup canvas context
  const getCtx = useCallback((): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 4;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    return ctx;
  }, [color]);

  // Initialize canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Set physical size = CSS size for sharpness
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }, []);

  function getPos(e: React.TouchEvent | React.MouseEvent): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  }

  function startDraw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    setDrawing(true);
    setValidated(false);
    const pos  = getPos(e);
    lastPos.current = pos;
    const ctx = getCtx();
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    if (!drawing) return;
    const pos = getPos(e);
    const ctx = getCtx();
    if (!ctx || !lastPos.current) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasStrokes(true);
  }

  function endDraw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    setDrawing(false);
    lastPos.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
    setValidated(false);
  }

  function validate() {
    setValidated(true);
    onValidated?.();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        {/* Model letter */}
        <div className="flex flex-col items-center justify-center rounded-2xl px-4 py-4 shrink-0"
          style={{
            background: `${color}0a`,
            border: `1px solid ${color}30`,
            minWidth: 80,
          }}>
          <p className="text-5xl" style={{ color, fontFamily: "var(--font-amiri)", direction: "rtl" }}>
            {letter}
          </p>
          <p className="text-[10px] mt-1 opacity-50"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            {transliteration}
          </p>
          <p className="text-[9px] mt-0.5 opacity-30"
            style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
            Modèle
          </p>
        </div>

        {/* Drawing canvas */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="relative rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", height: 120 }}>
            {/* Guide text */}
            {!hasStrokes && (
              <p className="absolute inset-0 flex items-center justify-center text-xs opacity-20 select-none pointer-events-none"
                style={{ color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}>
                Trace ici
              </p>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-full touch-none"
              style={{ cursor: "crosshair" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={clearCanvas}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(248,244,236,0.5)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              <Trash2 size={11} />
              Effacer
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={validate}
              disabled={!hasStrokes}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-30"
              style={{
                background: validated ? "rgba(34,197,94,0.2)" : `${color}20`,
                border: `1px solid ${validated ? "#22c55e44" : color + "40"}`,
                color: validated ? "#22c55e" : color,
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {validated ? <CheckCircle2 size={11} /> : <Check size={11} />}
              {validated ? "Validé !" : "C'est bien !"}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {validated && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl px-3 py-2.5 text-center"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e33" }}
          >
            <p className="text-xs font-bold" style={{ color: "#22c55e", fontFamily: "var(--font-dm-sans)" }}>
              Excellent ! Continue à pratiquer.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
