"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export interface LobbyPlayer {
  userId: string;
  name:   string;
  slot:   number;    // 0–3
  ready:  boolean;
}

const SLOT_COLORS = ["#D4AF37", "#22c55e", "#3b82f6", "#ef4444"] as const;
export { SLOT_COLORS };

export interface UseLobbyReturn {
  players:   LobbyPlayer[];
  mySlot:    number;
  isReady:   boolean;
  allReady:  boolean;
  countdown: number | null;  // 3-2-1-0 quand tout le monde est prêt
  setReady:  () => Promise<void>;
  leave:     () => void;
}

export function useEscapeLobby(
  code:       string,
  playerName: string,
): UseLobbyReturn {
  const [players,   setPlayers]   = useState<LobbyPlayer[]>([]);
  const [mySlot,    setMySlot]    = useState(-1);
  const [isReady,   setIsReady]   = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const channelRef    = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const countingRef   = useRef(false);
  const mySlotRef     = useRef(-1);

  // ID stable pour cette session navigateur (pas besoin d'être authentifié)
  const userId = useMemo(() => {
    if (typeof sessionStorage === "undefined") return Math.random().toString(36).slice(2, 10);
    let id = sessionStorage.getItem("esc-lobby-uid");
    if (!id) { id = Math.random().toString(36).slice(2, 10); sessionStorage.setItem("esc-lobby-uid", id); }
    return id;
  }, []);

  useEffect(() => {
    if (!code) return;

    const channel = supabase.channel(`escape-lobby-${code}`, {
      config: { presence: { key: userId } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const raw = channel.presenceState<Omit<LobbyPlayer, "userId">>();
      const list: LobbyPlayer[] = Object.entries(raw).flatMap(([uid, arr]) =>
        arr.map(d => ({ ...d, userId: uid }))
      );
      list.sort((a, b) => a.slot - b.slot);
      setPlayers(list);

      // Vérifier si tous prêts (au moins 1 joueur)
      const myData = list.find(p => p.userId === userId);
      if (myData) setIsReady(myData.ready);

      if (list.length > 0 && list.every(p => p.ready) && !countingRef.current) {
        countingRef.current = true;
        setCountdown(3);
      }
    });

    channel.subscribe(async status => {
      if (status !== "SUBSCRIBED") return;
      // Prendre le premier slot libre
      const raw = channel.presenceState<Omit<LobbyPlayer, "userId">>();
      const usedSlots = Object.values(raw).flatMap(arr => arr.map(d => d.slot));
      const slot = ([0, 1, 2, 3] as const).find(s => !usedSlots.includes(s)) ?? 0;
      setMySlot(slot);
      mySlotRef.current = slot;
      await channel.track({ name: playerName, slot, ready: false });
    });

    channelRef.current = channel;
    return () => {
      channel.untrack();
      channel.unsubscribe();
      channelRef.current = null;
      countingRef.current = false;
    };
  }, [code, userId, playerName]);

  // Décompte 3 → 2 → 1 → 0
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const setReady = useCallback(async () => {
    if (!channelRef.current || mySlotRef.current < 0) return;
    setIsReady(true);
    await channelRef.current.track({ name: playerName, slot: mySlotRef.current, ready: true });
  }, [playerName]);

  const leave = useCallback(() => {
    channelRef.current?.untrack();
    channelRef.current?.unsubscribe();
    channelRef.current = null;
    countingRef.current = false;
    setPlayers([]);
    setMySlot(-1);
    setIsReady(false);
    setCountdown(null);
  }, []);

  const allReady = players.length > 0 && players.every(p => p.ready);

  return { players, mySlot, isReady, allReady, countdown, setReady, leave };
}
