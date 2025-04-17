import type { Exercise } from "@/lib/db"

// CFA standards for males
export const cfaStandardsMale = {
  "Basketball Throw": { min: 60, max: 102, unit: "feet" },
  "Pull-ups": { min: 7, max: 18, unit: "reps" },
  "Shuttle Run": { min: 8.1, max: 7.1, unit: "seconds", isReversed: true },
  Crunches: { min: 58, max: 95, unit: "reps" },
  "Push-ups": { min: 35, max: 75, unit: "reps" },
  "1-Mile Run": { min: 7.3, max: 5.2, unit: "minutes", isReversed: true },
}

// CFA standards for females
export const cfaStandardsFemale = {
  "Basketball Throw": { min: 40, max: 66, unit: "feet" },
  "Pull-ups": { min: 1, max: 7, unit: "reps" },
  "Shuttle Run": { min: 9.1, max: 7.8, unit: "seconds", isReversed: true },
  Crunches: { min: 50, max: 95, unit: "reps" },
  "Push-ups": { min: 18, max: 41, unit: "reps" },
  "1-Mile Run": { min: 8.3, max: 6.0, unit: "minutes", isReversed: true },
}

// Calculate CFA score based on exercises and gender
export function calculateCFAScore(exercises: Exercise[], gender: "male" | "female" = "male"): number {
  if (exercises.length === 0) return 0

  const cfaExercises = ["Basketball Throw", "Pull-ups", "Shuttle Run", "Crunches", "Push-ups", "1-Mile Run"]
  const cfaStandards = gender === "male" ? cfaStandardsMale : cfaStandardsFemale

  let totalScore = 0
  let exerciseCount = 0

  for (const exerciseName of cfaExercises) {
    const exercise = exercises.find((e) => e.name === exerciseName)
    if (!exercise) continue

    const standard = cfaStandards[exerciseName as keyof typeof cfaStandards]
    if (!standard) continue

    let score = 0
    if (standard.isReversed) {
      // Lower is better (e.g., run time)
      if (exercise.current <= standard.max) score = 100
      else if (exercise.current >= standard.min) score = 0
      else {
        score = 100 - ((exercise.current - standard.max) / (standard.min - standard.max)) * 100
      }
    } else {
      // Higher is better (e.g., push-ups)
      if (exercise.current >= standard.max) score = 100
      else if (exercise.current <= standard.min) score = 0
      else {
        score = ((exercise.current - standard.min) / (standard.max - standard.min)) * 100
      }
    }

    totalScore += score
    exerciseCount++
  }

  return exerciseCount > 0 ? Math.round(totalScore / exerciseCount) : 0
}

// Calculate progress for a single exercise
export function calculateExerciseProgress(
  exercise: Exercise,
  gender: "male" | "female" = "male",
): {
  percentage: number
  score: number
} {
  const cfaStandards = gender === "male" ? cfaStandardsMale : cfaStandardsFemale
  const standard = cfaStandards[exercise.name as keyof typeof cfaStandards]

  if (!standard) return { percentage: (exercise.current / exercise.target) * 100, score: 0 }

  let score = 0
  if (standard.isReversed) {
    // Lower is better (e.g., run time)
    if (exercise.current <= standard.max) score = 100
    else if (exercise.current >= standard.min) score = 0
    else {
      score = 100 - ((exercise.current - standard.max) / (standard.min - standard.max)) * 100
    }
  } else {
    // Higher is better (e.g., push-ups)
    if (exercise.current >= standard.max) score = 100
    else if (exercise.current <= standard.min) score = 0
    else {
      score = ((exercise.current - standard.min) / (standard.max - standard.min)) * 100
    }
  }

  return {
    percentage: Math.min(100, Math.max(0, (exercise.current / exercise.target) * 100)),
    score: Math.round(score),
  }
}
