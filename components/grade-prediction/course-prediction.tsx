"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Calculator } from "lucide-react"
import type { Course, Grade } from "@/lib/db"
import type { CourseGradePrediction, FutureAssignment } from "@/lib/grade-prediction"
import { calculatePredictedGrade, calculateRequiredScore } from "@/lib/grade-prediction"
import { percentageToLetterGrade } from "@/lib/grade-analysis"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CoursePredictionProps {
  course: Course
  grades: Grade[]
  initialFutureAssignments?: FutureAssignment[]
  onPredictionChange?: (prediction: CourseGradePrediction) => void
}

export function CoursePrediction({
  course,
  grades,
  initialFutureAssignments = [],
  onPredictionChange,
}: CoursePredictionProps) {
  const [futureAssignments, setFutureAssignments] = useState<FutureAssignment[]>(
    initialFutureAssignments.length > 0
      ? initialFutureAssignments
      : [
          {
            id: "future-1",
            title: "Final Exam",
            type: "exam",
            weight: 20,
            predictedScore: 85,
            maxScore: 100,
          },
        ],
  )
  const [targetGrade, setTargetGrade] = useState<number>(90)
  const [targetAssignmentId, setTargetAssignmentId] = useState<string>("")
  const [requiredScore, setRequiredScore] = useState<number | null>(null)

  // Calculate prediction
  const prediction = calculatePredictedGrade(course, grades, futureAssignments)

  // Update parent component when prediction changes
  const handlePredictionChange = (updatedPrediction: CourseGradePrediction) => {
    if (onPredictionChange) {
      onPredictionChange(updatedPrediction)
    }
  }

  // Add a new future assignment
  const addFutureAssignment = () => {
    const newAssignment: FutureAssignment = {
      id: `future-${Date.now()}`,
      title: "New Assignment",
      type: "homework",
      weight: 10,
      predictedScore: 85,
      maxScore: 100,
    }

    const updatedAssignments = [...futureAssignments, newAssignment]
    setFutureAssignments(updatedAssignments)

    const updatedPrediction = calculatePredictedGrade(course, grades, updatedAssignments)
    handlePredictionChange(updatedPrediction)
  }

  // Remove a future assignment
  const removeFutureAssignment = (id: string) => {
    const updatedAssignments = futureAssignments.filter((assignment) => assignment.id !== id)
    setFutureAssignments(updatedAssignments)

    const updatedPrediction = calculatePredictedGrade(course, grades, updatedAssignments)
    handlePredictionChange(updatedPrediction)
  }

  // Update a future assignment
  const updateFutureAssignment = (id: string, updates: Partial<FutureAssignment>) => {
    const updatedAssignments = futureAssignments.map((assignment) => {
      if (assignment.id === id) {
        return { ...assignment, ...updates }
      }
      return assignment
    })

    setFutureAssignments(updatedAssignments)

    const updatedPrediction = calculatePredictedGrade(course, grades, updatedAssignments)
    handlePredictionChange(updatedPrediction)
  }

  // Calculate required score
  const calculateRequired = () => {
    if (!targetAssignmentId) return

    const required = calculateRequiredScore(targetGrade, course, grades, futureAssignments, targetAssignmentId)
    setRequiredScore(required)
  }

  // Get color for grade
  const getGradeColor = (grade: number): string => {
    if (grade >= 90) return "text-green-600 dark:text-green-400"
    if (grade >= 80) return "text-blue-600 dark:text-blue-400"
    if (grade >= 70) return "text-yellow-600 dark:text-yellow-400"
    if (grade >= 60) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>
            {course.code}: {course.name}
          </span>
          <Badge
            className={`${
              prediction.predictedAverage >= 90
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : prediction.predictedAverage >= 80
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : prediction.predictedAverage >= 70
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : prediction.predictedAverage >= 60
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            Predicted: {prediction.predictedLetterGrade}
          </Badge>
        </CardTitle>
        <CardDescription>
          Current Average: {prediction.currentAverage.toFixed(1)}% ({prediction.currentLetterGrade})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Predicted Final Grade</h3>
              <div className="text-2xl font-bold">
                <span className={getGradeColor(prediction.predictedAverage)}>
                  {prediction.predictedAverage.toFixed(1)}%
                </span>{" "}
                <span className="text-base">({prediction.predictedLetterGrade})</span>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calculator className="h-4 w-4 mr-2" />
                  Grade Calculator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Grade Calculator</DialogTitle>
                  <DialogDescription>
                    Calculate what score you need on an assignment to achieve a target grade.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-grade">Target Grade (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="target-grade"
                        min={0}
                        max={100}
                        step={1}
                        value={[targetGrade]}
                        onValueChange={(value) => setTargetGrade(value[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-medium">{targetGrade}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Letter Grade: {percentageToLetterGrade(targetGrade)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-assignment">Assignment</Label>
                    <Select value={targetAssignmentId} onValueChange={setTargetAssignmentId}>
                      <SelectTrigger id="target-assignment">
                        <SelectValue placeholder="Select an assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        {futureAssignments.map((assignment) => (
                          <SelectItem key={assignment.id} value={assignment.id}>
                            {assignment.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {requiredScore !== null && (
                    <div className="p-4 border rounded-md bg-muted">
                      <h4 className="font-medium mb-1">Required Score</h4>
                      <div className="text-2xl font-bold">
                        {requiredScore.toFixed(1)} /{" "}
                        {futureAssignments.find((a) => a.id === targetAssignmentId)?.maxScore}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {requiredScore <= futureAssignments.find((a) => a.id === targetAssignmentId)?.maxScore!
                          ? `You need ${requiredScore.toFixed(1)} points to achieve a ${targetGrade}% final grade.`
                          : `It's not possible to achieve a ${targetGrade}% final grade with just this assignment.`}
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={calculateRequired} disabled={!targetAssignmentId}>
                    Calculate Required Score
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Future Assignments</h3>
              <Button variant="outline" size="sm" onClick={addFutureAssignment}>
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </div>

            <div className="space-y-4">
              {futureAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 border rounded-md space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Input
                          value={assignment.title}
                          onChange={(e) =>
                            updateFutureAssignment(assignment.id, {
                              title: e.target.value,
                            })
                          }
                          className="h-7 text-sm font-medium"
                        />
                        <Badge variant="outline" className="capitalize">
                          {assignment.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Weight: {assignment.weight}%</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFutureAssignment(assignment.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label htmlFor={`score-${assignment.id}`}>
                        Predicted Score: {assignment.predictedScore} / {assignment.maxScore}
                      </Label>
                      <span>{((assignment.predictedScore / assignment.maxScore) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id={`score-${assignment.id}`}
                        min={0}
                        max={assignment.maxScore}
                        step={1}
                        value={[assignment.predictedScore]}
                        onValueChange={(value) =>
                          updateFutureAssignment(assignment.id, {
                            predictedScore: value[0],
                          })
                        }
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={assignment.maxScore}
                        value={assignment.predictedScore}
                        onChange={(e) =>
                          updateFutureAssignment(assignment.id, {
                            predictedScore: Number(e.target.value),
                          })
                        }
                        className="w-16 h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`type-${assignment.id}`}>Type</Label>
                      <Select
                        value={assignment.type}
                        onValueChange={(value) =>
                          updateFutureAssignment(assignment.id, {
                            type: value as Grade["type"],
                          })
                        }
                      >
                        <SelectTrigger id={`type-${assignment.id}`}>
                          <SelectValue />
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
                      <Label htmlFor={`weight-${assignment.id}`}>Weight (%)</Label>
                      <Input
                        id={`weight-${assignment.id}`}
                        type="number"
                        min={0}
                        max={100}
                        value={assignment.weight}
                        onChange={(e) =>
                          updateFutureAssignment(assignment.id, {
                            weight: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
