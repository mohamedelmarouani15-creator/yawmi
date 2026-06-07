"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { ParcheminMessage } from "@/components/Parchemin";
import type { RecitationContext } from "@/lib/recitation-context-bus";

interface UseCompanionReturn {
  send:      (message: string, recitationContext?: RecitationContext | null) => Promise<string>;
  messages:  ParcheminMessage[];
  remaining: number;
  error:     string | null;
}

export function useCompanion(): UseCompanionReturn {
  const [messages,  setMessages]  = useState<ParcheminMessage[]>([]);
  const [remaining, setRemaining] = useState(20);
  const [error,     setError]     = useState<string | null>(null);

  // Charge l'historique depuis Supabase au montage
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase
        .from("companion_messages")
        .select("role, content")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true })
        .limit(20)
        .then(({ data }) => {
          if (data?.length) {
            setMessages(data.map(r => ({ role: r.role as "user" | "assistant", content: r.content })));
          }
        });
    });
  }, []);

  const send = useCallback(async (message: string, recitationContext?: RecitationContext | null): Promise<string> => {
    setError(null);

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

    // Optimistic : affiche le message utilisateur immédiatement
    setMessages(prev => [...prev, { role: "user", content: message }]);

    const res = await fetch("/api/companion/chat", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        ...(recitationContext ? { recitationContext } : {}),
      }),
    });

    if (res.status === 429) {
      const data = await res.json();
      const msg  = data.message ?? "Limite quotidienne atteinte. Reviens demain !";
      setError(msg);
      setMessages(prev => [...prev, { role: "assistant", content: msg }]);
      return msg;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const fallback = errData.message ?? "Je rencontre une difficulté. Réessaie dans un instant.";
      setError(fallback);
      setMessages(prev => [...prev, { role: "assistant", content: fallback }]);
      return fallback;
    }

    const data = await res.json();
    if (typeof data.remaining === "number") setRemaining(data.remaining);
    const reply = data.message ?? "…";
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    return reply;
  }, []);

  return { send, messages, remaining, error };
}
