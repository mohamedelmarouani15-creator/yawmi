"use client";

import { useState, useEffect, useCallback } from "react";
import { storage, DEFAULT_SETTINGS, type YawmiSettings } from "@/lib/storage";

export function useSettings() {
  const [settings, setSettings] = useState<YawmiSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  const save = useCallback((next: YawmiSettings) => {
    storage.saveSettings(next);
    setSettings(next);
  }, []);

  return { settings, save };
}
