"use client";
import { useSettings } from "@/hooks/useSettings";
import { langFromTongue, type AppLang } from "@/lib/i18n";

export function useLang(): AppLang {
  const { settings } = useSettings();
  return langFromTongue(settings.motherTongue ?? null);
}
