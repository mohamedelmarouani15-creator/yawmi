import Link from "next/link";

export default function AppNotFound() {
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
      <p
        style={{
          color: "#D4AF37",
          fontSize: "48px",
          fontFamily: "var(--font-amiri, Georgia, serif)",
          direction: "rtl",
          margin: 0,
          opacity: 0.7,
        }}
      >
        ٤٠٤
      </p>

      <h1
        style={{
          color: "#F8F4EC",
          fontSize: "18px",
          fontWeight: 700,
          textAlign: "center",
          margin: 0,
        }}
      >
        Page introuvable
      </h1>

      <p
        style={{
          color: "rgba(248,244,236,0.45)",
          fontSize: "13px",
          textAlign: "center",
          margin: 0,
          maxWidth: "260px",
          lineHeight: 1.5,
        }}
      >
        Cette page n&apos;existe pas ou a été déplacée.
      </p>

      <Link
        href="/accueil"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "48px",
          width: "200px",
          borderRadius: "24px",
          background: "#055C3F",
          color: "#F8F4EC",
          fontSize: "14px",
          fontWeight: 700,
          textDecoration: "none",
          letterSpacing: "0.04em",
        }}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
