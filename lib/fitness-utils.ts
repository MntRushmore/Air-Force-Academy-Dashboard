export interface CFAStandard {
  min: number;
  max: number;
  unit: string;
  isReversed?: boolean;
}

export interface Exercise {
  id: string;
  user_id: string;
  exercise_type: string;
  value: number;
  target_value: number;
  unit: string;
  date: string;
  created_at: string;
}

// CFA standards for males
export const cfaStandardsMale: Record<string, CFAStandard> = {
  "Basketball Throw": { min: 60, max: 102, unit: "feet" },
  "Pull-ups": { min: 7, max: 18, unit: "reps" },
  "Shuttle Run": { min: 8.1, max: 7.8, unit: "seconds", isReversed: true },
  Crunches: { min: 58, max: 81, unit: "reps" },
  "Push-ups": { min: 42, max: 75, unit: "reps" },
  "1-Mile Run": { min: 420, max: 330, unit: "seconds", isReversed: true },
};

// CFA standards for females
export const cfaStandardsFemale: Record<string, CFAStandard> = {
  "Basketball Throw": { min: 40, max: 66, unit: "feet" },
  "Pull-ups": { min: 3, max: 7, unit: "reps" },
  "Shuttle Run": { min: 9.4, max: 8.6, unit: "seconds", isReversed: true },
  Crunches: { min: 58, max: 81, unit: "reps" },
  "Push-ups": { min: 19, max: 40, unit: "reps" },
  "1-Mile Run": { min: 510, max: 420, unit: "seconds", isReversed: true },
};

// Calculate CFA score based on exercises and gender
export function calculateCFAScore(
  exercises: Exercise[],
  gender: "male" | "female"
): number {
  if (!exercises.length) return 0;

  // Get the latest record for each exercise type
  const latestExercises = exercises.reduce((acc, curr) => {
    if (
      !acc[curr.exercise_type] ||
      new Date(curr.date) > new Date(acc[curr.exercise_type].date)
    ) {
      acc[curr.exercise_type] = curr;
    }
    return acc;
  }, {} as Record<string, Exercise>);

  // Calculate total score
  let totalScore = 0;
  let exerciseCount = 0;

  Object.values(latestExercises).forEach((exercise) => {
    const { score } = calculateExerciseProgress(exercise, gender);
    totalScore += score;
    exerciseCount++;
  });

  return exerciseCount ? Math.round(totalScore / exerciseCount) : 0;
}

// Calculate progress for a single exercise
export function calculateExerciseProgress(
  exercise: Exercise,
  gender: "male" | "female"
): { percentage: number; score: number } {
  const standards = gender === "male" ? cfaStandardsMale : cfaStandardsFemale;
  const standard = standards[exercise.exercise_type];

  if (!standard) {
    return { percentage: 0, score: 0 };
  }

  let percentage: number;
  if (standard.isReversed) {
    // Lower is better (like running time)
    percentage =
      ((standard.min - exercise.value) / (standard.min - standard.max)) * 100;
  } else {
    // Higher is better
    percentage =
      ((exercise.value - standard.min) / (standard.max - standard.min)) * 100;
  }

  // Clamp percentage between 0 and 100
  percentage = Math.max(0, Math.min(100, percentage));

  // Calculate score (0-100)
  const score = Math.round(percentage);

  return { percentage, score };
}
