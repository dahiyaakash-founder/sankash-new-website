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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      import_batches: {
        Row: {
          batch_name: string | null
          duplicate_action: string
          duplicate_rows: number
          failed_details: Json | null
          failed_rows: number
          file_name: string
          id: string
          imported_at: string
          imported_by: string
          imported_rows: number
          skipped_rows: number
          total_rows: number
          updated_rows: number
          valid_rows: number
        }
        Insert: {
          batch_name?: string | null
          duplicate_action?: string
          duplicate_rows?: number
          failed_details?: Json | null
          failed_rows?: number
          file_name: string
          id?: string
          imported_at?: string
          imported_by: string
          imported_rows?: number
          skipped_rows?: number
          total_rows?: number
          updated_rows?: number
          valid_rows?: number
        }
        Update: {
          batch_name?: string | null
          duplicate_action?: string
          duplicate_rows?: number
          failed_details?: Json | null
          failed_rows?: number
          file_name?: string
          id?: string
          imported_at?: string
          imported_by?: string
          imported_rows?: number
          skipped_rows?: number
          total_rows?: number
          updated_rows?: number
          valid_rows?: number
        }
        Relationships: []
      }
      lead_activity: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          lead_id: string
          new_value: string | null
          old_value: string | null
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          lead_id: string
          new_value?: string | null
          old_value?: string | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          lead_id?: string
          new_value?: string | null
          old_value?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activity_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_attachments: {
        Row: {
          category: string
          file_name: string
          file_size: number | null
          id: string
          lead_id: string
          mime_type: string | null
          parsed_text_excerpt: string | null
          storage_path: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          file_name: string
          file_size?: number | null
          id?: string
          lead_id: string
          mime_type?: string | null
          parsed_text_excerpt?: string | null
          storage_path: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          file_name?: string
          file_size?: number | null
          id?: string
          lead_id?: string
          mime_type?: string | null
          parsed_text_excerpt?: string | null
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_attachments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          lead_id: string
          note_text: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          lead_id: string
          note_text: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          lead_id?: string
          note_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_status_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          lead_id: string
          new_status: string
          old_status: string | null
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          lead_id: string
          new_status: string
          old_status?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          lead_id?: string
          new_status?: string
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          audience_type: Database["public"]["Enums"]["audience_type"] | null
          city: string | null
          closed_at: string | null
          company_name: string | null
          created_at: string
          destination_type: string | null
          detected_trip_type: string | null
          email: string | null
          emi_flag: boolean | null
          emi_tenure: string | null
          estimated_savings_amount: number | null
          estimated_savings_percent: number | null
          full_name: string
          id: string
          import_batch_id: string | null
          insurance_flag: boolean | null
          last_contacted_at: string | null
          lead_source_page: string | null
          lead_source_type:
            | Database["public"]["Enums"]["lead_source_type"]
            | null
          message: string | null
          metadata_json: Json | null
          mobile_number: string | null
          next_follow_up_at: string | null
          notes: string | null
          outcome: Database["public"]["Enums"]["lead_outcome"]
          pg_flag: boolean | null
          priority: Database["public"]["Enums"]["lead_priority"] | null
          quote_amount: number | null
          quote_file_name: string | null
          quote_file_url: string | null
          quote_validation_status: string | null
          stage: Database["public"]["Enums"]["lead_stage"] | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          assigned_to?: string | null
          audience_type?: Database["public"]["Enums"]["audience_type"] | null
          city?: string | null
          closed_at?: string | null
          company_name?: string | null
          created_at?: string
          destination_type?: string | null
          detected_trip_type?: string | null
          email?: string | null
          emi_flag?: boolean | null
          emi_tenure?: string | null
          estimated_savings_amount?: number | null
          estimated_savings_percent?: number | null
          full_name: string
          id?: string
          import_batch_id?: string | null
          insurance_flag?: boolean | null
          last_contacted_at?: string | null
          lead_source_page?: string | null
          lead_source_type?:
            | Database["public"]["Enums"]["lead_source_type"]
            | null
          message?: string | null
          metadata_json?: Json | null
          mobile_number?: string | null
          next_follow_up_at?: string | null
          notes?: string | null
          outcome?: Database["public"]["Enums"]["lead_outcome"]
          pg_flag?: boolean | null
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          quote_amount?: number | null
          quote_file_name?: string | null
          quote_file_url?: string | null
          quote_validation_status?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"] | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          assigned_to?: string | null
          audience_type?: Database["public"]["Enums"]["audience_type"] | null
          city?: string | null
          closed_at?: string | null
          company_name?: string | null
          created_at?: string
          destination_type?: string | null
          detected_trip_type?: string | null
          email?: string | null
          emi_flag?: boolean | null
          emi_tenure?: string | null
          estimated_savings_amount?: number | null
          estimated_savings_percent?: number | null
          full_name?: string
          id?: string
          import_batch_id?: string | null
          insurance_flag?: boolean | null
          last_contacted_at?: string | null
          lead_source_page?: string | null
          lead_source_type?:
            | Database["public"]["Enums"]["lead_source_type"]
            | null
          message?: string | null
          metadata_json?: Json | null
          mobile_number?: string | null
          next_follow_up_at?: string | null
          notes?: string | null
          outcome?: Database["public"]["Enums"]["lead_outcome"]
          pg_flag?: boolean | null
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          quote_amount?: number | null
          quote_file_name?: string | null
          quote_file_url?: string | null
          quote_validation_status?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"] | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          status: string
          supervisor_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          status?: string
          supervisor_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          status?: string
          supervisor_id?: string | null
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      admin_exists: { Args: never; Returns: boolean }
      bootstrap_first_admin: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ops_member: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "team_member" | "super_admin" | "team_supervisor"
      audience_type: "traveler" | "agent" | "developer" | "partner" | "other"
      lead_outcome: "open" | "won" | "lost"
      lead_priority: "low" | "medium" | "high" | "urgent"
      lead_source_type:
        | "contact_form"
        | "traveler_quote_unlock"
        | "agent_quote_review"
        | "sandbox_access_request"
        | "production_access_request"
        | "demo_request"
        | "support_request"
        | "integration_query"
        | "excel_import"
        | "manual_entry"
        | "offline_calling"
        | "whatsapp_inbound"
        | "referral"
        | "existing_partner"
        | "event_lead"
        | "itinerary_upload"
      lead_stage:
        | "new"
        | "reviewed"
        | "contacted"
        | "qualified"
        | "follow_up_scheduled"
        | "in_progress"
        | "won"
        | "lost"
        | "archived"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "waiting_for_customer"
        | "demo_scheduled"
        | "sandbox_issued"
        | "production_review"
        | "converted"
        | "closed_lost"
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
      app_role: ["admin", "team_member", "super_admin", "team_supervisor"],
      audience_type: ["traveler", "agent", "developer", "partner", "other"],
      lead_outcome: ["open", "won", "lost"],
      lead_priority: ["low", "medium", "high", "urgent"],
      lead_source_type: [
        "contact_form",
        "traveler_quote_unlock",
        "agent_quote_review",
        "sandbox_access_request",
        "production_access_request",
        "demo_request",
        "support_request",
        "integration_query",
        "excel_import",
        "manual_entry",
        "offline_calling",
        "whatsapp_inbound",
        "referral",
        "existing_partner",
        "event_lead",
        "itinerary_upload",
      ],
      lead_stage: [
        "new",
        "reviewed",
        "contacted",
        "qualified",
        "follow_up_scheduled",
        "in_progress",
        "won",
        "lost",
        "archived",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "waiting_for_customer",
        "demo_scheduled",
        "sandbox_issued",
        "production_review",
        "converted",
        "closed_lost",
      ],
    },
  },
} as const
