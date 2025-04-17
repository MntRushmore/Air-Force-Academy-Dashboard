import type { Course, Grade } from "@/lib/db"

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

export function percentageToGradePoints(percentage: number, isAP = false): number {
  const letterGrade = percentageToLetterGrade(percentage)
  return letterGradeToPoints(letterGrade, isAP)
}

export function calculateCourseGrade(courseId: string, grades: Grade[]): { percentage: number; letterGrade: string } {
  const courseGrades = grades.filter((g) => g.courseId === courseId)
  if (courseGrades.length === 0) return { percentage: 0, letterGrade: "N/A" }

  let weightedSum = 0
  let weightSum = 0

  for (const grade of courseGrades) {
    const percentage = (grade.score / grade.maxScore) * 100
    weightedSum += percentage * grade.weight
    weightSum += grade.weight
  }

  const percentage = weightSum > 0 ? weightedSum / weightSum : 0
  const letterGrade = percentageToLetterGrade(percentage)

  return { percentage, letterGrade }
}

export function calculateGPA(courses: Course[], grades: Grade[]): number {
  if (courses.length === 0) return 0

  let totalPoints = 0
  let totalCredits = 0

  for (const course of courses) {
    if (!course.id) continue

    // Calculate course grade
    const { percentage } = calculateCourseGrade(course.id, grades)

    // Only include courses that have grades
    if (percentage > 0) {
      const gradePoints = percentageToGradePoints(percentage, course.isAP)
      totalPoints += gradePoints * course.credits
      totalCredits += course.credits
    }
  }

  return totalCredits > 0 ? Number.parseFloat((totalPoints / totalCredits).toFixed(2)) : 0
}

export function getCourseGradeColor(percentage: number): string {
  if (percentage >= 90) return "text-green-600 dark:text-green-400"
  if (percentage >= 80) return "text-blue-600 dark:text-blue-400"
  if (percentage >= 70) return "text-amber-600 dark:text-amber-400"
  if (percentage >= 60) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}
