"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { Course } from "@/lib/types";

interface BarChartProps {
  courses: Course[];
  selectedCourses: string[];
  timeframe: string;
}

export function GradeComparisonBarChart({
  courses,
  selectedCourses,
  timeframe,
}: BarChartProps) {
  // Filter courses based on selection
  const filteredCourses = courses.filter((course) =>
    selectedCourses.includes(course.id)
  );

  // Prepare data for chart
  const chartData = filteredCourses
    .filter((course) => course.grade !== null)
    .map((course) => ({
      name: course.code,
      grade: course.grade,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="grade" name="Course Grade" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
