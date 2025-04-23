import type { Course, Grade } from "@/lib/types";
import { type Database } from "./database.types";

type DatabaseGrade = Database["public"]["Tables"]["grades"]["Row"];

// Extended Grade type with additional fields needed for analysis
export interface ExtendedGrade {
  id: string;
  user_id: string;
  date: string;
  grade_type: string;
  grade_value: number;
  subject: string;
  created_at: string;
  score: number;
  max_score: number;
  weight: number;
  course_id: string;
  is_final: boolean | null;
}

// Helper function to convert frontend Grade to ExtendedGrade
export function convertToExtendedGrade(grade: Grade): ExtendedGrade {
  return {
    id: grade.id,
    user_id: "", // This will be filled by the database
    date: grade.date || new Date().toISOString().split("T")[0],
    grade_type: grade.type,
    grade_value: grade.score,
    subject: grade.courseId,
    created_at: grade.created_at,
    score: grade.score,
    max_score: grade.maxScore,
    weight: grade.weight,
    course_id: grade.courseId,
    is_final: grade.is_final ?? null,
  };
}

// Calculate average grade for a course
export function calculateCourseAverage(grades: ExtendedGrade[]): number {
  if (grades.length === 0) return 0;

  // Filter out non-final grades and undefined values
  const finalGrades = grades.filter(
    (grade) => grade.is_final !== false && grade.is_final !== undefined
  );

  if (finalGrades.length === 0) return 0;

  let weightedSum = 0;
  let weightSum = 0;

  for (const grade of finalGrades) {
    const percentage = (grade.score / grade.max_score) * 100;
    weightedSum += percentage * grade.weight;
    weightSum += grade.weight;
  }

  return weightSum > 0 ? weightedSum / weightSum : 0;
}

// Convert percentage to letter grade
export function percentageToLetterGrade(percentage: number): string {
  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 67) return "D+";
  if (percentage >= 63) return "D";
  if (percentage >= 60) return "D-";
  return "F";
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
  };

  const points = gradePoints[letterGrade] || 0;
  return isAP ? Math.min(4.0, points + 1.0) : points;
}

// Group grades by grading period
export function groupGradesByPeriod(
  grades: ExtendedGrade[]
): Record<string, ExtendedGrade[]> {
  const groupedGrades: Record<string, ExtendedGrade[]> = {};

  for (const grade of grades) {
    // Extract year-month from date for grouping
    const dateParts = grade.date.split("-");
    if (dateParts.length >= 2) {
      const period = `${dateParts[0]}-${dateParts[1]}`;
      if (!groupedGrades[period]) {
        groupedGrades[period] = [];
      }
      groupedGrades[period].push(grade);
    }
  }

  return groupedGrades;
}

// Calculate grade distribution for a set of grades
export function calculateGradeDistribution(
  grades: ExtendedGrade[]
): Record<string, number> {
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
  };

  for (const grade of grades) {
    const percentage = (grade.score / grade.max_score) * 100;
    const letterGrade = percentageToLetterGrade(percentage);
    distribution[letterGrade]++;
  }

  return distribution;
}

interface GradeTrend {
  period: string;
  [courseId: string]: number | string;
}

// Calculate grade trends over time
export function calculateGradeTrends(
  grades: ExtendedGrade[],
  courses: Course[]
): GradeTrend[] {
  // Group grades by period (month)
  const gradesByPeriod = grades.reduce((acc, grade) => {
    const defaultDate = new Date().toISOString();
    const date = grade.date ?? defaultDate;
    const period = new Date(date).toISOString().slice(0, 7); // YYYY-MM
    if (!acc[period]) {
      acc[period] = [];
    }
    acc[period].push(grade);
    return acc;
  }, {} as Record<string, ExtendedGrade[]>);

  // Calculate averages for each period
  const trends: GradeTrend[] = [];
  const periods = Object.keys(gradesByPeriod).sort();

  for (const period of periods) {
    const periodData: GradeTrend = { period };
    const periodGrades = gradesByPeriod[period];

    for (const course of courses) {
      const courseGrades = periodGrades.filter(
        (g) => g.course_id === course.id
      );
      const average = calculateCourseAverage(courseGrades);
      periodData[course.id] = average;
    }

    trends.push(periodData);
  }

  return trends;
}

// Get color based on grade percentage
export function getGradeColor(percentage: number): string {
  if (percentage >= 90) return "#22c55e"; // green-500
  if (percentage >= 80) return "#3b82f6"; // blue-500
  if (percentage >= 70) return "#f59e0b"; // amber-500
  if (percentage >= 60) return "#ef4444"; // red-500
  return "#6b7280"; // gray-500
}

interface ComparativeMetrics {
  overallAverage: number;
  highestGrade: { courseId: string; grade: number };
  lowestGrade: { courseId: string; grade: number };
  improvingCourses: string[];
  needsAttentionCourses: string[];
}

// Calculate comparative metrics
export function calculateComparativeMetrics(
  grades: ExtendedGrade[],
  courses: Course[]
): ComparativeMetrics {
  const metrics: ComparativeMetrics = {
    overallAverage: 0,
    highestGrade: { courseId: "", grade: 0 },
    lowestGrade: { courseId: "", grade: 100 },
    improvingCourses: [],
    needsAttentionCourses: [],
  };

  let totalWeightedGrade = 0;
  let totalCredits = 0;

  for (const course of courses) {
    const courseGrades = grades.filter((g) => g.course_id === course.id);
    if (courseGrades.length === 0) continue;

    const average = calculateCourseAverage(courseGrades);
    totalWeightedGrade += average * course.credits;
    totalCredits += course.credits;

    // Track highest and lowest grades
    if (average > metrics.highestGrade.grade) {
      metrics.highestGrade = { courseId: course.id, grade: average };
    }
    if (average < metrics.lowestGrade.grade) {
      metrics.lowestGrade = { courseId: course.id, grade: average };
    }

    // Check for improvement or need for attention
    const recentGrades = courseGrades
      .sort((a, b) => {
        const defaultDate = new Date().toISOString();
        const dateA = a.date ?? defaultDate;
        const dateB = b.date ?? defaultDate;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 3);

    if (recentGrades.length >= 2) {
      const trend = recentGrades.reduce((acc, grade, i) => {
        if (i === 0) return acc;
        return (
          acc +
          (grade.score / grade.max_score -
            recentGrades[i - 1].score / recentGrades[i - 1].max_score)
        );
      }, 0);

      if (trend > 0) {
        metrics.improvingCourses.push(course.id);
      } else if (average < 70) {
        metrics.needsAttentionCourses.push(course.id);
      }
    }
  }

  metrics.overallAverage =
    totalCredits > 0 ? totalWeightedGrade / totalCredits : 0;

  return metrics;
}

// Unified GPA calculation function for use across the application
export function calculateGPA(
  courses: Course[],
  grades: ExtendedGrade[]
): number {
  if (courses.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;
  let validCourses = 0;

  for (const course of courses) {
    if (!course.id) continue;

    // Calculate course grade
    const courseGrades = grades.filter((g) => g.course_id === course.id);
    if (courseGrades.length === 0) continue;

    const average = calculateCourseAverage(courseGrades);
    const letterGrade = percentageToLetterGrade(average);
    const gradePoints = letterGradeToPoints(letterGrade, course.isAP);

    totalPoints += gradePoints * course.credits;
    totalCredits += course.credits;
    validCourses++;
  }

  return totalCredits > 0
    ? Number.parseFloat((totalPoints / totalCredits).toFixed(2))
    : 0;
}

function calculateGradeWeight(grade: ExtendedGrade): number {
  const isFinal = grade.is_final ?? false;
  return isFinal ? 1 : 0.5;
}
