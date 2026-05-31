"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const TombouctouScene = dynamic(
  () => import("@/components/escape/tombouctou/TombouctouScene"),
  { ssr: false }
);

function TombouctouLoader() {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#061A12",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <div style={{
        width: 1, height: 80,
        background: "linear-gradient(to bottom, transparent, #D4AF37 50%, transparent)",
        animation: "blink 2s ease-in-out infinite",
      }} />
      <p style={{
        color: "#D4AF37", fontFamily: "Georgia, serif",
        fontSize: 12, letterSpacing: "0.35em", opacity: 0.5,
        textTransform: "uppercase",
      }}>
        Tombouctou
      </p>
      <style>{`@keyframes blink { 0%,100%{opacity:.2} 50%{opacity:1} }`}</style>
    </div>
  );
}

export default function TombouctouPage() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 40,
      width: "100vw", height: "100dvh",
      background: "#061A12", overflow: "hidden",
    }}>
      <Suspense fallback={<TombouctouLoader />}>
        <TombouctouScene />
      </Suspense>
    </div>
  );
}
