"use client"

import { useMemo } from "react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Course, Grade } from "@/lib/db"
import { calculateGradeTrends, getGradeColor } from "@/lib/grade-analysis"

interface LineChartProps {
  courses: Course[]
  grades: Grade[]
  selectedCourses: string[]
  timeframe: string
}

export function GradeComparisonLineChart({ courses, grades, selectedCourses, timeframe }: LineChartProps) {
  const chartData = useMemo(() => {
    // Filter to only selected courses
    const filteredCourses = courses.filter((course) => selectedCourses.includes(course.id || ""))

    // Group grades by period
    const gradesByPeriod: Record<string, Grade[]> = {}

    for (const grade of grades) {
      // Only include grades for selected courses
      if (!selectedCourses.includes(grade.courseId)) continue

      let period: string

      // Determine period based on timeframe
      if (timeframe === "month") {
        // Group by month (YYYY-MM)
        const date = new Date(grade.date)
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      } else if (timeframe === "quarter") {
        // Group by quarter (YYYY-Q#)
        const date = new Date(grade.date)
        const quarter = Math.floor(date.getMonth() / 3) + 1
        period = `${date.getFullYear()}-Q${quarter}`
      } else {
        // Group by semester (YYYY-S#)
        const date = new Date(grade.date)
        const semester = date.getMonth() < 6 ? 1 : 2
        period = `${date.getFullYear()}-S${semester}`
      }

      if (!gradesByPeriod[period]) {
        gradesByPeriod[period] = []
      }

      gradesByPeriod[period].push(grade)
    }

    // Calculate trends
    return calculateGradeTrends(gradesByPeriod, filteredCourses)
  }, [courses, grades, selectedCourses, timeframe])

  // Create a mapping of course IDs to names and colors
  const courseInfo = useMemo(() => {
    const info: Record<string, { name: string; code: string; color: string }> = {}

    courses.forEach((course) => {
      if (course.id && selectedCourses.includes(course.id)) {
        info[course.id] = {
          name: course.name,
          code: course.code,
          color: getGradeColor(90 - Math.random() * 30), // Random color based on grade range
        }
      }
    })

    return info
  }, [courses, selectedCourses])

  if (chartData.length === 0 || Object.keys(courseInfo).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grade Trends</CardTitle>
          <CardDescription>Select courses to view grade trends over time</CardDescription>
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
        <CardTitle>Grade Trends</CardTitle>
        <CardDescription>How grades have changed over time</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" label={{ value: "Time Period", position: "insideBottom", offset: -10 }} />
            <YAxis domain={[0, 100]} label={{ value: "Average Grade (%)", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, "Average"]} />
            <Legend />
            {Object.entries(courseInfo).map(([courseId, info]) => (
              <Line
                key={courseId}
                type="monotone"
                dataKey={courseId}
                name={`${info.code} - ${info.name}`}
                stroke={info.color}
                activeDot={{ r: 8 }}
                connectNulls
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
