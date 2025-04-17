"use client"

import { useState, useEffect } from "react"
import { fetchData, insertData, updateData, deleteData, getClientId } from "@/lib/supabase-client"
import type { Database } from "@/lib/database.types"

type Grade = Database["public"]["Tables"]["grades"]["Row"]
type InsertGrade = Omit<
  Database["public"]["Tables"]["grades"]["Insert"],
  "id" | "client_id" | "created_at" | "updated_at"
>
type UpdateGrade = Partial<
  Omit<Database["public"]["Tables"]["grades"]["Update"], "id" | "client_id" | "created_at" | "updated_at">
>

export function useSupabaseGrades(courseId?: string) {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const clientId = getClientId()

  // Fetch grades, optionally filtered by course ID
  const fetchGrades = async () => {
    try {
      setLoading(true)
      const filters: Record<string, any> = {}
      if (courseId) {
        filters.course_id = courseId
      }

      const data = await fetchData<Grade>("grades", {
        filters,
        order: { column: "created_at", ascending: false },
      })
      setGrades(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching grades:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }

  // Add a new grade
  const addGrade = async (grade: InsertGrade): Promise<Grade | null> => {
    try {
      const newGrade = await insertData<Grade>("grades", grade)
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

  // Update an existing grade
  const updateGrade = async (id: string, updates: UpdateGrade): Promise<boolean> => {
    try {
      const success = await updateData<Grade>("grades", id, updates)
      if (success) {
        setGrades((prev) =>
          prev.map((grade) =>
            grade.id === id ? { ...grade, ...updates, updated_at: new Date().toISOString() } : grade,
          ),
        )
      }
      return success
    } catch (err) {
      console.error("Error updating grade:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    }
  }

  // Delete a grade
  const deleteGrade = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteData("grades", id)
      if (success) {
        setGrades((prev) => prev.filter((grade) => grade.id !== id))
      }
      return success
    } catch (err) {
      console.error("Error deleting grade:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    }
  }

  // Fetch grades on component mount or when courseId changes
  useEffect(() => {
    if (clientId !== "server-side") {
      fetchGrades()
    }
  }, [courseId, clientId])

  return {
    grades,
    loading,
    error,
    fetchGrades,
    addGrade,
    updateGrade,
    deleteGrade,
  }
}
