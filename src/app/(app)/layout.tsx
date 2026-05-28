"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav    from "@/components/BottomNav";
import PageWrapper  from "@/components/PageWrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("yawmi_onboarded");
    if (!done) {
      router.replace("/onboarding");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#061A12]">
      <PageWrapper>
        <div className="flex-1 pb-20">{children}</div>
      </PageWrapper>
      <BottomNav />
    </div>
  );
}
