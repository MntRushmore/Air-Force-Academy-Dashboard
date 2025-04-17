"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Book, FileUp, GraduationCap, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { db, type Course, type Grade, addItem, deleteItem, importGradesFromCSV } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CoursesPage() {
  // Use Dexie's useLiveQuery hook to get real-time updates from the database
  const courses = useLiveQuery(() => db.courses.orderBy("createdAt").reverse().toArray(), []) || []
  const grades = useLiveQuery(() => db.grades.toArray(), []) || []

  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    code: "",
    name: "",
    instructor: "",
    credits: 3,
    semester: "Fall",
    year: new Date().getFullYear(),
    category: "STEM",
    isAP: false,
    notes: "",
  })

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTab, setSelectedTab] = useState("courses")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [importError, setImportError] = useState("")

  // Reset selected course when courses change
  useEffect(() => {
    if (selectedCourse && courses.length > 0) {
      const stillExists = courses.some((course) => course.id === selectedCourse.id)
      if (!stillExists) {
        setSelectedCourse(null)
      }
    }
  }, [courses, selectedCourse])

  const addCourse = async () => {
    if (!newCourse.code || !newCourse.name) return

    const course: Course = {
      code: newCourse.code,
      name: newCourse.name,
      instructor: newCourse.instructor || "",
      credits: newCourse.credits || 3,
      semester: newCourse.semester || "Fall",
      year: newCourse.year || new Date().getFullYear(),
      category: newCourse.category || "STEM",
      isAP: newCourse.isAP || false,
      notes: newCourse.notes || "",
    }

    // Add to database
    await addItem(db.courses, course)

    // Reset form
    setNewCourse({
      code: "",
      name: "",
      instructor: "",
      credits: 3,
      semester: "Fall",
      year: new Date().getFullYear(),
      category: "STEM",
      isAP: false,
      notes: "",
    })
  }

  const removeCourse = async (id: string) => {
    if (!id) return

    // Confirm before deleting
    if (
      !confirm(
        `Are you sure you want to delete this course? This will also delete all associated grades and cannot be undone.`,
      )
    ) {
      return
    }

    // Also delete all grades associated with this course
    const courseGrades = grades.filter((grade) => grade.courseId === id)
    for (const grade of courseGrades) {
      if (grade.id) await deleteItem(db.grades, grade.id)
    }

    await deleteItem(db.courses, id)

    if (selectedCourse && selectedCourse.id === id) {
      setSelectedCourse(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!csvFile || !selectedCourse?.id) return

    setImportStatus("loading")
    setImportError("")

    try {
      const text = await csvFile.text()
      const result = await importGradesFromCSV(selectedCourse.id, text)
      setImportStatus("success")
      setCsvFile(null)
      // Show how many grades were imported
      setImportError(`Successfully imported ${result.count} grades.`)
    } catch (error) {
      console.error("Import error:", error)
      setImportStatus("error")
      setImportError(
        error instanceof Error ? error.message : "Unknown error occurred during import. Please check your CSV format.",
      )
    }
  }

  const calculateCourseGrade = (courseId: string): { percentage: number; letterGrade: string } => {
    const courseGrades = grades.filter((g) => g.courseId === courseId)
    if (courseGrades.length === 0) return { percentage: 0, letterGrade: "N/A" }

    let weightedSum = 0
    let weightSum = 0

    for (const grade of courseGrades) {
      const percentage = (grade.score / grade.maxScore) * 100
      weightedSum += percentage * grade.weight
      weightSum += grade.weight
    }

    const percentage = weightSum > 0 ? weightedSum / weightSum : 0
    const letterGrade = percentageToLetterGrade(percentage)

    return { percentage, letterGrade }
  }

  const percentageToLetterGrade = (percentage: number): string => {
    if (percentage >= 97) return "A+"
    if (percentage >= 93) return "A"
    if (percentage >= 90) return "A-"
    if (percentage >= 87) return "B+"
    if (percentage >= 83) return "B"
    if (percentage >= 80) return "B-"
    if (percentage >= 77) return "C+"
    if (percentage >= 73) return "C"
    if (percentage >= 70) return "C-"
    if (percentage >= 67) return "D+"
    if (percentage >= 63) return "D"
    if (percentage >= 60) return "D-"
    return "F"
  }

  const getCourseGradeColor = (percentage: number): string => {
    if (percentage >= 90) return "text-green-600 dark:text-green-400"
    if (percentage >= 80) return "text-blue-600 dark:text-blue-400"
    if (percentage >= 70) return "text-amber-600 dark:text-amber-400"
    if (percentage >= 60) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const calculateGPA = (): number => {
    if (courses.length === 0) return 0

    let totalPoints = 0
    let totalCredits = 0
    let validCourses = 0

    for (const course of courses) {
      if (!course.id) continue

      // Calculate course grade
      const { percentage } = calculateCourseGrade(course.id)

      // Only include courses that have grades
      if (percentage > 0) {
        const gradePoints = percentageToGradePoints(percentage, course.isAP)
        totalPoints += gradePoints * course.credits
        totalCredits += course.credits
        validCourses++
      }
    }

    return totalCredits > 0 ? Number.parseFloat((totalPoints / totalCredits).toFixed(2)) : 0
  }

  const percentageToGradePoints = (percentage: number, isAP: boolean): number => {
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Academic Courses</h1>
        <p className="text-muted-foreground">Manage your courses, track grades, and calculate GPA</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calculateGPA()}</div>
            <div className="mt-1 text-sm opacity-90">
              Based on {courses.length} course{courses.length !== 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AP Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.filter((c) => c.isAP).length}</div>
            <div className="mt-1 text-sm opacity-90">
              {((courses.filter((c) => c.isAP).length / Math.max(courses.length, 1)) * 100).toFixed(0)}% of total
              courses
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">STEM Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.filter((c) => c.category === "STEM").length}</div>
            <div className="mt-1 text-sm opacity-90">
              {((courses.filter((c) => c.category === "STEM").length / Math.max(courses.length, 1)) * 100).toFixed(0)}%
              of total courses
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.reduce((sum, course) => sum + course.credits, 0)}</div>
            <div className="mt-1 text-sm opacity-90">Across all courses</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="new">Add Course</TabsTrigger>
          {selectedCourse && <TabsTrigger value="grades">Grades for {selectedCourse.code}</TabsTrigger>}
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Book className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No courses added yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Add your first course to get started</p>
              <Button className="mt-4" onClick={() => setSelectedTab("new")}>
                <Plus className="mr-2 h-4 w-4" /> Add Course
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const { percentage, letterGrade } = calculateCourseGrade(course.id || "")
                const gradeColor = getCourseGradeColor(percentage)

                return (
                  <Card
                    key={course.id}
                    className={`overflow-hidden transition-all hover:shadow-md ${
                      selectedCourse?.id === course.id ? "ring-2 ring-[#0033a0]" : ""
                    }`}
                    onClick={() => setSelectedCourse(course)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedCourse(course)
                      }
                    }}
                    role="button"
                    aria-pressed={selectedCourse?.id === course.id}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            {course.code}
                            {course.isAP && (
                              <span className="ml-2 rounded-full bg-[#0033a0] px-2 py-0.5 text-xs font-medium text-white">
                                AP
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription>{course.name}</CardDescription>
                        </div>
                        <div className={`text-xl font-bold ${gradeColor}`}>{letterGrade}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Grade:</span>
                          <span className={`font-medium ${gradeColor}`}>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Credits:</span>
                          <span>{course.credits}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Category:</span>
                          <span>{course.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Term:</span>
                          <span>
                            {course.semester} {course.year}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {selectedCourse && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {selectedCourse.code}
                      {selectedCourse.isAP && (
                        <span className="ml-2 rounded-full bg-[#0033a0] px-2 py-0.5 text-xs font-medium text-white">
                          AP
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{selectedCourse.name}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedTab("grades")}>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      View Grades
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (selectedCourse.id) {
                          removeCourse(selectedCourse.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Course Details</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Instructor:</span>
                        <span className="text-sm">{selectedCourse.instructor || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Credits:</span>
                        <span className="text-sm">{selectedCourse.credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Term:</span>
                        <span className="text-sm">
                          {selectedCourse.semester} {selectedCourse.year}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Category:</span>
                        <span className="text-sm">{selectedCourse.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">AP Course:</span>
                        <span className="text-sm">{selectedCourse.isAP ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Grade Summary</h3>
                    <div className="space-y-2">
                      {(() => {
                        const { percentage, letterGrade } = calculateCourseGrade(selectedCourse.id || "")
                        const gradeColor = getCourseGradeColor(percentage)

                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Current Grade:</span>
                              <span className={`text-lg font-bold ${gradeColor}`}>
                                {letterGrade} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </>
                        )
                      })()}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Assignments:</span>
                        <span className="text-sm">
                          {grades.filter((g) => g.courseId === selectedCourse.id).length} total
                        </span>
                      </div>
                      <div className="mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <FileUp className="mr-2 h-4 w-4" />
                              Import Grades from CSV
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Import Grades</DialogTitle>
                              <DialogDescription>
                                Upload a CSV file with your grades for {selectedCourse.name}. The CSV should include
                                columns for title, type, score, max score, and weight.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="csv-file">CSV File</Label>
                                <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                              </div>

                              {importStatus === "error" && (
                                <Alert variant="destructive">
                                  <AlertTitle>Import Failed</AlertTitle>
                                  <AlertDescription>{importError}</AlertDescription>
                                </Alert>
                              )}

                              {importStatus === "success" && (
                                <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <AlertTitle>Import Successful</AlertTitle>
                                  <AlertDescription>{importError}</AlertDescription>
                                </Alert>
                              )}
                            </div>
                            <DialogFooter>
                              <Button onClick={handleImport} disabled={!csvFile || importStatus === "loading"}>
                                {importStatus === "loading" ? "Importing..." : "Import Grades"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCourse.notes && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Notes</h3>
                    <p className="text-sm whitespace-pre-line">{selectedCourse.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Course</CardTitle>
              <CardDescription>Enter your course details to track grades and calculate GPA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input
                    id="course-code"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    placeholder="e.g., MATH101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input
                    id="course-name"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    placeholder="e.g., Calculus I"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course-instructor">Instructor</Label>
                  <Input
                    id="course-instructor"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    placeholder="e.g., Dr. Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-credits">Credits</Label>
                  <Input
                    id="course-credits"
                    type="number"
                    min="0"
                    max="6"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="course-semester">Semester</Label>
                  <Select
                    value={newCourse.semester}
                    onValueChange={(value) => setNewCourse({ ...newCourse, semester: value })}
                  >
                    <SelectTrigger id="course-semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fall">Fall</SelectItem>
                      <SelectItem value="Spring">Spring</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                      <SelectItem value="Winter">Winter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-year">Year</Label>
                  <Input
                    id="course-year"
                    type="number"
                    min="2000"
                    max="2100"
                    value={newCourse.year}
                    onChange={(e) => setNewCourse({ ...newCourse, year: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-category">Category</Label>
                  <Select
                    value={newCourse.category}
                    onValueChange={(value) => setNewCourse({ ...newCourse, category: value })}
                  >
                    <SelectTrigger id="course-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STEM">STEM</SelectItem>
                      <SelectItem value="Humanities">Humanities</SelectItem>
                      <SelectItem value="Social Sciences">Social Sciences</SelectItem>
                      <SelectItem value="Languages">Languages</SelectItem>
                      <SelectItem value="Physical Education">Physical Education</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="course-ap"
                  checked={newCourse.isAP}
                  onCheckedChange={(checked) => setNewCourse({ ...newCourse, isAP: checked })}
                />
                <Label htmlFor="course-ap">This is an Advanced Placement (AP) course</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-notes">Notes</Label>
                <Textarea
                  id="course-notes"
                  value={newCourse.notes}
                  onChange={(e) => setNewCourse({ ...newCourse, notes: e.target.value })}
                  placeholder="Any additional notes about the course"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={addCourse} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Course
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {selectedCourse && (
          <TabsContent value="grades" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Grades for {selectedCourse.code}</CardTitle>
                    <CardDescription>{selectedCourse.name}</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Grade
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Grade</DialogTitle>
                        <DialogDescription>Enter grade details for {selectedCourse.name}</DialogDescription>
                      </DialogHeader>
                      <AddGradeForm courseId={selectedCourse.id || ""} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const courseGrades = grades.filter((g) => g.courseId === selectedCourse.id)

                  if (courseGrades.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No grades added yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add your first grade or import grades from a CSV file
                        </p>
                      </div>
                    )
                  }

                  return (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courseGrades
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((grade) => {
                            const percentage = (grade.score / grade.maxScore) * 100
                            const gradeColor = getCourseGradeColor(percentage)

                            return (
                              <TableRow key={grade.id}>
                                <TableCell>{grade.title}</TableCell>
                                <TableCell className="capitalize">{grade.type}</TableCell>
                                <TableCell>
                                  {grade.score} / {grade.maxScore}
                                </TableCell>
                                <TableCell className={gradeColor}>{percentage.toFixed(1)}%</TableCell>
                                <TableCell>{grade.weight}%</TableCell>
                                <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      if (grade.id) deleteItem(db.grades, grade.id)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                  )
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

// Helper component for adding grades
function AddGradeForm({ courseId }: { courseId: string }) {
  const [newGrade, setNewGrade] = useState<Partial<Grade>>({
    courseId,
    title: "",
    type: "exam",
    score: 0,
    maxScore: 100,
    weight: 10,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const addGrade = async () => {
    if (!newGrade.title || newGrade.score === undefined || newGrade.maxScore === undefined) {
      return
    }

    if (newGrade.maxScore <= 0) {
      alert("Max score must be greater than 0")
      return
    }

    if (newGrade.score < 0 || newGrade.score > newGrade.maxScore) {
      alert(`Score must be between 0 and ${newGrade.maxScore}`)
      return
    }

    const grade: Grade = {
      courseId,
      title: newGrade.title,
      type: newGrade.type || "exam",
      score: newGrade.score,
      maxScore: newGrade.maxScore,
      weight: newGrade.weight || 10,
      date: newGrade.date || new Date().toISOString().split("T")[0],
      notes: newGrade.notes || "",
    }

    await addItem(db.grades, grade)

    // Close dialog by dispatching Escape key
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="grade-title">Assignment Title</Label>
          <Input
            id="grade-title"
            value={newGrade.title}
            onChange={(e) => setNewGrade({ ...newGrade, title: e.target.value })}
            placeholder="e.g., Midterm Exam"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="grade-type">Type</Label>
            <Select
              value={newGrade.type}
              onValueChange={(value) => setNewGrade({ ...newGrade, type: value as Grade["type"] })}
            >
              <SelectTrigger id="grade-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="homework">Homework</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="paper">Paper</SelectItem>
                <SelectItem value="participation">Participation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade-date">Date</Label>
            <Input
              id="grade-date"
              type="date"
              value={newGrade.date}
              onChange={(e) => setNewGrade({ ...newGrade, date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="grade-score">Your Score</Label>
            <Input
              id="grade-score"
              type="number"
              min="0"
              step="0.01"
              value={newGrade.score}
              onChange={(e) => setNewGrade({ ...newGrade, score: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade-max">Max Score</Label>
            <Input
              id="grade-max"
              type="number"
              min="0"
              step="0.01"
              value={newGrade.maxScore}
              onChange={(e) => setNewGrade({ ...newGrade, maxScore: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade-weight">Weight (%)</Label>
            <Input
              id="grade-weight"
              type="number"
              min="0"
              max="100"
              value={newGrade.weight}
              onChange={(e) => setNewGrade({ ...newGrade, weight: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade-notes">Notes</Label>
          <Textarea
            id="grade-notes"
            value={newGrade.notes}
            onChange={(e) => setNewGrade({ ...newGrade, notes: e.target.value })}
            placeholder="Any additional notes about this grade"
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={addGrade}>Add Grade</Button>
      </DialogFooter>
    </div>
  )
}
