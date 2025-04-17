import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Create a single supabase client for the entire app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side singleton to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getPublicSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Server-side client (creates a new instance each time to avoid sharing between requests)
export const createServerSupabaseClient = () => {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Generate a unique client ID for this browser session if one doesn't exist
export const getClientId = () => {
  if (typeof window === "undefined") return null

  let clientId = localStorage.getItem("usafa_client_id")

  if (!clientId) {
    clientId = `client_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`
    localStorage.setItem("usafa_client_id", clientId)
  }

  return clientId
}
