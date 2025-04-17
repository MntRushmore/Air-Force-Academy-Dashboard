"use client"

import { useMemo } from "react"
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Course, Grade } from "@/lib/db"
import { calculateGradeDistribution, getGradeColor } from "@/lib/grade-analysis"

interface PieChartProps {
  courses: Course[]
  grades: Grade[]
  selectedCourses: string[]
}

export function GradeComparisonPieChart({ courses, grades, selectedCourses }: PieChartProps) {
  const chartData = useMemo(() => {
    // Filter grades to only selected courses
    const filteredGrades = grades.filter((grade) => selectedCourses.includes(grade.courseId))

    // Calculate grade distribution
    const distribution = calculateGradeDistribution(filteredGrades)

    // Convert to array format for pie chart
    return Object.entries(distribution)
      .filter(([_, count]) => count > 0)
      .map(([grade, count]) => ({
        name: grade,
        value: count,
        color: getGradeColor(grade),
      }))
  }, [grades, selectedCourses])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>Distribution of grades across selected courses</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
        <CardDescription>Distribution of grades across selected courses</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [value, "Count"]} />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
