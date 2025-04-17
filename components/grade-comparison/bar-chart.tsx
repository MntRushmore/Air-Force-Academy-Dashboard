"use client"

import { useMemo } from "react"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Course, Grade } from "@/lib/db"
import { calculateCourseAverage, getGradeColor } from "@/lib/grade-analysis"

interface BarChartProps {
  courses: Course[]
  grades: Grade[]
  selectedCourses: string[]
  timeframe: string
}

export function GradeComparisonBarChart({ courses, grades, selectedCourses, timeframe }: BarChartProps) {
  const chartData = useMemo(() => {
    // Filter to only selected courses
    const filteredCourses = courses.filter((course) => selectedCourses.includes(course.id || ""))

    // Group grades by course
    const courseGrades = filteredCourses.map((course) => {
      const courseGrades = grades.filter((grade) => grade.courseId === course.id)
      const average = calculateCourseAverage(courseGrades)

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        average,
        color: getGradeColor(average),
      }
    })

    return courseGrades
  }, [courses, grades, selectedCourses, timeframe])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grade Comparison</CardTitle>
          <CardDescription>Select courses to compare their average grades</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">No courses selected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Comparison</CardTitle>
        <CardDescription>Average grades by course</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 70,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="code" angle={-45} textAnchor="end" height={70} interval={0} />
            <YAxis domain={[0, 100]} label={{ value: "Average Grade (%)", angle: -90, position: "insideLeft" }} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)}%`, "Average"]}
              labelFormatter={(value) => {
                const course = chartData.find((c) => c.code === value)
                return course ? `${course.code} - ${course.name}` : value
              }}
            />
            <Legend />
            <Bar dataKey="average" name="Average Grade" isAnimationActive={true} animationDuration={1000}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
