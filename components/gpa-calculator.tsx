"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Course = {
  id: string
  name: string
  grade: string
  credits: number
}

const letterToGPA: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
}

export function GPACalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "Calculus I", grade: "A", credits: 4 },
    { id: "2", name: "Physics", grade: "A-", credits: 4 },
    { id: "3", name: "English Composition", grade: "B+", credits: 3 },
  ])

  const addCourse = () => {
    const newId = String(Date.now())
    setCourses([...courses, { id: newId, name: "", grade: "A", credits: 3 }])
  }

  const removeCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id))
  }

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map((course) => (course.id === id ? { ...course, [field]: value } : course)))
  }

  const calculateGPA = () => {
    if (courses.length === 0) return 0

    let totalPoints = 0
    let totalCredits = 0

    courses.forEach((course) => {
      const gradePoints = letterToGPA[course.grade] || 0
      totalPoints += gradePoints * course.credits
      totalCredits += course.credits
    })

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Current GPA</div>
              <div className="text-4xl font-bold mt-1">{calculateGPA()}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Target GPA</div>
              <div className="text-4xl font-bold mt-1">3.90</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor={`course-${course.id}`}>Course Name</Label>
              <Input
                id={`course-${course.id}`}
                value={course.name}
                onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                placeholder="Course name"
              />
            </div>
            <div className="w-24">
              <Label htmlFor={`grade-${course.id}`}>Grade</Label>
              <Select value={course.grade} onValueChange={(value) => updateCourse(course.id, "grade", value)}>
                <SelectTrigger id={`grade-${course.id}`}>
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="C+">C+</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="C-">C-</SelectItem>
                  <SelectItem value="D+">D+</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="D-">D-</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Label htmlFor={`credits-${course.id}`}>Credits</Label>
              <Input
                id={`credits-${course.id}`}
                type="number"
                min="1"
                max="6"
                value={course.credits}
                onChange={(e) => updateCourse(course.id, "credits", Number.parseInt(e.target.value) || 0)}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeCourse(course.id)} className="mb-0.5">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={addCourse} className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Add Course
      </Button>
    </div>
  )
}
