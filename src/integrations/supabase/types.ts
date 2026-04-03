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
      itinerary_analysis: {
        Row: {
          additional_destinations_json: Json | null
          adults_count: number | null
          airline_names_json: Json | null
          attachment_id: string | null
          children_count: number | null
          created_at: string
          currency: string | null
          customer_name: string | null
          destination_city: string | null
          destination_country: string | null
          domestic_or_international: string | null
          duration_days: number | null
          duration_nights: number | null
          emi_candidate: boolean | null
          exclusions_text: string | null
          extracted_fields_json: Json | null
          extracted_snippets_json: Json | null
          hotel_names_json: Json | null
          id: string
          inclusions_text: string | null
          infants_count: number | null
          insurance_candidate: boolean | null
          insurance_mentioned: boolean | null
          lead_id: string
          missing_fields_json: Json | null
          parsing_confidence: string | null
          pg_candidate: boolean | null
          price_per_person: number | null
          raw_text: string | null
          sectors_json: Json | null
          total_price: number | null
          travel_agent_name: string | null
          travel_end_date: string | null
          travel_start_date: string | null
          traveller_count_total: number | null
          updated_at: string
          uploaded_by_audience: string | null
          visa_mentioned: boolean | null
        }
        Insert: {
          additional_destinations_json?: Json | null
          adults_count?: number | null
          airline_names_json?: Json | null
          attachment_id?: string | null
          children_count?: number | null
          created_at?: string
          currency?: string | null
          customer_name?: string | null
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          duration_days?: number | null
          duration_nights?: number | null
          emi_candidate?: boolean | null
          exclusions_text?: string | null
          extracted_fields_json?: Json | null
          extracted_snippets_json?: Json | null
          hotel_names_json?: Json | null
          id?: string
          inclusions_text?: string | null
          infants_count?: number | null
          insurance_candidate?: boolean | null
          insurance_mentioned?: boolean | null
          lead_id: string
          missing_fields_json?: Json | null
          parsing_confidence?: string | null
          pg_candidate?: boolean | null
          price_per_person?: number | null
          raw_text?: string | null
          sectors_json?: Json | null
          total_price?: number | null
          travel_agent_name?: string | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          traveller_count_total?: number | null
          updated_at?: string
          uploaded_by_audience?: string | null
          visa_mentioned?: boolean | null
        }
        Update: {
          additional_destinations_json?: Json | null
          adults_count?: number | null
          airline_names_json?: Json | null
          attachment_id?: string | null
          children_count?: number | null
          created_at?: string
          currency?: string | null
          customer_name?: string | null
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          duration_days?: number | null
          duration_nights?: number | null
          emi_candidate?: boolean | null
          exclusions_text?: string | null
          extracted_fields_json?: Json | null
          extracted_snippets_json?: Json | null
          hotel_names_json?: Json | null
          id?: string
          inclusions_text?: string | null
          infants_count?: number | null
          insurance_candidate?: boolean | null
          insurance_mentioned?: boolean | null
          lead_id?: string
          missing_fields_json?: Json | null
          parsing_confidence?: string | null
          pg_candidate?: boolean | null
          price_per_person?: number | null
          raw_text?: string | null
          sectors_json?: Json | null
          total_price?: number | null
          travel_agent_name?: string | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          traveller_count_total?: number | null
          updated_at?: string
          uploaded_by_audience?: string | null
          visa_mentioned?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_analysis_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "lead_attachments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_analysis_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
      lead_deletions: {
        Row: {
          deleted_at: string
          deleted_by: string
          deletion_reason: string
          id: string
          lead_id: string
          lead_snapshot: Json
          notes: string | null
        }
        Insert: {
          deleted_at?: string
          deleted_by: string
          deletion_reason: string
          id?: string
          lead_id: string
          lead_snapshot?: Json
          notes?: string | null
        }
        Update: {
          deleted_at?: string
          deleted_by?: string
          deletion_reason?: string
          id?: string
          lead_id?: string
          lead_snapshot?: Json
          notes?: string | null
        }
        Relationships: []
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
      is_supervisor_of: {
        Args: { _member_id: string; _supervisor_id: string }
        Returns: boolean
      }
      upsert_lead_with_dedup: {
        Args: {
          _audience_type?: Database["public"]["Enums"]["audience_type"]
          _city?: string
          _company_name?: string
          _destination_type?: string
          _detected_trip_type?: string
          _email?: string
          _emi_flag?: boolean
          _full_name: string
          _insurance_flag?: boolean
          _lead_source_page?: string
          _lead_source_type?: Database["public"]["Enums"]["lead_source_type"]
          _message?: string
          _metadata_json?: Json
          _mobile_number?: string
          _pg_flag?: boolean
          _quote_amount?: number
          _quote_file_name?: string
          _quote_file_url?: string
          _website_url?: string
        }
        Returns: Json
      }
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
        | "insurance_query"
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
        "insurance_query",
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
