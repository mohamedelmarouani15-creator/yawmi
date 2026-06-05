"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Yawmi error boundary]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "#0A0F0D",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        gap: "16px",
        fontFamily: "var(--font-dm-sans, sans-serif)",
      }}
    >
      {/* Zellige accent */}
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" stroke="#D4AF37" strokeWidth="1.5" fill="none" opacity="0.6" />
        <polygon points="24,12 36,18 36,30 24,36 12,30 12,18" stroke="#D4AF37" strokeWidth="1" fill="none" opacity="0.35" />
      </svg>

      <h1
        style={{
          color: "#F8F4EC",
          fontSize: "18px",
          fontWeight: 700,
          textAlign: "center",
          margin: 0,
        }}
      >
        Une erreur est survenue
      </h1>

      <p
        style={{
          color: "rgba(248,244,236,0.45)",
          fontSize: "13px",
          textAlign: "center",
          margin: 0,
          maxWidth: "280px",
          lineHeight: 1.5,
        }}
      >
        {error.message || "Quelque chose s'est mal passé. Réessaie ou retourne à l'accueil."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "240px" }}>
        <button
          onClick={reset}
          style={{
            height: "48px",
            borderRadius: "24px",
            background: "#055C3F",
            border: "none",
            color: "#F8F4EC",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.04em",
          }}
        >
          Réessayer
        </button>

        <button
          onClick={() => router.replace("/accueil")}
          style={{
            height: "48px",
            borderRadius: "24px",
            background: "rgba(248,244,236,0.06)",
            border: "1px solid rgba(248,244,236,0.12)",
            color: "rgba(248,244,236,0.7)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
