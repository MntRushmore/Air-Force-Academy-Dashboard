"use client"

import { useState, useEffect } from "react"
import { db, type Course, type Grade } from "@/lib/db"
import { GradeComparisonFilters } from "@/components/grade-comparison/filters"
import { GradeComparisonBarChart } from "@/components/grade-comparison/bar-chart"
import { GradeComparisonLineChart } from "@/components/grade-comparison/line-chart"
import { GradeComparisonPieChart } from "@/components/grade-comparison/pie-chart"
import { CourseDetails } from "@/components/grade-comparison/course-details"
import { ComparativeMetrics } from "@/components/grade-comparison/comparative-metrics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function GradeComparisonPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [timeframe, setTimeframe] = useState<string>("semester")
  const [chartType, setChartType] = useState<string>("bar")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("visualization")

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const allCourses = await db.courses.toArray()
        const allGrades = await db.grades.toArray()

        setCourses(allCourses)
        setGrades(allGrades)

        // Select all courses by default
        setSelectedCourses(allCourses.map((course) => course.id || "").filter(Boolean))
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Grade Comparison</h1>
        <p className="text-muted-foreground">Compare and analyze your academic performance across courses</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <>
          <GradeComparisonFilters
            courses={courses}
            selectedCourses={selectedCourses}
            setSelectedCourses={setSelectedCourses}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            chartType={chartType}
            setChartType={setChartType}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="details">Course Details</TabsTrigger>
            </TabsList>

            <TabsContent value="visualization" className="space-y-6">
              {chartType === "bar" && (
                <GradeComparisonBarChart
                  courses={courses}
                  grades={grades}
                  selectedCourses={selectedCourses}
                  timeframe={timeframe}
                />
              )}

              {chartType === "line" && (
                <GradeComparisonLineChart
                  courses={courses}
                  grades={grades}
                  selectedCourses={selectedCourses}
                  timeframe={timeframe}
                />
              )}

              {chartType === "pie" && (
                <GradeComparisonPieChart courses={courses} grades={grades} selectedCourses={selectedCourses} />
              )}

              <ComparativeMetrics courses={courses} grades={grades} selectedCourses={selectedCourses} />
            </TabsContent>

            <TabsContent value="details">
              <CourseDetails courses={courses} grades={grades} selectedCourses={selectedCourses} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
