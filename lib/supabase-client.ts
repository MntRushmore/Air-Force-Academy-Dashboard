import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "./database.types"

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance to prevent multiple instances in development
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Track which tables have client_id column
const tablesWithClientId: Record<string, boolean> = {}

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

// Check if a table has a client_id column
async function checkTableHasClientId(table: string): Promise<boolean> {
  // If we've already checked this table, return the cached result
  if (tablesWithClientId[table] !== undefined) {
    return tablesWithClientId[table]
  }

  try {
    const supabase = getSupabaseClient()

    // Query the information schema to check if the column exists
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", table)
      .eq("column_name", "client_id")

    // Cache and return the result
    tablesWithClientId[table] = data && data.length > 0
    return tablesWithClientId[table]
  } catch (err) {
    console.warn(`Could not check if ${table} has client_id column:`, err)
    // Assume it doesn't have the column to be safe
    tablesWithClientId[table] = false
    return false
  }
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

  try {
    // Start building the query
    let query = supabase.from(table).select("*")

    // Add client_id filter only if we're on the client side
    if (clientId !== "server-side") {
      // Check if the table has a client_id column
      const hasClientId = await checkTableHasClientId(table)

      // Only add the client_id filter if the column exists
      if (hasClientId) {
        query = query.eq("client_id", clientId)
      } else {
        console.warn(`Table ${table} does not have client_id column. Skipping client_id filter.`)
      }
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
  } catch (err) {
    console.error(`Error in fetchData for ${table}:`, err)
    // Return empty array instead of throwing to make the app more resilient
    return [] as T[]
  }
}

// Generic function to insert data into a table
export async function insertData<T>(table: string, data: any): Promise<T | null> {
  const supabase = getSupabaseClient()
  const clientId = getClientId()

  try {
    // Check if the table has a client_id column
    const hasClientId = await checkTableHasClientId(table)

    // Add client_id to the data only if the column exists
    const dataToInsert = hasClientId ? { ...data, client_id: clientId } : data

    const { data: insertedData, error } = await supabase.from(table).insert(dataToInsert).select().single()

    if (error) {
      console.error(`Error inserting data into ${table}:`, error)
      throw new Error(`Failed to insert data: ${error.message}`)
    }

    return insertedData as T
  } catch (err) {
    console.error(`Error in insertData for ${table}:`, err)
    return null
  }
}

// Generic function to update data in a table
export async function updateData<T>(table: string, id: string, data: any): Promise<boolean> {
  const supabase = getSupabaseClient()
  const clientId = getClientId()

  try {
    // Add updated_at timestamp
    const dataWithTimestamp = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    // Check if the table has a client_id column
    const hasClientId = await checkTableHasClientId(table)

    // Build the query
    let query = supabase.from(table).update(dataWithTimestamp).eq("id", id)

    // Add client_id filter only if the column exists
    if (hasClientId) {
      query = query.eq("client_id", clientId)
    }

    const { error } = await query

    if (error) {
      console.error(`Error updating data in ${table}:`, error)
      throw new Error(`Failed to update data: ${error.message}`)
    }

    return true
  } catch (err) {
    console.error(`Error in updateData for ${table}:`, err)
    return false
  }
}

// Generic function to delete data from a table
export async function deleteData(table: string, id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const clientId = getClientId()

  try {
    // Check if the table has a client_id column
    const hasClientId = await checkTableHasClientId(table)

    // Build the query
    let query = supabase.from(table).delete().eq("id", id)

    // Add client_id filter only if the column exists
    if (hasClientId) {
      query = query.eq("client_id", clientId)
    }

    const { error } = await query

    if (error) {
      console.error(`Error deleting data from ${table}:`, error)
      throw new Error(`Failed to delete data: ${error.message}`)
    }

    return true
  } catch (err) {
    console.error(`Error in deleteData for ${table}:`, err)
    return false
  }
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

// Function to run the client_id migration
export async function migrateClientIdColumn(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()

    // Check if courses table has client_id column
    const hasClientId = await checkTableHasClientId("courses")

    if (!hasClientId) {
      console.log("Running client_id migration...")

      // Execute the migration SQL
      const { error } = await supabase.rpc("add_client_id_columns")

      if (error) {
        console.error("Migration failed:", error)
        return false
      }

      // Clear the cache so we recheck tables
      Object.keys(tablesWithClientId).forEach((key) => {
        delete tablesWithClientId[key]
      })

      return true
    }

    return true
  } catch (err) {
    console.error("Migration error:", err)
    return false
  }
}

const supabaseUrl2 = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl2, supabaseAnonKey2)
