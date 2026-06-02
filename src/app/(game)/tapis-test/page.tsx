"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Three.js ne tourne pas en SSR
const TapisScene = dynamic(
  () => import("@/components/escape3d/TapisScene"),
  { ssr: false },
);

export default function TapisTestPage() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#020a05", overflow: "hidden" }}>

      {/* Bouton retour */}
      <Link
        href="/oasis/escape"
        style={{
          position: "absolute", top: 16, left: 16, zIndex: 50,
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,0,0,0.55)", border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: 24, padding: "8px 14px", color: "var(--gold)",
          backdropFilter: "blur(8px)", textDecoration: "none",
          fontFamily: "var(--font-dm-sans)", fontSize: 11,
          letterSpacing: "0.15em", textTransform: "uppercase",
        }}
      >
        <ArrowLeft size={14} />
        Retour
      </Link>

      {/* Titre */}
      <p style={{
        position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
        zIndex: 50, pointerEvents: "none",
        color: "rgba(212,175,55,0.6)", fontSize: 10,
        fontFamily: "var(--font-dm-sans)", letterSpacing: "0.25em",
        textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        Le Tapis Voyageur · Validation visuelle
      </p>

      {/* Légende */}
      <p style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 50, pointerEvents: "none",
        color: "rgba(212,175,55,0.35)", fontSize: 9,
        fontFamily: "var(--font-dm-sans)", letterSpacing: "0.2em",
        textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        Glisse pour orbiter · Scroll pour zoomer
      </p>

      <Suspense fallback={
        <div style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 14,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "2px solid #D4AF37", borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{
            color: "rgba(212,175,55,0.5)", fontSize: 10,
            fontFamily: "var(--font-dm-sans)", letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}>
            Le tapis se déploie…
          </p>
        </div>
      }>
        <TapisScene />
      </Suspense>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
