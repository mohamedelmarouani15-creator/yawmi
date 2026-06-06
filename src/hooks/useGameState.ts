"use client";

import { useState, useEffect, useCallback } from "react";
import { gameStorage, xpProgress } from "@/lib/game/game-storage";
import { isUnlocked } from "@/lib/game/locations";
import type { GameState } from "@/lib/game/types";

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    setState(gameStorage.get());
    gameStorage.sync().then(() => setState(gameStorage.get()));

    // Écoute les mises à jour cross-composant (ex: syncFromSupabase dans layout)
    function onStorage(e: StorageEvent) {
      if (e.key === "yawmi_game_state_v2") setState(gameStorage.get());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refresh = useCallback(() => {
    setState(gameStorage.get());
  }, []);

  const addReward = useCallback((xp: number, coins: number) => {
    gameStorage.addXP(xp);
    gameStorage.addCoins(coins);
    gameStorage.updateStreak();
    setState(gameStorage.get());
    gameStorage.push(); // sync vers Supabase après chaque récompense
  }, []);

  const defeatSage = useCallback((sageId: string) => {
    gameStorage.defeatSage(sageId);
    setState(gameStorage.get());
  }, []);

  const unlockLocation = useCallback((locationId: string) => {
    gameStorage.unlockLocation(locationId);
    setState(gameStorage.get());
  }, []);

  const locationUnlocked = useCallback((locationId: string) => {
    if (!state) return locationId === "medine";
    return isUnlocked(locationId, state.xp, state.unlockedLocations, state);
  }, [state]);

  const progress = state ? xpProgress(state.xp) : 0;

  return {
    state,
    refresh,
    addReward,
    defeatSage,
    unlockLocation,
    locationUnlocked,
    progress,
  };
}
