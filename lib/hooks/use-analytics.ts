import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/lib/database.types";
import type { Tables } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "./use-auth";

type Course = Tables<"courses">;
type Goal = Tables<"goals">;
type StudySession = Tables<"study_sessions">;
type FitnessRecord = Tables<"fitness_records">;

const supabase = createClient();

export interface AcademicMetrics {
  currentGPA: number;
  previousGPA: number;
  improvement: number;
}

export interface FitnessMetrics {
  currentScore: number;
  previousScore: number;
  improvement: number;
}

export interface ApplicationProgress {
  total: number;
  completed: number;
  percentage: number;
  previousPercentage: number;
  percentageComplete: number;
}

export interface StudyTimeDistribution {
  subject: string;
  hours: number;
}

export interface GradeTrend {
  date: string;
  average: number;
}

export interface FitnessProgress {
  date: string;
  pushups: number;
  situps: number;
  pullups: number;
  crunches: number;
  basketball: number;
  shuttle_run: number;
  mile_run: number;
}

export interface TaskCompletion {
  date: string;
  rate: number;
}

export interface PomodoroStats {
  date: string;
  sessions: number;
  totalMinutes: number;
}

// Calculate GPA from courses
function calculateGPA(courses: Course[]) {
  if (!courses?.length) return 0;

  // Map letter grades to grade points
  const gradePoints: { [key: string]: number } = {
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
    F: 0.0,
  };

  let totalPoints = 0;
  let totalCredits = 0;

  // Debug the courses array
  console.log(
    "All courses for GPA calculation:",
    courses.map((c) => ({
      name: c.name,
      grade: c.grade,
      credits: c.credits,
    }))
  );

  courses.forEach((course) => {
    // Handle both letter grades and numeric grades
    if (course.grade && course.credits) {
      let gradeValue: number;

      // Try to parse as a number first
      const numericGrade = parseFloat(course.grade);
      if (!isNaN(numericGrade)) {
        // If it's a numeric grade on a 4.0 scale
        gradeValue = numericGrade;
      } else {
        // Otherwise treat as a letter grade
        gradeValue = gradePoints[course.grade] || 0;
      }

      console.log("Course grade calculation:", {
        name: course.name,
        grade: course.grade,
        gradeValue,
        credits: course.credits,
        points: gradeValue * course.credits,
      });

      if (gradeValue >= 0) {
        totalPoints += gradeValue * course.credits;
        totalCredits += course.credits;
      }
    }
  });

  console.log("GPA Calculation:", {
    totalPoints,
    totalCredits,
    gpa:
      totalCredits > 0
        ? parseFloat((totalPoints / totalCredits).toFixed(2))
        : 0,
  });

  // Round to 2 decimal places
  return totalCredits > 0
    ? parseFloat((totalPoints / totalCredits).toFixed(2))
    : 0;
}

// Fetch academic performance metrics
export function useAcademicMetrics(dateRange: string) {
  const user = useAuth();

  return useQuery<AcademicMetrics>({
    queryKey: ["academicMetrics", dateRange],
    queryFn: async () => {
      // Try different queries based on the available data
      console.log("Fetching all courses to debug");

      // First get all courses to see what's available
      const { data: allCourses, error: allCoursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user?.user?.id);

      if (allCoursesError) throw allCoursesError;

      console.log("All available courses:", allCourses);

      // Check if we have any courses at all
      if (!allCourses || allCourses.length === 0) {
        console.log("No courses found for this user");
        return {
          currentGPA: 0,
          previousGPA: 0,
          improvement: 0,
        };
      }

      // Find the current and previous semesters from the data
      const semesters = Array.from(
        new Set(allCourses.map((c) => `${c.year}-${c.semester}`))
      ).sort();
      console.log("Available semesters:", semesters);

      if (semesters.length < 2) {
        // Not enough semesters to compare
        const currentSemesterGPA = calculateGPA(allCourses);
        return {
          currentGPA: currentSemesterGPA,
          previousGPA: 0,
          improvement: currentSemesterGPA,
        };
      }

      // Use the latest two semesters for comparison
      const currentSemester = semesters[semesters.length - 1];
      const previousSemester = semesters[semesters.length - 2];

      const [currentYear, currentTerm] = currentSemester.split("-");
      const [previousYear, previousTerm] = previousSemester.split("-");

      console.log("Using semesters for comparison:", {
        current: { year: currentYear, semester: currentTerm },
        previous: { year: previousYear, semester: previousTerm },
      });

      // Get current semester courses
      const currentCourses = allCourses.filter(
        (c) => c.year.toString() === currentYear && c.semester === currentTerm
      );

      // Get previous semester courses
      const previousCourses = allCourses.filter(
        (c) => c.year.toString() === previousYear && c.semester === previousTerm
      );

      console.log("Current semester courses:", currentCourses);
      console.log("Previous semester courses:", previousCourses);

      const currentGPA = calculateGPA(currentCourses || []);
      const previousGPA = calculateGPA(previousCourses || []);

      const result = {
        currentGPA,
        previousGPA,
        improvement: parseFloat((currentGPA - previousGPA).toFixed(2)),
      };

      console.log("Final metrics:", result);

      return result;
    },
  });
}

// Fetch fitness metrics
export function useFitnessMetrics(dateRange: string) {
  const user = useAuth();

  return useQuery<FitnessMetrics>({
    queryKey: ["fitnessMetrics", dateRange],
    queryFn: async () => {
      // Calculate date ranges based on selected range
      const today = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case "week":
          startDate.setDate(today.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(today.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(today.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(today.getMonth() - 1); // Default to month
      }

      console.log("Fetching fitness records with params:", {
        userId: user?.user?.id,
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
        dateRange,
      });

      // Get current records (from half of the period to now)
      const midPoint = new Date((today.getTime() + startDate.getTime()) / 2);

      const { data: currentRecords, error: currentError } = await supabase
        .from("fitness_records")
        .select("*")
        .eq("user_id", user?.user?.id)
        .gte("date", midPoint.toISOString().split("T")[0])
        .lte("date", today.toISOString().split("T")[0])
        .order("date", { ascending: false });

      // Get previous records (from start to mid point)
      const { data: previousRecords, error: previousError } = await supabase
        .from("fitness_records")
        .select("*")
        .eq("user_id", user?.user?.id)
        .gte("date", startDate.toISOString().split("T")[0])
        .lt("date", midPoint.toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (currentError) throw currentError;
      if (previousError) throw previousError;

      console.log("Retrieved fitness records:", {
        current: currentRecords,
        previous: previousRecords,
      });

      const calculateScore = (records: FitnessRecord[]) => {
        if (!records?.length) return 0;

        // Group records by exercise type to get latest value for each
        const latestByType = records.reduce(
          (acc: Record<string, FitnessRecord>, record) => {
            if (
              !acc[record.exercise_type || ""] ||
              new Date(record.date) >
                new Date(acc[record.exercise_type || ""].date)
            ) {
              acc[record.exercise_type || ""] = record;
            }
            return acc;
          },
          {}
        );

        // Calculate percentage of target achieved for each exercise type
        const scores = Object.values(latestByType).map((record) => {
          const target =
            record.target_value || getDefaultTarget(record.exercise_type);
          const percentage = ((record.value || 0) / target) * 100;
          console.log("Exercise score:", {
            type: record.exercise_type,
            value: record.value,
            target,
            percentage: parseFloat(percentage.toFixed(1)),
          });
          return percentage;
        });

        // Return average score across all exercises (rounded to 1 decimal place)
        const averageScore =
          scores.length > 0
            ? parseFloat(
                (
                  scores.reduce((sum, score) => sum + score, 0) / scores.length
                ).toFixed(1)
              )
            : 0;

        console.log("Average score:", averageScore);
        return averageScore;
      };

      const currentScore = calculateScore(currentRecords || []);
      const previousScore = calculateScore(previousRecords || []);

      const result = {
        currentScore,
        previousScore,
        improvement: currentScore - previousScore,
      };

      console.log("Final fitness metrics:", result);
      return result;
    },
  });
}

// Helper function to get default target values for each exercise type
function getDefaultTarget(exerciseType: string | null): number {
  switch (exerciseType) {
    case "Push-ups":
      return 50;
    case "Pull-ups":
      return 10;
    case "Sit-ups":
      return 50;
    case "Crunches":
      return 50;
    case "Basketball Throw":
      return 25;
    case "Shuttle Run":
      return 10; // in seconds
    case "1-Mile Run":
      return 8 * 60; // 8 minutes in seconds
    default:
      return 100;
  }
}

// Fetch application progress
export function useApplicationProgress(dateRange: string) {
  const user = useAuth();

  return useQuery<ApplicationProgress>({
    queryKey: ["applicationProgress", dateRange],
    queryFn: async () => {
      console.log("Checking all goals categories first");

      // First get all goals to see what categories we have
      const { data: allGoals, error: allGoalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user?.user?.id);

      if (allGoalsError) throw allGoalsError;

      // Find all unique categories
      const categories = Array.from(
        new Set(allGoals?.map((g) => g.category) || [])
      );
      console.log("Available goal categories:", categories);

      // Find application-related category by checking case-insensitive
      const applicationCategory =
        categories.find((cat) => cat?.toLowerCase().includes("application")) ||
        "Application";

      console.log("Using application category:", applicationCategory);

      // Calculate date range
      const today = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case "week":
          startDate.setDate(today.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(today.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(today.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(today.getMonth() - 1);
      }

      console.log("Fetching application goals with params:", {
        userId: user?.user?.id,
        category: applicationCategory,
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
        dateRange,
      });

      // Get current goals
      const { data: goals, error } = await supabase
        .from("goals")
        .select("*")
        .eq("category", applicationCategory)
        .eq("user_id", user?.user?.id);

      if (error) throw error;

      console.log("Retrieved goals:", goals);

      const total = goals?.length || 0;

      // Consider a goal completed if status is "completed" or progress is 100%
      const completed =
        goals?.filter((g: Goal) => {
          const isCompleted =
            g.status?.toLowerCase() === "completed" ||
            g.completed === true ||
            g.progress === 100;
          console.log("Goal completion check:", {
            id: g.id,
            title: g.title,
            status: g.status,
            completed: g.completed,
            progress: g.progress,
            isCompleted,
          });
          return isCompleted;
        })?.length || 0;

      const percentageComplete =
        total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0;

      // Get previous period's goals for comparison
      const previousEndDate = startDate;
      const previousStartDate = new Date(startDate);
      switch (dateRange) {
        case "week":
          previousStartDate.setDate(previousStartDate.getDate() - 7);
          break;
        case "month":
          previousStartDate.setMonth(previousStartDate.getMonth() - 1);
          break;
        case "quarter":
          previousStartDate.setMonth(previousStartDate.getMonth() - 3);
          break;
        case "year":
          previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
          break;
      }

      const { data: previousGoals } = await supabase
        .from("goals")
        .select("*")
        .eq("category", applicationCategory)
        .eq("user_id", user?.user?.id);

      console.log("Retrieved previous goals:", previousGoals);

      const previousTotal = previousGoals?.length || 0;
      const previousCompleted =
        previousGoals?.filter(
          (g: Goal) =>
            g.status?.toLowerCase() === "completed" ||
            g.completed === true ||
            g.progress === 100
        )?.length || 0;

      const previousPercentage =
        previousTotal > 0
          ? parseFloat(((previousCompleted / previousTotal) * 100).toFixed(1))
          : 0;

      const result = {
        total,
        completed,
        percentage: percentageComplete,
        previousPercentage,
        percentageComplete,
      };

      console.log("Final application progress:", result);
      return result;
    },
  });
}

// Fetch study time distribution
export function useStudyTimeDistribution(dateRange: string) {
  const user = useAuth();

  return useQuery<StudyTimeDistribution[]>({
    queryKey: ["studyDistribution", dateRange],
    queryFn: async () => {
      const { data: sessions, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user?.user?.id);

      if (error) throw error;

      const distribution = sessions?.reduce(
        (acc: { [key: string]: number }, session: StudySession) => {
          const hours = session.duration_minutes / 60;
          acc[session.subject] = (acc[session.subject] || 0) + hours;
          return acc;
        },
        {}
      );

      return Object.entries(distribution || {}).map(
        ([subject, hours]: [string, unknown]) => ({
          subject,
          hours: Number((hours as number).toFixed(1)),
        })
      );
    },
  });
}

// Fetch grade trends
export function useGradeTrends(dateRange: string) {
  const user = useAuth();

  return useQuery<GradeTrend[]>({
    queryKey: ["gradeTrends", dateRange],
    queryFn: async () => {
      const { data: courses, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user?.user?.id)
        .order("year", { ascending: true });

      if (error) throw error;

      const trends = courses?.reduce(
        (acc: { [key: string]: number[] }, course: Course) => {
          const key = `${course.year}-${course.semester}`;
          if (course.grade) {
            const gradeValue = Number(course.grade) || 0;
            acc[key] = [...(acc[key] || []), gradeValue];
          }
          return acc;
        },
        {}
      );

      return Object.entries(trends || {}).map(([date, grades]) => ({
        date,
        average:
          (grades as number[]).reduce(
            (sum: number, grade: number) => sum + grade,
            0
          ) / (grades as number[]).length,
      }));
    },
  });
}

// Fetch fitness progress
export function useFitnessProgress(dateRange: string) {
  const user = useAuth();

  return useQuery<Record<string, FitnessProgress>>({
    queryKey: ["fitnessProgress", dateRange],
    queryFn: async () => {
      const { data: records, error } = await supabase
        .from("fitness_records")
        .select("*")
        .eq("user_id", user?.user?.id)
        .order("date", { ascending: true });

      if (error) throw error;

      return records?.reduce(
        (acc: Record<string, FitnessProgress>, record: FitnessRecord) => {
          const date = record.date;
          if (!acc[date]) {
            acc[date] = {
              date,
              pushups: 0,
              situps: 0,
              pullups: 0,
              crunches: 0,
              basketball: 0,
              shuttle_run: 0,
              mile_run: 0,
            };
          }

          switch (record.exercise_type) {
            case "Shuttle Run":
              acc[date].shuttle_run = record.value || 0;
              break;
            case "Crunches":
              acc[date].crunches = record.value || 0;
              break;
            case "Basketball Throw":
              acc[date].basketball = record.value || 0;
              break;
            case "1-Mile Run":
              acc[date].mile_run = record.value || 0;
              break;
            case "Push-ups":
              acc[date].pushups = record.value || 0;
              break;
            case "Pull-ups":
              acc[date].pullups = record.value || 0;
              break;
            case "Sit-ups":
              acc[date].situps = record.value || 0;
              break;
          }

          return acc;
        },
        {}
      );
    },
  });
}

// Fetch task completion rates
export function useTaskCompletionRates(dateRange: string) {
  const user = useAuth();

  return useQuery<Record<string, TaskCompletion>>({
    queryKey: ["taskCompletion", dateRange],
    queryFn: async () => {
      const { data: goals, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user?.user?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const completion: Record<string, TaskCompletion> = {};

      goals?.forEach((goal: Goal) => {
        const date = new Date(goal.created_at).toISOString().split("T")[0];
        if (!completion[date]) {
          completion[date] = {
            date,
            rate: 0,
          };
        }

        const totalOnDate = goals.filter(
          (g: Goal) =>
            new Date(g.created_at).toISOString().split("T")[0] === date
        ).length;

        const completedOnDate = goals.filter(
          (g: Goal) =>
            new Date(g.created_at).toISOString().split("T")[0] === date &&
            g.completed
        ).length;

        completion[date].rate = (completedOnDate / totalOnDate) * 100;
      });

      return completion;
    },
  });
}

// Fetch pomodoro statistics
export function usePomodoroStats(dateRange: string) {
  const user = useAuth();
  return useQuery<Record<string, PomodoroStats>>({
    queryKey: ["pomodoroStats", dateRange],
    queryFn: async () => {
      const { data: sessions, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user?.user?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return sessions?.reduce(
        (acc: Record<string, PomodoroStats>, session: StudySession) => {
          const date = new Date(session.created_at).toISOString().split("T")[0];
          if (!acc[date]) {
            acc[date] = {
              date,
              sessions: 0,
              totalMinutes: 0,
            };
          }

          acc[date].sessions++;
          acc[date].totalMinutes += session.duration_minutes;

          return acc;
        },
        {}
      );
    },
  });
}
