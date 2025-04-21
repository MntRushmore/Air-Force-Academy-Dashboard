"use client"

import { useState } from "react"
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  Download,
  Dumbbell,
  GraduationCap,
  LineChart,
  Medal,
  Target,
  Trophy,
  Users,
  CheckCircle,
  Clock,
  Circle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProgressPage() {
  const [timeframe, setTimeframe] = useState("6months")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Progress Visualizations</h1>
        <p className="text-muted-foreground">Track your improvement and achievements over time</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Timeframe:</span>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="leadership">Leadership</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">GPA Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.85</div>
                <div className="mt-1 flex items-center text-sm text-green-600 dark:text-green-400">
                  <LineChart className="mr-1 h-4 w-4" />
                  <span>+0.2 from last semester</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fitness Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87/100</div>
                <div className="mt-1 flex items-center text-sm text-green-600 dark:text-green-400">
                  <LineChart className="mr-1 h-4 w-4" />
                  <span>+12 from initial assessment</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Goals Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <Target className="mr-1 h-4 w-4" />
                  <span>8 in progress</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Application Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">65%</div>
                <div className="mt-1 flex items-center text-sm text-amber-600 dark:text-amber-400">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>On track for deadlines</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Progress Summary</CardTitle>
              <CardDescription>Your improvement across all areas</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="flex flex-col items-center text-center text-muted-foreground">
                <BarChart3 className="h-16 w-16 mb-4" />
                <p>Progress chart visualization will appear here</p>
                <p className="text-sm">Showing data for the selected timeframe</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">SAT Score Milestone</div>
                    <div className="text-sm text-muted-foreground">Achieved target score of 1450+</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <Medal className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Diving Competition</div>
                    <div className="text-sm text-muted-foreground">2nd place in regional championship</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Student Council</div>
                    <div className="text-sm text-muted-foreground">Elected as Vice President</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">AP Physics</div>
                    <div className="text-sm text-muted-foreground">Achieved 5/5 score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Areas</CardTitle>
                <CardDescription>Areas with most improvement</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <LineChart className="h-16 w-16 mb-4" />
                  <p>Growth chart visualization will appear here</p>
                  <p className="text-sm">Showing your most improved areas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GPA Trend</CardTitle>
              <CardDescription>Your academic performance over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="flex flex-col items-center text-center text-muted-foreground">
                <LineChart className="h-16 w-16 mb-4" />
                <p>GPA trend chart visualization will appear here</p>
                <p className="text-sm">Showing GPA changes over selected timeframe</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Breakdown by academic subject</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mb-4" />
                  <p>Subject performance chart will appear here</p>
                  <p className="text-sm">Comparing grades across different subjects</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Scores</CardTitle>
                <CardDescription>SAT, ACT, and AP exam results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">SAT</div>
                    <div className="text-sm text-muted-foreground">1480 (Math: 760, Verbal: 720)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">ACT</div>
                    <div className="text-sm text-muted-foreground">
                      32 (Math: 34, Science: 33, English: 31, Reading: 30)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">AP Calculus BC</div>
                    <div className="text-sm text-muted-foreground">Score: 5/5</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">AP Physics C</div>
                    <div className="text-sm text-muted-foreground">Score: 5/5</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">AP English Language</div>
                    <div className="text-sm text-muted-foreground">Score: 4/5</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Academic Goals</CardTitle>
              <CardDescription>Progress toward your academic objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Maintain 3.8+ GPA</div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">Achieved</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Current: 3.85 GPA</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">SAT Score 1450+</div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">Achieved</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Score: 1480</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                  <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Complete 5 AP Courses</div>
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">In Progress</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Completed: 3/5</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Science Fair Project</div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Planned</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Due: Spring Semester</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Academic Goals
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="fitness" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CFA Performance</CardTitle>
                <CardDescription>Candidate Fitness Assessment progress</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <LineChart className="h-16 w-16 mb-4" />
                  <p>CFA performance chart will appear here</p>
                  <p className="text-sm">Tracking improvement in each CFA component</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diving Progress</CardTitle>
                <CardDescription>Performance in diving competitions and training</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <LineChart className="h-16 w-16 mb-4" />
                  <p>Diving progress chart will appear here</p>
                  <p className="text-sm">Tracking scores and skill development</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Water Polo Statistics</CardTitle>
              <CardDescription>Performance metrics from games and practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Games Played</div>
                  <div className="text-2xl font-bold">24</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Goals Scored</div>
                  <div className="text-2xl font-bold">18</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Assists</div>
                  <div className="text-2xl font-bold">12</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Steals</div>
                  <div className="text-2xl font-bold">15</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Blocks</div>
                  <div className="text-2xl font-bold">7</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Minutes Played</div>
                  <div className="text-2xl font-bold">320</div>
                </div>
              </div>

              <div className="h-60 flex items-center justify-center">
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mb-4" />
                  <p>Water polo performance chart will appear here</p>
                  <p className="text-sm">Comparing statistics across games</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fitness Achievements</CardTitle>
              <CardDescription>Notable milestones in your physical training</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Dumbbell className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">1-Mile Run Time</div>
                    <div className="text-sm font-medium">6:12 → 5:45</div>
                  </div>
                  <div className="text-sm text-muted-foreground">27 second improvement</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Dumbbell className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Push-ups (2 min)</div>
                    <div className="text-sm font-medium">42 → 58</div>
                  </div>
                  <div className="text-sm text-muted-foreground">16 rep improvement</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Regional Diving Competition</div>
                    <div className="text-sm font-medium">2nd Place</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Score: 432.65</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Water Polo Tournament</div>
                    <div className="text-sm font-medium">League Champions</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Team MVP Award</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Fitness Achievements
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="leadership" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leadership Positions</CardTitle>
              <CardDescription>Roles and responsibilities over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Student Council</div>
                    <div className="text-sm font-medium">Vice President</div>
                  </div>
                  <div className="text-sm text-muted-foreground">2023 - Present</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Water Polo Team</div>
                    <div className="text-sm font-medium">Team Captain</div>
                  </div>
                  <div className="text-sm text-muted-foreground">2022 - Present</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                  <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Science Club</div>
                    <div className="text-sm font-medium">Treasurer</div>
                  </div>
                  <div className="text-sm text-muted-foreground">2021 - 2022</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Community Service Club</div>
                    <div className="text-sm font-medium">Project Coordinator</div>
                  </div>
                  <div className="text-sm text-muted-foreground">2022 - Present</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Awards & Recognition</CardTitle>
              <CardDescription>Honors and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Principal's Leadership Award</div>
                    <div className="text-sm font-medium">2023</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Recognition for outstanding leadership</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Community Service Medal</div>
                    <div className="text-sm font-medium">2022</div>
                  </div>
                  <div className="text-sm text-muted-foreground">100+ hours of community service</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                  <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Academic Excellence Award</div>
                    <div className="text-sm font-medium">2023</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Top 5% of class</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Water Polo MVP</div>
                    <div className="text-sm font-medium">2022</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Team and coach selection</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Awards
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Service</CardTitle>
              <CardDescription>Volunteer hours and impact</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="flex flex-col items-center text-center text-muted-foreground">
                <BarChart3 className="h-16 w-16 mb-4" />
                <p>Community service chart will appear here</p>
                <p className="text-sm">Tracking volunteer hours by organization</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>USAFA Application Status</CardTitle>
              <CardDescription>Progress toward application completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Preliminary Application</div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">Completed</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Submitted on October 5, 2023</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">SAT/ACT Scores</div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">Completed</div>
                  </div>
                  <div className="text-sm text-muted-foreground">SAT: 1480, ACT: 32</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Congressional Nomination</div>
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">In Progress</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Application submitted, interview scheduled</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Fitness Assessment</div>
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">In Progress</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Training for official CFA test</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Circle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Medical Examination</div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Scheduled</div>
                  </div>
                  <div className="text-sm text-muted-foreground">DoDMERB exam on December 10, 2023</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Circle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Final Application</div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Not Started</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Due by January 31, 2024</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
                <CardDescription>Key dates and deadlines</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <Calendar className="h-16 w-16 mb-4" />
                  <p>Application timeline visualization will appear here</p>
                  <p className="text-sm">Showing upcoming deadlines and completed milestones</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendation Letters</CardTitle>
                <CardDescription>Status of recommendation requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Math Teacher - Mr. Johnson</div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">Submitted</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Received on October 20, 2023</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Coach Williams - Water Polo</div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">Submitted</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Received on October 25, 2023</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Principal Dr. Martinez</div>
                      <div className="text-sm font-medium text-amber-600 dark:text-amber-400">In Progress</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Requested on October 15, 2023</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Essay Progress</CardTitle>
              <CardDescription>Status of application essays</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Personal Statement</div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">Completed</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Final draft reviewed and approved</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Why USAFA Essay</div>
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">In Progress</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Second draft in review</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Leadership Experience</div>
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">In Progress</div>
                  </div>
                  <div className="text-sm text-muted-foreground">First draft completed</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Circle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Extracurricular Activities</div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Not Started</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Outline created</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Essay Drafts
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
