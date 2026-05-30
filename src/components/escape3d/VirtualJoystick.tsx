"use client";

import { useRef, useEffect, useCallback } from "react";

interface JoystickOutput {
  x: number; // [-1, 1]
  y: number; // [-1, 1]
}

interface Props {
  onChange: (v: JoystickOutput) => void;
}

export default function VirtualJoystick({ onChange }: Props) {
  const baseRef   = useRef<HTMLDivElement>(null);
  const thumbRef  = useRef<HTMLDivElement>(null);
  const touchId   = useRef<number | null>(null);
  const center    = useRef({ x: 0, y: 0 });
  const MAX_R     = 44;

  const reset = useCallback(() => {
    touchId.current = null;
    onChange({ x: 0, y: 0 });
    if (thumbRef.current) {
      thumbRef.current.style.transform = "translate(-50%, -50%)";
    }
  }, [onChange]);

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    function onTouchStart(e: TouchEvent) {
      if (touchId.current !== null) return;
      const t = e.changedTouches[0];
      touchId.current = t.identifier;
      const rect = base!.getBoundingClientRect();
      center.current = {
        x: rect.left + rect.width  / 2,
        y: rect.top  + rect.height / 2,
      };
    }

    function onTouchMove(e: TouchEvent) {
      if (touchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== touchId.current) continue;
        const dx = t.clientX - center.current.x;
        const dy = t.clientY - center.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clamped = Math.min(dist, MAX_R);
        const angle = Math.atan2(dy, dx);
        const cx = Math.cos(angle) * clamped;
        const cy = Math.sin(angle) * clamped;
        if (thumbRef.current) {
          thumbRef.current.style.transform =
            `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`;
        }
        onChange({
          x:  cx / MAX_R,
          y: -cy / MAX_R, // y inversé : haut = positif
        });
      }
    }

    function onTouchEnd(e: TouchEvent) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId.current) { reset(); break; }
      }
    }

    base.addEventListener("touchstart",  onTouchStart,  { passive: true });
    window.addEventListener("touchmove", onTouchMove,   { passive: true });
    window.addEventListener("touchend",  onTouchEnd,    { passive: true });
    return () => {
      base.removeEventListener("touchstart",  onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
    };
  }, [onChange, reset]);

  return (
    <div
      ref={baseRef}
      className="relative select-none"
      style={{
        width: 110, height: 110,
        borderRadius: "50%",
        background: "rgba(212,175,55,0.12)",
        border: "2px solid rgba(212,175,55,0.35)",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Thumb */}
      <div
        ref={thumbRef}
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: 42, height: 42,
          borderRadius: "50%",
          background: "rgba(212,175,55,0.55)",
          border: "2px solid rgba(212,175,55,0.9)",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 12px rgba(212,175,55,0.5)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
