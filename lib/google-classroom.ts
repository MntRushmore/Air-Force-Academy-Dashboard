import { db, addItem, updateItem } from "./db"
import type { Course, Grade } from "./db"

// Types for Google Classroom API responses
interface GoogleClassroomCourse {
  id: string
  name: string
  section?: string
  description?: string
  room?: string
  ownerId: string
  creationTime: string
  updateTime: string
  courseState: "ACTIVE" | "ARCHIVED" | "PROVISIONED" | "DECLINED" | "SUSPENDED"
}

interface GoogleClassroomCoursework {
  courseId: string
  id: string
  title: string
  description?: string
  materials?: any[]
  state: "PUBLISHED" | "DRAFT" | "DELETED"
  maxPoints?: number
  workType: "ASSIGNMENT" | "SHORT_ANSWER_QUESTION" | "MULTIPLE_CHOICE_QUESTION" | "MATERIAL"
  creationTime: string
  updateTime: string
  dueDate?: {
    year: number
    month: number
    day: number
  }
  dueTime?: {
    hours: number
    minutes: number
  }
}

interface GoogleClassroomSubmission {
  courseId: string
  courseWorkId: string
  id: string
  userId: string
  state: "TURNED_IN" | "RETURNED" | "NEW" | "CREATED"
  assignedGrade?: number
  alternateLink?: string
  submissionHistory?: any[]
  late?: boolean
}

// Function to fetch courses from Google Classroom
export async function fetchGoogleClassroomCourses(accessToken: string): Promise<GoogleClassroomCourse[]> {
  try {
    const response = await fetch("https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`)
    }

    const data = await response.json()
    return data.courses || []
  } catch (error) {
    console.error("Error fetching Google Classroom courses:", error)
    throw error
  }
}

// Function to fetch coursework for a specific course
export async function fetchGoogleClassroomCoursework(
  accessToken: string,
  courseId: string,
): Promise<GoogleClassroomCoursework[]> {
  try {
    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch coursework: ${response.statusText}`)
    }

    const data = await response.json()
    return data.courseWork || []
  } catch (error) {
    console.error("Error fetching Google Classroom coursework:", error)
    throw error
  }
}

// Function to fetch student submissions for a specific coursework
export async function fetchGoogleClassroomSubmissions(
  accessToken: string,
  courseId: string,
  courseWorkId: string,
): Promise<GoogleClassroomSubmission[]> {
  try {
    const response = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch submissions: ${response.statusText}`)
    }

    const data = await response.json()
    return data.studentSubmissions || []
  } catch (error) {
    console.error("Error fetching Google Classroom submissions:", error)
    throw error
  }
}

// Function to convert Google Classroom course to app Course format
export function convertGoogleClassroomCourse(gCourse: GoogleClassroomCourse): Partial<Course> {
  // Extract semester and year from course name or description
  // This is a simple example - you might need more complex logic based on your school's naming conventions
  const currentYear = new Date().getFullYear()
  let semester = "Fall"
  if (gCourse.name.toLowerCase().includes("spring")) {
    semester = "Spring"
  } else if (gCourse.name.toLowerCase().includes("summer")) {
    semester = "Summer"
  }

  // Try to extract a course code from the name (e.g., "MATH101: Calculus I" -> "MATH101")
  const codeMatch = gCourse.name.match(/^([A-Z]{2,4}\s?\d{3})/)
  const code = codeMatch ? codeMatch[1] : `GC-${gCourse.id.substring(0, 6)}`

  // Extract the actual course name without the code
  const name = codeMatch
    ? gCourse.name
        .replace(codeMatch[1], "")
        .trim()
        .replace(/^[:\s-]+/, "")
    : gCourse.name

  return {
    code,
    name,
    instructor: "", // Not directly available from Google Classroom API
    credits: 3, // Default value, not available from Google Classroom
    semester,
    year: currentYear,
    category: "Other", // Not directly available from Google Classroom
    isAP: false, // Not directly available from Google Classroom
    notes: `Imported from Google Classroom. Course ID: ${gCourse.id}`,
    googleClassroomId: gCourse.id, // Store the Google Classroom ID for future reference
  }
}

// Function to convert Google Classroom coursework and submission to app Grade format
export function convertGoogleClassroomGrade(
  coursework: GoogleClassroomCoursework,
  submission: GoogleClassroomSubmission,
  courseId: string,
): Partial<Grade> {
  // Determine the grade type based on the coursework type
  let type: Grade["type"] = "other"
  if (coursework.workType === "ASSIGNMENT") {
    type = "homework"
  } else if (coursework.workType.includes("QUESTION")) {
    type = "quiz"
  }

  // Format the date from Google Classroom format
  let date = new Date().toISOString().split("T")[0] // Default to today
  if (coursework.dueDate) {
    const { year, month, day } = coursework.dueDate
    date = new Date(year, month - 1, day).toISOString().split("T")[0]
  }

  return {
    courseId,
    title: coursework.title,
    type,
    score: submission.assignedGrade || 0,
    maxScore: coursework.maxPoints || 100,
    weight: 10, // Default weight, not available from Google Classroom
    date,
    notes: `Imported from Google Classroom. Coursework ID: ${coursework.id}`,
    googleClassroomId: coursework.id, // Store the Google Classroom ID for future reference
  }
}

// Function to import all Google Classroom data
export async function importAllGoogleClassroomData(accessToken: string): Promise<{
  coursesAdded: number
  gradesAdded: number
}> {
  try {
    let coursesAdded = 0
    let gradesAdded = 0

    // Fetch all courses
    const gCourses = await fetchGoogleClassroomCourses(accessToken)

    for (const gCourse of gCourses) {
      // Convert and add the course
      const courseData = convertGoogleClassroomCourse(gCourse)

      // Check if this course already exists in our database
      const existingCourses = await db.courses.filter((course) => course.googleClassroomId === gCourse.id).toArray()

      let courseId: string

      if (existingCourses.length > 0) {
        // Update existing course
        courseId = existingCourses[0].id!
        await updateItem(db.courses, courseId, courseData)
      } else {
        // Add new course
        courseId = (await addItem(db.courses, courseData as Course)).toString()
        coursesAdded++
      }

      // Fetch coursework for this course
      const coursework = await fetchGoogleClassroomCoursework(accessToken, gCourse.id)

      for (const work of coursework) {
        // Only process assignments and questions (not materials)
        if (work.workType === "MATERIAL") continue

        // Fetch submissions for this coursework
        const submissions = await fetchGoogleClassroomSubmissions(accessToken, gCourse.id, work.id)

        // Find the user's submission
        // Note: In a real app, you'd need to identify which submission belongs to the current user
        const userSubmission = submissions.find((sub) => sub.state === "RETURNED" || sub.state === "TURNED_IN")

        if (userSubmission && userSubmission.assignedGrade !== undefined) {
          // Convert and add the grade
          const gradeData = convertGoogleClassroomGrade(work, userSubmission, courseId)

          // Check if this grade already exists in our database
          const existingGrades = await db.grades.filter((grade) => grade.googleClassroomId === work.id).toArray()

          if (existingGrades.length > 0) {
            // Update existing grade
            await updateItem(db.grades, existingGrades[0].id!, gradeData)
          } else {
            // Add new grade
            await addItem(db.grades, gradeData as Grade)
            gradesAdded++
          }
        }
      }
    }

    return { coursesAdded, gradesAdded }
  } catch (error) {
    console.error("Error importing Google Classroom data:", error)
    throw error
  }
}
