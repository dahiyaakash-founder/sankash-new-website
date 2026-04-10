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
          advisory_insights_json: Json | null
          advisory_summary: string | null
          airline_names_json: Json | null
          attachment_id: string | null
          children_count: number | null
          confidence_notes: string | null
          created_at: string
          currency: string | null
          customer_name: string | null
          decision_flags_json: Json | null
          destination_city: string | null
          destination_country: string | null
          domestic_or_international: string | null
          duration_days: number | null
          duration_nights: number | null
          emi_candidate: boolean | null
          enrichment_status_json: Json | null
          exclusions_text: string | null
          extracted_completeness_score: number | null
          extracted_fields_json: Json | null
          extracted_snippets_json: Json | null
          extraction_warnings_json: Json
          file_count: number
          file_names_json: Json
          flight_arrival_time: string | null
          flight_departure_time: string | null
          hotel_check_in: string | null
          hotel_check_out: string | null
          hotel_names_json: Json | null
          id: string
          inclusions_text: string | null
          infants_count: number | null
          insurance_candidate: boolean | null
          insurance_mentioned: boolean | null
          lead_id: string
          missing_fields_json: Json | null
          next_inputs_needed_json: Json | null
          package_mode: string | null
          parsing_confidence: string | null
          pg_candidate: boolean | null
          price_per_person: number | null
          raw_text: string | null
          sectors_json: Json | null
          seller_questions_json: Json | null
          total_price: number | null
          travel_agent_name: string | null
          travel_end_date: string | null
          travel_start_date: string | null
          traveler_questions_json: Json | null
          traveller_count_total: number | null
          unlockable_modules_json: Json | null
          updated_at: string
          uploaded_by_audience: string | null
          visa_mentioned: boolean | null
        }
        Insert: {
          additional_destinations_json?: Json | null
          adults_count?: number | null
          advisory_insights_json?: Json | null
          advisory_summary?: string | null
          airline_names_json?: Json | null
          attachment_id?: string | null
          children_count?: number | null
          confidence_notes?: string | null
          created_at?: string
          currency?: string | null
          customer_name?: string | null
          decision_flags_json?: Json | null
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          duration_days?: number | null
          duration_nights?: number | null
          emi_candidate?: boolean | null
          enrichment_status_json?: Json | null
          exclusions_text?: string | null
          extracted_completeness_score?: number | null
          extracted_fields_json?: Json | null
          extracted_snippets_json?: Json | null
          extraction_warnings_json?: Json
          file_count?: number
          file_names_json?: Json
          flight_arrival_time?: string | null
          flight_departure_time?: string | null
          hotel_check_in?: string | null
          hotel_check_out?: string | null
          hotel_names_json?: Json | null
          id?: string
          inclusions_text?: string | null
          infants_count?: number | null
          insurance_candidate?: boolean | null
          insurance_mentioned?: boolean | null
          lead_id: string
          missing_fields_json?: Json | null
          next_inputs_needed_json?: Json | null
          package_mode?: string | null
          parsing_confidence?: string | null
          pg_candidate?: boolean | null
          price_per_person?: number | null
          raw_text?: string | null
          sectors_json?: Json | null
          seller_questions_json?: Json | null
          total_price?: number | null
          travel_agent_name?: string | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          traveler_questions_json?: Json | null
          traveller_count_total?: number | null
          unlockable_modules_json?: Json | null
          updated_at?: string
          uploaded_by_audience?: string | null
          visa_mentioned?: boolean | null
        }
        Update: {
          additional_destinations_json?: Json | null
          adults_count?: number | null
          advisory_insights_json?: Json | null
          advisory_summary?: string | null
          airline_names_json?: Json | null
          attachment_id?: string | null
          children_count?: number | null
          confidence_notes?: string | null
          created_at?: string
          currency?: string | null
          customer_name?: string | null
          decision_flags_json?: Json | null
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          duration_days?: number | null
          duration_nights?: number | null
          emi_candidate?: boolean | null
          enrichment_status_json?: Json | null
          exclusions_text?: string | null
          extracted_completeness_score?: number | null
          extracted_fields_json?: Json | null
          extracted_snippets_json?: Json | null
          extraction_warnings_json?: Json
          file_count?: number
          file_names_json?: Json
          flight_arrival_time?: string | null
          flight_departure_time?: string | null
          hotel_check_in?: string | null
          hotel_check_out?: string | null
          hotel_names_json?: Json | null
          id?: string
          inclusions_text?: string | null
          infants_count?: number | null
          insurance_candidate?: boolean | null
          insurance_mentioned?: boolean | null
          lead_id?: string
          missing_fields_json?: Json | null
          next_inputs_needed_json?: Json | null
          package_mode?: string | null
          parsing_confidence?: string | null
          pg_candidate?: boolean | null
          price_per_person?: number | null
          raw_text?: string | null
          sectors_json?: Json | null
          seller_questions_json?: Json | null
          total_price?: number | null
          travel_agent_name?: string | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          traveler_questions_json?: Json | null
          traveller_count_total?: number | null
          unlockable_modules_json?: Json | null
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
      lead_ops_copilot: {
        Row: {
          benchmark_price_position: string
          benchmark_summary_json: Json
          best_pitch_angle: string | null
          call_talking_points_json: Json
          conversion_probability_band: string
          decision_stage: string | null
          id: string
          intent_confidence: string | null
          intent_explanation: string | null
          intent_score: number
          intent_summary_json: Json
          lead_classification: string
          lead_id: string
          lead_quality_score: number
          likely_customer_motive: string | null
          multi_itinerary_read_json: Json
          next_best_action_json: Json
          ops_copilot_version: string
          ops_summary: string | null
          outcome_learning_summary_json: Json
          outcome_learning_version: string | null
          pitch_sequence_json: Json
          product_fit_flags_json: Json
          recommendation_summary: string | null
          recommended_pitch_angle: string | null
          recommended_products_json: Json
          refreshed_at: string
          sankash_opportunity_json: Json
          similar_trip_summary_json: Json
          source_likelihood_json: Json
          suggested_alternative_destinations_json: Json
          suggested_pitch_sequence_json: Json
          top_recommendations_json: Json
          traveler_trust_score: number
          unified_case_id: string
          urgency_score: number
          what_looks_wrong_json: Json
          whatsapp_follow_up: string | null
        }
        Insert: {
          benchmark_price_position?: string
          benchmark_summary_json?: Json
          best_pitch_angle?: string | null
          call_talking_points_json?: Json
          conversion_probability_band?: string
          decision_stage?: string | null
          id?: string
          intent_confidence?: string | null
          intent_explanation?: string | null
          intent_score?: number
          intent_summary_json?: Json
          lead_classification?: string
          lead_id: string
          lead_quality_score?: number
          likely_customer_motive?: string | null
          multi_itinerary_read_json?: Json
          next_best_action_json?: Json
          ops_copilot_version?: string
          ops_summary?: string | null
          outcome_learning_summary_json?: Json
          outcome_learning_version?: string | null
          pitch_sequence_json?: Json
          product_fit_flags_json?: Json
          recommendation_summary?: string | null
          recommended_pitch_angle?: string | null
          recommended_products_json?: Json
          refreshed_at?: string
          sankash_opportunity_json?: Json
          similar_trip_summary_json?: Json
          source_likelihood_json?: Json
          suggested_alternative_destinations_json?: Json
          suggested_pitch_sequence_json?: Json
          top_recommendations_json?: Json
          traveler_trust_score?: number
          unified_case_id: string
          urgency_score?: number
          what_looks_wrong_json?: Json
          whatsapp_follow_up?: string | null
        }
        Update: {
          benchmark_price_position?: string
          benchmark_summary_json?: Json
          best_pitch_angle?: string | null
          call_talking_points_json?: Json
          conversion_probability_band?: string
          decision_stage?: string | null
          id?: string
          intent_confidence?: string | null
          intent_explanation?: string | null
          intent_score?: number
          intent_summary_json?: Json
          lead_classification?: string
          lead_id?: string
          lead_quality_score?: number
          likely_customer_motive?: string | null
          multi_itinerary_read_json?: Json
          next_best_action_json?: Json
          ops_copilot_version?: string
          ops_summary?: string | null
          outcome_learning_summary_json?: Json
          outcome_learning_version?: string | null
          pitch_sequence_json?: Json
          product_fit_flags_json?: Json
          recommendation_summary?: string | null
          recommended_pitch_angle?: string | null
          recommended_products_json?: Json
          refreshed_at?: string
          sankash_opportunity_json?: Json
          similar_trip_summary_json?: Json
          source_likelihood_json?: Json
          suggested_alternative_destinations_json?: Json
          suggested_pitch_sequence_json?: Json
          top_recommendations_json?: Json
          traveler_trust_score?: number
          unified_case_id?: string
          urgency_score?: number
          what_looks_wrong_json?: Json
          whatsapp_follow_up?: string | null
        }
        Relationships: []
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
      lead_trip_brains: {
        Row: {
          additional_destinations_json: Json
          adults_count: number | null
          airline_names_json: Json
          analysis_count: number
          attachment_count: number
          audience_type: string | null
          benchmark_engine_version: string
          benchmark_key: string | null
          benchmark_price_position: string
          benchmark_summary_json: Json
          children_count: number | null
          conflicting_fields_json: Json
          contact_present: boolean
          conversion_probability_band: string
          currency: string | null
          customer_name: string | null
          decision_flags_json: Json
          decision_stage: string | null
          destination_city: string | null
          destination_country: string | null
          domestic_or_international: string | null
          duration_days: number | null
          duration_nights: number | null
          exclusions_text: string | null
          extracted_completeness_score: number | null
          extraction_warnings_json: Json
          hotel_names_json: Json
          id: string
          inclusions_text: string | null
          infants_count: number | null
          intelligence_refreshed_at: string
          intent_confidence: string | null
          intent_explanation: string | null
          intent_score: number
          intent_signals_json: Json
          latest_analysis_id: string | null
          latest_conversion_status: string | null
          lead_classification: string
          lead_id: string
          likely_customer_motive: string | null
          missing_fields_json: Json
          multi_itinerary_summary_json: Json
          multi_itinerary_type: string
          ops_copilot_version: string
          outcome_learning_summary_json: Json
          outcome_learning_version: string | null
          package_mode: string
          parsing_confidence: string | null
          price_per_person: number | null
          product_fit_flags_json: Json
          recommendation_engine_json: Json
          recommended_pitch_angle: string | null
          recommended_products_json: Json
          sectors_json: Json
          seller_questions_json: Json
          similar_case_summary_json: Json
          source_likelihood_json: Json
          source_page: string | null
          source_profile_confidence: string | null
          source_profile_label: string | null
          suggested_alternative_destinations_json: Json
          suggested_pitch_sequence_json: Json
          top_recommendations_json: Json
          total_price: number | null
          travel_agent_name: string | null
          travel_end_date: string | null
          travel_start_date: string | null
          traveler_intelligence_version: string
          traveler_output_json: Json
          traveler_questions_json: Json
          traveller_count_total: number | null
          unified_summary: string | null
          unlockable_modules_json: Json
        }
        Insert: {
          additional_destinations_json?: Json
          adults_count?: number | null
          airline_names_json?: Json
          analysis_count?: number
          attachment_count?: number
          audience_type?: string | null
          benchmark_engine_version?: string
          benchmark_key?: string | null
          benchmark_price_position?: string
          benchmark_summary_json?: Json
          children_count?: number | null
          conflicting_fields_json?: Json
          contact_present?: boolean
          conversion_probability_band?: string
          currency?: string | null
          customer_name?: string | null
          decision_flags_json?: Json
          decision_stage?: string | null
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          duration_days?: number | null
          duration_nights?: number | null
          exclusions_text?: string | null
          extracted_completeness_score?: number | null
          extraction_warnings_json?: Json
          hotel_names_json?: Json
          id?: string
          inclusions_text?: string | null
          infants_count?: number | null
          intelligence_refreshed_at?: string
          intent_confidence?: string | null
          intent_explanation?: string | null
          intent_score?: number
          intent_signals_json?: Json
          latest_analysis_id?: string | null
          latest_conversion_status?: string | null
          lead_classification?: string
          lead_id: string
          likely_customer_motive?: string | null
          missing_fields_json?: Json
          multi_itinerary_summary_json?: Json
          multi_itinerary_type?: string
          ops_copilot_version?: string
          outcome_learning_summary_json?: Json
          outcome_learning_version?: string | null
          package_mode?: string
          parsing_confidence?: string | null
          price_per_person?: number | null
          product_fit_flags_json?: Json
          recommendation_engine_json?: Json
          recommended_pitch_angle?: string | null
          recommended_products_json?: Json
          sectors_json?: Json
          seller_questions_json?: Json
          similar_case_summary_json?: Json
          source_likelihood_json?: Json
          source_page?: string | null
          source_profile_confidence?: string | null
          source_profile_label?: string | null
          suggested_alternative_destinations_json?: Json
          suggested_pitch_sequence_json?: Json
          top_recommendations_json?: Json
          total_price?: number | null
          travel_agent_name?: string | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          traveler_intelligence_version?: string
          traveler_output_json?: Json
          traveler_questions_json?: Json
          traveller_count_total?: number | null
          unified_summary?: string | null
          unlockable_modules_json?: Json
        }
        Update: {
          additional_destinations_json?: Json
          adults_count?: number | null
          airline_names_json?: Json
          analysis_count?: number
          attachment_count?: number
          audience_type?: string | null
          benchmark_engine_version?: string
          benchmark_key?: string | null
          benchmark_price_position?: string
          benchmark_summary_json?: Json
          children_count?: number | null
          conflicting_fields_json?: Json
          contact_present?: boolean
          conversion_probability_band?: string
          currency?: string | null
          customer_name?: string | null
          decision_flags_json?: Json
          decision_stage?: string | null
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          duration_days?: number | null
          duration_nights?: number | null
          exclusions_text?: string | null
          extracted_completeness_score?: number | null
          extraction_warnings_json?: Json
          hotel_names_json?: Json
          id?: string
          inclusions_text?: string | null
          infants_count?: number | null
          intelligence_refreshed_at?: string
          intent_confidence?: string | null
          intent_explanation?: string | null
          intent_score?: number
          intent_signals_json?: Json
          latest_analysis_id?: string | null
          latest_conversion_status?: string | null
          lead_classification?: string
          lead_id?: string
          likely_customer_motive?: string | null
          missing_fields_json?: Json
          multi_itinerary_summary_json?: Json
          multi_itinerary_type?: string
          ops_copilot_version?: string
          outcome_learning_summary_json?: Json
          outcome_learning_version?: string | null
          package_mode?: string
          parsing_confidence?: string | null
          price_per_person?: number | null
          product_fit_flags_json?: Json
          recommendation_engine_json?: Json
          recommended_pitch_angle?: string | null
          recommended_products_json?: Json
          sectors_json?: Json
          seller_questions_json?: Json
          similar_case_summary_json?: Json
          source_likelihood_json?: Json
          source_page?: string | null
          source_profile_confidence?: string | null
          source_profile_label?: string | null
          suggested_alternative_destinations_json?: Json
          suggested_pitch_sequence_json?: Json
          top_recommendations_json?: Json
          total_price?: number | null
          travel_agent_name?: string | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          traveler_intelligence_version?: string
          traveler_output_json?: Json
          traveler_questions_json?: Json
          traveller_count_total?: number | null
          unified_summary?: string | null
          unlockable_modules_json?: Json
        }
        Relationships: []
      }
      lead_trip_intent_signals: {
        Row: {
          audience_type: string | null
          browser_name: string | null
          contact_captured_at: string | null
          contact_present: boolean
          conversion_probability_band: string
          days_to_trip_start: number | null
          decision_stage: string | null
          device_type: string | null
          distinct_destination_count: number
          first_upload_at: string | null
          id: string
          intent_confidence: string | null
          intent_explanation: string | null
          intent_score: number
          latest_upload_at: string | null
          lead_id: string
          likely_customer_motive: string | null
          os_name: string | null
          page_types_json: Json
          pages_visited_json: Json
          quote_size_band: string
          raw_signal_snapshot_json: Json
          recommended_pitch_angle: string | null
          referrer: string | null
          refreshed_at: string
          return_visit_count: number
          same_destination_repeat: boolean
          session_count: number
          source_page: string | null
          time_spent_before_upload_seconds: number | null
          total_public_page_views: number
          trip_size_band: string
          unified_case_id: string | null
          uploaded_multiple_itineraries: boolean
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          viewed_emi_page: boolean
          viewed_emi_section: boolean
          viewed_traveler_page: boolean
        }
        Insert: {
          audience_type?: string | null
          browser_name?: string | null
          contact_captured_at?: string | null
          contact_present?: boolean
          conversion_probability_band?: string
          days_to_trip_start?: number | null
          decision_stage?: string | null
          device_type?: string | null
          distinct_destination_count?: number
          first_upload_at?: string | null
          id?: string
          intent_confidence?: string | null
          intent_explanation?: string | null
          intent_score?: number
          latest_upload_at?: string | null
          lead_id: string
          likely_customer_motive?: string | null
          os_name?: string | null
          page_types_json?: Json
          pages_visited_json?: Json
          quote_size_band?: string
          raw_signal_snapshot_json?: Json
          recommended_pitch_angle?: string | null
          referrer?: string | null
          refreshed_at?: string
          return_visit_count?: number
          same_destination_repeat?: boolean
          session_count?: number
          source_page?: string | null
          time_spent_before_upload_seconds?: number | null
          total_public_page_views?: number
          trip_size_band?: string
          unified_case_id?: string | null
          uploaded_multiple_itineraries?: boolean
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewed_emi_page?: boolean
          viewed_emi_section?: boolean
          viewed_traveler_page?: boolean
        }
        Update: {
          audience_type?: string | null
          browser_name?: string | null
          contact_captured_at?: string | null
          contact_present?: boolean
          conversion_probability_band?: string
          days_to_trip_start?: number | null
          decision_stage?: string | null
          device_type?: string | null
          distinct_destination_count?: number
          first_upload_at?: string | null
          id?: string
          intent_confidence?: string | null
          intent_explanation?: string | null
          intent_score?: number
          latest_upload_at?: string | null
          lead_id?: string
          likely_customer_motive?: string | null
          os_name?: string | null
          page_types_json?: Json
          pages_visited_json?: Json
          quote_size_band?: string
          raw_signal_snapshot_json?: Json
          recommended_pitch_angle?: string | null
          referrer?: string | null
          refreshed_at?: string
          return_visit_count?: number
          same_destination_repeat?: boolean
          session_count?: number
          source_page?: string | null
          time_spent_before_upload_seconds?: number | null
          total_public_page_views?: number
          trip_size_band?: string
          unified_case_id?: string | null
          uploaded_multiple_itineraries?: boolean
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewed_emi_page?: boolean
          viewed_emi_section?: boolean
          viewed_traveler_page?: boolean
        }
        Relationships: []
      }
      lead_trip_outcomes: {
        Row: {
          active_for_learning: boolean
          benchmark_confidence_weight: number
          booked_amount: number | null
          contact_captured_at: string | null
          conversion_date: string | null
          conversion_probability_band_at_outcome: string | null
          conversion_status: string
          destination_city: string | null
          destination_country: string | null
          domestic_or_international: string | null
          explanation: string | null
          first_upload_at: string | null
          id: string
          intent_score_at_outcome: number
          itinerary_count: number
          last_synced_at: string
          lead_classification_at_outcome: string | null
          lead_id: string
          learning_weight: number
          loan_amount: number | null
          multi_itinerary_type: string | null
          originally_anonymous: boolean
          outcome_learning_version: string | null
          owner_user_id: string | null
          pitch_angle_that_worked: string | null
          product_converted_json: Json
          product_fit_snapshot_json: Json
          quote_amount_at_outcome: number | null
          recommendation_outputs_json: Json
          source_page: string | null
          source_profile_label: string | null
          source_type: string | null
          time_from_contact_capture_to_conversion_hours: number | null
          time_from_first_upload_to_conversion_hours: number | null
          traveler_profile_json: Json
          unified_case_id: string | null
          upload_count: number
        }
        Insert: {
          active_for_learning?: boolean
          benchmark_confidence_weight?: number
          booked_amount?: number | null
          contact_captured_at?: string | null
          conversion_date?: string | null
          conversion_probability_band_at_outcome?: string | null
          conversion_status?: string
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          explanation?: string | null
          first_upload_at?: string | null
          id?: string
          intent_score_at_outcome?: number
          itinerary_count?: number
          last_synced_at?: string
          lead_classification_at_outcome?: string | null
          lead_id: string
          learning_weight?: number
          loan_amount?: number | null
          multi_itinerary_type?: string | null
          originally_anonymous?: boolean
          outcome_learning_version?: string | null
          owner_user_id?: string | null
          pitch_angle_that_worked?: string | null
          product_converted_json?: Json
          product_fit_snapshot_json?: Json
          quote_amount_at_outcome?: number | null
          recommendation_outputs_json?: Json
          source_page?: string | null
          source_profile_label?: string | null
          source_type?: string | null
          time_from_contact_capture_to_conversion_hours?: number | null
          time_from_first_upload_to_conversion_hours?: number | null
          traveler_profile_json?: Json
          unified_case_id?: string | null
          upload_count?: number
        }
        Update: {
          active_for_learning?: boolean
          benchmark_confidence_weight?: number
          booked_amount?: number | null
          contact_captured_at?: string | null
          conversion_date?: string | null
          conversion_probability_band_at_outcome?: string | null
          conversion_status?: string
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          explanation?: string | null
          first_upload_at?: string | null
          id?: string
          intent_score_at_outcome?: number
          itinerary_count?: number
          last_synced_at?: string
          lead_classification_at_outcome?: string | null
          lead_id?: string
          learning_weight?: number
          loan_amount?: number | null
          multi_itinerary_type?: string | null
          originally_anonymous?: boolean
          outcome_learning_version?: string | null
          owner_user_id?: string | null
          pitch_angle_that_worked?: string | null
          product_converted_json?: Json
          product_fit_snapshot_json?: Json
          quote_amount_at_outcome?: number | null
          recommendation_outputs_json?: Json
          source_page?: string | null
          source_profile_label?: string | null
          source_type?: string | null
          time_from_contact_capture_to_conversion_hours?: number | null
          time_from_first_upload_to_conversion_hours?: number | null
          traveler_profile_json?: Json
          unified_case_id?: string | null
          upload_count?: number
        }
        Relationships: []
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
      trip_destination_benchmarks: {
        Row: {
          avg_total_price: number | null
          benchmark_key: string
          common_exclusions_json: Json
          common_hotels_json: Json
          common_inclusions_json: Json
          destination_city: string | null
          destination_country: string | null
          domestic_or_international: string | null
          duration_bucket: string | null
          id: string
          max_total_price: number | null
          median_total_price: number | null
          min_total_price: number | null
          package_mode: string | null
          product_fit_summary_json: Json
          rebuilt_at: string
          sample_count: number
          traveler_bucket: string | null
          weighted_sample_score: number | null
        }
        Insert: {
          avg_total_price?: number | null
          benchmark_key: string
          common_exclusions_json?: Json
          common_hotels_json?: Json
          common_inclusions_json?: Json
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          duration_bucket?: string | null
          id?: string
          max_total_price?: number | null
          median_total_price?: number | null
          min_total_price?: number | null
          package_mode?: string | null
          product_fit_summary_json?: Json
          rebuilt_at?: string
          sample_count?: number
          traveler_bucket?: string | null
          weighted_sample_score?: number | null
        }
        Update: {
          avg_total_price?: number | null
          benchmark_key?: string
          common_exclusions_json?: Json
          common_hotels_json?: Json
          common_inclusions_json?: Json
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          duration_bucket?: string | null
          id?: string
          max_total_price?: number | null
          median_total_price?: number | null
          min_total_price?: number | null
          package_mode?: string | null
          product_fit_summary_json?: Json
          rebuilt_at?: string
          sample_count?: number
          traveler_bucket?: string | null
          weighted_sample_score?: number | null
        }
        Relationships: []
      }
      trip_destination_outcome_benchmarks: {
        Row: {
          anonymous_origin_win_rate: number | null
          benchmark_confidence_score: number | null
          benchmark_key: string
          common_converted_products_json: Json
          common_winning_pitch_angles_json: Json
          conversion_rate_weighted: number | null
          guidance_summary: string | null
          id: string
          lost_case_count: number
          partial_case_count: number
          pending_case_count: number
          rebuilt_at: string
          sample_count: number
          won_case_count: number
        }
        Insert: {
          anonymous_origin_win_rate?: number | null
          benchmark_confidence_score?: number | null
          benchmark_key: string
          common_converted_products_json?: Json
          common_winning_pitch_angles_json?: Json
          conversion_rate_weighted?: number | null
          guidance_summary?: string | null
          id?: string
          lost_case_count?: number
          partial_case_count?: number
          pending_case_count?: number
          rebuilt_at?: string
          sample_count?: number
          won_case_count?: number
        }
        Update: {
          anonymous_origin_win_rate?: number | null
          benchmark_confidence_score?: number | null
          benchmark_key?: string
          common_converted_products_json?: Json
          common_winning_pitch_angles_json?: Json
          conversion_rate_weighted?: number | null
          guidance_summary?: string | null
          id?: string
          lost_case_count?: number
          partial_case_count?: number
          pending_case_count?: number
          rebuilt_at?: string
          sample_count?: number
          won_case_count?: number
        }
        Relationships: []
      }
      trip_hotel_frequency: {
        Row: {
          avg_total_price: number | null
          destination_city: string | null
          destination_country: string | null
          domestic_or_international: string | null
          frequency_count: number
          hotel_name: string
          id: string
          rebuilt_at: string
        }
        Insert: {
          avg_total_price?: number | null
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          frequency_count?: number
          hotel_name: string
          id?: string
          rebuilt_at?: string
        }
        Update: {
          avg_total_price?: number | null
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          frequency_count?: number
          hotel_name?: string
          id?: string
          rebuilt_at?: string
        }
        Relationships: []
      }
      trip_intelligence_refresh_queue: {
        Row: {
          attempts: number
          due_at: string
          id: string
          last_error: string | null
          lead_id: string
          processed_at: string | null
          reason: string | null
          requested_at: string
          status: string
        }
        Insert: {
          attempts?: number
          due_at?: string
          id?: string
          last_error?: string | null
          lead_id: string
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
        }
        Update: {
          attempts?: number
          due_at?: string
          id?: string
          last_error?: string | null
          lead_id?: string
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
        }
        Relationships: []
      }
      trip_market_memory: {
        Row: {
          active_for_benchmark: boolean
          adults_count: number | null
          airline_names_json: Json
          audience_type: string | null
          benchmark_engine_version: string | null
          benchmark_key: string | null
          benchmark_price_position: string
          benchmark_signal_weight: number
          children_count: number | null
          contact_present: boolean
          conversion_probability_band: string
          currency: string | null
          decision_stage: string | null
          destination_city: string | null
          destination_country: string | null
          domestic_or_international: string | null
          duration_days: number | null
          duration_nights: number | null
          exclusions_tags_json: Json
          extracted_completeness_score: number | null
          hotel_names_json: Json
          id: string
          inclusions_tags_json: Json
          infants_count: number | null
          itinerary_archetype: string | null
          last_seen_at: string
          latest_conversion_status: string | null
          lead_classification: string
          lead_id: string
          learning_signal_class: string | null
          learning_weight: number
          likely_customer_motive: string | null
          missing_fields_json: Json
          multi_itinerary_type: string
          outcome: string
          outcome_feedback_json: Json
          outcome_learning_version: string | null
          package_mode: string
          parsing_confidence: string | null
          price_per_person: number | null
          product_fit_flags_json: Json
          recommendation_engine_json: Json
          recommendation_summary: string | null
          recommended_pitch_angle: string | null
          sectors_json: Json
          source_likelihood_json: Json
          source_page: string | null
          source_profile_confidence: string | null
          source_profile_label: string | null
          total_price: number | null
          travel_end_date: string | null
          travel_start_date: string | null
          traveler_count_total: number | null
          traveller_count_total: number | null
          unified_case_id: string
        }
        Insert: {
          active_for_benchmark?: boolean
          adults_count?: number | null
          airline_names_json?: Json
          audience_type?: string | null
          benchmark_engine_version?: string | null
          benchmark_key?: string | null
          benchmark_price_position?: string
          benchmark_signal_weight?: number
          children_count?: number | null
          contact_present?: boolean
          conversion_probability_band?: string
          currency?: string | null
          decision_stage?: string | null
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          duration_days?: number | null
          duration_nights?: number | null
          exclusions_tags_json?: Json
          extracted_completeness_score?: number | null
          hotel_names_json?: Json
          id?: string
          inclusions_tags_json?: Json
          infants_count?: number | null
          itinerary_archetype?: string | null
          last_seen_at?: string
          latest_conversion_status?: string | null
          lead_classification?: string
          lead_id: string
          learning_signal_class?: string | null
          learning_weight?: number
          likely_customer_motive?: string | null
          missing_fields_json?: Json
          multi_itinerary_type?: string
          outcome?: string
          outcome_feedback_json?: Json
          outcome_learning_version?: string | null
          package_mode?: string
          parsing_confidence?: string | null
          price_per_person?: number | null
          product_fit_flags_json?: Json
          recommendation_engine_json?: Json
          recommendation_summary?: string | null
          recommended_pitch_angle?: string | null
          sectors_json?: Json
          source_likelihood_json?: Json
          source_page?: string | null
          source_profile_confidence?: string | null
          source_profile_label?: string | null
          total_price?: number | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          traveler_count_total?: number | null
          traveller_count_total?: number | null
          unified_case_id: string
        }
        Update: {
          active_for_benchmark?: boolean
          adults_count?: number | null
          airline_names_json?: Json
          audience_type?: string | null
          benchmark_engine_version?: string | null
          benchmark_key?: string | null
          benchmark_price_position?: string
          benchmark_signal_weight?: number
          children_count?: number | null
          contact_present?: boolean
          conversion_probability_band?: string
          currency?: string | null
          decision_stage?: string | null
          destination_city?: string | null
          destination_country?: string | null
          domestic_or_international?: string | null
          duration_days?: number | null
          duration_nights?: number | null
          exclusions_tags_json?: Json
          extracted_completeness_score?: number | null
          hotel_names_json?: Json
          id?: string
          inclusions_tags_json?: Json
          infants_count?: number | null
          itinerary_archetype?: string | null
          last_seen_at?: string
          latest_conversion_status?: string | null
          lead_classification?: string
          lead_id?: string
          learning_signal_class?: string | null
          learning_weight?: number
          likely_customer_motive?: string | null
          missing_fields_json?: Json
          multi_itinerary_type?: string
          outcome?: string
          outcome_feedback_json?: Json
          outcome_learning_version?: string | null
          package_mode?: string
          parsing_confidence?: string | null
          price_per_person?: number | null
          product_fit_flags_json?: Json
          recommendation_engine_json?: Json
          recommendation_summary?: string | null
          recommended_pitch_angle?: string | null
          sectors_json?: Json
          source_likelihood_json?: Json
          source_page?: string | null
          source_profile_confidence?: string | null
          source_profile_label?: string | null
          total_price?: number | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          traveler_count_total?: number | null
          traveller_count_total?: number | null
          unified_case_id?: string
        }
        Relationships: []
      }
      trip_outcome_learning_queue: {
        Row: {
          attempts: number
          due_at: string
          id: string
          last_error: string | null
          lead_id: string
          payload_json: Json
          processed_at: string | null
          reason: string | null
          requested_at: string
          status: string
          unified_case_id: string | null
        }
        Insert: {
          attempts?: number
          due_at?: string
          id?: string
          last_error?: string | null
          lead_id: string
          payload_json?: Json
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          unified_case_id?: string | null
        }
        Update: {
          attempts?: number
          due_at?: string
          id?: string
          last_error?: string | null
          lead_id?: string
          payload_json?: Json
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          unified_case_id?: string | null
        }
        Relationships: []
      }
      trip_pitch_outcome_memory: {
        Row: {
          anonymous_origin_win_rate: number | null
          common_products_json: Json
          domestic_or_international: string
          id: string
          lost_count: number
          multi_itinerary_type: string
          partial_case_count: number
          pitch_angle: string
          rebuilt_at: string
          sample_count: number
          win_rate: number | null
          won_count: number
        }
        Insert: {
          anonymous_origin_win_rate?: number | null
          common_products_json?: Json
          domestic_or_international?: string
          id?: string
          lost_count?: number
          multi_itinerary_type?: string
          partial_case_count?: number
          pitch_angle: string
          rebuilt_at?: string
          sample_count?: number
          win_rate?: number | null
          won_count?: number
        }
        Update: {
          anonymous_origin_win_rate?: number | null
          common_products_json?: Json
          domestic_or_international?: string
          id?: string
          lost_count?: number
          multi_itinerary_type?: string
          partial_case_count?: number
          pitch_angle?: string
          rebuilt_at?: string
          sample_count?: number
          win_rate?: number | null
          won_count?: number
        }
        Relationships: []
      }
      trip_post_analysis_enrichment_queue: {
        Row: {
          attempts: number
          due_at: string
          enrichment_type: string | null
          id: string
          last_error: string | null
          lead_id: string
          payload_json: Json
          processed_at: string | null
          reason: string | null
          requested_at: string
          status: string
          unified_case_id: string | null
        }
        Insert: {
          attempts?: number
          due_at?: string
          enrichment_type?: string | null
          id?: string
          last_error?: string | null
          lead_id: string
          payload_json?: Json
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          unified_case_id?: string | null
        }
        Update: {
          attempts?: number
          due_at?: string
          enrichment_type?: string | null
          id?: string
          last_error?: string | null
          lead_id?: string
          payload_json?: Json
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          unified_case_id?: string | null
        }
        Relationships: []
      }
      trip_product_outcome_memory: {
        Row: {
          avg_booked_amount: number | null
          avg_loan_amount: number | null
          common_pitch_angles_json: Json
          domestic_or_international: string
          id: string
          lost_count: number
          package_mode: string
          partial_case_count: number
          product_code: string
          rebuilt_at: string
          sample_count: number
          win_rate: number | null
          won_count: number
        }
        Insert: {
          avg_booked_amount?: number | null
          avg_loan_amount?: number | null
          common_pitch_angles_json?: Json
          domestic_or_international?: string
          id?: string
          lost_count?: number
          package_mode?: string
          partial_case_count?: number
          product_code: string
          rebuilt_at?: string
          sample_count?: number
          win_rate?: number | null
          won_count?: number
        }
        Update: {
          avg_booked_amount?: number | null
          avg_loan_amount?: number | null
          common_pitch_angles_json?: Json
          domestic_or_international?: string
          id?: string
          lost_count?: number
          package_mode?: string
          partial_case_count?: number
          product_code?: string
          rebuilt_at?: string
          sample_count?: number
          win_rate?: number | null
          won_count?: number
        }
        Relationships: []
      }
      trip_similar_cases: {
        Row: {
          id: string
          rebuilt_at: string
          similar_case_id: string
          similarity_reasons_json: Json
          similarity_score: number
          unified_case_id: string
        }
        Insert: {
          id?: string
          rebuilt_at?: string
          similar_case_id: string
          similarity_reasons_json?: Json
          similarity_score?: number
          unified_case_id: string
        }
        Update: {
          id?: string
          rebuilt_at?: string
          similar_case_id?: string
          similarity_reasons_json?: Json
          similarity_score?: number
          unified_case_id?: string
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
      can_view_lead: {
        Args: { _lead_assigned_to: string; _user_id: string }
        Returns: boolean
      }
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
      rebuild_trip_destination_benchmarks: { Args: never; Returns: undefined }
      rebuild_trip_destination_outcome_benchmarks: {
        Args: never
        Returns: undefined
      }
      rebuild_trip_hotel_frequency: { Args: never; Returns: undefined }
      rebuild_trip_pitch_outcome_memory: { Args: never; Returns: undefined }
      rebuild_trip_product_outcome_memory: { Args: never; Returns: undefined }
      rebuild_trip_similar_cases: { Args: never; Returns: undefined }
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
        | "traveler_emi_enquiry"
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
        "traveler_emi_enquiry",
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
