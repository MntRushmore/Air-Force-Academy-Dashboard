"use client"

import { useState } from "react"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FormDescription, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Sample events data
  const events = [
    {
      id: 1,
      title: "SAT Exam",
      date: "2023-11-15",
      startTime: "08:00",
      endTime: "12:00",
      type: "academic",
      description: "SAT examination at Central High School",
    },
    {
      id: 2,
      title: "Congressional Nomination Interview",
      date: "2023-11-20",
      startTime: "14:00",
      endTime: "15:00",
      type: "application",
      description: "Interview with Congressman Smith's office",
    },
    {
      id: 3,
      title: "Physical Fitness Training",
      date: "2023-11-10",
      startTime: "16:00",
      endTime: "18:00",
      type: "fitness",
      description: "CFA preparation with Coach Johnson",
    },
  ]

  // Get events for the selected date
  const selectedDateStr = date ? format(date, "yyyy-MM-dd") : ""
  const eventsForSelectedDate = events.filter((event) => event.date === selectedDateStr)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">Manage your calendar and important dates</p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_300px]">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>View and manage your schedule</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Events for {date ? format(date, "MMMM d, yyyy") : "Today"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsForSelectedDate.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events scheduled for this day.</p>
                  ) : (
                    <div className="space-y-4">
                      {eventsForSelectedDate.map((event) => (
                        <div key={event.id} className="flex flex-col space-y-1 rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <span
                              className={cn(
                                "rounded-full px-2 py-1 text-xs font-medium",
                                event.type === "academic"
                                  ? "bg-blue-100 text-blue-800"
                                  : event.type === "application"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-orange-100 text-orange-800",
                              )}
                            >
                              {event.type}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.startTime} - {event.endTime}
                          </div>
                          <p className="text-sm">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Event</DialogTitle>
                        <DialogDescription>Create a new event for your schedule</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <FormLabel htmlFor="title">Title</FormLabel>
                          <Input id="title" placeholder="Event title" />
                        </div>
                        <div className="grid gap-2">
                          <FormLabel htmlFor="date">Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <FormLabel htmlFor="start-time">Start Time</FormLabel>
                            <Input id="start-time" type="time" defaultValue="09:00" />
                          </div>
                          <div className="grid gap-2">
                            <FormLabel htmlFor="end-time">End Time</FormLabel>
                            <Input id="end-time" type="time" defaultValue="10:00" />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <FormLabel htmlFor="type">Event Type</FormLabel>
                          <Select>
                            <SelectTrigger id="type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="academic">Academic</SelectItem>
                              <SelectItem value="application">Application</SelectItem>
                              <SelectItem value="fitness">Fitness</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <FormLabel htmlFor="description">Description</FormLabel>
                          <Textarea id="description" placeholder="Event details" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save Event</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {events
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .slice(0, 3)
                      .map((event) => (
                        <div key={event.id} className="flex justify-between text-sm">
                          <span>{event.title}</span>
                          <span className="text-muted-foreground">{format(new Date(event.date), "MMM d")}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Events</CardTitle>
                <CardDescription>View and manage all your scheduled events</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>Create a new event for your schedule</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <FormLabel htmlFor="title">Title</FormLabel>
                      <Input id="title" placeholder="Event title" />
                    </div>
                    <div className="grid gap-2">
                      <FormLabel htmlFor="date">Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <FormLabel htmlFor="start-time">Start Time</FormLabel>
                        <Input id="start-time" type="time" defaultValue="09:00" />
                      </div>
                      <div className="grid gap-2">
                        <FormLabel htmlFor="end-time">End Time</FormLabel>
                        <Input id="end-time" type="time" defaultValue="10:00" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <FormLabel htmlFor="type">Event Type</FormLabel>
                      <Select>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="application">Application</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <FormLabel htmlFor="description">Description</FormLabel>
                      <Textarea id="description" placeholder="Event details" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex flex-col space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{event.title}</h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          event.type === "academic"
                            ? "bg-blue-100 text-blue-800"
                            : event.type === "application"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800",
                        )}
                      >
                        {event.type}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>
                        {format(new Date(event.date), "MMMM d, yyyy")} • {event.startTime} - {event.endTime}
                      </span>
                    </div>
                    <p className="text-sm">{event.description}</p>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Calendar</CardTitle>
              <CardDescription>Import events from external calendars</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Import from Google Calendar</FormLabel>
                <Button variant="outline" className="w-full">
                  Connect Google Calendar
                </Button>
              </div>
              <div className="space-y-2">
                <FormLabel>Import from iCalendar URL</FormLabel>
                <div className="flex space-x-2">
                  <Input placeholder="Enter iCalendar URL" />
                  <Button>Import</Button>
                </div>
                <FormDescription>Enter a valid iCalendar URL to import events</FormDescription>
              </div>
              <div className="space-y-2">
                <FormLabel>Upload iCalendar File</FormLabel>
                <div className="flex space-x-2">
                  <Input type="file" accept=".ics" />
                  <Button>Upload</Button>
                </div>
                <FormDescription>Upload an .ics file to import events</FormDescription>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
