export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_health_checks: {
        Row: {
          checked_by: string | null
          created_at: string | null
          id: string
          latency_ms: number | null
          notes: string | null
          service: string
          status: string
        }
        Insert: {
          checked_by?: string | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          notes?: string | null
          service: string
          status: string
        }
        Update: {
          checked_by?: string | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          notes?: string | null
          service?: string
          status?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      coach_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coach_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_sessions: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          status: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friction_diagnostics: {
        Row: {
          created_at: string | null
          friction_level: string
          goal_text: string
          id: string
          is_saved_to_history: boolean | null
          profile_id: string
          score_clarity_next_step: number | null
          score_emotional_load: number | null
          score_fear_judgment: number | null
          score_need_certainty: number | null
          score_overplanning: number | null
          steps_completed: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          friction_level: string
          goal_text: string
          id?: string
          is_saved_to_history?: boolean | null
          profile_id: string
          score_clarity_next_step?: number | null
          score_emotional_load?: number | null
          score_fear_judgment?: number | null
          score_need_certainty?: number | null
          score_overplanning?: number | null
          steps_completed?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          friction_level?: string
          goal_text?: string
          id?: string
          is_saved_to_history?: boolean | null
          profile_id?: string
          score_clarity_next_step?: number | null
          score_emotional_load?: number | null
          score_fear_judgment?: number | null
          score_need_certainty?: number | null
          score_overplanning?: number | null
          steps_completed?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          ai_reflection: string | null
          content: string
          created_at: string | null
          id: string
          personal_number_at_entry: number | null
          shadow_pattern: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_reflection?: string | null
          content: string
          created_at?: string | null
          id?: string
          personal_number_at_entry?: number | null
          shadow_pattern?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_reflection?: string | null
          content?: string
          created_at?: string | null
          id?: string
          personal_number_at_entry?: number | null
          shadow_pattern?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          personal_number: number | null
          title: string
          type: string
          xp_reward: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          personal_number?: number | null
          title: string
          type?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          personal_number?: number | null
          title?: string
          type?: string
          xp_reward?: number
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          amount: number | null
          checkout_session_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          provider: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          checkout_session_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          provider: string
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          checkout_session_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          provider?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          archetype: string
          archetype_description: string | null
          audio_url: string | null
          birth_date: string
          created_at: string
          email: string | null
          expression_number: number | null
          free_readings_left: number | null
          id: string
          is_anonymous: boolean | null
          life_path_number: number
          maturity_number: number | null
          name: string
          narrative: string | null
          personality_number: number | null
          phone: string | null
          power_strategy: string | null
          role: string
          shadow_work: string | null
          soul_urge_number: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archetype: string
          archetype_description?: string | null
          audio_url?: string | null
          birth_date: string
          created_at?: string
          email?: string | null
          expression_number?: number | null
          free_readings_left?: number | null
          id?: string
          is_anonymous?: boolean | null
          life_path_number: number
          maturity_number?: number | null
          name: string
          narrative?: string | null
          personality_number?: number | null
          phone?: string | null
          power_strategy?: string | null
          role?: string
          shadow_work?: string | null
          soul_urge_number?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archetype?: string
          archetype_description?: string | null
          audio_url?: string | null
          birth_date?: string
          created_at?: string
          email?: string | null
          expression_number?: number | null
          free_readings_left?: number | null
          id?: string
          is_anonymous?: boolean | null
          life_path_number?: number
          maturity_number?: number | null
          name?: string
          narrative?: string | null
          personality_number?: number | null
          phone?: string | null
          power_strategy?: string | null
          role?: string
          shadow_work?: string | null
          soul_urge_number?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      readings: {
        Row: {
          ai_response: string | null
          audio_url: string | null
          content: string | null
          created_at: string
          id: string
          is_read: boolean | null
          metadata: Json | null
          personal_month: number | null
          personal_year: number | null
          reading_type: string | null
          scheduled_for: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          ai_response?: string | null
          audio_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          personal_month?: number | null
          personal_year?: number | null
          reading_type?: string | null
          scheduled_for?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          ai_response?: string | null
          audio_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          personal_month?: number | null
          personal_year?: number | null
          reading_type?: string | null
          scheduled_for?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          ai_interpretation: string | null
          context_notes: string | null
          created_at: string
          description: string | null
          event: string
          id: string
          occurred_at: string
          seen_number: string | null
          user_id: string
        }
        Insert: {
          ai_interpretation?: string | null
          context_notes?: string | null
          created_at?: string
          description?: string | null
          event: string
          id?: string
          occurred_at?: string
          seen_number?: string | null
          user_id: string
        }
        Update: {
          ai_interpretation?: string | null
          context_notes?: string | null
          created_at?: string
          description?: string | null
          event?: string
          id?: string
          occurred_at?: string
          seen_number?: string | null
          user_id?: string
        }
        Relationships: []
      }
      system_prompts: {
        Row: {
          content: string
          created_at: string | null
          feature: string
          model_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          feature: string
          model_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          feature?: string
          model_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_readings: {
        Row: {
          analysis: string | null
          created_at: string | null
          id: string
          members: Json
          owner_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          analysis?: string | null
          created_at?: string | null
          id?: string
          members?: Json
          owner_id: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          analysis?: string | null
          created_at?: string | null
          id?: string
          members?: Json
          owner_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_readings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed_at: string | null
          completed_date: string | null
          id: string
          mission_id: string
          personal_number_at_completion: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_date?: string | null
          id?: string
          mission_id: string
          personal_number_at_completion?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_date?: string | null
          id?: string
          mission_id?: string
          personal_number_at_completion?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_stats: {
        Row: {
          level: number | null
          show_in_ranking: boolean | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          level?: number | null
          show_in_ranking?: boolean | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          level?: number | null
          show_in_ranking?: boolean | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      admin_update_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: undefined
      }
      award_xp: {
        Args: { p_user_id: string; p_xp: number }
        Returns: undefined
      }
      check_is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
