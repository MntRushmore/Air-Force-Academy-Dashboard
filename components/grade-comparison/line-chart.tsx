"use client";

import { useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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

interface LineChartProps {
  courses: Course[];
  selectedCourses: string[];
  timeframe: string;
}

export function GradeComparisonLineChart({
  courses,
  selectedCourses,
  timeframe,
}: LineChartProps) {
  const chartData = useMemo(() => {
    // Filter to only selected courses with grades
    const filteredCourses = courses.filter(
      (course) => selectedCourses.includes(course.id) && course.grade !== null
    );

    // Group by semester/year
    const groupedData: Record<string, any> = {};

    filteredCourses.forEach((course) => {
      const period = `${course.year}-${course.semester}`;
      if (!groupedData[period]) {
        groupedData[period] = { period };
      }
      groupedData[period][course.id] = course.grade;
    });

    return Object.values(groupedData);
  }, [courses, selectedCourses]);

  // Create a mapping of course IDs to names and colors
  const courseInfo = useMemo(() => {
    const info: Record<string, { name: string; code: string; color: string }> =
      {};
    const colors = [
      "#2563eb",
      "#16a34a",
      "#dc2626",
      "#9333ea",
      "#ea580c",
      "#0891b2",
    ];

    courses.forEach((course, index) => {
      if (course.id && selectedCourses.includes(course.id)) {
        info[course.id] = {
          name: course.name,
          code: course.code,
          color: colors[index % colors.length],
        };
      }
    });

    return info;
  }, [courses, selectedCourses]);

  if (chartData.length === 0 || Object.keys(courseInfo).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grade Trends</CardTitle>
          <CardDescription>
            Select courses to view grade trends over time
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
            <XAxis
              dataKey="period"
              label={{
                value: "Time Period",
                position: "insideBottom",
                offset: -10,
              }}
            />
            <YAxis
              domain={[0, 100]}
              label={{
                value: "Grade (%)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)}%`, "Grade"]}
            />
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
  );
}
