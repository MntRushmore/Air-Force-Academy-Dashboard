"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Course, Grade } from "@/lib/db"
import { calculateComparativeMetrics } from "@/lib/grade-analysis"
import { ArrowUpRight, ArrowDownRight, TrendingUp, BarChart } from "lucide-react"

interface ComparativeMetricsProps {
  courses: Course[]
  grades: Grade[]
  selectedCourses: string[]
}

export function ComparativeMetrics({ courses, grades, selectedCourses }: ComparativeMetricsProps) {
  const metrics = useMemo(() => {
    const filteredCourses = courses.filter((course) => selectedCourses.includes(course.id || ""))
    const filteredGrades = grades.filter((grade) => selectedCourses.includes(grade.courseId))

    return calculateComparativeMetrics(filteredCourses, filteredGrades)
  }, [courses, grades, selectedCourses])

  if (selectedCourses.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparative Metrics</CardTitle>
          <CardDescription>Select at least two courses to compare metrics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <p className="text-muted-foreground">Select multiple courses to view comparisons</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparative Metrics</CardTitle>
        <CardDescription>Comparing performance across selected courses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
              <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <h3 className="font-medium">Highest Average</h3>
              {metrics.highestAverage ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {metrics.highestAverage.course.code} - {metrics.highestAverage.course.name}
                  </p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {metrics.highestAverage.average.toFixed(1)}%
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
              <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-300" />
            </div>
            <div>
              <h3 className="font-medium">Lowest Average</h3>
              {metrics.lowestAverage ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {metrics.lowestAverage.course.code} - {metrics.lowestAverage.course.name}
                  </p>
                  <p className="font-bold text-red-600 dark:text-red-400">
                    {metrics.lowestAverage.average.toFixed(1)}%
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="font-medium">Most Improved</h3>
              {metrics.mostImproved && metrics.mostImproved.improvement > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {metrics.mostImproved.course.code} - {metrics.mostImproved.course.name}
                  </p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    +{metrics.mostImproved.improvement.toFixed(1)}%
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No improvement detected</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
              <BarChart className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <h3 className="font-medium">Most Consistent</h3>
              {metrics.mostConsistent ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {metrics.mostConsistent.course.code} - {metrics.mostConsistent.course.name}
                  </p>
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    Std Dev: {metrics.mostConsistent.stdDev.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
