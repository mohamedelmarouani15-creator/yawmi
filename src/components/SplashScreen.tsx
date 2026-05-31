"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const exit = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDone, 700);
    }, 2400);
    return () => clearTimeout(exit);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#061A12" }}
        >
          {/* Zellige background */}
          <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.045 }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="sp-zellige" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path
                    d="M40 8 L44 28 L62 20 L50 36 L72 40 L50 44 L62 60 L44 52 L40 72 L36 52 L18 60 L30 44 L8 40 L30 36 L18 20 L36 28 Z"
                    fill="none" stroke="#D4AF37" strokeWidth="0.7" />
                  <circle cx="40" cy="40" r="4" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
                  <path d="M40 8 L40 0 M40 72 L40 80 M8 40 L0 40 M72 40 L80 40" stroke="#D4AF37" strokeWidth="0.4" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#sp-zellige)" />
            </svg>
          </div>

          {/* Halo central */}
          <div className="pointer-events-none absolute"
            style={{ width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,92,63,0.18) 0%, transparent 70%)" }} />

          {/* Contenu central */}
          <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">

            {/* Ornement haut */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <span className="block h-px w-14" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.55))" }} />
              <span style={{ color: "rgba(212,175,55,0.55)", fontSize: 9, letterSpacing: 4 }}>✦ ✦ ✦</span>
              <span className="block h-px w-14" style={{ background: "linear-gradient(to left, transparent, rgba(212,175,55,0.55))" }} />
            </motion.div>

            {/* Arabic يومي */}
            <motion.p
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 180, damping: 18 }}
              style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)", fontSize: "4.5rem", lineHeight: 1.1 }}
            >
              يومي
            </motion.p>

            {/* Yawmi */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)", fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}
            >
              Yawmi
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
            >
              Application familiale musulmane
            </motion.p>
          </div>

          {/* Barre de progression */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="absolute bottom-14 w-28"
          >
            <div className="h-0.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div className="h-full rounded-full" style={{
                background: "linear-gradient(to right, #055C3F, #D4AF37)",
                animation: "splashBar 2.2s ease-in-out forwards",
              }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
