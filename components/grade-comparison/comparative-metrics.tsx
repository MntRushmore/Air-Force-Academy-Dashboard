"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Course } from "@/lib/types";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BarChart,
} from "lucide-react";

interface ComparativeMetricsProps {
  courses: Course[];
  selectedCourses: string[];
}

export function ComparativeMetrics({
  courses,
  selectedCourses,
}: ComparativeMetricsProps) {
  const metrics = useMemo(() => {
    // Filter to only selected courses with grades
    const filteredCourses = courses.filter(
      (course) => selectedCourses.includes(course.id) && course.grade !== null
    );

    if (filteredCourses.length === 0) {
      return {
        highestGrade: { courseId: "", grade: 0 },
        lowestGrade: { courseId: "", grade: 0 },
        improvingCourses: [],
        needsAttentionCourses: [],
      };
    }

    // Find highest and lowest grades
    const highestGrade = filteredCourses.reduce(
      (max, course) =>
        (course.grade || 0) > (max.grade || 0)
          ? { courseId: course.id, grade: course.grade || 0 }
          : max,
      { courseId: "", grade: 0 }
    );

    const lowestGrade = filteredCourses.reduce(
      (min, course) =>
        (course.grade || 100) < (min.grade || 100)
          ? { courseId: course.id, grade: course.grade || 0 }
          : min,
      { courseId: "", grade: 100 }
    );

    // Find courses needing attention (below 70%)
    const needsAttentionCourses = filteredCourses
      .filter((course) => (course.grade || 0) < 70)
      .map((course) => course.id);

    // Find improving courses (above average)
    const averageGrade =
      filteredCourses.reduce((sum, course) => sum + (course.grade || 0), 0) /
      filteredCourses.length;
    const improvingCourses = filteredCourses
      .filter((course) => (course.grade || 0) > averageGrade)
      .map((course) => course.id);

    return {
      highestGrade,
      lowestGrade,
      improvingCourses,
      needsAttentionCourses,
    };
  }, [courses, selectedCourses]);

  if (selectedCourses.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparative Metrics</CardTitle>
          <CardDescription>
            Select at least two courses to compare metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <p className="text-muted-foreground">
            Select multiple courses to view comparisons
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find course names for the metrics
  const getCourseInfo = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course
      ? { code: course.code, name: course.name }
      : { code: "Unknown", name: "Course" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparative Metrics</CardTitle>
        <CardDescription>
          Comparing performance across selected courses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
              <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <h3 className="font-medium">Highest Grade</h3>
              {metrics.highestGrade.courseId ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {getCourseInfo(metrics.highestGrade.courseId).code} -{" "}
                    {getCourseInfo(metrics.highestGrade.courseId).name}
                  </p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {metrics.highestGrade.grade.toFixed(1)}%
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No data available
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
              <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-300" />
            </div>
            <div>
              <h3 className="font-medium">Lowest Grade</h3>
              {metrics.lowestGrade.courseId ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {getCourseInfo(metrics.lowestGrade.courseId).code} -{" "}
                    {getCourseInfo(metrics.lowestGrade.courseId).name}
                  </p>
                  <p className="font-bold text-red-600 dark:text-red-400">
                    {metrics.lowestGrade.grade.toFixed(1)}%
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No data available
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="font-medium">Above Average</h3>
              {metrics.improvingCourses.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {metrics.improvingCourses
                      .map((courseId) => getCourseInfo(courseId).code)
                      .join(", ")}
                  </p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    Performing well
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No courses above average
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
              <BarChart className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <h3 className="font-medium">Needs Attention</h3>
              {metrics.needsAttentionCourses.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {metrics.needsAttentionCourses
                      .map((courseId) => getCourseInfo(courseId).code)
                      .join(", ")}
                  </p>
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    Below 70%
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All courses above 70%
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
