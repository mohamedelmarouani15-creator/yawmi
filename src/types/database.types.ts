// Généré manuellement depuis supabase/migrations/ — 2026-06-03
// Remplace par : npx supabase gen types typescript --project-id ipxzrblmjebgpnejmhpn > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:             string
          display_name:   string | null
          family_id:      string | null
          city:           string | null
          lat:            number | null
          lng:            number | null
          prayer_method:  string | null
          madhab:         string | null
          age_group:      string | null
          arabic_level:   string | null
          app_mode:       string | null
          mother_tongue:  string | null
          main_objective: string | null
          created_at:     string
          updated_at:     string
        }
        Insert: {
          id:              string
          display_name?:   string | null
          family_id?:      string | null
          city?:           string | null
          lat?:            number | null
          lng?:            number | null
          prayer_method?:  string | null
          madhab?:         string | null
          age_group?:      string | null
          arabic_level?:   string | null
          app_mode?:       string | null
          mother_tongue?:  string | null
          main_objective?: string | null
          created_at?:     string
          updated_at?:     string
        }
        Update: {
          id?:             string
          display_name?:   string | null
          family_id?:      string | null
          city?:           string | null
          lat?:            number | null
          lng?:            number | null
          prayer_method?:  string | null
          madhab?:         string | null
          age_group?:      string | null
          arabic_level?:   string | null
          app_mode?:       string | null
          mother_tongue?:  string | null
          main_objective?: string | null
          updated_at?:     string
        }
        Relationships: [
          { foreignKeyName: "profiles_id_fkey"; columns: ["id"]; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "profiles_family_id_fkey"; columns: ["family_id"]; referencedRelation: "families"; referencedColumns: ["id"] }
        ]
      }

      families: {
        Row: {
          id:         string
          name:       string
          code:       string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?:         string
          name:        string
          code:        string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?:         string
          name?:       string
          code?:       string
          created_by?: string | null
        }
        Relationships: []
      }

      tasks: {
        Row: {
          id:          string
          family_id:   string
          text:        string
          member:      string
          done:        boolean
          created_by:  string | null
          created_at:  string
        }
        Insert: {
          id?:          string
          family_id:    string
          text:         string
          member:       string
          done?:        boolean
          created_by?:  string | null
          created_at?:  string
        }
        Update: {
          id?:        string
          family_id?: string
          text?:      string
          member?:    string
          done?:      boolean
        }
        Relationships: [
          { foreignKeyName: "tasks_family_id_fkey"; columns: ["family_id"]; referencedRelation: "families"; referencedColumns: ["id"] }
        ]
      }

      questions: {
        Row: {
          id:               string
          category:         "theologie" | "histoire" | "coran" | "arabe" | "ethique" | "sira" | "fiqh"
          type:             "mcq" | "true_false" | "fill_in" | "reorder" | "drag_drop" | "memory" | "fill_verse" | "who_am_i" | "calligraphy" | "timeline" | "scholars_match"
          difficulty:       number
          question:         string
          transliteration:  string | null
          options:          Json
          explanation:      string | null
          cultural_capsule: Json | null
          location_id:      string | null
          event_id:         string | null
          arabic_required:  "none" | "beginner" | "intermediate" | "advanced"
          minigame_data:    Json | null
          is_active:        boolean
        }
        Insert: {
          id:                string
          category:          "theologie" | "histoire" | "coran" | "arabe" | "ethique" | "sira" | "fiqh"
          type?:             "mcq" | "true_false" | "fill_in" | "reorder" | "drag_drop" | "memory" | "fill_verse" | "who_am_i" | "calligraphy" | "timeline" | "scholars_match"
          difficulty:        number
          question:          string
          transliteration?:  string | null
          options?:          Json
          explanation?:      string | null
          cultural_capsule?: Json | null
          location_id?:      string | null
          event_id?:         string | null
          arabic_required?:  "none" | "beginner" | "intermediate" | "advanced"
          minigame_data?:    Json | null
          is_active?:        boolean
        }
        Update: {
          id?:               string
          category?:         "theologie" | "histoire" | "coran" | "arabe" | "ethique" | "sira" | "fiqh"
          type?:             "mcq" | "true_false" | "fill_in" | "reorder" | "drag_drop" | "memory" | "fill_verse" | "who_am_i" | "calligraphy" | "timeline" | "scholars_match"
          difficulty?:       number
          question?:         string
          transliteration?:  string | null
          options?:          Json
          explanation?:      string | null
          cultural_capsule?: Json | null
          location_id?:      string | null
          event_id?:         string | null
          arabic_required?:  "none" | "beginner" | "intermediate" | "advanced"
          minigame_data?:    Json | null
          is_active?:        boolean
        }
        Relationships: []
      }

      player_progress: {
        Row: {
          user_id:            string
          xp:                 number
          level:              number
          coins:              number
          current_location:   string
          game_streak:        number
          last_game_date:     string | null
          unlocked_locations: string[]
          defeated_sages:     string[]
          category_levels:    Json
          powerup_counts:     Json
          updated_at:         string
          location_stages:    Json
          category_mastery:   Json
          completed_arcs:     string[]
          prestige_level:     number
          manuscripts:             Json
          weekly_challenge:        Json | null
          total_correct_answers:   number
          category_xp:             Json
        }
        Insert: {
          user_id:                  string
          xp?:                      number
          level?:                   number
          coins?:                   number
          current_location?:        string
          game_streak?:             number
          last_game_date?:          string | null
          unlocked_locations?:      string[]
          defeated_sages?:          string[]
          category_levels?:         Json
          powerup_counts?:          Json
          updated_at?:              string
          location_stages?:         Json
          category_mastery?:        Json
          completed_arcs?:          string[]
          prestige_level?:          number
          manuscripts?:             Json
          weekly_challenge?:        Json | null
          total_correct_answers?:   number
          category_xp?:             Json
        }
        Update: {
          user_id?:                 string
          xp?:                      number
          level?:                   number
          coins?:                   number
          current_location?:        string
          game_streak?:             number
          last_game_date?:          string | null
          unlocked_locations?:      string[]
          defeated_sages?:          string[]
          category_levels?:         Json
          powerup_counts?:          Json
          updated_at?:              string
          location_stages?:         Json
          category_mastery?:        Json
          completed_arcs?:          string[]
          prestige_level?:          number
          manuscripts?:             Json
          weekly_challenge?:        Json | null
          total_correct_answers?:   number
          category_xp?:             Json
        }
        Relationships: [
          { foreignKeyName: "player_progress_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ]
      }

      question_history: {
        Row: {
          user_id:         string
          question_id:     string
          times_seen:      number
          times_correct:   number
          easiness_factor: number
          interval_days:   number
          next_due:        string
        }
        Insert: {
          user_id:          string
          question_id:      string
          times_seen?:      number
          times_correct?:   number
          easiness_factor?: number
          interval_days?:   number
          next_due?:        string
        }
        Update: {
          user_id?:         string
          question_id?:     string
          times_seen?:      number
          times_correct?:   number
          easiness_factor?: number
          interval_days?:   number
          next_due?:        string
        }
        Relationships: [
          { foreignKeyName: "question_history_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ]
      }

      rewards: {
        Row: {
          user_id:           string
          chests_available:  number
          mosque_objects:    string[]
          unlocked_reciters: string[]
          unlocked_avatars:  string[]
          titles:            string[]
          sage_cards:        string[]
        }
        Insert: {
          user_id:            string
          chests_available?:  number
          mosque_objects?:    string[]
          unlocked_reciters?: string[]
          unlocked_avatars?:  string[]
          titles?:            string[]
          sage_cards?:        string[]
        }
        Update: {
          user_id?:           string
          chests_available?:  number
          mosque_objects?:    string[]
          unlocked_reciters?: string[]
          unlocked_avatars?:  string[]
          titles?:            string[]
          sage_cards?:        string[]
        }
        Relationships: [
          { foreignKeyName: "rewards_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ]
      }

      achievements: {
        Row: {
          user_id:        string
          achievement_id: string
          unlocked_at:    string
        }
        Insert: {
          user_id:        string
          achievement_id: string
          unlocked_at?:   string
        }
        Update: {
          user_id?:        string
          achievement_id?: string
          unlocked_at?:    string
        }
        Relationships: [
          { foreignKeyName: "achievements_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ]
      }

      duels: {
        Row: {
          id:                              string
          challenger_id:                   string
          challenged_id:                   string
          family_id:                       string | null
          question_ids:                    string[]
          challenger_score:                number | null
          challenged_score:                number | null
          challenger_answers:              Json | null
          challenged_answers:              Json | null
          status:                          "pending" | "completed" | "expired"
          winner_id:                       string | null
          created_at:                      string
          expires_at:                      string
          duel_type:                       string
          recitation_surah:                number | null
          recitation_ayah_start:           number | null
          recitation_ayah_end:             number | null
          challenger_recitation_score:     number | null
          challenged_recitation_score:     number | null
        }
        Insert: {
          id?:                              string
          challenger_id:                    string
          challenged_id:                    string
          family_id?:                       string | null
          question_ids?:                    string[]
          challenger_score?:                number | null
          challenged_score?:                number | null
          challenger_answers?:              Json | null
          challenged_answers?:              Json | null
          status?:                          "pending" | "completed" | "expired"
          winner_id?:                       string | null
          created_at?:                      string
          expires_at?:                      string
          duel_type?:                       string
          recitation_surah?:                number | null
          recitation_ayah_start?:           number | null
          recitation_ayah_end?:             number | null
          challenger_recitation_score?:     number | null
          challenged_recitation_score?:     number | null
        }
        Update: {
          id?:                              string
          challenger_id?:                   string
          challenged_id?:                   string
          family_id?:                       string | null
          question_ids?:                    string[]
          challenger_score?:                number | null
          challenged_score?:                number | null
          challenger_answers?:              Json | null
          challenged_answers?:              Json | null
          status?:                          "pending" | "completed" | "expired"
          winner_id?:                       string | null
          expires_at?:                      string
          duel_type?:                       string
          recitation_surah?:                number | null
          recitation_ayah_start?:           number | null
          recitation_ayah_end?:             number | null
          challenger_recitation_score?:     number | null
          challenged_recitation_score?:     number | null
        }
        Relationships: [
          { foreignKeyName: "duels_challenger_id_fkey"; columns: ["challenger_id"]; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "duels_challenged_id_fkey"; columns: ["challenged_id"]; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "duels_family_id_fkey"; columns: ["family_id"]; referencedRelation: "families"; referencedColumns: ["id"] }
        ]
      }

      duels_live: {
        Row: {
          id:               string
          family_id:        string | null
          player1_id:       string
          player2_id:       string | null
          question_ids:     string[]
          player1_answers:  Json
          player2_answers:  Json
          player1_score:    number
          player2_score:    number
          player1_ready:    boolean
          player2_ready:    boolean
          current_question: number
          status:           "waiting" | "ready" | "playing" | "finished"
          winner_id:        string | null
          created_at:       string
          expires_at:       string
        }
        Insert: {
          id?:               string
          family_id?:        string | null
          player1_id:        string
          player2_id?:       string | null
          question_ids?:     string[]
          player1_answers?:  Json
          player2_answers?:  Json
          player1_score?:    number
          player2_score?:    number
          player1_ready?:    boolean
          player2_ready?:    boolean
          current_question?: number
          status?:           "waiting" | "ready" | "playing" | "finished"
          winner_id?:        string | null
          created_at?:       string
          expires_at?:       string
        }
        Update: {
          id?:               string
          family_id?:        string | null
          player1_id?:       string
          player2_id?:       string | null
          question_ids?:     string[]
          player1_answers?:  Json
          player2_answers?:  Json
          player1_score?:    number
          player2_score?:    number
          player1_ready?:    boolean
          player2_ready?:    boolean
          current_question?: number
          status?:           "waiting" | "ready" | "playing" | "finished"
          winner_id?:        string | null
          expires_at?:       string
        }
        Relationships: [
          { foreignKeyName: "duels_live_player1_id_fkey"; columns: ["player1_id"]; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "duels_live_family_id_fkey"; columns: ["family_id"]; referencedRelation: "families"; referencedColumns: ["id"] }
        ]
      }

      daily_challenges: {
        Row: {
          id:          string
          family_id:   string
          date:        string
          question_id: string
          responses:   Json
        }
        Insert: {
          id?:         string
          family_id:   string
          date:        string
          question_id: string
          responses?:  Json
        }
        Update: {
          id?:          string
          family_id?:   string
          date?:        string
          question_id?: string
          responses?:   Json
        }
        Relationships: [
          { foreignKeyName: "daily_challenges_family_id_fkey"; columns: ["family_id"]; referencedRelation: "families"; referencedColumns: ["id"] }
        ]
      }

      weekly_challenges: {
        Row: {
          id:          string
          family_id:   string
          week_start:  string
          question_id: string
          answers:     Json
        }
        Insert: {
          id?:         string
          family_id:   string
          week_start:  string
          question_id: string
          answers?:    Json
        }
        Update: {
          id?:          string
          family_id?:   string
          week_start?:  string
          question_id?: string
          answers?:     Json
        }
        Relationships: [
          { foreignKeyName: "weekly_challenges_family_id_fkey"; columns: ["family_id"]; referencedRelation: "families"; referencedColumns: ["id"] }
        ]
      }

      escape_rooms: {
        Row: {
          id:          string
          theme:       string
          week_number: number
          riddles:     Json[]
          is_active:   boolean
        }
        Insert: {
          id?:         string
          theme:       string
          week_number: number
          riddles?:    Json[]
          is_active?:  boolean
        }
        Update: {
          id?:          string
          theme?:       string
          week_number?: number
          riddles?:     Json[]
          is_active?:   boolean
        }
        Relationships: []
      }

      escape_progress: {
        Row: {
          family_id:      string
          escape_room_id: string
          solved_locks:   number[]
          shared_hints:   Json
          completed_at:   string | null
        }
        Insert: {
          family_id:       string
          escape_room_id:  string
          solved_locks?:   number[]
          shared_hints?:   Json
          completed_at?:   string | null
        }
        Update: {
          family_id?:      string
          escape_room_id?: string
          solved_locks?:   number[]
          shared_hints?:   Json
          completed_at?:   string | null
        }
        Relationships: [
          { foreignKeyName: "escape_progress_family_id_fkey"; columns: ["family_id"]; referencedRelation: "families"; referencedColumns: ["id"] },
          { foreignKeyName: "escape_progress_escape_room_id_fkey"; columns: ["escape_room_id"]; referencedRelation: "escape_rooms"; referencedColumns: ["id"] }
        ]
      }

      companion_memory: {
        Row: {
          user_id:           string
          arabic_level:      "none" | "beginner" | "intermediate" | "advanced"
          learning_style:    string | null
          strong_categories: string[]
          weak_categories:   string[]
          tone_preference:   "formal" | "warm" | "playful"
          app_mode:          "pratiquant" | "explorateur"
          last_session_at:   string | null
          daily_requests:    number
          daily_reset_date:  string
          notes:             string | null
          updated_at:        string
        }
        Insert: {
          user_id:             string
          arabic_level?:       "none" | "beginner" | "intermediate" | "advanced"
          learning_style?:     string | null
          strong_categories?:  string[]
          weak_categories?:    string[]
          tone_preference?:    "formal" | "warm" | "playful"
          app_mode?:           "pratiquant" | "explorateur"
          last_session_at?:    string | null
          daily_requests?:     number
          daily_reset_date?:   string
          notes?:              string | null
          updated_at?:         string
        }
        Update: {
          user_id?:            string
          arabic_level?:       "none" | "beginner" | "intermediate" | "advanced"
          learning_style?:     string | null
          strong_categories?:  string[]
          weak_categories?:    string[]
          tone_preference?:    "formal" | "warm" | "playful"
          app_mode?:           "pratiquant" | "explorateur"
          last_session_at?:    string | null
          daily_requests?:     number
          daily_reset_date?:   string
          notes?:              string | null
          updated_at?:         string
        }
        Relationships: [
          { foreignKeyName: "companion_memory_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ]
      }

      companion_messages: {
        Row: {
          id:         string
          user_id:    string
          role:       "user" | "assistant"
          content:    string
          created_at: string
        }
        Insert: {
          id?:         string
          user_id:     string
          role:        "user" | "assistant"
          content:     string
          created_at?: string
        }
        Update: {
          id?:         string
          user_id?:    string
          role?:       "user" | "assistant"
          content?:    string
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: "companion_messages_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ]
      }

      companion_daily_message: {
        Row: {
          user_id:      string
          message:      string
          trigger_key:  string | null
          shown:        boolean
          message_date: string
          created_at:   string
        }
        Insert: {
          user_id:       string
          message:       string
          trigger_key?:  string | null
          shown?:        boolean
          message_date?: string
          created_at?:   string
        }
        Update: {
          user_id?:      string
          message?:      string
          trigger_key?:  string | null
          shown?:        boolean
          message_date?: string
          created_at?:   string
        }
        Relationships: [
          { foreignKeyName: "companion_daily_message_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ]
      }

      stories: {
        Row: {
          id:             string
          title:          string
          title_ar:       string | null
          arc_type:       "prophets" | "companions" | "history" | "scholars"
          total_chapters: number
          status:         "draft" | "validated" | "published"
          validated_by:   string | null
          order_index:    number
          created_at:     string
        }
        Insert: {
          id:               string
          title:            string
          title_ar?:        string | null
          arc_type?:        "prophets" | "companions" | "history" | "scholars"
          total_chapters:   number
          status?:          "draft" | "validated" | "published"
          validated_by?:    string | null
          order_index?:     number
          created_at?:      string
        }
        Update: {
          id?:              string
          title?:           string
          title_ar?:        string | null
          arc_type?:        "prophets" | "companions" | "history" | "scholars"
          total_chapters?:  number
          status?:          "draft" | "validated" | "published"
          validated_by?:    string | null
          order_index?:     number
          created_at?:      string
        }
        Relationships: []
      }

      story_chapters: {
        Row: {
          id:             string
          story_id:       string
          chapter_number: number
          title:          string
          narrative:      string
          vocabulary:     Json
          questions:      Json
          values_shown:   string[] | null
          rewards:        Json | null
        }
        Insert: {
          id?:             string
          story_id:        string
          chapter_number:  number
          title:           string
          narrative:       string
          vocabulary?:     Json
          questions?:      Json
          values_shown?:   string[] | null
          rewards?:        Json | null
        }
        Update: {
          id?:             string
          story_id?:       string
          chapter_number?: number
          title?:          string
          narrative?:      string
          vocabulary?:     Json
          questions?:      Json
          values_shown?:   string[] | null
          rewards?:        Json | null
        }
        Relationships: [
          { foreignKeyName: "story_chapters_story_id_fkey"; columns: ["story_id"]; referencedRelation: "stories"; referencedColumns: ["id"] }
        ]
      }

      story_progress: {
        Row: {
          user_id:            string
          story_id:           string
          current_chapter:    number
          completed_chapters: number[]
          started_at:         string
          last_read_at:       string | null
        }
        Insert: {
          user_id:             string
          story_id:            string
          current_chapter?:    number
          completed_chapters?: number[]
          started_at?:         string
          last_read_at?:       string | null
        }
        Update: {
          user_id?:            string
          story_id?:           string
          current_chapter?:    number
          completed_chapters?: number[]
          started_at?:         string
          last_read_at?:       string | null
        }
        Relationships: [
          { foreignKeyName: "story_progress_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "story_progress_story_id_fkey"; columns: ["story_id"]; referencedRelation: "stories"; referencedColumns: ["id"] }
        ]
      }

      push_subscriptions: {
        Row: {
          user_id:        string
          sub:            Json
          lat:            number | null
          lng:            number | null
          prayer_method:  string | null
          madhab:         string | null
          last_notif_key: string | null
          updated_at:     string
          created_at:     string
        }
        Insert: {
          user_id:         string
          sub:             Json
          lat?:            number | null
          lng?:            number | null
          prayer_method?:  string | null
          madhab?:         string | null
          last_notif_key?: string | null
          updated_at?:     string
          created_at?:     string
        }
        Update: {
          user_id?:        string
          sub?:            Json
          lat?:            number | null
          lng?:            number | null
          prayer_method?:  string | null
          madhab?:         string | null
          last_notif_key?: string | null
          updated_at?:     string
          created_at?:     string
        }
        Relationships: [
          { foreignKeyName: "push_subscriptions_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ]
      }
      confreries: {
        Row:    { id: string; name: string; code: string; created_by: string | null; created_at: string }
        Insert: { id?: string; name: string; code: string; created_by?: string | null; created_at?: string }
        Update: { id?: string; name?: string; code?: string; created_by?: string | null; created_at?: string }
        Relationships: []
      }
      confrerie_members: {
        Row:    { confrerie_id: string; user_id: string; joined_at: string }
        Insert: { confrerie_id: string; user_id: string; joined_at?: string }
        Update: { confrerie_id?: string; user_id?: string; joined_at?: string }
        Relationships: []
      }
      liga_seasons: {
        Row:    { id: string; week_start: string; week_end: string }
        Insert: { id?: string; week_start: string; week_end: string }
        Update: { id?: string; week_start?: string; week_end?: string }
        Relationships: []
      }
      liga_placements: {
        Row:    { id: string; user_id: string; season_id: string; league: string; xp_this_week: number; rank_in_league: number | null; promoted: boolean | null; relegated: boolean | null }
        Insert: { id?: string; user_id: string; season_id: string; league?: string; xp_this_week?: number; rank_in_league?: number | null; promoted?: boolean | null; relegated?: boolean | null }
        Update: { id?: string; user_id?: string; season_id?: string; league?: string; xp_this_week?: number; rank_in_league?: number | null; promoted?: boolean | null; relegated?: boolean | null }
        Relationships: []
      }
      hadiths: {
        Row:    { id: string; text_fr: string; text_ar: string; source: string; reference: string; category: string; difficulty: number; is_active: boolean }
        Insert: { id: string; text_fr: string; text_ar: string; source: string; reference: string; category: string; difficulty?: number; is_active?: boolean }
        Update: { id?: string; text_fr?: string; text_ar?: string; source?: string; reference?: string; category?: string; difficulty?: number; is_active?: boolean }
        Relationships: []
      }
      quran_recitation: {
        Row: {
          id:              string
          user_id:         string
          surah:           number
          ayah:            number
          times_seen:      number
          times_correct:   number
          easiness_factor: number
          interval_days:   number
          next_due:        string
          best_score:      number
          last_score:      number
          mastered:        boolean
          tajwid_weak:     string[]
          first_seen_at:   string
          last_seen_at:    string
        }
        Insert: {
          id?:             string
          user_id:         string
          surah:           number
          ayah:            number
          times_seen?:     number
          times_correct?:  number
          easiness_factor?: number
          interval_days?:  number
          next_due?:       string
          best_score?:     number
          last_score?:     number
          mastered?:       boolean
          tajwid_weak?:    string[]
          first_seen_at?:  string
          last_seen_at?:   string
        }
        Update: {
          id?:             string
          user_id?:        string
          surah?:          number
          ayah?:           number
          times_seen?:     number
          times_correct?:  number
          easiness_factor?: number
          interval_days?:  number
          next_due?:       string
          best_score?:     number
          last_score?:     number
          mastered?:       boolean
          tajwid_weak?:    string[]
          last_seen_at?:   string
        }
        Relationships: [
          { foreignKeyName: "quran_recitation_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Helpers de commodité
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
