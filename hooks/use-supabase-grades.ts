"use client"

import { useState, useEffect, useCallback } from "react"
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
  const [initialized, setInitialized] = useState(false)
  const clientId = getClientId()

  // Fetch grades, optionally filtered by course ID
  const fetchGrades = useCallback(async () => {
    if (clientId === "server-side") return

    try {
      setLoading(true)
      setError(null)

      const filters: Record<string, any> = {}
      if (courseId) {
        filters.course_id = courseId
      }

      const data = await fetchData<Grade>("grades", {
        filters,
        order: { column: "date", ascending: false },
      })

      setGrades(data)
      setInitialized(true)
    } catch (err) {
      console.error("Error fetching grades:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [courseId, clientId])

  // Add a new grade
  const addGrade = async (grade: InsertGrade): Promise<Grade | null> => {
    try {
      setError(null)

      // Ensure all required fields are present
      const gradeToAdd: InsertGrade = {
        course_id: grade.course_id,
        title: grade.title,
        type: grade.type || "exam",
        score: grade.score,
        max_score: grade.max_score,
        weight: grade.weight || 10,
        date: grade.date || new Date().toISOString().split("T")[0],
        notes: grade.notes || "",
      }

      const newGrade = await insertData<Grade>("grades", gradeToAdd)

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
      setError(null)

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
      setError(null)

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
  }, [courseId, clientId, fetchGrades])

  return {
    grades,
    loading,
    error,
    fetchGrades,
    addGrade,
    updateGrade,
    deleteGrade,
    initialized,
  }
}
