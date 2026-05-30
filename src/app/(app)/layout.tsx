"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav          from "@/components/BottomNav";
import PageWrapper        from "@/components/PageWrapper";
import OfflineBanner      from "@/components/OfflineBanner";
import Parchemin          from "@/components/Parchemin";
import { useCompanion }   from "@/hooks/useCompanion";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";
import { computePrayerTimes, PRAYER_ORDER, PRAYER_LABELS } from "@/lib/prayer";
import { storage } from "@/lib/storage";

function NotifScheduler() {
  useNotifications();

  // ── Adhan automatique ─────────────────────────────────────────
  useEffect(() => {
    const s = storage.getSettings();
    if (s.adhanMode !== "audio") return;
    const reciterId = s.adhanReciter ?? "alafasy";
    const times = computePrayerTimes(s.lat, s.lng, s.method);
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
  const { send } = useCompanion();
  return (
    <>
      {children}
      <Parchemin onSend={send} />
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("yawmi_onboarded");
    if (done) { setReady(true); return; }

    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          localStorage.setItem("yawmi_onboarded", "1");
          setReady(true);
        } else {
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        // En cas d'erreur réseau, redirige vers onboarding
        router.replace("/onboarding");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return (
    <div className="flex min-h-screen items-center justify-center bg-[#061A12]">
      <div className="flex flex-col items-center gap-3">
        <p className="text-3xl font-bold" style={{ color: "#F8F4EC", fontFamily: "var(--font-bricolage)" }}>Yawmi</p>
        <p className="text-lg" style={{ color: "#D4AF37", fontFamily: "var(--font-amiri)" }}>يومي</p>
        <div className="mt-2 flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#D4AF37", animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#061A12]">
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
