export interface IslamicEvent {
  name:    string;
  nameAr:  string;
  month:   number; // Hijri month 1-12
  day:     number; // Hijri day
  desc:    string;
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { name: "Nouvel An Islamique",  nameAr: "رأس السنة الهجرية",  month: 1,  day: 1,  desc: "Premier jour du mois de Mouharram" },
  { name: "Achoura",              nameAr: "يوم عاشوراء",         month: 1,  day: 10, desc: "Jour du jeûne recommandé" },
  { name: "Mawlid an-Nabawi",    nameAr: "المولد النبوي الشريف", month: 3,  day: 12, desc: "Naissance du Prophète Muhammad ﷺ" },
  { name: "Isra et Miraj",        nameAr: "الإسراء والمعراج",    month: 7,  day: 27, desc: "Voyage nocturne et ascension céleste" },
  { name: "Mi-Chaabane",          nameAr: "نصف شعبان",           month: 8,  day: 15, desc: "Nuit du 15 Cha'bane" },
  { name: "Ramadan",              nameAr: "شهر رمضان المبارك",   month: 9,  day: 1,  desc: "Début du mois sacré du jeûne" },
  { name: "Laylat al-Qadr",      nameAr: "ليلة القدر",          month: 9,  day: 27, desc: "La Nuit du Destin (approximatif)" },
  { name: "Aïd al-Fitr",         nameAr: "عيد الفطر المبارك",   month: 10, day: 1,  desc: "Fête de la rupture du jeûne" },
  { name: "Jour d'Arafah",        nameAr: "يوم عرفة",            month: 12, day: 9,  desc: "Jour du pèlerinage, jeûne très recommandé" },
  { name: "Aïd al-Adha",         nameAr: "عيد الأضحى المبارك",  month: 12, day: 10, desc: "Fête du sacrifice" },
];

function hijriToGregorian(hYear: number, hMonth: number, hDay: number): Date {
  try {
    // Reverse lookup: find the Gregorian date that corresponds to this Hijri date
    // by formatting a test date and comparing
    const baseDate = new Date();
    const currentHijri = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      year: "numeric", month: "numeric", day: "numeric",
    }).formatToParts(baseDate);

    const cYear  = parseInt(currentHijri.find(p => p.type === "year")?.value  ?? "1446");
    const cMonth = parseInt(currentHijri.find(p => p.type === "month")?.value ?? "1");
    const cDay   = parseInt(currentHijri.find(p => p.type === "day")?.value   ?? "1");

    // Approx ms per Hijri day
    const hijriDayMs = 29.5 * 24 * 3600 * 1000;

    // Delta in Hijri days from today
    const deltaMonths = (hYear - cYear) * 12 + (hMonth - cMonth);
    const deltaDays   = deltaMonths * 29.5 + (hDay - cDay);

    return new Date(baseDate.getTime() + deltaDays * hijriDayMs);
  } catch {
    return new Date();
  }
}

export interface UpcomingEvent extends IslamicEvent {
  gregorianDate: Date;
  daysUntil:     number;
}

export function getUpcomingEvents(limit = 5): UpcomingEvent[] {
  const now = new Date();

  // Get current Hijri year
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    year: "numeric",
  }).formatToParts(now);
  const currentHijriYear = parseInt(parts.find(p => p.type === "year")?.value ?? "1446");

  const events: UpcomingEvent[] = [];

  for (const ev of ISLAMIC_EVENTS) {
    // Try this year and next year
    for (const offset of [0, 1]) {
      const gDate = hijriToGregorian(currentHijriYear + offset, ev.month, ev.day);
      const daysUntil = Math.round((gDate.getTime() - now.getTime()) / (24 * 3600 * 1000));
      if (daysUntil >= -1) {
        events.push({ ...ev, gregorianDate: gDate, daysUntil });
        break;
      }
    }
  }

  return events
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, limit);
}

export function formatGregorian(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}
