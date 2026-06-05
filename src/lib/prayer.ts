import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan";

export type CalcMethodKey =
  | "UOIF"
  | "MuslimWorldLeague"
  | "Egyptian"
  | "Karachi"
  | "UmmAlQura"
  | "NorthAmerica"
  | "Kuwait"
  | "Dubai"
  | "MoroccoHabous";

export type MadhabKey = "Shafi" | "Hanafi";

export const CALC_METHOD_LABELS: Record<CalcMethodKey, string> = {
  UOIF:              "UOIF / France — Fajr 12° / Isha 12°",
  MuslimWorldLeague: "Ligue Islamique Mondiale — Fajr 18° / Isha 17°",
  Egyptian:          "Autorité Égyptienne — Fajr 19.5° / Isha 17.5°",
  Karachi:           "Université de Karachi — Fajr 18° / Isha 18°",
  UmmAlQura:         "Oum Al-Qura (Arabie Saoudite) — Isha = Maghrib + 90min",
  NorthAmerica:      "ISNA (Amérique du Nord) — Fajr 15° / Isha 15°",
  Kuwait:            "Koweït — Fajr 18° / Isha 17.5°",
  Dubai:             "Dubaï — Fajr 18.2° / Isha 18.2°",
  MoroccoHabous:     "Ministère des Habous (Maroc) — Fajr 18° / Isha 17°",
};

export const MADHAB_LABELS: Record<MadhabKey, string> = {
  Shafi:  "Standard — Maliki / Chafi'i / Hanbali",
  Hanafi: "Hanafi (Asr plus tardif)",
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

function buildParams(method: CalcMethodKey) {
  if (method === "UOIF") {
    const p = CalculationMethod.Other();
    p.fajrAngle = 12;
    p.ishaAngle = 12;
    return p;
  }
  if (method === "MoroccoHabous") {
    const p = CalculationMethod.Other();
    p.fajrAngle = 18;
    p.ishaAngle = 17;
    return p;
  }
  return CalculationMethod[method]();
}

export function computePrayerTimes(
  lat: number,
  lng: number,
  method: CalcMethodKey = "UOIF",
  madhab: MadhabKey = "Shafi",
  date = new Date()
): ComputedPrayerTimes {
  const safeLat = Math.max(-89.9, Math.min(89.9, isFinite(lat) ? lat : 48.8566));
  const safeLng = Math.max(-180,  Math.min(180,  isFinite(lng) ? lng : 2.3522));
  const coords = new Coordinates(safeLat, safeLng);
  const params = buildParams(method);
  params.madhab = madhab === "Hanafi" ? Madhab.Hanafi : Madhab.Shafi;
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

export function computePrayerStreak(log: { date: string; done: Partial<Record<string, boolean>> }[]): number {
  const tracked = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const entry = log.find(l => l.date === key);
    if (tracked.every(k => entry?.done[k])) streak++;
    else if (i > 0) break;
  }
  return streak;
}
