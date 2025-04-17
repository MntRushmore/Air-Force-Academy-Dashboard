"use client"

import { useState } from "react"
import { BookOpen, Calendar, CheckCircle2, Clock, FileText, GraduationCap, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PomodoroTimer } from "@/components/pomodoro-timer"

type Task = {
  id: string
  title: string
  description: string
  dueDate: string
  priority: "high" | "medium" | "low"
  completed: boolean
  subject: string
}

type Event = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  type: "study" | "class" | "exam" | "other"
}

export default function StudyPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete Calculus Problem Set",
      description: "Chapters 4-5 exercises",
      dueDate: "2023-11-15",
      priority: "high",
      completed: false,
      subject: "Mathematics",
    },
    {
      id: "2",
      title: "Physics Lab Report",
      description: "Write up results from the momentum experiment",
      dueDate: "2023-11-18",
      priority: "medium",
      completed: false,
      subject: "Physics",
    },
    {
      id: "3",
      title: "English Essay Draft",
      description: "First draft of analysis paper",
      dueDate: "2023-11-20",
      priority: "medium",
      completed: false,
      subject: "English",
    },
    {
      id: "4",
      title: "SAT Practice Test",
      description: "Complete full practice test with timing",
      dueDate: "2023-11-12",
      priority: "high",
      completed: true,
      subject: "Test Prep",
    },
  ])

  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "AP Calculus",
      date: "2023-11-13",
      startTime: "08:00",
      endTime: "09:30",
      type: "class",
    },
    {
      id: "2",
      title: "Physics Study Group",
      date: "2023-11-13",
      startTime: "16:00",
      endTime: "17:30",
      type: "study",
    },
    {
      id: "3",
      title: "English Literature",
      date: "2023-11-14",
      startTime: "10:00",
      endTime: "11:30",
      type: "class",
    },
    {
      id: "4",
      title: "Chemistry Midterm",
      date: "2023-11-17",
      startTime: "13:00",
      endTime: "15:00",
      type: "exam",
    },
  ])

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    subject: "",
  })

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "study",
  })

  const addTask = () => {
    if (!newTask.title || !newTask.dueDate || !newTask.subject) return

    const task: Task = {
      id: String(Date.now()),
      title: newTask.title,
      description: newTask.description || "",
      dueDate: newTask.dueDate,
      priority: newTask.priority as "high" | "medium" | "low",
      completed: false,
      subject: newTask.subject,
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      subject: "",
    })
  }

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) return

    const event: Event = {
      id: String(Date.now()),
      title: newEvent.title,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      type: newEvent.type as "study" | "class" | "exam" | "other",
    }

    setEvents([...events, event])
    setNewEvent({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "study",
    })
  }

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const removeEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-amber-500"
      case "low":
        return "text-green-500"
      default:
        return ""
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
      case "study":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
      case "exam":
        return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Study & Schedule</h1>
        <p className="text-muted-foreground">Manage your academic tasks, schedule, and study sessions</p>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeTasks.filter((task) => task.priority === "high").length} high priority
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((completedTasks.length / (activeTasks.length + completedTasks.length)) * 100) || 0}%
                  completion rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    activeTasks.filter(
                      (task) => new Date(task.dueDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000,
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Due within 3 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Set(tasks.map((task) => task.subject)).size}</div>
                <p className="text-xs text-muted-foreground">Across all tasks</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task Manager</CardTitle>
              <CardDescription>Organize and prioritize your academic tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4 pt-4">
                  {activeTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No active tasks</h3>
                      <p className="text-sm text-muted-foreground mt-1">Add a new task to get started</p>
                    </div>
                  ) : (
                    activeTasks.map((task) => (
                      <Card key={task.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 mt-0.5"
                                onClick={() => toggleTaskComplete(task.id)}
                              >
                                <div className="h-5 w-5 rounded-full border-2"></div>
                              </Button>
                              <div className="space-y-1">
                                <div className="font-medium">{task.title}</div>
                                <div className="text-sm text-muted-foreground">{task.description}</div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{formatDate(task.dueDate)}</span>
                                  </div>
                                  <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                                    <span>●</span>
                                    <span className="capitalize">{task.priority} priority</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    <span>{task.subject}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeTask(task.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4 pt-4">
                  {completedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No completed tasks</h3>
                      <p className="text-sm text-muted-foreground mt-1">Your completed tasks will appear here</p>
                    </div>
                  ) : (
                    completedTasks.map((task) => (
                      <Card key={task.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 mt-0.5"
                                onClick={() => toggleTaskComplete(task.id)}
                              >
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </Button>
                              <div className="space-y-1">
                                <div className="font-medium line-through text-muted-foreground">{task.title}</div>
                                <div className="text-sm text-muted-foreground line-through">{task.description}</div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{formatDate(task.dueDate)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span>●</span>
                                    <span className="capitalize">{task.priority} priority</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    <span>{task.subject}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeTask(task.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t p-6">
              <h3 className="font-medium">Add New Task</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-subject">Subject</Label>
                  <Input
                    id="task-subject"
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                    placeholder="Enter subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={2}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">Due Date</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger id="task-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={addTask} className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Manage your classes, study sessions, and exams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-7">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                  const today = new Date()
                  const currentDay = today.getDay()
                  const dayDiff = index + 1 - currentDay
                  const date = new Date(today)
                  date.setDate(today.getDate() + dayDiff)
                  const dateString = date.toISOString().split("T")[0]

                  const dayEvents = events.filter((event) => event.date === dateString)

                  return (
                    <Card key={day} className={`${currentDay === index + 1 ? "border-primary" : ""}`}>
                      <CardHeader className="p-3 text-center">
                        <CardTitle className="text-sm font-medium">{day}</CardTitle>
                        <CardDescription className="text-xs">{date.getDate()}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2">
                        {dayEvents.length === 0 ? (
                          <p className="text-xs text-center text-muted-foreground">No events</p>
                        ) : (
                          dayEvents
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs p-1.5 rounded-md ${getEventTypeColor(event.type)}`}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="mt-0.5">
                                  {event.startTime} - {event.endTime}
                                </div>
                              </div>
                            ))
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="font-medium">All Upcoming Events</h3>
                {events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No events scheduled</h3>
                    <p className="text-sm text-muted-foreground mt-1">Add a new event to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events
                      .sort((a, b) => {
                        const dateA = new Date(`${a.date}T${a.startTime}`)
                        const dateB = new Date(`${b.date}T${b.startTime}`)
                        return dateA.getTime() - dateB.getTime()
                      })
                      .map((event) => (
                        <Card key={event.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-full ${getEventTypeColor(
                                    event.type,
                                  )}`}
                                >
                                  {event.type === "class" ? (
                                    <BookOpen className="h-5 w-5" />
                                  ) : event.type === "study" ? (
                                    <FileText className="h-5 w-5" />
                                  ) : event.type === "exam" ? (
                                    <GraduationCap className="h-5 w-5" />
                                  ) : (
                                    <Calendar className="h-5 w-5" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="font-medium">{event.title}</div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span>{formatDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      <span>
                                        {event.startTime} - {event.endTime}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeEvent(event.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t p-6">
              <h3 className="font-medium">Add New Event</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                    <SelectTrigger id="event-type">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="study">Study Session</SelectItem>
                      <SelectItem value="exam">Exam/Quiz</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="event-start-time">Start Time</Label>
                    <Input
                      id="event-start-time"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-end-time">End Time</Label>
                    <Input
                      id="event-end-time"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={addEvent} className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Event
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pomodoro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pomodoro Timer</CardTitle>
              <CardDescription>Stay focused with timed work sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <PomodoroTimer />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Techniques</CardTitle>
              <CardDescription>Effective methods to improve your study sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">The Pomodoro Technique</h3>
                <p className="text-sm text-muted-foreground">
                  Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.
                  This helps maintain focus and prevent burnout.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Active Recall</h3>
                <p className="text-sm text-muted-foreground">
                  Test yourself on material instead of passively reviewing it. Create flashcards, practice problems, or
                  explain concepts out loud to improve retention.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Spaced Repetition</h3>
                <p className="text-sm text-muted-foreground">
                  Review material at increasing intervals over time. This technique leverages the spacing effect to
                  improve long-term retention.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Feynman Technique</h3>
                <p className="text-sm text-muted-foreground">
                  Explain a concept in simple terms as if teaching it to someone else. This helps identify gaps in your
                  understanding and reinforces learning.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Resources</CardTitle>
              <CardDescription>Helpful materials for your academic preparation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">USAFA Preparation</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-medium">USAFA Admissions Guide</div>
                      <div className="text-sm text-muted-foreground">Official requirements and preparation tips</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-medium">Summer Seminar Information</div>
                      <div className="text-sm text-muted-foreground">Details about USAFA summer programs</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Test Preparation</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                      <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-medium">SAT/ACT Practice Tests</div>
                      <div className="text-sm text-muted-foreground">Official practice materials and study guides</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                      <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-medium">AP Exam Resources</div>
                      <div className="text-sm text-muted-foreground">Study materials for AP courses</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Academic Subjects</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-medium">Mathematics</div>
                      <div className="text-sm text-muted-foreground">Calculus, algebra, and geometry resources</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-medium">Physics</div>
                      <div className="text-sm text-muted-foreground">Mechanics, electricity, and magnetism</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                      <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-medium">English</div>
                      <div className="text-sm text-muted-foreground">Composition, literature, and grammar</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Online Learning Platforms</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-medium">Khan Academy</div>
                      <div className="text-sm text-muted-foreground">Free courses in math, science, and more</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-medium">Coursera</div>
                      <div className="text-sm text-muted-foreground">University-level courses online</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
