"use client";

import { useSettings } from "@/hooks/useSettings";
import { t, langFromTongue } from "@/lib/i18n";

export function useT() {
  const { settings } = useSettings();
  const lang = langFromTongue(settings.motherTongue ?? null);
  return (key: string) => t(lang, key);
}
