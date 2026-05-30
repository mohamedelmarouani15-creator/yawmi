"use client";

import { useState, useEffect, useCallback } from "react";
import { computePrayerTimes, PRAYER_LABELS, PRAYER_ORDER } from "@/lib/prayer";
import { storage } from "@/lib/storage";

// ── Clés localStorage ─────────────────────────────────────────
const KEY_PRAYERS = "yawmi_notif_prayers";
const KEY_DUELS   = "yawmi_notif_duels";
const KEY_DAILY   = "yawmi_notif_daily";

export type NotifCategory = "prayers" | "duels" | "daily";

export interface NotifPrefs {
  prayers: boolean;
  duels:   boolean;
  daily:   boolean;
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function useNotifications() {
  const [permission,   setPermission]   = useState<NotificationPermission>("default");
  const [prefs,        setPrefs]        = useState<NotifPrefs>({ prayers: false, duels: false, daily: false });
  const [supported,    setSupported]    = useState(true);
  const [standalone,   setStandalone]   = useState(true);

  useEffect(() => {
    setSupported(typeof Notification !== "undefined" && "serviceWorker" in navigator);
    setStandalone(isStandaloneMode());
    if (typeof Notification !== "undefined") setPermission(Notification.permission);
    setPrefs({
      prayers: localStorage.getItem(KEY_PRAYERS) === "1",
      duels:   localStorage.getItem(KEY_DUELS)   === "1",
      daily:   localStorage.getItem(KEY_DAILY)   === "1",
    });
  }, []);

  // ── Planifie les notifications de prière ─────────────────────
  useEffect(() => {
    if (!prefs.prayers || permission !== "granted") return;
    const s     = storage.getSettings();
    const times = computePrayerTimes(s.lat, s.lng, s.method, s.madhab);
    const now   = new Date();
    const ids: ReturnType<typeof setTimeout>[] = [];
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
            tag:   `yawmi-prayer-${key}`,
          });
        } catch { /* silencieux */ }
      }, delay));
    });
    return () => ids.forEach(clearTimeout);
  }, [prefs.prayers, permission]);

  // ── Abonnement push ───────────────────────────────────────────
  const subscribePush = useCallback(async (userId: string): Promise<boolean> => {
    if (!("PushManager" in window)) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription()
        ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), userId }),
      });
      return true;
    } catch { return false; }
  }, []);

  // ── Demander la permission de base (Notification) ────────────
  const requestBasicPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof Notification === "undefined") return "denied";
    const p = await Notification.requestPermission();
    setPermission(p);
    return p;
  }, []);

  // ── Demander la permission + abonnement push (pour défis/daily) ──
  const requestPushPermission = useCallback(async (userId?: string): Promise<string> => {
    if (typeof Notification === "undefined") return "unsupported";
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
    if (isIOS() && !isStandaloneMode()) return "needs-standalone";
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted" && userId) await subscribePush(userId);
    return p;
  }, [subscribePush]);

  // ── Activer / désactiver une catégorie ────────────────────────
  const toggle = useCallback(async (
    category: NotifCategory,
    userId?: string,
  ): Promise<string> => {
    const keyMap = { prayers: KEY_PRAYERS, duels: KEY_DUELS, daily: KEY_DAILY };

    // Prières = notification locale, pas besoin de push
    if (category === "prayers") {
      if (permission !== "granted") {
        const p = await requestBasicPermission();
        if (p !== "granted") return p === "denied" ? "denied" : "unsupported";
      }
      const next = !prefs.prayers;
      localStorage.setItem(KEY_PRAYERS, next ? "1" : "0");
      setPrefs(p => ({ ...p, prayers: next }));
      return "granted";
    }

    // Défis / Défi du jour = push notification
    if (permission !== "granted") {
      const result = await requestPushPermission(userId);
      if (result !== "granted") return result;
    }
    const next = !prefs[category];
    localStorage.setItem(keyMap[category], next ? "1" : "0");
    setPrefs(p => ({ ...p, [category]: next }));
    return "granted";
  }, [permission, prefs, requestBasicPermission, requestPushPermission]);

  const anyEnabled = prefs.prayers || prefs.duels || prefs.daily;

  return { permission, prefs, supported, standalone, anyEnabled, toggle, subscribePush };
}
