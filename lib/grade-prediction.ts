import type { Course, Grade } from "@/lib/db"
import { calculateCourseAverage, percentageToLetterGrade } from "@/lib/grade-analysis"

export interface FutureAssignment {
  id: string
  title: string
  type: Grade["type"]
  weight: number
  predictedScore: number
  maxScore: number
}

export interface CourseGradePrediction {
  courseId: string
  courseName: string
  courseCode: string
  currentAverage: number
  currentLetterGrade: string
  predictedAverage: number
  predictedLetterGrade: string
  futureAssignments: FutureAssignment[]
}

// Calculate predicted grade based on current grades and future assignments
export function calculatePredictedGrade(
  course: Course,
  currentGrades: Grade[],
  futureAssignments: FutureAssignment[],
): CourseGradePrediction {
  // Calculate current average
  const currentAverage = calculateCourseAverage(currentGrades)
  const currentLetterGrade = percentageToLetterGrade(currentAverage)

  // If no future assignments, return current average as prediction
  if (futureAssignments.length === 0) {
    return {
      courseId: course.id || "",
      courseName: course.name,
      courseCode: course.code,
      currentAverage,
      currentLetterGrade,
      predictedAverage: currentAverage,
      predictedLetterGrade: currentLetterGrade,
      futureAssignments: [],
    }
  }

  // Calculate total weight of current grades
  let currentTotalWeight = 0
  for (const grade of currentGrades) {
    currentTotalWeight += grade.weight
  }

  // Calculate weighted sum of current grades
  let currentWeightedSum = 0
  for (const grade of currentGrades) {
    const percentage = (grade.score / grade.maxScore) * 100
    currentWeightedSum += percentage * grade.weight
  }

  // Calculate weighted sum of future assignments
  let futureWeightedSum = 0
  let futureTotalWeight = 0
  for (const assignment of futureAssignments) {
    const percentage = (assignment.predictedScore / assignment.maxScore) * 100
    futureWeightedSum += percentage * assignment.weight
    futureTotalWeight += assignment.weight
  }

  // Calculate predicted average
  const totalWeight = currentTotalWeight + futureTotalWeight
  const predictedAverage = totalWeight > 0 ? (currentWeightedSum + futureWeightedSum) / totalWeight : currentAverage
  const predictedLetterGrade = percentageToLetterGrade(predictedAverage)

  return {
    courseId: course.id || "",
    courseName: course.name,
    courseCode: course.code,
    currentAverage,
    currentLetterGrade,
    predictedAverage,
    predictedLetterGrade,
    futureAssignments,
  }
}

// Generate default future assignments based on course type
export function generateDefaultFutureAssignments(course: Course, existingGrades: Grade[]): FutureAssignment[] {
  // Determine what types of assignments are typical for this course based on existing grades
  const assignmentTypes = new Set<Grade["type"]>()
  for (const grade of existingGrades) {
    assignmentTypes.add(grade.type)
  }

  // If no existing grades, use some common types
  if (assignmentTypes.size === 0) {
    assignmentTypes.add("exam")
    assignmentTypes.add("homework")
    assignmentTypes.add("quiz")
  }

  // Generate future assignments
  const futureAssignments: FutureAssignment[] = []
  let id = 1

  // Add a final exam with higher weight
  futureAssignments.push({
    id: `future-${id++}`,
    title: "Final Exam",
    type: "exam",
    weight: 20,
    predictedScore: 85,
    maxScore: 100,
  })

  // Add other typical assignments
  if (assignmentTypes.has("homework")) {
    futureAssignments.push({
      id: `future-${id++}`,
      title: "Upcoming Homework",
      type: "homework",
      weight: 5,
      predictedScore: 90,
      maxScore: 100,
    })
  }

  if (assignmentTypes.has("quiz")) {
    futureAssignments.push({
      id: `future-${id++}`,
      title: "Upcoming Quiz",
      type: "quiz",
      weight: 10,
      predictedScore: 85,
      maxScore: 100,
    })
  }

  if (assignmentTypes.has("project")) {
    futureAssignments.push({
      id: `future-${id++}`,
      title: "Final Project",
      type: "project",
      weight: 15,
      predictedScore: 88,
      maxScore: 100,
    })
  }

  return futureAssignments
}

// Calculate what score is needed on a future assignment to achieve a target grade
export function calculateRequiredScore(
  targetGrade: number,
  course: Course,
  currentGrades: Grade[],
  futureAssignments: FutureAssignment[],
  targetAssignmentId: string,
): number | null {
  // Calculate current weighted sum and total weight
  let currentWeightedSum = 0
  let currentTotalWeight = 0

  for (const grade of currentGrades) {
    const percentage = (grade.score / grade.maxScore) * 100
    currentWeightedSum += percentage * grade.weight
    currentTotalWeight += grade.weight
  }

  // Calculate future weighted sum and total weight, excluding the target assignment
  let futureWeightedSum = 0
  let futureTotalWeight = 0
  let targetAssignment: FutureAssignment | undefined

  for (const assignment of futureAssignments) {
    if (assignment.id === targetAssignmentId) {
      targetAssignment = assignment
    } else {
      const percentage = (assignment.predictedScore / assignment.maxScore) * 100
      futureWeightedSum += percentage * assignment.weight
      futureTotalWeight += assignment.weight
    }
  }

  if (!targetAssignment) {
    return null
  }

  // Calculate required score
  const totalWeight = currentTotalWeight + futureTotalWeight + targetAssignment.weight
  const requiredWeightedSum = targetGrade * totalWeight - currentWeightedSum - futureWeightedSum
  const requiredPercentage = requiredWeightedSum / targetAssignment.weight

  // Convert percentage back to raw score
  const requiredScore = (requiredPercentage * targetAssignment.maxScore) / 100

  // Clamp the score between 0 and max score
  return Math.min(Math.max(requiredScore, 0), targetAssignment.maxScore)
}

// Calculate GPA impact of predicted grades
export function calculateGPAImpact(
  courses: Course[],
  currentGrades: Record<string, Grade[]>,
  predictions: Record<string, CourseGradePrediction>,
): { currentGPA: number; predictedGPA: number; difference: number } {
  let currentTotalPoints = 0
  let predictedTotalPoints = 0
  let totalCredits = 0

  for (const course of courses) {
    if (!course.id) continue

    const courseGrades = currentGrades[course.id] || []
    const prediction = predictions[course.id]

    if (courseGrades.length > 0) {
      // Calculate current GPA points
      const currentLetterGrade = percentageToLetterGrade(calculateCourseAverage(courseGrades))
      const currentPoints = letterGradeToPoints(currentLetterGrade, course.isAP)
      currentTotalPoints += currentPoints * course.credits

      // Calculate predicted GPA points
      if (prediction) {
        const predictedPoints = letterGradeToPoints(prediction.predictedLetterGrade, course.isAP)
        predictedTotalPoints += predictedPoints * course.credits
      } else {
        predictedTotalPoints += currentPoints * course.credits
      }

      totalCredits += course.credits
    }
  }

  const currentGPA = totalCredits > 0 ? currentTotalPoints / totalCredits : 0
  const predictedGPA = totalCredits > 0 ? predictedTotalPoints / totalCredits : 0

  return {
    currentGPA,
    predictedGPA,
    difference: predictedGPA - currentGPA,
  }
}

// Helper function to convert letter grade to GPA points
function letterGradeToPoints(letterGrade: string, isAP = false): number {
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
