"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getSupabaseClient } from "@/lib/supabase"
import { db } from "@/lib/db"

export function DataMigration() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "migrating" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Record<string, number>>({})

  const migrateData = async () => {
    if (!user) return

    setIsLoading(true)
    setStatus("migrating")
    setProgress(0)
    setError(null)

    const supabase = getSupabaseClient()
    const userId = user.id
    const migrationStats: Record<string, number> = {}

    try {
      // Migrate tasks
      const tasks = await db.tasks.toArray()
      setProgress(5)

      if (tasks.length > 0) {
        const { error } = await supabase.from("tasks").insert(
          tasks.map((task) => ({
            user_id: userId,
            title: task.title,
            description: task.description,
            due_date: task.dueDate,
            priority: task.priority,
            completed: task.completed,
            subject: task.subject,
          })),
        )
        if (error) throw new Error(`Error migrating tasks: ${error.message}`)
        migrationStats.tasks = tasks.length
      }
      setProgress(15)

      // Migrate events
      const events = await db.events.toArray()
      if (events.length > 0) {
        const { error } = await supabase.from("events").insert(
          events.map((event) => ({
            user_id: userId,
            title: event.title,
            date: event.date,
            start_time: event.startTime,
            end_time: event.endTime,
            type: event.type,
          })),
        )
        if (error) throw new Error(`Error migrating events: ${error.message}`)
        migrationStats.events = events.length
      }
      setProgress(25)

      // Migrate journal entries
      const journalEntries = await db.journalEntries.toArray()
      if (journalEntries.length > 0) {
        const { error } = await supabase.from("journal_entries").insert(
          journalEntries.map((entry) => ({
            user_id: userId,
            title: entry.title,
            content: entry.content,
            date: entry.date,
            category: entry.category,
            tags: entry.tags,
            mood: entry.mood,
          })),
        )
        if (error) throw new Error(`Error migrating journal entries: ${error.message}`)
        migrationStats.journal_entries = journalEntries.length
      }
      setProgress(35)

      // Migrate exercises
      const exercises = await db.exercises.toArray()
      if (exercises.length > 0) {
        const { error } = await supabase.from("exercises").insert(
          exercises.map((exercise) => ({
            user_id: userId,
            name: exercise.name,
            target: exercise.target,
            current: exercise.current,
            unit: exercise.unit,
          })),
        )
        if (error) throw new Error(`Error migrating exercises: ${error.message}`)
        migrationStats.exercises = exercises.length
      }
      setProgress(45)

      // Migrate goals
      const goals = await db.goals.toArray()
      if (goals.length > 0) {
        const { error } = await supabase.from("goals").insert(
          goals.map((goal) => ({
            user_id: userId,
            title: goal.title,
            category: goal.category,
            deadline: goal.deadline,
            progress: goal.progress,
            completed: goal.completed,
          })),
        )
        if (error) throw new Error(`Error migrating goals: ${error.message}`)
        migrationStats.goals = goals.length
      }
      setProgress(55)

      // Migrate courses
      const courses = await db.courses.toArray()
      if (courses.length > 0) {
        const { error: coursesError, data: insertedCourses } = await supabase
          .from("courses")
          .insert(
            courses.map((course) => ({
              user_id: userId,
              code: course.code,
              name: course.name,
              instructor: course.instructor,
              credits: course.credits,
              semester: course.semester,
              year: course.year,
              category: course.category,
              is_ap: course.isAP,
              notes: course.notes,
            })),
          )
          .select()

        if (coursesError) throw new Error(`Error migrating courses: ${coursesError.message}`)
        migrationStats.courses = courses.length

        // Create a mapping of old course IDs to new course IDs
        const courseIdMap = new Map()
        if (insertedCourses) {
          courses.forEach((oldCourse, index) => {
            if (oldCourse.id && insertedCourses[index]) {
              courseIdMap.set(oldCourse.id, insertedCourses[index].id)
            }
          })
        }

        // Migrate grades with the new course IDs
        const grades = await db.grades.toArray()
        if (grades.length > 0) {
          const { error: gradesError } = await supabase.from("grades").insert(
            grades
              .map((grade) => {
                const newCourseId = grade.courseId ? courseIdMap.get(grade.courseId) : null
                if (!newCourseId) return null

                return {
                  user_id: userId,
                  course_id: newCourseId,
                  title: grade.title,
                  type: grade.type,
                  score: grade.score,
                  max_score: grade.maxScore,
                  weight: grade.weight,
                  date: grade.date,
                  notes: grade.notes,
                }
              })
              .filter(Boolean),
          )

          if (gradesError) throw new Error(`Error migrating grades: ${gradesError.message}`)
          migrationStats.grades = grades.length
        }
      }
      setProgress(75)

      // Migrate settings
      const settings = await db.settings.toArray()
      if (settings.length > 0) {
        const { error } = await supabase.from("settings").insert(
          settings.map((setting) => ({
            user_id: userId,
            key: setting.key,
            value: setting.value,
          })),
        )
        if (error) throw new Error(`Error migrating settings: ${error.message}`)
        migrationStats.settings = settings.length
      }
      setProgress(100)

      setStats(migrationStats)
      setStatus("success")
    } catch (err) {
      console.error("Migration error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred during migration")
      setStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Migration</CardTitle>
        <CardDescription>Migrate your data from browser storage to secure cloud storage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" && (
          <div className="space-y-4">
            <p>
              Your data is currently stored in your browser. This means it's only available on this device and browser,
              and could be lost if you clear your browser data.
            </p>
            <p>Migrate your data to secure cloud storage to access it from any device and never lose your progress.</p>
          </div>
        )}

        {status === "migrating" && (
          <div className="space-y-4">
            <p>Migrating your data... Please don't close this page.</p>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-right">{progress}% complete</p>
          </div>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Migration Successful</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Your data has been successfully migrated to secure cloud storage.</p>
              <div className="text-sm space-y-1">
                {Object.entries(stats).map(([key, count]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace("_", " ")}:</span>
                    <span>{count} items</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Migration Failed</AlertTitle>
            <AlertDescription>
              <p>There was an error migrating your data: {error}</p>
              <p className="mt-2">Please try again or contact support if the problem persists.</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {status === "idle" && (
          <Button onClick={migrateData} disabled={isLoading || !user}>
            Start Migration <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {status === "success" && (
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Continue to Dashboard
          </Button>
        )}

        {status === "error" && (
          <Button onClick={migrateData} disabled={isLoading}>
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
