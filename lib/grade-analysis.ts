import type { Course, Grade } from "@/lib/db"

// Calculate average grade for a course
export function calculateCourseAverage(grades: Grade[]): number {
  if (grades.length === 0) return 0

  let weightedSum = 0
  let weightSum = 0

  for (const grade of grades) {
    const percentage = (grade.score / grade.maxScore) * 100
    weightedSum += percentage * grade.weight
    weightSum += grade.weight
  }

  return weightSum > 0 ? weightedSum / weightSum : 0
}

// Convert percentage to letter grade
export function percentageToLetterGrade(percentage: number): string {
  if (percentage >= 97) return "A+"
  if (percentage >= 93) return "A"
  if (percentage >= 90) return "A-"
  if (percentage >= 87) return "B+"
  if (percentage >= 83) return "B"
  if (percentage >= 80) return "B-"
  if (percentage >= 77) return "C+"
  if (percentage >= 73) return "C"
  if (percentage >= 70) return "C-"
  if (percentage >= 67) return "D+"
  if (percentage >= 63) return "D"
  if (percentage >= 60) return "D-"
  return "F"
}

// Convert letter grade to GPA points
export function letterGradeToPoints(letterGrade: string, isAP = false): number {
  const gradePoints: Record<string, number> = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0.0,
  }

  const points = gradePoints[letterGrade] || 0
  return isAP ? Math.min(4.0, points + 1.0) : points
}

// Group grades by grading period
export function groupGradesByPeriod(grades: Grade[]): Record<string, Grade[]> {
  const groupedGrades: Record<string, Grade[]> = {}

  for (const grade of grades) {
    // Extract year-month from date for grouping
    const dateParts = grade.date.split("-")
    if (dateParts.length >= 2) {
      const period = `${dateParts[0]}-${dateParts[1]}`
      if (!groupedGrades[period]) {
        groupedGrades[period] = []
      }
      groupedGrades[period].push(grade)
    }
  }

  return groupedGrades
}

// Calculate grade distribution for a set of grades
export function calculateGradeDistribution(grades: Grade[]): Record<string, number> {
  const distribution: Record<string, number> = {
    "A+": 0,
    A: 0,
    "A-": 0,
    "B+": 0,
    B: 0,
    "B-": 0,
    "C+": 0,
    C: 0,
    "C-": 0,
    "D+": 0,
    D: 0,
    "D-": 0,
    F: 0,
  }

  for (const grade of grades) {
    const percentage = (grade.score / grade.maxScore) * 100
    const letterGrade = percentageToLetterGrade(percentage)
    distribution[letterGrade]++
  }

  return distribution
}

// Calculate grade trends over time
export function calculateGradeTrends(
  courseGrades: Record<string, Grade[]>,
  courses: Course[],
): { period: string; [courseId: string]: number }[] {
  const trends: { period: string; [courseId: string]: number }[] = []
  const periods = Object.keys(courseGrades).sort()

  for (const period of periods) {
    const periodData: { period: string; [courseId: string]: number } = { period }

    for (const course of courses) {
      if (course.id) {
        const courseGradesInPeriod = courseGrades[period]?.filter((g) => g.courseId === course.id) || []
        const average = calculateCourseAverage(courseGradesInPeriod)
        periodData[course.id] = average
      }
    }

    trends.push(periodData)
  }

  return trends
}

// Get color for a specific grade
export function getGradeColor(grade: string | number): string {
  let letterGrade: string

  if (typeof grade === "number") {
    letterGrade = percentageToLetterGrade(grade)
  } else {
    letterGrade = grade
  }

  if (letterGrade.startsWith("A")) return "#4ade80" // green-400
  if (letterGrade.startsWith("B")) return "#60a5fa" // blue-400
  if (letterGrade.startsWith("C")) return "#facc15" // yellow-400
  if (letterGrade.startsWith("D")) return "#fb923c" // orange-400
  return "#f87171" // red-400
}

// Calculate comparative metrics between courses
export function calculateComparativeMetrics(
  courses: Course[],
  allGrades: Grade[],
): {
  highestAverage: { course: Course; average: number } | null
  lowestAverage: { course: Course; average: number } | null
  mostImproved: { course: Course; improvement: number } | null
  mostConsistent: { course: Course; stdDev: number } | null
} {
  if (courses.length === 0) {
    return {
      highestAverage: null,
      lowestAverage: null,
      mostImproved: null,
      mostConsistent: null,
    }
  }

  const courseMetrics = courses.map((course) => {
    const courseGrades = allGrades.filter((g) => g.courseId === course.id)
    const average = calculateCourseAverage(courseGrades)

    // Calculate improvement (difference between earliest and latest grades)
    const sortedGrades = [...courseGrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let improvement = 0
    if (sortedGrades.length >= 2) {
      const earliest = (sortedGrades[0].score / sortedGrades[0].maxScore) * 100
      const latest =
        (sortedGrades[sortedGrades.length - 1].score / sortedGrades[sortedGrades.length - 1].maxScore) * 100
      improvement = latest - earliest
    }

    // Calculate standard deviation for consistency
    let stdDev = 0
    if (courseGrades.length > 0) {
      const percentages = courseGrades.map((g) => (g.score / g.maxScore) * 100)
      const mean = percentages.reduce((sum, val) => sum + val, 0) / percentages.length
      const squaredDiffs = percentages.map((val) => Math.pow(val - mean, 2))
      stdDev = Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / percentages.length)
    }

    return { course, average, improvement, stdDev }
  })

  // Find highest and lowest averages
  const sortedByAverage = [...courseMetrics].sort((a, b) => b.average - a.average)
  const highestAverage =
    sortedByAverage.length > 0 ? { course: sortedByAverage[0].course, average: sortedByAverage[0].average } : null
  const lowestAverage =
    sortedByAverage.length > 0
      ? {
          course: sortedByAverage[sortedByAverage.length - 1].course,
          average: sortedByAverage[sortedByAverage.length - 1].average,
        }
      : null

  // Find most improved
  const sortedByImprovement = [...courseMetrics].sort((a, b) => b.improvement - a.improvement)
  const mostImproved =
    sortedByImprovement.length > 0
      ? { course: sortedByImprovement[0].course, improvement: sortedByImprovement[0].improvement }
      : null

  // Find most consistent (lowest standard deviation)
  const sortedByConsistency = [...courseMetrics].sort((a, b) => a.stdDev - b.stdDev)
  const mostConsistent =
    sortedByConsistency.length > 0
      ? { course: sortedByConsistency[0].course, stdDev: sortedByConsistency[0].stdDev }
      : null

  return {
    highestAverage,
    lowestAverage,
    mostImproved,
    mostConsistent,
  }
}
