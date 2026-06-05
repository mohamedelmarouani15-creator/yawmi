"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ opacity: 0, y: -32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -32 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2"
          style={{ background: "#1a2a1a" }}
        >
          <WifiOff size={12} style={{ color: "#F8F4EC", flexShrink: 0 }} />
          <p
            className="text-xs font-medium"
            style={{ color: "#F8F4EC", fontFamily: "var(--font-dm-sans)" }}
          >
            Mode hors-ligne — progression sauvegardée localement
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
