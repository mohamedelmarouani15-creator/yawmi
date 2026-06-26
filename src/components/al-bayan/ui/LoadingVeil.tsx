"use client";

import { motion, AnimatePresence } from "framer-motion";

const STAR_POINTS = Array.from({ length: 8 }, (_, i) => {
  const outer = (i * Math.PI) / 4;
  const inner = outer + Math.PI / 8;
  const r = 38, ir = 17;
  return [
    `${50 + Math.cos(outer) * r},${50 + Math.sin(outer) * r}`,
    `${50 + Math.cos(inner) * ir},${50 + Math.sin(inner) * ir}`,
  ];
}).flat().join(" ");

const TILE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 100 100'>
  <polygon points='${STAR_POINTS}' fill='none' stroke='%23D4AF37' stroke-width='1' opacity='0.18'/>
  <circle cx='50' cy='50' r='8' fill='none' stroke='%23D4AF37' stroke-width='0.8' opacity='0.12'/>
</svg>`;

interface LoadingVeilProps {
  visible: boolean;
}

/**
 * Voile de chargement islamique : fond sombre avec motif zellige, astrolabe
 * rotatif, titre "Al-Bayān". Affiché pendant l'intro cinématique (~3s).
 */
export default function LoadingVeil({ visible }: LoadingVeilProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            background: "radial-gradient(ellipse at 50% 45%, #0D1628 0%, #05060C 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {/* Motif géométrique en arrière-plan */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,${TILE_SVG.replace(/#/g, "%23")}")`,
              backgroundSize: "80px 80px",
              opacity: 1,
            }}
          />

          {/* Vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, transparent 35%, rgba(3,4,8,0.85) 100%)",
            }}
          />

          {/* Astrolabe tournant */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            style={{ zIndex: 1, marginBottom: 28 }}
          >
            <svg width="88" height="88" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="46" stroke="#D4AF37" strokeWidth="0.8" opacity="0.4" />
              <circle cx="50" cy="50" r="34" stroke="#D4AF37" strokeWidth="0.6" opacity="0.25" />
              <circle cx="50" cy="50" r="9" stroke="#D4AF37" strokeWidth="1.2" opacity="0.6" />
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i * Math.PI) / 6;
                const x1 = 50 + Math.cos(a) * 34;
                const y1 = 50 + Math.sin(a) * 34;
                const x2 = 50 + Math.cos(a) * 46;
                const y2 = 50 + Math.sin(a) * 46;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeWidth="0.7" opacity="0.35" />;
              })}
              {/* Branches de la rose des vents */}
              {[0, 1, 2, 3].map((i) => {
                const a = (i * Math.PI) / 2;
                return (
                  <line
                    key={`main-${i}`}
                    x1={50 + Math.cos(a) * 9}
                    y1={50 + Math.sin(a) * 9}
                    x2={50 + Math.cos(a) * 34}
                    y2={50 + Math.sin(a) * 34}
                    stroke="#D4AF37"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })}
            </svg>
          </motion.div>

          {/* Titre */}
          <div style={{ zIndex: 1, textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(212,175,55,0.75)",
              }}
            >
              Al-Bayān
            </div>
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                marginTop: 10,
                height: 1,
                width: 100,
                margin: "10px auto 0",
                background: "linear-gradient(to right, transparent, rgba(212,175,55,0.55), transparent)",
              }}
            />
            <div
              style={{
                marginTop: 14,
                fontFamily: "var(--font-dm-sans)",
                fontSize: 9,
                color: "rgba(212,175,55,0.35)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Chargement…
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
