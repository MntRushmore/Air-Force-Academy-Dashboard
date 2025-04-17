"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { formatGPA, shouldDisplayGPA } from "@/lib/grade-utils"
import type { Database } from "@/lib/database.types"

type Course = Database["public"]["Tables"]["courses"]["Row"]
type Grade = Database["public"]["Tables"]["grades"]["Row"]

interface GPADisplayProps {
  courses: Course[]
  grades: Grade[]
  gpa: number
  isLoading?: boolean
  variant?: "default" | "compact" | "detailed"
  className?: string
}

export function GPADisplay({
  courses,
  grades,
  gpa,
  isLoading = false,
  variant = "default",
  className = "",
}: GPADisplayProps) {
  const hasCoursesWithGrades = shouldDisplayGPA(courses)

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="font-medium">GPA:</span>
        <span className="font-bold">
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : hasCoursesWithGrades ? (
            formatGPA(gpa)
          ) : (
            "N/A"
          )}
        </span>
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Grade Point Average</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-4">
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : hasCoursesWithGrades ? (
              formatGPA(gpa)
            ) : (
              "No Data"
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Courses:</span>
              <span>{courses.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Grades:</span>
              <span>{grades.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Status:</span>
              <span>{hasCoursesWithGrades ? "Calculated" : "Insufficient Data"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card
      className={`bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white shadow-md hover:shadow-lg transition-shadow ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : hasCoursesWithGrades ? (
            formatGPA(gpa)
          ) : (
            "No Data"
          )}
        </div>
        <div className="mt-2 flex items-center text-sm">
          <TrendingUp className="mr-1 h-4 w-4" />
          <span>{hasCoursesWithGrades ? `Based on ${courses.length} courses` : "Add courses to calculate"}</span>
        </div>
      </CardContent>
    </Card>
  )
}
