import Dexie, { type Table } from 'dexie'

// Improved openDB function with proper compatibility methods
export const openDB = async () => {
  return {
    get: async (storeName: string, key: string) => {
      if (storeName === "settings") {
        return await db.settings.where("key").equals(key).first()
      }
      return null
    },
    put: async (storeName: string, value: any) => {
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
          "assignments",
        ].includes(name),
    },
    createObjectStore: (name: string) => {
      console.log(`Creating object store ${name} (compatibility mode)`)
      return null
    },
  }
}

// Interfaces
export interface Task { id?: string; title: string; description: string; due_date: string; priority: 'high' | 'medium' | 'low'; completed: boolean; subject: string; created_at?: Date }
export interface Event { id?: string; title: string; date: string; start_time: string; end_time: string; type: 'study' | 'class' | 'exam' | 'other'; created_at?: Date }
export interface JournalEntry { id?: string; title: string; content: string; date: string; category: string; tags: string[]; mood: string; created_at?: Date }
export interface MeetingLog { id?: string; mentor_id: string; date: string; duration: string; topics: string; notes: string; follow_up: string; created_at?: Date }
export interface Mentor { id?: string; name: string; role: string; expertise: string[]; avatar: string; contact: string; created_at?: Date }
export interface Question { id?: string; question: string; answer: string; category: string; date: string; status: 'answered' | 'pending'; created_at?: Date }
export interface Exercise { id?: string; name: string; target: number; current: number; unit: string; created_at?: Date }
export interface Goal { id?: string; title: string; category: string; deadline: string; progress: number; completed: boolean; created_at?: Date }
export interface Assignment { id?: string; course_id: string; title: string; max_score: number; weight: number; due_date: string; created_at?: Date }
export interface Course { id?: string; code: string; name: string; instructor: string; credits: number; semester: string; year: number; category: string; is_ap: boolean; notes: string; created_at?: Date }
export interface Grade { id?: string; assignment_id: string; score_received: number; created_at?: Date }
export interface Settings { id?: string; key: string; value: any; createdAt?: Date }

// Database
class USAFADashboardDB extends Dexie {
  tasks!: Table<Task>;
  events!: Table<Event>;
  journalEntries!: Table<JournalEntry>;
  meetingLogs!: Table<MeetingLog>;
  mentors!: Table<Mentor>;
  questions!: Table<Question>;
  exercises!: Table<Exercise>;
  goals!: Table<Goal>;
  courses!: Table<Course>;
  grades!: Table<Grade>;
  settings!: Table<Settings>;
  assignments!: Table<Assignment>;

  constructor() {
    super("USAFADashboardDB");
    this.version(3).stores({
      tasks: "++id, subject, due_date, completed, priority, created_at",
      events: "++id, date, type, created_at",
      journalEntries: "++id, date, category, mood, created_at",
      meetingLogs: "++id, mentor_id, date, created_at",
      mentors: "++id, name, role, created_at",
      questions: "++id, category, status, created_at",
      exercises: "++id, name, created_at",
      goals: "++id, category, completed, deadline, created_at",
      courses: "++id, code, name, semester, year, category, is_ap, created_at",
      grades: "++id, assignment_id, score_received, created_at",
      settings: "++id, key, createdAt",
      assignments: "++id, course_id, title, created_at",
    });
  }
}

export const db = new USAFADashboardDB()

// DB Operations
export async function addItem<T>(table: Table<T>, item: T): Promise<string | number> {
  const itemWithTimestamp = { ...item, created_at: new Date() };
  return await table.add(itemWithTimestamp);
}

export async function updateItem<T>(table: Table<T>, id: string | number, changes: Partial<T>): Promise<void> {
  await table.update(id, changes as any);
}

export async function deleteItem<T>(table: Table<T>, id: string | number): Promise<void> {
  await table.delete(id);
}

export async function getAllItems<T>(table: Table<T>): Promise<T[]> {
  return await table.toArray();
}

// Initialization
export async function initializeEmptyDB() {
  console.log("Database initialized with empty tables");
}

// CSV Import
export async function importGradesFromCSV(courseId: string, csvContent: string): Promise<void> {
  try {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');

    const scoreIndex = headers.findIndex((h) => h.toLowerCase().includes('score'));
    if (scoreIndex === -1) {
      throw new Error("CSV must contain a 'score' column");
    }

    const grades: Grade[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',');
      const grade: Grade = {
        assignment_id: "",
        score_received: Number.parseFloat(values[scoreIndex].trim()),
        created_at: new Date(),
      };
      grades.push(grade);
    }

    await db.grades.bulkAdd(grades);
  } catch (error) {
    console.error('Error importing grades:', error);
    throw error;
  }
}

// GPA Calculation (✅ FIXED)
export async function calculateGPA(courses: Course[], grades: Grade[]): Promise<number> {
  if (courses.length === 0) return 0;

  const assignments = await db.assignments.toArray();
  const assignmentCourseMap = new Map<string, string>();
  for (const assignment of assignments) {
    if (assignment.id && assignment.course_id) {
      assignmentCourseMap.set(assignment.id, assignment.course_id);
    }
  }

  let totalPoints = 0;
  let totalCredits = 0;

  for (const course of courses) {
    const courseGrades = grades.filter((grade) => {
      const courseId = assignmentCourseMap.get(grade.assignment_id);
      return courseId === course.id;
    });

    if (courseGrades.length === 0) continue;

    let sum = 0;
    for (const grade of courseGrades) {
      sum += (grade.score_received / 100) * 100;
    }

    const average = sum / courseGrades.length;
    const gradePoints = percentageToGradePoints(average, course.is_ap);

    totalPoints += gradePoints * course.credits;
    totalCredits += course.credits;
  }

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

// Grade Helper
function percentageToGradePoints(percentage: number, isAP: boolean): number {
  let points = 0;

  if (percentage >= 97) points = 4.0;
  else if (percentage >= 93) points = 4.0;
  else if (percentage >= 90) points = 3.7;
  else if (percentage >= 87) points = 3.3;
  else if (percentage >= 83) points = 3.0;
  else if (percentage >= 80) points = 2.7;
  else if (percentage >= 77) points = 2.3;
  else if (percentage >= 73) points = 2.0;
  else if (percentage >= 70) points = 1.7;
  else if (percentage >= 67) points = 1.3;
  else if (percentage >= 63) points = 1.0;
  else if (percentage >= 60) points = 0.7;
  else points = 0.0;

  if (isAP) points = Math.min(4.0, points + 1.0);
  return points;
}

// Settings Management
export async function getSetting(key: string): Promise<any> {
  try {
    const setting = await db.settings.where("key").equals(key).first();
    return setting?.value;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return null;
  }
}

export async function setSetting(key: string, value: any): Promise<void> {
  try {
    const existingSetting = await db.settings.where("key").equals(key).first();

    if (existingSetting) {
      await db.settings.update(existingSetting.id!, { value });
    } else {
      await db.settings.add({ key, value, createdAt: new Date() });
    }
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
}