/**
 * Seasonal Islamic events — approximate Gregorian dates for 2025-2027.
 * Updates needed yearly as the Hijri calendar shifts ~11 days/year.
 */

export interface SeasonalEvent {
  id: string;
  name: string;
  nameAr: string;
  emoji: string;
  color: string;
  description: string;
  // Gameplay bonuses
  xpMultiplier:    number;   // applied to all XP gains
  energyCapBonus:  number;   // added to ENERGY_MAX during event
  freeEnergyNight: boolean;  // infinite energy 20:00-03:00 local time
  coinBonus:       number;   // flat bonus coins per correct answer
  // Date ranges (Gregorian, inclusive)
  ranges: Array<{ start: string; end: string }>; // "YYYY-MM-DD"
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: "ramadan",
    name: "Ramadan",
    nameAr: "رمضان",
    emoji: "🌙",
    color: "#a78bfa",
    description: "Le mois béni. XP ×2, énergie illimitée la nuit, bonus pièces.",
    xpMultiplier:    2,
    energyCapBonus:  30,
    freeEnergyNight: true,
    coinBonus:       1,
    ranges: [
      { start: "2025-03-01", end: "2025-03-29" },
      { start: "2026-02-18", end: "2026-03-19" },
      { start: "2027-02-07", end: "2027-03-08" },
    ],
  },
  {
    id: "eid_fitr",
    name: "Aïd al-Fitr",
    nameAr: "عيد الفطر",
    emoji: "🎉",
    color: "#34d399",
    description: "Fête de la rupture du jeûne. Énergie complète offerte !",
    xpMultiplier:    1.5,
    energyCapBonus:  30,
    freeEnergyNight: false,
    coinBonus:       3,
    ranges: [
      { start: "2025-03-30", end: "2025-04-02" },
      { start: "2026-03-20", end: "2026-03-23" },
    ],
  },
  {
    id: "eid_adha",
    name: "Aïd al-Adha",
    nameAr: "عيد الأضحى",
    emoji: "🐏",
    color: "#D4AF37",
    description: "Fête du sacrifice. Questions sur Ibrahim ﷺ × bonus XP.",
    xpMultiplier:    1.5,
    energyCapBonus:  0,
    freeEnergyNight: false,
    coinBonus:       2,
    ranges: [
      { start: "2025-06-06", end: "2025-06-10" },
      { start: "2026-05-26", end: "2026-05-30" },
    ],
  },
  {
    id: "isra_miraj",
    name: "Isra' wal Mi'raj",
    nameAr: "الإسراء والمعراج",
    emoji: "✨",
    color: "#60a5fa",
    description: "Nuit du voyage nocturne. Questions sur Jérusalem et les cieux.",
    xpMultiplier:    1.5,
    energyCapBonus:  10,
    freeEnergyNight: true,
    coinBonus:       1,
    ranges: [
      { start: "2025-01-27", end: "2025-01-27" },
      { start: "2026-01-16", end: "2026-01-16" },
      { start: "2027-01-06", end: "2027-01-06" },
    ],
  },
  {
    id: "ashura",
    name: "Achoura",
    nameAr: "عاشوراء",
    emoji: "📿",
    color: "#f97316",
    description: "Jour du jeûne de Moussa ﷺ. Questions sur les prophètes d'Israël.",
    xpMultiplier:    1.5,
    energyCapBonus:  0,
    freeEnergyNight: false,
    coinBonus:       1,
    ranges: [
      { start: "2025-07-05", end: "2025-07-06" },
      { start: "2026-06-24", end: "2026-06-25" },
    ],
  },
  {
    id: "mawlid",
    name: "Mawlid an-Nabi",
    nameAr: "المولد النبوي",
    emoji: "🌺",
    color: "#f59e0b",
    description: "Anniversaire du Prophète ﷺ. XP ×2 sur les questions de Sira.",
    xpMultiplier:    2,
    energyCapBonus:  10,
    freeEnergyNight: false,
    coinBonus:       2,
    ranges: [
      { start: "2025-09-04", end: "2025-09-04" },
      { start: "2026-08-24", end: "2026-08-24" },
    ],
  },
];

/** Returns all currently active events. */
export function getActiveEvents(): SeasonalEvent[] {
  const today = new Date().toISOString().split("T")[0];
  return SEASONAL_EVENTS.filter(ev =>
    ev.ranges.some(r => r.start <= today && today <= r.end),
  );
}

/** Aggregated bonuses from all active events. */
export function getEventBonuses(): {
  xpMultiplier: number;
  energyCapBonus: number;
  freeEnergyNight: boolean;
  coinBonus: number;
  activeEvents: SeasonalEvent[];
} {
  const active = getActiveEvents();
  if (active.length === 0) {
    return { xpMultiplier: 1, energyCapBonus: 0, freeEnergyNight: false, coinBonus: 0, activeEvents: [] };
  }
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 4;
  return {
    xpMultiplier:    Math.max(...active.map(e => e.xpMultiplier)),
    energyCapBonus:  active.reduce((s, e) => s + e.energyCapBonus, 0),
    freeEnergyNight: isNight && active.some(e => e.freeEnergyNight),
    coinBonus:       active.reduce((s, e) => s + e.coinBonus, 0),
    activeEvents:    active,
  };
}
