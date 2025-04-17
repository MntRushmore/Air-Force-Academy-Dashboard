"use client"

import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateCourseGrade, getCourseGradeColor } from "@/lib/gpa-utils"
import { Progress } from "@/components/ui/progress"

export function GPASummary() {
  const { courses, grades, gpa } = useData()

  // Get the most recent courses (up to 5)
  const recentCourses = [...courses].sort((a, b) => b.year - a.year || (b.semester === "Fall" ? 1 : -1)).slice(0, 5)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>GPA Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall GPA</span>
          <span className="text-sm font-medium">{gpa.toFixed(2)}/4.0</span>
        </div>
        <Progress value={(gpa / 4) * 100} className="h-2" />

        <div className="space-y-3 mt-4">
          {recentCourses.map((course) => {
            const { percentage, letterGrade } = calculateCourseGrade(course.id || "", grades)
            const gradeColor = getCourseGradeColor(percentage)

            return (
              <div key={course.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {course.code}: {course.name}
                  </span>
                  <span className={`text-sm font-medium ${gradeColor}`}>{letterGrade}</span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
