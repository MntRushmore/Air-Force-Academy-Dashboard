"use client"

import { useState, useEffect, useCallback } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { Check, Flag, Plus, Target, Trash2, Dumbbell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { db, type Goal, addItem, deleteItem, updateItem } from "@/lib/db"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Add imports for fitness and application utilities
import { calculateCFAScore } from "@/lib/fitness-utils"
import { calculateApplicationProgress } from "@/lib/application-utils"
import { calculateGPA } from "@/lib/grade-analysis"

export default function GoalsPage() {
  const goals = useLiveQuery(() => db.goals.toArray(), []) || []
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: "",
    category: "Academic",
    deadline: new Date().toISOString().split("T")[0],
    progress: 0,
    completed: false,
  })

  // Add additional data fetching
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) || []
  const courses = useLiveQuery(() => db.courses.toArray(), []) || []
  const grades = useLiveQuery(() => db.grades.toArray(), []) || []
  const [gender, setGender] = useState<"male" | "female">("male")

  // Use effect to get gender preference from settings
  useEffect(() => {
    const getGenderPreference = async () => {
      const genderPref = await db.settings.where("key").equals("gender").first()
      if (genderPref) {
        setGender(genderPref.value)
      }
    }

    getGenderPreference()
  }, [])

  // Calculate GPA
  const gpa = calculateGPA(courses, grades)

  // Calculate fitness score
  const fitnessScore = calculateCFAScore(exercises, gender)

  // Calculate application progress
  const { overall: appProgress, components } = calculateApplicationProgress(goals, exercises, gender, gpa)

  // Update application progress in settings when relevant data changes
  useEffect(() => {
    const updateApplicationProgress = async () => {
      await db.settings.put({
        key: "applicationProgress",
        value: appProgress,
        createdAt: new Date(),
      })
    }

    updateApplicationProgress()
  }, [appProgress])

  const updateGoal = async (id: string, changes: Partial<Goal>) => {
    if (!id) return
    await updateItem(db.goals, id, changes)

    // Update selected goal if it's the one being modified
    if (selectedGoal && selectedGoal.id === id) {
      setSelectedGoal({ ...selectedGoal, ...changes })
    }
  }

  // Add a function to update fitness goals based on CFA score
  const updateFitnessGoals = useCallback(async () => {
    // Find fitness goals related to CFA
    const cfaGoal = goals.find(
      (g) =>
        (g.category === "Fitness" && g.title.toLowerCase().includes("cfa")) ||
        g.title.toLowerCase().includes("fitness assessment"),
    )

    if (cfaGoal && cfaGoal.id) {
      // Update the goal progress based on fitness score
      await updateGoal(cfaGoal.id, { progress: fitnessScore })
    }
  }, [fitnessScore, goals, updateGoal])

  // Call the update function when fitness score changes
  useEffect(() => {
    updateFitnessGoals()
  }, [fitnessScore, updateFitnessGoals])

  const addGoal = async () => {
    if (!newGoal.title) return

    const goal: Goal = {
      title: newGoal.title,
      category: newGoal.category || "Academic",
      deadline: newGoal.deadline || new Date().toISOString().split("T")[0],
      progress: newGoal.progress || 0,
      completed: newGoal.completed || false,
    }

    await addItem(db.goals, goal)

    setNewGoal({
      title: "",
      category: "Academic",
      deadline: new Date().toISOString().split("T")[0],
      progress: 0,
      completed: false,
    })
  }

  const removeGoal = async (id: string) => {
    if (!id) return
    await deleteItem(db.goals, id)
    if (selectedGoal && selectedGoal.id === id) {
      setSelectedGoal(null)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Academic":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Fitness":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Application":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Leadership":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "Personal":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-600 dark:bg-green-500"
    if (progress >= 50) return "bg-blue-600 dark:bg-blue-500"
    if (progress >= 25) return "bg-amber-600 dark:bg-amber-500"
    return "bg-slate-600 dark:bg-slate-500"
  }

  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)

    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const getDeadlineStatus = (deadline: string) => {
    const daysRemaining = calculateDaysRemaining(deadline)

    if (daysRemaining < 0) return { text: "Overdue", color: "text-red-600 dark:text-red-400" }
    if (daysRemaining === 0) return { text: "Today", color: "text-amber-600 dark:text-amber-400" }
    if (daysRemaining <= 7) return { text: `${daysRemaining} days left`, color: "text-amber-600 dark:text-amber-400" }
    if (daysRemaining <= 30) return { text: `${daysRemaining} days left`, color: "text-blue-600 dark:text-blue-400" }
    return { text: `${daysRemaining} days left`, color: "text-green-600 dark:text-green-400" }
  }

  const academicGoals = goals.filter((goal) => goal.category === "Academic")
  const fitnessGoals = goals.filter((goal) => goal.category === "Fitness")
  const applicationGoals = goals.filter((goal) => goal.category === "Application")
  const otherGoals = goals.filter((goal) => !["Academic", "Fitness", "Application"].includes(goal.category))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Goal Tracker</h1>
        <p className="text-muted-foreground">Set and track your USAFA application goals</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goals.length}</div>
            <div className="mt-2 flex items-center text-sm">
              <Target className="mr-1 h-4 w-4" />
              <span>{goals.length > 0 ? "Keep up the good work!" : "Add your first goal"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goals.filter((g) => g.completed).length}</div>
            <div className="mt-2 flex items-center text-sm">
              <Check className="mr-1 h-4 w-4" />
              <span>
                {goals.length > 0
                  ? `${Math.round((goals.filter((g) => g.completed).length / goals.length) * 100)}% completion rate`
                  : "No goals added yet"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Application Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applicationGoals.length}</div>
            <div className="mt-2 flex items-center text-sm">
              <Flag className="mr-1 h-4 w-4" />
              <span>{applicationGoals.filter((g) => g.completed).length} completed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {goals.length > 0
                ? `${Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)}%`
                : "0%"}
            </div>
            <div className="mt-2">
              <Progress
                value={goals.length > 0 ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length : 0}
                className="h-2 bg-white/20"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Goals</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
              <DialogDescription>Set a new goal to track your progress</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Complete SAT preparation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-category">Category</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger id="goal-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Fitness">Fitness</SelectItem>
                    <SelectItem value="Application">Application</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Deadline</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="goal-progress">Initial Progress</Label>
                  <span className="text-sm">{newGoal.progress || 0}%</span>
                </div>
                <Slider
                  id="goal-progress"
                  min={0}
                  max={100}
                  step={5}
                  value={[newGoal.progress || 0]}
                  onValueChange={(value) => setNewGoal({ ...newGoal, progress: value[0] })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="goal-completed"
                  checked={newGoal.completed}
                  onCheckedChange={(checked) => setNewGoal({ ...newGoal, completed: checked })}
                />
                <Label htmlFor="goal-completed">Mark as completed</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addGoal}>Add Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="h-12 w-12 text-[#0033a0] mb-4" />
                <h3 className="text-lg font-medium">No goals added yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first goal to start tracking your progress
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Goal</DialogTitle>
                      <DialogDescription>Set a new goal to track your progress</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="goal-title-first">Goal Title</Label>
                        <Input
                          id="goal-title-first"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          placeholder="e.g., Complete SAT preparation"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal-category-first">Category</Label>
                        <Select
                          value={newGoal.category}
                          onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                        >
                          <SelectTrigger id="goal-category-first">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Academic">Academic</SelectItem>
                            <SelectItem value="Fitness">Fitness</SelectItem>
                            <SelectItem value="Application">Application</SelectItem>
                            <SelectItem value="Leadership">Leadership</SelectItem>
                            <SelectItem value="Personal">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal-deadline-first">Deadline</Label>
                        <Input
                          id="goal-deadline-first"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addGoal}>Add Goal</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedGoal?.id === goal.id ? "ring-2 ring-[#0033a0]" : ""
                  } ${goal.completed ? "bg-gray-50 dark:bg-gray-900/50" : ""}`}
                  onClick={() => setSelectedGoal(goal)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className={getCategoryColor(goal.category)}>{goal.category}</Badge>
                        <CardTitle className={`mt-2 ${goal.completed ? "line-through opacity-70" : ""}`}>
                          {goal.title}
                        </CardTitle>
                      </div>
                      {goal.completed && (
                        <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress
                        value={goal.progress}
                        className={`h-2 ${goal.completed ? "bg-green-600 dark:bg-green-500" : getProgressColor(goal.progress)}`}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className={getDeadlineStatus(goal.deadline).color}>
                        {getDeadlineStatus(goal.deadline).text}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (goal.id) {
                          removeGoal(goal.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {selectedGoal && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={getCategoryColor(selectedGoal.category)}>{selectedGoal.category}</Badge>
                    <CardTitle className="mt-2">{selectedGoal.title}</CardTitle>
                    <CardDescription>Deadline: {new Date(selectedGoal.deadline).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="selected-goal-completed"
                        checked={selectedGoal.completed}
                        onCheckedChange={(checked) => {
                          if (selectedGoal.id) {
                            updateGoal(selectedGoal.id, { completed: checked })
                          }
                        }}
                      />
                      <Label htmlFor="selected-goal-completed">Completed</Label>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="selected-goal-progress">Progress</Label>
                    <span className="text-sm">{selectedGoal.progress}%</span>
                  </div>
                  <Slider
                    id="selected-goal-progress"
                    min={0}
                    max={100}
                    step={5}
                    value={[selectedGoal.progress]}
                    onValueChange={(value) => {
                      if (selectedGoal.id) {
                        updateGoal(selectedGoal.id, { progress: value[0] })
                      }
                    }}
                    disabled={selectedGoal.completed}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selected-goal-deadline">Deadline</Label>
                  <Input
                    id="selected-goal-deadline"
                    type="date"
                    value={selectedGoal.deadline}
                    onChange={(e) => {
                      if (selectedGoal.id) {
                        updateGoal(selectedGoal.id, { deadline: e.target.value })
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selected-goal-category">Category</Label>
                  <Select
                    value={selectedGoal.category}
                    onValueChange={(value) => {
                      if (selectedGoal.id) {
                        updateGoal(selectedGoal.id, { category: value })
                      }
                    }}
                  >
                    <SelectTrigger id="selected-goal-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Application">Application</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedGoal(null)
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedGoal.id) {
                      removeGoal(selectedGoal.id)
                    }
                  }}
                >
                  Delete Goal
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          {academicGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="h-12 w-12 text-[#0033a0] mb-4" />
                <h3 className="text-lg font-medium">No academic goals added yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Add academic goals to track your progress</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Add Academic Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Academic Goal</DialogTitle>
                      <DialogDescription>Set a new academic goal to track your progress</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="academic-goal-title">Goal Title</Label>
                        <Input
                          id="academic-goal-title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          placeholder="e.g., Achieve 4.0 GPA this semester"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="academic-goal-deadline">Deadline</Label>
                        <Input
                          id="academic-goal-deadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          setNewGoal({ ...newGoal, category: "Academic" })
                          addGoal()
                        }}
                      >
                        Add Goal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {academicGoals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedGoal?.id === goal.id ? "ring-2 ring-[#0033a0]" : ""
                  } ${goal.completed ? "bg-gray-50 dark:bg-gray-900/50" : ""}`}
                  onClick={() => setSelectedGoal(goal)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className={getCategoryColor(goal.category)}>{goal.category}</Badge>
                        <CardTitle className={`mt-2 ${goal.completed ? "line-through opacity-70" : ""}`}>
                          {goal.title}
                        </CardTitle>
                      </div>
                      {goal.completed && (
                        <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress
                        value={goal.progress}
                        className={`h-2 ${goal.completed ? "bg-green-600 dark:bg-green-500" : getProgressColor(goal.progress)}`}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className={getDeadlineStatus(goal.deadline).color}>
                        {getDeadlineStatus(goal.deadline).text}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fitness" className="space-y-4">
          {fitnessGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Dumbbell className="h-12 w-12 text-[#0033a0] mb-4" />
                <h3 className="text-lg font-medium">No fitness goals added yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Add fitness goals to track your CFA preparation</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Add Fitness Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Fitness Goal</DialogTitle>
                      <DialogDescription>Set a new fitness goal to track your CFA preparation</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="fitness-goal-title">Goal Title</Label>
                        <Input
                          id="fitness-goal-title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          placeholder="e.g., Complete 50 push-ups without stopping"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fitness-goal-deadline">Deadline</Label>
                        <Input
                          id="fitness-goal-deadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          setNewGoal({ ...newGoal, category: "Fitness" })
                          addGoal()
                        }}
                      >
                        Add Goal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fitnessGoals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedGoal?.id === goal.id ? "ring-2 ring-[#0033a0]" : ""
                  } ${goal.completed ? "bg-gray-50 dark:bg-gray-900/50" : ""}`}
                  onClick={() => setSelectedGoal(goal)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className={getCategoryColor(goal.category)}>{goal.category}</Badge>
                        <CardTitle className={`mt-2 ${goal.completed ? "line-through opacity-70" : ""}`}>
                          {goal.title}
                        </CardTitle>
                      </div>
                      {goal.completed && (
                        <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress
                        value={goal.progress}
                        className={`h-2 ${goal.completed ? "bg-green-600 dark:bg-green-500" : getProgressColor(goal.progress)}`}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className={getDeadlineStatus(goal.deadline).color}>
                        {getDeadlineStatus(goal.deadline).text}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          {applicationGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Flag className="h-12 w-12 text-[#0033a0] mb-4" />
                <h3 className="text-lg font-medium">No application goals added yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add application goals to track your USAFA application
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Add Application Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Application Goal</DialogTitle>
                      <DialogDescription>Set a new goal for your USAFA application process</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="application-goal-title">Goal Title</Label>
                        <Input
                          id="application-goal-title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          placeholder="e.g., Submit congressional nomination"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="application-goal-deadline">Deadline</Label>
                        <Input
                          id="application-goal-deadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          setNewGoal({ ...newGoal, category: "Application" })
                          addGoal()
                        }}
                      >
                        Add Goal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applicationGoals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedGoal?.id === goal.id ? "ring-2 ring-[#0033a0]" : ""
                  } ${goal.completed ? "bg-gray-50 dark:bg-gray-900/50" : ""}`}
                  onClick={() => setSelectedGoal(goal)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className={getCategoryColor(goal.category)}>{goal.category}</Badge>
                        <CardTitle className={`mt-2 ${goal.completed ? "line-through opacity-70" : ""}`}>
                          {goal.title}
                        </CardTitle>
                      </div>
                      {goal.completed && (
                        <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress
                        value={goal.progress}
                        className={`h-2 ${goal.completed ? "bg-green-600 dark:bg-green-500" : getProgressColor(goal.progress)}`}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className={getDeadlineStatus(goal.deadline).color}>
                        {getDeadlineStatus(goal.deadline).text}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
