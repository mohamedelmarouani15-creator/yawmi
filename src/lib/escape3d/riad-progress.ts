import { supabase } from "@/lib/supabase";
import { gameStorage } from "@/lib/game/game-storage";

export const PUZZLE_IDS = [
  "lantern_bismillah",
  "library_iqra",
  "salon_sabr",
  "cuisine_honey",
  "hammam_taharah",
] as const;

export const ROOM_DURATION_MS = 45 * 60 * 1000; // 45 minutes
export const ROOM_ID = "riad_v1";

export const REWARD = { xp: 350, coins: 120, chests: 1 };

export interface RiadProgress {
  solved:      Record<string, boolean>;
  startedAt:   number | null;
  completedAt: number | null;
  rewarded:    boolean;
}

const KEY = "escape3d_riad_progress";

export function loadProgress(): RiadProgress {
  if (typeof window === "undefined")
    return { solved: {}, startedAt: null, completedAt: null, rewarded: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { solved: {}, startedAt: null, completedAt: null, rewarded: false };
    return { solved: {}, startedAt: null, completedAt: null, rewarded: false, ...JSON.parse(raw) };
  } catch {
    return { solved: {}, startedAt: null, completedAt: null, rewarded: false };
  }
}

export function saveProgress(p: RiadProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function resetProgress(): RiadProgress {
  const fresh: RiadProgress = { solved: {}, startedAt: null, completedAt: null, rewarded: false };
  saveProgress(fresh);
  return fresh;
}

export function isComplete(p: RiadProgress): boolean {
  return PUZZLE_IDS.every(id => p.solved[id]);
}

/** Accorde XP + pièces + coffre une seule fois */
export function grantReward(p: RiadProgress): RiadProgress {
  if (p.rewarded) return p;
  gameStorage.addXP(REWARD.xp);
  gameStorage.addCoins(REWARD.coins);
  for (let i = 0; i < REWARD.chests; i++) gameStorage.addChest();
  const updated = { ...p, rewarded: true };
  saveProgress(updated);
  syncToSupabase(updated);
  return updated;
}

async function syncToSupabase(p: RiadProgress): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("escape_progress") as any).upsert({
      user_id:      user.id,
      room_id:      ROOM_ID,
      solved:       p.solved,
      started_at:   p.startedAt ? new Date(p.startedAt).toISOString() : null,
      completed_at: p.completedAt ? new Date(p.completedAt).toISOString() : null,
    }, { onConflict: "user_id,room_id" });
  } catch { /* offline graceful */ }
}

export async function loadFromSupabase(): Promise<Partial<RiadProgress> | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from("escape_progress") as any)
      .select("solved, started_at, completed_at")
      .eq("user_id", user.id)
      .eq("room_id", ROOM_ID)
      .single();
    if (!data) return null;
    return {
      solved:      data.solved ?? {},
      startedAt:   data.started_at ? new Date(data.started_at).getTime() : null,
      completedAt: data.completed_at ? new Date(data.completed_at).getTime() : null,
    };
  } catch { return null; }
}
