"use client";

/**
 * Bloque le jeu en portrait sur mobile — la caméra isométrique et les
 * joysticks tactiles gauche/droite ont besoin de largeur pour ne pas se
 * chevaucher ; en portrait le jeu était injouable (retour utilisateur
 * direct). Overlay plein écran au-dessus de tout (z-index > Canvas + HUD).
 * L'état portrait/paysage est détecté une seule fois par le composant page
 * (voir `useIsPortrait`) et partagé avec ce composant ET le minuteur de jeu,
 * pour que le compte à rebours se mette aussi en pause tant que le joueur
 * n'a pas tourné son téléphone.
 */
export default function RotateDeviceOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 32,
        textAlign: "center",
        background: "#0A0F0D",
        color: "#F8F4EC",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      <div style={{ fontSize: 56, animation: "albayan-rotate-hint 1.6s ease-in-out infinite" }}>📱</div>
      <style>{`
        @keyframes albayan-rotate-hint {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(90deg); }
        }
      `}</style>
      <p style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#D4AF37" }}>
        Tourne ton téléphone
      </p>
      <p style={{ fontSize: 14, margin: 0, opacity: 0.75, maxWidth: 280 }}>
        Al-Bayan se joue en mode paysage, pour avoir assez de place pour les deux joysticks.
      </p>
    </div>
  );
}
