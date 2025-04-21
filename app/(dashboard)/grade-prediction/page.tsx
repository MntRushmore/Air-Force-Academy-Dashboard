"use client"

import { useState, useEffect } from "react"
import { db, type Course, type Grade } from "@/lib/db"
import { CoursePrediction } from "@/components/grade-prediction/course-prediction"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Download } from "lucide-react"
import type { CourseGradePrediction } from "@/lib/grade-prediction"
import { calculateGPAImpact, generateDefaultFutureAssignments, calculatePredictedGrade } from "@/lib/grade-prediction"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { useToast } from "@/components/ui/use-toast"

export default function GradePredictionPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [gradesMap, setGradesMap] = useState<Record<string, Grade[]>>({})
  const [predictions, setPredictions] = useState<Record<string, CourseGradePrediction>>({})
  const [loading, setLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const allCourses = await db.courses.toArray()
        const allGrades = await db.grades.toArray()

        // Group grades by course
        const gradesByCourse: Record<string, Grade[]> = {}
        for (const grade of allGrades) {
          if (!gradesByCourse[grade.courseId]) {
            gradesByCourse[grade.courseId] = []
          }
          gradesByCourse[grade.courseId].push(grade)
        }

        setCourses(allCourses)
        setGradesMap(gradesByCourse)

        // Initialize predictions
        const initialPredictions: Record<string, CourseGradePrediction> = {}
        for (const course of allCourses) {
          if (course.id) {
            const courseGrades = gradesByCourse[course.id] || []
            const futureAssignments = generateDefaultFutureAssignments(course, courseGrades)
            initialPredictions[course.id] = calculatePredictedGrade(course, courseGrades, futureAssignments)
          }
        }
        setPredictions(initialPredictions)

        // Set first course as selected
        if (allCourses.length > 0 && allCourses[0].id) {
          setSelectedCourseId(allCourses[0].id)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load course data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handlePredictionChange = (courseId: string, prediction: CourseGradePrediction) => {
    setPredictions((prev) => ({
      ...prev,
      [courseId]: prediction,
    }))
  }

  const gpaImpact = calculateGPAImpact(courses, gradesMap, predictions)

  // Generate printable report
  const generateReport = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Grade Prediction Report", 105, 15, { align: "center" })

    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: "center" })

    // Add GPA summary
    doc.setFontSize(14)
    doc.text("GPA Summary", 14, 35)

    doc.setFontSize(11)
    doc.text(`Current GPA: ${gpaImpact.currentGPA.toFixed(2)}`, 14, 45)
    doc.text(`Predicted GPA: ${gpaImpact.predictedGPA.toFixed(2)}`, 14, 52)
    doc.text(`Change: ${gpaImpact.difference >= 0 ? "+" : ""}${gpaImpact.difference.toFixed(2)}`, 14, 59)

    // Add course predictions table
    doc.setFontSize(14)
    doc.text("Course Predictions", 14, 75)

    const tableData = courses
      .map((course) => {
        const prediction = predictions[course.id || ""]
        if (!prediction) return null

        return [
          course.code,
          course.name,
          `${prediction.currentAverage.toFixed(1)}%`,
          prediction.currentLetterGrade,
          `${prediction.predictedAverage.toFixed(1)}%`,
          prediction.predictedLetterGrade,
        ]
      })
      .filter(Boolean)

    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: 80,
      head: [["Code", "Course", "Current %", "Current Grade", "Predicted %", "Predicted Grade"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [66, 66, 66] },
    })

    // Save the PDF
    doc.save("grade-prediction-report.pdf")

    toast({
      title: "Report Generated",
      description: "Your grade prediction report has been downloaded",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Grade Prediction</h1>
        <p className="text-muted-foreground">Forecast your final grades and plan for success</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>GPA Impact</CardTitle>
              <CardDescription>See how your predicted grades will affect your GPA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Current GPA</div>
                  <div className="text-3xl font-bold">{gpaImpact.currentGPA.toFixed(2)}</div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Predicted GPA</div>
                  <div className="text-3xl font-bold">{gpaImpact.predictedGPA.toFixed(2)}</div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Change</div>
                  <div className="flex items-center">
                    {gpaImpact.difference > 0 && <ArrowUpRight className="h-5 w-5 text-green-500 mr-1" />}
                    <div
                      className={`text-3xl font-bold ${
                        gpaImpact.difference > 0
                          ? "text-green-600 dark:text-green-400"
                          : gpaImpact.difference < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                      }`}
                    >
                      {gpaImpact.difference >= 0 ? "+" : ""}
                      {gpaImpact.difference.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={generateReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue={selectedCourseId || ""} onValueChange={(value) => setSelectedCourseId(value)}>
            <TabsList className="mb-4 flex flex-nowrap overflow-x-auto pb-1">
              {courses.map((course) => (
                <TabsTrigger key={course.id} value={course.id || ""} className="whitespace-nowrap">
                  {course.code}
                </TabsTrigger>
              ))}
            </TabsList>

            {courses.map((course) => (
              <TabsContent key={course.id} value={course.id || ""}>
                <CoursePrediction
                  course={course}
                  grades={gradesMap[course.id || ""] || []}
                  initialFutureAssignments={predictions[course.id || ""]?.futureAssignments}
                  onPredictionChange={(prediction) => handlePredictionChange(course.id || "", prediction)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  )
}
