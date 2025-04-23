"use client";

import { useState } from "react";
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  BarChart,
  PieChart,
  MultiLineChart,
  StackedBarChart,
} from "@/components/analytics/charts";
import {
  useAcademicMetrics,
  useFitnessMetrics,
  useApplicationProgress,
  useStudyTimeDistribution,
  useGradeTrends,
  useFitnessProgress,
  useTaskCompletionRates,
  usePomodoroStats,
  type StudyTimeDistribution,
  type GradeTrend,
  type FitnessProgress,
  type TaskCompletion,
  type PomodoroStats,
} from "@/lib/hooks/use-analytics";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("month");

  // Fetch data using our hooks
  const { data: academicMetrics, isLoading: loadingAcademic } =
    useAcademicMetrics(dateRange);
  const { data: fitnessMetrics, isLoading: loadingFitness } =
    useFitnessMetrics(dateRange);
  const { data: applicationProgress, isLoading: loadingApplication } =
    useApplicationProgress(dateRange);
  const { data: studyDistribution, isLoading: loadingStudy } =
    useStudyTimeDistribution(dateRange);
  const { data: gradeTrends, isLoading: loadingGrades } =
    useGradeTrends(dateRange);
  const { data: fitnessProgress, isLoading: loadingFitnessProgress } =
    useFitnessProgress(dateRange);
  const { data: taskCompletion, isLoading: loadingTasks } =
    useTaskCompletionRates(dateRange);
  const { data: pomodoroStats, isLoading: loadingPomodoro } =
    usePomodoroStats(dateRange);

  console.log({ academicMetrics });
  // Transform data for charts
  const studyChartData =
    studyDistribution?.map((item: StudyTimeDistribution) => ({
      name: item.subject,
      value: item.hours,
    })) || [];

  const gradeChartData =
    gradeTrends?.map((item: GradeTrend) => ({
      date: item.date,
      value: item.average,
    })) || [];

  const fitnessChartData = (
    Object.values(fitnessProgress || {}) as FitnessProgress[]
  ).map((item: FitnessProgress) => ({
    date: item.date,
    pushups: item.pushups,
    situps: item.situps,
    pullups: item.pullups,
    crunches: item.crunches,
    basketball: item.basketball,
    "shuttle run": item.shuttle_run,
    "mile run": item.mile_run,
  }));

  const taskChartData = (
    Object.values(taskCompletion || {}) as TaskCompletion[]
  ).map((item: TaskCompletion) => ({
    date: item.date,
    value: item.rate,
  }));

  const pomodoroChartData = (
    Object.values(pomodoroStats || {}) as PomodoroStats[]
  ).map((item: PomodoroStats) => ({
    date: item.date,
    sessions: item.sessions,
    minutes: item.totalMinutes,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your progress and performance
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Tabs
          value={dateRange}
          onValueChange={setDateRange}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button variant="outline" size="sm">
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Academic Performance
            </CardTitle>
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {academicMetrics?.currentGPA?.toFixed(2) ?? "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {academicMetrics?.currentGPA && academicMetrics?.previousGPA
                ? `${
                    academicMetrics.currentGPA > academicMetrics.previousGPA
                      ? "+"
                      : ""
                  }${(
                    academicMetrics.currentGPA - academicMetrics.previousGPA
                  ).toFixed(2)}`
                : "0.00"}{" "}
              from last semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fitness Progress
            </CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fitnessMetrics?.currentScore ?? 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {fitnessMetrics?.currentScore && fitnessMetrics?.previousScore
                ? `${
                    fitnessMetrics.currentScore > fitnessMetrics.previousScore
                      ? "+"
                      : ""
                  }${
                    fitnessMetrics.currentScore - fitnessMetrics.previousScore
                  }`
                : "0"}{" "}
              from last assessment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Application Progress
            </CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applicationProgress?.percentageComplete?.toFixed(0) ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {applicationProgress?.percentageComplete &&
              applicationProgress?.previousPercentage
                ? `${
                    applicationProgress.percentageComplete >
                    applicationProgress.previousPercentage
                      ? "+"
                      : ""
                  }${(
                    applicationProgress.percentageComplete -
                    applicationProgress.previousPercentage
                  ).toFixed(0)}`
                : "0"}
              % from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Study Time Distribution</CardTitle>
            <CardDescription>Hours spent on different subjects</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <PieChart data={studyChartData} loading={loadingStudy} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Grade Trends</CardTitle>
            <CardDescription>Performance over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <LineChart data={gradeChartData} loading={loadingGrades} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fitness Metrics</CardTitle>
          <CardDescription>
            Track your physical fitness progress
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <MultiLineChart
            data={fitnessChartData}
            loading={loadingFitnessProgress}
            lines={[
              "pushups",
              "situps",
              "pullups",
              "crunches",
              "basketball",
              "shuttle run",
              "mile run",
            ]}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate</CardTitle>
            <CardDescription>
              Percentage of tasks completed on time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <LineChart data={taskChartData} loading={loadingTasks} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pomodoro Sessions</CardTitle>
            <CardDescription>Focus time analysis</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <StackedBarChart
              data={pomodoroChartData}
              loading={loadingPomodoro}
              bars={["sessions", "minutes"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
