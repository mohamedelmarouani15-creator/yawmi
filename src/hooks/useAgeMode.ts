"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

export type AgeMode = "kids" | "teen" | "adult" | "parent" | "elder" | null;

export function ageGroupToMode(group: string | null | undefined): AgeMode {
  switch (group) {
    case "4-10":  return "kids";
    case "11-17": return "teen";
    case "18-35": return "adult";
    case "36-55": return "parent";
    case "55+":   return "elder";
    default:      return null;
  }
}

const TONGUE_TO_LANG: Record<string, string> = {
  arabe: "ar", darija: "ar", anglais: "en", espagnol: "es", turc: "tr",
};

export function useAgeMode(): AgeMode {
  const { settings } = useSettings();
  const mode = ageGroupToMode(settings.ageGroup);
  const isRTL = settings.motherTongue === "arabe" || settings.motherTongue === "darija";
  const htmlLang = TONGUE_TO_LANG[settings.motherTongue ?? ""] ?? "fr";

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("age-kids", "age-teen", "age-adult", "age-parent", "age-elder");
    if (mode) root.classList.add(`age-${mode}`);

    root.lang = htmlLang;
    root.dir  = isRTL ? "rtl" : "ltr";

    document.cookie = `yawmi_lang=${htmlLang}; path=/; max-age=31536000; SameSite=Lax`;
  }, [mode, isRTL, htmlLang]);

  return mode;
}
