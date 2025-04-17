import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials. Check your .env.local file.")
  process.exit(1)
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log("Starting database seeding...")

  try {
    // Create a test user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: "test@usafaapp.com",
      password: "testpassword123",
      email_confirm: true,
      user_metadata: {
        full_name: "Test User",
      },
    })

    if (userError) {
      throw userError
    }

    const userId = userData.user.id
    console.log(`Created test user with ID: ${userId}`)

    // Update profile information
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: "Test User",
        academy: "USAFA",
        graduation_year: 2028,
        gender: "male",
      })
      .eq("id", userId)

    if (profileError) {
      throw profileError
    }

    // Add exercises
    const exercises = [
      { name: "Push-ups", target: 67, current: 45, unit: "reps" },
      { name: "Sit-ups", target: 58, current: 40, unit: "reps" },
      { name: "Pull-ups", target: 10, current: 6, unit: "reps" },
      { name: "Mile Run", target: 6.5, current: 7.2, unit: "minutes" },
    ]

    for (const exercise of exercises) {
      const { error } = await supabase.from("exercises").insert({
        user_id: userId,
        ...exercise,
      })

      if (error) {
        throw error
      }
    }

    console.log("Added exercises")

    // Add courses
    const courses = [
      {
        code: "MATH101",
        name: "Calculus I",
        instructor: "Dr. Smith",
        credits: 4,
        semester: "Fall",
        year: 2023,
        category: "Mathematics",
        is_ap: false,
      },
      {
        code: "PHYS201",
        name: "Physics I",
        instructor: "Dr. Johnson",
        credits: 4,
        semester: "Fall",
        year: 2023,
        category: "Science",
        is_ap: false,
      },
      {
        code: "ENG101",
        name: "English Composition",
        instructor: "Prof. Williams",
        credits: 3,
        semester: "Fall",
        year: 2023,
        category: "Humanities",
        is_ap: false,
      },
      {
        code: "HIST102",
        name: "American History",
        instructor: "Dr. Brown",
        credits: 3,
        semester: "Spring",
        year: 2024,
        category: "Social Sciences",
        is_ap: true,
      },
    ]

    const courseIds = []
    for (const course of courses) {
      const { data, error } = await supabase
        .from("courses")
        .insert({
          user_id: userId,
          ...course,
        })
        .select()

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        courseIds.push(data[0].id)
      }
    }

    console.log("Added courses")

    // Add grades for each course
    const gradeTypes = ["exam", "quiz", "homework", "project"]
    for (let i = 0; i < courseIds.length; i++) {
      for (let j = 0; j < 3; j++) {
        const type = gradeTypes[Math.floor(Math.random() * gradeTypes.length)]
        const score = 75 + Math.floor(Math.random() * 20) // Random score between 75-95

        const { error } = await supabase.from("grades").insert({
          user_id: userId,
          course_id: courseIds[i],
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${j + 1}`,
          type,
          score,
          max_score: 100,
          weight: 1,
          date: new Date(2023, 8 + j, 15).toISOString().split("T")[0], // Sept 15, Oct 15, Nov 15
        })

        if (error) {
          throw error
        }
      }
    }

    console.log("Added grades")

    // Add tasks
    const tasks = [
      {
        title: "Complete USAFA application",
        description: "Fill out all sections of the online application",
        due_date: "2023-12-15",
        priority: "high",
        subject: "Application",
      },
      {
        title: "Request recommendation letters",
        description: "Ask teachers and counselors for recommendation letters",
        due_date: "2023-11-01",
        priority: "high",
        subject: "Application",
      },
      {
        title: "Study for SAT",
        description: "Complete practice tests and review materials",
        due_date: "2023-10-20",
        priority: "medium",
        subject: "Test Prep",
      },
      {
        title: "Physical fitness training",
        description: "Prepare for the Candidate Fitness Assessment",
        due_date: "2023-12-01",
        priority: "medium",
        subject: "Fitness",
      },
    ]

    for (const task of tasks) {
      const { error } = await supabase.from("tasks").insert({
        user_id: userId,
        ...task,
        completed: false,
      })

      if (error) {
        throw error
      }
    }

    console.log("Added tasks")

    // Add events
    const events = [
      { title: "SAT Test Date", date: "2023-11-04", start_time: "08:00:00", end_time: "12:00:00", type: "exam" },
      {
        title: "USAFA Information Session",
        date: "2023-10-15",
        start_time: "18:00:00",
        end_time: "20:00:00",
        type: "other",
      },
      { title: "Study Group - Math", date: "2023-10-10", start_time: "16:00:00", end_time: "18:00:00", type: "study" },
      { title: "Physics Midterm", date: "2023-10-25", start_time: "10:00:00", end_time: "12:00:00", type: "exam" },
    ]

    for (const event of events) {
      const { error } = await supabase.from("events").insert({
        user_id: userId,
        ...event,
      })

      if (error) {
        throw error
      }
    }

    console.log("Added events")

    // Add journal entries
    const journalEntries = [
      {
        title: "Why I Want to Join USAFA",
        content: "Today I reflected on my motivations for applying to the Air Force Academy...",
        date: "2023-09-15",
        category: "Reflection",
        mood: "Motivated",
      },
      {
        title: "Physical Training Progress",
        content: "I've been working on improving my mile time and push-up count...",
        date: "2023-09-20",
        category: "Fitness",
        mood: "Determined",
      },
      {
        title: "Meeting with Alumni",
        content: "Had an inspiring conversation with a USAFA graduate today...",
        date: "2023-09-25",
        category: "Networking",
        mood: "Inspired",
      },
    ]

    for (const entry of journalEntries) {
      const { error } = await supabase.from("journal_entries").insert({
        user_id: userId,
        ...entry,
        tags: ["USAFA", "Application"],
      })

      if (error) {
        throw error
      }
    }

    console.log("Added journal entries")

    // Add mentors
    const mentors = [
      {
        name: "Capt. James Wilson",
        role: "USAFA Alumni",
        expertise: ["Leadership", "Application Process"],
        contact: "james.wilson@example.com",
      },
      {
        name: "Lt. Sarah Johnson",
        role: "Current Officer",
        expertise: ["Physical Training", "Military Protocol"],
        contact: "sarah.johnson@example.com",
      },
    ]

    const mentorIds = []
    for (const mentor of mentors) {
      const { data, error } = await supabase
        .from("mentors")
        .insert({
          user_id: userId,
          ...mentor,
        })
        .select()

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        mentorIds.push(data[0].id)
      }
    }

    console.log("Added mentors")

    // Add meeting logs
    if (mentorIds.length > 0) {
      const meetingLogs = [
        {
          mentor_id: mentorIds[0],
          date: "2023-09-10",
          duration: "45 minutes",
          topics: "Application strategy, Essay review",
          notes: "Capt. Wilson provided valuable feedback on my personal statement.",
          follow_up: "Revise essay by next week",
        },
        {
          mentor_id: mentorIds[1],
          date: "2023-09-17",
          duration: "60 minutes",
          topics: "Physical fitness preparation",
          notes: "Lt. Johnson shared workout routines specific to the CFA requirements.",
          follow_up: "Implement new training schedule",
        },
      ]

      for (const log of meetingLogs) {
        const { error } = await supabase.from("meeting_logs").insert({
          user_id: userId,
          ...log,
        })

        if (error) {
          throw error
        }
      }

      console.log("Added meeting logs")
    }

    // Add questions
    const questions = [
      {
        question: "What are the minimum SAT scores for USAFA?",
        answer: "While there is no official minimum, competitive applicants typically score above 1300 combined.",
        category: "Admissions",
        status: "answered",
      },
      {
        question: "How can I best prepare for the Candidate Fitness Assessment?",
        answer: "Focus on the six events: basketball throw, pull-ups, shuttle run, crunches, push-ups, and mile run.",
        category: "Fitness",
        status: "answered",
      },
      { question: "What medical conditions disqualify applicants?", status: "pending", category: "Medical" },
    ]

    for (const q of questions) {
      const { error } = await supabase.from("questions").insert({
        user_id: userId,
        ...q,
        date: new Date().toISOString().split("T")[0],
      })

      if (error) {
        throw error
      }
    }

    console.log("Added questions")

    // Add goals
    const goals = [
      { title: "Improve mile run time to under 7 minutes", category: "Fitness", deadline: "2023-12-31", progress: 30 },
      { title: "Complete all application materials", category: "Application", deadline: "2023-11-30", progress: 50 },
      { title: "Achieve 3.8+ GPA this semester", category: "Academic", deadline: "2023-12-15", progress: 70 },
    ]

    for (const goal of goals) {
      const { error } = await supabase.from("goals").insert({
        user_id: userId,
        ...goal,
        completed: false,
      })

      if (error) {
        throw error
      }
    }

    console.log("Added goals")

    // Add settings
    const settings = [
      { key: "theme", value: { mode: "light" } },
      { key: "notifications", value: { email: true, push: false } },
      { key: "fitness_goals", value: { pushups: 67, situps: 58, pullups: 10, mile_run: 6.5 } },
      {
        key: "application_progress",
        value: { essays: 70, recommendations: 100, tests: 80, interviews: 0, overall: 65 },
      },
    ]

    for (const setting of settings) {
      const { error } = await supabase.from("settings").insert({
        user_id: userId,
        ...setting,
      })

      if (error) {
        throw error
      }
    }

    console.log("Added settings")

    console.log("Database seeding completed successfully!")
    console.log("You can now log in with:")
    console.log("Email: test@usafaapp.com")
    console.log("Password: testpassword123")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

seedDatabase()
