"use client";

import { useEffect } from "react";
import { computePrayerTimes } from "@/lib/prayer";
import { storage } from "@/lib/storage";

export function usePrayerTheme() {
  useEffect(() => {
    function apply() {
      const s = storage.getSettings();
      if (!s.lat || !s.lng) return;

      const times = computePrayerTimes(s.lat, s.lng, s.method, s.madhab);
      const now   = new Date();
      const isDay = now >= times.fajr && now < times.maghrib;

      document.documentElement.dataset.theme = isDay ? "day" : "night";
    }

    apply();
    const id = setInterval(apply, 60_000);
    return () => clearInterval(id);
  }, []);
}
