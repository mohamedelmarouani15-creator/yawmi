"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then(reg => {
      // Vérifie immédiatement si une mise à jour est disponible
      reg.update().catch(() => {});

      reg.addEventListener("updatefound", () => {
        const next = reg.installing;
        if (!next) return;
        next.addEventListener("statechange", () => {
          // Nouveau SW activé → recharge la page pour charger le nouveau code
          if (next.state === "activated") window.location.reload();
        });
      });
    }).catch(() => {});

    // Nouveau SW a pris le contrôle → recharge
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  return null;
}
