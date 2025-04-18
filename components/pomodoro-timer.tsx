"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface PomodoroSession {
  id?: string
  user_id: string
  duration: number
  task: string
  completed_at: string
  created_at?: string
}

export function PomodoroTimer() {
  const { toast } = useToast()
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [mode, setMode] = useState<"focus" | "short" | "long">("focus")
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [task, setTask] = useState("")
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Timer durations in seconds
  const durations = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    setSecondsLeft(durations[mode])
  }, [mode])

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((seconds) => {
          if (seconds <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout)
            setIsActive(false)
            setIsPaused(false)

            // Log completed session if it was a focus session
            if (mode === "focus") {
              logSession()
            }

            // Show notification
            toast({
              title: "Timer Complete!",
              description: mode === "focus" ? "Great job! Take a break." : "Break is over. Ready to focus?",
            })

            return durations[mode]
          }
          return seconds - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, mode])

  async function fetchSessions() {
    try {
      setIsLoading(true)
      const { data: user } = await supabase.auth.getUser()

      if (!user.user) {
        return
      }

      const { data, error } = await supabase
        .from("pomodoro_sessions")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        throw error
      }

      setSessions(data || [])
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load your sessions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function logSession() {
    try {
      const { data: user } = await supabase.auth.getUser()

      if (!user.user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to log your sessions",
          variant: "destructive",
        })
        return
      }

      const sessionData: PomodoroSession = {
        user_id: user.user.id,
        duration: durations.focus - (isPaused ? secondsLeft : 0),
        task: task || "Focused work",
        completed_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("pomodoro_sessions").insert([sessionData])

      if (error) {
        throw error
      }

      toast({
        title: "Session Logged",
        description: "Your focus session has been saved",
      })

      // Refresh the sessions list
      fetchSessions()
    } catch (error) {
      console.error("Error logging session:", error)
      toast({
        title: "Error",
        description: "Failed to log your session",
        variant: "destructive",
      })
    }
  }

  function startTimer() {
    setIsActive(true)
    setIsPaused(false)
  }

  function pauseTimer() {
    setIsPaused(true)
  }

  function resumeTimer() {
    setIsPaused(false)
  }

  function resetTimer() {
    clearInterval(intervalRef.current as NodeJS.Timeout)
    setIsActive(false)
    setIsPaused(false)
    setSecondsLeft(durations[mode])
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  function getProgress() {
    return ((durations[mode] - secondsLeft) / durations[mode]) * 100
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="timer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pomodoro Timer</CardTitle>
              <CardDescription>Use the Pomodoro Technique to boost your productivity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Tabs
                  defaultValue="focus"
                  value={mode}
                  onValueChange={(v) => setMode(v as "focus" | "short" | "long")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="focus" disabled={isActive && !isPaused}>
                      Focus
                    </TabsTrigger>
                    <TabsTrigger value="short" disabled={isActive && !isPaused}>
                      Short Break
                    </TabsTrigger>
                    <TabsTrigger value="long" disabled={isActive && !isPaused}>
                      Long Break
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="text-6xl font-bold tabular-nums">{formatTime(secondsLeft)}</div>
                <Progress value={getProgress()} className="w-full h-2" />
              </div>

              <div className="space-y-2">
                <label htmlFor="task" className="text-sm font-medium">
                  What are you working on?
                </label>
                <input
                  id="task"
                  type="text"
                  placeholder="Enter your task..."
                  className="w-full px-3 py-2 border rounded-md"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  disabled={isActive && !isPaused}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center space-x-4">
              {!isActive && !isPaused ? (
                <Button onClick={startTimer}>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
              ) : isPaused ? (
                <>
                  <Button onClick={resumeTimer}>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                  <Button variant="outline" onClick={resetTimer}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={pauseTimer}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                  <Button variant="outline" onClick={resetTimer}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>View your recent Pomodoro sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sessions recorded yet. Complete a focus session to see it here.
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{session.task}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.completed_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>{Math.round(session.duration / 60)} minutes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
