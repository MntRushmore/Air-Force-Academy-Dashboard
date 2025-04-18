import Dexie, { type Table } from "dexie"

// Improved openDB function with proper compatibility methods
export const openDB = async () => {
  // This is a compatibility function to maintain the API
  return {
    get: async (storeName: string, key: string) => {
      // Map to the appropriate Dexie table and get the item
      if (storeName === "settings") {
        return await db.settings.where("key").equals(key).first()
      }
      return null
    },
    put: async (storeName: string, value: any) => {
      // Map to the appropriate Dexie table and put the item
      if (storeName === "settings") {
        const existingItem = await db.settings
          .where("key")
          .equals(value.key || value.id)
          .first()
        if (existingItem) {
          await db.settings.update(existingItem.id!, value)
          return existingItem.id
        } else {
          return await db.settings.add({
            ...value,
            key: value.key || value.id,
            createdAt: new Date(),
          })
        }
      }
      return null
    },
    transaction: async (storeName: string, mode: "readonly" | "readwrite") => {
      return {
        objectStore: (name: string) => {
          // Simple mapping to Dexie tables
          const tableMap: Record<string, Table> = {
            settings: db.settings,
          }
          return tableMap[name]
        },
      }
    },
    objectStoreNames: {
      contains: (name: string) =>
        [
          "settings",
          "tasks",
          "events",
          "journalEntries",
          "meetingLogs",
          "mentors",
          "questions",
          "exercises",
          "goals",
          "courses",
          "grades",
        ].includes(name),
    },
    createObjectStore: (name: string) => {
      console.log(`Creating object store ${name} (compatibility mode)`)
      return null
    },
  }
}

// Define types for our database tables
export interface Task {
  id?: string
  title: string
  description: string
  dueDate: string
  priority: "high" | "medium" | "low"
  completed: boolean
  subject: string
  createdAt?: Date
}

export interface Event {
  id?: string
  title: string
  date: string
  startTime: string
  endTime: string
  type: "study" | "class" | "exam" | "other"
  createdAt?: Date
}

export interface JournalEntry {
  id?: string
  title: string
  content: string
  date: string
  category: string
  tags: string[]
  mood: string
  createdAt?: Date
}

export interface MeetingLog {
  id?: string
  mentorId: string
  date: string
  duration: string
  topics: string
  notes: string
  followUp: string
  createdAt?: Date
}

export interface Mentor {
  id?: string
  name: string
  role: string
  expertise: string[]
  avatar: string
  contact: string
  createdAt?: Date
}

export interface Question {
  id?: string
  question: string
  answer: string
  category: string
  date: string
  status: "answered" | "pending"
  createdAt?: Date
}

export interface Exercise {
  id?: string
  name: string
  target: number
  current: number
  unit: string
  createdAt?: Date
}

export interface Goal {
  id?: string
  title: string
  category: string
  deadline: string
  progress: number
  completed: boolean
  createdAt?: Date
}

// New interfaces for course management
export interface Course {
  id?: string
  code: string
  name: string
  instructor: string
  credits: number
  semester: string
  year: number
  category: string // e.g., "STEM", "Humanities", "Physical Education"
  isAP: boolean
  notes: string
  createdAt?: Date
}

export interface Grade {
  id?: string
  courseId: string
  title: string
  type: "exam" | "quiz" | "homework" | "project" | "paper" | "participation" | "other"
  score: number
  maxScore: number
  weight: number // percentage weight in final grade
  date: string
  notes: string
  createdAt?: Date
}

// Settings interface for storing application settings
export interface Settings {
  id?: string
  key: string
  value: any
  createdAt?: Date
}

// Define our database
class USAFADashboardDB extends Dexie {
  tasks!: Table<Task>
  events!: Table<Event>
  journalEntries!: Table<JournalEntry>
  meetingLogs!: Table<MeetingLog>
  mentors!: Table<Mentor>
  questions!: Table<Question>
  exercises!: Table<Exercise>
  goals!: Table<Goal>
  courses!: Table<Course>
  grades!: Table<Grade>
  settings!: Table<Settings>

  constructor() {
    super("USAFADashboardDB")

    // Define tables and their primary keys and indexes
    this.version(3).stores({
      tasks: "++id, subject, dueDate, completed, priority, createdAt",
      events: "++id, date, type, createdAt",
      journalEntries: "++id, date, category, mood, createdAt",
      meetingLogs: "++id, mentorId, date, createdAt",
      mentors: "++id, name, role, createdAt",
      questions: "++id, category, status, createdAt",
      exercises: "++id, name, createdAt",
      goals: "++id, category, completed, deadline, createdAt",
      courses: "++id, code, name, semester, year, category, isAP, createdAt",
      grades: "++id, courseId, type, date, createdAt",
      settings: "++id, key, createdAt",
    })
  }
}

// Create and export a database instance
export const db = new USAFADashboardDB()

// Helper functions for common operations
export async function addItem<T>(table: Table<T>, item: T): Promise<string | number> {
  // Add createdAt timestamp to all items
  const itemWithTimestamp = {
    ...item,
    createdAt: new Date(),
  }
  return await table.add(itemWithTimestamp)
}

export async function updateItem<T>(table: Table<T>, id: string | number, changes: Partial<T>): Promise<void> {
  await table.update(id, changes)
}

export async function deleteItem<T>(table: Table<T>, id: string | number): Promise<void> {
  await table.delete(id)
}

export async function getAllItems<T>(table: Table<T>): Promise<T[]> {
  return await table.toArray()
}

// Initialize empty database
export async function initializeEmptyDB() {
  // No sample data - just ensure the database is created
  console.log("Database initialized with empty tables")
}

// CSV Import for grades
export async function importGradesFromCSV(courseId: string, csvContent: string): Promise<void> {
  try {
    // Parse CSV content
    const lines = csvContent.split("\n")
    const headers = lines[0].split(",")

    // Find indices for required columns
    const titleIndex = headers.findIndex((h) => h.toLowerCase().includes("title") || h.toLowerCase().includes("name"))
    const typeIndex = headers.findIndex((h) => h.toLowerCase().includes("type") || h.toLowerCase().includes("category"))
    const scoreIndex = headers.findIndex((h) => h.toLowerCase().includes("score") || h.toLowerCase().includes("points"))
    const maxScoreIndex = headers.findIndex((h) => h.toLowerCase().includes("max") || h.toLowerCase().includes("total"))
    const weightIndex = headers.findIndex(
      (h) => h.toLowerCase().includes("weight") || h.toLowerCase().includes("percent"),
    )
    const dateIndex = headers.findIndex((h) => h.toLowerCase().includes("date"))

    // Validate required columns
    if (titleIndex === -1 || scoreIndex === -1) {
      throw new Error("CSV must contain at least 'title/name' and 'score' columns")
    }

    // Process data rows
    const grades: Grade[] = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split(",")

      const grade: Grade = {
        courseId,
        title: values[titleIndex].trim(),
        type: typeIndex !== -1 ? mapGradeType(values[typeIndex].trim()) : "other",
        score: Number.parseFloat(values[scoreIndex].trim()),
        maxScore: maxScoreIndex !== -1 ? Number.parseFloat(values[maxScoreIndex].trim()) : 100,
        weight: weightIndex !== -1 ? Number.parseFloat(values[weightIndex].trim()) : 1,
        date: dateIndex !== -1 ? values[dateIndex].trim() : new Date().toISOString().split("T")[0],
        notes: "",
      }

      grades.push(grade)
    }

    // Add all grades to database
    await db.grades.bulkAdd(grades)

    return
  } catch (error) {
    console.error("Error importing grades:", error)
    throw error
  }
}

// Helper function to map grade types
function mapGradeType(type: string): Grade["type"] {
  type = type.toLowerCase()
  if (type.includes("exam") || type.includes("test")) return "exam"
  if (type.includes("quiz")) return "quiz"
  if (type.includes("homework") || type.includes("hw")) return "homework"
  if (type.includes("project")) return "project"
  if (type.includes("paper") || type.includes("essay")) return "paper"
  if (type.includes("participation")) return "participation"
  return "other"
}

// Calculate GPA
export function calculateGPA(courses: Course[], grades: Grade[]): number {
  if (courses.length === 0) return 0

  let totalPoints = 0
  let totalCredits = 0

  for (const course of courses) {
    // Calculate course grade
    const courseGrades = grades.filter((g) => g.courseId === course.id)
    if (courseGrades.length === 0) continue

    let weightedSum = 0
    let weightSum = 0

    for (const grade of courseGrades) {
      const percentage = (grade.score / grade.maxScore) * 100
      weightedSum += percentage * grade.weight
      weightSum += grade.weight
    }

    const coursePercentage = weightSum > 0 ? weightedSum / weightSum : 0
    const gradePoints = percentageToGradePoints(coursePercentage, course.isAP)

    totalPoints += gradePoints * course.credits
    totalCredits += course.credits
  }

  return totalCredits > 0 ? totalPoints / totalCredits : 0
}

// Helper function to convert percentage to grade points
function percentageToGradePoints(percentage: number, isAP: boolean): number {
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

// Settings helper functions
export async function getSetting(key: string): Promise<any> {
  try {
    const setting = await db.settings.where("key").equals(key).first()
    return setting?.value
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error)
    return null
  }
}

export async function setSetting(key: string, value: any): Promise<void> {
  try {
    const existingSetting = await db.settings.where("key").equals(key).first()

    if (existingSetting) {
      await db.settings.update(existingSetting.id!, { value })
    } else {
      await db.settings.add({
        key,
        value,
        createdAt: new Date(),
      })
    }
  } catch (error) {
    console.error(`Error setting ${key}:`, error)
    throw error
  }
}
