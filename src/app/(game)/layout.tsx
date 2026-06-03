"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          setReady(true);
        } else {
          router.replace("/connexion");
        }
      })
      .catch(() => router.replace("/connexion"));
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
