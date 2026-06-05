"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Yawmi root error]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          background: "#0A0F0D",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          gap: "16px",
          fontFamily: "sans-serif",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ color: "#F8F4EC", fontSize: "18px", fontWeight: 700, textAlign: "center", margin: 0 }}>
          Une erreur critique est survenue
        </h1>
        <p style={{ color: "rgba(248,244,236,0.45)", fontSize: "13px", textAlign: "center", margin: 0 }}>
          {error.message || "Réessaie ou recharge la page."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "240px" }}>
          <button
            onClick={reset}
            style={{
              height: "48px", borderRadius: "24px", background: "#055C3F",
              border: "none", color: "#F8F4EC", fontSize: "14px",
              fontWeight: 700, cursor: "pointer",
            }}
          >
            Réessayer
          </button>
          <button
            onClick={() => { window.location.href = "/accueil"; }}
            style={{
              height: "48px", borderRadius: "24px",
              background: "rgba(248,244,236,0.06)",
              border: "1px solid rgba(248,244,236,0.12)",
              color: "rgba(248,244,236,0.7)", fontSize: "14px",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </body>
    </html>
  );
}
