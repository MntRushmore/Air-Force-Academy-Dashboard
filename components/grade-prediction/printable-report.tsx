"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer, Download } from "lucide-react"
import type { Course, Grade } from "@/lib/db"
import type { CourseGradePrediction } from "@/lib/grade-prediction"
import { useToast } from "@/components/ui/use-toast"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

interface PrintableReportProps {
  courses: Course[]
  gradesMap: Record<string, Grade[]>
  predictions: Record<string, CourseGradePrediction>
  gpaImpact: {
    currentGPA: number
    predictedGPA: number
    difference: number
  }
}

export function PrintableReport({ courses, gradesMap, predictions, gpaImpact }: PrintableReportProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handlePrint = () => {
    if (reportRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Grade Prediction Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { margin-bottom: 20px; }
                .gpa-summary { display: flex; gap: 20px; margin-bottom: 20px; }
                .gpa-card { border: 1px solid #ddd; padding: 10px; border-radius: 5px; flex: 1; }
                .positive { color: green; }
                .negative { color: red; }
              </style>
            </head>
            <body>
              ${reportRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
      }
    }
  }

  const generatePDF = () => {
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

    // Add future assignments section
    let yPos = doc.lastAutoTable.finalY + 20

    doc.setFontSize(14)
    doc.text("Future Assignments", 14, yPos)
    yPos += 10

    for (const course of courses) {
      if (!course.id) continue

      const prediction = predictions[course.id]
      if (!prediction || prediction.futureAssignments.length === 0) continue

      doc.setFontSize(12)
      doc.text(`${course.code}: ${course.name}`, 14, yPos)
      yPos += 8

      const assignmentData = prediction.futureAssignments.map((assignment) => [
        assignment.title,
        assignment.type,
        `${assignment.weight}%`,
        `${assignment.predictedScore} / ${assignment.maxScore}`,
        `${((assignment.predictedScore / assignment.maxScore) * 100).toFixed(1)}%`,
      ])

      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [["Assignment", "Type", "Weight", "Score", "Percentage"]],
        body: assignmentData,
        theme: "grid",
        headStyles: { fillColor: [100, 100, 100] },
        margin: { left: 14 },
      })

      yPos = doc.lastAutoTable.finalY + 15

      // Add new page if needed
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
    }

    // Save the PDF
    doc.save("grade-prediction-report.pdf")

    toast({
      title: "Report Generated",
      description: "Your grade prediction report has been downloaded",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Grade Prediction Report</CardTitle>
          <CardDescription>Summary of your current and predicted grades</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={generatePDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={reportRef} className="space-y-6">
          <div className="header">
            <h2 className="text-xl font-bold">Grade Prediction Report</h2>
            <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          <div className="gpa-summary grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="gpa-card border rounded-md p-4 text-center">
              <div className="text-sm font-medium mb-1">Current GPA</div>
              <div className="text-2xl font-bold">{gpaImpact.currentGPA.toFixed(2)}</div>
            </div>

            <div className="gpa-card border rounded-md p-4 text-center">
              <div className="text-sm font-medium mb-1">Predicted GPA</div>
              <div className="text-2xl font-bold">{gpaImpact.predictedGPA.toFixed(2)}</div>
            </div>

            <div className="gpa-card border rounded-md p-4 text-center">
              <div className="text-sm font-medium mb-1">Change</div>
              <div
                className={`text-2xl font-bold ${
                  gpaImpact.difference > 0
                    ? "positive text-green-600"
                    : gpaImpact.difference < 0
                      ? "negative text-red-600"
                      : ""
                }`}
              >
                {gpaImpact.difference >= 0 ? "+" : ""}
                {gpaImpact.difference.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Course Predictions</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Current %</TableHead>
                    <TableHead>Current Grade</TableHead>
                    <TableHead className="text-right">Predicted %</TableHead>
                    <TableHead>Predicted Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => {
                    const prediction = predictions[course.id || ""]
                    if (!prediction) return null

                    return (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell className="text-right">{prediction.currentAverage.toFixed(1)}%</TableCell>
                        <TableCell>{prediction.currentLetterGrade}</TableCell>
                        <TableCell className="text-right">{prediction.predictedAverage.toFixed(1)}%</TableCell>
                        <TableCell>{prediction.predictedLetterGrade}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Future Assignments</h3>
            {courses.map((course) => {
              if (!course.id) return null

              const prediction = predictions[course.id]
              if (!prediction || prediction.futureAssignments.length === 0) return null

              return (
                <div key={course.id} className="mb-6">
                  <h4 className="text-md font-medium mb-2">
                    {course.code}: {course.name}
                  </h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Weight</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prediction.futureAssignments.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.title}</TableCell>
                            <TableCell className="capitalize">{assignment.type}</TableCell>
                            <TableCell className="text-right">{assignment.weight}%</TableCell>
                            <TableCell className="text-right">
                              {assignment.predictedScore} / {assignment.maxScore}
                            </TableCell>
                            <TableCell className="text-right">
                              {((assignment.predictedScore / assignment.maxScore) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
