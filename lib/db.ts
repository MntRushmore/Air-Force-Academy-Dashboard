import Dexie, { type Table } from "dexie"

// Define types for our database tables
export interface Course {
  id?: string
  code: string
  name: string
  instructor: string
  credits: number
  semester: string
  year: number
  category: string
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
  weight: number
  date: string
  notes: string
  createdAt?: Date
}

export interface Goal {
  id?: string
  title: string
  description: string
  targetDate: string
  completed: boolean
  category: string
  priority: "low" | "medium" | "high"
  progress: number
  createdAt?: Date
}

export interface JournalEntry {
  id?: string
  title: string
  content: string
  mood: string
  tags: string[]
  date: string
  createdAt?: Date
}

export interface FitnessRecord {
  id?: string
  date: string
  exerciseType: string
  duration: number
  distance?: number
  repetitions?: number
  sets?: number
  weight?: number
  notes: string
  createdAt?: Date
}

export interface Exercise {
  id?: string
  name: string
  target: number
  current: number
  unit: string
}

// Define the database
class AppDatabase extends Dexie {
  courses!: Table<Course>
  grades!: Table<Grade>
  goals!: Table<Goal>
  journalEntries!: Table<JournalEntry>
  fitnessRecords!: Table<FitnessRecord>
  exercises!: Table<Exercise>

  constructor() {
    super("usafaPrep")
    this.version(1).stores({
      courses: "++id, code, name, year, semester, category, isAP, createdAt",
      grades: "++id, courseId, title, type, date, createdAt",
      goals: "++id, title, category, priority, completed, targetDate, createdAt",
      journalEntries: "++id, title, date, mood, createdAt",
      fitnessRecords: "++id, date, exerciseType, createdAt",
      exercises: "++id, name, target, current, unit",
    })
  }
}

// Create and export the database instance
export const db = new AppDatabase()

// Helper function to add an item to a table
export async function addItem<T>(table: Table<T>, item: T): Promise<string> {
  const itemWithTimestamp = {
    ...item,
    createdAt: new Date(),
  }
  const id = await table.add(itemWithTimestamp)
  return id.toString()
}

// Helper function to delete an item from a table
export async function deleteItem<T>(table: Table<T>, id: string): Promise<void> {
  await table.delete(id)
}

// Helper function to update an item in a table
export async function updateItem<T>(table: Table<T>, id: string, changes: Partial<T>): Promise<void> {
  await table.update(id, changes)
}

// Helper function to import grades from CSV
export async function importGradesFromCSV(courseId: string, csvText: string): Promise<{ count: number }> {
  // Parse CSV
  const lines = csvText.split("\n")
  if (lines.length < 2) {
    throw new Error("CSV file must contain at least a header row and one data row")
  }

  // Get headers
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  // Required columns
  const requiredColumns = ["title", "type", "score", "maxscore", "weight"]

  // Check if all required columns exist
  for (const col of requiredColumns) {
    if (!headers.includes(col)) {
      throw new Error(`CSV file must contain a '${col}' column`)
    }
  }

  // Parse data rows
  const grades: Grade[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    const values = line.split(",").map((v) => v.trim())
    if (values.length !== headers.length) {
      throw new Error(`Line ${i + 1} has ${values.length} values, but header has ${headers.length} columns`)
    }

    // Create grade object
    const grade: Partial<Grade> = {
      courseId,
      notes: "",
      date: new Date().toISOString().split("T")[0],
    }

    // Map values to grade object
    headers.forEach((header, index) => {
      const value = values[index]

      switch (header) {
        case "title":
          grade.title = value
          break
        case "type":
          grade.type = value.toLowerCase() as Grade["type"]
          if (!["exam", "quiz", "homework", "project", "paper", "participation", "other"].includes(grade.type)) {
            grade.type = "other"
          }
          break
        case "score":
          grade.score = Number.parseFloat(value)
          break
        case "maxscore":
          grade.maxScore = Number.parseFloat(value)
          break
        case "weight":
          grade.weight = Number.parseFloat(value)
          break
        case "date":
          grade.date = value
          break
        case "notes":
          grade.notes = value
          break
      }
    })

    // Validate grade
    if (!grade.title || isNaN(grade.score!) || isNaN(grade.maxScore!) || isNaN(grade.weight!)) {
      throw new Error(`Invalid data in line ${i + 1}`)
    }

    grades.push(grade as Grade)
  }

  // Add grades to database
  for (const grade of grades) {
    await addItem(db.grades, grade)
  }

  return { count: grades.length }
}

// Initialize empty database
export async function initializeEmptyDB() {
  try {
    const courseCount = await db.courses.count()
    const gradeCount = await db.grades.count()
    const goalCount = await db.goals.count()
    const journalCount = await db.journalEntries.count()
    const fitnessCount = await db.fitnessRecords.count()

    console.log(
      `Database status: Courses: ${courseCount}, Grades: ${gradeCount}, Goals: ${goalCount}, Journal: ${journalCount}, Fitness: ${fitnessCount}`,
    )

    return {
      courseCount,
      gradeCount,
      goalCount,
      journalCount,
      fitnessCount,
    }
  } catch (error) {
    console.error("Error checking database:", error)
    throw error
  }
}
