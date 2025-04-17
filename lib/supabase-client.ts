import { createClient } from "@supabase/supabase-js"

// Create a single instance of the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Generate a unique client ID for anonymous users
export function getClientId(): string {
  // Check if we already have a client ID in localStorage
  let clientId = localStorage.getItem("usafa_client_id")

  // If not, generate a new one and store it
  if (!clientId) {
    clientId = crypto.randomUUID()
    localStorage.setItem("usafa_client_id", clientId)
  }

  return clientId
}

// Helper function to get data from Supabase
export async function fetchData<T>(
  table: string,
  options?: {
    columns?: string
    filters?: Record<string, any>
    order?: { column: string; ascending?: boolean }
    limit?: number
  },
): Promise<T[]> {
  const clientId = getClientId()

  let query = supabase
    .from(table)
    .select(options?.columns || "*")
    .eq("client_id", clientId)

  // Apply additional filters
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  // Apply ordering
  if (options?.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending ?? true,
    })
  }

  // Apply limit
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching data from ${table}:`, error)
    return []
  }

  return data as T[]
}

// Helper function to insert data into Supabase
export async function insertData<T>(
  table: string,
  data: Omit<T, "id" | "client_id" | "created_at" | "updated_at">,
): Promise<T | null> {
  const clientId = getClientId()

  const { data: insertedData, error } = await supabase
    .from(table)
    .insert({
      ...data,
      client_id: clientId,
    })
    .select()

  if (error) {
    console.error(`Error inserting data into ${table}:`, error)
    return null
  }

  return insertedData?.[0] as T
}

// Helper function to update data in Supabase
export async function updateData<T>(table: string, id: string, data: Partial<T>): Promise<boolean> {
  const clientId = getClientId()

  const { error } = await supabase.from(table).update(data).eq("id", id).eq("client_id", clientId)

  if (error) {
    console.error(`Error updating data in ${table}:`, error)
    return false
  }

  return true
}

// Helper function to delete data from Supabase
export async function deleteData(table: string, id: string): Promise<boolean> {
  const clientId = getClientId()

  const { error } = await supabase.from(table).delete().eq("id", id).eq("client_id", clientId)

  if (error) {
    console.error(`Error deleting data from ${table}:`, error)
    return false
  }

  return true
}
