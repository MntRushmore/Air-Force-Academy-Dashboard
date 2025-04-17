import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "./database.types"

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance to prevent multiple instances in development
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Get or create the Supabase client
export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return supabaseInstance
}

// Get a unique client ID for the current user/device
export function getClientId(): string {
  if (typeof window === "undefined") {
    return "server-side"
  }

  let clientId = localStorage.getItem("usafa_client_id")

  if (!clientId) {
    clientId = uuidv4()
    localStorage.setItem("usafa_client_id", clientId)
  }

  return clientId
}

// Generic function to fetch data from a table
export async function fetchData<T>(
  table: string,
  options: {
    filters?: Record<string, any>
    order?: { column: string; ascending: boolean }
    limit?: number
  } = {},
): Promise<T[]> {
  const supabase = getSupabaseClient()
  const clientId = getClientId()

  let query = supabase.from(table).select("*")

  // Add client_id filter
  if (clientId !== "server-side") {
    query = query.eq("client_id", clientId)
  }

  // Add additional filters
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  // Add ordering
  if (options.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending })
  }

  // Add limit
  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching data from ${table}:`, error)
    throw new Error(`Failed to fetch data: ${error.message}`)
  }

  return data as T[]
}

// Generic function to insert data into a table
export async function insertData<T>(table: string, data: any): Promise<T | null> {
  const supabase = getSupabaseClient()
  const clientId = getClientId()

  // Add client_id to the data
  const dataWithClientId = {
    ...data,
    client_id: clientId,
  }

  const { data: insertedData, error } = await supabase.from(table).insert(dataWithClientId).select().single()

  if (error) {
    console.error(`Error inserting data into ${table}:`, error)
    throw new Error(`Failed to insert data: ${error.message}`)
  }

  return insertedData as T
}

// Generic function to update data in a table
export async function updateData<T>(table: string, id: string, data: any): Promise<boolean> {
  const supabase = getSupabaseClient()
  const clientId = getClientId()

  // Add updated_at timestamp
  const dataWithTimestamp = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from(table).update(dataWithTimestamp).eq("id", id).eq("client_id", clientId)

  if (error) {
    console.error(`Error updating data in ${table}:`, error)
    throw new Error(`Failed to update data: ${error.message}`)
  }

  return true
}

// Generic function to delete data from a table
export async function deleteData(table: string, id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const clientId = getClientId()

  const { error } = await supabase.from(table).delete().eq("id", id).eq("client_id", clientId)

  if (error) {
    console.error(`Error deleting data from ${table}:`, error)
    throw new Error(`Failed to delete data: ${error.message}`)
  }

  return true
}

// Function to check if Supabase connection is working
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("courses").select("count").limit(1)

    if (error) {
      console.error("Supabase connection check failed:", error)
      return false
    }

    return true
  } catch (err) {
    console.error("Supabase connection check error:", err)
    return false
  }
}
