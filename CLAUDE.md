# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type-check without emitting
```

No test runner is configured. Playwright is installed but tests are not yet written.

## Architecture Overview

Yawmi is an Islamic PWA (Next.js 16 App Router) for a French-speaking family audience. It combines sacred practice tools with an educational game layer.

### Two distinct state systems

**1. User settings + sacred practice** → `localStorage` via `src/lib/storage.ts`
- `YawmiSettings` (city, prayer method, madhab, adhan mode, app mode)
- `PrayerLog`, `DhikrSession`, `Task`, `ReadingProgress`
- Read/written via `storage.*` helpers; `useSettings()` hook provides reactive access

**2. Game state** → `localStorage` (offline) + Supabase (sync when authenticated)
- `GameState` in `src/lib/game/types.ts` is the canonical shape
- `gameStorage` in `src/lib/game/game-storage.ts` handles localStorage with Supabase sync
- SM-2 spaced repetition for question scheduling: `src/lib/game/sm2.ts`
- Supabase tables: `player_progress`, `question_history`, `rewards`, `achievements`, `duels`, `duels_live`, `weekly_challenges`, `escape_rooms`, `escape_progress`

**3. AI Companion + Stories** → Supabase only
- Tables: `companion_memory`, `companion_messages`, `stories`, `story_chapters`, `story_progress`
- API routes in `src/app/api/companion/` call Groq (llama-3.3-70b) via `src/lib/ai/gemini.ts` (file kept as `gemini.ts` despite using Groq)
- `src/lib/ai/companion.ts` is the public interface — never import from `gemini.ts` directly

### Route structure

```
/accueil              — Home dashboard, next prayer card
/prieres              — Prayer times, monthly tracker, Qibla
/dhikr                — Dhikr counter
/azkar                — Azkar collection
/coran                — Quran reader
/qibla                — Qibla compass
/oasis                — Game hub (map of Islamic locations)
/oasis/[lieu]         — Sage battle page
/oasis/quiz/[lieu]    — Quiz session
/oasis/shop           — Power-up shop
/oasis/escape         — Escape game list (V2, isometric)
/oasis/escape/[room]  — Escape game session
/famille              — Family hub
/famille/duel-live/[id] — Live duel via Supabase Realtime
/histoire             — La Grande Histoire (narrative arcs)
/histoire/[storyId]/[chapter] — Story chapter reader
/mosquee              — Evolving mosque (collectibles)
/profil               — Settings, method selector, madhab selector
/profil/trophees      — Achievements
```

The `(app)` route group wraps all authenticated pages. Its `layout.tsx` handles auth guard, adhan scheduling, and mounts the floating `<Parchemin>` AI companion on every page.

### Prayer times

`src/lib/prayer.ts` wraps the `adhan` library. `computePrayerTimes(lat, lng, method, madhab)` is the single calculation entry point. Default method: `"UOIF"` (12° angles, standard for French mosques). Custom methods `UOIF` and `MoroccoHabous` are built via `CalculationMethod.Other()` with manual angle assignment. All callers must pass `settings.madhab` — never hardcode `Madhab.Shafi`.

### Supabase

- Client-side: `src/lib/supabase.ts` (anon key, RLS enforced)
- Server-side API routes: `createClient` with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- Realtime: used for live duels (`duels_live` table)
- Migrations are in `supabase/migrations/` — run manually via Supabase dashboard SQL editor

### AI companion (`gemini.ts` = Groq)

`src/lib/ai/gemini.ts` exports `geminiChat` and `geminiSingle` but uses Groq (`llama-3.3-70b-versatile`) after migration from Gemini. Function names kept for backward compatibility. Rate limit: 20 messages/day/user, enforced in `src/app/api/companion/chat/route.ts`.

### Game engine

- 5 categories: `religion | history | arabic | darija | quran`
- 9 question types including mini-games: `drag_drop`, `memory`, `fill_verse`, `who_am_i`, `calligraphy`
- SM-2 spaced repetition schedules question re-presentation (`src/lib/game/sm2.ts`)
- Power-ups: `joker50`, `bouclier`, `double_xp`, `time_freeze`
- XP → level, coins → shop, locations unlock via XP thresholds

### Design system

- Colors: deep green `#055C3F`, gold `#D4AF37`, warm white `#F8F4EC`, dark `#0A0F0D`
- Fonts: DM Sans (`--font-dm-sans`) for UI, Lateef for Arabic text
- Animations: Framer Motion; shared variants in `src/lib/motion.ts`
- Sacred sections (prayers, Quran, dhikr) stay visually sober — no confetti, no gamification UI
- Game sections (Oasis, quiz, escape) can use celebratory effects

### Environment variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GROQ_API_KEY
VAPID_SUBJECT                  # must be mailto: format
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
```

`webpush.setVapidDetails()` must be called inside the route handler, never at module level — calling it at module level causes a Next.js build failure during static analysis.
