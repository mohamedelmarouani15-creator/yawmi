"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CONSENT_KEY = "cookie_consent";

type ConsentValue = "accepted" | "rejected" | null;

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentValue>(null);

  useEffect(() => {
    // Hydratation depuis localStorage au montage — indisponible côté SSR,
    // donc volontairement lu après montage plutôt que via un lazy initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(localStorage.getItem(CONSENT_KEY) as ConsentValue);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent("accepted");
    // Le cookie yawmi_lang peut être écrit librement
    document.cookie = "cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax";
  }

  function reject() {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setConsent("rejected");
    // Refus : on supprime le cookie yawmi_lang s'il existe
    document.cookie = "yawmi_lang=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "cookie_consent=rejected; path=/; max-age=31536000; SameSite=Lax";
  }

  const visible = consent === null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2"
          style={{ pointerEvents: "auto" }}
        >
          <div
            className="mx-auto max-w-lg rounded-2xl px-5 py-4 shadow-xl"
            style={{
              background: "rgba(6,26,18,0.97)",
              border: "1px solid rgba(212,175,55,0.2)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)", opacity: 0.85 }}
            >
              Yawmi utilise un seul cookie fonctionnel{" "}
              <code
                className="text-xs rounded px-1"
                style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}
              >
                yawmi_lang
              </code>{" "}
              pour mémoriser votre préférence de langue. Aucun tracking, aucune publicité.{" "}
              <Link
                href="/privacy"
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: "#D4AF37" }}
              >
                Politique de confidentialité
              </Link>
            </p>
            <div className="flex gap-3">
              <button
                onClick={accept}
                className="flex-1 rounded-full py-2.5 text-sm font-semibold transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #055C3F, #0a8a5e)",
                  color: "#F8F4EC",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Accepter
              </button>
              <button
                onClick={reject}
                className="flex-1 rounded-full py-2.5 text-sm font-semibold transition-all active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(248,244,236,0.6)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Refuser
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
