"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ParcheminMessage } from "@/components/Parchemin";

interface UseCompanionReturn {
  send:      (message: string) => Promise<string>;
  messages:  ParcheminMessage[];
  remaining: number;
  error:     string | null;
}

export function useCompanion(): UseCompanionReturn {
  const [messages,  setMessages]  = useState<ParcheminMessage[]>([]);
  const [remaining, setRemaining] = useState(20);
  const [error,     setError]     = useState<string | null>(null);

  const send = useCallback(async (message: string): Promise<string> => {
    setError(null);

    // Récupère le token de session Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      const fallback = "Connecte-toi pour pouvoir me parler.";
      setMessages(prev => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: fallback },
      ]);
      return fallback;
    }

    const res = await fetch("/api/companion/chat", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    if (res.status === 429) {
      const data = await res.json();
      const msg  = data.message ?? "Limite quotidienne atteinte. Reviens demain !";
      setError(msg);
      return msg;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const fallback = errData.message ?? "Je rencontre une difficulté. Réessaie dans un instant.";
      setError(fallback);
      return fallback;
    }

    const data = await res.json();
    if (typeof data.remaining === "number") setRemaining(data.remaining);
    return data.message ?? "…";
  }, []);

  return { send, messages, remaining, error };
}
