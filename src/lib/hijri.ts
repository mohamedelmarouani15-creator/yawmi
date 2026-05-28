const MONTHS_AR = [
  "محرم","صفر","ربيع الأول","ربيع الثاني",
  "جمادى الأولى","جمادى الثانية","رجب","شعبان",
  "رمضان","شوال","ذو القعدة","ذو الحجة",
];
const MONTHS_FR = [
  "Mouharram","Safar","Rabi' al-Awwal","Rabi' ath-Thani",
  "Joumada al-Oula","Joumada ath-Thania","Rajab","Cha'bane",
  "Ramadan","Chawwal","Dhou al-Qi'da","Dhou al-Hijja",
];
const DAYS_AR = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

export interface HijriDate {
  day:     number;
  month:   number;   // 1-12
  year:    number;
  monthAr: string;
  monthFr: string;
  dayAr:   string;
  isRamadan: boolean;
  isJumua:   boolean;
}

export function getHijriDate(date = new Date()): HijriDate {
  // Use Intl API (supported on all modern browsers / iOS 13+)
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day:   "numeric",
    month: "numeric",
    year:  "numeric",
    weekday: "short",
  }).formatToParts(date);

  const get = (t: string) => parts.find(p => p.type === t)?.value ?? "0";
  const day   = parseInt(get("day"));
  const month = parseInt(get("month"));
  const year  = parseInt(get("year"));

  return {
    day,
    month,
    year,
    monthAr:   MONTHS_AR[month - 1] ?? "",
    monthFr:   MONTHS_FR[month - 1] ?? "",
    dayAr:     DAYS_AR[date.getDay()],
    isRamadan: month === 9,
    isJumua:   date.getDay() === 5,
  };
}

export function formatHijri(h: HijriDate) {
  return `${h.day} ${h.monthAr} ${h.year} هـ`;
}
