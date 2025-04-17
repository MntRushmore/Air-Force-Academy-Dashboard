"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateGPA, formatGPA } from "@/lib/grade-utils"
import type { Database } from "@/lib/database.types"

type Course = Database["public"]["Tables"]["courses"]["Row"]
type Grade = Database["public"]["Tables"]["grades"]["Row"]

interface GPADiagnosticsProps {
  courses: Course[]
  grades: Grade[]
}

export function GPADiagnostics({ courses, grades }: GPADiagnosticsProps) {
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  const gpa = calculateGPA(courses, grades)
  const courseCount = courses.length
  const gradeCount = grades.length
  const coursesWithGrades = courses.filter((course) => grades.some((grade) => grade.course_id === course.id))
  const coursesWithGradesCount = coursesWithGrades.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>GPA Diagnostics</CardTitle>
        <CardDescription>Troubleshoot GPA calculation issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Calculated GPA</p>
              <p className="text-2xl font-bold">{formatGPA(gpa)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Courses with Grades</p>
              <p className="text-2xl font-bold">
                {coursesWithGradesCount} / {courseCount}
              </p>
            </div>
          </div>

          {showDiagnostics && (
            <div className="space-y-4 mt-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Courses ({courseCount})</h3>
                {courseCount > 0 ? (
                  <div className="max-h-40 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left">ID</th>
                          <th className="text-left">Name</th>
                          <th className="text-left">Credits</th>
                          <th className="text-left">Has Grades</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => {
                          const hasGrades = grades.some((g) => g.course_id === course.id)
                          return (
                            <tr key={course.id}>
                              <td className="truncate max-w-[80px]">{course.id}</td>
                              <td>{course.name}</td>
                              <td>{course.credits}</td>
                              <td>{hasGrades ? "Yes" : "No"}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No courses found</p>
                )}
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Grades ({gradeCount})</h3>
                {gradeCount > 0 ? (
                  <div className="max-h-40 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left">Course ID</th>
                          <th className="text-left">Title</th>
                          <th className="text-left">Score</th>
                          <th className="text-left">Max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((grade) => (
                          <tr key={grade.id}>
                            <td className="truncate max-w-[80px]">{grade.course_id}</td>
                            <td>{grade.title}</td>
                            <td>{grade.score}</td>
                            <td>{grade.max_score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No grades found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => setShowDiagnostics(!showDiagnostics)}>
          {showDiagnostics ? "Hide Details" : "Show Details"}
        </Button>
      </CardFooter>
    </Card>
  )
}
