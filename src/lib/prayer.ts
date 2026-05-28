import { Coordinates, CalculationMethod, PrayerTimes, Prayer, Madhab } from "adhan";

export type CalcMethodKey =
  | "MuslimWorldLeague"
  | "Egyptian"
  | "Karachi"
  | "UmmAlQura"
  | "NorthAmerica"
  | "Kuwait"
  | "Dubai";

export const CALC_METHOD_LABELS: Record<CalcMethodKey, string> = {
  MuslimWorldLeague: "Ligue Islamique Mondiale",
  Egyptian:          "Égyptien",
  Karachi:           "Université de Karachi",
  UmmAlQura:         "Oum Al-Qura (Mecque)",
  NorthAmerica:      "Amérique du Nord (ISNA)",
  Kuwait:            "Koweït",
  Dubai:             "Dubaï",
};

export const PRAYER_LABELS: Record<string, { fr: string; ar: string }> = {
  fajr:    { fr: "Fajr",    ar: "الفجر"  },
  sunrise: { fr: "Lever",   ar: "الشروق" },
  dhuhr:   { fr: "Dohr",    ar: "الظهر"  },
  asr:     { fr: "Asr",     ar: "العصر"  },
  maghrib: { fr: "Maghrib", ar: "المغرب" },
  isha:    { fr: "Icha",    ar: "العشاء"  },
};

export const PRAYER_ORDER = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;

export type PrayerKey = (typeof PRAYER_ORDER)[number];

export interface ComputedPrayerTimes {
  fajr:    Date;
  sunrise: Date;
  dhuhr:   Date;
  asr:     Date;
  maghrib: Date;
  isha:    Date;
}

export function computePrayerTimes(
  lat: number,
  lng: number,
  method: CalcMethodKey = "MuslimWorldLeague",
  date = new Date()
): ComputedPrayerTimes {
  const coords = new Coordinates(lat, lng);
  const params = CalculationMethod[method]();
  params.madhab = Madhab.Shafi;
  const pt = new PrayerTimes(coords, date, params);

  return {
    fajr:    pt.fajr,
    sunrise: pt.sunrise,
    dhuhr:   pt.dhuhr,
    asr:     pt.asr,
    maghrib: pt.maghrib,
    isha:    pt.isha,
  };
}

export function getNextPrayer(times: ComputedPrayerTimes): PrayerKey | null {
  const now = new Date();
  for (const key of PRAYER_ORDER) {
    if (times[key] > now) return key;
  }
  return null;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function msUntil(date: Date): number {
  return Math.max(0, date.getTime() - Date.now());
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}min`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
