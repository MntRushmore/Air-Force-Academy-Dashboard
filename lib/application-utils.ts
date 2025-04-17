import type { Exercise, Goal } from "@/lib/db"
import { calculateCFAScore } from "./fitness-utils"

// Define application components and their weights
export const applicationComponents = {
  academics: { weight: 0.3, name: "Academic Preparation" },
  fitness: { weight: 0.2, name: "Fitness Assessment" },
  nomination: { weight: 0.2, name: "Congressional Nomination" },
  leadership: { weight: 0.15, name: "Leadership Experience" },
  medical: { weight: 0.1, name: "Medical Qualification" },
  other: { weight: 0.05, name: "Other Requirements" },
}

// Calculate overall application progress
export function calculateApplicationProgress(
  goals: Goal[],
  exercises: Exercise[],
  gender: "male" | "female" = "male",
  gpa = 0,
): {
  overall: number
  components: Record<string, { progress: number; name: string }>
} {
  // Initialize components with default values
  const components: Record<string, { progress: number; name: string }> = {}

  for (const [key, component] of Object.entries(applicationComponents)) {
    components[key] = { progress: 0, name: component.name }
  }

  // Calculate fitness component based on CFA score
  const cfaScore = calculateCFAScore(exercises, gender)
  components.fitness.progress = cfaScore

  // Calculate academic component based on GPA (assuming 4.0 scale)
  components.academics.progress = Math.min(100, (gpa / 4.0) * 100)

  // Calculate other components based on application goals
  const applicationGoals = goals.filter((goal) => goal.category === "Application")

  // Process application goals
  for (const goal of applicationGoals) {
    // Map goal to appropriate component based on title keywords
    const title = goal.title.toLowerCase()

    if (title.includes("nomination") || title.includes("congress")) {
      components.nomination.progress = goal.progress
    } else if (title.includes("leadership") || title.includes("extracurricular")) {
      components.leadership.progress = goal.progress
    } else if (title.includes("medical") || title.includes("physical")) {
      components.medical.progress = goal.progress
    } else {
      // Default to "other" category
      components.other.progress = Math.max(components.other.progress, goal.progress)
    }
  }

  // Calculate weighted overall progress
  let overallProgress = 0
  for (const [key, component] of Object.entries(applicationComponents)) {
    overallProgress += components[key].progress * component.weight
  }

  return {
    overall: Math.round(overallProgress),
    components,
  }
}
