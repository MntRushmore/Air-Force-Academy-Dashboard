"use client"

import { useState } from "react"
import { ArrowRight, Dumbbell, LineChart, Plus, Target, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Exercise = {
  id: string
  name: string
  target: number
  current: number
  unit: string
}

export default function FitnessPage() {
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "1",
      name: "Push-ups",
      target: 62,
      current: 45,
      unit: "reps",
    },
    {
      id: "2",
      name: "Sit-ups",
      target: 75,
      current: 60,
      unit: "reps",
    },
    {
      id: "3",
      name: "Pull-ups",
      target: 12,
      current: 8,
      unit: "reps",
    },
    {
      id: "4",
      name: "1-Mile Run",
      target: 6.5,
      current: 7.2,
      unit: "minutes",
    },
    {
      id: "5",
      name: "Shuttle Run",
      target: 8.1,
      current: 8.6,
      unit: "seconds",
    },
    {
      id: "6",
      name: "Basketball Throw",
      target: 70,
      current: 62,
      unit: "feet",
    },
  ])

  const [newExercise, setNewExercise] = useState({
    name: "",
    target: 0,
    current: 0,
    unit: "reps",
  })

  const addExercise = () => {
    if (!newExercise.name || newExercise.target <= 0) return

    const exercise: Exercise = {
      id: String(Date.now()),
      name: newExercise.name,
      target: newExercise.target,
      current: newExercise.current,
      unit: newExercise.unit,
    }

    setExercises([...exercises, exercise])
    setNewExercise({
      name: "",
      target: 0,
      current: 0,
      unit: "reps",
    })
  }

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id))
  }

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    setExercises(exercises.map((exercise) => (exercise.id === id ? { ...exercise, [field]: value } : exercise)))
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100))
  }

  const calculateOverallProgress = () => {
    const totalProgress = exercises.reduce((sum, exercise) => {
      // For running and shuttle run, lower is better
      if (exercise.name.includes("Run") && exercise.current > 0 && exercise.target > 0) {
        return sum + Math.min(100, Math.round((exercise.target / exercise.current) * 100))
      }
      return sum + calculateProgress(exercise.current, exercise.target)
    }, 0)

    return Math.round(totalProgress / exercises.length)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Fitness Tracker</h1>
        <p className="text-muted-foreground">Track your progress toward USAFA Candidate Fitness Assessment standards</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Fitness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calculateOverallProgress()}%</div>
            <Progress value={calculateOverallProgress()} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CFA Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {calculateOverallProgress() >= 85 ? (
                <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600 dark:bg-green-900 dark:text-green-400">
                  Excellent
                </div>
              ) : calculateOverallProgress() >= 70 ? (
                <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  Good
                </div>
              ) : calculateOverallProgress() >= 50 ? (
                <div className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-600 dark:bg-amber-900 dark:text-amber-400">
                  Satisfactory
                </div>
              ) : (
                <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-900 dark:text-red-400">
                  Needs Improvement
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Strongest Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">Push-ups</div>
            <div className="text-sm text-muted-foreground">73% of target</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Focus Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">1-Mile Run</div>
            <div className="text-sm text-muted-foreground">90% of target</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tracker" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tracker">CFA Tracker</TabsTrigger>
          <TabsTrigger value="standards">CFA Standards</TabsTrigger>
          <TabsTrigger value="workouts">Workout Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Fitness Assessment</CardTitle>
              <CardDescription>Track your progress on the six CFA events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{exercise.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={exercise.current}
                          onChange={(e) =>
                            updateExercise(exercise.id, "current", Number.parseFloat(e.target.value) || 0)
                          }
                          className="w-16 h-8"
                        />
                        <span className="text-sm text-muted-foreground">
                          / {exercise.target} {exercise.unit}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeExercise(exercise.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress
                    value={
                      exercise.name.includes("Run") && exercise.current > 0 && exercise.target > 0
                        ? Math.min(100, Math.round((exercise.target / exercise.current) * 100))
                        : calculateProgress(exercise.current, exercise.target)
                    }
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="grid w-full gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="exercise-name">Exercise Name</Label>
                  <Input
                    id="exercise-name"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                    placeholder="Exercise name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exercise-target">Target</Label>
                  <Input
                    id="exercise-target"
                    type="number"
                    value={newExercise.target || ""}
                    onChange={(e) => setNewExercise({ ...newExercise, target: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="Target value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exercise-current">Current</Label>
                  <Input
                    id="exercise-current"
                    type="number"
                    value={newExercise.current || ""}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, current: Number.parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Current value"
                  />
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
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="seconds">Seconds</SelectItem>
                      <SelectItem value="feet">Feet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addExercise} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Exercise
              </Button>
            </CardFooter>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Progress Chart</CardTitle>
                <CardDescription>Your fitness improvement over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <LineChart className="h-16 w-16 mb-4" />
                  <p>Progress chart visualization will appear here</p>
                  <p className="text-sm">Track your progress over time to see improvements</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fitness Goals</CardTitle>
                <CardDescription>Your current fitness objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Improve 1-Mile Run Time</div>
                    <div className="text-sm text-muted-foreground">Target: 6:30 by November 15</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Increase Push-ups</div>
                    <div className="text-sm text-muted-foreground">Target: 60 reps by December 1</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium">Complete Full CFA</div>
                    <div className="text-sm text-muted-foreground">Target: Pass all events by January 15</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Add New Goal <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="standards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>USAFA CFA Standards</CardTitle>
              <CardDescription>Official Candidate Fitness Assessment requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left font-medium">Event</th>
                      <th className="py-3 text-left font-medium">Male (Excellent)</th>
                      <th className="py-3 text-left font-medium">Male (Minimum)</th>
                      <th className="py-3 text-left font-medium">Female (Excellent)</th>
                      <th className="py-3 text-left font-medium">Female (Minimum)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">Basketball Throw</td>
                      <td className="py-3">102 feet</td>
                      <td className="py-3">67 feet</td>
                      <td className="py-3">68 feet</td>
                      <td className="py-3">41 feet</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Pull-ups</td>
                      <td className="py-3">18 reps</td>
                      <td className="py-3">7 reps</td>
                      <td className="py-3">7 reps</td>
                      <td className="py-3">1 rep</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Shuttle Run</td>
                      <td className="py-3">7.8 seconds</td>
                      <td className="py-3">8.7 seconds</td>
                      <td className="py-3">8.6 seconds</td>
                      <td className="py-3">9.4 seconds</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Modified Sit-ups</td>
                      <td className="py-3">95 reps</td>
                      <td className="py-3">58 reps</td>
                      <td className="py-3">95 reps</td>
                      <td className="py-3">58 reps</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Push-ups</td>
                      <td className="py-3">75 reps</td>
                      <td className="py-3">42 reps</td>
                      <td className="py-3">50 reps</td>
                      <td className="py-3">19 reps</td>
                    </tr>
                    <tr>
                      <td className="py-3">1-Mile Run</td>
                      <td className="py-3">5:20 min</td>
                      <td className="py-3">7:30 min</td>
                      <td className="py-3">6:00 min</td>
                      <td className="py-3">8:30 min</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CFA Testing Procedures</CardTitle>
              <CardDescription>How each event is properly conducted</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Basketball Throw</h3>
                <p className="text-sm text-muted-foreground">
                  Performed with a men's basketball from a kneeling position. The candidate throws the basketball as far
                  as possible from a kneeling position. The best of three attempts is recorded.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Pull-ups</h3>
                <p className="text-sm text-muted-foreground">
                  Performed on a horizontal bar with palms facing away. The candidate must pull up until the chin is
                  above the bar and then lower completely. Kipping or leg movement is not permitted.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Shuttle Run</h3>
                <p className="text-sm text-muted-foreground">
                  Two parallel lines are marked 30 feet apart. The candidate starts behind one line, runs to the other
                  line, touches it with their hand, returns to the starting line, touches it, and repeats. Time stops
                  when the candidate crosses the starting line the second time.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Modified Sit-ups</h3>
                <p className="text-sm text-muted-foreground">
                  Performed with knees bent at 90 degrees and feet held by a partner. Arms are crossed over the chest.
                  The candidate must curl up until the elbows touch the thighs and then return until the shoulder blades
                  touch the ground. Maximum reps in 2 minutes.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Push-ups</h3>
                <p className="text-sm text-muted-foreground">
                  Performed with hands shoulder-width apart. The candidate must lower until the arms form a 90-degree
                  angle and then push up to the starting position. The back must remain straight throughout. Maximum
                  reps in 2 minutes.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">1-Mile Run</h3>
                <p className="text-sm text-muted-foreground">
                  Performed on a measured track or flat surface. The candidate must complete the distance as quickly as
                  possible. Time is recorded in minutes and seconds.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Workout Plans</CardTitle>
              <CardDescription>Training programs to improve your CFA performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Push-up Improvement Plan</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Week 1-2:</strong> 3 sets of max push-ups, 3 times per week
                  </p>
                  <p>
                    <strong>Week 3-4:</strong> 5 sets of max push-ups, 3 times per week
                  </p>
                  <p>
                    <strong>Week 5-6:</strong> Pyramid sets (5-10-15-10-5), 4 times per week
                  </p>
                  <p>
                    <strong>Week 7-8:</strong> 100 push-ups per day, broken into sets as needed
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Running Improvement Plan</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Week 1-2:</strong> 3 runs per week (1 mile, 2 miles, interval training)
                  </p>
                  <p>
                    <strong>Week 3-4:</strong> 4 runs per week (add hill sprints)
                  </p>
                  <p>
                    <strong>Week 5-6:</strong> 4 runs per week (increase intensity of intervals)
                  </p>
                  <p>
                    <strong>Week 7-8:</strong> 5 runs per week (include time trials)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Pull-up Improvement Plan</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Week 1-2:</strong> Assisted pull-ups and negative pull-ups, 3 times per week
                  </p>
                  <p>
                    <strong>Week 3-4:</strong> 3 sets of max pull-ups, 3 times per week
                  </p>
                  <p>
                    <strong>Week 5-6:</strong> Pyramid sets (1-2-3-2-1), 3 times per week
                  </p>
                  <p>
                    <strong>Week 7-8:</strong> 5 sets of max pull-ups, 3 times per week
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Complete CFA Training Schedule</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Monday:</strong> Push-ups and sit-ups focus
                  </p>
                  <p>
                    <strong>Tuesday:</strong> Running (intervals or distance)
                  </p>
                  <p>
                    <strong>Wednesday:</strong> Pull-ups and basketball throw practice
                  </p>
                  <p>
                    <strong>Thursday:</strong> Running and shuttle run practice
                  </p>
                  <p>
                    <strong>Friday:</strong> Full CFA practice (all events)
                  </p>
                  <p>
                    <strong>Saturday:</strong> Light cardio or active recovery
                  </p>
                  <p>
                    <strong>Sunday:</strong> Rest day
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Download Complete Training Plan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
