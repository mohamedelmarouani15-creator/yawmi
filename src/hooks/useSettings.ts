"use client";

import { useState, useEffect, useCallback } from "react";
import { storage, DEFAULT_SETTINGS, type YawmiSettings } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { CalcMethodKey, MadhabKey } from "@/lib/prayer";

export function useSettings() {
  const [settings, setSettings] = useState<YawmiSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Lecture localStorage immédiate
    const local = storage.getSettings();
    setSettings(local);

    // Lecture Supabase en arrière-plan — écrase localStorage si données présentes
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      supabase
        .from("profiles")
        .select("city, lat, lng, prayer_method, madhab, age_group, arabic_level, app_mode, mother_tongue, main_objective")
        .eq("id", data.session.user.id)
        .single()
        .then(({ data: profile }) => {
          if (!profile) return;
          const merged: YawmiSettings = {
            ...local,
            cityName:      profile.city          ?? local.cityName,
            lat:           profile.lat           ?? local.lat,
            lng:           profile.lng           ?? local.lng,
            method:        (profile.prayer_method as CalcMethodKey) ?? local.method,
            madhab:        (profile.madhab        as MadhabKey)     ?? local.madhab,
            ageGroup:      profile.age_group      ?? local.ageGroup,
            arabicLevel:   (profile.arabic_level  as YawmiSettings["arabicLevel"])   ?? local.arabicLevel,
            appMode:       (profile.app_mode       as YawmiSettings["appMode"])       ?? local.appMode,
            motherTongue:  (profile.mother_tongue  as YawmiSettings["motherTongue"])  ?? local.motherTongue,
            mainObjective: (profile.main_objective as YawmiSettings["mainObjective"]) ?? local.mainObjective,
          };
          storage.saveSettings(merged);
          setSettings(merged);
        });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback((next: YawmiSettings) => {
    // Écriture localStorage immédiate — pas d'attente
    storage.saveSettings(next);
    setSettings(next);

    // Sync Supabase en fire-and-forget
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      supabase.from("profiles").upsert({
        id:             data.session.user.id,
        city:           next.cityName,
        lat:            next.lat,
        lng:            next.lng,
        prayer_method:  next.method,
        madhab:         next.madhab,
        age_group:      next.ageGroup      ?? null,
        arabic_level:   next.arabicLevel,
        app_mode:       next.appMode,
        mother_tongue:  next.motherTongue  ?? null,
        main_objective: next.mainObjective ?? null,
      }, { onConflict: "id" });
    });
  }, []);

  return { settings, save };
}
