"use client";

import { useRef, useEffect, useCallback } from "react";

interface Props {
  onChange: (dx: number, dy: number) => void;
  isTouchDevice: boolean;
}

const DRAG_THRESHOLD = 8;
const SENS = 0.004;

export default function LookZone({ onChange, isTouchDevice }: Props) {
  const touchId    = useRef<number | null>(null);
  const startPos   = useRef({ x: 0, y: 0 });
  const lastPos    = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dotRef     = useRef<HTMLDivElement>(null);

  const showDot = useCallback((x: number, y: number, visible: boolean) => {
    if (!dotRef.current) return;
    dotRef.current.style.opacity = visible ? "1" : "0";
    dotRef.current.style.left = `${x - 20}px`;
    dotRef.current.style.top  = `${y - 20}px`;
  }, []);

  useEffect(() => {
    const el = document.getElementById("ms-look-zone");
    if (!el) return;

    function onStart(e: TouchEvent) {
      if (touchId.current !== null) return;
      const t = e.changedTouches[0];
      touchId.current = t.identifier;
      startPos.current = { x: t.clientX, y: t.clientY };
      lastPos.current  = { x: t.clientX, y: t.clientY };
      isDragging.current = false;
    }

    function onMove(e: TouchEvent) {
      if (touchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== touchId.current) continue;
        const totalDx = t.clientX - startPos.current.x;
        const totalDy = t.clientY - startPos.current.y;
        if (!isDragging.current) {
          if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) < DRAG_THRESHOLD) return;
          isDragging.current = true;
        }
        const dx = (t.clientX - lastPos.current.x) * SENS;
        const dy = (t.clientY - lastPos.current.y) * SENS;
        lastPos.current = { x: t.clientX, y: t.clientY };
        onChange(dx, dy);
        showDot(t.clientX, t.clientY, true);
        e.preventDefault();
      }
    }

    function onEnd(e: TouchEvent) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId.current) {
          const wasDragging = isDragging.current;
          touchId.current = null;
          isDragging.current = false;
          showDot(0, 0, false);
          if (!wasDragging) {
            el!.style.pointerEvents = "none";
            const target = document.elementFromPoint(t.clientX, t.clientY);
            el!.style.pointerEvents = "auto";
            target?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: t.clientX, clientY: t.clientY, view: window }));
          }
          break;
        }
      }
    }

    el.addEventListener("touchstart",  onStart, { passive: true });
    el.addEventListener("touchmove",   onMove,  { passive: false });
    el.addEventListener("touchend",    onEnd,   { passive: true });
    el.addEventListener("touchcancel", onEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart",  onStart);
      el.removeEventListener("touchmove",   onMove);
      el.removeEventListener("touchend",    onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [onChange, showDot]);

  return (
    <>
      <div
        id="ms-look-zone"
        style={{
          position: "absolute",
          top: 0, right: 0,
          width: "55%", height: "100%",
          zIndex: 9,
          touchAction: "none",
          pointerEvents: isTouchDevice ? "auto" : "none",
        }}
      />
      <div
        ref={dotRef}
        style={{
          position: "absolute",
          width: 40, height: 40,
          borderRadius: "50%",
          border: "1.5px solid rgba(212,175,55,0.4)",
          background: "rgba(212,175,55,0.06)",
          pointerEvents: "none",
          zIndex: 10,
          opacity: 0,
          transition: "opacity 0.15s",
        }}
      />
    </>
  );
}
