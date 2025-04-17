"use client"

import { useState, useEffect } from "react"
import { fetchData, insertData, updateData, deleteData } from "@/lib/supabase-client"

export function useSupabaseData<T>(
  table: string,
  options?: {
    columns?: string
    filters?: Record<string, any>
    order?: { column: string; ascending?: boolean }
    limit?: number
    refreshInterval?: number
  },
) {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Function to load data
  const loadData = async () => {
    try {
      setIsLoading(true)
      const result = await fetchData<T>(table, options)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }

  // Function to add an item
  const addItem = async (item: Omit<T, "id" | "client_id" | "created_at" | "updated_at">) => {
    try {
      const newItem = await insertData<T>(table, item)
      if (newItem) {
        setData((prev) => [...prev, newItem])
      }
      return newItem
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred while adding the item"))
      return null
    }
  }

  // Function to update an item
  const updateItem = async (id: string, changes: Partial<T>) => {
    try {
      const success = await updateData<T>(table, id, changes)
      if (success) {
        setData((prev) =>
          prev.map((item) =>
            // @ts-ignore - We know id exists on T
            item.id === id ? { ...item, ...changes } : item,
          ),
        )
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred while updating the item"))
      return false
    }
  }

  // Function to delete an item
  const deleteItem = async (id: string) => {
    try {
      const success = await deleteData(table, id)
      if (success) {
        setData((prev) =>
          // @ts-ignore - We know id exists on T
          prev.filter((item) => item.id !== id),
        )
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred while deleting the item"))
      return false
    }
  }

  // Function to refresh data
  const refresh = () => {
    loadData()
  }

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData()

    // Set up refresh interval if specified
    if (options?.refreshInterval) {
      const intervalId = setInterval(loadData, options.refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [
    table,
    options?.columns,
    JSON.stringify(options?.filters),
    options?.order?.column,
    options?.order?.ascending,
    options?.limit,
  ])

  return {
    data,
    isLoading,
    error,
    refresh,
    addItem,
    updateItem,
    deleteItem,
  }
}
