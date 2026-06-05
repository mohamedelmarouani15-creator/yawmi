export default function CoranLoading() {
  return (
    <div
      role="status"
      aria-label="Chargement du Coran"
      style={{
        minHeight: "60svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "2px solid rgba(212,175,55,0.2)",
          borderTopColor: "#D4AF37",
          animation: "yawmi-spin 0.8s linear infinite",
        }}
      />
      <style>{`
        @keyframes yawmi-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
