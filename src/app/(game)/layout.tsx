"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
      .catch(() => router.replace("/onboarding"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#040608",
    }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%",
        border: "2px solid #D4AF37", borderTopColor: "transparent",
        animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return <>{children}</>;
}
