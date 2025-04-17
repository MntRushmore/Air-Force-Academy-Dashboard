"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Define types for our report card data
interface CourseGrade {
  course: string
  teacher: string
  period: string
  absences: number
  tardies: number
  grades: {
    period1: string
    period2: string
    semester1: string
    period4: string
    period5: string
    semester2?: string
  }
}

interface ReportCard {
  student: {
    name: string
    id: string
    grade: number
    advisor: string
  }
  school: {
    name: string
    year: string
    gradingPeriod: string
  }
  courses: CourseGrade[]
  gpa: {
    weighted: number
    unweighted: number
  }
}

// Sample data from the provided PDF
const sampleReportCard: ReportCard = {
  student: {
    name: "Rushil Chopra",
    id: "28521",
    grade: 9,
    advisor: "Christopher Quiery",
  },
  school: {
    name: "Junipero Serra High School",
    year: "2024/2025",
    gradingPeriod: "5",
  },
  courses: [
    {
      course: "English 1-2",
      teacher: "Sam Williams",
      period: "01",
      absences: 0,
      tardies: 0,
      grades: {
        period1: "A",
        period2: "B+",
        semester1: "A-",
        period4: "A-",
        period5: "A-",
      },
    },
    {
      course: "World History 1",
      teacher: "Rick Boesen",
      period: "03A",
      absences: 0,
      tardies: 0,
      grades: {
        period1: "A",
        period2: "A",
        semester1: "A",
        period4: "A-",
        period5: "A",
      },
    },
    {
      course: "Algebra 1",
      teacher: "Selwyn Kumar",
      period: "06A",
      absences: 2,
      tardies: 0,
      grades: {
        period1: "A",
        period2: "A",
        semester1: "A",
        period4: "A",
        period5: "A",
      },
    },
    {
      course: "Biology",
      teacher: "Tacha Shaw",
      period: "04",
      absences: 4,
      tardies: 1,
      grades: {
        period1: "A-",
        period2: "A",
        semester1: "A",
        period4: "A",
        period5: "A",
      },
    },
    {
      course: "Spanish I",
      teacher: "Hannah Brown",
      period: "07",
      absences: 4,
      tardies: 0,
      grades: {
        period1: "A",
        period2: "A",
        semester1: "A",
        period4: "B+",
        period5: "A",
      },
    },
    {
      course: "Theology 1",
      teacher: "Edward Taylor",
      period: "02",
      absences: 0,
      tardies: 1,
      grades: {
        period1: "A",
        period2: "A",
        semester1: "A",
        period4: "A-",
        period5: "A",
      },
    },
    {
      course: "Men's Chorus",
      teacher: "Joseph Murphy",
      period: "05",
      absences: 2,
      tardies: 0,
      grades: {
        period1: "A",
        period2: "A",
        semester1: "A",
        period4: "A",
        period5: "A",
      },
    },
    {
      course: "Christian Service",
      teacher: "Meave Ward",
      period: "Servi",
      absences: 0,
      tardies: 0,
      grades: {
        period1: "I",
        period2: "P",
        semester1: "",
        period4: "",
        period5: "",
      },
    },
  ],
  gpa: {
    weighted: 3.76,
    unweighted: 3.76,
  },
}

// Helper function to get color for grade
function getGradeColor(grade: string): string {
  if (grade === "A" || grade === "A+") return "text-green-600 dark:text-green-400"
  if (grade === "A-") return "text-green-500 dark:text-green-400"
  if (grade.startsWith("B")) return "text-blue-600 dark:text-blue-400"
  if (grade.startsWith("C")) return "text-yellow-600 dark:text-yellow-400"
  if (grade.startsWith("D")) return "text-orange-600 dark:text-orange-400"
  if (grade === "F") return "text-red-600 dark:text-red-400"
  return ""
}

export function ReportCardDisplay() {
  const reportCard = sampleReportCard

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{reportCard.student.name}</CardTitle>
              <CardDescription>
                Grade {reportCard.student.grade} • ID: {reportCard.student.id} • Advisor: {reportCard.student.advisor}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium">{reportCard.school.name}</div>
              <CardDescription>
                {reportCard.school.year} • Grading Period {reportCard.school.gradingPeriod}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-center">Period</TableHead>
                  <TableHead className="text-center">Absences</TableHead>
                  <TableHead className="text-center">Tardies</TableHead>
                  <TableHead className="text-center">P1</TableHead>
                  <TableHead className="text-center">P2</TableHead>
                  <TableHead className="text-center">S1</TableHead>
                  <TableHead className="text-center">P4</TableHead>
                  <TableHead className="text-center">P5</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportCard.courses.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{course.course}</TableCell>
                    <TableCell>{course.teacher}</TableCell>
                    <TableCell className="text-center">{course.period}</TableCell>
                    <TableCell className="text-center">{course.absences}</TableCell>
                    <TableCell className="text-center">{course.tardies}</TableCell>
                    <TableCell className={`text-center font-medium ${getGradeColor(course.grades.period1)}`}>
                      {course.grades.period1}
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getGradeColor(course.grades.period2)}`}>
                      {course.grades.period2}
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getGradeColor(course.grades.semester1)}`}>
                      {course.grades.semester1}
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getGradeColor(course.grades.period4)}`}>
                      {course.grades.period4}
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getGradeColor(course.grades.period5)}`}>
                      {course.grades.period5}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:justify-between">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                Current Grading Period: 5
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <span className="text-sm font-medium">Weighted GPA:</span>
                <Badge>{reportCard.gpa.weighted.toFixed(2)}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Unweighted GPA:</span>
                <Badge>{reportCard.gpa.unweighted.toFixed(2)}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
