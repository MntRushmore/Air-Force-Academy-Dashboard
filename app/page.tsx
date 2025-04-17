import { Suspense } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  GraduationCap,
  LineChart,
  Target,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GPACalculator } from "@/components/gpa-calculator"
import { GoalTracker } from "@/components/goal-tracker"
import { QuoteGenerator } from "@/components/quote-generator"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { XPProgress } from "@/components/xp-progress"
import { DailyLog } from "@/components/daily-log"
import { WeeklyFocus } from "@/components/weekly-focus"

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Track your USAFA application progress and goals.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3.85</div>
            <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>+0.1 from last semester</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fitness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87/100</div>
            <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>+5 from last assessment</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">XP Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Level 12</div>
            <div className="mt-2 flex items-center text-sm">
              <Progress value={65} className="h-2 w-full" />
              <span className="ml-2 text-xs">65%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14 days</div>
            <div className="mt-2 flex items-center text-sm text-amber-600 dark:text-amber-400">
              <Flame className="mr-1 h-4 w-4" />
              <span>Keep it up!</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
                <CardDescription>Your USAFA application journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">SAT/ACT Exams</span>
                    </div>
                    <span className="text-sm font-medium text-green-500">Completed</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Congressional Nomination</span>
                    </div>
                    <span className="text-sm font-medium">In Progress</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                      <span className="text-sm">Fitness Assessment</span>
                    </div>
                    <span className="text-sm font-medium">In Progress</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                      <span className="text-sm">Medical Examination</span>
                    </div>
                    <span className="text-sm font-medium">Scheduled</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/timeline">
                    View Full Timeline <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Inspiration</CardTitle>
                <CardDescription>Quote of the day</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading quote...</div>}>
                  <QuoteGenerator />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>XP Progress</CardTitle>
                <CardDescription>Your gamification journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Suspense fallback={<div>Loading XP progress...</div>}>
                  <XPProgress />
                </Suspense>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">5 badges earned</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/progress">View All</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Weekly Focus</CardTitle>
                <CardDescription>Your priority areas this week</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading weekly focus...</div>}>
                  <WeeklyFocus />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Daily Log</CardTitle>
                <CardDescription>Track your daily activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading daily log...</div>}>
                  <DailyLog />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>GPA Calculator</CardTitle>
                <CardDescription>Calculate your current and target GPA</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading GPA calculator...</div>}>
                  <GPACalculator />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Resources</CardTitle>
                <CardDescription>Recommended learning materials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <div className="space-y-0.5">
                    <div className="font-medium">SAT/ACT Prep Materials</div>
                    <div className="text-sm text-muted-foreground">Official practice tests and guides</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <div className="space-y-0.5">
                    <div className="font-medium">STEM Resources</div>
                    <div className="text-sm text-muted-foreground">Math and science study materials</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  <div className="space-y-0.5">
                    <div className="font-medium">Essay Writing Guide</div>
                    <div className="text-sm text-muted-foreground">Tips for personal statements</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Browse All Resources
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Progress</CardTitle>
                <CardDescription>Subject performance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mathematics</span>
                    <span className="text-sm font-medium">A (95%)</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Physics</span>
                    <span className="text-sm font-medium">A- (92%)</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">English</span>
                    <span className="text-sm font-medium">B+ (88%)</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">History</span>
                    <span className="text-sm font-medium">A (94%)</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Detailed Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Tracker</CardTitle>
              <CardDescription>Track your short and long-term goals</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading goal tracker...</div>}>
                <GoalTracker />
              </Suspense>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vision Board</CardTitle>
                <CardDescription>Visualize your aspirations</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-2 flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 p-2 flex items-center justify-center">
                  <Target className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="aspect-square rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 p-2 flex items-center justify-center">
                  <Dumbbell className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="aspect-square rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 p-2 flex items-center justify-center">
                  <Award className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Customize Vision Board
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievement Badges</CardTitle>
                <CardDescription>Rewards for your accomplishments</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                    <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs text-center">Academic Excellence</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2">
                    <Flame className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs text-center">30-Day Streak</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-2">
                    <Dumbbell className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs text-center">Fitness Star</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-900 p-2">
                    <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs text-center">Goal Crusher</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-2">
                    <Clock className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-xs text-center">Time Master</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-2 opacity-50">
                    <LineChart className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-xs text-center opacity-50">Progress Pro</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Badges
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pomodoro Timer</CardTitle>
                <CardDescription>Focus with timed work sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading pomodoro timer...</div>}>
                  <PomodoroTimer />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your planned activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Physics Study Session</div>
                    <div className="text-sm text-muted-foreground">8:00 AM - 10:00 AM</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <Dumbbell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Fitness Training</div>
                    <div className="text-sm text-muted-foreground">11:00 AM - 12:30 PM</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Mentor Meeting</div>
                    <div className="text-sm text-muted-foreground">2:00 PM - 3:00 PM</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Essay Writing</div>
                    <div className="text-sm text-muted-foreground">4:00 PM - 6:00 PM</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/study">View Full Schedule</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
