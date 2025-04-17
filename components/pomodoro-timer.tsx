"use client"

import { useEffect, useState } from "react"
import { Pause, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TimerMode = "focus" | "shortBreak" | "longBreak"

const TIMER_SETTINGS = {
  focus: 25 * 60, // 25 minutes in seconds
  shortBreak: 5 * 60, // 5 minutes in seconds
  longBreak: 15 * 60, // 15 minutes in seconds
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeLeft, setTimeLeft] = useState(TIMER_SETTINGS[mode])
  const [isActive, setIsActive] = useState(false)
  const [sessions, setSessions] = useState(0)

  useEffect(() => {
    setTimeLeft(TIMER_SETTINGS[mode])
    setIsActive(false)
  }, [mode])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      setIsActive(false)
      if (mode === "focus") {
        setSessions(sessions + 1)
        setMode(sessions % 4 === 3 ? "longBreak" : "shortBreak")
      } else {
        setMode("focus")
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode, sessions])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(TIMER_SETTINGS[mode])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateProgress = () => {
    return ((TIMER_SETTINGS[mode] - timeLeft) / TIMER_SETTINGS[mode]) * 100
  }

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(value) => setMode(value as TimerMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="focus">Focus</TabsTrigger>
          <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
          <TabsTrigger value="longBreak">Long Break</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-6xl font-bold">{formatTime(timeLeft)}</div>
            <Progress value={calculateProgress()} className="h-2 w-full" />
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={toggleTimer}>
                {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={resetTimer}>
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Sessions Completed</div>
              <div className="text-3xl font-bold mt-1">{sessions}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Focus Time Today</div>
              <div className="text-3xl font-bold mt-1">
                {Math.floor((sessions * 25) / 60)}h {(sessions * 25) % 60}m
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
