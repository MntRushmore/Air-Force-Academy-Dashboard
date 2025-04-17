import type { Database } from "@/lib/database.types"

type Course = Database["public"]["Tables"]["courses"]["Row"]
type Grade = Database["public"]["Tables"]["grades"]["Row"]

// Calculate GPA based on courses and grades
export function calculateGPA(courses: Course[], grades: Grade[]): number {
  if (courses.length === 0) return 0

  let totalPoints = 0
  let totalCredits = 0

  for (const course of courses) {
    // Calculate course grade
    const courseGrades = grades.filter((g) => g.course_id === course.id)
    if (courseGrades.length === 0) continue

    let weightedSum = 0
    let weightSum = 0

    for (const grade of courseGrades) {
      const percentage = (grade.score / grade.max_score) * 100
      weightedSum += percentage * (grade.weight || 1)
      weightSum += grade.weight || 1
    }

    const coursePercentage = weightSum > 0 ? weightedSum / weightSum : 0
    const gradePoints = percentageToGradePoints(coursePercentage, course.is_ap || false)

    totalPoints += gradePoints * (course.credits || 3)
    totalCredits += course.credits || 3
  }

  return totalCredits > 0 ? totalPoints / totalCredits : 0
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

// Helper function to convert percentage to grade points
export function percentageToGradePoints(percentage: number, isAP: boolean): number {
  let points = 0

  if (percentage >= 97) points = 4.0
  else if (percentage >= 93) points = 4.0
  else if (percentage >= 90) points = 3.7
  else if (percentage >= 87) points = 3.3
  else if (percentage >= 83) points = 3.0
  else if (percentage >= 80) points = 2.7
  else if (percentage >= 77) points = 2.3
  else if (percentage >= 73) points = 2.0
  else if (percentage >= 70) points = 1.7
  else if (percentage >= 67) points = 1.3
  else if (percentage >= 63) points = 1.0
  else if (percentage >= 60) points = 0.7
  else points = 0.0

  // Add AP bonus
  if (isAP) points = Math.min(4.0, points + 1.0)

  return points
}

// Calculate course grade
export function calculateCourseGrade(courseId: string, grades: Grade[]): { percentage: number; letterGrade: string } {
  const courseGrades = grades.filter((g) => g.course_id === courseId)
  if (courseGrades.length === 0) return { percentage: 0, letterGrade: "N/A" }

  let weightedSum = 0
  let weightSum = 0

  for (const grade of courseGrades) {
    const percentage = (grade.score / grade.max_score) * 100
    weightedSum += percentage * (grade.weight || 1)
    weightSum += grade.weight || 1
  }

  const percentage = weightSum > 0 ? weightedSum / weightSum : 0
  const letterGrade = percentageToLetterGrade(percentage)

  return { percentage, letterGrade }
}

// Get color for grade display
export function getGradeColor(percentage: number): string {
  if (percentage >= 90) return "text-green-600 dark:text-green-400"
  if (percentage >= 80) return "text-blue-600 dark:text-blue-400"
  if (percentage >= 70) return "text-amber-600 dark:text-amber-400"
  if (percentage >= 60) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}
