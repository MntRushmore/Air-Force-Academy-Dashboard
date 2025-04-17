"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Plus, Target, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Goal = {
  id: string
  title: string
  category: string
  deadline: string
  progress: number
  completed: boolean
}

export function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Complete SAT preparation",
      category: "Academic",
      deadline: "2023-12-15",
      progress: 75,
      completed: false,
    },
    {
      id: "2",
      title: "Run 3 miles under 21 minutes",
      category: "Fitness",
      deadline: "2023-11-30",
      progress: 90,
      completed: false,
    },
    {
      id: "3",
      title: "Submit congressional nomination",
      category: "Application",
      deadline: "2023-10-15",
      progress: 100,
      completed: true,
    },
    {
      id: "4",
      title: "Complete personal statement",
      category: "Application",
      deadline: "2023-11-01",
      progress: 60,
      completed: false,
    },
  ])

  const [newGoal, setNewGoal] = useState({
    title: "",
    category: "Academic",
    deadline: "",
  })

  const addGoal = () => {
    if (!newGoal.title || !newGoal.deadline) return

    const goal: Goal = {
      id: String(Date.now()),
      title: newGoal.title,
      category: newGoal.category,
      deadline: newGoal.deadline,
      progress: 0,
      completed: false,
    }

    setGoals([...goals, goal])
    setNewGoal({
      title: "",
      category: "Academic",
      deadline: "",
    })
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const updateProgress = (id: string, progress: number) => {
    setGoals(goals.map((goal) => (goal.id === id ? { ...goal, progress } : goal)))
  }

  const toggleComplete = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed, progress: goal.completed ? goal.progress : 100 } : goal,
      ),
    )
  }

  const activeGoals = goals.filter((goal) => !goal.completed)
  const completedGoals = goals.filter((goal) => goal.completed)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Goals ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 pt-4">
          {activeGoals.map((goal) => (
            <Card key={goal.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleComplete(goal.id)}>
                        <Circle className="h-5 w-5" />
                      </Button>
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{goal.category}</span>
                      </div>
                      <div>Due: {new Date(goal.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeGoal(goal.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progress</span>
                    <span className="text-sm font-medium">{goal.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={goal.progress} className="h-2 flex-1" />
                    <Select
                      value={String(goal.progress)}
                      onValueChange={(value) => updateProgress(goal.id, Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="%" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="25">25%</SelectItem>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="75">75%</SelectItem>
                        <SelectItem value="100">100%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeGoals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No active goals</h3>
              <p className="text-sm text-muted-foreground mt-1">Add a new goal to get started</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 pt-4">
          {completedGoals.map((goal) => (
            <Card key={goal.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleComplete(goal.id)}>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </Button>
                      <span className="font-medium line-through text-muted-foreground">{goal.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{goal.category}</span>
                      </div>
                      <div>Completed</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeGoal(goal.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}

          {completedGoals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No completed goals yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Complete a goal to see it here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="space-y-4 border-t pt-6">
        <h3 className="font-medium">Add New Goal</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="Enter goal title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Application">Application</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={addGoal} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </div>
    </div>
  )
}
