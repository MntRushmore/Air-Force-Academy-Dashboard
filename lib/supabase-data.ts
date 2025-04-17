import { getSupabaseClient } from "./supabase"
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
  const supabase = getSupabaseClient()

  let query = supabase.from(table).select(options?.columns || "*")

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
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(table)
    .select(options?.columns || "*")
    .eq("id", id)
    .single()

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
  item: Omit<Insert<T>, "id" | "created_at" | "updated_at">,
): Promise<Row<T>> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from(table).insert(item).select().single()

  if (error) {
    console.error(`Error adding item to ${table}:`, error)
    throw error
  }

  return data as Row<T>
}

export async function updateItem<T extends TableName>(
  table: T,
  id: string,
  updates: Omit<Update<T>, "id" | "created_at" | "updated_at">,
): Promise<Row<T>> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(table)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating item in ${table}:`, error)
    throw error
  }

  return data as Row<T>
}

export async function deleteItem<T extends TableName>(table: T, id: string): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    console.error(`Error deleting item from ${table}:`, error)
    throw error
  }
}

// Specific helpers for common operations
export async function getUserProfile() {
  const supabase = getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}

export async function updateUserProfile(updates: Partial<Tables["profiles"]["Update"]>) {
  const supabase = getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating user profile:", error)
    throw error
  }

  return data
}
