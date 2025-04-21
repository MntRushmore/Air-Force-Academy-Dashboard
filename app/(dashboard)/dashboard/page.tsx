"use client";

import { CardFooter } from "@/components/ui/card";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Dumbbell,
  Flame,
  Target,
  TrendingUp,
  Plane,
  Shield,
  Flag,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { calculateGPA } from "@/lib/grade-analysis";

// Add imports for fitness and application utilities
import { calculateCFAScore } from "@/lib/fitness-utils";
import { calculateApplicationProgress } from "@/lib/application-utils";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const courses = useLiveQuery(() => db.courses.toArray(), []) || [];
  const grades = useLiveQuery(() => db.grades.toArray(), []) || [];

  // Calculate GPA using the unified function
  const currentGPA = calculateGPA(courses, grades);

  // Calculate fitness score (placeholder for now)
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) || [];
  const goals = useLiveQuery(() => db.goals.toArray(), []) || [];
  const [gender, setGender] = useState<"male" | "female">("male");
  const [applicationProgress, setApplicationProgress] = useState(0);

  // Calculate fitness score
  const fitnessScore = calculateCFAScore(exercises, gender);

  // Use effect to get gender preference from settings
  useEffect(() => {
    const getGenderPreference = async () => {
      const genderPref = await db.settings
        .where("key")
        .equals("gender")
        .first();
      if (genderPref) {
        setGender(genderPref.value);
      }
    };

    getGenderPreference();
  }, []);

  // Use effect to get application progress from settings
  useEffect(() => {
    const getApplicationProgress = async () => {
      const progress = await db.settings
        .where("key")
        .equals("applicationProgress")
        .first();
      if (progress) {
        setApplicationProgress(progress.value);
      } else {
        // Calculate if not found in settings
        const { overall } = calculateApplicationProgress(
          goals,
          exercises,
          gender,
          currentGPA
        );
        setApplicationProgress(overall);
      }
    };

    getApplicationProgress();
  }, [goals, exercises, gender, currentGPA]);

  // Calculate XP level (placeholder for now)
  const xpLevel = 1;
  const xpProgress = 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          USAFA Application Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your journey to the United States Air Force Academy
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentGPA.toFixed(2)}</div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>
                {courses.length > 0
                  ? `Based on ${courses.length} courses`
                  : "Add courses to calculate"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fitness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fitnessScore}/100</div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>Track your CFA progress</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">XP Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Level {xpLevel}</div>
            <div className="mt-2 flex items-center text-sm">
              <Progress value={xpProgress} className="h-2 w-full bg-white/20" />
              <span className="ml-2 text-xs">{xpProgress}%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Application Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applicationProgress}%</div>
            <div className="mt-2 flex items-center text-sm">
              <Flame className="mr-1 h-4 w-4" />
              <span>Get started!</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="usafa">USAFA Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
                <CardDescription>
                  Your USAFA application journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                      <span className="text-sm">SAT/ACT Exams</span>
                    </div>
                    <span className="text-sm font-medium text-slate-500">
                      Not Started
                    </span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                      <span className="text-sm">Congressional Nomination</span>
                    </div>
                    <span className="text-sm font-medium">Not Started</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                      <span className="text-sm">Fitness Assessment</span>
                    </div>
                    <span className="text-sm font-medium">Not Started</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                      <span className="text-sm">Medical Examination</span>
                    </div>
                    <span className="text-sm font-medium">Not Started</span>
                  </div>
                  <Progress value={0} className="h-2" />
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
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-[#0033a0] p-3">
                    <Plane className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-lg italic">
                    "Integrity first, service before self, excellence in all we
                    do."
                  </p>
                  <p className="text-sm text-muted-foreground">
                    — USAFA Core Values
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>Begin your USAFA journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0033a0]">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Add Your Courses</div>
                    <div className="text-sm text-muted-foreground">
                      Track your academic progress
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0033a0]">
                    <Dumbbell className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Track Fitness</div>
                    <div className="text-sm text-muted-foreground">
                      Prepare for the CFA
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0033a0]">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Set Goals</div>
                    <div className="text-sm text-muted-foreground">
                      Define your objectives
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/courses">
                    Go to Courses <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Progress</CardTitle>
              <CardDescription>Track your courses and GPA</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-12 w-12 text-[#0033a0] mb-4" />
              <h3 className="text-lg font-medium">No courses added yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your courses to track your academic progress
              </p>
              <Button className="mt-4" asChild>
                <Link href="/courses">
                  <Plus className="mr-2 h-4 w-4" /> Add Courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>USAFA Application Goals</CardTitle>
              <CardDescription>
                Track your progress toward key milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="h-12 w-12 text-[#0033a0] mb-4" />
              <h3 className="text-lg font-medium">No goals set yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Define your goals to track your progress
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Goals
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usafa" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>About USAFA</CardTitle>
                <CardDescription>
                  United States Air Force Academy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-[#0033a0] p-4">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                </div>
                <p className="text-sm">
                  The United States Air Force Academy (USAFA) is a prestigious
                  military academy that trains cadets to become officers in the
                  United States Air Force and Space Force. Located in Colorado
                  Springs, Colorado, USAFA offers a rigorous four-year program
                  that combines academic excellence, military training, and
                  athletic development.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Founded</div>
                    <div className="text-sm">1954</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-sm">Colorado Springs, CO</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Enrollment</div>
                    <div className="text-sm">~4,000 cadets</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Acceptance Rate</div>
                    <div className="text-sm">~10%</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.open("https://www.usafa.edu/", "_blank")
                  }
                >
                  Visit Official Website <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Requirements</CardTitle>
                <CardDescription>Key components for admission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0033a0]">
                    <Flag className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Congressional Nomination</div>
                    <div className="text-sm text-muted-foreground">
                      Required from your representative
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0033a0]">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Academic Excellence</div>
                    <div className="text-sm text-muted-foreground">
                      Strong GPA and test scores
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0033a0]">
                    <Dumbbell className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">
                      Candidate Fitness Assessment
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Physical fitness evaluation
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0033a0]">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Leadership Experience</div>
                    <div className="text-sm text-muted-foreground">
                      Demonstrated leadership abilities
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.open("https://www.usafa.edu/admissions/", "_blank")
                  }
                >
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
