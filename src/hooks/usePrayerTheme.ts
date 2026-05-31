"use client";

import { useEffect } from "react";
import { computePrayerTimes } from "@/lib/prayer";
import { storage } from "@/lib/storage";

export function usePrayerTheme() {
  useEffect(() => {
    function apply() {
      const s = storage.getSettings();
      const mode = s.themeMode ?? "night";

      if (mode === "night") {
        document.documentElement.dataset.theme = "night";
        return;
      }
      if (mode === "day") {
        document.documentElement.dataset.theme = "day";
        return;
      }

      // auto : suit Fajr → Maghrib
      if (!s.lat || !s.lng) {
        document.documentElement.dataset.theme = "night";
        return;
      }
      const times = computePrayerTimes(s.lat, s.lng, s.method, s.madhab);
      const now   = new Date();
      document.documentElement.dataset.theme =
        now >= times.fajr && now < times.maghrib ? "day" : "night";
    }

    apply();
    const id = setInterval(apply, 60_000);
    return () => clearInterval(id);
  }, []);
}
