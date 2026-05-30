"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ContextualMessage {
  text:         string;
  alreadyShown: boolean;
}

export function useContextualMessage(): {
  message: ContextualMessage | null;
  dismiss: () => void;
} {
  const [message, setMessage] = useState<ContextualMessage | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token || cancelled) return;

      // Vérifie si déjà dismissed localement aujourd'hui
      const today    = new Date().toISOString().split("T")[0];
      const localKey = `yawmi_ctx_msg_dismissed_${today}`;
      if (localStorage.getItem(localKey)) return;

      try {
        const res = await window.fetch("/api/companion/context", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.message && !cancelled) {
          setMessage({ text: data.message, alreadyShown: !!data.already_shown });
        }
      } catch { /* no-op */ }
    }

    // Délai de 3s pour ne pas bloquer le chargement
    const t = setTimeout(fetch, 3000);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const dismiss = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`yawmi_ctx_msg_dismissed_${today}`, "1");
    setMessage(null);

    // Marque comme shown dans Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return;
      supabase.from("companion_daily_message")
        .update({ shown: true })
        .eq("message_date", today)
        .then(() => {});
    });
  };

  return { message, dismiss };
}
