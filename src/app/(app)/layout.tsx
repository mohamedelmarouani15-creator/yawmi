"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav          from "@/components/BottomNav";
import PageWrapper        from "@/components/PageWrapper";
import OfflineBanner      from "@/components/OfflineBanner";
import Parchemin          from "@/components/Parchemin";
import SplashScreen       from "@/components/SplashScreen";
import { useAgeMode }      from "@/hooks/useAgeMode";
import { usePrayerTheme }  from "@/hooks/usePrayerTheme";
import { useCompanion }    from "@/hooks/useCompanion";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";
import { computePrayerTimes, PRAYER_ORDER, PRAYER_LABELS } from "@/lib/prayer";
import { storage } from "@/lib/storage";
import { gameStorage } from "@/lib/game/game-storage";

function NotifScheduler() {
  useNotifications();

  // ── Adhan automatique ─────────────────────────────────────────
  useEffect(() => {
    const s = storage.getSettings();
    if (s.adhanMode !== "audio") return;
    const reciterId = s.adhanReciter ?? "alafasy";
    const times = computePrayerTimes(s.lat, s.lng, s.method, s.madhab);
    const now   = new Date();
    const ids: ReturnType<typeof setTimeout>[] = [];

    PRAYER_ORDER.forEach(key => {
      if (key === "sunrise") return;
      const t     = times[key];
      const delay = t.getTime() - now.getTime();
      if (delay <= 0 || delay > 14 * 3600_000) return;
      ids.push(setTimeout(() => {
        try {
          const audio = new Audio(`/audio/adhan-${reciterId}.mp3`);
          audio.volume = 0.8;
          audio.play().catch(() => {});
        } catch { /* silencieux */ }
      }, delay));
    });

    return () => ids.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function AppWithCompanion({ children }: { children: React.ReactNode }) {
  const { send, remaining } = useCompanion();
  return (
    <>
      {children}
      <Parchemin onSend={send} remaining={remaining} />
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [authReady,   setAuthReady]   = useState(false);
  const [splashDone,  setSplashDone]  = useState(false);
  useAgeMode();      // applique age-* + lang/dir sur <html> selon ageGroup/motherTongue
  usePrayerTheme();  // bascule data-theme=day|night selon Fajr/Maghrib

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          localStorage.setItem("yawmi_onboarded", "1");
          // Sync progression depuis Supabase en arrière-plan (multi-device)
          gameStorage.syncFromSupabase(data.session.user.id).catch(() => {});
          setAuthReady(true);
        } else {
          localStorage.removeItem("yawmi_onboarded");
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        localStorage.removeItem("yawmi_onboarded");
        router.replace("/onboarding");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showApp = authReady && splashDone;

  if (!showApp) return <SplashScreen onDone={() => setSplashDone(true)} />;

  return (
    <div className="flex min-h-screen flex-col pt-safe" style={{ background: "var(--background)" }}>
      <OfflineBanner />
      <NotifScheduler />
      <PageWrapper>
        <div className="flex-1 pb-20">
          <AppWithCompanion>{children}</AppWithCompanion>
        </div>
      </PageWrapper>
      <BottomNav />
    </div>
  );
}
