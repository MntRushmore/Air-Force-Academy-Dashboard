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
          id: string;
          code: string;
          name: string;
          credits: number;
          semester: string;
          year: number;
          grade: string | null;
          is_ap: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          credits: number;
          semester: string;
          year: number;
          grade?: string | null;
          is_ap?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          credits?: number;
          semester?: string;
          year?: number;
          grade?: string | null;
          is_ap?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      assignments: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          max_score: number;
          weight: number;
          due_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          max_score: number;
          weight: number;
          due_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          max_score?: number;
          weight?: number;
          due_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };

      // ⚡ Add your other tables here (events, grades, etc.) if needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      fuzzy_search: {
        Args: {
          search_text: string;
        };
        Returns: {
          id: string;
          name: string;
          code: string;
        }[];
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