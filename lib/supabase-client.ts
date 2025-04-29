import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Create a singleton instance to prevent multiple instances in development
let supabaseInstance: SupabaseClient<Database> | null = null;

// Track which tables have client_id column
const tablesWithClientId: Record<string, boolean> = {};

// Get or create the Supabase client
export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

// Get a unique client ID for the current user/device
export function getClientId(): string {
  if (typeof window === "undefined") {
    return "server-side";
  }

  let clientId = localStorage.getItem("usafa_client_id");

  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem("usafa_client_id", clientId);
  }

  return clientId;
}

// Utility: Check if a table has a client_id column (hardcoded list)
function checkTableHasClientId(table: string): boolean {
  const tablesThatHaveClientId = [
    "courses",
    "assignments",
    "grades",
    "tasks",
    "events",
    "journalEntries",
    "meetingLogs",
    "mentors",
    "questions",
    "exercises",
    "goals"
  ];
  return tablesThatHaveClientId.includes(table);
}

// (Your fetchData, insertData, updateData, deleteData, checkSupabaseConnection, and migrateClientIdColumn functions stay exactly the same)