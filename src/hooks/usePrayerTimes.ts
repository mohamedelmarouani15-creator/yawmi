"use client";

import { useState, useEffect } from "react";
import {
  computePrayerTimes,
  getNextPrayer,
  formatCountdown,
  msUntil,
  type ComputedPrayerTimes,
  type PrayerKey,
} from "@/lib/prayer";
import { useSettings } from "./useSettings";

export function usePrayerTimes() {
  const { settings } = useSettings();
  const [times, setTimes]       = useState<ComputedPrayerTimes | null>(null);
  const [nextPrayer, setNext]   = useState<PrayerKey | null>(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    // computePrayerTimes dépend de l'heure courante (impur) — calcul volontairement
    // déporté dans un effet plutôt qu'en render/useMemo.
    const t = computePrayerTimes(settings.lat, settings.lng, settings.method, settings.madhab);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimes(t);
    setNext(getNextPrayer(t));
  }, [settings]);

  useEffect(() => {
    if (!times || !nextPrayer) return;
    const tick = () => {
      const ms = msUntil(times[nextPrayer]);
      setCountdown(formatCountdown(ms));
      if (ms === 0) {
        const fresh = computePrayerTimes(settings.lat, settings.lng, settings.method, settings.madhab);
        setTimes(fresh);
        setNext(getNextPrayer(fresh));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [times, nextPrayer, settings]);

  return { times, nextPrayer, countdown };
}
