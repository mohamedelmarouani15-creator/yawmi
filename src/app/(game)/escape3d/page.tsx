"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Three.js ne tourne pas en SSR
const RiadScene = dynamic(
  () => import("@/components/escape3d/RiadScene"),
  { ssr: false }
);

export default function Escape3DPage() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 40,
      width: "100vw", height: "100dvh",
      background: "#080D10", overflow: "hidden",
    }}>
      {/* Retour */}
      <Link
        href="/oasis/escape"
        className="absolute top-4 left-4 z-50 flex items-center gap-2 rounded-full px-3 py-2"
        style={{
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(212,175,55,0.3)",
          color: "var(--gold)",
          backdropFilter: "blur(8px)",
        }}>
        <ArrowLeft size={16} />
        <span className="text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>Quitter</span>
      </Link>

      <Suspense
        fallback={
          <div style={{
            width: "100%", height: "100%",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
          }}>
            <div className="w-10 h-10 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
            <p className="text-xs tracking-widest uppercase opacity-50"
              style={{ color: "var(--gold)", fontFamily: "var(--font-dm-sans)" }}>
              Le riad s'éveille…
            </p>
          </div>
        }>
        <RiadScene />
      </Suspense>
    </div>
  );
}
