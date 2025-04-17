import { getPublicSupabaseClient, getClientId } from "./supabase-public"
import type { Database } from "./database.types"

// Generic type for all tables
type Tables = Database["public"]["Tables"]
type TableName = keyof Tables
type Row<T extends TableName> = Tables[T]["Row"]
type Insert<T extends TableName> = Tables[T]["Insert"]
type Update<T extends TableName> = Tables[T]["Update"]

// Generic CRUD operations
export async function getItems<T extends TableName>(
  table: T,
  options?: {
    columns?: string
    filter?: Record<string, any>
    orderBy?: string
    ascending?: boolean
    limit?: number
  },
): Promise<Row<T>[]> {
  const supabase = getPublicSupabaseClient()
  const clientId = getClientId()

  let query = supabase.from(table).select(options?.columns || "*")

  // Filter by client_id instead of user_id
  if (clientId) {
    query = query.eq("client_id", clientId)
  }

  if (options?.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options?.ascending ?? false })
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching ${table}:`, error)
    throw error
  }

  return data as Row<T>[]
}

export async function getItemById<T extends TableName>(
  table: T,
  id: string,
  options?: {
    columns?: string
  },
): Promise<Row<T> | null> {
  const supabase = getPublicSupabaseClient()
  const clientId = getClientId()

  let query = supabase
    .from(table)
    .select(options?.columns || "*")
    .eq("id", id)

  // Add client_id filter for security
  if (clientId) {
    query = query.eq("client_id", clientId)
  }

  const { data, error } = await query.single()

  if (error) {
    if (error.code === "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      return null
    }
    console.error(`Error fetching ${table} by ID:`, error)
    throw error
  }

  return data as Row<T>
}

export async function addItem<T extends TableName>(
  table: T,
  item: Omit<Insert<T>, "id" | "created_at" | "updated_at" | "client_id">,
): Promise<Row<T>> {
  const supabase = getPublicSupabaseClient()
  const clientId = getClientId()

  if (!clientId) {
    throw new Error("Client ID not available")
  }

  // Add client_id to the item
  const itemWithClientId = {
    ...item,
    client_id: clientId,
  } as Insert<T>

  const { data, error } = await supabase.from(table).insert(itemWithClientId).select().single()

  if (error) {
    console.error(`Error adding item to ${table}:`, error)
    throw error
  }

  return data as Row<T>
}

export async function updateItem<T extends TableName>(
  table: T,
  id: string,
  updates: Omit<Update<T>, "id" | "created_at" | "updated_at" | "client_id">,
): Promise<Row<T>> {
  const supabase = getPublicSupabaseClient()
  const clientId = getClientId()

  if (!clientId) {
    throw new Error("Client ID not available")
  }

  const { data, error } = await supabase
    .from(table)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("client_id", clientId) // Ensure we only update our own data
    .select()
    .single()

  if (error) {
    console.error(`Error updating item in ${table}:`, error)
    throw error
  }

  return data as Row<T>
}

export async function deleteItem<T extends TableName>(table: T, id: string): Promise<void> {
  const supabase = getPublicSupabaseClient()
  const clientId = getClientId()

  if (!clientId) {
    throw new Error("Client ID not available")
  }

  const { error } = await supabase.from(table).delete().eq("id", id).eq("client_id", clientId) // Ensure we only delete our own data

  if (error) {
    console.error(`Error deleting item from ${table}:`, error)
    throw error
  }
}

// Get dashboard settings
export async function getDashboardSettings() {
  const supabase = getPublicSupabaseClient()
  const clientId = getClientId()

  if (!clientId) {
    return null
  }

  const { data, error } = await supabase.from("settings").select("*").eq("client_id", clientId)

  if (error) {
    console.error("Error fetching settings:", error)
    return null
  }

  // Convert array of settings to an object
  const settingsObject: Record<string, any> = {}
  data.forEach((setting) => {
    settingsObject[setting.key] = setting.value
  })

  return settingsObject
}

// Update dashboard settings
export async function updateDashboardSettings(key: string, value: any) {
  const supabase = getPublicSupabaseClient()
  const clientId = getClientId()

  if (!clientId) {
    throw new Error("Client ID not available")
  }

  // Check if setting already exists
  const { data: existingSetting } = await supabase
    .from("settings")
    .select("*")
    .eq("client_id", clientId)
    .eq("key", key)
    .single()

  if (existingSetting) {
    // Update existing setting
    const { error } = await supabase
      .from("settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("id", existingSetting.id)

    if (error) {
      console.error("Error updating setting:", error)
      throw error
    }
  } else {
    // Create new setting
    const { error } = await supabase.from("settings").insert({
      client_id: clientId,
      key,
      value,
    })

    if (error) {
      console.error("Error creating setting:", error)
      throw error
    }
  }
}
