"use client"

import { useState, useEffect } from "react"
import { getPublicSupabaseClient, getClientId } from "@/lib/supabase-public"
import type { Database } from "@/lib/database.types"

type Tables = Database["public"]["Tables"]
type TableName = keyof Tables

export function usePublicQuery<T extends TableName>(
  table: T,
  options?: {
    columns?: string
    filter?: Record<string, any>
    orderBy?: string
    ascending?: boolean
    limit?: number
    dependencies?: any[]
  },
) {
  const [data, setData] = useState<Tables[T]["Row"][] | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const dependencies = options?.dependencies || []

  useEffect(() => {
    const clientId = getClientId()

    if (!clientId) {
      setData([])
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = getPublicSupabaseClient()

        let query = supabase.from(table).select(options?.columns || "*")

        // Always filter by client_id for security
        query = query.eq("client_id", clientId)

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

        if (error) throw error

        setData(data)
      } catch (err) {
        console.error(`Error fetching ${table}:`, err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [table, ...dependencies])

  return { data, error, isLoading }
}
