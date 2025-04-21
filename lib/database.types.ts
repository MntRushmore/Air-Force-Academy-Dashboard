export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      courses: {
        Row: {
          code: string;
          created_at: string | null;
          credits: number;
          grade: string | null;
          id: string;
          is_ap: boolean | null;
          name: string;
          semester: string;
          updated_at: string | null;
          year: number;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          credits?: number;
          grade?: string | null;
          id?: string;
          is_ap?: boolean | null;
          name: string;
          semester: string;
          updated_at?: string | null;
          year: number;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          credits?: number;
          grade?: string | null;
          id?: string;
          is_ap?: boolean | null;
          name?: string;
          semester?: string;
          updated_at?: string | null;
          year?: number;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          date: string;
          start_time: string;
          end_time: string;
          type: "class" | "exam" | "study" | "other";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          date: string;
          start_time: string;
          end_time: string;
          type: "class" | "exam" | "study" | "other";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          start_time?: string;
          end_time?: string;
          type?: "class" | "exam" | "study" | "other";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      fitness_records: {
        Row: {
          id: string;
          user_id: string;
          exercise_type: string;
          value: number;
          target_value: number;
          unit: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_type: string;
          value: number;
          target_value: number;
          unit: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_type?: string;
          value?: number;
          target_value?: number;
          unit?: string;
          date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fitness_records_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      grades: {
        Row: {
          created_at: string;
          date: string;
          grade_type: string | null;
          grade_value: number | null;
          id: string;
          subject: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          grade_type?: string | null;
          grade_value?: number | null;
          id?: string;
          subject: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          grade_type?: string | null;
          grade_value?: number | null;
          id?: string;
          subject?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "grades_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          read: boolean | null;
          title: string;
          type: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          read?: boolean | null;
          title: string;
          type?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          read?: boolean | null;
          title?: string;
          type?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          college: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          name: string | null;
        };
        Insert: {
          college?: string | null;
          created_at?: string | null;
          email?: string | null;
          id: string;
          name?: string | null;
        };
        Update: {
          college?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          due_date: string | null;
          id: string;
          priority: string | null;
          status: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string | null;
          status?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string | null;
          status?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      integrations: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          access_token: string;
          refresh_token: string | null;
          token_expires_at: string | null;
          status: "active" | "inactive" | "error";
          settings: Json | null;
          created_at: string;
          updated_at: string;
          last_sync_at: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          access_token: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          status?: "active" | "inactive" | "error";
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
          last_sync_at?: string | null;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          access_token?: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          status?: "active" | "inactive" | "error";
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
          last_sync_at?: string | null;
          error_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "integrations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      integration_logs: {
        Row: {
          id: string;
          integration_id: string;
          event_type: string;
          status: "success" | "error";
          details: Json | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          integration_id: string;
          event_type: string;
          status: "success" | "error";
          details?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          integration_id?: string;
          event_type?: string;
          status?: "success" | "error";
          details?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey";
            columns: ["integration_id"];
            isOneToOne: false;
            referencedRelation: "integrations";
            referencedColumns: ["id"];
          }
        ];
      };
      calendar_connections: {
        Row: {
          id: string;
          user_id: string;
          integration_id: string;
          name: string;
          type: "google" | "outlook" | "apple";
          calendar_id: string;
          sync_enabled: boolean;
          sync_frequency: number;
          last_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          integration_id: string;
          name: string;
          type: "google" | "outlook" | "apple";
          calendar_id: string;
          sync_enabled?: boolean;
          sync_frequency?: number;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          integration_id?: string;
          name?: string;
          type?: "google" | "outlook" | "apple";
          calendar_id?: string;
          sync_enabled?: boolean;
          sync_frequency?: number;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_connections_integration_id_fkey";
            columns: ["integration_id"];
            isOneToOne: false;
            referencedRelation: "integrations";
            referencedColumns: ["id"];
          }
        ];
      };
      external_events: {
        Row: {
          id: string;
          calendar_connection_id: string;
          external_id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          location: string | null;
          attendees: Json | null;
          recurrence: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
          last_sync_at: string;
        };
        Insert: {
          id?: string;
          calendar_connection_id: string;
          external_id: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          location?: string | null;
          attendees?: Json | null;
          recurrence?: Json | null;
          status: string;
          created_at?: string;
          updated_at?: string;
          last_sync_at?: string;
        };
        Update: {
          id?: string;
          calendar_connection_id?: string;
          external_id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          location?: string | null;
          attendees?: Json | null;
          recurrence?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          last_sync_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "external_events_calendar_connection_id_fkey";
            columns: ["calendar_connection_id"];
            isOneToOne: false;
            referencedRelation: "calendar_connections";
            referencedColumns: ["id"];
          }
        ];
      };
      google_classroom_data: {
        Row: {
          id: string;
          integration_id: string;
          course_id: string;
          name: string;
          section: string | null;
          description: string | null;
          room: string | null;
          owner_id: string;
          created_at: string;
          updated_at: string;
          enrollment_code: string | null;
          course_state: string;
          alternate_link: string | null;
          teacher_group_email: string | null;
          course_group_email: string | null;
          guardians_enabled: boolean;
          calendar_id: string | null;
        };
        Insert: {
          id?: string;
          integration_id: string;
          course_id: string;
          name: string;
          section?: string | null;
          description?: string | null;
          room?: string | null;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
          enrollment_code?: string | null;
          course_state?: string;
          alternate_link?: string | null;
          teacher_group_email?: string | null;
          course_group_email?: string | null;
          guardians_enabled?: boolean;
          calendar_id?: string | null;
        };
        Update: {
          id?: string;
          integration_id?: string;
          course_id?: string;
          name?: string;
          section?: string | null;
          description?: string | null;
          room?: string | null;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
          enrollment_code?: string | null;
          course_state?: string;
          alternate_link?: string | null;
          teacher_group_email?: string | null;
          course_group_email?: string | null;
          guardians_enabled?: boolean;
          calendar_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "google_classroom_data_integration_id_fkey";
            columns: ["integration_id"];
            isOneToOne: false;
            referencedRelation: "integrations";
            referencedColumns: ["id"];
          }
        ];
      };
      google_classroom_assignments: {
        Row: {
          id: string;
          classroom_id: string;
          assignment_id: string;
          title: string;
          description: string | null;
          materials: Json | null;
          state: string;
          alternate_link: string | null;
          created_time: string;
          updated_time: string;
          due_date: string | null;
          due_time: string | null;
          scheduled_time: string | null;
          max_points: number | null;
          work_type: string | null;
          submission_modification_mode: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          classroom_id: string;
          assignment_id: string;
          title: string;
          description?: string | null;
          materials?: Json | null;
          state: string;
          alternate_link?: string | null;
          created_time: string;
          updated_time: string;
          due_date?: string | null;
          due_time?: string | null;
          scheduled_time?: string | null;
          max_points?: number | null;
          work_type?: string | null;
          submission_modification_mode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          classroom_id?: string;
          assignment_id?: string;
          title?: string;
          description?: string | null;
          materials?: Json | null;
          state?: string;
          alternate_link?: string | null;
          created_time?: string;
          updated_time?: string;
          due_date?: string | null;
          due_time?: string | null;
          scheduled_time?: string | null;
          max_points?: number | null;
          work_type?: string | null;
          submission_modification_mode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "google_classroom_assignments_classroom_id_fkey";
            columns: ["classroom_id"];
            isOneToOne: false;
            referencedRelation: "google_classroom_data";
            referencedColumns: ["id"];
          }
        ];
      };
      google_classroom_submissions: {
        Row: {
          id: string;
          assignment_id: string;
          user_id: string;
          state: string;
          late: boolean;
          draft_grade: number | null;
          assigned_grade: number | null;
          alternate_link: string | null;
          submission_history: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          user_id: string;
          state: string;
          late: boolean;
          draft_grade?: number | null;
          assigned_grade?: number | null;
          alternate_link?: string | null;
          submission_history?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          user_id?: string;
          state?: string;
          late?: boolean;
          draft_grade?: number | null;
          assigned_grade?: number | null;
          alternate_link?: string | null;
          submission_history?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "google_classroom_submissions_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "google_classroom_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "google_classroom_submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      array_map: {
        Args: { p_array: string[]; p_format: string };
        Returns: string[];
      };
      assign_user_role: {
        Args: { p_email: string; p_role: string };
        Returns: undefined;
      };
      cube: {
        Args: { "": number[] } | { "": number };
        Returns: unknown;
      };
      cube_dim: {
        Args: { "": unknown };
        Returns: number;
      };
      cube_in: {
        Args: { "": unknown };
        Returns: unknown;
      };
      cube_is_point: {
        Args: { "": unknown };
        Returns: boolean;
      };
      cube_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      cube_recv: {
        Args: { "": unknown };
        Returns: unknown;
      };
      cube_send: {
        Args: { "": unknown };
        Returns: string;
      };
      cube_size: {
        Args: { "": unknown };
        Returns: number;
      };
      dmetaphone: {
        Args: { "": string };
        Returns: string;
      };
      dmetaphone_alt: {
        Args: { "": string };
        Returns: string;
      };
      earth: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      find_duplicates: {
        Args: { p_table_name: string; p_columns: string[] };
        Returns: {
          duplicate_count: number;
          duplicate_values: Json;
        }[];
      };
      full_text_search: {
        Args: { p_search_term: string; p_limit?: number };
        Returns: {
          table_name: string;
          id: string;
          title: string;
          snippet: string;
          rank: number;
        }[];
      };
      fuzzy_search: {
        Args: {
          p_table_name: string;
          p_search_term: string;
          p_columns: string[];
          p_limit?: number;
          p_threshold?: number;
        };
        Returns: {
          id: string;
          similarity: number;
          data: Json;
        }[];
      };
      gc_to_sec: {
        Args: { "": number };
        Returns: number;
      };
      get_database_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          stat_name: string;
          stat_value: string;
        }[];
      };
      get_fitness_summary: {
        Args: { p_user_id: string; p_months?: number };
        Returns: {
          activity_type: string;
          total_sessions: number;
          total_minutes: number;
          total_distance: number;
          avg_duration: number;
        }[];
      };
      get_goal_completion_rate: {
        Args: { p_user_id: string };
        Returns: {
          category: string;
          total_goals: number;
          completed_goals: number;
          in_progress_goals: number;
          not_started_goals: number;
          completion_rate: number;
        }[];
      };
      get_grade_trend_by_type: {
        Args: { p_user_id: string; p_course_id?: string };
        Returns: {
          assignment_type: string;
          assignment_count: number;
          avg_percentage: number;
          min_percentage: number;
          max_percentage: number;
        }[];
      };
      get_index_usage_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          table_name: string;
          index_name: string;
          index_size: string;
          index_scans: number;
          rows_in_table: number;
          is_unused: boolean;
        }[];
      };
      get_slow_queries: {
        Args: { p_min_time?: unknown };
        Returns: {
          query_id: string;
          database_name: string;
          username: string;
          query: string;
          calls: number;
          total_time: number;
          min_time: number;
          max_time: number;
          mean_time: number;
          stddev_time: number;
          rows_processed: number;
        }[];
      };
      get_study_time_by_course: {
        Args: { p_user_id: string; p_start_date?: string; p_end_date?: string };
        Returns: {
          course_id: string;
          course_code: string;
          course_name: string;
          total_minutes: number;
          percentage: number;
        }[];
      };
      get_table_sizes: {
        Args: Record<PropertyKey, never>;
        Returns: {
          table_name: string;
          size_bytes: number;
          size_pretty: string;
          total_rows: number;
        }[];
      };
      get_weekly_study_trend: {
        Args: { p_user_id: string; p_weeks?: number };
        Returns: {
          week_start: string;
          total_minutes: number;
          avg_daily_minutes: number;
          session_count: number;
        }[];
      };
      gtrgm_compress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { "": unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      latitude: {
        Args: { "": unknown };
        Returns: number;
      };
      longitude: {
        Args: { "": unknown };
        Returns: number;
      };
      maintenance_vacuum_analyze: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      sec_to_gc: {
        Args: { "": number };
        Returns: number;
      };
      set_limit: {
        Args: { "": number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { "": string };
        Returns: string[];
      };
      soundex: {
        Args: { "": string };
        Returns: string;
      };
      text_soundex: {
        Args: { "": string };
        Returns: string;
      };
      unaccent: {
        Args: { "": string };
        Returns: string;
      };
      unaccent_init: {
        Args: { "": unknown };
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
