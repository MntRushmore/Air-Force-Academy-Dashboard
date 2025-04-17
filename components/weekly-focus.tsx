"use client"

import type React from "react"

import { useState } from "react"
import { BookOpen, Brain, Dumbbell, Edit, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type FocusArea = {
  id: string
  name: string
  icon: React.ReactNode
  progress: number
  color: string
}

export function WeeklyFocus() {
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([
    {
      id: "1",
      name: "Academic Excellence",
      icon: <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      progress: 65,
      color: "bg-blue-500",
    },
    {
      id: "2",
      name: "Physical Fitness",
      icon: <Dumbbell className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      progress: 80,
      color: "bg-purple-500",
    },
    {
      id: "3",
      name: "Leadership Skills",
      icon: <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      progress: 45,
      color: "bg-emerald-500",
    },
    {
      id: "4",
      name: "Application Essays",
      icon: <Pencil className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      progress: 30,
      color: "bg-amber-500",
    },
  ])

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {focusAreas.map((area) => (
        <Card key={area.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">{area.icon}</div>
                <div>
                  <div className="font-medium">{area.name}</div>
                  <div className="text-sm text-muted-foreground">{area.progress}% complete</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={area.progress} className={`h-2 mt-4 ${area.color}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
