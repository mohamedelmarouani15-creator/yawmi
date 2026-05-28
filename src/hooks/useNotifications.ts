"use client";

import { useState, useEffect, useCallback } from "react";
import { computePrayerTimes, PRAYER_LABELS, PRAYER_ORDER } from "@/lib/prayer";
import { storage } from "@/lib/storage";

const PREF_KEY = "yawmi_notif_enabled";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled,    setEnabled]    = useState(false);

  useEffect(() => {
    if (typeof Notification !== "undefined") setPermission(Notification.permission);
    setEnabled(localStorage.getItem(PREF_KEY) === "1");
  }, []);

  // Planifie les notifications du jour à chaque activation
  useEffect(() => {
    if (!enabled || permission !== "granted") return;

    const s     = storage.getSettings();
    const times = computePrayerTimes(s.lat, s.lng, s.method);
    const now   = new Date();
    const ids:  ReturnType<typeof setTimeout>[] = [];

    PRAYER_ORDER.forEach(key => {
      const t     = times[key];
      const delay = t.getTime() - now.getTime();
      if (delay <= 0 || delay > 12 * 3600 * 1000) return;

      ids.push(setTimeout(async () => {
        try {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(`🕌 ${PRAYER_LABELS[key].fr}`, {
            body:  `Il est l'heure — ${t.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
            icon:  "/icons/icon-192x192.png",
            badge: "/icons/icon-96x96.png",
            tag:   `yawmi-${key}`,
          });
        } catch { /* silencieux */ }
      }, delay));
    });

    return () => ids.forEach(clearTimeout);
  }, [enabled, permission]);

  const enable = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === "undefined") return false;
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") {
      localStorage.setItem(PREF_KEY, "1");
      setEnabled(true);
      return true;
    }
    return false;
  }, []);

  const disable = useCallback(() => {
    localStorage.removeItem(PREF_KEY);
    setEnabled(false);
  }, []);

  return { permission, enabled, enable, disable };
}
