"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2"
      style={{ background: "rgba(239,68,68,0.9)", backdropFilter: "blur(8px)" }}>
      <WifiOff size={14} style={{ color: "#fff" }} />
      <p className="text-xs font-medium text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
        Pas de connexion — certaines fonctions sont limitées
      </p>
    </div>
  );
}
