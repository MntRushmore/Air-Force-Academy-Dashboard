"use client"

import { useState, useEffect, useCallback } from "react"
import { getClientId } from "@/lib/supabase-client"
import type { Database } from "@/lib/database.types"

type Grade = Database["public"]["Tables"]["grades"]["Row"]
type InsertGrade = Omit<
  Database["public"]["Tables"]["grades"]["Insert"],
  "id" | "client_id" | "created_at" | "updated_at"
>
type UpdateGrade = Partial<
  Omit<Database["public"]["Tables"]["grades"]["Update"], "id" | "client_id" | "created_at" | "updated_at">
>

export function useSupabaseGrades() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [initialized, setInitialized] = useState(false)
  const clientId = getClientId()

  // Fetch all grades using the API
  const fetchGrades = useCallback(
    async (courseId?: string) => {
      if (clientId === "server-side") return

      try {
        setLoading(true)
        setError(null)

        const url = courseId ? `/api/grades?courseId=${courseId}` : "/api/grades"
        const response = await fetch(url, {
          headers: {
            "x-client-id": clientId,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch grades")
        }

        const { data } = await response.json()
        setGrades(data || [])
        setInitialized(true)
      } catch (err) {
        console.error("Error fetching grades:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    },
    [clientId],
  )

  // Add a new grade using the API
  const addGrade = async (grade: InsertGrade): Promise<Grade | null> => {
    try {
      setError(null)

      const response = await fetch("/api/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientId,
        },
        body: JSON.stringify(grade),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add grade")
      }

      const { data: newGrade } = await response.json()

      if (newGrade) {
        setGrades((prev) => [newGrade, ...prev])
      }

      return newGrade
    } catch (err) {
      console.error("Error adding grade:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return null
    }
  }

  // Delete a grade using the API
  const deleteGrade = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch(`/api/grades?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-client-id": clientId,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete grade")
      }

      setGrades((prev) => prev.filter((grade) => grade.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting grade:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    }
  }

  // Fetch grades on component mount
  useEffect(() => {
    if (!initialized && clientId !== "server-side") {
      fetchGrades()
    }
  }, [fetchGrades, initialized, clientId])

  return {
    grades,
    loading,
    error,
    fetchGrades,
    addGrade,
    deleteGrade,
    initialized,
  }
}
