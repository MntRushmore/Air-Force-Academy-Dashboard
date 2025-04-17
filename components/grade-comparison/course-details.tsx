"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Course, Grade } from "@/lib/db"
import { calculateCourseAverage, percentageToLetterGrade, getGradeColor } from "@/lib/grade-analysis"

interface CourseDetailsProps {
  courses: Course[]
  grades: Grade[]
  selectedCourses: string[]
}

export function CourseDetails({ courses, grades, selectedCourses }: CourseDetailsProps) {
  const courseDetails = useMemo(() => {
    return courses
      .filter((course) => selectedCourses.includes(course.id || ""))
      .map((course) => {
        const courseGrades = grades.filter((grade) => grade.courseId === course.id)
        const average = calculateCourseAverage(courseGrades)
        const letterGrade = percentageToLetterGrade(average)

        // Count grades by type
        const gradesByType: Record<string, number> = {}
        courseGrades.forEach((grade) => {
          if (!gradesByType[grade.type]) {
            gradesByType[grade.type] = 0
          }
          gradesByType[grade.type]++
        })

        return {
          ...course,
          average,
          letterGrade,
          gradeColor: getGradeColor(letterGrade),
          gradeCount: courseGrades.length,
          gradesByType,
        }
      })
  }, [courses, grades, selectedCourses])

  if (courseDetails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Select courses to view detailed information</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <p className="text-muted-foreground">No courses selected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Details</CardTitle>
        <CardDescription>Detailed information about selected courses</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Average</TableHead>
              <TableHead>Assessments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseDetails.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">
                  <div>{course.code}</div>
                  <div className="text-sm text-muted-foreground">{course.name}</div>
                </TableCell>
                <TableCell>{course.instructor}</TableCell>
                <TableCell>{course.credits}</TableCell>
                <TableCell>
                  <Badge variant="outline">{course.category}</Badge>
                  {course.isAP && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">AP</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className={`font-medium ${course.gradeColor}`}>
                    {course.letterGrade} ({course.average.toFixed(1)}%)
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(course.gradesByType).map(([type, count]) => (
                      <Badge key={type} variant="outline">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
