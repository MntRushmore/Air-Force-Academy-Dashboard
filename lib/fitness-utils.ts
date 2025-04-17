// CFA standards for males (approximated)
export const cfaStandardsMale = {
  "Basketball Throw": { min: 60, max: 102, unit: "feet" },
  "Pull-ups": { min: 7, max: 18, unit: "reps" },
  "Shuttle Run": { min: 8.1, max: 7.1, unit: "seconds", isReversed: true },
  Crunches: { min: 58, max: 95, unit: "reps" },
  "Push-ups": { min: 35, max: 75, unit: "reps" },
  "1-Mile Run": { min: 7.3, max: 5.2, unit: "minutes", isReversed: true },
}

// CFA standards for females (approximated)
export const cfaStandardsFemale = {
  "Basketball Throw": { min: 40, max: 66, unit: "feet" },
  "Pull-ups": { min: 1, max: 7, unit: "reps" },
  "Shuttle Run": { min: 9.1, max: 7.8, unit: "seconds", isReversed: true },
  Crunches: { min: 50, max: 95, unit: "reps" },
  "Push-ups": { min: 18, max: 41, unit: "reps" },
  "1-Mile Run": { min: 8.3, max: 6.0, unit: "minutes", isReversed: true },
}

export type Gender = "male" | "female"

export interface ExerciseStandard {
  min: number
  max: number
  unit: string
  isReversed?: boolean
}

export function calculateExerciseScore(exerciseName: string, currentValue: number, gender: Gender): number {
  const standards = gender === "male" ? cfaStandardsMale : cfaStandardsFemale
  const standard = standards[exerciseName as keyof typeof standards]

  if (!standard) return 0

  let score = 0
  if (standard.isReversed) {
    // Lower is better (e.g., run time)
    if (currentValue <= standard.max) score = 100
    else if (currentValue >= standard.min) score = 0
    else {
      score = 100 - ((currentValue - standard.max) / (standard.min - standard.max)) * 100
    }
  } else {
    // Higher is better (e.g., push-ups)
    if (currentValue >= standard.max) score = 100
    else if (currentValue <= standard.min) score = 0
    else {
      score = ((currentValue - standard.min) / (standard.max - standard.min)) * 100
    }
  }

  return Math.round(score)
}

export function getExerciseStatus(
  exerciseName: string,
  currentValue: number,
  gender: Gender,
): { status: string; statusColor: string } {
  const standards = gender === "male" ? cfaStandardsMale : cfaStandardsFemale
  const standard = standards[exerciseName as keyof typeof standards]

  if (!standard) {
    return { status: "Not Started", statusColor: "text-slate-500" }
  }

  const average = (standard.min + standard.max) / 2

  if (standard.isReversed) {
    // Lower is better
    if (currentValue <= standard.max) {
      return { status: "Excellent", statusColor: "text-green-600 dark:text-green-400" }
    } else if (currentValue <= average) {
      return { status: "Good", statusColor: "text-blue-600 dark:text-blue-400" }
    } else if (currentValue <= standard.min) {
      return { status: "Needs Work", statusColor: "text-amber-600 dark:text-amber-400" }
    } else {
      return { status: "Below Minimum", statusColor: "text-red-600 dark:text-red-400" }
    }
  } else {
    // Higher is better
    if (currentValue >= standard.max) {
      return { status: "Excellent", statusColor: "text-green-600 dark:text-green-400" }
    } else if (currentValue >= average) {
      return { status: "Good", statusColor: "text-blue-600 dark:text-blue-400" }
    } else if (currentValue >= standard.min) {
      return { status: "Needs Work", statusColor: "text-amber-600 dark:text-amber-400" }
    } else {
      return { status: "Below Minimum", statusColor: "text-red-600 dark:text-red-400" }
    }
  }
}
