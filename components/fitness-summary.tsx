"use client"

import { useData } from "@/lib/data-context"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateExerciseScore } from "@/lib/fitness-utils"

export function FitnessSummary() {
  const { exercises, gender, cfaScore } = useData()

  // Get the CFA exercises
  const cfaExercises = ["Basketball Throw", "Pull-ups", "Shuttle Run", "Crunches", "Push-ups", "1-Mile Run"]
  const cfaExerciseData = cfaExercises.map((name) => {
    const exercise = exercises.find((e) => e.name === name)
    if (!exercise) {
      return {
        name,
        score: 0,
        current: 0,
        target: 0,
        unit: "",
        completed: false,
      }
    }

    const score = calculateExerciseScore(name, exercise.current, gender)
    return {
      name,
      score,
      current: exercise.current,
      target: exercise.target,
      unit: exercise.unit,
      completed: score >= 70,
    }
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fitness Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall CFA Score</span>
          <span className="text-sm font-medium">{cfaScore}/100</span>
        </div>
        <Progress value={cfaScore} className="h-2" />

        <div className="space-y-3 mt-4">
          {cfaExerciseData.map((exercise) => (
            <div key={exercise.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">{exercise.name}</span>
                <span className="text-sm font-medium">{exercise.score}/100</span>
              </div>
              <Progress value={exercise.score} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
