"use client"

import { useState, useEffect } from "react"
import { fetchData, insertData, updateData, deleteData, getClientId } from "@/lib/supabase-client"
import type { Database } from "@/lib/database.types"

type Course = Database["public"]["Tables"]["courses"]["Row"]
type InsertCourse = Omit<
  Database["public"]["Tables"]["courses"]["Insert"],
  "id" | "client_id" | "created_at" | "updated_at"
>
type UpdateCourse = Partial<
  Omit<Database["public"]["Tables"]["courses"]["Update"], "id" | "client_id" | "created_at" | "updated_at">
>

export function useSupabaseCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const clientId = getClientId()

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true)
      const data = await fetchData<Course>("courses", {
        order: { column: "created_at", ascending: false },
      })
      setCourses(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }

  // Add a new course
  const addCourse = async (course: InsertCourse): Promise<Course | null> => {
    try {
      const newCourse = await insertData<Course>("courses", course)
      if (newCourse) {
        setCourses((prev) => [newCourse, ...prev])
      }
      return newCourse
    } catch (err) {
      console.error("Error adding course:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return null
    }
  }

  // Update an existing course
  const updateCourse = async (id: string, updates: UpdateCourse): Promise<boolean> => {
    try {
      const success = await updateData<Course>("courses", id, updates)
      if (success) {
        setCourses((prev) =>
          prev.map((course) =>
            course.id === id ? { ...course, ...updates, updated_at: new Date().toISOString() } : course,
          ),
        )
      }
      return success
    } catch (err) {
      console.error("Error updating course:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    }
  }

  // Delete a course
  const deleteCourse = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteData("courses", id)
      if (success) {
        setCourses((prev) => prev.filter((course) => course.id !== id))
      }
      return success
    } catch (err) {
      console.error("Error deleting course:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    }
  }

  // Fetch courses on component mount
  useEffect(() => {
    if (clientId !== "server-side") {
      fetchCourses()
    }
  }, [clientId])

  return {
    courses,
    loading,
    error,
    fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse,
  }
}
