"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav          from "@/components/BottomNav";
import PageWrapper        from "@/components/PageWrapper";
import OfflineBanner      from "@/components/OfflineBanner";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";

function NotifScheduler() {
  useNotifications();
  return null;
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
        <div className="flex-1 pb-20">{children}</div>
      </PageWrapper>
      <BottomNav />
    </div>
  );
}
