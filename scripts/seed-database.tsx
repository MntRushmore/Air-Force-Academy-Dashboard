import { createClient } from "@supabase/supabase-js"
import type { Database } from "../lib/database.types"

// Replace with your actual Supabase URL and service role key
// IMPORTANT: Use the service role key only for this script, not in your application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Sample user data - we'll create a test user first
const TEST_USER_EMAIL = "test@usafaapp.com"
const TEST_USER_PASSWORD = "testpassword123"
const TEST_USER_NAME = "Test Cadet"

async function seedDatabase() {
  console.log("Starting database seeding...")

  try {
    // Step 1: Create a test user
    console.log("Creating test user...")
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: TEST_USER_NAME,
      },
    })

    if (userError) {
      throw userError
    }

    const userId = userData.user.id
    console.log(`Created test user with ID: ${userId}`)

    // Step 2: Update the profile with additional information
    console.log("Updating user profile...")
    await supabase
      .from("profiles")
      .update({
        academy: "USAFA",
        graduation_year: 2028,
        gender: "male",
      })
      .eq("id", userId)

    // Step 3: Seed exercises
    console.log("Seeding exercises...")
    const exercises = [
      {
        user_id: userId,
        name: "Push-ups",
        target: 67,
        current: 55,
        unit: "reps",
      },
      {
        user_id: userId,
        name: "Sit-ups",
        target: 58,
        current: 50,
        unit: "reps",
      },
      {
        user_id: userId,
        name: "Pull-ups",
        target: 15,
        current: 10,
        unit: "reps",
      },
      {
        user_id: userId,
        name: "1.5 Mile Run",
        target: 9.15,
        current: 10.3,
        unit: "minutes",
      },
    ]

    const { error: exercisesError } = await supabase.from("exercises").insert(exercises)
    if (exercisesError) throw exercisesError

    // Step 4: Seed goals
    console.log("Seeding goals...")
    const goals = [
      {
        user_id: userId,
        title: "Improve CFA Score",
        category: "fitness",
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 90 days from now
        progress: 65,
        completed: false,
      },
      {
        user_id: userId,
        title: "Complete Application Essays",
        category: "application",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
        progress: 40,
        completed: false,
      },
      {
        user_id: userId,
        title: "Secure Congressional Nomination",
        category: "application",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 60 days from now
        progress: 25,
        completed: false,
      },
      {
        user_id: userId,
        title: "Improve GPA to 3.8+",
        category: "academic",
        deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 120 days from now
        progress: 70,
        completed: false,
      },
    ]

    const { error: goalsError } = await supabase.from("goals").insert(goals)
    if (goalsError) throw goalsError

    // Step 5: Seed courses
    console.log("Seeding courses...")
    const courses = [
      {
        user_id: userId,
        code: "MATH301",
        name: "Advanced Calculus",
        instructor: "Dr. Smith",
        credits: 4,
        semester: "Fall",
        year: 2023,
        category: "Mathematics",
        is_ap: false,
        notes: "Required for engineering track",
      },
      {
        user_id: userId,
        code: "PHYS201",
        name: "Physics I",
        instructor: "Dr. Johnson",
        credits: 4,
        semester: "Fall",
        year: 2023,
        category: "Science",
        is_ap: false,
        notes: "Includes lab component",
      },
      {
        user_id: userId,
        code: "ENGL101",
        name: "Composition",
        instructor: "Prof. Williams",
        credits: 3,
        semester: "Fall",
        year: 2023,
        category: "English",
        is_ap: false,
        notes: "Focus on technical writing",
      },
      {
        user_id: userId,
        code: "HIST202",
        name: "American History",
        instructor: "Dr. Davis",
        credits: 3,
        semester: "Fall",
        year: 2023,
        category: "History",
        is_ap: true,
        notes: "AP course with college credit",
      },
    ]

    const { data: coursesData, error: coursesError } = await supabase.from("courses").insert(courses).select()

    if (coursesError) throw coursesError

    // Step 6: Seed grades for each course
    console.log("Seeding grades...")
    const grades = []

    for (const course of coursesData) {
      // Add multiple grades for each course
      grades.push(
        {
          user_id: userId,
          course_id: course.id,
          title: "Midterm Exam",
          type: "exam",
          score: Math.floor(Math.random() * 20) + 80, // Random score between 80-100
          max_score: 100,
          weight: 0.25,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
          notes: "Covered chapters 1-5",
        },
        {
          user_id: userId,
          course_id: course.id,
          title: "Quiz 1",
          type: "quiz",
          score: Math.floor(Math.random() * 10) + 85, // Random score between 85-95
          max_score: 100,
          weight: 0.1,
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 45 days ago
          notes: "Pop quiz on recent material",
        },
        {
          user_id: userId,
          course_id: course.id,
          title: "Homework 1",
          type: "homework",
          score: Math.floor(Math.random() * 15) + 85, // Random score between 85-100
          max_score: 100,
          weight: 0.05,
          date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 50 days ago
          notes: "First assignment",
        },
      )
    }

    const { error: gradesError } = await supabase.from("grades").insert(grades)
    if (gradesError) throw gradesError

    // Step 7: Seed tasks
    console.log("Seeding tasks...")
    const tasks = [
      {
        user_id: userId,
        title: "Complete Physics Lab Report",
        description: "Write up results from the pendulum experiment",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
        priority: "high",
        completed: false,
        subject: "Physics",
      },
      {
        user_id: userId,
        title: "Study for Calculus Quiz",
        description: "Review chapters 3-4 on integration techniques",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 days from now
        priority: "high",
        completed: false,
        subject: "Math",
      },
      {
        user_id: userId,
        title: "Finish Application Essay Draft",
        description: "Complete first draft of leadership experience essay",
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 14 days from now
        priority: "medium",
        completed: false,
        subject: "Application",
      },
      {
        user_id: userId,
        title: "Schedule CFA Practice",
        description: "Arrange time with coach for CFA practice session",
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days from now
        priority: "medium",
        completed: true,
        subject: "Fitness",
      },
      {
        user_id: userId,
        title: "Contact Congressional Office",
        description: "Follow up on nomination application status",
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days from now
        priority: "high",
        completed: false,
        subject: "Application",
      },
    ]

    const { error: tasksError } = await supabase.from("tasks").insert(tasks)
    if (tasksError) throw tasksError

    // Step 8: Seed events
    console.log("Seeding events...")
    const events = [
      {
        user_id: userId,
        title: "CFA Practice Test",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 10 days from now
        start_time: "09:00:00",
        end_time: "11:00:00",
        type: "other",
      },
      {
        user_id: userId,
        title: "Calculus Study Group",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days from now
        start_time: "16:00:00",
        end_time: "18:00:00",
        type: "study",
      },
      {
        user_id: userId,
        title: "Physics Midterm",
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 days from now
        start_time: "13:00:00",
        end_time: "15:00:00",
        type: "exam",
      },
      {
        user_id: userId,
        title: "Meeting with Counselor",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days from now
        start_time: "14:30:00",
        end_time: "15:30:00",
        type: "other",
      },
      {
        user_id: userId,
        title: "English Class",
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
        start_time: "10:00:00",
        end_time: "11:30:00",
        type: "class",
      },
    ]

    const { error: eventsError } = await supabase.from("events").insert(events)
    if (eventsError) throw eventsError

    // Step 9: Seed journal entries
    console.log("Seeding journal entries...")
    const journalEntries = [
      {
        user_id: userId,
        title: "First CFA Practice",
        content:
          "Completed my first CFA practice today. I did better than expected on push-ups but need to improve my run time. Planning to focus on cardio for the next few weeks.",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 days ago
        category: "Fitness",
        tags: ["CFA", "Fitness", "Goals"],
        mood: "Motivated",
      },
      {
        user_id: userId,
        title: "Application Progress",
        content:
          "Started working on my application essays today. The leadership prompt is challenging but I have some good experiences to draw from. Need to schedule time with my English teacher for feedback.",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 10 days ago
        category: "Application",
        tags: ["Essays", "Application", "Writing"],
        mood: "Focused",
      },
      {
        user_id: userId,
        title: "Physics Breakthrough",
        content:
          "Finally understood the concepts from Chapter 4 on rotational dynamics. The study group was really helpful. Feeling more confident about the upcoming midterm now.",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days ago
        category: "Academic",
        tags: ["Physics", "Study", "Success"],
        mood: "Happy",
      },
      {
        user_id: userId,
        title: "Congressional Nomination",
        content:
          "Had my interview for the congressional nomination today. I think it went well, but the competition is tough. Waiting to hear back in the next few weeks.",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days ago
        category: "Application",
        tags: ["Nomination", "Interview", "Application"],
        mood: "Nervous",
      },
    ]

    const { error: journalError } = await supabase.from("journal_entries").insert(journalEntries)
    if (journalError) throw journalError

    // Step 10: Seed mentors
    console.log("Seeding mentors...")
    const mentors = [
      {
        user_id: userId,
        name: "Captain Michael Rodriguez",
        role: "USAFA Alumni",
        expertise: ["Leadership", "Engineering", "Military Training"],
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        contact: "michael.rodriguez@example.com",
      },
      {
        user_id: userId,
        name: "Dr. Sarah Johnson",
        role: "Academic Advisor",
        expertise: ["Physics", "Mathematics", "Academic Planning"],
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        contact: "sarah.johnson@example.com",
      },
      {
        user_id: userId,
        name: "Major David Chen",
        role: "Admissions Liaison Officer",
        expertise: ["Admissions Process", "Application Strategy", "Interview Preparation"],
        avatar: "https://randomuser.me/api/portraits/men/67.jpg",
        contact: "david.chen@example.com",
      },
    ]

    const { data: mentorsData, error: mentorsError } = await supabase.from("mentors").insert(mentors).select()
    if (mentorsError) throw mentorsError

    // Step 11: Seed meeting logs
    console.log("Seeding meeting logs...")
    const meetingLogs = []

    for (const mentor of mentorsData) {
      meetingLogs.push({
        user_id: userId,
        mentor_id: mentor.id,
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 20 days ago
        duration: "45 minutes",
        topics: "Initial meeting, discussed goals and expectations",
        notes: "Mentor provided valuable insights on application strategy and timeline",
        follow_up: "Schedule next meeting in 2 weeks",
      })
    }

    const { error: meetingsError } = await supabase.from("meeting_logs").insert(meetingLogs)
    if (meetingsError) throw meetingsError

    // Step 12: Seed questions
    console.log("Seeding questions...")
    const questions = [
      {
        user_id: userId,
        question: "What is the minimum CFA score required for admission?",
        answer:
          "There is no specific minimum score, but competitive applicants typically score above the 70th percentile in each event.",
        category: "Fitness",
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 25 days ago
        status: "answered",
      },
      {
        user_id: userId,
        question: "How important are AP courses for my application?",
        answer:
          "AP courses demonstrate your ability to handle college-level work and can strengthen your application, especially in core subjects like math, science, and English.",
        category: "Academic",
        date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 18 days ago
        status: "answered",
      },
      {
        user_id: userId,
        question: "What should I focus on in my personal statement?",
        answer: null,
        category: "Application",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days ago
        status: "pending",
      },
    ]

    const { error: questionsError } = await supabase.from("questions").insert(questions)
    if (questionsError) throw questionsError

    // Step 13: Seed settings
    console.log("Seeding settings...")
    const settings = [
      {
        user_id: userId,
        key: "theme",
        value: "light",
      },
      {
        user_id: userId,
        key: "notifications",
        value: {
          email: true,
          push: true,
          deadlines: true,
          events: true,
        },
      },
      {
        user_id: userId,
        key: "fitnessGoals",
        value: {
          pushups: 67,
          situps: 58,
          pullups: 15,
          run: 9.15,
        },
      },
      {
        user_id: userId,
        key: "applicationProgress",
        value: {
          essays: 40,
          recommendations: 66,
          nomination: 25,
          cfa: 65,
          overall: 45,
        },
      },
      {
        user_id: userId,
        key: "studyPreferences",
        value: {
          pomodoroDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          sessionsBeforeLongBreak: 4,
        },
      },
    ]

    const { error: settingsError } = await supabase.from("settings").insert(settings)
    if (settingsError) throw settingsError

    console.log("Database seeding completed successfully!")
    console.log(`Test user created with email: ${TEST_USER_EMAIL} and password: ${TEST_USER_PASSWORD}`)
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seed function
seedDatabase()
