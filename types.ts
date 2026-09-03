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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      complaint_templates: {
        Row: {
          applicable_law: string | null
          category_id: number | null
          id: number
          next_steps: string | null
          required_evidence: string | null
          template_body: string
          title: string
        }
        Insert: {
          applicable_law?: string | null
          category_id?: number | null
          id?: number
          next_steps?: string | null
          required_evidence?: string | null
          template_body: string
          title: string
        }
        Update: {
          applicable_law?: string | null
          category_id?: number | null
          id?: number
          next_steps?: string | null
          required_evidence?: string | null
          template_body?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "legal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category_id: number | null
          id: number
          question: string
        }
        Insert: {
          answer: string
          category_id?: number | null
          id?: number
          question: string
        }
        Update: {
          answer?: string
          category_id?: number | null
          id?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "legal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      government_schemes: {
        Row: {
          benefits: string | null
          description: string
          eligibility: string | null
          how_to_apply: string | null
          id: number
          ministry: string | null
          name: string
          website: string | null
        }
        Insert: {
          benefits?: string | null
          description: string
          eligibility?: string | null
          how_to_apply?: string | null
          id?: number
          ministry?: string | null
          name: string
          website?: string | null
        }
        Update: {
          benefits?: string | null
          description?: string
          eligibility?: string | null
          how_to_apply?: string | null
          id?: number
          ministry?: string | null
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      helplines: {
        Row: {
          available: string | null
          category: string | null
          description: string | null
          id: number
          name: string
          number: string
        }
        Insert: {
          available?: string | null
          category?: string | null
          description?: string | null
          id?: number
          name: string
          number: string
        }
        Update: {
          available?: string | null
          category?: string | null
          description?: string | null
          id?: number
          name?: string
          number?: string
        }
        Relationships: []
      }
      laws: {
        Row: {
          category_id: number | null
          description: string
          id: number
          punishment: string | null
          section: string | null
          title: string
          year: number | null
        }
        Insert: {
          category_id?: number | null
          description: string
          id?: number
          punishment?: string | null
          section?: string | null
          title: string
          year?: number | null
        }
        Update: {
          category_id?: number | null
          description?: string
          id?: number
          punishment?: string | null
          section?: string | null
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "laws_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "legal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: number
          name: string
          parent_id: number | null
          slug: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: number
          name: string
          parent_id?: number | null
          slug: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
          parent_id?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "legal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      rights: {
        Row: {
          category_id: number | null
          description: string
          how_to_exercise: string | null
          id: number
          title: string
        }
        Insert: {
          category_id?: number | null
          description: string
          how_to_exercise?: string | null
          id?: number
          title: string
        }
        Update: {
          category_id?: number | null
          description?: string
          how_to_exercise?: string | null
          id?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rights_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "legal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      search_logs: {
        Row: {
          category: string | null
          created_at: string
          id: string
          query: string
          risk_level: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          query: string
          risk_level?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          query?: string
          risk_level?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
