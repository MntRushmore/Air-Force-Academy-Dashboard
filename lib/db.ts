import Dexie, { type Table } from "dexie"

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

  constructor() {
    super("USAFADashboardDB")

    // Define tables and their primary keys and indexes
    this.version(1).stores({
      tasks: "++id, subject, dueDate, completed, priority, createdAt",
      events: "++id, date, type, createdAt",
      journalEntries: "++id, date, category, mood, createdAt",
      meetingLogs: "++id, mentorId, date, createdAt",
      mentors: "++id, name, role, createdAt",
      questions: "++id, category, status, createdAt",
      exercises: "++id, name, createdAt",
      goals: "++id, category, completed, deadline, createdAt",
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

// Initialize with sample data if the database is empty
export async function initializeDBWithSampleData() {
  // Check if we already have data
  const taskCount = await db.tasks.count()

  if (taskCount > 0) {
    return // Database already has data
  }

  // Sample tasks
  const sampleTasks: Task[] = [
    {
      id: "1",
      title: "Complete Calculus Problem Set",
      description: "Chapters 4-5 exercises",
      dueDate: "2023-11-15",
      priority: "high",
      completed: false,
      subject: "Mathematics",
    },
    {
      id: "2",
      title: "Physics Lab Report",
      description: "Write up results from the momentum experiment",
      dueDate: "2023-11-18",
      priority: "medium",
      completed: false,
      subject: "Physics",
    },
    {
      id: "3",
      title: "English Essay Draft",
      description: "First draft of analysis paper",
      dueDate: "2023-11-20",
      priority: "medium",
      completed: false,
      subject: "English",
    },
    {
      id: "4",
      title: "SAT Practice Test",
      description: "Complete full practice test with timing",
      dueDate: "2023-11-12",
      priority: "high",
      completed: true,
      subject: "Test Prep",
    },
  ]

  // Sample events
  const sampleEvents: Event[] = [
    {
      id: "1",
      title: "AP Calculus",
      date: "2023-11-13",
      startTime: "08:00",
      endTime: "09:30",
      type: "class",
    },
    {
      id: "2",
      title: "Physics Study Group",
      date: "2023-11-13",
      startTime: "16:00",
      endTime: "17:30",
      type: "study",
    },
    {
      id: "3",
      title: "English Literature",
      date: "2023-11-14",
      startTime: "10:00",
      endTime: "11:30",
      type: "class",
    },
    {
      id: "4",
      title: "Chemistry Midterm",
      date: "2023-11-17",
      startTime: "13:00",
      endTime: "15:00",
      type: "exam",
    },
  ]

  // Sample journal entries
  const sampleJournalEntries: JournalEntry[] = [
    {
      id: "1",
      title: "Congressional Nomination Interview",
      content:
        "Today I had my interview for the congressional nomination. I was nervous at first, but I think it went well. The panel asked about my leadership experience, academic goals, and why I want to attend USAFA. I emphasized my commitment to service and my passion for aerospace engineering. They seemed impressed by my water polo achievements and community service work. I need to follow up with a thank you email tomorrow.",
      date: "2023-11-10",
      category: "Application",
      tags: ["interview", "congressional nomination", "USAFA"],
      mood: "excited",
    },
    {
      id: "2",
      title: "Physics Test Preparation",
      content:
        "Spent 3 hours studying for the AP Physics C exam. Focused on rotational mechanics and magnetism, which have been challenging. Worked through 20 practice problems and reviewed my notes from the last two weeks. I'm feeling more confident about the concepts, but I still need to work on time management during problem-solving. Planning to do a full practice test this weekend to gauge my readiness.",
      date: "2023-11-08",
      category: "Academic",
      tags: ["physics", "AP exam", "study"],
      mood: "focused",
    },
    {
      id: "3",
      title: "Water Polo Tournament Reflection",
      content:
        "We won the regional championship today! The final game was intense - tied until the last quarter when I scored the winning goal. Coach said my defensive positioning has improved significantly. I need to work on my passing accuracy under pressure. The team chemistry is really strong this season, and I'm proud of how we've all developed. This experience has taught me a lot about leadership and performing under pressure - both skills that will be valuable at USAFA.",
      date: "2023-11-05",
      category: "Fitness",
      tags: ["water polo", "competition", "leadership"],
      mood: "proud",
    },
  ]

  // Sample mentors
  const sampleMentors: Mentor[] = [
    {
      id: "1",
      name: "Col. James Wilson",
      role: "USAFA Admissions Officer",
      expertise: ["Admissions", "Leadership", "Military Preparation"],
      avatar: "/placeholder.svg",
      contact: "james.wilson@example.com",
    },
    {
      id: "2",
      name: "Capt. Sarah Johnson",
      role: "USAFA Graduate",
      expertise: ["Academics", "Cadet Life", "Physical Training"],
      avatar: "/placeholder.svg",
      contact: "sarah.johnson@example.com",
    },
    {
      id: "3",
      name: "Dr. Michael Chen",
      role: "Academic Advisor",
      expertise: ["STEM Subjects", "Research", "Academic Planning"],
      avatar: "/placeholder.svg",
      contact: "michael.chen@example.com",
    },
  ]

  // Sample meeting logs
  const sampleMeetingLogs: MeetingLog[] = [
    {
      id: "1",
      mentorId: "1",
      date: "2023-11-05",
      duration: "45 minutes",
      topics: "Application strategy, Congressional nomination process",
      notes:
        "Col. Wilson advised to start the nomination process early and provided contacts for local representatives.",
      followUp: "Research congressional nomination requirements and prepare initial application materials.",
    },
    {
      id: "2",
      mentorId: "2",
      date: "2023-10-28",
      duration: "30 minutes",
      topics: "Physical fitness preparation, CFA requirements",
      notes: "Capt. Johnson recommended specific training regimen for improving pull-ups and mile run time.",
      followUp: "Implement new workout plan and track progress weekly.",
    },
  ]

  // Sample questions
  const sampleQuestions: Question[] = [
    {
      id: "1",
      question: "What are the most important factors in a successful USAFA application?",
      answer:
        "A successful USAFA application requires excellence in academics (strong GPA and test scores), leadership (demonstrated through extracurricular activities), physical fitness (preparation for the CFA), and character (recommendations and interviews). Additionally, securing a congressional nomination is a critical step in the process.",
      category: "Admissions",
      date: "2023-10-20",
      status: "answered",
    },
    {
      id: "2",
      question: "How should I prepare for the Candidate Fitness Assessment?",
      answer:
        "The CFA consists of six events: basketball throw, pull-ups, shuttle run, modified sit-ups, push-ups, and a one-mile run. Develop a balanced training program that addresses all components, with particular focus on your weaker areas. Aim to exceed the minimum requirements, as higher scores strengthen your application.",
      category: "Fitness",
      date: "2023-10-25",
      status: "answered",
    },
    {
      id: "3",
      question: "What academic courses should I prioritize in high school?",
      answer: "",
      category: "Academics",
      date: "2023-11-01",
      status: "pending",
    },
  ]

  // Sample exercises
  const sampleExercises: Exercise[] = [
    {
      id: "1",
      name: "Push-ups",
      target: 62,
      current: 45,
      unit: "reps",
    },
    {
      id: "2",
      name: "Sit-ups",
      target: 75,
      current: 60,
      unit: "reps",
    },
    {
      id: "3",
      name: "Pull-ups",
      target: 12,
      current: 8,
      unit: "reps",
    },
    {
      id: "4",
      name: "1-Mile Run",
      target: 6.5,
      current: 7.2,
      unit: "minutes",
    },
    {
      id: "5",
      name: "Shuttle Run",
      target: 8.1,
      current: 8.6,
      unit: "seconds",
    },
    {
      id: "6",
      name: "Basketball Throw",
      target: 70,
      current: 62,
      unit: "feet",
    },
  ]

  // Sample goals
  const sampleGoals: Goal[] = [
    {
      id: "1",
      title: "Complete SAT preparation",
      category: "Academic",
      deadline: "2023-12-15",
      progress: 75,
      completed: false,
    },
    {
      id: "2",
      title: "Run 3 miles under 21 minutes",
      category: "Fitness",
      deadline: "2023-11-30",
      progress: 90,
      completed: false,
    },
    {
      id: "3",
      title: "Submit congressional nomination",
      category: "Application",
      deadline: "2023-10-15",
      progress: 100,
      completed: true,
    },
    {
      id: "4",
      title: "Complete personal statement",
      category: "Application",
      deadline: "2023-11-01",
      progress: 60,
      completed: false,
    },
  ]

  // Add all sample data to the database
  await db.tasks.bulkAdd(sampleTasks)
  await db.events.bulkAdd(sampleEvents)
  await db.journalEntries.bulkAdd(sampleJournalEntries)
  await db.mentors.bulkAdd(sampleMentors)
  await db.meetingLogs.bulkAdd(sampleMeetingLogs)
  await db.questions.bulkAdd(sampleQuestions)
  await db.exercises.bulkAdd(sampleExercises)
  await db.goals.bulkAdd(sampleGoals)
}
