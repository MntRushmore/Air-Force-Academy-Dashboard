"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Book, FileUp, GraduationCap, Plus, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSupabaseCourses } from "@/hooks/use-supabase-courses"
import { useSupabaseGrades } from "@/hooks/use-supabase-grades"
import { calculateGPA, calculateCourseGrade, getGradeColor, formatGPA } from "@/lib/grade-utils"
import { SupabaseDiagnostics } from "@/components/supabase-diagnostics"
import type { Database } from "@/lib/database.types"

type Course = Database["public"]["Tables"]["courses"]["Row"]
type Grade = Database["public"]["Tables"]["grades"]["Row"]
type InsertCourse = Omit<
  Database["public"]["Tables"]["courses"]["Insert"],
  "id" | "client_id" | "created_at" | "updated_at"
>
type InsertGrade = Omit<
  Database["public"]["Tables"]["grades"]["Insert"],
  "id" | "client_id" | "created_at" | "updated_at"
>

export default function CoursesPage() {
  // Use our custom hooks for Supabase data
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    addCourse,
    updateCourse,
    deleteCourse,
    fetchCourses,
  } = useSupabaseCourses()

  const { grades, loading: gradesLoading, error: gradesError, addGrade, deleteGrade, fetchGrades } = useSupabaseGrades()

  const [newCourse, setNewCourse] = useState<InsertCourse>({
    code: "",
    name: "",
    instructor: "",
    credits: 3,
    semester: "Fall",
    year: new Date().getFullYear(),
    category: "STEM",
    is_ap: false,
    notes: "",
  })

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTab, setSelectedTab] = useState("courses")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [importError, setImportError] = useState("")
  const [yearFilter, setYearFilter] = useState<number | "all">("all")
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  // Reset selected course when courses change
  useEffect(() => {
    if (selectedCourse && courses.length > 0) {
      const stillExists = courses.some((course) => course.id === selectedCourse.id)
      if (!stillExists) {
        setSelectedCourse(null)
      }
    }
  }, [courses, selectedCourse])

  // Get unique years from courses
  const years = [...new Set(courses.map((course) => course.year || 0))].sort((a, b) => b - a)

  // Filter courses by year if a year is selected
  const filteredCourses = yearFilter === "all" ? courses : courses.filter((course) => course.year === yearFilter)

  const handleAddCourse = async () => {
    if (!newCourse.code || !newCourse.name) return

    const result = await addCourse(newCourse)

    if (result) {
      // Reset form
      setNewCourse({
        code: "",
        name: "",
        instructor: "",
        credits: 3,
        semester: "Fall",
        year: new Date().getFullYear(),
        category: "STEM",
        is_ap: false,
        notes: "",
      })

      // Switch to courses tab
      setSelectedTab("courses")
    }
  }

  const handleRemoveCourse = async (id: string) => {
    if (!id) return

    // Confirm before deleting
    if (
      !confirm(
        `Are you sure you want to delete this course? This will also delete all associated grades and cannot be undone.`,
      )
    ) {
      return
    }

    // Delete the course (grades will be handled by the database's foreign key constraints)
    await deleteCourse(id)

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
      const lines = text.split("\n")
      const headers = lines[0].split(",")

      // Find indices for required columns
      const titleIndex = headers.findIndex((h) => h.toLowerCase().includes("title") || h.toLowerCase().includes("name"))
      const typeIndex = headers.findIndex(
        (h) => h.toLowerCase().includes("type") || h.toLowerCase().includes("category"),
      )
      const scoreIndex = headers.findIndex(
        (h) => h.toLowerCase().includes("score") || h.toLowerCase().includes("points"),
      )
      const maxScoreIndex = headers.findIndex(
        (h) => h.toLowerCase().includes("max") || h.toLowerCase().includes("total"),
      )
      const weightIndex = headers.findIndex(
        (h) => h.toLowerCase().includes("weight") || h.toLowerCase().includes("percent"),
      )
      const dateIndex = headers.findIndex((h) => h.toLowerCase().includes("date"))

      // Validate required columns
      if (titleIndex === -1 || scoreIndex === -1) {
        throw new Error("CSV must contain at least 'title/name' and 'score' columns")
      }

      // Process data rows
      let importCount = 0
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue

        const values = lines[i].split(",")

        const grade: InsertGrade = {
          course_id: selectedCourse.id,
          title: values[titleIndex].trim(),
          type: typeIndex !== -1 ? mapGradeType(values[typeIndex].trim()) : "other",
          score: Number.parseFloat(values[scoreIndex].trim()),
          max_score: maxScoreIndex !== -1 ? Number.parseFloat(values[maxScoreIndex].trim()) : 100,
          weight: weightIndex !== -1 ? Number.parseFloat(values[weightIndex].trim()) : 1,
          date: dateIndex !== -1 ? values[dateIndex].trim() : new Date().toISOString().split("T")[0],
          notes: "",
        }

        await addGrade(grade)
        importCount++
      }

      setImportStatus("success")
      setCsvFile(null)
      setImportError(`Successfully imported ${importCount} grades.`)

      // Refresh grades
      fetchGrades()
    } catch (error) {
      console.error("Import error:", error)
      setImportStatus("error")
      setImportError(
        error instanceof Error ? error.message : "Unknown error occurred during import. Please check your CSV format.",
      )
    }
  }

  // Helper function to map grade types
  function mapGradeType(type: string): string {
    type = type.toLowerCase()
    if (type.includes("exam") || type.includes("test")) return "exam"
    if (type.includes("quiz")) return "quiz"
    if (type.includes("homework") || type.includes("hw")) return "homework"
    if (type.includes("project")) return "project"
    if (type.includes("paper") || type.includes("essay")) return "paper"
    if (type.includes("participation")) return "participation"
    return "other"
  }

  // Use the unified GPA calculation function
  const currentGPA = calculateGPA(courses, grades)

  // Group courses by year
  const coursesByYear = filteredCourses.reduce(
    (acc, course) => {
      const year = course.year || 0
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(course)
      return acc
    },
    {} as Record<number, Course[]>,
  )

  // Handle refresh data
  const handleRefreshData = async () => {
    await Promise.all([fetchCourses(), fetchGrades()])
  }

  // Loading state
  if (coursesLoading || gradesLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Academic Courses</h1>
          <p className="text-muted-foreground">Loading course data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (coursesError || gradesError) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Academic Courses</h1>
          <p className="text-muted-foreground">There was an error loading your course data</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription>
            {coursesError?.message || gradesError?.message || "An error occurred while loading your course data."}
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
          <Button variant="outline" onClick={() => setShowDiagnostics(true)}>
            Run Diagnostics
          </Button>
        </div>

        {showDiagnostics && <SupabaseDiagnostics />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Academic Courses</h1>
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        <p className="text-muted-foreground">Manage your courses, track grades, and calculate GPA</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatGPA(currentGPA)}</div>
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
            <div className="text-3xl font-bold">{courses.filter((c) => c.is_ap).length}</div>
            <div className="mt-1 text-sm opacity-90">
              {((courses.filter((c) => c.is_ap).length / Math.max(courses.length, 1)) * 100).toFixed(0)}% of total
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
            <div className="text-3xl font-bold">{courses.reduce((sum, course) => sum + (course.credits || 0), 0)}</div>
            <div className="mt-1 text-sm opacity-90">Across all courses</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="new">Add Course</TabsTrigger>
          {selectedCourse && <TabsTrigger value="grades">Grades for {selectedCourse.code}</TabsTrigger>}
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
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
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Courses</h2>
                <Select
                  value={yearFilter === "all" ? "all" : yearFilter.toString()}
                  onValueChange={(value) => setYearFilter(value === "all" ? "all" : Number.parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {Object.entries(coursesByYear)
                .sort(([yearA], [yearB]) => Number.parseInt(yearB) - Number.parseInt(yearA))
                .map(([year, yearCourses]) => (
                  <div key={year} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{year}</h3>
                      <Badge variant="outline">{yearCourses.length} courses</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {yearCourses.map((course) => {
                        const { percentage, letterGrade } = calculateCourseGrade(course.id || "", grades)
                        const gradeColor = getGradeColor(percentage)

                        return (
                          <Card
                            key={course.id}
                            className={`overflow-hidden transition-all hover:shadow-md ${
                              selectedCourse?.id === course.id ? "ring-2 ring-primary" : ""
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
                                    {course.is_ap && (
                                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
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
                  </div>
                ))}
            </>
          )}

          {selectedCourse && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {selectedCourse.code}
                      {selectedCourse.is_ap && (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
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
                          handleRemoveCourse(selectedCourse.id)
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
                        <span className="text-sm">{selectedCourse.is_ap ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Grade Summary</h3>
                    <div className="space-y-2">
                      {(() => {
                        const { percentage, letterGrade } = calculateCourseGrade(selectedCourse.id || "", grades)
                        const gradeColor = getGradeColor(percentage)

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
                          {grades.filter((g) => g.course_id === selectedCourse.id).length} total
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewCourse({ ...newCourse, code: e.target.value })
                    }
                    placeholder="e.g., MATH101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input
                    id="course-name"
                    value={newCourse.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewCourse({ ...newCourse, name: e.target.value })
                    }
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewCourse({ ...newCourse, instructor: e.target.value })
                    }
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewCourse({ ...newCourse, credits: Number(e.target.value) })
                    }
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewCourse({ ...newCourse, year: Number(e.target.value) })
                    }
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
                  checked={newCourse.is_ap}
                  onCheckedChange={(checked: boolean) => setNewCourse({ ...newCourse, is_ap: checked })}
                />
                <Label htmlFor="course-ap">This is an Advanced Placement (AP) course</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-notes">Notes</Label>
                <Textarea
                  id="course-notes"
                  value={newCourse.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewCourse({ ...newCourse, notes: e.target.value })
                  }
                  placeholder="Any additional notes about the course"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddCourse} className="w-full">
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
                      <AddGradeForm courseId={selectedCourse.id || ""} onAddGrade={addGrade} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const courseGrades = grades.filter((g) => g.course_id === selectedCourse.id)

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
                          .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
                          .map((grade) => {
                            const percentage = (grade.score / grade.max_score) * 100
                            const gradeColor = getGradeColor(percentage)

                            return (
                              <TableRow key={grade.id}>
                                <TableCell>{grade.title}</TableCell>
                                <TableCell className="capitalize">{grade.type}</TableCell>
                                <TableCell>
                                  {grade.score} / {grade.max_score}
                                </TableCell>
                                <TableCell className={gradeColor}>{percentage.toFixed(1)}%</TableCell>
                                <TableCell>{grade.weight}%</TableCell>
                                <TableCell>{new Date(grade.date || "").toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      if (grade.id) deleteGrade(grade.id)
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

        <TabsContent value="diagnostics" className="space-y-4">
          <SupabaseDiagnostics />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper component for adding grades
function AddGradeForm({ courseId, onAddGrade }: { courseId: string; onAddGrade: (grade: any) => Promise<any> }) {
  const [newGrade, setNewGrade] = useState<any>({
    course_id: courseId,
    title: "",
    type: "exam",
    score: 0,
    max_score: 100,
    weight: 10,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const handleAddGrade = async () => {
    if (!newGrade.title || newGrade.score === undefined || newGrade.max_score === undefined) {
      return
    }

    if (newGrade.max_score <= 0) {
      alert("Max score must be greater than 0")
      return
    }

    if (newGrade.score < 0 || newGrade.score > newGrade.max_score) {
      alert(`Score must be between 0 and ${newGrade.max_score}`)
      return
    }

    await onAddGrade(newGrade)

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGrade({ ...newGrade, title: e.target.value })}
            placeholder="e.g., Midterm Exam"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="grade-type">Type</Label>
            <Select value={newGrade.type} onValueChange={(value) => setNewGrade({ ...newGrade, type: value })}>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGrade({ ...newGrade, date: e.target.value })}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewGrade({ ...newGrade, score: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade-max">Max Score</Label>
            <Input
              id="grade-max"
              type="number"
              min="0"
              step="0.01"
              value={newGrade.max_score}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewGrade({ ...newGrade, max_score: Number(e.target.value) })
              }
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewGrade({ ...newGrade, weight: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade-notes">Notes</Label>
          <Textarea
            id="grade-notes"
            value={newGrade.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewGrade({ ...newGrade, notes: e.target.value })
            }
            placeholder="Any additional notes about this grade"
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleAddGrade}>Add Grade</Button>
      </DialogFooter>
    </div>
  )
}
