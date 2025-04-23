"use client";

import { useState } from "react";
import { GradeComparisonFilters } from "@/components/grade-comparison/filters";
import { GradeComparisonBarChart } from "@/components/grade-comparison/bar-chart";
import { GradeComparisonLineChart } from "@/components/grade-comparison/line-chart";
import { GradeComparisonPieChart } from "@/components/grade-comparison/pie-chart";
import { CourseDetails } from "@/components/grade-comparison/course-details";
import { ComparativeMetrics } from "@/components/grade-comparison/comparative-metrics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/lib/api/grades";
import { useToast } from "@/hooks/use-toast";

export default function GradeComparisonPage() {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState<string>("semester");
  const [chartType, setChartType] = useState<string>("bar");
  const [activeTab, setActiveTab] = useState("visualization");
  const { toast } = useToast();

  // Fetch courses using React Query
  const {
    data: courses = [],
    isLoading: coursesLoading,
    error: coursesError,
  } = useCourses();

  // Handle loading state
  const isLoading = coursesLoading;

  // Handle errors
  if (coursesError) {
    toast({
      title: "Error",
      description: "Failed to load data. Please try again later.",
      variant: "destructive",
    });
  }

  // Set initial selected courses
  if (courses.length > 0 && selectedCourses.length === 0) {
    setSelectedCourses(courses.map((course) => course.id));
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Grade Comparison</h1>
        <p className="text-muted-foreground">
          Compare and analyze your academic performance across courses
        </p>
      </div>

      {isLoading ? (
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
                  selectedCourses={selectedCourses}
                  timeframe={timeframe}
                />
              )}

              {chartType === "line" && (
                <GradeComparisonLineChart
                  courses={courses}
                  selectedCourses={selectedCourses}
                  timeframe={timeframe}
                />
              )}

              {chartType === "pie" && (
                <GradeComparisonPieChart
                  courses={courses}
                  selectedCourses={selectedCourses}
                />
              )}

              <ComparativeMetrics
                courses={courses}
                selectedCourses={selectedCourses}
              />
            </TabsContent>

            <TabsContent value="details">
              <CourseDetails
                courses={courses}
                selectedCourses={selectedCourses}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
