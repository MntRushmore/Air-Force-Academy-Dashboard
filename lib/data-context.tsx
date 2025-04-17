"use client"

import type React from "react"
import { createContext, useState, useContext, type Dispatch, type SetStateAction } from "react"
import { v4 as uuidv4 } from "uuid"
import { calculateGPA } from "@/lib/gpa-utils"
import { calculateExerciseScore } from "@/lib/fitness-utils"

// Define types for Course, Grade, and Exercise
export interface Course {
  id: string
  name: string
  credits: number
}

export interface Grade {
  id: string
  courseId: string
  grade: number
}

export interface Exercise {
  id: string
  name: string
  current: number
}

// Define the shape of our context
interface DataContextProps {
  courses: Course[]
  grades: Grade[]
  exercises: Exercise[]
  gender: "male" | "female"
  addCourse: (course: Omit<Course, "id">) => void
  updateCourse: (course: Course) => void
  deleteCourse: (id: string) => void
  addGrade: (grade: Omit<Grade, "id">) => void
  updateGrade: (grade: Grade) => void
  deleteGrade: (id: string) => void
  addExercise: (exercise: Omit<Exercise, "id">) => void
  updateExercise: (exercise: Exercise) => void
  deleteExercise: (id: string) => void
  setGender: Dispatch<SetStateAction<"male" | "female">>
  gpa: number
  cfaScore: number
}

// Create the context with a default value
const DataContext = createContext<DataContextProps>({
  courses: [],
  grades: [],
  exercises: [],
  gender: "male",
  addCourse: () => {},
  updateCourse: () => {},
  deleteCourse: () => {},
  addGrade: () => {},
  updateGrade: () => {},
  deleteGrade: () => {},
  addExercise: () => {},
  updateExercise: () => {},
  deleteExercise: () => {},
  setGender: () => {},
  gpa: 0,
  cfaScore: 0,
})

// Create a provider component
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [gender, setGender] = useState<"male" | "female">("male")

  // GPA Calculation
  const gpa = calculateGPA(courses, grades)

  // CFA Score Calculation
  const calculateCFAScore = (): number => {
    if (exercises.length === 0) return 0

    const cfaExercises = ["Basketball Throw", "Pull-ups", "Shuttle Run", "Crunches", "Push-ups", "1-Mile Run"]

    let totalScore = 0
    let exerciseCount = 0

    for (const exerciseName of cfaExercises) {
      const exercise = exercises.find((e) => e.name === exerciseName)
      if (!exercise) continue

      const score = calculateExerciseScore(exerciseName, exercise.current, gender)
      totalScore += score
      exerciseCount++
    }

    return exerciseCount > 0 ? Math.round(totalScore / exerciseCount) : 0
  }

  const cfaScore = calculateCFAScore()

  // CRUD operations for Courses
  const addCourse = (course: Omit<Course, "id">) => {
    setCourses([...courses, { ...course, id: uuidv4() }])
  }

  const updateCourse = (course: Course) => {
    setCourses(courses.map((c) => (c.id === course.id ? course : c)))
  }

  const deleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id))
    setGrades(grades.filter((g) => g.courseId !== id)) // Also delete associated grades
  }

  // CRUD operations for Grades
  const addGrade = (grade: Omit<Grade, "id">) => {
    setGrades([...grades, { ...grade, id: uuidv4() }])
  }

  const updateGrade = (grade: Grade) => {
    setGrades(grades.map((g) => (g.id === grade.id ? grade : g)))
  }

  const deleteGrade = (id: string) => {
    setGrades(grades.filter((g) => g.id !== id))
  }

  // CRUD operations for Exercises
  const addExercise = (exercise: Omit<Exercise, "id">) => {
    setExercises([...exercises, { ...exercise, id: uuidv4() }])
  }

  const updateExercise = (exercise: Exercise) => {
    setExercises(exercises.map((e) => (e.id === exercise.id ? exercise : e)))
  }

  const deleteExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id))
  }

  // Provide the context value
  return (
    <DataContext.Provider
      value={{
        courses,
        grades,
        exercises,
        gender,
        addCourse,
        updateCourse,
        deleteCourse,
        addGrade,
        updateGrade,
        deleteGrade,
        addExercise,
        updateExercise,
        deleteExercise,
        setGender,
        gpa,
        cfaScore,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// Create a custom hook to use the context
export const useData = () => useContext(DataContext)
