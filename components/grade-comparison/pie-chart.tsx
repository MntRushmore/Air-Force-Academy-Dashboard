"use client";

import { useMemo } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Course } from "@/lib/types";

interface PieChartProps {
  courses: Course[];
  selectedCourses: string[];
}

export function GradeComparisonPieChart({
  courses,
  selectedCourses,
}: PieChartProps) {
  const chartData = useMemo(() => {
    // Filter courses to only selected ones with grades
    const filteredCourses = courses.filter(
      (course) => selectedCourses.includes(course.id) && course.grade !== null
    );

    // Group grades into ranges
    const gradeRanges = {
      "A (90-100)": 0,
      "B (80-89)": 0,
      "C (70-79)": 0,
      "D (60-69)": 0,
      "F (0-59)": 0,
    };

    filteredCourses.forEach((course) => {
      const grade = course.grade || 0;
      if (grade >= 90) gradeRanges["A (90-100)"]++;
      else if (grade >= 80) gradeRanges["B (80-89)"]++;
      else if (grade >= 70) gradeRanges["C (70-79)"]++;
      else if (grade >= 60) gradeRanges["D (60-69)"]++;
      else gradeRanges["F (0-59)"]++;
    });

    // Convert to array format for pie chart
    return Object.entries(gradeRanges)
      .filter(([_, count]) => count > 0)
      .map(([range, count]) => ({
        name: range,
        value: count,
        color: getGradeRangeColor(range),
      }));
  }, [courses, selectedCourses]);

  // Helper function to get color for grade range
  function getGradeRangeColor(range: string): string {
    switch (range) {
      case "A (90-100)":
        return "#22c55e"; // green-500
      case "B (80-89)":
        return "#3b82f6"; // blue-500
      case "C (70-79)":
        return "#f59e0b"; // amber-500
      case "D (60-69)":
        return "#ef4444"; // red-500
      default:
        return "#6b7280"; // gray-500
    }
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>
            Distribution of grades across selected courses
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
        <CardDescription>
          Distribution of grades across selected courses
        </CardDescription>
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
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
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
  );
}
