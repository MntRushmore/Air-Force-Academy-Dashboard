"use client"

import { useState } from "react"
import { Calendar, MessageSquare, Plus, Search, Trash2, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Mentor = {
  id: string
  name: string
  role: string
  expertise: string[]
  avatar: string
  contact: string
}

type MeetingLog = {
  id: string
  mentorId: string
  date: string
  duration: string
  topics: string
  notes: string
  followUp: string
}

type Question = {
  id: string
  question: string
  answer: string
  category: string
  date: string
  status: "answered" | "pending"
}

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<Mentor[]>([
    {
      id: "1",
      name: "Col. James Wilson",
      role: "USAFA Admissions Officer",
      expertise: ["Admissions", "Leadership", "Military Preparation"],
      avatar: "/placeholder.svg",
      contact: "james.wilson@example.com",
    },
    {
      id: "2",
      name: "Capt. Sarah Johnson",
      role: "USAFA Graduate",
      expertise: ["Academics", "Cadet Life", "Physical Training"],
      avatar: "/placeholder.svg",
      contact: "sarah.johnson@example.com",
    },
    {
      id: "3",
      name: "Dr. Michael Chen",
      role: "Academic Advisor",
      expertise: ["STEM Subjects", "Research", "Academic Planning"],
      avatar: "/placeholder.svg",
      contact: "michael.chen@example.com",
    },
  ])

  const [meetingLogs, setMeetingLogs] = useState<MeetingLog[]>([
    {
      id: "1",
      mentorId: "1",
      date: "2023-11-05",
      duration: "45 minutes",
      topics: "Application strategy, Congressional nomination process",
      notes:
        "Col. Wilson advised to start the nomination process early and provided contacts for local representatives.",
      followUp: "Research congressional nomination requirements and prepare initial application materials.",
    },
    {
      id: "2",
      mentorId: "2",
      date: "2023-10-28",
      duration: "30 minutes",
      topics: "Physical fitness preparation, CFA requirements",
      notes: "Capt. Johnson recommended specific training regimen for improving pull-ups and mile run time.",
      followUp: "Implement new workout plan and track progress weekly.",
    },
  ])

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: "What are the most important factors in a successful USAFA application?",
      answer:
        "A successful USAFA application requires excellence in academics (strong GPA and test scores), leadership (demonstrated through extracurricular activities), physical fitness (preparation for the CFA), and character (recommendations and interviews). Additionally, securing a congressional nomination is a critical step in the process.",
      category: "Admissions",
      date: "2023-10-20",
      status: "answered",
    },
    {
      id: "2",
      question: "How should I prepare for the Candidate Fitness Assessment?",
      answer:
        "The CFA consists of six events: basketball throw, pull-ups, shuttle run, modified sit-ups, push-ups, and a one-mile run. Develop a balanced training program that addresses all components, with particular focus on your weaker areas. Aim to exceed the minimum requirements, as higher scores strengthen your application.",
      category: "Fitness",
      date: "2023-10-25",
      status: "answered",
    },
    {
      id: "3",
      question: "What academic courses should I prioritize in high school?",
      answer: "",
      category: "Academics",
      date: "2023-11-01",
      status: "pending",
    },
  ])

  const [newMeetingLog, setNewMeetingLog] = useState<Partial<MeetingLog>>({
    mentorId: "",
    date: "",
    duration: "",
    topics: "",
    notes: "",
    followUp: "",
  })

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: "",
    category: "Admissions",
    date: new Date().toISOString().split("T")[0],
    status: "pending",
  })

  const [searchTerm, setSearchTerm] = useState("")

  const addMeetingLog = () => {
    if (!newMeetingLog.mentorId || !newMeetingLog.date || !newMeetingLog.topics) return

    const meetingLog: MeetingLog = {
      id: String(Date.now()),
      mentorId: newMeetingLog.mentorId,
      date: newMeetingLog.date,
      duration: newMeetingLog.duration || "",
      topics: newMeetingLog.topics,
      notes: newMeetingLog.notes || "",
      followUp: newMeetingLog.followUp || "",
    }

    setMeetingLogs([...meetingLogs, meetingLog])
    setNewMeetingLog({
      mentorId: "",
      date: "",
      duration: "",
      topics: "",
      notes: "",
      followUp: "",
    })
  }

  const addQuestion = () => {
    if (!newQuestion.question || !newQuestion.category) return

    const question: Question = {
      id: String(Date.now()),
      question: newQuestion.question,
      answer: "",
      category: newQuestion.category || "Admissions",
      date: newQuestion.date || new Date().toISOString().split("T")[0],
      status: "pending",
    }

    setQuestions([...questions, question])
    setNewQuestion({
      question: "",
      category: "Admissions",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    })
  }

  const removeMeetingLog = (id: string) => {
    setMeetingLogs(meetingLogs.filter((log) => log.id !== id))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((question) => question.id !== id))
  }

  const getMentorById = (id: string) => {
    return mentors.find((mentor) => mentor.id === id)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some((exp) => exp.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const answeredQuestions = questions.filter((q) => q.status === "answered")
  const pendingQuestions = questions.filter((q) => q.status === "pending")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mentorship</h1>
        <p className="text-muted-foreground">Connect with mentors and track your guidance sessions</p>
      </div>

      <Tabs defaultValue="mentors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="meetings">Meeting Logs</TabsTrigger>
          <TabsTrigger value="questions">Q&A</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors by name, role, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={mentor.avatar || "/placeholder.svg"} alt={mentor.name} />
                      <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{mentor.name}</CardTitle>
                      <CardDescription>{mentor.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Expertise</div>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.map((exp) => (
                        <span
                          key={exp}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Contact</div>
                    <div className="text-sm text-muted-foreground">{mentor.contact}</div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setNewMeetingLog({ ...newMeetingLog, mentorId: mentor.id })}
                  >
                    Log Meeting
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredMentors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No mentors found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Logs</CardTitle>
              <CardDescription>Record and track your mentorship sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {meetingLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No meeting logs</h3>
                  <p className="text-sm text-muted-foreground mt-1">Record your first mentorship session</p>
                </div>
              ) : (
                meetingLogs
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((log) => {
                    const mentor = getMentorById(log.mentorId)
                    return (
                      <Card key={log.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={mentor?.avatar || "/placeholder.svg"} alt={mentor?.name} />
                                  <AvatarFallback>{mentor?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{mentor?.name}</div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{formatDate(log.date)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{log.duration}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="font-medium">Topics Discussed</div>
                                <p className="text-sm">{log.topics}</p>
                              </div>
                              {log.notes && (
                                <div className="space-y-1">
                                  <div className="font-medium">Notes</div>
                                  <p className="text-sm">{log.notes}</p>
                                </div>
                              )}
                              {log.followUp && (
                                <div className="space-y-1">
                                  <div className="font-medium">Follow-up Actions</div>
                                  <p className="text-sm">{log.followUp}</p>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeMeetingLog(log.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t p-6">
              <h3 className="font-medium">Add New Meeting Log</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mentor">Mentor</Label>
                  <Select
                    value={newMeetingLog.mentorId}
                    onValueChange={(value) => setNewMeetingLog({ ...newMeetingLog, mentorId: value })}
                  >
                    <SelectTrigger id="mentor">
                      <SelectValue placeholder="Select mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mentors.map((mentor) => (
                        <SelectItem key={mentor.id} value={mentor.id}>
                          {mentor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-date">Date</Label>
                    <Input
                      id="meeting-date"
                      type="date"
                      value={newMeetingLog.date}
                      onChange={(e) => setNewMeetingLog({ ...newMeetingLog, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-duration">Duration</Label>
                    <Input
                      id="meeting-duration"
                      placeholder="e.g., 30 minutes"
                      value={newMeetingLog.duration}
                      onChange={(e) => setNewMeetingLog({ ...newMeetingLog, duration: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="meeting-topics">Topics Discussed</Label>
                  <Input
                    id="meeting-topics"
                    placeholder="Main topics covered in the meeting"
                    value={newMeetingLog.topics}
                    onChange={(e) => setNewMeetingLog({ ...newMeetingLog, topics: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="meeting-notes">Notes</Label>
                  <Textarea
                    id="meeting-notes"
                    placeholder="Key insights and advice from the mentor"
                    rows={3}
                    value={newMeetingLog.notes}
                    onChange={(e) => setNewMeetingLog({ ...newMeetingLog, notes: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="meeting-followup">Follow-up Actions</Label>
                  <Textarea
                    id="meeting-followup"
                    placeholder="Tasks to complete before next meeting"
                    rows={2}
                    value={newMeetingLog.followUp}
                    onChange={(e) => setNewMeetingLog({ ...newMeetingLog, followUp: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={addMeetingLog} className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Meeting Log
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Q&A</CardTitle>
              <CardDescription>Track questions and answers from your mentors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="answered" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="answered">Answered ({answeredQuestions.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({pendingQuestions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="answered" className="space-y-4 pt-4">
                  {answeredQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No answered questions</h3>
                      <p className="text-sm text-muted-foreground mt-1">Your answered questions will appear here</p>
                    </div>
                  ) : (
                    answeredQuestions.map((q) => (
                      <Card key={q.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 w-full">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{q.question}</div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => removeQuestion(q.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                                  {q.category}
                                </span>
                                <span>{formatDate(q.date)}</span>
                              </div>
                              <div className="space-y-1 mt-2">
                                <div className="font-medium">Answer</div>
                                <p className="text-sm">{q.answer}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4 pt-4">
                  {pendingQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No pending questions</h3>
                      <p className="text-sm text-muted-foreground mt-1">Your pending questions will appear here</p>
                    </div>
                  ) : (
                    pendingQuestions.map((q) => (
                      <Card key={q.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 w-full">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{q.question}</div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => removeQuestion(q.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                                  {q.category}
                                </span>
                                <span>{formatDate(q.date)}</span>
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900 dark:text-amber-400">
                                  Pending
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t p-6">
              <h3 className="font-medium">Add New Question</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your question for a mentor"
                    rows={3}
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="question-category">Category</Label>
                    <Select
                      value={newQuestion.category}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}
                    >
                      <SelectTrigger id="question-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admissions">Admissions</SelectItem>
                        <SelectItem value="Academics">Academics</SelectItem>
                        <SelectItem value="Fitness">Fitness</SelectItem>
                        <SelectItem value="Leadership">Leadership</SelectItem>
                        <SelectItem value="Military">Military</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-date">Date</Label>
                    <Input
                      id="question-date"
                      type="date"
                      value={newQuestion.date}
                      onChange={(e) => setNewQuestion({ ...newQuestion, date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={addQuestion} className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
