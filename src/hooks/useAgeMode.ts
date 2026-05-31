"use client";

import { useEffect } from "react";
import { storage } from "@/lib/storage";

export type AgeMode = "kids" | "teen" | "adult" | "parent" | "elder" | null;

function ageGroupToMode(group: string | null | undefined): AgeMode {
  switch (group) {
    case "4-10":  return "kids";
    case "11-17": return "teen";
    case "18-35": return "adult";
    case "36-55": return "parent";
    case "55+":   return "elder";
    default:      return null;
  }
}

export function useAgeMode(): AgeMode {
  const settings = storage.getSettings();
  const mode = ageGroupToMode(settings.ageGroup);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    // Retire tous les modes précédents
    root.classList.remove("age-kids", "age-teen", "age-adult", "age-parent", "age-elder");
    if (mode) root.classList.add(`age-${mode}`);
  }, [mode]);

  return mode;
}
