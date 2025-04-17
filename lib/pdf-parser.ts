import { db, addItem, type Grade, type Course } from "./db"

// Define the structure for extracted grade data
export interface ExtractedGradeData {
  success: boolean
  message: string
  courses: ExtractedCourse[]
  summary?: {
    gpa: number
    totalCredits: number
  }
}

export interface ExtractedCourse {
  code: string
  name: string
  credits: number
  instructor?: string
  category?: string
  isAP?: boolean
  grades: {
    semester1: {
      period1?: number
      period2?: number
      period3?: number
      final?: number
    }
    semester2: {
      period1?: number
      period2?: number
      period3?: number
      final?: number
    }
  }
}

// Main function to extract grades from PDF text content
export async function extractGradesFromPDF(textContent: string): Promise<ExtractedGradeData> {
  try {
    // Validate that we have content to parse
    if (!textContent || textContent.trim().length === 0) {
      return {
        success: false,
        message: "The PDF appears to be empty or could not be read properly.",
        courses: [],
      }
    }

    // Detect the PDF format type
    const formatType = detectPDFFormat(textContent)

    // Extract courses based on the detected format
    let courses: ExtractedCourse[] = []

    switch (formatType) {
      case "standard":
        courses = extractStandardFormat(textContent)
        break
      case "detailed":
        courses = extractDetailedFormat(textContent)
        break
      case "transcript":
        courses = extractTranscriptFormat(textContent)
        break
      default:
        return {
          success: false,
          message: "Could not determine the PDF format. Please ensure this is a valid grade report.",
          courses: [],
        }
    }

    // If no courses were found, return an error
    if (courses.length === 0) {
      return {
        success: false,
        message: "No course data could be extracted from the PDF. Please check the file format.",
        courses: [],
      }
    }

    // Calculate summary statistics
    const summary = calculateSummary(courses)

    return {
      success: true,
      message: `Successfully extracted grades for ${courses.length} courses.`,
      courses,
      summary,
    }
  } catch (error) {
    console.error("Error extracting grades from PDF:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred while processing the PDF.",
      courses: [],
    }
  }
}

// Helper function to detect the PDF format type
function detectPDFFormat(textContent: string): "standard" | "detailed" | "transcript" | "unknown" {
  // Check for standard format indicators
  if (textContent.includes("Grading Period") && textContent.includes("Semester")) {
    return "standard"
  }

  // Check for detailed format indicators
  if (textContent.includes("Assignment Breakdown") || textContent.includes("Grade Distribution")) {
    return "detailed"
  }

  // Check for transcript format indicators
  if (textContent.includes("Official Transcript") || textContent.includes("Academic Record")) {
    return "transcript"
  }

  // Look for any course code patterns (e.g., MATH101, ENG203)
  const courseCodePattern = /[A-Z]{2,4}\s?\d{3}/g
  if (courseCodePattern.test(textContent)) {
    // If we find course codes but can't determine the exact format, default to standard
    return "standard"
  }

  return "unknown"
}

// Extract grades from standard format
function extractStandardFormat(textContent: string): ExtractedCourse[] {
  const courses: ExtractedCourse[] = []

  // Split the text content into lines for easier processing
  const lines = textContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Regular expressions for identifying course information
  const courseHeaderRegex = /([A-Z]{2,4}\s?\d{3})\s*[-:]\s*(.*)/
  const gradeRegex = /(Period|Semester)\s*(\d)\s*:?\s*([A-F][+-]?|[0-9.]+)/gi
  const creditsRegex = /Credits\s*:?\s*(\d+(\.\d+)?)/i

  let currentCourse: ExtractedCourse | null = null

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if this line contains a course header
    const courseMatch = line.match(courseHeaderRegex)
    if (courseMatch) {
      // If we were processing a course, add it to our list
      if (currentCourse) {
        courses.push(currentCourse)
      }

      // Start a new course
      currentCourse = {
        code: courseMatch[1].trim(),
        name: courseMatch[2].trim(),
        credits: 3, // Default value
        grades: {
          semester1: {},
          semester2: {},
        },
      }

      // Look for credits in this line or the next few lines
      const creditsMatch = line.match(creditsRegex)
      if (creditsMatch) {
        currentCourse.credits = Number.parseFloat(creditsMatch[1])
      } else {
        // Check the next few lines for credits information
        for (let j = 1; j <= 3 && i + j < lines.length; j++) {
          const nextLine = lines[i + j]
          const nextCreditsMatch = nextLine.match(creditsRegex)
          if (nextCreditsMatch) {
            currentCourse.credits = Number.parseFloat(nextCreditsMatch[1])
            break
          }
        }
      }

      continue
    }

    // If we're not currently processing a course, skip this line
    if (!currentCourse) continue

    // Look for grade information
    let gradeMatch
    const gradeRegexInstance = new RegExp(gradeRegex)
    while ((gradeMatch = gradeRegexInstance.exec(line)) !== null) {
      const periodType = gradeMatch[1].toLowerCase()
      const periodNumber = Number.parseInt(gradeMatch[2])
      let gradeValue = gradeMatch[3]

      // Convert letter grades to numeric values if needed
      if (/^[A-F][+-]?$/.test(gradeValue)) {
        gradeValue = letterGradeToNumeric(gradeValue).toString()
      }

      // Store the grade in the appropriate location
      if (periodType === "period") {
        if (periodNumber <= 3) {
          currentCourse.grades.semester1[`period${periodNumber}` as keyof typeof currentCourse.grades.semester1] =
            Number.parseFloat(gradeValue)
        } else {
          // Adjust for second semester periods (4, 5, 6 become 1, 2, 3)
          const adjustedPeriod = periodNumber - 3
          currentCourse.grades.semester2[`period${adjustedPeriod}` as keyof typeof currentCourse.grades.semester2] =
            Number.parseFloat(gradeValue)
        }
      } else if (periodType === "semester") {
        if (periodNumber === 1) {
          currentCourse.grades.semester1.final = Number.parseFloat(gradeValue)
        } else {
          currentCourse.grades.semester2.final = Number.parseFloat(gradeValue)
        }
      }
    }

    // Check for instructor information
    if (line.toLowerCase().includes("instructor") || line.toLowerCase().includes("teacher")) {
      const instructorMatch = line.match(/(?:instructor|teacher)\s*:?\s*(.*)/i)
      if (instructorMatch) {
        currentCourse.instructor = instructorMatch[1].trim()
      }
    }

    // Check for category information
    if (line.toLowerCase().includes("category") || line.toLowerCase().includes("subject")) {
      const categoryMatch = line.match(/(?:category|subject)\s*:?\s*(.*)/i)
      if (categoryMatch) {
        currentCourse.category = mapToStandardCategory(categoryMatch[1].trim())
      }
    }

    // Check for AP designation
    if (line.includes("AP") || line.includes("Advanced Placement")) {
      currentCourse.isAP = true
    }
  }

  // Don't forget to add the last course if we were processing one
  if (currentCourse) {
    courses.push(currentCourse)
  }

  return courses
}

// Extract grades from detailed format
function extractDetailedFormat(textContent: string): ExtractedCourse[] {
  // This would be a more complex implementation for detailed format PDFs
  // For now, we'll use a simplified version that falls back to standard extraction
  return extractStandardFormat(textContent)
}

// Extract grades from transcript format
function extractTranscriptFormat(textContent: string): ExtractedCourse[] {
  // This would be a specialized implementation for transcript format PDFs
  // For now, we'll use a simplified version that falls back to standard extraction
  return extractStandardFormat(textContent)
}

// Helper function to convert letter grades to numeric values
function letterGradeToNumeric(letterGrade: string): number {
  const gradeMap: Record<string, number> = {
    "A+": 97,
    A: 95,
    "A-": 92,
    "B+": 87,
    B: 85,
    "B-": 82,
    "C+": 77,
    C: 75,
    "C-": 72,
    "D+": 67,
    D: 65,
    "D-": 62,
    F: 55,
  }

  return gradeMap[letterGrade] || 0
}

// Helper function to map various category names to standard categories
function mapToStandardCategory(category: string): string {
  category = category.toLowerCase()

  if (
    category.includes("math") ||
    category.includes("calculus") ||
    category.includes("algebra") ||
    category.includes("geometry")
  ) {
    return "STEM"
  }

  if (
    category.includes("science") ||
    category.includes("physics") ||
    category.includes("chemistry") ||
    category.includes("biology")
  ) {
    return "STEM"
  }

  if (category.includes("english") || category.includes("literature") || category.includes("writing")) {
    return "Humanities"
  }

  if (
    category.includes("history") ||
    category.includes("social") ||
    category.includes("government") ||
    category.includes("economics")
  ) {
    return "Social Sciences"
  }

  if (
    category.includes("language") ||
    category.includes("spanish") ||
    category.includes("french") ||
    category.includes("german")
  ) {
    return "Languages"
  }

  if (
    category.includes("physical") ||
    category.includes("health") ||
    category.includes("pe") ||
    category.includes("education")
  ) {
    return "Physical Education"
  }

  if (
    category.includes("art") ||
    category.includes("music") ||
    category.includes("drama") ||
    category.includes("theater")
  ) {
    return "Arts"
  }

  return "Other"
}

// Calculate summary statistics
function calculateSummary(courses: ExtractedCourse[]): { gpa: number; totalCredits: number } {
  let totalPoints = 0
  let totalCredits = 0

  for (const course of courses) {
    // Calculate the average grade for the course
    const grades = [course.grades.semester1.final, course.grades.semester2.final].filter(
      (grade) => typeof grade === "number",
    ) as number[]

    if (grades.length > 0) {
      const averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
      const gradePoints = percentageToGradePoints(averageGrade, !!course.isAP)

      totalPoints += gradePoints * course.credits
      totalCredits += course.credits
    }
  }

  const gpa = totalCredits > 0 ? Number.parseFloat((totalPoints / totalCredits).toFixed(2)) : 0

  return {
    gpa,
    totalCredits,
  }
}

// Helper function to convert percentage to grade points (copied from db.ts)
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

// Function to import extracted grades into the database
export async function importExtractedGrades(extractedData: ExtractedGradeData): Promise<{
  success: boolean
  message: string
  coursesAdded: number
  gradesAdded: number
}> {
  try {
    if (!extractedData.success || extractedData.courses.length === 0) {
      return {
        success: false,
        message: "No valid grade data to import.",
        coursesAdded: 0,
        gradesAdded: 0,
      }
    }

    let coursesAdded = 0
    let gradesAdded = 0

    // Get the current year
    const currentYear = new Date().getFullYear()

    // Process each extracted course
    for (const extractedCourse of extractedData.courses) {
      // Create a new course record
      const course: Course = {
        code: extractedCourse.code,
        name: extractedCourse.name,
        instructor: extractedCourse.instructor || "",
        credits: extractedCourse.credits,
        semester: "Full Year", // Assuming freshman courses are full year
        year: currentYear,
        category: extractedCourse.category || "Other",
        isAP: extractedCourse.isAP || false,
        notes: "Imported from PDF grade report",
      }

      // Add the course to the database
      const courseId = await addItem(db.courses, course)
      coursesAdded++

      // Process grades for semester 1
      const sem1 = extractedCourse.grades.semester1
      if (sem1.period1 !== undefined) {
        await addGradeRecord(courseId.toString(), "Period 1", sem1.period1, "Fall")
        gradesAdded++
      }

      if (sem1.period2 !== undefined) {
        await addGradeRecord(courseId.toString(), "Period 2", sem1.period2, "Fall")
        gradesAdded++
      }

      if (sem1.period3 !== undefined) {
        await addGradeRecord(courseId.toString(), "Period 3", sem1.period3, "Fall")
        gradesAdded++
      }

      if (sem1.final !== undefined) {
        await addGradeRecord(courseId.toString(), "Semester 1 Final", sem1.final, "Fall", 30)
        gradesAdded++
      }

      // Process grades for semester 2
      const sem2 = extractedCourse.grades.semester2
      if (sem2.period1 !== undefined) {
        await addGradeRecord(courseId.toString(), "Period 4", sem2.period1, "Spring")
        gradesAdded++
      }

      if (sem2.period2 !== undefined) {
        await addGradeRecord(courseId.toString(), "Period 5", sem2.period2, "Spring")
        gradesAdded++
      }

      if (sem2.period3 !== undefined) {
        await addGradeRecord(courseId.toString(), "Period 6", sem2.period3, "Spring")
        gradesAdded++
      }

      if (sem2.final !== undefined) {
        await addGradeRecord(courseId.toString(), "Semester 2 Final", sem2.final, "Spring", 30)
        gradesAdded++
      }
    }

    return {
      success: true,
      message: `Successfully imported ${coursesAdded} courses with ${gradesAdded} grade records.`,
      coursesAdded,
      gradesAdded,
    }
  } catch (error) {
    console.error("Error importing extracted grades:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred during import.",
      coursesAdded: 0,
      gradesAdded: 0,
    }
  }
}

// Helper function to add a grade record
async function addGradeRecord(
  courseId: string,
  title: string,
  score: number,
  semester: string,
  weight = 20,
): Promise<void> {
  const grade: Grade = {
    courseId,
    title,
    type: "exam",
    score,
    maxScore: 100,
    weight,
    date: new Date().toISOString().split("T")[0], // Today's date
    notes: "Imported from PDF grade report",
  }

  await addItem(db.grades, grade)
}
