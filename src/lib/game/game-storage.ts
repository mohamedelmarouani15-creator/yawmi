import type { GameState, QuestionHistory, Category, PowerUpType } from "./types";
import { checkNewAchievements } from "./achievements";
import { supabase } from "@/lib/supabase";

const KEY = "yawmi_game_state_v2";

const DEFAULT_POWERUPS = { joker50: 3, bouclier: 1, double_xp: 2, time_freeze: 1 };

export const DEFAULT_STATE: GameState = {
  xp: 0,
  level: 1,
  coins: 10,
  currentLocation: "medine",
  gameStreak: 0,
  lastGameDate: null,
  unlockedLocations: ["medine"],
  defeatedSages: [],
  categoryLevels: { religion: 1, history: 1, arabic: 1, darija: 1, quran: 1 },
  questionHistory: {},
  powerupCounts: { ...DEFAULT_POWERUPS },
  achievements: [],
  chestsAvailable: 0,
  mosqueObjects: [],
  sageCards: [],
  titles: ["Voyageur"],
  activeTitle: "Voyageur",
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
};

export const gameStorage = {
  get(): GameState {
    if (typeof window === "undefined") return { ...DEFAULT_STATE };
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULT_STATE };
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_STATE };
    }
  },

  save(state: GameState): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(state));
  },

  // ── XP & Level ───────────────────────────────────────────────
  addXP(xp: number): GameState {
    const state = this.get();
    const newXP = state.xp + xp;
    const newLevel = Math.floor(newXP / 200) + 1;
    const updated = { ...state, xp: newXP, level: newLevel };
    this.save(this._checkAchievements(updated));
    return updated;
  },

  // ── Coins ────────────────────────────────────────────────────
  addCoins(coins: number): GameState {
    const state = this.get();
    const updated = { ...state, coins: state.coins + coins };
    this.save(this._checkAchievements(updated));
    return updated;
  },

  spendCoins(amount: number): boolean {
    const state = this.get();
    if (state.coins < amount) return false;
    this.save({ ...state, coins: state.coins - amount });
    return true;
  },

  // ── Power-ups ─────────────────────────────────────────────────
  addPowerUp(type: PowerUpType, amount = 1): GameState {
    const state = this.get();
    const updated = {
      ...state,
      powerupCounts: {
        ...state.powerupCounts,
        [type]: (state.powerupCounts[type] ?? 0) + amount,
      },
    };
    this.save(updated);
    return updated;
  },

  usePowerUp(type: PowerUpType): boolean {
    const state = this.get();
    const current = state.powerupCounts[type] ?? 0;
    if (current <= 0) return false;
    this.save({
      ...state,
      powerupCounts: { ...state.powerupCounts, [type]: current - 1 },
    });
    return true;
  },

  // ── Question history ─────────────────────────────────────────
  updateQuestionHistory(questionId: string, history: QuestionHistory): GameState {
    const state = this.get();
    const updated = {
      ...state,
      questionHistory: { ...state.questionHistory, [questionId]: history },
    };
    this.save(updated);
    return updated;
  },

  recordAnswer(isCorrect: boolean): GameState {
    const state = this.get();
    const updated = {
      ...state,
      totalQuestionsAnswered: state.totalQuestionsAnswered + 1,
      totalCorrectAnswers: state.totalCorrectAnswers + (isCorrect ? 1 : 0),
    };
    this.save(updated);
    return updated;
  },

  // ── Sages & locations ────────────────────────────────────────
  defeatSage(sageId: string): GameState {
    const state = this.get();
    if (state.defeatedSages.includes(sageId)) return state;
    const updated = {
      ...state,
      defeatedSages: [...state.defeatedSages, sageId],
      sageCards: [...state.sageCards, sageId],
    };
    this.save(this._checkAchievements(updated));
    return updated;
  },

  unlockLocation(locationId: string): GameState {
    const state = this.get();
    if (state.unlockedLocations.includes(locationId)) return state;
    const updated = {
      ...state,
      unlockedLocations: [...state.unlockedLocations, locationId],
    };
    this.save(this._checkAchievements(updated));
    return updated;
  },

  // ── Streak ───────────────────────────────────────────────────
  updateStreak(): GameState {
    const state = this.get();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const streak =
      state.lastGameDate === yesterday ? state.gameStreak + 1
      : state.lastGameDate === today   ? state.gameStreak
      : 1;
    const updated = { ...state, gameStreak: streak, lastGameDate: today };
    this.save(this._checkAchievements(updated));
    return updated;
  },

  // ── Category level ───────────────────────────────────────────
  updateCategoryLevel(category: Category, xpGained: number): GameState {
    const state = this.get();
    const current = state.categoryLevels[category] ?? 1;
    const newLevel = Math.min(10, Math.floor(xpGained / 50) + current);
    const updated = {
      ...state,
      categoryLevels: { ...state.categoryLevels, [category]: newLevel },
    };
    this.save(updated);
    return updated;
  },

  // ── Achievements ─────────────────────────────────────────────
  unlockAchievement(id: string): GameState {
    const state = this.get();
    if (state.achievements.includes(id)) return state;
    const updated = { ...state, achievements: [...state.achievements, id] };
    this.save(updated);
    return updated;
  },

  _checkAchievements(state: GameState): GameState {
    const newIds = checkNewAchievements(state);
    if (newIds.length === 0) return state;
    return { ...state, achievements: [...state.achievements, ...newIds] };
  },

  // ── Rewards ──────────────────────────────────────────────────
  addChest(): GameState {
    const state = this.get();
    const updated = { ...state, chestsAvailable: state.chestsAvailable + 1 };
    this.save(updated);
    return updated;
  },

  openChest(): { coins: number; powerup: PowerUpType | null; object: string | null } | null {
    const state = this.get();
    if (state.chestsAvailable <= 0) return null;

    const coins = 10 + Math.floor(Math.random() * 20);
    const powerups: PowerUpType[] = ["joker50", "bouclier", "double_xp", "time_freeze"];
    const powerup = Math.random() > 0.4
      ? powerups[Math.floor(Math.random() * powerups.length)]
      : null;

    const MOSQUE_OBJECTS = [
      "lantern_1", "carpet_1", "chandelier_1", "mihrab_1", "minaret_base",
      "fountain_1", "arch_1", "tiles_1", "calligraphy_1", "dome_1",
    ];
    const unowned = MOSQUE_OBJECTS.filter(o => !state.mosqueObjects.includes(o));
    const object = unowned.length > 0 && Math.random() > 0.5
      ? unowned[Math.floor(Math.random() * unowned.length)]
      : null;

    const updated: GameState = {
      ...state,
      chestsAvailable: state.chestsAvailable - 1,
      coins: state.coins + coins,
      mosqueObjects: object ? [...state.mosqueObjects, object] : state.mosqueObjects,
      powerupCounts: powerup
        ? { ...state.powerupCounts, [powerup]: (state.powerupCounts[powerup] ?? 0) + 1 }
        : state.powerupCounts,
    };
    this.save(updated);
    return { coins, powerup, object };
  },

  // ── Supabase sync — helpers publics (auth auto-détectée) ──────
  async sync(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await this.syncFromSupabase(user.id);
    } catch { /* offline graceful */ }
  },

  async push(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await this.pushToSupabase(user.id);
    } catch { /* offline graceful */ }
  },

  // ── Supabase sync — méthodes bas niveau (userId requis) ───────
  async syncFromSupabase(userId: string): Promise<void> {
    const { data, error } = await supabase
      .from("player_progress")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error || !data) return;

    const local = this.get();
    const merged: GameState = {
      ...local,
      xp: Math.max(local.xp, data.xp ?? 0),
      level: Math.max(local.level, data.level ?? 1),
      coins: Math.max(local.coins, data.coins ?? 0),
      currentLocation: data.current_location ?? local.currentLocation,
      gameStreak: Math.max(local.gameStreak, data.game_streak ?? 0),
      lastGameDate: data.last_game_date ?? local.lastGameDate,
      unlockedLocations: Array.from(new Set([...local.unlockedLocations, ...(data.unlocked_locations ?? [])])),
      defeatedSages: Array.from(new Set([...local.defeatedSages, ...(data.defeated_sages ?? [])])),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoryLevels: (data.category_levels ?? local.categoryLevels) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      powerupCounts: (data.powerup_counts ?? local.powerupCounts) as any,
    };
    this.save(merged);
  },

  // Débloque les 5 objets Tombouctou dans la mosquée
  unlockTombouctouRewards(): void {
    const state = this.get();
    const TOMBOUCTOU_OBJECTS = [
      "tombouctou_astrolabe",
      "tombouctou_books",
      "tombouctou_map",
      "tombouctou_lectern",
      "tombouctou_lantern",
    ];
    const merged = [...new Set([...state.mosqueObjects, ...TOMBOUCTOU_OBJECTS])];
    this.save({ ...state, mosqueObjects: merged });
  },

  async pushToSupabase(userId: string): Promise<void> {
    const state = this.get();
    await supabase.from("player_progress").upsert({
      user_id: userId,
      xp: state.xp,
      level: state.level,
      coins: state.coins,
      current_location: state.currentLocation,
      game_streak: state.gameStreak,
      last_game_date: state.lastGameDate,
      unlocked_locations: state.unlockedLocations,
      defeated_sages: state.defeatedSages,
      category_levels: state.categoryLevels,
      powerup_counts: state.powerupCounts,
      updated_at: new Date().toISOString(),
    });
  },
};

// ── Helpers ────────────────────────────────────────────────────
export function xpForNextLevel(level: number): number {
  return level * 200;
}

export function xpProgress(xp: number): number {
  const level = Math.floor(xp / 200);
  const base = level * 200;
  const next = (level + 1) * 200;
  return (xp - base) / (next - base);
}

export function xpInCurrentLevel(xp: number): number {
  const level = Math.floor(xp / 200);
  return xp - level * 200;
}
