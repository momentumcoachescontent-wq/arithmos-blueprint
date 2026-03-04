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
      profiles: {
        Row: {
          archetype: string
          archetype_description: string | null
          birth_date: string
          created_at: string
          id: string
          life_path_number: number
          expression_number: number | null
          soul_urge_number: number | null
          personality_number: number | null
          maturity_number: number | null
          name: string
          narrative: string | null
          power_strategy: string | null
          shadow_work: string | null
          audio_url: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archetype: string
          archetype_description?: string | null
          birth_date: string
          created_at?: string
          id?: string
          life_path_number: number
          expression_number?: number | null
          soul_urge_number?: number | null
          personality_number?: number | null
          maturity_number?: number | null
          name: string
          narrative?: string | null
          power_strategy?: string | null
          shadow_work?: string | null
          audio_url?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archetype?: string
          archetype_description?: string | null
          birth_date?: string
          created_at?: string
          id?: string
          life_path_number?: number
          expression_number?: number | null
          soul_urge_number?: number | null
          personality_number?: number | null
          maturity_number?: number | null
          name?: string
          narrative?: string | null
          power_strategy?: string | null
          shadow_work?: string | null
          audio_url?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      readings: {
        Row: {
          content: string | null
          created_at: string
          id: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
          audio_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
          audio_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
          audio_url?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          created_at: string
          description: string | null
          event: string
          id: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event: string
          id?: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event?: string
          id?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          user_id: string
          xp: number
          level: number
          show_in_ranking: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          xp?: number
          level?: number
          show_in_ranking?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          xp?: number
          level?: number
          show_in_ranking?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          id: string
          user_id: string
          provider: 'stripe' | 'mercadopago'
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          checkout_session_id: string | null
          amount: number | null
          currency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'stripe' | 'mercadopago'
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          checkout_session_id?: string | null
          amount?: number | null
          currency?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'stripe' | 'mercadopago'
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          checkout_session_id?: string | null
          amount?: number | null
          currency?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      missions: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string
          xp_reward: number
          personal_number: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type?: string
          xp_reward?: number
          personal_number?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: string
          xp_reward?: number
          personal_number?: number | null
          created_at?: string
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          id: string
          user_id: string
          mission_id: string
          completed_at: string
          completed_date: string
          personal_number_at_completion: number | null
        }
        Insert: {
          id?: string
          user_id: string
          mission_id: string
          completed_at?: string
          completed_date?: string
          personal_number_at_completion?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          mission_id?: string
          completed_at?: string
          completed_date?: string
          personal_number_at_completion?: number | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          ai_reflection: string | null
          shadow_pattern: string | null
          personal_number_at_entry: number | null
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          ai_reflection?: string | null
          shadow_pattern?: string | null
          personal_number_at_entry?: number | null
          type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          ai_reflection?: string | null
          shadow_pattern?: string | null
          personal_number_at_entry?: number | null
          type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: { p_user_id: string; p_xp: number }
        Returns: undefined
      }
      admin_update_user_role: {
        Args: {
          target_user_id: string
          new_role: string
        }
        Returns: undefined
      }
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
