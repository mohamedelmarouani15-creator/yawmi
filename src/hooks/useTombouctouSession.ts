"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Rôle → manuscrits dont le joueur voit les indices
export const ROLE_HINTS: Record<number, number[]> = {
  1: [0, 1],           // M1 + M2 : Le Cadenas + L'Astrolabe
  2: [2, 3],           // M3 + M4 : Le Chiffre + La Carte
  3: [4],              // M5 : Le Verset
  4: [0, 1, 2, 3, 4],  // Carte maîtresse (voit tout, ne peut rien dire directement)
};

const ROLE_LABELS: Record<number, string> = {
  1: "Gardien des Savants",
  2: "Gardien des Explorateurs",
  3: "Gardien du Verbe",
  4: "Maître des Clés",
};

const PLAYER_COLORS = ["#D4AF37", "#4ade80", "#60a5fa", "#f472b6"];

export interface SessionPlayer {
  userId:      string;
  displayName: string;
  role:        number;
  color:       string;
  pos:         { x: number; y: number; z: number };
}

export interface SessionNotif {
  text: string;
  id:   number;
}

export function useTombouctouSession(userId: string | null, displayName: string) {
  const [sessionCode,   setSessionCode]  = useState<string | null>(null);
  const [players,       setPlayers]      = useState<SessionPlayer[]>([]);
  const [myRole,        setMyRole]       = useState(1);
  const [notifications, setNotifs]       = useState<SessionNotif[]>([]);
  const [remotesSolved, setRemSolved]    = useState<number[]>([]);

  const channelRef  = useRef<RealtimeChannel | null>(null);
  const lastPosSend = useRef(0);
  const notifIdRef  = useRef(0);

  const pushNotif = useCallback((text: string) => {
    const id = ++notifIdRef.current;
    setNotifs(prev => [...prev.slice(-2), { text, id }]);
    setTimeout(() => setNotifs(prev => prev.filter(n => n.id !== id)), 5000);
  }, []);

  const leaveSession = useCallback(() => {
    channelRef.current?.unsubscribe();
    channelRef.current = null;
    setSessionCode(null);
    setPlayers([]);
  }, []);

  const joinChannel = useCallback((code: string, role: number) => {
    if (!userId) return;

    const ch = supabase.channel(`tombouctou:${code}`, {
      config: { presence: { key: userId } },
    });

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<{ displayName: string; role: number }>();
      const list: SessionPlayer[] = Object.entries(state).map(([uid, arr]) => {
        const p = arr[0];
        return {
          userId:      uid,
          displayName: p.displayName ?? "Gardien",
          role:        p.role ?? 1,
          color:       PLAYER_COLORS[(p.role - 1) % 4],
          pos:         { x: 0, y: 1.7, z: 5 },
        };
      });
      setPlayers(list);
    });

    ch.on("presence", { event: "join" }, ({ newPresences }) => {
      (newPresences as Array<{ displayName?: string }>).forEach(p => {
        if (p.displayName && p.displayName !== displayName) {
          pushNotif(`${p.displayName} a rejoint la session`);
        }
      });
    });

    ch.on("broadcast", { event: "pos" }, ({ payload }) => {
      if (payload.userId === userId) return;
      setPlayers(prev => prev.map(p =>
        p.userId === payload.userId ? { ...p, pos: payload.pos } : p
      ));
    });

    ch.on("broadcast", { event: "solved" }, ({ payload }) => {
      if (payload.userId === userId) return;
      setRemSolved(prev => [...new Set([...prev, payload.manuscriptId as number])]);
      pushNotif(`📜 ${payload.displayName} a trouvé "${payload.title}" !`);
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ userId, displayName, role });
      }
    });

    channelRef.current = ch;
  }, [userId, displayName, pushNotif]);

  const createSession = useCallback(() => {
    const code = Array.from({ length: 6 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)]
    ).join("");
    setSessionCode(code);
    setMyRole(1);
    joinChannel(code, 1);
    return code;
  }, [joinChannel]);

  const joinSession = useCallback((code: string) => {
    const role = ([2, 3, 4] as const)[Math.floor(Math.random() * 3)];
    setSessionCode(code);
    setMyRole(role);
    joinChannel(code, role);
  }, [joinChannel]);

  const sendPosition = useCallback((x: number, y: number, z: number) => {
    if (!channelRef.current) return;
    const now = Date.now();
    if (now - lastPosSend.current < 200) return;
    lastPosSend.current = now;
    channelRef.current.send({
      type: "broadcast", event: "pos",
      payload: { userId, pos: { x, y, z } },
    });
  }, [userId]);

  const sendSolved = useCallback((manuscriptId: number, title: string) => {
    channelRef.current?.send({
      type: "broadcast", event: "solved",
      payload: { userId, displayName, manuscriptId, title },
    });
  }, [userId, displayName]);

  useEffect(() => () => { leaveSession(); }, [leaveSession]);

  const canSeeHint = useCallback((id: number) =>
    !sessionCode || (ROLE_HINTS[myRole]?.includes(id) ?? true),
  [sessionCode, myRole]);

  return {
    sessionCode, players, myRole,
    roleLabel: ROLE_LABELS[myRole] ?? "",
    notifications, remotesSolved,
    canSeeHint, createSession, joinSession,
    sendPosition, sendSolved, leaveSession,
    isMultiplayer: !!sessionCode,
  };
}
