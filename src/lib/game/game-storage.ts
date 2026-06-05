import type { GameState, QuestionHistory, Category, PowerUpType, DailyQuest, DailyQuestType, WeeklyChallenge, WeeklyChallengeType } from "./types";
import { checkNewAchievements } from "./achievements";
import { supabase } from "@/lib/supabase";
import { MANUSCRIPTS, CORRECT_PER_PAGE } from "./stages";

const KEY = "yawmi_game_state_v2";

const DEFAULT_POWERUPS = { joker50: 3, bouclier: 1, double_xp: 2, time_freeze: 1 };

export const ENERGY_MAX    = 30;
export const ENERGY_COST   = 10;  // per quiz
const ENERGY_REGEN_MS      = 30 * 60 * 1000; // +1 energy per 30 min

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
  energy: ENERGY_MAX,
  lastEnergyUpdate: null,
  locationStages: {},
  categoryMastery: { religion: 0, history: 0, arabic: 0, darija: 0, quran: 0 },
  categoryXP: {},
  manuscripts: {},
  completedArcs: [],
  dailyQuests: [],
  lastQuestDate: null,
  weeklyChallenge: null,
  prestigeLevel: 0,
};

// ── Weekly challenge pool ──────────────────────────────────────

const WEEKLY_POOL: Omit<WeeklyChallenge, "progress" | "completed" | "weekStartDate">[] = [
  { id: "wk1", type: "stages_complete",    title: "Conquérant",          description: "Terminer 3 stages (n'importe quel lieu)",    target: 3,   rewardXP: 200, rewardCoins: 80,  rewardEnergy: 10 },
  { id: "wk2", type: "perfect_quizzes",    title: "Sans fautes",          description: "Réussir 2 quizzes avec 10/10",               target: 2,   rewardXP: 250, rewardCoins: 100, rewardEnergy: 10 },
  { id: "wk3", type: "total_correct",      title: "Encyclopédiste",       description: "100 réponses correctes cette semaine",        target: 100, rewardXP: 300, rewardCoins: 120, rewardEnergy: 20 },
  { id: "wk4", type: "calligraphy_correct","title": "Calligraphe",        description: "Réussir 10 exercices de calligraphie",        target: 10,  rewardXP: 200, rewardCoins: 80,  rewardEnergy: 10 },
  { id: "wk5", type: "total_correct",      title: "Maître du savoir",     description: "150 réponses correctes cette semaine",        target: 150, rewardXP: 400, rewardCoins: 150, rewardEnergy: 30 },
  { id: "wk6", type: "arcs_read",          title: "Conteur",              description: "Terminer un arc narratif complet",            target: 1,   rewardXP: 300, rewardCoins: 120, rewardEnergy: 20 },
  { id: "wk7", type: "timeline_correct",   title: "Chronologiste",        description: "Réussir 5 quiz de chronologie",               target: 5,   rewardXP: 200, rewardCoins: 80,  rewardEnergy: 10 },
  { id: "wk8", type: "stages_complete",    title: "Grand Voyageur",       description: "Maîtriser (★★★) 2 lieux différents",          target: 2,   rewardXP: 500, rewardCoins: 200, rewardEnergy: 30 },
];

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getTime() + diff * 86400000);
  return monday.toISOString().split("T")[0];
}

function generateWeeklyChallenge(): WeeklyChallenge {
  const weekStart = getWeekStart();
  // Deterministic pick based on week number to avoid different challenges per device
  const weekNum = Math.floor(new Date().getTime() / (7 * 86400000));
  const picked  = WEEKLY_POOL[weekNum % WEEKLY_POOL.length];
  return { ...picked, progress: 0, completed: false, weekStartDate: weekStart };
}

// ── Daily quest pool ───────────────────────────────────────────

const QUEST_POOL: Omit<DailyQuest, "progress" | "completed">[] = [
  { id: "q1", type: "quiz_win",        title: "Victoire ×1",         description: "Gagne 1 quiz aujourd'hui",          target: 1, rewardXP: 40,  rewardCoins: 15 },
  { id: "q2", type: "quiz_win",        title: "Triple victoire",      description: "Gagne 3 quizzes aujourd'hui",       target: 3, rewardXP: 100, rewardCoins: 40 },
  { id: "q3", type: "correct_answers", title: "25 bonnes réponses",   description: "Réponds correctement 25 fois",      target: 25, rewardXP: 60, rewardCoins: 20 },
  { id: "q4", type: "correct_answers", title: "50 bonnes réponses",   description: "Réponds correctement 50 fois",      target: 50, rewardXP: 120, rewardCoins: 40, rewardEnergy: 10 },
  { id: "q5", type: "story_chapter",   title: "Lire l'histoire",      description: "Lis un chapitre d'une histoire",    target: 1, rewardXP: 50,  rewardCoins: 20 },
  { id: "q6", type: "calligraphy",     title: "Calligraphe du jour",  description: "Complète 2 exercices de calligraphie", target: 2, rewardXP: 50, rewardCoins: 15 },
  { id: "q7", type: "timeline_correct","title": "Historien",          description: "Réussis 2 quizzes chronologie",    target: 2, rewardXP: 60,  rewardCoins: 20 },
  { id: "q8", type: "correct_answers", title: "Série de 10",          description: "10 bonnes réponses consécutives",   target: 10, rewardXP: 80,  rewardCoins: 30, rewardEnergy: 10 },
];

function generateDailyQuests(): DailyQuest[] {
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false }));
}

/** Compute actual current energy from stored value + elapsed time. */
export function computeCurrentEnergy(stored: number, lastUpdate: string | null): number {
  if (!lastUpdate) return stored;
  const elapsedMs   = Date.now() - new Date(lastUpdate).getTime();
  const regenerated = Math.floor(elapsedMs / ENERGY_REGEN_MS);
  return Math.min(ENERGY_MAX, stored + regenerated);
}

/** How many ms until 10 energy is available. Returns 0 if already enough. */
export function msUntilEnergy(stored: number, lastUpdate: string | null, needed = ENERGY_COST): number {
  const current = computeCurrentEnergy(stored, lastUpdate);
  if (current >= needed) return 0;
  const deficit = needed - current;
  const elapsedMs = lastUpdate ? Date.now() - new Date(lastUpdate).getTime() : 0;
  const usedMs = elapsedMs % ENERGY_REGEN_MS;
  return deficit * ENERGY_REGEN_MS - usedMs;
}

export const gameStorage = {
  get(): GameState {
    if (typeof window === "undefined") return { ...DEFAULT_STATE };
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULT_STATE };
      const saved = JSON.parse(raw) as Partial<GameState>;
      const base  = { ...DEFAULT_STATE, ...saved };
      // Recompute energy based on elapsed time
      const currentEnergy = computeCurrentEnergy(base.energy ?? ENERGY_MAX, base.lastEnergyUpdate);
      if (currentEnergy !== (base.energy ?? ENERGY_MAX)) {
        base.energy = currentEnergy;
        base.lastEnergyUpdate = new Date().toISOString();
        localStorage.setItem(KEY, JSON.stringify(base));
      }
      return base;
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

  // ── Energy ───────────────────────────────────────────────────
  addEnergy(amount: number): GameState {
    const state   = this.get();
    const current = computeCurrentEnergy(state.energy, state.lastEnergyUpdate);
    const updated = { ...state, energy: Math.min(ENERGY_MAX, current + amount), lastEnergyUpdate: new Date().toISOString() };
    this.save(updated);
    return updated;
  },

  spendEnergy(amount = ENERGY_COST): boolean {
    const state   = this.get();
    const current = computeCurrentEnergy(state.energy, state.lastEnergyUpdate);
    if (current < amount) return false;
    const updated = { ...state, energy: current - amount, lastEnergyUpdate: new Date().toISOString() };
    this.save(updated);
    return true;
  },

  // ── Category mastery ─────────────────────────────────────────
  updateCategoryMastery(results: Partial<Record<Category, { correct: number; total: number }>>): GameState {
    const state = this.get();
    const mastery = { ...state.categoryMastery } as Record<Category, number>;
    (Object.entries(results) as [Category, { correct: number; total: number }][]).forEach(([cat, { correct, total }]) => {
      if (total === 0) return;
      const accuracy  = correct / total;          // 0–1
      const delta     = (accuracy - 0.5) * 20;    // ±10 per quiz, centered at 50% accuracy
      mastery[cat]    = Math.max(0, Math.min(100, (mastery[cat] ?? 0) + delta));
    });
    const updated = { ...state, categoryMastery: mastery };
    this.save(updated);
    return updated;
  },

  // ── Manuscripts ───────────────────────────────────────────────
  addManuscriptPages(categoryId: Category, correctCount: number): GameState {
    const state     = this.get();
    const manuscripts = { ...state.manuscripts };
    const pagesEarned = Math.floor(correctCount / CORRECT_PER_PAGE);
    if (pagesEarned === 0) { this.save(state); return state; }
    MANUSCRIPTS.filter(m => m.category === categoryId).forEach(m => {
      const current = manuscripts[m.id] ?? 0;
      manuscripts[m.id] = Math.min(m.pages, current + pagesEarned);
    });
    const updated = { ...state, manuscripts };
    this.save(updated);
    return updated;
  },

  // ── Daily quests ──────────────────────────────────────────────
  getDailyQuests(): DailyQuest[] {
    const state = this.get();
    const today = new Date().toISOString().split("T")[0];
    if (state.lastQuestDate !== today || state.dailyQuests.length === 0) {
      const quests = generateDailyQuests();
      const updated = { ...state, dailyQuests: quests, lastQuestDate: today };
      this.save(updated);
      return quests;
    }
    return state.dailyQuests;
  },

  progressQuest(type: DailyQuestType, amount = 1): GameState {
    const state = this.get();
    const today = new Date().toISOString().split("T")[0];
    if (state.lastQuestDate !== today) return state; // quests not generated yet
    let xpBonus = 0; let coinsBonus = 0; let energyBonus = 0;
    const quests = (state.dailyQuests ?? []).map(q => {
      if (q.type !== type || q.completed) return q;
      const newProgress = Math.min(q.target, q.progress + amount);
      const justCompleted = newProgress >= q.target && !q.completed;
      if (justCompleted) {
        xpBonus     += q.rewardXP;
        coinsBonus  += q.rewardCoins;
        energyBonus += q.rewardEnergy ?? 0;
      }
      return { ...q, progress: newProgress, completed: newProgress >= q.target };
    });
    let updated: GameState = { ...state, dailyQuests: quests };
    if (xpBonus > 0)     { updated = { ...updated, xp: updated.xp + xpBonus, level: Math.floor((updated.xp + xpBonus) / 200) + 1 }; }
    if (coinsBonus > 0)  { updated = { ...updated, coins: updated.coins + coinsBonus }; }
    if (energyBonus > 0) { updated = { ...updated, energy: Math.min(ENERGY_MAX, updated.energy + energyBonus) }; }
    this.save(updated);
    return updated;
  },

  // ── Weekly challenge ─────────────────────────────────────────
  getWeeklyChallenge(): WeeklyChallenge {
    const state      = this.get();
    const weekStart  = getWeekStart();
    if (state.weeklyChallenge?.weekStartDate === weekStart) return state.weeklyChallenge;
    const challenge = generateWeeklyChallenge();
    this.save({ ...state, weeklyChallenge: challenge });
    return challenge;
  },

  progressWeekly(type: WeeklyChallengeType, amount = 1): GameState {
    const state = this.get();
    const wc    = state.weeklyChallenge;
    if (!wc || wc.completed || wc.type !== type) return state;
    const newProg = Math.min(wc.target, wc.progress + amount);
    const justDone = newProg >= wc.target && !wc.completed;
    const updated: GameState = {
      ...state,
      weeklyChallenge: { ...wc, progress: newProg, completed: newProg >= wc.target },
      ...(justDone ? {
        xp:     state.xp + wc.rewardXP,
        level:  Math.floor((state.xp + wc.rewardXP) / 200) + 1,
        coins:  state.coins + wc.rewardCoins,
        energy: Math.min(ENERGY_MAX, state.energy + wc.rewardEnergy),
      } : {}),
    };
    this.save(updated);
    return updated;
  },

  // ── Prestige (Mode Hafiz) ─────────────────────────────────────
  activatePrestige(): GameState {
    const state = this.get();
    const ALL_SAGES_COUNT = 20; // 10 Ère I + 5 Ère II + 5 Ère III + ... total
    if ((state.defeatedSages?.length ?? 0) < 8) return state; // at least Ère I complete
    const updated: GameState = {
      ...state,
      prestigeLevel: (state.prestigeLevel ?? 0) + 1,
      level: 1,
      xp: 0,
      locationStages: {},
      categoryMastery: { religion: 0, history: 0, arabic: 0, darija: 0, quran: 0 },
    };
    this.save(updated);
    return updated;
  },

  // ── Completed arcs ────────────────────────────────────────────
  markArcCompleted(arcId: string): GameState {
    const state = this.get();
    if (state.completedArcs?.includes(arcId)) return state;
    const updated = { ...state, completedArcs: [...(state.completedArcs ?? []), arcId] };
    this.save(updated);
    return updated;
  },

  // ── Location stage progression ────────────────────────────────
  completeLocationStage(locationId: string): GameState {
    const state   = this.get();
    const current = state.locationStages?.[locationId] ?? 0;
    const next    = Math.min(3, current + 1);
    const updated = {
      ...state,
      locationStages: { ...state.locationStages, [locationId]: next },
    };
    this.save(updated);
    return updated;
  },

  // ── Category level ───────────────────────────────────────────
  updateCategoryLevel(category: Category, xpGained: number): GameState {
    const state = this.get();
    const cumulative = (state.categoryXP?.[category] ?? 0) + xpGained;
    const newLevel = Math.min(10, Math.floor(cumulative / 50) + 1);
    const updated = {
      ...state,
      categoryXP: { ...state.categoryXP, [category]: cumulative },
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
    const [progressRes, storyRes] = await Promise.all([
      supabase.from("player_progress").select("*").eq("user_id", userId).single(),
      supabase.from("story_progress").select("story_id,completed_chapters").eq("user_id", userId),
    ]);
    if (progressRes.error || !progressRes.data) return;
    const data = progressRes.data;

    // Build completedArcs from story_progress (arcs with ≥1 completed chapter)
    const remoteArcs: string[] = (storyRes.data ?? [])
      .filter((r: { completed_chapters: unknown[] }) => Array.isArray(r.completed_chapters) && r.completed_chapters.length > 0)
      .map((r: { story_id: string }) => r.story_id);

    const local = this.get();
    const merged: GameState = {
      ...local,
      xp:               Math.max(local.xp, data.xp ?? 0),
      level:            Math.max(local.level, data.level ?? 1),
      coins:            Math.max(local.coins, data.coins ?? 0),
      currentLocation:  data.current_location ?? local.currentLocation,
      gameStreak:       Math.max(local.gameStreak, data.game_streak ?? 0),
      lastGameDate:     data.last_game_date ?? local.lastGameDate,
      unlockedLocations: Array.from(new Set([...local.unlockedLocations, ...(data.unlocked_locations ?? [])])),
      defeatedSages:    Array.from(new Set([...local.defeatedSages, ...(data.defeated_sages ?? [])])),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoryLevels:   (data.category_levels ?? local.categoryLevels) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      powerupCounts:    (data.powerup_counts ?? local.powerupCounts) as any,
      // New Phase 1-7 fields — merge max/union
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locationStages:   { ...((data.location_stages ?? {}) as any), ...local.locationStages },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoryMastery:  ((data.category_mastery ?? local.categoryMastery) as any),
      completedArcs:    Array.from(new Set([...(local.completedArcs ?? []), ...(data.completed_arcs ?? []), ...remoteArcs])),
      prestigeLevel:    Math.max(local.prestigeLevel ?? 0, data.prestige_level ?? 0),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      manuscripts:      { ...((data.manuscripts ?? {}) as any), ...local.manuscripts },
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

    // Progression principale
    await supabase.from("player_progress").upsert({
      user_id:           userId,
      xp:                state.xp,
      level:             state.level,
      coins:             state.coins,
      current_location:  state.currentLocation,
      game_streak:       state.gameStreak,
      last_game_date:    state.lastGameDate,
      unlocked_locations: state.unlockedLocations,
      defeated_sages:    state.defeatedSages,
      category_levels:   state.categoryLevels,
      powerup_counts:    state.powerupCounts,
      // Phase 1-7 fields
      location_stages:   state.locationStages ?? {},
      category_mastery:       state.categoryMastery ?? {},
      completed_arcs:         state.completedArcs ?? [],
      prestige_level:         state.prestigeLevel ?? 0,
      manuscripts:            state.manuscripts ?? {},
      total_correct_answers:  state.totalCorrectAnswers ?? 0,
      updated_at:             new Date().toISOString(),
    });

    // Récompenses (mosquée, coffres, titres, cartes sages)
    if (state.mosqueObjects.length > 0 || state.chestsAvailable > 0 || state.sageCards.length > 0) {
      await supabase.from("rewards").upsert({
        user_id:           userId,
        chests_available:  state.chestsAvailable,
        mosque_objects:    state.mosqueObjects,
        sage_cards:        state.sageCards,
        titles:            state.titles,
        unlocked_avatars:  ["default"],
        unlocked_reciters: [],
      }, { onConflict: "user_id" });
    }

    // Achievements — insert uniquement les nouveaux (ignore les doublons)
    if (state.achievements.length > 0) {
      const rows = state.achievements.map(id => ({
        user_id:        userId,
        achievement_id: id,
        unlocked_at:    new Date().toISOString(),
      }));
      await supabase.from("achievements").upsert(rows, { onConflict: "user_id,achievement_id" });
    }
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
