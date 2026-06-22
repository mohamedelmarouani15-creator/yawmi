"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { storage, DEFAULT_SETTINGS, type YawmiSettings } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { CalcMethodKey, MadhabKey } from "@/lib/prayer";

export function useSettings() {
  const [settings, setSettings] = useState<YawmiSettings>(DEFAULT_SETTINGS);
  const mountedRef  = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    // Lecture localStorage immédiate — objet recréé à chaque lecture,
    // pas de référence stable utilisable avec useSyncExternalStore.
    const local = storage.getSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(local);

    // Lecture Supabase en arrière-plan — écrase localStorage si données présentes
    supabase.auth.getSession().then(({ data }) => {
      if (!mountedRef.current || !data.session) return;
      supabase
        .from("profiles")
        .select("city, lat, lng, prayer_method, madhab, age_group, arabic_level, app_mode, mother_tongue, main_objective")
        .eq("id", data.session.user.id)
        .single()
        .then(({ data: profile }) => {
          if (!mountedRef.current || !profile) return;
          const merged: YawmiSettings = {
            ...local,
            cityName:      profile.city          ?? local.cityName,
            lat:           profile.lat           ?? local.lat,
            lng:           profile.lng           ?? local.lng,
            method:        (profile.prayer_method as CalcMethodKey) ?? local.method,
            madhab:        (profile.madhab        as MadhabKey)     ?? local.madhab,
            ageGroup:      (profile.age_group as YawmiSettings["ageGroup"]) ?? local.ageGroup,
            arabicLevel:   (profile.arabic_level  as YawmiSettings["arabicLevel"])   ?? local.arabicLevel,
            appMode:       (profile.app_mode       as YawmiSettings["appMode"])       ?? local.appMode,
            motherTongue:  (profile.mother_tongue  as YawmiSettings["motherTongue"])  ?? local.motherTongue,
            mainObjective: (profile.main_objective as YawmiSettings["mainObjective"]) ?? local.mainObjective,
          };
          storage.saveSettings(merged);
          setSettings(merged);
        });
    });

    return () => { mountedRef.current = false; };
  }, []);

  const save = useCallback((next: YawmiSettings) => {
    // Écriture localStorage immédiate
    storage.saveSettings(next);
    setSettings(next);

    // Sync Supabase debouncée — évite les rafales lors de changements rapides
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
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
    }, 500);
  }, []);

  return { settings, save };
}
