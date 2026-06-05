export default function QuizLoading() {
  return (
    <div
      role="status"
      aria-label="Chargement du quiz"
      style={{
        minHeight: "100svh",
        background: "#061A12",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "2px solid rgba(212,175,55,0.2)",
          borderTopColor: "#D4AF37",
          animation: "yawmi-spin 0.8s linear infinite",
        }}
      />
      <p
        style={{
          color: "rgba(248,244,236,0.4)",
          fontSize: "0.8rem",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "0.05em",
        }}
      >
        Préparation du quiz…
      </p>
      <style>{`
        @keyframes yawmi-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
