"use client";

import { useEffect } from "react";
import { storage } from "@/lib/storage";
import { gameStorage } from "@/lib/game/game-storage";

// Jalons de streak de prières → récompenses en jeu
const PRAYER_MILESTONES: { days: number; xp: number; coins: number; mosqueObject?: string; label: string }[] = [
  { days: 3,  xp: 150,  coins: 30,  label: "3 jours de prières" },
  { days: 7,  xp: 400,  coins: 80,  mosqueObject: "minaret", label: "7 jours — Minaret débloqué" },
  { days: 14, xp: 700,  coins: 140, label: "14 jours de constance" },
  { days: 30, xp: 1500, coins: 300, mosqueObject: "dôme", label: "30 jours — Dôme débloqué" },
  { days: 60, xp: 3000, coins: 500, mosqueObject: "minarets_jumeaux", label: "60 jours de dévotion" },
];

const STORAGE_KEY = "yawmi_mosque_milestones_given";

function getGivenMilestones(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function markMilestoneGiven(days: number) {
  const given = getGivenMilestones();
  if (!given.includes(days)) {
    given.push(days);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(given));
  }
}

function getPrayerStreak(): number {
  const log = storage.getPrayerLog();
  const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const day = log.find(l => l.date === key);
    const allDone = PRAYERS.every(p => day?.done?.[p]);
    if (allDone) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export function useMosqueeGameLink() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const streak = getPrayerStreak();
    if (streak === 0) return;

    const given = getGivenMilestones();

    for (const milestone of PRAYER_MILESTONES) {
      if (streak >= milestone.days && !given.includes(milestone.days)) {
        // Octroie la récompense en jeu
        const gs = gameStorage.get();
        const updatedObjects = milestone.mosqueObject
          ? [...new Set([...gs.mosqueObjects, milestone.mosqueObject])]
          : gs.mosqueObjects;

        gameStorage.save({
          ...gs,
          xp:           gs.xp + milestone.xp,
          coins:         gs.coins + milestone.coins,
          mosqueObjects: updatedObjects,
        });

        markMilestoneGiven(milestone.days);

        // Toast natif (non bloquant)
        if (typeof window !== "undefined") {
          // On stocke la dernière récompense pour l'afficher sur l'accueil
          localStorage.setItem("yawmi_mosque_reward_pending", JSON.stringify({
            label:  milestone.label,
            xp:     milestone.xp,
            coins:  milestone.coins,
            object: milestone.mosqueObject ?? null,
          }));
        }

        break; // Un seul jalon par session
      }
    }
  }, []);
}
