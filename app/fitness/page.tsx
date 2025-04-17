"use client"

import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Dumbbell, Plus, Target, Trophy, TrendingUp, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db, type Exercise, addItem, deleteItem, updateItem } from "@/lib/db"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { calculateCFAScore, calculateExerciseProgress, cfaStandardsMale, cfaStandardsFemale } from "@/lib/fitness-utils"
import { calculateApplicationProgress } from "@/lib/application-utils"

export default function FitnessPage() {
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) || []
  const goals = useLiveQuery(() => db.goals.toArray(), []) || []
  const courses = useLiveQuery(() => db.courses.toArray(), []) || []
  const grades = useLiveQuery(() => db.grades.toArray(), []) || []

  const [gender, setGender] = useState<"male" | "female">("male")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
    name: "",
    target: 0,
    current: 0,
    unit: "reps",
  })

  const cfaStandards = gender === "male" ? cfaStandardsMale : cfaStandardsFemale
  const cfaScore = calculateCFAScore(exercises, gender)

  const addExercise = async () => {
    if (!newExercise.name) return

    const exercise: Exercise = {
      name: newExercise.name,
      target: newExercise.target || 0,
      current: newExercise.current || 0,
      unit: newExercise.unit || "reps",
    }

    await addItem(db.exercises, exercise)

    setNewExercise({
      name: "",
      target: 0,
      current: 0,
      unit: "reps",
    })
  }

  const updateExercise = async (id: string, changes: Partial<Exercise>) => {
    if (!id) return
    await updateItem(db.exercises, id, changes)
  }

  const removeExercise = async (id: string) => {
    if (!id) return
    await deleteItem(db.exercises, id)
    if (selectedExercise && selectedExercise.id === id) {
      setSelectedExercise(null)
    }
  }

  const calculateGPA = (courses: any[], grades: any[]): number => {
    // Simple GPA calculation for now
    if (courses.length === 0) return 0
    return 3.5 // Placeholder value, should use the actual GPA calculation
  }

  const gpa = calculateGPA(courses, grades)

  // Calculate application progress
  const { overall: applicationProgress } = calculateApplicationProgress(goals, exercises, gender, gpa)

  // Update application progress in settings
  useEffect(() => {
    const updateApplicationProgress = async () => {
      await db.settings.put({
        key: "applicationProgress",
        value: applicationProgress,
        createdAt: new Date(),
      })
    }

    updateApplicationProgress()
  }, [applicationProgress])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Fitness Tracker</h1>
        <p className="text-muted-foreground">Prepare for the Candidate Fitness Assessment (CFA)</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CFA Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cfaScore}/100</div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>Based on current performance</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CFA Standards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">{gender}</div>
            <div className="mt-2 flex items-center text-sm">
              <Select value={gender} onValueChange={(value) => setGender(value as "male" | "female")}>
                <SelectTrigger className="h-8 w-32 border-white/20 bg-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Exercises Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{exercises.length}</div>
            <div className="mt-2 flex items-center text-sm">
              <Dumbbell className="mr-1 h-4 w-4" />
              <span>{exercises.length === 6 ? "All CFA events tracked" : "Add more exercises"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{exercises.length > 0 ? "Improve Score" : "Add Exercises"}</div>
            <div className="mt-2 flex items-center text-sm">
              <Target className="mr-1 h-4 w-4" />
              <span>Track your progress</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exercises" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exercises">CFA Exercises</TabsTrigger>
          <TabsTrigger value="standards">CFA Standards</TabsTrigger>
          <TabsTrigger value="training">Training Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Your Exercises</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Exercise</DialogTitle>
                  <DialogDescription>Track a new exercise for your CFA preparation</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="exercise-name">Exercise Name</Label>
                    <Select
                      value={newExercise.name}
                      onValueChange={(value) => {
                        const standard = cfaStandards[value as keyof typeof cfaStandards]
                        setNewExercise({
                          ...newExercise,
                          name: value,
                          unit: standard?.unit || "reps",
                          target: standard?.max || 0,
                        })
                      }}
                    >
                      <SelectTrigger id="exercise-name">
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basketball Throw">Basketball Throw</SelectItem>
                        <SelectItem value="Pull-ups">Pull-ups</SelectItem>
                        <SelectItem value="Shuttle Run">Shuttle Run</SelectItem>
                        <SelectItem value="Crunches">Crunches</SelectItem>
                        <SelectItem value="Push-ups">Push-ups</SelectItem>
                        <SelectItem value="1-Mile Run">1-Mile Run</SelectItem>
                        <SelectItem value="Custom Exercise">Custom Exercise</SelectItem>
                      </SelectContent>
                    </Select>
                    {newExercise.name === "Custom Exercise" && (
                      <Input
                        className="mt-2"
                        placeholder="Enter exercise name"
                        value={newExercise.name === "Custom Exercise" ? "" : newExercise.name}
                        onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                      />
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="exercise-current">Current Value</Label>
                      <Input
                        id="exercise-current"
                        type="number"
                        step="0.1"
                        value={newExercise.current}
                        onChange={(e) => setNewExercise({ ...newExercise, current: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exercise-target">Target Value</Label>
                      <Input
                        id="exercise-target"
                        type="number"
                        step="0.1"
                        value={newExercise.target}
                        onChange={(e) => setNewExercise({ ...newExercise, target: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exercise-unit">Unit</Label>
                    <Select
                      value={newExercise.unit}
                      onValueChange={(value) => setNewExercise({ ...newExercise, unit: value })}
                    >
                      <SelectTrigger id="exercise-unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reps">Repetitions</SelectItem>
                        <SelectItem value="seconds">Seconds</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="feet">Feet</SelectItem>
                        <SelectItem value="meters">Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addExercise}>Add Exercise</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {exercises.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Dumbbell className="h-12 w-12 text-[#0033a0] mb-4" />
                <h3 className="text-lg font-medium">No exercises added yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Add exercises to track your CFA preparation</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Add CFA Exercises
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add CFA Exercises</DialogTitle>
                      <DialogDescription>Add all six CFA exercises to your tracker</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="mb-4">
                        This will add all six Candidate Fitness Assessment (CFA) exercises to your tracker with default
                        values. You can update your current performance after adding them.
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Basketball Throw</li>
                        <li>Pull-ups</li>
                        <li>Shuttle Run</li>
                        <li>Crunches</li>
                        <li>Push-ups</li>
                        <li>1-Mile Run</li>
                      </ul>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={async () => {
                          const standards = gender === "male" ? cfaStandardsMale : cfaStandardsFemale

                          for (const [name, standard] of Object.entries(standards)) {
                            await addItem(db.exercises, {
                              name,
                              current: standard.min,
                              target: standard.max,
                              unit: standard.unit,
                            })
                          }

                          // Close dialog
                          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
                        }}
                      >
                        Add All CFA Exercises
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exercises.map((exercise) => {
                const { percentage, score } = calculateExerciseProgress(exercise, gender)

                return (
                  <Card
                    key={exercise.id}
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedExercise?.id === exercise.id ? "ring-2 ring-[#0033a0]" : ""
                    }`}
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{exercise.name}</CardTitle>
                        <div className="text-xl font-bold text-[#0033a0]">{score}/100</div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current:</span>
                          <span className="font-medium">
                            {exercise.current} {exercise.unit}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Target:</span>
                          <span>
                            {exercise.target} {exercise.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (exercise.id) {
                              removeExercise(exercise.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {selectedExercise && (
            <Card>
              <CardHeader>
                <CardTitle>Update {selectedExercise.name}</CardTitle>
                <CardDescription>Track your progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="update-current">Current Value</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="update-current"
                        type="number"
                        step="0.1"
                        value={selectedExercise.current}
                        onChange={(e) => {
                          if (selectedExercise.id) {
                            updateExercise(selectedExercise.id, {
                              current: Number(e.target.value),
                            })
                          }
                        }}
                      />
                      <span>{selectedExercise.unit}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="update-target">Target Value</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="update-target"
                        type="number"
                        step="0.1"
                        value={selectedExercise.target}
                        onChange={(e) => {
                          if (selectedExercise.id) {
                            updateExercise(selectedExercise.id, {
                              target: Number(e.target.value),
                            })
                          }
                        }}
                      />
                      <span>{selectedExercise.unit}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedExercise(null)
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedExercise.id) {
                      removeExercise(selectedExercise.id)
                    }
                  }}
                >
                  Delete Exercise
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="standards" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>CFA Standards for {gender === "male" ? "Males" : "Females"}</CardTitle>
                  <CardDescription>Candidate Fitness Assessment requirements for USAFA</CardDescription>
                </div>
                <Select value={gender} onValueChange={(value) => setGender(value as "male" | "female")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exercise</TableHead>
                    <TableHead>Minimum</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Competitive</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Your Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(cfaStandards).map(([name, standard]) => {
                    const exercise = exercises.find((e) => e.name === name)
                    const average = (standard.min + standard.max) / 2

                    let status = "Not Started"
                    let statusColor = "text-slate-500"

                    if (exercise) {
                      if (standard.isReversed) {
                        // Lower is better
                        if (exercise.current <= standard.max) {
                          status = "Excellent"
                          statusColor = "text-green-600 dark:text-green-400"
                        } else if (exercise.current <= average) {
                          status = "Good"
                          statusColor = "text-blue-600 dark:text-blue-400"
                        } else if (exercise.current <= standard.min) {
                          status = "Needs Work"
                          statusColor = "text-amber-600 dark:text-amber-400"
                        } else {
                          status = "Below Minimum"
                          statusColor = "text-red-600 dark:text-red-400"
                        }
                      } else {
                        // Higher is better
                        if (exercise.current >= standard.max) {
                          status = "Excellent"
                          statusColor = "text-green-600 dark:text-green-400"
                        } else if (exercise.current >= average) {
                          status = "Good"
                          statusColor = "text-blue-600 dark:text-blue-400"
                        } else if (exercise.current >= standard.min) {
                          status = "Needs Work"
                          statusColor = "text-amber-600 dark:text-amber-400"
                        } else {
                          status = "Below Minimum"
                          statusColor = "text-red-600 dark:text-red-400"
                        }
                      }
                    }

                    return (
                      <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>
                          {standard.min} {standard.unit}
                        </TableCell>
                        <TableCell>
                          {average.toFixed(1)} {standard.unit}
                        </TableCell>
                        <TableCell>
                          {standard.max} {standard.unit}
                        </TableCell>
                        <TableCell>{standard.unit}</TableCell>
                        <TableCell className={statusColor}>{status}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About the CFA</CardTitle>
              <CardDescription>Understanding the Candidate Fitness Assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Candidate Fitness Assessment (CFA) is a test of strength, agility, speed and endurance used to
                predict a candidate's aptitude for the physical program at the United States Air Force Academy. The CFA
                consists of six events:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <span className="font-medium">Basketball Throw</span> - Measures upper body strength and coordination
                </li>
                <li>
                  <span className="font-medium">Pull-ups</span> - Measures upper body strength and endurance
                </li>
                <li>
                  <span className="font-medium">Shuttle Run</span> - Measures agility, speed and coordination
                </li>
                <li>
                  <span className="font-medium">Crunches</span> - Measures abdominal strength and endurance
                </li>
                <li>
                  <span className="font-medium">Push-ups</span> - Measures upper body strength and endurance
                </li>
                <li>
                  <span className="font-medium">1-Mile Run</span> - Measures aerobic capacity and endurance
                </li>
              </ol>
              <p>
                The CFA must be administered by a physical education teacher, an officer in any branch of the military,
                or a USAFA Admissions Liaison Officer (ALO). The assessment must be completed according to specific
                guidelines and submitted as part of your application.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CFA Training Plans</CardTitle>
              <CardDescription>Structured workouts to improve your performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0033a0]">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">12-Week CFA Preparation Plan</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive training to maximize your CFA score</p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Week 1-4: Foundation</span>
                      <span>Build baseline fitness</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Week 5-8: Development</span>
                      <span>Increase intensity</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Week 9-12: Peak Performance</span>
                      <span>Maximize results</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
                <Button className="mt-4 w-full">View Full Plan</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Upper Body Strength</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Focus on pull-ups and push-ups</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>3 sets of max effort pull-ups, 3 times per week</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>5 sets of push-ups (to failure), every other day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Assisted pull-up training for progression</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="mt-4 w-full">
                    View Workout
                  </Button>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Cardio Endurance</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Improve 1-mile run time</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Interval training: 400m repeats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Tempo runs: 2-3 miles at moderate pace</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Weekly long run for endurance building</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="mt-4 w-full">
                    View Workout
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Core Strength</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Maximize crunches performance</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Plank variations: 3 sets of 60 seconds</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Russian twists: 3 sets of 20 reps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Leg raises: 3 sets of 15 reps</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="mt-4 w-full">
                    View Workout
                  </Button>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Agility Training</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Improve shuttle run performance</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Ladder drills: 5 minutes, 3 times per week</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Cone drills: 5 sets with full recovery</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Shuttle run practice: 10 repetitions</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="mt-4 w-full">
                    View Workout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
