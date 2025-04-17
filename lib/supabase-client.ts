import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
      global: {
        headers: {
          "x-client-id": getClientId(),
        },
      },
    })
  }
  return supabaseInstance
}

// Client ID management for anonymous users
export function getClientId(): string {
  if (typeof window !== "undefined") {
    let clientId = localStorage.getItem("usafa_client_id")

    if (!clientId) {
      clientId = uuidv4()
      localStorage.setItem("usafa_client_id", clientId)
    }

    return clientId
  }

  // For server-side rendering, return a placeholder
  // This will be replaced with the actual client ID on the client
  return "server-side"
}

// Generic data fetching function
export async function fetchData<T>(
  table: string,
  options?: {
    columns?: string
    filters?: Record<string, any>
    order?: { column: string; ascending?: boolean }
    limit?: number
  },
): Promise<T[]> {
  const supabase = getSupabaseClient()

  let query = supabase.from(table).select(options?.columns || "*")

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  if (options?.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending ?? false })
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching data from ${table}:`, error)
    throw error
  }

  return data as T[]
}

// Insert data function
export async function insertData<T>(
  table: string,
  data: Omit<T, "id" | "client_id" | "created_at" | "updated_at">,
): Promise<T | null> {
  const supabase = getSupabaseClient()
  const clientId = getClientId()

  const { data: result, error } = await supabase
    .from(table)
    .insert({ ...data, client_id: clientId })
    .select()
    .single()

  if (error) {
    console.error(`Error inserting data into ${table}:`, error)
    throw error
  }

  return result as T
}

// Update data function
export async function updateData<T>(
  table: string,
  id: string,
  data: Partial<Omit<T, "id" | "client_id" | "created_at" | "updated_at">>,
): Promise<boolean> {
  const supabase = getSupabaseClient()
  const clientId = getClientId()

  const { error } = await supabase
    .from(table)
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("client_id", clientId)

  if (error) {
    console.error(`Error updating data in ${table}:`, error)
    throw error
  }

  return true
}

// Delete data function
export async function deleteData(table: string, id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const clientId = getClientId()

  const { error } = await supabase.from(table).delete().eq("id", id).eq("client_id", clientId)

  if (error) {
    console.error(`Error deleting data from ${table}:`, error)
    throw error
  }

  return true
}
