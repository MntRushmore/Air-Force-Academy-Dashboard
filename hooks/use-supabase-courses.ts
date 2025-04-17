"use client"

import { useState, useEffect, useCallback } from "react"
import { getClientId } from "@/lib/supabase-client"
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
  const [initialized, setInitialized] = useState(false)
  const clientId = getClientId()

  // Fetch all courses using the API
  const fetchCourses = useCallback(async () => {
    if (clientId === "server-side") return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/courses", {
        headers: {
          "x-client-id": clientId,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch courses")
      }

      const { data } = await response.json()
      setCourses(data || [])
      setInitialized(true)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [clientId])

  // Add a new course using the API
  const addCourse = async (course: InsertCourse): Promise<Course | null> => {
    try {
      setError(null)

      // Ensure all required fields are present
      const courseToAdd: InsertCourse = {
        code: course.code,
        name: course.name,
        instructor: course.instructor || "",
        credits: course.credits || 3,
        semester: course.semester || "Fall",
        year: course.year || new Date().getFullYear(),
        category: course.category || "STEM",
        is_ap: course.is_ap || false,
        notes: course.notes || "",
      }

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientId,
        },
        body: JSON.stringify(courseToAdd),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add course")
      }

      const { data: newCourse } = await response.json()

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
      setError(null)

      const response = await fetch(`/api/courses?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientId,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update course")
      }

      const { data: updatedCourse } = await response.json()

      if (updatedCourse) {
        setCourses((prev) =>
          prev.map((course) =>
            course.id === id ? { ...course, ...updates, updated_at: new Date().toISOString() } : course,
          ),
        )
      }

      return true
    } catch (err) {
      console.error("Error updating course:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    }
  }

  // Delete a course using the API
  const deleteCourse = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch(`/api/courses?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-client-id": clientId,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete course")
      }

      setCourses((prev) => prev.filter((course) => course.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting course:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    }
  }

  // Fetch courses on component mount
  useEffect(() => {
    if (!initialized && clientId !== "server-side") {
      fetchCourses()
    }
  }, [fetchCourses, initialized, clientId])

  return {
    courses,
    loading,
    error,
    fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    initialized,
  }
}
